import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Spinner, Card as ReactstrapCard, CardHeader, CardBody, Button } from "reactstrap";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand,
  FaCompress, FaTimes, FaFileUpload, FaPlus
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

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
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
    <button
      onClick={handleCopy}
      disabled={!text}
      type="button"
      className={`wp-copy-btn ${copied ? "is-copied" : ""}`}>
      {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
      {copied ? "Copied" : "Copy"}
    </button>
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
              placeholder="highereducation,chhattisgarh,university"
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

  useEffect(() => { getAllPages(); }, [currentPage, filterStatus, search, sortBy, sortOrder]);
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const res = await axios.get(`${API}/api/get-categories`, { headers: authH() }); setCategories(res.data.data || []); } catch { }
  };

  const getAllPages = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 100, search, sortBy, sortOrder };
      if (filterStatus === "published") params.isPublished = true;
      if (filterStatus === "draft") params.isPublished = false;
      if (filterStatus === "active") params.isActive = true;
      if (filterStatus === "inactive") params.isActive = false;
      const res = await axios.get(`${API}/api/get-all-important-pages`, { headers: authH(), params });
      const data = res.data.data || [];
      setPages(data);
      const ti = res.data.pagination?.totalItems ?? data.length;
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(ti);
      setCounts({ all: ti, published: data.filter(p => p.isPublished).length, draft: data.filter(p => !p.isPublished).length, active: data.filter(p => p.isActive).length, inactive: data.filter(p => !p.isActive).length });
    } catch (err) { console.error(err); } finally { setLoading(false); }
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
        savedId = lastRes.data.data?._id || lastRes.data._id;
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

  const goBackToList = useCallback(async () => {
    if (form.titleEn?.trim() || form.descriptionEn?.trim()) {
      try {
        const fd = buildPayload(form);
        const multipartH = { ...authH(), "Content-Type": "multipart/form-data" };
        if (editingId) {
          await axios.put(`${API}/api/update-important-page/${editingId}`, fd, { headers: multipartH });
        } else {
          const res = await axios.post(`${API}/api/create-important-page`, fd, { headers: multipartH });
          const newId = res.data.data?._id || res.data._id;
          if (newId) setEditingId(newId);
        }
      } catch (err) { console.error("Save on back failed", err); }
    }
    resetForm();
    setView("list");
  }, [form, editingId, resetForm]);

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

  // --- Top bar for form ---
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
            <div className="wp-filter-bar">
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
                  value={search}
                  onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search pages…"
                  className="wp-input wp-search-input"
                />
                <BtnBlue size="sm" onClick={getAllPages}>Search</BtnBlue>
              </div>
            </div>

            <div className="wp-table-container">
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />
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
                        <th className="wp-th" style={{ width: 28 }}><input type="checkbox" /></th>
                        <th className="wp-th">SNo.</th>
                        <th className="wp-th">Title / Hindi / Link</th>
                        <th className="wp-th">Category</th>
                        <th onClick={() => handleSort("createdAt")} className="wp-th is-sortable">Created{sortIcon("createdAt")}</th>
                        <th onClick={() => handleSort("publishDate")} className="wp-th is-sortable">Published{sortIcon("publishDate")}</th>
                        <th onClick={() => handleSort("updatedAt")} className="wp-th is-sortable">Updated{sortIcon("updatedAt")}</th>
                        <th className="wp-th text-end">Actions</th>
                        <th className="wp-th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((item, idx) => (
                        <tr key={item._id} onMouseEnter={() => setHoveredRow(item._id)} onMouseLeave={() => setHoveredRow(null)} className="wp-tr-hover">
                          <td className="wp-td" style={{ width: 28 }}><input type="checkbox" style={{ cursor: "pointer" }} /></td>
                          <td className="wp-td">{(currentPage - 1) * 100 + idx + 1}</td>
                          <td className="wp-td">
                            <div className="d-flex flex-column gap-1">
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <button onClick={() => handleEdit(item)} className="wp-link-btn fw-bold">
                                  {item.titleEn ? (item.titleEn.length > 35 ? `${item.titleEn.slice(0, 35)}...` : item.titleEn) : <em className="wp-count-text">Untitled</em>}
                                </button>
                                {item.titleHi && (
                                  <span title={item.titleHi} style={{ fontSize: 10, background: "var(--wp-blue-bg)", color: "var(--wp-blue)", padding: "2px 5px", borderRadius: 3 }}>
                                    हि {item.titleHi.length > 20 ? item.titleHi.slice(0, 20) + "…" : item.titleHi}
                                  </span>
                                )}
                              </div>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <FaLink size={10} className="wp-count-text" />
                                <a href={`${SITE_URL}/${item.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--wp-blue)", textDecoration: "none" }}>{SITE_URL}/{item.slug}</a>
                                <CopyBtn text={`${SITE_URL}/${item.slug}`} />
                              </div>
                              {hoveredRow === item._id && !isMobile && (
                                <div className="wp-row-actions mt-1">
                                  <button className="wp-link-btn" onClick={() => handleEdit(item)}><FaEdit size={10} /> Edit</button>
                                  <span className="wp-filter-sep">|</span>
                                  <button className="wp-link-btn is-danger" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={10} /> Trash</button>
                                  <span className="wp-filter-sep">|</span>
                                  <button className="wp-link-btn" onClick={() => window.open(`${SITE_URL}/${item.slug}`, "_blank")}><FaEye size={10} /> View</button>
                                  <span className="wp-filter-sep">|</span>
                                  {item.isPublished
                                    ? <button className="wp-link-btn" onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> Move to Draft</button>
                                    : <button className="wp-link-btn is-green" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> Publish</button>}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="wp-td">{categories.find(c => c._id === item.categoryId)?.categoryNameEn || <span className="wp-crumb-sep">—</span>}</td>
                          <td className="wp-td text-nowrap">{formatDate(item.createdAt)}</td>
                          <td className="wp-td text-nowrap">{item.isPublished && item.publishDate ? formatDate(item.publishDate) : <span className="wp-crumb-sep">—</span>}</td>
                          <td className="wp-td text-nowrap">{formatDate(item.updatedAt)}</td>
                          <td className="wp-td is-action text-end">
                            <div className="wp-action-group justify-content-end">
                              <BtnSecondary size="sm" onClick={() => handleEdit(item)}><FaEdit size={10} /> {!isMobile && "Edit"}</BtnSecondary>
                              <BtnSecondary size="sm" onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}><FaEye size={10} /> {!isMobile && "Preview"}</BtnSecondary>
                              {item.isPublished
                                ? <BtnSecondary size="sm" onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> {!isMobile && "Move to Draft"}</BtnSecondary>
                                : <BtnGreen size="sm" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> {!isMobile && "Publish"}</BtnGreen>}
                              <BtnDanger size="sm" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={10} /> {!isMobile && "Delete"}</BtnDanger>
                            </div>
                          </td>
                          <td className="wp-td"><StatusBadge published={item.isPublished} active={item.isActive} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />
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