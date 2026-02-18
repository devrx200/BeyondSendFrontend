import { useEffect, useState } from "react";
import {
  Container, Row, Col, Card, CardBody, CardTitle,
  CardSubtitle, CardText, Badge, Button, Spinner,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Nav, NavItem, NavLink,
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FaCamera, FaCalendarAlt, FaExternalLinkAlt,
  FaImages, FaChevronLeft, FaChevronRight,
  FaTimes, FaExpand, FaEye, FaThLarge, FaList,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

/* ─────────────────────────────────────
   HELPER: build full image URL safely
───────────────────────────────────── */
const imgUrl = (path) => {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // remove accidental leading slash duplication
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${clean}`;
};

/* ─────────────────────────────────────
   COLLAGE: up to 4 preview thumbnails
───────────────────────────────────── */
const Collage = ({ images = [] }) => {
  const imgs = (images || []).slice(0, 4);
  if (!imgs.length) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-secondary"
        style={{ height: 220 }}
      >
        <FaImages size={40} className="text-white opacity-50" />
      </div>
    );
  }

  const imgStyle = { width: "100%", height: "100%", objectFit: "cover", display: "block" };

  if (imgs.length === 1) {
    return (
      <div style={{ height: 220, overflow: "hidden" }}>
        <img src={imgUrl(imgs[0])} alt="cover" style={imgStyle} />
      </div>
    );
  }
  if (imgs.length === 2) {
    return (
      <div style={{ height: 220, display: "flex", gap: 2 }}>
        {imgs.map((img, i) => (
          <div key={i} style={{ flex: 1, overflow: "hidden" }}>
            <img src={imgUrl(img)} alt={`p${i}`} style={imgStyle} />
          </div>
        ))}
      </div>
    );
  }
  if (imgs.length === 3) {
    return (
      <div style={{ height: 220, display: "flex", gap: 2 }}>
        <div style={{ flex: 2, overflow: "hidden" }}>
          <img src={imgUrl(imgs[0])} alt="p0" style={imgStyle} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {imgs.slice(1).map((img, i) => (
            <div key={i} style={{ flex: 1, overflow: "hidden" }}>
              <img src={imgUrl(img)} alt={`p${i + 1}`} style={imgStyle} />
            </div>
          ))}
        </div>
      </div>
    );
  }
  // 4-grid
  return (
    <div style={{ height: 220, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2 }}>
      {imgs.map((img, i) => (
        <div key={i} style={{ overflow: "hidden" }}>
          <img src={imgUrl(img)} alt={`p${i}`} style={imgStyle} />
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
const Gallery = () => {
  const { isHindi } = useLanguage();

  const [galleryList, setGalleryList]       = useState([]);
  const [activeId, setActiveId]             = useState(null);
  const [galleryDetail, setGalleryDetail]   = useState(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [listLoading, setListLoading]       = useState(true);
  const [viewMode, setViewMode]             = useState("grid"); // "grid" | "list"
  const [lightboxOpen, setLightboxOpen]     = useState(false);
  const [lightboxIndex, setLightboxIndex]   = useState(0);

  /* ── fetch all galleries ── */
  const fetchGallery = async () => {
    setListLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery`);
      setGalleryList(data.data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) { console.error(err); }
    finally { setListLoading(false); }
  };

  /* ── toggle inline detail ── */
  const toggleDetail = async (id) => {
    if (activeId === id) { setActiveId(null); setGalleryDetail(null); return; }
    setActiveId(id);
    setGalleryDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/get-gallery-by-id/${id}`);
      setGalleryDetail(data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  /* ── lightbox ── */
  const openLightbox  = (i) => { setLightboxIndex(i); setLightboxOpen(true); };
  const closeLightbox = () => setLightboxOpen(false);
  const lbNext = () => setLightboxIndex((p) => (p + 1) % galleryDetail.images.length);
  const lbPrev = () => setLightboxIndex((p) => (p - 1 + galleryDetail.images.length) % galleryDetail.images.length);

  /* ── external link ── */
  const handleLink = (g) => {
    Swal.fire({
      title: isHindi ? "बाहरी लिंक" : "External Link",
      text: isHindi ? "आप बाहरी वेबसाइट पर जा रहे हैं" : "You are visiting an external website",
      icon: "warning", showCancelButton: true, confirmButtonText: "Continue",
    }).then((r) => { if (r.isConfirmed) window.open(g.link, g.openInNewTab ? "_blank" : "_self"); });
  };

  useEffect(() => { fetchGallery(); }, []);

  /* ──────────────────────────────────────────
     RENDER
  ────────────────────────────────────────── */
  return (
    <PageLayout>

      {/* ══ HERO BANNER ══ */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
          padding: "60px 0 48px",
          marginBottom: 0,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <Badge
                color="info"
                className="text-uppercase mb-3 px-3 py-2"
                style={{ letterSpacing: 3, fontSize: 10, borderRadius: 20 }}
              >
                <FaCamera className="me-1" />
                {isHindi ? "संग्रह" : "Collection"}
              </Badge>
              <h1
                className="text-white mb-2"
                style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 700, lineHeight: 1.1 }}
              >
                {isHindi ? "चित्र" : "Photo"}{" "}
                <span style={{ color: "#4fc3f7" }}>
                  {isHindi ? "प्रदर्शनी" : "Gallery"}
                </span>
              </h1>
              <p className="mb-0" style={{ color: "rgba(255,255,255,0.6)", fontSize: 15 }}>
                {isHindi
                  ? "कार्यक्रमों और गतिविधियों की झलकियां"
                  : "Glimpses of events & activities captured beautifully"}
              </p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              {/* View toggle */}
              <div className="d-inline-flex gap-2">
                <Button
                  color={viewMode === "grid" ? "info" : "outline-light"}
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => setViewMode("grid")}
                >
                  <FaThLarge size={12} />
                  {isHindi ? "ग्रिड" : "Grid"}
                </Button>
                <Button
                  color={viewMode === "list" ? "info" : "outline-light"}
                  size="sm"
                  className="d-flex align-items-center gap-1"
                  onClick={() => setViewMode("list")}
                >
                  <FaList size={12} />
                  {isHindi ? "सूची" : "List"}
                </Button>
              </div>
            </Col>
          </Row>

          {/* Stats bar */}
          {!listLoading && (
            <Row className="mt-4 g-3">
              <Col xs="auto">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "rgba(79,195,247,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <FaImages color="#4fc3f7" size={16} />
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: 18, lineHeight: 1 }}>
                      {galleryList.length}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                      {isHindi ? "गैलरी" : "Galleries"}
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs="auto">
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: "rgba(79,195,247,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <FaCamera color="#4fc3f7" size={16} />
                  </div>
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: 18, lineHeight: 1 }}>
                      {galleryList.reduce((acc, g) => acc + (g.images?.length || 0), 0)}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 }}>
                      {isHindi ? "कुल फ़ोटो" : "Total Photos"}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      </div>

      {/* ── WAVE DIVIDER ── */}
      <div style={{ background: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)", lineHeight: 0 }}>
        <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
          <path fill="#f4f6f9" d="M0,32 C360,0 1080,60 1440,16 L1440,40 L0,40 Z" />
        </svg>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ background: "#f4f6f9", minHeight: "60vh", paddingBottom: 60 }}>
        <Container className="pt-4">

          {/* Loading */}
          {listLoading && (
            <div className="text-center py-5">
              <Spinner style={{ width: 52, height: 52, color: "#2c5364" }} />
              <p className="mt-3 text-muted">
                {isHindi ? "लोड हो रहा है…" : "Loading galleries…"}
              </p>
            </div>
          )}

          {/* Empty */}
          {!listLoading && galleryList.length === 0 && (
            <div className="text-center py-5">
              <FaImages size={56} className="text-muted mb-3" />
              <h5 className="text-muted fw-light">
                {isHindi ? "कोई गैलरी नहीं मिली" : "No galleries found"}
              </h5>
            </div>
          )}

          {/* ══ GRID VIEW ══ */}
          {!listLoading && viewMode === "grid" && (
            <Row className="g-4">
              {galleryList.map((item) => {
                const isActive = activeId === item._id;
                return (
                  <>
                    <Col key={item._id} xs={12} sm={6} xl={4}>
                      <Card
                        className="border-0 h-100 overflow-hidden"
                        style={{
                          borderRadius: 16,
                          boxShadow: isActive
                            ? "0 0 0 3px #4fc3f7, 0 16px 40px rgba(44,83,100,0.25)"
                            : "0 4px 20px rgba(0,0,0,0.08)",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          transform: isActive ? "translateY(-6px)" : "translateY(0)",
                        }}
                        onClick={() => toggleDetail(item._id)}
                      >
                        {/* Collage area */}
                        <div className="position-relative overflow-hidden">
                          <Collage images={item.images} />

                          {/* Gradient overlay */}
                          <div
                            style={{
                              position: "absolute", inset: 0,
                              background: "linear-gradient(to top, rgba(15,32,39,0.75) 0%, transparent 55%)",
                            }}
                          />

                          {/* Bottom-left: title over image */}
                          <div
                            style={{
                              position: "absolute", bottom: 0, left: 0, right: 0,
                              padding: "12px 16px",
                            }}
                          >
                            <div className="text-white fw-semibold" style={{ fontSize: 15, lineHeight: 1.3 }}>
                              {isHindi ? item.titleHin : item.titleEng}
                            </div>
                            <div
                              className="d-flex align-items-center gap-1 mt-1"
                              style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}
                            >
                              <FaCalendarAlt size={9} />
                              {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </div>
                          </div>

                          {/* Top-right badge */}
                          <Badge
                            className="position-absolute d-flex align-items-center gap-1"
                            style={{
                              top: 12, right: 12,
                              background: "rgba(0,0,0,0.55)",
                              backdropFilter: "blur(8px)",
                              fontSize: 11, padding: "5px 10px", borderRadius: 20,
                              color: "#fff", border: "none",
                            }}
                          >
                            <FaImages size={9} />
                            {item.images?.length || 0}
                          </Badge>

                          {/* Active indicator */}
                          {isActive && (
                            <div
                              style={{
                                position: "absolute", inset: 0,
                                background: "rgba(79,195,247,0.12)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <Badge
                                style={{
                                  background: "#4fc3f7", color: "#0f2027",
                                  fontWeight: 700, fontSize: 12, padding: "6px 16px", borderRadius: 20,
                                }}
                              >
                                ▼ {isHindi ? "खुला है" : "Viewing"}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Card footer */}
                        <CardBody
                          className="d-flex align-items-center justify-content-between py-3 px-3"
                          style={{ background: isActive ? "#e8f7fd" : "#fff" }}
                        >
                          <div className="d-flex gap-2">
                            <Badge
                              style={{
                                background: "#e8f4fd", color: "#2c5364",
                                fontSize: 10, padding: "4px 10px", borderRadius: 20, fontWeight: 500,
                              }}
                            >
                              {item.images?.length || 0} {isHindi ? "फ़ोटो" : "photos"}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            style={{
                              background: isActive ? "#4fc3f7" : "#2c5364",
                              border: "none", color: "#fff", borderRadius: 20,
                              fontSize: 11, fontWeight: 600, padding: "5px 14px",
                            }}
                          >
                            {isActive
                              ? (isHindi ? "बंद करें ↑" : "Close ↑")
                              : (isHindi ? "देखें ↓" : "View ↓")}
                          </Button>
                        </CardBody>
                      </Card>
                    </Col>

                    {/* ── INLINE DETAIL (full-width row) ── */}
                    {isActive && (
                      <Col key={`det-${item._id}`} xs={12}>
                        <Card
                          className="border-0"
                          style={{
                            borderRadius: 16,
                            background: "linear-gradient(135deg, #0f2027 0%, #203a43 60%, #2c5364 100%)",
                            boxShadow: "0 8px 40px rgba(44,83,100,0.3)",
                          }}
                        >
                          <CardBody className="p-4">

                            {/* Detail header */}
                            <Row className="align-items-start mb-4">
                              <Col>
                                <Badge
                                  style={{
                                    background: "rgba(79,195,247,0.15)",
                                    color: "#4fc3f7", fontSize: 10,
                                    padding: "4px 12px", borderRadius: 20,
                                    letterSpacing: 2, textTransform: "uppercase",
                                  }}
                                  className="mb-2 d-inline-block"
                                >
                                  <FaImages size={9} className="me-1" />
                                  {isHindi ? "गैलरी विवरण" : "Gallery Detail"}
                                </Badge>
                                <h4
                                  className="text-white mb-1 fw-bold"
                                  style={{ fontSize: "clamp(18px, 3vw, 28px)" }}
                                >
                                  {detailLoading
                                    ? (isHindi ? item.titleHin : item.titleEng)
                                    : (isHindi ? galleryDetail?.titleHin : galleryDetail?.titleEng)}
                                </h4>
                                {!detailLoading && galleryDetail && (
                                  <div className="d-flex align-items-center gap-3 flex-wrap">
                                    <small
                                      className="d-flex align-items-center gap-1"
                                      style={{ color: "rgba(255,255,255,0.5)" }}
                                    >
                                      <FaCalendarAlt size={10} />
                                      {new Date(galleryDetail.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric", month: "long", year: "numeric",
                                      })}
                                    </small>
                                    <Badge
                                      style={{
                                        background: "#4fc3f7", color: "#0f2027",
                                        fontWeight: 700, fontSize: 10,
                                        padding: "4px 12px", borderRadius: 20,
                                      }}
                                    >
                                      <FaCamera size={9} className="me-1" />
                                      {galleryDetail.images?.length}{" "}
                                      {isHindi ? "फ़ोटो" : "Photos"}
                                    </Badge>
                                  </div>
                                )}
                              </Col>
                              <Col xs="auto">
                                <Button
                                  style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "#fff", borderRadius: "50%",
                                    width: 38, height: 38,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    padding: 0,
                                  }}
                                  onClick={() => { setActiveId(null); setGalleryDetail(null); }}
                                >
                                  <FaTimes size={13} />
                                </Button>
                              </Col>
                            </Row>

                            {/* Description */}
                            {!detailLoading && galleryDetail &&
                              (isHindi ? galleryDetail.shortDescHin : galleryDetail.shortDescEng) && (
                                <p
                                  className="mb-4"
                                  style={{
                                    color: "rgba(255,255,255,0.6)",
                                    fontSize: 14, lineHeight: 1.8,
                                    borderLeft: "3px solid #4fc3f7",
                                    paddingLeft: 16,
                                  }}
                                >
                                  {isHindi ? galleryDetail.shortDescHin : galleryDetail.shortDescEng}
                                </p>
                              )}

                            {/* Loading */}
                            {detailLoading && (
                              <div className="text-center py-5">
                                <Spinner style={{ color: "#4fc3f7", width: 40, height: 40 }} />
                                <p className="mt-3 mb-0" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                                  {isHindi ? "चित्र लोड हो रहे हैं…" : "Loading images…"}
                                </p>
                              </div>
                            )}

                            {/* ── ALL IMAGES ── */}
                            {!detailLoading && galleryDetail && (
                              <Row className="g-2">
                                {galleryDetail.images.map((img, index) => (
                                  <Col key={index} xs={6} sm={4} md={3} lg={2}>
                                    <div
                                      className="position-relative overflow-hidden"
                                      style={{
                                        paddingBottom: "100%",
                                        borderRadius: 10,
                                        cursor: "zoom-in",
                                        background: "#1a3a4a",
                                      }}
                                      onClick={() => openLightbox(index)}
                                    >
                                      <img
                                        src={imgUrl(img)}
                                        alt={`Photo ${index + 1}`}
                                        loading="lazy"
                                        style={{
                                          position: "absolute", inset: 0,
                                          width: "100%", height: "100%",
                                          objectFit: "cover",
                                          transition: "transform 0.35s",
                                        }}
                                        onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.transform = "scale(1.1)";
                                          e.currentTarget.nextSibling.style.opacity = "1";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.transform = "scale(1)";
                                          e.currentTarget.nextSibling.style.opacity = "0";
                                        }}
                                      />
                                      {/* hover overlay */}
                                      <div
                                        style={{
                                          position: "absolute", inset: 0, borderRadius: 10,
                                          background: "linear-gradient(to top, rgba(15,32,39,0.8) 0%, transparent 50%)",
                                          opacity: 0, transition: "opacity 0.3s",
                                          display: "flex", alignItems: "flex-end",
                                          justifyContent: "space-between",
                                          padding: "8px 10px",
                                          pointerEvents: "none",
                                        }}
                                      >
                                        <span style={{ color: "#4fc3f7", fontSize: 10, fontWeight: 700 }}>
                                          {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <FaExpand size={11} color="#fff" />
                                      </div>
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            )}

                            {/* External link */}
                            {!detailLoading && galleryDetail?.link && galleryDetail?.isExternal && (
                              <div className="mt-4">
                                <Button
                                  style={{
                                    background: "linear-gradient(90deg, #4fc3f7, #0288d1)",
                                    border: "none", color: "#fff",
                                    fontWeight: 600, fontSize: 12,
                                    letterSpacing: 1.5, textTransform: "uppercase",
                                    borderRadius: 20, padding: "10px 24px",
                                    display: "inline-flex", alignItems: "center", gap: 8,
                                  }}
                                  onClick={() => handleLink(galleryDetail)}
                                >
                                  <FaExternalLinkAlt size={11} />
                                  {isHindi ? "लिंक पर जाएं" : "Visit Link"}
                                </Button>
                              </div>
                            )}

                          </CardBody>
                        </Card>
                      </Col>
                    )}
                  </>
                );
              })}
            </Row>
          )}

          {/* ══ LIST VIEW ══ */}
          {!listLoading && viewMode === "list" && (
            <Row className="g-3">
              {galleryList.map((item) => {
                const isActive = activeId === item._id;
                const firstImg = item.images?.[0];
                return (
                  <>
                    <Col key={item._id} xs={12}>
                      <Card
                        className="border-0 overflow-hidden"
                        style={{
                          borderRadius: 14,
                          boxShadow: isActive
                            ? "0 0 0 3px #4fc3f7, 0 8px 30px rgba(44,83,100,0.2)"
                            : "0 2px 12px rgba(0,0,0,0.07)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => toggleDetail(item._id)}
                      >
                        <Row className="g-0">
                          {/* Thumbnail */}
                          <Col xs={4} sm={3} md={2}>
                            <div
                              style={{
                                height: "100%", minHeight: 100,
                                overflow: "hidden", position: "relative",
                              }}
                            >
                              {firstImg ? (
                                <img
                                  src={imgUrl(firstImg)}
                                  alt="thumb"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                                />
                              ) : (
                                <div
                                  className="d-flex align-items-center justify-content-center bg-secondary h-100"
                                >
                                  <FaImages color="#fff" size={24} />
                                </div>
                              )}
                            </div>
                          </Col>

                          {/* Info */}
                          <Col>
                            <CardBody
                              className="d-flex align-items-center justify-content-between h-100 py-3 px-3"
                              style={{ background: isActive ? "#e8f7fd" : "#fff" }}
                            >
                              <div>
                                <div className="fw-semibold mb-1" style={{ fontSize: 15, color: "#0f2027" }}>
                                  {isHindi ? item.titleHin : item.titleEng}
                                </div>
                                <div
                                  className="d-flex align-items-center gap-3 flex-wrap"
                                  style={{ fontSize: 12, color: "#6c757d" }}
                                >
                                  <span className="d-flex align-items-center gap-1">
                                    <FaCalendarAlt size={10} />
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric",
                                    })}
                                  </span>
                                  <Badge
                                    style={{
                                      background: "#e8f4fd", color: "#2c5364",
                                      fontSize: 10, padding: "3px 10px", borderRadius: 20,
                                    }}
                                  >
                                    <FaImages size={9} className="me-1" />
                                    {item.images?.length || 0}{" "}
                                    {isHindi ? "फ़ोटो" : "photos"}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                style={{
                                  background: isActive ? "#4fc3f7" : "#2c5364",
                                  border: "none", color: "#fff",
                                  borderRadius: 20, fontSize: 11, fontWeight: 600,
                                  padding: "6px 16px", flexShrink: 0, marginLeft: 12,
                                }}
                              >
                                {isActive
                                  ? (isHindi ? "बंद ↑" : "Close ↑")
                                  : (isHindi ? "देखें ↓" : "View ↓")}
                              </Button>
                            </CardBody>
                          </Col>
                        </Row>
                      </Card>
                    </Col>

                    {/* Inline detail in list view */}
                    {isActive && (
                      <Col key={`ldet-${item._id}`} xs={12}>
                        <Card
                          className="border-0"
                          style={{
                            borderRadius: 14,
                            background: "linear-gradient(135deg, #0f2027 0%, #2c5364 100%)",
                          }}
                        >
                          <CardBody className="p-4">
                            <Row className="align-items-start mb-3">
                              <Col>
                                <h5 className="text-white fw-bold mb-1">
                                  {detailLoading
                                    ? (isHindi ? item.titleHin : item.titleEng)
                                    : (isHindi ? galleryDetail?.titleHin : galleryDetail?.titleEng)}
                                </h5>
                                {!detailLoading && galleryDetail && (
                                  <Badge
                                    style={{
                                      background: "#4fc3f7", color: "#0f2027",
                                      fontWeight: 700, fontSize: 10,
                                    }}
                                  >
                                    {galleryDetail.images?.length} {isHindi ? "फ़ोटो" : "Photos"}
                                  </Badge>
                                )}
                              </Col>
                              <Col xs="auto">
                                <Button
                                  style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.2)",
                                    color: "#fff", borderRadius: "50%",
                                    width: 36, height: 36, padding: 0,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                  }}
                                  onClick={() => { setActiveId(null); setGalleryDetail(null); }}
                                >
                                  <FaTimes size={12} />
                                </Button>
                              </Col>
                            </Row>

                            {detailLoading && (
                              <div className="text-center py-4">
                                <Spinner style={{ color: "#4fc3f7" }} />
                              </div>
                            )}

                            {!detailLoading && galleryDetail && (
                              <Row className="g-2">
                                {galleryDetail.images.map((img, index) => (
                                  <Col key={index} xs={4} sm={3} md={2} lg={1}>
                                    <div
                                      style={{
                                        paddingBottom: "100%", position: "relative",
                                        borderRadius: 8, overflow: "hidden", cursor: "zoom-in",
                                      }}
                                      onClick={() => openLightbox(index)}
                                    >
                                      <img
                                        src={imgUrl(img)}
                                        alt={`Photo ${index + 1}`}
                                        loading="lazy"
                                        style={{
                                          position: "absolute", inset: 0,
                                          width: "100%", height: "100%", objectFit: "cover",
                                          transition: "transform 0.3s",
                                        }}
                                        onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                                      />
                                    </div>
                                  </Col>
                                ))}
                              </Row>
                            )}
                          </CardBody>
                        </Card>
                      </Col>
                    )}
                  </>
                );
              })}
            </Row>
          )}

        </Container>
      </div>

      {/* ══ LIGHTBOX MODAL ══ */}
      {galleryDetail && (
        <Modal
          isOpen={lightboxOpen}
          toggle={closeLightbox}
          size="xl"
          centered
          contentClassName="border-0"
          style={{ background: "transparent" }}
        >
          <ModalHeader
            className="border-0 pb-0"
            style={{ background: "#0f2027" }}
            close={
              <Button
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff", borderRadius: "50%",
                  width: 36, height: 36, padding: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={closeLightbox}
              >
                <FaTimes size={12} />
              </Button>
            }
          >
            <span className="text-white fw-semibold" style={{ fontSize: 15 }}>
              {isHindi ? galleryDetail.titleHin : galleryDetail.titleEng}
            </span>
          </ModalHeader>

          <ModalBody className="p-3 text-center position-relative" style={{ background: "#0f2027" }}>
            {/* Main image */}
            <img
              key={lightboxIndex}
              src={imgUrl(galleryDetail.images[lightboxIndex])}
              alt={`Photo ${lightboxIndex + 1}`}
              onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
              style={{
                maxHeight: "65vh", maxWidth: "100%",
                objectFit: "contain", borderRadius: 8,
              }}
            />

            {/* Prev */}
            <Button
              style={{
                position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)",
                background: "rgba(79,195,247,0.2)", border: "1px solid rgba(79,195,247,0.4)",
                color: "#4fc3f7", borderRadius: "50%",
                width: 44, height: 44, padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onClick={lbPrev}
            >
              <FaChevronLeft />
            </Button>

            {/* Next */}
            <Button
              style={{
                position: "absolute", top: "50%", right: 12, transform: "translateY(-50%)",
                background: "rgba(79,195,247,0.2)", border: "1px solid rgba(79,195,247,0.4)",
                color: "#4fc3f7", borderRadius: "50%",
                width: 44, height: 44, padding: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onClick={lbNext}
            >
              <FaChevronRight />
            </Button>

            {/* Thumbnails */}
            <div
              className="d-flex gap-2 mt-3 justify-content-center"
              style={{ flexWrap: "wrap", maxHeight: 80, overflow: "auto" }}
            >
              {galleryDetail.images.map((img, i) => (
                <img
                  key={i}
                  src={imgUrl(img)}
                  alt={`t${i}`}
                  onClick={() => setLightboxIndex(i)}
                  onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                  style={{
                    width: 52, height: 52, objectFit: "cover",
                    borderRadius: 6, cursor: "pointer", flexShrink: 0,
                    border: i === lightboxIndex ? "2px solid #4fc3f7" : "2px solid transparent",
                    opacity: i === lightboxIndex ? 1 : 0.45,
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </ModalBody>

          <ModalFooter className="border-0 justify-content-center py-2" style={{ background: "#0f2027" }}>
            <Badge
              style={{
                background: "rgba(79,195,247,0.15)", color: "#4fc3f7",
                fontSize: 12, padding: "6px 16px", borderRadius: 20, letterSpacing: 1,
              }}
            >
              {lightboxIndex + 1} / {galleryDetail.images.length}
            </Badge>
          </ModalFooter>
        </Modal>
      )}

    </PageLayout>
  );
};

export default Gallery;