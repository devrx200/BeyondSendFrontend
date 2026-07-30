import { useEffect, useState } from "react";
import {
  Row, Col, Card, CardBody,
  Button, Badge, Modal, ModalHeader, ModalBody,
  Spinner,
} from "reactstrap";
import {
  FaFilePdf, FaPlayCircle, FaDownload,
  FaEye, FaExternalLinkAlt, FaChevronLeft,
  FaChevronRight, FaFolderOpen, FaVideoSlash,
  FaYoutube,
} from "react-icons/fa";
import axios from "axios";
import PageLayout from "../../components/PageLayout";
import { useLanguage } from "../../contexts/LanguageContext";

const API          = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

/* ─── scoped CSS — no duplicate with App.css ─── */
const CSS = `
  .hs-section-head {
    background: linear-gradient(135deg, #1e3a8a 0%, #3b5bdb 100%);
    border-radius: 12px 12px 0 0;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .hs-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(30,58,138,.10);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .hs-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    scrollbar-width: thin;
    scrollbar-color: #c7d2fe #f8faff;
    max-height: 560px;
  }
  @media (max-width: 767px) { .hs-body { max-height: 380px; } }

  /* Item card */
  .hs-item {
    border: 1px solid #e8edff;
    border-radius: 10px;
    background: #fff;
    margin-bottom: 10px;
    transition: box-shadow .18s, border-color .18s;
    overflow: hidden;
  }
  .hs-item:hover {
    box-shadow: 0 4px 18px rgba(30,58,138,.12);
    border-color: #a5b4fc;
  }
  .hs-item-left {
    padding: 12px 14px;
    flex: 1;
    min-width: 0;
  }
  .hs-item-right {
    background: linear-gradient(160deg, #eef2ff 0%, #f0f9ff 100%);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
    flex-shrink: 0;
    min-width: 130px;
    border-left: 1px solid #e8edff;
  }
  @media (max-width: 575px) {
    .hs-item-right {
      flex-direction: row;
      flex-wrap: wrap;
      border-left: none;
      border-top: 1px solid #e8edff;
      min-width: 0;
    }
  }

  /* Video thumbnail */
  .hs-yt-thumb {
    width: 72px; height: 48px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
    border: 2px solid #e8edff;
  }
  .hs-yt-placeholder {
    width: 72px; height: 48px;
    border-radius: 6px;
    background: linear-gradient(135deg, #1e3a8a, #3b5bdb);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  /* Pagination */
  .hs-page-btn {
    min-width: 32px; height: 32px;
    border: 1.5px solid #c7d2fe;
    border-radius: 6px;
    background: #fff; color: #1e3a8a;
    font-size: .82rem; font-weight: 700;
    cursor: pointer; transition: all .15s;
    display: inline-flex; align-items: center; justify-content: center;
    padding: 0 6px;
  }
  .hs-page-btn:hover, .hs-page-btn.active {
    background: #1e3a8a; color: #fff; border-color: #1e3a8a;
  }
  .hs-page-btn:disabled { opacity: .4; cursor: default; }
`;

/* ── helpers ── */
const formatDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return "—"; }
};

const getYoutubeId = (url) => {
  if (!url) return "";
  try {
    const p = new URL(url);
    if (p.hostname.includes("youtube.com")) return p.searchParams.get("v") || "";
    if (p.hostname.includes("youtu.be"))   return p.pathname.slice(1);
  } catch { /* */ }
  return "";
};

const getEmbedUrl  = (url) => { const id = getYoutubeId(url); return id ? `https://www.youtube.com/embed/${id}` : ""; };
const getThumbUrl  = (url) => { const id = getYoutubeId(url); return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ""; };

/* ── Pagination ── */
const Pager = ({ page, setPage, total }) => {
  const pages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  if (pages <= 1) return null;
  return (
    <div className="d-flex flex-wrap justify-content-center gap-1 mt-3 pt-2 border-top">
      <button className="hs-page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)} aria-label="Previous">
        <FaChevronLeft size={11} />
      </button>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          className={`hs-page-btn${page === i + 1 ? " active" : ""}`}
          onClick={() => setPage(i + 1)}
          aria-label={`Page ${i + 1}`}
          aria-current={page === i + 1 ? "page" : undefined}
        >
          {i + 1}
        </button>
      ))}
      <button className="hs-page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)} aria-label="Next">
        <FaChevronRight size={11} />
      </button>
    </div>
  );
};

