import { Button } from "reactstrap";
import { FaLanguage } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggleFloating = () => {
  const { isHindi, toggleLanguage } = useLanguage();
  const location = useLocation();

  if (
    location.pathname.toLowerCase().includes("/admin") ||
    location.pathname.toLowerCase().includes("/dashboard") ||
    location.pathname.toLowerCase().includes("/authorized")
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        right: "16px",
        bottom: "20px",
        zIndex: 9999,
      }}
    >
      <Button
        color="primary"
        onClick={toggleLanguage}
        className="floating-action-btn d-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #4f6ef7 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.4)",
          color: "#ffffff",
        }}
        title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
      >
        <FaLanguage size={18} />
        <span>{isHindi ? "English" : "हिंदी"}</span>
      </Button>
    </div>
  );
};

export default LanguageToggleFloating;
