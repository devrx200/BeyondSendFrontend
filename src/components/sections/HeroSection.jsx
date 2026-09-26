import { Container, Row, Col, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCommentSms, FaEnvelopeOpenText } from "react-icons/fa6";

const HeroSection = () => {
  return (
    <section className="hero-section py-5 position-relative overflow-hidden" style={{ background: 'var(--pub-surface)' }}>
      <div className="position-absolute top-0 end-0 rounded-circle opacity-25" style={{ width: '40vw', height: '40vw', background: 'radial-gradient(circle, var(--pub-primary-pale) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }}></div>
      <Container className="py-5 position-relative z-1">
        <Row className="align-items-center gx-5">
          <Col lg={6} className="mb-5 mb-lg-0">
            <div className="badge rounded-pill mb-3 px-3 py-2" style={{ background: 'var(--pub-primary-pale)', color: 'var(--pub-primary-dark)', fontWeight: 600 }}>
              🚀 Next-Gen Communication Platform
            </div>
            <h1 className="display-4 fw-bolder mb-4 text-dark lh-sm" style={{ letterSpacing: '-1px' }}>
              Engage Your Customers Like Never Before
            </h1>
            <p className="lead mb-4 text-secondary" style={{ fontSize: '1.15rem', lineHeight: '1.6' }}>
              BeyondSend is a powerful omnichannel communication platform. Reach your audience instantly via SMS, Email, Voice, and WhatsApp with unparalleled precision and high delivery rates.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Button color="primary" size="lg" className="rounded-pill px-4 fw-bold shadow-sm d-flex align-items-center gap-2" tag={Link} to="/contact-us">
                Start Free Trial <FaArrowRight />
              </Button>
              <Button outline color="primary" size="lg" className="rounded-pill px-4 fw-bold" tag={Link} to="/about-us">
                Explore Features
              </Button>
            </div>
            <div className="d-flex align-items-center gap-4 mt-5 pt-3 border-top border-light">
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle p-2 bg-white shadow-sm d-flex align-items-center justify-content-center text-primary" style={{ width: 42, height: 42 }}>
                  <FaCommentSms size={18} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">99.9%</h6>
                  <small className="text-muted">SMS Delivery</small>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="rounded-circle p-2 bg-white shadow-sm d-flex align-items-center justify-content-center text-primary" style={{ width: 42, height: 42 }}>
                  <FaEnvelopeOpenText size={18} />
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">10M+</h6>
                  <small className="text-muted">Emails Daily</small>
                </div>
              </div>
            </div>
          </Col>
          <Col lg={6} className="text-center">
            {/* Using a placeholder visual since we don't have a specific hero image */}
            <div className="position-relative">
              <div className="rounded-4 overflow-hidden shadow-lg border" style={{ borderColor: 'var(--pub-border)' }}>
                <div className="bg-light p-3 border-bottom d-flex align-items-center gap-2">
                  <div className="rounded-circle bg-danger" style={{width: 12, height: 12}}></div>
                  <div className="rounded-circle bg-warning" style={{width: 12, height: 12}}></div>
                  <div className="rounded-circle bg-success" style={{width: 12, height: 12}}></div>
                </div>
                <div className="bg-white p-4 text-start" style={{ minHeight: '350px' }}>
                  <div className="mb-4">
                    <h5 className="fw-bold mb-3">Campaign Analytics</h5>
                    <div className="d-flex align-items-end gap-2" style={{ height: '120px' }}>
                      <div className="bg-primary rounded-top w-25" style={{ height: '60%', opacity: 0.8 }}></div>
                      <div className="bg-primary rounded-top w-25" style={{ height: '40%', opacity: 0.6 }}></div>
                      <div className="bg-primary rounded-top w-25" style={{ height: '90%' }}></div>
                      <div className="bg-primary rounded-top w-25" style={{ height: '75%', opacity: 0.9 }}></div>
                    </div>
                  </div>
                  <div className="border-top pt-3">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">Open Rate</span>
                      <span className="fw-bold text-success">+ 24.5%</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: '68%' }} aria-valuenow="68" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating element */}
              <div className="position-absolute bg-white p-3 rounded-3 shadow-sm border" style={{ bottom: -20, left: -20, zIndex: 2, borderColor: 'var(--pub-border)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    ✓
                  </div>
                  <div className="text-start">
                    <h6 className="mb-0 fw-bold">Campaign Sent</h6>
                    <small className="text-muted">To 50,000+ contacts</small>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
