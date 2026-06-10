import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import axios from "axios";
import { Spinner } from "reactstrap";
import Swal from "sweetalert2";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt,
  FaCopy, FaCheck, FaSave, FaLink, FaArrowLeft, FaExpand, FaCompress, FaTimes,
} from "react-icons/fa";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const getToken = () => sessionStorage.getItem("authToken");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

const SS_VIEW       = "rcpm_view";
const SS_EDITING_ID = "rcpm_editingId";
const SS_FORM       = "rcpm_form";
const SS_FULLSCREEN = "rcpm_fullscreen";

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

const titleToSlug = (text) => {
  if (!text) return "";
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s\-\/]/g, "")
    .replace(/\s+/g, "-")
    .replace(/\-{2,}/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/^\/+|\/+$/g, "");
};

const sanitiseSlug = (raw) =>
  raw.toLowerCase()
    .replace(/ +/g, "-")
    .replace(/\-{2,}/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/[^a-z0-9\-\/]/g, "")
    .replace(/^\/+|\/+$/g, "");

const validateSlug = (value) => {
  if (!value) return "Slug is required";
  if (/[^a-z0-9\-\/]/.test(value)) return "Only lowercase letters, numbers, hyphens and forward slashes allowed";
  if (value.startsWith("-") || value.endsWith("-")) return "Slug cannot start or end with a hyphen";
  if (value.startsWith("/") || value.endsWith("/")) return "Slug cannot start or end with a slash";
  if (/\/{2,}/.test(value)) return "Slug cannot contain consecutive slashes";
  if (/\-{2,}/.test(value)) return "Slug cannot contain consecutive hyphens";
  return "";
};

const btnBase = {
  display: "inline-flex", alignItems: "center", gap: 4,
  border: "1px solid transparent", borderRadius: 3,
  fontSize: 13, fontWeight: 400, lineHeight: "2.15384615",
  padding: "0 10px", cursor: "pointer", fontFamily: FF,
  textDecoration: "none", whiteSpace: "nowrap",
};
const smPad = { fontSize: 11, padding: "0 8px", lineHeight: "1.9" };

const BtnBlue = ({ children, onClick, disabled, size }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.blueHov : WP.blue, borderColor: hov ? WP.blueHov : WP.blue, color: "#fff", opacity: disabled ? .6 : 1 }}>
      {children}
    </button>
  );
};
const BtnGreen = ({ children, onClick, disabled, size }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.greenDark : WP.green, borderColor: hov ? WP.greenDark : WP.green, color: "#fff", opacity: disabled ? .6 : 1 }}>
      {children}
    </button>
  );
};
const BtnBlack = ({ children, onClick, disabled, size }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.blackHov : WP.black, borderColor: hov ? WP.blackHov : WP.black, color: "#fff", opacity: disabled ? .6 : 1 }}>
      {children}
    </button>
  );
};
const BtnSecondary = ({ children, onClick, disabled, size }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: WP.white, borderColor: hov ? WP.blue : WP.border, color: hov ? WP.blue : WP.text, opacity: disabled ? .5 : 1 }}>
      {children}
    </button>
  );
};
const BtnDanger = ({ children, onClick, size }) => {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ ...btnBase, ...(size === "sm" ? smPad : {}), background: hov ? WP.redBg : WP.white, borderColor: WP.red, color: WP.red }}>
      {children}
    </button>
  );
};

const LinkBtn = ({ children, onClick, color }) => (
  <button onClick={onClick}
    style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, color: color || WP.blue, fontFamily: FF, textDecoration: "none" }}
    onMouseEnter={e => e.currentTarget.style.color = color ? WP.redDark : WP.blueHov}
    onMouseLeave={e => e.currentTarget.style.color = color || WP.blue}>
    {children}
  </button>
);

