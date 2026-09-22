import { useEffect, useState } from "react";
import {
  Row, Col, Badge, Modal, ModalHeader, ModalBody, Spinner,
} from "reactstrap";
import {
  FaFilePdf, FaPlayCircle, FaDownload,
  FaEye, FaExternalLinkAlt, FaChevronLeft,
  FaChevronRight, FaFolderOpen, FaVideoSlash,
  FaYoutube,
} from "react-icons/fa";
import axios from "axios";
import PageLayout from "../../components/PageLayout";
import PageLoader from "../../components/PageLoader";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;
const ITEMS_PER_PAGE = 6;

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
    if (p.hostname.includes("youtu.be")) return p.pathname.slice(1);
  } catch { /* */ }
  return "";
};

const getEmbedUrl = (url) => { const id = getYoutubeId(url); return id ? `https://www.youtube.com/embed/${id}` : ""; };
const getThumbUrl = (url) => { const id = getYoutubeId(url); return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : ""; };

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

const getPdfUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.startsWith('/') ? url : `/${url}`;
  return `${API}${clean}`;
};

/* ── PDF Item ── */
const PdfItem = ({ item, onPreview, isHindi }) => {
  const fullPdfUrl = getPdfUrl(item.pdfUrl);
  return (
    <div className="hs-item">
      <div className="hs-item-left">
        <div className="d-flex align-items-start gap-2 mb-1">
          <FaFilePdf size={18} className="text-danger flex-shrink-0 mt-1" aria-hidden="true" />
          <p className="fw-semibold mb-0" style={{ fontSize: ".88rem", lineHeight: 1.4, color: 'var(--pub-navy-900)' }}>
            {item.title}
          </p>
        </div>
        {item.description && (
          <p className="text-muted mb-1" style={{ fontSize: ".78rem", paddingLeft: 26 }}>
            {item.description}
          </p>
        )}
        <div className="d-flex flex-wrap gap-2 ps-1">
          <span style={{ fontSize: ".7rem", background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>
            {isHindi ? "बनाया:" : "Created:"} {formatDate(item.createdAt)}
          </span>
        </div>
      </div>
      <div className="hs-item-right">
        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
          style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff', border: 'none', borderRadius: 8, fontSize: ".78rem", fontWeight: 600, padding: '6px 10px' }}
          onClick={() => onPreview(fullPdfUrl, item.title)}
        >
          <FaEye size={12} aria-hidden="true" />
          {isHindi ? "देखें" : "Preview"}
        </button>
        <a href={fullPdfUrl} target="_blank" rel="noreferrer" className="w-100">
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
            style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: 'none', borderRadius: 8, fontSize: ".78rem", fontWeight: 600, padding: '6px 10px' }}
          >
            <FaDownload size={12} aria-hidden="true" />
            {isHindi ? "डाउनलोड" : "Download"}
          </button>
        </a>
      </div>
    </div>
  );
};

/* ── Video Item ── */
const VideoItem = ({ item, onPreview, isHindi }) => {
  const embedUrl = getEmbedUrl(item.videoUrl);
  const thumbUrl = getThumbUrl(item.videoUrl);
  return (
    <div className="hs-item">
      <div className="hs-item-left">
        <div className="d-flex align-items-start gap-2 mb-1">
          {thumbUrl ? (
            <img src={thumbUrl} alt={item.title} className="hs-yt-thumb" loading="lazy"
              onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div className="hs-yt-placeholder" aria-hidden="true">
              <FaYoutube size={22} color="#fff" />
            </div>
          )}
          <div className="min-w-0">
            <p className="fw-semibold mb-0" style={{ fontSize: ".88rem", lineHeight: 1.4, color: 'var(--pub-navy-900)' }}>
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
          <span style={{ fontSize: ".7rem", background: '#f1f5f9', color: '#475569', padding: '2px 10px', borderRadius: 999, fontWeight: 600 }}>
            {isHindi ? "बनाया:" : "Created:"} {formatDate(item.createdAt)}
          </span>
        </div>
      </div>
      <div className="hs-item-right">
        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
          style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', color: '#fff', border: 'none', borderRadius: 8, fontSize: ".78rem", fontWeight: 600, padding: '6px 10px' }}
          onClick={() => embedUrl ? onPreview(embedUrl, item.title) : window.open(item.videoUrl, "_blank")}
        >
          <FaPlayCircle size={12} aria-hidden="true" />
          {isHindi ? "देखें" : "Play"}
        </button>
        <a href={item.videoUrl} target="_blank" rel="noreferrer" className="w-100">
          <button
            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
            style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1.5px solid rgba(220,38,38,0.25)', borderRadius: 8, fontSize: ".78rem", fontWeight: 600, padding: '6px 10px' }}
          >
            <FaExternalLinkAlt size={11} aria-hidden="true" />
            YouTube
          </button>
        </a>
      </div>
    </div>
  );
};

