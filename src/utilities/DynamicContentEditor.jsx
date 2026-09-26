import React, {
  useState, useEffect, useRef, useCallback, useMemo,
  forwardRef, useImperativeHandle,
} from "react";
import PropTypes from "prop-types";
import JoditEditor from "jodit-react";
import { encodeBase64, decodeBase64 } from "./rXBase64";
import apiClient, { BASE_HOST } from "../services/api.service";
import { Progress } from "reactstrap";
import Swal from "sweetalert2";
import {
  FaUpload, FaFilePdf, FaFileExcel,
  FaFileAlt, FaFileWord, FaFileImage, FaTimes,
  FaCloudUploadAlt, FaFileCode, FaFileArchive, FaLink,
  FaExpand, FaCompress, FaCopy, FaCheck,
  FaTh, FaList, FaSearch, FaRegSave,
  FaFileAudio, FaFileVideo, FaFile, FaTrash,
  FaMagic, FaCheckCircle, FaExclamationTriangle, FaInfoCircle,
  FaGlobe, FaLanguage,
} from "react-icons/fa";

// ─────────────────────────────────────────────
// Design tokens (WordPress admin palette)
// ─────────────────────────────────────────────
const WP = {
  bg: "var(--wp-bg, #f0f0f1)",
  white: "var(--wp-white, #fff)",
  offWhite: "var(--wp-off-white, #f6f7f7)",
  text: "var(--wp-text, #1d2327)",
  textMid: "var(--wp-text-mid, #50575e)",
  textLight: "var(--wp-text-light, #787c82)",
  border: "var(--wp-border, #c3c4c7)",
  line: "var(--wp-line, #dcdcde)",
  blue: "var(--wp-blue, #2271b1)",
  blueHov: "var(--wp-blue-hov, #135e96)",
  blueBg: "var(--wp-blue-bg, #f0f6fc)",
  green: "var(--wp-green, #00a32a)",
  greenBg: "var(--wp-green-bg, #edfaef)",
  red: "var(--wp-red, #d63638)",
  redBg: "var(--wp-red-bg, #fcf0f1)",
  amber: "var(--wp-amber, #996800)",
  amberBg: "var(--wp-orange-bg, #fcf9e8)",
  amberBd: "var(--wp-orange, #dba617)",
  black: "var(--wp-black, #1d2327)",
};

const FF = "var(--wp-font, -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif)";

// ─────────────────────────────────────────────
// Env / auth helpers
// ─────────────────────────────────────────────

const getToken = () => {
  const raw = sessionStorage.getItem("authToken");
  if (!raw) return "";
  try { const p = JSON.parse(raw); return p?.token || p?.access || raw; } catch { return raw; }
};

// ─────────────────────────────────────────────
// Upload limits
// ─────────────────────────────────────────────
const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const MAX_UPLOAD_SIZE_LABEL = "100MB";

// ─────────────────────────────────────────────
// Shared style constants — matches WPStyleTheme.css .wp-btn spec
// ─────────────────────────────────────────────
const S = {
  btnBase: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
    border: "1px solid transparent", borderRadius: 3,
    fontSize: 13, fontWeight: 400, lineHeight: "2.15384615",
    padding: "0 10px", cursor: "pointer", fontFamily: FF,
    whiteSpace: "nowrap", textDecoration: "none",
    transition: "background 0.15s, color 0.15s, border-color 0.15s",
  },
  btnPrimary: { background: WP.blue, color: "#fff", border: "none" },
  btnSecondary: { background: "#fff", color: WP.textMid, borderColor: WP.border },
  btnDanger: { background: WP.red, color: "#fff", border: "none" },
  btnGhost: { background: "rgba(255,255,255,0.1)", color: "#fff", border: "none" },
  btnSm: { fontSize: 11, padding: "0 8px", lineHeight: "1.9" },
  kbd: {
    display: "inline-block", background: "#e4e4e7",
    border: "1px solid #c3c4c7", borderRadius: 4,
    padding: "0 5px", fontSize: 10, fontFamily: "monospace",
    lineHeight: "1.5", color: "var(--wp-text, #1d2327)",
  },
};

// ─────────────────────────────────────────────
// File utilities
// ─────────────────────────────────────────────
const getFileCategory = (mimeType) => {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType?.startsWith("audio/")) return "audio";
  return "doc";
};

const fmtSize = (b) =>
  b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" :
    b >= 1024 ? Math.round(b / 1024) + " KB" : b + " B";

// ─────────────────────────────────────────────
// SEO filename helpers (mirrors backend slugify contract:
// base name only, no extension, ASCII lowercase + hyphens)
// ─────────────────────────────────────────────
const splitNameExt = (fileName = "") => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) return { base: fileName, ext: "" };
  return { base: fileName.slice(0, lastDot), ext: fileName.slice(lastDot + 1).toLowerCase() };
};

const toSeoFriendlyBase = (base = "") => {
  let slug = base
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) slug = "file";
  if (slug.length > 80) slug = slug.slice(0, 80).replace(/-+$/g, "");
  return slug;
};

const isSeoFriendlyBase = (base = "") => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(base);

const FILE_ICON_MAP = {
  image: { icon: FaFileImage, color: "#10b981" },
  pdf: { icon: FaFilePdf, color: WP.red },
  xlsx: { icon: FaFileExcel, color: "#22c55e" },
  docx: { icon: FaFileWord, color: WP.blue },
  zip: { icon: FaFileArchive, color: WP.amber },
  code: { icon: FaFileCode, color: "#8b5cf6" },
  video: { icon: FaFileVideo, color: "#ec489a" },
  audio: { icon: FaFileAudio, color: "#f97316" },
  default: { icon: FaFileAlt, color: WP.textMid },
};

const getFileIcon = (mimeType, size = 28) => {
  let category = "default";
  if (mimeType?.startsWith("image")) category = "image";
  else if (mimeType === "application/pdf") category = "pdf";
  else if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) category = "xlsx";
  else if (mimeType?.includes("document") || mimeType?.includes("word")) category = "docx";
  else if (mimeType?.includes("zip") || mimeType?.includes("rar")) category = "zip";
  else if (mimeType?.startsWith("video")) category = "video";
  else if (mimeType?.startsWith("audio")) category = "audio";
  const { icon: Icon, color } = FILE_ICON_MAP[category] || FILE_ICON_MAP.default;
  return <Icon size={size} color={color} />;
};

