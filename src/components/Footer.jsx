import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import {
  FaFacebook, FaTwitter, FaInstagram,
  FaYoutube, FaLinkedin, FaMapMarkerAlt,
  FaPhone, FaEnvelope,
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import apiClient from "../services/api.service";

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

          {/* ── Contact Info ── */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>
            <img
              src={contactInfo.brandLogo || "/beyondsend-logo.svg"}
              alt="BeyondSend"
              className="img-fluid mb-2 rounded bg-white p-1"
              style={{ height: "clamp(36px, 5vw, 52px)", width: "auto", objectFit: "contain" }}
              onError={(e) => { e.currentTarget.src = "/beyondsend-logo.svg"; }}
            />
            <p className="small text-white mb-2 fw-bold ">
              {isHindi ? (contactInfo.departmentNameHi || "बियॉन्डसेंड कम्युनिकेशंस") : (contactInfo.departmentNameEn || "BeyondSend Communications Inc.")}
            </p>
            <p className="small text-white mb-2">
              <FaMapMarkerAlt className="me-2 text-warning" aria-hidden="true" />
              {isHindi ? (contactInfo.addressHi || "123 टेक पार्क, साइबर सिटी, नई दिल्ली") : (contactInfo.addressEn || "123 Tech Park, Cyber City, New Delhi")}
            </p>
            <p className="small text-white mb-2">
              <FaPhone className="me-2 text-warning" aria-hidden="true" />
              <a href={`tel:${contactInfo.phone || '+91-1234567890'}`} className="text-white text-decoration-none">
                {contactInfo.phone || "+91-1234567890"}
              </a>
            </p>
            <p className="small text-white mb-0">
              <FaEnvelope className="me-2 text-warning" aria-hidden="true" />
              <a href={`mailto:${contactInfo.email || 'support@beyondsend.com'}`} className="text-white text-decoration-none">
                {contactInfo.email || "support@beyondsend.com"}
              </a>
            </p>
            <small className="fw-bold mt-2 d-block">
              <span className="text-warning">{isHindi ? "सीईओ: " : "CEO: "}</span>
              <span className="text-info">{isHindi ? (contactInfo.organizerNameHi || "आनंद चपटे") : (contactInfo.organizerNameEn || "Anand Charpe")}</span>
            </small>
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
                  ? "सर्वाधिकार सुरक्षित - बियॉन्डसेंड"
                  : "All Rights Reserved - BeyondSend"}
              </small>
            </Col>
            <Col xs={12}><hr className="border-secondary my-1" /></Col>
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
            <Col xs={12} md={6} className="text-center text-md-end pb-4 pb-md-2">
              <small>{isHindi ? "अंतिम अपडेट" : "Last Updated"}: {lastUpdated}</small>
            </Col>
          </Row>
        </Container>
      </div>

    </footer>
  );
};

export default Footer;
