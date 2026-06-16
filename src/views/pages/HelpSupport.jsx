import { useEffect, useState } from "react";
import {
  Row, Col, Card, CardBody, CardHeader,
  Button, Badge, Modal, ModalHeader, ModalBody,
  Spinner
} from "reactstrap";
import {
  FaFilePdf, FaPlayCircle, FaDownload,
  FaEye, FaExternalLinkAlt,
  FaChevronLeft, FaChevronRight,
  FaFolderOpen, FaVideoSlash
} from "react-icons/fa";
import axios from "axios";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

const HelpSupport = () => {
  const { isHindi } = useLanguage();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfPage, setPdfPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    fetchHelp();
  }, []);

  const fetchHelp = async () => {
    try {
      const res = await axios.get(`${API}/api/get-active-help-guidance`);
      setData(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true   // 👉 AM/PM format
      });
    } catch {
      return "—";
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      let id = "";
      if (parsed.hostname.includes("youtube.com")) {
        id = parsed.searchParams.get("v");
      }
      if (parsed.hostname.includes("youtu.be")) {
        id = parsed.pathname.slice(1);
      }
      return id ? `https://www.youtube.com/embed/${id}` : "";
    } catch {
      return "";
    }
  };

  const pdfData = data.filter(i => i.contentType?.toLowerCase() === "pdf");
  const videoData = data.filter(i => i.contentType?.toLowerCase() === "video");

  const paginate = (arr, page) =>
    arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalPages = (arr) =>
    Math.max(1, Math.ceil(arr.length / ITEMS_PER_PAGE));

  const openPreview = (url, title = "") => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewModal(true);
  };

  const t = (en, hi) => (isHindi ? hi : en);

  /* Pagination */
  const Pagination = ({ page, setPage, arr }) => {
    const pages = totalPages(arr);
    if (pages <= 1) return null;

    return (
      <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          <FaChevronLeft />
        </Button>

        {Array.from({ length: pages }, (_, i) => (
          <Button
            key={i}
            size="sm"
            color={page === i + 1 ? "primary" : "light"}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </Button>
        ))}

        <Button
          size="sm"
          disabled={page === pages}
          onClick={() => setPage(p => p + 1)}
        >
          <FaChevronRight />
        </Button>
      </div>
    );
  };

  /* Item Card */
  const ItemCard = ({ item, type }) => {
    const isPdf = type === "pdf";
    const embedUrl = !isPdf ? getYoutubeEmbedUrl(item.videoUrl) : "";

    return (
      <Card className="mb-3 shadow border-0">
        <CardBody className="p-3">
          <Row className="align-items-center g-2">

            {/* ACTIONS */}
            <Col xs={12} md="auto">
              <div className="d-flex flex-wrap gap-2">
                {isPdf ? (
                  <>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => openPreview(API + item.pdfUrl, item.title)}
                    >
                      <FaEye /> Previews
                    </Button>

                    <a href={API + item.pdfUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" color="danger">
                        <FaDownload /> Downloads
                      </Button>
                    </a>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() =>
                        embedUrl
                          ? openPreview(embedUrl, item.title)
                          : window.open(item.videoUrl, "_blank")
                      }
                    >
                      <FaPlayCircle />Previews
                    </Button>

                    <a href={item.videoUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" color="danger">
                        <FaExternalLinkAlt /> YouTube
                      </Button>
                    </a>
                  </>
                )}
              </div>
              <div className="d-flex gap-2 mt-2 flex-wrap">
                <Badge color="light" className="border small text-dark">
                  Crerated At =: {formatDate(item.createdAt)}
                </Badge>

                {item.updatedAt && (
                  <Badge color="light" className="border small text-dark">
                    Updated At =: {formatDate(item.updatedAt)}
                  </Badge>
                )}
              </div>
            </Col>

            {/* CONTENT */}
            <Col xs={12} md style={{ minWidth: 0 }}>
              <div className="fw-semibold text-truncate" title={item.title}>
                {item.title}
              </div>

              {item.description && (
                <div className="text-muted small text-truncate">
                  {item.description}
                </div>
              )}
            </Col>
          </Row>
        </CardBody>
      </Card>
    );
  };

  /* Section */
  const Section = ({ type, arr, page, setPage }) => {
    const isPdf = type === "pdf";
    const items = paginate(arr, page);

    return (
      <Card className="border-0 shadow-sm h-100">
        <CardHeader className="bg-white fw-bold d-flex justify-content-between">
          {isPdf ? t("PDF Documents", "PDF दस्तावेज़") : t("Video Tutorials", "वीडियो ट्यूटोरियल")}
          <Badge color="dark">{arr.length}</Badge>
        </CardHeader>

        <CardBody style={{ maxHeight: 500, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div className="text-center text-muted py-4">
              {isPdf ? <FaFolderOpen size={30} /> : <FaVideoSlash size={30} />}
              <div>{t("No items available", "कोई सामग्री उपलब्ध नहीं")}</div>
            </div>
          ) : (
            items.map(item => (
              <ItemCard key={item._id} item={item} type={type} />
            ))
          )}

          <Pagination page={page} setPage={setPage} arr={arr} />
        </CardBody>
      </Card>
    );
  };

  /* Loading */
  if (loading) {
    return (
      <PageLayout title={t("Help & Support", "सहायता एवं मार्गदर्शन")} showBreadcrumb>
        <div className="text-center py-5">
          <Spinner />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={t("Help & Support", "सहायता एवं मार्गदर्शन")} showBreadcrumb>
      <Row className="g-4">
        <Col lg={6}>
          <Section type="pdf" arr={pdfData} page={pdfPage} setPage={setPdfPage} />
        </Col>
        <Col lg={6}>
          <Section type="video" arr={videoData} page={videoPage} setPage={setVideoPage} />
        </Col>
      </Row>

      {/* MODAL */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl">
        <ModalHeader toggle={() => setPreviewModal(false)}>
          {previewTitle}
        </ModalHeader>

        <ModalBody style={{ height: "70vh", padding: 0 }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            title="Preview"
            style={{ border: "none" }}
          />
        </ModalBody>
      </Modal>
    </PageLayout>
  );
};

export default HelpSupport;