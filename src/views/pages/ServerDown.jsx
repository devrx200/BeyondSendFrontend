import { useState, useEffect } from 'react';
import {
  Container, Row, Col,
  Card, CardHeader, CardBody,
  Badge, Button, Spinner,
} from 'reactstrap';
import { FaPhone, FaEnvelope, FaGlobe, FaSyncAlt, FaLanguage } from 'react-icons/fa';

const CONTENT = {
  en: {
    badge:     'SERVER UNAVAILABLE',
    title:     "We'll be back shortly",
    desc:      'Our servers are currently unavailable or undergoing scheduled maintenance. We apologise for the inconvenience. Services will be restored as soon as possible.',
    helpline:  'Helpline Number',
    email:     'Support Email',
    website:   'Official Website',
    retry:     'Retry Connection',
    checking:  'Checking...',
    managed:   'Managed By National Informatics Centre (NIC)',
    copyright: 'Department of Higher Education, Government of Chhattisgarh. All Rights Reserved.',
    deptName:  'Department of Higher Education',
    govtName:  'Government of Chhattisgarh · उच्च शिक्षा विभाग',
  },
  hi: {
    badge:     'सर्वर अनुपलब्ध',
    title:     'हम जल्द ही वापस आएंगे',
    desc:      'हमारे सर्वर वर्तमान में अनुपलब्ध हैं या निर्धारित रखरखाव से गुजर रहे हैं। असुविधा के लिए हम क्षमा चाहते हैं। सेवाएँ जल्द से जल्द बहाल कर दी जाएंगी।',
    helpline:  'हेल्पलाइन नंबर',
    email:     'सहायता ईमेल',
    website:   'आधिकारिक वेबसाइट',
    retry:     'पुनः प्रयास करें',
    checking:  'जाँच हो रही है...',
    managed:   'राष्ट्रीय सूचना विज्ञान केंद्र (NIC) द्वारा प्रबंधित',
    copyright: 'उच्च शिक्षा विभाग, छत्तीसगढ़ सरकार। सभी अधिकार सुरक्षित।',
    deptName:  'उच्च शिक्षा विभाग',
    govtName:  'छत्तीसगढ़ सरकार · Department of Higher Education',
  },
};

