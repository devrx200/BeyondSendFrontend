import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';
import DataService from '../services/DataService';

const Footer = () => {
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [importantLinks, setImportantLinks] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState('');
  const { language, isHindi } = useLanguage();

  useEffect(() => {
    loadFooterData();
    initializeVisitorCount();
    setLastUpdated(new Date().toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));
  }, [isHindi]);

  const initializeVisitorCount = () => {
    let count = localStorage.getItem('visitorCount');
    if (!count) {
      count = Math.floor(Math.random() * 100000) + 100000; // Start from 100000+
      localStorage.setItem('visitorCount', count);
    } else {
      count = parseInt(count) + 1;
      localStorage.setItem('visitorCount', count);
    }
    setVisitorCount(count);
  };

  const loadFooterData = async () => {
    try {
      const [deptInfo, social, links] = await Promise.all([
        DataService.getDepartmentInfo(),
        DataService.getSocialMedia(),
        DataService.getImportantLinks()
      ]);
      setDepartmentInfo(deptInfo);
      setSocialMedia(social);
      setImportantLinks(links);
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      FaFacebook: <FaFacebook />,
      FaTwitter: <FaTwitter />,
      FaInstagram: <FaInstagram />,
      FaYoutube: <FaYoutube />,
      FaLinkedin: <FaLinkedin />
    };
    return icons[iconName] || null;
  };

  const t = (key) => translations[language][key] || key;

  return (
    <footer className="footer mt-5">
      <Container className="py-2">
        <Row>
          {/* About Section */}
          <Col md={4} className="mb-4">
            <h5 className="mb-3">{t('contactInfo')}</h5>
            {departmentInfo && (
              <>
                <p className="small">{isHindi ? 'उच्च शिक्षा विभाग' : departmentInfo.name}</p>
                <div className="contact-info small">
                  <p className="mb-2">
                    <FaMapMarkerAlt className="me-2" />
                    {departmentInfo.address}, {departmentInfo.city}, {departmentInfo.state} - {departmentInfo.pincode}
                  </p>
                  <p className="mb-2">
                    <FaPhone className="me-2" />
                    {departmentInfo.phone}
                  </p>
                  <p className="mb-2">
                    <FaEnvelope className="me-2" />
                    {departmentInfo.email}
                  </p>
                </div>
              </>
            )}
          </Col>

          {/* Quick Links */}
          <Col md={3} className="mb-4">
            <h5 className="mb-3">{t('quickLinks')}</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/about">{t('about')}</Link></li>
              <li><Link to="/schemes">{t('schemes')}</Link></li>
              <li><Link to="/universities">{t('universities')}</Link></li>
              <li><Link to="/colleges">{t('colleges')}</Link></li>
              <li><Link to="/downloads">{t('downloads')}</Link></li>
              <li><Link to="/contact">{t('contact')}</Link></li>
            </ul>
          </Col>

          {/* Important Links */}
          <Col md={3} className="mb-4">
            <h5 className="mb-3">{t('importantLinks')}</h5>
            <ul className="list-unstyled footer-links">
              <li><Link to="/privacy-policy">{t('privacyPolicy')}</Link></li>
              <li><Link to="/terms-conditions">{t('termsConditions')}</Link></li>
              <li><Link to="/disclaimer">{t('disclaimer')}</Link></li>
              <li><Link to="/copyright-policy">{t('copyrightPolicy')}</Link></li>
              <li><Link to="/hyperlink-policy">{t('hyperlinkPolicy')}</Link></li>
              <li><Link to="/help">{t('help')}</Link></li>
            </ul>
          </Col>

          {/* Social Media & Visitor Counter */}
          <Col md={2} className="mb-4">
            <h5 className="mb-3">{t('followUs')}</h5>
            <div className="social-icons d-flex gap-2 flex-wrap">
              {socialMedia.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                >
                  {getIcon(social.icon)}
                </a>
              ))}
            </div>
            <div className="mt-4">
              <h6 className="mb-2">{t('visitorCount')}</h6>
              <div className="visitor-counter p-2 rounded text-center">
                <strong>{visitorCount.toLocaleString(isHindi ? 'hi-IN' : 'en-IN')}</strong>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Bottom Bar */}
      <div className="footer-bottom py-2 bg-black">
        <Container>
          <Row className="align-items-center">
            <Col md={12} className="text-center ">
              <small>
                {t('copyright')} - {t('officialWebsite')}
              </small>
            </Col>
            <Col md={12} className="text-center ">
              <small className="text-light">
                {t('contentNote')}
              </small>
            </Col>
            <Col md={12} className="text-center">
              <small>
                {t('contactWebmaster')} - {isHindi ? 'आनंद चरपे (सहायक कंप्यूटर प्रोग्रामर)' : 'Anand Charpe (Assistant Computer Programmer)'}
                <br />
                {isHindi ? 'ई-मेल आईडी' : 'Email'}: wim.higheredu-cg@gov.in
              </small>
              <br/>
              {/* <hr className='m-0 p-0'/> */}
              <strong>Managed By National Informatics Centre</strong>
              <br/>
              <img src="/public/nic-logo.jpg" height="50"  className='mb-2' alt="National Informatics Centre" />
            </Col>
            <hr/>
            <Col md={6} className="text-center text-md-start mb-2 mb-md-0">
              <small>
                <Link to="/privacy-policy">{t('privacyPolicy')}</Link>
                <span className="mx-2">|</span>
                <Link to="/terms-conditions">{t('termsConditions')}</Link>
                <span className="mx-2">|</span>
                <Link to="/disclaimer">{t('disclaimer')}</Link>
                <span className="mx-2">|</span>
                <Link to="/sitemap">{t('sitemap')}</Link>
              </small>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <small>
                {t('lastUpdated')}: {lastUpdated}
              </small>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;

