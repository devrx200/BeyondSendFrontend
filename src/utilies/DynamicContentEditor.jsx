import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import JoditEditor from "jodit-react";
import axios from "axios";
import { Progress } from "reactstrap";
import {
  FaUpload, FaFilePdf, FaFileExcel,
  FaFileAlt, FaFileWord, FaFileImage, FaTimes,
  FaCloudUploadAlt, FaFileCode, FaFileArchive, FaLink,
  FaExpand, FaCompress, FaCopy, FaCheck,
  FaTh, FaList, FaFilter, FaSearch, FaRegSave,
  FaFileAudio, FaFileVideo, FaFile,
} from "react-icons/fa";

// ----- Styling constants (WordPress-like) -----
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

// ----- Helper: detect file category (for icons/filtering) -----
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

// ----- File icon mapping -----
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
  { key: "all", label: "All Files", icon: FaFile },
  { key: "image", label: "Images", icon: FaFileImage },
  { key: "pdf", label: "PDFs", icon: FaFilePdf },
  { key: "doc", label: "Docs", icon: FaFileWord },
  { key: "video", label: "Videos", icon: FaFileVideo },  // video filter
];

// ----- Toast Component (bottom‑right) -----
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 10000,
      background: type === "success" ? WP.green : type === "error" ? WP.red : WP.amber,
      color: WP.white, padding: "10px 18px", borderRadius: 8,
      fontSize: 13, fontWeight: 500, boxShadow: "0 8px 20px rgba(0,0,0,.2)",
      fontFamily: FF, display: "flex", alignItems: "center", gap: 8,
      backdropFilter: "blur(2px)", animation: "slideIn 0.2s ease-out",
    }}>
      {type === "success" ? <FaCheck /> : type === "error" ? <FaTimes /> : <FaLink />}
      {msg}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ----- Attach Modal (file upload & library) -----
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
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => { setLinkText(selection?.trim() || ""); }, [selection]);

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
      onShowToast?.(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => { searchRef.current?.focus(); fetchFiles(); }, [fetchFiles]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return files.filter(f =>
      (filter === "all" || getFileCategory(f.mimeType) === filter) &&
      (!q || f.originalName.toLowerCase().includes(q))
    );
  }, [files, query, filter]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const copyFileUrl = (filePath, fileName) => {
    const fullUrl = `${API_URL}${filePath}`;
    navigator.clipboard.writeText(fullUrl);
    onShowToast?.(`${fileName} URL copied`, "success");
  };

  const handleSelectFile = (file) => {
    if (!file) return;
    setUploadFile(file);
    setUploadProgress(0);
    if (file.type?.startsWith("image/")) {
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
      onShowToast?.("File uploaded successfully", "success");
      resetUpload();
      await fetchFiles();
    } catch (err) {
      onShowToast?.(err.response?.data?.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelectFromList = (file) => {
    setSelected(file);
    if (!linkText.trim()) {
      const nameWithoutExt = file.originalName.replace(/\.[^/.]+$/, "");
      setLinkText(nameWithoutExt);
    }
  };

  const canInsert = selected && linkText.trim();

  const btnSt = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "1px solid transparent", borderRadius: 6,
    fontSize: 12, fontWeight: 500, lineHeight: "2.2",
    padding: "0 12px", cursor: "pointer", fontFamily: FF,
    transition: "all 0.2s ease",
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 9990,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
        animation: "fadeIn 0.2s ease-out",
      }} />
      <div role="dialog" style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        zIndex: 9991, width: "min(1100px,94vw)", maxHeight: "85vh",
        background: WP.white, borderRadius: 12,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        animation: "zoomIn 0.2s ease-out",
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes zoomIn { from { transform: translate(-50%,-48%) scale(0.96); opacity: 0; } to { transform: translate(-50%,-50%) scale(1); opacity: 1; } }
        `}</style>
        <div style={{ background: WP.black, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: WP.white, display: "flex", alignItems: "center", gap: 8 }}>
              <FaCloudUploadAlt /> Media Library
            </h3>
            {selection?.trim()
              ? <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,.6)" }}>Selected text: "{selection}"</p>
              : <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,.45)" }}>No text selected — enter link text manually</p>
            }
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: WP.white, width: 32, height: 32, borderRadius: 20, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Upload Zone */}
        {!uploadFile ? (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleSelectFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? WP.blue : WP.line}`,
              margin: "16px 20px 0", borderRadius: 12, padding: "20px",
              textAlign: "center", cursor: "pointer",
              background: isDragging ? WP.blueBg : WP.offWhite,
              transition: "all 0.2s",
            }}>
            <FaCloudUploadAlt size={36} style={{ color: isDragging ? WP.blue : WP.textLight, marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 14, color: isDragging ? WP.blue : WP.textMid, fontWeight: 600 }}>
              {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
            </p>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: WP.textLight }}>Images, PDFs, Documents, Spreadsheets, Videos, Audio</p>
            <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={e => handleSelectFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ margin: "16px 20px 0", background: WP.offWhite, border: `1px solid ${WP.line}`, borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 52, height: 52, borderRadius: 8, background: WP.white, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                {uploadPreview ? <img src={uploadPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : getFileIcon(uploadFile.type, 32)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: WP.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadFile.name}</div>
                <div style={{ fontSize: 11, color: WP.textLight }}>{fmtSize(uploadFile.size)}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleUpload} disabled={uploading} style={{ ...btnSt, background: WP.blue, color: WP.white, opacity: uploading ? .7 : 1 }}>
                  <FaUpload size={11} /> {uploading ? "Uploading…" : "Upload"}
                </button>
                <button onClick={resetUpload} disabled={uploading} style={{ ...btnSt, background: WP.white, borderColor: WP.border, color: WP.textMid }}>
                  <FaTimes size={11} /> Cancel
                </button>
              </div>
            </div>
            {uploading && (
              <div style={{ marginTop: 12 }}>
                <Progress value={uploadProgress} style={{ height: 4, borderRadius: 4 }} />
                <div style={{ fontSize: 10, textAlign: "right", color: WP.textMid, marginTop: 4 }}>{uploadProgress}%</div>
              </div>
            )}
          </div>
        )}

        <div style={{ margin: "14px 20px 0", borderTop: `1px solid ${WP.line}` }} />

        {/* Controls */}
        <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: WP.offWhite, borderBottom: `1px solid ${WP.line}` }}>
          <div style={{ flex: 2, minWidth: 180, position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: WP.textLight, fontSize: 12 }} />
            <input
              ref={searchRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename…"
              style={{ width: "100%", border: `1px solid ${WP.border}`, borderRadius: 20, padding: "7px 12px 7px 32px", fontSize: 13, fontFamily: FF, outline: "none", color: WP.text }}
              onFocus={e => { e.target.style.borderColor = WP.blue; e.target.style.boxShadow = `0 0 0 1px ${WP.blue}`; }}
              onBlur={e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ flex: 2, minWidth: 180 }}>
            <input
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              placeholder="Link text (required)…"
              style={{
                width: "100%", border: `1px solid ${!linkText.trim() && selected ? WP.red : WP.border}`,
                borderRadius: 20, padding: "7px 12px", fontSize: 13,
                fontFamily: FF, color: WP.text, outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = WP.blue; e.target.style.boxShadow = `0 0 0 1px ${WP.blue}`; }}
              onBlur={e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, background: WP.white, borderRadius: 20, padding: 2, border: `1px solid ${WP.border}` }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 12px", borderRadius: 18, fontSize: 12,
                background: filter === f.key ? WP.blue : "transparent",
                color: filter === f.key ? WP.white : WP.textMid,
                border: "none", cursor: "pointer", fontWeight: filter === f.key ? 500 : 400,
              }}>
                <f.icon size={11} /> {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => setViewMode("grid")} style={{
              ...btnSt, padding: "4px 10px", background: viewMode === "grid" ? WP.blue : WP.white,
              borderColor: viewMode === "grid" ? WP.blue : WP.border, color: viewMode === "grid" ? WP.white : WP.textMid,
              borderRadius: 20,
            }}><FaTh size={12} /> Grid</button>
            <button onClick={() => setViewMode("list")} style={{
              ...btnSt, padding: "4px 10px", background: viewMode === "list" ? WP.blue : WP.white,
              borderColor: viewMode === "list" ? WP.blue : WP.border, color: viewMode === "list" ? WP.white : WP.textMid,
              borderRadius: 20,
            }}><FaList size={12} /> List</button>
          </div>
        </div>

        {/* File Display Area */}
        <div style={{ flex: 1, overflowY: "auto", minHeight: 280 }}>
          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12, padding: "16px 20px" }}>
              {loading && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: WP.textLight }}>Loading files...</div>}
              {!loading && error && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: WP.red }}>{error}</div>}
              {!loading && !error && filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: WP.textLight }}>No files found</div>}
              {filtered.map(file => {
                const isSel = selected?._id === file._id;
                const isImg = file.mimeType?.startsWith("image/");
                return (
                  <div
                    key={file._id}
                    onClick={() => handleFileSelectFromList(file)}
                    style={{
                      border: `1px solid ${isSel ? WP.blue : WP.line}`,
                      borderRadius: 12, padding: "10px 6px", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      background: isSel ? WP.blueBg : WP.white, position: "relative",
                      transition: "all 0.15s", boxShadow: isSel ? "0 2px 6px rgba(0,0,0,0.05)" : "none",
                    }}>
                    {isSel && <div style={{ position: "absolute", top: 8, right: 8, background: WP.blue, borderRadius: 20, width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}><FaCheck size={10} color="white" /></div>}
                    <div style={{ width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#f6f7f7" }}>
                      {isImg ? <img src={`${API_URL}${file.filePath}`} alt={file.originalName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 }} /> : getFileIcon(file.mimeType, 32)}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: WP.text, textAlign: "center", wordBreak: "break-word", width: "100%", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{file.originalName}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: WP.textLight }}>
                      <span>{fmtSize(file.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(file.createdAt)}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); copyFileUrl(file.filePath, file.originalName); }} style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, fontSize: 10, marginTop: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FaCopy size={9} /> Copy Link
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "8px 20px 20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${WP.line}`, background: WP.offWhite }}>
                    <th style={{ padding: "10px 8px", textAlign: "left" }}>File</th>
                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Size</th>
                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Date</th>
                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Actions</th>
                    <th style={{ padding: "10px 8px", textAlign: "center", width: 50 }}>Select</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="5" style={{ padding: 40, textAlign: "center" }}>Loading...</td>}</tr>}
                  {!loading && error && <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: WP.red }}>{error}</td></tr>}
                  {!loading && !error && filtered.length === 0 && <tr><td colSpan="5" style={{ padding: 40, textAlign: "center", color: WP.textLight }}>No files</td></tr>}
                  {filtered.map(file => {
                    const isSel = selected?._id === file._id;
                    const isImg = file.mimeType?.startsWith("image/");
                    return (
                      <tr key={file._id} style={{ borderBottom: `1px solid ${WP.line}`, background: isSel ? WP.blueBg : "white", cursor: "pointer" }} onClick={() => handleFileSelectFromList(file)}>
                        <td style={{ padding: "10px 8px", display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {isImg ? <img src={`${API_URL}${file.filePath}`} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4 }} /> : getFileIcon(file.mimeType, 18)}
                          </div>
                          <span style={{ fontWeight: isSel ? 600 : 400, color: WP.text }}>{file.originalName}</span>
                        </td>
                        <td style={{ padding: "10px 8px", color: WP.textLight }}>{fmtSize(file.fileSize)}</td>
                        <td style={{ padding: "10px 8px", color: WP.textLight }}>{formatDate(file.createdAt)}</td>
                        <td style={{ padding: "10px 8px" }}>
                          <button onClick={(e) => { e.stopPropagation(); copyFileUrl(file.filePath, file.originalName); }} style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, fontSize: 12, display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <FaCopy size={11} /> Copy URL
                          </button>
                        </td>
                        <td style={{ padding: "10px 8px", textAlign: "center" }}>
                          <input type="radio" name="fileSelect" checked={isSel} onChange={() => {}} style={{ cursor: "pointer", accentColor: WP.blue }} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${WP.line}`, background: WP.offWhite, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: WP.textMid }}>
            {selected ? <><FaCheck style={{ color: WP.green, marginRight: 6 }} /><strong>{selected.originalName}</strong> · {fmtSize(selected.fileSize)}</> : `${filtered.length} file${filtered.length !== 1 ? "s" : ""} — select one to insert`}
          </span>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {selected && !linkText.trim() && <span style={{ fontSize: 11, color: WP.red }}>Enter link text ↑</span>}
            <button onClick={onClose} style={{ border: `1px solid ${WP.border}`, background: WP.white, borderRadius: 20, padding: "6px 16px", fontSize: 12, cursor: "pointer", color: WP.textMid, fontFamily: FF, fontWeight: 500 }}>Cancel</button>
            <button
              disabled={!canInsert}
              onClick={() => {
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
              }}
              style={{
                border: "none", background: canInsert ? WP.blue : WP.line,
                borderRadius: 20, padding: "6px 20px", fontSize: 12,
                cursor: canInsert ? "pointer" : "default",
                color: canInsert ? WP.white : WP.textLight,
                fontFamily: FF, fontWeight: 600,
                transition: "all 0.15s",
              }}>Insert Link →</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ----- Real‑time word/char/read stats -----
function RealTimeStats({ content }) {
  const stats = useMemo(() => {
    const text = content?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "";
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const read = Math.max(1, Math.ceil(words / 200));
    return { words, chars, read };
  }, [content]);
  return (
    <div style={{ display: "flex", gap: 20, fontSize: 12, color: WP.textMid }}>
      <span><strong style={{ color: WP.text }}>{stats.words.toLocaleString()}</strong> words</span>
      <span><strong style={{ color: WP.text }}>{stats.chars.toLocaleString()}</strong> chars</span>
      <span>~<strong style={{ color: WP.text }}>{stats.read}</strong> min read</span>
    </div>
  );
}

// ----- Main Editor Component -----
const DynamicContentEditor = ({
  contents,
  setContents,
  engField = "descriptionEn",
  hinField = "descriptionHi",
  htmlContentEng,
  htmlContentHin,
  activeTab: controlledTab,
  height = 460,
  instanceId = "dce_default",
}) => {
  const ENG = htmlContentEng || engField;
  const HIN = htmlContentHin || hinField;
  const SESSION_KEY = `${instanceId}_tab`;
  const getInitialTab = () => {
    if (controlledTab) return controlledTab;
    try { return sessionStorage.getItem(SESSION_KEY) || "en"; } catch { return "en"; }
  };

  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [showModal, setShowModal] = useState(false);
  const [selText, setSelText] = useState("");
  const [toast, setToast] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const activeTabRef = useRef(activeTab);
  const savedRangeRef = useRef(null);
  const editorRef = useRef(null);
  const [editorKey, setEditorKey] = useState(`${instanceId}_${activeTab}`);
  const [liveContent, setLiveContent] = useState("");

  const showToastMessage = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

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

  useEffect(() => {
    if (!contents || contents.length === 0) {
      setContents([{ id: Date.now(), [ENG]: "", [HIN]: "" }]);
    }
  }, [contents, setContents, ENG, HIN]);

  const item = contents?.[0];
  const currentField = activeTab === "en" ? ENG : HIN;
  const externalValue = item?.[currentField] || "";

  useEffect(() => {
    setLiveContent(externalValue);
  }, [externalValue]);

  const updateContent = useCallback((id, updates) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [setContents]);

  const handleBlur = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || !item) return;
    const newContent = editor.value;
    const field = activeTabRef.current === "en" ? ENG : HIN;
    if (newContent !== item[field]) {
      updateContent(item.id, { [field]: newContent });
      setLiveContent(newContent);
    }
  }, [item, updateContent, ENG, HIN]);

  const handleChange = useCallback((newContent) => {
    setLiveContent(newContent);
  }, []);

  // ---- Attach file logic with selection/cursor handling ----
  const handleAttachMouseDown = useCallback((e) => {
    e.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    // Save current selection range (if any)
    try {
      const sel = editor.selection.sel;
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        savedRangeRef.current = range;
      } else {
        savedRangeRef.current = null;
      }
    } catch (err) {
      savedRangeRef.current = null;
    }
    let selected = "";
    try { selected = editor.selection.text() || ""; } catch { /* ignore */ }
    if (!selected.trim()) {
      const win = window.getSelection();
      if (win && win.toString().trim()) selected = win.toString();
    }
    setSelText(selected.trim());
    setShowModal(true);
  }, []);

  const handleAttach = useCallback((file) => {
    const editor = editorRef.current;
    if (!editor) {
      showToastMessage("Editor not ready", "error");
      setShowModal(false);
      return;
    }
    const url = `${API_URL}${file.url}`;
    const textToUse = file.linkText?.trim() || file.title;
    const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer" data-file-id="${file._id}" data-category="${file.category}">${textToUse}</a>`;
    editor.focus();
    let restored = false;
    if (savedRangeRef.current) {
      try {
        const sel = editor.selection.sel;
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
          restored = true;
        }
      } catch (err) { /* fallback */ }
    }
    if (!restored) {
      editor.selection.focus();
    }
    // Insert HTML at current selection (replaces selected text or inserts at cursor)
    editor.selection.insertHTML(linkHtml);
    const newContent = editor.value;
    setLiveContent(newContent);
    setTimeout(() => handleBlur(), 100);
    showToastMessage(`"${file.title}" linked successfully`, "success");
    setShowModal(false);
    setSelText("");
    savedRangeRef.current = null;
  }, [handleBlur, showToastMessage]);

  if (!item) return null;

  return (
    <div style={{
      fontFamily: FF,
      ...(isFullscreen ? {
        position: "fixed", inset: 0, zIndex: 9000,
        background: WP.bg, padding: 20, overflowY: "auto",
      } : {}),
    }}>
      <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {/* Toolbar */}
        <div style={{
          background: WP.black, padding: "8px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[{ key: "en", label: "English", flag: "🇬🇧" }, { key: "hi", label: "हिंदी", flag: "🇮🇳" }].map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === activeTab) return;
                  handleBlur();
                  setActiveTab(tab.key);
                }}
                style={{
                  padding: "6px 14px", borderRadius: 20,
                  border: "none",
                  background: activeTab === tab.key ? "rgba(255,255,255,0.2)" : "transparent",
                  color: activeTab === tab.key ? WP.white : "rgba(255,255,255,0.7)",
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  fontSize: 13, cursor: "pointer", fontFamily: FF,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                <span>{tab.flag}</span> {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onMouseDown={handleAttachMouseDown}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 20,
                background: WP.blue, border: "none",
                color: WP.white, fontSize: 12, fontWeight: 500,
                cursor: "pointer", fontFamily: FF,
              }}>
              <FaLink size={12} /> Attach File
            </button>
            <button
              onClick={() => setIsFullscreen(f => !f)}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 20,
                background: "rgba(255,255,255,0.1)", border: "none",
                color: WP.white, cursor: "pointer",
              }}>
              {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
            </button>
          </div>
        </div>

        {/* Shortcuts bar */}
        <div style={{ background: WP.offWhite, borderBottom: `1px solid ${WP.line}`, padding: "6px 16px", fontSize: 11, color: WP.textMid, display: "flex", gap: 16 }}>
          <span><kbd style={kbdSt}>Ctrl+B</kbd> Bold</span>
          <span><kbd style={kbdSt}>Ctrl+I</kbd> Italic</span>
          <span><kbd style={kbdSt}>Ctrl+K</kbd> Link</span>
          <span><kbd style={kbdSt}>Ctrl+Z</kbd> Undo</span>
        </div>

        {/* Jodit Editor - full features including video */}
        <div style={{ background: WP.white }}>
          <JoditEditor
            key={editorKey}
            config={useMemo(() => ({
              height: isFullscreen ? "calc(100vh - 200px)" : height,
              readonly: false,
              toolbarAdaptive: false,
              showCharsCounter: false,
              showWordsCounter: false,
              showXPathInStatusbar: false,
              askBeforePasteHTML: false,
              askBeforePasteFromWord: false,
              defaultActionOnPaste: "insert_as_html",
              spellcheck: true,
              uploader: {
                insertImageAsBase64URI: true,
                imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
                withCredentials: false,
              },
              // Full toolbar including VIDEO button
              buttons: [
                "bold", "italic", "underline", "strikethrough", "|",
                "superscript", "subscript", "|",
                "eraser", "|",
                "ul", "ol", "|",
                "outdent", "indent", "|",
                "font", "fontsize", "brush", "paragraph", "|",
                "align", "|",
                "table", "link", "image", "video", "|",   // video button enabled
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
              style: { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "15px" },
              defaultValue: externalValue,
              events: {
                afterInit(editor) {
                  editorRef.current = editor;
                  if (editor.value !== externalValue) {
                    editor.value = externalValue;
                  }
                },
              },
            }), [isFullscreen, height, externalValue, editorKey])}
            onBlur={handleBlur}
            onChange={handleChange}
          />
        </div>

        {/* Footer stats */}
        <div style={{
          background: WP.offWhite, borderTop: `1px solid ${WP.line}`,
          padding: "8px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}>
          <RealTimeStats content={liveContent} />
          <span style={{ fontSize: 11, color: WP.textLight, display: "flex", alignItems: "center", gap: 4 }}>
            <FaRegSave size={10} /> Auto-saved on blur
          </span>
        </div>
      </div>

      {showModal && (
        <AttachModal
          selection={selText}
          onAttach={handleAttach}
          onClose={() => { setShowModal(false); setSelText(""); savedRangeRef.current = null; }}
          onShowToast={showToastMessage}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <EditorStyles />
    </div>
  );
};

const kbdSt = {
  display: "inline-block", background: "#e4e4e7", border: "1px solid #c3c4c7",
  borderRadius: 4, padding: "0 5px", fontSize: 10, fontFamily: "monospace",
  lineHeight: "1.5", color: WP.text,
};

function EditorStyles() {
  return (
    <style>{`
      .jodit-toolbar__box { background: ${WP.offWhite} !important; border-bottom: 1px solid ${WP.line} !important; padding: 4px 8px !important; }
      .jodit-toolbar-button__button { border-radius: 6px !important; }
      .jodit-toolbar-button__button:hover { background: ${WP.blueBg} !important; color: ${WP.blue} !important; }
      .jodit-wysiwyg { font-family: Georgia, 'Times New Roman', serif !important; font-size: 15px !important; line-height: 1.8 !important; color: ${WP.text} !important; padding: 24px !important; }
      .jodit-wysiwyg a { color: ${WP.blue}; text-decoration: underline; }
      .jodit-wysiwyg a:hover { color: ${WP.blueHov}; }
      .jodit-wysiwyg video { max-width: 100%; border-radius: 8px; margin: 8px 0; }
      .jodit-status-bar { display: none !important; }
    `}</style>
  );
}

export default DynamicContentEditor;