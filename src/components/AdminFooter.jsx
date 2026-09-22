import { FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
const PORTAL_VERSION = import.meta.env.VITE_PORTAL_VERSION;
const AdminFooter = () => {

  const now = new Date();
  const year = now.getFullYear();
  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

  return (
    <footer className="adm-footer">
      <div className="adm-footer-left">
        © {year} BeyondSend. All Rights Reserved.
      </div>
      <div className="adm-footer-center">
        <span className="adm-side-version-chip">
          <FaShieldAlt className="adm-version-icon" />
          <span>BeyondSend </span>
          <span className="adm-version-num">v{PORTAL_VERSION || "1.0"}</span>
        </span>
      </div>
      <div className="adm-footer-right">
        <span className="adm-footer-pill">
          <FaCalendarAlt /> {dateLabel}
        </span>
      </div>
    </footer>
  );
};

export default AdminFooter;
