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
  /* Use the exact digits the API returned — no leading-zero padding */
  const digits = String(count > 0 ? count : 0).split("");
  return (
    <div className="flip-digit-wrap" role="img" aria-label={`Visitor count: ${count}`}>
      {digits.map((d, i) => <FlipDigit key={i} digit={d} />)}
    </div>
  );
};

/* ─────────────────────────────────────
   Footer
───────────────────────────────────── */
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
      <Container className="py-1 ">
        <Row className="g-4">

          {/* ── Contact Info ── */}
          <Col xs={12} md={4}>
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>
            <img
              src="/cg-hiedu-full-logo.jpg"
              alt="Higher Education Department Chhattisgarh"
              className="img-fluid mb-2 rounded"
              style={{ height: "clamp(36px, 5vw, 52px)", width: "auto", objectFit: "contain" }}
            />
            <p className="small text-white mb-2 fw-bold ">
              {isHindi ? contactInfo.departmentNameHi : contactInfo.departmentNameEn}
            </p>
            <p className="small text-white mb-2">
              <FaMapMarkerAlt className="me-2" aria-hidden="true" />
              {isHindi ? contactInfo.addressHi : contactInfo.addressEn}
            </p>
            <p className="small text-white mb-2">
              <FaPhone className="me-2" aria-hidden="true" />
              <a href={`tel:${contactInfo.phone}`} className="text-white text-decoration-none">
                {contactInfo.phone}
              </a>
            </p>
            <p className="small text-white mb-0">
              <FaEnvelope className="me-2" aria-hidden="true" />
              <a href={`mailto:${contactInfo.email}`} className="text-white text-decoration-none">
                {contactInfo.email}
              </a>
            </p>
          </Col>

          {/* ── Quick Links ── */}
          <Col xs={6} md={3}>
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
          <Col xs={6} md={3}>
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

          {/* ── Follow Us + Visitor Counter ── */}
          <Col xs={12} md={2}>
            <h5>{isHindi ? "हमें फॉलो करें" : "Follow Us"}</h5>
            <div className="d-flex gap-2 flex-wrap mb-4">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  className="text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.platform}
                  style={{ fontSize: "1.4rem", transition: "color .2s" }}
                >
                  {SOCIAL_ICONS[s.platform?.toLowerCase()] || <FaLinkedin />}
                </a>
              ))}
            </div>

            {/* ── Animated Visitor Counter ── */}
            <h6 className="text-white mb-2">
              {isHindi ? "आगंतुक संख्या" : "Site Visitors"}
            </h6>
            <FlipCounter count={visitorCount} />
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
                src={`${API_URL}${contactInfo.organizerLogo}`}
                height={44}
                className="mt-2 mb-1"
                alt="Organizer Logo"
                loading="lazy"
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
            <Col xs={12} md={6} className="text-center text-md-end">
              <small>{isHindi ? "अंतिम अपडेट" : "Last Updated"}: {lastUpdated}</small>
            </Col>
          </Row>
        </Container>
      </div>
      <span className=" mb-0 footer-pattern-strip" />
    </footer>
  );
};

export default Footer;