const FILTERS = [
  { key: "all", label: "All", icon: FaFile },
  { key: "image", label: "Images", icon: FaFileImage },
  { key: "pdf", label: "PDFs", icon: FaFilePdf },
  { key: "doc", label: "Docs", icon: FaFileWord },
  { key: "video", label: "Videos", icon: FaFileVideo },
];

// ─────────────────────────────────────────────
// makeContentResponsive
// ─────────────────────────────────────────────
const makeContentResponsive = (html) => {
  if (!html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // --- CLEANUP: remove any text node that is only underscores ---
  const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      // Remove text nodes that consist only of underscores (any length) and optional whitespace
      if (/^[\s_]+$/.test(node.textContent)) {
        return NodeFilter.FILTER_ACCEPT;
      }
      return NodeFilter.FILTER_SKIP;
    }
  });
  const toRemove = [];
  while (walker.nextNode()) {
    toRemove.push(walker.currentNode);
  }
  toRemove.forEach(node => node.parentNode?.removeChild(node));

  // 1. Wrap bare tables (not already wrapped)
  doc.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("table-responsive")) return;
    const wrapper = doc.createElement("div");
    wrapper.className = "table-responsive";
    wrapper.style.cssText = "overflow-x:auto;width:100%;-webkit-overflow-scrolling:touch;";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    table.style.cssText += ";width:100%;border-collapse:collapse;";
  });

  // 2. Make media elements responsive
  const RESPONSIVE_CSS = "max-width:100%;height:auto;display:block;";
  doc.querySelectorAll("img, video").forEach((el) => {
    const existing = el.style.cssText || "";
    if (!existing.includes("max-width")) el.style.cssText = RESPONSIVE_CSS + existing;
  });

  // 3. Wrap iframes for 16:9 aspect ratio
  doc.querySelectorAll("iframe").forEach((el) => {
    if (el.parentElement?.classList.contains("iframe-wrap")) return;
    const wrap = doc.createElement("div");
    wrap.className = "iframe-wrap";
    wrap.style.cssText = "position:relative;width:100%;padding-bottom:56.25%;height:0;overflow:hidden;";
    el.style.cssText += ";position:absolute;top:0;left:0;width:100%;height:100%;border:0;";
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(el);
  });

  return doc.body.innerHTML;
};

// ─────────────────────────────────────────────
// Minimal global styles injected once
// ─────────────────────────────────────────────
function EditorStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Rozha+One&family=Yatra+One&display=swap');

      @keyframes dce-fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes dce-zoomIn {
        from { transform: translate(-50%,-48%) scale(0.96); opacity: 0; }
        to   { transform: translate(-50%,-50%) scale(1);   opacity: 1; }
      }
      @keyframes dce-slideUp {
        from { transform: translateX(100%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      @media (max-width: 600px) {
        .dce-modal-toolbar { flex-direction: column !important; }
        .dce-filter-pills  { flex-wrap: wrap !important; }
      }
      /* Hide Upload option tab in Jodit Image Popup Dialog — ONLY URL tab supported */
      .jodit-popup-import-image .jodit-tabs__button:first-child,
      .jodit-popup-import-image .jodit-tabs__buttons > button:first-child:not(:only-child),
      .jodit-popup .jodit-tabs__buttons > button[data-tab-id="upload"],
      .jodit-popup .jodit-tabs__buttons > button:first-child:not(:only-child) {
        display: none !important;
      }
      /* Ensure SweetAlert2 confirmation dialog and Jodit popups appear ON TOP of Fullscreen editor */
      .swal2-container {
        z-index: 99999 !important;
      }
      .jodit-popup, .jodit-dialog__box {
        z-index: 99990 !important;
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────
// Toast notification
// ─────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg = type === "success" ? WP.green : type === "error" ? WP.red : WP.amber;
  const icon = type === "success" ? <FaCheck /> : type === "error" ? <FaTimes /> : <FaLink />;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 10000,
        background: bg, color: "#fff",
        padding: "8px 16px", borderRadius: 4,
        fontSize: 13, fontWeight: 500, boxShadow: "0 4px 12px rgba(0,0,0,.2)",
        fontFamily: FF, display: "flex", alignItems: "center", gap: 8,
        animation: "dce-slideUp 0.2s ease-out",
        maxWidth: "calc(100vw - 48px)", border: "1px solid rgba(255,255,255,.2)",
      }}>
      {icon}{msg}
    </div>
  );
}
Toast.propTypes = {
  msg: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "info"]),
  onDone: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────
