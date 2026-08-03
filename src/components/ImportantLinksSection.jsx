import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaExternalLinkAlt, FaInfoCircle } from "react-icons/fa";
import { ICONS } from "../utilities/icons";
import { useLanguage } from "../contexts/LanguageContext";

// Expanded color variants for a more vibrant, attractive look
const colorVariants = [
  { bg: "rgba(13,110,253,0.12)", color: "#0d6efd" },   // Blue
  { bg: "rgba(220,53,69,0.12)", color: "#dc3545" },    // Red
  { bg: "rgba(25,135,84,0.12)", color: "#198754" },    // Green
  { bg: "rgba(253,126,20,0.12)", color: "#fd7e14" },   // Orange
  { bg: "rgba(32,201,151,0.12)", color: "#20c997" },   // Teal
  { bg: "rgba(111,66,193,0.12)", color: "#6f42c1" },   // Purple
  { bg: "rgba(13,202,240,0.15)", color: "#0dcaf0" }    // Cyan
];

const ImportantLinksSection = () => {
  const { isHindi } = useLanguage();
  const [links, setLinks] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    loadLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== LOAD LINKS FROM API & ASSIGN RANDOM COLORS ===== */
  const loadLinks = async () => {
    try {
      const res = await axios.get(`${API}/api/important-links`);
      if (res.data?.success) {
        const rawData = res.data.data || [];

        let lastIndex = -1;
        // Map over data to assign a randomized color, ensuring no consecutive duplicates
        const dataWithColors = rawData.map(item => {
          let randomIndex;
          do {
            randomIndex = Math.floor(Math.random() * colorVariants.length);
          } while (randomIndex === lastIndex);

          lastIndex = randomIndex;

          return {
            ...item,
            colorData: colorVariants[randomIndex]
          };
        });

        setLinks(dataWithColors);
      }
    } catch (error) {
      console.error("Error loading important links:", error);
    }
  };

  /* ===== EXTERNAL LINK CONFIRMATION ===== */
  const handleExternalClick = (url) => {
    Swal.fire({
      title: isHindi ? "बाहरी लिंक" : "External Link",
      text: isHindi
        ? "आपको एक बाहरी वेबसाइट पर रीडायरेक्ट किया जा रहा है। क्या आप जारी रखना चाहते हैं?"
        : "You are being redirected to an external website. Do you want to continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जारी रखें" : "Yes, Continue",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
      confirmButtonColor: "#0d6efd"
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  };

  /* ===== ICON RENDER ===== */
  const renderIcon = (iconName, variant) => {
    const IconComponent = ICONS[iconName] || FaInfoCircle;

    return (
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
        style={{
          width: "72px",
          height: "72px",
          backgroundColor: variant.bg,
          color: variant.color
        }}
      >
        <IconComponent size={32} />
      </div>
    );
  };

  return (
    <section className="py-5">
      <Container>
        {/* HEADER */}
        <div
          className="text-white p-4 rounded-3 shadow-sm mb-5 text-center text-md-start"
          style={{ background: "linear-gradient(135deg, #0a5c51 0%, #1a3a8f 60%, #6eaff8 100%)" }}
        >
          <h4 className="fw-bold mb-2 text-white">
            {isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}
          </h4>
          <p className="text-white m-0 opacity-75 fs-5">
            {isHindi
              ? "आवश्यक सरकारी सेवाओं के लिए त्वरित पहुँच"
              : "Quick access to essential government services"}
          </p>
        </div>

        {/* LINKS GRID */}
        <Row className="g-4">
          {links.map((link) => {
            const variant = link.colorData || colorVariants[0];

            const CardContent = (
              <Card
                className="h-100 border-1 shadow rounded-3 overflow-hidden bg-white border-primary"
                style={{
                  borderTop: `5px solid ${variant.color}`, // Matching the image reference style
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.classList.replace('shadow-sm', 'shadow');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.classList.replace('shadow', 'shadow-sm');
                }}
              >
                <CardBody className="text-center shadow p-1 d-flex flex-column align-items-center justify-content-center">
                  {renderIcon(link.icon, variant)}

                  <h6 className="fw-bold mb-1 text-dark lh-base">
                    {isHindi ? link.titleHin : link.titleEng}
                  </h6>

                  {link.isExternal && (
                    <small className="text-muted d-block mt-2 fw-medium" style={{ fontSize: "0.75rem" }}>
                      <FaExternalLinkAlt size={10} className="me-1 mb-1" />
                      {isHindi ? "बाहरी" : "External"}
                    </small>
                  )}
                </CardBody>
              </Card>
            );

            return (
              <Col className="  " xl={2} lg={3} md={3} sm={6} xs={12} key={link._id}>
                {link.isExternal ? (
                  <div
                    role="button"
                    className="text-decoration-none d-block h-100"
                    onClick={() => handleExternalClick(link.url)}
                  >
                    {CardContent}
                  </div>
                ) : (
                  <Link to={link.url} className="text-decoration-none d-block h-100">
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