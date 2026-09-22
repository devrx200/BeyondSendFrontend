import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Spinner, Card as ReactstrapCard, CardHeader, CardBody, Button, UncontrolledTooltip } from "reactstrap";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand,
  FaCompress, FaTimes, FaFileUpload, FaPlus, FaFolder
} from "react-icons/fa";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";
import { encodeBase64, decodeBase64 } from "../../utilities/rXBase64";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";
import PageLoader from "../../components/PageLoader";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const sanitiseSlug = (val) => val.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-");
const validateSlug = (val) => {
  if (!val) return "Slug is required.";
  if (val.length < 3) return "Slug must be at least 3 characters.";
  if (val.length > 50) return "Slug cannot exceed 50 characters.";
  if (!/^[a-z0-9-]+$/.test(val)) return "Only lowercase letters, numbers, and hyphens.";
  if (val.startsWith("-") || val.endsWith("-")) return "Cannot start or end with a hyphen.";
  return "";
};
const titleToSlug = (title) => sanitiseSlug(title || "").replace(/^-+|-+$/g, "");
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

const SS_VIEW = "ipm_view";
const SS_EDITING_ID = "ipm_editingId";
const SS_FORM = "ipm_form";
const SS_FULLSCREEN = "ipm_fullscreen";

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
      setTimeout(() => setCopied(false), 2000);
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

const WpCard = ({ title, children, action }) => (
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

// Alias so FormBody can use <Card> to refer to WpCard
const Card = WpCard;



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

const emptyForm = () => ({
  titleEn: "", titleHi: "", slug: "",
  shortDescriptionEn: "", shortDescriptionHi: "",
  descriptionEn: "", descriptionHi: "",
  metaKeywords: "", tags: "", categoryId: "", isActive: true,
});

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
};

