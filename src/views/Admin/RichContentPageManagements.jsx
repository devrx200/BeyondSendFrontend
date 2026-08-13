import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { Spinner, Card as RCard, CardHeader, CardBody, Button } from "reactstrap";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand, FaCompress, FaTimes, FaPlus
} from "react-icons/fa";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";
import { encodeBase64, decodeBase64 } from "../../utilities/rXBase64";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

const sanitiseSlug = (v) => v.toLowerCase().replace(/[^a-z0-9-/]+/g, "-").replace(/-+/g, "-").replace(/\/+/g, "/");
const validateSlug = (v) => {
  if (!v) return "Slug is required.";
  if (v.length < 3) return "Slug must be at least 3 characters.";
  if (v.length > 50) return "Slug cannot exceed 50 characters.";
  if (!/^[a-z0-9-/]+$/.test(v)) return "Only lowercase letters, numbers, hyphens, and slashes.";
  if (v.startsWith("-") || v.endsWith("-") || v.startsWith("/") || v.endsWith("/")) return "Cannot start or end with a hyphen or slash.";
  return "";
};
const titleToSlug = (t) => sanitiseSlug(t || "").replace(/^-+|-+$/g, "");
const getToken = () => {
  const t = sessionStorage.getItem("authToken");
  if (!t) return "";
  try { const p = JSON.parse(t); return p?.token || p?.access || t; } catch { return t; }
};
const authH = () => { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; };

const copyToClipboard = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fallback */ }
  try {
    const el = document.createElement("textarea");
    el.value = text; el.style.position = "fixed"; el.style.left = "-999999px";
    document.body.appendChild(el); el.focus(); el.select();
    const ok = document.execCommand("copy"); el.remove(); return ok;
  } catch { return false; }
};

const SS_VIEW = "rcpm_view";
const SS_EDITING_ID = "rcpm_editingId";
const SS_FORM = "rcpm_form";
const SS_FULLSCREEN = "rcpm_fullscreen";

const emptyForm = () => ({
  titleEn: "", titleHi: "", slug: "",
  shortDescriptionEn: "", shortDescriptionHi: "",
  descriptionEn: "", descriptionHi: "",
  metaKeywords: "", tags: "", categoryId: "", isActive: true
});

