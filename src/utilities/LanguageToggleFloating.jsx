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
    <div className="floating-action-container floating-action-right">
      <button
        type="button"
        onClick={toggleLanguage}
        className="btn btn-dark floating-action-btn floating-language-btn"
        title={isHindi ? "Switch to English" : "हिंदी में बदलें"}
        aria-label={isHindi ? "Switch to English" : "हिंदी में बदलें"}
      >
        <FaLanguage size={18} />
        <span>{isHindi ? "English" : "हिंदी"}</span>
      </button>
    </div>
  );
};

export default LanguageToggleFloating;
