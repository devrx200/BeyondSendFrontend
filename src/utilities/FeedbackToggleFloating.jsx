import { useEffect, useState } from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import { FaCommentDots } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const FeedbackToggleFloating = () => {
  const navigate = useNavigate();
  const { isHindi } = useLanguage();
  const [hasToken, setHasToken] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    setHasToken(!!token);
  }, []);

  // Hide on admin routes
  if (
    location.pathname.toLowerCase().includes("/admin") ||
    location.pathname.toLowerCase().includes("/dashboard")
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "16px",
        bottom: "20px",
        zIndex: 9999,
      }}
    >
      <Button
        id="feedback-btn-floating"
        color="warning"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate("/feedback");
        }}
        className="floating-action-btn d-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          border: "1.5px solid rgba(255, 255, 255, 0.4)",
          color: "#0f172a",
        }}
      >
        <FaCommentDots size={18} />
        {!hasToken && (
          <span>{isHindi ? "प्रतिक्रिया" : "Feedback"}</span>
        )}
      </Button>

      <UncontrolledTooltip placement="right" target="feedback-btn-floating" fade={false}>
        {hasToken
          ? isHindi
            ? "प्रतिक्रिया भेजें"
            : "Send Feedback"
          : isHindi
          ? "आपकी प्रतिक्रिया हमारे लिए मूल्यवान है"
          : "We Value Your Feedback"}
      </UncontrolledTooltip>
    </div>
  );
};

export default FeedbackToggleFloating;