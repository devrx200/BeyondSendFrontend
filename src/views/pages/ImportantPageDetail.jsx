import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Container, Row, Col, Spinner } from 'reactstrap';
import {
  FaCalendarAlt, FaCalendarPlus, FaChevronLeft,
  FaDownload, FaHome, FaList, FaPrint, FaArrowLeft,
} from 'react-icons/fa';
import { FaTicketSimple } from 'react-icons/fa6';
import axios from 'axios';
import PageLoader from '../../components/PageLoader';
import { useLanguage } from '../../contexts/LanguageContext';

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = 'BeyondSend';

const formatDateTime = (date, isHindi) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const ImportantPageDetail = ({ prefetchedData = null }) => {
  const { slug }    = useParams();
  const { isHindi } = useLanguage();

  const [detail,  setDetail]  = useState(prefetchedData);
  const [loading, setLoading] = useState(!prefetchedData);

  useEffect(() => {
    if (prefetchedData) { setDetail(prefetchedData); setLoading(false); }
  }, [prefetchedData]);

  useEffect(() => {
    if (prefetchedData) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/important-page/${slug}`);
        if (mounted) setDetail(res.data.data);
      } catch (err) {
        console.error(err);
        if (mounted) setDetail(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug, prefetchedData]);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content')?.innerHTML || '';
    const currentUrl   = window.location.href;
    const printDate    = new Date().toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
    const win = window.open('', '', 'width=1200,height=950');
    win.document.write(`
      <html lang="${isHindi ? 'hi' : 'en'}">
        <head>
          <title>${detail?.titleEn || ''}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: "Times New Roman", serif; padding: 40px; line-height: 1.6; color: #000; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 18px; font-weight: bold; }
            .title { text-align: center; margin: 20px 0; font-size: 20px; font-weight: bold; }
            .content { margin-top: 20px; font-size: 15px; }
            .footer { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; display: flex; justify-content: space-between; }
            .official-note { margin-top: 30px; font-size: 13px; font-style: italic; text-align: center; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${isHindi ? 'बियॉन्डसेंड, भारत' : 'BeyondSend, India'}</h2>
          </div>
          <div class="title">${isHindi ? detail?.titleHi : detail?.titleEn}</div>
          <div class="content">${printContent}</div>
          <div class="official-note">
            ${isHindi ? 'यह दस्तावेज़ BeyondSend के आधिकारिक पोर्टल से मुद्रित किया गया है।' : 'This document is printed from the official BeyondSend platform.'}
            <br/><b>URL: ${currentUrl}</b>
          </div>
          <div class="footer">
            <div>${isHindi ? 'प्रकाशन तिथि' : 'Created On'}: ${formatDateTime(detail?.createdAt, isHindi)}</div>
            <div>${isHindi ? 'अपडेट' : 'Updated On'}: ${formatDateTime(detail?.updatedAt, isHindi)}</div>
            <div>${isHindi ? 'प्रिंट दिनांक' : 'Printed On'}: ${printDate}</div>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'लोड हो रहा है...' : 'Loading...'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <PageLoader inline={true} />
      </>
    );
  }

  /* 404 */
  if (!detail) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'पृष्ठ नहीं मिला' : 'Page Not Found'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
          <meta name="description" content={isHindi ? 'अनुरोधित पृष्ठ मौजूद नहीं है' : 'The requested page does not exist'} />
        </Helmet>
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="pub-card text-center" style={{ borderRadius: 'var(--pub-radius-lg)' }}>
                <div className="detail-card-header">
                  <div className="pub-dot-grid" aria-hidden="true" />
                </div>
                <div className="p-5">
                  <p className="fw-bold mb-3" style={{ fontSize: '80px', background: 'linear-gradient(135deg, #4f6ef7, #00c5eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</p>
                  <h1 className="h4 fw-semibold mb-2" style={{ fontFamily: 'var(--pub-font)', color: 'var(--pub-default)' }}>
                    {isHindi ? 'उफ़! पृष्ठ नहीं मिला' : 'Oops! Page Not Found'}
                  </h1>
                  <p className="text-muted mb-4">
                    {isHindi
                      ? 'आप जिस पृष्ठ को खोज रहे हैं, उसे हटा दिया गया होगा।'
                      : 'The page you are looking for might have been removed or is temporarily unavailable.'}
                  </p>
                  <Link to="/" className="rich-action-btn rich-action-btn-primary" style={{ display: 'inline-flex' }}>
                    <FaHome size={14} />
                    {isHindi ? 'होम पर जाएं' : 'Go to Home'}
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  }

  const pageTitle       = (isHindi ? detail.titleHi : detail.titleEn) || '';
  const rawDesc         = (isHindi ? detail.descriptionHi : detail.descriptionEn) || '';
  const metaDescription = (() => {
    const text = stripHtml(rawDesc);
    return text.length > 160 ? text.substring(0, 157) + '...' : text;
  })();
  const canonicalUrl = `${window.location.origin}/important-page/${slug}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{`${pageTitle} - ${SITE_TITLE_SUFFIX}`}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta name="keywords" content={`${isHindi ? detail.titleHi : detail.titleEn}, important page, official announcement`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${pageTitle} - ${SITE_TITLE_SUFFIX}`} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={pageTitle} />
        {metaDescription && <meta name="twitter:description" content={metaDescription} />}
        <meta name="author" content={SITE_TITLE_SUFFIX} />
      </Helmet>

      <Container className="rich-content-container">
        {/* Breadcrumb */}
        <div className="pub-breadcrumb mb-4">
          <Link to="/" className="d-inline-flex align-items-center gap-1">
            <FaHome size={13} aria-hidden="true" />
            {isHindi ? 'होम' : 'Home'}
          </Link>
          <span className="sep">›</span>
          <span className="active d-inline-flex align-items-center gap-1">
            <FaList size={13} className="flex-shrink-0" />
            <span className="text-truncate" style={{ maxWidth: '60vw' }}>{pageTitle}</span>
          </span>
        </div>

        <div className="pub-card overflow-hidden" style={{ borderRadius: 'var(--pub-radius-lg)' }}>
          {/* Gradient Header */}
          <div className="detail-card-header p-3 p-md-4">
            <div className="pub-dot-grid" aria-hidden="true" />
            <h1
              className="fw-bold mb-2 text-white d-flex align-items-start gap-2"
              style={{ fontFamily: 'var(--pub-font)', fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', letterSpacing: '-0.3px', lineHeight: 1.3, position: 'relative', zIndex: 1 }}
            >
              <FaTicketSimple size={20} className="mt-1 flex-shrink-0 opacity-90" aria-hidden="true" />
              <span>{pageTitle}</span>
            </h1>

            <hr style={{ borderColor: 'rgba(255,255,255,0.15)', margin: '12px 0' }} />

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ position: 'relative', zIndex: 1 }}>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="rich-meta-badge">
                  <FaCalendarAlt size={11} className="text-teal" />
                  <span className="fw-semibold">{isHindi ? 'प्रकाशन:' : 'Created:'}</span>
                  {formatDateTime(detail.createdAt, isHindi)}
                </span>
                <span className="rich-meta-badge">
                  <FaCalendarPlus size={11} />
                  <span className="fw-semibold">{isHindi ? 'अपडेट:' : 'Updated:'}</span>
                  {formatDateTime(detail.updatedAt, isHindi)}
                </span>
              </div>
              <Link to="/" className="rich-back-btn ms-auto ms-sm-0">
                <FaChevronLeft size={10} />
                {isHindi ? 'मुख्य पृष्ठ' : 'Back To Home'}
              </Link>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 p-md-5">
            <div
              id="printable-content"
              className="lh-lg cms-content"
              dangerouslySetInnerHTML={{ __html: rawDesc }}
            />

            <hr style={{ borderColor: '#e2e8f0', margin: '28px 0 20px' }} />

            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
              {detail.file && (
                <a
                  href={`${API}${detail.file}`}
                  download
                  className="rich-action-btn rich-action-btn-danger"
                >
                  <FaDownload size={13} aria-hidden="true" />
                  <span>{isHindi ? 'डाउनलोड' : 'Download'}</span>
                </a>
              )}
              <button
                onClick={handlePrint}
                className="rich-action-btn rich-action-btn-primary ms-auto"
              >
                <FaPrint size={13} aria-hidden="true" />
                <span>{isHindi ? 'प्रिंट करें' : 'Print'}</span>
              </button>
            </div>
          </div>

          {/* Centered Footer */}
          <div className="rich-card-footer justify-content-center text-center">
            <div className="rich-card-footer-note justify-content-center mx-auto">
              <span className="rich-footer-badge">BeyondSend</span>
              <span className="rich-footer-text">{isHindi ? 'पढ़ने के लिए धन्यवाद !' : 'Thanks For Reading !'}</span>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ImportantPageDetail;