/* ── PDF Item ── */
const PdfItem = ({ item, onPreview, isHindi }) => (
  <div className="hs-item d-flex flex-wrap">
    <div className="hs-item-left">
      <div className="d-flex align-items-start gap-2 mb-1">
        <FaFilePdf size={18} className="text-danger flex-shrink-0 mt-1" aria-hidden="true" />
        <p className="fw-semibold mb-0 text-dark" style={{ fontSize: ".88rem", lineHeight: 1.4 }}>
          {item.title}
        </p>
      </div>
      {item.description && (
        <p className="text-muted mb-1" style={{ fontSize: ".78rem", paddingLeft: 26 }}>
          {item.description}
        </p>
      )}
      <div className="d-flex flex-wrap gap-2 ps-1">
        <Badge color="light" className="border text-secondary" style={{ fontSize: ".7rem" }}>
          {isHindi ? "बनाया:" : "Created:"} {formatDate(item.createdAt)}
        </Badge>
      </div>
    </div>
    <div className="hs-item-right">
      <Button size="sm" color="primary" className="w-100" onClick={() => onPreview(API + item.pdfUrl, item.title)}
        style={{ borderRadius: 6, fontSize: ".78rem" }}>
        <FaEye className="me-1" aria-hidden="true" />
        {isHindi ? "देखें" : "Preview"}
      </Button>
      <a href={API + item.pdfUrl} target="_blank" rel="noreferrer" className="w-100">
        <Button size="sm" color="danger" className="w-100" style={{ borderRadius: 6, fontSize: ".78rem" }}>
          <FaDownload className="me-1" aria-hidden="true" />
          {isHindi ? "डाउनलोड" : "Download"}
        </Button>
      </a>
    </div>
  </div>
);

/* ── Video Item ── */
const VideoItem = ({ item, onPreview, isHindi }) => {
  const embedUrl = getEmbedUrl(item.videoUrl);
  const thumbUrl = getThumbUrl(item.videoUrl);
  return (
    <div className="hs-item d-flex flex-wrap">
      <div className="hs-item-left">
        <div className="d-flex align-items-start gap-2 mb-1">
          {/* YouTube thumbnail */}
          {thumbUrl ? (
            <img src={thumbUrl} alt={item.title}
              className="hs-yt-thumb" loading="lazy"
              onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div className="hs-yt-placeholder" aria-hidden="true">
              <FaYoutube size={22} color="#fff" />
            </div>
          )}
          <div className="min-w-0">
            <p className="fw-semibold mb-0 text-dark" style={{ fontSize: ".88rem", lineHeight: 1.4 }}>
              {item.title}
            </p>
            {item.description && (
              <p className="text-muted mb-0" style={{ fontSize: ".76rem" }}>
                {item.description}
              </p>
            )}
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2 mt-1">
          <Badge color="light" className="border text-secondary" style={{ fontSize: ".7rem" }}>
            {isHindi ? "बनाया:" : "Created:"} {formatDate(item.createdAt)}
          </Badge>
        </div>
      </div>
      <div className="hs-item-right">
        <Button size="sm" color="danger" className="w-100"
          onClick={() => embedUrl ? onPreview(embedUrl, item.title) : window.open(item.videoUrl, "_blank")}
          style={{ borderRadius: 6, fontSize: ".78rem", background: "#ff0000", border: "none" }}>
          <FaPlayCircle className="me-1" aria-hidden="true" />
          {isHindi ? "देखें" : "Play"}
        </Button>
        <a href={item.videoUrl} target="_blank" rel="noreferrer" className="w-100">
          <Button size="sm" outline color="danger" className="w-100" style={{ borderRadius: 6, fontSize: ".78rem" }}>
            <FaExternalLinkAlt className="me-1" aria-hidden="true" />
            YouTube
          </Button>
        </a>
      </div>
    </div>
  );
};

