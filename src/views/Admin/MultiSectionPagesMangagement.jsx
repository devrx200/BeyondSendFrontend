import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Spinner } from "reactstrap";
import Swal from "sweetalert2";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand, FaCompress, FaTimes,
  FaPlus, FaFilePdf, FaFileWord, FaFileExcel
} from "react-icons/fa";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const getToken = () => sessionStorage.getItem("authToken");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

// --- WordPress styles (same as RichContentPage) ---
const WP = {
  bg: "#f0f0f1", white: "#fff", text: "#1d2327", textMid: "#50575e",
  textLight: "#787c82", border: "#c3c4c7", line: "#dcdcde",
  blue: "#2271b1", blueHov: "#135e96", blueBg: "#f0f6fc",
  green: "#00a32a", greenDark: "#007017", greenBg: "#edfaef",
  red: "#d63638", redDark: "#b32d2e", redBg: "#fcf0f1",
  orange: "#dba617", orangeBg: "#fcf9e8", amber: "#996800",
  black: "#1d2327", blackHov: "#2c3338", focus: "#2271b1", menuBg: "#1d2327",
};

const FF = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif";

// --- Utilities ---
const titleToSlug = (text) => {
  if (!text) return "";
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};

const validateSlug = (value) => {
  if (!value) return "Slug is required";
  if (/[^a-z0-9-]/.test(value)) return "Only lowercase letters, numbers, and hyphens allowed";
  if (value.startsWith("-") || value.endsWith("-")) return "Slug cannot start or end with a hyphen";
  return "";
};

// Builds the real, full public URL path for a page: baseSlug/mainSlug/slug
const buildFullPath = ({ baseSlug, mainSlug, slug }) => {
  const segments = [baseSlug, mainSlug, slug]
    .map((s) => (s || "").toString().trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean);
  return segments.join("/");
};

const buildFullUrl = (item) => `${SITE_URL}/${buildFullPath(item)}`;

// --- Reusable styled components (same as RichContentPage) ---
const btnBase = { display: "inline-flex", alignItems: "center", gap: 4, border: "1px solid transparent", borderRadius: 3, fontSize: 13, fontWeight: 400, lineHeight: "2.15384615", padding: "0 10px", cursor: "pointer", fontFamily: FF, textDecoration: "none", whiteSpace: "nowrap" };
const smPad = { fontSize: 11, padding: "0 8px", lineHeight: "1.9" };

const BtnBlue = ({ children, onClick, disabled, size }) => { const [hov, setHov] = useState(false); return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.blueHov : WP.blue, borderColor: hov ? WP.blueHov : WP.blue, color: "#fff", opacity: disabled ? .6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>; };
const BtnGreen = ({ children, onClick, disabled, size }) => { const [hov, setHov] = useState(false); return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.greenDark : WP.green, borderColor: hov ? WP.greenDark : WP.green, color: "#fff", opacity: disabled ? .6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>; };
const BtnBlack = ({ children, onClick, disabled, size }) => { const [hov, setHov] = useState(false); return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.blackHov : WP.black, borderColor: hov ? WP.blackHov : WP.black, color: "#fff", opacity: disabled ? .6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>; };
const BtnSecondary = ({ children, onClick, disabled, size }) => { const [hov, setHov] = useState(false); return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: WP.white, borderColor: hov ? WP.blue : WP.border, color: hov ? WP.blue : WP.text, opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>; };
const BtnDanger = ({ children, onClick, disabled, size }) => { const [hov, setHov] = useState(false); return <button onClick={onClick} disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.redBg : WP.white, borderColor: WP.red, color: WP.red, opacity: disabled ? .5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>{children}</button>; };

const LinkBtn = ({ children, onClick, color }) => (
  <button onClick={onClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: color || WP.blue, fontFamily: FF, textDecoration: "none" }}
    onMouseEnter={e => e.currentTarget.style.color = color ? WP.redDark : WP.blueHov}
    onMouseLeave={e => e.currentTarget.style.color = color || WP.blue}>
    {children}
  </button>
);

// Now shows BOTH publish state (Published / Draft) and active state (Active / Inactive)
const StatusBadge = ({ published, active }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: published ? WP.greenBg : WP.orangeBg, color: published ? WP.greenDark : WP.amber, border: `1px solid ${published ? WP.green : WP.orange}`, whiteSpace: "nowrap" }}>
      {published ? "Published" : "Draft"}
    </span>
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: active ? WP.greenBg : "#f8d7da", color: active ? WP.greenDark : "#a30000", border: `1px solid ${active ? WP.green : "#f5c6cb"}`, whiteSpace: "nowrap" }}>
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

const CopyBtn = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); });
      }}
      disabled={!text}
      title={text || "Nothing to copy"}
      style={{ background: "none", border: "none", padding: "0 2px", cursor: text ? "pointer" : "not-allowed", color: copied ? WP.green : WP.textLight, fontSize: 11, fontFamily: FF, display: "inline-flex", alignItems: "center", gap: 3, flexShrink: 0, opacity: text ? 1 : .5 }}>
      {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
      {copied ? "Copied" : (label || "Copy")}
    </button>
  );
};

const fi = { border: `1px solid ${WP.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 14, color: WP.text, outline: "none", fontFamily: FF, width: "100%", boxSizing: "border-box", background: WP.white, lineHeight: 1.5 };
const lbl = { fontSize: 13, fontWeight: 600, color: WP.text, marginBottom: 4, display: "block" };
const focus = { onFocus: e => { e.target.style.borderColor = WP.focus; e.target.style.boxShadow = `0 0 0 1px ${WP.focus}`; }, onBlur: e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; } };

const Card = ({ title, children, action }) => (
  <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)", width: "100%", boxSizing: "border-box" }}>
    {title && <div style={{ padding: "8px 12px", borderBottom: `1px solid ${WP.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: WP.text }}>{title}</h2>{action}</div>}
    <div style={{ padding: 12 }}>{children}</div>
  </div>
);

const FlashMsg = ({ msg }) => msg ? (
  <div style={{ margin: "8px 0", padding: "8px 12px", borderLeft: `4px solid ${msg.type === "success" ? WP.green : WP.red}`, background: msg.type === "success" ? WP.greenBg : WP.redBg, fontSize: 13, color: msg.type === "success" ? WP.greenDark : WP.red }}>
    {msg.text}
  </div>
) : null;