const FormBody = React.memo(({
  form, setForm, categories, slugError, fullSlugURL,
  isPublished, saving, editingId, handleChange, handleSlugChange,
  handleSlugBlur, handleSubmit, handleDraft, goBackToList, isMobile,
  excerptLang, setExcerptLang, file, setFile, editorKey,
}) => {
  return (
    <>
      <div className="wp-grid-2col">
        <div className="wp-grid-col-main">
          <Card>
            <input
              type="text"
              name="titleEn" value={form.titleEn} onChange={handleChange}
              autoComplete="off"
              placeholder="Add English title"
              className="wp-input wp-title-input-en"
            />
            <input
              name="titleHi" value={form.titleHi} onChange={handleChange}
              placeholder="शीर्षक (Hindi)"
              className="wp-input wp-title-input-hi"
            />
            <div className="wp-permalink-row">
              <span className="wp-permalink-label">Page Slug <span className="text-danger">*</span>:</span>
              <span>{SITE_URL}/</span>
              <div className={`wp-permalink-box ${slugError ? "has-error" : ""}`}>
                <input type="text" name="slug" value={form.slug} autoComplete="off" onChange={handleSlugChange} onBlur={handleSlugBlur} placeholder="page-slug" className="wp-input" />
              </div>
              {!slugError && form.slug && <CopyBtn text={fullSlugURL} />}
            </div>
            {slugError ? (
              <small className="wp-error-text d-block mt-1">⚠ {slugError}</small>
            ) : form.slug ? (
              <small className="wp-help-text d-block mt-1 text-success">✓ Auto-generated URL: {fullSlugURL}</small>
            ) : (
              <small className="wp-help-text d-block mt-1">ℹ Page slug will auto-generate as you type the English Title.</small>
            )}
          </Card>

          <WpCard title="Page Main Content Area">
            <DynamicContentEditor
              key={`important_${editingId || "new"}_${editorKey}`}
              engField="descriptionEn"
              hinField="descriptionHi"
              height={460}
              initialEn={form.descriptionEn}
              initialHi={form.descriptionHi}
              onChange={(contentObj) => {
                setForm(prev => ({
                  ...prev,
                  descriptionEn: contentObj.descriptionEn,
                  descriptionHi: contentObj.descriptionHi,
                }));
              }}
              instanceId={`important_page_editor_${editingId || "new"}_${editorKey}`}
            />
          </WpCard>
        </div>

        <div className="wp-grid-col-side">
          {/* Status & Actions */}
          <Card title="Status & Actions">
            <div className="wp-publish-status-row">
              <span className="wp-label">Status:</span>
              <strong className={isPublished ? "wp-status-published" : "wp-status-draft"}>
                {isPublished ? "Published" : "Draft"}
              </strong>
            </div>
            <label className="wp-checkbox-label mt-2">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="wp-checkbox-input" />
              <span>Active (Visible on site & Preview)</span>
            </label>
            <div className="wp-publish-actions mt-2">
              <button type="button" onClick={() => handleSubmit(false)} disabled={saving} className="wp-btn wp-btn-black wp-btn-full">
                <FaSave size={10} /> {saving ? "Saving..." : isPublished ? "Update Published Page" : editingId ? "Update Draft" : "Save Draft"}
              </button>
              {!isPublished && (
                <button type="button" onClick={() => handleSubmit(true)} disabled={saving} className="wp-btn wp-btn-green wp-btn-full mt-1">
                  <FaCloudUploadAlt size={10} /> {saving ? "Publishing..." : "Publish"}
                </button>
              )}
              {isPublished && editingId && (
                <button type="button" onClick={() => handleDraft(editingId)} disabled={saving} className="wp-btn wp-btn-secondary wp-btn-full mt-1">
                  <FaFileAlt size={10} /> Move to Draft
                </button>
              )}
              <div className="wp-publish-discard mt-2">
                <button type="button" onClick={goBackToList} className="wp-link-btn is-danger">
                  <FaTrashAlt size={9} /> Discard Changes
                </button>
              </div>
            </div>
          </Card>

          {/* Short Description */}
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 8 }}>
                <span>Short Description</span>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => setExcerptLang("en")}
                    className={`wp-link-btn ${excerptLang === "en" ? "" : "wp-count-text"}`}
                    style={{ fontWeight: excerptLang === "en" ? 600 : 400 }}
                  >
                    English
                  </button>

                  <button
                    type="button"
                    onClick={() => setExcerptLang("hi")}
                    className={`wp-link-btn ${excerptLang === "hi" ? "" : "wp-count-text"}`}
                    style={{ fontWeight: excerptLang === "hi" ? 600 : 400 }}
                  >
                    Hindi
                  </button>
                </div>
              </div>
            }
          >
            {excerptLang === "en" ? (
              <textarea
                name="shortDescriptionEn"
                value={form.shortDescriptionEn}
                onChange={handleChange}
                placeholder="Short description (English)"
                rows={4}
                className="wp-textarea"
              />
            ) : (
              <textarea
                name="shortDescriptionHi"
                value={form.shortDescriptionHi}
                onChange={handleChange}
                placeholder="संक्षिप्त विवरण (Hindi)"
                rows={4}
                className="wp-textarea"
              />
            )}
          </Card>

          {/* Category */}
          <Card title="Category">
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="wp-select"
            >
              <option value="">— No Category —</option>

              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryNameEn}
                </option>
              ))}
            </select>

            {form.categoryId && (
              <p className="wp-help-text">
                हिंदी:{" "}
                {categories.find((c) => c._id === form.categoryId)?.categoryNameHi ||
                  "—"}
              </p>
            )}
          </Card>

          {/* Tags */}
          <Card title="Tags">
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="education,government,college"
              className="wp-input"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="wp-help-text">Separate with commas</p>
          </Card>

          {/* SEO */}
          <Card title="SEO & Meta">
            <label className="wp-label" style={{ fontSize: 12 }}>
              Meta Keywords
            </label>

            <input
              type="text"
              name="metaKeywords"
              value={form.metaKeywords}
              onChange={handleChange}
              placeholder="beyondsend,crm,marketing"
              className="wp-input"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="wp-help-text">Separate with commas</p>
          </Card>

          {/* Attachment */}
          <Card title="Attachment">
            <label className="wp-label" style={{ fontSize: 12 }}>
              <FaFileUpload size={10} style={{ marginRight: 4 }} />
              Upload File (PDF / Image)
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="wp-input"
              style={{ padding: "4px 6px" }}
            />

            {file && (
              <p className="wp-help-text">
                Selected: {file.name}
              </p>
            )}
          </Card>
        </div>

      </div>
      <div style={{ height: 24 }} />
    </>
  );
});

