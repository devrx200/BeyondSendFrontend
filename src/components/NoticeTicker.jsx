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
    <aside
      className="adm-ticker-bar"
      aria-label={isHindi ? "सूचना बुलेटिन" : "Notice Ticker"}
    >
      <div className="adm-ticker-inner">
        {/* LEFT BADGE */}
        <div className="adm-ticker-badge">
          <span className="adm-ticker-pulse-dot" />
          <FaNewspaper size={11} />
          <span>{isHindi ? "नवीन सूचना" : "New Updates"}</span>
          <FaBullhorn size={10} className="d-none d-sm-inline opacity-75" />
        </div>

        {/* MARQUEE CONTAINER */}
        <div
          className="adm-ticker-marquee"
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
          <div ref={tickerRef} className="adm-ticker-track">
            {displayItems.length === 0 ? (
              <span className="adm-ticker-empty">
                {isHindi ? "कोई सूचना उपलब्ध नहीं है" : "No updates available"}
              </span>
            ) : (
              displayItems.map((item, index) => {
                const title = isHindi && item.titleHin ? item.titleHin : item.titleEng || item.titleHin;

                const content = (
                  <div className="adm-ticker-chip">
                    <span className="adm-ticker-title">{title}</span>
                    {item.createdAt && (
                      <span className="adm-ticker-date">
                        <FaClock size={8.5} />
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
                    className="adm-ticker-link"
                    title={title}
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={index}
                    to={item.link || "#"}
                    className="adm-ticker-link"
                    title={title}
                  >
                    {content}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default NoticeTicker;
