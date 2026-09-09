import { useState, useEffect } from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import {
  FaMapMarkerAlt, FaPhone, FaClock, FaUserTie,
  FaEnvelope, FaBuilding, FaUniversity, FaFax,
} from 'react-icons/fa';
import PageLayout from '../../components/PageLayout';
import PageLoader from '../../components/PageLoader';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from 'axios';
import indrawatiBhavan from '/indrawati-bhavan.png';

const API = import.meta.env.VITE_API_URL;

/* ── Reusable contact info row ── */
const ContactRow = ({ icon, label, value, href, colorClass = 'bg-primary' }) => (
  <div className="contact-info-row">
    <div className={`contact-info-icon ${colorClass} bg-opacity-10`}>
      <span className={`text-${colorClass.replace('bg-', '')}`}>{icon}</span>
    </div>
    <div className="min-w-0 flex-grow-1">
      <div className="contact-info-label">{label}</div>
      {href ? (
        <a href={href} className="small fw-semibold text-dark text-decoration-none text-break">
          {value}
        </a>
      ) : (
        <div className="small fw-semibold text-dark text-break">{value}</div>
      )}
    </div>
  </div>
);

/* ── Contact card (Dept / Directorate) ── */
const ContactCard = ({ item, isHindi }) => {
  const isPrimary = item.color === 'primary';
  const accent    = isPrimary ? 'primary' : 'success';
  const bgGrad    = isPrimary
    ? 'linear-gradient(135deg,#e8f0fe 0%,#fff 70%)'
    : 'linear-gradient(135deg,#d1fae5 0%,#fff 70%)';
  const border    = isPrimary
    ? 'rgba(13,110,253,0.1)' : 'rgba(25,135,84,0.1)';

  return (
    <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4">
      <div className={`bg-${accent}`} style={{ height: 5 }} />
      <div className="px-4 pt-4 pb-3" style={{ background: bgGrad, borderBottom: `1px solid ${border}` }}>
        <div className="d-flex align-items-center gap-3">
          <div
            className={`d-flex align-items-center justify-content-center rounded-3 bg-${accent} text-white shadow-sm flex-shrink-0`}
            style={{ width: 54, height: 54, fontSize: 22 }}
            aria-hidden="true"
          >
            <FaBuilding />
          </div>
          <div>
            <span className={`badge bg-${accent} rounded-pill mb-1 fw-semibold`} style={{ fontSize: '0.6rem', letterSpacing: '0.08em', opacity: 0.85 }}>
              {item.badge}
            </span>
            <h3 className="h5 fw-semibold mb-0 lh-sm">{item.title}</h3>
            <small className="text-muted">{item.subtitle}</small>
          </div>
        </div>
      </div>

      <CardBody className="px-4 py-3">
        <ContactRow icon={<FaMapMarkerAlt />} label={isHindi ? 'कार्यालय पता' : 'Office Address'} value={item.address} colorClass={`bg-${accent}`} />
        {item.phone && (
          <ContactRow icon={<FaPhone />} label={isHindi ? 'फ़ोन' : 'Phone'} value={item.phone} href={`tel:${item.phone}`} colorClass={`bg-${accent}`} />
        )}
        {item.fax && (
          <ContactRow icon={<FaFax />} label="Fax" value={item.fax} colorClass={`bg-${accent}`} />
        )}
        <ContactRow icon={<FaEnvelope />} label="Email" value={item.email} href={`mailto:${item.email}`} colorClass={`bg-${accent}`} />
      </CardBody>

      {/* Decorative dots */}
      <div className="px-4 pb-3 d-flex gap-1 align-items-center" aria-hidden="true">
        <div className={`bg-${accent} rounded-pill`} style={{ width: 28, height: 4 }} />
        <div className="rounded-pill" style={{ width: 14, height: 4, background: isPrimary ? '#4f83e7' : '#0e9f6e' }} />
        <div className="rounded-pill" style={{ width: 7,  height: 4, background: isPrimary ? '#c7d8fc' : '#bbf7d0' }} />
      </div>
    </Card>
  );
};

