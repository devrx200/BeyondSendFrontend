import { useState, useEffect } from "react";
import { Container, Row, Col, Button } from "reactstrap";
import {
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaSyncAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

const ServerDown = ({ onRetry }) => {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {`
          .server-down-page{
            min-height:100vh;
            background:linear-gradient(135deg,#f4f7fb 0%,#eef4fa 100%);
          }

          .server-down-topbar{
            height:6px;
            background:linear-gradient(90deg,#ff9933,#ffffff,#138808);
          }

          .server-down-card{
            background:#fff;
            border:none;
            border-radius:24px;
            overflow:hidden;
            box-shadow:0 15px 45px rgba(0,0,0,.12);
          }

          .server-down-header{
            background:linear-gradient(135deg,#003366,#0058b5);
            padding:18px 24px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:20px;
          }

          .header-left{
            display:flex;
            align-items:center;
            gap:15px;
          }

          .header-logo{
            height:60px;
            width:auto;
          }

          .header-right{
            display:flex;
            align-items:center;
            gap:18px;
          }

          .india-logo{
            height:65px;
            width:auto;
          }

          .digital-logo{
            height:42px;
            width:auto;
          }

          .server-down-body{
            background:#fff;
          }

          .server-down-icon{
            width:100px;
            height:100px;
            margin:auto;
            border-radius:50%;
            background:rgba(220,53,69,.12);
            color:#dc3545;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:46px;
          }

          .info-card{
            background:#f8fafc;
            border:1px solid #e9ecef;
            border-radius:12px;
            padding:14px;
            height:100%;
          }

          .server-down-info-icon{
            color:#0056b3;
            font-size:18px;
            margin-top:2px;
            flex-shrink:0;
          }

          .retry-btn{
            min-width:220px;
            border-radius:10px;
            font-weight:600;
          }

          .maintenance-badge{
            font-size:.75rem;
            letter-spacing:.8px;
          }

          .footer-note{
            font-size:13px;
          }

          @media (max-width:768px){

            .server-down-header{
              flex-direction:column;
              text-align:center;
            }

            .header-left{
              flex-direction:column;
            }

            .header-right{
              justify-content:center;
            }

            .header-logo{
              height:55px;
            }

            .india-logo{
              height:55px;
            }

            .digital-logo{
              height:34px;
            }
          }
        `}
      </style>

      <div className="server-down-page">
        <div className="server-down-topbar"></div>

        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8} md={10}>
              <div className="server-down-card">
                {/* Header */}
                <div className="server-down-header">
                  <div className="header-left">
                    <img
                      src="/Chhattisgarh.svg"
                      alt="Chhattisgarh"
                      className="header-logo"
                    />

                    <div>
                      <h5 className="mb-1 fw-bold text-white">
                        Department of Higher Education
                      </h5>

                      <p className="mb-0 text-white-50 small">
                        Government of Chhattisgarh · उच्च शिक्षा विभाग
                      </p>
                    </div>
                  </div>

                  <div className="header-right">
                    <img
                      src="/Emblem_of_India.svg"
                      alt="India Emblem"
                      className="india-logo"
                    />

                    <img
                      src="/Digital_India_logo.svg"
                      alt="Digital India"
                      className="digital-logo"
                    />
                  </div>
                </div>

                {/* Body */}
                <div className="server-down-body p-4 p-md-5 text-center">
                  <div className="server-down-icon mb-4">
                    <FaExclamationTriangle />
                  </div>

                  <span className="badge bg-danger maintenance-badge px-3 py-2 mb-3">
                    SERVER UNAVAILABLE
                  </span>

                  <h3 className="fw-bold mb-3">
                    We&apos;ll be back shortly{dots}
                  </h3>

                  <p
                    className="text-muted mx-auto mb-4"
                    style={{ maxWidth: "650px" }}
                  >
                    Our servers are currently unavailable or undergoing
                    scheduled maintenance. We apologise for the inconvenience.
                    Services will be restored as soon as possible.
                  </p>

                  <hr className="my-4" />

                  <Row className="g-3 text-start mb-4">
                    <Col md={6}>
                      <div className="info-card">
                        <div className="d-flex align-items-start gap-2">
                          <FaPhone className="server-down-info-icon" />
                          <div>
                            <div className="small text-muted">
                              Helpline Number
                            </div>
                            <strong>+91-771-2221234</strong>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="info-card">
                        <div className="d-flex align-items-start gap-2">
                          <FaEnvelope className="server-down-info-icon" />
                          <div>
                            <div className="small text-muted">
                              Support Email
                            </div>
                            <strong>
                              wim.higheredu-cg@gov.in
                            </strong>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col md={12}>
                      <div className="info-card">
                        <div className="d-flex align-items-start gap-2">
                          <FaGlobe className="server-down-info-icon" />
                          <div>
                            <div className="small text-muted">
                              Official Website
                            </div>

                            <a
                              href="https://highereducation.cg.gov.in"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fw-semibold text-decoration-none"
                            >
                              https://highereducation.cg.gov.in
                            </a>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
                    <Button
                      color="primary"
                      size="lg"
                      className="retry-btn"
                      onClick={onRetry}
                    >
                      <FaSyncAlt className="me-2" />
                      Retry Connection
                    </Button>

                    <span className="text-muted small">
                      Managed by National Informatics Centre (NIC)
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 footer-note text-muted">
                © {new Date().getFullYear()} Department of Higher Education,
                Government of Chhattisgarh. All Rights Reserved.
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default ServerDown;