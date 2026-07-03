import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, CardBody, Spinner } from "reactstrap";
import {
  FaUserGraduate,
  FaMoneyBillWave,
  FaBook,
  FaClipboardList,
  FaBookReader,
  FaExclamationCircle,
} from "react-icons/fa";

// Added a unique color theme (hex and light background) for each item to make it vibrant
const QUICK_LINKS = [
  { id: 1, titleEn: "Admissions", titleHi: "प्रवेश", link: "/admissions", Icon: FaUserGraduate, color: "#6366f1", bg: "#e0e7ff" },
  { id: 2, titleEn: "Scholarships", titleHi: "छात्रवृत्ति", link: "/schemes/scholarship", Icon: FaMoneyBillWave, color: "#10b981", bg: "#d1fae5" },
  { id: 3, titleEn: "Syllabus", titleHi: "पाठ्यक्रम", link: "/academics/syllabus", Icon: FaBook, color: "#f59e0b", bg: "#fef3c7" },
  { id: 4, titleEn: "Examinations", titleHi: "परीक्षाएं", link: "/academics/examinations", Icon: FaClipboardList, color: "#ef4444", bg: "#fee2e2" },
  { id: 5, titleEn: "E-Library", titleHi: "ई-पुस्तकालय", link: "/resources/e-library", Icon: FaBookReader, color: "#3b82f6", bg: "#dbeafe" },
  { id: 6, titleEn: "Grievances", titleHi: "शिकायतें", link: "/services/grievances", Icon: FaExclamationCircle, color: "#ec4899", bg: "#fce7f3" },
];

const QuickAccess = ({ isHindi }) => {
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: "200px" }}>
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <section className="">
      <Container >
        
        {/* Header Section */}
        <div className="bg-light p-1 border-1  border-dark mb-4">
          <h2 className="fw-bold mb-2 text-dark" style={{ fontSize: "28px", letterSpacing: "-0.5px" }}>
            {isHindi ? "त्वरित लिंक" : "Quick Access"}
          </h2>
          {/* Fixed the underline: made it a colorful gradient instead of invisible white */}
          <div
            className=""
            style={{
              width: "60px",
              height: "4px",
              background: "linear-gradient(90deg, #3b82f6, #ec4899)",
              borderRadius: "4px",
            }}
          />
        </div>

        {/* Cards Grid */}
        <Row className="g-4 justify-content-center">
          {QUICK_LINKS.map(({ id, titleEn, titleHi, link, Icon, color, bg }) => {
            const isHov = hovered === id;
            
            return (
              <Col key={id} xs={6} sm={4} md={4} lg={2}>
                <Link to={link} className="text-decoration-none">
                  <Card
                    className="border-0 h-100"
                    style={{
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      transform: isHov ? "translateY(-8px)" : "translateY(0)",
                      boxShadow: isHov ? "0 10px 25px -5px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                      borderBottom: `4px solid ${isHov ? color : "transparent"}`,
                      backgroundColor: "#ffffff"
                    }}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <CardBody className="text-center py-4 px-2 d-flex flex-column align-items-center justify-content-center">
                      
                      {/* Icon Circle */}
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "64px",
                          height: "64px",
                          transition: "all 0.3s ease",
                          background: isHov ? color : bg,
                        }}
                      >
                        <Icon
                          style={{
                            fontSize: "26px",
                            transition: "all 0.3s ease",
                            color: isHov ? "#ffffff" : color,
                          }}
                        />
                      </div>

                      {/* Primary Label */}
                      <p
                        className="mb-1 fw-bold"
                        style={{ 
                          fontSize: "15px", 
                          color: isHov ? color : "#1e293b",
                          transition: "color 0.2s ease" 
                        }}
                      >
                        {isHindi ? titleHi : titleEn}
                      </p>

                      {/* Secondary Label */}
                      <p
                        className="mb-0 fw-medium"
                        style={{ fontSize: "12px", color: "#94a3b8" }}
                      >
                        {isHindi ? titleEn : titleHi}
                      </p>
                      
                    </CardBody>
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default QuickAccess;