const StatusBadge = ({ published, active }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: published ? WP.greenBg : WP.orangeBg, color: published ? WP.greenDark : WP.amber, border: `1px solid ${published ? WP.green : WP.orange}` }}>
      {published ? "Published" : "Draft"}
    </span>
    <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 11, fontWeight: 600, background: active ? WP.greenBg : "#f8d7da", color: active ? WP.greenDark : "#a30000", border: `1px solid ${active ? WP.green : "#f5c6cb"}` }}>
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
      style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer", color: copied ? WP.green : WP.textLight, fontSize: 11, fontFamily: FF, display: "inline-flex", alignItems: "center", gap: 2 }}>
      {copied ? <FaCheck size={9} /> : <FaCopy size={9} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const fi   = { border: `1px solid ${WP.border}`, borderRadius: 4, padding: "5px 8px", fontSize: 14, color: WP.text, outline: "none", fontFamily: FF, width: "100%", boxSizing: "border-box", background: WP.white, lineHeight: 1.5 };
const lbl  = { fontSize: 13, fontWeight: 600, color: WP.text, marginBottom: 4, display: "block" };
const focus = { onFocus: e => { e.target.style.borderColor = WP.focus; e.target.style.boxShadow = `0 0 0 1px ${WP.focus}`; }, onBlur: e => { e.target.style.borderColor = WP.border; e.target.style.boxShadow = "none"; } };

const Card = ({ title, children, action }) => (
  <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
    {title && (
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${WP.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: WP.text }}>{title}</h2>
        {action}
      </div>
    )}
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

const emptyForm = () => ({
  titleEn: "", titleHi: "", slug: "",
  shortDescriptionEn: "", shortDescriptionHi: "",
  descriptionEn: "", descriptionHi: "",
  metaKeywords: "", tags: "", categoryId: "", isActive: true
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

// ============================================================
// FormBody (now uses uncontrolled DynamicContentEditor)
// ============================================================
const FormBody = React.memo(({
  form, setForm, categories, slugError, fullSlugURL,
  isPublished, saving, editingId, handleChange, handleSlugChange,
  handleSlugBlur, handleSubmit, handleDraft, goBackToList, isMobile, message,
  excerptLang, setExcerptLang
}) => {
  const gridColumns = isMobile ? "1fr" : "1fr 260px";
  return (
    <>
      <FlashMsg msg={message} />
      <div style={{ display: "grid", gridTemplateColumns: gridColumns, gap: isMobile ? 12 : 16, padding: isMobile ? "12px" : "16px 20px", maxWidth: 1380, margin: "0 auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 14 }}>
          <Card>
            <input
              name="titleEn" value={form.titleEn} onChange={handleChange}
              placeholder="Add English title"
              style={{ ...fi, fontSize: isMobile ? 18 : 22, fontWeight: 400, padding: "6px 0", border: "none", borderBottom: `1px solid ${WP.line}`, borderRadius: 0, marginBottom: 10 }}
              onFocus={e => (e.target.style.borderBottomColor = WP.focus)}
              onBlur={e => (e.target.style.borderBottomColor = WP.line)}
            />
            <input
              name="titleHi" value={form.titleHi} onChange={handleChange}
              placeholder="शीर्षक (Hindi)"
              style={{ ...fi, fontSize: isMobile ? 14 : 16, padding: "5px 0", border: "none", borderBottom: `1px solid ${WP.line}`, borderRadius: 0 }}
              onFocus={e => (e.target.style.borderBottomColor = WP.focus)}
              onBlur={e => (e.target.style.borderBottomColor = WP.line)}
            />
            <div style={{ marginTop: 10, display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 6 : 6, fontSize: 13 }}>
              <span style={{ color: WP.textMid, fontWeight: 600 }}>Permalink:</span>
              <span style={{ color: WP.textMid }}>{SITE_URL}/</span>
              <div style={{ display: "flex", alignItems: "stretch", border: `1px solid ${slugError ? WP.red : WP.border}`, borderRadius: 3, overflow: "hidden", flex: 1 }}>
                <input name="slug" value={form.slug} onChange={handleSlugChange} onBlur={handleSlugBlur} placeholder="page-slug" style={{ ...fi, border: "none", borderRadius: 0, width: "100%", padding: "3px 6px", fontSize: 13 }} />
              </div>
              {!slugError && form.slug && <CopyBtn text={fullSlugURL} />}
              {slugError && <span style={{ fontSize: 11, color: WP.red }}>⚠ {slugError}</span>}
            </div>
          </Card>

          <Card title="Page Main Content Area">
            <DynamicContentEditor
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
              instanceId="rich_content_editor"
            />
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 14 }}>
          <Card title="View Management Tools">
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 6, borderBottom: `1px solid ${WP.line}`, flexWrap: "wrap", gap: 4 }}>
                <span>Status: <strong style={{ color: isPublished ? WP.greenDark : WP.amber }}>{isPublished ? "Published" : "Draft"}</strong></span>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", paddingBottom: 6, borderBottom: `1px solid ${WP.line}` }}>
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ accentColor: WP.green, cursor: "pointer" }} />
                <span>Active (Visible on site)</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 2 }}>
                <BtnBlack onClick={() => handleSubmit(false)} disabled={saving} size="sm"><FaSave size={10} /> {saving ? "Saving…" : editingId ? "Update Draft" : "Save Draft"}</BtnBlack>
                <BtnGreen onClick={() => handleSubmit(true)} disabled={saving} size="sm"><FaCloudUploadAlt size={10} /> {saving ? "…" : "Publish Page"}</BtnGreen>
                {editingId && isPublished && <BtnSecondary onClick={() => handleDraft(editingId)} size="sm"><FaFileAlt size={10} /> Move to Draft</BtnSecondary>}
                <div style={{ borderTop: `1px solid ${WP.line}`, paddingTop: 6, marginTop: 2 }}>
                  <LinkBtn onClick={goBackToList} color={WP.red}><FaTrashAlt size={9} style={{ marginRight: 3 }} />Discard Changes</LinkBtn>
                </div>
              </div>
            </div>
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
              : <textarea name="shortDescriptionHi" placeholder="Short Description Hindi"   value={form.shortDescriptionHi} onChange={handleChange} rows={4} style={{ ...fi, resize: "vertical" }} {...focus} />}
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
});