const Pagination = ({ currentPage, totalPages, totalItems, shown, onPrev, onNext }) => (
  <div style={{ padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${WP.line}`, background: "#f6f7f7", flexWrap: "wrap", gap: 6 }}>
    <span style={{ fontSize: 12, color: WP.textMid }}>{shown} of {totalItems} items</span>
    {totalPages > 1 && (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button disabled={currentPage === 1} onClick={onPrev} style={{ ...btnBase, fontSize: 11, padding: "1px 6px", background: WP.white, borderColor: WP.border, color: WP.text, opacity: currentPage === 1 ? .4 : 1 }}>‹</button>
        <span style={{ fontSize: 12, color: WP.textMid }}>{currentPage}/{totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={onNext} style={{ ...btnBase, fontSize: 11, padding: "1px 6px", background: WP.white, borderColor: WP.border, color: WP.text, opacity: currentPage === totalPages ? .4 : 1 }}>›</button>
      </div>
    )}
  </div>
);

const getFileIcon = (fileType) => {
  if (!fileType) return <FaFilePdf />;
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return <FaFilePdf className="text-danger" />;
  if (type.includes("word") || type.includes("doc")) return <FaFileWord className="text-primary" />;
  if (type.includes("excel") || type.includes("xls") || type.includes("sheet")) return <FaFileExcel className="text-success" />;
  return <FaFilePdf />;
};

const resolveFileHref = (doc) => {
  if (!doc?.fileUrl) return "";
  if (/^https?:\/\//i.test(doc.fileUrl)) return doc.fileUrl;
  return `${API}${doc.fileUrl}`;
};

// --- Session storage keys ---
const SS_VIEW = "mspm_view";
const SS_EDITING_ID = "mspm_editingId";
const SS_FORM = "mspm_form";
const SS_FULLSCREEN = "mspm_fullscreen";

// --- Default list page size ---
const DEFAULT_PAGE_SIZE = 100;

// --- Initial form state ---
const emptyForm = () => ({
  titleEng: "",
  titleHin: "",
  baseSlug: "",
  mainSlug: "",
  slug: "",
  department: "",
  htmlContent: "",
  htmlContentHi: "",
  isActive: true,
  documentsUpdate: [],
  categoryId: "",
  tags: "",
  metaKeywords: "",
  shortDescriptionEn: "",
  shortDescriptionHin: "",
});

const emptyDocument = () => ({
  titleEng: "",
  titleHin: "",
  fileUrl: "",
  fileName: "",
  fileSize: "",
  fileType: "",
  file: null,
  shortDescriptionEn: "",
  shortDescriptionHin: "",
  isActive: true,
});

// Publish-state is tracked separately from `form` because it's server-controlled
// (only the dedicated publish/draft endpoints are allowed to change it).
const emptyPageStatus = () => ({ isPublished: false, isDraft: true });

// --- Media query hook ---
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const MultiSectionPagesManagement = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");

  // --- Session initialisation ---
  const initView = () => sessionStorage.getItem(SS_VIEW) || "list";
  const initEditingId = () => sessionStorage.getItem(SS_EDITING_ID) || null;
  const initForm = () => {
    try {
      const s = sessionStorage.getItem(SS_FORM);
      return s ? JSON.parse(s) : emptyForm();
    } catch { return emptyForm(); }
  };
  const initFullscreen = () => sessionStorage.getItem(SS_FULLSCREEN) === "true";

  // --- State ---
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState([]);
  const [editingId, setEditingId] = useState(initEditingId);
  const [view, setView] = useState(initView);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(initForm);
  const [pageStatus, setPageStatus] = useState(emptyPageStatus); // { isPublished, isDraft }
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, active: 0, inactive: 0 });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [slugError, setSlugError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initEditingId());
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState(initFullscreen);
  const [excerptLang, setExcerptLang] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDocIndex, setEditingDocIndex] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(emptyDocument());

  const slugDebounceRef = useRef(null);
  const fetchCategories = async () => {
    try { const res = await axios.get(`${API}/api/get-categories`, { headers: authH() }); setCategories(res.data.data || []); } catch { }
  };
  useEffect(() => { fetchCategories(); }, []);
  // --- Persist state to session ---
  useEffect(() => { sessionStorage.setItem(SS_VIEW, view); }, [view]);
  useEffect(() => { if (editingId) sessionStorage.setItem(SS_EDITING_ID, editingId); else sessionStorage.removeItem(SS_EDITING_ID); }, [editingId]);
  useEffect(() => { if (view === "form") sessionStorage.setItem(SS_FORM, JSON.stringify(form)); }, [form, view]);
  useEffect(() => { sessionStorage.setItem(SS_FULLSCREEN, isFormFullscreen ? "true" : "false"); }, [isFormFullscreen]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 4500); return () => clearTimeout(t); }, [message]);

  // --- Load counts for the tabs (independent of current filter/search) ---
  const loadCounts = useCallback(async () => {
    try {
      const [allRes, publishedRes, draftRes, activeRes, inactiveRes] = await Promise.all([
        axios.get(`${API}/api/get-all-content`, { headers: authH(), params: { page: 1, limit: 1 } }),
        axios.get(`${API}/api/get-all-content`, { headers: authH(), params: { page: 1, limit: 1, isPublished: true } }),
        axios.get(`${API}/api/get-all-content`, { headers: authH(), params: { page: 1, limit: 1, isPublished: false } }),
        axios.get(`${API}/api/get-all-content`, { headers: authH(), params: { page: 1, limit: 1, isActive: true } }),
        axios.get(`${API}/api/get-all-content`, { headers: authH(), params: { page: 1, limit: 1, isActive: false } }),
      ]);
      setCounts({
        all: allRes.data?.pagination?.totalDocuments || 0,
        published: publishedRes.data?.pagination?.totalDocuments || 0,
        draft: draftRes.data?.pagination?.totalDocuments || 0,
        active: activeRes.data?.pagination?.totalDocuments || 0,
        inactive: inactiveRes.data?.pagination?.totalDocuments || 0,
      });
    } catch (err) {
      console.error("Failed to load counts", err);
    }
  }, []);

  // --- Load data ---
  const loadData = useCallback(async (page = currentPage) => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize, search, sortBy, sortOrder };
      if (filterStatus === "active") params.isActive = true;
      else if (filterStatus === "inactive") params.isActive = false;
      else if (filterStatus === "published") params.isPublished = true;
      else if (filterStatus === "draft") params.isPublished = false;

      const res = await axios.get(`${API}/api/get-all-content`, { headers: authH(), params });
      if (res.data?.success) {
        setPages(res.data.data || []);
        setTotalItems(res.data.pagination?.totalDocuments || 0);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        throw new Error(res.data?.message || "Failed to load pages");
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "danger", text: err.message || "Error loading pages" });
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, sortBy, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    if (view !== "list") return;
    loadData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentPage, filterStatus, sortBy, sortOrder, search, pageSize]);

  useEffect(() => {
    if (view === "list") loadCounts();
  }, [view, loadCounts]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // --- Form handlers ---
  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setPageStatus(emptyPageStatus());
    setSlugManuallyEdited(false);
    setSlugError("");
    setIsFormFullscreen(false);
    setShowDocForm(false);
    setEditingDocIndex(null);
    setCurrentDocument(emptyDocument());
    [SS_EDITING_ID, SS_FORM, SS_FULLSCREEN].forEach(k => sessionStorage.removeItem(k));
  }, []);

  const goToList = useCallback(() => {
    resetForm();
    setView("list");
  }, [resetForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    if (!slugManuallyEdited) {
      const newSlug = titleToSlug(title);
      setForm(prev => ({ ...prev, titleEng: title, slug: newSlug }));
      setSlugError(validateSlug(newSlug));
    } else {
      setForm(prev => ({ ...prev, titleEng: title }));
    }
  };

  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-");
    setForm(prev => ({ ...prev, slug: clean }));
    setSlugError(validateSlug(clean));
  };

const handleSlugBlur = () => {
  const clean = form.slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")       // spaces → -
    .replace(/[^a-z0-9-]/g, "") // remove invalid characters
    .replace(/-+/g, "-")        // multiple --- → single -
    .replace(/^-+|-+$/g, "");   // remove - from start/end

  setForm(prev => ({
    ...prev,
    slug: clean,
  }));

  setSlugError(validateSlug(clean));
};
  const handleBaseSlugChange = (e) => {
    const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-").replace(/^-+/, "");
    setForm(prev => ({ ...prev, baseSlug: clean }));
  };

  const handleMainSlugChange = (e) => {
    const clean = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9/-]/g, "")
      .replace(/-{2,}/g, "-")
      .replace(/\/{2,}/g, "/")
      .replace(/^[/-]+/, "");
    setForm(prev => ({ ...prev, mainSlug: clean }));
  };

  // --- Document inline form ---
  const resetDocForm = () => {
    setCurrentDocument(emptyDocument());
    setEditingDocIndex(null);
    setShowDocForm(false);
  };

  const handleDocChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentDocument(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      Swal.fire({ icon: "warning", title: "File Too Large", text: "Max 30 MB", confirmButtonText: "OK" });
      e.target.value = null;
      return;
    }
    const fileSizeKB = (file.size / 1024).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const displaySize = file.size < 1024 * 1024 ? `${fileSizeKB} KB` : `${fileSizeMB} MB`;
    setCurrentDocument(prev => ({
      ...prev,
      file,
      fileName: file.name,
      fileSize: displaySize,
      fileType: file.type.split("/").pop() || file.name.split(".").pop(),
    }));
  };

  const saveDocument = async () => {
    if (!currentDocument.titleEng?.trim() || !currentDocument.titleHin?.trim()) {
      Swal.fire({ icon: "warning", title: "Required", text: "Title in both languages required" });
      return;
    }
    if (editingDocIndex === null && !currentDocument.file) {
      Swal.fire({ icon: "warning", title: "Required", text: "Please upload a file" });
      return;
    }

    if (!editingId) {
      const updatedDocs = [...form.documentsUpdate];
      if (editingDocIndex !== null) {
        updatedDocs[editingDocIndex] = { ...updatedDocs[editingDocIndex], ...currentDocument };
      } else {
        updatedDocs.push({ ...currentDocument });
      }
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
      resetDocForm();
      return;
    }

    try {
      const fd = new FormData();
      fd.append("titleEng", currentDocument.titleEng);
      fd.append("titleHin", currentDocument.titleHin);
      fd.append("shortDescriptionEn", currentDocument.shortDescriptionEn || "");
      fd.append("shortDescriptionHin", currentDocument.shortDescriptionHin || "");
      fd.append("isActive", currentDocument.isActive !== false);
      if (currentDocument.file) {
        fd.append("file", currentDocument.file);
        fd.append("fileSize", currentDocument.fileSize);
        fd.append("fileType", currentDocument.fileType);
      }

      if (editingDocIndex !== null) {
        const docId = form.documentsUpdate[editingDocIndex]._id;
        if (!docId) throw new Error("Document ID missing");
        const res = await axios.put(`${API}/api/update-single-document/${editingId}/${docId}`, fd, {
          headers: { ...authH(), "Content-Type": "multipart/form-data" },
        });
        const updatedDocs = [...form.documentsUpdate];
        updatedDocs[editingDocIndex] = { ...updatedDocs[editingDocIndex], ...res.data.data };
        setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
      } else {
        const res = await axios.post(`${API}/api/add-document-to-content/${editingId}`, fd, {
          headers: { ...authH(), "Content-Type": "multipart/form-data" },
        });
        setForm(prev => ({ ...prev, documentsUpdate: [...prev.documentsUpdate, res.data.data] }));
      }
      resetDocForm();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  const editDocument = (index) => {
    const doc = form.documentsUpdate[index];
    setCurrentDocument({ ...doc, file: null, isActive: doc.isActive !== false });
    setEditingDocIndex(index);
    setShowDocForm(true);
  };

  const toggleDocumentActive = async (index) => {
    const doc = form.documentsUpdate[index];
    const nextActive = !(doc.isActive !== false);

    if (!editingId || !doc._id) {
      const updatedDocs = [...form.documentsUpdate];
      updatedDocs[index] = { ...updatedDocs[index], isActive: nextActive };
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
      return;
    }

    try {
      const fd = new FormData();
      fd.append("titleEng", doc.titleEng || "");
      fd.append("titleHin", doc.titleHin || "");
      fd.append("shortDescriptionEn", doc.shortDescriptionEn || "");
      fd.append("shortDescriptionHin", doc.shortDescriptionHin || "");
      fd.append("isActive", nextActive);
      await axios.put(`${API}/api/update-single-document/${editingId}/${doc._id}`, fd, {
        headers: { ...authH(), "Content-Type": "multipart/form-data" },
      });
      const updatedDocs = [...form.documentsUpdate];
      updatedDocs[index] = { ...updatedDocs[index], isActive: nextActive };
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  const deleteDocument = async (index) => {
    const result = await Swal.fire({ title: "Delete Document?", text: "This cannot be undone", icon: "warning", showCancelButton: true, confirmButtonColor: WP.red, cancelButtonColor: WP.textMid, confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    if (!editingId) {
      const updatedDocs = form.documentsUpdate.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
      return;
    }
    try {
      const docId = form.documentsUpdate[index]._id;
      if (!docId) throw new Error("Document ID missing");
      await axios.delete(`${API}/api/delete-document/${editingId}/${docId}`, { headers: authH() });
      const updatedDocs = form.documentsUpdate.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  // --- Submit form ---
  const buildPayload = useCallback(() => ({
    titleEng: form.titleEng.trim(),
    titleHin: form.titleHin.trim(),
    baseSlug: form.baseSlug.trim(),
    mainSlug: form.mainSlug.trim(),
    slug: form.slug.trim(),
    department: form.department.trim(),
    htmlContent: form.htmlContent,
    htmlContentHi: form.htmlContentHi,
    isActive: form.isActive,
    metaKeywords: form.metaKeywords
      .split(",")
      .map(x => x.trim())
      .filter(Boolean),

    tags: form.tags
      .split(",")
      .map(x => x.trim())
      .filter(Boolean),

    categoryId: form.categoryId || null,

    shortDescriptionEn: form.shortDescriptionEn || "",
    shortDescriptionHin: form.shortDescriptionHin || "",
    documentsUpdate: form.documentsUpdate.map(doc => ({
      titleEng: doc.titleEng || "",
      titleHin: doc.titleHin || "",
      fileUrl: doc.fileUrl || "",
      fileName: doc.fileName || "",
      fileSize: doc.fileSize || "",
      fileType: doc.fileType || "",
      shortDescriptionEn: doc.shortDescriptionEn || "",
      shortDescriptionHin: doc.shortDescriptionHin || "",
      isActive: doc.isActive !== false,

    })),
  }), [form]);

  const hasNewFiles = () => form.documentsUpdate.some(doc => doc.file instanceof File);

  const buildFormData = () => {
    const fd = new FormData();
    const fields = ["titleEng", "titleHin", "baseSlug", "mainSlug", "slug", "department", "htmlContent", "htmlContentHi"];
    fields.forEach(key => fd.append(key, form[key]));
    fd.append("isActive", form.isActive);

    const docs = form.documentsUpdate.map((doc, idx) => {
      const obj = {
        titleEng: doc.titleEng || "",
        titleHin: doc.titleHin || "",
        fileUrl: doc.fileUrl || "",
        fileName: doc.fileName || "",
        fileSize: doc.fileSize || "",
        fileType: doc.fileType || "",
        shortDescriptionEn: doc.shortDescriptionEn || "",
        shortDescriptionHin: doc.shortDescriptionHin || "",
        isActive: doc.isActive !== false,
        fileIndex: doc.file instanceof File ? idx : -1,
      };
      if (doc.file instanceof File) fd.append("file", doc.file);
      return obj;
    });
    fd.append("documentsUpdate", JSON.stringify(docs));
    return fd;
  };

  // publish = true  -> Save (create/update) then call the dedicated publish endpoint
  // publish = false -> Save only. If the page is already published, this just
  //                     updates its content and DOES NOT touch publish/draft state.
  const handleSubmit = async (publish = false) => {
    if (!form.titleEng?.trim()) {
      setMessage({ type: "danger", text: "English title is required before saving." });
      return;
    }
    if (!form.slug?.trim()) {
      setSlugError("Slug is required");
      setMessage({ type: "danger", text: "Page slug is required before saving." });
      return;
    }
    const err = validateSlug(form.slug);
    if (err) {
      setSlugError(err);
      setMessage({ type: "danger", text: "Fix slug errors before saving." });
      return;
    }

    setSaving(true);
    try {
      const isMultipart = hasNewFiles();
      const config = {
        headers: { ...authH(), ...(isMultipart ? { "Content-Type": "multipart/form-data" } : { "Content-Type": "application/json" }) },
      };
      const url = editingId ? `${API}/api/update-content/${editingId}` : `${API}/api/create-content`;
      const res = editingId
        ? await axios.put(url, isMultipart ? buildFormData() : buildPayload(), config)
        : await axios.post(url, isMultipart ? buildFormData() : buildPayload(), config);

      const savedId = res.data.data._id;
      if (!editingId) setEditingId(savedId);

      if (publish) {
        await axios.post(`${API}/api/publish-content/${savedId}`, {}, { headers: authH() });
        setPageStatus({ isPublished: true, isDraft: false });
        setMessage({ type: "success", text: "Page published successfully." });
      } else {
        setMessage({ type: "success", text: pageStatus.isPublished ? "Published page updated." : "Draft saved." });
      }
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.message || "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  // --- Publish / Draft (used both from the list and from inside the form) ---
  const handlePublish = async (id) => {
    try {
      await axios.post(`${API}/api/publish-content/${id}`, {}, { headers: authH() });
      if (id === editingId) setPageStatus({ isPublished: true, isDraft: false });
      setMessage({ type: "success", text: "Page published." });
      loadData(currentPage);
      loadCounts();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  const handleDraft = async (id) => {
    try {
      await axios.post(`${API}/api/draft-content/${id}`, {}, { headers: authH() });
      if (id === editingId) setPageStatus({ isPublished: false, isDraft: true });
      setMessage({ type: "success", text: "Page moved to draft." });
      loadData(currentPage);
      loadCounts();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.response?.data?.message || err.message });
    }
  };

  // --- Edit / Delete from list ---
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      titleEng: item.titleEng || "",
      titleHin: item.titleHin || "",
      baseSlug: item.baseSlug || "",
      mainSlug: item.mainSlug || "",
      slug: item.slug || "",
      department: item.department || "",
      htmlContent: item.htmlContent || "",
      htmlContentHi: item.htmlContentHi || "",
      isActive: item.isActive !== false,
      categoryId: item.categoryId?._id || item.categoryId || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""),
      metaKeywords: Array.isArray(item.metaKeywords) ? item.metaKeywords.join(", ") : (item.metaKeywords || ""),
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionHin: item.shortDescriptionHin || "",
      documentsUpdate: Array.isArray(item.documentsUpdate) ? item.documentsUpdate.map(doc => ({ ...doc, file: null, isActive: doc.isActive !== false })) : [],
    });
    setPageStatus({ isPublished: !!item.isPublished, isDraft: item.isDraft !== false });
    setSlugManuallyEdited(true);
    setSlugError("");
    setView("form");
  };
  
  const handleDelete = async (id, title) => {
    const result = await Swal.fire({
      title: "Delete Content?",
      html: `<span style="font-size:13px;color:#50575e">Permanently delete <strong>"${title || "Untitled"}"</strong>?<br>This cannot be undone.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: WP.red,
      cancelButtonColor: WP.textMid,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await axios.delete(`${API}/api/delete-content/${id}`, { headers: authH() });
      Swal.fire({ title: "Deleted", icon: "success", timer: 1500, showConfirmButton: false });
      if (pages.length === 1 && currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else {
        loadData(currentPage);
      }
      loadCounts();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };

  // --- Sorting ---
  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortOrder("desc"); }
    setCurrentPage(1);
  };
  const sortIcon = (col) => sortBy !== col ? " ⇅" : sortOrder === "desc" ? " ↓" : " ↑";

  // --- Filter status change (refreshes list + resets to page 1) ---
  const changeFilter = (key) => {
    setFilterStatus(key);
    setCurrentPage(1);
  };

  const fullPath = buildFullPath(form);
  const fullUrlForForm = fullPath ? `${SITE_URL}/${fullPath}` : "";

  // --- Top bar for form ---
  const renderFormTopBar = ({ fullscreen }) => (
    <div style={{
      background: WP.white, borderBottom: `1px solid ${WP.line}`,
      padding: isMobile ? "8px 12px" : "8px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, flexWrap: "wrap",
      position: "sticky", top: 0, zIndex: 1000,
      boxShadow: fullscreen ? "none" : "0 1px 2px rgba(0,0,0,.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={goToList} style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
          <FaArrowLeft size={11} /> Back To List
        </button>
        <span style={{ color: WP.border }}>›</span>
        <span style={{ fontSize: isMobile ? 12 : 14, color: WP.text, fontWeight: 600 }}>
          {editingId ? "Edit Page" : "Add New Page"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <BtnDanger onClick={goToList}><FaTimes size={10} /> Close</BtnDanger>
        <BtnSecondary size="sm" onClick={() => fullUrlForForm && window.open(fullUrlForForm, "_blank", "noopener,noreferrer")} disabled={!fullUrlForForm}>
          <FaEye size={10} /> Preview
        </BtnSecondary>

        {/* Save / Update button — label changes based on publish state */}
        <BtnBlack onClick={() => handleSubmit(false)} disabled={saving}>
          <FaSave size={10} /> {saving ? "Saving…" : pageStatus.isPublished ? "Update Page" : "Save Draft"}
        </BtnBlack>

        {/* Publish button hides once published; a status pill + Move to Draft take its place */}
        {pageStatus.isPublished ? (
          <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: WP.greenDark, background: WP.greenBg, border: `1px solid ${WP.green}`, borderRadius: 3, padding: "0 10px", lineHeight: "2.15384615" }}>
              <FaCheck size={10} /> Published
            </span>
            <BtnSecondary size="sm" onClick={() => handleDraft(editingId)} disabled={saving || !editingId}>
              <FaFileAlt size={10} /> Move to Draft
            </BtnSecondary>
          </>
        ) : (
          <BtnGreen onClick={() => handleSubmit(true)} disabled={saving}>
            <FaCloudUploadAlt size={10} /> {saving ? "…" : "Publish"}
          </BtnGreen>
        )}

        {fullscreen ? (
          <button onClick={() => setIsFormFullscreen(false)} style={{ ...btnBase, background: WP.red, color: "#fff" }}>
            <FaCompress size={10} /> Exit Full Screen
          </button>
        ) : (
          <button onClick={() => setIsFormFullscreen(true)} style={{ ...btnBase, background: WP.blue, color: "#fff", padding: "0 8px", fontSize: isMobile ? 11 : 13 }}>
            <FaExpand size={10} /> Full Screen
          </button>
        )}
      </div>
    </div>
  );

  // --- Form Body (two‑column layout) ---
  const renderFormBody = () => {
    // const gridColumns = isMobile ? "1fr" : "minmax(0, 1fr) 300px";
    const gridColumns = isMobile
      ? "1fr"
      : "minmax(0, 1fr) 300px";
    return (
      <>
        <FlashMsg msg={message} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridColumns,
            gap: isMobile ? 12 : 16,
            padding: isMobile ? "12px" : "16px 20px",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {/* Left column: main content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            {/* Title */}
            <Card>
              <input
                name="titleEng" value={form.titleEng} onChange={handleTitleChange}
                placeholder="Add English title"
                style={{ ...fi, fontSize: isMobile ? 18 : 22, fontWeight: 400, padding: "6px 0", border: "none", borderBottom: `1px solid ${WP.line}`, borderRadius: 0, marginBottom: 10 }}
                onFocus={e => e.target.style.borderBottomColor = WP.focus}
                onBlur={e => e.target.style.borderBottomColor = WP.line}
              />
              <input
                name="titleHin" value={form.titleHin} onChange={handleChange}
                placeholder="शीर्षक दर्ज करें (Hindi title)"
                style={{ ...fi, fontSize: isMobile ? 14 : 16, padding: "5px 0", border: "none", borderBottom: `1px solid ${WP.line}`, borderRadius: 0 }}
                onFocus={e => e.target.style.borderBottomColor = WP.focus}
                onBlur={e => e.target.style.borderBottomColor = WP.line}
              />
            </Card>

            {/* URL / Slug structure */}
            <Card title="Page URL Structure">
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={lbl}>Base Slug</label>
                  <input name="baseSlug" value={form.baseSlug} onChange={handleBaseSlugChange} placeholder="e.g., notice-board" autoComplete="off" style={{ ...fi, fontSize: 13 }} {...focus} />
                  <p style={{ fontSize: 11, color: WP.textLight, margin: "4px 0 0" }}>First URL segment</p>
                </div>
                <div>
                  <label style={lbl}>Main Slug</label>
                  <input name="mainSlug" value={form.mainSlug} onChange={handleMainSlugChange} placeholder="e.g., tenders or seniority/head-office" autoComplete="off" style={{ ...fi, fontSize: 13 }} {...focus} />
                  <p style={{ fontSize: 11, color: WP.textLight, margin: "4px 0 0" }}>One or two segments (grouping)</p>
                </div>
                <div>
                  <label style={lbl}>Page Slug <span style={{ color: WP.red }}>*</span></label>
                  <input name="slug" value={form.slug} autoComplete="off" onChange={handleSlugChange} onBlur={handleSlugBlur} placeholder="e.g., annual-report-2026" style={{ ...fi, fontSize: 13, borderColor: slugError ? WP.red : WP.border }} />
                  {slugError ? (
                    <p style={{ fontSize: 11, color: WP.red, margin: "4px 0 0" }}>⚠ {slugError}</p>
                  ) : (
                    <p style={{ fontSize: 11, color: WP.textLight, margin: "4px 0 0" }}>Final unique segment</p>
                  )}
                </div>
              </div>

              <div style={{
                marginTop: 12, padding: "8px 10px", background: WP.blueBg, border: `1px solid ${WP.line}`,
                borderRadius: 4, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <FaLink size={11} style={{ color: WP.blue, flexShrink: 0 }} />
                {fullUrlForForm ? (
                  <a href={fullUrlForForm} target="_blank" rel="noopener noreferrer" style={{ color: WP.blue, fontSize: 12, wordBreak: "break-all", flex: 1, minWidth: 120, textDecoration: "none" }}>
                    {fullUrlForForm}
                  </a>
                ) : (
                  <span style={{ color: WP.textLight, fontSize: 12, flex: 1 }}>Fill base / main / page slug to preview the full URL</span>
                )}
                <CopyBtn text={fullUrlForForm} label="Copy URL" />
                {fullUrlForForm && (
                  <BtnSecondary size="sm" onClick={() => window.open(fullUrlForForm, "_blank", "noopener,noreferrer")}>
                    <FaEye size={10} /> Preview
                  </BtnSecondary>
                )}
              </div>
            </Card>

            {/* Main content editor */}
            <Card title="Page Main Content Area">
              <DynamicContentEditor
                engField="htmlContent"
                hinField="htmlContentHi"
                height={460}
                initialEn={form.htmlContent}
                initialHi={form.htmlContentHi}
                onChange={(contentObj) => {
                  setForm(prev => ({
                    ...prev,
                    htmlContent: contentObj.htmlContent,
                    htmlContentHi: contentObj.htmlContentHi,
                  }));
                }}
                instanceId="multi_section_editor"
              />
            </Card>

            {/* Documents section (inline) */}
            <Card
              title="📎 Documents"
              action={
                <BtnBlue size="sm" onClick={() => { resetDocForm(); setShowDocForm(true); }}>
                  <FaPlus size={10} /> Add Document
                </BtnBlue>
              }
            >
              {form.documentsUpdate.length > 0 ? (
                <div style={{ overflowX: "auto", marginBottom: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${WP.line}` }}>
                        <th style={{ padding: "4px 6px", textAlign: "left" }}>#</th>
                        <th style={{ padding: "4px 6px", textAlign: "left" }}>Title (EN)</th>
                        <th style={{ padding: "4px 6px", textAlign: "left" }}>Title (HI)</th>
                        <th style={{ padding: "4px 6px", textAlign: "left" }}>File</th>
                        <th style={{ padding: "4px 6px", textAlign: "left" }}>Size</th>
                        <th style={{ padding: "4px 6px", textAlign: "center" }}>Status</th>
                        <th style={{ padding: "4px 6px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.documentsUpdate.map((doc, idx) => {
                        const href = resolveFileHref(doc);
                        return (
                          <tr key={idx} style={{ borderBottom: `1px solid ${WP.line}` }}>
                            <td style={{ padding: "4px 6px" }}>{idx + 1}</td>
                            <td style={{ padding: "4px 6px" }}>{doc.titleEng || <span style={{ color: WP.textLight }}>—</span>}</td>
                            <td style={{ padding: "4px 6px" }}>{doc.titleHin || <span style={{ color: WP.textLight }}>—</span>}</td>
                            <td style={{ padding: "4px 6px" }}>
                              {doc.fileName ? (
                                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{getFileIcon(doc.fileType)} {doc.fileName}</span>
                              ) : <span style={{ color: WP.textLight }}>No file</span>}
                            </td>
                            <td style={{ padding: "4px 6px" }}>{doc.fileSize || "—"}</td>
                            <td style={{ padding: "4px 6px", textAlign: "center" }}>
                              <button
                                onClick={() => toggleDocumentActive(idx)}
                                title="Click to toggle"
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                              >
                                <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: doc.isActive !== false ? WP.greenBg : "#f8d7da", color: doc.isActive !== false ? WP.greenDark : "#a30000", border: `1px solid ${doc.isActive !== false ? WP.green : "#f5c6cb"}` }}>
                                  {doc.isActive !== false ? "Active" : "Inactive"}
                                </span>
                              </button>
                            </td>
                            <td style={{ padding: "4px 6px", textAlign: "right", whiteSpace: "nowrap" }}>
                              <BtnSecondary size="sm" onClick={() => href && window.open(href, "_blank", "noopener,noreferrer")} disabled={!href}>
                                <FaEye size={10} /> View
                              </BtnSecondary>
                              {' '}
                              <BtnSecondary size="sm" onClick={() => editDocument(idx)}><FaEdit size={10} /> Edit</BtnSecondary>
                              {' '}
                              <BtnDanger size="sm" onClick={() => deleteDocument(idx)}><FaTrashAlt size={10} /></BtnDanger>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: WP.textLight, margin: "8px 0", fontSize: 13 }}>No documents added yet. Click "Add Document" to attach a file.</p>
              )}

              {showDocForm && (
                <div style={{ marginTop: 12, padding: 12, border: `1px solid ${WP.border}`, borderRadius: 4, background: WP.blueBg }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={lbl}>Title (English) <span style={{ color: WP.red }}>*</span></label>
                      <input name="titleEng" type="text" autoComplete="off" value={currentDocument.titleEng} onChange={handleDocChange} placeholder="e.g., Recruitment Notice 2026" style={fi} />
                    </div>
                    <div>
                      <label style={lbl}>Title (Hindi) <span style={{ color: WP.red }}>*</span></label>
                      <input name="titleHin" type="text" autoComplete="off" value={currentDocument.titleHin} onChange={handleDocChange} placeholder="जैसे, भर्ती सूचना 2026" style={fi} />
                    </div>
                    <div>
                      <label style={lbl}>Short Description (English)</label>
                      <input name="shortDescriptionEn" value={currentDocument.shortDescriptionEn} onChange={handleDocChange} placeholder="Optional short note shown with the file" style={fi} />
                    </div>
                    <div>
                      <label style={lbl}>Short Description (Hindi)</label>
                      <input name="shortDescriptionHin" value={currentDocument.shortDescriptionHin} onChange={handleDocChange} placeholder="वैकल्पिक संक्षिप्त विवरण" style={fi} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={lbl}>File {editingDocIndex === null && <span style={{ color: WP.red }}>*</span>}</label>
                      <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" style={fi} />
                      {currentDocument.fileName && <small style={{ color: WP.greenDark, display: "block", marginTop: 4 }}>✓ {currentDocument.fileName} ({currentDocument.fileSize})</small>}
                      {editingDocIndex !== null && !currentDocument.file && currentDocument.fileUrl && (
                        <small style={{ color: WP.blue, display: "block", marginTop: 4 }}>Current file will be kept if no new file is uploaded</small>
                      )}
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, color: WP.text }}>
                        <input type="checkbox" name="isActive" checked={currentDocument.isActive !== false} onChange={handleDocChange} style={{ accentColor: WP.green }} />
                        Active (visible on site)
                      </label>
                    </div>
                    <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, marginTop: 4 }}>
                      <BtnGreen onClick={saveDocument}><FaSave size={10} /> {editingDocIndex !== null ? "Update Document" : "Add Document"}</BtnGreen>
                      <BtnDanger onClick={resetDocForm}><FaTimes size={10} /> Cancel</BtnDanger>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <Card title="Status & Actions">
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, borderBottom: `1px solid ${WP.line}` }}>
                  <span>Status: <strong style={{ color: pageStatus.isPublished ? WP.greenDark : WP.amber }}>{pageStatus.isPublished ? "Published" : "Draft"}</strong></span>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ accentColor: WP.green }} />
                  <span>Active (Visible on site)</span>
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <BtnBlack onClick={() => handleSubmit(false)} disabled={saving} size="sm">
                    <FaSave size={10} /> {saving ? "Saving…" : pageStatus.isPublished ? "Update Published Page" : editingId ? "Update Draft" : "Save Draft"}
                  </BtnBlack>
                  {!pageStatus.isPublished && (
                    <BtnGreen onClick={() => handleSubmit(true)} disabled={saving} size="sm"><FaCloudUploadAlt size={10} /> Publish</BtnGreen>
                  )}
                  {pageStatus.isPublished && editingId && (
                    <BtnSecondary onClick={() => handleDraft(editingId)} disabled={saving} size="sm"><FaFileAlt size={10} /> Move to Draft</BtnSecondary>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Department">
              <input name="department" value={form.department} onChange={handleChange} placeholder="e.g., Higher Education Department" style={{ ...fi, fontSize: 13 }} {...focus} />
            </Card>
            <Card title={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
                <span>Short Description -</span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setExcerptLang("en")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: excerptLang === "en" ? 600 : 400, color: excerptLang === "en" ? WP.blue : WP.textMid }}>English</button>
                  <button onClick={() => setExcerptLang("hi")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: excerptLang === "hi" ? 600 : 400, color: excerptLang === "hi" ? WP.blue : WP.textMid }}>Hindi</button>
                </div>
              </div>
            }>
              {excerptLang === "en"
                ? <textarea name="shortDescriptionEn" placeholder="Short Description English" value={form.shortDescriptionEn} onChange={handleChange} rows={4} style={{ ...fi, resize: "vertical" }} {...focus} />
                : <textarea
                  name="shortDescriptionHin"
                  placeholder="Short Description Hindi"
                  value={form.shortDescriptionHin}
                  onChange={handleChange}
                  rows={4}
                  style={{ ...fi, resize: "vertical" }}
                  {...focus}
                />}
            </Card>

            <Card title="Category">
              <select name="categoryId" value={form.categoryId} onChange={handleChange} style={{ ...fi, fontSize: 13 }} {...focus}>
                <option value="">— No Category —</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryNameEn}</option>)}
              </select>
              {form.categoryId && <p style={{ margin: "4px 0 0", fontSize: 11, color: WP.textLight }}>हिंदी: {categories.find(c => c._id === form.categoryId)?.categoryNameHi || "—"}</p>}
            </Card>

            <Card title="Tags">
              <input name="tags" value={form.tags} onChange={handleChange} placeholder="tag1, tag2, tag3" style={{ ...fi, fontSize: 13 }} {...focus} />
              <p style={{ margin: "3px 0 0", fontSize: 11, color: WP.textLight }}>Separate with commas</p>
            </Card>

            <Card title="SEO & Meta">
              <div>
                <label style={{ ...lbl, fontSize: 12 }}>Meta Keywords</label>
                <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="keyword1, keyword2" style={{ ...fi, fontSize: 12 }} {...focus} />
                <p style={{ margin: "3px 0 0", fontSize: 11, color: WP.textLight }}>Separate with commas</p>
              </div>
            </Card>
          </div>
        </div>
        <div style={{ height: 24 }} />
      </>
    );
  };

  // Escape key exits full screen as an extra safety hatch
  useEffect(() => {
    if (!isFormFullscreen) return;
    const onKey = (e) => { if (e.key === "Escape") setIsFormFullscreen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFormFullscreen]);

  // ============================================================
  // RENDER
  // ============================================================
  if (view === "form") {
    return (
      <div
        style={{
          background: WP.bg,
          fontFamily: FF,
          boxSizing: "border-box",
          ...(isFormFullscreen
            ? { position: "fixed", inset: 0, width: "100vw", height: "100vh", overflowY: "auto", overflowX: "hidden", zIndex: 2000 }
            : { width: "100%", minHeight: "100vh", overflowX: "hidden" }),
        }}
      >
        {renderFormTopBar(isFormFullscreen)}
        {/* <FormBody /> */}
        {renderFormBody()}
      </div>
    );
  }

  // ========== LIST VIEW ==========
  const thSt = { padding: "8px 10px", fontWeight: 700, color: WP.textMid, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", background: "#f6f7f7", borderBottom: `1px solid ${WP.line}`, textAlign: "left", cursor: "pointer", userSelect: "none" };
  const filters = [
    { k: "all", l: "All", count: counts.all },
    { k: "published", l: "Published", count: counts.published },
    { k: "draft", l: "Draft", count: counts.draft },
    { k: "active", l: "Active", count: counts.active },
    { k: "inactive", l: "Inactive", count: counts.inactive },
  ];
  const tdStyle = (isAction = false) => ({ padding: isMobile ? "6px 8px" : "8px 10px", verticalAlign: "middle", fontSize: isMobile ? 11 : 13, ...(isAction && { textAlign: "right" }) });

  return (
    <div style={{ background: WP.bg, minHeight: "100vh", fontFamily: FF }}>
      {/* Header */}
      <div style={{ background: WP.white, borderBottom: `1px solid ${WP.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <strong style={{ margin: 0, fontSize: isMobile ? 18 : 21, fontWeight: 400, color: WP.text }}>Multi‑Section Pages</strong>
        </div>
        <BtnBlue onClick={() => { resetForm(); setView("form"); }} size="sm"><FaPlus size={12} /> Add New Page</BtnBlue>
      </div>
      <div style={{ padding: "0 16px" }}><FlashMsg msg={message} /></div>

      {/* Filters */}
      <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 13, flexWrap: "wrap" }}>
          {filters.map((f, i) => (
            <React.Fragment key={f.k}>
              {i > 0 && <span style={{ color: WP.border, margin: "0 4px" }}>|</span>}
              <button onClick={() => changeFilter(f.k)}
                style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer", fontSize: isMobile ? 11 : 13, fontFamily: FF, color: filterStatus === f.k ? WP.text : WP.blue, fontWeight: filterStatus === f.k ? 600 : 400, textDecoration: "none", whiteSpace: "nowrap" }}
                onMouseEnter={e => { if (filterStatus !== f.k) e.currentTarget.style.color = WP.blueHov; }}
                onMouseLeave={e => { if (filterStatus !== f.k) e.currentTarget.style.color = WP.blue; }}>
                {f.l} <span style={{ color: WP.textLight }}>({f.count})</span>
              </button>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end", flexWrap: "wrap" }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by title…"
            style={{ ...fi, width: isMobile ? "calc(100% - 70px)" : 220, padding: "4px 8px", fontSize: 13 }}
            {...focus}
          />
          <BtnBlue size="sm" onClick={() => { setSearch(searchInput); setCurrentPage(1); }}>Search</BtnBlue>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            style={{ ...fi, width: "auto", padding: "4px 6px", fontSize: 12 }}
            title="Items per page"
          >
            {[10, 25, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ margin: "8px 16px" }}>
        <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => Math.max(1, p - 1))} onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><Spinner size="sm" /></div>
          ) : pages.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: WP.textMid }}>
              <p style={{ fontSize: 15, marginBottom: 12 }}>No pages found.</p>
              <BtnBlue onClick={() => { resetForm(); setView("form"); }}>Add New Page</BtnBlue>
            </div>
          ) : (
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 11 : 13, minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={thSt}>#</th>
                    <th style={thSt} onClick={() => handleSort("titleEng")}>Title{sortIcon("titleEng")}</th>
                    <th style={thSt}>Permalink</th>
                    <th style={thSt}>Department</th>
                    <th style={{ ...thSt, textAlign: "center" }}>Docs</th>
                    <th style={thSt} onClick={() => handleSort("isPublished")}>Status{sortIcon("isPublished")}</th>
                    <th style={{ ...thSt, textAlign: "right", cursor: "default" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((item, idx) => {
                    const path = buildFullPath(item);
                    const fullUrl = buildFullUrl(item);
                    return (
                      <tr key={item._id} onMouseEnter={() => setHoveredRow(item._id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderBottom: `1px solid ${WP.line}`, background: hoveredRow === item._id ? "#f9f9f9" : WP.white }}>
                        <td style={tdStyle()}>{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td style={tdStyle()}>
                          <strong>{item.titleEng || "Untitled"}</strong>
                          {item.titleHin && <div style={{ fontSize: 11, color: WP.textLight, marginTop: 2 }}>{item.titleHin}</div>}
                        </td>
                        <td style={tdStyle()}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, maxWidth: 320 }}>
                            <FaLink size={9} style={{ color: WP.textLight, flexShrink: 0 }} />
                            {path ? (
                              <a href={fullUrl} target="_blank" rel="noopener noreferrer" title={fullUrl} style={{ color: WP.blue, textDecoration: "none", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                /{path}
                              </a>
                            ) : (
                              <span style={{ color: WP.textLight, fontSize: 11 }}>No slug set</span>
                            )}
                            <CopyBtn text={path ? fullUrl : ""} />
                          </div>
                        </td>
                        <td style={tdStyle()}>{item.department || <span style={{ color: WP.textLight }}>—</span>}</td>
                        <td style={{ ...tdStyle(), textAlign: "center" }}>
                          <span style={{ display: "inline-block", minWidth: 20, padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: WP.blueBg, color: WP.blue }}>
                            {item.documentsUpdate?.length || 0}
                          </span>
                        </td>
                        <td style={tdStyle()}><StatusBadge published={item.isPublished} active={item.isActive} /></td>
                        <td style={{ ...tdStyle(true) }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <BtnSecondary size="sm" onClick={() => path && window.open(fullUrl, "_blank", "noopener,noreferrer")} disabled={!path}>
                              <FaEye size={11} /> {!isMobile && "View"}
                            </BtnSecondary>
                            <BtnSecondary size="sm" onClick={() => handleEdit(item)}><FaEdit size={11} /> {!isMobile && "Edit"}</BtnSecondary>
                            {item.isPublished
                              ? <BtnSecondary size="sm" onClick={() => handleDraft(item._id)}><FaFileAlt size={11} /> {!isMobile && "Draft"}</BtnSecondary>
                              : <BtnGreen size="sm" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={11} /> {!isMobile && "Publish"}</BtnGreen>}
                            <BtnDanger size="sm" onClick={() => handleDelete(item._id, item.titleEng)}><FaTrashAlt size={11} /> {!isMobile && "Delete"}</BtnDanger>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => Math.max(1, p - 1))} onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))} />
        </div>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
};

export default MultiSectionPagesManagement;