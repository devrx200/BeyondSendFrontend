import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import { Progress } from "reactstrap";
import Swal from "sweetalert2";
import {
  FaUpload, FaFilePdf, FaFileExcel,
  FaFileAlt, FaFileWord, FaFileImage, FaTimes,
  FaCloudUploadAlt, FaFileCode, FaFileArchive, FaLink,
  FaExpand, FaCompress,
} from "react-icons/fa";

/* ── WordPress design tokens ── */
const WP = {
  bg: "#f0f0f1",
  white: "#fff",
  offWhite: "#f6f7f7",
  text: "#1d2327",
  textMid: "#50575e",
  textLight: "#787c82",
  border: "#c3c4c7",
  line: "#dcdcde",
  blue: "#2271b1",
  blueHov: "#135e96",
  blueBg: "#f0f6fc",
  green: "#00a32a",
  greenDark: "#007017",
  greenBg: "#edfaef",
  red: "#d63638",
  redBg: "#fcf0f1",
  amber: "#996800",
  amberBg: "#fcf9e8",
  amberBd: "#dba617",
  black: "#1d2327",
};

const FF = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif";
const API_URL = import.meta.env.VITE_API_URL;
const getToken = () => sessionStorage.getItem("authToken");

/* ── File helpers ── */
const getFileCategory = (mimeType) => {
  if (mimeType?.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "doc";
};
const fmtSize = (b) =>
  b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" :
    b >= 1024 ? Math.round(b / 1024) + " KB" : b + " B";

const FILE_ICON_MAP = {
  image: { icon: FaFileImage, color: "#10b981" },
  pdf: { icon: FaFilePdf, color: WP.red },
  xlsx: { icon: FaFileExcel, color: "#22c55e" },
  docx: { icon: FaFileWord, color: WP.blue },
  zip: { icon: FaFileArchive, color: WP.amber },
  code: { icon: FaFileCode, color: "#8b5cf6" },
  default: { icon: FaFileAlt, color: WP.textMid },
};
const getFileIcon = (mimeType, size = 28) => {
  let { icon: Icon, color } = FILE_ICON_MAP.default;
  if (mimeType?.startsWith("image")) ({ icon: Icon, color } = FILE_ICON_MAP.image);
  else if (mimeType === "application/pdf") ({ icon: Icon, color } = FILE_ICON_MAP.pdf);
  else if (mimeType?.includes("spreadsheet") || mimeType?.includes("excel")) ({ icon: Icon, color } = FILE_ICON_MAP.xlsx);
  else if (mimeType?.includes("document") || mimeType?.includes("word")) ({ icon: Icon, color } = FILE_ICON_MAP.docx);
  else if (mimeType?.includes("zip") || mimeType?.includes("rar")) ({ icon: Icon, color } = FILE_ICON_MAP.zip);
  return <Icon size={size} color={color} />;
};

const FILTERS = [
  { key: "all", label: "All Files" },
  { key: "image", label: "Images" },
  { key: "pdf", label: "PDFs" },
  { key: "doc", label: "Docs" },
];

/* ══════════════════════════════════════════════
   ATTACH / MEDIA LIBRARY MODAL (FIXED)
══════════════════════════════════════════════ */
function AttachModal({ selection, onAttach, onClose }) {
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
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);
  const [linkText, setLinkText] = useState("");

  // Initialize linkText from the selected text (if any)
  useEffect(() => {
    if (selection?.trim()) {
      setLinkText(selection);
    } else {
      setLinkText("");
    }
  }, [selection]);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/files/list`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setFiles(Array.isArray(res.data.data) ? res.data.data : res.data.data?.files || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { searchRef.current?.focus(); fetchFiles(); }, [fetchFiles]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return files.filter(f =>
      (filter === "all" || getFileCategory(f.mimeType) === filter) &&
      (!q || f.originalName.toLowerCase().includes(q))
    );
  }, [files, query, filter]);

  const handleSelectFile = (file) => {
    if (!file) return;
    setUploadFile(file);
    setUploadProgress(0);
    if (file.type.startsWith("image/")) {
      const r = new FileReader();
      r.onloadend = () => setUploadPreview(r.result);
      r.readAsDataURL(file);
    } else {
      setUploadPreview(null);
    }
  };

  const resetUpload = () => { setUploadFile(null); setUploadPreview(null); setUploadProgress(0); };

  const handleUpload = async () => {
    if (!uploadFile) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    try {
      setUploading(true);
      await axios.post(`${API_URL}/api/files/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken()}` },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      Swal.fire({ icon: "success", title: "Uploaded!", timer: 1200, showConfirmButton: false });
      resetUpload();
      await fetchFiles();
    } catch {
      Swal.fire("Error", "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const btnSt = {
    display: "inline-flex", alignItems: "center", gap: 4,
    border: "1px solid transparent", borderRadius: 3,
    fontSize: 12, fontWeight: 400, lineHeight: "2.15",
    padding: "0 10px", cursor: "pointer", fontFamily: FF,
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9990, background: "rgba(71, 70, 70, 0.38)" }} />
      <div role="dialog" style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 9991, width: "min(1080px,96vw)", background: WP.white,
        borderRadius: 4, boxShadow: "0 8px 40px rgba(0,0,0,.25)",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <div style={{ background: WP.black, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: WP.white }}>Upload Files / Media Library</h3>
            {selection && <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,.55)" }}>Linking to: "{selection}"</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,.7)", fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {!uploadFile ? (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleSelectFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? WP.blue : WP.line}`,
              margin: "14px 18px 0", borderRadius: 3, padding: "18px 20px",
              textAlign: "center", cursor: "pointer",
              background: isDragging ? WP.blueBg : WP.offWhite,
            }}>
            <FaCloudUploadAlt size={32} style={{ color: isDragging ? WP.blue : WP.textLight, marginBottom: 6 }} />
            <p style={{ margin: 0, fontSize: 13, color: isDragging ? WP.blue : WP.textMid, fontWeight: 600 }}>
              {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 11, color: WP.textLight }}>Images, PDFs, Documents, Spreadsheets</p>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={e => handleSelectFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ margin: "14px 18px 0", background: WP.offWhite, border: `1px solid ${WP.line}`, borderRadius: 3, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ width: 44, height: 44, borderRadius: 3, background: WP.line, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {uploadPreview ? <img src={uploadPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getFileIcon(uploadFile.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: WP.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadFile.name}</div>
                <div style={{ fontSize: 11, color: WP.textLight }}>{fmtSize(uploadFile.size)}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleUpload} disabled={uploading} style={{ ...btnSt, background: WP.blue, borderColor: WP.blue, color: WP.white, opacity: uploading ? .7 : 1 }}>
                  <FaUpload size={10} /> {uploading ? "Uploading…" : "Upload"}
                </button>
                <button onClick={resetUpload} disabled={uploading} style={{ ...btnSt, background: WP.white, borderColor: WP.border, color: WP.textMid }}>
                  <FaTimes size={10} />
                </button>
              </div>
            </div>
            {uploading && (
              <div style={{ marginTop: 8 }}>
                <Progress value={uploadProgress} style={{ height: 3 }} />
                <div style={{ fontSize: 10, textAlign: "right", color: WP.textMid, marginTop: 2 }}>{uploadProgress}%</div>
              </div>
            )}
          </div>
        )}

        <div style={{ margin: "12px 18px 0", borderTop: `1px solid ${WP.line}` }} />

        <div style={{ padding: "8px 18px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <input
            ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by filename…"
            style={{ border: `1px solid ${WP.border}`, borderRadius: 3, padding: "5px 8px", fontSize: 13, fontFamily: FF, outline: "none", flex: 1, minWidth: 160, color: WP.text }}
            onFocus={e => { e.target.style.borderColor = WP.blue; e.target.style.boxShadow = `0 0 0 1px ${WP.blue}`; }}
            onBlur={e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; }}
          />
          {/* ✅ FIXED: use linkText state, not selText */}
          <input
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Enter Link Text..."
            style={{
              border: `1px solid ${WP.border}`,
              borderRadius: 3,
              padding: "5px 8px",
              fontSize: 13,
              minWidth: 180,
              fontFamily: FF,
              color: WP.text,
            }}
          />
          <div style={{ display: "flex", gap: 4 }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{ ...btnSt, background: filter === f.key ? WP.blue : WP.white, borderColor: filter === f.key ? WP.blue : WP.border, color: filter === f.key ? WP.white : WP.textMid, fontWeight: filter === f.key ? 600 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 6, padding: "0 18px 14px", maxHeight: 280, overflowY: "auto" }}>
          {loading && <div style={{ gridColumn: "1/-1", padding: "30px 0", textAlign: "center", color: WP.textLight, fontSize: 13 }}>Loading…</div>}
          {!loading && error && <div style={{ gridColumn: "1/-1", padding: "20px 0", textAlign: "center", color: WP.red, fontSize: 13 }}>{error}</div>}
          {!loading && !error && filtered.length === 0 && <div style={{ gridColumn: "1/-1", padding: "20px 0", textAlign: "center", color: WP.textLight, fontSize: 13 }}>No files found</div>}
          {!loading && !error && filtered.map(file => {
            const isSel = selected?._id === file._id;
            const isImg = file.mimeType?.startsWith("image/");
            return (
              <div key={file._id} onClick={() => setSelected(p => p?._id === file._id ? null : file)}
                style={{ border: `${isSel ? "2px" : "1px"} solid ${isSel ? WP.blue : WP.line}`, borderRadius: 3, padding: "8px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: isSel ? WP.blueBg : WP.white, position: "relative" }}>
                {isSel && (
                  <div style={{ position: "absolute", top: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: WP.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: WP.white, fontSize: 9, lineHeight: 1 }}>✓</span>
                  </div>
                )}
                <div style={{ width: 50, height: 50, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 2, background: "#f6f7f7" }}>
                  {isImg
                    ? <img src={`${API_URL}${file.filePath}`} alt={file.originalName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    : getFileIcon(file.mimeType)}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: WP.text, textAlign: "center", wordBreak: "break-word", width: "100%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>{file.originalName}</span>
                <span style={{ fontSize: 10, color: WP.textLight }}>{fmtSize(file.fileSize)}</span>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "8px 18px", borderTop: `1px solid ${WP.line}`, background: WP.offWhite, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12, color: WP.textMid }}>
            {selected
              ? <><strong style={{ color: WP.text }}>{selected.originalName}</strong> · {fmtSize(selected.fileSize)}</>
              : `${filtered.length} file${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onClose} style={{ border: `1px solid ${WP.border}`, background: WP.white, borderRadius: 3, padding: "5px 12px", fontSize: 13, cursor: "pointer", color: WP.textMid, fontFamily: FF }}>Cancel</button>
            <button
              disabled={!selected || !linkText.trim()}
              onClick={() => {
                if (!selected || !linkText.trim()) return;
                onAttach({
                  _id: selected._id,
                  url: selected.filePath,
                  title: selected.originalName,
                  category: getFileCategory(selected.mimeType),
                  mimeType: selected.mimeType,
                  fileSize: selected.fileSize,
                  linkText: linkText,      // pass the final link text
                });
              }}
              style={{ border: "none", background: (selected && linkText.trim()) ? WP.blue : WP.line, borderRadius: 3, padding: "5px 14px", fontSize: 13, cursor: (selected && linkText.trim()) ? "pointer" : "default", color: (selected && linkText.trim()) ? WP.white : WP.textLight, fontFamily: FF, fontWeight: 600 }}>
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Word / Char counter ── */
function ContentStats({ html }) {
  const stats = useMemo(() => {
    const text = html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
    const words = text ? text.split(/\s+/).length : 0;
    return { words, chars: text.length, read: Math.max(1, Math.ceil(words / 200)) };
  }, [html]);
  return (
    <div style={{ display: "flex", gap: 14, fontSize: 12, color: WP.textMid }}>
      <span><strong style={{ color: WP.text }}>{stats.words.toLocaleString()}</strong> words</span>
      <span><strong style={{ color: WP.text }}>{stats.chars.toLocaleString()}</strong> chars</span>
      <span>~<strong style={{ color: WP.text }}>{stats.read}</strong> min read</span>
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 10000, background: type === "success" ? WP.green : WP.amber, color: WP.white, padding: "9px 16px", borderRadius: 3, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,.2)", fontFamily: FF }}>
      {type === "success" ? "✓" : "⚠"} {msg}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EDITOR – NO RE‑RENDER ON KEYSTROKE (FIXED)
══════════════════════════════════════════════════════════ */
const DynamicContentEditor = ({
  contents,
  setContents,
  viewMode = false,
  engField = "descriptionEn",
  hinField = "descriptionHi",
  htmlContentEng,
  htmlContentHin,
  activeTab: controlledTab,
  height = 460,
}) => {
  const ENG = htmlContentEng || engField;
  const HIN = htmlContentHin || hinField;

  const [showModal, setShowModal] = useState(false);
  const [selText, setSelText] = useState("");
  const [toast, setToast] = useState(null);
  const [noSelWarn, setNoSelWarn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState(controlledTab || "en");
  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

  // Ensure contents array exists
  useEffect(() => {
    if (!contents || contents.length === 0) {
      setContents([{ id: Date.now(), [ENG]: "", [HIN]: "" }]);
    }
  }, [contents, setContents, ENG, HIN]);

  const item = contents?.[0];
  const currentField = activeTab === "en" ? ENG : HIN;
  const externalValue = item?.[currentField] || "";

  const updateContent = useCallback((id, updates) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setContents]);

  // Sync editor when external value changes (tab switch, loading a page)
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.value !== externalValue) {
      editor.value = externalValue;
    }
  }, [externalValue]);

  // Stable Jodit config – NO `value` prop, NO `change` event that causes re‑renders
  const joditConfig = useMemo(() => ({
    height: isFullscreen ? "calc(100vh - 180px)" : height,
    readonly: false,
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_as_html",
    spellcheck: true,
    cleanHTML: { removeEmptyElements: false, fillEmptyParagraph: false },
    uploader: {
      insertImageAsBase64URI: true,
      imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
      withCredentials: false,
    },
    filebrowser: { ajax: { url: "" } },
    link: { followOnDblClick: false, openInNewTabCheckbox: true },
    buttons: [
      "bold", "italic", "underline", "strikethrough", "|",
      "superscript", "subscript", "|",
      "eraser", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "align", "|",
      "table", "link", "image", "video", "|",
      "hr", "|",
      "undo", "redo", "|",
      "copyformat", "|",
      "find", "|",
      "fullsize", "source",
    ],
    commandToHotkeys: {
      bold: ["ctrl+b", "cmd+b"],
      italic: ["ctrl+i", "cmd+i"],
      underline: ["ctrl+u", "cmd+u"],
      undo: ["ctrl+z", "cmd+z"],
      redo: ["ctrl+y", "cmd+y", "ctrl+shift+z", "cmd+shift+z"],
      selectAll: ["ctrl+a", "cmd+a"],
      link: ["ctrl+k", "cmd+k"],
    },
    style: {
      fontFamily: "Georgia,'Times New Roman',serif",
      fontSize: "15px",
    },
    events: {
      afterInit(editor) {
        editorRef.current = editor;
      },
      mouseup(editor) {
        const txt = editor.selection?.text?.() || "";
        if (txt.trim()) {
          setSelText(txt);
          setNoSelWarn(false);
        }
      },
      keyup(editor) {
        const txt = editor.selection?.text?.() || "";
        if (txt.trim()) {
          setSelText(txt);
          setNoSelWarn(false);
        }
      }
    },
  }), [isFullscreen, height]);

  // Save content to parent state on blur (when user leaves the editor)
  const handleBlur = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !item) return;
    const newContent = editor.value;
    const field = activeTabRef.current === "en" ? ENG : HIN;
    if (newContent !== item[field]) {
      updateContent(item.id, { [field]: newContent });
    }
  }, [item, updateContent, ENG, HIN]);

  // Attach file link handler
const handleAttachClick = useCallback(() => {
  const editor = editorRef.current;
  if (!editor) return;

  // Try to get selected text using Jodit's API
  let selectedText = editor.selection?.text?.() || "";

  // Fallback: use window.getSelection() if Jodit returns empty
  if (!selectedText.trim()) {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      selectedText = sel.toString();
    }
  }

  if (!selectedText.trim()) {
    setNoSelWarn(true);
    setTimeout(() => setNoSelWarn(false), 3000);
    return;
  }

  // Save the selection range BEFORE any focus change
  try {
    savedSelectionRef.current = editor.selection.save();
  } catch (e) {
    savedSelectionRef.current = null;
  }

  setSelText(selectedText);
  setShowModal(true);
}, []);

  // ✅ FIXED: use file.linkText (the final text from modal) instead of selText
  const handleAttach = useCallback((file) => {
    const editor = editorRef.current;
    if (!editor) {
      setToast({ msg: "Editor not ready", type: "warn" });
      setShowModal(false);
      return;
    }

    // Restore the saved selection (where the user had highlighted text)
    if (savedSelectionRef.current) {
      editor.selection.restore(savedSelectionRef.current);
      editor.selection.focus();
    } else {
      try { editor.selection.focus(); } catch (e) { /* ignore */ }
    }

    const url = `${API_URL}${file.url}`;
    // Use the link text provided by the modal (user may have edited it)
    const textToUse = file.linkText?.trim() || file.title;

    const linkHtml = `<a
  href="${url}"
  target="_blank"
  rel="noopener noreferrer"
  data-file-id="${file._id}"
  data-category="${file.category}"
>${textToUse}</a>`;

    editor.selection.insertHTML(linkHtml);
    handleBlur(); // save the change

    setToast({ msg: `"${file.title}" linked ✓`, type: "success" });
    setShowModal(false);
    setSelText("");
    savedSelectionRef.current = null;
  }, [handleBlur]);

  if (!item) return null;

  // View mode (read‑only)
  if (viewMode) {
    return (
      <div style={{ fontFamily: "Georgia,serif", lineHeight: 1.8, fontSize: 15, color: WP.text }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {["en", "hi"].map(lang => (
            <button key={lang} onClick={() => setActiveTab(lang)} style={{ padding: "4px 12px", borderRadius: 3, border: `1px solid ${activeTab === lang ? WP.blue : WP.border}`, background: activeTab === lang ? WP.blue : WP.white, color: activeTab === lang ? WP.white : WP.textMid, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: FF }}>
              {lang === "en" ? "English" : "हिंदी"}
            </button>
          ))}
        </div>
        <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, padding: "24px 32px" }}>
          <div className="cms-view" dangerouslySetInnerHTML={{ __html: externalValue || "<p style='color:#787c82'>No content yet.</p>" }} />
        </div>
        <ViewStyles />
      </div>
    );
  }

  // Edit mode
  return (
    <div style={{
      fontFamily: FF,
      ...(isFullscreen ? {
        position: "fixed", inset: 0, zIndex: 9000,
        background: WP.bg, padding: 16, overflowY: "auto",
      } : {}),
    }}>
      <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ background: WP.black, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {[{ key: "en", label: "English" }, { key: "hi", label: "हिंदी (Hindi)" }].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "4px 12px", borderRadius: 3,
                  border: `1px solid ${activeTab === tab.key ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)"}`,
                  background: activeTab === tab.key ? "rgba(255,255,255,.15)" : "transparent",
                  color: activeTab === tab.key ? WP.white : "rgba(255,255,255,.6)",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: 12, cursor: "pointer", fontFamily: FF,
                }}>
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={handleAttachClick}
              title="Select text in editor first, then click this"
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 3, background: WP.blue, border: `1px solid ${WP.blue}`, color: WP.white, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>
              <FaLink size={10} /> Attach File Link
            </button>
            <button
              onClick={() => setIsFullscreen(f => !f)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 3, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: WP.white, fontSize: 13, cursor: "pointer" }}>
              {isFullscreen ? <FaCompress size={11} /> : <FaExpand size={11} />}
            </button>
          </div>
        </div>

        {noSelWarn && (
          <div style={{ background: WP.amberBg, borderBottom: `1px solid ${WP.amberBd}`, padding: "7px 14px", fontSize: 12, color: WP.amber, fontWeight: 600 }}>
            ⚠ Highlight text in the editor first, then click "Attach File Link".
          </div>
        )}

        <div style={{ background: WP.offWhite, borderBottom: `1px solid ${WP.line}`, padding: "5px 14px", fontSize: 12, color: WP.textMid }}>
          <strong>Shortcuts:</strong>{" "}
          <kbd style={kbdSt}>Ctrl+B</kbd> Bold &nbsp;
          <kbd style={kbdSt}>Ctrl+I</kbd> Italic &nbsp;
          <kbd style={kbdSt}>Ctrl+U</kbd> Underline &nbsp;
          <kbd style={kbdSt}>Ctrl+Z</kbd> Undo &nbsp;
          <kbd style={kbdSt}>Ctrl+K</kbd> Link &nbsp;
          <kbd style={kbdSt}>Ctrl+A</kbd> Select All
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Select text → <strong>Attach File Link</strong> to insert a file link.
        </div>

        {/* JoditEditor – NO `value` prop, only onBlur sync */}
        <div style={{ background: WP.white }}>
          <JoditEditor
            config={joditConfig}
            onBlur={handleBlur}
          />
        </div>

        <div style={{ background: WP.offWhite, borderTop: `1px solid ${WP.line}`, padding: "6px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <ContentStats html={externalValue} />
          <span style={{ fontSize: 11, color: WP.textLight }}>
            {activeTab === "en" ? "🇬🇧 English content" : "🇮🇳 Hindi content"}
          </span>
        </div>
      </div>

      {showModal && (
        <AttachModal
          selection={selText}
          onAttach={handleAttach}
          onClose={() => { setShowModal(false); setSelText(""); setNoSelWarn(false); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <EditorStyles />
    </div>
  );
};

/* ── Styles ── */
const kbdSt = {
  display: "inline-block",
  background: "#2b1f1f",
  border: "1px solid #c3c4c7",
  borderRadius: 3,
  padding: "0 4px",
  fontSize: 10,
  fontFamily: "monospace",
  lineHeight: "1.6",
};

function EditorStyles() {
  return (
    <style>{`
      .jodit-toolbar__box { background: ${WP.offWhite} !important; border-bottom: 1px solid ${WP.line} !important; padding: 2px 6px !important; }
      .jodit-toolbar-button__button { border-radius: 3px !important; }
      .jodit-toolbar-button__button:hover { background: ${WP.blueBg} !important; color: ${WP.blue} !important; }
      .jodit-wysiwyg { font-family: Georgia, 'Times New Roman', serif !important; font-size: 15px !important; line-height: 1.8 !important; color: ${WP.text} !important; padding: 20px 24px !important; min-height: 380px !important; }
      .jodit-wysiwyg h1 { font-size: 26px; font-weight: 700; color: ${WP.black}; margin: 20px 0 10px; }
      .jodit-wysiwyg h2 { font-size: 20px; font-weight: 700; color: ${WP.black}; margin: 18px 0 8px; }
      .jodit-wysiwyg h3 { font-size: 16px; font-weight: 700; color: ${WP.textMid}; margin: 14px 0 6px; }
      .jodit-wysiwyg p { margin: 0 0 12px; }
      .jodit-wysiwyg a { color: ${WP.blue}; text-decoration: underline; }
      .jodit-wysiwyg a:hover { color: ${WP.blueHov}; }
      .jodit-wysiwyg blockquote { border-left: 4px solid ${WP.blue}; margin: 16px 0; padding: 8px 16px; background: ${WP.blueBg}; border-radius: 0 3px 3px 0; color: ${WP.textMid}; font-style: italic; }
      .jodit-wysiwyg table { border-collapse: collapse; width: 100%; margin: 12px 0; }
      .jodit-wysiwyg td, .jodit-wysiwyg th { border: 1px solid ${WP.line}; padding: 7px 10px; font-size: 13px; }
      .jodit-wysiwyg th { background: ${WP.offWhite}; font-weight: 700; color: ${WP.textMid}; }
      .jodit-wysiwyg ul, .jodit-wysiwyg ol { padding-left: 22px; margin: 0 0 12px; }
      .jodit-wysiwyg li { margin-bottom: 3px; }
      .jodit-wysiwyg code { background: ${WP.offWhite}; color: ${WP.red}; padding: 1px 5px; border-radius: 3px; font-size: .88em; font-family: 'Courier New', monospace; border: 1px solid ${WP.line}; }
      .jodit-wysiwyg pre { background: ${WP.black}; color: #a8ffd8; padding: 14px 18px; border-radius: 3px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; }
      .jodit-wysiwyg img { max-width: 100%; border-radius: 3px; }
      .jodit-wysiwyg hr { border: none; border-top: 1px solid ${WP.line}; margin: 20px 0; }
      .jodit-status-bar { display: none !important; }
      .jodit-wysiwyg ::selection { background: rgba(34,113,177,.25); }
    `}</style>
  );
}

function ViewStyles() {
  return (
    <style>{`
      .cms-view { font-family: Georgia, serif; font-size: 15px; line-height: 1.8; color: ${WP.text}; }
      .cms-view h1 { font-size: 26px; font-weight: 700; }
      .cms-view h2 { font-size: 20px; font-weight: 700; }
      .cms-view h3 { font-size: 16px; font-weight: 700; }
      .cms-view a { color: ${WP.blue}; }
      .cms-view blockquote { border-left: 4px solid ${WP.blue}; padding: 8px 16px; background: ${WP.blueBg}; border-radius: 0 3px 3px 0; color: ${WP.textMid}; font-style: italic; margin: 16px 0; }
      .cms-view table { border-collapse: collapse; width: 100%; }
      .cms-view td, .cms-view th { border: 1px solid ${WP.line}; padding: 7px 10px; }
      .cms-view th { background: ${WP.offWhite}; font-weight: 700; }
      .cms-view img { max-width: 100%; border-radius: 3px; }
      .cms-view pre { background: ${WP.black}; color: #a8ffd8; padding: 14px; border-radius: 3px; overflow-x: auto; }
      .cms-view code { background: ${WP.offWhite}; color: ${WP.red}; padding: 1px 5px; border-radius: 3px; font-size: .88em; }
    `}</style>
  );
}

export default DynamicContentEditor;