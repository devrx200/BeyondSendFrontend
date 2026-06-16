import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Badge,
  Spinner,
  Container,
  Button,
  Alert,
  Breadcrumb,
  BreadcrumbItem,
} from "reactstrap";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaDownload,
  FaClock,
  FaChevronRight,
  FaHome,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFile,
  FaBuilding,
  FaNewspaper,
  FaUserTie,
  FaChevronLeft,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const MultiSectionPages = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { isHindi } = useLanguage();

  const [contentDetail, setContentDetail] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [serverPagination, setServerPagination] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getMainSlug = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return slug ? parts[parts.length - 2] : parts[parts.length - 1];
  };

  const mainSlug = getMainSlug();

  const fetchContentListByMainSlug = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(
        `${API}/api/get-content-by-main-slug/${mainSlug}?page=${page}&limit=${pageSize}`
      );
      const data = res?.data?.data || [];
      setContentList(data);
      const pagination = res?.data?.pagination;
      if (pagination) {
        setServerPagination(true);
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalDocuments(pagination.totalDocuments || data.length);
      } else {
        setServerPagination(false);
        setTotalDocuments(data.length);
        setTotalPages(Math.max(1, Math.ceil((data.length || 0) / pageSize)));
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentDetailBySlug = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(
        `${API}/api/get-content-by-slug/${mainSlug}/${slug}`
      );
      setContentDetail(res?.data?.data || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError(false);
    if (mainSlug && slug) {
      setContentList([]);
      setContentDetail(null);
      fetchContentDetailBySlug();
    } else if (mainSlug) {
      setContentDetail(null);
      fetchContentListByMainSlug();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainSlug, slug]);

  const displayedList = serverPagination
    ? contentList
    : contentList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onPageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (serverPagination) fetchContentListByMainSlug(page);
    setCurrentPage(page);
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":   return <FaFilePdf className="text-danger me-2" />;
      case "doc":
      case "docx":  return <FaFileWord className="text-primary me-2" />;
      case "xls":
      case "xlsx":  return <FaFileExcel className="text-success me-2" />;
      default:      return <FaFile className="text-secondary me-2" />;
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

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };

  const getExcerpt = (html, len = 120) => {
    const text = stripHtml(html);
    return text.length <= len ? text : text.slice(0, len).trim() + "...";
  };

  const getMetaDescription = (htmlContent, fallback = "") => {
    if (!htmlContent) return fallback;
    const text = stripHtml(htmlContent);
    return text.length > 160 ? text.substring(0, 157) + "..." : text;
  };

  const getCurrentPath = () => {
    const path = location.pathname;
    const base = slug ? path.substring(0, path.lastIndexOf("/")) : path;
    return base.replace(/\/$/, "");
  };

  const getSlugTitle = (s) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "लोड हो रहा है..." : "Loading..."} - {SITE_TITLE_SUFFIX}</title>
          <meta name="description" content={isHindi ? "कृपया प्रतीक्षा करें" : "Please wait while content loads"} />
        </Helmet>
        <Container className="py-5 text-center">
          <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "50vh" }}>
            <Spinner color="primary" style={{ width: "4rem", height: "4rem" }} />
            <h5 className="mt-4 text-primary fw-semibold">
              {isHindi ? "लोड हो रहा है..." : "Loading..."}
            </h5>
            <p className="text-muted mt-2">
              {isHindi ? "कृपया प्रतीक्षा करें" : "Please wait while we fetch the content"}
            </p>
          </div>
        </Container>
      </>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{isHindi ? "त्रुटि" : "Error"} - {SITE_TITLE_SUFFIX}</title>
          <meta name="description" content={isHindi ? "कुछ गलत हो गया।" : "Something went wrong."} />
        </Helmet>
        <Container className="py-5">
          <div className="d-flex justify-content-center">
            <Alert color="danger" className="text-center w-100">
              <h5 className="alert-heading">{isHindi ? "त्रुटि हुई" : "Error Occurred"}</h5>
              <p className="mb-0">{isHindi ? "कुछ गलत हो गया। कृपया पुनः प्रयास करें।" : "Something went wrong. Please try again."}</p>
              <Button color="danger" outline className="mt-3" onClick={() => window.location.reload()}>
                {isHindi ? "पुनः प्रयास करें" : "Retry"}
              </Button>
            </Alert>
          </div>
        </Container>
      </>
    );
  }

  /* ================= LIST PAGE ================= */
  if (!slug) {
    const currentPath = getCurrentPath();
    const listTitle   = getSlugTitle(mainSlug);
    const pageTitle   = `${listTitle} - ${SITE_TITLE_SUFFIX}`;
    const metaDesc    = isHindi
      ? `${listTitle} सूची - कुल ${totalDocuments} आइटम`
      : `${listTitle} list - Total ${totalDocuments} items`;

    return (
      <>
        <Helmet>
          <html lang={isHindi ? "hi" : "en"} />
          <title>{pageTitle}</title>
          <meta name="description" content={metaDesc} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={metaDesc} />
          <meta property="og:type" content="website" />
        </Helmet>

        <Container className="py-4 my-4">
          <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
            <BreadcrumbItem>
              <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
                <FaHome size={13} />
                {isHindi ? "होम" : "Home"}
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem active className="fw-semibold d-flex align-items-center gap-1 text-secondary">
              <FaNewspaper size={13} />
              {listTitle}
            </BreadcrumbItem>
          </Breadcrumb>

          <Card className="border-0 shadow-lg rounded-4 overflow-hidden mb-4">
            <CardHeader
              className="text-white border-0 p-4"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
            >
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0 fw-bold text-white d-flex align-items-center gap-2">
                  <FaNewspaper />
                  {listTitle}
                </h5>
                <Badge pill color="light" className="text-primary fw-bold px-3 py-2">
                  {totalDocuments} {isHindi ? "आइटम" : "Items"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {totalDocuments > 0 ? (
            <div>
              {displayedList.length > 0 ? (
                displayedList.map((item) => (
                  <Card key={item._id} className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden" style={{ cursor: "pointer" }}>
                    <Link to={`${currentPath}/${item.slug}`} className="text-decoration-none text-dark">
                      <CardBody className="py-3 px-4">
                        <div className="d-flex align-items-start">
                          <div className="me-3 rounded-pill flex-shrink-0" style={{ width: 6, alignSelf: "stretch", background: "linear-gradient(180deg, #0d6efd, #6610f2)" }} />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-2 text-dark">
                              {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                            </h6>
                            <div className="small text-muted mb-3">
                              {isHindi ? getExcerpt(item.htmlContentHi, 100) || getExcerpt(item.htmlContent, 100) : getExcerpt(item.htmlContent, 100)}
                            </div>
                            <div className="d-flex flex-wrap gap-3 text-secondary small">
                              {item.department && (
                                <span className="d-flex align-items-center gap-1">
                                  <FaBuilding size={12} className="text-primary" />
                                  {item.department}
                                </span>
                              )}
                              <span className="d-flex align-items-center gap-1">
                                <FaCalendarAlt size={12} className="text-success" />
                                {isHindi ? "प्रकाशन:" : "Created:"} {formatDateTime(item.createdAt)}
                              </span>
                              <span className="d-flex align-items-center gap-1">
                                <FaClock size={12} className="text-warning" />
                                {isHindi ? "अपडेट:" : "Updated:"} {formatDateTime(item.updatedAt)}
                              </span>
                              {item.documentsUpdate?.length > 0 && (
                                <span className="d-flex align-items-center gap-1">
                                  <FaFileAlt size={12} className="text-danger" />
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
                ))
              ) : (
                <Card className="border-0 shadow-sm rounded-3">
                  <CardBody className="text-center py-4">
                    <h6 className="text-muted mb-0">{isHindi ? "इस पृष्ठ पर कोई आइटम नहीं" : "No items on this page"}</h6>
                  </CardBody>
                </Card>
              )}

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <ul className="pagination shadow-sm rounded">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                        {isHindi ? "पिछला" : "Prev"}
                      </button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => onPageChange(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                        {isHindi ? "अगला" : "Next"}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-0 shadow-sm rounded-3">
              <CardBody className="text-center py-5">
                <FaFileAlt size={48} className="text-muted mb-3" />
                <h5 className="text-muted mb-2">{isHindi ? "कोई सामग्री नहीं मिली" : "No Content Found"}</h5>
                <p className="text-muted">{isHindi ? "इस श्रेणी में अभी तक कोई सामग्री नहीं है।" : "No content available in this category yet."}</p>
              </CardBody>
            </Card>
          )}
        </Container>
      </>
    );
  }

  /* ================= DETAIL PAGE ================= */
  const currentPath    = getCurrentPath();
  const listTitle      = getSlugTitle(mainSlug);
  const detailTitle    = contentDetail
    ? (isHindi ? contentDetail.titleHin || contentDetail.titleEng : contentDetail.titleEng)
    : "";
  const pageTitle      = `${detailTitle} - ${SITE_TITLE_SUFFIX}`;
  const metaDescription = contentDetail
    ? getMetaDescription(isHindi ? contentDetail.htmlContentHi : contentDetail.htmlContent, "")
    : "";
  const publishDate    = formatDateTime(contentDetail?.createdAt);
  const updateDate     = formatDateTime(contentDetail?.updatedAt);

  return (
    <>
      <Helmet>
        <html lang={isHindi ? "hi" : "en"} />
        <title>{pageTitle}</title>
        {metaDescription && <meta name="description" content={metaDescription} />}
        <meta property="og:title" content={pageTitle} />
        {metaDescription && <meta property="og:description" content={metaDescription} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <Container className="py-4">
        <Breadcrumb listClassName="bg-white px-3 py-2 rounded-3 shadow-sm border mb-4 align-items-center">
          <BreadcrumbItem>
            <Link to="/" className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaHome size={13} />
              {isHindi ? "होम" : "Home"}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={currentPath} className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium">
              <FaNewspaper size={13} />
              {listTitle}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active className="fw-semibold text-secondary text-truncate" style={{ maxWidth: "100%" }}>
            {detailTitle}
          </BreadcrumbItem>
        </Breadcrumb>

        {contentDetail && (
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden">
            <CardHeader
              className="text-white border-0 p-4"
              style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
            >
              <h4 className="fw-bold mb-3 text-white">{detailTitle}</h4>
              <hr className="border-white opacity-25 my-3" />
              <Row className="g-2 align-items-center">
                {contentDetail.department && (
                  <Col xs="auto">
                    <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                      <FaUserTie size={12} />
                      {contentDetail.department}
                    </Badge>
                  </Col>
                )}
                <Col xs="auto">
                  <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                    <FaCalendarAlt size={12} />
                    <strong>{isHindi ? "प्रकाशन:" : "Published:"}</strong> {publishDate}
                  </Badge>
                </Col>
                <Col xs="auto">
                  <Badge color="light" className="text-dark px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                    <FaClock size={12} />
                    <strong>{isHindi ? "अपडेट:" : "Updated:"}</strong> {updateDate}
                  </Badge>
                </Col>
                <Col xs={12} md className="d-flex justify-content-start justify-content-md-end ms-md-auto">
                  <Button tag={Link} to={currentPath} color="dark" size="sm" className="fw-semibold px-3 d-flex align-items-center gap-2">
                    <FaChevronLeft size={11} />
                    {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                  </Button>
                </Col>
              </Row>
            </CardHeader>

            <CardBody className="p-4">
              <div
                className="prose-content mb-5"
                dangerouslySetInnerHTML={{
                  __html: isHindi
                    ? contentDetail.htmlContentHi || contentDetail.htmlContent
                    : contentDetail.htmlContent,
                }}
              />

              {contentDetail.documentsUpdate?.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                  <h4 className="mb-3 fw-bold">
                    {isHindi ? "इस सूचना से संबंधित सभी अद्यतन दस्तावेज़" : "All Updates Related to This Notification"}
                  </h4>
                  <hr className="my-3" />
                  {contentDetail.documentsUpdate.map((doc, i) => (
                    <div key={i} className="table-responsive mb-3">
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
                                {isHindi ? doc.titleHin || doc.titleEng : doc.titleEng}
                              </a>
                              <strong className="text-danger small fw-bold">
                                {isHindi ? "फाइल विवरण" : "File Details"}:
                                <span className="ms-1">{doc.fileSize} | {doc.fileType?.toUpperCase()}</span>
                                <Badge
                                  color="dark"
                                  onClick={() => window.open(`${API}${doc.fileUrl}`, "_blank")}
                                  className="btn btn-sm d-inline-flex align-items-center ms-3"
                                  style={{ cursor: "pointer" }}
                                >
                                  <FaDownload className="me-1" />
                                  {isHindi ? "डाउनलोड" : "Download"}
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
        )}
      </Container>
    </>
  );
};

export default MultiSectionPages;