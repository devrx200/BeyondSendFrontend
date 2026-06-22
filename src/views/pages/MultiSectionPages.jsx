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
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const SITE_TITLE_SUFFIX = "Department of Higher Education, Government of Chhattisgarh India.";

const MultiSectionPages = ({ prefetchedData, mode, fullSlug, onPageChange }) => {
  const { isHindi } = useLanguage();

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
    const { baseSlug, mainSlug, items = [], pagination = {} } = prefetchedData;
    const listTitle = mainSlug?.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "";

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
                  {pagination.totalDocuments || 0} {isHindi ? "आइटम" : "Items"}
                </Badge>
              </div>
            </CardHeader>
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
              {items.map(item => (
                <Card key={item._id} className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden">
                  <Link to={`/${baseSlug}/${mainSlug}/${item.slug}`} className="text-decoration-none text-dark">
                    <CardBody className="py-3 px-4">
                      <div className="d-flex align-items-start">
                        <div className="me-3 rounded-pill flex-shrink-0" style={{ width: 6, alignSelf: "stretch", background: "linear-gradient(180deg, #0d6efd, #6610f2)" }} />
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-2 text-dark">
                            {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                          </h6>
                          <div className="small text-muted mb-3">
                            {isHindi ? (item.shortDescriptionHi || item.shortDescriptionEn) : item.shortDescriptionEn}
                          </div>
                          <div className="d-flex flex-wrap gap-3 text-secondary small">
                            <span className="d-flex align-items-center gap-1">
                              <FaCalendarAlt size={12} className="text-success" />
                              {isHindi ? "प्रकाशन:" : "Published:"} {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <span className="d-flex align-items-center gap-1">
                              <FaClock size={12} className="text-warning" />
                              {isHindi ? "अपडेट:" : "Updated:"} {new Date(item.updatedAt).toLocaleDateString()}
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
              ))}

              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <ul className="pagination shadow-sm rounded">
                    <li className={`page-item ${pagination.currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => onPageChange(pagination.currentPage - 1)}>
                        {isHindi ? "पिछला" : "Prev"}
                      </button>
                    </li>
                    {[...Array(pagination.totalPages)].map((_, i) => (
                      <li key={i} className={`page-item ${pagination.currentPage === i + 1 ? "active" : ""}`}>
                        <button className="page-link" onClick={() => onPageChange(i + 1)}>{i + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => onPageChange(pagination.currentPage + 1)}>
                        {isHindi ? "अगला" : "Next"}
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </>
          )}
        </Container>
      </>
    );
  }

  // ---------- DETAIL MODE ----------
  const page = prefetchedData;
  if (!page) return null;

  const title = isHindi ? (page.titleHin || page.titleEng) : page.titleEng;
  const htmlContent = isHindi
    ? (page.htmlContentHi || page.descriptionHi || page.descriptionEn)
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
                                {isHindi ? doc.titleHi || doc.titleEn : doc.titleEn}
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
      </Container>
    </>
  );
};

export default MultiSectionPages;