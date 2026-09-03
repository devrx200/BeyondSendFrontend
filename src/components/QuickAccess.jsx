import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import axios from "axios";
import {
  FaUserGraduate,
  FaMoneyBillWave,
  FaBook,
  FaClipboardList,
  FaBookReader,
  FaExclamationCircle,
  FaThLarge,
  FaLink,
  FaExternalLinkAlt
} from "react-icons/fa";
import { ICONS } from "../utilities/icons";
import { useLanguage } from "../contexts/LanguageContext";

const COLOR_PALETTE = [
  { color: "#6366f1", bg: "#e0e7ff" }, // Indigo
  { color: "#10b981", bg: "#d1fae5" }, // Emerald
  { color: "#f59e0b", bg: "#fef3c7" }, // Amber
  { color: "#ef4444", bg: "#fee2e2" }, // Red
  { color: "#3b82f6", bg: "#dbeafe" }, // Blue
  { color: "#ec4899", bg: "#fce7f3" }, // Pink
  { color: "#8b5cf6", bg: "#ede9fe" }, // Purple
  { color: "#0d9488", bg: "#ccfbf1" }, // Teal
];

const DEFAULT_QUICK_LINKS = [
  { id: 1, titleEn: "Admissions", titleHi: "प्रवेश", link: "/admissions", icon: "FaUserGraduate", Icon: FaUserGraduate, color: "#6366f1", bg: "#e0e7ff" },
  { id: 2, titleEn: "Scholarships", titleHi: "छात्रवृत्ति", link: "/schemes", icon: "FaMoneyBillWave", Icon: FaMoneyBillWave, color: "#10b981", bg: "#d1fae5" },
  { id: 3, titleEn: "Syllabus", titleHi: "पाठ्यक्रम", link: "/downloads", icon: "FaBook", Icon: FaBook, color: "#f59e0b", bg: "#fef3c7" },
  { id: 4, titleEn: "Examinations", titleHi: "परीक्षाएं", link: "/announcements", icon: "FaClipboardList", Icon: FaClipboardList, color: "#ef4444", bg: "#fee2e2" },
  { id: 5, titleEn: "E-Library", titleHi: "ई-पुस्तकालय", link: "/resources/e-library", icon: "FaBookReader", Icon: FaBookReader, color: "#3b82f6", bg: "#dbeafe" },
  { id: 6, titleEn: "Grievances", titleHi: "शिकायतें", link: "/feedback", icon: "FaExclamationCircle", Icon: FaExclamationCircle, color: "#ec4899", bg: "#fce7f3" },
];

const QuickAccess = ({ isHindi: propIsHindi }) => {
  const { isHindi: ctxIsHindi } = useLanguage();
  const isHindi = propIsHindi !== undefined ? propIsHindi : ctxIsHindi;

  const [links, setLinks] = useState(DEFAULT_QUICK_LINKS);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    let isMounted = true;

    const fetchQuickAccess = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quick-access`);
        if (isMounted && res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const activeItems = res.data.data.filter((item) => item.isActive !== false);
          if (activeItems.length > 0) {
            setLinks(activeItems);
          }
        }
      } catch {
        // Fallback gracefully to default links
      }
    };

    fetchQuickAccess();

    return () => {
      isMounted = false;
    };
  }, [API_URL]);

  return (
    <Container className="my-3">
      {/* Unified Card Container Matching Portal Theme */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
        {/* Unified Government Theme Header */}
        <div className="gov-card-header d-flex align-items-center gap-3">
          <div className="gov-card-header-icon">
            <FaThLarge size={18} color="#fff" />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-white" style={{ fontSize: "1.08rem" }}>
              {isHindi ? "त्वरित पहुंच" : "Quick Access"}
            </h4>
            <p className="text-white-50 mb-0" style={{ fontSize: "12px", marginTop: "2px" }}>
              {isHindi
                ? "मुख्य शैक्षणिक एवं छात्र सेवाओं के लिए त्वरित लिंक"
                : "Fast access to key student, academic & administrative services"}
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <CardBody className="p-3 p-md-3.5">
          <Row className="g-3 justify-content-center">
            {links.map((item, index) => {
              const colorInfo = COLOR_PALETTE[index % COLOR_PALETTE.length];
              const color = item.color || colorInfo.color;
              const bg = item.bg || colorInfo.bg;

              // Title resolution
              const titleEn = item.titleEn || item.titleEng || item.name || "Quick Link";
              const titleHi = item.titleHi || item.titleHin || titleEn;

              // URL & External check
              const targetUrl = item.link || item.url || "#";
              const isExternal = item.isExternal || targetUrl.startsWith("http://") || targetUrl.startsWith("https://");

              // Dynamic Icon resolution
              let ResolvedIcon = item.Icon;
              if (!ResolvedIcon && item.icon && ICONS[item.icon]) {
                ResolvedIcon = ICONS[item.icon];
              }
              if (!ResolvedIcon) {
                ResolvedIcon = FaLink;
              }

              const CardContent = (
                <div
                  className="h-100 gov-interactive-card text-center p-3 d-flex flex-column align-items-center justify-content-between position-relative"
                  style={{
                    borderTop: `4px solid ${color}`,
                    minHeight: "135px"
                  }}
                >
                  {isExternal && (
                    <FaExternalLinkAlt
                      className="position-absolute top-0 end-0 m-2 text-muted"
                      size={10}
                      title="Opens in new tab"
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className="mx-auto mb-2.5 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "48px",
                      height: "48px",
                      transition: "all 0.3s ease",
                      background: bg,
                      color: color
                    }}
                  >
                    <ResolvedIcon style={{ fontSize: "20px" }} />
                  </div>

                  {/* Primary Label */}
                  <p
                    className="mb-0 fw-bold text-dark lh-sm text-truncate w-100"
                    style={{
                      fontSize: "13.5px",
                      transition: "color 0.2s ease"
                    }}
                    title={isHindi ? titleHi : titleEn}
                  >
                    {isHindi ? titleHi : titleEn}
                  </p>

                  {/* Secondary Label */}
                  <p
                    className="mb-0 text-muted mt-1 text-truncate w-100"
                    style={{ fontSize: "11px" }}
                    title={isHindi ? titleEn : titleHi}
                  >
                    {isHindi ? titleEn : titleHi}
                  </p>
                </div>
              );

              return (
                <Col key={item._id || item.id || index} xs={6} sm={4} md={4} lg={2}>
                  {isExternal ? (
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-decoration-none d-block h-100"
                    >
                      {CardContent}
                    </a>
                  ) : (
                    <Link to={targetUrl} className="text-decoration-none d-block h-100">
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

export default QuickAccess;