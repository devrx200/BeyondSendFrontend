import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import {
  FaFacebook, FaTwitter, FaInstagram,
  FaYoutube, FaLinkedin, FaMapMarkerAlt,
  FaPhone, FaEnvelope,
} from "react-icons/fa";
import { useLanguage } from "@/contexts/LanguageContext";
import apiClient from "@apiService";

const SOCIAL_ICONS = {
  facebook: <FaFacebook />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  linkedin: <FaLinkedin />,
};

const DEFAULT_CONTACT_INFO = {
  brandLogo: "/beyondsend-logo.svg",
  departmentNameEn: "BeyondSend Communications Inc.",
  departmentNameHi: "बियॉन्डसेंड कम्युनिकेशंस",
  addressEn: "123 Tech Park, Cyber City, New Delhi",
  addressHi: "123 टेक पार्क, साइबर सिटी, नई दिल्ली",
  phone: "+91-1234567890",
  email: "support@beyondsend.com",
  organizerNameEn: "Anand Charpe",
  organizerNameHi: "आनंद चपटे",
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
    apiClient.get('/footer/detail')
      .then(res => {
        const data = res?.data || res;
        if (data && typeof data === 'object') setFooter(data);
      })
      .catch(err => console.error("Footer fetch error", err));
  }, []);

  /* Track + fetch visitor count */
  useEffect(() => {
    (async () => {
      try {
        if (!sessionStorage.getItem("visited")) {
          await apiClient.post('/visitor/count');
          sessionStorage.setItem("visited", "true");
        }
        const res = await apiClient.get('/visitor/count');
        const count = res?.count ?? res?.data?.count;
        if (count !== undefined) setVisitorCount(count);
      } catch (err) {
        console.error("Visitor error", err);
      }
    })();
  }, []);

  const contactInfo = footer?.contactInfo || DEFAULT_CONTACT_INFO;
  const quickLinks = Array.isArray(footer?.quickLinks) ? footer.quickLinks : [];
  const importantLinks = Array.isArray(footer?.importantLinks) ? footer.importantLinks : [];
  const socialLinks = Array.isArray(footer?.socialLinks) ? footer.socialLinks : [];

  return (
    <footer className="footer mt-0 pt-3">

      <Container className="py-2">
        <Row className="g-4 align-items-start">

          {/* ── Col 1: Logo & About Us ── */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <img
              src="/beyondsend-logo-white.svg"
              alt="BeyondSend"
              className="img-fluid mb-3"
              style={{ height: "clamp(34px, 4.5vw, 46px)", width: "auto", objectFit: "contain" }}
              onError={(e) => { e.currentTarget.src = "/beyondsend-logo.svg"; }}
            />
            <h6 className="fw-bold text-white mb-2" style={{ letterSpacing: "-0.2px" }}>
              {isHindi ? "हमारे बारे में" : "About BeyondSend"}
            </h6>
            <p className="small text-white-50 mb-3" style={{ lineHeight: "1.65", maxWidth: "340px" }}>
              {isHindi
                ? "बियॉन्डसेंड एक अग्रणी एंटरप्राइज क्लाउड कम्युनिकेशन और सीपीएएस प्लेटफॉर्म है, जो एसएमएस, आरसीएस, व्हाट्सएप, ईमेल और वॉयस के माध्यम से सहज ग्राहक जुड़ाव प्रदान करता है।"
                : "BeyondSend is a next-generation enterprise CPaaS platform empowering businesses with high-throughput SMS, RCS, WhatsApp Business API, Email, and Voice solutions."}
            </p>
            <div className="d-flex gap-2 flex-wrap align-items-center mb-2">
              {socialLinks.length > 0 ? (
                socialLinks.map((s, i) => (
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
                ))
              ) : (
                <>
                  <a href="https://www.linkedin.com/company/beyondsend" className="footer-social-icon text-white" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><FaLinkedin /></a>
                  <a href="https://www.facebook.com/beyondsend" className="footer-social-icon text-white" target="_blank" rel="noopener noreferrer" aria-label="Facebook" title="Facebook"><FaFacebook /></a>
                  <a href="https://www.instagram.com/beyondsend" className="footer-social-icon text-white" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><FaInstagram /></a>
                  <a href="https://www.youtube.com/@beyondsend" className="footer-social-icon text-white" target="_blank" rel="noopener noreferrer" aria-label="YouTube" title="YouTube"><FaYoutube /></a>
                  <a href="https://twitter.com/beyondsend" className="footer-social-icon text-white" target="_blank" rel="noopener noreferrer" aria-label="Twitter" title="Twitter"><FaTwitter /></a>
                </>
              )}
            </div>
          </Col>

          {/* ── Col 2: Quick Links ── */}
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

          {/* ── Col 3: Important Links ── */}
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

          {/* ── Col 4: Contact Information & Visitor Counter ── */}
          <Col xs={12} sm={12} md={12} lg={3}>
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>
            <p className="small text-white mb-2 fw-semibold">
              {isHindi ? (contactInfo.departmentNameHi || "बियॉन्डसेंड टेक्नोलॉजीज") : (contactInfo.departmentNameEn || "BeyondSend Technologies")}
            </p>
            <p className="small text-white-50 mb-2">
              <FaMapMarkerAlt className="me-2 text-warning" aria-hidden="true" />
              {isHindi ? (contactInfo.addressHi || "बेंगलुरु, कर्नाटक") : (contactInfo.addressEn || "#6, 1st Main Rd, NS Palya, BTM 2nd Stage, Bengaluru, Karnataka 560076")}
            </p>
            <p className="small text-white-50 mb-2">
              <FaPhone className="me-2 text-warning" aria-hidden="true" />
              <a href={`tel:${contactInfo.phone || '+91 90368 80158'}`} className="text-white text-decoration-none">
                {contactInfo.phone || "+91 90368 80158"}
              </a>
            </p>
            <p className="small text-white-50 mb-3">
              <FaEnvelope className="me-2 text-warning" aria-hidden="true" />
              <a href={`mailto:${contactInfo.email || 'info@beyondsend.in'}`} className="text-white text-decoration-none">
                {contactInfo.email || "info@beyondsend.in"}
              </a>
            </p>

            {/* Visitor Counter */}
            <div className="mt-3">
              <h6 className="small text-white fw-bold mb-2">{isHindi ? "आगंतुक संख्या" : "Site Visitors"}</h6>
              <div className="d-flex justify-content-start mb-1">
                <FlipCounter count={visitorCount} />
              </div>
            </div>
          </Col>

        </Row>
      </Container>

      {/* ── Footer Bottom ── */}

      <div className="footer-bottom">
        <Container>
          <Row className="gy-1 align-items-center">
            <Col xs={12} className="text-center">
              <small>
                © 2017 – {isHindi
                  ? "सर्वाधिकार सुरक्षित - बियॉन्डसेंड"
                  : "All Rights Reserved - BeyondSend"}
              </small>
            </Col>
            <Col xs={12}>
              <hr className="footer-copyright-divider" />
            </Col>
            <Col xs={12} md={6} className="text-center text-md-start">
              <small>
                <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
                <Link to="/terms-condition">Terms &amp; Conditions</Link> |{" "}
                <Link to="/disclaimer">Disclaimer</Link> |{" "}
                <Link to="/accessibility-statement">Accessibility</Link> |{" "}
                <Link to="/feedback">Feedback</Link> |{" "}
                <Link to="/help-and-support">Help &amp; Support</Link>
              </small>
            </Col>
            <Col xs={12} md={6} className="text-center text-md-end">
              <small>{isHindi ? "अंतिम अपडेट" : "Last Updated"}: {lastUpdated}</small>
            </Col>
          </Row>
        </Container>
      </div>

    </footer>
  );
};

export default Footer;
