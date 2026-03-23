import { useEffect, useState, useRef } from "react";
import { Container, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { FaBullhorn, FaNewspaper } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";

const NoticeTicker = () => {
  const [data, setData] = useState([]);
  const tickerRef = useRef(null);
  const { isHindi } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;

  /* = FETCH NOTICES == */
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notice-ticker`);
        setData(res.data?.data || []);
      } catch (err) {
        console.error("Notice ticker load failed", err);
        setData([]);
      }
    };
    fetchNotices();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

  /* == EXTERNAL LINK CONFIRM = */
  const handleExternalClick = async (e, item) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: isHindi ? "बाहरी लिंक" : "External Link",
      text: isHindi
        ? "आप एक बाहरी वेबसाइट पर जा रहे हैं। जारी रखें?"
        : "You are about to open an external website. Continue?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isHindi ? "हाँ, जारी रखें" : "Yes, Continue",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
    });

    if (!confirm.isConfirmed) return;

    if (item.openInNewTab) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = item.link;
    }
  };

  return (
  <Container fluid className="px-0 bg-white py-2 border-bottom border-dark">
      <div className="d-flex align-items-center gap-3 overflow-hidden">

        {/* LEFT BADGE */}
        <Badge
          color="danger"
          className="px-3 py-2 fw-bold text-white fs-6 d-flex align-items-center gap-2"
        >
          <FaNewspaper />
          {isHindi ? "नवीन सूचना" : "New Updates"} <FaBullhorn />
        </Badge>

        {/* MARQUEE */}
        <div
          className="flex-grow-1 rounded overflow-hidden"
          onMouseEnter={() =>
            tickerRef.current &&
            (tickerRef.current.style.animationPlayState = "paused")
          }
          onMouseLeave={() =>
            tickerRef.current &&
            (tickerRef.current.style.animationPlayState = "running")
          }
        >
          <div
            ref={tickerRef}
            className="d-flex align-items-center gap-3 px-2 ticker-track"
          >
            {data.length === 0 ? (
              <span className="text-muted small">
                {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No updates available"}
              </span>
            ) : (
              data.map((item, index) => {
                const title =
                  isHindi && item.titleHin ? item.titleHin : item.titleEng;

                const content = (
                  <div className="bg-dark text-white rounded px-2 py-1 small shadow-sm text-nowrap">
                    <strong>{title}</strong>
                    <span className="ms-2 text-warning">
                      ({formatDate(item.createdAt)})
                    </span>
                  </div>
                );

                return item.isExternal ? (
                  <a
                    key={index}
                    href={item.link}
                    onClick={(e) => handleExternalClick(e, item)}
                    className="text-decoration-none"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={item.link}
                    className="text-decoration-none"
                  >
                    {content}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NoticeTicker;
