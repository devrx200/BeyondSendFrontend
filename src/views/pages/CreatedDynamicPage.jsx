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
      <Container className="py-4 bg-light rounded my-4 border border-3 border-white shadow">
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
            <li className="breadcrumb-item active fw-semibold">
              <FaNewspaper className="me-2 text-secondary" />
              {getSlugTitle(mainSlug)}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-gradient-primary text-white p-3 mb-3 rounded shadow-sm">
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-0 fw-semibold">
              <FaNewspaper className="me-2" />
              {getSlugTitle(mainSlug)}
            </h5>

            <small className="opacity-75 text-dark fw-bold">
              {isHindi
                ? `${totalDocuments} आइटम`
                : `${totalDocuments} Items`}
            </small>
          </div>
        </div>


        {/* Content List */}
        {totalDocuments > 0 ? (
          <div className="p-3">
            {displayedList.length > 0 ? (
              displayedList.map((item, idx) => (
                <Card
                  key={item._id}
                  className="border-0 shadow-sm mb-2 hover-shadow transition-all"
                >
                  <Link
                    to={`${currentPath}/${item.slug}`}
                    className="text-decoration-none text-dark"
                  >
                    <CardBody className="py-2 px-3 border-left  border-primary shadow border rounded">
                      <div className="d-flex align-items-center">
                        {/* Content */}
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="fw-semibold hover-text-primary" style={{ fontSize: 15 }}>
                              {isHindi ? item.titleHin || item.titleEng : item.titleEng}
                            </div>
                          </div>

                          <div className="small text-muted mt-1">{getExcerpt(item.htmlContent, 100)}</div>

                          <div className="d-flex flex-wrap gap-3 mt-2 text-muted" style={{ fontSize: 12 }}>
                            {item.department && (
                              <span className="d-flex align-items-center">
                                <FaBuilding size={11} className="me-1" />
                                {item.department}
                              </span>
                            )}

                            <span className="d-flex align-items-center">
                              <FaCalendarAlt size={11} className="me-1" />
                              {formatDateTime(item.createdAt)}
                            </span>

                            <span className="d-flex align-items-center">
                              <FaClock size={11} className="me-1" />
                              {formatDateTime(item.updatedAt)}
                            </span>

                            {item.documentsUpdate?.length > 0 && (
                              <span className="d-flex align-items-center">
                                <FaFileAlt size={11} className="me-1" />
                                {item.documentsUpdate.length} {isHindi ? 'दस्तावेज़' : 'docs'}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Arrow */}
                        <FaChevronRight className="text-muted ms-2" size={12} />
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              ))
            ) : (
              <Card className="border-0 shadow-sm">
                <CardBody className="text-center py-4">
                  <h6 className="mb-0 text-muted">{isHindi ? 'इस पृष्ठ पर कोई आइटम नहीं' : 'No items on this page'}</h6>
                </CardBody>
              </Card>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center m-3">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>{isHindi ? 'पिछला' : 'Prev'}</button>
                    </li>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <li key={`p-${i+1}`} className={`page-item ${currentPage === i+1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => onPageChange(i+1)}>{i+1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>{isHindi ? 'अगला' : 'Next'}</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        ) : (
        <Card className="border-0 shadow-sm">
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