import { useParams, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  Badge,
  Spinner,
  Container,
  Button,
  ListGroup,
  ListGroupItem,
  Alert,
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
  FaTag,
  FaUserTie,
  FaCalendarPlus,
  FaCalendarCheck,
  FaChevronLeft,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
// import "./CreatedDynamicPage.css"; // Optional: for additional custom styles

const API = import.meta.env.VITE_API_URL;

const CreatedDynamicPage = () => {
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
        // fallback to client-side pagination
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

  // Pagination helpers
  const displayedList = serverPagination
    ? contentList
    : contentList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onPageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    if (serverPagination) {
      fetchContentListByMainSlug(page);
    }
    setCurrentPage(page);
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return <FaFilePdf className="text-danger me-2" />;
      case "doc":
      case "docx":
        return <FaFileWord className="text-primary me-2" />;
      case "xls":
      case "xlsx":
        return <FaFileExcel className="text-success me-2" />;
      default:
        return <FaFile className="text-secondary me-2" />;
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };

  const getExcerpt = (html, len = 120) => {
    const text = stripHtml(html);
    if (text.length <= len) return text;
    return text.slice(0, len).trim() + "...";
  };

  const getCurrentPath = () => {
    const path = location.pathname;
    const base = slug ? path.substring(0, path.lastIndexOf("/")) : path;
    return base.replace(/\/$/, "");
  };



  const getSlugTitle = (slug) => {
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="d-flex flex-column align-items-center justify-content-center min-vh-50">
          <Spinner color="primary" style={{ width: "4rem", height: "4rem" }} />
          <h5 className="mt-4 text-primary fw-semibold">
            {isHindi ? "लोड हो रहा है..." : "Loading..."}
          </h5>
          <p className="text-muted mt-2">
            {isHindi
              ? "कृपया प्रतीक्षा करें"
              : "Please wait while we fetch the content"}
          </p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <Alert color="danger" className="text-center w-100 max-w-500">
            <h5 className="alert-heading">
              {isHindi ? "त्रुटि हुई" : "Error Occurred"}
            </h5>
            <p className="mb-0">
              {isHindi
                ? "कुछ गलत हो गया। कृपया पुनः प्रयास करें।"
                : "Something went wrong. Please try again."}
            </p>
            <Button
              color="danger"
              outline
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              {isHindi ? "पुनः प्रयास करें" : "Retry"}
            </Button>
          </Alert>
        </div>
      </Container>
    );
  }

  /* ================= LIST PAGE ================= */
  if (!slug) {
    const currentPath = getCurrentPath();

    return (
      <Container className="py-4 my-4">

        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb bg-white px-3 py-2 rounded-3 shadow-sm border align-items-center">
            <li className="breadcrumb-item">
              <Link
                to="/"
                className="text-decoration-none text-primary d-flex align-items-center gap-1 fw-medium"
              >
                <FaHome size={13} />
                {isHindi ? "होम" : "Home"}
              </Link>
            </li>
            <li className="breadcrumb-item active fw-semibold text-secondary d-flex align-items-center gap-1">
              <FaNewspaper size={13} />
              {getSlugTitle(mainSlug)}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <Card
          className="border-0 shadow-sm mb-4 text-white rounded-4"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%)" }}
        >
          <CardBody className="py-3 px-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <h5 className="mb-0 fw-semibold d-flex text-white align-items-center gap-2">
                <FaNewspaper />
                {getSlugTitle(mainSlug)}
              </h5>
              <Badge pill color="light" className="text-primary fw-bold px-3 py-2">
                {totalDocuments} {isHindi ? "आइटम" : "Items"}
              </Badge>
            </div>
          </CardBody>
        </Card>

        {/* ================= CONTENT LIST ================= */}
        {totalDocuments > 0 ? (
          <div>

            {displayedList.length > 0 ? (
              displayedList.map((item, idx) => (
                <Card
                  key={item._id}
                  className="border-0 shadow-sm mb-3 rounded-4 overflow-hidden"
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                >
                  <Link
                    to={`${currentPath}/${item.slug}`}
                    className="text-decoration-none text-dark"
                  >
                    <CardBody className="py-3 px-4 position-relative">

                      <div className="d-flex align-items-start">

                        {/* MODERN GRADIENT LEFT BAR */}
                        <div
                          className="me-3 rounded-pill"
                          style={{
                            width: "6px",
                            minHeight: "100%",
                            background: "linear-gradient(180deg, #0d6efd, #6610f2)",
                          }}
                        ></div>

                        <div className="flex-grow-1">

                          {/* TITLE */}
                          <h6 className="fw-bold mb-2 text-dark">
                            {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                          </h6>

                          {/* EXCERPT */}
                          <div className="small text-muted mb-3">
                            { isHindi ? getExcerpt(item.htmlContentHi, 100) ||getExcerpt(item.htmlContent, 100) : getExcerpt(item.htmlContent, 100) }
                          </div>

                          {/* META INFO */}
                          <div className="d-flex flex-wrap gap-3 text-secondary small">

                            {item.department && (
                              <span className="d-flex align-items-center gap-1">
                                <FaBuilding size={12} className="text-primary" />
                                {item.department}
                              </span>
                            )}

                            <span className="d-flex align-items-center gap-1">
                              <FaCalendarAlt size={12} className="text-success" />
                              {isHindi ? "प्रकाशन:" : "Created:"}{" "}
                              {formatDateTime(item.createdAt)}
                            </span>

                            <span className="d-flex align-items-center gap-1">
                              <FaClock size={12} className="text-warning" />
                              {isHindi ? "अपडेट:" : "Updated:"}{" "}
                              {formatDateTime(item.updatedAt)}
                            </span>

                            {item.documentsUpdate?.length > 0 && (
                              <span className="d-flex align-items-center gap-1">
                                <FaFileAlt size={12} className="text-danger" />
                                {item.documentsUpdate.length}{" "}
                                {isHindi ? "दस्तावेज़" : "Docs"}
                              </span>
                            )}

                          </div>
                        </div>

                        {/* RIGHT ARROW */}
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
                  <h6 className="text-muted mb-0">
                    {isHindi
                      ? "इस पृष्ठ पर कोई आइटम नहीं"
                      : "No items on this page"}
                  </h6>
                </CardBody>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <ul className="pagination shadow-sm rounded">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => onPageChange(currentPage - 1)}
                    >
                      {isHindi ? "पिछला" : "Prev"}
                    </button>
                  </li>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => onPageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => onPageChange(currentPage + 1)}
                    >
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
              <h5 className="text-muted mb-2">
                {isHindi ? "कोई सामग्री नहीं मिली" : "No Content Found"}
              </h5>
              <p className="text-muted">
                {isHindi
                  ? "इस श्रेणी में अभी तक कोई सामग्री नहीं है।"
                  : "No content available in this category yet."}
              </p>
            </CardBody>
          </Card>
        )}

      </Container>
    );
  }


  /* ================= DETAIL PAGE ================= */
  const currentPath = getCurrentPath();

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb bg-white p-3 rounded shadow-sm border">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none d-flex align-items-center">
              <FaHome className="me-2 text-primary" />
              <span className="text-primary fw-medium">
                {isHindi ? "होम" : "Home"}
              </span>
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link to={currentPath} className="text-decoration-none d-flex align-items-center">
              <FaNewspaper className="me-2 text-secondary" />
              <span className="text-dark">{getSlugTitle(mainSlug)}</span>
            </Link>
          </li>
          <li className="breadcrumb-item active fw-semibold text-truncate text-dark ">
            {contentDetail &&
              (isHindi ? contentDetail.titleHin || contentDetail.titleEng : contentDetail.titleEng)}
          </li>
        </ol>
      </nav>

      {contentDetail && (
        <Card className="shadow border-0">
          <CardBody className="p-0">
            <div className="bg-gradient-primary text-dark p-4 rounded-top">
              <h1 className="h3 fw-bold mb-3">
                {isHindi ? contentDetail.titleHin || contentDetail.titleEng : contentDetail.titleEng}
              </h1>
              <hr className="my-0 py-0" />
              <Row className="g-3">
                {contentDetail.department && (
                  <Col md="auto">
                    <div className="d-flex align-items-center bg-white bg-opacity-25 p-2 rounded">
                      <FaUserTie className="me-2" />
                      <span className="fw-medium">{contentDetail.department}</span>
                    </div>
                  </Col>
                )}

                <Col md="auto">
                  <div className="d-flex align-items-center bg-white bg-opacity-25 p-2 rounded">
                    <FaCalendarAlt className="me-2" />
                    <span className="fw-medium">
                      {isHindi ? "प्रकाशन तिथि" : "Created At"}:{" "}
                      {formatDateTime(contentDetail.createdAt)}
                    </span>
                  </div>
                </Col>

                <Col md="auto">
                  <div className="d-flex align-items-center bg-white bg-opacity-25 p-2 rounded">
                    <FaCalendarPlus className="me-2" />
                    <span className="fw-medium">
                      {isHindi ? "अपडेट किया गया" : "Updated At"}:{" "}
                      {formatDateTime(contentDetail.updatedAt)}
                    </span>
                  </div>
                </Col>

                <Col md="auto" className="ms-auto d-flex align-items-center">
                  <Link to={currentPath} className=" bg-black text-white px-2  rounded text-decoration-none fw-medium">
                    <FaChevronLeft className="me-2" />
                    {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                  </Link>
                </Col>
                <hr className="my-0 py-0" />
              </Row>
            </div>
            <div className="px-4 ">
              <div className="content-body mb-5">
                <div className="prose-content"
                  dangerouslySetInnerHTML={{ __html: isHindi ? contentDetail.htmlContentHi : contentDetail.htmlContent || contentDetail.htmlContent }} />
              </div>

              {/* Documents Section */}
              {contentDetail.documentsUpdate?.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                  <h4 className="mb-3 fw-bold">
                    {isHindi
                      ? "इस सूचना से संबंधित सभी अद्यतन दस्तावेज़"
                      : "All Updates Related to This Notification"}
                  </h4>
                  <hr className="my-3 py-0 " />
                  {contentDetail.documentsUpdate.map((doc, i) => (
                    <table key={`file-${i}`} className="table table-bordered align-middle mb-3" >
                      <tbody>
                        {/* DATE */}
                        <tr>
                          <td style={{ width: "180px" }} className="fw-semibold bg-light">
                            {isHindi ? "तिथि" : "Dates"}
                          </td>
                          <td>
                            <b className="text-info">Created At:</b> {formatDateTime(doc.createdAt)} || <b className="text-success">Updated At:</b> {formatDateTime(doc.updatedAt)}
                          </td>
                        </tr>
                        <tr>
                          {/* VIEW / DOWNLOAD */}
                          <td style={{ width: "180px" }} className="fw-semibold bg-light">
                            {isHindi ? "देखें / डाउनलोड" : "View / Download"}
                          </td>

                          <td>
                            <div className="d-flex flex-column gap-2">

                              {/* File title row */}
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <a
                                  href={`${API}${doc.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="fw-bold text-decoration-none"
                                >
                                  {getFileIcon(doc.fileType)}  {isHindi ? doc.titleHin || doc.titleEng : doc.titleEng}
                                </a>
                                {/* File meta info (TOP of download button) */}
                                <strong className="text-danger small fw-bold">
                                  {isHindi ? "फाइल विवरण" : "File Details"} :
                                  <span className="ms-1">
                                    {doc.fileSize} | {doc.fileType?.toUpperCase()}
                                  </span>
                                  {/* Download button */}
                                  <Badge
                                    color="dark"
                                    onClick={() => window.open(`${API}${doc.fileUrl}`, "_blank")}
                                    className="btn btn-sm b d-inline-flex align-items-center ms-3"
                                  >
                                    <FaDownload className="me-1" />
                                    {isHindi ? "डाउनलोड" : "Download"}
                                  </Badge>
                                </strong>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {/* Description */}
                        <tr>
                          <td style={{ width: "180px" }} className="fw-semibold bg-light">
                            {isHindi ? "विवरण" : "Description"}
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-2">
                              <p>{isHindi ? doc.shortDescriptionHin || doc.shortDescriptionEn : doc.shortDescriptionEn}</p>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  ))}
                  <div className="mt-5 pt-4 my-2 mx-3 text-center border-top">
                    <small className="mb-3 fw-bold text-secondary ">
                      <i>{isHindi ? "* इस सूचना का पूर्ण विवरण * " : " * Complete Details of This Notification *"}</i>
                    </small>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default CreatedDynamicPage;