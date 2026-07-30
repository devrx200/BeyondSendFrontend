import { useParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Container, Row, Col,
  Card, CardBody, CardHeader, CardFooter,
  Spinner, Alert, Badge, Button,
  Input, InputGroup, InputGroupText,
  Breadcrumb, BreadcrumbItem,
  ListGroup, ListGroupItem,
} from 'reactstrap';
import {
  FaCalendarAlt, FaChevronRight, FaHome,
  FaNewspaper, FaFileAlt, FaTag,
  FaChevronLeft, FaDownload, FaCalendarPlus,
  FaSearch, FaExclamationTriangle, FaInbox,
} from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import PageLayout from '../../components/PageLayout';

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

const getMetaDescription = (htmlContent, fallback = '') => {
  if (!htmlContent) return fallback;
  const text = stripHtml(htmlContent);
  return text.length > 160 ? text.substring(0, 157) + '...' : text;
};

const DepDirectorateNoticesListView = () => {
  const { slug }    = useParams();
  const location    = useLocation();
  const { isHindi } = useLanguage();

  const [list,    setList]    = useState([]);
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);
  const [search,  setSearch]  = useState('');

  const path                = location.pathname;
  const isDirectorateList   = path === '/directorate-notices';
  const isDirectorateDetail = path.startsWith('/directorate-notice/');

  const LIST_API   = isDirectorateList
    ? '/api/get-directorate-notice-for-user'
    : '/api/get-department-notice-for-user';
  const DETAIL_API = isDirectorateDetail
    ? `/api/get-directorate-notice-by-slug/${slug}`
    : `/api/get-department-notice-by-slug/${slug}`;

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}${LIST_API}`);
      setList(res?.data?.data || []);
    } catch { setError(true); }
    finally  { setLoading(false); }
  };

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}${DETAIL_API}`);
      setDetail(res?.data?.data || null);
    } catch { setError(true); }
    finally  { setLoading(false); }
  };

  useEffect(() => {
    setError(false);
    setSearch('');
    slug ? fetchDetail() : fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, path]);

  const pageTitleText = isDirectorateList
    ? (isHindi ? 'निदेशालय सूचनाएं' : 'Directorate Notices')
    : (isHindi ? 'विभागीय सूचनाएं' : 'Department Notices');

  const listRoute = isDirectorateDetail ? '/directorate-notices' : '/departments-notices';
  const listTitle = isDirectorateDetail
    ? (isHindi ? 'निदेशालय सूचनाएं' : 'Directorate Notices')
    : (isHindi ? 'विभागीय सूचनाएं' : 'Department Notices');

  const filteredList = list.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.titleEn || '').toLowerCase().includes(q) ||
      (item.titleHi || '').includes(q)
    );
  });

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'लोड हो रहा है...' : 'Loading...'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Container className="py-5 text-center">
          <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3 text-muted fw-semibold">
            {isHindi ? 'लोड हो रहा है...' : 'Loading, please wait…'}
          </p>
        </Container>
      </>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{isHindi ? 'त्रुटि' : 'Error'} - {SITE_TITLE_SUFFIX}</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Container className="py-5">
          <Alert color="danger" className="d-flex align-items-center gap-2 shadow-sm rounded-3">
            <FaExclamationTriangle size={20} aria-hidden="true" />
            <span className="fw-semibold">
              {isHindi ? 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।' : 'Something went wrong. Please try again.'}
            </span>
          </Alert>
        </Container>
      </>
    );
  }

  /* ══ LIST PAGE ══ */
  if (!slug) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? 'hi' : 'en'} />
          <title>{pageTitleText} - {SITE_TITLE_SUFFIX}</title>
          <meta name="description" content={isHindi ? `${pageTitleText} की सूची — कुल ${list.length} सूचनाएं` : `${pageTitleText} list — Total ${list.length} notices`} />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content={`${pageTitleText} - ${SITE_TITLE_SUFFIX}`} />
          <meta property="og:type" content="website" />
        </Helmet>

        <PageLayout title={pageTitleText} titleHi={pageTitleText} showBreadcrumb>
          <div className="notice-list-container">

            {/* Section header */}
            <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)' }}>
              <CardBody className="py-4 px-4">
                <Row className="align-items-center g-2">
                  <Col>
                    <h2 className="mb-1 fw-bold h5 d-flex align-items-center gap-2 text-white">
                      <FaNewspaper aria-hidden="true" />
                      {isHindi ? 'सभी सूचनाएं' : 'All Notices'}
                    </h2>
                    <p className="mb-0 small opacity-75 text-white">
                      {isHindi ? 'नवीनतम सूचनाओं की सूची नीचे दी गई है' : 'Browse the latest official notices below'}
                    </p>
                  </Col>
                  <Col xs="auto">
                    <Badge pill color="light" className="text-primary fw-bold fs-6 px-3 py-2">
                      {list.length}&nbsp;{isHindi ? 'सूचनाएं' : 'Notices'}
                    </Badge>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Search */}
            {list.length > 0 && (
              <InputGroup className="mb-4 shadow-sm rounded-3 overflow-hidden">
                <InputGroupText className="bg-white border-end-0 text-muted">
                  <FaSearch size={14} aria-hidden="true" />
                </InputGroupText>
                <Input
                  placeholder={isHindi ? 'सूचना खोजें...' : 'Search notices...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-start-0"
                  bsSize="lg"
                  aria-label={isHindi ? 'सूचना खोजें' : 'Search notices'}
                />
              </InputGroup>
            )}

            {/* Notice List */}
            {filteredList.length > 0 ? (
              <Card className="border shadow-sm rounded-4 overflow-hidden">
                <ListGroup flush>
                  {filteredList.map((item, idx) => (
                    <ListGroupItem
                      key={item._id}
                      action
                      tag={Link}
                      to={isDirectorateList ? `/directorate-notice/${item.slug}` : `/department-notice/${item.slug}`}
                      className="text-decoration-none px-4 py-3 border-bottom d-flex align-items-center gap-3"
                    >
                      <Badge
                        color="primary"
                        className="rounded-3 fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 32, height: 32, fontSize: 12 }}
                        aria-hidden="true"
                      >
                        {idx + 1}
                      </Badge>
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-dark lh-sm mb-1 text-truncate" style={{ fontSize: 14.5 }}>
                          {isHindi ? item.titleHi : item.titleEn}
                        </div>
                        <div className="text-muted d-flex align-items-center gap-1 small">
                          <FaCalendarAlt size={11} aria-hidden="true" />
                          {formatDateTime(item.createdAt, isHindi)}
                        </div>
                      </div>
                      <FaChevronRight className="text-primary opacity-50 flex-shrink-0" size={13} aria-hidden="true" />
                    </ListGroupItem>
                  ))}
                </ListGroup>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm rounded-4">
                <CardBody className="text-center py-5">
                  <div
                    className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                    style={{ width: 72, height: 72 }}
                    aria-hidden="true"
                  >
                    <FaInbox size={30} className="text-primary opacity-50" />
                  </div>
                  <h6 className="text-muted fw-semibold mb-1">
                    {search
                      ? (isHindi ? 'खोज परिणाम नहीं मिले' : 'No results found')
                      : (isHindi ? 'कोई सूचना नहीं मिली' : 'No notices available')}
                  </h6>
                  <p className="text-muted small mb-0">
                    {search
                      ? (isHindi ? 'कृपया अलग शब्द खोजें' : 'Try a different search term')
                      : (isHindi ? 'अभी कोई सूचना उपलब्ध नहीं है' : 'Check back later for updates')}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </PageLayout>
      </>
    );
  }

  /* ── Detail: not found ── */
  if (!detail) {
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
              {isHindi ? 'विवरण नहीं मिला।' : 'Notice details not found.'}
            </span>
          </Alert>
        </Container>
      </>
    );
  }

  /* ══ DETAIL PAGE ══ */
  const detailTitle      = isHindi ? detail.titleHi : detail.titleEn;
  const detailDesc       = isHindi ? detail.descriptionHi : detail.descriptionEn;
  const metaDescription  = getMetaDescription(detailDesc, isHindi ? 'सूचना का विवरण' : 'Notice details');
  const canonicalUrl     = `${window.location.origin}${location.pathname}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{detailTitle} - {SITE_TITLE_SUFFIX}</title>
        <meta name="description" content={metaDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${detailTitle} - ${SITE_TITLE_SUFFIX}`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
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
              <FaNewspaper size={13} aria-hidden="true" />
              {listTitle}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold text-secondary text-truncate" style={{ maxWidth: '100%' }}>
            {detailTitle}
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Detail Card */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <CardHeader className="detail-card-header">
            <h1 className="fw-bold mb-3 lh-base text-white h4">
              {detailTitle}
            </h1>
            <hr className="border-white opacity-25 my-3" />
            <Row className="g-2 align-items-center">
              <Col xs={12} sm="auto">
                <Badge color="light" className="text-dark d-inline-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill">
                  <FaCalendarAlt size={11} className="text-primary" aria-hidden="true" />
                  {isHindi ? 'प्रकाशन:' : 'Created:'} {formatDateTime(detail.createdAt, isHindi)}
                </Badge>
              </Col>
              <Col xs={12} sm="auto">
                <Badge color="light" className="text-dark d-inline-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill">
                  <FaCalendarPlus size={11} className="text-success" aria-hidden="true" />
                  {isHindi ? 'अपडेट:' : 'Updated:'} {formatDateTime(detail.updatedAt, isHindi)}
                </Badge>
              </Col>
              {detail.categoryId && (
                <Col xs={12} sm="auto">
                  <Badge color="warning" className="text-dark d-inline-flex align-items-center gap-1 px-3 py-2 fw-normal rounded-pill">
                    <FaTag size={11} aria-hidden="true" />
                    {isHindi ? detail.categoryId?.categoryNameHi : detail.categoryId?.categoryNameEn}
                  </Badge>
                </Col>
              )}
              <Col xs={12} md className="d-flex justify-content-start justify-content-md-end">
                <Button
                  tag={Link} to={listRoute} size="sm" outline
                  className="d-inline-flex align-items-center gap-1 fw-semibold text-white bg-dark border-0 py-1 px-3"
                >
                  <FaChevronLeft size={11} aria-hidden="true" />
                  {isHindi ? 'सूची पर वापस जाएं' : 'Back to List'}
                </Button>
              </Col>
            </Row>
          </CardHeader>

          {/* Body */}
          <CardBody className="p-4">
            <div
              className="lh-lg text-secondary cms-content"
              dangerouslySetInnerHTML={{ __html: detailDesc }}
            />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top">
              <div className="fw-bold text-dark small">
                {isHindi ? 'आधिकारिक दस्तावेज़ डाउनलोड करें:' : 'Official Documents:'} 👉
              </div>
              {detail.file && (
                <div className="d-flex flex-wrap gap-2">
                  <Button
                    tag="a"
                    href={`${API}${detail.file}`}
                    download={detail.file.split('/').pop() || 'document'}
                    color="danger" size="sm"
                    className="d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    <FaDownload size={13} aria-hidden="true" />
                    {isHindi ? 'फ़ाइल डाउनलोड करें' : 'Download File'}
                  </Button>
                  <Button
                    tag="a"
                    href={`${API}${detail.file}`}
                    target="_blank" rel="noreferrer"
                    color="success" size="sm"
                    className="d-inline-flex align-items-center gap-2 fw-semibold"
                  >
                    <FaFileAlt size={13} aria-hidden="true" />
                    {isHindi ? 'फ़ाइल देखें' : 'View File'}
                  </Button>
                </div>
              )}
            </div>
          </CardBody>

          <CardFooter className="bg-light fw-bold border-top px-4 py-3 text-center text-muted">
            {isHindi ? 'पढ़ने के लिए धन्यवाद !' : 'Thanks For Reading !'}
          </CardFooter>
        </Card>
      </Container>
    </>
  );
};

export default DepDirectorateNoticesListView;
