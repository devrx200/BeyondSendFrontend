import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Badge,
  Container,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  Spinner,
  Input,
  Label,
} from "reactstrap";
import {
  FaCalendarAlt,
  FaDownload,
  FaClock,
  FaChevronLeft,
  FaHome,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaUserTie,
  FaNewspaper,
  FaChevronRight,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaRedo,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaEye } from "react-icons/fa6";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

/* ---------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------- */

// Short descriptions can come from the rich text editor and contain raw
// HTML (tags, &nbsp; entities). Rendering that as plain text inside a
// card broke the layout, so it needs stripping + a hard length cap.
const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncateText = (text = "", maxLength = 160) => {
  const clean = stripHtml(text);
  if (!clean) return "";
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
};

// Builds a compact page-number list with "…" gaps instead of rendering
// every single page — the old version mapped [...Array(totalPages)]
// directly, which would render hundreds of <li> elements for a large
// result set.
const getPageWindow = (current, total, delta = 2) => {
  if (total <= 1) return [1];
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      pages.push(i);
    }
  }
  const withDots = [];
  let last = null;
  for (const p of pages) {
    if (last !== null) {
      if (p - last === 2) withDots.push(last + 1);
      else if (p - last > 2) withDots.push("...");
    }
    withDots.push(p);
    last = p;
  }
  return withDots;
};

