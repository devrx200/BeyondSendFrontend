import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import apiClient from "../services/api.service";
import {
  FaCommentDots,
  FaWhatsapp,
  FaEnvelope,
  FaHeadset,
  FaCode,
  FaQuestionCircle,
  FaThLarge,
  FaLink,
  FaExternalLinkAlt
} from "react-icons/fa";
import { ICONS } from "../utilities/icons";
import { useLanguage } from "../contexts/LanguageContext";

const COLOR_PALETTE = [
  { color: "#4f6ef7", bg: "#edf2ff" }, // Primary Electric Blue
  { color: "#20c997", bg: "#ecfdf5" }, // Mint Teal
  { color: "#00c5eb", bg: "#ecfeff" }, // Accent Cyan
  { color: "#fe9365", bg: "#fff7ed" }, // Coral Warning
  { color: "#fe5d70", bg: "#fff1f2" }, // Rose Danger
  { color: "#1e293b", bg: "#f1f5f9" }, // Slate
];

const DEFAULT_QUICK_LINKS = [
  { id: 1, titleEn: "SMS Campaigns", titleHi: "एसएमएस अभियान", link: "/features", icon: "FaCommentDots", Icon: FaCommentDots, color: "#4f6ef7", bg: "#edf2ff" },
  { id: 2, titleEn: "WhatsApp API", titleHi: "व्हाट्सएप एपीआई", link: "/features", icon: "FaWhatsapp", Icon: FaWhatsapp, color: "#20c997", bg: "#ecfdf5" },
  { id: 3, titleEn: "Email Marketing", titleHi: "ईमेल ऑटोमेशन", link: "/features", icon: "FaEnvelope", Icon: FaEnvelope, color: "#00c5eb", bg: "#ecfeff" },
  { id: 4, titleEn: "Voice & BPO", titleHi: "वॉयस सपोर्ट", link: "/contact", icon: "FaHeadset", Icon: FaHeadset, color: "#fe9365", bg: "#fff7ed" },
  { id: 5, titleEn: "Developer Docs", titleHi: "एपीआई दस्तावेज़", link: "/downloads", icon: "FaCode", Icon: FaCode, color: "#1e293b", bg: "#f1f5f9" },
  { id: 6, titleEn: "Help & Support", titleHi: "सहायता केंद्र", link: "/help", icon: "FaQuestionCircle", Icon: FaQuestionCircle, color: "#fe5d70", bg: "#fff1f2" },
];

const QuickAccess = ({ isHindi: propIsHindi }) => {
  const { isHindi: ctxIsHindi } = useLanguage();
  const isHindi = propIsHindi !== undefined ? propIsHindi : ctxIsHindi;

  const [links, setLinks] = useState(DEFAULT_QUICK_LINKS);

  useEffect(() => {
    let isMounted = true;

    const isLegacy = (item) => {
      const text = `${item.titleEn || ""} ${item.titleHi || ""} ${item.titleEng || ""} ${item.name || ""} ${item.link || ""}`.toLowerCase();
      return /admission|scholarship|syllabus|examination|library|grievance|प्रवेश|छात्रवृत्ति|पाठ्यक्रम/i.test(text);
    };

    const fetchQuickAccess = async () => {
      try {
        const res = await apiClient.get('/quick-access/list');
        const list = res?.data || res || [];
        if (isMounted && Array.isArray(list) && list.length > 0) {
          const activeItems = list.filter((item) => item.isActive !== false && !isLegacy(item));
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
  }, []);

  return (
    <Container className="my-3">
      {/* Unified Card Container Matching Portal Theme */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
        {/* Unified Command-Center Header */}
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
                ? "प्लेटफ़ॉर्म सेवाओं, मैसेजिंग एपीआई और टेलीकॉम चैनलों तक त्वरित पहुंच"
                : "Instant access to messaging channels, telecom APIs, and customer support"}
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