/* ── Section ── */
const Section = ({ type, arr, page, setPage, onPreview, isHindi }) => {
  const isPdf  = type === "pdf";
  const items  = arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const accent = isPdf ? "#1e3a8a" : "#ff0000";

  return (
    <div className="hs-card">
      {/* Header */}
      <div className="hs-section-head">
        <div className="d-flex align-items-center gap-2">
          {isPdf
            ? <FaFilePdf size={18} color="#fff" aria-hidden="true" />
            : <FaYoutube size={20} color="#fff" aria-hidden="true" />}
          <span className="fw-bold text-white" style={{ fontSize: "1rem" }}>
            {isPdf
              ? (isHindi ? "PDF दस्तावेज़" : "PDF Documents")
              : (isHindi ? "वीडियो ट्यूटोरियल" : "Video Tutorials")}
          </span>
        </div>
        <Badge
          pill
          style={{ background: "rgba(255,255,255,.2)", color: "#fff", fontWeight: 700, fontSize: ".82rem", padding: "4px 12px" }}
        >
          {arr.length}
        </Badge>
      </div>

      {/* Body */}
      <div className="hs-body">
        {items.length === 0 ? (
          <div className="text-center text-muted py-5 d-flex flex-column align-items-center gap-3">
            {isPdf
              ? <FaFolderOpen size={38} className="text-primary opacity-50" aria-hidden="true" />
              : <FaVideoSlash  size={38} className="text-danger opacity-50" aria-hidden="true" />}
            <span className="small fw-semibold">
              {isHindi ? "कोई सामग्री उपलब्ध नहीं है" : "No items available"}
            </span>
          </div>
        ) : items.map(item =>
          isPdf
            ? <PdfItem   key={item._id} item={item} onPreview={onPreview} isHindi={isHindi} />
            : <VideoItem key={item._id} item={item} onPreview={onPreview} isHindi={isHindi} />
        )}
        <Pager page={page} setPage={setPage} total={arr.length} />
      </div>
    </div>
  );
};

/* ══ Main Component ══ */
const HelpSupport = () => {
  const { isHindi }                       = useLanguage();
  const [data,         setData]           = useState([]);
  const [loading,      setLoading]        = useState(true);
  const [pdfPage,      setPdfPage]        = useState(1);
  const [videoPage,    setVideoPage]      = useState(1);
  const [modal,        setModal]          = useState(false);
  const [previewUrl,   setPreviewUrl]     = useState("");
  const [previewTitle, setPreviewTitle]   = useState("");

  useEffect(() => {
    axios.get(`${API}/api/get-active-help-guidance`)
      .then(r => setData(r?.data?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pdfData   = data.filter(i => i.contentType?.toLowerCase() === "pdf");
  const videoData = data.filter(i => i.contentType?.toLowerCase() === "video");

  const openPreview = (url, title = "") => {
    setPreviewUrl(url);
    setPreviewTitle(title);
    setModal(true);
  };

  if (loading) {
    return (
      <PageLayout title="Help & Support" titleHi="सहायता एवं मार्गदर्शन" showBreadcrumb>
        <div className="text-center py-5">
          <Spinner color="primary" style={{ width: 44, height: 44 }} />
          <p className="mt-3 text-muted small fw-semibold">
            {isHindi ? "लोड हो रहा है..." : "Loading..."}
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <PageLayout title="Help & Support" titleHi="सहायता एवं मार्गदर्शन" showBreadcrumb>
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Section
              type="pdf"   arr={pdfData}
              page={pdfPage}   setPage={setPdfPage}
              onPreview={openPreview} isHindi={isHindi}
            />
          </Col>
          <Col xs={12} lg={6}>
            <Section
              type="video" arr={videoData}
              page={videoPage} setPage={setVideoPage}
              onPreview={openPreview} isHindi={isHindi}
            />
          </Col>
        </Row>

        {/* Preview Modal */}
        <Modal isOpen={modal} toggle={() => setModal(false)} size="xl" centered>
          <ModalHeader toggle={() => setModal(false)} className="border-0 pb-0">
            <span className="fw-bold text-dark" style={{ fontSize: ".95rem" }}>{previewTitle}</span>
          </ModalHeader>
          <ModalBody className="p-0" style={{ height: "72vh" }}>
            <iframe
              src={previewUrl}
              width="100%" height="100%"
              title={previewTitle}
              style={{ border: "none", display: "block" }}
              allowFullScreen
            />
          </ModalBody>
        </Modal>
      </PageLayout>
    </>
  );
};

export default HelpSupport;