const ServerDown = ({ onRetry, retrying }) => {
  const [dots,     setDots]     = useState('.');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const id = setInterval(() => setDots((p) => (p.length >= 3 ? '.' : p + '.')), 500);
    return () => clearInterval(id);
  }, []);

  const t = CONTENT[language];

  return (
    <div className="server-down-bg" role="main">
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} lg={10} xl={8}>
            <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

              {/* Header */}
              <CardHeader className="text-white border-0 p-3 p-md-4" style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#3b5bdb 100%)' }}>
                <Row className="align-items-center g-2">
                  <Col xs={12} sm={8} md={9}>
                    <div className="d-flex align-items-center gap-2 gap-md-3 flex-wrap">
                      <img src="/Chhattisgarh.svg" alt="Chhattisgarh" style={{ height: 'clamp(36px,5vw,48px)', width: 'auto' }} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <h1 className="mb-0 fw-bold text-white fs-6 lh-1 text-truncate">{t.deptName}</h1>
                        <p className="mb-0 text-white-50 small text-truncate">{t.govtName}</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4} md={3}>
                    <div className="d-flex align-items-center justify-content-start justify-content-sm-end gap-2 flex-wrap">
                      <img src="/Digital_India_logo.svg" alt="Digital India" className="bg-white p-1 rounded" style={{ height: 'clamp(26px,3.5vw,36px)', width: 'auto' }} />
                      <img src="/Emblem_of_India.svg"    alt="India Emblem" className="bg-white p-1 rounded" style={{ height: 'clamp(36px,5vw,52px)',  width: 'auto' }} />
                    </div>
                  </Col>
                </Row>
              </CardHeader>

              {/* Body */}
              <CardBody className="text-center bg-white p-3 p-md-4 p-lg-5">
                {/* Server SVG */}
                <div className="mx-auto mb-3 mb-md-4" style={{ maxWidth: 140 }} aria-hidden="true">
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-100" style={{ height: 'auto' }}>
                    <rect x="20" y="20" width="80" height="80" rx="8" fill="#1e3a8a" opacity="0.12" />
                    <rect x="28" y="28" width="64" height="64" rx="4" fill="#1e3a8a" opacity="0.06" />
                    <rect x="32" y="34" width="56" height="14" rx="2" fill="#1e3a8a" opacity="0.15" />
                    <circle cx="40" cy="41" r="3" fill="#10b981"><animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" /></circle>
                    <rect x="48" y="38" width="32" height="6" rx="1" fill="#1e3a8a" opacity="0.08" />
                    <rect x="32" y="52" width="56" height="14" rx="2" fill="#1e3a8a" opacity="0.15" />
                    <circle cx="40" cy="59" r="3" fill="#10b981"><animate attributeName="opacity" values="1;0.2;1" dur="1.0s" repeatCount="indefinite" /></circle>
                    <rect x="48" y="56" width="32" height="6" rx="1" fill="#1e3a8a" opacity="0.08" />
                    <rect x="32" y="70" width="56" height="14" rx="2" fill="#1e3a8a" opacity="0.15" />
                    <circle cx="40" cy="77" r="3" fill="#ef4444"><animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" /></circle>
                    <rect x="48" y="74" width="32" height="6" rx="1" fill="#1e3a8a" opacity="0.08" />
                    <g transform="translate(60,60)">
                      <circle cx="0" cy="0" r="48" stroke="#1e3a8a" strokeWidth="2" opacity="0.1" />
                      <circle cx="0" cy="0" r="48" stroke="#3b5bdb" strokeWidth="3" opacity="0.25" strokeDasharray="80 240" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
                      </circle>
                    </g>
                    <circle cx="60" cy="60" r="12" fill="#3b5bdb" opacity="0.08">
                      <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.15;0.02;0.15" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="60" y="66" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#dc3545">!</text>
                  </svg>
                </div>

                <Badge color="danger" pill className="px-3 py-2 mb-3" style={{ fontSize: 'clamp(0.6rem,1vw,0.75rem)', letterSpacing: '0.8px' }}>
                  {t.badge}
                </Badge>

                <h2 className="fw-bold mb-3 fs-4">
                  {t.title}
                  <span className="d-inline-block" style={{ minWidth: '1.2em', textAlign: 'left' }} aria-hidden="true">{dots}</span>
                </h2>

                <p className="text-muted mx-auto mb-4 small" style={{ maxWidth: 520 }}>{t.desc}</p>

                <hr className="my-4" />

                {/* Contact grid */}
                <Row className="g-2 g-md-3 text-start mb-4">
                  <Col xs={12} md={6}>
                    <div className="bg-light border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-start gap-2">
                        <FaPhone className="flex-shrink-0 mt-1 text-primary" style={{ fontSize: 'clamp(16px,2vw,20px)' }} aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="small text-muted">{t.helpline}</div>
                          <strong className="small d-block text-truncate">+91-771-2221234</strong>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className="bg-light border rounded-3 p-3 h-100">
                      <div className="d-flex align-items-start gap-2">
                        <FaEnvelope className="flex-shrink-0 mt-1 text-primary" style={{ fontSize: 'clamp(16px,2vw,20px)' }} aria-hidden="true" />
                        <div className="min-w-0 w-100">
                          <div className="small text-muted">{t.email}</div>
                          <strong className="small d-block text-truncate">wim.higheredu-cg@gov.in</strong>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="bg-light border rounded-3 p-3">
                      <div className="d-flex align-items-start gap-2">
                        <FaGlobe className="flex-shrink-0 mt-1 text-primary" style={{ fontSize: 'clamp(16px,2vw,20px)' }} aria-hidden="true" />
                        <div className="min-w-0 w-100">
                          <div className="small text-muted">{t.website}</div>
                          <a href="https://highereducation.cg.gov.in" target="_blank" rel="noopener noreferrer"
                            className="fw-semibold text-decoration-none small d-block text-truncate" style={{ color: '#0056b3' }}>
                            https://highereducation.cg.gov.in
                          </a>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Retry */}
                <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
                  <Button color="primary" size="md" className="rounded-3 fw-semibold px-4 w-100 w-sm-auto"
                    style={{ minWidth: 'clamp(180px,25vw,240px)' }}
                    onClick={onRetry} disabled={retrying}>
                    {retrying
                      ? <><Spinner size="sm" className="me-2" />{t.checking}</>
                      : <><FaSyncAlt className="me-2" />{t.retry}</>}
                  </Button>
                </div>

                <hr className="my-4" />

                <img src="/nic-logo.jpg" alt="National Informatics Centre"
                  style={{ height: 'clamp(28px,3.5vw,40px)', width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />

                <hr className="my-3" />

                <p className="fw-bold small text-center mb-0">{t.managed}</p>
              </CardBody>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4 small text-muted px-2">
              © {new Date().getFullYear()} {t.copyright}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Language toggle */}
      <Button
        color="light"
        className="rounded-pill shadow-lg d-flex align-items-center gap-2 border-0 fw-semibold"
        style={{
          position: 'fixed', bottom: 24, right: 24,
          padding: '10px 18px', fontSize: 'clamp(0.75rem,1.2vw,0.9rem)',
          background: '#5162ff', color: '#fff',
          boxShadow: '0 8px 24px rgba(81,98,255,0.35)',
          zIndex: 1050,
        }}
        onClick={() => setLanguage((p) => (p === 'en' ? 'hi' : 'en'))}
        aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      >
        <FaLanguage size={16} aria-hidden="true" />
        {language === 'en' ? 'हिंदी' : 'English'}
      </Button>
    </div>
  );
};

export default ServerDown;
