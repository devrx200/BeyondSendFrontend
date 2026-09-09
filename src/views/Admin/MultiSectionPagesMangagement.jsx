import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Spinner, Card as ReactstrapCard, CardHeader, CardBody, Button, UncontrolledTooltip } from "reactstrap";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand, FaCompress, FaTimes,
  FaPlus, FaFilePdf, FaFileWord, FaFileExcel, FaFolder
} from "react-icons/fa";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";
import { encodeBase64, decodeBase64 } from "../../utilities/rXBase64";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";
import PageLoader from "../../components/PageLoader";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;





const getToken = () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) return "";
  try {
    const parsed = JSON.parse(token);
    return parsed?.token || parsed?.access || token;
  } catch {
    return token;
  }
};

const authH = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback...", err);
  }
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Fallback copy failed", err);
    return false;
  }
};

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

// --- Reusable CSS component wrappers ---
const BtnBlue = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} className={`wp-btn wp-btn-blue ${size === "sm" ? "wp-btn-sm" : ""}`}>
    {children}
  </button>
);
const BtnGreen = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} className={`wp-btn wp-btn-green ${size === "sm" ? "wp-btn-sm" : ""}`}>
    {children}
  </button>
);
const BtnBlack = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} className={`wp-btn wp-btn-black ${size === "sm" ? "wp-btn-sm" : ""}`}>
    {children}
  </button>
);
const BtnSecondary = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} className={`wp-btn wp-btn-secondary ${size === "sm" ? "wp-btn-sm" : ""}`}>
    {children}
  </button>
);
const BtnDanger = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} className={`wp-btn wp-btn-danger ${size === "sm" ? "wp-btn-sm" : ""}`}>
    {children}
  </button>
);

const LinkBtn = ({ children, onClick, color }) => (
  <button onClick={onClick} className={`wp-link-btn ${color === "var(--wp-red)" || color === "#d63638" ? "is-danger" : color === "var(--wp-green)" ? "is-green" : ""}`}>
    {children}
  </button>
);

