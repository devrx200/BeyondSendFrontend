import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FaBullhorn, FaNewspaper, FaClock } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const NoticeTicker = () => {
  const [data, setData] = useState([]);
  const tickerRef = useRef(null);
  const { isHindi } = useLanguage();

  /* = FETCH NOTICES == */
  useEffect(() => {
    let isMounted = true;
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notice-ticker`);
        const notices = res.data?.data || [];
        if (isMounted) {
          if (notices.length > 0) {
            setData(notices);
          } else {
            setData([
              {
                titleHin: "शासकीय एवं अशासकीय महाविद्यालयों हेतु अकादमिक सत्र संबंधी महत्वपूर्ण निर्देश जारी।",
                titleEng: "Important guidelines released regarding academic session for government and private colleges.",
                link: "/announcements",
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Notice ticker load failed", err);
          setData([
            {
              titleHin: "शासकीय एवं अशासकीय महाविद्यालयों हेतु अकादमिक सत्र संबंधी महत्वपूर्ण निर्देश जारी।",
              titleEng: "Important guidelines released regarding academic session for government and private colleges.",
              link: "/announcements",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      }
    };
    fetchNotices();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });

    if (!confirm.isConfirmed) return;

    if (item.openInNewTab) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else {
      window.open(item.link, "_self");
    }
  };

  // Duplicate items to ensure smooth continuous marquee loop
  const displayItems = data.length > 0 ? [...data, ...data] : [];

  return (
    <div
      className="border-bottom"
      style={{
        background: "#ffffff",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        padding: "4px 0",
      }}
    >
      <div className="d-flex align-items-center gap-2 overflow-hidden px-2 px-md-3">
        {/* LEFT BADGE */}
        <div
          className="text-white d-flex align-items-center gap-2 flex-shrink-0 shadow-xs"
          style={{
            height: "34px",
            padding: "0 14px",
            fontSize: "13px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
            letterSpacing: "0.2px",
            whiteSpace: "nowrap",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        >
          <span
            className="rounded-circle bg-white"
            style={{ width: "6px", height: "6px", animation: "pulse 1.5s infinite" }}
          />
          <FaNewspaper size={13} />
          <span>{isHindi ? "नवीन सूचना" : "New Updates"}</span>
          <FaBullhorn size={11} className="d-none d-sm-inline ms-0.5 opacity-75" />
        </div>

        {/* MARQUEE CONTAINER */}
        <div
          className="flex-grow-1 overflow-hidden"
          onMouseEnter={() => {
            if (tickerRef.current) tickerRef.current.style.animationPlayState = "paused";
          }}
          onMouseLeave={() => {
            if (tickerRef.current) tickerRef.current.style.animationPlayState = "running";
          }}
          onTouchStart={() => {
            if (tickerRef.current) tickerRef.current.style.animationPlayState = "paused";
          }}
          onTouchEnd={() => {
            if (tickerRef.current) tickerRef.current.style.animationPlayState = "running";
          }}
        >
          <div ref={tickerRef} className="ticker-track py-0.5">
            {displayItems.length === 0 ? (
              <span className="text-muted small px-3">
                {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No updates available"}
              </span>
            ) : (
              displayItems.map((item, index) => {
                const title = isHindi && item.titleHin ? item.titleHin : item.titleEng || item.titleHin;

                const content = (
                  <div className="ticker-item-chip">
                    <span className="fw-medium">{title}</span>
                    {item.createdAt && (
                      <span
                        className="d-inline-flex align-items-center gap-1 px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255, 213, 79, 0.16)",
                          color: "#ffd54f",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        <FaClock size={9.5} />
                        {formatDate(item.createdAt)}
                      </span>
                    )}
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
                    to={item.link || "#"}
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
    </div>
  );
};

export default NoticeTicker;
