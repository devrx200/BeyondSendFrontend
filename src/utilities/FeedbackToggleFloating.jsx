import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const FeedbackToggleFloating = () => {
  const navigate = useNavigate();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    setHasToken(!!token); // true if exists
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: "15px",
        bottom: "20px",
        zIndex: 9999
      }}
    >
      <Button
        color="warning"
        onClick={() => navigate("/feedback")}
        className="d-flex align-items-center gap-2 shadow"
        style={{
          borderRadius: "30px",
          padding: "5px 14px",
          fontSize: "14px",
          fontWeight: "bold",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "scale(1.05)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        <FaCommentDots size={16} />

        {!hasToken && (
          <span className="d-none d-md-inline fw-bold">
            Feedback
          </span>
        )}
      </Button>
    </div>
  );
};

export default FeedbackToggleFloating;