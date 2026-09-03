import { useEffect, useState } from "react";
import {
  Row, Col, Card, CardBody, CardHeader,
  Button, Badge, Modal, ModalHeader, ModalBody,
  Spinner, Collapse, Container,
} from "reactstrap";
import {
  FaFilePdf, FaPlayCircle, FaDownload,
  FaEye, FaExternalLinkAlt,
  FaChevronLeft, FaChevronRight,
  FaFolderOpen, FaVideoSlash,
  FaChevronDown, FaChevronUp
} from "react-icons/fa";
import axios from "axios";
import { useLanguage } from "../../contexts/LanguageContext";
import { jwtDecode } from "jwt-decode";

const API = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

const formatDate = (date) => {
  if (!date) return "—";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch { return "—"; }
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `${API}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
    }
    const parsed = new URL(trimmed);
    let id = "";
    if (parsed.searchParams.has("v")) {
      id = parsed.searchParams.get("v");
    } else if (parsed.pathname.includes("/shorts/")) {
      id = parsed.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0];
    } else if (parsed.pathname.includes("/embed/")) {
      id = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0];
    } else if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.slice(1).split("?")[0];
    }
    if (id) {
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (parsed.hostname.includes("drive.google.com")) {
      return trimmed.replace(/\/view(\?.*)?$/, "/preview").replace(/\/edit(\?.*)?$/, "/preview");
    }
    return trimmed;
  } catch { return url; }
};

const getYoutubeThumbnail = (url) => {
  if (!url) return "";
  try {
    const trimmed = url.trim();
    const parsed = new URL(trimmed);
    let id = "";
    if (parsed.searchParams.has("v")) {
      id = parsed.searchParams.get("v");
    } else if (parsed.pathname.includes("/shorts/")) {
      id = parsed.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0];
    } else if (parsed.pathname.includes("/embed/")) {
      id = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0];
    } else if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.slice(1).split("?")[0];
    }
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
  } catch { return ""; }
};

const isVideoFile = (url) => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".ogg") || clean.endsWith(".mov");
};

const isPdfFile = (url) => {
  if (!url) return false;
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".pdf") || url.toLowerCase().includes("/pdf");
};

const HelpTutorials = () => {
  const { isHindi } = useLanguage();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role] = useState(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return "";
    try {
      const decoded = jwtDecode(token);
      return decoded?.role || "";
    } catch {
      return "";
    }
  });

  const [pdfPage, setPdfPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadHelp = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/get-active-guidance-by-role`, {
          params: { role }
        });
        if (isMounted) setData(res?.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHelp();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const pdfData = data.filter(i => i.contentType?.toLowerCase() === "pdf");
  const videoData = data.filter(i => i.contentType?.toLowerCase() === "video");

  const paginate = (arr, page) =>
    arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalPages = (arr) => Math.max(1, Math.ceil(arr.length / ITEMS_PER_PAGE));

  const openPreview = (url, title = "") => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setPreviewModal(true);
  };

  const toggleExpand = (id) =>
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));

  const t = (en, hi) => (isHindi ? (hi || en) : en);

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="text-muted mt-3 small">
          {t("Loading resources...", "सामग्री लोड हो रही है...")}
        </p>
      </div>
    );
  }

  const renderPagination = (page, setPage, arr) => {
    const pages = totalPages(arr);
    if (pages <= 1) return null;
    return (
      <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
        <Button size="sm" color="light" className="border rounded-3 px-2"
          disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          <FaChevronLeft size={10} />
        </Button>
        {Array.from({ length: pages }, (_, i) => (
          <Button key={i} size="sm"
            color={page === i + 1 ? "primary" : "light"}
            className="rounded-3 border fw-semibold"
            style={{ minWidth: 32 }}
            onClick={() => setPage(i + 1)}>
            {i + 1}
          </Button>
        ))}
        <Button size="sm" color="light" className="border rounded-3 px-2"
          disabled={page === pages} onClick={() => setPage(p => p + 1)}>
          <FaChevronRight size={10} />
        </Button>
      </div>
    );
  };

  const renderPdfCard = (item) => {
    const isOpen = !!expandedIds[item._id];
    const hasLongDesc = item.description && item.description.length > 80;

    return (
      <Card key={item._id} className="border-0 shadow-sm rounded-3 mb-2 overflow-hidden">
        <div className="bg-danger" style={{ height: 3 }} />
        <CardBody className="p-3">
          <div className="d-flex gap-3 align-items-start">
            <div
              className="bg-danger bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44 }}>
              <FaFilePdf className="text-danger" size={20} />
            </div>

            <div className="flex-grow-1 min-w-0">
              <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "0.88rem" }}>
                {item.title}
              </h6>

              {item.description && (
                <>
                  {!isOpen && (
                    <p
                      className="text-muted mb-1"
                      style={{
                        fontSize: "0.78rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word"
                      }}>
                      {item.description}
                    </p>
                  )}

                  <Collapse isOpen={isOpen}>
                    <p
                      className="text-muted mb-1"
                      style={{
                        fontSize: "0.78rem",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap"
                      }}>
                      {item.description}
                    </p>
                  </Collapse>

                  {hasLongDesc && (
                    <button
                      onClick={() => toggleExpand(item._id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        color: "#dc3545",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        marginBottom: 4
                      }}>
                      {isOpen
                        ? <><FaChevronUp size={9} /> {t("Show less", "कम दिखाएं")}</>
                        : <><FaChevronDown size={9} /> {t("Show more", "अधिक दिखाएं")}</>}
                    </button>
                  )}
                </>
              )}

              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                📅 {formatDate(item.createdAt)}
              </small>
            </div>

            <div className="d-flex flex-column gap-1 flex-shrink-0">
              <Button
                size="sm"
                color="primary"
                className="rounded-3 px-2"
                title={t("Preview", "देखें")}
                onClick={() => openPreview(API + item.pdfUrl, item.title)}>
                <FaEye size={11} />
              </Button>
              <a href={API + item.pdfUrl} download target="_blank" rel="noreferrer">
                <Button
                  size="sm"
                  color="secondary"
                  className="rounded-3 px-2 w-100"
                  title={t("Download", "डाउनलोड")}>
                  <FaDownload size={11} />
                </Button>
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderVideoCard = (item) => {
    const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
    const thumb = getYoutubeThumbnail(item.videoUrl);
    const isOpen = !!expandedIds[item._id];
    const hasLongDesc = item.description && item.description.length > 80;

    return (
      <Card key={item._id} className="border-0 shadow-sm rounded-3 mb-2 overflow-hidden">
        <div className="bg-primary" style={{ height: 3 }} />
        <CardBody className="p-3">
          <div className="d-flex gap-3 align-items-start">
            <div
              className="flex-shrink-0 rounded-3 overflow-hidden"
              style={{ width: 64, height: 44, background: "#e9ecef" }}>
              {thumb ? (
                <img
                  src={thumb}
                  alt="thumb"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <FaPlayCircle className="text-primary" size={20} />
                </div>
              )}
            </div>

            <div className="flex-grow-1 min-w-0">
              <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "0.88rem" }}>
                {item.title}
              </h6>

              {item.description && (
                <>
                  {!isOpen && (
                    <p
                      className="text-muted mb-1"
                      style={{
                        fontSize: "0.78rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word"
                      }}>
                      {item.description}
                    </p>
                  )}

                  <Collapse isOpen={isOpen}>
                    <p
                      className="text-muted mb-1"
                      style={{
                        fontSize: "0.78rem",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap"
                      }}>
                      {item.description}
                    </p>
                  </Collapse>

                  {hasLongDesc && (
                    <button
                      onClick={() => toggleExpand(item._id)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        color: "#0d6efd",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        marginBottom: 4
                      }}>
                      {isOpen
                        ? <><FaChevronUp size={9} /> {t("Show less", "कम दिखाएं")}</>
                        : <><FaChevronDown size={9} /> {t("Show more", "अधिक दिखाएं")}</>}
                    </button>
                  )}
                </>
              )}

              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                📅 {t("Created", "बनाया")}: {formatDate(item.createdAt)}
                {item.updatedAt && item.updatedAt !== item.createdAt && (
                  <> &nbsp;|&nbsp; 🔄 {t("Updated", "अपडेट")}: {formatDate(item.updatedAt)}</>
                )}
              </small>
            </div>

            <div className="d-flex flex-column gap-1 flex-shrink-0">
              <Button
                size="sm"
                color="primary"
                className="rounded-3 px-2"
                title={t("Play", "चलाएं")}
                onClick={() =>
                  embedUrl
                    ? openPreview(embedUrl, item.title)
                    : window.open(item.videoUrl)
                }>
                <FaPlayCircle size={11} />
              </Button>
              <a href={item.videoUrl} target="_blank" rel="noreferrer">
                <Button
                  size="sm"
                  color="secondary"
                  className="rounded-3 px-2 w-100"
                  title={t("Open", "खोलें")}>
                  <FaExternalLinkAlt size={11} />
                </Button>
              </a>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderSection = (type, arr, page, setPage) => {
    const isPdf = type === "pdf";
    const items = paginate(arr, page);

    return (
      <Card className="adm-card h-100">
        <CardHeader className="adm-card-header">
          <div className="d-flex align-items-center gap-2 flex-grow-1">
            <div
              className={`rounded-3 d-flex align-items-center justify-content-center ${isPdf ? "bg-danger" : "bg-primary"}`}
              style={{ width: 32, height: 32 }}>
              {isPdf
                ? <FaFilePdf size={14} />
                : <FaPlayCircle size={14} />}
            </div>
            <span className="fw-bold text-white">
              {isPdf
                ? t("PDF Documents", "PDF दस्तावेज़")
                : t("Video Tutorials", "वीडियो ट्यूटोरियल")}
            </span>
          </div>
          <Badge color={isPdf ? "danger" : "primary"} pill className="px-2">
            {arr.length}
          </Badge>
        </CardHeader>

        <CardBody className="adm-card-body p-3" style={{ maxHeight: 520, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div className="text-center text-muted py-5">
              {isPdf
                ? <FaFolderOpen size={36} className="mb-2 text-secondary opacity-50" />
                : <FaVideoSlash size={36} className="mb-2 text-secondary opacity-50" />}
              <div className="small">
                {t("No items available", "कोई सामग्री उपलब्ध नहीं")}
              </div>
            </div>
          ) : (
            <>
              {items.map(item =>
                isPdf
                  ? renderPdfCard(item)
                  : renderVideoCard(item)
              )}
              {renderPagination(page, setPage, arr)}
            </>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <Container fluid="xl" className="py-4">
      <div className="min-vh-100">
        <div className="px-3 px-md-4">
          {/* ── PAGE HEADER ── */}
          <CardHeader className="adm-card-header p-3 border border-white d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 rounded">
            <div>
              <h3 className="adm-page-title mb-1">
                📘 {t("Help & Tutorials", "सहायता और ट्यूटोरियल")}
              </h3>
              <p className="adm-page-subtitle mb-0 text-white">
                {t("Browse PDF documents and video guides", "PDF दस्तावेज़ और वीडियो गाइड देखें")}
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Badge color="danger" pill className="px-3 py-2 d-flex align-items-center gap-1 shadow-sm">
                <FaFilePdf size={11} /> {pdfData.length} {t("PDFs", "PDF")}
              </Badge>
              <Badge color="primary" pill className="px-3 py-2 d-flex align-items-center gap-1 shadow-sm">
                <FaPlayCircle size={11} /> {videoData.length} {t("Videos", "वीडियो")}
              </Badge>
            </div>
          </CardHeader>

          {/* ── SECTIONS ── */}
          <Row className="g-4">
            <Col xs={12} lg={6}>
              {renderSection("pdf", pdfData, pdfPage, setPdfPage)}
            </Col>
            <Col xs={12} lg={6}>
              {renderSection("video", videoData, videoPage, setVideoPage)}
            </Col>
          </Row>
        </div>

        {/* ── PREVIEW MODAL ── */}
        <Modal
          isOpen={previewModal}
          toggle={() => setPreviewModal(false)}
          size="xl"
          centered>
          <ModalHeader
            toggle={() => setPreviewModal(false)}
            className="border-0 fw-bold bg-dark text-white">
            <span className="text-truncate" style={{ fontSize: "1rem" }}>👁️ {previewTitle}</span>
          </ModalHeader>
          <div className="bg-light border-bottom px-3 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <small className="text-muted text-truncate" style={{ maxWidth: "60%" }}>
              🔗 <span className="user-select-all">{previewUrl}</span>
            </small>
            <div className="d-flex gap-2">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5"
                style={{ fontSize: "0.78rem" }}
              >
                <FaExternalLinkAlt size={10} />
                <span>{t("Open in New Tab", "नए टैब में खोलें")}</span>
              </a>
              {isPdfFile(previewUrl) && (
                <a
                  href={previewUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: "0.78rem" }}
                >
                  <FaDownload size={10} />
                  <span>{t("Download", "डाउनलोड")}</span>
                </a>
              )}
            </div>
          </div>
          <ModalBody className="p-0 bg-dark" style={{ height: "72vh" }}>
            {isVideoFile(previewUrl) ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="w-100 h-100"
                style={{ objectFit: "contain", background: "#000" }}
              />
            ) : isPdfFile(previewUrl) ? (
              <object
                data={previewUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ display: "block" }}
              >
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                  title={previewTitle}
                />
              </object>
            ) : (
              <iframe
                src={previewUrl}
                width="100%"
                height="100%"
                style={{ border: "none", display: "block" }}
                title={previewTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </ModalBody>
        </Modal>
      </div>
    </Container>
  );
};

export default HelpTutorials;