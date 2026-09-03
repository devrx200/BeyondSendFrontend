import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Container, Row, Col,
  Card, CardBody, CardHeader,
  Badge, Button, Spinner, Input, Label,
} from 'reactstrap';
import {
  FaCalendarAlt, FaChevronLeft, FaChevronRight,
  FaClock, FaFile, FaFileExcel, FaFilePdf, FaFileWord,
  FaDownload, FaFilter, FaHome, FaNewspaper,
  FaRedo, FaSortAmountDown, FaSortAmountUp, FaUserTie,
} from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';
import { useLanguage } from '../../contexts/LanguageContext';
import { decodeBase64 } from '../../utilities/rXBase64';

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = 'Department of Higher Education, Government of Chhattisgarh India.';

/* ── Helpers ── */
const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const truncateText = (text = '', maxLength = 160) => {
  const clean = stripHtml(text);
  if (!clean) return '';
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength).trimEnd()}…`;
};

const getPageWindow = (current, total, delta = 2) => {
  if (total <= 1) return [1];
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) pages.push(i);
  }
  const withDots = [];
  let last = null;
  for (const p of pages) {
    if (last !== null) {
      if (p - last === 2) withDots.push(last + 1);
      else if (p - last > 2) withDots.push('...');
    }
    withDots.push(p);
    last = p;
  }
  return withDots;
};

const getFileIcon = (fileType) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf':  return <FaFilePdf  className="text-danger me-2"  aria-hidden="true" />;
    case 'doc':
    case 'docx': return <FaFileWord  className="text-primary me-2" aria-hidden="true" />;
    case 'xls':
    case 'xlsx': return <FaFileExcel className="text-success me-2" aria-hidden="true" />;
    default:     return <FaFile      className="text-secondary me-2" aria-hidden="true" />;
  }
};

const formatDateTime = (date, isHindi) => {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString(isHindi ? 'hi-IN' : 'en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/* ══ MultiSectionPages ══ */
const MultiSectionPages = ({ prefetchedData, mode, fullSlug, onPageChange, onFilterChange, preview = false }) => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fullSlug, mode]);

  if (!prefetchedData) {
    return (
      <Container className="py-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</p>
      </Container>
    );
  }

  if (mode === 'multi-list') {
    return (
      <MultiSectionListView
        prefetchedData={prefetchedData} isHindi={isHindi}
        onPageChange={onPageChange} onFilterChange={onFilterChange}
      />
    );
  }

  /* ── DETAIL MODE ── */
  const page        = prefetchedData;
  if (!page) return null;

  const title        = isHindi ? (page.titleHin || page.titleEng) : page.titleEng;
  const rawHtmlContent  = isHindi
    ? (page.htmlContentHi || page.descriptionHi || page.htmlContent || page.descriptionEn)
    : (page.htmlContent   || page.descriptionEn);
  const htmlContent = decodeBase64(rawHtmlContent);
  const publishDate  = page.publishDate || page.createdAt;
  const documents    = page.documentsUpdate || [];
  const listPath     = `/${page.baseSlug}/${page.mainSlug}`;
  const listTitle    = page.mainSlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  const forceDownload = async (url, fileName) => {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const bUrl = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = bUrl; a.download = fileName || 'downloaded-file';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(bUrl);
    } catch { window.open(url, '_blank'); }
  };

  const metaDescription = (isHindi ? page.shortDescriptionHi : page.shortDescriptionEn) || '';
  const canonicalUrl    = `${window.location.origin}/${page.baseSlug}/${page.mainSlug}/${page.slug}`;
  const pageTitle       = `${title} - ${SITE_TITLE_SUFFIX}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{pageTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta name="keywords" content={`${title}, ${page.mainSlug?.replace(/-/g, ' ')}, official`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
      </Helmet>

      {/* Preview watermark overlay */}
      {preview && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0,
            pointerEvents: 'none', zIndex: 9999, overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '40%', left: '-20%',
            width: '140%', transform: 'rotate(-30deg)',
            textAlign: 'center', opacity: 0.12,
            fontSize: 'clamp(48px, 10vw, 100px)', fontWeight: 'bold',
            color: '#fc7785', whiteSpace: 'nowrap',
            letterSpacing: '8px', textTransform: 'uppercase',
          }}>
            {isHindi ? 'प्रीव्यू मोड' : 'PREVIEW MODE'}
          </div>
          <button
            onClick={() => window.close()}
            style={{
              position: 'fixed', top: 15, right: 15,
              backgroundColor: 'rgba(220,53,69,0.95)', color: '#fff',
              border: 'none', cursor: 'pointer', pointerEvents: 'auto',
              padding: '6px 16px', borderRadius: 30,
              fontSize: 13, fontWeight: 'bold', zIndex: 10000,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
          >
            {isHindi ? 'प्रीव्यू बंद करें' : 'Close Preview'}
          </button>
        </div>
      )}

      <Container className="py-4">
        {/* Breadcrumb */}
        <nav aria-label={isHindi ? 'ब्रेडक्रम्ब' : 'Breadcrumb'} className="mb-4">
          <ol className="breadcrumb bg-white px-3 py-2 rounded-3 shadow-sm border align-items-center flex-wrap mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <FaHome size={13} aria-hidden="true" /> {isHindi ? 'होम' : 'Home'}
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={listPath} className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <FaNewspaper size={13} aria-hidden="true" /> {listTitle}
              </Link>
            </li>
            <li className="breadcrumb-item active fw-semibold text-secondary text-truncate" style={{ maxWidth: '100%' }}>{title}</li>
          </ol>
        </nav>

        <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
          <CardHeader className="detail-card-header p-3 p-md-4">
            <h1 className="fw-bold mb-2 text-white h5 d-flex align-items-start gap-2.5 lh-base">
              <FaNewspaper size={20} className="mt-1 flex-shrink-0 opacity-90" aria-hidden="true" />
              <span>{title}</span>
            </h1>
            <hr className="border-white opacity-20 my-2.5" />
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex flex-wrap align-items-center gap-2">
                {page.categoryId && (
                  <span className="badge bg-white text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                    <FaUserTie size={11} className="text-primary" aria-hidden="true" />
                    {isHindi ? page.categoryId?.categoryNameHi : page.categoryId?.categoryNameEn}
                  </span>
                )}
                <span className="badge bg-white text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                  <FaCalendarAlt size={11} className="text-primary" aria-hidden="true" />
                  <span className="fw-semibold">{isHindi ? 'प्रकाशन:' : 'Published:'}</span> {formatDateTime(publishDate, isHindi)}
                </span>
                <span className="badge bg-white text-dark px-2.5 py-1.5 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5" style={{ fontSize: "11.5px" }}>
                  <FaClock size={11} className="text-success" aria-hidden="true" />
                  <span className="fw-semibold">{isHindi ? 'अपडेट:' : 'Updated:'}</span> {formatDateTime(page.updatedAt, isHindi)}
                </span>
              </div>
              <Button
                tag={Link}
                to={listPath}
                color="dark"
                size="sm"
                className="fw-semibold px-3 py-1 rounded-pill shadow-sm d-inline-flex align-items-center gap-1.5 ms-auto ms-sm-0"
                style={{ fontSize: "12px" }}
              >
                <FaChevronLeft size={10} aria-hidden="true" />
                {isHindi ? 'सूची पर वापस जाएं' : 'Back to List'}
              </Button>
            </div>
          </CardHeader>

          <CardBody className="p-4">
            <div className="cms-content mb-5" dangerouslySetInnerHTML={{ __html: htmlContent || '' }} />

            {documents.length > 0 && (
              <div className="mt-5 pt-4 border-top">
                <h2 className="h5 mb-3 fw-semibold">
                  {isHindi ? 'इस सूचना से संबंधित दस्तावेज़' : 'Documents Related to This Notification'}
                </h2>
                <hr className="my-3" />
                {documents.map((doc, i) => (
                  <div key={doc._id || i} className="table-responsive mb-3">
                    <table className="table table-bordered align-middle mb-0">
                      <tbody>
                        <tr>
                          <td style={{ width: 160 }} className="fw-semibold bg-light small">{isHindi ? 'तिथि' : 'Dates'}</td>
                          <td className="small">
                            <b className="text-info">Created:</b> {formatDateTime(doc.createdAt, isHindi)} &nbsp;||&nbsp;
                            <b className="text-success">Updated:</b> {formatDateTime(doc.updatedAt, isHindi)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: 160 }} className="fw-semibold bg-light small">{isHindi ? 'देखें / डाउनलोड' : 'View / Download'}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <a href={`${API}${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="fw-semibold text-decoration-none small">
                                {getFileIcon(doc.fileType)}
                                {isHindi ? doc.titleHin : doc.titleEng}
                              </a>
                              <span className="text-danger small fw-semibold">
                                {isHindi ? 'फाइल:' : 'File:'} {doc.fileSize} | {doc.fileType?.toUpperCase()}
                              </span>
                              <Badge color="dark" onClick={() => forceDownload(`${API}${doc.fileUrl}`, `${doc.titleEng || 'document'}${doc.fileUrl.substring(doc.fileUrl.lastIndexOf('.')).split('?')[0]}`)}
                                className="btn btn-sm d-inline-flex align-items-center ms-1 text-white" style={{ cursor: 'pointer' }}>
                                <FaDownload className="me-1" aria-hidden="true" /> {isHindi ? 'डाउनलोड' : 'Download'}
                              </Badge>
                              <Badge color="primary" onClick={() => window.open(`${API}${doc.fileUrl}`, '_blank')}
                                className="btn btn-sm d-inline-flex align-items-center ms-1 text-white" style={{ cursor: 'pointer' }}>
                                <FaEye className="me-1" aria-hidden="true" /> {isHindi ? 'देखें' : 'View'}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: 160 }} className="fw-semibold bg-light small">{isHindi ? 'विवरण' : 'Description'}</td>
                          <td className="small">{isHindi ? (doc.shortDescriptionHin || doc.shortDescriptionEn) : doc.shortDescriptionEn}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

/* ── List View ── */
const MultiSectionListView = ({ prefetchedData, isHindi, onPageChange, onFilterChange }) => {
  const {
    baseSlug, mainSlug,
    items = [], pagination = {},
    sortBy:     initialSortBy,
    sortOrder:  initialSortOrder,
    dateFrom:   initialDateFrom,
    dateTo:     initialDateTo,
  } = prefetchedData;

  const listTitle = mainSlug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  const [sortBy,    setSortBy]    = useState(initialSortBy    || 'createdAt');
  const [sortOrder, setSortOrder] = useState(initialSortOrder || 'desc');
  const [dateFrom,  setDateFrom]  = useState(initialDateFrom  || '');
  const [dateTo,    setDateTo]    = useState(initialDateTo    || '');

  useEffect(() => {
    setSortBy(initialSortBy    || 'createdAt');
    setSortOrder(initialSortOrder || 'desc');
    setDateFrom(initialDateFrom   || '');
    setDateTo(initialDateTo       || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSlug, mainSlug]);

  const currentPage     = pagination.currentPage    || 1;
  const totalPages      = pagination.totalPages     || 1;
  const totalDocuments  = pagination.totalDocuments || items.length;

  const applyFilters = (overrides = {}) => {
    const next = {
      sortBy:    overrides.sortBy    ?? sortBy,
      sortOrder: overrides.sortOrder ?? sortOrder,
      dateFrom:  overrides.dateFrom  ?? dateFrom,
      dateTo:    overrides.dateTo    ?? dateTo,
    };
    onFilterChange?.(next);
    onPageChange?.(1);
  };

  const handleSortOrderToggle = () => {
    const next = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(next);
    applyFilters({ sortOrder: next });
  };

  const handleSortByChange = (e) => {
    const next = e.target.value;
    setSortBy(next);
    applyFilters({ sortBy: next });
  };

  const handleDateApply = () => {
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setDateFrom(dateTo); setDateTo(dateFrom);
      applyFilters({ dateFrom: dateTo, dateTo: dateFrom });
      return;
    }
    applyFilters({});
  };

  const handleReset = () => {
    setSortBy('createdAt'); setSortOrder('desc'); setDateFrom(''); setDateTo('');
    onFilterChange?.({ sortBy: 'createdAt', sortOrder: 'desc', dateFrom: '', dateTo: '' });
    onPageChange?.(1);
  };

  const goToPage = (p) => {
    if (p < 1 || p > totalPages || p === currentPage) return;
    onPageChange?.(p);
  };

  const pageWindow = getPageWindow(currentPage, totalPages);
  const canonicalUrl = `${window.location.origin}/${baseSlug}/${mainSlug}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? 'hi' : 'en'} />
        <title>{`${listTitle} - ${SITE_TITLE_SUFFIX}`}</title>
        <meta name="description" content={`${listTitle} list and announcements from ${SITE_TITLE_SUFFIX}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${listTitle} - ${SITE_TITLE_SUFFIX}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${listTitle} - ${SITE_TITLE_SUFFIX}`} />
      </Helmet>

      <Container className="py-4 my-4">
        {/* Breadcrumb */}
        <nav aria-label={isHindi ? 'ब्रेडक्रम्ब' : 'Breadcrumb'} className="mb-4">
          <ol className="breadcrumb bg-white px-3 py-2 rounded-3 shadow-sm border align-items-center flex-wrap mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <FaHome size={13} aria-hidden="true" /> {isHindi ? 'होम' : 'Home'}
              </Link>
            </li>
            <li className="breadcrumb-item active fw-semibold d-flex align-items-center gap-1 text-secondary">
              <FaNewspaper size={13} aria-hidden="true" /> {listTitle}
            </li>
          </ol>
        </nav>

        {/* Section header */}
        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <CardHeader className="detail-card-header">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h1 className="mb-0 fw-semibold text-white h5 d-flex align-items-center gap-2">
                <FaNewspaper aria-hidden="true" /> {listTitle}
              </h1>
              <Badge pill color="light" className="text-primary fw-semibold px-3 py-2">
                {totalDocuments} {isHindi ? 'आइटम' : 'Items'}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Compact Inline Filter Toolbar */}
        <Card className="border-0 shadow-sm rounded-3 mb-3 bg-white" style={{ border: "1px solid #e2e8f0" }}>
          <CardBody className="py-2 px-3">
            <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between">
              
              {/* Left group: Sort By & Order */}
              <div className="d-flex align-items-center flex-wrap gap-2">
                <div className="d-flex align-items-center gap-1.5">
                  <span className="small fw-semibold text-secondary d-flex align-items-center gap-1" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    <FaFilter size={11} className="text-primary" /> {isHindi ? 'क्रमबद्ध:' : 'Sort:'}
                  </span>
                  <Input
                    id="msp-sortBy"
                    type="select"
                    bsSize="sm"
                    value={sortBy}
                    onChange={handleSortByChange}
                    className="py-1 px-2 rounded-2"
                    style={{ fontSize: "12.5px", width: "auto", minWidth: "125px", height: "32px", borderColor: "#cbd5e1" }}
                  >
                    <option value="createdAt">{isHindi ? 'निर्माण तिथि' : 'Created Date'}</option>
                    <option value="updatedAt">{isHindi ? 'अपडेट तिथि' : 'Updated Date'}</option>
                  </Input>
                </div>

                <Button
                  type="button"
                  size="sm"
                  color="outline-primary"
                  className="rounded-2 px-2.5 py-1 d-inline-flex align-items-center gap-1 fw-semibold"
                  style={{ fontSize: "12px", height: "32px" }}
                  onClick={handleSortOrderToggle}
                  title={isHindi ? 'क्रम बदलें' : 'Toggle Order'}
                >
                  {sortOrder === 'desc' ? <FaSortAmountDown size={11} /> : <FaSortAmountUp size={11} />}
                  <span>{sortOrder === 'desc' ? (isHindi ? 'नवीनतम' : 'Newest') : (isHindi ? 'पुराने' : 'Oldest')}</span>
                </Button>
              </div>

              {/* Right group: Date range + Apply + Reset */}
              <div className="d-flex align-items-center flex-wrap gap-2 ms-auto ms-sm-0">
                <div className="d-flex align-items-center gap-1">
                  <span className="small fw-semibold text-secondary" style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                    <FaCalendarAlt size={11} className="text-primary me-1" />
                    {isHindi ? 'दिनांक:' : 'Date:'}
                  </span>
                  <Input
                    id="msp-dateFrom"
                    type="date"
                    bsSize="sm"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="py-1 px-2 rounded-2"
                    style={{ fontSize: "12px", width: "125px", height: "32px", borderColor: "#cbd5e1" }}
                  />
                  <span className="text-muted small">-</span>
                  <Input
                    id="msp-dateTo"
                    type="date"
                    bsSize="sm"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="py-1 px-2 rounded-2"
                    style={{ fontSize: "12px", width: "125px", height: "32px", borderColor: "#cbd5e1" }}
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  color="primary"
                  className="rounded-2 px-3 py-1 fw-semibold shadow-sm"
                  style={{ fontSize: "12px", height: "32px" }}
                  onClick={handleDateApply}
                >
                  {isHindi ? 'लागू' : 'Apply'}
                </Button>

                {(dateFrom || dateTo || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                  <Button
                    type="button"
                    size="sm"
                    color="outline-secondary"
                    className="rounded-2 px-2 py-1 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: "12px", height: "32px" }}
                    onClick={handleReset}
                    title={isHindi ? 'रीसेट करें' : 'Reset'}
                  >
                    <FaRedo size={10} />
                    <span className="d-none d-md-inline">{isHindi ? 'रीसेट' : 'Reset'}</span>
                  </Button>
                )}
              </div>

            </div>
          </CardBody>
        </Card>

        {/* Items */}
        {items.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3">
            <CardBody className="text-center py-5">
              <FaNewspaper size={48} className="text-muted mb-3" aria-hidden="true" />
              <h5 className="text-muted">{isHindi ? 'कोई सामग्री नहीं मिली' : 'No Content Found'}</h5>
            </CardBody>
          </Card>
        ) : (
          <>
            {items.map((item) => {
              const rawSummary = isHindi
                ? (item.shortDescriptionHi || item.shortDescriptionEn)
                : item.shortDescriptionEn;
              const cleanSummary = rawSummary ? rawSummary.replace(/<[^>]+>/g, '') : '';
              const summary = truncateText(cleanSummary, 160);
              
              return (
                <Card key={item._id} className="list-item-card shadow-sm mb-3 rounded-3 overflow-hidden bg-white">
                  <Link to={`/${baseSlug}/${mainSlug}/${item.slug}`} className="text-decoration-none text-dark">
                    <CardBody className="py-3 px-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 rounded-pill flex-shrink-0 mt-1" style={{ width: 4, height: 44, background: 'linear-gradient(180deg, #1042c2, #123974)' }} aria-hidden="true" />
                        <div className="flex-grow-1">
                          <h2 className="h6 fw-bold mb-1 text-dark" style={{ lineHeight: '1.4' }}>
                            {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                          </h2>
                          {summary && (
                            <p className="text-muted mb-2" style={{ fontSize: '0.86rem', lineHeight: '1.5' }}>
                              {summary}
                            </p>
                          )}
                          <div className="d-flex flex-wrap gap-3 text-secondary" style={{ fontSize: '0.8rem' }}>
                            <span className="d-flex align-items-center gap-1">
                              <FaCalendarAlt size={12} className="text-success" aria-hidden="true" />
                              <span className="fw-medium">{isHindi ? 'प्रकाशन:' : 'Published:'}</span> {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '—'}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <FaClock size={12} className="text-warning" aria-hidden="true" />
                              <span className="fw-medium">{isHindi ? 'अपडेट:' : 'Updated:'}</span> {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : '—'}
                            </span>
                            {item.documentsUpdate?.length > 0 && (
                              <span className="d-flex align-items-center gap-1">
                                <FaFile size={12} className="text-danger" aria-hidden="true" />
                                <span className="fw-medium">{item.documentsUpdate.length}</span> {isHindi ? 'दस्तावेज़' : 'Docs'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ms-3 text-primary align-self-center chevron-icon" aria-hidden="true">
                          <FaChevronRight size={16} />
                        </div>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              );
            })}

            {totalPages > 1 && (
              <nav aria-label={isHindi ? 'पेज नेविगेशन' : 'Page navigation'} className="d-flex justify-content-center mt-4">
                <ul className="pagination shadow-sm rounded flex-wrap justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button type="button" className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      {isHindi ? 'पिछला' : 'Prev'}
                    </button>
                  </li>
                  {pageWindow.map((p, idx) =>
                    p === '...' ? (
                      <li key={`dots-${idx}`} className="page-item disabled"><span className="page-link">…</span></li>
                    ) : (
                      <li key={p} className={`page-item ${currentPage === p ? 'active' : ''}`}>
                        <button type="button" className="page-link" onClick={() => goToPage(p)} aria-current={currentPage === p ? 'page' : undefined}>{p}</button>
                      </li>
                    )
                  )}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button type="button" className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                      {isHindi ? 'अगला' : 'Next'}
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default MultiSectionPages;
