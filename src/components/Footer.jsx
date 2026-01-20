import { useState, useEffect } from "react";
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
/* ================= DUMMY FOOTER DATA (JSON) ================= */
const footerData = {
  department: {
    nameEn: "Department of Higher Education",
    nameHi: "उच्च शिक्षा विभाग",
    addressEn:
      "Mantralaya, Mahanadi Bhawan, Naya Raipur, Raipur, Chhattisgarh - 492002",
    addressHi:
      "मंत्रालय, महानदी भवन, नया रायपुर, रायपुर, छत्तीसगढ़ - 492002",
    phone: "+91-771-2221234",
    email: "higheredu.cg@gov.in"
  },

  socialMedia: [
    { id: 1, icon: "FaFacebook", url: "#" },
    { id: 2, icon: "FaTwitter", url: "#" },
    { id: 3, icon: "FaInstagram", url: "#" },
    { id: 4, icon: "FaYoutube", url: "#" },
    { id: 5, icon: "FaLinkedin", url: "#" }
  ],

  importantLinks: [
    {
      id: 1,
      titleEn: "Accessibility Statement",
      titleHi: "अभिगम्यता विवरण",
      url: "/accessibility"
    },
    {
      id: 2,
      titleEn: "Copyright Policy",
      titleHi: "सर्वाधिकार नीति",
      url: "/copyright-policy"
    },
    {
      id: 3,
      titleEn: "Disclaimer",
      titleHi: "खंडन",
      url: "/disclaimer"
    },
    {
      id: 4,
      titleEn: "Site Map",
      titleHi: "साइट मानचित्र",
      url: "/sitemap"
    },
    {
      id: 5,
      titleEn: "Privacy Policy",
      titleHi: "गोपनीयता नीति",
      url: "/privacy-policy"
    },
    {
      id: 6,
      titleEn: "Terms & Conditions",
      titleHi: "नियम और शर्तें",
      url: "/terms-conditions"
    },
  ],

  lastUpdated: {
    en: "20-Jan-2026 11:35 am",
    hi: "20-जन-2026 11:35 पूर्वाह्न"
  }
};

/* ================= ICON MAPPER ================= */
const iconMap = {
  FaFacebook: <FaFacebook />,
  FaTwitter: <FaTwitter />,
  FaInstagram: <FaInstagram />,
  FaYoutube: <FaYoutube />,
  FaLinkedin: <FaLinkedin />
};

const Footer = () => {
  const { isHindi } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);



  useEffect(() => {
    const trackAndFetchVisitor = async () => {
      try {
        const visited = sessionStorage.getItem("visited");

        // POST only once per session
        if (!visited) {
          await axios.post(`${API_URL}/api/visitor-count`);
          sessionStorage.setItem("visited", "true");
        }

        // GET total visitor count
        const res = await axios.get(`${API_URL}/api/visitor-count`);
        if (res.data.success) {
          setVisitorCount(res.data.count);
        }
      } catch (error) {
        console.error("Visitor count error", error);
      }
    };

    trackAndFetchVisitor();
  }, []);








  useEffect(() => {
    setLastUpdated(isHindi ? footerData.lastUpdated.hi : footerData.lastUpdated.en);
  }, [isHindi]);

  return (
    <footer className="footer">
      <Container className="py-1">
        <Row>
          {/* Contact Info */}
          <Col md={4} className="mb-4">
            <h5>{isHindi ? "संपर्क जानकारी" : "Contact Information"}</h5>

            <p className="small text-white">
              {isHindi
                ? footerData.department.nameHi
                : footerData.department.nameEn}
            </p>

            <p className="small text-white">
              <FaMapMarkerAlt className="me-2" />
              {isHindi
                ? footerData.department.addressHi
                : footerData.department.addressEn}
            </p>

            <p className="small text-white">
              <FaPhone className="me-2" />
              {footerData.department.phone}
            </p>

            <p className="small text-white">
              <FaEnvelope className="me-2" />
              {footerData.department.email}
            </p>
          </Col>

          {/* Quick Links */}
          <Col md={3} className="mb-4">
            <h5>{isHindi ? "त्वरित लिंक" : "Quick Links"}</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/about">{isHindi ? "हमारे बारे में" : "About Us"}</Link></li>
              <li><Link to="/schemes">{isHindi ? "योजनाएं" : "Schemes"}</Link></li>
              <li><Link to="/universities">{isHindi ? "विश्वविद्यालय" : "Universities"}</Link></li>
              <li><Link to="/colleges">{isHindi ? "महाविद्यालय" : "Colleges"}</Link></li>
              <li><Link to="/downloads">{isHindi ? "डाउनलोड" : "Downloads"}</Link></li>
              <li><Link to="/contact">{isHindi ? "संपर्क करें" : "Contact Us"}</Link></li>
            </ul>
          </Col>

          {/* Important Links */}
          <Col md={3} className="mb-4">
            <h5>{isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}</h5>
            <ul className="list-unstyled footer-links">
              {footerData.importantLinks.map(link => (
                <li key={link.id}>
                  <Link to={link.url}>
                    {isHindi ? link.titleHi : link.titleEn}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Social & Visitor */}
          <Col md={2} className="mb-4">
            <h5>{isHindi ? "हमें फॉलो करें" : "Follow Us"}</h5>
            <div className="d-flex gap-2 flex-wrap">
              {footerData.socialMedia.map(s => (
                <a key={s.id} href={s.url} className="text-white fw-bold" target="_blank" rel="noreferrer">
                  {iconMap[s.icon]}
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

      {/* Bottom Bar */}
      <div className="footer-bottom py-2 bg-black">
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
                  ? "इस वेबसाइट पर सामग्री प्रकाशित और प्रबंधन उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार द्वारा किया गया है"
                  : "Content on this website is published and managed by Directorate of Higher Education, Government of Chhattisgarh"}
              </small>
            </Col>

            <Col md={12} className="text-center">
              <small>
                {isHindi
                  ? "वेब सूचना प्रबंधक: आनंद चरपे (सहायक कंप्यूटर प्रोग्रामर)"
                  : "Web Information Manager: Anand Charpe (Asst. Computer Programmer)"}
                <br />
                E-mail ID: wim[dot]higheredu-cg[at]gov[dot]in
              </small>
              <br />
              <strong>Managed By National Informatics Centre</strong>
              <br />
              <img src="/public/nic-logo.jpg" height="50" className='mb-2' alt="National Informatics Centre" />
            </Col>

            <hr />

            <Col md={6} className="text-center text-md-start">
              <small>
                <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
                <Link to="/terms-conditions">Terms & Conditions</Link> |{" "}
                <Link to="/disclaimer">Disclaimer</Link> |{" "}
                <Link to="/sitemap">Site Map</Link> | {" "}
                <Link to="/help">Help & Support</Link> | {" "}
                <Link to="/feedback">Feedback</Link> | {" "}
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
