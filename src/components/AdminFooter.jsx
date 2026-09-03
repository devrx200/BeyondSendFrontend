import { FaCalendarAlt, FaShieldAlt } from "react-icons/fa";
const HEWebCMSVersion  = import.meta.env.VITE_PORTAL_VERSION;
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
        © {year} Department of Higher Education, Government of Chhattisgarh.
      </div>
      <div className="adm-footer-center">
        <span className="adm-side-version-chip text-white" style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.2)" }}>
          <FaShieldAlt style={{ color: "#10b981" }} /> HEWebCMS <span className="adm-version-num">v{HEWebCMSVersion || "0.1"}</span>
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
