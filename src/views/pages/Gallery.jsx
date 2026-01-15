import { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody,
  Modal, ModalHeader, ModalBody, Badge, Button
} from "reactstrap";
import {
  FaCamera, FaCalendarAlt,
  FaChevronLeft, FaChevronRight, FaExternalLinkAlt
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const Gallery = () => {
  const { isHindi } = useLanguage();
  const [galleryList, setGalleryList] = useState([]);
  const [modal, setModal] = useState(false);
  const [gallery, setGallery] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ---------- FETCH ALL GALLERIES ---------- */
  const fetchGallery = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery`);
      setGalleryList(
        data.data.sort((a, b) => a.displayOrder - b.displayOrder)
      );
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- FETCH GALLERY BY ID ---------- */
  const openGallery = async (id) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/get-gallery-by-id/${id}`
      );
      setGallery(data.data);
      setActiveIndex(0);
      setModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- SLIDER ---------- */
  const nextImage = () => {
    if (!gallery) return;
    setActiveIndex((prev) =>
      prev === gallery.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    if (!gallery) return;
    setActiveIndex((prev) =>
      prev === 0 ? gallery.images.length - 1 : prev - 1
    );
  };

  /* ---------- EXTERNAL LINK ---------- */
  const openLink = () => {
    Swal.fire({
      title: isHindi ? "बाहरी लिंक" : "External Link",
      text: isHindi
        ? "आप बाहरी वेबसाइट पर जा रहे हैं"
        : "You are going to an external website",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continue",
    }).then((res) => {
      if (res.isConfirmed) {
        window.open(
          gallery.link,
          gallery.openInNewTab ? "_blank" : "_self"
        );
      }
    });
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <PageLayout
      title={isHindi ? "चित्र प्रदर्शनी" : "Photo Gallery"}
      titleHi="चित्र प्रदर्शनी"
    >
      <Container className="py-5">

        {/* ---------- HEADER ---------- */}
        <Card className="border-0 shadow-sm mb-4">
          <CardBody className="d-flex align-items-center">
            <FaCamera size={36} className="text-primary me-3" />
            <div>
              <h3 className="mb-0">
                {isHindi ? "चित्र प्रदर्शनी" : "Photo Gallery"}
              </h3>
              <small className="text-muted">
                {isHindi
                  ? "कार्यक्रमों और गतिविधियों की झलकियां"
                  : "Glimpses of events & activities"}
              </small>
            </div>
          </CardBody>
        </Card>

        {/* ---------- MAIN PAGE GALLERY LIST ---------- */}
        <Row className="g-4">
          {galleryList.map((item) => (
            <Col lg={3} md={4} sm={6} key={item._id}>
              <Card
                className="border-0 shadow-sm gallery-card"
                onClick={() => openGallery(item._id)}
                style={{ cursor: "pointer" }}
              >

                {/* COLLAGE */}
                <div className="gallery-collage">
                  {(item.images?.slice(0, 4) || []).map((img, index) => (
                    <img
                      key={index}
                      src={`${API_URL}${img}`}
                      alt="gallery"
                    />
                  ))}

                  {/* TOTAL IMAGE COUNT */}
                  <span className="image-count-badge">
                    {item.images?.length || 0} Photos
                  </span>
                </div>

                <CardBody>
                  <h6 className="mb-1">
                    {isHindi ? item.titleHin : item.titleEng}
                  </h6>
                  <small className="text-muted d-flex align-items-center">
                    <FaCalendarAlt className="me-1" />
                    {new Date(item.createdAt).toLocaleDateString("en-IN")}
                  </small>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ---------- MODAL ---------- */}
        <Modal isOpen={modal} size="xl" centered toggle={() => setModal(false)}>
          {gallery && (
            <>
              <ModalHeader toggle={() => setModal(false)}>
                {isHindi ? gallery.titleHin : gallery.titleEng}
              </ModalHeader>

              <ModalBody>
                {/* IMAGE PREVIEW */}
                <div className="position-relative text-center">
                  <img
                    src={`${API_URL}${gallery.images[activeIndex]}`}
                    className="img-fluid rounded"
                    style={{ maxHeight: "500px" }}
                  />

                  <Button
                    color="dark"
                    className="position-absolute top-50 start-0 translate-middle-y"
                    onClick={prevImage}
                  >
                    <FaChevronLeft />
                  </Button>

                  <Button
                    color="dark"
                    className="position-absolute top-50 end-0 translate-middle-y"
                    onClick={nextImage}
                  >
                    <FaChevronRight />
                  </Button>
                </div>

                {/* THUMBNAILS */}
                <Row className="mt-3 g-2">
                  {gallery.images.map((img, index) => (
                    <Col xs={3} md={2} key={index}>
                      <img
                        src={`${API_URL}${img}`}
                        className={`img-fluid rounded ${
                          activeIndex === index ? "border border-primary" : ""
                        }`}
                        style={{
                          cursor: "pointer",
                          height: 80,
                          objectFit: "cover"
                        }}
                        onClick={() => setActiveIndex(index)}
                      />
                    </Col>
                  ))}
                </Row>

                {/* DESCRIPTION */}
                <div className="mt-4">
                  <p>
                    {isHindi
                      ? gallery.shortDescHin
                      : gallery.shortDescEng}
                  </p>

                  <Badge color="primary">
                    {activeIndex + 1} / {gallery.images.length}
                  </Badge>

                  {gallery.link && gallery.isExternal && (
                    <Button
                      color="info"
                      size="sm"
                      className="ms-3"
                      onClick={openLink}
                    >
                      <FaExternalLinkAlt className="me-1" />
                      Visit Link
                    </Button>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </Modal>
      </Container>

      {/* ---------- STYLES ---------- */}
      <style jsx>{`
        .gallery-card {
          transition: all 0.3s ease;
        }
        .gallery-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15);
        }

        .gallery-collage {
          position: relative;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-template-rows: repeat(2, 100px);
          gap: 2px;
          overflow: hidden;
        }

        .gallery-collage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-count-badge {
          position: absolute;
          bottom: 6px;
          right: 6px;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 4px 8px;
          font-size: 12px;
          border-radius: 12px;
        }
      `}</style>
    </PageLayout>
  );
};

export default Gallery;
