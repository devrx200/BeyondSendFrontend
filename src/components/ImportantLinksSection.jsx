import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { ICONS } from "../utilies/icons";
import { useLanguage } from "../contexts/LanguageContext";

const colorVariants = [
  { bg: "rgba(13,110,253,0.12)", color: "#0d6efd" }, // blue
  { bg: "rgba(25,135,84,0.12)", color: "#198754" }, // green
  { bg: "rgba(220,53,69,0.12)", color: "#dc3545" }, // red
  { bg: "rgba(255,193,7,0.18)", color: "#ffc107" }, // yellow
  { bg: "rgba(111,66,193,0.12)", color: "#6f42c1" }, // purple
  { bg: "rgba(13,202,240,0.15)", color: "#0dcaf0" } // cyan
];

const ImportantLinksSection = () => {
  const { isHindi } = useLanguage();
  const [links, setLinks] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadLinks();
  }, []);

  /* ===== LOAD LINKS FROM API ===== */
  const loadLinks = async () => {
    try {
      const res = await axios.get(`${API}/api/important-links`);
      if (res.data?.success) {
        setLinks(res.data.data || []);
      }
    } catch (error) {
      console.error("Error loading important links:", error);
    }
  };

  /* ===== EXTERNAL LINK CONFIRMATION ===== */
  const handleExternalClick = (url) => {
    Swal.fire({
      title: "External Link",
      text: "You are being redirected to an external website. Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Continue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0d6efd"
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  };

  /* ===== ICON RENDER ===== */
  const renderIcon = (iconName, index) => {
    const IconComponent = ICONS[iconName] || FaInfoCircle;
    const variant = colorVariants[index % colorVariants.length];

    return (
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
        style={{
          width: 68,
          height: 68,
          background: variant.bg,
          color: variant.color
        }}
      >
        <IconComponent size={30} />
      </div>
    );
  };

  return (
    <section className="py-5  border-top">
      <Container>
        {/* HEADER */}
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-1">
            {isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}
          </h2>
          <p className="text-muted mb-0">
            {isHindi
              ? "आवश्यक सरकारी सेवाओं के लिए त्वरित पहुँच"
              : "Quick access to essential government services"}
          </p>
        </div>

        {/* LINKS GRID */}
        <Row className="g-4">
          {links.map((link, index) => {
            const CardContent = (
              <Card
                className="h-100 border-0 shadow-sm"
                style={{ cursor: "pointer" }}
              >
                <CardBody className="text-center p-4">
                  {renderIcon(link.icon, index)}

                  <h6 className="fw-semibold mb-1">
                    {isHindi ? link.titleHin : link.titleEng}
                  </h6>

                  {link.isExternal && (
                    <small className="text-muted d-block mt-1">
                      <FaExternalLinkAlt size={11} className="me-1" />
                      External
                    </small>
                  )}
                </CardBody>
              </Card>
            );

            return (
              <Col xl={2} lg={3} md={4} sm={6} key={link._id}>
                {link.isExternal ? (
                  <div
                    role="button"
                    className="text-decoration-none"
                    onClick={() => handleExternalClick(link.url)}
                  >
                    {CardContent}
                  </div>
                ) : (
                  <Link to={link.url} className="text-decoration-none">
                    {CardContent}
                  </Link>
                )}
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default ImportantLinksSection;
