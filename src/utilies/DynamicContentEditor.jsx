// DynamicContentEditor.jsx — Rich Text CMS Editor with File Library Attach
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";


/* ─── Design Tokens ──────────────────────────────────────── */
const T = {
  ink:          "#0f1e1d",
  inkMid:       "#2d4a48",
  inkLight:     "#6b8a87",
  forest:       "#0e3d3b",
  forestMid:    "#155a56",
  forestBright: "#1a7a74",
  mint:         "#c8e8e5",
  mintDark:     "#6bbfb8",
  sage:         "#eaf5f4",
  sageDark:     "#d4ecea",
  line:         "#ddecea",
  white:        "#ffffff",
  offWhite:     "#f6faf9",
  amber:        "#f59e0b",
  amberBg:      "#fffbeb",
  amberBd:      "#fcd34d",
  danger:       "#dc2626",
  dangerBg:     "#fff1f2",
  dangerBd:     "#fca5a5",
};

/* ─── File Utility Helpers ───────────────────────────────── */


const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");



const getFileExt = (mimeType, originalName) => {
  if (mimeType.startsWith("image/"))          return originalName.split(".").pop().toLowerCase();
  if (mimeType === "application/pdf")          return "pdf";
  if (mimeType.includes("wordprocessingml"))   return "docx";
  if (mimeType.includes("spreadsheetml"))      return "xlsx";
  if (mimeType.includes("presentationml"))     return "pptx";
  return originalName.split(".").pop().toLowerCase() || "file";
};

const getFileCategory = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  return "doc";
};

const getFileIconInfo = (mimeType) => {
  if (mimeType.startsWith("image/"))         return { emoji: "🖼️", bg: "#e0f2fe", fg: "#0369a1" };
  if (mimeType === "application/pdf")         return { emoji: "📄", bg: "#fee2e2", fg: "#b91c1c" };
  if (mimeType.includes("wordprocessingml")) return { emoji: "📝", bg: "#dbeafe", fg: "#1d4ed8" };
  if (mimeType.includes("spreadsheetml"))    return { emoji: "📊", bg: "#dcfce7", fg: "#15803d" };
  if (mimeType.includes("presentationml"))   return { emoji: "📋", bg: "#fff7ed", fg: "#c2410c" };
  return { emoji: "📁", bg: T.sage, fg: T.inkMid };
};

