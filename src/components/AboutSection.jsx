import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Card, CardBody, Modal, ModalHeader, ModalBody } from "reactstrap";
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaArrowRight, FaUniversity, FaGraduationCap,
  FaBuilding, FaLandmark, FaAward, FaUserTie, FaChevronRight
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

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
        const res = await axios.get(`${API_URL}/api/get-about-sections`);

        const filteredAndSorted = (res.data?.departmentLeaderProfiles || [])
          .filter(item => item.isActive === true && item.isHideOnAboutSection !== true)
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

  // Clean description text by removing unintended artifact characters
  const rawDescription = isHindi
    ? (aboutDepartment.descriptionHin || "")
    : (aboutDepartment.descriptionEng || "");

  const cleanDescription = rawDescription
    .replace(/\._/g, ". ")
    .replace(/_/g, " ");

  const descriptionParagraphs = cleanDescription
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");

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
                    {/* Top Gov Badge with proper padding */}
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span
                        className="d-inline-flex align-items-center gap-1.5 rounded-pill fw-bold"
                        style={{
                          background: "#eff6ff",
                          color: "#1e40af",
                          border: "1px solid #bfdbfe",
                          fontSize: "12px",
                          letterSpacing: "0.3px",
                          padding: "5px 14px"
                        }}
                      >
                        <FaLandmark className="me-1 text-primary" size={13} />
                        {isHindi ? "उच्च शिक्षा विभाग, छत्तीसगढ़ शासन" : "Higher Education Department, Govt. of CG"}
                      </span>
                    </div>

                    {/* Section Title */}
                    <h2 className="about-heading-accent mb-3 fs-4">
                      {(isHindi ? aboutDepartment.titleHin : aboutDepartment.titleEng) ||
                        (isHindi ? "हमारे विभाग के बारे में" : "About Department")}
                    </h2>

                    {/* Paragraph Text */}
                    <div className="about-text-content my-2">
                      {descriptionParagraphs.length > 0 ? (
                        descriptionParagraphs.map((text, i) => (
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
                        ))
                      ) : (
                        <p className="mb-2" style={{ fontSize: "14.5px", lineHeight: 1.7, color: "#334155" }}>
                          {isHindi
                            ? "उच्च शिक्षा विभाग छत्तीसगढ़ राज्य में उच्च शिक्षण संस्थानों के विस्तार, विकास एवं गुणवत्तापूर्ण शिक्षा उपलब्ध कराने हेतु निरंतर प्रयासरत है।"
                            : "The Department of Higher Education is committed to expanding quality higher education and fostering excellence across Chhattisgarh state."}
                        </p>
                      )}
                    </div>

                    {/* Quick Stats Highlights */}
                    <div className="row g-2 my-2">
                      <div className="col-6 col-sm-3">
                        <div className="stat-chip">
                          <div style={{ color: "#1e40af" }}>
                            <FaUniversity size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>9+</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "शासकीय वि.वि." : "Govt Univ"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div className="stat-chip">
                          <div style={{ color: "#f59e0b" }}>
                            <FaBuilding size={16} />
                          </div>
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>21+</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "निजी वि.वि." : "Private Univ"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div style={{ color: "#2563eb" }} className="stat-chip">
                          <FaGraduationCap size={16} />
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>343+</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "शासकीय कॉलेज" : "Govt Colleges"}
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="col-6 col-sm-3">
                        <div style={{ color: "#d97706" }} className="stat-chip">
                          <FaAward size={16} />
                          <div>
                            <div className="fw-bold text-dark lh-1" style={{ fontSize: 14 }}>314+</div>
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              {isHindi ? "अशासकीय कॉलेज" : "Private Colleges"}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="mt-3">
                      <Button
                        tag={Link}
                        to="/about"
                        className="rounded-pill px-3.5 py-1.5 fw-semibold shadow-sm d-inline-flex align-items-center gap-2 border-0"
                        style={{
                          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                          color: "#ffffff",
                          fontSize: "13.5px",
                          transition: "all 0.25s ease"
                        }}
                      >
                        {isHindi ? "और पढ़ें" : "Read More"}
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
                          {isHindi ? "विभागीय नेतृत्व" : "Department Leadership"}
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
                          ? (profile.profileUrl.startsWith("http") ? profile.profileUrl : `${API_URL}${profile.profileUrl.startsWith("/") ? "" : "/"}${profile.profileUrl}`)
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
                  src="/Chhattisgarh.svg"
                  alt="Emblem"
                  style={{ width: 28, height: 28, objectFit: "contain" }}
                  onError={(e) => { e.currentTarget.src = "/Chhattisgarh.svg"; }}
                />
                <span className="fw-bold fs-6">
                  {isHindi ? "विभागीय नेतृत्व परिचय" : "Department Leadership Profile"}
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
                            : `${API_URL}${selectedLeader.profileUrl.startsWith("/") ? "" : "/"}${selectedLeader.profileUrl}`)
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
                      {isHindi ? "छत्तीसगढ़ शासन" : "Govt. of Chhattisgarh"}
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
                        <FaLandmark /> {isHindi ? "विभाग एवं दायित्व" : "Department & Responsibilities"}
                      </div>
                      <p className="mb-0 text-slate-700" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                        {isHindi
                          ? `उच्च शिक्षा विभाग, छत्तीसगढ़ शासन के अंतर्गत ${selectedLeader.designationHin || selectedLeader.designationEng} के रूप में उच्च शिक्षण संस्थानों के सशक्तिकरण एवं शैक्षणिक गुणवत्ता संवर्धन हेतु समर्पित।`
                          : `Dedicated to strengthening higher educational institutions, policy direction, and academic excellence under the Government of Chhattisgarh as ${selectedLeader.designationEng || selectedLeader.designationHin}.`}
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