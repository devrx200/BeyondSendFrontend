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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getMainSlug = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    return slug ? parts[parts.length - 2] : parts[parts.length - 1];
  };

  const mainSlug = getMainSlug();

  const fetchContentListByMainSlug = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(
        `${API}/api/get-content-by-main-slug/${mainSlug}`
      );
      setContentList(res?.data?.data || []);
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
  }, [mainSlug, slug]);

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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (date) =>
    new Date(date).toLocaleString(isHindi ? "hi-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getCurrentPath = () => {
    const path = location.pathname;
    const base = slug ? path.substring(0, path.lastIndexOf("/")) : path;
    return base.replace(/\/$/, "");
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    return size;
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
            <li className="breadcrumb-item active fw-semibold">
              <FaNewspaper className="me-2 text-secondary" />
              {getSlugTitle(mainSlug)}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-gradient-primary text-white p-4 mb-4 rounded shadow">
          <div className="d-flex align-items-center">
            <div className="bg-white text-primary rounded-circle p-3 me-3">
              <FaNewspaper size={24} />
            </div>
            <div>
              <h2 className="mb-1 fw-bold">{getSlugTitle(mainSlug)}</h2>
              <p className="mb-0 opacity-85">
                {isHindi
                  ? `${contentList.length} आइटम मिले`
                  : `${contentList.length} items found`}
              </p>
            </div>
          </div>
        </div>

        {/* Content List */}
        {contentList.length > 0 ? (
          <Row>
            {contentList.map((item, index) => (
              <Col lg={6} key={item._id} className="mb-3">
                <Card className="h-100 border-0 shadow-sm hover-shadow transition-all">
                  <CardBody className="p-4">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                        style={{ width: 40, height: 40 }}>
                        {index + 1}
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="fw-bold mb-2 text-dark">
                          <Link
                            to={`${currentPath}/${item.slug}`}
                            className="text-decoration-none text-dark hover-text-primary"
                          >
                            {isHindi
                              ? item.titleHin || item.titleEng
                              : item.titleEng}
                          </Link>
                        </h5>
                        
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {item.department && (
                            <Badge color="info" className="d-inline-flex align-items-center">
                              <FaBuilding size={12} className="me-1" />
                              {item.department}
                            </Badge>
                          )}
                          <Badge color="secondary" className="d-inline-flex align-items-center">
                            <FaCalendarAlt size={12} className="me-1" />
                            {formatDate(item.publishDate)}
                          </Badge>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <small className="text-muted d-flex align-items-center">
                            <FaClock className="me-1" />
                            {formatDateTime(item.createdAt)}
                          </small>
                          <Link
                            to={`${currentPath}/${item.slug}`}
                            className="btn btn-primary btn-sm d-flex align-items-center"
                          >
                            {isHindi ? "विस्तार से देखें" : "View Details"}
                            <FaChevronRight size={12} className="ms-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
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
          <li className="breadcrumb-item active fw-semibold text-truncate">
            {contentDetail &&
              (isHindi
                ? contentDetail.titleHin || contentDetail.titleEng
                : contentDetail.titleEng)}
          </li>
        </ol>
      </nav>

      {contentDetail && (
        <Card className="shadow border-0">
          {/* Content Header */}
          <CardBody className="p-0">
            <div className="bg-gradient-primary text-white p-4 rounded-top">
              <h1 className="h2 fw-bold mb-3">
                {isHindi
                  ? contentDetail.titleHin || contentDetail.titleEng
                  : contentDetail.titleEng}
              </h1>
              
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
                      {isHindi ? "प्रकाशन तिथि" : "Published"}:{" "}
                      {formatDate(contentDetail.publishDate)}
                    </span>
                  </div>
                </Col>
                
                <Col md="auto">
                  <div className="d-flex align-items-center bg-white bg-opacity-25 p-2 rounded">
                    <FaCalendarPlus className="me-2" />
                    <span className="fw-medium">
                      {isHindi ? "बनाया गया" : "Created"}:{" "}
                      {formatDateTime(contentDetail.createdAt)}
                    </span>
                  </div>
                </Col>
                
                {contentDetail.updatedAt && (
                  <Col md="auto">
                    <div className="d-flex align-items-center bg-white bg-opacity-25 p-2 rounded">
                      <FaCalendarCheck className="me-2" />
                      <span className="fw-medium">
                        {isHindi ? "अपडेट किया गया" : "Updated"}:{" "}
                        {formatDateTime(contentDetail.updatedAt)}
                      </span>
                    </div>
                  </Col>
                )}
              </Row>
            </div>

            {/* Content Body */}
            <div className="p-4">
              <div className="content-body mb-5">
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{
                    __html: contentDetail.htmlContent,
                  }}
                />
              </div>

              {/* Documents Section */}
              {contentDetail.documentsUpdate?.length > 0 && (
                <div className="mt-5 pt-4 border-top">
                  <h4 className="mb-4 d-flex align-items-center">
                    <FaFileAlt className="me-2 text-primary" />
                    {isHindi ? "संलग्न दस्तावेज" : "Attached Documents"}
                    <Badge color="primary" className="ms-2">
                      {contentDetail.documentsUpdate.length}
                    </Badge>
                  </h4>
                  
                  <Row className="g-3">
                    {contentDetail.documentsUpdate.map((doc, i) => (
                      <Col lg={6} key={i}>
                        <Card className="border h-100">
                          <CardBody className="p-3">
                            <div className="d-flex align-items-start">
                              <div className="me-3">
                                {getFileIcon(doc.fileType)}
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="fw-bold mb-1">
                                  {isHindi ? doc.titleHin || doc.titleEng : doc.titleEng}
                                </h6>
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                  <Badge color="light" className="text-dark border">
                                    {doc.fileType?.toUpperCase()}
                                  </Badge>
                                  <Badge color="light" className="text-dark border">
                                    {formatFileSize(doc.fileSize)}
                                  </Badge>
                                  <Badge color="light" className="text-dark border">
                                    {formatDate(doc.publishDate)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="ms-2">
                                <Button
                                  size="sm"
                                  color="primary"
                                  tag="a"
                                  href={`${API}${doc.fileUrl}`}
                                  target="_blank"
                                  className="d-flex align-items-center"
                                >
                                  <FaDownload className="me-1" />
                                  {isHindi ? "डाउनलोड" : "Download"}
                                </Button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              {/* Back Button */}
              <div className="text-center mt-5 pt-4 border-top">
                <Link to={currentPath} className="btn btn-outline-primary px-4">
                  ← {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </Container>
  );
};

export default CreatedDynamicPage;