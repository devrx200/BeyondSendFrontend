import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card } from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";

const AboutSection = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [profiles, setProfiles] = useState([]);
  const [aboutDepartment, setAboutDepartment] = useState({});
  const [loading, setLoading] = useState(false);
  const { isHindi } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/get-about-sections`);

        const filteredAndSorted = (res.data?.departmentLeaderProfiles || [])
          .filter(item => item.isActive === true)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setProfiles(filteredAndSorted);
        setAboutDepartment(res.data?.aboutDepartment || {});
      } catch (err) {
        console.error("Failed to fetch about section data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Container fluid className="my-0">
      <section>
        <Container className="py-3 bg-white rounded">
          <Row className="align-items-start">

            {/* ================= LEFT CONTENT ================= */}
            <Col lg="9" md="12">
              <h4 className="mb-3 text-dark fw-bold">
                {(isHindi ? aboutDepartment.titleHin : aboutDepartment.titleEng) ||
                  (isHindi ? "हमारे विभाग के बारे में" : "About Department")}
              </h4>

              {(isHindi
                ? aboutDepartment.descriptionHin
                : aboutDepartment.descriptionEng
              )
                ?.split("\n")
                .filter(line => line.trim() !== "")
                .map((text, i) => (
                  <p
                    key={i}
                    className="text-secondary mb-2"
                    style={{ textAlign: "justify", fontSize: "0.95rem" }}
                  >
                    {text}
                  </p>
                ))}

              <Button
                tag={Link}
                to="/about"
                className="mt-2 px-4"
                style={{
                  backgroundColor: "#f4b400",
                  border: "1px solid #c49000",
                  color: "#000",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                }}
              >
                {isHindi ? "और पढ़ें" : "Read More"}
              </Button>
            </Col>

            {/* ================= RIGHT PROFILE LIST ================= */}
            <Col lg="3" md="12" className="mt-4 mt-lg-0">

              {profiles.map((profile) => (
                <Card
                  key={profile._id}
                  className="mb-3 p-3 shadow-sm"
                  style={{
                    borderRadius: "10px",
                    background: "#f4fffd",
                    border: "2px solid #d8d8d8",
                  }}
                >
                  <div className="d-flex align-items-center">

                    <img title={profile.aboutContentEng}
                      src={
                        profile.profileUrl
                          ? `${API_URL}${profile.profileUrl}`
                          : "/placeholder.png"
                      }
                      alt={profile.imgNameEng}
                      style={{
                        width: "100px",
                        height: "110px",
                        borderRadius: "30%",
                        objectFit: "cover",
                        marginRight: "15px",
                        padding: "3px",
                        border: "2px solid #18181a",
                      }}
                    />

                    <div>
                      <h6 className="m-0 text-dark fw-bold d-block" style={{ fontSize: "1.2rem" }}>
                        {isHindi ? profile.imgNameHin : profile.imgNameEng}
                      </h6>
                      <small className="text-muted fw-bold" style={{ fontSize: "0.9rem" }}>
                        {isHindi ? profile.designationHin : profile.designationEng}
                      </small>
                    </div>

                  </div>
                </Card>
              ))}

              {loading && (
                <p className="text-center text-muted">Loading...</p>
              )}

            </Col>
          </Row>
        </Container>
      </section>
    </Container>
  );
};

export default AboutSection;