import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { FaExternalLinkAlt, FaInfoCircle, FaLink } from "react-icons/fa";
import { ICONS } from "../utilities/icons";
import { useLanguage } from "../contexts/LanguageContext";

const colorVariants = [
  { bg: "rgba(30, 64, 175, 0.1)", color: "#1e40af" },   // Royal Blue
  { bg: "rgba(220, 38, 38, 0.1)", color: "#dc2626" },    // Crimson Red
  { bg: "rgba(22, 163, 74, 0.1)", color: "#16a34a" },    // Emerald Green
  { bg: "rgba(234, 88, 12, 0.1)", color: "#ea580c" },    // Warm Orange
  { bg: "rgba(13, 148, 136, 0.1)", color: "#0d9488" },   // Teal
  { bg: "rgba(124, 58, 237, 0.1)", color: "#7c3aed" },   // Violet
  { bg: "rgba(2, 132, 199, 0.1)", color: "#0284c7" }     // Sky Blue
];

const ImportantLinksSection = () => {
  const { isHindi } = useLanguage();
  const [links, setLinks] = useState([]);
  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let isMounted = true;

    const loadLinks = async () => {
      try {
        const res = await axios.get(`${API}/api/important-links`);
        if (isMounted && res.data?.success) {
          const rawData = res.data.data || [];

          let lastIndex = -1;
          const dataWithColors = rawData.map((item) => {
            let randomIndex;
            do {
              randomIndex = Math.floor(Math.random() * colorVariants.length);
            } while (randomIndex === lastIndex && colorVariants.length > 1);

            lastIndex = randomIndex;

            return {
              ...item,
              colorData: colorVariants[randomIndex]
            };
          });

          setLinks(dataWithColors);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading important links:", error);
        }
      }
    };

    loadLinks();

    return () => {
      isMounted = false;
    };
  }, [API]);

  const handleExternalClick = (url) => {
    Swal.fire({
      title: isHindi ? "बाहरी लिंक" : "External Link",
      text: isHindi
        ? "आपको एक बाहरी वेबसाइट पर रीडायरेक्ट किया जा रहा है। क्या आप जारी रखना चाहते हैं?"
        : "You are being redirected to an external website. Do you want to continue?",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जारी रखें" : "Yes, Continue",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
      confirmButtonColor: "#1e40af"
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  };

  const renderIcon = (iconName, variant) => {
    const IconComponent = ICONS[iconName] || FaInfoCircle;

    return (
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2.5 transition-all"
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: variant.bg,
          color: variant.color
        }}
      >
        <IconComponent size={26} />
      </div>
    );
  };

  if (!links || links.length === 0) return null;

  return (
    <Container className="my-3">
      {/* Unified Card container matching site theme */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>

        {/* Unified Government Theme Header */}
        <div className="gov-card-header d-flex align-items-center gap-3">
          <div className="gov-card-header-icon">
            <FaLink size={18} color="#fff" />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-white" style={{ fontSize: "1.08rem" }}>
              {isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}
            </h4>
            <p className="text-white-50 mb-0" style={{ fontSize: "12px", marginTop: "2px" }}>
              {isHindi
                ? "आवश्यक सरकारी सेवाओं एवं पोर्टल्स के लिए त्वरित पहुँच"
                : "Quick access to essential government services & portals"}
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <CardBody className="p-3 p-md-3.5">
          <Row className="g-3">
            {links.map((link) => {
              const variant = link.colorData || colorVariants[0];

              const CardContent = (
                <div
                  className="h-100 gov-interactive-card text-center p-3 d-flex flex-column align-items-center justify-content-between"
                  style={{
                    borderTop: `4px solid ${variant.color}`,
                    minHeight: "140px"
                  }}
                >
                  <div className="w-100 d-flex flex-column align-items-center">
                    {renderIcon(link.icon, variant)}

                    <h6 className="fw-bold mb-1 text-dark lh-sm" style={{ fontSize: "0.88rem" }}>
                      {isHindi ? link.titleHin : link.titleEng}
                    </h6>
                  </div>

                  {link.isExternal && (
                    <small className="text-muted d-inline-flex align-items-center mt-2 fw-medium" style={{ fontSize: "11px" }}>
                      <FaExternalLinkAlt size={9.5} className="me-1 text-primary" />
                      {isHindi ? "बाहरी पोर्टल" : "External"}
                    </small>
                  )}
                </div>
              );

              return (
                <Col xl={2} lg={3} md={4} sm={6} xs={6} key={link._id}>
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
        </CardBody>
      </Card>
    </Container>
  );
};

export default ImportantLinksSection;