const useIsMobile = () => {
  const [m, setM] = useState(() => window.innerWidth <= 640);
  useEffect(() => {
    const h = () => setM(window.innerWidth <= 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return m;
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
};

// --- Small shared UI atoms ---
const WpCard = ({ title, children, action }) => (
  <div className="wp-card">
    {title && <div className="wp-card-header"><h2 className="wp-card-title">{title}</h2>{action}</div>}
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

const StatusBadge = ({ published, active }) => (
  <div className="wp-status-badge-wrap">
    <span className={`wp-status-badge ${published ? "wp-badge-published" : "wp-badge-draft"}`}>{published ? "Published" : "Draft"}</span>
    <span className={`wp-status-badge ${active ? "wp-badge-active" : "wp-badge-inactive"}`}>{active ? "Active" : "Inactive"}</span>
  </div>
);

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <button onClick={handleCopy} disabled={!text} type="button" className={`wp-copy-btn ${copied ? "is-copied" : ""}`}>
      {copied ? <FaCheck size={9} /> : <FaCopy size={9} />} {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ============================================================
// FormBody — all props received, no inline styles, uses CSS classes
// ============================================================
const FormBody = React.memo(({
  form, setForm, categories, slugError, fullSlugURL,
  editingId, handleChange, handleSlugChange, handleSlugBlur,
  excerptLang, setExcerptLang, editorKey,
  isPublished, saving, handleSubmit, handleDraft, goBackToList
}) => (
  <>
    <div className="wp-grid-2col">
      {/* Main Column */}
      <div className="wp-grid-col-main">
        <WpCard>
          <input
            type="text" name="titleEn" value={form.titleEn} onChange={handleChange}
            autoComplete="off" placeholder="Add English title" className="wp-input wp-title-input-en"
          />
          <input
            name="titleHi" value={form.titleHi} onChange={handleChange}
            placeholder="शीर्षक (Hindi)" className="wp-input wp-title-input-hi"
          />
          <div className="wp-permalink-row">
            <span className="wp-permalink-label">Page Slug <span className="text-danger">*</span>:</span>
            <span>{SITE_URL}/</span>
            <div className={`wp-permalink-box ${slugError ? "has-error" : ""}`}>
              <input type="text" name="slug" value={form.slug} autoComplete="off"
                onChange={handleSlugChange} onBlur={handleSlugBlur}
                placeholder="page-slug" className="wp-input" />
            </div>
            {!slugError && form.slug && <CopyBtn text={fullSlugURL} />}
          </div>
          {slugError
            ? <small className="wp-error-text d-block mt-1">⚠ {slugError}</small>
            : form.slug
              ? <small className="wp-help-text d-block mt-1 text-success">✓ {fullSlugURL}</small>
              : <small className="wp-help-text d-block mt-1">ℹ Slug auto-generates from English title.</small>
          }
        </WpCard>

        <WpCard title="Page Main Content Area">
          <DynamicContentEditor
            key={`rcp_${editingId || "new"}_${editorKey}`}
            engField="descriptionEn"
            hinField="descriptionHi"
            height={460}
            initialEn={form.descriptionEn}
            initialHi={form.descriptionHi}
            onChange={(c) => setForm(prev => ({ ...prev, descriptionEn: c.descriptionEn, descriptionHi: c.descriptionHi }))}
            instanceId={`rcp_editor_${editingId || "new"}_${editorKey}`}
          />
        </WpCard>
      </div>

      {/* Side Column */}
      <div className="wp-grid-col-side">

        {/* ── Status & Actions (WordPress style) ── */}
        <WpCard title="Status & Actions">
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
        </WpCard>

        {/* ── Short Description ── */}
        <WpCard title={
          <div className="wp-card-title-row">
            <span>Short Description</span>
            <div className="wp-tab-group">
              <button type="button" onClick={() => setExcerptLang("en")} className={`wp-link-btn${excerptLang === "en" ? " fw-bold" : ""}`}>English</button>
              <button type="button" onClick={() => setExcerptLang("hi")} className={`wp-link-btn${excerptLang === "hi" ? " fw-bold" : ""}`}>Hindi</button>
            </div>
          </div>
        }>
          {excerptLang === "en"
            ? <textarea name="shortDescriptionEn" value={form.shortDescriptionEn} onChange={handleChange} placeholder="Enter short description in English" rows={4} className="wp-input" />
            : <textarea name="shortDescriptionHi" value={form.shortDescriptionHi} onChange={handleChange} placeholder="हिन्दी में संक्षिप्त विवरण दर्ज करें" rows={4} className="wp-input" />
          }
        </WpCard>

        {/* ── Category ── */}
        <WpCard title="Category">
          <select name="categoryId" value={form.categoryId} onChange={handleChange} className="wp-input">
            <option value="">— No Category —</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.categoryNameEn}</option>)}
          </select>
          {form.categoryId && (
            <p className="wp-help-text">Hindi: {categories.find(c => c._id === form.categoryId)?.categoryNameHi || "—"}</p>
          )}
        </WpCard>

        {/* ── Tags ── */}
        <WpCard title="Tags">
          <input type="text" name="tags" value={form.tags} onChange={handleChange}
            placeholder="education,college,university" autoComplete="off" className="wp-input" />
          <p className="wp-help-text">Separate with commas.</p>
        </WpCard>

        {/* ── SEO & Meta ── */}
        <WpCard title="SEO & Meta">
          <label className="wp-label">Meta Keywords</label>
          <input type="text" name="metaKeywords" value={form.metaKeywords} onChange={handleChange}
            placeholder="highereducation,chhattisgarh,government" autoComplete="off" className="wp-input" />
          <p className="wp-help-text">Separate with commas.</p>
        </WpCard>

      </div>
    </div>
  </>
));

// ============================================================
// Main Component
// ============================================================
const RichContentPageManagements = () => {
  const isMobile = useIsMobile();
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
      const g = titleToSlug(form.titleEn);
      if (g !== form.slug) { setForm(prev => ({ ...prev, slug: g })); setSlugError(validateSlug(g)); }
    }, 300);
    return () => { if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current); };
  }, [form.titleEn, slugManuallyEdited, form.slug]);

  const fetchCategories = useCallback(async () => {
    try { const r = await axios.get(`${API}/api/get-categories`, { headers: authH() }); setCategories(r.data.data || []); } catch { /* silent */ }
  }, []);

  const getAllPages = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 100, search, sortBy, sortOrder };
      if (filterStatus === "published") params.isPublished = true;
      if (filterStatus === "draft") params.isPublished = false;
      if (filterStatus === "active") params.isActive = true;
      if (filterStatus === "inactive") params.isActive = false;
      const res = await axios.get(`${API}/api/rich-content-pages/get-all`, { headers: authH(), params });
      const data = res.data.data || [];
      setPages(data);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(res.data.pagination?.totalItems ?? data.length);
      setCounts({
        all: res.data.pagination?.totalItems ?? data.length,
        published: data.filter(p => p.isPublished).length,
        draft: data.filter(p => !p.isPublished).length,
        active: data.filter(p => p.isActive).length,
        inactive: data.filter(p => !p.isActive).length
      });
    } catch { /* silent */ } finally { setLoading(false); }
  }, [currentPage, filterStatus, search, sortBy, sortOrder]);

  useEffect(() => { getAllPages(); }, [getAllPages]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const buildPayload = (f) => ({
    ...f,
    descriptionEn: encodeBase64(f.descriptionEn || ""),
    descriptionHi: encodeBase64(f.descriptionHi || ""),
    metaKeywords: f.metaKeywords.split(",").map(x => x.trim()).filter(Boolean),
    tags: f.tags.split(",").map(x => x.trim()).filter(Boolean),
    categoryId: f.categoryId || null
  });

  const handleSubmit = async (publishAfter = false) => {
    if (!form.titleEn?.trim()) { toast.warning("English title is required."); return; }
    if (!form.slug?.trim()) { setSlugError("Slug is required"); toast.warning("Page slug is required."); return; }
    const slugErr = validateSlug(form.slug);
    if (slugErr) { setSlugError(slugErr); toast.error("Fix slug errors before saving."); return; }
    setSaving(true);
    try {
      const payload = buildPayload(form);
      let savedId = editingId;
      let res;
      if (editingId) {
        res = await axios.post(`${API}/api/rich-content-page/update/${editingId}`, payload, { headers: authH() });
      } else {
        res = await axios.post(`${API}/api/rich-content-page/create`, payload, { headers: authH() });
        savedId = res.data.data?._id || res.data._id;
        if (savedId) setEditingId(savedId);
      }
      if (publishAfter && savedId) {
        res = await axios.post(`${API}/api/rich-content-page/publish/${savedId}`, {}, { headers: authH() });
      }
      toast.success(res?.data?.message || (publishAfter ? "Page published successfully." : "Draft saved successfully."));
      getAllPages();
    } catch (e) { toast.error(e?.response?.data?.message || "Something went wrong"); }
    finally { setSaving(false); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await axios.post(`${API}/api/rich-content-page/publish/${id}`, {}, { headers: authH() });
      toast.success(res.data?.message || "Page published.");
      getAllPages();
    } catch (e) { toast.error(e?.response?.data?.message || "Publish failed"); }
  };

  const handleDraft = async (id) => {
    try {
      const res = await axios.post(`${API}/api/rich-content-page/draft/${id}`, {}, { headers: authH() });
      toast.info(res.data?.message || "Moved to draft.");
      getAllPages();
    } catch (e) { toast.error(e?.response?.data?.message || "Operation failed"); }
  };

  const handleDelete = async (id, title) => {
    const ok = await wpSwal.confirm("Delete this page?", `Permanently delete "<strong>${title || "Untitled"}</strong>"?<br>This cannot be undone.`);
    if (!ok) return;
    try {
      const res = await axios.delete(`${API}/api/rich-content-page-delete/${id}`, { headers: authH() });
      toast.success(res.data?.message || "Page deleted.");
      getAllPages();
    } catch (e) { toast.error(e?.response?.data?.message || "Delete failed"); }
  };

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
      isActive: row.isActive !== false
    });
    setSlugManuallyEdited(true);
    setSlugError("");
    setEditorKey(k => k + 1);
    setView("form");
  };

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setSlugManuallyEdited(false);
    setSlugError("");
    setIsFormFullscreen(false);
    setEditorKey(k => k + 1);
    [SS_EDITING_ID, SS_FORM, SS_FULLSCREEN].forEach(k => sessionStorage.removeItem(k));
  }, []);

  const goBackToList = useCallback(async () => {
    if (form.titleEn?.trim() || form.descriptionEn?.trim()) {
      try {
        const payload = buildPayload(form);
        if (editingId) {
          await axios.post(`${API}/api/rich-content-page/update/${editingId}`, payload, { headers: authH() });
        } else {
          const res = await axios.post(`${API}/api/rich-content-page/create`, payload, { headers: authH() });
          const newId = res.data.data?._id || res.data._id;
          if (newId) setEditingId(newId);
        }
      } catch { /* silent */ }
    }
    resetForm();
    setView("list");
  }, [form, editingId, resetForm]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    const clean = sanitiseSlug(e.target.value);
    setForm(prev => ({ ...prev, slug: clean }));
    setSlugError(validateSlug(clean));
  };
  const handleSlugBlur = (e) => {
    const clean = e.target.value.replace(/^-+|-+$/g, "");
    setForm(prev => ({ ...prev, slug: clean }));
    setSlugError(validateSlug(clean));
  };
  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortOrder("desc"); }
    setCurrentPage(1);
  };
  const sortIcon = (col) => sortBy !== col ? " ⇅" : sortOrder === "desc" ? " ↓" : " ↑";

  const editingRow = pages.find(p => p._id === editingId);
  const isPublished = !!editingRow?.isPublished;
  const fullSlugURL = form.slug ? `${SITE_URL}/${form.slug}` : "";

  // --- Top Bar ---
  const renderTopBar = (fullscreen) => (
    <div className={`wp-top-bar ${fullscreen ? "is-fullscreen" : ""}`}>
      <div className="wp-top-bar-left">
        <button type="button" onClick={goBackToList} className="wp-link-btn">
          <FaArrowLeft size={11} /> Back To List
        </button>
        <span className="wp-crumb-sep">›</span>
        <span className="wp-top-bar-title">
          {editingId ? (fullscreen ? "Edit Page (Full Screen)" : "Edit Page") : (fullscreen ? "Add New Page (Full Screen)" : "Add New Page")}
        </span>
      </div>
      <div className="wp-top-bar-right">
        {!fullscreen && (
          <button type="button" onClick={goBackToList} className="wp-btn wp-btn-danger">
            <FaTimes size={10} /> {!isMobile && "Close"}
          </button>
        )}
        <button type="button" onClick={() => form.slug && window.open(`${SITE_URL}/preview/${form.slug}`, "_blank", "noopener")} disabled={!form.slug} className="wp-btn wp-btn-secondary">
          <FaEye size={10} /> {!isMobile && "Preview"}
        </button>
        <button type="button" onClick={() => handleSubmit(false)} disabled={saving} className="wp-btn wp-btn-black">
          <FaSave size={10} /> {saving ? "Saving..." : isPublished ? "Update Page" : editingId ? "Update Draft" : "Save Draft"}
        </button>
        {isPublished ? (
          <>
            <button type="button" onClick={() => handleSubmit(true)} disabled={saving} className="wp-btn wp-btn-outline-green">
              <FaCheck size={10} /> Published
            </button>
            {editingId && (
              <button type="button" onClick={() => handleDraft(editingId)} disabled={saving} className="wp-btn wp-btn-secondary">
                <FaFileAlt size={10} /> {!isMobile && "Move to Draft"}
              </button>
            )}
          </>
        ) : (
          <button type="button" onClick={() => handleSubmit(true)} disabled={saving} className="wp-btn wp-btn-green">
            <FaCloudUploadAlt size={10} /> {saving ? "Publishing..." : "Publish"}
          </button>
        )}
        {fullscreen ? (
          <button type="button" onClick={() => setIsFormFullscreen(false)} className="wp-btn wp-btn-danger">
            <FaCompress size={10} /> {!isMobile && " Exit Full Screen"}
          </button>
        ) : (
          <button type="button" onClick={() => setIsFormFullscreen(true)} className="wp-btn wp-btn-blue">
            <FaExpand size={10} /> {!isMobile && " Full Screen"}
          </button>
        )}
      </div>
    </div>
  );

  // ========== FORM VIEW ==========
  if (view === "form") {
    return (
      <div className={isFormFullscreen ? "wp-form-fullscreen" : "wp-page-wrap"}>
        <ToastContainer toasts={toasts} onRemove={toast.remove} />
        {renderTopBar(isFormFullscreen)}
        <FormBody
          form={form} setForm={setForm}
          categories={categories} slugError={slugError} fullSlugURL={fullSlugURL}
          editingId={editingId}
          handleChange={handleChange} handleSlugChange={handleSlugChange} handleSlugBlur={handleSlugBlur}
          excerptLang={excerptLang} setExcerptLang={setExcerptLang}
          editorKey={editorKey}
          isPublished={isPublished} saving={saving}
          handleSubmit={handleSubmit} handleDraft={handleDraft} goBackToList={goBackToList}
        />
      </div>
    );
  }

  // ========== LIST VIEW ==========
  const filters = [{ k: "all", l: "All" }, { k: "published", l: "Published" }, { k: "draft", l: "Draft" }, { k: "active", l: "Active" }, { k: "inactive", l: "Inactive" }];
  return (
    <>
      <RCard className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1"><FaFileAlt className="me-2" /> Rich Content Pages Management</h3>
            <p className="adm-page-subtitle mb-0 text-white">Manage rich HTML/component pages with custom dynamic elements</p>
          </div>
          <Button color="primary" onClick={() => { resetForm(); setView("form"); }}>
            <FaPlus className="me-1" /> Add New Page
          </Button>
        </CardHeader>
      </RCard>

      <RCard className="adm-card shadow-sm border-0 mb-4">
        <CardBody>
          <div className="wp-filter-bar mb-3">
            <div className="wp-filter-tabs">
              {filters.map((f, i) => (
                <React.Fragment key={f.k}>
                  {i > 0 && <span className="wp-filter-sep">|</span>}
                  <button onClick={() => { setFilterStatus(f.k); setCurrentPage(1); }} className={`wp-filter-tab-btn ${filterStatus === f.k ? "is-active" : ""}`}>
                    {f.l} <span className="wp-count-text">({counts[f.k] ?? 0})</span>
                  </button>
                </React.Fragment>
              ))}
            </div>
            <div className="wp-search-box d-flex">
              <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search pages…" className="wp-input wp-search-input" />
              <button className="wp-btn wp-btn-blue wp-btn-sm" onClick={getAllPages}>Search</button>
            </div>
          </div>

          <div className="wp-table-container">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />
            {loading ? (
              <div className="text-center py-4"><Spinner size="sm" /></div>
            ) : pages.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <p className="mb-2">No pages found.</p>
                <button className="wp-btn wp-btn-blue" onClick={() => { resetForm(); setView("form"); }}>Add New Page</button>
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
                                <span className="wp-hi-badge">{item.titleHi.length > 20 ? item.titleHi.slice(0, 20) + "…" : item.titleHi}</span>
                              )}
                            </div>
                            <div className="d-flex align-items-center gap-2 mt-1">
                              <FaLink size={10} className="wp-count-text" />
                              <a href={`${SITE_URL}/${item.slug}`} target="_blank" rel="noopener noreferrer" className="wp-slug-link">{SITE_URL}/{item.slug}</a>
                              <CopyBtn text={`${SITE_URL}/${item.slug}`} />
                            </div>
                            {hoveredRow === item._id && !isMobile && (
                              <div className="wp-row-actions mt-1">
                                <button className="wp-link-btn" onClick={() => handleEdit(item)}><FaEdit size={10} /> Edit</button>
                                <span className="wp-filter-sep">|</span>
                                <button className="wp-link-btn is-danger" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={10} /> Trash</button>
                                <span className="wp-filter-sep">|</span>
                                <button className="wp-link-btn" onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}><FaEye size={10} /> Preview</button>
                                <span className="wp-filter-sep">|</span>
                                {item.isPublished
                                  ? <button className="wp-link-btn" onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> Move to Draft</button>
                                  : <button className="wp-link-btn is-green" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> Publish</button>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="wp-td">{categories.find(c => c._id === (item.categoryId?._id || item.categoryId))?.categoryNameEn || <span className="wp-crumb-sep">—</span>}</td>
                        <td className="wp-td text-nowrap">{formatDate(item.createdAt)}</td>
                        <td className="wp-td text-nowrap">{item.isPublished && item.publishDate ? formatDate(item.publishDate) : <span className="wp-crumb-sep">—</span>}</td>
                        <td className="wp-td text-nowrap">{formatDate(item.updatedAt)}</td>
                        <td className="wp-td is-action text-end">
                          <div className="wp-action-group justify-content-end">
                            <button className="wp-btn wp-btn-secondary wp-btn-sm" onClick={() => handleEdit(item)}><FaEdit size={10} /> {!isMobile && "Edit"}</button>
                            <button className="wp-btn wp-btn-secondary wp-btn-sm" onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}><FaEye size={10} /> {!isMobile && "Preview"}</button>
                            {item.isPublished
                              ? <button className="wp-btn wp-btn-secondary wp-btn-sm" onClick={() => handleDraft(item._id)}><FaFileAlt size={10} /> {!isMobile && "Draft"}</button>
                              : <button className="wp-btn wp-btn-green wp-btn-sm" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={10} /> {!isMobile && "Publish"}</button>}
                            <button className="wp-btn wp-btn-danger wp-btn-sm" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={10} /> {!isMobile && "Delete"}</button>
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
        </CardBody>
      </RCard>
    </>
  );
};

export default RichContentPageManagements;