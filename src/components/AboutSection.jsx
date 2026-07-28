import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, CardBody } from "reactstrap";
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
            <Col lg="8" md="12">
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
            <Col lg="4" md="12" className="mt-4 mt-lg-0">

              {profiles.map((profile) => (
                <Card
                  key={profile._id}
                  className="mb-3 shadow-sm border-0"
                  style={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    borderLeft: "5px solid #0d6efd",
                    background: "#ffffff",
                  }}
                >
                  <CardBody className="py-3 px-3">
                    <div className="d-flex align-items-center">

                      {/* Profile Image */}
                      <div
                        style={{
                          width: "110px",
                          height: "110px",
                          flexShrink: 0,
                          marginRight: "18px",
                        }}
                      >
                        <img
                          title={profile.aboutContentEng}
                          src={
                            profile.profileUrl
                              ? `${API_URL}${profile.profileUrl}`
                              : "/placeholder.png"
                          }
                          alt={profile.imgNameEng}
                          style={{
                            width: "110px",
                            height: "110px",
                            borderRadius: "10px",
                            // objectFit: "cover",
                            border: "3px solid #39b5fd62",
                            background: "#fff",
                            padding: "2px",
                          }}
                        />
                      </div>
                      {/* Details */}
                      <div className="flex-grow-1">
                        <h5
                          className="fw-bold mb-"
                          style={{
                            color: "#0B3D91",
                            fontSize: "1.2rem",
                          }}
                        >
                          {isHindi ? profile.imgNameHin : profile.imgNameEng}
                        </h5>

                        <div
                          className="d-inline-block"
                          style={{
                            color: "#14083f",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          {isHindi
                            ? profile.designationHin
                            : profile.designationEng}
                        </div>
                      </div>
                    </div>
                  </CardBody>
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