const fmtSize = (bytes) => {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
  if (bytes >= 1024)    return Math.round(bytes / 1024) + " KB";
  return bytes + " B";
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

/* ─── Filter Config ──────────────────────────────────────── */
const FILTERS = [
  { key: "all",   label: "All",    emoji: "⊞" },
  { key: "image", label: "Images", emoji: "🖼️" },
  { key: "pdf",   label: "PDF",    emoji: "📄" },
  { key: "doc",   label: "Docs",   emoji: "📝" },
];

/* ─── File Library Attach Modal ──────────────────────────── */
function AttachModal({ selection, onAttach, onClose }) {
  const [files, setFiles]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [query, setQuery]       = useState("");
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState(null);
  const searchRef               = useRef(null);

  useEffect(() => {
  searchRef.current?.focus();

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/api/files/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFiles(Array.isArray(res.data.data) ? res.data.data : res.data.data.files || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchFiles();
}, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return files.filter((f) => {
      const matchFilter = filter === "all" || getFileCategory(f.mimeType) === filter;
      const matchQuery  = !q || f.originalName.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [files, query, filter]);

  const handleSelect = (file) => {
    setSelected((prev) => (prev?._id === file._id ? null : file));
  };

  const handleAttach = () => {
    if (!selected) return;
    onAttach({
      _id:      selected._id,
      url:      selected.filePath,
      title:    selected.originalName,
      category: getFileCategory(selected.mimeType),
      mimeType: selected.mimeType,
      fileSize: selected.fileSize,
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9990,
          background: "rgba(10,25,24,0.6)",
          backdropFilter: "blur(4px)",
          animation: "bdFade .18s ease forwards",
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
      // className="bg-danger"
      

        aria-modal="true"
        aria-label="Attach file from library"
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 9991, width: "min(950px, 95vw)",
          background: T.white, borderRadius: 20,
          boxShadow: "0 32px 80px rgba(10,35,34,.25), 0 2px 8px rgba(0,0,0,.06)",
          overflow: "hidden",
          animation: "panelIn .22s cubic-bezier(.22,1,.36,1) forwards",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            background: `linear-gradient(135deg,${T.forest},${T.forestMid})`,
            padding: "18px 22px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 17 }}>🔗</span>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
                  Attach from Library
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.5)" }}>
                Select a file to link to your highlighted text
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: "rgba(255,255,255,.12)", border: "none", color: "#fff",
                borderRadius: 8, width: 30, height: 30, fontSize: 18,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Selected text chip */}
          {selection && (
            <div
              style={{
                marginTop: 12, padding: "7px 12px", borderRadius: 9,
                background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.18)",
                display: "flex", alignItems: "center", gap: 7,
              }}
            >
              <span
                style={{
                  fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)",
                  textTransform: "uppercase", letterSpacing: ".07em", flexShrink: 0,
                }}
              >
                Selected text:
              </span>
              <span
                style={{
                  fontSize: 13, color: "#fff", fontWeight: 600,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}
              >
                "{selection}"
              </span>
            </div>
          )}
        </div>

        {/* ── Toolbar ── */}
        <div
          style={{
            padding: "10px 14px", borderBottom: `1px solid ${T.line}`,
            background: T.offWhite, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: 160 }}>
            <span
              style={{
                position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)",
                fontSize: 14, color: T.inkLight, pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files by name…"
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "7px 12px 7px 30px", borderRadius: 8,
                border: `1.5px solid ${T.line}`, fontSize: 12,
                background: T.white, color: T.ink, outline: "none",
                fontFamily: "inherit", transition: "border-color .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = T.mintDark)}
              onBlur={(e)  => (e.target.style.borderColor = T.line)}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  fontFamily: "inherit",
                  border: `1.5px solid ${filter === f.key ? T.forestBright : T.line}`,
                  background: filter === f.key ? T.sage : T.white,
                  color: filter === f.key ? T.forest : T.inkLight,
                  transition: "all .12s",
                }}
              >
                <span>{f.emoji}</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── File Grid ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(118px, 1fr))",
            gap: 8, padding: 12, maxHeight: 300, overflowY: "auto",
          }}
        >
          {/* Loading */}
          {loading && (
            <div style={{ gridColumn: "1/-1", padding: "44px 0", textAlign: "center", color: T.inkLight }}>
              <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>⏳</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Loading files…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ gridColumn: "1/-1", padding: "44px 0", textAlign: "center", color: T.danger }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{error}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: T.inkLight }}>
                Check your API connection
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", padding: "44px 0", textAlign: "center", color: T.inkLight }}>
              <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>No files found</p>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>Try a different search or filter</p>
            </div>
          )}

          {/* File cards */}
          {!loading &&
            !error &&
            filtered.map((file) => {
              const isSel  = selected?._id === file._id;
              const ext    = getFileExt(file.mimeType, file.originalName);
              const { emoji, bg, fg } = getFileIconInfo(file.mimeType);
              const isImage = file.mimeType.startsWith("image/");

              return (
                <div
                  key={file._id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSel}
                  aria-label={file.originalName}
                  onClick={() => handleSelect(file)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(file);
                    }
                  }}
                  title={file.originalName}
                  style={{
                    border: `${isSel ? "1.5px" : "0.5px"} solid ${isSel ? T.forestBright : T.line}`,
                    borderRadius: 10, padding: "12px 10px 10px",
                    cursor: "pointer", display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 5, position: "relative",
                    background: isSel ? T.sage : T.white,
                    transition: "border-color .12s, background .12s",
                  }}
                >
                  {/* Check mark */}
                  {isSel && (
                    <div
                      style={{
                        position: "absolute", top: 6, left: 6,
                        width: 16, height: 16, borderRadius: "50%",
                        background: T.forest, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#fff",
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Ext badge */}
                  <div
                    style={{
                      position: "absolute", top: 6, right: 6,
                      fontSize: 9, fontWeight: 700, padding: "2px 5px",
                      borderRadius: 4, background: bg, color: fg,
                      textTransform: "uppercase", letterSpacing: ".04em",
                    }}
                  >
                    {ext}
                  </div>

                  {/* Thumbnail / icon */}
                  <div
                    style={{
                      width: 52, height: 52, borderRadius: 8, background: bg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      overflow: "hidden", flexShrink: 0,
                    }}
                  >
                    {isImage ? (
                      <img
                        src={`${API_URL}${file.filePath}`}
                        alt={file.originalName}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.innerHTML = `<span style="font-size:24px">${emoji}</span>`;
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>{emoji}</span>
                    )}
                  </div>

                  {/* File name — 2-line clamp */}
                  <span
                    style={{
                      fontSize: 11, fontWeight: 600, textAlign: "center",
                      color: T.ink, lineHeight: 1.3, wordBreak: "break-word",
                      width: "100%", display: "-webkit-box",
                      WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                  >
                    {file.originalName}
                  </span>

                  {/* Size */}
                  <span style={{ fontSize: 10, color: T.inkLight, textAlign: "center" }}>
                    {fmtSize(file.fileSize)}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 10, color: T.inkLight, textAlign: "center" }}>
                    {fmtDate(file.createdAt)}
                  </span>
                </div>
              );
            })}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "10px 16px", borderTop: `1px solid ${T.line}`,
            background: T.offWhite, display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: T.inkLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selected ? (
              <>
                <strong style={{ color: T.ink, fontWeight: 700 }}>{selected.originalName}</strong>
                {" · "}{fmtSize(selected.fileSize)}
              </>
            ) : (
              `${filtered.length} file${filtered.length !== 1 ? "s" : ""}`
            )}
          </span>

          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: "7px 14px", borderRadius: 7, border: `1.5px solid ${T.line}`,
                background: T.white, color: T.inkMid, fontSize: 12,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              disabled={!selected}
              onClick={handleAttach}
              style={{
                padding: "7px 18px", borderRadius: 7, border: "none",
                fontSize: 12, fontWeight: 700, cursor: selected ? "pointer" : "default",
                background: selected ? T.forest : T.line,
                color: selected ? "#fff" : T.inkLight,
                transition: "background .12s", fontFamily: "inherit",
              }}
            >
              Attach link
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bdFade  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes panelIn {
          from { opacity: 0; transform: translate(-50%, -47%) }
          to   { opacity: 1; transform: translate(-50%, -50%) }
        }
      `}</style>
    </>
  );
}

/* ─── Toast ──────────────────────────────────────────────── */
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  const bg =
    type === "success"
      ? `linear-gradient(135deg,${T.forest},${T.forestBright})`
      : `linear-gradient(135deg,#92400e,#d97706)`;

  return (
    <div
      style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 10000,
        background: bg, color: "#fff", padding: "11px 18px",
        borderRadius: 12, fontSize: 13, fontWeight: 600,
        boxShadow: "0 8px 28px rgba(14,61,59,.28)",
        display: "flex", alignItems: "center", gap: 8,
        animation: "toastIn .2s cubic-bezier(.22,1,.36,1) forwards",
      }}
    >
      <span>{type === "success" ? "✅" : "⚠️"}</span>
      {msg}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}

