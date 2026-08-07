import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Badge,
  Row,
  Col,
  Button,
  Spinner,
  Container,
  Alert,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCalendarAlt, FaBullhorn, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AnnouncementsAndSchemes = () => {
  const { isHindi } = useLanguage();

  // State Management
  const [activeTab, setActiveTab] = useState("announcements"); // 'announcements' or 'schemes'
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 5,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data whenever page or active tab changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const isSchemes = activeTab === "schemes";
      const res = await axios.get(
        `${API_URL}/api/get-announcements?page=${page}&limit=5&isSchemes=${isSchemes}`
      );

      setItems(res?.data?.data || []);

      const pagData = res?.data?.pagination || {};
      setPagination({
        total: pagData.total || 0,
        limit: pagData.limit || 5,
        totalPages: Math.ceil((pagData.total || 0) / (pagData.limit || 5))
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        isHindi
          ? "डेटा लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।"
          : "Failed to load data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Switch tabs and reset to page 1
  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setPage(1);
      setItems([]); // Clear current items while loading new ones
    }
  };

  // Logic: Check if item was created in the last 1 week (7 days)
  const isRecent = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return itemDate >= oneWeekAgo;
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

  const truncateText = (text, maxLength = 130) => {
    if (!text) return "";
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + "..."
      : cleanText;
  };

  return (
    <Container className="">
      {error && (
        <Alert color="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Main Unified Card container */}
      <Card className="border-0 shadow-lg rounded-4 overflow-hidden">

        {/* Header & Filter Tabs */}
        <div className="bg-white border-bottom px-4 pt-4 pb-0 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
          <div className="d-flex align-items-center mb-md-2 py-0">
            <div className="icon-wrapper bg-primary text-white p-2 rounded-circle me-3">
              {activeTab === "announcements" ? <FaBullhorn size={20} /> : <FaFileAlt size={20} />}
            </div>
            <h3 className="fw-semibold mb-0 text-dark fs-5">
              {isHindi ? "घोषणाएं और योजनाएं" : "Announcements & Schemes"}
            </h3>
          </div>

          <Nav tabs className="border-0 font-weight-bold">
            <NavItem>
              <NavLink
                className={`cursor-pointer px-3 px-md-4 py-2 py-md-3 border-0 border-bottom border-3 rounded-0 ${activeTab === "announcements"
                    ? "active border-primary text-primary fw-semibold"
                    : "border-transparent text-muted"
                  }`}
                onClick={() => handleTabChange("announcements")}
                style={{ cursor: "pointer", background: "none" }}
              >
                {isHindi ? "घोषणाएं" : "Announcements"}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`cursor-pointer px-3 px-md-4 py-2 py-md-3 border-0 border-bottom border-3 rounded-0 ${activeTab === "schemes"
                    ? "active border-success text-success fw-semibold"
                    : "border-transparent text-muted"
                  }`}
                onClick={() => handleTabChange("schemes")}
                style={{ cursor: "pointer", background: "none" }}
              >
                {isHindi ? "योजनाएं" : "Schemes"}
              </NavLink>
            </NavItem>
          </Nav>
        </div>

        <CardBody className="p-0">
          {loading && items.length === 0 ? (
            <div className="text-center py-5">
              <Spinner color={activeTab === "announcements" ? "primary" : "success"} />
              <p className="mt-3 text-muted">
                {isHindi ? "लोड हो रहा है..." : "Loading content..."}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              {activeTab === "announcements" ? (
                <FaBullhorn size={48} className="text-muted mb-3 opacity-25" />
              ) : (
                <FaFileAlt size={48} className="text-muted mb-3 opacity-25" />
              )}
              <h5 className="text-muted">
                {isHindi ? "कोई डेटा उपलब्ध नहीं है" : "No content available right now"}
              </h5>
            </div>
          ) : (
            <div className="news-list">
              {items.map((item) => (
                <div key={item._id} className="news-item border-bottom p-4">
                  <Row className="g-4 align-items-center">
                    {/* Image Section */}
                    {item.image && (
                      <Col xs={12} md={3} lg={2} className="text-center text-md-start">
                        <img
                          src={`${API_URL}${item.image}`}
                          alt={isHindi ? item.titleHi : item.titleEn}
                          className="img-fluid rounded shadow-sm object-fit-cover w-100"
                          style={{ height: "100px", maxWidth: "200px" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      </Col>
                    )}

                    {/* Content Section */}
                    <Col xs={12} md={item.image ? 9 : 12} lg={item.image ? 10 : 12}>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                        {item?.categoryId && (
                          <Badge color="light" className="text-dark border text-uppercase px-2 py-1">
                            {isHindi
                              ? item.categoryId.categoryNameHi || item.categoryId.categoryNameEn
                              : item.categoryId.categoryNameEn}
                          </Badge>
                        )}

                        {/* NEW Logic: Created within last 7 days */}
                        {isRecent(item.createdAt) && (
                          <Badge color="danger" pill className="px-2 py-1 shadow-sm pulse-badge">
                            {isHindi ? "नया" : "NEW"}
                          </Badge>
                        )}

                        {item.isExternal && (
                          <Badge color="info" pill className="px-2 py-1">
                            {isHindi ? "बाह्य" : "External"}
                          </Badge>
                        )}

                        <small className="text-muted ms-auto d-flex align-items-center">
                          <FaCalendarAlt className="me-2" />
                          {formatDate(item.fromDate || item.createdAt)}
                        </small>
                      </div>

                      <h3 className="fw-semibold mb-2 text-dark fs-6">
                        <Link
                          to={`/${activeTab === 'announcements' ? 'announcement' : 'scheme'}/${item.slug}`}
                          className="text-decoration-none text-dark hover-primary-text"
                        >
                          {isHindi ? (item.titleHi || item.titleEn) : item.titleEn}
                        </Link>
                      </h3>

                      <p className="text-muted mb-3 small lh-base">
                        {truncateText(
                          isHindi
                            ? (item.shortDescriptionHi || item.shortDescriptionEn)
                            : item.shortDescriptionEn
                        )}
                      </p>

                      <div className="d-flex justify-content-between align-items-center">
                        {item.expiryDate && new Date(item.expiryDate) > new Date() ? (
                          <small className="text-danger fw-semibold bg-danger bg-opacity-10 px-2 py-1 rounded">
                            {isHindi ? "अंतिम तिथि: " : "Valid till: "}
                            {formatDate(item.expiryDate)}
                          </small>
                        ) : (
                          <span />
                        )}

                        {item.slug && (
                          <Link
                            to={`/${activeTab === 'announcements' ? 'announcement' : 'scheme'}/${item.slug}`}
                            className={`btn btn-sm text-white fw-medium px-3 rounded-pill ${activeTab === 'announcements' ? 'btn-primary' : 'btn-success'}`}
                          >
                            {isHindi ? "और पढ़ें" : "Read More"}
                            <FaArrowRight className="ms-2" style={{ fontSize: "0.8rem" }} />
                          </Link>
                        )}
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </CardBody>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="bg-light p-3 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small fw-medium">
              {isHindi ? "पृष्ठ" : "Page"} <strong>{page}</strong> {isHindi ? "का" : "of"} <strong>{pagination.totalPages}</strong>
            </span>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                color={activeTab === "announcements" ? "primary" : "success"}
                outline
                disabled={page === 1 || loading}
                onClick={() => setPage(page - 1)}
                className="px-3"
              >
                {isHindi ? "पिछला" : "Previous"}
              </Button>
              <Button
                size="sm"
                color={activeTab === "announcements" ? "primary" : "success"}
                outline
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage(page + 1)}
                className="px-4"
              >
                {isHindi ? "अगला" : "Next"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default AnnouncementsAndSchemes;