const MultiSectionPages = ({ prefetchedData, mode, fullSlug, onPageChange, onFilterChange }) => {
  const { isHindi } = useLanguage();

  // Scroll to top whenever the visible slug/page changes so pagination
  // and filtering feel responsive instead of leaving the user scrolled
  // halfway down the previous page's content.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fullSlug, mode]);

  if (!prefetchedData) {
    return (
      <Container className="py-5 text-center">
        <Spinner color="primary" />
        <p className="mt-3">{isHindi ? "लोड हो रहा है..." : "Loading..."}</p>
      </Container>
    );
  }

  const isList = mode === "multi-list";

  // ---------- LIST MODE ----------
  if (isList) {
    return (
      <MultiSectionListView
        prefetchedData={prefetchedData}
        isHindi={isHindi}
        onPageChange={onPageChange}
        onFilterChange={onFilterChange}
      />
    );
  }

  // ---------- DETAIL MODE ----------
  const page = prefetchedData;
  if (!page) return null;

  const title = isHindi ? (page.titleHin || page.titleEng) : page.titleEng;
  const htmlContent = isHindi
    ? (page.htmlContentHi || page.descriptionHi || page.htmlContent || page.descriptionEn)
    : (page.htmlContent || page.descriptionEn);
  const publishDate = page.publishDate || page.createdAt;
  const updateDate = page.updatedAt;
  const documents = page.documentsUpdate || [];
  const listPath = `/${page.baseSlug}/${page.mainSlug}`;
  const listTitle = page.mainSlug?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf": return <FaFilePdf className="text-danger me-2" />;
      case "doc":
      case "docx": return <FaFileWord className="text-primary me-2" />;
      case "xls":
      case "xlsx": return <FaFileExcel className="text-success me-2" />;
      default: return <FaFile className="text-secondary me-2" />;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  };

  //  for download
  const forceDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "downloaded-file";
      document.body.appendChild(link);
      link.click();

      // Clean up the DOM and memory
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback if fetch fails
      window.open(url, "_blank");
    }
  };

  const pageTitle = `${title} - ${SITE_TITLE_SUFFIX}`;
  const metaDescription = (isHindi ? page.shortDescriptionHi : page.shortDescriptionEn) || "";
  const canonicalUrl = `${window.location.origin}/${page.baseSlug}/${page.mainSlug}/${page.slug}`;

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{pageTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta name="keywords" content={`${title}, ${page.mainSlug?.replace(/-/g, ' ')}, official announcement`} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
      </Helmet>

      <Container className="py-4">
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} /> {isHindi ? "होम" : "Home"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={listPath} className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaNewspaper size={13} /> {listTitle}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold text-secondary text-truncate" style={{ maxWidth: "100%" }}>
            {title}
          </BreadcrumbItem>
        </Breadcrumb>

        <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
          <CardHeader className="text-white border-0 p-4" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}>
            <h1 className="fw-bold mb-3 text-white d-flex align-items-center gap-2">
              <FaNewspaper size={28} />
              {title}
            </h1>
            <hr className="border-white opacity-25 my-3" />
            <Row className="g-2 align-items-center">
              {page.categoryId && (
                <Col xs="auto">
                  <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                    <FaUserTie size={12} />
                    {isHindi ? page.categoryId?.categoryNameHi : page.categoryId?.categoryNameEn}
                  </Badge>
                </Col>
              )}
              <Col xs="auto">
                <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                  <FaCalendarAlt size={12} />
                  <strong>{isHindi ? "प्रकाशन:" : "Published:"}</strong> {formatDateTime(publishDate)}
                </Badge>
              </Col>
              <Col xs="auto">
                <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                  <FaClock size={12} />
                  <strong>{isHindi ? "अपडेट:" : "Updated:"}</strong> {formatDateTime(updateDate)}
                </Badge>
              </Col>
              <Col xs={12} md className="d-flex justify-content-start justify-content-md-end ms-md-auto">
                <Button tag={Link} to={listPath} color="dark" size="sm" className="fw-semibold px-3 d-flex align-items-center gap-2">
                  <FaChevronLeft size={11} />
                  {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                </Button>
              </Col>
            </Row>
          </CardHeader>

          <CardBody className="p-4">
            <div className="prose-content mb-5" dangerouslySetInnerHTML={{ __html: htmlContent || "" }} />
            {documents.length > 0 && (
              <div className="mt-5 pt-4 border-top">
                <h4 className="mb-3 fw-bold">
                  {isHindi ? "इस सूचना से संबंधित सभी अद्यतन दस्तावेज़" : "All Updates Related to This Notification"}
                </h4>
                <hr className="my-3" />
                {documents.map((doc, i) => (
                  <div key={doc._id || i} className="table-responsive mb-3">
                    <table className="table table-bordered align-middle mb-0">
                      <tbody>
                        <tr>
                          <td style={{ width: 180 }} className="fw-semibold bg-light">
                            {isHindi ? "तिथि" : "Dates"}
                          </td>
                          <td>
                            <b className="text-info">Created At:</b> {formatDateTime(doc.createdAt)} &nbsp;||&nbsp;
                            <b className="text-success">Updated At:</b> {formatDateTime(doc.updatedAt)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: 180 }} className="fw-semibold bg-light">
                            {isHindi ? "देखें / डाउनलोड" : "View / Download"}
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <a href={`${API}${doc.fileUrl}`} target="_blank" rel="noopener noreferrer" className="fw-bold text-decoration-none">
                                {getFileIcon(doc.fileType)}
                                {isHindi ? doc.titleHin : doc.titleEng}
                              </a>
                              <strong className="text-danger small fw-bold">
                                {isHindi ? "फाइल विवरण" : "File Details"}:
                                <span className="ms-1">{doc.fileSize} | {doc.fileType?.toUpperCase()}</span>
                                <Badge
                                  color="dark"
                                  onClick={() => forceDownload(`${API}${doc.fileUrl}`, `${doc.titleEng || "document"} - ${window.location.hostname}${doc.fileUrl.substring(doc.fileUrl.lastIndexOf('.')).split('?')[0]}`)} className="btn btn-sm d-inline-flex align-items-center ms-3 text-white"
                                  style={{ cursor: "pointer" }}
                                >
                                  <FaDownload className="me-1" />
                                  {isHindi ? "डाउनलोड" : "Download"}
                                </Badge>
                                <Badge color="primary" onClick={() => window.open(`${API}${doc.fileUrl}`, "_blank")}
                                  className="btn btn-sm d-inline-flex align-items-center ms-3 text-white"
                                  style={{ cursor: "pointer" }}
                                >
                                  <FaEye className="me-1" />
                                  {isHindi ? "देखें" : "View"}
                                </Badge>
                              </strong>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: 180 }} className="fw-semibold bg-light">
                            {isHindi ? "विवरण" : "Description"}
                          </td>
                          <td>
                            <p className="mb-0">{isHindi ? doc.shortDescriptionHin || doc.shortDescriptionEn : doc.shortDescriptionEn}</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
                <div className="mt-4 pt-3 text-center border-top">
                  <small className="fw-bold text-secondary">
                    <i>{isHindi ? "* इस सूचना का पूर्ण विवरण *" : "* Complete Details of This Notification *"}</i>
                  </small>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </>
  );
};

/* ---------------------------------------------------------------------
 * List view: separated out so the filter/sort/pagination state is its
 * own concern and doesn't leak into the detail-mode render above.
 * ------------------------------------------------------------------- */

const MultiSectionListView = ({ prefetchedData, isHindi, onPageChange, onFilterChange }) => {
  const {
    baseSlug,
    mainSlug,
    items = [],
    pagination = {},
    sortBy: initialSortBy,
    sortOrder: initialSortOrder,
    dateFrom: initialDateFrom,
    dateTo: initialDateTo,
  } = prefetchedData;

  const listTitle = mainSlug?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";

  // Server-driven values (the parent owns the actual fetch/query). These
  // fall back to sane defaults so the toolbar always renders something
  // sensible even on first load.
  const [sortBy, setSortBy] = useState(initialSortBy || "createdAt");
  const [sortOrder, setSortOrder] = useState(initialSortOrder || "desc");
  const [dateFrom, setDateFrom] = useState(initialDateFrom || "");
  const [dateTo, setDateTo] = useState(initialDateTo || "");

  // If the parent pushes new default filter values (e.g. navigating to a
  // different list/category), sync the toolbar to match instead of
  // silently keeping stale selections from the previous list.
  useEffect(() => {
    setSortBy(initialSortBy || "createdAt");
    setSortOrder(initialSortOrder || "desc");
    setDateFrom(initialDateFrom || "");
    setDateTo(initialDateTo || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSlug, mainSlug]);

  const currentPage = pagination.currentPage || 1;
  const totalPages = pagination.totalPages || 1;
  const totalDocuments = pagination.totalDocuments || items.length;

  const applyFilters = (overrides = {}) => {
    const next = {
      sortBy: overrides.sortBy ?? sortBy,
      sortOrder: overrides.sortOrder ?? sortOrder,
      dateFrom: overrides.dateFrom ?? dateFrom,
      dateTo: overrides.dateTo ?? dateTo,
    };
    onFilterChange?.(next);
    // A new filter/sort should always land back on page 1 — otherwise
    // you can end up on "page 5" of a filtered set that only has 2 pages.
    onPageChange?.(1);
  };

  const handleSortOrderToggle = () => {
    const next = sortOrder === "desc" ? "asc" : "desc";
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
      // Simple guard against an inverted range; swap instead of silently
      // returning zero results.
      setDateFrom(dateTo);
      setDateTo(dateFrom);
      applyFilters({ dateFrom: dateTo, dateTo: dateFrom });
      return;
    }
    applyFilters({});
  };

  const handleReset = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setDateFrom("");
    setDateTo("");
    onFilterChange?.({ sortBy: "createdAt", sortOrder: "desc", dateFrom: "", dateTo: "" });
    onPageChange?.(1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  const pageWindow = getPageWindow(currentPage, totalPages);

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{`${listTitle} - ${SITE_TITLE_SUFFIX}`}</title>
        <meta name="description" content={`${listTitle} list and announcements from ${SITE_TITLE_SUFFIX}`} />
        <meta name="keywords" content={`${listTitle}, announcements, official, ${SITE_TITLE_SUFFIX}`} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={`${window.location.origin}/${baseSlug}/${mainSlug}`} />
        <meta property="og:title" content={`${listTitle} - ${SITE_TITLE_SUFFIX}`} />
        <meta property="og:description" content={`${listTitle} list and announcements from ${SITE_TITLE_SUFFIX}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/${baseSlug}/${mainSlug}`} />
        <meta property="og:site_name" content={SITE_TITLE_SUFFIX} />
        <meta name="author" content={SITE_TITLE_SUFFIX} />
      </Helmet>

      <Container className="py-4 my-4">
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} /> {isHindi ? "होम" : "Home"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary">
            <FaNewspaper size={13} /> {listTitle}
          </BreadcrumbItem>
        </Breadcrumb>

        <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
          <CardHeader className="text-white border-0 p-4" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
                <FaNewspaper /> {listTitle}
              </h5>
              <Badge pill color="light" className="text-primary fw-bold px-3 py-2">
                {totalDocuments} {isHindi ? "आइटम" : "Items"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* FILTER / SORT TOOLBAR */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <CardBody className="py-3">
            <Row className="g-3 align-items-end">
              <Col xs={12} md={3}>
                <Label for="msp-sortBy" className="small fw-semibold text-secondary mb-1 d-flex align-items-center gap-1">
                  <FaFilter size={11} /> {isHindi ? "इसके अनुसार क्रमबद्ध करें" : "Sort By"}
                </Label>
                <Input id="msp-sortBy" type="select" bsSize="sm" value={sortBy} onChange={handleSortByChange}>
                  <option value="createdAt">{isHindi ? "निर्माण तिथि" : "Created Date"}</option>
                  <option value="updatedAt">{isHindi ? "अपडेट तिथि" : "Updated Date"}</option>
                </Input>
              </Col>

              <Col xs={6} md={2}>
                <Label className="small fw-semibold text-secondary mb-1 d-block">
                  {isHindi ? "क्रम" : "Order"}
                </Label>
                <Button
                  type="button"
                  size="sm"
                  color="outline-primary"
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSortOrderToggle}
                >
                  {sortOrder === "desc" ? <FaSortAmountDown /> : <FaSortAmountUp />}
                  {sortOrder === "desc"
                    ? (isHindi ? "नवीनतम पहले" : "Newest First")
                    : (isHindi ? "पुराने पहले" : "Oldest First")}
                </Button>
              </Col>

              <Col xs={6} md={3}>
                <Label for="msp-dateFrom" className="small fw-semibold text-secondary mb-1">
                  {isHindi ? "तिथि से" : "Date From"}
                </Label>
                <Input
                  id="msp-dateFrom"
                  type="date"
                  bsSize="sm"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </Col>

              <Col xs={6} md={3}>
                <Label for="msp-dateTo" className="small fw-semibold text-secondary mb-1">
                  {isHindi ? "तिथि तक" : "Date To"}
                </Label>
                <Input
                  id="msp-dateTo"
                  type="date"
                  bsSize="sm"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </Col>

              <Col xs={12} md={1} className="d-flex gap-2">
                <Button type="button" size="sm" color="primary" className="w-100" onClick={handleDateApply}>
                  {isHindi ? "लागू करें" : "Apply"}
                </Button>
              </Col>
            </Row>

            {(dateFrom || dateTo || sortBy !== "createdAt" || sortOrder !== "desc") && (
              <div className="mt-3 d-flex justify-content-end">
                <Button type="button" size="sm" color="link" className="text-secondary d-flex align-items-center gap-1 p-0" onClick={handleReset}>
                  <FaRedo size={11} /> {isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>

        {items.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-3">
            <CardBody className="text-center py-5">
              <FaNewspaper size={48} className="text-muted mb-3" />
              <h5 className="text-muted">{isHindi ? "कोई सामग्री नहीं मिली" : "No Content Found"}</h5>
            </CardBody>
          </Card>
        ) : (
          <>
            {items.map(item => {
              const rawSummary = isHindi
                ? (item.shortDescriptionHi || item.shortDescriptionEn)
                : item.shortDescriptionEn;
              const summary = truncateText(rawSummary, 160);
              const relevantDate = sortBy === "updatedAt" ? item.updatedAt : item.createdAt;

              return (
                <Card key={item._id} className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                  <Link to={`/${baseSlug}/${mainSlug}/${item.slug}`} className="text-decoration-none text-dark">
                    <CardBody className="py-3 px-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 rounded-pill flex-shrink-0" style={{ width: 6, alignSelf: "stretch", background: "linear-gradient(180deg, #0d6efd, #6610f2)" }} />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-2 text-dark">
                            {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                          </h6>
                          {summary && (
                            <div className="small text-muted mb-3">{summary}</div>
                          )}
                          <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span className="d-flex align-items-center gap-1">
                              <FaCalendarAlt size={12} className="text-success" />
                              {isHindi ? "प्रकाशन:" : "Published:"} {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <FaClock size={12} className="text-warning" />
                              {isHindi ? "अपडेट:" : "Updated:"} {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "—"}
                            </span>
                            {item.documentsUpdate?.length > 0 && (
                              <span className="d-flex align-items-center gap-1">
                                <FaFile size={12} className="text-danger" />
                                {item.documentsUpdate.length} {isHindi ? "दस्तावेज़" : "Docs"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ms-3 text-primary align-self-center">
                          <FaChevronRight size={16} />
                        </div>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              );
            })}

            {totalPages > 1 && (
              <nav aria-label={isHindi ? "पेज नेविगेशन" : "Page navigation"} className="d-flex justify-content-center mt-4">
                <ul className="pagination shadow-sm rounded flex-wrap justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                      {isHindi ? "पिछला" : "Prev"}
                    </button>
                  </li>

                  {pageWindow.map((p, idx) =>
                    p === "..." ? (
                      <li key={`dots-${idx}`} className="page-item disabled">
                        <span className="page-link">…</span>
                      </li>
                    ) : (
                      <li key={p} className={`page-item ${currentPage === p ? "active" : ""}`}>
                        <button type="button" className="page-link" onClick={() => goToPage(p)}>
                          {p}
                        </button>
                      </li>
                    )
                  )}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button type="button" className="page-link" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                      {isHindi ? "अगला" : "Next"}
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