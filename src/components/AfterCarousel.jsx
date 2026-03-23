import { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, Spinner } from "reactstrap";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AfterCarousel = () => {
  const { isHindi } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* = FETCH DATA = */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/education-stats/current`);
        setStats(res.data.data);
      } catch (err) {
        console.error("Stats error", err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /* = ALL DATA MAPPING = */
  const statsData = stats
    ? [
      {
        value: stats.totalGovernmentUniversities,
        labelEn: "Govt Universities",
        labelHi: "शासकीय विश्वविद्यालय",
        icon: "bi-bank",
        bg: "bg-primary"
      },
      {
        value: stats.totalPrivateUniversities,
        labelEn: "Private Universities",
        labelHi: "निजी विश्वविद्यालय",
        icon: "bi-bank2",
        bg: "bg-success"
      },
      {
        value: stats.totalCentralUniversities,
        labelEn: "Central Universities",
        labelHi: "केंद्रीय विश्वविद्यालय",
        icon: "bi-building",
        bg: "bg-info"
      },
      {
        value: stats.totalUniversities,
        labelEn: "Total Universities",
        labelHi: "कुल विश्वविद्यालय",
        icon: "bi-mortarboard",
        bg: "bg-dark"
      },
      {
        value: stats.governmentColleges,
        labelEn: "Govt Colleges",
        labelHi: "सरकारी महाविद्यालय",
        icon: "bi-building-fill",
        bg: "bg-danger"
      },
      {
        value: stats.privateColleges,
        labelEn: "Private Colleges",
        labelHi: "निजी महाविद्यालय",
        icon: "bi-buildings",
        bg: "bg-warning"
      },
      {
        value: stats.totalColleges,
        labelEn: "Total Colleges",
        labelHi: "कुल महाविद्यालय",
        icon: "bi-house",
        bg: "bg-secondary"
      },
      {
        value: stats.totalStudents,
        labelEn: "Total Students",
        labelHi: "कुल छात्र",
        icon: "bi-people",
        bg: "bg-success"
      },
      {
        value: stats.totalCourses,
        labelEn: "Total Courses",
        labelHi: "कुल पाठ्यक्रम",
        icon: "bi-journal-bookmark",
        bg: "bg-info"
      }
    ]
    : [];

  return (
    <section >
      <Container className="py-4 border my-3 rounded bg-light">

        {/* Academic Year */}
        {!loading && stats && (
          <div className="text-center mb-4">
            <h5 className="fw-bold">
              {isHindi
                ? `शैक्षणिक वर्ष: ${stats.academicYear}`
                : `Academic Year: ${stats.academicYear}`}
            </h5>
          </div>
        )}
<hr/>
        {/* Loader */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner color="primary" />
          </div>
        ) : !stats ? (
          <div className="text-center text-muted py-4">
            {isHindi ? "डेटा उपलब्ध नहीं है" : "No Data Available"}
          </div>
        ) : (
         <Row className="g-3 justify-content-center">
  {statsData.map((item, i) => {
    const colors = [
      "#4e73df", "#1cc88a", "#36b9cc",
      "#f6c23e", "#e74a3b", "#d052db",
      "#3ec4c9", "#20c997", "#fd7e14"
    ];

    return (
      <Col xl="2" lg="3" md="4" sm="6" xs="6" key={i}>
        <Card
          className="border-0 text-white"
          style={{
            borderRadius: "12px",
            backgroundColor: colors[i % colors.length],
            minHeight: "95px",
            transition: "0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
          }}
        >
          <CardBody className="p-2 d-flex flex-column justify-content-between">

            {/* ICON + LABEL */}
            <div className="d-flex align-items-center justify-content-between">
              <i className={`bi ${item.icon}`} style={{ fontSize: "25px" }} />
              <span  style={{ fontSize: "15px",}}>
                <strong>{isHindi ? item.labelHi : item.labelEn}</strong>
              </span>
            </div>

            {/* VALUE */}
            <div className="text-center">
              <h className="fw-bold mb-0" style={{ fontSize: "21px" }}>
                {item.value?.toLocaleString("en-IN") || 0}
              </h>
            </div>

          </CardBody>
        </Card>
      </Col>
    );
  })}
</Row>
        )}

      </Container>
    </section>
  );
};

export default AfterCarousel;