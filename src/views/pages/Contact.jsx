import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaUserTie,
  FaEnvelope, FaBuilding, FaFax,
  FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaTwitter
} from 'react-icons/fa';
import { PageLayout, PageLoader } from "@/components";
import { useLanguage } from '../../contexts/LanguageContext';
import apiClient, { BASE_HOST as API } from "@apiService";
// Office image is served from public folder at root path
const officeImage = '/image.png';

/* ── Reusable contact info row ── */
const ContactRow = ({ icon, label, value, href, color = 'gold' }) => {
  const colorMap = {
    gold:   { bg: 'rgba(245,189,31,0.14)', text: '#805c00' },
    teal:   { bg: 'rgba(15,139,109,0.12)', text: '#087e62' },
    orange: { bg: 'rgba(234,88,12,0.1)',   text: '#c2410c' },
    green:  { bg: 'rgba(32,201,151,0.1)',  text: '#20c997' },
  };
  const c = colorMap[color] || colorMap.gold;
  return (
    <div className="contact-info-row">
      <div
        className="contact-info-icon flex-shrink-0"
        style={{ background: c.bg, color: c.text }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-grow-1">
        <div className="contact-info-label">{label}</div>
        {href ? (
          <a href={href} className="small fw-semibold text-dark text-decoration-none text-break" style={{ color: '#292929' }}>
            {value}
          </a>
        ) : (
          <div className="small fw-semibold text-break" style={{ color: '#292929' }}>{value}</div>
        )}
      </div>
    </div>
  );
};

/* ── Contact card (Dept / Directorate) ── */
const ContactCard = ({ item, isHindi }) => {
  const isPrimary = item.color === 'primary';
  return (
    <div className="contact-dept-card">
      <div className={`contact-dept-card-accent-bar${isPrimary ? '' : ' green'}`} />
      <div className={`contact-dept-card-header${isPrimary ? '' : ' green'}`}>
        <div className="d-flex align-items-center gap-3">
          <div
            className={`pub-icon-box ${isPrimary ? 'pub-icon-box-blue' : 'pub-icon-box-teal'}`}
            style={{ width: 54, height: 54, borderRadius: 14, fontSize: 22 }}
            aria-hidden="true"
          >
            <FaBuilding />
          </div>
          <div>
            <span
              className="d-block mb-1 fw-bold"
              style={{ fontSize: '0.64rem', letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', color: isPrimary ? '#805c00' : '#16805d' }}
            >
              {item.badge}
            </span>
            <h3 className="h5 fw-semibold mb-0 lh-sm" style={{ color: 'var(--pub-navy-900)' }}>{item.title}</h3>
            <small style={{ color: '#746f64' }}>{item.subtitle}</small>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <ContactRow icon={<FaMapMarkerAlt />} label={isHindi ? 'कार्यालय पता' : 'Office Address'} value={item.address} color={isPrimary ? 'gold' : 'green'} />
        {item.phone && (
          <ContactRow icon={<FaPhone />} label={isHindi ? 'फ़ोन' : 'Phone'} value={item.phone} href={`tel:${item.phone}`} color={isPrimary ? 'gold' : 'green'} />
        )}
        {item.fax && (
          <ContactRow icon={<FaFax />} label="Fax" value={item.fax} color={isPrimary ? 'gold' : 'green'} />
        )}
        <ContactRow icon={<FaEnvelope />} label="Email" value={item.email} href={`mailto:${item.email}`} color={isPrimary ? 'gold' : 'green'} />
      </div>

      {/* Decorative dots */}
      <div className="px-4 pb-3 d-flex gap-1 align-items-center" aria-hidden="true">
        <div style={{ width: 28, height: 4, borderRadius: 999, background: isPrimary ? '#d99a00' : '#16805d' }} />
        <div style={{ width: 14, height: 4, borderRadius: 999, background: isPrimary ? '#f5bd1f' : '#34d399' }} />
        <div style={{ width: 7,  height: 4, borderRadius: 999, background: isPrimary ? '#fff3c4' : '#ecfdf5' }} />
      </div>
    </div>
  );
};

/* ── Empty placeholder card ── */
const EmptyCard = ({ isDirectorate, isHindi }) => (
  <div className="contact-dept-card">
    <div className={`contact-dept-card-accent-bar${isDirectorate ? ' green' : ''}`} />
    <div className={`contact-dept-card-header${isDirectorate ? ' green' : ''}`}>
      <div className="d-flex align-items-center gap-3">
        <div
          className={`pub-icon-box ${isDirectorate ? 'pub-icon-box-teal' : 'pub-icon-box-blue'}`}
          style={{ width: 54, height: 54, borderRadius: 14, fontSize: 22 }}
          aria-hidden="true"
        >
          <FaBuilding />
        </div>
        <div>
          <span           style={{ fontSize: '0.64rem', letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', color: isDirectorate ? '#16805d' : '#805c00', fontWeight: 700, display: 'block', marginBottom: 4 }}>
            {isDirectorate ? 'CONTACT · HEAD OFFICE' : 'CONTACT · BRANCH OFFICE'}
          </span>
          <h3 className="h5 fw-semibold mb-0 lh-sm" style={{ color: 'var(--pub-navy-900)' }}>
            {isDirectorate ? (isHindi ? 'प्रधान कार्यालय' : 'Head Office') : (isHindi ? 'शाखा कार्यालय' : 'Branch Office')}
          </h3>
          <small style={{ color: '#746f64' }}>{isHindi ? 'बियॉन्डसेंड' : 'BeyondSend'}</small>
        </div>
      </div>
    </div>
    <div className="px-4 py-5 text-center">
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto ${isDirectorate ? 'pub-icon-box-teal' : 'pub-icon-box-blue'}`}
        style={{ width: 60, height: 60, fontSize: 24 }}
        aria-hidden="true"
      >
        <FaBuilding style={{ color: '#fff' }} />
      </div>
      <h6 className="fw-semibold mb-1" style={{ color: 'var(--pub-navy-800)' }}>
        {isDirectorate ? (isHindi ? 'कोई प्रधान कार्यालय रिकॉर्ड नहीं' : 'No Head Office Records') : (isHindi ? 'कोई शाखा कार्यालय रिकॉर्ड नहीं' : 'No Branch Office Records')}
      </h6>
      <small className="text-muted">{isHindi ? 'अभी कोई डेटा उपलब्ध नहीं है' : 'No data available for this section right now'}</small>
    </div>
  </div>
);

/* ══ Main Component ══ */
const Contact = () => {
  const { isHindi } = useLanguage();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [contactRes, cardsRes] = await Promise.all([
          apiClient.get('/contact/detail'),
          apiClient.get('/contact-card/detail'),
        ]);
        setContact(contactRes?.data || contactRes || {});
        setCards(cardsRes?.data || cardsRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const address    = contact?.address    || {};
  const officeHours = contact?.officeHours || {};
  const officials  = contact?.officials  || [];
  const deptCards  = cards.filter((c) => c.type === 'department');
  const dirCards   = cards.filter((c) => c.type === 'directorate');

  const topCards = [
    {
      icon: <FaMapMarkerAlt size={18} />,
      label: isHindi ? 'कार्यालय का पता' : 'Office Address',
      color: 'gold',
      content: (
        <address className="small mb-0" style={{ fontStyle: 'normal', color: '#4a463c', lineHeight: 1.7 }}>
          {address.addressLine}<br />
          {address.city}, {address.state}<br />
          {address.pincode}
        </address>
      ),
    },
    {
      icon: <FaPhone size={18} />,
      label: isHindi ? 'संपर्क विवरण' : 'Contact Details',
      color: 'teal',
      content: (
        <>
          {address.phone && (
            <p className="small mb-1" style={{ color: '#4a463c' }}>
              <FaPhone size={11} className="me-1" aria-hidden="true" />
              <a href={`tel:${address.phone}`} className="text-dark text-decoration-none fw-semibold">{address.phone}</a>
            </p>
          )}
          {address.email && (
            <p className="small mb-0" style={{ color: '#4a463c' }}>
              <FaEnvelope size={11} className="me-1" aria-hidden="true" />
              <a href={`mailto:${address.email}`} className="text-dark text-decoration-none fw-semibold">{address.email}</a>
            </p>
          )}
        </>
      ),
    },
    {
      icon: <FaClock size={18} />,
      label: isHindi ? 'कार्य समय' : 'Office Hours',
      color: 'orange',
      content: officeHours.weekdays ? (
        <>
          <p className="small mb-1" style={{ color: '#4a463c' }}>{officeHours.weekdays}</p>
          <p className="small mb-1" style={{ color: '#4a463c' }}>{officeHours.saturday}</p>
          <p className="small mb-0" style={{ color: '#4a463c' }}>{officeHours.sunday}</p>
        </>
      ) : (
        <p className="small mb-0 text-muted">{isHindi ? 'उपलब्ध नहीं' : 'Not Available'}</p>
      ),
    },
  ];

  const colorIconMap = {
    gold:   { bg: 'rgba(245,189,31,0.14)', color: '#805c00' },
    teal:   { bg: 'rgba(15,139,109,0.12)', color: '#087e62' },
    orange: { bg: 'rgba(234,88,12,0.1)',   color: '#c2410c' },
  };

  return (
    <PageLayout
      title="Contact Details"
      titleHi="संपर्क विवरण"
      description="Official contact details, support channels and team directory for BeyondSend."
      descriptionHi="बियॉन्डसेंड के आधिकारिक संपर्क विवरण, सहायता चैनल एवं टीम डायरेक्टरी।"
      showBreadcrumb
    >
      {loading && <PageLoader />}

      {/* ── Top Info Cards ── */}
      <Row className="g-3 mb-4">
        {topCards.map((card, i) => {
          const ic = colorIconMap[card.color] || colorIconMap.gold;
          return (
            <Col xs={12} md={4} key={i}>
              <div className="contact-top-card">
                <div className="contact-top-card-header">
                  <div
                    style={{ width: 38, height: 38, borderRadius: 10, background: ic.bg, color: ic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    aria-hidden="true"
                  >
                    {card.icon}
                  </div>
                  <h2 className="contact-top-card-title">{card.label}</h2>
                </div>
                <div className="p-3 p-md-4">{card.content}</div>
              </div>
            </Col>
          );
        })}
      </Row>

      {/* ── Key Officials ── */}
      <div className="pub-card mb-4">
        <div className="pub-card-header">
          <h2 className="pub-card-header-title">
            <span className="pub-icon-box pub-icon-box-violet" style={{ width: 34, height: 34, borderRadius: 9, fontSize: 15 }} aria-hidden="true">
              <FaUserTie />
            </span>
            {isHindi ? 'प्रमुख नेतृत्व एवं अधिकारी' : 'Leadership & Key Officials'}
          </h2>
        </div>
        <div className="px-3 px-md-4 py-2">
          <p className="text-muted small mb-3 mt-2">
            {isHindi ? 'बियॉन्डसेंड प्लेटफ़ॉर्म नेतृत्व एवं प्रमुख अधिकारी' : 'BeyondSend platform leadership and key officials'}
          </p>

          {/* Headers — desktop only */}
          <Row className="fw-semibold small text-muted border-bottom pb-2 mb-2 d-none d-md-flex">
            <Col md={2} className="text-center">{isHindi ? 'प्रोफाइल' : 'Profile'}</Col>
            <Col md={4}>{isHindi ? 'नाम व पद' : 'Name & Designation'}</Col>
            <Col md={3}>{isHindi ? 'संपर्क' : 'Contact'}</Col>
            <Col md={3}>{isHindi ? 'सोशल मीडिया' : 'Social Media'}</Col>
          </Row>

          {officials.length === 0 && (
            <p className="text-muted small text-center py-3">
              {isHindi ? 'कोई अधिकारी उपलब्ध नहीं' : 'No officials available'}
            </p>
          )}

          {officials.map((official) => (
            <Row key={official._id} className="align-items-center py-3 border-bottom g-2">
              {/* Avatar */}
              <Col xs={12} sm={3} md={2} className="text-center">
                <img
                  src={official.image ? `${API}${official.image}` : '/default-avatar.svg'}
                  alt={official.name}
                  className="official-avatar"
                  loading="lazy"
                  onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                />
              </Col>
              {/* Name */}
              <Col xs={12} sm={9} md={4} className="text-center text-sm-start">
                <div className="fw-semibold" style={{ color: 'var(--pub-navy-900)' }}>{official.name}</div>
                <div className="small text-muted">{official.designation}</div>
              </Col>
              {/* Contact */}
              <Col xs={12} sm={6} md={3} className="small text-break">
                {official.phone && (
                  <div className="mb-1">
                    <FaPhone size={11} className="me-1 text-muted" aria-hidden="true" />
                    <a href={`tel:${official.phone}`} className="text-dark text-decoration-none">{official.phone}</a>
                  </div>
                )}
                {official.email && (
                  <div>
                    <FaEnvelope size={11} className="me-1 text-muted" aria-hidden="true" />
                    <a href={`mailto:${official.email}`} className="text-dark text-decoration-none">{official.email}</a>
                  </div>
                )}
              </Col>
              {/* Social */}
              <Col xs={12} sm={6} md={3}>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <a
                    href={official.linkedin || "https://www.linkedin.com/company/beyondsend"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="official-social-btn d-inline-flex align-items-center justify-content-center shadow-sm text-decoration-none"
                    aria-label="LinkedIn"
                    title={`${official.name} on LinkedIn`}
                    style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}
                  >
                    <FaLinkedinIn size={15} style={{ color: "#0077b5" }} />
                  </a>
                  <a
                    href={official.facebook || "https://www.facebook.com/beyondsend"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="official-social-btn d-inline-flex align-items-center justify-content-center shadow-sm text-decoration-none"
                    aria-label="Facebook"
                    title={`${official.name} on Facebook`}
                    style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}
                  >
                    <FaFacebookF size={14} style={{ color: "#1877f2" }} />
                  </a>
                  <a
                    href={official.instagram || "https://www.instagram.com/beyondsend"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="official-social-btn d-inline-flex align-items-center justify-content-center shadow-sm text-decoration-none"
                    aria-label="Instagram"
                    title={`${official.name} on Instagram`}
                    style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}
                  >
                    <FaInstagram size={15} style={{ color: "#e4405f" }} />
                  </a>
                  <a
                    href={official.youtube || "https://www.youtube.com/@beyondsend"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="official-social-btn d-inline-flex align-items-center justify-content-center shadow-sm text-decoration-none"
                    aria-label="YouTube"
                    title={`${official.name} on YouTube`}
                    style={{ width: "36px", height: "36px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}
                  >
                    <FaYoutube size={15} style={{ color: "#ff0000" }} />
                  </a>
                </div>
              </Col>
            </Row>
          ))}
        </div>
      </div>

      {/* ── Department & Directorate Cards ── */}
      <Row className="g-0 mb-4">
        <Col xs={12} lg={6} className="pe-lg-2">
          {deptCards.length > 0
            ? deptCards.map((item, i) => <ContactCard key={i} item={item} isHindi={isHindi} />)
            : <EmptyCard isDirectorate={false} isHindi={isHindi} />}
        </Col>
        <Col xs={12} lg={6} className="ps-lg-2">
          {dirCards.length > 0
            ? dirCards.map((item, i) => <ContactCard key={i} item={item} isHindi={isHindi} />)
            : <EmptyCard isDirectorate isHindi={isHindi} />}
        </Col>
      </Row>

      {/* ── Office Image ── */}
      <div className="mb-2">
        <img
          src={officeImage}
          alt={isHindi ? 'बियॉन्डसेंड कार्यालय' : 'BeyondSend Office'}
          className="img-fluid w-100 mt-3"
          style={{ maxHeight: 400, objectFit: 'cover', borderRadius: 'var(--pub-radius)', boxShadow: 'var(--pub-shadow-lg)' }}
          loading="lazy"
        />
      </div>
    </PageLayout>
  );
};

export default Contact;
