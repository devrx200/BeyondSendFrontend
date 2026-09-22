import { Container, Row, Col, Card, CardBody } from "reactstrap";
import { FaMobileScreenButton, FaEnvelopesBulk, FaWhatsapp, FaHeadset } from "react-icons/fa6";

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      title: "SMS Marketing",
      desc: "Send bulk SMS campaigns with unparalleled delivery rates. Engage customers directly on their mobile devices.",
      icon: <FaMobileScreenButton size={32} />,
      color: "var(--pub-primary)"
    },
    {
      id: 2,
      title: "Email Automation",
      desc: "Create beautiful, responsive emails and automate campaigns based on customer behavior to drive conversions.",
      icon: <FaEnvelopesBulk size={32} />,
      color: "var(--pub-cyan-500)"
    },
    {
      id: 3,
      title: "WhatsApp Business",
      desc: "Connect with customers on their favorite messaging app. Send notifications, alerts, and provide support.",
      icon: <FaWhatsapp size={32} />,
      color: "var(--pub-emerald-500)"
    },
    {
      id: 4,
      title: "BPO Calling & Support",
      desc: "Scale your customer service operations with our integrated outbound and inbound calling solutions.",
      icon: <FaHeadset size={32} />,
      color: "var(--pub-amber-600)"
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
              <Card className="h-100 border-0 shadow-sm pub-card transition-all" style={{ transition: 'transform 0.3s' }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <CardBody className="p-4 text-center">
                  <div className="icon-wrapper mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '80px', height: '80px', background: `${feature.color}15`, color: feature.color }}>
                    {feature.icon}
                  </div>
                  <h5 className="fw-bold mb-3">{feature.title}</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
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
