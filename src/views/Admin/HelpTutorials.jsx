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

const HelpTutorials = () => {
  const { isHindi } = useLanguage();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");

  const [pdfPage, setPdfPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // track which card ids are expanded
  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useEffect(() => {
    if (role) fetchHelp();
  }, [role]);

  const fetchHelp = async () => {
    try {
      const res = await axios.get(`${API}/api/get-active-guidance-by-role`, {
        params: { role }
      });
      setData(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

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
      const parsed = new URL(url);
      let id = "";
      if (parsed.hostname.includes("youtube.com")) id = parsed.searchParams.get("v");
      if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : "";
    } catch { return ""; }
  };

  const getYoutubeThumbnail = (url) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      let id = "";
      if (parsed.hostname.includes("youtube.com")) id = parsed.searchParams.get("v");
      if (parsed.hostname.includes("youtu.be")) id = parsed.pathname.slice(1);
      return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
    } catch { return ""; }
  };

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

  const t = (en, hi) => (isHindi ? hi : en);

  /* ── PAGINATION ── */
  const Pagination = ({ page, setPage, arr }) => {
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

  /* ── PDF CARD ── */
  const PdfCard = ({ item }) => {
    const isOpen = !!expandedIds[item._id];
    const hasLongDesc = item.description && item.description.length > 80;

    return (
      <Card className="border-0 shadow-sm rounded-3 mb-2 overflow-hidden">
        <div className="bg-danger" style={{ height: 3 }} />
        <CardBody className="p-3">
          <div className="d-flex gap-3 align-items-start">

            {/* icon block */}
            <div
              className="bg-danger bg-opacity-10 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 44, height: 44 }}>
              <FaFilePdf className="text-danger" size={20} />
            </div>

            {/* content */}
            <div className="flex-grow-1 min-w-0">
              <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "0.88rem" }}>
                {item.title}
              </h6>

              {item.description && (
                <>
                  {/* truncated line when collapsed */}
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

                  {/* full description when expanded */}
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

                  {/* show more / less toggle */}
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

              {/* only created date for PDF */}
              <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                📅 {formatDate(item.createdAt)}
              </small>
            </div>

            {/* actions — match video card style */}
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

  /* ── VIDEO CARD ── */
  const VideoCard = ({ item }) => {
    const embedUrl = getYoutubeEmbedUrl(item.videoUrl);
    const thumb = getYoutubeThumbnail(item.videoUrl);
    const isOpen = !!expandedIds[item._id];
    const hasLongDesc = item.description && item.description.length > 80;

    return (
      <Card className="border-0 shadow-sm rounded-3 mb-2 overflow-hidden">
        <div className="bg-primary" style={{ height: 3 }} />
        <CardBody className="p-3">
          <div className="d-flex gap-3 align-items-start">

            {/* thumbnail or icon */}
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

            {/* content */}
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

            {/* actions */}
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

  /* ── SECTION ── */
  const Section = ({ type, arr, page, setPage }) => {
    const isPdf = type === "pdf";
    const items = paginate(arr, page);

    return (
      <Card className="border-0 shadow rounded-4 h-100">
        <CardHeader className="bg-primary border-0 rounded-top-4 pb-0 pt-3 px-3">
          <div
            className={`d-flex align-items-center gap-2 border-bottom pb-2 ${isPdf ? "border-danger" : "border-primary"}`}>
            <div
              className={`rounded-3 d-flex align-items-center justify-content-center ${isPdf ? "bg-danger" : "bg-primary"}`}
              style={{ width: 32, height: 32 }}>
              {isPdf
                ? <FaFilePdf className="text-white" size={14} />
                : <FaPlayCircle className="text-white" size={14} />}
            </div>
            <span className="fw-bold text-dark">
              {isPdf
                ? t("PDF Documents", "PDF दस्तावेज़")
                : t("Video Tutorials", "वीडियो ट्यूटोरियल")}
            </span>
            <Badge color={isPdf ? "danger" : "primary"} pill className="ms-auto px-2">
              {arr.length}
            </Badge>
          </div>
        </CardHeader>

        <CardBody className="p-3" style={{ maxHeight: 520, overflowY: "auto" }}>
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
                  ? <PdfCard key={item._id} item={item} />
                  : <VideoCard key={item._id} item={item} />
              )}
              <Pagination page={page} setPage={setPage} arr={arr} />
            </>
          )}
        </CardBody>
      </Card>
    );
  };

  /* ── LOADING ── */
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

  return (
    <Container>
      <div className=" min-vh-100 py-4">
        <div className="container-fluid px-3 px-md-4">

          {/* ── PAGE HEADER ── */}
          <CardHeader className="shadow rounded ">
            <div className=" rounded-4 shadow-sm p-3 mb-4 d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 46, height: 46 }}>
                <span style={{ fontSize: "1.4rem" }}>📘</span>
              </div>
              <div>
                <h5 className="fw-bold mb-0">
                  {t("Help & Tutorials", "सहायता और ट्यूटोरियल")}
                </h5>
                <small className="text-muted">
                  {t("Browse PDF documents and video guides", "PDF दस्तावेज़ और वीडियो गाइड देखें")}
                </small>
              </div>
              <div className="ms-auto d-flex gap-2">
                <Badge color="danger" pill className="px-3 py-2 d-flex align-items-center gap-1">
                  <FaFilePdf size={11} /> {pdfData.length} {t("PDFs", "PDF")}
                </Badge>
                <Badge color="primary" pill className="px-3 py-2 d-flex align-items-center gap-1">
                  <FaPlayCircle size={11} /> {videoData.length} {t("Videos", "वीडियो")}
                </Badge>
              </div>
            </div>
          </CardHeader>


          {/* ── SECTIONS ── */}
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <Section type="pdf" arr={pdfData} page={pdfPage} setPage={setPdfPage} />
            </Col>
            <Col xs={12} lg={6}>
              <Section type="video" arr={videoData} page={videoPage} setPage={setVideoPage} />
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
            className="border-0 fw-bold">
            👁️ {previewTitle}
          </ModalHeader>
          <ModalBody className="p-0" style={{ height: "75vh" }}>
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              title="Preview"
              allowFullScreen
            />
          </ModalBody>
        </Modal>
      </div>
    </Container>
  );
};

export default HelpTutorials;