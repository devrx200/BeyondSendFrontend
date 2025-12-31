import { useEffect, useState, useRef } from "react";
import { Container, Badge } from "reactstrap";
import { Link } from "react-router-dom";
import { FaNewspaper } from "react-icons/fa";
import axios from "axios";

const NoticeTicker = () => {
  const [data, setData] = useState([]);
  const tickerRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;

  const dummyData = [
    { title: "Admission Open 2025-26", link: "/admission", date: "12 Jan 2025" },
    { title: "Exam Form Last Date Extended", link: "/exam", date: "10 Jan 2025" },
    { title: "Academic Calendar Released", link: "/calendar", date: "15 Jan 2025" },
    { title: "Fee Payment Portal Open", link: "/fees", date: "20 Jan 2025" },
  ];

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axios.get(`${API_URL}/notices`);
        setData(res.data?.length ? res.data : dummyData);
      } catch {
        setData(dummyData);
      }
    };
    fetchNotices();
  }, []);

  return (
    <Container fluid className="px-0 mt-2">
      <div className="d-flex align-items-center gap-3 mx-0 px-0 overflow-hidden">
        {/* LABEL */}
        <Badge
          color="danger"
          className="px-3 py-2 fw-bold text-white fs-6 d-inline-flex align-items-center gap-2"
        >
          <FaNewspaper />
          New Updates
        </Badge>
        {/* TICKER */}
        <div
          className="flex-grow-1  rounded overflow-hidden"
          onMouseEnter={() => (tickerRef.current.style.animationPlayState = "paused")}
          onMouseLeave={() => (tickerRef.current.style.animationPlayState = "running")}
        >
          <div
            ref={tickerRef}
            className="d-flex align-items-center gap-3 px-2 ticker-track"
          >
            {[...data, ...data].map((item, index) => (
              <Link key={index} to={item.link} className="text-decoration-none">
                <div className="bg-dark text-white rounded px-1  py-1 small shadow-sm text-nowrap">
                  <strong>{item.title}</strong>
                  {item.date && (
                    <span className="ms-2 text-warning">({item.date})</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default NoticeTicker;
