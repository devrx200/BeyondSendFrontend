import React, { useState } from "react";
import { Container, Row, Col, Input, Button } from "reactstrap";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaShieldHalved,
  FaCode,
  FaServer,
  FaBolt,
  FaReceipt,
  FaPlus,
  FaMinus,
  FaCheck,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
  FaArrowRight,
  FaBuildingColumns,
  FaCartShopping,
  FaHeartPulse,
  FaTruckFast,
  FaGraduationCap,
  FaTv,
} from "react-icons/fa6";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";

const FeaturesSection = () => {
  const { isHindi } = useLanguage();
  const [activeTab, setActiveTab] = useState("finance");
  const [openFaq, setOpenFaq] = useState(0);

  // Demo form state
  const [formData, setFormData] = useState({
    firstName: "",
    workEmail: "",
    phone: "",
    company: "",
    message: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.workEmail) {
      Swal.fire({
        icon: "warning",
        title: isHindi ? "कृपया फ़ील्ड भरें" : "Required Fields Missing",
        text: isHindi
          ? "कृपया अपना नाम और कार्य ईमेल दर्ज करें।"
          : "Please enter your name and work email.",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Swal.fire({
        icon: "success",
        title: isHindi ? "अनुरोध प्राप्त हुआ!" : "Demo Requested Successfully!",
        text: isHindi
          ? "हमारी एंटरप्राइज टीम जल्द ही आपसे संपर्क करेगी।"
          : "Our enterprise CPaaS specialists will reach out shortly with your sandbox credentials.",
        confirmButtonColor: "#906600",
      });
      setFormData({
        firstName: "",
        workEmail: "",
        phone: "",
        company: "",
        message: "",
        consent: false,
      });
    }, 800);
  };

  // Why Choose Features
  const whyFeatures = [
    {
      id: 1,
      title: isHindi ? "विस्तृत एनालिटिक्स रिपोर्ट" : "Detailed Analytics Reports",
      desc: isHindi
        ? "व्यापक रिपोर्टिंग, डिलीवरी एनालिटिक्स, सीटीआर मेट्रिक्स और वास्तविक समय के इनसाइट्स।"
        : "Comprehensive reporting, delivery analytics, CTR metrics, and real-time campaign insights.",
      icon: <FaChartLine />,
    },
    {
      id: 2,
      title: isHindi ? "समर्पित खाता प्रबंधक" : "Dedicated Account Manager",
      desc: isHindi
        ? "समर्पित 24/7 तकनीकी सहायता, एसएलए मॉनिटरिंग और कस्टम एंटरप्राइज ऑनबोर्डिंग।"
        : "Dedicated 24/7 technical assistance, custom SLA monitoring, and high-touch enterprise onboarding.",
      icon: <FaShieldHalved />,
    },
    {
      id: 3,
      title: isHindi ? "आसान एकीकरण और एपीआई" : "Easy Integration & APIs",
      desc: isHindi
        ? "RESTful एपीआई, वेबहुक, बहु-भाषा एसडीके और तेजी से परिनियोजन के लिए प्लग-एंड-प्ले लाइब्रेरी।"
        : "RESTful APIs, webhooks, multi-language SDKs, and pre-built integrations for rapid deployment.",
      icon: <FaCode />,
    },
    {
      id: 4,
      title: isHindi ? "अबाध विश्वसनीयता और स्केल" : "Uninterrupted Reliability",
      desc: isHindi
        ? "कैरियर डायरेक्ट रूटिंग और स्वचालित मल्टी-ऑपरेटर फेलओवर के साथ प्रतिदिन अरबों संदेश प्रोसेस करें।"
        : "Process billions of messages daily with direct carrier routing and multi-operator zero-downtime failover.",
      icon: <FaServer />,
    },
    {
      id: 5,
      title: isHindi ? "अल्ट्रा-लो लेटेंसी" : "Ultra-Low Latency",
      desc: isHindi
        ? "इंटेलिजेंट रूट ऑप्टिमाइजेशन के साथ बैंकिंग ओटीपी और उच्च-प्राथमिकता अलर्ट के लिए सब-सेकंड डिलीवरी।"
        : "Sub-second latency for OTPs and high-priority alerts with intelligent telecom route optimization.",
      icon: <FaBolt />,
    },
    {
      id: 6,
      title: isHindi ? "पारदर्शी बिलिंग" : "Transparent Billing",
      desc: isHindi
        ? "पे-ऐज़-यू-गो, प्रतिस्पर्धी टियर मूल्य निर्धारण और बिना किसी छिपे शुल्क के विस्तृत उपयोग बिलिंग।"
        : "Pay-as-you-go, competitive tiered pricing, and detailed usage billing with zero hidden fees.",
      icon: <FaReceipt />,
    },
  ];

  // Industry vertical tabs
  const industries = [
    {
      id: "finance",
      name: isHindi ? "फाइनेंस (BFSI)" : "Finance",
      icon: <FaBuildingColumns />,
      headline: isHindi
        ? "डिजिटल युग के लिए वित्तीय बातचीत को पुनः परिभाषित करना।"
        : "Redefining Financial Interactions for the Digital Age.",
      highlight: isHindi ? "वित्तीय बातचीत" : "Financial Interactions",
      desc: isHindi
        ? "तत्काल ओटीपी और धोखाधड़ी अलर्ट वितरित करें, व्हाट्सएप के माध्यम से ऋण सत्यापन स्वचालित करें, और आरसीएस के साथ संवादी बैंकिंग सक्षम करें। बियॉन्डसेंड बैंक-ग्रेड सुरक्षा, 99.99% एसएलए विश्वसनीयता और नियामक अनुपालन प्रदान करता है।"
        : "Deliver instant OTPs and fraud alerts, automate loan verification via WhatsApp, and enable conversational banking with RCS. BeyondSend delivers bank-grade security, 99.99% SLA reliability, and regulatory compliance out of the box.",
      metrics: "99.99% OTP SLA",
      accentBadge: "RBI / TRAI Compliant",
    },
    {
      id: "ecommerce",
      name: isHindi ? "ई-कॉमर्स और यात्रा" : "Travel & E-Commerce",
      icon: <FaCartShopping />,
      headline: isHindi
        ? "आधुनिक खुदरा व्यापार के लिए ओमनीचैनल ग्राहक अनुभव।"
        : "Elevating Omnichannel Commerce Journeys.",
      highlight: isHindi ? "ग्राहक अनुभव" : "Commerce Journeys",
      desc: isHindi
        ? "व्हाट्सएप और आरसीएस पर सीधे 98% ओपन रेट के साथ बुकिंग पुष्टिकरण, कार्ट परित्याग अनुस्मारक और व्यक्तिगत प्रचार फ्लैश बिक्री भेजें। इंटरएक्टिव चेकआउट बॉट्स के साथ आरओआई बढ़ाएं।"
        : "Send booking confirmations, abandoned cart reminders, and promotional flash sales with 98% open rates directly on WhatsApp and RCS. Boost conversion with native 1-tap checkout buttons.",
      metrics: "3.2x Higher CTR",
      accentBadge: "Instant Buy Flows",
    },
    {
      id: "healthcare",
      name: isHindi ? "स्वास्थ्य सेवा" : "Healthcare",
      icon: <FaHeartPulse />,
      headline: isHindi
        ? "सुरक्षित मैसेजिंग के साथ रोगी देखभाल को सुव्यवस्थित करें।"
        : "Streamline Patient Care with Secure Messaging.",
      highlight: isHindi ? "रोगी देखभाल" : "Patient Care",
      desc: isHindi
        ? "सख्त गोपनीयता दिशानिर्देशों का पालन करते हुए तत्काल अपॉइंटमेंट रिमाइंडर, लैब रिपोर्ट डिलीवरी और 2-तरफा रोगी संचार प्रदान करें।"
        : "Provide instant appointment reminders, automated lab report dispatch, and 2-way patient verification while adhering to strict HIPAA and data privacy guidelines.",
      metrics: "45% Fewer No-Shows",
      accentBadge: "HIPAA Compliant",
    },
    {
      id: "logistics",
      name: isHindi ? "लॉजिस्टिक्स और डिलीवरी" : "Logistics",
      icon: <FaTruckFast />,
      headline: isHindi
        ? "वास्तविक समय ट्रैकिंग और अंतिम-मील डिलीवरी सूचनाएं।"
        : "Real-Time Tracking & Last-Mile Delivery Notifications.",
      highlight: isHindi ? "अंतिम-मील डिलीवरी" : "Last-Mile Delivery",
      desc: isHindi
        ? "लाइव जीपीएस ट्रैकिंग लिंक, स्वचालित डिलीवरी पुनर्निर्धारण और त्वरित ड्राइवर-ग्राहक संचार के साथ ग्राहकों को सूचित रखें।"
        : "Notify customers with live GPS tracking links, automated delivery rescheduling, and instant driver-customer 2-way communication at scale.",
      metrics: "99.8% Route Match",
      accentBadge: "Live Tracking",
    },
    {
      id: "education",
      name: isHindi ? "शिक्षा और एडटेक" : "Education",
      icon: <FaGraduationCap />,
      headline: isHindi
        ? "परिसर और छात्र संचार को सहज बनाएं।"
        : "Streamline Campus & Student Communications.",
      highlight: isHindi ? "छात्र संचार" : "Student Communications",
      desc: isHindi
        ? "सत्यापित प्रेषक आईडी के साथ प्रवेश अलर्ट, शुल्क समय सीमा अनुस्मारक, परीक्षा कार्यक्रम और अभिभावक सूचनाएं तुरंत प्रसारित करें।"
        : "Broadcast admissions alerts, fee deadline reminders, exam notifications, and parent-teacher updates instantly with verified sender IDs.",
      metrics: "100% Parent Reach",
      accentBadge: "Verified Sender",
    },
    {
      id: "media",
      name: isHindi ? "डिजिटल मीडिया" : "Digital Media",
      icon: <FaTv />,
      headline: isHindi
        ? "दर्शकों की सहभागिता और प्रतिधारण को बढ़ावा दें।"
        : "Drive Viewer Engagement & Retention at Scale.",
      highlight: isHindi ? "दर्शकों की सहभागिता" : "Viewer Engagement",
      desc: isHindi
        ? "ताज़ा समाचार अलर्ट, खेल स्कोर, सदस्यता नवीनीकरण नोटिस और इंटरैक्टिव सर्वेक्षण वितरित करें जो दर्शकों को जोड़े रखते हैं।"
        : "Deliver breaking news alerts, sports scores, subscription renewal notices, and interactive polls that keep digital audiences engaged.",
      metrics: "500k TPS Broadcast",
      accentBadge: "High-TPS Burst",
    },
  ];

  const activeIndustryData =
    industries.find((i) => i.id === activeTab) || industries[0];

  // Frequently Asked Questions
  const faqs = [
    {
      q: isHindi ? "बियॉन्डसेंड क्या है?" : "What is BeyondSend ?",
      a: isHindi
        ? "बियॉन्डसेंड एक एंटरप्राइज-ग्रेड ओमनीचैनल सीपीएएस (कम्युनिकेशंस प्लेटफॉर्म एज अ सर्विस) है, जो एकीकृत एपीआई और सहज वेब कंसोल के माध्यम से एसएमएस, आरसीएस, व्हाट्सएप, ईमेल और वॉयस पर सहज ग्राहक जुड़ाव सक्षम बनाता है।"
        : "BeyondSend is an enterprise-grade omnichannel CPaaS (Communications Platform as a Service) enabling seamless customer engagement across SMS, RCS, WhatsApp, Email, and Voice through unified APIs and an intuitive web console.",
    },
    {
      q: isHindi
        ? "मैं बियॉन्डसेंड के साथ कैसे शुरुआत करूं?"
        : "How do I get started with BeyondSend ?",
      a: isHindi
        ? "आप कुछ ही मिनटों में डेमो का अनुरोध कर सकते हैं या सैंडबॉक्स क्रेडेंशियल्स प्राप्त कर सकते हैं। हमारी टीम आपको एपीआई दस्तावेज़, डीएलटी टेम्पलेट सेटअप और परीक्षण क्रेडिट प्रदान करेगी।"
        : "You can request a demo or register for sandbox credentials. Our enterprise solutions team will assist with API access tokens, DLT template synchronization, and free testing credits.",
    },
    {
      q: isHindi
        ? "क्या बियॉन्डसेंड एंटरप्राइज-सुरक्षित और अनुपालनशील है?"
        : "Is BeyondSend enterprise-secure and compliant ?",
      a: isHindi
        ? "हां, बियॉन्डसेंड आईएसओ 27001 प्रमाणित बुनियादी ढांचे, एंड-टू-एंड एन्क्रिप्शन, 100% ट्राई डीएलटी अनुपालन और 99.99% अपटाइम एसएलए के साथ काम करता है।"
        : "Yes. BeyondSend features ISO 27001-certified infrastructure, bank-grade end-to-end encryption, 100% TRAI DLT regulatory compliance in India, and 99.99% uptime SLAs.",
    },
    {
      q: isHindi
        ? "क्या बियॉन्डसेंड आधिकारिक व्हाट्सएप बिजनेस एपीआई प्रदान करता है?"
        : "Does BeyondSend offer official WhatsApp Business API ?",
      a: isHindi
        ? "हां, हम आधिकारिक मेटा क्लाउड एपीआई पार्टनर समाधान प्रदान करते हैं जिसमें सत्यापित ग्रीन टिक, इंटरेक्टिव टेम्पलेट और उच्च-मात्रा बॉट ऑटोमेशन शामिल हैं।"
        : "Yes, we provide official Meta Cloud WhatsApp Business APIs featuring verified green badges, interactive quick-reply buttons, media catalogs, and scalable automated customer workflows.",
    },
    {
      q: isHindi
        ? "बियॉन्डसेंड ग्राहक रूपांतरण दर बढ़ाने में कैसे मदद कर सकता है?"
        : "How can BeyondSend help increase our customer conversion rate ?",
      a: isHindi
        ? "स्मार्ट ओमनीचैनल रूटिंग, सब-सेकंड ओटीपी डिलीवरी और आरसीएस एवं व्हाट्सएप पर इंटरैक्टिव एक्शन बटन के साथ व्यवसाय आमतौर पर 3x तक उच्च रूपांतरण दर प्राप्त करते हैं।"
        : "Through carrier-grade low latency, rich interactive action chips on RCS & WhatsApp, and smart fallbacks, enterprise clients consistently experience up to 3x higher conversion and response rates.",
    },
  ];

  return (
    <>
      {/* ================= 1. WHY CHOOSE BEYONDSEND ================= */}
      <section className="home-why-section" id="why-beyondsend">
        <Container>
          <div className="home-why-header">
            <h2>
              {isHindi ? "आप बियॉन्डसेंड को क्यों चुनें ?" : "Why Should You Choose BeyondSend ?"}
            </h2>
            <p>
              {isHindi
                ? "एंटरप्राइज-स्केल डिलीवरी, कैरियर-ग्रेड विश्वसनीयता और नेक्स्ट-जेन एआई इंटरैक्शन के लिए निर्मित"
                : "Built for Enterprise-Scale Delivery, Carrier-Grade Reliability, and Next-Gen AI Interactions"}
            </p>
          </div>

          <Row className="g-4">
            {whyFeatures.map((feat) => (
              <Col md={6} lg={4} key={feat.id}>
                <div className="home-why-card">
                  <div className="home-why-icon-wrap">{feat.icon}</div>
                  <h4>{feat.title}</h4>
                  <p>{feat.desc}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ================= 3. DESIGNED FOR EVERY INDUSTRY ================= */}
      <section className="home-industry-section" id="industries">
        <Container>
          <div className="home-industry-header">
            <h2>{isHindi ? "हर उद्योग के लिए डिज़ाइन किया गया" : "Designed for Every Industry"}</h2>
            <p>
              {isHindi
                ? "आपके क्षेत्र की नियामक, पैमाने और वर्कफ़्लो मांगों को पूरा करने के लिए तैयार संचार समाधान।"
                : "Tailored communication suites built to meet the regulatory, scale, and workflow demands of your vertical."}
            </p>
          </div>

          {/* Industry Tabs */}
          <div className="home-industry-tabs">
            {industries.map((ind) => (
              <button
                key={ind.id}
                className={`home-ind-tab ${activeTab === ind.id ? "active" : ""}`}
                onClick={() => setActiveTab(ind.id)}
              >
                {ind.name}
              </button>
            ))}
          </div>

          {/* Active Industry Showcase Card */}
          <div className="home-industry-card">
            <Row className="align-items-center gy-4">
              <Col lg={7}>
                <div className="badge rounded-pill px-3 py-1 mb-3" style={{ background: "#fff3c4", color: "#705000", fontWeight: 700, fontSize: "0.82rem" }}>
                  {activeIndustryData.accentBadge}
                </div>
                <h3 className="fw-bold mb-3" style={{ color: "#191919", fontSize: "1.75rem", lineHeight: 1.3 }}>
                  {activeIndustryData.headline}
                </h3>
                <p className="text-secondary mb-4" style={{ fontSize: "1.02rem", lineHeight: 1.65 }}>
                  {activeIndustryData.desc}
                </p>
                <div className="d-flex align-items-center gap-4">
                  <Link
                    to="/contact-us"
                    className="home-pill-btn d-inline-flex align-items-center gap-2"
                  >
                    <span>{isHindi ? "और जानें" : "Learn More"}</span>
                    <FaArrowRight size={12} />
                  </Link>
                  <div className="d-flex align-items-center gap-2 text-muted fw-semibold" style={{ fontSize: "0.92rem" }}>
                    <span className="text-success fw-bold">✓</span>
                    <span>{activeIndustryData.metrics}</span>
                  </div>
                </div>
              </Col>

              <Col lg={5} className="text-center">
                {/* Visual Industry Graphic Mockup */}
                <div
                  className="p-4 rounded-4 shadow-sm text-start"
                  style={{
                    background: "linear-gradient(135deg, #fffdf7 0%, #fff3c4 100%)",
                    border: "1px solid #f0dc9a",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-white shadow-sm p-2 text-primary" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {activeIndustryData.icon}
                      </div>
                      <span className="fw-bold text-dark">{activeIndustryData.name} Suite</span>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2.5 py-1">
                      Active
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-3 shadow-xs mb-2 border border-light">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Live Dispatch</span>
                      <span>99.99% SLA</span>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                      Transaction Alert & OTP Verified
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-3 shadow-xs border border-light">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Customer Journey</span>
                      <span className="text-primary fw-bold">Conversational RCS</span>
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                      1-Tap Action Prompt Sent
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      {/* ================= 4. IMPACT METRICS BAR ================= */}
      <section className="home-metrics-banner">
        <Container>
          <Row className="gy-4">
            <Col md={4}>
              <div className="home-metric-item">
                <div className="home-metric-number">230bn+</div>
                <div className="home-metric-label">
                  {isHindi ? "प्रतिवर्ष भेजे जाने वाले संदेश" : "Messages sent annually"}
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="home-metric-item">
                <div className="home-metric-number">99.9%</div>
                <div className="home-metric-label">
                  {isHindi ? "नेटवर्क डिलीवरेबिलिटी और पहुंच" : "Network Deliverability & Reach"}
                </div>
              </div>
            </Col>
            <Col md={4}>
              <div className="home-metric-item">
                <div className="home-metric-number">98%</div>
                <div className="home-metric-label">
                  {isHindi ? "ग्राहक संतुष्टि और रीड रेट" : "Customer Satisfaction & Read Rate"}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= 5. FREQUENTLY ASKED QUESTIONS ================= */}
      <section className="home-faq-section" id="faqs">
        <Container>
          <h2 className="home-faq-title">
            {isHindi ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
          </h2>

          <div className="max-w-800 mx-auto" style={{ maxWidth: 840 }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div className="home-faq-item" key={idx}>
                  <button
                    className="home-faq-question"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <span className="home-faq-icon">
                      {isOpen ? <FaMinus size={14} /> : <FaPlus size={14} />}
                    </span>
                  </button>
                  {isOpen && <div className="home-faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ================= 6. REQUEST A DEMO / CONTACT SECTION ================= */}
      <section className="home-demo-section" id="request-demo">
        <Container>
          <div className="home-demo-box">
            <Row className="gy-5">
              {/* Left Column: What to expect & Direct Contact */}
              <Col lg={5} className="pe-lg-4">
                <h3 className="fw-bold mb-4" style={{ color: "#191919", fontSize: "1.65rem" }}>
                  {isHindi ? "आप क्या उम्मीद कर सकते हैं ?" : "What to expect ?"}
                </h3>

                <div className="home-expect-check">
                  <div className="home-check-icon">
                    <FaCheck />
                  </div>
                  <p>
                    {isHindi
                      ? "आपकी टीम के लिए हमारे ओमनीचैनल सीपीएएस सूट का एक अनुकूलित वॉकथ्रू"
                      : "A tailored walkthrough of our omnichannel CPaaS suite for your team"}
                  </p>
                </div>

                <div className="home-expect-check">
                  <div className="home-check-icon">
                    <FaCheck />
                  </div>
                  <p>
                    {isHindi
                      ? "आपके मौजूदा मैसेजिंग वॉल्यूम की समीक्षा और लागत घटाने की रणनीति"
                      : "Discussion of your current messaging volumes and how to cut delivery costs"}
                  </p>
                </div>

                <div className="home-expect-check">
                  <div className="home-check-icon">
                    <FaCheck />
                  </div>
                  <p>
                    {isHindi
                      ? "हमारे एपीआई और वेब कंसोल का परीक्षण करने के लिए कस्टम सैंडबॉक्स क्रेडेंशियल्स"
                      : "Custom sandbox credentials to test our high-throughput APIs and web console"}
                  </p>
                </div>

                <hr className="my-4 text-muted opacity-25" />

                <div className="mt-3">
                  <h6 className="fw-bold text-dark mb-3">
                    {isHindi ? "संपर्क सूत्र" : "Offices & Direct Contact"}
                  </h6>
                  <div className="d-flex align-items-start gap-2 mb-2 text-secondary" style={{ fontSize: "0.9rem" }}>
                    <FaLocationDot className="text-primary mt-1 flex-shrink-0" />
                    <span>#6, 1st Main Rd, NS Palya, BTM 2nd Stage, Bengaluru, Karnataka 560076</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2 text-secondary" style={{ fontSize: "0.9rem" }}>
                    <FaPhone className="text-primary flex-shrink-0" />
                    <a href="tel:+919036880158" className="text-secondary text-decoration-none">
                      +91 90368 80158
                    </a>
                  </div>
                  <div className="d-flex align-items-center gap-2 text-secondary" style={{ fontSize: "0.9rem" }}>
                    <FaEnvelope className="text-primary flex-shrink-0" />
                    <a href="mailto:info@beyondsend.in" className="text-secondary text-decoration-none">
                      info@beyondsend.in
                    </a>
                  </div>
                </div>
              </Col>

              {/* Right Column: Demo Request Form */}
              <Col lg={7}>
                <form onSubmit={handleDemoSubmit} className="p-1">
                  <Row className="g-3">
                    <Col md={6}>
                      <label className="form-label small fw-bold text-secondary mb-1">
                        {isHindi ? "पूरा नाम *" : "First & Last Name *"}
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        placeholder="e.g. John Doe"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="py-2"
                        style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="form-label small fw-bold text-secondary mb-1">
                        {isHindi ? "कार्य ईमेल *" : "Work Email *"}
                      </label>
                      <Input
                        type="email"
                        name="workEmail"
                        placeholder="john@company.com"
                        value={formData.workEmail}
                        onChange={handleInputChange}
                        required
                        className="py-2"
                        style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="form-label small fw-bold text-secondary mb-1">
                        {isHindi ? "फ़ोन नंबर" : "Phone Number"}
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="py-2"
                        style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                      />
                    </Col>
                    <Col md={6}>
                      <label className="form-label small fw-bold text-secondary mb-1">
                        {isHindi ? "कंपनी / संगठन" : "Company / Organization"}
                      </label>
                      <Input
                        type="text"
                        name="company"
                        placeholder="e.g. Acme Corp"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="py-2"
                        style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                      />
                    </Col>
                    <Col md={12}>
                      <label className="form-label small fw-bold text-secondary mb-1">
                        {isHindi ? "आपका संदेश / आवश्यकताएं" : "Your Message / Requirements"}
                      </label>
                      <Input
                        type="textarea"
                        rows={3}
                        name="message"
                        placeholder={
                          isHindi
                            ? "अपनी अनुमानित मासिक वॉल्यूम और रुचिकर चैनलों का उल्लेख करें..."
                            : "Tell us about your estimated monthly volumes and preferred channels..."
                        }
                        value={formData.message}
                        onChange={handleInputChange}
                        style={{ borderRadius: 10, borderColor: "#cbd5e1" }}
                      />
                    </Col>
                    <Col md={12}>
                      <div className="form-check">
                        <Input
                          type="checkbox"
                          name="consent"
                          id="demo-consent-check"
                          checked={formData.consent}
                          onChange={handleInputChange}
                          className="form-check-input"
                        />
                        <label htmlFor="demo-consent-check" className="form-check-label text-muted small">
                          {isHindi
                            ? "मैं सहमत हूं कि बियॉन्डसेंड टीम उत्पाद अपडेट और डेमो समन्वय के लिए मुझसे संपर्क कर सकती है।"
                            : "I agree to receive communications from BeyondSend regarding this demo and product capabilities."}
                        </label>
                      </div>
                    </Col>
                    <Col md={12} className="mt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="home-pill-btn w-100 py-3 fw-bold"
                      >
                        {submitting
                          ? isHindi
                            ? "अनुरोध भेजा जा रहा है..."
                            : "Submitting..."
                          : isHindi
                          ? "डेमो का अनुरोध करें"
                          : "Request a Demo"}
                      </button>
                    </Col>
                  </Row>
                </form>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </>
  );
};

export default FeaturesSection;