// ============================================================
// Main Component
// ============================================================
const RichContentPageManagements = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(max-width: 768px)");

  const initView        = () => sessionStorage.getItem(SS_VIEW) || "list";
  const initEditingId   = () => sessionStorage.getItem(SS_EDITING_ID) || null;
  const initForm        = () => { try { const s = sessionStorage.getItem(SS_FORM);   return s ? JSON.parse(s) : emptyForm(); } catch { return emptyForm(); } };
  const initFullscreen  = () => sessionStorage.getItem(SS_FULLSCREEN) === "true";

  const [loading,             setLoading]             = useState(false);
  const [saving,              setSaving]              = useState(false);
  const [pages,               setPages]               = useState([]);
  const [editingId,           setEditingId]           = useState(initEditingId);
  const [view,                setView]                = useState(initView);
  const [message,             setMessage]             = useState(null);
  const [form,                setForm]                = useState(initForm);
  const [search,              setSearch]              = useState("");
  const [filterStatus,        setFilterStatus]        = useState("all");
  const [currentPage,         setCurrentPage]         = useState(1);
  const [totalPages,          setTotalPages]          = useState(1);
  const [totalItems,          setTotalItems]          = useState(0);
  const [sortBy,              setSortBy]              = useState("createdAt");
  const [sortOrder,           setSortOrder]           = useState("desc");
  const [slugError,           setSlugError]           = useState("");
  const [slugManuallyEdited,  setSlugManuallyEdited]  = useState(!!initEditingId());
  const [categories,          setCategories]          = useState([]);
  const [counts,              setCounts]              = useState({ all: 0, published: 0, draft: 0, active: 0, inactive: 0 });
  const [hoveredRow,          setHoveredRow]          = useState(null);
  const [isFormFullscreen,    setIsFormFullscreen]    = useState(initFullscreen);
  const [excerptLang,         setExcerptLang]         = useState("en");

  const slugDebounceRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem(SS_FULLSCREEN, isFormFullscreen ? "true" : "false");
  }, [isFormFullscreen]);

  const buildPayload = useCallback((f) => {
    return {
      ...f,
      descriptionEn: f.descriptionEn,
      descriptionHi: f.descriptionHi,
      metaKeywords: f.metaKeywords.split(",").map(x => x.trim()).filter(Boolean),
      tags: f.tags.split(",").map(x => x.trim()).filter(Boolean),
      categoryId: f.categoryId || null
    };
  }, []);

  useEffect(() => { sessionStorage.setItem(SS_VIEW, view); }, [view]);
  useEffect(() => { if (editingId) sessionStorage.setItem(SS_EDITING_ID, editingId); else sessionStorage.removeItem(SS_EDITING_ID); }, [editingId]);
  useEffect(() => { if (view === "form") sessionStorage.setItem(SS_FORM, JSON.stringify(form)); }, [form, view]);
  useEffect(() => { if (!message) return; const t = setTimeout(() => setMessage(null), 4500); return () => clearTimeout(t); }, [message]);

  // Debounced slug generation
  useEffect(() => {
    if (slugManuallyEdited || !form.titleEn) return;
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(() => {
      const generated = titleToSlug(form.titleEn);
      if (generated !== form.slug) {
        setForm(prev => ({ ...prev, slug: generated }));
        setSlugError(validateSlug(generated));
      }
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
      if (filterStatus === "draft")     params.isPublished = false;
      if (filterStatus === "active")    params.isActive    = true;
      if (filterStatus === "inactive")  params.isActive    = false;
      const res  = await axios.get(`${API}/api/rich-content-pages/get-all`, { headers: authH(), params });
      const data = res.data.data || [];
      setPages(data);
      const ti = res.data.pagination?.totalItems ?? data.length;
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(ti);
      setCounts({ all: ti, published: data.filter(p => p.isPublished).length, draft: data.filter(p => !p.isPublished).length, active: data.filter(p => p.isActive).length, inactive: data.filter(p => !p.isActive).length });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSubmit = async (publishAfter = false) => {
    const err = validateSlug(form.slug);
    if (err) { setSlugError(err); setMessage({ type: "danger", text: "Fix slug errors before saving." }); return; }
    try {
      setSaving(true);
      const payload = buildPayload(form);
      let savedId = editingId;
      if (editingId) {
        await axios.post(`${API}/api/rich-content-page/update/${editingId}`, payload, { headers: authH() });
      } else {
        const res = await axios.post(`${API}/api/rich-content-page/create`, payload, { headers: authH() });
        savedId = res.data.data?._id || res.data._id;
        if (savedId) setEditingId(savedId);
      }
      if (publishAfter && savedId) { await axios.post(`${API}/api/rich-content-page/publish/${savedId}`, {}, { headers: authH() }); }
      setMessage({ type: "success", text: publishAfter ? "Page published." : "Draft saved." });
      getAllPages();
    } catch (err) { setMessage({ type: "danger", text: err?.response?.data?.message || "Something went wrong" }); } finally { setSaving(false); }
  };

  const handlePublish = async (id) => { try { await axios.post(`${API}/api/rich-content-page/publish/${id}`, {}, { headers: authH() }); getAllPages(); } catch { } };
  const handleDraft   = async (id) => { try { await axios.post(`${API}/api/rich-content-page/draft/${id}`,   {}, { headers: authH() }); getAllPages(); } catch { } };

  const handleDelete = async (id, title) => {
    const result = await Swal.fire({ title: "Delete this page?", html: `<span style="font-size:13px;color:#50575e">Permanently delete <strong>"${title || "Untitled"}"</strong>?<br>This cannot be undone.</span>`, icon: "warning", showCancelButton: true, confirmButtonColor: WP.red, cancelButtonColor: WP.textMid, confirmButtonText: "Delete", cancelButtonText: "Cancel", reverseButtons: true });
    if (!result.isConfirmed) return;
    try { await axios.delete(`${API}/api/rich-content-page-delete/${id}`, { headers: authH() }); Swal.fire({ title: "Deleted", icon: "success", timer: 1500, showConfirmButton: false }); getAllPages(); } catch (err) { Swal.fire("Error", err?.response?.data?.message || "Delete failed", "error"); }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    setForm({
      titleEn: row.titleEn || "",
      titleHi: row.titleHi || "",
      slug: row.slug || "",
      shortDescriptionEn: row.shortDescriptionEn || "",
      shortDescriptionHi: row.shortDescriptionHi || "",
      descriptionEn: row.descriptionEn || "",
      descriptionHi: row.descriptionHi || "",
      metaKeywords: (row.metaKeywords || []).join(", "),
      tags: (row.tags || []).join(", "),
      categoryId: row.categoryId || "",
      isActive: row.isActive
    });
    setSlugManuallyEdited(true);
    setSlugError("");
    setView("form");
  };

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setSlugManuallyEdited(false);
    setSlugError("");
    setIsFormFullscreen(false);
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
      } catch (err) { console.error("Save on back failed", err); }
    }
    resetForm();
    setView("list");
  }, [form, editingId, buildPayload, resetForm]);

  const handleChange    = (e) => { const { name, value, type, checked } = e.target; setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value })); };
  const handleSlugChange = (e) => { setSlugManuallyEdited(true); const clean = sanitiseSlug(e.target.value); setForm(prev => ({ ...prev, slug: clean })); setSlugError(validateSlug(clean)); };
  const handleSlugBlur  = (e) => { const clean = e.target.value.replace(/^-+|-+$/g, ""); setForm(prev => ({ ...prev, slug: clean })); setSlugError(validateSlug(clean)); };
  const handleSort      = (col) => { if (sortBy === col) setSortOrder(o => o === "desc" ? "asc" : "desc"); else { setSortBy(col); setSortOrder("desc"); } setCurrentPage(1); };
  const sortIcon        = (col) => sortBy !== col ? " ⇅" : sortOrder === "desc" ? " ↓" : " ↑";

  const editingRow  = pages.find(p => p._id === editingId);
  const isPublished = !!editingRow?.isPublished;
  const fullSlugURL = form.slug ? `${SITE_URL}/${form.slug}` : "";

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const FormTopBar = ({ fullscreen }) => (
    <div style={{
      background: WP.white, borderBottom: `1px solid ${WP.line}`,
      padding: isMobile ? "8px 12px" : "8px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 10, flexWrap: "wrap",
      ...(fullscreen ? { position: "sticky", top: 0, zIndex: 1000 } : { top: 0, zIndex: 1000, boxShadow: "0 1px 2px rgba(0,0,0,.05)" }),
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button onClick={goBackToList} style={{ background: "none", border: "none", cursor: "pointer", color: WP.blue, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
          <FaArrowLeft size={11} /> Back To List Page
        </button>
        <span style={{ color: WP.border }}>›</span>
        <span style={{ fontSize: isMobile ? 12 : 14, color: WP.text, fontWeight: 600 }}>
          {editingId ? (fullscreen ? "Edit Page (Full Screen)" : "Edit Page") : (fullscreen ? "Add New Page (Full Screen)" : "Add New Page")}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {!fullscreen && (
          <BtnDanger onClick={goBackToList}><FaTimes size={10} /> Close</BtnDanger>
        )}
        <BtnSecondary size="sm" onClick={() => form.slug && window.open(`${SITE_URL}/preview/${form.slug}`, "_blank")} disabled={!form.slug}>
          <FaEye size={10} /> {!isMobile && "Preview"}
        </BtnSecondary>
        <BtnBlack onClick={() => handleSubmit(false)} disabled={saving}>
          <FaSave size={10} /> {saving ? "Saving…" : "Save Draft"}
        </BtnBlack>
        <BtnGreen onClick={() => handleSubmit(true)} disabled={saving}>
          <FaCloudUploadAlt size={10} /> {saving ? "…" : "Publish"}
        </BtnGreen>
        {fullscreen ? (
          <button onClick={() => setIsFormFullscreen(false)} style={{ ...btnBase, background: WP.red, color: "#fff" }}>
            <FaCompress size={10} /> {!isMobile && "Exit Full Screen"}
          </button>
        ) : (
          <button onClick={() => setIsFormFullscreen(true)} style={{ ...btnBase, background: WP.blue, color: "#fff", padding: "0 8px", fontSize: isMobile ? 11 : 13 }}>
            <FaExpand size={10} /> {!isMobile && "Full Screen"}
          </button>
        )}
      </div>
    </div>
  );

  // ========== LIST VIEW ==========
  if (view === "list") {
    const thSt = { padding: "8px 10px", fontWeight: 700, color: WP.textMid, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", background: "#f6f7f7", borderBottom: `1px solid ${WP.line}`, textAlign: "left" };
    const filters = [{ k: "all", l: "All" }, { k: "published", l: "Published" }, { k: "draft", l: "Draft" }, { k: "active", l: "Active" }, { k: "inactive", l: "Inactive" }];
    const tableWrapperStyle = { overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" };
    const tdStyle = (isAction = false) => ({ padding: isMobile ? "6px 8px" : "8px 10px", verticalAlign: "center", fontSize: isMobile ? 11 : 13, ...(isAction && { textAlign: "right" }) });

    return (
      <div style={{ background: WP.bg, minHeight: "100vh", fontFamily: FF }}>
        <div style={{ background: WP.white, borderBottom: `1px solid ${WP.line}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <strong style={{ margin: 0, fontSize: isMobile ? 18 : 21, fontWeight: 400, color: WP.text }}>Rich Content Pages</strong>
          </div>
          <div><BtnBlue onClick={() => { resetForm(); setView("form"); }} size="sm">Add New Page</BtnBlue></div>
          <FlashMsg msg={message} />
        </div>

        <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, fontSize: 13, flexWrap: "wrap" }}>
            {filters.map((f, i) => (
              <React.Fragment key={f.k}>
                {i > 0 && <span style={{ color: WP.border, margin: "0 4px" }}>|</span>}
                <button onClick={() => { setFilterStatus(f.k); setCurrentPage(1); }}
                  style={{ background: "none", border: "none", padding: "0 2px", cursor: "pointer", fontSize: isMobile ? 11 : 13, fontFamily: FF, color: filterStatus === f.k ? WP.text : WP.blue, fontWeight: filterStatus === f.k ? 600 : 400, textDecoration: "none", whiteSpace: "nowrap" }}
                  onMouseEnter={e => { if (filterStatus !== f.k) e.currentTarget.style.color = WP.blueHov; }}
                  onMouseLeave={e => { if (filterStatus !== f.k) e.currentTarget.style.color = WP.blue; }}>
                  {f.l} <span style={{ color: WP.textLight }}>({counts[f.k] ?? 0})</span>
                </button>
              </React.Fragment>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search pages…" style={{ ...fi, width: isMobile ? "calc(100% - 70px)" : 200, padding: "4px 8px", fontSize: 13 }} {...focus} />
            <BtnBlue size="sm" onClick={getAllPages}>Search</BtnBlue>
          </div>
        </div>

        <div style={{ margin: "8px 16px" }}>
          <div style={{ background: WP.white, border: `1px solid ${WP.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />
            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}><Spinner size="sm" /></div>
            ) : pages.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: WP.textMid }}>
                <p style={{ fontSize: 15, marginBottom: 12 }}>No pages found.</p>
                <BtnBlue onClick={() => { resetForm(); setView("form"); }}>Add New Page</BtnBlue>
              </div>
            ) : (
              <div style={tableWrapperStyle}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 11 : 13, minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={{ ...thSt, width: 28, padding: isMobile ? "6px 6px" : "8px 10px" }}><input type="checkbox" /></th>
                      <th style={{ ...thSt, padding: isMobile ? "6px 6px" : "8px 10px" }}>SNo.</th>
                      <th style={{ ...thSt, padding: isMobile ? "6px 6px" : "8px 10px" }}>Title / Hindi / Link</th>
                      <th style={{ ...thSt, padding: isMobile ? "6px 6px" : "8px 10px" }}>Category</th>
                      <th onClick={() => handleSort("createdAt")}   style={{ ...thSt, cursor: "pointer", padding: isMobile ? "6px 6px" : "8px 10px" }}>Created{sortIcon("createdAt")}</th>
                      <th onClick={() => handleSort("publishDate")} style={{ ...thSt, cursor: "pointer", padding: isMobile ? "6px 6px" : "8px 10px" }}>Published{sortIcon("publishDate")}</th>
                      <th onClick={() => handleSort("updatedAt")}   style={{ ...thSt, cursor: "pointer", padding: isMobile ? "6px 6px" : "8px 10px" }}>Updated{sortIcon("updatedAt")}</th>
                      <th style={{ ...thSt, padding: isMobile ? "6px 6px" : "8px 10px" }}>Actions</th>
                      <th style={{ ...thSt, padding: isMobile ? "6px 6px" : "8px 10px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((item, idx) => (
                      <tr key={item._id} onMouseEnter={() => setHoveredRow(item._id)} onMouseLeave={() => setHoveredRow(null)} style={{ borderBottom: `1px solid ${WP.line}`, background: hoveredRow === item._id ? "#f9f9f9" : WP.white }}>
                        <td style={{ ...tdStyle(), width: 28 }}><input type="checkbox" style={{ cursor: "pointer", marginTop: 2 }} /></td>
                        <td style={tdStyle()}>{(currentPage - 1) * 100 + idx + 1}</td>
                        <td style={tdStyle()}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <strong title={item.titleEn || "Untitled"} style={{ fontSize: isMobile ? 13 : 14 }}>
                                <button onClick={() => handleEdit(item)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: isMobile ? 13 : 14, fontWeight: 600, color: WP.text, fontFamily: FF, textAlign: "left" }}>
                                  {item.titleEn ? (item.titleEn.length > 35 ? `${item.titleEn.slice(0, 35)}...` : item.titleEn) : <em style={{ color: WP.textLight }}>Untitled</em>}
                                </button>
                              </strong>
                              {item.titleHi && (
                                <span title={item.titleHi} style={{ fontSize: 10, background: WP.blueBg, color: WP.blue, padding: "2px 5px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 2 }}>
                                  <span>हि</span> <span>{item.titleHi.length > (isMobile ? 15 : 20) ? item.titleHi.slice(0, isMobile ? 15 : 20) + "…" : item.titleHi}</span>
                                </span>
                              )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              <FaLink size={isMobile ? 8 : 10} style={{ color: WP.textLight }} />
                              <a href={`${SITE_URL}/${item.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: isMobile ? 9 : 11, color: WP.blue, textDecoration: "none" }}>{SITE_URL}/{item.slug}</a>
                              <CopyBtn text={`${SITE_URL}/${item.slug}`} />
                            </div>
                            {hoveredRow === item._id && !isMobile && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 12 }}>
                                <LinkBtn onClick={() => handleEdit(item)}>Edit</LinkBtn>
                                <span style={{ color: WP.border }}>|</span>
                                <LinkBtn onClick={() => handleDelete(item._id, item.titleEn)} color={WP.red}>Trash</LinkBtn>
                                <span style={{ color: WP.border }}>|</span>
                                <LinkBtn onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}>Preview</LinkBtn>
                                <span style={{ color: WP.border }}>|</span>
                                {item.isPublished
                                  ? <LinkBtn onClick={() => handleDraft(item._id)}>Move to Draft</LinkBtn>
                                  : <LinkBtn onClick={() => handlePublish(item._id)} color={WP.green}>Publish</LinkBtn>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle()}>{categories.find(c => c._id === item.categoryId)?.categoryNameEn || <span style={{ color: WP.border }}>—</span>}</td>
                        <td style={{ ...tdStyle(), whiteSpace: "nowrap" }}>{formatDate(item.createdAt)}</td>
                        <td style={{ ...tdStyle(), whiteSpace: "nowrap" }}>{item.isPublished && item.publishDate ? formatDate(item.publishDate) : <span style={{ color: WP.border }}>—</span>}</td>
                        <td style={{ ...tdStyle(), whiteSpace: "nowrap" }}>{formatDate(item.updatedAt)}</td>
                        <td style={{ ...tdStyle(true) }}>
                          <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <BtnSecondary size="sm" onClick={() => handleEdit(item)}><FaEdit size={isMobile ? 9 : 11} /> {!isMobile && "Edit"}</BtnSecondary>
                            <BtnSecondary size="sm" onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}><FaEye size={isMobile ? 9 : 11} /> {!isMobile && "Preview"}</BtnSecondary>
                            {item.isPublished
                              ? <BtnSecondary size="sm" onClick={() => handleDraft(item._id)}><FaFileAlt size={isMobile ? 9 : 11} /> {!isMobile && "Draft"}</BtnSecondary>
                              : <BtnGreen     size="sm" onClick={() => handlePublish(item._id)}><FaCloudUploadAlt size={isMobile ? 9 : 11} /> {!isMobile && "Publish"}</BtnGreen>}
                            <BtnDanger size="sm" onClick={() => handleDelete(item._id, item.titleEn)}><FaTrashAlt size={isMobile ? 9 : 11} /> {!isMobile && "Delete"}</BtnDanger>
                          </div>
                        </td>
                        <td style={tdStyle()}><StatusBadge published={item.isPublished} active={item.isActive} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalItems} shown={pages.length} onPrev={() => setCurrentPage(p => p - 1)} onNext={() => setCurrentPage(p => p + 1)} />
          </div>
        </div>
        <div style={{ height: 20 }} />
      </div>
    );
  }

  // ========== FORM VIEWS ==========
  if (view === "form" && !isFormFullscreen) {
    return (
      <div style={{ background: WP.bg, minHeight: "100vh", fontFamily: FF }}>
        <FormTopBar fullscreen={false} />
        <FormBody
          form={form} setForm={setForm}
          categories={categories} slugError={slugError} fullSlugURL={fullSlugURL}
          isPublished={isPublished} saving={saving} editingId={editingId}
          handleChange={handleChange} handleSlugChange={handleSlugChange}
          handleSlugBlur={handleSlugBlur} handleSubmit={handleSubmit}
          handleDraft={handleDraft} goBackToList={goBackToList}
          isMobile={isMobile} message={message}
          excerptLang={excerptLang} setExcerptLang={setExcerptLang}
        />
      </div>
    );
  }

  if (view === "form" && isFormFullscreen) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: WP.bg, zIndex: 2000, overflowY: "auto", fontFamily: FF }}>
        <FormTopBar fullscreen={true} />
        <FormBody
          form={form} setForm={setForm}
          categories={categories} slugError={slugError} fullSlugURL={fullSlugURL}
          isPublished={isPublished} saving={saving} editingId={editingId}
          handleChange={handleChange} handleSlugChange={handleSlugChange}
          handleSlugBlur={handleSlugBlur} handleSubmit={handleSubmit}
          handleDraft={handleDraft} goBackToList={goBackToList}
          isMobile={isMobile} message={message}
          excerptLang={excerptLang} setExcerptLang={setExcerptLang}
        />
      </div>
    );
  }

  return null;
};

export default RichContentPageManagements;