const StatusBadge = ({ published, active }) => (
  <div className="wp-status-badge-wrap">
    <span className={`wp-status-badge ${published ? "wp-badge-published" : "wp-badge-draft"}`}>
      {published ? "Published" : "Draft"}
    </span>
    <span className={`wp-status-badge ${active ? "wp-badge-active" : "wp-badge-inactive"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

const CopyBtn = ({ text, label, id }) => {
  const [copied, setCopied] = useState(false);
  const autoId = useMemo(() => id || (text ? `cp-${Math.random().toString(36).substring(2, 9)}` : undefined), [id, text]);
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };
  return (
    <>
      <button
        id={autoId}
        onClick={handleCopy}
        disabled={!text}
        type="button"
        className={`wp-copy-btn ${copied ? "is-copied" : ""}`}>
        {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
        {copied ? "Copied" : (label || "Copy")}
      </button>
      {autoId && (
        <UncontrolledTooltip placement="top" target={autoId}>
          {copied ? "Copied to clipboard!" : "Copy page URL"}
        </UncontrolledTooltip>
      )}
    </>
  );
};

const Card = ({ title, children, action }) => (
  <div className="wp-card">
    {title && (
      <div className="wp-card-header">
        <h2 className="wp-card-title">{title}</h2>
        {action}
      </div>
    )}
    <div className="wp-card-body">{children}</div>
  </div>
);



const Pagination = ({ currentPage, totalPages, totalItems, shown, onPrev, onNext }) => (
  <div className="wp-pagination">
    <span>{shown} of {totalItems} items</span>
    {totalPages > 1 && (
      <div className="wp-pagination-controls">
        <button disabled={currentPage === 1} onClick={onPrev} className="wp-btn wp-btn-secondary wp-btn-sm">‹</button>
        <span>{currentPage}/{totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={onNext} className="wp-btn wp-btn-secondary wp-btn-sm">›</button>
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

// --- Auto-detect Department from logged in user / employeeType ---
export const getCurrentUserDepartment = () => {
  try {
    const raw = sessionStorage.getItem("userData");
    const user = raw ? JSON.parse(raw) : null;
    if (user?.department && typeof user.department === "string" && user.department.trim()) {
      return user.department.trim();
    }
    const empType = (
      sessionStorage.getItem("employeeType") ||
      user?.employeeType ||
      window.employeeType ||
      ""
    ).toUpperCase();

    if (empType === "DIRECTORATE") return "Directorate of Higher Education";
    if (empType === "DEPARTMENT") return "Department of Higher Education";
    return user?.office || "Department of Higher Education";
  } catch {
    return "Department of Higher Education";
  }
};

// --- Initial form state ---
const emptyForm = () => ({
  titleEng: "",
  titleHin: "",
  baseSlug: "",
  mainSlug: "",
  slug: "",
  department: getCurrentUserDepartment(),
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
      if (s) {
        const parsed = JSON.parse(s);
        if (!parsed.department) {
          parsed.department = getCurrentUserDepartment();
        }
        return parsed;
      }
      return emptyForm();
    } catch { return emptyForm(); }
  };
  const initFullscreen = () => sessionStorage.getItem(SS_FULLSCREEN) === "true";

  // --- State ---
  const { toasts, toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState([]);
  const [editingId, setEditingId] = useState(initEditingId);
  const [view, setView] = useState(initView);
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [selectedBaseSlug, setSelectedBaseSlug] = useState("");
  const [selectedMainSlug, setSelectedMainSlug] = useState("");

  const availableBaseSlugs = useMemo(() => {
    const set = new Set();
    pages.forEach(p => {
      if (p.baseSlug && typeof p.baseSlug === "string" && p.baseSlug.trim()) {
        set.add(p.baseSlug.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [pages]);

  const availableMainSlugs = useMemo(() => {
    const set = new Set();
    pages.forEach(p => {
      if (selectedBaseSlug && (p.baseSlug || "").trim() !== selectedBaseSlug) return;
      if (p.mainSlug && typeof p.mainSlug === "string" && p.mainSlug.trim()) {
        set.add(p.mainSlug.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [pages, selectedBaseSlug]);

  const filteredPages = useMemo(() => {
    return pages.filter(item => {
      if (selectedBaseSlug && (item.baseSlug || "").trim() !== selectedBaseSlug) return false;
      if (selectedMainSlug && (item.mainSlug || "").trim() !== selectedMainSlug) return false;
      return true;
    });
  }, [pages, selectedBaseSlug, selectedMainSlug]);
  const [isFormFullscreen, setIsFormFullscreen] = useState(initFullscreen);
  const [excerptLang, setExcerptLang] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showDocForm, setShowDocForm] = useState(false);
  const [editingDocIndex, setEditingDocIndex] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(emptyDocument());
  const [descEnManuallyEdited, setDescEnManuallyEdited] = useState(false);
  const [descHiManuallyEdited, setDescHiManuallyEdited] = useState(false);

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
      const rawData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPages(rawData);
      const total = res.data?.pagination?.totalDocuments ?? res.data?.pagination?.totalItems ?? rawData.length;
      setTotalItems(total);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      if (filterStatus === "all" && !search) {
        setCounts({
          all: total,
          published: rawData.filter(p => p.isPublished).length,
          draft: rawData.filter(p => !p.isPublished).length,
          active: rawData.filter(p => p.isActive !== false).length,
          inactive: rawData.filter(p => p.isActive === false).length,
        });
      } else {
        setCounts(prev => ({
          ...prev,
          [filterStatus]: total,
        }));
      }
    } catch (err) {
      console.error("Error loading data:", err);
      toast.error(err.response?.data?.message || err.message || "Error loading pages");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, sortBy, sortOrder, currentPage, pageSize]);

  useEffect(() => {
    if (view !== "list") return;
    loadData(currentPage);
  }, [view, currentPage, filterStatus, sortBy, sortOrder, search, pageSize]);

  // --- Top bar for form ---
  const renderFormTopBar = (fullscreen) => (
    <div className={`wp-top-bar ${fullscreen ? "is-fullscreen" : ""}`}>
      <div className="wp-top-bar-left">
        <button type="button" onClick={goToList} className="wp-link-btn">
          <FaArrowLeft size={11} /> Back To List
        </button>
        <span className="wp-crumb-sep">›</span>
        <span className="wp-top-bar-title">
          {editingId ? "Edit Page" : "Add New Page"}
        </span>
      </div>
      <div className="wp-top-bar-right">
        {!fullscreen && (
          <button type="button" onClick={goToList} className="wp-btn wp-btn-danger">
            <FaTimes size={10} /> {!isMobile && "Close"}
          </button>
        )}

        <button
          type="button"
          onClick={() => fullUrlForForm && window.open(fullUrlForForm, "_blank", "noopener,noreferrer")}
          disabled={!fullUrlForForm}
          className="wp-btn wp-btn-secondary"
        >
          <FaEye size={10} /> {!isMobile && "Preview"}
        </button>

        {/* Save / Update button */}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="wp-btn wp-btn-black"
        >
          <FaSave size={10} /> {saving ? "Saving…" : pageStatus.isPublished ? "Update Page" : "Save Draft"}
        </button>

        {/* Publish button / Status pill + Move to Draft */}
        {pageStatus.isPublished ? (
          <>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="wp-btn wp-btn-outline-green"
            >
              <FaCheck size={10} /> Published
            </button>
            <button
              type="button"
              onClick={() => handleDraft(editingId)}
              disabled={saving || !editingId}
              className="wp-btn wp-btn-secondary"
            >
              <FaFileAlt size={10} /> {!isMobile && "Move to Draft"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="wp-btn wp-btn-green"
          >
            <FaCloudUploadAlt size={10} /> {saving ? "…" : "Publish"}
          </button>
        )}

        {fullscreen ? (
          <button type="button" onClick={() => setIsFormFullscreen(false)} className="wp-btn wp-btn-danger">
            <FaCompress size={10} /> {!isMobile && "Exit Full Screen"}
          </button>
        ) : (
          <button type="button" onClick={() => setIsFormFullscreen(true)} className="wp-btn wp-btn-blue">
            <FaExpand size={10} /> {!isMobile && "Full Screen"}
          </button>
        )}
      </div>
    </div>
  );

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
    setDescEnManuallyEdited(false);
    setDescHiManuallyEdited(false);
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
    if (name === "shortDescriptionEn") setDescEnManuallyEdited(true);
    if (name === "shortDescriptionHin") setDescHiManuallyEdited(true);
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(prev => {
      const updates = { titleEng: title };
      if (!slugManuallyEdited) {
        const newSlug = titleToSlug(title);
        updates.slug = newSlug;
        setSlugError(validateSlug(newSlug));
      }
      if (!descEnManuallyEdited || !prev.shortDescriptionEn || prev.shortDescriptionEn === prev.titleEng) {
        updates.shortDescriptionEn = title;
      }
      return { ...prev, ...updates };
    });
  };

  const handleTitleHinChange = (e) => {
    const title = e.target.value;
    setForm(prev => {
      const updates = { titleHin: title };
      if (!descHiManuallyEdited || !prev.shortDescriptionHin || prev.shortDescriptionHin === prev.titleHin) {
        updates.shortDescriptionHin = title;
      }
      return { ...prev, ...updates };
    });
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
      toast.warning("File Too Large: Max 30 MB");
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
      toast.warning("Title in both languages required");
      return;
    }
    if (editingDocIndex === null && !currentDocument.file) {
      toast.warning("Please upload a file");
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
      toast.error(err.response?.data?.message || err.message);
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
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const deleteDocument = async (index) => {
    const isConfirmed = await wpSwal.confirm("Delete Document?", "This cannot be undone");
    if (!isConfirmed) return;
    if (!editingId) {
      const updatedDocs = form.documentsUpdate.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
      return;
    }
    try {
      const docId = form.documentsUpdate[index]._id;
      if (!docId) throw new Error("Document ID missing");
      const res = await axios.delete(`${API}/api/delete-document/${editingId}/${docId}`, { headers: authH() });
      toast.success(res.data?.message || "Document deleted successfully.");
      const updatedDocs = form.documentsUpdate.filter((_, i) => i !== index);
      setForm(prev => ({ ...prev, documentsUpdate: updatedDocs }));
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
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
    htmlContent: encodeBase64(form.htmlContent || ""),
    htmlContentHi: encodeBase64(form.htmlContentHi || ""),
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
    const fields = ["titleEng", "titleHin", "baseSlug", "mainSlug", "slug", "department"];
    fields.forEach(key => fd.append(key, form[key]));
    fd.append("htmlContent", encodeBase64(form.htmlContent || ""));
    fd.append("htmlContentHi", encodeBase64(form.htmlContentHi || ""));
    fd.append("isActive", form.isActive);
    if (form.categoryId) fd.append("categoryId", form.categoryId);
    if (form.shortDescriptionEn) fd.append("shortDescriptionEn", form.shortDescriptionEn);
    if (form.shortDescriptionHin) fd.append("shortDescriptionHin", form.shortDescriptionHin);
    fd.append("metaKeywords", JSON.stringify(form.metaKeywords.split(",").map(x => x.trim()).filter(Boolean)));
    fd.append("tags", JSON.stringify(form.tags.split(",").map(x => x.trim()).filter(Boolean)));

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

  const handleSubmit = async (publish = false) => {
    if (!form.titleEng?.trim()) {
      toast.warning("English title is required before saving.");
      return;
    }
    if (!form.titleHin?.trim()) {
      toast.warning("Hindi title is required before saving.");
      return;
    }
    if (!form.slug?.trim()) {
      setSlugError("Slug is required");
      toast.warning("Page slug is required before saving.");
      return;
    }
    const err = validateSlug(form.slug);
    if (err) {
      setSlugError(err);
      toast.error("Fix slug errors before saving.");
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

      const savedId = res.data?.data?._id || res.data?._id;
      if (!editingId && savedId) setEditingId(savedId);
      let lastRes = res;
      if (publish && savedId) {
        lastRes = await axios.post(`${API}/api/publish-content/${savedId}`, {}, { headers: authH() });
        setPageStatus({ isPublished: true, isDraft: false });
      }
      toast.success(lastRes.data?.message || (publish ? "Page published successfully." : pageStatus.isPublished ? "Published page updated." : "Draft saved."));
      loadData(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // --- Publish / Draft (used both from the list and from inside the form) ---
  const handlePublish = async (id) => {
    try {
      const res = await axios.post(`${API}/api/publish-content/${id}`, {}, { headers: authH() });
      if (id === editingId) setPageStatus({ isPublished: true, isDraft: false });
      toast.success(res.data?.message || "Page published.");
      loadData(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDraft = async (id) => {
    try {
      const res = await axios.post(`${API}/api/draft-content/${id}`, {}, { headers: authH() });
      if (id === editingId) setPageStatus({ isPublished: false, isDraft: true });
      toast.info(res.data?.message || "Page moved to draft.");
      loadData(currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = await wpSwal.confirm("Delete Content?", `Permanently delete <strong>"${title || "Untitled"}"</strong>?<br>This cannot be undone.`);
    if (!isConfirmed) return;
    try {
      const res = await axios.delete(`${API}/api/delete-content/${id}`, { headers: authH() });
      toast.success(res.data?.message || "Content deleted successfully.");
      if (pages.length === 1 && currentPage > 1) {
        setCurrentPage(p => p - 1);
      } else {
        loadData(currentPage);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
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
      htmlContent: decodeBase64(item.htmlContent || ""),
      htmlContentHi: decodeBase64(item.htmlContentHi || ""),
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

  const formatWpDate = (item) => {
    const d = item.isPublished && item.publishDate ? item.publishDate : item.updatedAt || item.createdAt;
    if (!d) return "—";
    const dateObj = new Date(d);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const hours = dateObj.getHours();
    const mins = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    return `${yyyy}/${mm}/${dd} at ${formattedHours}:${mins} ${ampm}`;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPages.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApply = async () => {
    if (!bulkAction) {
      toast.warning("Please select a bulk action.");
      return;
    }
    if (selectedIds.length === 0) {
      toast.warning("No items selected.");
      return;
    }
    const count = selectedIds.length;
    const label = count === 1 ? "page" : "pages";
    if (bulkAction === "trash") {
      const isConfirmed = await wpSwal.confirm(`Delete ${count} ${label}?`, "This will permanently remove the selected pages.");
      if (!isConfirmed) return;
      try {
        await Promise.all(selectedIds.map(id => axios.delete(`${API}/api/delete-content/${id}`, { headers: authH() })));
        toast.success(`${count} ${label} deleted.`);
        setSelectedIds([]);
        setBulkAction("");
        loadData(currentPage);
      } catch (err) {
        toast.error("Failed to delete some items.");
        loadData(currentPage);
      }
    } else if (bulkAction === "publish") {
      try {
        await Promise.all(selectedIds.map(id => axios.post(`${API}/api/publish-content/${id}`, {}, { headers: authH() })));
        toast.success(`${count} ${label} published.`);
        setSelectedIds([]);
        setBulkAction("");
        loadData(currentPage);
      } catch (err) {
        toast.error("Failed to publish some items.");
        loadData(currentPage);
      }
    } else if (bulkAction === "draft") {
      try {
        await Promise.all(selectedIds.map(id => axios.post(`${API}/api/draft-content/${id}`, {}, { headers: authH() })));
        toast.info(`${count} ${label} moved to draft.`);
        setSelectedIds([]);
        setBulkAction("");
        loadData(currentPage);
      } catch (err) {
        toast.error("Failed to update some items.");
        loadData(currentPage);
      }
    }
  };



  // --- Form Body (two-column layout) ---
  const renderFormBody = () => {
    return (
      <div className="wp-grid-2col">
        {/* Left column */}
        <div className="wp-grid-col-main">
          {/* Titles */}
          <Card>
            <input
              type="text"
              name="titleEng"
              value={form.titleEng}
              onChange={handleTitleChange}
              autoComplete="off"
              placeholder="Add English title"
              className="wp-input wp-title-input-en"
            />
            <input
              type="text"
              name="titleHin"
              value={form.titleHin}
              onChange={handleTitleHinChange}
              placeholder="शीर्षक दर्ज करें (Hindi title)"
              className="wp-input wp-title-input-hi"
            />
          </Card>

          {/* URL / Slug structure */}
          <Card title="Page URL Structure">
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 10 }}>
              <div>
                <label className="wp-label">Base Slug</label>
                <input name="baseSlug" value={form.baseSlug} onChange={handleBaseSlugChange} placeholder="e.g., notice-board" autoComplete="off" className="wp-input" />
                <p className="wp-help-text">First URL segment</p>
              </div>
              <div>
                <label className="wp-label">Main Slug</label>
                <input name="mainSlug" value={form.mainSlug} onChange={handleMainSlugChange} placeholder="e.g., tenders" autoComplete="off" className="wp-input" />
                <p className="wp-help-text">Grouping segment</p>
              </div>
              <div>
                <label className="wp-label">Page Slug <span className="wp-error-text">*</span></label>
                <input name="slug" value={form.slug} autoComplete="off" onChange={handleSlugChange} onBlur={handleSlugBlur} placeholder="e.g., annual-report-2026" className={`wp-input ${slugError ? "is-invalid" : ""}`} />
                {slugError ? (
                  <p className="wp-error-text">⚠ {slugError}</p>
                ) : form.slug ? (
                  <p className="wp-help-text text-success">✓ Auto-generated from Title</p>
                ) : (
                  <p className="wp-help-text">Auto-generates as you type Title</p>
                )}
              </div>
            </div>

            <div className="wp-permalink-row mt-2">
              <FaLink size={11} style={{ color: "var(--wp-blue)", flexShrink: 0 }} />
              {fullUrlForForm ? (
                <a href={fullUrlForForm} target="_blank" rel="noopener noreferrer" style={{ color: "var(--wp-blue)", fontSize: 12, wordBreak: "break-all", flex: 1, minWidth: 120, textDecoration: "none" }}>
                  {fullUrlForForm}
                </a>
              ) : (
                <span className="wp-count-text" style={{ fontSize: 12, flex: 1 }}>Fill base / main / page slug to preview full URL</span>
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
              key={editingId || "new"}
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
              instanceId={`multi_section_editor_${editingId || "new"}`}
            />
          </Card>

          {/* Documents section */}
          <Card
            title="📎 Documents"
            action={
              <BtnBlue size="sm" onClick={() => { resetDocForm(); setShowDocForm(true); }}>
                <FaPlus size={10} /> Add Document
              </BtnBlue>
            }
          >
            {form.documentsUpdate.length > 0 ? (
              <div className="wp-table-wrapper mb-3">
                <table className="wp-table">
                  <thead>
                    <tr>
                      <th className="wp-th" style={{ width: 30 }}>#</th>
                      <th className="wp-th">Title (EN)</th>
                      <th className="wp-th">Title (HI)</th>
                      <th className="wp-th">File</th>
                      <th className="wp-th">Size</th>
                      <th className="wp-th text-center">Status</th>
                      <th className="wp-th text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.documentsUpdate.map((doc, idx) => {
                      const href = resolveFileHref(doc);
                      return (
                        <tr key={idx} className="wp-tr-hover">
                          <td className="wp-td">{idx + 1}</td>
                          <td className="wp-td fw-medium">{doc.titleEng || <span className="wp-count-text">—</span>}</td>
                          <td className="wp-td">{doc.titleHin || <span className="wp-count-text">—</span>}</td>
                          <td className="wp-td">
                            {doc.fileName ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{getFileIcon(doc.fileType)} {doc.fileName}</span>
                            ) : <span className="wp-count-text">No file</span>}
                          </td>
                          <td className="wp-td">{doc.fileSize || "—"}</td>
                          <td className="wp-td text-center">
                            <button
                              onClick={() => toggleDocumentActive(idx)}
                              title="Click to toggle"
                              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                              <span className={`wp-status-badge ${doc.isActive !== false ? "wp-badge-active" : "wp-badge-inactive"}`}>
                                {doc.isActive !== false ? "Active" : "Inactive"}
                              </span>
                            </button>
                          </td>
                          <td className="wp-td text-end text-nowrap">
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
              <p className="wp-help-text my-2">No documents added yet. Click "Add Document" to attach a file.</p>
            )}

            {showDocForm && (
              <div className="p-3 border rounded mt-2" style={{ background: "var(--wp-blue-bg)", borderColor: "var(--wp-border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="wp-label">Title (English) <span className="wp-error-text">*</span></label>
                    <input name="titleEng" type="text" autoComplete="off" value={currentDocument.titleEng} onChange={handleDocChange} placeholder="e.g., Recruitment Notice 2026" className="wp-input" />
                  </div>
                  <div>
                    <label className="wp-label">Title (Hindi) <span className="wp-error-text">*</span></label>
                    <input name="titleHin" type="text" autoComplete="off" value={currentDocument.titleHin} onChange={handleDocChange} placeholder="जैसे, भर्ती सूचना 2026" className="wp-input" />
                  </div>
                  <div>
                    <label className="wp-label">Short Description (English)</label>
                    <input name="shortDescriptionEn" value={currentDocument.shortDescriptionEn} onChange={handleDocChange} placeholder="Optional short note" className="wp-input" />
                  </div>
                  <div>
                    <label className="wp-label">Short Description (Hindi)</label>
                    <input name="shortDescriptionHin" value={currentDocument.shortDescriptionHin} onChange={handleDocChange} placeholder="वैकल्पिक विवरण" className="wp-input" />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="wp-label">File {editingDocIndex === null && <span className="wp-error-text">*</span>}</label>
                    <input type="file" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx" className="wp-input" />
                    {currentDocument.fileName && <small className="wp-help-text d-block mt-1" style={{ color: "var(--wp-green-dark)" }}>✓ {currentDocument.fileName} ({currentDocument.fileSize})</small>}
                    {editingDocIndex !== null && !currentDocument.file && currentDocument.fileUrl && (
                      <small className="wp-help-text d-block mt-1" style={{ color: "var(--wp-blue)" }}>Current file will be kept if no new file is uploaded</small>
                    )}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="wp-checkbox-label">
                      <input type="checkbox" name="isActive" checked={currentDocument.isActive !== false} onChange={handleDocChange} className="wp-checkbox-input" />
                      <span>Active (visible on site)</span>
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
        <div className="wp-grid-col-side">
          <Card title="Status & Actions">
            <div className="wp-publish-status-row">
              <span className="wp-label">Status:</span>
              <strong className={pageStatus.isPublished ? "wp-status-published" : "wp-status-draft"}>
                {pageStatus.isPublished ? "Published" : "Draft"}
              </strong>
            </div>
            <label className="wp-checkbox-label mt-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="wp-checkbox-input" />
              <span>Active (Visible on site & Preview)</span>
            </label>
            <div className="wp-publish-actions mt-2">
              <button type="button" onClick={() => handleSubmit(false)} disabled={saving} className="wp-btn wp-btn-black wp-btn-full">
                <FaSave size={10} /> {saving ? "Saving…" : pageStatus.isPublished ? "Update Published Page" : editingId ? "Update Draft" : "Save Draft"}
              </button>
              {!pageStatus.isPublished && (
                <button type="button" onClick={() => handleSubmit(true)} disabled={saving} className="wp-btn wp-btn-green wp-btn-full mt-1">
                  <FaCloudUploadAlt size={10} /> {saving ? "Publishing..." : "Publish"}
                </button>
              )}
              {pageStatus.isPublished && editingId && (
                <button type="button" onClick={() => handleDraft(editingId)} disabled={saving} className="wp-btn wp-btn-secondary wp-btn-full mt-1">
                  <FaFileAlt size={10} /> Move to Draft
                </button>
              )}
              <div className="wp-publish-discard mt-2">
                <button type="button" onClick={resetForm} className="wp-link-btn is-danger">
                  <FaTrashAlt size={9} /> Discard Changes
                </button>
              </div>
            </div>
          </Card>

          <Card title="Published By - Department">
            <input name="department" value={form.department} onChange={handleChange} placeholder="e.g., Higher Education Department" className="wp-input" />
          </Card>

          <Card title={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
              <span>Short Description</span>
              <div style={{ display: "flex", gap: 12 }}>
                <button type="button" onClick={() => setExcerptLang("en")} className={`wp-link-btn ${excerptLang === "en" ? "fw-bold" : "wp-count-text"}`}>English</button>
                <button type="button" onClick={() => setExcerptLang("hi")} className={`wp-link-btn ${excerptLang === "hi" ? "fw-bold" : "wp-count-text"}`}>Hindi</button>
              </div>
            </div>
          }>
            {excerptLang === "en"
              ? <textarea name="shortDescriptionEn" placeholder="Short Description English" value={form.shortDescriptionEn} onChange={handleChange} rows={4} className="wp-textarea" />
              : <textarea
                name="shortDescriptionHin"
                placeholder="Short Description Hindi"
                value={form.shortDescriptionHin}
                onChange={handleChange}
                rows={4}
                className="wp-textarea"
              />}
          </Card>

          <Card title="Category">
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className="wp-select">
              <option value="">— No Category —</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.categoryNameEn}</option>)}
            </select>
            {form.categoryId && <p className="wp-help-text">हिंदी: {categories.find(c => c._id === form.categoryId)?.categoryNameHi || "—"}</p>}
          </Card>

          <Card title="Tags">
            <input name="tags" value={form.tags} onChange={handleChange} placeholder="tag1, tag2, tag3" className="wp-input" />
            <p className="wp-help-text">Separate with commas</p>
          </Card>

          <Card title="SEO & Meta">
            <label className="wp-label">Meta Keywords</label>
            <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange} placeholder="keyword1, keyword2" className="wp-input" />
            <p className="wp-help-text">Separate with commas</p>
          </Card>
        </div>
      </div>
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
      <div className={isFormFullscreen ? "wp-form-fullscreen" : "wp-page-wrap"}>
        <ToastContainer toasts={toasts} onRemove={toast.remove} />
        {renderFormTopBar(isFormFullscreen)}
        {renderFormBody()}
      </div>
    );
  }

  // ========== LIST VIEW ==========
  const filters = [
    { k: "all", l: "All", count: counts.all },
    { k: "published", l: "Published", count: counts.published },
    { k: "draft", l: "Draft", count: counts.draft },
    { k: "active", l: "Active", count: counts.active },
    { k: "inactive", l: "Inactive", count: counts.inactive },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={toast.remove} />
      {/* PAGE HEADER */}
      <ReactstrapCard className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1">
              <FaFileAlt className="me-2" /> Multi-Section Pages Management
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              Manage rich HTML/component pages with custom dynamic elements & documents
            </p>
          </div>
          <Button color="primary" onClick={() => { resetForm(); setView("form"); }}>
            <FaPlus className="me-1" /> Add New Page
          </Button>
        </CardHeader>
      </ReactstrapCard>

      <ReactstrapCard className="adm-card shadow-sm border-0 mb-4">
        <CardBody>

          {/* FILTER BAR */}
          <div className="wp-filter-bar mb-3">
            <div className="wp-filter-tabs">
              {filters.map((f, i) => (
                <React.Fragment key={f.k}>
                  {i > 0 && <span className="wp-filter-sep">|</span>}
                  <button
                    onClick={() => changeFilter(f.k)}
                    className={`wp-filter-tab-btn ${filterStatus === f.k ? "is-active" : ""}`}
                  >
                    {f.l} <span className="wp-count-text">({f.count})</span>
                  </button>
                </React.Fragment>
              ))}
            </div>

            {/* BASE SLUG & MAIN SLUG FILTERS */}
            <div className="wp-slug-filters">
              <select
                value={selectedBaseSlug}
                onChange={e => {
                  setSelectedBaseSlug(e.target.value);
                  setSelectedMainSlug("");
                }}
                className="wp-slug-select"
                title="Filter by Base Slug"
              >
                <option value="">All Base Slugs {availableBaseSlugs.length > 0 ? `(${availableBaseSlugs.length})` : ""}</option>
                {availableBaseSlugs.map(slug => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>

              <select
                value={selectedMainSlug}
                onChange={e => setSelectedMainSlug(e.target.value)}
                className="wp-slug-select"
                title="Filter by Main Slug"
              >
                <option value="">All Main Slugs {availableMainSlugs.length > 0 ? `(${availableMainSlugs.length})` : ""}</option>
                {availableMainSlugs.map(slug => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>

              {(selectedBaseSlug || selectedMainSlug) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBaseSlug("");
                    setSelectedMainSlug("");
                  }}
                  className="wp-btn-clear-filters"
                  title="Clear slug filters"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="wp-search-box">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by title…"
                className="wp-input wp-search-input"
              />
              <BtnBlue size="sm" onClick={() => { setSearch(searchInput); setCurrentPage(1); }}>Search</BtnBlue>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="wp-input w-auto text-center"
                title="Items per page"
              >
                {[10, 25, 50, 100, 200].map(n => <option key={n} value={n}>{n} / page</option>)}
              </select>
            </div>
          </div>

          <div className="wp-table-container">
            <div className="wp-tablenav">
              <div className="wp-tablenav-left">
                <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
                  <option value="">Bulk actions</option>
                  <option value="trash">Move to Trash</option>
                  <option value="publish">Publish</option>
                  <option value="draft">Move to Draft</option>
                </select>
                <button type="button" className="wp-btn wp-btn-secondary wp-btn-sm" onClick={handleBulkApply}>Apply</button>
              </div>
              <div className="wp-tablenav-right">
                <span className="wp-count-text">
                  {(selectedBaseSlug || selectedMainSlug) ? `${filteredPages.length} of ${totalItems}` : totalItems} {totalItems === 1 ? "item" : "items"}
                </span>
                {totalPages > 1 && (
                  <div className="wp-pagination-controls">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="wp-btn wp-btn-secondary wp-btn-sm">‹</button>
                    <span>{currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="wp-btn wp-btn-secondary wp-btn-sm">›</button>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <PageLoader inline={true} />
            ) : filteredPages.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="mb-2">
                  {selectedBaseSlug || selectedMainSlug
                    ? "No pages match the selected slug filters."
                    : "No pages found."}
                </p>
                {selectedBaseSlug || selectedMainSlug ? (
                  <button className="wp-btn-clear-filters" onClick={() => { setSelectedBaseSlug(""); setSelectedMainSlug(""); }}>Clear Filters</button>
                ) : (
                  <BtnBlue onClick={() => { resetForm(); setView("form"); }}>Add New Page</BtnBlue>
                )}
              </div>
            ) : (
              <div className="wp-table-wrapper">
                <table className="wp-table">
                  <thead>
                    <tr>
                      <th className="wp-th" style={{ width: 32 }}>
                        <input
                          type="checkbox"
                          checked={filteredPages.length > 0 && selectedIds.length === filteredPages.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th onClick={() => handleSort("titleEng")} className="wp-th is-sortable">
                        Title{sortIcon("titleEng")}
                      </th>
                      <th className="wp-th" style={{ width: 140 }}>Department</th>
                      <th onClick={() => handleSort("publishDate")} className="wp-th is-sortable" style={{ width: 180 }}>
                        Date{sortIcon("publishDate")}
                      </th>
                      <th className="wp-th text-end" style={{ width: 150 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPages.map((item) => {
                      const path = buildFullPath(item);
                      const fullUrl = buildFullUrl(item);
                      return (
                        <tr key={item._id} className="wp-tr-hover">
                          <td className="wp-td" style={{ width: 32 }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item._id)}
                              onChange={() => handleToggleSelect(item._id)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td className="wp-td">
                            <div className="d-flex flex-column gap-1">
                              {/* English Title + Taxonomy Badges */}
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <button onClick={() => handleEdit(item)} className="wp-link-btn text-start wp-post-title">
                                  {item.titleEng || <em className="wp-count-text">Untitled</em>}
                                </button>
                                {(item.mainSlug || item.baseSlug) && (
                                  <>
                                    <span
                                      id={`multi-slug-${item._id}`}
                                      className="wp-main-slug-badge"
                                    >
                                      <FaFolder size={10} /> {item.mainSlug || item.baseSlug}
                                    </span>
                                    <UncontrolledTooltip placement="top" target={`multi-slug-${item._id}`}>
                                      Main Slug: {item.mainSlug || item.baseSlug}
                                    </UncontrolledTooltip>
                                  </>
                                )}
                                {item.documentsUpdate?.length > 0 && (
                                  <>
                                    <span
                                      id={`multi-doc-${item._id}`}
                                      className="wp-doc-count-badge"
                                    >
                                      <FaFileAlt size={9} /> {item.documentsUpdate.length} {item.documentsUpdate.length === 1 ? "doc" : "docs"}
                                    </span>
                                    <UncontrolledTooltip placement="top" target={`multi-doc-${item._id}`}>
                                      {item.documentsUpdate.length} {item.documentsUpdate.length === 1 ? "document attached" : "documents attached"}
                                    </UncontrolledTooltip>
                                  </>
                                )}
                              </div>

                              {/* Hindi Title Subtitle */}
                              {item.titleHin && (
                                <div className="wp-hi-subtitle">
                                  <span id={`multi-hi-${item._id}`} className="wp-hi-pill">हि</span>
                                  <UncontrolledTooltip placement="top" target={`multi-hi-${item._id}`}>
                                    Hindi Title
                                  </UncontrolledTooltip>
                                  <span className="wp-hi-text">{item.titleHin}</span>
                                </div>
                              )}

                              {/* URL Permalink */}
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <FaLink size={10} className="wp-count-text flex-shrink-0" />
                                {path ? (
                                  <>
                                    <a
                                      id={`multi-url-${item._id}`}
                                      href={fullUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="wp-slug-link text-truncate"
                                      style={{ maxWidth: 520 }}
                                    >
                                      {fullUrl}
                                    </a>
                                    <UncontrolledTooltip placement="top" target={`multi-url-${item._id}`}>
                                      Open page URL in new tab
                                    </UncontrolledTooltip>
                                  </>
                                ) : (
                                  <span className="wp-crumb-sep">No slug set</span>
                                )}
                                <CopyBtn text={path ? fullUrl : ""} id={`multi-cp-${item._id}`} />
                              </div>
                              <div className="wp-row-actions">
                                <button onClick={() => handleEdit(item)}><FaEdit size={10} /> Edit</button>
                                <span className="wp-filter-sep">|</span>
                                <button className="is-danger" onClick={() => handleDelete(item._id, item.titleEng)}><FaTrashAlt size={10} /> Trash</button>
                                <span className="wp-filter-sep">|</span>
                                <button onClick={() => path && window.open(fullUrl, "_blank")} disabled={!path}><FaEye size={10} /> View</button>
                                <span className="wp-filter-sep">|</span>
                                {item.isPublished ? (
                                  <button onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> Move to Draft</button>
                                ) : (
                                  <button className="is-green" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> Publish</button>
                                )}
                                <span className="wp-filter-sep">|</span>
                                <button onClick={() => path && copyToClipboard(fullUrl)} disabled={!path}><FaCopy size={10} /> Copy link</button>
                              </div>
                            </div>
                          </td>
                          <td className="wp-td">{item.department || categories.find(c => c._id === (item.categoryId?._id || item.categoryId))?.categoryNameEn || <span className="wp-crumb-sep">—</span>}</td>
                          <td className="wp-td">
                            <div style={{ fontWeight: 600, color: item.isPublished ? "var(--wp-text)" : "var(--wp-amber)" }}>
                              {item.isPublished ? "Published" : "Draft"}
                            </div>
                            <div className="wp-count-text" style={{ fontSize: 11 }}>
                              {formatWpDate(item)}
                            </div>
                          </td>
                          <td className="wp-td is-action text-end">
                            <div className="wp-action-group justify-content-end">
                              <button
                                id={`multi-edit-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-edit"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`multi-edit-${item._id}`}>
                                Edit
                              </UncontrolledTooltip>

                              <button
                                id={`multi-view-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-view"
                                onClick={() => path && window.open(fullUrl, "_blank")}
                                disabled={!path}
                              >
                                <FaEye size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`multi-view-${item._id}`}>
                                View
                              </UncontrolledTooltip>

                              {item.isPublished ? (
                                <>
                                  <button
                                    id={`multi-status-${item._id}`}
                                    type="button"
                                    className="wp-icon-btn wp-icon-btn-draft"
                                    onClick={() => handleDraft(item._id)}
                                  >
                                    <FaFileAlt size={11} />
                                  </button>
                                  <UncontrolledTooltip placement="top" target={`multi-status-${item._id}`}>
                                    Move to Draft
                                  </UncontrolledTooltip>
                                </>
                              ) : (
                                <>
                                  <button
                                    id={`multi-status-${item._id}`}
                                    type="button"
                                    className="wp-icon-btn wp-icon-btn-publish"
                                    onClick={() => handlePublish(item._id)}
                                  >
                                    <FaCloudUploadAlt size={12} />
                                  </button>
                                  <UncontrolledTooltip placement="top" target={`multi-status-${item._id}`}>
                                    Publish
                                  </UncontrolledTooltip>
                                </>
                              )}

                              <button
                                id={`multi-del-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-delete"
                                onClick={() => handleDelete(item._id, item.titleEng)}
                              >
                                <FaTrashAlt size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`multi-del-${item._id}`}>
                                Move to Trash
                              </UncontrolledTooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="wp-tablenav bottom">
              <div className="wp-tablenav-left">
                <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}>
                  <option value="">Bulk actions</option>
                  <option value="trash">Move to Trash</option>
                  <option value="publish">Publish</option>
                  <option value="draft">Move to Draft</option>
                </select>
                <button type="button" className="wp-btn wp-btn-secondary wp-btn-sm" onClick={handleBulkApply}>Apply</button>
              </div>
              <div className="wp-tablenav-right">
                <span className="wp-count-text">{totalItems} {totalItems === 1 ? "item" : "items"}</span>
                {totalPages > 1 && (
                  <div className="wp-pagination-controls">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="wp-btn wp-btn-secondary wp-btn-sm">‹</button>
                    <span>{currentPage} of {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="wp-btn wp-btn-secondary wp-btn-sm">›</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </ReactstrapCard>
    </>
  );
};

export default MultiSectionPagesManagement;