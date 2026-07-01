import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
const BUILD_TIMESTAMP = import.meta.env.VITE_BUILD_TIMESTAMP || Date.now();
/* ================= ICON MAP ================= */
const iconMap = {
  facebook: <FaFacebook />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  linkedin: <FaLinkedin />,
};

const Footer = () => {
  const { isHindi } = useLanguage();

  const [footer, setFooter] = useState(null);
  const [visitorCount, setVisitorCount] = useState(0);
  const lastUpdated = useMemo(() => {
    const buildDate = new Date(BUILD_TIMESTAMP);
    return buildDate.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [isHindi]);

  /* ================= FETCH FOOTER ================= */
  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/get-all-footer`);
        if (res.data) {
          setFooter(res.data);
        }
      } catch (err) {
        console.error("Footer fetch error", err);
      }
    };

    fetchFooter();
  }, [isHindi]);

  /* ================= VISITOR COUNT ================= */
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const visited = sessionStorage.getItem("visited");
        if (!visited) {
          await axios.post(`${API_URL}/api/visitor-count`);
          sessionStorage.setItem("visited", "true");
        }
        const res = await axios.get(`${API_URL}/api/visitor-count`);
        if (res.data.success) {
          setVisitorCount(res.data.count);
        }
      } catch (err) {
        console.error("Visitor error", err);
      }
    };
    trackVisitor();
  }, []);

  if (!footer) return null;

  const { contactInfo, quickLinks, importantLinks, socialLinks } = footer;

  return (
    <footer className="footer">
      <Container className="py-1">
        <Row>

          {/* ================= CONTACT INFO ================= */}
          <Col md={4} className="mb-1">
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>

            <p className="small text-white">
              {isHindi
                ? contactInfo.departmentNameHi
                : contactInfo.departmentNameEn}
            </p>

            <p className="small text-white">
              <FaMapMarkerAlt className="me-2" />
              {isHindi ? contactInfo.addressHi : contactInfo.addressEn}
            </p>

            <p className="small text-white">
              <FaPhone className="me-2" />
              {contactInfo.phone}
            </p>

            <p className="small text-white">
              <FaEnvelope className="me-2" />
              {contactInfo.email}
            </p>
          </Col>

          {/* ================= QUICK LINKS ================= */}
          <Col md={3} className="mb-1">
            <h5>{isHindi ? "त्वरित लिंक" : "Quick Links"}</h5>
            <ul className="list-unstyled footer-links">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url}>
                    {isHindi ? link.titleHin : link.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ================= IMPORTANT LINKS ================= */}
          <Col md={3} className="mb-1">
            <h5>{isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}</h5>
            <ul className="list-unstyled footer-links">
              {importantLinks.map((link, i) => (
                <li key={i}>
                  <Link to={link.url}>
                    {isHindi ? link.titleHin : link.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* ================= SOCIAL + VISITOR ================= */}
          <Col md={2} className="mb-1">
            <h5>{isHindi ? "हमें फॉलो करें" : "Follow Us"}</h5>

            <div className="d-flex gap-2 flex-wrap">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  className="text-white fw-bold"
                  target="_blank"
                  rel="noreferrer"
                >
                  {iconMap[s.platform?.toLowerCase()] || <FaLinkedin />}
                </a>
              ))}
            </div>

            <div className="mt-4">
              <h6 className="text-white">
                {isHindi ? "आगंतुक संख्या" : "Site Visitors"}
              </h6>
              <div className="visitor-counter p-2 rounded text-center">
                <strong>
                  {visitorCount.toLocaleString(isHindi ? "hi-IN" : "en-IN")}
                </strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {/* ================= BOTTOM BAR ================= */}
      <div className="footer-bottom py-1 bg-black">
        <Container>
          <Row>
            <Col md={12} className="text-center">
              <small>
                © 2017 – {isHindi
                  ? "सर्वाधिकार सुरक्षित - उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार, भारत"
                  : "All Rights Reserved - Department of Higher Education, Government of Chhattisgarh, India"}
              </small>
            </Col>

            <Col md={12} className="text-center">
              <small className="text-light">
                {isHindi
                  ? "इस वेबसाइट पर सामग्री प्रकाशित और प्रबंधन उच्च शिक्षा विभाग द्वारा किया गया है"
                  : "Content on this website is published and managed by Directorate of Higher Education, Government of Chhattisgarh"}
              </small>
            </Col>

            <Col md={12} className="text-center">
              <small>
                {isHindi
                  ? `वेब सूचना प्रबंधक: ${contactInfo.organizerNameHi || ""}`
                  : `Web Information Manager: ${contactInfo.organizerNameEn || ""}`
                }
              </small>
              <br />
              <strong>Managed By National Informatics Centre</strong>
              <br />
              <img
                src={`${API_URL}${contactInfo.organizerLogo}`}
                height="50"
                className="mb-2"
                alt="Organizer Logo"
              />
            </Col>
            <hr />
            <Col md={6} className="text-center text-md-start">
              <small>
                <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
                <Link to="/terms-condition">Terms & Conditions</Link> |{" "}
                <Link to="/disclaimer">Disclaimer</Link> |{" "}
                <Link to="/accessibility-statement">Accessibility</Link> |{" "}
                <Link to="/right-information">RTI</Link> |{" "}
                <Link to="/feedback">Feedback</Link> |{" "}
                <Link to="/help-and-support">Help And Support</Link>
              </small>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <small>
                {isHindi ? "अंतिम अपडेट" : "Last Updated"}: {lastUpdated}
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
