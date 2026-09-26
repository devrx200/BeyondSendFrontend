import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { FaPhone, FaEnvelope, FaGlobe, FaSyncAlt, FaLanguage, FaServer } from 'react-icons/fa';

const CONTENT = {
  en: {
    badge:       'SERVICE TEMPORARILY UNAVAILABLE',
    title:       "We'll be back shortly",
    desc:        'Our servers are currently unavailable or undergoing scheduled maintenance. We apologise for the inconvenience. Services will be restored as soon as possible.',
    supportDesk: 'Support Hours',
    email:       'Support Email',
    website:     'Official Website',
    retry:       'Retry Connection',
    checking:    'Checking...',
    managed:     'Operated By BeyondSend',
    copyright:   'BeyondSend. All Rights Reserved.',
    deptName:    'BeyondSend',
    platformSubtitle: 'Customer Communication & Marketing Automation Platform',
  },
  hi: {
    badge:       'सेवा अस्थायी रूप से अनुपलब्ध',
    title:       'हम जल्द ही वापस आएंगे',
    desc:        'हमारे सर्वर वर्तमान में अनुपलब्ध हैं या निर्धारित रखरखाव से गुजर रहे हैं। असुविधा के लिए हम क्षमा चाहते हैं। सेवाएँ जल्द से जल्द बहाल कर दी जाएंगी।',
    supportDesk: 'सहायता समय',
    email:       'सहायता ईमेल',
    website:     'आधिकारिक वेबसाइट',
    retry:       'पुनः प्रयास करें',
    checking:    'जाँच हो रही है...',
    managed:     'बियॉन्डसेंड द्वारा संचालित',
    copyright:   'बियॉन्डसेंड। सभी अधिकार सुरक्षित।',
    deptName:    'बियॉन्डसेंड',
    platformSubtitle: 'कस्टमर कम्युनिकेशन एवं मार्केटिंग ऑटोमेशन प्लेटफॉर्म',
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

  const infoItems = [
    {
      icon: <FaPhone />,
      label: t.supportDesk,
      value: 'Mon – Sat · 10:00 AM – 6:00 PM IST',
      href: null,
    },
    {
      icon: <FaEnvelope />,
      label: t.email,
      value: 'contact@beyondsend.in',
      href: 'mailto:contact@beyondsend.in',
    },
    {
      icon: <FaGlobe />,
      label: t.website,
      value: 'https://beyondsend.in',
      href: 'https://beyondsend.in/',
    },
  ];

  return (
    <div className="server-down-bg" role="main">
      <Container fluid>
        <Row className="justify-content-center w-100">
          <Col xs={12} lg={9} xl={7}>
            <div className="server-down-card">

              {/* Header */}
              <div className="server-down-header">
                <div className="pub-dot-grid" aria-hidden="true" />
                <div className="d-flex align-items-center gap-3 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
                  <img
                    src="/beyondsend-logo.svg"
                    alt="BeyondSend"
                    style={{ height: 'clamp(36px,5vw,48px)', width: 'auto', background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 12px', border: '1px solid rgba(255,255,255,0.15)' }}
                  />
                  <div className="min-w-0">
                    <h1 className="mb-0 fw-bold text-white fs-6 lh-1 text-truncate" style={{ fontFamily: 'var(--pub-font)', letterSpacing: '-0.2px' }}>
                      {t.deptName}
                    </h1>
                    <p className="mb-0 small text-truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.platformSubtitle}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="server-down-body">
                {/* Animated Server SVG */}
                <div className="mx-auto mb-4" style={{ maxWidth: 150 }} aria-hidden="true">
                  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-100" style={{ height: 'auto' }}>
                    <rect x="20" y="20" width="80" height="80" rx="8" fill="#0f172a" opacity="0.08" />
                    <rect x="28" y="28" width="64" height="64" rx="4" fill="#0f172a" opacity="0.04" />
                    <rect x="32" y="34" width="56" height="14" rx="3" fill="#0f172a" opacity="0.12" />
                    <circle cx="40" cy="41" r="3" fill="#10b981">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                    <rect x="48" y="38" width="32" height="6" rx="1.5" fill="#0f172a" opacity="0.07" />
                    <rect x="32" y="52" width="56" height="14" rx="3" fill="#0f172a" opacity="0.12" />
                    <circle cx="40" cy="59" r="3" fill="#10b981">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1.0s" repeatCount="indefinite" />
                    </circle>
                    <rect x="48" y="56" width="32" height="6" rx="1.5" fill="#0f172a" opacity="0.07" />
                    <rect x="32" y="70" width="56" height="14" rx="3" fill="#0f172a" opacity="0.12" />
                    <circle cx="40" cy="77" r="3" fill="#ef4444">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <rect x="48" y="74" width="32" height="6" rx="1.5" fill="#0f172a" opacity="0.07" />
                    <g transform="translate(60,60)">
                      <circle cx="0" cy="0" r="48" stroke="#3b82f6" strokeWidth="2" opacity="0.1" />
                      <circle cx="0" cy="0" r="48" stroke="#3b82f6" strokeWidth="3" opacity="0.25" strokeDasharray="80 240" strokeLinecap="round">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite" />
                      </circle>
                    </g>
                    <circle cx="60" cy="60" r="10" fill="#3b82f6" opacity="0.07">
                      <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.15;0.02;0.15" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <text x="60" y="66" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#dc2626">!</text>
                  </svg>
                </div>

                {/* Status badge */}
                <div className="d-flex justify-content-center mb-3">
                  <div className="server-down-badge">{t.badge}</div>
                </div>

                {/* Title */}
                <h2 className="server-down-title">
                  {t.title}
                  <span className="d-inline-block" style={{ minWidth: '1.2em', textAlign: 'left' }} aria-hidden="true">{dots}</span>
                </h2>

                <p className="server-down-desc">{t.desc}</p>

                <hr style={{ borderColor: '#f1f5f9', margin: '28px 0' }} />

                {/* Info boxes */}
                <Row className="g-3 text-start mb-4">
                  {infoItems.map((item, i) => (
                    <Col xs={12} md={i === 2 ? 12 : 6} key={i}>
                      <div className="server-info-box">
                        <div className="server-info-icon">{item.icon}</div>
                        <div className="min-w-0 w-100">
                          <div className="small text-muted" style={{ fontFamily: 'var(--pub-font)' }}>{item.label}</div>
                          {item.href ? (
                            <a
                              href={item.href}
                              target={item.href.startsWith('http') ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="fw-semibold text-decoration-none d-block text-truncate small"
                              style={{ color: 'var(--pub-navy-900)', fontFamily: 'var(--pub-font)' }}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <strong className="small d-block text-truncate" style={{ color: 'var(--pub-navy-800)', fontFamily: 'var(--pub-font)' }}>{item.value}</strong>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>

                {/* Retry button */}
                <div className="d-flex justify-content-center">
                  <button
                    className="server-retry-btn"
                    onClick={onRetry}
                    disabled={retrying}
                  >
                    {retrying ? (
                      <><FaSyncAlt className="me-2" style={{ animation: 'pubSpin 1s linear infinite' }} />{t.checking}</>
                    ) : (
                      <><FaSyncAlt className="me-2" />{t.retry}</>
                    )}
                  </button>
                </div>

                <hr style={{ borderColor: '#f1f5f9', margin: '28px 0' }} />

                <div className="d-flex flex-column align-items-center gap-2">
                  <img
                    src="/beyondsend-logo.svg"
                    alt="BeyondSend"
                    style={{ height: 'clamp(28px,3.5vw,40px)', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                  />
                  <p className="fw-semibold small mb-0" style={{ color: '#64748b', fontFamily: 'var(--pub-font)' }}>{t.managed}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="server-down-footer d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mt-4 pt-2 px-2 text-center text-sm-start">
              <span className="small order-2 order-sm-1" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--pub-font)' }}>
                © {new Date().getFullYear()} {t.copyright}
              </span>
              <button
                type="button"
                className="server-lang-toggle btn d-inline-flex align-items-center gap-2 order-1 order-sm-2"
                onClick={() => setLanguage((p) => (p === 'en' ? 'hi' : 'en'))}
                title={language === 'en' ? 'हिंदी में बदलें / Switch to Hindi' : 'Switch to English'}
                aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              >
                <FaLanguage size={18} aria-hidden="true" />
                <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
              </button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ServerDown;
