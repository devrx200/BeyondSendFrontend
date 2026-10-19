import { useEffect, useState } from "react";
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

  if (
    location.pathname.toLowerCase().includes("/admin") ||
    location.pathname.toLowerCase().includes("/dashboard") ||
    location.pathname.toLowerCase().includes("/authorized")
  ) {
    return null;
  }

  const tooltipText = hasToken
    ? (isHindi ? "प्रतिक्रिया भेजें" : "Send Feedback")
    : (isHindi ? "आपकी प्रतिक्रिया हमारे लिए मूल्यवान है" : "We Value Your Feedback");

  return (
    <div className="floating-action-container floating-action-left">
      <button
        type="button"
        id="feedback-btn-floating"
        onClick={() => {
          window.scrollTo(0, 0);
          navigate("/feedback");
        }}
        className="btn btn-warning floating-action-btn floating-feedback-btn"
        title={tooltipText}
        aria-label={isHindi ? "प्रतिक्रिया" : "Feedback"}
      >
        <FaCommentDots size={17} />
        {!hasToken && (
          <span>{isHindi ? "प्रतिक्रिया" : "Feedback"}</span>
        )}
      </button>
    </div>
  );
};

export default FeedbackToggleFloating;
