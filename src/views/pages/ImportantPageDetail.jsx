import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Row, Col, Card, CardBody, CardHeader, CardFooter,
  Badge, Button, Spinner, Breadcrumb, BreadcrumbItem,
} from 'reactstrap';
import {
  FaCalendarAlt, FaCalendarPlus, FaChevronLeft,
  FaDownload, FaHome, FaList, FaPrint,
} from 'react-icons/fa';
import { FaTicketSimple } from 'react-icons/fa6';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = 'Department of Higher Education, Government of Chhattisgarh India.';

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
            <h2>${isHindi ? 'उच्च शिक्षा विभाग, छत्तीसगढ़ शासन, भारत' : 'Department of Higher Education, Government of Chhattisgarh, India'}</h2>
          </div>
          <div class="title">${isHindi ? detail?.titleHi : detail?.titleEn}</div>
          <div class="content">${printContent}</div>
          <div class="official-note">
            ${isHindi ? 'यह दस्तावेज़ विभाग की आधिकारिक वेबसाइट से मुद्रित किया गया है।' : 'This document is printed from the official website of the department.'}
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

  /* Loading */
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'लोड हो रहा है...' : 'Loading...'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Container className="py-5 text-center">
          <Spinner color="primary" />
          <p className="mt-3 text-muted">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</p>
        </Container>
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
              <Card className="border-0 shadow-lg text-center rounded-4" style={{ background: 'linear-gradient(135deg,#f8fbff,#eef4ff)' }}>
                <CardBody className="p-5">
                  <p className="fw-bold mb-3" style={{ fontSize: '80px', color: '#0d6efd', lineHeight: 1 }}>404</p>
                  <h1 className="h4 fw-semibold mb-2">{isHindi ? 'उफ़! पृष्ठ नहीं मिला' : 'Oops! Page Not Found'}</h1>
                  <p className="text-muted mb-4">
                    {isHindi
                      ? 'आप जिस पृष्ठ को खोज रहे हैं, उसे हटा दिया गया होगा या अस्थायी रूप से अनुपलब्ध है।'
                      : 'The page you are looking for might have been removed or is temporarily unavailable.'}
                  </p>
                  <Button tag={Link} to="/" color="primary" size="lg" className="rounded-pill px-4">
                    <FaHome className="me-2" aria-hidden="true" />
                    {isHindi ? 'होम पर जाएं' : 'Go to Home'}
                  </Button>
                </CardBody>
              </Card>
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

      <Container className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center flex-wrap">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} aria-hidden="true" />
              {isHindi ? 'होम' : 'Home'}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary" style={{ maxWidth: '100%' }}>
            <FaList size={13} className="flex-shrink-0" aria-hidden="true" />
            <span className="text-truncate">{pageTitle}</span>
          </BreadcrumbItem>
        </Breadcrumb>

        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Gradient Header */}
          <CardHeader className="detail-card-header">
            <h1 className="fw-semibold mb-3 text-white h4 d-flex align-items-center gap-2">
              <FaTicketSimple size={20} aria-hidden="true" />
              {pageTitle}
            </h1>
            <hr className="border-white opacity-25 my-3" />
            <div className="d-flex flex-nowrap align-items-center gap-2 mb-3 pb-1 overflow-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <Badge color="light" className="text-dark rounded-pill px-2 py-1 px-md-3 py-md-2 d-inline-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: 11 }}>
                <FaCalendarAlt size={10} aria-hidden="true" />
                <span className="fw-semibold">{isHindi ? 'प्रकाशन:' : 'Created:'}</span> {formatDateTime(detail.createdAt, isHindi)}
              </Badge>
              <Badge color="light" className="text-dark rounded-pill px-2 py-1 px-md-3 py-md-2 d-inline-flex align-items-center gap-1 flex-shrink-0" style={{ fontSize: 11 }}>
                <FaCalendarPlus size={10} aria-hidden="true" />
                <span className="fw-semibold">{isHindi ? 'अपडेट:' : 'Updated:'}</span> {formatDateTime(detail.updatedAt, isHindi)}
              </Badge>
              <Button
                tag={Link} to="/" color="dark" size="sm"
                className="d-inline-flex align-items-center gap-1 fw-semibold ms-auto flex-shrink-0"
                style={{ fontSize: 11, padding: '4px 10px', borderRadius: '4px' }}
              >
                <FaChevronLeft size={10} aria-hidden="true" />
                {isHindi ? 'मुख्य पृष्ठ' : 'Back To Home'}
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardBody className="p-4">
            <div
              id="printable-content"
              className="lh-lg text-secondary cms-content"
              dangerouslySetInnerHTML={{ __html: rawDesc }}
            />
            <hr />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
              {detail.file && (
                <Button
                  tag="a" href={`${API}${detail.file}`} download
                  color="danger" size="sm"
                  className="d-inline-flex align-items-center gap-1"
                >
                  <FaDownload size={13} aria-hidden="true" />
                  {isHindi ? 'डाउनलोड' : 'Download'}
                </Button>
              )}
              <Button
                onClick={handlePrint} color="primary" size="sm"
                className="ms-auto d-inline-flex align-items-center gap-1"
              >
                <FaPrint size={13} aria-hidden="true" />
                {isHindi ? 'प्रिंट करें' : 'Print'}
              </Button>
            </div>
          </CardBody>

          <CardFooter className="bg-light text-center fw-semibold text-muted py-3">
            {isHindi ? 'धन्यवाद !' : 'Thanks For Reading !'}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default ImportantPageDetail;
