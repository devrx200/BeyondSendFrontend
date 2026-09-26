import { Container } from "reactstrap";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaUsers,
  FaBroadcastTower,
  FaComments,
  FaServer,
} from "react-icons/fa";

const PLATFORM_STATS = [
  {
    value: "100M+",
    labelEn: "Messages Delivered",
    labelHi: "वितरित संदेश",
    Icon: FaPaperPlane,
    color: "primary",
  },
  {
    value: "99.9%",
    labelEn: "Delivery Success Rate",
    labelHi: "सफल वितरण दर",
    Icon: FaCheckCircle,
    color: "success",
  },
  {
    value: "1,500+",
    labelEn: "Enterprise Clients",
    labelHi: "एंटरप्राइज ग्राहक",
    Icon: FaUsers,
    color: "navy",
  },
  {
    value: "28+",
    labelEn: "Telecom Gateways",
    labelHi: "टेलीकॉम गेटवे",
    Icon: FaBroadcastTower,
    color: "warning",
  },
  {
    value: "4 Channels",
    labelEn: "SMS, WhatsApp, RCS, Email",
    labelHi: "एसएमएस, व्हाट्सएप, आरसीएस",
    Icon: FaComments,
    color: "info",
  },
  {
    value: "99.99%",
    labelEn: "Platform SLA Uptime",
    labelHi: "प्लेटफॉर्म अपटाइम",
    Icon: FaServer,
    color: "danger",
  },
];

const colorMap = {
  navy: { bar: "#1e40af", bg: "#eff6ff", icon: "#1e40af" },
  primary: { bar: "#1565C0", bg: "#E6F1FB", icon: "#1565C0" },
  danger: { bar: "#C62828", bg: "#FCEBEB", icon: "#C62828" },
  success: { bar: "#2E7D32", bg: "#EAF3DE", icon: "#2E7D32" },
  warning: { bar: "#E65100", bg: "#FAEEDA", icon: "#E65100" },
  info: { bar: "#00838F", bg: "#E1F5EE", icon: "#00838F" },
};

const AfterCarousel = () => {
  const { isHindi } = useLanguage();

  return (
    <Container className="my-3">
      <div className="stats-banner-container">
        <div className="stat-cards-grid">
          {PLATFORM_STATS.map((item, i) => {
            const c = colorMap[item.color] || colorMap.primary;
            const IconComp = item.Icon;

            return (
              <div key={i} className="h-100">
                <div
                  className="stat-card-item rounded-3 d-flex flex-column align-items-center justify-content-center h-100"
                  style={{ borderTop: `4px solid ${c.bar}` }}
                >
                  <div className="d-flex flex-column align-items-center justify-content-center py-2.5 px-2 w-100 text-center">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center stat-icon-wrap mb-1.5"
                      style={{ background: c.bg, color: c.icon }}
                    >
                      <IconComp />
                    </div>

                    <span className="stat-value fw-bold text-dark lh-1">
                      {item.value}
                    </span>

                    <small className="stat-label text-secondary text-center fw-semibold lh-sm mt-1.5 pt-1">
                      {isHindi ? item.labelHi : item.labelEn}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Container>
  );
};

export default AfterCarousel;