// SkeletonRow
// ─────────────────────────────────────────────
function SkeletonRow({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "12px 8px" }}>
          <div style={{
            height: 12, borderRadius: 6,
            background: `linear-gradient(90deg, ${WP.line} 25%, ${WP.offWhite} 50%, ${WP.line} 75%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s infinite",
            width: i === 0 ? "70%" : "50%",
          }} />
        </td>
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </tr>
  );
}

// ─────────────────────────────────────────────
// AttachModal – Media Library (full implementation)
// ─────────────────────────────────────────────
function AttachModal({ selection, onAttach, onClose, onShowToast }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // SEO-friendly upload name state (optional field, mirrors MediaLibraryMangments.jsx)
  const [uploadNameInput, setUploadNameInput] = useState("");
  const [uploadExt, setUploadExt] = useState("");
  const [uploadNameIsSeoFriendly, setUploadNameIsSeoFriendly] = useState(true);

  const fileInputRef = useRef(null);
  const searchRef = useRef(null);
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);

  useEffect(() => { setLinkText(selection?.trim() || ""); }, [selection]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get('/files/list');
      const data = res.data?.data;
      setFiles(Array.isArray(data) ? data : (data?.files ?? []));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load files";
      setError(msg);
      onShowToast?.(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchFiles();
    const t = setTimeout(() => searchRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [fetchFiles]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Tab") {
        const focusables = document.querySelectorAll("[data-modal-focus]");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return files.filter(f =>
      (filter === "all" || getFileCategory(f.mimeType) === filter) &&
      (!q || f.originalName.toLowerCase().includes(q))
    );
  }, [files, query, filter]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const copyFileUrl = useCallback((filePath, fileName) => {
    const fullUrl = `${BASE_HOST}${filePath}`;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullUrl);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = fullUrl;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand("copy"); } catch (err) {}
      document.body.removeChild(textArea);
    }
    onShowToast?.(`${fileName} — URL copied`, "success");
  }, [onShowToast]);

  const handleSelectFile = useCallback((file) => {
    if (!file) return;

    // Reject oversized files immediately instead of letting them fail
    // server-side (or during a slow upload) — same guard covers both the
    // click-to-browse input and drag & drop, since both funnel here.
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      onShowToast?.(
        `"${file.name}" is ${fmtSize(file.size)} — the maximum allowed size is ${MAX_UPLOAD_SIZE_LABEL}.`,
        "error"
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploadFile(file);
    setUploadProgress(0);
    // Reset the SEO name field for the newly selected file (optional — blank = keep original)
    const { ext } = splitNameExt(file.name);
    setUploadExt(ext);
    setUploadNameInput("");
    setUploadNameIsSeoFriendly(true);
    if (file.type?.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setUploadPreview(r.result);
      r.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  }, [onShowToast]);

  const resetUpload = useCallback(() => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadProgress(0);
    setUploadNameInput("");
    setUploadExt("");
    setUploadNameIsSeoFriendly(true);
  }, []);

  // Called as the user types a custom upload name (optional field)
  const handleUploadNameChange = useCallback((val) => {
    setUploadNameInput(val);
    setUploadNameIsSeoFriendly(val.trim() === "" ? true : isSeoFriendlyBase(val));
  }, []);

  // One-click auto-fix: slugifies whatever's currently typed (or the original
  // file name if the field is still blank) into an SEO-friendly base name.
  const handleAutoFixUploadName = useCallback(() => {
    if (!uploadFile) return;
    const activeBase = uploadNameInput.trim() || splitNameExt(uploadFile.name).base;
    setUploadNameInput(toSeoFriendlyBase(activeBase));
    setUploadNameIsSeoFriendly(true);
  }, [uploadFile, uploadNameInput]);

  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;

    // Belt-and-braces re-check in case uploadFile was ever set some other way.
    if (uploadFile.size > MAX_UPLOAD_SIZE_BYTES) {
      onShowToast?.(`File exceeds the ${MAX_UPLOAD_SIZE_LABEL} limit.`, "error");
      return;
    }

    // Custom name is OPTIONAL — if left blank, fall back to the original file name.
    // Base name only (no extension) is sent — the backend re-appends the real
    // extension itself.
    const originalBase = splitNameExt(uploadFile.name).base;
    const finalBase = uploadNameInput.trim() || originalBase;

    const fd = new FormData();
    // IMPORTANT: multer parses multipart fields in stream order — text fields
    // must be appended BEFORE the file field, otherwise req.body.fileName
    // isn't populated yet when the backend's filename() callback runs.
    fd.append("fileName", finalBase);
    fd.append("file", uploadFile);
    try {
      setUploading(true);
      await apiClient.post('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      onShowToast?.("File uploaded successfully", "success");
      resetUpload();
      await fetchFiles();
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const msg =
        status === 413 ? `File is too large. Maximum allowed size is ${MAX_UPLOAD_SIZE_LABEL}.` :
          status === 415 ? "File type not allowed. Check supported formats." :
            status === 401 ? "Session expired. Please log in again." :
              serverMsg || "Upload failed. Please try again.";
      onShowToast?.(msg, "error");
    } finally {
      setUploading(false);
    }
  }, [uploadFile, uploadNameInput, onShowToast, resetUpload, fetchFiles]);

  const handleFileSelectFromList = useCallback((file) => {
    setSelected(file);
    if (!linkText.trim()) {
      setLinkText(file.originalName.replace(/\.[^/.]+$/, ""));
    }
  }, [linkText]);

  const canInsert = Boolean(selected && linkText.trim());

  const handleInsert = useCallback(() => {
    if (!canInsert) return;
    onAttach({
      _id: selected._id,
      url: selected.filePath,
      title: selected.originalName,
      category: getFileCategory(selected.mimeType),
      mimeType: selected.mimeType,
      fileSize: selected.fileSize,
      linkText: linkText.trim(),
    });
  }, [canInsert, selected, linkText, onAttach]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 9990,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          animation: "dce-fadeIn 0.2s ease-out",
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Media Library"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 9991, width: "min(1100px,95vw)", maxHeight: "90vh",
          background: WP.white, borderRadius: 12,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
          overflow: "hidden", display: "flex", flexDirection: "column",
          animation: "dce-zoomIn 0.2s ease-out",
          fontFamily: FF,
        }}
      >
        <div style={{
          background: WP.black, padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: WP.white, display: "flex", alignItems: "center", gap: 8 }}>
              <FaCloudUploadAlt /> Media Library
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: selection?.trim() ? "rgba(255,255,255,.6)" : "rgba(255,255,255,.4)" }}>
              {selection?.trim() ? `Selected: "${selection}"` : "No text selected — enter link text below"}
            </p>
          </div>
          <button
            type="button"
            data-modal-focus
            ref={firstFocusRef}
            onClick={onClose}
            aria-label="Close media library"
            style={{ ...S.btnBase, ...S.btnGhost, width: 32, height: 32, padding: 0, borderRadius: "50%", fontSize: 20 }}>
            ×
          </button>
        </div>

        {!uploadFile ? (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a file by clicking or dragging"
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleSelectFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? WP.blue : WP.line}`,
              margin: "14px 20px 0", borderRadius: 12, padding: "18px",
              textAlign: "center", cursor: "pointer",
              background: isDragging ? WP.blueBg : WP.offWhite,
              transition: "all 0.2s", flexShrink: 0,
            }}>
            <FaCloudUploadAlt size={32} style={{ color: isDragging ? WP.blue : WP.textLight, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 13, color: isDragging ? WP.blue : WP.textMid, fontWeight: 600 }}>
              {isDragging ? "Drop to upload" : "Drag & drop or click to upload"}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: WP.textLight }}>
              Images · PDFs · Docs · Spreadsheets · Video · Audio · Max {MAX_UPLOAD_SIZE_LABEL}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              aria-label="File upload input"
              onChange={e => handleSelectFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div style={{
            margin: "14px 20px 0", background: WP.offWhite,
            border: `1px solid ${WP.line}`, borderRadius: 12,
            padding: "12px 16px", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: WP.white, display: "flex", alignItems: "center",
                justifyContent: "center", overflow: "hidden", flexShrink: 0,
              }}>
                {uploadPreview
                  ? <img src={uploadPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : getFileIcon(uploadFile.type, 28)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: WP.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {uploadFile.name}
                </div>
                <div style={{ fontSize: 11, color: WP.textLight }}>{fmtSize(uploadFile.size)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  aria-label="Upload file"
                  style={{ ...S.btnBase, ...S.btnPrimary, opacity: uploading ? .7 : 1 }}>
                  <FaUpload size={11} />{uploading ? "Uploading…" : "Upload"}
                </button>
                <button
                  type="button"
                  onClick={resetUpload}
                  disabled={uploading}
                  aria-label="Cancel upload"
                  style={{ ...S.btnBase, ...S.btnSecondary }}>
                  <FaTimes size={11} /> Cancel
                </button>
              </div>
            </div>

            {/* SEO-friendly upload name (optional) */}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${WP.line}` }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: WP.textMid, marginBottom: 4 }}>
                File name <span style={{ fontWeight: 400 }}>(optional — leave blank to keep original)</span>
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="text"
                  value={uploadNameInput}
                  onChange={e => handleUploadNameChange(e.target.value)}
                  placeholder={splitNameExt(uploadFile.name).base}
                  aria-label="Custom SEO-friendly file name"
                  disabled={uploading}
                  style={{
                    flex: 1, minWidth: 0,
                    border: `1px solid ${uploadNameInput.trim() && !uploadNameIsSeoFriendly ? WP.red : WP.border}`,
                    borderRadius: 8, padding: "6px 10px", fontSize: 12,
                    fontFamily: FF, color: WP.text, outline: "none",
                    background: WP.white, boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: 12, color: WP.textLight, flexShrink: 0 }}>.{uploadExt}</span>
              </div>

              {/* Always-visible live preview + auto-fix, mirrors MediaLibraryMangments.jsx */}
              {(() => {
                const activeBase = uploadNameInput.trim() || splitNameExt(uploadFile.name).base;
                const previewBase = toSeoFriendlyBase(activeBase);
                const alreadyClean = uploadNameInput.trim() !== "" && uploadNameIsSeoFriendly;
                return (
                  <div style={{
                    marginTop: 6, fontSize: 11, display: "flex", alignItems: "flex-start", gap: 5,
                    color: alreadyClean ? WP.green : WP.amber,
                  }}>
                    {alreadyClean ? <FaCheckCircle style={{ marginTop: 1 }} /> : <FaExclamationTriangle style={{ marginTop: 1 }} />}
                    <span>
                      {alreadyClean ? "Looks SEO-friendly. " : "Will be auto-converted to: "}
                      <code style={{ background: WP.offWhite, padding: "1px 4px", borderRadius: 4 }}>
                        {previewBase}.{uploadExt}
                      </code>{" "}
                      <button
                        type="button"
                        onClick={handleAutoFixUploadName}
                        disabled={uploading}
                        style={{
                          background: "none", border: "none", padding: 0,
                          color: WP.blue, fontSize: 11, cursor: "pointer",
                          display: "inline-flex", alignItems: "center", gap: 3,
                        }}>
                        <FaMagic size={9} /> Use this name
                      </button>
                    </span>
                  </div>
                );
              })()}

              <div style={{ marginTop: 6, fontSize: 10, color: WP.textLight, display: "flex", alignItems: "flex-start", gap: 5 }}>
                <FaInfoCircle style={{ marginTop: 1 }} />
                <span>Lowercase letters, numbers and hyphens only — improves search visibility. Hindi names are transliterated automatically.</span>
              </div>
            </div>

            {uploading && (
              <div style={{ marginTop: 10 }}>
                <Progress value={uploadProgress} style={{ height: 4, borderRadius: 4 }} />
                <div style={{ fontSize: 10, textAlign: "right", color: WP.textMid, marginTop: 4 }}>
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ margin: "12px 20px 0", borderTop: `1px solid ${WP.line}`, flexShrink: 0 }} />

        <div
          className="dce-modal-toolbar"
          style={{
            padding: "10px 20px",
            display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
            background: WP.offWhite, borderBottom: `1px solid ${WP.line}`,
            flexShrink: 0,
          }}>
          <div style={{ flex: "1 1 160px", position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: WP.textLight, fontSize: 12 }} />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search filename…"
              aria-label="Search files"
              style={{
                width: "100%", border: `1px solid ${WP.border}`, borderRadius: 20,
                padding: "7px 12px 7px 32px", fontSize: 13, fontFamily: FF,
                outline: "none", color: WP.text, background: WP.white,
                boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = WP.blue; e.target.style.boxShadow = `0 0 0 1px ${WP.blue}`; }}
              onBlur={e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ flex: "1 1 160px" }}>
            <input
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              placeholder="Link display text…"
              aria-label="Link display text"
              style={{
                width: "100%",
                border: `1px solid ${!linkText.trim() && selected ? WP.red : WP.border}`,
                borderRadius: 20, padding: "7px 12px", fontSize: 13,
                fontFamily: FF, color: WP.text, outline: "none",
                background: WP.white, boxSizing: "border-box",
              }}
              onFocus={e => { e.target.style.borderColor = WP.blue; e.target.style.boxShadow = `0 0 0 1px ${WP.blue}`; }}
              onBlur={e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div
            className="dce-filter-pills"
            role="group"
            aria-label="File type filters"
            style={{
              display: "flex", gap: 4, background: WP.white,
              borderRadius: 20, padding: 2, border: `1px solid ${WP.border}`,
              flexWrap: "wrap",
            }}>
            {FILTERS.map(f => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 18, fontSize: 11,
                  background: filter === f.key ? WP.blue : "transparent",
                  color: filter === f.key ? WP.white : WP.textMid,
                  border: "none", cursor: "pointer",
                  fontWeight: filter === f.key ? 600 : 400,
                  whiteSpace: "nowrap",
                }}>
                <f.icon size={10} />{f.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            {[
              { mode: "grid", Icon: FaTh, label: "Grid view" },
              { mode: "list", Icon: FaList, label: "List view" },
            ].map(({ mode, Icon, label }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                aria-label={label}
                aria-pressed={viewMode === mode}
                style={{
                  ...S.btnBase,
                  padding: "4px 10px",
                  background: viewMode === mode ? WP.blue : WP.white,
                  borderColor: viewMode === mode ? WP.blue : WP.border,
                  color: viewMode === mode ? WP.white : WP.textMid,
                }}>
                <Icon size={11} />{mode === "grid" ? "Grid" : "List"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 220 }}>
          {viewMode === "grid" ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
              gap: 12, padding: "16px 20px",
            }}>
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  border: `1px solid ${WP.line}`, borderRadius: 12, padding: 10,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  background: WP.white,
                }}>
                  <div style={{ width: 60, height: 60, borderRadius: 8, background: WP.line, animation: "shimmer 1.4s infinite", backgroundSize: "200% 100%", backgroundImage: `linear-gradient(90deg,${WP.line} 25%,${WP.offWhite} 50%,${WP.line} 75%)` }} />
                  <div style={{ width: "70%", height: 10, borderRadius: 4, background: WP.line }} />
                </div>
              ))}
              {!loading && error && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: WP.red }}>
                  <FaTimes style={{ marginBottom: 8 }} /><br />{error}
                  <br /><button type="button" onClick={fetchFiles} style={{ ...S.btnBase, ...S.btnPrimary, marginTop: 12 }}>Retry</button>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: WP.textLight }}>
                  No files match your search
                </div>
              )}
              {!loading && !error && filtered.map(file => {
                const isSel = selected?._id === file._id;
                const isImg = file.mimeType?.startsWith("image/");
                return (
                  <div
                    key={file._id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSel}
                    aria-label={`Select ${file.originalName}`}
                    onClick={() => handleFileSelectFromList(file)}
                    onKeyDown={e => e.key === "Enter" && handleFileSelectFromList(file)}
                    style={{
                      border: `2px solid ${isSel ? WP.blue : WP.line}`,
                      borderRadius: 10, padding: "8px 6px", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      background: isSel ? WP.blueBg : WP.white,
                      position: "relative", transition: "all 0.15s",
                    }}>
                    {isSel && (
                      <div style={{
                        position: "absolute", top: 6, right: 6,
                        background: WP.blue, borderRadius: 20,
                        width: 16, height: 16, display: "flex",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <FaCheck size={8} color="white" />
                      </div>
                    )}
                    <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#f6f7f7", overflow: "hidden" }}>
                      {isImg
                        ? <img src={`${BASE_HOST}${file.filePath}`} alt={file.originalName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : getFileIcon(file.mimeType, 28)}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: WP.text,
                      textAlign: "center", wordBreak: "break-word", width: "100%",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{file.originalName}</span>
                    <div style={{ fontSize: 9, color: WP.textLight }}>{fmtSize(file.fileSize)}</div>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); copyFileUrl(file.filePath, file.originalName); }}
                      aria-label={`Copy URL for ${file.originalName}`}
                      style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, fontSize: 10, display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <FaCopy size={9} />URL
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "8px 20px 20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} role="grid">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${WP.line}`, background: WP.offWhite }}>
                    {["File", "Size", "Date", "Actions", ""].map((h, i) => (
                      <th key={i} scope="col" style={{ padding: "10px 8px", textAlign: i === 4 ? "center" : "left", fontWeight: 600, color: WP.textMid, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
                  {!loading && error && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: WP.red }}>
                      {error} <button type="button" onClick={fetchFiles} style={{ ...S.btnBase, ...S.btnPrimary, marginLeft: 12 }}>Retry</button>
                    </td></tr>
                  )}
                  {!loading && !error && filtered.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: "center", color: WP.textLight }}>No files found</td></tr>
                  )}
                  {!loading && !error && filtered.map(file => {
                    const isSel = selected?._id === file._id;
                    const isImg = file.mimeType?.startsWith("image/");
                    return (
                      <tr
                        key={file._id}
                        role="row"
                        aria-selected={isSel}
                        tabIndex={0}
                        style={{ borderBottom: `1px solid ${WP.line}`, background: isSel ? WP.blueBg : "white", cursor: "pointer" }}
                        onClick={() => handleFileSelectFromList(file)}
                        onKeyDown={e => e.key === "Enter" && handleFileSelectFromList(file)}>
                        <td style={{ padding: "10px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {isImg
                                ? <img src={`${BASE_HOST}${file.filePath}`} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }} />
                                : getFileIcon(file.mimeType, 16)}
                            </div>
                            <span style={{ fontWeight: isSel ? 600 : 400, color: WP.text }}>{file.originalName}</span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 8px", color: WP.textLight, whiteSpace: "nowrap" }}>{fmtSize(file.fileSize)}</td>
                        <td style={{ padding: "10px 8px", color: WP.textLight, whiteSpace: "nowrap" }}>{formatDate(file.createdAt)}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <button
                            type="button"
                            onClick={e => { e.stopPropagation(); copyFileUrl(file.filePath, file.originalName); }}
                            aria-label={`Copy URL for ${file.originalName}`}
                            style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <FaCopy size={11} /> Copy URL
                          </button>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "center" }}>
                          <input
                            type="radio"
                            name="fileSelect"
                            checked={isSel}
                            onChange={() => handleFileSelectFromList(file)}
                            aria-label={`Select ${file.originalName}`}
                            style={{ cursor: "pointer", accentColor: WP.blue }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid ${WP.line}`, background: WP.offWhite,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 12, color: WP.textMid }}>
            {selected
              ? <><FaCheck style={{ color: WP.green, marginRight: 6 }} /><strong>{selected.originalName}</strong> · {fmtSize(selected.fileSize)}</>
              : `${filtered.length} file${filtered.length !== 1 ? "s" : ""} — select one to insert`}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {selected && !linkText.trim() && (
              <span style={{ fontSize: 11, color: WP.red }} role="alert">
                Enter link text ↑
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ ...S.btnBase, ...S.btnSecondary }}>
              Cancel
            </button>
            <button
              type="button"
              data-modal-focus
              ref={lastFocusRef}
              disabled={!canInsert}
              onClick={handleInsert}
              aria-label="Insert selected file as link"
              style={{
                ...S.btnBase, ...S.btnPrimary,
                opacity: canInsert ? 1 : .45,
                cursor: canInsert ? "pointer" : "not-allowed",
              }}>
              Insert Link →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
AttachModal.propTypes = {
  selection: PropTypes.string,
  onAttach: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onShowToast: PropTypes.func,
};

// ─────────────────────────────────────────────
// EditorToolbar – with SweetAlert confirmation
// ─────────────────────────────────────────────
function EditorToolbar({ activeTab, onTabChange, onAttachMouseDown, onClear, isFullscreen, onToggleFullscreen }) {
  const TABS = [
    { key: "en", label: "English", icon: "🇺🇸" },
    { key: "hi", label: "हिंदी", icon: "🇮🇳" },
  ];


  const handleClearClick = async () => {
    if (isFullscreen) await new Promise(resolve => setTimeout(resolve, 30));
    const result = await Swal.fire({
      title: 'Clear editor content?',
      html: `All text, images, and formatting in the <strong>${activeTab === 'en' ? 'English' : 'Hindi'}</strong> tab will be permanently removed.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--wp-red, #d63638)',
      cancelButtonColor: 'var(--wp-blue, #2271b1)',
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'wp-swal-popup', confirmButton: 'wp-swal-btn-danger', cancelButton: 'wp-swal-btn-cancel' },
      backdrop: true,
      zIndex: 10001,
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      onClear();
      await Swal.fire({
        title: 'Cleared!',
        text: 'Editor content has been cleared.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: 'wp-swal-popup' },
        zIndex: 10001,
      });
    }
  };


  return (
    <div style={{
      background: WP.black, padding: "8px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, flexWrap: "wrap",
    }}>
      <div role="tablist" aria-label="Language" style={{ display: "flex", gap: 4 }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onTabChange(tab.key);
            }}
            style={{
              padding: "5px 14px", borderRadius: 20, border: "none",
              background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "transparent",
              color: activeTab === tab.key ? WP.white : "rgba(255,255,255,0.65)",
              fontWeight: activeTab === tab.key ? 600 : 400,
              fontSize: 13, cursor: "pointer", fontFamily: FF,
              display: "inline-flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onMouseDown={onAttachMouseDown}
          aria-label="Attach file from media library"
          style={{ ...S.btnBase, ...S.btnPrimary }}>
          <FaLink size={11} /> Attach File
        </button>
        <button
          type="button"
          onClick={handleClearClick}
          aria-label="Clear editor content"
          title="Clear all content"
          style={{ ...S.btnBase, background: "rgba(214,54,56,0.18)", border: "1px solid rgba(214,54,56,0.35)", color: "#fca5a5" }}>
          <FaTrash size={11} /> Clear
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-pressed={isFullscreen}
          style={{ ...S.btnBase, ...S.btnGhost, width: 32, height: 32, padding: 0, borderRadius: "50%" }}>
          {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
        </button>
      </div>
    </div>
  );
}
EditorToolbar.propTypes = {
  activeTab: PropTypes.oneOf(["en", "hi"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
  onAttachMouseDown: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  isFullscreen: PropTypes.bool.isRequired,
  onToggleFullscreen: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────
// StatsFooter
// ─────────────────────────────────────────────
function StatsFooter({ content }) {
  const stats = useMemo(() => {
    const text = (content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(/\s+/).length : 0;
    return { words, chars: text.length, read: Math.max(1, Math.ceil(words / 200)) };
  }, [content]);

  return (
    <div style={{
      background: WP.offWhite, borderTop: `1px solid ${WP.line}`,
      padding: "8px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 8,
    }}>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: WP.textMid }}>
        <span><strong style={{ color: WP.text }}>{stats.words.toLocaleString()}</strong> words</span>
        <span><strong style={{ color: WP.text }}>{stats.chars.toLocaleString()}</strong> chars</span>
        <span>~<strong style={{ color: WP.text }}>{stats.read}</strong> min read</span>
      </div>
      <span style={{ fontSize: 11, color: WP.textLight, display: "flex", alignItems: "center", gap: 4 }}>
        <FaRegSave size={10} /> Auto-saved on blur
      </span>
    </div>
  );
}
StatsFooter.propTypes = { content: PropTypes.string };

// ─────────────────────────────────────────────
// DynamicContentEditor (main export)
// ─────────────────────────────────────────────
const DynamicContentEditor = forwardRef(({
  contents,
  setContents,
  initialEn = "",
  initialHi = "",
  onChange,
  engField = "descriptionEn",
  hinField = "descriptionHi",
  htmlContentEng,
  htmlContentHin,
  activeTab: controlledTab,
  height = 460,
  instanceId = "dce_default",
}, ref) => {
  const ENG = htmlContentEng || engField;
  const HIN = htmlContentHin || hinField;
  const SESSION_KEY = `${instanceId}_tab`;

  const [activeTab, setActiveTabState] = useState(() => {
    if (controlledTab) return controlledTab;
    try { return sessionStorage.getItem(SESSION_KEY) || "en"; } catch { return "en"; }
  });
  const [showModal, setShowModal] = useState(false);
  const [selText, setSelText] = useState("");
  const [toast, setToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Keep a stable editor instance while typing.
  // editorKey is only used for rare resets/clears.
  const [editorKey, setEditorKey] = useState(`${instanceId}_${activeTab}`);
  const [liveContent, setLiveContent] = useState("");

  const activeTabRef = useRef(activeTab);
  const savedRangeRef = useRef(null);
  const editorRef = useRef(null);

  const isControlled = contents !== undefined && setContents !== undefined;
  const [internalContent, setInternalContent] = useState(() => ({
    [ENG]: decodeBase64(initialEn), [HIN]: decodeBase64(initialHi),
  }));

  const getCurrentContent = useCallback(() => {
    if (isControlled && contents?.[0]) {
      return {
        [ENG]: decodeBase64(contents[0][ENG] || ""),
        [HIN]: decodeBase64(contents[0][HIN] || ""),
      };
    }
    return internalContent;
  }, [isControlled, contents, internalContent, ENG, HIN]);

  useImperativeHandle(ref, () => ({ getContent: getCurrentContent }), [getCurrentContent]);

  const item = isControlled ? contents?.[0] : internalContent;
  const currentField = activeTab === "en" ? ENG : HIN;
  const externalValue = decodeBase64(item?.[currentField] || "");

  const externalValueRef = useRef(externalValue);
  externalValueRef.current = externalValue;
  const lastOwnUpdateRef = useRef({ field: null, value: null });

  useEffect(() => { setLiveContent(externalValue); }, [externalValue]);

  useEffect(() => {
    if (!isControlled) {
      setInternalContent(() => ({
        [ENG]: decodeBase64(initialEn),
        [HIN]: decodeBase64(initialHi),
      }));
    }
  }, [isControlled, initialEn, initialHi, ENG, HIN]);

  const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);
    activeTabRef.current = tab;
    try { sessionStorage.setItem(SESSION_KEY, tab); } catch { /* ignore */ }
    setEditorKey(`${instanceId}_${tab}_${Date.now()}`);
  }, [SESSION_KEY, instanceId]);

  useEffect(() => {
    if (controlledTab && controlledTab !== activeTabRef.current) {
      setActiveTab(controlledTab);
    }
  }, [controlledTab, setActiveTab]);

  const updateContent = useCallback((field, newValue) => {
    lastOwnUpdateRef.current = { field, value: newValue };
    if (isControlled) {
      const newObj = { ...(contents?.[0] || {}), id: contents?.[0]?.id || Date.now(), [field]: newValue };
      setContents([newObj]);
    } else {
      setInternalContent(prev => {
        const updated = { ...prev, [field]: newValue };
        onChange?.(updated);
        return updated;
      });
    }
  }, [isControlled, contents, setContents, onChange]);

  const handleBlur = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const raw = editor.value;
    const responsive = makeContentResponsive(raw);
    const field = activeTabRef.current === "en" ? ENG : HIN;
    const currentValue = isControlled
      ? (contents?.[0]?.[field] || "")
      : internalContent[field];
    if (responsive !== currentValue) {
      updateContent(field, responsive);
      setLiveContent(responsive);
      if (editor.value !== responsive) {
        try { editor.value = responsive; } catch { /* ignore */ }
      }
    }
  }, [updateContent, isControlled, contents, internalContent, ENG, HIN]);

  const handleChange = useCallback((newContent) => {
    setLiveContent(newContent);
    const field = activeTabRef.current === "en" ? ENG : HIN;
    updateContent(field, newContent);
  }, [ENG, HIN, updateContent]);

  const handleClear = useCallback(() => {
    const field = activeTabRef.current === "en" ? ENG : HIN;
    updateContent(field, "");
    setLiveContent("");
    const editor = editorRef.current;
    if (editor) try { editor.value = ""; } catch { /* ignore */ }
    setEditorKey(`${instanceId}_${activeTabRef.current}_clear_${Date.now()}`);
  }, [ENG, HIN, updateContent, instanceId]);

  const handleTabChange = useCallback((tab) => {
    if (tab === activeTab) return;
    handleBlur();
    setActiveTab(tab);
  }, [activeTab, handleBlur, setActiveTab]);

  const handleAttachMouseDown = useCallback((e) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();

    try {
      if (typeof editor.selection.save === "function") {
        editor.selection.save();
        savedRangeRef.current = "jodit-marker";
      } else {
        const sel = editor.selection.sel;
        savedRangeRef.current = (sel && sel.rangeCount > 0)
          ? sel.getRangeAt(0).cloneRange()
          : null;
      }
    } catch { savedRangeRef.current = null; }

    let selected = "";
    try { selected = editor.selection.text() || ""; } catch { /* ignore */ }
    if (!selected.trim()) {
      const win = window.getSelection();
      if (win?.toString().trim()) selected = win.toString();
    }
    setSelText(selected.trim());
    setShowModal(true);
  }, []);

  const handleAttach = useCallback((file) => {
    const editor = editorRef.current;
    if (!editor) { showToast("Editor not ready", "error"); setShowModal(false); return; }

    const url = `${BASE_HOST}${file.url}`;
    const text = file.linkText?.trim() || file.title;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" data-file-id="${file._id}" data-category="${file.category}">${text}</a>`;

    editor.focus();

    if (savedRangeRef.current === "jodit-marker") {
      try { editor.selection.restore(); }
      catch { editor.selection.focus(); }
    } else if (savedRangeRef.current) {
      try {
        const sel = editor.selection.sel;
        if (sel) { sel.removeAllRanges(); sel.addRange(savedRangeRef.current); }
      } catch { editor.selection.focus(); }
    } else {
      editor.selection.focus();
    }

    editor.selection.insertHTML(linkHtml);
    const newContent = editor.value;
    setLiveContent(newContent);
    setTimeout(() => handleBlur(), 120);
    showToast(`"${file.title}" linked`, "success");
    setShowModal(false);
    setSelText("");
    savedRangeRef.current = null;
  }, [handleBlur, showToast]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const self = lastOwnUpdateRef.current;
    const isOwnEcho = self.field === currentField && self.value === externalValue;
    if (isOwnEcho) return;
    if (editor.value !== externalValue) {
      try { editor.value = externalValue; } catch { /* ignore */ }
    }
  }, [externalValue, currentField]);

  const joditConfig = useMemo(() => {
    const seed = editorRef.current ? editorRef.current.value : externalValueRef.current;
    return {
      preset: "full",
      height: isFullscreen ? "calc(100vh - 210px)" : height,
      readonly: false,
      toolbarAdaptive: true,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: true,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html",
      spellcheck: true,
      image: {
        openByLink: true,
        selectImage: false,
      },
      uploader: {
        url: "",
        insertImageAsBase64URI: false,
        maxSize: 100 * 1024, // 100KB upload size limit
        imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
        withCredentials: false,
      },
      buttons: [
        "source", "|",
        "bold", "italic", "underline", "strikethrough", "|",
        "superscript", "subscript", "|",
        "eraser", "copyformat", "|",
        "font", "fontsize", "brush", "paragraph", "lineHeight", "|",
        "ul", "ol", "|",
        "outdent", "indent", "|",
        "align", "|",
        "table", "link", "image", "video", "|",
        "hr", "symbols", "print", "|",
        "undo", "redo", "|",
        "find", "selectall", "showblocks", "|",
        "fullsize",
      ],
      buttonsMD: [
        "source", "|",
        "bold", "italic", "underline", "|",
        "font", "fontsize", "brush", "paragraph", "|",
        "ul", "ol", "|",
        "align", "|",
        "table", "link", "image", "|",
        "undo", "redo", "|",
        "fullsize",
      ],
      buttonsXS: [
        "bold", "italic", "|",
        "brush", "paragraph", "|",
        "ul", "ol", "|",
        "align", "|",
        "link", "image", "|",
        "undo", "redo",
      ],
      controls: {
        font: {
          list: {
            "Inter": "Inter, sans-serif",
            "Roboto": "Roboto, sans-serif",
            "Poppins": "Poppins, sans-serif",
            "Montserrat": "Montserrat, sans-serif",
            "Outfit": "Outfit, sans-serif",
            "Open Sans": "'Open Sans', sans-serif",
            "Lato": "Lato, sans-serif",
            "Noto Sans Devanagari (Hindi)": "'Noto Sans Devanagari', sans-serif",
            "Mangal (Hindi)": "Mangal, 'Devanagari Sangam MN', sans-serif",
            "Kruti Dev 010 (Hindi)": "'Kruti Dev 010', 'KrutiDev010', sans-serif",
            "Walkman Chanakya (Hindi)": "'Walkman Chanakya', 'Chanakya', sans-serif",
            "Rozha One (Hindi Decorative)": "'Rozha One', serif",
            "Yatra One (Hindi Traditional)": "'Yatra One', cursive",
            "Arial": "Arial, Helvetica, sans-serif",
            "Georgia": "Georgia, 'Times New Roman', serif",
            "Times New Roman": "'Times New Roman', Times, serif",
            "Courier New": "'Courier New', Courier, monospace",
            "Verdana": "Verdana, Geneva, sans-serif",
            "Tahoma": "Tahoma, Geneva, sans-serif",
            "Trebuchet MS": "'Trebuchet MS', Helvetica, sans-serif",
            "Impact": "Impact, Charcoal, sans-serif",
            "Comic Sans MS": "'Comic Sans MS', cursive, sans-serif",
          },
        },
      },
      commandToHotkeys: {
        bold: ["ctrl+b", "cmd+b"],
        italic: ["ctrl+i", "cmd+i"],
        underline: ["ctrl+u", "cmd+u"],
        undo: ["ctrl+z", "cmd+z"],
        redo: ["ctrl+y", "cmd+y", "ctrl+shift+z", "cmd+shift+z"],
        selectAll: ["ctrl+a", "cmd+a"],
        link: ["ctrl+k", "cmd+k"],
      },
      style: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "16px", lineHeight: "1.8" },
      defaultValue: seed,
      events: {
        afterInit(editor) {
          editorRef.current = editor;
          if (editor.value !== externalValueRef.current) editor.value = externalValueRef.current;
        },
      },
    };
  }, [isFullscreen, height]);

  if (!item) return null;

  return (
    <div
      style={{
        fontFamily: FF,
        ...(isFullscreen ? {
          position: "fixed", inset: 0, zIndex: 9000,
          background: WP.bg, padding: "16px", overflowY: "auto",
        } : {}),
      }}>
      <div style={{
        background: WP.white, border: `1px solid ${WP.line}`,
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <EditorToolbar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onAttachMouseDown={handleAttachMouseDown}
          onClear={handleClear}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(f => !f)}
        />

        <div style={{
          background: WP.offWhite, borderBottom: `1px solid ${WP.line}`,
          padding: "5px 16px", fontSize: 11, color: WP.textMid,
          display: "flex", gap: 14, flexWrap: "wrap",
        }}>
          {[["Ctrl+B", "Bold"], ["Ctrl+I", "Italic"], ["Ctrl+K", "Link"], ["Ctrl+Z", "Undo"]].map(([k, l]) => (
            <span key={k}><kbd style={S.kbd}>{k}</kbd> {l}</span>
          ))}
        </div>

        <div style={{ background: WP.white }} role="region" aria-label={`Content editor – ${activeTab === "en" ? "English" : "Hindi"}`}>
          <JoditEditor
            key={instanceId} // stable key prevents re-mount while typing
            config={joditConfig}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </div>

        <StatsFooter content={liveContent} />
      </div>

      {showModal && (
        <AttachModal
          selection={selText}
          onAttach={handleAttach}
          onClose={() => {
            // If the modal is dismissed without inserting anything, still
            // restore/clean up the saved-position markers so no stray
            // marker spans are left behind in the content.
            const editor = editorRef.current;
            if (editor && savedRangeRef.current === "jodit-marker") {
              try { editor.selection.restore(); } catch { /* ignore */ }
            }
            setShowModal(false);
            setSelText("");
            savedRangeRef.current = null;
          }}
          onShowToast={showToast}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <EditorStyles />
    </div>
  );
});

DynamicContentEditor.displayName = "DynamicContentEditor";
DynamicContentEditor.propTypes = {
  contents: PropTypes.array,
  setContents: PropTypes.func,
  initialEn: PropTypes.string,
  initialHi: PropTypes.string,
  onChange: PropTypes.func,
  engField: PropTypes.string,
  hinField: PropTypes.string,
  htmlContentEng: PropTypes.string,
  htmlContentHin: PropTypes.string,
  activeTab: PropTypes.oneOf(["en", "hi"]),
  height: PropTypes.number,
  instanceId: PropTypes.string,
};

export default DynamicContentEditor;