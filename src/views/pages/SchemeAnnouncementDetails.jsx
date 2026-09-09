import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Row, Col, Card, CardBody, CardHeader, CardFooter,
  Spinner, Alert, Badge, Button, Breadcrumb, BreadcrumbItem,
} from 'reactstrap';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { decodeBase64 } from '../../utilities/rXBase64';
import PageLoader from '../../components/PageLoader';
import {
  FaCalendarAlt, FaHome, FaTag, FaChevronLeft,
  FaCalendarPlus, FaExclamationTriangle,
  FaBullhorn, FaHandHoldingHeart,
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;
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

const getMetaDescription = (htmlContent, fallback = '') => {
  if (!htmlContent) return fallback;
  const text = stripHtml(htmlContent);
  return text.length > 160 ? text.substring(0, 157) + '...' : text;
};

const SchemeAnnouncementDetails = () => {
  const { slug }     = useParams();
  const location     = useLocation();
  const { isHindi }  = useLanguage();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const isScheme    = location.pathname.includes('scheme');
  const listRoute   = isScheme ? '/schemes' : '/announcements';
  const listTitle   = isScheme
    ? (isHindi ? 'योजनाएं' : 'Schemes')
    : (isHindi ? 'घोषणाएं' : 'Announcements');
  const ListIcon = isScheme ? FaHandHoldingHeart : FaBullhorn;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get(`${API_URL}/api/get-announcement/${slug}`);
        if (mounted) setData(res.data.data);
      } catch (err) {
        console.error('Fetch failed', err);
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  /* Loading */
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'लोड हो रहा है...' : 'Loading...'} - {SITE_TITLE_SUFFIX}</title>
        </Helmet>
        <Container className="py-4 position-relative" style={{ minHeight: '420px' }}>
          <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center flex-wrap">
            <BreadcrumbItem>
              <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <FaHome size={13} aria-hidden="true" />
                {isHindi ? 'होम' : 'Home'}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link to={listRoute} className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <ListIcon size={13} aria-hidden="true" />
                {listTitle}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem active className="fw-semibold text-secondary">
              {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
            </BreadcrumbItem>
          </Breadcrumb>
          <Card className="border-0 shadow-sm rounded-4 p-4 text-center" style={{ minHeight: '280px', border: '1px solid #e2e8f0' }}>
            <PageLoader inline={true} />
          </Card>
        </Container>
      </>
    );
  }

  /* Error */
  if (error || !data) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'विवरण नहीं मिला' : 'Details Not Found'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Container className="py-5">
          <Alert color="warning" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <FaExclamationTriangle size={18} aria-hidden="true" />
            <span className="fw-semibold">
              {isHindi
                ? 'विवरण उपलब्ध नहीं है या हटा दिया गया है।'
                : 'Details not found or have been removed.'}
            </span>
          </Alert>
        </Container>
      </>
    );
  }

  /* Detail */
  const detailTitle      = isHindi ? data.titleHi : data.titleEn;
  const rawDescription   = isHindi ? data.descriptionHi : data.descriptionEn;
  const descriptionHtml  = decodeBase64(rawDescription);
  const metaDescription  = getMetaDescription(
    descriptionHtml,
    isHindi ? data.shortDescriptionHi : data.shortDescriptionEn
  );
  const canonicalUrl = `${window.location.origin}${location.pathname}`;
  const pageTitle    = `${detailTitle} - ${SITE_TITLE_SUFFIX}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={detailTitle} />
        <meta name="twitter:description" content={metaDescription} />
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
          <BreadcrumbItem>
            <Link to={listRoute} className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <ListIcon size={13} aria-hidden="true" />
              {listTitle}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold text-secondary text-truncate" style={{ maxWidth: '100%' }}>
            {detailTitle}
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Detail Card */}
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>

          {/* Gradient Header */}
          <CardHeader className="detail-card-header p-3 p-md-4">
            {data.isNew && (
              <Badge color="danger" pill className="px-2.5 py-1 mb-2" style={{ letterSpacing: '0.5px', fontSize: '10.5px' }}>
                NEW
              </Badge>
            )}
            <h1 className="fw-bold mb-2 lh-base text-white h5 d-flex align-items-start gap-2.5">
              <span>{detailTitle}</span>
            </h1>
            <hr className="border-white opacity-20 my-2.5" />

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="badge bg-white text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                  <FaCalendarAlt size={11} className="text-primary" aria-hidden="true" />
                  <span className="fw-semibold">{isHindi ? 'प्रकाशन:' : 'Created:'}</span> {formatDateTime(data.createdAt, isHindi)}
                </span>
                <span className="badge bg-white text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                  <FaCalendarPlus size={11} className="text-success" aria-hidden="true" />
                  <span className="fw-semibold">{isHindi ? 'अपडेट:' : 'Updated:'}</span> {formatDateTime(data.updatedAt, isHindi)}
                </span>
                {data.categoryId && (
                  <span className="badge bg-warning text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                    <FaTag size={10} aria-hidden="true" />
                    {isHindi
                      ? (data.categoryId?.nameHi || data.categoryId?.categoryNameHi)
                      : (data.categoryId?.nameEn || data.categoryId?.categoryNameEn)}
                  </span>
                )}
              </div>

              <Button
                tag={Link}
                to={listRoute}
                size="sm"
                className="d-inline-flex align-items-center gap-1.5 fw-semibold text-white bg-dark border-0 shadow-sm rounded-pill px-3 py-1 ms-auto ms-sm-0"
                style={{ fontSize: "12px" }}
              >
                <FaChevronLeft size={10} aria-hidden="true" />
                {isHindi ? 'सूची पर वापस जाएं' : 'Back to List'}
              </Button>
            </div>
          </CardHeader>

          {/* Content Body */}
          <CardBody className="p-4 p-md-5 bg-white">
            {(data.shortDescriptionEn || data.shortDescriptionHi) && (
              <p className="lead text-muted mb-4 fs-6 fw-medium border-start border-4 border-primary ps-3">
                {isHindi ? data.shortDescriptionHi : data.shortDescriptionEn}
              </p>
            )}

            {data.image && (
              <div className="text-center mb-5">
                <img
                  src={`${API_URL}${data.image}`}
                  alt={detailTitle}
                  className="img-fluid rounded-4 shadow-sm w-100"
                  style={{ maxHeight: '450px', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>
            )}

            <div
              className="lh-lg text-secondary cms-content"
              style={{ textAlign: 'justify' }}
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </CardBody>

          <CardFooter className="bg-light fw-semibold border-top px-4 py-3 text-center text-muted">
            {isHindi ? 'पढ़ने के लिए धन्यवाद !' : 'Thanks For Reading !'}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default SchemeAnnouncementDetails;
