import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Badge,
  Row,
  Col,
  Button,
  Spinner,
  Container,
  Alert
} from "reactstrap";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCalendarAlt, FaBullhorn, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AnnouncementsAndSchemes = () => {
  const { isHindi } = useLanguage();

  const [announcements, setAnnouncements] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [schemePage, setSchemePage] = useState(1);
  const [announcementPagination, setAnnouncementPagination] = useState({ 
    total: 0, 
    limit: 5,
    totalPages: 0 
  });
  const [schemePagination, setSchemePagination] = useState({ 
    total: 0, 
    limit: 5,
    totalPages: 0 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [announcementPage]);

  useEffect(() => {
    fetchSchemes();
  }, [schemePage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${API_URL}/api/get-announcements?page=${announcementPage}&limit=5&isSchemes=false`
      );

      setAnnouncements(res?.data?.data || []);
      
      const pagination = res?.data?.pagination || {};
      setAnnouncementPagination({
        total: pagination.total || 0,
        limit: pagination.limit || 5,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 5))
      });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-announcements?page=${schemePage}&limit=5&isSchemes=true`
      );

      setSchemes(res?.data?.data || []);
      
      const pagination = res?.data?.pagination || {};
      setSchemePagination({
        total: pagination.total || 0,
        limit: pagination.limit || 5,
        totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 5))
      });
    } catch (error) {
      console.error("Error fetching schemes:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString(isHindi ? "hi-IN" : "en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + "..." 
      : cleanText;
  };

  return (
    <Container className="py-4">
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* LEFT: ANNOUNCEMENTS */}
        <Col lg={8}>
          <div className="d-flex align-items-center mb-4">
            <FaBullhorn className="text-primary me-2" size={24} />
            <h4 className="fw-bold mb-0">
              {isHindi ? "नवीनतम घोषणाएं" : "Latest Announcements"}
            </h4>
            {announcementPagination.total > 0 && (
              <Badge color="primary" pill className="ms-2">
                {announcementPagination.total}
              </Badge>
            )}
          </div>

          {loading && announcementPage === 1 ? (
            <div className="text-center py-5">
              <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">
                {isHindi ? "लोड हो रहा है..." : "Loading..."}
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardBody className="text-center py-5">
                <FaBullhorn size={48} className="text-muted mb-3 opacity-25" />
                <h5 className="text-muted">
                  {isHindi ? "कोई घोषणा उपलब्ध नहीं है" : "No announcements available"}
                </h5>
                <p className="text-muted small">
                  {isHindi 
                    ? "नई घोषणाओं के लिए बाद में देखें" 
                    : "Check back later for new announcements"}
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              {announcements.map((a) => (
                <Card key={a._id} className="mb-3 shadow-sm border-0 hover-shadow">
                  <Row className="g-0">
                    {a.image && (
                      <Col md={4}>
                        <img
                          src={`${API_URL}${a.image}`}
                          alt={isHindi ? a.titleHi : a.titleEn}
                          className="img-fluid rounded-start h-100"
                          style={{
                            minHeight: "200px",
                            objectFit: "cover"
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </Col>
                    )}

                    <Col md={a.image ? 8 : 12}>
                      <CardBody className="h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="d-flex gap-2 flex-wrap">
                            {a?.categoryId && (
                              <Badge color="primary" className="text-uppercase">
                                {isHindi
                                  ? a.categoryId.categoryNameHi || a.categoryId.categoryNameEn
                                  : a.categoryId.categoryNameEn}
                              </Badge>
                            )}

                            {a.isNew && (
                              <Badge color="danger" pill>
                                {isHindi ? "नया" : "NEW"}
                              </Badge>
                            )}

                            {a.isExternal && (
                              <Badge color="info" pill>
                                {isHindi ? "बाह्य" : "External"}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardTitle tag="h5" className="fw-semibold mb-2">
                          {isHindi ? (a.titleHi || a.titleEn) : a.titleEn}
                        </CardTitle>

                        <CardText className="text-muted small flex-grow-1 mb-3">
                          {truncateText(
                            isHindi
                              ? (a.shortDescriptionHi || a.shortDescriptionEn)
                              : a.shortDescriptionEn
                          )}
                        </CardText>

                        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                          <small className="text-muted d-flex align-items-center">
                            <FaCalendarAlt className="me-1" />
                            {formatDate(a.fromDate || a.createdAt)}
                          </small>

                          {a.slug && (
                            <Link
                              to={`/announcement/${a.slug}`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              {isHindi ? "और पढ़ें" : "Read More"}
                              <FaArrowRight className="ms-1" />
                            </Link>
                          )}
                        </div>

                        {a.expiryDate && new Date(a.expiryDate) > new Date() && (
                          <small className="text-danger mt-2">
                            {isHindi ? "समाप्ति: " : "Expires: "}
                            {formatDate(a.expiryDate)}
                          </small>
                        )}
                      </CardBody>
                    </Col>
                  </Row>
                </Card>
              ))}

              {/* ANNOUNCEMENTS PAGINATION */}
              {announcementPagination.totalPages > 1 && (
                <Card className="border-0 shadow-sm">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="text-muted small">
                        {isHindi ? "पृष्ठ" : "Page"} {announcementPage} {isHindi ? "का" : "of"} {announcementPagination.totalPages}
                        <span className="ms-2">
                          ({isHindi ? "कुल" : "Total"}: {announcementPagination.total} {isHindi ? "घोषणाएं" : "announcements"})
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          outline
                          disabled={announcementPage === 1 || loading}
                          onClick={() => setAnnouncementPage(announcementPage - 1)}
                        >
                          {isHindi ? "पिछला" : "Previous"}
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          outline
                          disabled={announcementPage >= announcementPagination.totalPages || loading}
                          onClick={() => setAnnouncementPage(announcementPage + 1)}
                        >
                          {isHindi ? "अगला" : "Next"}
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}
        </Col>

        {/* RIGHT: SCHEMES */}
        <Col lg={4}>
          <div className="position-sticky" style={{ top: "90px" }}>
            <Card className="shadow-sm border-0">
              <CardBody>
                <div className="d-flex align-items-center mb-3">
                  <FaFileAlt className="text-success me-2" size={20} />
                  <h5 className="fw-bold mb-0">
                    {isHindi ? "योजनाएं" : "Schemes"}
                  </h5>
                  {schemePagination.total > 0 && (
                    <Badge color="success" pill className="ms-2">
                      {schemePagination.total}
                    </Badge>
                  )}
                </div>

                {schemes.length === 0 ? (
                  <div className="text-center py-4">
                    <FaFileAlt size={32} className="text-muted mb-2 opacity-25" />
                    <p className="text-muted small mb-0">
                      {isHindi ? "कोई योजना उपलब्ध नहीं है" : "No schemes available"}
                    </p>
                  </div>
                ) : (
                  <>
                    {schemes.map((s) => (
                      <Card key={s._id} className="mb-3 border shadow-sm hover-shadow">
                        <CardBody className="p-3">
                          <Row className="g-2">
                            {s.image && (
                              <Col xs={4}>
                                <img
                                  src={`${API_URL}${s.image}`}
                                  alt={isHindi ? s.titleHi : s.titleEn}
                                  className="img-fluid rounded"
                                  style={{
                                    height: "80px",
                                    width: "100%",
                                    objectFit: "cover"
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              </Col>
                            )}

                            <Col xs={s.image ? 8 : 12}>
                              <div className="d-flex flex-column h-100">
                                {s.isNew && (
                                  <Badge color="danger" pill className="align-self-start mb-1" style={{ fontSize: "0.65rem" }}>
                                    {isHindi ? "नया" : "NEW"}
                                  </Badge>
                                )}

                                <CardTitle className="fw-semibold mb-1" style={{ fontSize: "0.9rem" }}>
                                  {isHindi ? (s.titleHi || s.titleEn) : s.titleEn}
                                </CardTitle>

                                <CardText className="text-muted mb-2" style={{ fontSize: "0.75rem" }}>
                                  {truncateText(
                                    isHindi
                                      ? (s.shortDescriptionHi || s.shortDescriptionEn)
                                      : s.shortDescriptionEn,
                                    80
                                  )}
                                </CardText>

                                <div className="mt-auto">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                                      <FaCalendarAlt className="me-1" />
                                      {formatDate(s.fromDate || s.createdAt)}
                                    </small>

                                    {s.slug && (
                                      <Link
                                        to={`/scheme/${s.slug}`}
                                        className="btn btn-sm btn-outline-success btn-sm"
                                        style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                      >
                                        {isHindi ? "देखें" : "View"}
                                        <FaArrowRight className="ms-1" style={{ fontSize: "0.7rem" }} />
                                      </Link>
                                    )}
                                  </div>

                                  {s.expiryDate && new Date(s.expiryDate) > new Date() && (
                                    <small className="text-danger d-block mt-1" style={{ fontSize: "0.7rem" }}>
                                      {isHindi ? "समाप्ति: " : "Expires: "}
                                      {formatDate(s.expiryDate)}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    ))}

                    {/* SCHEMES PAGINATION */}
                    {schemePagination.totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                        <small className="text-muted">
                          {isHindi ? "पृष्ठ" : "Page"} {schemePage}/{schemePagination.totalPages}
                        </small>
                        <div className="d-flex gap-1">
                          <Button
                            size="sm"
                            color="success"
                            outline
                            disabled={schemePage === 1}
                            onClick={() => setSchemePage(schemePage - 1)}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          >
                            {isHindi ? "पिछला" : "Prev"}
                          </Button>
                          <Button
                            size="sm"
                            color="success"
                            outline
                            disabled={schemePage >= schemePagination.totalPages}
                            onClick={() => setSchemePage(schemePage + 1)}
                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                          >
                            {isHindi ? "अगला" : "Next"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>

            {/* QUICK INFO */}
            <Card className="shadow-sm border-0 mt-3">
              <CardBody className="bg-light">
                <h6 className="fw-bold mb-2">
                  {isHindi ? "त्वरित जानकारी" : "Quick Info"}
                </h6>
                <p className="small text-muted mb-0">
                  {isHindi 
                    ? "नवीनतम घोषणाओं और योजनाओं के बारे में सूचित रहें।" 
                    : "Stay informed about the latest announcements and schemes."}
                </p>
              </CardBody>
            </Card>
          </div>
        </Col>
      </Row>

      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
};

export default AnnouncementsAndSchemes;