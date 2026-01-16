import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Spinner } from "reactstrap";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AfterCarousel = () => {
  const { isHindi } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* = FETCH CURRENT STATS = */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/education-stats/current`
        );
        setStats(res.data.data);
      } catch (err) {
        console.error("Education stats load failed", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* =UI DATA = */
  const statsData = stats
    ? [
        {
          value: stats.totalUniversities,
          labelEn: "Total Universities",
          labelHi: "विश्वविद्यालय",
          icon: "bi-bank",
          bg: "bg-primary"
        },
        {
          value: stats.governmentColleges,
          labelEn: "Government Colleges",
          labelHi: "सरकारी महाविद्यालय",
          icon: "bi-building",
          bg: "bg-danger"
        },
        {
          value: stats.privateColleges,
          labelEn: "Private Colleges",
          labelHi: "निजी महाविद्यालय",
          icon: "bi-buildings",
          bg: "bg-info"
        },
        {
          value: stats.totalStudents,
          labelEn: "Total Students",
          labelHi: "कुल छात्र",
          icon: "bi-mortarboard",
          bg: "bg-success"
        }
      ]
    : [];

  return (
    <div className="after-carousel-section mt-2">
      <section className="stats-section py-3 bg-light">
        <Container>

          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : !stats ? (
            <div className="text-center text-muted py-4">
              {isHindi
                ? "आँकड़े उपलब्ध नहीं हैं"
                : "Statistics not available"}
            </div>
          ) : (
            <Row className="g-4">
              {statsData.map((item, i) => (
                <Col lg="3" md="6" key={i}>
                  <Card className="border-0 shadow-sm h-100 text-center rounded-4">
                    <CardBody>

                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <div className={`p-2 px-3 rounded ${item.bg}`}>
                          <i className={`bi ${item.icon} fs-3 text-white`} />
                        </div>
                        <h2 className="fw-bold mb-0">
                          {item.value.toLocaleString("en-IN")}
                        </h2>
                      </div>

                      <hr className="my-2" />

                      <strong className="text-muted">
                        {isHindi ? item.labelHi : item.labelEn}
                      </strong>

                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

        </Container>
      </section>
    </div>
  );
};

export default AfterCarousel;
