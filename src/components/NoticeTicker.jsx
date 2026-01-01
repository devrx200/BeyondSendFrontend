import { useEffect, useState, useRef } from "react";
import { Container, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { FaNewspaper } from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext"; 

const NoticeTicker = () => {
  const [data, setData] = useState([]);
  const tickerRef = useRef(null);
  const { isHindi } = useLanguage(); 
  const API_URL = import.meta.env.VITE_API_URL;

  const dummyData = [
    {
      titleEng: "Admission Open 2025-26",
      titleHin: "प्रवेश 2025-26 प्रारंभ",
      link: "/admission",
      createdAt: "2025-01-12",
      isExternal: false,
      isActive: true
    },
    {
      titleEng: "Exam Form Last Date Extended",
      titleHin: "परीक्षा फॉर्म की अंतिम तिथि बढ़ाई गई",
      link: "/exam",
      createdAt: "2025-01-10",
      isExternal: false,
      isActive: true
    }
  ];

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${API_URL}/notices`);
        const notices = res.data?.filter(n => n.isActive);
        setData(notices?.length ? notices : dummyData);
      } catch {
        setData(dummyData);
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

  return (
    <Container fluid className="px-0 mt-2">
      <div className="d-flex align-items-center gap-3 overflow-hidden">

  
        <Badge
          color="danger"
          className="px-3 py-2 fw-bold text-white fs-6 d-flex align-items-center gap-2"
        >
          <FaNewspaper />
          {isHindi ? "नवीन सूचना" : "New Updates"}
        </Badge>


        <div
          className="flex-grow-1 rounded overflow-hidden"
          onMouseEnter={() =>
            (tickerRef.current.style.animationPlayState = "paused")
          }
          onMouseLeave={() =>
            (tickerRef.current.style.animationPlayState = "running")
          }
        >
          <div
            ref={tickerRef}
            className="d-flex align-items-center gap-3 px-2 ticker-track"
          >
            {[...data, ...data].map((item, index) => {
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
                  target={item.openInNewTab ? "_blank" : "_self"}
                  rel="noopener noreferrer"
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
            })}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NoticeTicker;
