import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { FaMobileScreenButton, FaEnvelopesBulk, FaWhatsapp, FaHeadset } from "react-icons/fa6";

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "SMS Marketing",
      desc: "Send bulk SMS campaigns with unparalleled delivery rates. Engage customers directly on their mobile devices.",
      icon: <FaMobileScreenButton size={32} />,
      color: "#4f6ef7",
      bg: "#edf2ff",
    },
    {
      id: 2,
      title: "Email Automation",
      desc: "Create beautiful, responsive emails and automate campaigns based on customer behavior to drive conversions.",
      icon: <FaEnvelopesBulk size={32} />,
      color: "#00c5eb",
      bg: "#ecfeff",
    },
    {
      id: 3,
      title: "WhatsApp Business",
      desc: "Connect with customers on their favorite messaging app. Send notifications, alerts, and provide support.",
      icon: <FaWhatsapp size={32} />,
      color: "#20c997",
      bg: "#ecfdf5",
    },
    {
      id: 4,
      title: "BPO Calling & Support",
      desc: "Scale your customer service operations with our integrated outbound and inbound calling solutions.",
      icon: <FaHeadset size={32} />,
      color: "#fe9365",
      bg: "#fff7ed",
    }
  ];

  return (
    <section className="features-section py-5 bg-white">
      <Container className="py-4">
        <div className="text-center mb-5 pb-2 max-w-700 mx-auto" style={{ maxWidth: '700px' }}>
          <h6 className="text-primary fw-bold text-uppercase tracking-wider mb-2" style={{ letterSpacing: '1px' }}>
            Omnichannel Solutions
          </h6>
          <h2 className="display-6 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.5px' }}>
            Everything You Need to Connect
          </h2>
          <p className="text-muted fs-5">
            BeyondSend provides a comprehensive suite of tools to manage all your customer communications from a single, powerful platform.
          </p>
        </div>

        <Row className="g-4">
          {features.map((feature) => (
            <Col md={6} lg={3} key={feature.id}>
              <Card className="h-100 border-0 shadow-sm pub-card transition-all" style={{ transition: 'all 0.3s ease', borderRadius: '18px', border: '1px solid #e2e8f0' }} 
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(79, 110, 247, 0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}>
                <CardBody className="p-4 text-center">
                  <div className="icon-wrapper mx-auto mb-4 rounded-4 d-flex align-items-center justify-content-center" 
                       style={{ width: '74px', height: '74px', background: feature.bg, color: feature.color, transition: 'all 0.25s ease' }}>
                    {feature.icon}
                  </div>
                  <h5 className="fw-bold mb-3" style={{ color: 'var(--pub-default)', fontSize: '1.1rem' }}>{feature.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default FeaturesSection;
