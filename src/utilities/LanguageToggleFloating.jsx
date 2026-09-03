import { Button } from "reactstrap";
import { FaLanguage } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggleFloating = () => {
  const { isHindi, toggleLanguage } = useLanguage();

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
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
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
