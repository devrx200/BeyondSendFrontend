import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Badge,
} from "reactstrap";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const ServerDown = ({ onRetry, retrying }) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-vh-100 d-flex align-items-center py-3 py-md-5 px-2"
      style={{
        backgroundImage: "url('/hesite/page-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#eef4fa",
      }}
    >
      <Container fluid="sm">
        <Row className="justify-content-center">
          <Col xs={12} lg={8} md={10}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
              <CardHeader
                className="text-white border-0 p-3 p-md-4"
                style={{
                  background:
                    "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)",
                }}
              >
                <Row className="align-items-center g-3">
                  <Col xs={12} md={7}>
                    <div className="d-flex align-items-center gap-2 gap-md-3 flex-wrap">
                      <img
                        src="/hesite/Chhattisgarh.svg"
                        alt="Chhattisgarh"
                        style={{ height: "44px", width: "auto" }}
                        className="flex-shrink-0"
                      />
                      <div>
                        <h5 className="mb-1 fw-bold text-white fs-6 fs-md-5">
                          Department of Higher Education
                        </h5>
                        <p className="mb-0 text-white-50 small">
                          Government of Chhattisgarh · उच्च शिक्षा विभाग
                        </p>
                      </div>
                    </div>
                  </Col>

                  <Col
                    xs={12}
                    md={5}
                    className="d-flex justify-content-center justify-content-md-end gap-3"
                  >
                    <img
                      src="/hesite/Digital_India_logo.svg"
                      alt="Digital India"
                      className="bg-white p-1 rounded"
                      style={{ height: "32px", width: "auto" }}
                    />
                    <img
                      src="/hesite/Emblem_of_India.svg"
                      alt="India Emblem"
                      className="bg-white p-1 rounded"
                      style={{ height: "50px", width: "auto" }}
                    />
                  </Col>
                </Row>
              </CardHeader>

              <CardBody className=" text-center bg-white">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 mb-md-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(220,53,69,.12)",
                    color: "#dc3545",
                    fontSize: "36px",
                  }}
                >
                  <FaExclamationTriangle />
                </div>

                <Badge
                  color="danger"
                  pill
                  className="px-3 py-2 mb-3"
                  style={{ fontSize: ".7rem", letterSpacing: ".8px" }}
                >
                  SERVER UNAVAILABLE
                </Badge>

                <h3 className="fw-bold mb-3 fs-4 fs-md-3">
                  We&apos;ll be back shortly{dots}
                </h3>

                <p className="text-muted mx-auto mb-4 small">
                  Our servers are currently unavailable or undergoing
                  scheduled maintenance. We apologise for the inconvenience.
                  Services will be restored as soon as possible.
                </p>

                <hr className="my-4" />

                <Row className="g-3 text-start mb-4">
                  <Col xs={12} md={6}>
                    <div className="bg-light border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-start gap-2">
                        <FaPhone
                          className="flex-shrink-0 mt-1"
                          style={{ color: "#0056b3", fontSize: "18px" }}
                        />
                        <div className="text-truncate">
                          <div className="small text-muted">
                            Helpline Number
                          </div>
                          <strong className="small small-md">
                            +91-771-2221234
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} md={6}>
                    <div className="bg-light border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-start gap-2">
                        <FaEnvelope
                          className="flex-shrink-0 mt-1"
                          style={{ color: "#0056b3", fontSize: "18px" }}
                        />
                        <div className="text-truncate w-100">
                          <div className="small text-muted">
                            Support Email
                          </div>
                          <strong className="small d-block text-truncate">
                            wim.higheredu-cg@gov.in
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12}>
                    <div className="bg-light border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-start gap-2">
                        <FaGlobe
                          className="flex-shrink-0 mt-1"
                          style={{ color: "#0056b3", fontSize: "18px" }}
                        />
                        <div className="text-truncate w-100">
                          <div className="small text-muted">
                            Official Website
                          </div>
                          <a
                            href="https://highereducation.cg.gov.in"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fw-semibold text-decoration-none small d-block text-truncate"
                          >
                            https://highereducation.cg.gov.in
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
                  <Button
                    color="primary"
                    size="lg"
                    className="rounded-3 fw-semibold px-4 w-100 w-sm-auto"
                    style={{ minWidth: "220px" }}
                    onClick={onRetry}
                    disabled={retrying}
                  >
                    {retrying ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <FaSyncAlt className="me-2" />
                        Retry Connection
                      </>
                    )}
                  </Button>
                </div>

                <hr  />

                <img
                  src="/hesite/nic-logo.jpg"
                  alt="National Informatics Centre"
                  style={{ height: "30px", width: "auto" }}
                />

                <hr  />

                <div className="d-flex align-items-center justify-content-center gap-2">
                  <span className="text-dark fw-bold small">
                    Managed by National Informatics Centre (NIC)
                  </span>
                </div>
              </CardBody>
            </Card>

            <div className="text-center mt-4 small text-muted px-2">
              © {new Date().getFullYear()} Department of Higher Education,
              Government of Chhattisgarh. All Rights Reserved.
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServerDown;