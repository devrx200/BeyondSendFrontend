import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import {
  FaFacebook, FaTwitter, FaInstagram,
  FaYoutube, FaLinkedin, FaMapMarkerAlt,
  FaPhone, FaEnvelope,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const SOCIAL_ICONS = {
  facebook: <FaFacebook />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  linkedin: <FaLinkedin />,
};



const FlipDigit = ({ digit }) => {
  const [animate, setAnimate] = useState(false);
  const prevDigit = useRef(digit);

  useEffect(() => {
    if (prevDigit.current !== digit) {
      setAnimate(false);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
      prevDigit.current = digit;
    }
  }, [digit]);

  return (
    <span
      className={`flip-digit${animate ? " animate" : ""}`}
      aria-hidden="true"
    >
      {digit}
    </span>
  );
};

const FlipCounter = ({ count }) => {
  const digits = String(count > 0 ? count : 0).split("");
  return (
    <div className="flip-digit-wrap" role="img" aria-label={`Visitor count: ${count}`}>
      {digits.map((d, i) => <FlipDigit key={i} digit={d} />)}
    </div>
  );
};


const EMSIGN_SEAL_URL = "https://security-seal.emsign.com/getSiteDetails?t=42c08805642179c4a5c95bde45f19ca034c4690359ef9d4b716076d9096b2e43";

const SecuritySeal = () => {
  const handleSealClick = (e) => {
    e.preventDefault();
    const width = 660;
    const height = 620;
    const left = window.screen.width ? (window.screen.width - width) / 2 : 100;
    const top = window.screen.height ? (window.screen.height - height) / 2 : 100;
    
    window.open(
      EMSIGN_SEAL_URL,
      "emSignSiteDetails",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=yes`
    );
  };

  return (
    <div className="security-seal-wrapper d-inline-flex text-start my-1">
      <a
        href={EMSIGN_SEAL_URL}
        onClick={handleSealClick}
        className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-3 text-decoration-none shadow-sm"
        style={{
          background: "rgba(255, 255, 255, 0.07)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          color: "#ffffff",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        title="Website SSL / TLS Security Certified by emSign - Click to verify"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <div style={{ textAlign: "left", lineHeight: "1.15" }}>
          <div style={{ color: "#22c55e", fontSize: "10px", fontWeight: "800", letterSpacing: "0.5px" }}>
            SSL SECURED
          </div>
          <div style={{ color: "#cbd5e1", fontSize: "11px", fontWeight: "500" }}>
            emSign Verified
          </div>
        </div>
      </a>
    </div>
  );
};

const Footer = () => {
  const { isHindi } = useLanguage();
  const [footer, setFooter] = useState(null);
  const [visitorCount, setVisitorCount] = useState(0);

  const lastUpdated = useMemo(() => {
    try {
      const BUILD_DATE = new Date(__BUILD_TIMESTAMP__);
      return BUILD_DATE.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
        day: "2-digit", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch {
      return "";
    }
  }, [isHindi]);

  /* Fetch footer content */
  useEffect(() => {
    axios.get(`${API_URL}/api/get-all-footer`)
      .then(res => { if (res.data) setFooter(res.data); })
      .catch(err => console.error("Footer fetch error", err));
  }, []);

  /* Track + fetch visitor count */
  useEffect(() => {
    (async () => {
      try {
        if (!sessionStorage.getItem("visited")) {
          await axios.post(`${API_URL}/api/visitor-count`);
          sessionStorage.setItem("visited", "true");
        }
        const res = await axios.get(`${API_URL}/api/visitor-count`);
        if (res.data?.success) setVisitorCount(res.data.count);
      } catch (err) {
        console.error("Visitor error", err);
      }
    })();
  }, []);

  if (!footer) return null;
  const { contactInfo, quickLinks, importantLinks, socialLinks } = footer;

  return (
    <footer className="footer mt-0 pt-0">
      <span className="footer-top-pattern mb-1" />
      <Container className="py-2">
        <Row className="g-4 align-items-start">

          {/* ── Contact Info ── */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>
            <img
              src="/cg-hiedu-full-logo.jpg"
              alt="Higher Education Department Chhattisgarh"
              className="img-fluid mb-2 rounded bg-white p-1"
              style={{ height: "clamp(36px, 5vw, 52px)", width: "auto", objectFit: "contain" }}
            />
            <p className="small text-white mb-2 fw-bold ">
              {isHindi ? contactInfo.departmentNameHi : contactInfo.departmentNameEn}
            </p>
            <p className="small text-white mb-2">
              <FaMapMarkerAlt className="me-2 text-warning" aria-hidden="true" />
              {isHindi ? contactInfo.addressHi : contactInfo.addressEn}
            </p>
            <p className="small text-white mb-2">
              <FaPhone className="me-2 text-warning" aria-hidden="true" />
              <a href={`tel:${contactInfo.phone}`} className="text-white text-decoration-none">
                {contactInfo.phone}
              </a>
            </p>
            <p className="small text-white mb-0">
              <FaEnvelope className="me-2 text-warning" aria-hidden="true" />
              <a href={`mailto:${contactInfo.email}`} className="text-white text-decoration-none">
                {contactInfo.email}
              </a>
            </p>
          </Col>

          {/* ── Quick Links ── */}
          <Col xs={6} sm={3} md={3} lg={2}>
            <h5>{isHindi ? "त्वरित लिंक" : "Quick Links"}</h5>
            <ul className="list-unstyled footer-links mb-0">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url}>
                    {isHindi ? link.titleHin : link.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Important Links ── */}
          <Col xs={6} sm={3} md={3} lg={3}>
            <h5>{isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}</h5>
            <ul className="list-unstyled footer-links mb-0">
              {importantLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url}>
                    {isHindi ? link.titleHin : link.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ── Follow Us (LEFT) + Visitor Counter (RIGHT) on phone ── */}
          <Col xs={12} sm={12} md={12} lg={3}>
            <div className="d-flex flex-row flex-lg-column justify-content-between align-items-start gap-3">
              {/* Follow Us */}
              <div>
                <h5 className="mb-2 mb-lg-3">{isHindi ? "हमें फॉलो करें" : "Follow Us"}</h5>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  {socialLinks.map((s, i) => (
                    <a
                      key={i}
                      href={s.url}
                      className="footer-social-icon text-white"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                    >
                      {SOCIAL_ICONS[s.platform?.toLowerCase()] || <FaLinkedin />}
                    </a>
                  ))}
                </div>
              </div>

              {/* Visitor Counter */}
              <div className="text-end text-lg-start">
                <h5 className="mb-2">{isHindi ? "आगंतुक संख्या" : "Site Visitors"}</h5>
                <div className="d-flex justify-content-end justify-content-lg-start mb-1">
                  <FlipCounter count={visitorCount} />
                </div>
              </div>
            </div>

            {/* Security Seal — Centered & Inline on mobile */}
            <div className="d-flex justify-content-center justify-content-lg-start align-items-center mt-3">
              <SecuritySeal />
            </div>
          </Col>

        </Row>
      </Container>

      {/* ── Footer Bottom ── */}

      <div className="footer-bottom py-1 " >
        <Container fluid>
          <Row className="gy-2">
            <Col xs={12} className="text-center">
              <small>
                © 2017 – {isHindi
                  ? "सर्वाधिकार सुरक्षित - उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार, भारत"
                  : "All Rights Reserved - Department of Higher Education, Government of Chhattisgarh, India"}
              </small>
            </Col>
            <Col xs={12} className="text-center">
              <small className="text-light">
                {isHindi
                  ? "इस वेबसाइट पर सामग्री प्रकाशित और प्रबंधन उच्च शिक्षा विभाग द्वारा किया गया है"
                  : "Content on this website is published and managed by Directorate of Higher Education, Government of Chhattisgarh"}
              </small>
            </Col>
            <Col xs={12} className="text-center">
              <small>
                {isHindi
                  ? `वेब सूचना प्रबंधक: ${contactInfo.organizerNameHi || ""}`
                  : `Web Information Manager: ${contactInfo.organizerNameEn || ""}`}
              </small>
              <br />
              <strong className="text-white small">Managed By National Informatics Centre</strong>
              <br />
              <img
                src={contactInfo.organizerLogo ? `${API_URL}${contactInfo.organizerLogo}` : "/nic-logo.jpg"}
                height={44}
                className="mt-2 mb-1 rounded"
                alt="NIC Logo"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/nic-logo.jpg"; }}
              />
            </Col>
            <Col xs={12}><hr className="border-secondary my-1" /></Col>
            <Col xs={12} md={6} className="text-center text-md-start">
              <small>
                <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
                <Link to="/terms-condition">Terms &amp; Conditions</Link> |{" "}
                <Link to="/disclaimer">Disclaimer</Link> |{" "}
                <Link to="/accessibility-statement">Accessibility</Link> |{" "}
                <Link to="/right-information">RTI</Link> |{" "}
                <Link to="/feedback">Feedback</Link> |{" "}
                <Link to="/help-and-support">Help &amp; Support</Link>
              </small>
            </Col>
            <Col xs={12} md={6} className="text-center text-md-end pb-4 pb-md-2">
              <small>{isHindi ? "अंतिम अपडेट" : "Last Updated"}: {lastUpdated}</small>
            </Col>
          </Row>
        </Container>
      </div>
      <span className="mb-0 footer-pattern-strip" />
    </footer>
  );
};

export default Footer;
