import React from "react";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCommentSms,
  FaEnvelopeOpenText,
  FaWhatsapp,
  FaHeadset,
  FaEllipsisVertical,
  FaCheck,
  FaCheckDouble,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaServer,
} from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { isHindi } = useLanguage();

  const products = [
    {
      id: "sms",
      title: "SMS",
      desc: isHindi
        ? "कैरियर-ग्रेड विश्वसनीयता के साथ अरबों लोगों तक महत्वपूर्ण संदेश, ओटीपी और प्रचार पहुंचाएं।"
        : "Deliver critical transactional messages, alerts, and promotions to billions with carrier-grade reliability.",
      icon: <FaCommentSms />,
      link: "/services/bulk-sms-gateway",
    },
    {
      id: "rcs",
      title: "RCS",
      desc: isHindi
        ? "कैरोजल, एक्शन बटन और सत्यापित प्रेषक ब्रांडिंग के साथ समृद्ध इंटरएक्टिव संदेश।"
        : "Rich interactive messaging with carousels, action buttons, and verified sender branding.",
      icon: <FaEnvelopeOpenText />,
      link: "/services/rcs-business-messaging",
    },
    {
      id: "email",
      title: "Email",
      desc: isHindi
        ? "स्वचालित वर्कफ़्लो के साथ उच्च-डिलीवरेबिलिटी ईमेल मार्केटिंग और ट्रांजेक्शनल सूचनाएं।"
        : "High-deliverability email marketing and transactional notifications with automated workflows.",
      icon: <FaEnvelopeOpenText />,
      link: "/services/bulk-sms-gateway",
    },
    {
      id: "voice",
      title: "Voice",
      desc: isHindi
        ? "इंटरएक्टिव वॉयस रिस्पॉन्स (IVR), क्लिक-टू-कॉल और वॉयस ब्रॉडकास्ट अभियानों से जुड़ें।"
        : "Connect with interactive voice response (IVR), click-to-call, and voice broadcast campaigns.",
      icon: <FaHeadset />,
      link: "/contact-us",
    },
    {
      id: "whatsapp",
      title: "WhatsApp",
      desc: isHindi
        ? "रिच मीडिया और इंटरएक्टिव बॉट फ़्लो के साथ दुनिया के सबसे लोकप्रिय मैसेजिंग ऐप पर जुड़ें।"
        : "Engage customers on the world's most popular messaging app with rich media and interactive bot flows.",
      icon: <FaWhatsapp />,
      link: "/services/whatsapp-business-api",
    },
    {
      id: "cpaas",
      title: "Long/Toll-Free (CPaaS)",
      desc: isHindi
        ? "स्मार्ट फोन नंबर, 2-वे मैसेजिंग, मिस्ड कॉल सेवाएं और अभियान ट्रैकिंग समाधान।"
        : "Smart phone numbers, 2-way messaging, missed call services, and campaign tracking solutions.",
      icon: <FaCommentSms />,
      link: "/api",
    },
  ];

  return (
    <>
      <section className="home-hero-section">
        <Container>
          <Row className="align-items-center gy-5">
            {/* Left Content */}
            <Col lg={7} className="text-start">
              <div className="home-hero-badge">
                <span>⚡</span>
                <span>{isHindi ? "नेक्स्ट-जेन एंटरप्राइज सीपीएएस" : "Next-Gen Enterprise CPaaS"}</span>
              </div>

              <h1 className="home-hero-title">
                {isHindi ? (
                  <>
                    ग्राहक संचार को बनाएं आसान, <br />
                    <span className="home-hero-highlight">हर अनुभव को सहज।</span>
                  </>
                ) : (
                  <>
                    Transform <span className="home-hero-highlight">Customers</span><br />
                    Communication into <br />
                    <span className="home-hero-highlight">Seamless</span> Experiences
                  </>
                )}
              </h1>

              <p className="home-hero-desc">
                {isHindi
                  ? <>SMS, RCS, ईमेल, WhatsApp और वॉइस—<strong>BeyondSend के ओम्नीचैनल CPaaS प्लेटफ़ॉर्म</strong> से सभी ग्राहक संचार एक ही जगह से संभालें।</>
                  : <>Build meaningful customer journeys with <strong>BeyondSend’s omnichannel CPaaS platform</strong>, bringing SMS, RCS, email, WhatsApp, and voice together in one place.</>}
              </p>
              <p className="home-hero-desc home-hero-desc-secondary">
                {isHindi
                  ? <>ग्राहकों से जुड़ना आसान बनाएं, संचार की लागत घटाएं और संदेशों की डिलीवरी पर भरोसा रखें—<strong>सहज बातचीत, भरोसेमंद डिलीवरी, रीयल-टाइम इनसाइट्स और सुरक्षित एंटरप्राइज़ इंफ्रास्ट्रक्चर</strong> के साथ।</>
                  : <>Simplify engagement, optimize communication costs, improve delivery reliability, and build lasting trust with <strong>seamless communication, dependable delivery, real-time insights, and secure enterprise-grade infrastructure</strong>.</>}
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link to="/contact-us" className="home-pill-btn home-pill-btn-lg" id="hero-request-demo-btn">
                  {isHindi ? "डेमो का अनुरोध करें" : "Request a Demo"}
                </Link>
                <Link to="/about-us" className="home-pill-btn home-pill-btn-outline home-pill-btn-lg">
                  {isHindi ? "और जानें" : "Explore Platform"}
                </Link>
              </div>
            </Col>

            {/* Right Interactive Phone Mockup */}
            <Col lg={5} className="text-center position-relative">
              <div className="hero-phone-mockup-wrapper">
                {/* Radial Aura Glow */}
                <div className="hero-glow-aura" />

                {/* Dashed Orbit line SVG */}
                <svg className="hero-orbit-svg" viewBox="0 0 400 400" fill="none" aria-hidden="true">
                  <circle cx="200" cy="200" r="165" stroke="rgba(217, 154, 0, 0.28)" strokeWidth="1.5" strokeDasharray="6 8" />
                  <circle cx="365" cy="200" r="5" fill="#d99a00" opacity="0.7" />
                  <circle cx="35" cy="200" r="4" fill="#16805d" opacity="0.6" />
                </svg>

                {/* Floating Service Badges Along Orbit */}
                <div className="hero-orbit-service hero-orbit-sms" title="SMS Gateway">
                  <FaCommentSms size={13} />
                  <span>SMS</span>
                </div>
                <div className="hero-orbit-service hero-orbit-rcs" title="RCS Messaging">
                  <FaEnvelopeOpenText size={13} />
                  <span>RCS</span>
                </div>
                <div className="hero-orbit-service hero-orbit-whatsapp" title="WhatsApp Business API">
                  <FaWhatsapp size={14} />
                  <span>WhatsApp</span>
                </div>
                <div className="hero-orbit-service hero-orbit-email" title="High-Speed Email">
                  <FaEnvelope size={13} />
                  <span>Email</span>
                </div>
                <div className="hero-orbit-service hero-orbit-voice" title="Voice & IVR">
                  <FaHeadset size={13} />
                  <span>Voice</span>
                </div>
                <div className="hero-orbit-service hero-orbit-cpaas" title="CPaaS API Platform">
                  <FaServer size={13} />
                  <span>CPaaS</span>
                </div>

                {/* Floating Card: Delivery Update (Top Right) */}
                <div className="hero-float-card hero-float-top shadow-sm">
                  <div className="hero-fc-title">
                    <span>Delivery Update</span>
                    <span className="hero-fc-time">2:15 PM</span>
                  </div>
                  <p className="hero-fc-desc">Your package will arrive</p>
                  <div className="d-flex align-items-center justify-content-end mt-1">
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{ width: 17, height: 17, fontSize: 9, background: "#16805d" }}
                    >
                      <FaCheck />
                    </div>
                  </div>
                </div>

                {/* Floating Card: Verification Code (Mid Left) */}
                <div className="hero-float-card hero-float-mid shadow-sm">
                  <div className="hero-fc-title">
                    <span>Verification Code</span>
                    <span className="hero-fc-time">10:23 AM</span>
                  </div>
                  <p className="hero-fc-desc mb-1">
                    Your OTP is <strong style={{ color: "#191919" }}>492018</strong>
                  </p>
                  <small className="text-muted" style={{ fontSize: "0.68rem" }}>
                    Valid for 10 mins.
                  </small>
                </div>

                {/* Floating Card: Morning Offers (Bottom Left) */}
                <div className="hero-float-card hero-float-bottom shadow-sm">
                  <div className="hero-fc-title" style={{ color: "#ea580c" }}>
                    <span>Morning Offers</span>
                    <span className="hero-fc-time">8:00 AM</span>
                  </div>
                  <p className="hero-fc-desc">Flat 20% off on all combos.</p>
                </div>

                {/* Smartphone Chassis */}
                <div className="hero-phone-chassis">
                  <div className="hero-phone-notch" />
                  <div className="hero-phone-inner">
                    {/* Header Inside Screen */}
                    <div className="hero-phone-appbar">
                      <span className="text-dark" style={{ fontSize: 12 }}>
                        <FaArrowLeft />
                      </span>
                      <div className="hero-phone-sender">
                        <div className="hero-sender-avatar" style={{ background: "rgba(245, 189, 31, 0.16)", color: "#805c00" }}>
                          <FaUser size={11} />
                        </div>
                        <span className="hero-sender-title">SMS-BeyondSend</span>
                      </div>
                      <span className="text-secondary" style={{ fontSize: 12 }}>
                        <FaEllipsisVertical />
                      </span>
                    </div>

                    {/* Messages Stack */}
                    <div className="hero-phone-messages">
                      {/* Message 1 */}
                      <div className="hero-msg-card">
                        <div className="hero-msg-tag">Order Dispatched</div>
                        <div className="hero-msg-body">
                          Your order #3XX1 has been shipped.
                        </div>
                        <span className="hero-msg-link">Track here: businessupdate.com</span>
                        <div className="hero-msg-time">
                          <FaCheckDouble size={10} className="text-primary" /> 9:35 AM
                        </div>
                      </div>

                      {/* Message 2 */}
                      <div className="hero-msg-card">
                        <div className="hero-msg-tag">Order Delivered</div>
                        <div className="hero-msg-body">
                          Your order #3XX1 has been Delivered.
                        </div>
                        <span className="hero-msg-link">Track here: businessupdate.com</span>
                        <div className="hero-msg-time">
                          <FaCheckDouble size={10} className="text-primary" /> 9:35 AM
                        </div>
                      </div>

                      {/* Message 3 */}
                      <div className="hero-msg-card">
                        <div className="hero-msg-tag">Feedback</div>
                        <div className="hero-msg-body">
                          Share feedback on your delivered product.
                        </div>
                        <div className="hero-msg-time">
                          <FaCheckDouble size={10} className="text-primary" /> 9:36 AM
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Pill Badge: 99.99% Delivery */}
                <div className="hero-delivery-pill" style={{ borderColor: "rgba(170, 120, 0, 0.25)", color: "#705000" }}>
                  <FaCheck size={12} />
                  <span>99.99% Delivery</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Floating OUR SERVICES  Section Box */}
      <section className="home-products-wrapper">
        <Container>
          <div className="home-products-box">
            <h2 className="home-products-title">OUR SERVICES </h2>
            <hr/>
            <Row className="g-4">
              {products.map((p) => (
                <Col md={6} lg={6} key={p.id}>
                  <Link to={p.link} className="home-product-card">
                    <div className="home-prod-icon">{p.icon}</div>
                    <div className="home-prod-info">
                      <h5>{p.title}</h5>
                      <p>{p.desc}</p>
                    </div>
                    <div className="home-prod-arrow">
                      <FaChevronRight size={13} />
                    </div>
                  </Link>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

export default HeroSection;
