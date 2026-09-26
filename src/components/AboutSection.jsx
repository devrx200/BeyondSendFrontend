import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, CardBody, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";
import apiClient, { BASE_HOST } from "../services/api.service";
import {
  FaArrowRight, FaPaperPlane, FaBullhorn, FaChartLine, FaHeadset,
  FaLandmark, FaUserTie, FaChevronRight
} from "react-icons/fa";

const AboutSection = () => {
  const [profiles, setProfiles] = useState([]);
  const [aboutDepartment, setAboutDepartment] = useState({});
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isHindi } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/about-sections/list');
        const data = res?.data || res || {};

        const filteredAndSorted = (data?.departmentLeaderProfiles || [])
          .filter(item => item.isActive === true && item.isHideOnAboutSection !== true)
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setProfiles(filteredAndSorted);
        setAboutDepartment(data?.aboutDepartment || {});
      } catch (err) {
        console.error("Failed to fetch about section data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isLegacyData = (text = "") => {
    return /higher education|chhattisgarh|universities|colleges|उच्च शिक्षा|विभाग/i.test(text);
  };

  const dbTitle = isHindi ? aboutDepartment.titleHin : aboutDepartment.titleEng;
  const sectionTitle = (!dbTitle || isLegacyData(dbTitle))
    ? (isHindi ? "बियॉन्डसेंड के बारे में" : "About BeyondSend")
    : dbTitle;

  const rawDescription = isHindi
    ? (aboutDepartment.descriptionHin || "")
    : (aboutDepartment.descriptionEng || "");

  const cleanDescription = rawDescription
    .replace(/\._/g, ". ")
    .replace(/_/g, " ");

  const defaultDescriptionParagraphs = isHindi
    ? [
        "बियॉन्डसेंड एक आधुनिक एंटरप्राइज टेलीकॉम, ग्राहक संचार एवं ओमनीचैनल मार्केटिंग ऑटोमेशन प्लेटफॉर्म है। यह व्यवसायों को एसएमएस, ईमेल, आधिकारिक व्हाट्सएप बिजनेस और वॉयस बीपीओ के माध्यम से लाखों ग्राहकों से त्वरित व सुरक्षित रूप से जुड़ने की सुविधा देता है।",
        "उद्योग-अग्रणी 99.9% डिलीवरी दर, रियल-टाइम एनालिटिक्स और शक्तिशाली एपीआई के साथ, बियॉन्डसेंड आपके व्यावसायिक संचार को एकीकृत और परिणाम-उन्मुख बनाता है।"
      ]
    : [
        "BeyondSend is an advanced enterprise customer communication and omnichannel marketing automation platform. Built for telecommunications-grade scalability, BeyondSend empowers businesses to deliver personalized SMS campaigns, automated email marketing, WhatsApp Business messaging, and AI-enabled voice support from a single unified console.",
        "With industry-leading 99.9% delivery reliability, live analytics, and developer-friendly APIs, organizations scale their customer outreach and transactional notifications seamlessly."
      ];

  const descriptionParagraphs = (isLegacyData(cleanDescription) || !cleanDescription.trim())
    ? defaultDescriptionParagraphs
    : cleanDescription.split("\n").map(line => line.trim()).filter(Boolean);

  return (
    <Container fluid className="px-0 py-2 py-md-3">
      <section>
        <Container>
          <Card className="about-main-card border-0">
            <CardBody className="p-3 p-md-4">
              <Row className="gy-3 align-items-start">

                {/* ================= LEFT CONTENT ================= */}
                <Col lg="7" xl="7" md="12">
                  <div className="pe-lg-2">
                    {/* Top Platform Badge */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-inline-flex align-items-center gap-1.5 rounded-pill fw-bold"
                        style={{
                          background: "var(--pub-primary-50)",
                          color: "var(--pub-primary)",
                          border: "1px solid var(--pub-primary-100)",
                          fontSize: "12px",
                          letterSpacing: "0.3px",
                          padding: "5px 14px"
                        }}
                      >
                        <FaPaperPlane className="me-1 text-primary" size={12} />
                        {isHindi ? "बियॉन्डसेंड ओमनीचैनल प्लेटफॉर्म" : "BeyondSend Omnichannel Platform"}
                      </span>
                    </div>

                    {/* Section Title */}
                    <h2 className="about-heading-accent mb-3 fs-4">
                      {sectionTitle}
                    </h2>

                    {/* Paragraph Text */}
                    <div className="about-text-content my-2">
                      {descriptionParagraphs.map((text, i) => (
                        <p
                          key={i}
                          className="mb-2"
                          style={{
                            textAlign: "justify",
                            fontSize: "14.5px",
                            lineHeight: 1.7,
                            color: "#334155"
                          }}
                        >
                          {text}
                        </p>
                      ))}
                    </div>

                    {/* Quick Stats Highlights */}
                    <div className="row g-2 my-2">
                      <div className="col-6 col-sm-3">
                        <div className="stat-chip">
                          <div style={{ color: "var(--pub-primary)" }}>
                            <FaPaperPlane size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>Multi</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "चैनल" : "Channel"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div className="stat-chip">
                          <div style={{ color: "var(--pub-warning)" }}>
                            <FaBullhorn size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>Smart</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "कैंपेन" : "Campaigns"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div style={{ color: "var(--pub-accent)" }} className="stat-chip">
                          <FaChartLine size={16} />
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>Live</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "एनालिटिक्स" : "Analytics"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div style={{ color: "var(--pub-success)" }} className="stat-chip">
                          <FaHeadset size={16} />
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>24×7</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "सहायता" : "Support"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="mt-3">
                      <Button
                        tag={Link}
                        to="/about-us"
                        className="rounded-pill px-4 py-2 fw-semibold shadow-sm d-inline-flex align-items-center gap-2 border-0"
                        style={{
                          background: "linear-gradient(135deg, var(--pub-primary) 0%, var(--pub-primary-hover) 100%)",
                          color: "#ffffff",
                          fontSize: "13.5px",
                          boxShadow: "0 4px 14px rgba(79, 110, 247, 0.28)",
                          transition: "all 0.25s ease"
                        }}
                      >
                        {isHindi ? "और जानें" : "Explore Platform"}
                        <FaArrowRight size={11} />
                      </Button>
                    </div>
                  </div>
                </Col>

                {/* ================= RIGHT LEADERSHIP PANEL ================= */}
                <Col lg="5" xl="5" md="12">
                  <div className="leadership-box">
                    <div className="leadership-header d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{ width: 28, height: 28, background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}
                        >
                          <FaUserTie size={12} />
                        </div>
                        <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: "0.98rem" }}>
                          {isHindi ? "नेतृत्व" : "Leadership"}
                        </h4>
                      </div>
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        {isHindi ? "विवरण हेतु क्लिक करें" : "Click to view details"}
                      </small>
                    </div>

                    {/* Dignitary Profile Cards (Interactive) */}
                    <div className="d-flex flex-column gap-2">
                      {profiles.map((profile) => {
                        const name = isHindi ? profile.imgNameHin || profile.imgNameEng : profile.imgNameEng || profile.imgNameHin;
                        const designation = isHindi ? profile.designationHin || profile.designationEng : profile.designationEng || profile.designationHin;
                        const avatarUrl = profile.profileUrl
                          ? (profile.profileUrl.startsWith("http") ? profile.profileUrl : `${BASE_HOST}${profile.profileUrl.startsWith("/") ? "" : "/"}${profile.profileUrl}`)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Leader")}&background=0c3c78&color=fff&bold=true`;

                        return (
                          <div
                            key={profile._id}
                            className="leader-card-pro"
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedLeader(profile)}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedLeader(profile); }}
                            title={isHindi ? `${name} का विवरण देखें` : `View details for ${name}`}
                          >
                            <div className="d-flex align-items-center justify-content-between gap-3">
                              <div className="d-flex align-items-center gap-3 min-w-0">
                                {/* Profile Image */}
                                <div className="leader-avatar-wrapper">
                                  <img
                                    src={avatarUrl}
                                    alt={name}
                                    className="leader-avatar-img"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Leader")}&background=0c3c78&color=fff&bold=true`;
                                    }}
                                  />
                                </div>

                                {/* Details: Full Name and Clean Designation */}
                                <div className="flex-grow-1 min-w-0">
                                  <h5
                                    className="fw-bold mb-1 text-dark"
                                    style={{
                                      fontSize: "clamp(0.98rem, 1.7vw, 1.1rem)",
                                      letterSpacing: "-0.2px",
                                      lineHeight: 1.3,
                                      wordBreak: "break-word"
                                    }}
                                  >
                                    {name}
                                  </h5>

                                  <div
                                    className="text-muted fw-semibold"
                                    style={{
                                      fontSize: "clamp(0.82rem, 1.3vw, 0.88rem)",
                                      lineHeight: 1.35,
                                      wordBreak: "break-word",
                                      color: "#475569"
                                    }}
                                  >
                                    {designation}
                                  </div>
                                </div>
                              </div>

                              {/* Subtle Right Arrow Indicator */}
                              <div className="text-primary opacity-50 pe-1">
                                <FaChevronRight size={12} />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {loading && profiles.length === 0 && (
                        <div className="text-center py-3 text-muted">
                          <small>{isHindi ? "लोड हो रहा है..." : "Loading..."}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>

              </Row>
            </CardBody>
          </Card>
        </Container>
      </section>

      {/* ================= LEADERSHIP DETAIL MODAL ================= */}
      <Modal
        isOpen={!!selectedLeader}
        toggle={() => setSelectedLeader(null)}
        centered
        size="lg"
        className="leader-detail-modal"
      >
        {selectedLeader && (
          <>
            <ModalHeader
              toggle={() => setSelectedLeader(null)}
              className="text-white border-0 px-4 py-3"
              style={{
                background: "linear-gradient(135deg, #0a1f5c 0%, #1a3a8f 60%, #1565c0 100%)",
                borderBottom: "3px solid #f59e0b"
              }}
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/beyondsend-logo.svg"
                  alt="BeyondSend"
                  style={{ width: 28, height: 28, objectFit: "contain" }}
                  onError={(e) => { e.currentTarget.src = "/beyondsend-logo.svg"; }}
                />
                <span className="fw-bold fs-6">
                  {isHindi ? "नेतृत्व परिचय" : "Leadership Profile"}
                </span>
              </div>
            </ModalHeader>

            <ModalBody className="p-4">
              <Row className="g-4 align-items-center">
                <Col md="4" className="text-center">
                  <div className="leader-modal-avatar-wrapper mx-auto">
                    <img
                      src={
                        selectedLeader.profileUrl
                          ? (selectedLeader.profileUrl.startsWith("http")
                            ? selectedLeader.profileUrl
                            : `${BASE_HOST}${selectedLeader.profileUrl.startsWith("/") ? "" : "/"}${selectedLeader.profileUrl}`)
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLeader.imgNameEng || selectedLeader.imgNameHin || "Leader")}&background=0c3c78&color=fff&bold=true`
                      }
                      alt={isHindi ? selectedLeader.imgNameHin || selectedLeader.imgNameEng : selectedLeader.imgNameEng}
                      className="leader-modal-avatar-img shadow-sm"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLeader.imgNameEng || selectedLeader.imgNameHin || "Leader")}&background=0c3c78&color=fff&bold=true`;
                      }}
                    />
                  </div>
                  <div className="mt-2.5 pt-1">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1 fw-bold">
                      {isHindi ? "बियॉन्डसेंड" : "BeyondSend"}
                    </span>
                  </div>
                </Col>

                <Col md="8">
                  <div className="pe-md-2">
                    <h4 className="fw-bold text-dark mb-1" style={{ color: "#0c3c78" }}>
                      {isHindi
                        ? selectedLeader.imgNameHin || selectedLeader.imgNameEng
                        : selectedLeader.imgNameEng || selectedLeader.imgNameHin}
                    </h4>

                    {(selectedLeader.imgNameHin && selectedLeader.imgNameEng && (
                      <div className="text-muted fw-semibold mb-2" style={{ fontSize: "14px" }}>
                        {isHindi ? selectedLeader.imgNameEng : selectedLeader.imgNameHin}
                      </div>
                    ))}

                    <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-3 mb-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <FaUserTie className="text-primary" />
                      <span className="fw-bold text-primary" style={{ fontSize: "13.5px" }}>
                        {isHindi
                          ? selectedLeader.designationHin || selectedLeader.designationEng
                          : selectedLeader.designationEng || selectedLeader.designationHin}
                      </span>
                    </div>

                    <div className="leader-modal-details p-3 rounded-3" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <div className="d-flex align-items-center gap-2 mb-2 text-secondary fw-bold" style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        <FaLandmark /> {isHindi ? "भूमिका एवं दायित्व" : "Role & Responsibilities"}
                      </div>
                      <p className="mb-0 text-slate-700" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                        {isHindi
                          ? `बियॉन्डसेंड में ${selectedLeader.designationHin || selectedLeader.designationEng} के रूप में ग्राहक संचार, अभियान प्रबंधन एवं प्लेटफॉर्म विकास की दिशा में योगदान।`
                          : `Contributing to customer communication, campaign management and platform growth at BeyondSend as ${selectedLeader.designationEng || selectedLeader.designationHin}.`}
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </ModalBody>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default AboutSection;