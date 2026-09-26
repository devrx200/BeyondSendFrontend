import { FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

const PORTAL_VERSION = import.meta.env.VITE_PORTAL_VERSION;

const AdminFooter = () => {
  const { isHindi } = useLanguage();
  const now = new Date();
  const year = now.getFullYear();
  const dateLabel = now.toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

  return (
    <footer className="adm-footer" role="contentinfo">
      <div className="adm-footer-left">
        © {year} BeyondSend. {isHindi ? "सर्वाधिकार सुरक्षित।" : "All Rights Reserved."}
      </div>
      <div className="adm-footer-center">
        <span className="adm-footer-tag">
          <FaShieldAlt className="adm-footer-tag-icon" />
          <span>BeyondSend Platform</span>
          <span className="adm-footer-ver-badge">v{PORTAL_VERSION || "1.0"}</span>
        </span>
      </div>
      <div className="adm-footer-right">
        <span className="adm-footer-pill">
          <FaCalendarAlt size={10.5} /> {dateLabel}
        </span>
      </div>
    </footer>
  );
};

export default AdminFooter;