/* ── Section ── */
const Section = ({ type, arr, page, setPage, onPreview, isHindi }) => {
  const isPdf = type === "pdf";
  const items = arr.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="hs-card">
      {/* Header */}
      <div className={isPdf ? "hs-section-header-pdf" : "hs-section-header-video"}>
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            {isPdf
              ? <FaFilePdf size={15} color="#fff" />
              : <FaPlayCircle size={15} color="#fff" />}
          </div>
          <span className="fw-bold text-white" style={{ fontSize: "1rem", letterSpacing: '-0.2px' }}>
            {isPdf
              ? (isHindi ? "PDF दस्तावेज़" : "PDF Documents")
              : (isHindi ? "वीडियो ट्यूटोरियल" : "Video Tutorials")}
          </span>
        </div>
        <span
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 999, padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700, position: 'relative', zIndex: 1, flexShrink: 0 }}
        >
          {arr.length}
        </span>
      </div>

      {/* Body */}
      <div className="hs-body">
        {items.length === 0 ? (
          <div className="text-center text-muted py-5 d-flex flex-column align-items-center gap-3">
            {isPdf
              ? <FaFolderOpen size={38} style={{ color: '#3b82f6', opacity: 0.4 }} aria-hidden="true" />
              : <FaVideoSlash size={38} style={{ color: '#dc2626', opacity: 0.4 }} aria-hidden="true" />}
            <span className="small fw-semibold">
              {isHindi ? "कोई सामग्री उपलब्ध नहीं है" : "No items available"}
            </span>
          </div>
        ) : items.map(item =>
          isPdf
            ? <PdfItem key={item._id} item={item} onPreview={onPreview} isHindi={isHindi} />
            : <VideoItem key={item._id} item={item} onPreview={onPreview} isHindi={isHindi} />
        )}
        <div className="px-3 pb-2">
          <Pager page={page} setPage={setPage} total={arr.length} />
        </div>
      </div>
    </div>
  );
};

/* ══ Main Component ══ */
const HelpSupport = () => {
  const { isHindi } = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfPage, setPdfPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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
        <PageLoader inline={true} text={isHindi ? "लोड हो रहा है..." : "Loading..."} />
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        title="Help & Support"
        titleHi="सहायता एवं मार्गदर्शन"
        description="Help, tutorials, user manuals, and video guidance for the BeyondSend platform."
        descriptionHi="बियॉन्डसेंड प्लेटफॉर्म हेतु सहायता, मार्गदर्शिका, उपयोगकर्ता नियमावली एवं वीडियो ट्यूटोरियल।"
        showBreadcrumb
      >
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <Section
              type="pdf" arr={pdfData}
              page={pdfPage} setPage={setPdfPage}
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
          <ModalHeader
            toggle={() => setModal(false)}
            style={{ background: 'linear-gradient(135deg, #0f172a, #1a3a6b)', border: 'none' }}
          >
            <span className="fw-semibold text-white" style={{ fontSize: ".95rem" }}>{previewTitle}</span>
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