/* ── Empty placeholder card ── */
const EmptyCard = ({ isDirectorate, isHindi }) => (
  <Card className="h-100 border-0 shadow rounded-4 overflow-hidden mt-4">
    <div className={`bg-${isDirectorate ? 'success' : 'primary'}`} style={{ height: 5 }} />
    <div
      className="px-4 pt-4 pb-3"
      style={{
        background: isDirectorate ? 'linear-gradient(135deg,#d1fae5 0%,#fff 70%)' : 'linear-gradient(135deg,#e8f0fe 0%,#fff 70%)',
        borderBottom: isDirectorate ? '1px solid rgba(25,135,84,0.1)' : '1px solid rgba(13,110,253,0.1)',
      }}
    >
      <div className="d-flex align-items-center gap-3">
        <div
          className={`d-flex align-items-center justify-content-center rounded-3 bg-${isDirectorate ? 'success' : 'primary'} text-white shadow-sm flex-shrink-0`}
          style={{ width: 54, height: 54, fontSize: 22 }}
          aria-hidden="true"
        >
          {isDirectorate ? <FaUniversity /> : <FaBuilding />}
        </div>
        <div>
          <span className={`badge bg-${isDirectorate ? 'success' : 'primary'} rounded-pill mb-1 fw-semibold`} style={{ fontSize: '0.6rem', letterSpacing: '0.08em', opacity: 0.85 }}>
            {isDirectorate ? 'DIRECTORATE · HIGHER EDUCATION' : 'DEPT. OF HIGHER EDUCATION'}
          </span>
          <h3 className="h5 fw-semibold mb-0 lh-sm" style={{ color: '#1a1f36' }}>
            {isDirectorate
              ? (isHindi ? 'उच्च शिक्षा निदेशालय' : 'Directorate of Higher Education')
              : (isHindi ? 'उच्च शिक्षा विभाग' : 'Department of Higher Education')}
          </h3>
          <small className="text-muted">{isHindi ? 'छत्तीसगढ़ सरकार' : 'Government of Chhattisgarh'}</small>
        </div>
      </div>
    </div>
    <CardBody className="px-4 py-5 text-center">
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle mb-3 mx-auto bg-${isDirectorate ? 'success' : 'primary'} bg-opacity-10`}
        style={{ width: 60, height: 60, fontSize: 24 }}
        aria-hidden="true"
      >
        <FaBuilding className={`text-${isDirectorate ? 'success' : 'primary'}`} />
      </div>
      <h6 className="fw-semibold mb-1">
        {isDirectorate
          ? (isHindi ? 'कोई निदेशालय रिकॉर्ड नहीं' : 'No Directorate Records')
          : (isHindi ? 'कोई विभागीय रिकॉर्ड नहीं' : 'No Department Records')}
      </h6>
      <small className="text-muted">{isHindi ? 'अभी कोई डेटा उपलब्ध नहीं है' : 'No data available for this section right now'}</small>
    </CardBody>
  </Card>
);

/* ══ Main Component ══ */
const Contact = () => {
  const { isHindi } = useLanguage();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cards,   setCards]   = useState([]);

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

  if (loading) {
    return (
      <PageLayout
        title="Contact Details"
        titleHi="संपर्क विवरण"
        showBreadcrumb
      >
        <PageLoader inline={true} />
      </PageLayout>
    );
  }

  const address      = contact?.address      || {};
  const officeHours  = contact?.officeHours  || {};
  const officials    = contact?.officials    || [];
  const deptCards    = cards.filter((c) => c.type === 'department');
  const dirCards     = cards.filter((c) => c.type === 'directorate');

  return (
    <PageLayout
      title="Contact Details"
      titleHi="संपर्क विवरण"
      description="Official contact details, helpline numbers, and directory for the Department of Higher Education, Government of Chhattisgarh."
      descriptionHi="उच्च शिक्षा विभाग, छत्तीसगढ़ शासन के आधिकारिक संपर्क विवरण, हेल्पलाइन नंबर एवं पता।"
      showBreadcrumb
    >
      {/* ── Top Info Cards ── */}
      <Row className="g-4 mb-4">
        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h2 className="h6 fw-semibold mb-3 d-flex align-items-center gap-2">
                <FaMapMarkerAlt className="text-primary" aria-hidden="true" />
                {isHindi ? 'कार्यालय का पता' : 'Office Address'}
              </h2>
              <address className="small text-muted mb-0" style={{ fontStyle: 'normal' }}>
                {address.addressLine}<br />
                {address.city}, {address.state}<br />
                {address.pincode}
              </address>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h2 className="h6 fw-semibold mb-3 d-flex align-items-center gap-2">
                <FaPhone className="text-success" aria-hidden="true" />
                {isHindi ? 'संपर्क विवरण' : 'Contact Details'}
              </h2>
              {address.phone && (
                <p className="small mb-1 text-muted text-break">
                  <FaPhone size={11} className="me-1" aria-hidden="true" />
                  <a href={`tel:${address.phone}`} className="text-dark text-decoration-none">{address.phone}</a>
                </p>
              )}
              {address.email && (
                <p className="small text-muted mb-0 text-break">
                  <FaEnvelope size={11} className="me-1" aria-hidden="true" />
                  <a href={`mailto:${address.email}`} className="text-dark text-decoration-none">{address.email}</a>
                </p>
              )}
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody>
              <h2 className="h6 fw-semibold mb-3 d-flex align-items-center gap-2">
                <FaClock className="text-warning" aria-hidden="true" />
                {isHindi ? 'कार्य समय' : 'Office Hours'}
              </h2>
              {officeHours.weekdays ? (
                <>
                  <p className="small mb-1 text-muted">{officeHours.weekdays}</p>
                  <p className="small mb-1 text-muted">{officeHours.saturday}</p>
                  <p className="small mb-0 text-muted">{officeHours.sunday}</p>
                </>
              ) : (
                <p className="small text-muted mb-0">{isHindi ? 'उपलब्ध नहीं' : 'Not Available'}</p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── Key Officials ── */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <CardBody>
              <h2 className="h5 mb-1 d-flex align-items-center gap-2">
                <FaUserTie className="text-primary" aria-hidden="true" />
                {isHindi ? 'मुख्य अधिकारी' : 'Key Officials'}
              </h2>
              <p className="text-muted small mb-3">
                {isHindi ? 'विभाग के प्रमुख अधिकारी' : 'List of department key officials'}
              </p>

              {/* Column headers — desktop only */}
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
                  {/* Image */}
                  <Col xs={12} sm={3} md={2} className="text-center">
                    <img
                      src={official.image ? `${API}${official.image}` : '/default-avatar.svg'}
                      alt={official.name}
                      width={70}
                      height={70}
                      style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: '50%', border: '2px solid #e9ecef' }}
                      loading="lazy"
                      onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                    />
                  </Col>

                  {/* Name + Designation */}
                  <Col xs={12} sm={9} md={4} className="text-center text-sm-start">
                    <div className="fw-semibold">{official.name}</div>
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
                        <a href={official.facebook} target="_blank" rel="noreferrer noopener"
                          className="btn btn-light border d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }} aria-label="Facebook">
                          <i className="bi bi-facebook text-primary" aria-hidden="true" />
                        </a>
                      )}
                      {official.instagram && (
                        <a href={official.instagram} target="_blank" rel="noreferrer noopener"
                          className="btn btn-light border d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }} aria-label="Instagram">
                          <i className="bi bi-instagram text-danger" aria-hidden="true" />
                        </a>
                      )}
                      {official.linkedin && (
                        <a href={official.linkedin} target="_blank" rel="noreferrer noopener"
                          className="btn btn-light border d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }} aria-label="LinkedIn">
                          <i className="bi bi-linkedin text-info" aria-hidden="true" />
                        </a>
                      )}
                      {official.youtube && (
                        <a href={official.youtube} target="_blank" rel="noreferrer noopener"
                          className="btn btn-light border d-flex align-items-center justify-content-center"
                          style={{ width: 36, height: 36 }} aria-label="YouTube">
                          <i className="bi bi-youtube text-danger" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── Department & Directorate Cards ── */}
      <Row className="g-0">
        {/* Department */}
        <Col xs={12} lg={6} className="pe-lg-2">
          {deptCards.length > 0
            ? deptCards.map((item, i) => <ContactCard key={i} item={item} isHindi={isHindi} />)
            : <EmptyCard isDirectorate={false} isHindi={isHindi} />}
        </Col>

        {/* Directorate */}
        <Col xs={12} lg={6} className="ps-lg-2">
          {dirCards.length > 0
            ? dirCards.map((item, i) => <ContactCard key={i} item={item} isHindi={isHindi} />)
            : <EmptyCard isDirectorate isHindi={isHindi} />}
        </Col>
      </Row>

      {/* ── Building Image ── */}
      <Row className="mt-4">
        <Col>
          <img
            src={indrawatiBhavan}
            alt={isHindi ? 'इंद्रावती भवन' : 'Indrawati Bhavan'}
            className="img-fluid rounded-3 shadow-sm w-100"
            style={{ maxHeight: 400, objectFit: 'cover' }}
            loading="lazy"
          />
        </Col>
      </Row>
    </PageLayout>
  );
};

export default Contact;
