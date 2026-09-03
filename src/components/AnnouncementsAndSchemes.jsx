import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Container, Card, CardBody, Row, Col,
  Button, Spinner, Alert
} from "reactstrap";
import {
  FaBullhorn, FaFileAlt, FaCalendarAlt,
  FaArrowRight, FaTag, FaWhatsapp,
  FaTelegramPlane, FaFacebookF, FaCopy,
  FaCheck
} from "react-icons/fa";
import { useLanguage } from "../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AnnouncementsAndSchemes = () => {
  const [activeTab, setActiveTab] = useState("announcements");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
  const [copiedId, setCopiedId] = useState(null);

  const { isHindi } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_URL}/api/get-announcements`, {
          params: {
            isSchemes: activeTab === "schemes",
            page,
            limit: 6,
          },
        });

        if (isMounted) {
          if (res.data && res.data.success) {
            setItems(res.data.data || []);
            setPagination({
              totalPages: res.data.pagination?.totalPages || 1,
              totalItems: res.data.pagination?.total || res.data.pagination?.totalItems || (res.data.data || []).length,
            });
          } else {
            setItems([]);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching content:", err);
          setError(
            isHindi
              ? "डेटा लोड करने में विफल। कृपया बाद में पुन: प्रयास करें।"
              : "Failed to load content. Please try again later."
          );
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, [activeTab, page, isHindi]);

  const handleTabChange = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setPage(1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(
      isHindi ? "hi-IN" : "en-US",
      options
    );
  };

  const isRecent = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - itemDate) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + "..."
      : cleanText;
  };

  const getImageUrl = (path) => {
    if (!path) return "/indrawati-bhavan.png";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const clean = path.startsWith("/") ? path : `/${path}`;
    return `${API_URL}${clean}`;
  };

  const getItemUrl = (slug) => {
    const route = activeTab === "announcements" ? "announcement" : "scheme";
    return `${window.location.origin}/${route}/${slug || ""}`;
  };

  const handleShareWhatsapp = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const title = isHindi ? (item.titleHi || item.titleEn) : item.titleEn;
    const url = getItemUrl(item.slug);
    const text = `${title}\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareTelegram = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const title = isHindi ? (item.titleHi || item.titleEn) : item.titleEn;
    const url = getItemUrl(item.slug);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
  };

  const handleShareFacebook = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getItemUrl(item.slug);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getItemUrl(item.slug);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopiedId(item._id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  return (
    <Container className="py-2">
      {error && (
        <Alert color="danger" className="mb-2.5 rounded-3 shadow-sm py-2">
          {error}
        </Alert>
      )}

      {/* Main Unified Card container */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>

        {/* Unified Government Theme Header */}
        <div className="gov-card-header d-flex flex-wrap align-items-center justify-content-between gap-3">
          {/* Left: Icon + Title */}
          <div className="d-flex align-items-center gap-3">
            <div className="gov-card-header-icon">
              {activeTab === "announcements" ? <FaBullhorn size={18} color="#fff" /> : <FaFileAlt size={18} color="#fff" />}
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-white" style={{ fontSize: "1.08rem" }}>
                {isHindi ? "घोषणाएं और योजनाएं" : "Announcements & Schemes"}
              </h4>
              <p className="text-white-50 mb-0" style={{ fontSize: "12px", marginTop: "2px" }}>
                {isHindi ? "नवीनतम सूचनाएं एवं विभागीय कल्याणकारी योजनाएं" : "Latest official updates, notices & government welfare schemes"}
              </p>
            </div>
          </div>

          {/* Right: Clean Segmented Tab Buttons + View All link */}
          <div className="d-flex align-items-center gap-2 ms-auto ms-sm-0 flex-wrap">
            <div
              className="d-flex align-items-center p-1 rounded-pill"
              style={{ background: "rgba(255, 255, 255, 0.15)", border: "1px solid rgba(255, 255, 255, 0.25)" }}
            >
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                  activeTab === "announcements" ? "btn-light text-primary shadow-sm" : "btn-transparent text-white border-0"
                }`}
                style={{
                  fontSize: "12.5px"
                }}
                onClick={() => handleTabChange("announcements")}
              >
                <FaBullhorn className="me-1.5" size={12} />
                {isHindi ? "घोषणाएं" : "Announcements"}
              </button>

              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                  activeTab === "schemes" ? "btn-light text-primary shadow-sm" : "btn-transparent text-white border-0"
                }`}
                style={{
                  fontSize: "12.5px"
                }}
                onClick={() => handleTabChange("schemes")}
              >
                <FaFileAlt className="me-1.5" size={12} />
                {isHindi ? "योजनाएं" : "Schemes"}
              </button>
            </div>

            <Link
              to={activeTab === "schemes" ? "/schemes" : "/announcements"}
              className="gov-card-header-btn"
            >
              {isHindi ? "सभी देखें" : "View All"}
              <FaArrowRight size={9} />
            </Link>
          </div>
        </div>

        <CardBody className="p-3 p-md-3.5">
          {loading && items.length === 0 ? (
            <div className="text-center py-4">
              <Spinner color="primary" size="sm" />
              <p className="mt-2 text-muted small fw-semibold">
                {isHindi ? "लोड हो रहा है..." : "Loading content..."}
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-4">
              {activeTab === "announcements" ? (
                <FaBullhorn size={36} className="text-muted mb-2 opacity-25" />
              ) : (
                <FaFileAlt size={36} className="text-muted mb-2 opacity-25" />
              )}
              <h6 className="text-muted fw-semibold mb-0" style={{ fontSize: "13.5px" }}>
                {isHindi ? "कोई डेटा उपलब्ध नहीं है" : "No content available right now"}
              </h6>
            </div>
          ) : (
            /* 2-Column Grid Layout for both Announcements & Schemes */
            <Row className="g-3">
              {items.map((item) => {
                const title = isHindi ? (item.titleHi || item.titleEn) : (item.titleEn || item.titleHi);
                const shortDesc = isHindi
                  ? (item.shortDescriptionHi || item.shortDescriptionEn)
                  : (item.shortDescriptionEn || item.shortDescriptionHi);
                const targetUrl = `/${activeTab === 'announcements' ? 'announcement' : 'scheme'}/${item.slug}`;
                const imgSrc = getImageUrl(item.image);

                return (
                  <Col xs={12} lg={6} key={item._id}>
                    <div className="news-grid-card">
                      {/* Top content row: Thumbnail + Details */}
                      <div className="d-flex gap-3 align-items-start">
                        {/* Thumbnail */}
                        <Link to={targetUrl} className="text-decoration-none flex-shrink-0">
                          <div className="news-grid-thumb">
                            <img
                              src={imgSrc}
                              alt={title}
                              className="news-grid-thumb-img"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = "/indrawati-bhavan.png"; }}
                            />
                          </div>
                        </Link>

                        {/* Text info */}
                        <div className="flex-grow-1 min-w-0">
                          {/* Badges & Date */}
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                            {item?.categoryId && (
                              <span
                                className="badge fw-semibold text-uppercase px-2 py-0.5 rounded"
                                style={{
                                  background: "#eff6ff",
                                  color: "#1e40af",
                                  border: "1px solid #bfdbfe",
                                  fontSize: "11px"
                                }}
                              >
                                <FaTag className="me-1 opacity-75" size={8.5} />
                                {isHindi
                                  ? item.categoryId.categoryNameHi || item.categoryId.categoryNameEn
                                  : item.categoryId.categoryNameEn}
                              </span>
                            )}

                            {isRecent(item.createdAt) && (
                              <span
                                className="badge bg-danger text-white rounded-pill px-2 py-0.5"
                                style={{ fontSize: "9.5px", fontWeight: 700 }}
                              >
                                {isHindi ? "नया" : "NEW"}
                              </span>
                            )}

                            <span className="text-muted ms-auto d-inline-flex align-items-center" style={{ fontSize: "11.5px" }}>
                              <FaCalendarAlt className="me-1 text-primary opacity-75" size={10} />
                              {formatDate(item.fromDate || item.createdAt)}
                            </span>
                          </div>

                          {/* Title */}
                          <Link to={targetUrl} className="text-decoration-none">
                            <h4 className="news-grid-title">
                              {title}
                            </h4>
                          </Link>

                          {/* Excerpt */}
                          {shortDesc && (
                            <p className="news-grid-desc">
                              {truncateText(shortDesc, 85)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Bar: Social Share + Read More */}
                      <div
                        className="d-flex justify-content-between align-items-center mt-auto"
                        style={{
                          paddingTop: "8px",
                          marginTop: "10px",
                          borderTop: "1px solid #f1f5f9"
                        }}
                      >
                        {/* Share Icons */}
                        <div className="d-flex align-items-center gap-1">
                          <span
                            className="text-muted fw-semibold me-1 d-none d-sm-inline"
                            style={{ fontSize: "11px", letterSpacing: "0.2px" }}
                          >
                            {isHindi ? "शेयर:" : "Share:"}
                          </span>

                          <button
                            type="button"
                            className="share-btn whatsapp"
                            title={isHindi ? "व्हाट्सएप पर शेयर करें" : "Share on WhatsApp"}
                            onClick={(e) => handleShareWhatsapp(e, item)}
                            aria-label="Share on WhatsApp"
                          >
                            <FaWhatsapp size={12} />
                          </button>

                          <button
                            type="button"
                            className="share-btn telegram"
                            title={isHindi ? "टेलीग्राम पर शेयर करें" : "Share on Telegram"}
                            onClick={(e) => handleShareTelegram(e, item)}
                            aria-label="Share on Telegram"
                          >
                            <FaTelegramPlane size={11} />
                          </button>

                          <button
                            type="button"
                            className="share-btn facebook"
                            title={isHindi ? "फेसबुक पर शेयर करें" : "Share on Facebook"}
                            onClick={(e) => handleShareFacebook(e, item)}
                            aria-label="Share on Facebook"
                          >
                            <FaFacebookF size={11} />
                          </button>

                          <button
                            type="button"
                            className="share-btn copy"
                            title={copiedId === item._id ? (isHindi ? "लिंक कॉपी हो गया!" : "Link Copied!") : (isHindi ? "लिंक कॉपी करें" : "Copy Link")}
                            onClick={(e) => handleCopyLink(e, item)}
                            aria-label="Copy Link"
                          >
                            {copiedId === item._id ? <FaCheck size={10.5} className="text-success" /> : <FaCopy size={10.5} />}
                          </button>
                        </div>

                        {/* Read More Link */}
                        <Link
                          to={targetUrl}
                          className="btn btn-sm text-white fw-semibold px-2.5 rounded-pill shadow-xs d-inline-flex align-items-center gap-1 border-0"
                          style={{
                            height: "26px",
                            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                            fontSize: "11px",
                            transition: "all 0.2s ease"
                          }}
                        >
                          {isHindi ? "और पढ़ें" : "Read More"}
                          <FaArrowRight size={8} />
                        </Link>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </CardBody>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="bg-light px-3 px-md-4 py-2 border-top d-flex justify-content-between align-items-center">
            <span className="text-muted small fw-medium" style={{ fontSize: "12px" }}>
              {isHindi ? "पृष्ठ" : "Page"} <strong>{page}</strong> {isHindi ? "का" : "of"} <strong>{pagination.totalPages}</strong>
            </span>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                color="primary"
                outline
                disabled={page === 1 || loading}
                onClick={() => setPage(page - 1)}
                className="px-2.5 py-0.5 rounded-pill"
                style={{ fontSize: "11.5px" }}
              >
                {isHindi ? "पिछला" : "Previous"}
              </Button>
              <Button
                size="sm"
                color="primary"
                outline
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage(page + 1)}
                className="px-3 py-0.5 rounded-pill"
                style={{ fontSize: "11.5px" }}
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