/* ─── Word / Char Counter ────────────────────────────────── */
function ContentStats({ html }) {
  const stats = useMemo(() => {
    const text  = html?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const read  = Math.max(1, Math.ceil(words / 200));
    return { words, chars, read };
  }, [html]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: T.inkLight, fontWeight: 600 }}>
      {[
        { label: "Words", val: stats.words.toLocaleString() },
        { label: "Chars", val: stats.chars.toLocaleString() },
        { label: "~Read", val: `${stats.read} min` },
      ].map((s) => (
        <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontWeight: 800, color: T.forestMid, fontSize: 13 }}>{s.val}</span>
          <span style={{ textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</span>
        </span>
      ))}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const DynamicContentEditor = ({ contents, setContents, viewMode = false }) => {
  const [showModal, setShowModal]           = useState(false);
  const [selectionText, setSelectionText]   = useState("");
  const [selectionRange, setSelectionRange] = useState(null);
  const [toast, setToast]                   = useState(null);
  const [noSelWarn, setNoSelWarn]           = useState(false);
  const [isFullscreen, setIsFullscreen]     = useState(false);
  const editorContainerRef                  = useRef(null);

  useEffect(() => {
    if (!contents || contents.length === 0) {
      setContents([{ id: Date.now(), fileType: "RICH_TEXT", richTextContent: "" }]);
    }
  }, []);

  const item = contents?.[0];

  const updateContent = useCallback(
    (id, updates) => {
      setContents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    },
    [setContents]
  );

  /* ── Attach click: capture selection ── */
  const handleAttachClick = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setNoSelWarn(true);
      setTimeout(() => setNoSelWarn(false), 2800);
      return;
    }
    const range = sel.getRangeAt(0);
    const text  = sel.toString().trim().slice(0, 80);
    setSelectionText(text);
    setSelectionRange(range.cloneRange());
    setShowModal(true);
  }, []);

  /* ── On file selected from modal: wrap selection in <a> ── */
  const handleAttach = useCallback(
    (file) => {
      if (!selectionRange) return;

      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(selectionRange);

      const range = sel.getRangeAt(0);
      if (range.collapsed) {
        setToast({ msg: "Selection lost — please re-select and try again", type: "warn" });
        setShowModal(false);
        return;
      }

      // Build <a> element
      const a       = document.createElement("a");
      a.href        = `${API_URL}${file.url}`;
      a.target      = "_blank";
      a.rel         = "noopener noreferrer";
      a.title       = file.title;
      a.setAttribute("data-file-id", file._id);
      a.setAttribute("data-category", file.category);

      try {
        range.surroundContents(a);
      } catch {
        const contents = range.extractContents();
        a.appendChild(contents);
        range.insertNode(a);
      }

      sel.removeAllRanges();

      // Sync Jodit's internal model
      const editorEl = editorContainerRef.current?.querySelector(".jodit-wysiwyg");
      if (editorEl && item) {
        updateContent(item.id, { richTextContent: editorEl.innerHTML });
      }

      setToast({ msg: `"${file.title}" linked successfully`, type: "success" });
      setShowModal(false);
      setSelectionText("");
      setSelectionRange(null);
    },
    [selectionRange, item, updateContent]
  );

  /* ── Jodit config — memoized so editor never remounts ── */
  const joditConfig = useMemo(
    () => ({
      height: 520,
      readonly: false,
      toolbarAdaptive: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_as_html",
      cleanHTML: {
        removeEmptyElements: false,
        fillEmptyParagraph: false,
      },
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
        withCredentials: false,
      },
      filebrowser: { ajax: { url: "" } },
      link: {
        followOnDblClick: false,
        openInNewTabCheckbox: true,
        noFollowCheckbox: true,
      },
      table: {
        allowCellResize: true,
        allowCellSelection: true,
      },
      image: {
        openOnDblClick: false,
        editSrc: false,
        useImageEditor: false,
      },
      style: {
        font: "15px/1.8 'Georgia', serif",
      },
      buttons: [
        "bold", "italic", "underline", "strikethrough",
        "|",
        "font", "fontsize", "brush", "paragraph",
        "|",
        "align",
        "|",
        "ul", "ol", "indent", "outdent",
        "|",
        "link", "image",
        "|",
        "table", "hr",
        "|",
        "superscript", "subscript",
        "|",
        "undo", "redo",
        "|",
        "eraser", "copyformat",
        "|",
        "source",
      ],
    }),
    []
  );

  if (!item) return null;

  /* ─── View Mode ──────────────────────────────────────── */
  if (viewMode) {
    return (
      <div style={{ fontFamily: "'Georgia', serif", lineHeight: 1.8, fontSize: 15, color: T.ink }}>
        <div
          style={{
            background: T.white, borderRadius: 14, border: `1px solid ${T.line}`,
            padding: "32px 40px", boxShadow: "0 2px 16px rgba(14,61,59,.06)",
          }}
        >
          <div
            className="cms-view"
            dangerouslySetInnerHTML={{
              __html: item.richTextContent || "<p style='color:#9ca3af'>No content yet.</p>",
            }}
          />
        </div>
        <ViewStyles />
      </div>
    );
  }

  /* ─── Edit Mode ──────────────────────────────────────── */
  return (
    <div
      ref={editorContainerRef}
      style={{
        fontFamily: "inherit",
        ...(isFullscreen
          ? {
              position: "fixed", inset: 0, zIndex: 9000,
              background: T.offWhite, padding: 24, overflowY: "auto",
            }
          : {}),
      }}
    >
      {/* ── Editor card ── */}
      <div
        style={{
          background: T.white, borderRadius: 16,
          border: `1.5px solid ${T.line}`,
          boxShadow: "0 4px 24px rgba(14,61,59,.08)",
          overflow: "hidden",
        }}
      >
        {/* ── Header toolbar ── */}
        <div
          style={{
            background: `linear-gradient(135deg,${T.forest},${T.forestMid})`,
            padding: "13px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 10,
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}
            >
              ✍️
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>
                Rich Text Editor
              </p>
              <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.5)" }}>
                Format · Link · Embed · Publish
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Attach Link */}
            <button
              onClick={handleAttachClick}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 9,
                background: "rgba(255,255,255,.14)",
                border: "1.5px solid rgba(255,255,255,.28)",
                color: "#fff", fontSize: 12, fontWeight: 700,
                cursor: "pointer", transition: "background .15s",
                letterSpacing: ".01em", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.24)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
            >
              <span style={{ fontSize: 14 }}>🔗</span>
              Attach File Link
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen((f) => !f)}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "rgba(255,255,255,.1)",
                border: "1.5px solid rgba(255,255,255,.2)",
                color: "#fff", fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .15s", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.1)")}
            >
              {isFullscreen ? "⊠" : "⛶"}
            </button>
          </div>
        </div>

        {/* ── No-selection warning ── */}
        {noSelWarn && (
          <div
            style={{
              background: T.amberBg, borderBottom: `1.5px solid ${T.amberBd}`,
              padding: "9px 20px", display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, color: "#92400e", fontWeight: 600,
              animation: "warnSlide .18s ease forwards",
            }}
          >
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span>
              <strong>Highlight text</strong> in the editor first, then click{" "}
              <strong>🔗 Attach File Link</strong>.
            </span>
          </div>
        )}

        {/* ── Usage tip ── */}
        <div
          style={{
            background: T.sage, borderBottom: `1px solid ${T.line}`,
            padding: "8px 20px", display: "flex", alignItems: "center", gap: 8,
            fontSize: 12, color: T.inkMid,
          }}
        >
          <span style={{ fontSize: 13 }}>💡</span>
          <span>
            <strong>Select text</strong> in the editor → click{" "}
            <strong>🔗 Attach File Link</strong> → choose a file from your library.
          </span>
        </div>

        {/* ── Jodit editor ── */}
        <div style={{ background: T.white }}>
          <JoditEditor
            value={item.richTextContent || ""}
            config={joditConfig}
            onBlur={(content) => updateContent(item.id, { richTextContent: content })}
          />
        </div>

        {/* ── Status bar ── */}
        <div
          style={{
            background: T.offWhite, borderTop: `1px solid ${T.line}`,
            padding: "9px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 8,
          }}
        >
          <ContentStats html={item.richTextContent} />

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Saved indicator */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 11, color: T.inkLight, fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "#10b981", boxShadow: "0 0 0 2px #d1fae5",
                }}
              />
              Auto-saved
            </div>

            {/* Clear */}
            <button
              onClick={() => {
                if (window.confirm("Clear all content?"))
                  updateContent(item.id, { richTextContent: "" });
              }}
              style={{
                padding: "5px 12px", borderRadius: 7,
                border: `1px solid ${T.dangerBd}`,
                background: T.dangerBg, color: T.danger,
                fontSize: 11, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              🗑 Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Attach Modal ── */}
      {showModal && (
        <AttachModal
          selection={selectionText}
          onAttach={handleAttach}
          onClose={() => {
            setShowModal(false);
            setSelectionText("");
            setSelectionRange(null);
          }}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <EditorStyles />
    </div>
  );
};

/* ─── Global Editor Styles ───────────────────────────────── */
function EditorStyles() {
  return (
    <style>{`
      .jodit-toolbar__box {
        background: ${T.offWhite} !important;
        border-bottom: 1.5px solid ${T.line} !important;
        padding: 4px 8px !important;
      }
      .jodit-toolbar-button__button {
        border-radius: 6px !important;
        transition: background .12s !important;
      }
      .jodit-toolbar-button__button:hover {
        background: ${T.sage} !important;
        color: ${T.forest} !important;
      }
      .jodit-wysiwyg {
        font-family: 'Georgia', serif !important;
        font-size: 15px !important;
        line-height: 1.85 !important;
        color: ${T.ink} !important;
        padding: 28px 36px !important;
        min-height: 420px !important;
        caret-color: ${T.forestBright};
      }
      .jodit-wysiwyg h1 {
        font-size: 28px; font-weight: 800; color: ${T.forest};
        margin: 28px 0 12px; letter-spacing: -.02em;
      }
      .jodit-wysiwyg h2 {
        font-size: 22px; font-weight: 700; color: ${T.forestMid};
        margin: 24px 0 10px;
      }
      .jodit-wysiwyg h3 {
        font-size: 17px; font-weight: 700; color: ${T.inkMid};
        margin: 18px 0 8px;
      }
      .jodit-wysiwyg p  { margin: 0 0 14px; }
      .jodit-wysiwyg a  {
        color: ${T.forestBright};
        text-decoration: underline;
        text-decoration-color: ${T.mint};
        text-underline-offset: 3px;
        font-weight: 600;
        transition: color .12s;
      }
      .jodit-wysiwyg a:hover {
        color: ${T.forest};
        text-decoration-color: ${T.mintDark};
      }
      .jodit-wysiwyg blockquote {
        border-left: 4px solid ${T.forestBright};
        margin: 18px 0; padding: 10px 20px;
        background: ${T.sage}; border-radius: 0 8px 8px 0;
        color: ${T.inkMid}; font-style: italic;
      }
      .jodit-wysiwyg table  { border-collapse: collapse; width: 100%; margin: 16px 0; }
      .jodit-wysiwyg td,
      .jodit-wysiwyg th     { border: 1.5px solid ${T.line}; padding: 8px 12px; font-size: 14px; }
      .jodit-wysiwyg th     { background: ${T.sage}; font-weight: 700; color: ${T.forestMid}; }
      .jodit-wysiwyg ul,
      .jodit-wysiwyg ol     { padding-left: 24px; margin: 0 0 14px; }
      .jodit-wysiwyg li     { margin-bottom: 4px; }
      .jodit-wysiwyg code   {
        background: ${T.sage}; color: ${T.forest};
        padding: 2px 6px; border-radius: 4px; font-size: .88em;
        font-family: 'Courier New', monospace;
      }
      .jodit-wysiwyg pre    {
        background: ${T.ink}; color: #a8ffd8;
        padding: 16px 20px; border-radius: 10px; overflow-x: auto;
        font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6;
      }
      .jodit-wysiwyg img    { max-width: 100%; border-radius: 8px; }
      .jodit-wysiwyg hr     { border: none; border-top: 2px solid ${T.line}; margin: 24px 0; }
      .jodit-status-bar     { display: none !important; }
      .jodit-wysiwyg::-webkit-scrollbar       { width: 5px; }
      .jodit-wysiwyg::-webkit-scrollbar-track { background: transparent; }
      .jodit-wysiwyg::-webkit-scrollbar-thumb { background: ${T.mint}; border-radius: 6px; }
      @keyframes warnSlide {
        from { opacity: 0; transform: translateY(-4px) }
        to   { opacity: 1; transform: translateY(0) }
      }
    `}</style>
  );
}

/* ─── View Mode Styles ───────────────────────────────────── */
function ViewStyles() {
  return (
    <style>{`
      .cms-view { font-family: 'Georgia', serif; font-size: 15px; line-height: 1.85; color: ${T.ink}; }
      .cms-view h1 { font-size: 28px; font-weight: 800; color: ${T.forest}; }
      .cms-view h2 { font-size: 22px; font-weight: 700; color: ${T.forestMid}; }
      .cms-view h3 { font-size: 17px; font-weight: 700; color: ${T.inkMid}; }
      .cms-view a  { color: ${T.forestBright}; font-weight: 600; }
      .cms-view blockquote {
        border-left: 4px solid ${T.forestBright}; padding: 10px 20px;
        background: ${T.sage}; border-radius: 0 8px 8px 0;
        color: ${T.inkMid}; font-style: italic; margin: 18px 0;
      }
      .cms-view table   { border-collapse: collapse; width: 100%; }
      .cms-view td,
      .cms-view th      { border: 1.5px solid ${T.line}; padding: 8px 12px; }
      .cms-view th      { background: ${T.sage}; font-weight: 700; }
      .cms-view img     { max-width: 100%; border-radius: 8px; }
      .cms-view pre     {
        background: ${T.ink}; color: #a8ffd8;
        padding: 16px; border-radius: 10px; overflow-x: auto;
      }
      .cms-view code    {
        background: ${T.sage}; color: ${T.forest};
        padding: 2px 6px; border-radius: 4px; font-size: .88em;
      }
    `}</style>
  );
}

export default DynamicContentEditor;