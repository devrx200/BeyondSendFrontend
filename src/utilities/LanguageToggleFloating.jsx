import { Button } from "reactstrap";
import { FaLanguage } from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const LanguageToggleFloating = () => {
  const { isHindi, toggleLanguage } = useLanguage();

  return (
    <div
      style={{
        position: "fixed",
        right: "15px",
        bottom: "20px",
        zIndex: 9999
      }}
    >
      <Button
        color="primary"
        onClick={toggleLanguage}
        className="d-flex align-items-center gap-2 shadow"
        style={{
          borderRadius: "30px",
          padding: "5px 14px",
          fontSize: "14px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        <FaLanguage size={16} />
        <span className="d-none d-md-inline">
          {isHindi ? "English" : "हिंदी"}
        </span>
      </Button>
    </div>
  );
};

export default LanguageToggleFloating;
