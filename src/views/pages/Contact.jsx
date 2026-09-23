import { useState, useEffect } from 'react';
import { Row, Col } from 'reactstrap';
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaUserTie,
  FaEnvelope, FaBuilding, FaUniversity, FaFax,
} from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import PageLoader from '../../components/PageLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import officeImage from '/image.png';

const API = import.meta.env.VITE_API_URL;

/* ── Reusable contact info row ── */
const ContactRow = ({ icon, label, value, href, color = 'blue' }) => {
  const colorMap = {
    blue:   { bg: 'rgba(79,110,247,0.1)',  text: '#4f6ef7' },
    teal:   { bg: 'rgba(0,197,235,0.1)',   text: '#00c5eb' },
    gold:   { bg: 'rgba(254,147,101,0.1)', text: '#ea580c' },
    violet: { bg: 'rgba(79,110,247,0.1)',  text: '#4f6ef7' },
    green:  { bg: 'rgba(32,201,151,0.1)',  text: '#20c997' },
  };
  const c = colorMap[color] || colorMap.blue;
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
          <a href={href} className="small fw-semibold text-dark text-decoration-none text-break" style={{ color: '#1e293b' }}>
            {value}
          </a>
        ) : (
          <div className="small fw-semibold text-break" style={{ color: '#1e293b' }}>{value}</div>
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
              style={{ fontSize: '0.64rem', letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', color: isPrimary ? '#4f6ef7' : '#20c997' }}
            >
              {item.badge}
            </span>
            <h3 className="h5 fw-semibold mb-0 lh-sm" style={{ color: 'var(--pub-navy-900)' }}>{item.title}</h3>
            <small style={{ color: '#64748b' }}>{item.subtitle}</small>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <ContactRow icon={<FaMapMarkerAlt />} label={isHindi ? 'कार्यालय पता' : 'Office Address'} value={item.address} color={isPrimary ? 'blue' : 'green'} />
        {item.phone && (
          <ContactRow icon={<FaPhone />} label={isHindi ? 'फ़ोन' : 'Phone'} value={item.phone} href={`tel:${item.phone}`} color={isPrimary ? 'blue' : 'green'} />
        )}
        {item.fax && (
          <ContactRow icon={<FaFax />} label="Fax" value={item.fax} color={isPrimary ? 'blue' : 'green'} />
        )}
        <ContactRow icon={<FaEnvelope />} label="Email" value={item.email} href={`mailto:${item.email}`} color={isPrimary ? 'blue' : 'green'} />
      </div>

      {/* Decorative dots */}
      <div className="px-4 pb-3 d-flex gap-1 align-items-center" aria-hidden="true">
        <div style={{ width: 28, height: 4, borderRadius: 999, background: isPrimary ? '#4f6ef7' : '#20c997' }} />
        <div style={{ width: 14, height: 4, borderRadius: 999, background: isPrimary ? '#748ffc' : '#34d399' }} />
        <div style={{ width: 7,  height: 4, borderRadius: 999, background: isPrimary ? '#edf2ff' : '#ecfdf5' }} />
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
          {isDirectorate ? <FaUniversity /> : <FaBuilding />}
        </div>
        <div>
          <span style={{ fontSize: '0.64rem', letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase', color: isDirectorate ? '#20c997' : '#4f6ef7', fontWeight: 700, display: 'block', marginBottom: 4 }}>
            {isDirectorate ? 'CONTACT · HEAD OFFICE' : 'CONTACT · BRANCH OFFICE'}
          </span>
          <h3 className="h5 fw-semibold mb-0 lh-sm" style={{ color: 'var(--pub-navy-900)' }}>
            {isDirectorate ? (isHindi ? 'प्रधान कार्यालय' : 'Head Office') : (isHindi ? 'शाखा कार्यालय' : 'Branch Office')}
          </h3>
          <small style={{ color: '#64748b' }}>{isHindi ? 'बियॉन्डसेंड' : 'BeyondSend'}</small>
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
          axios.get(`${API}/api/contact`),
          axios.get(`${API}/api/contact-card/get`),
        ]);
        setContact(contactRes.data.data);
        setCards(cardsRes.data.data || []);
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
      color: 'blue',
      content: (
        <address className="small mb-0" style={{ fontStyle: 'normal', color: '#334155', lineHeight: 1.7 }}>
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
            <p className="small mb-1" style={{ color: '#334155' }}>
              <FaPhone size={11} className="me-1" aria-hidden="true" />
              <a href={`tel:${address.phone}`} className="text-dark text-decoration-none fw-semibold">{address.phone}</a>
            </p>
          )}
          {address.email && (
            <p className="small mb-0" style={{ color: '#334155' }}>
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
      color: 'gold',
      content: officeHours.weekdays ? (
        <>
          <p className="small mb-1" style={{ color: '#334155' }}>{officeHours.weekdays}</p>
          <p className="small mb-1" style={{ color: '#334155' }}>{officeHours.saturday}</p>
          <p className="small mb-0" style={{ color: '#334155' }}>{officeHours.sunday}</p>
        </>
      ) : (
        <p className="small mb-0 text-muted">{isHindi ? 'उपलब्ध नहीं' : 'Not Available'}</p>
      ),
    },
  ];

  const colorIconMap = {
    blue:  { bg: 'rgba(79,110,247,0.1)', color: '#4f6ef7' },
    teal:  { bg: 'rgba(0,197,235,0.1)',  color: '#00c5eb' },
    gold:  { bg: 'rgba(254,147,101,0.1)', color: '#ea580c' },
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
          const ic = colorIconMap[card.color] || colorIconMap.blue;
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
                <div className="d-flex gap-2 flex-wrap">
                  {official.facebook && (
                    <a href={official.facebook} target="_blank" rel="noreferrer noopener" className="official-social-btn" aria-label="Facebook">
                      <i className="bi bi-facebook text-primary" aria-hidden="true" />
                    </a>
                  )}
                  {official.instagram && (
                    <a href={official.instagram} target="_blank" rel="noreferrer noopener" className="official-social-btn" aria-label="Instagram">
                      <i className="bi bi-instagram text-danger" aria-hidden="true" />
                    </a>
                  )}
                  {official.linkedin && (
                    <a href={official.linkedin} target="_blank" rel="noreferrer noopener" className="official-social-btn" aria-label="LinkedIn">
                      <i className="bi bi-linkedin" style={{ color: '#0a66c2' }} aria-hidden="true" />
                    </a>
                  )}
                  {official.youtube && (
                    <a href={official.youtube} target="_blank" rel="noreferrer noopener" className="official-social-btn" aria-label="YouTube">
                      <i className="bi bi-youtube text-danger" aria-hidden="true" />
                    </a>
                  )}
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
