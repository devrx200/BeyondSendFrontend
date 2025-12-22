import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Badge,
} from "reactstrap";
import { Link } from "react-router-dom";
import {
  FaNewspaper,
  FaArrowRight,
  FaCalendar,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import DataService from "../services/DataService";

const AfterCarousel = () => {
  const { isHindi } = useLanguage();

  const [latestNews, setLatestNews] = useState([]);
  const [ministerMessage, setMinisterMessage] = useState(null);
  const [quickUpdates, setQuickUpdates] = useState([]);
  const [stats, setStats] = useState([]);

  /* ---------- STATIC STATS DATA ---------- */
  const statsData = [
    {
      value: 15,
      labelEn: "Universities",
      labelHi: "विश्वविद्यालय",
      icon: "bi-bank",
      bg: "bg-primary",
    },
    {
      value: 135,
      labelEn: "Government Colleges",
      labelHi: "सरकारी महाविद्यालय",
      icon: "bi-building",
      bg: "bg-danger",
    },
    {
      value: 296,
      labelEn: "Private Colleges",
      labelHi: "निजी महाविद्यालय",
      icon: "bi-buildings",
      bg: "bg-info",
    },
    {
      value: 325000,
      labelEn: "Total Students",
      labelHi: "कुल छात्र",
      icon: "bi-mortarboard",
      bg: "bg-success",
    },
  ];

  /* ---------- LOAD DATA ---------- */
  useEffect(() => {
    const loadContent = async () => {
      try {
        const [news, message, updates] = await Promise.all([
          DataService.getLatestNews(),
          DataService.getMinisterMessage(),
          DataService.getQuickUpdates(),
        ]);

        setLatestNews(news || []);
        setMinisterMessage(message);
        setQuickUpdates(updates || []);
        setStats(statsData);
      } catch (err) {
        console.error("AfterCarousel Error:", err);
      }
    };

    loadContent();
  }, []);

  return (
    <div className="after-carousel-section">

      {/* ---------- STATS ---------- */}
      <section className="stats-section py-5 bg-light">
        <Container>
          <Row className="g-4">
            {stats.map((item, i) => (
              <Col lg="3" md="6" key={i}>
                <Card className="border-0 shadow-sm h-100 text-center rounded-4">
                  <CardBody>
                    <div
                      className={`d-inline-flex align-items-center justify-content-center rounded-4 ${item.bg} mb-3`}
                      style={{ width: 64, height: 64 }}
                    >
                      <i className={`bi ${item.icon} fs-3 text-white`} />
                    </div>

                    <h2 className="fw-bold">{item.value}</h2>
                    <p className="text-muted mb-0">
                      {isHindi ? item.labelHi : item.labelEn}
                    </p>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ---------- MAIN CONTENT ---------- */}
      <section className="py-5">
        <Container>
          <Row className="g-4">

            {/* Latest News */}
            <Col lg={4} md={6}>
              <Card className="h-100 shadow-sm">
                <CardBody>
                  <CardTitle tag="h4">
                    <FaNewspaper className="me-2 text-primary" />
                    {isHindi ? "ताजा खबर" : "Latest News"}
                  </CardTitle>

                  {(latestNews || []).slice(0, 5).map(news => (
                    <div key={news.id} className="border-bottom mb-2 pb-2">
                      <Link to={news.link} className="text-decoration-none">
                        <h6>{isHindi ? news.titleHi : news.title}</h6>
                      </Link>
                      <small className="text-muted">
                        <FaCalendar className="me-1" />
                        {new Date(news.date).toLocaleDateString("en-IN")}
                      </small>
                    </div>
                  ))}

                  <Link to="/notice-board/news" className="btn btn-outline-primary btn-sm w-100 mt-2">
                    {isHindi ? "और देखें" : "View All"} <FaArrowRight />
                  </Link>
                </CardBody>
              </Card>
            </Col>

            {/* Minister Message */}
            <Col lg={4} md={6}>
              <Card className="h-100 shadow-sm text-center">
                <CardBody>
                  <CardTitle tag="h4">
                    {isHindi ? "मंत्री जी का संदेश" : "Minister's Message"}
                  </CardTitle>

                  {ministerMessage && (
                    <>
                      <img
                        src={ministerMessage.image}
                        alt="Minister"
                        className="img-fluid rounded mb-3"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/200x250")
                        }
                      />
                      <h5>
                        {isHindi
                          ? ministerMessage.nameHi
                          : ministerMessage.name}
                      </h5>
                      <p className="small text-muted">
                        {isHindi
                          ? ministerMessage.designationHi
                          : ministerMessage.designation}
                      </p>
                      <p className="small">
                        “{isHindi
                          ? ministerMessage.messageHi
                          : ministerMessage.message}”
                      </p>
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>

            {/* Notice Board */}
            <Col lg={4}>
              <Card className="h-100 shadow-sm">
                <CardBody>
                  <CardTitle tag="h4">
                    {isHindi ? "सूचना पट्टिका" : "Notice Board"}
                  </CardTitle>

                  {(quickUpdates || []).map(update => (
                    <Link
                      key={update.id}
                      to={update.link}
                      className="d-block mb-2 text-decoration-none"
                    >
                      <h6 className="mb-0">
                        {isHindi ? update.titleHi : update.title}
                      </h6>
                    </Link>
                  ))}

                  <Link to="/notice-board" className="btn btn-outline-primary btn-sm w-100">
                    {isHindi ? "सभी सूचनाएं" : "View All Notices"} <FaArrowRight />
                  </Link>
                </CardBody>
              </Card>
            </Col>

          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AfterCarousel;