const ImportantPageManagement = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toasts, toast } = useToast();

  const initView = () => sessionStorage.getItem(SS_VIEW) || "list";
  const initEditingId = () => sessionStorage.getItem(SS_EDITING_ID) || null;
  const initForm = () => { try { const s = sessionStorage.getItem(SS_FORM); return s ? JSON.parse(s) : emptyForm(); } catch { return emptyForm(); } };
  const initFullscreen = () => sessionStorage.getItem(SS_FULLSCREEN) === "true";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState([]);
  const [editingId, setEditingId] = useState(initEditingId);
  const [view, setView] = useState(initView);
  const [form, setForm] = useState(initForm);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [slugError, setSlugError] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initEditingId());
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, active: 0, inactive: 0 });
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isFormFullscreen, setIsFormFullscreen] = useState(initFullscreen);
  const [excerptLang, setExcerptLang] = useState("en");
  const [file, setFile] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  const slugDebounceRef = useRef(null);

  useEffect(() => { sessionStorage.setItem(SS_FULLSCREEN, isFormFullscreen ? "true" : "false"); }, [isFormFullscreen]);
  useEffect(() => { sessionStorage.setItem(SS_VIEW, view); }, [view]);
  useEffect(() => { if (editingId) sessionStorage.setItem(SS_EDITING_ID, editingId); else sessionStorage.removeItem(SS_EDITING_ID); }, [editingId]);
  useEffect(() => { if (view === "form") sessionStorage.setItem(SS_FORM, JSON.stringify(form)); }, [form, view]);

  useEffect(() => {
    if (slugManuallyEdited || !form.titleEn) return;
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(() => {
      const generated = titleToSlug(form.titleEn);
      if (generated !== form.slug) { setForm(prev => ({ ...prev, slug: generated })); setSlugError(validateSlug(generated)); }
    }, 300);
    return () => { if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current); };
  }, [form.titleEn, slugManuallyEdited, form.slug]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { getAllPages(); }, [currentPage, pageSize, filterStatus, search, sortBy, sortOrder]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const res = await axios.get(`${API}/api/get-categories`, { headers: authH() }); setCategories(res.data.data || []); } catch { }
  };

  const getAllPages = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: pageSize, search, sortBy, sortOrder };
      if (filterStatus === "published") params.isPublished = true;
      if (filterStatus === "draft") params.isPublished = false;
      if (filterStatus === "active") params.isActive = true;
      if (filterStatus === "inactive") params.isActive = false;
      const res = await axios.get(`${API}/api/get-all-important-pages`, { headers: authH(), params });
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setPages(data);
      const ti = res.data?.pagination?.totalItems ?? res.data?.pagination?.totalDocuments ?? data.length;
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalItems(ti);
      if (filterStatus === "all" && !search) {
        setCounts({
          all: ti,
          published: data.filter(p => p.isPublished).length,
          draft: data.filter(p => !p.isPublished).length,
          active: data.filter(p => p.isActive).length,
          inactive: data.filter(p => !p.isActive).length
        });
      } else {
        setCounts(prev => ({
          ...prev,
          [filterStatus]: ti,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const buildPayload = (f) => {
    const fd = new FormData();
    fd.append("titleEn", f.titleEn);
    fd.append("titleHi", f.titleHi);
    fd.append("slug", f.slug);
    fd.append("shortDescriptionEn", f.shortDescriptionEn);
    fd.append("shortDescriptionHi", f.shortDescriptionHi);
    fd.append("descriptionEn", encodeBase64(f.descriptionEn || ""));
    fd.append("descriptionHi", encodeBase64(f.descriptionHi || ""));
    fd.append("metaKeywords", JSON.stringify(f.metaKeywords.split(",").map(x => x.trim()).filter(Boolean)));
    fd.append("tags", JSON.stringify(f.tags.split(",").map(x => x.trim()).filter(Boolean)));
    fd.append("categoryId", f.categoryId || "");
    fd.append("isActive", f.isActive);
    if (file) fd.append("file", file);
    return fd;
  };

  const handleSubmit = async (publishAfter = false) => {
    if (!form.titleEn?.trim()) {
      toast.warning("English title is required before saving.");
      return;
    }
    if (!form.titleHi?.trim()) {
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
    try {
      setSaving(true);
      const fd = buildPayload(form);
      const multipartH = { ...authH(), "Content-Type": "multipart/form-data" };
      let savedId = editingId;
      let lastRes = null;
      if (editingId) {
        lastRes = await axios.put(`${API}/api/update-important-page/${editingId}`, fd, { headers: multipartH });
      } else {
        lastRes = await axios.post(`${API}/api/create-important-page`, fd, { headers: multipartH });
        savedId = lastRes.data?.data?._id || lastRes.data?._id;
        if (savedId) setEditingId(savedId);
      }
      if (publishAfter && savedId) {
        lastRes = await axios.post(`${API}/api/important-page/publish/${savedId}`, {}, { headers: authH() });
      }
      toast.success(lastRes?.data?.message || (publishAfter ? "Page published successfully." : "Draft saved successfully."));
      getAllPages();
    } catch (err) { toast.error(err?.response?.data?.message || "Something went wrong"); } finally { setSaving(false); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await axios.post(`${API}/api/important-page/publish/${id}`, {}, { headers: authH() });
      toast.success(res.data?.message || "Page published.");
      getAllPages();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Publish failed");
    }
  };

  const handleDraft = async (id) => {
    try {
      const res = await axios.post(`${API}/api/important-page/draft/${id}`, {}, { headers: authH() });
      toast.info(res.data?.message || "Moved page to draft.");
      getAllPages();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id, title) => {
    const isConfirmed = await wpSwal.confirm("Delete this page?", `Permanently delete <strong>"${title || "Untitled"}"</strong>?<br>This cannot be undone.`);
    if (!isConfirmed) return;
    try {
      const res = await axios.delete(`${API}/api/delete-important-page/${id}`, { headers: authH() });
      toast.success(res.data?.message || "Page deleted successfully.");
      getAllPages();
    } catch (err) { toast.error(err?.response?.data?.message || "Delete failed"); }
  };

  const [descEnManuallyEdited, setDescEnManuallyEdited] = useState(false);
  const [descHiManuallyEdited, setDescHiManuallyEdited] = useState(false);

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      titleEn: row.titleEn || "",
      titleHi: row.titleHi || "",
      slug: row.slug || "",
      shortDescriptionEn: row.shortDescriptionEn || "",
      shortDescriptionHi: row.shortDescriptionHi || "",
      descriptionEn: decodeBase64(row.descriptionEn || ""),
      descriptionHi: decodeBase64(row.descriptionHi || ""),
      metaKeywords: Array.isArray(row.metaKeywords) ? row.metaKeywords.join(", ") : (row.metaKeywords || ""),
      tags: Array.isArray(row.tags) ? row.tags.join(", ") : (row.tags || ""),
      categoryId: row.categoryId?._id || row.categoryId || "",
      isActive: row.isActive !== false,
    });
    setFile(null);
    setSlugManuallyEdited(true);
    setDescEnManuallyEdited(true);
    setDescHiManuallyEdited(true);
    setSlugError("");
    setEditorKey(k => k + 1);
    setView("form");
  };

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setFile(null);
    setSlugManuallyEdited(false);
    setDescEnManuallyEdited(false);
    setDescHiManuallyEdited(false);
    setSlugError("");
    setIsFormFullscreen(false);
    setEditorKey(k => k + 1);
    [SS_EDITING_ID, SS_FORM, SS_FULLSCREEN].forEach(k => sessionStorage.removeItem(k));
  }, []);

  const goBackToList = useCallback(() => {
    resetForm();
    setView("list");
  }, [resetForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "shortDescriptionEn") setDescEnManuallyEdited(true);
    if (name === "shortDescriptionHi") setDescHiManuallyEdited(true);
    setForm(prev => {
      const updates = { [name]: type === "checkbox" ? checked : value };
      if (name === "titleEn") {
        if (!descEnManuallyEdited || !prev.shortDescriptionEn || prev.shortDescriptionEn === prev.titleEn) {
          updates.shortDescriptionEn = value;
        }
      }
      if (name === "titleHi") {
        if (!descHiManuallyEdited || !prev.shortDescriptionHi || prev.shortDescriptionHi === prev.titleHi) {
          updates.shortDescriptionHi = value;
        }
      }
      return { ...prev, ...updates };
    });
  };
  const handleSlugChange = (e) => { setSlugManuallyEdited(true); const clean = sanitiseSlug(e.target.value); setForm(prev => ({ ...prev, slug: clean })); setSlugError(validateSlug(clean)); };
  const handleSlugBlur = (e) => { const clean = e.target.value.replace(/^-+|-+$/g, ""); setForm(prev => ({ ...prev, slug: clean })); setSlugError(validateSlug(clean)); };
  const handleSort = (col) => { if (sortBy === col) setSortOrder(o => o === "desc" ? "asc" : "desc"); else { setSortBy(col); setSortOrder("desc"); } setCurrentPage(1); };
  const sortIcon = (col) => sortBy !== col ? " ⇅" : sortOrder === "desc" ? " ↓" : " ↑";

  const editingRow = pages.find(p => p._id === editingId);
  const isPublished = !!editingRow?.isPublished;
  const fullSlugURL = form.slug ? `${SITE_URL}/${form.slug}` : "";

  const formatDate = (ds) => {
    if (!ds) return "—";
    return new Date(ds).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  };

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
      setSelectedIds(pages.map(p => p._id));
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
        await Promise.all(selectedIds.map(id => axios.delete(`${API}/api/delete-important-page/${id}`, { headers: authH() })));
        toast.success(`${count} ${label} deleted.`);
        setSelectedIds([]);
        setBulkAction("");
        getAllPages();
      } catch (err) {
        toast.error("Failed to delete some items.");
        getAllPages();
      }
    } else if (bulkAction === "publish") {
      try {
        await Promise.all(selectedIds.map(id => axios.post(`${API}/api/important-page/publish/${id}`, {}, { headers: authH() })));
        toast.success(`${count} ${label} published.`);
        setSelectedIds([]);
        setBulkAction("");
        getAllPages();
      } catch (err) {
        toast.error("Failed to publish some items.");
        getAllPages();
      }
    } else if (bulkAction === "draft") {
      try {
        await Promise.all(selectedIds.map(id => axios.post(`${API}/api/important-page/draft/${id}`, {}, { headers: authH() })));
        toast.info(`${count} ${label} moved to draft.`);
        setSelectedIds([]);
        setBulkAction("");
        getAllPages();
      } catch (err) {
        toast.error("Failed to update some items.");
        getAllPages();
      }
    }
  };

  const renderFormTopBar = (fullscreen) => (
    <div className={`wp-top-bar ${fullscreen ? "is-fullscreen" : ""}`}>
      {/* Left */}
      <div className="wp-top-bar-left">
        <button type="button" onClick={goBackToList} className="wp-link-btn">
          <FaArrowLeft size={11} /> Back To List
        </button>
        <span className="wp-crumb-sep">›</span>
        <span className="wp-top-bar-title">
          {editingId
            ? fullscreen
              ? "Edit Page (Full Screen)"
              : "Edit Page"
            : fullscreen
              ? "Add New Page (Full Screen)"
              : "Add New Page"}
        </span>
      </div>

      {/* Right */}
      <div className="wp-top-bar-right">
        {!fullscreen && (
          <button type="button" onClick={goBackToList} className="wp-btn wp-btn-danger">
            <FaTimes size={10} /> {!isMobile && "Close"}
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            form.slug &&
            window.open(
              `${SITE_URL}/preview/${form.slug}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
          disabled={!form.slug}
          className="wp-btn wp-btn-secondary"
        >
          <FaEye size={10} /> {!isMobile && "Preview"}
        </button>

        {/* Save / Update */}
        <button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={saving}
          className="wp-btn wp-btn-black"
        >
          <FaSave size={10} />{" "}
          {saving
            ? "Saving..."
            : isPublished
              ? "Update Page"
              : editingId
                ? "Update Draft"
                : "Save Draft"}
        </button>

        {/* Publish / Published */}
        {isPublished ? (
          <>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={saving}
              className="wp-btn wp-btn-outline-green"
            >
              <FaCheck size={10} /> Published
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => handleDraft(editingId)}
                disabled={saving}
                className="wp-btn wp-btn-secondary"
              >
                <FaFileAlt size={10} /> {!isMobile && "Move to Draft"}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="wp-btn wp-btn-green"
          >
            <FaCloudUploadAlt size={10} />{" "}
            {saving ? "Publishing..." : "Publish"}
          </button>
        )}

        {/* Fullscreen */}
        {fullscreen ? (
          <button
            type="button"
            onClick={() => setIsFormFullscreen(false)}
            className="wp-btn wp-btn-danger"
          >
            <FaCompress size={10} />
            {!isMobile && " Exit Full Screen"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsFormFullscreen(true)}
            className="wp-btn wp-btn-blue"
          >
            <FaExpand size={10} />
            {!isMobile && " Full Screen"}
          </button>
        )}
      </div>
    </div>
  );

  if (view === "list") {
    const filters = [{ k: "all", l: "All" }, { k: "published", l: "Published" }, { k: "draft", l: "Draft" }, { k: "active", l: "Active" }, { k: "inactive", l: "Inactive" }];

    return (
      <>
        <ToastContainer toasts={toasts} onRemove={toast.remove} />
        {/* PAGE HEADER */}
        <ReactstrapCard className="adm-card mb-4">
          <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h3 className="adm-page-title mb-1">
                <FaFileAlt className="me-2" /> Important Pages Management
              </h3>
              <p className="adm-page-subtitle mb-0 text-white">
                Manage rich HTML/component pages with custom dynamic elements
              </p>
            </div>
            <Button color="primary" onClick={() => { resetForm(); setView("form"); }}>
              <FaPlus className="me-1" /> Add New Page
            </Button>
          </CardHeader>
        </ReactstrapCard>

        <ReactstrapCard className="adm-card shadow-sm border-0 mb-4">
          <CardBody>
            <div className="wp-filter-bar mb-3">
              <div className="wp-filter-tabs">
                {filters.map((f, i) => (
                  <React.Fragment key={f.k}>
                    {i > 0 && <span className="wp-filter-sep">|</span>}
                    <button
                      onClick={() => { setFilterStatus(f.k); setCurrentPage(1); }}
                      className={`wp-filter-tab-btn ${filterStatus === f.k ? "is-active" : ""}`}
                    >
                      {f.l} <span className="wp-count-text">({counts[f.k] ?? 0})</span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
              <div className="wp-search-box">
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search pages…"
                  className="wp-input wp-search-input"
                />
                <BtnBlue size="sm" onClick={() => { setSearch(searchInput); setCurrentPage(1); }}>Search</BtnBlue>
                <select
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className="wp-input w-auto text-center"
                  style={{ padding: "4px 8px", fontSize: 12, height: "auto" }}
                  title="Items per page"
                >
                  {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
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

              {loading ? (
                <PageLoader inline={true} />
              ) : pages.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p className="mb-2">No pages found.</p>
                  <BtnBlue onClick={() => { resetForm(); setView("form"); }}>Add New Page</BtnBlue>
                </div>
              ) : (
                <div className="wp-table-wrapper">
                  <table className="wp-table">
                    <thead>
                      <tr>
                        <th className="wp-th" style={{ width: 32 }}>
                          <input
                            type="checkbox"
                            checked={pages.length > 0 && selectedIds.length === pages.length}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th onClick={() => handleSort("titleEn")} className="wp-th is-sortable">
                          Title{sortIcon("titleEn")}
                        </th>
                        <th className="wp-th" style={{ width: 140 }}>Category</th>
                        <th onClick={() => handleSort("publishDate")} className="wp-th is-sortable" style={{ width: 180 }}>
                          Date{sortIcon("publishDate")}
                        </th>
                        <th className="wp-th text-end" style={{ width: 150 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((item) => (
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
                                  {item.titleEn || <em className="wp-count-text">Untitled</em>}
                                </button>
                                {(item.mainSlug || item.baseSlug) && (
                                  <>
                                    <span
                                      id={`imp-slug-${item._id}`}
                                      className="wp-main-slug-badge"
                                    >
                                      <FaFolder size={10} /> {item.mainSlug || item.baseSlug}
                                    </span>
                                    <UncontrolledTooltip placement="top" target={`imp-slug-${item._id}`}>
                                      Main Slug: {item.mainSlug || item.baseSlug}
                                    </UncontrolledTooltip>
                                  </>
                                )}
                              </div>

                              {/* Hindi Title Subtitle */}
                              {item.titleHi && (
                                <div className="wp-hi-subtitle">
                                  <span id={`imp-hi-${item._id}`} className="wp-hi-pill">हि</span>
                                  <UncontrolledTooltip placement="top" target={`imp-hi-${item._id}`}>
                                    Hindi Title
                                  </UncontrolledTooltip>
                                  <span className="wp-hi-text">{item.titleHi}</span>
                                </div>
                              )}

                              {/* URL Permalink */}
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <FaLink size={10} className="wp-count-text flex-shrink-0" />
                                <a
                                  id={`imp-url-${item._id}`}
                                  href={`${SITE_URL}/${item.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="wp-slug-link text-truncate"
                                  style={{ maxWidth: 520 }}
                                >
                                  {SITE_URL}/{item.slug}
                                </a>
                                <UncontrolledTooltip placement="top" target={`imp-url-${item._id}`}>
                                  Open page URL in new tab
                                </UncontrolledTooltip>
                                <CopyBtn text={`${SITE_URL}/${item.slug}`} id={`imp-cp-${item._id}`} />
                              </div>
                              <div className="wp-row-actions">
                                <button onClick={() => handleEdit(item)}><FaEdit size={10} /> Edit</button>
                                <span className="wp-filter-sep">|</span>
                                <button className="is-danger" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={10} /> Trash</button>
                                <span className="wp-filter-sep">|</span>
                                <button onClick={() => window.open(`${SITE_URL}/${item.slug}`, "_blank")}><FaEye size={10} /> View</button>
                                <span className="wp-filter-sep">|</span>
                                {item.isPublished ? (
                                  <button onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> Move to Draft</button>
                                ) : (
                                  <button className="is-green" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> Publish</button>
                                )}
                                <span className="wp-filter-sep">|</span>
                                <button onClick={() => copyToClipboard(`${SITE_URL}/${item.slug}`)}><FaCopy size={10} /> Copy link</button>
                              </div>
                            </div>
                          </td>
                          <td className="wp-td">{categories.find(c => c._id === item.categoryId)?.categoryNameEn || <span className="wp-crumb-sep">—</span>}</td>
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
                                id={`imp-edit-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-edit"
                                onClick={() => handleEdit(item)}
                              >
                                <FaEdit size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`imp-edit-${item._id}`}>
                                Edit
                              </UncontrolledTooltip>

                              <button
                                id={`imp-view-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-view"
                                onClick={() => window.open(`${SITE_URL}/${item.slug}`, "_blank")}
                              >
                                <FaEye size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`imp-view-${item._id}`}>
                                View
                              </UncontrolledTooltip>

                              {item.isPublished ? (
                                <>
                                  <button
                                    id={`imp-status-${item._id}`}
                                    type="button"
                                    className="wp-icon-btn wp-icon-btn-draft"
                                    onClick={() => handleDraft(item._id)}
                                  >
                                    <FaFileAlt size={11} />
                                  </button>
                                  <UncontrolledTooltip placement="top" target={`imp-status-${item._id}`}>
                                    Move to Draft
                                  </UncontrolledTooltip>
                                </>
                              ) : (
                                <>
                                  <button
                                    id={`imp-status-${item._id}`}
                                    type="button"
                                    className="wp-icon-btn wp-icon-btn-publish"
                                    onClick={() => handlePublish(item._id)}
                                  >
                                    <FaCloudUploadAlt size={12} />
                                  </button>
                                  <UncontrolledTooltip placement="top" target={`imp-status-${item._id}`}>
                                    Publish
                                  </UncontrolledTooltip>
                                </>
                              )}

                              <button
                                id={`imp-del-${item._id}`}
                                type="button"
                                className="wp-icon-btn wp-icon-btn-delete"
                                onClick={() => handleDelete(item._id, item.titleEn)}
                              >
                                <FaTrashAlt size={12} />
                              </button>
                              <UncontrolledTooltip placement="top" target={`imp-del-${item._id}`}>
                                Move to Trash
                              </UncontrolledTooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
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
            <div style={{ height: 20 }} />
          </CardBody>
        </ReactstrapCard>
      </>
    );
  }

  if (view === "form") {
    return (
      <div className={isFormFullscreen ? "wp-form-fullscreen" : "wp-page-wrap"}>
        <ToastContainer toasts={toasts} onRemove={toast.remove} />
        {renderFormTopBar(isFormFullscreen)}
        <FormBody
          form={form} setForm={setForm}
          categories={categories} slugError={slugError} fullSlugURL={fullSlugURL}
          isPublished={isPublished} saving={saving} editingId={editingId}
          handleChange={handleChange} handleSlugChange={handleSlugChange}
          handleSlugBlur={handleSlugBlur} handleSubmit={handleSubmit}
          handleDraft={handleDraft} goBackToList={goBackToList}
          isMobile={isMobile}
          excerptLang={excerptLang} setExcerptLang={setExcerptLang}
          file={file} setFile={setFile} editorKey={editorKey}
        />
      </div>
    );
  }

  return null;
};

export default ImportantPageManagement;