// RichContentPageManagements.jsx — WordPress-style CMS, fully corrected
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Spinner } from "reactstrap";
import {
  FaEye, FaEdit, FaCloudUploadAlt, FaFileAlt, FaTrashAlt, FaCopy, FaCheck,
} from "react-icons/fa";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";

const API = import.meta.env.VITE_API_URL;
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;
const getToken = () => sessionStorage.getItem("authToken");
const authH = () => ({ Authorization: `Bearer ${getToken()}` });

/* ─── Design tokens ─────────────────────────────────────────── */
const C = {
  bg: "#f0f0f1",
  card: "#ffffff",
  border: "#c3c4c7",
  text: "#1d2327",
  textMid: "#50575e",
  textLight: "#787c82",
  green: "#00a32a",
  greenDark: "#007017",
  greenBg: "#f0f6ec",
  black: "#1d2327",
  blackHov: "#2c3338",
  blue: "#2271b1",
  blueLight: "#e8f0fb",
  red: "#d63638",
  redBg: "#fcf0f1",
  orange: "#dba617",
  orangeBg: "#fcf9e8",
  amber: "#996800",
  line: "#dcdcde",
  white: "#ffffff",
};
const FF = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif";

/* ─── Button base ───────────────────────────────────────────── */
const btnBase = {
  display: "inline-flex", alignItems: "center", gap: 5,
  border: "1px solid transparent", borderRadius: 3,
  fontSize: 13, fontWeight: 400, lineHeight: "2.15384615",
  padding: "0 10px", cursor: "pointer", fontFamily: FF,
  textDecoration: "none", whiteSpace: "nowrap",
  transition: "background .12s,border-color .12s,color .12s",
};
const smPad = { fontSize: 12, padding: "1px 8px", lineHeight: "1.9" };

const BtnGreen = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} style={{
    ...btnBase, background: C.green, borderColor: C.greenDark, color: "#fff",
    ...(size === "sm" ? smPad : {}), opacity: disabled ? .6 : 1,
  }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.greenDark; }}
    onMouseLeave={e => { e.currentTarget.style.background = C.green; }}
  >{children}</button>
);

const BtnBlack = ({ children, onClick, disabled, size }) => (
  <button onClick={onClick} disabled={disabled} style={{
    ...btnBase, background: C.black, borderColor: C.blackHov, color: "#fff",
    ...(size === "sm" ? smPad : {}), opacity: disabled ? .6 : 1,
  }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = C.blackHov; }}
    onMouseLeave={e => { e.currentTarget.style.background = C.black; }}
  >{children}</button>
);

const BtnSecondary = ({ children, onClick, size }) => (
  <button onClick={onClick} style={{
    ...btnBase, background: C.white, borderColor: C.border, color: C.text,
    ...(size === "sm" ? smPad : {}),
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
  >{children}</button>
);

const BtnDanger = ({ children, onClick, size }) => (
  <button onClick={onClick} style={{
    ...btnBase, background: C.white, borderColor: C.red, color: C.red,
    ...(size === "sm" ? smPad : {}),
  }}
    onMouseEnter={e => { e.currentTarget.style.background = C.redBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = C.white; }}
  >{children}</button>
);

/* ─── Status pill ───────────────────────────────────────────── */
const StatusPill = ({ published, active, publishedAt }) => {
  const pill = (bg, color, border, dot, label) => (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 11, fontSize: 11, fontWeight: 600,
      background: bg, color, border: `1px solid ${border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {label}
    </span>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {published
          ? pill(C.greenBg, C.green, C.green, C.green, "Published")
          : pill(C.orangeBg, C.amber, C.orange, C.orange, "Draft")}
        {pill(
          active ? C.greenBg : "#f6f7f7",
          active ? C.greenDark : C.textLight,
          active ? C.green : C.border,
          active ? C.green : C.textLight,
          active ? "Active" : "Inactive"
        )}
      </div>
      {published && publishedAt && (
        <span style={{ fontSize: 10, color: C.textLight }}>
          {new Date(publishedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      )}
    </div>
  );
};

/* ─── Empty state ───────────────────────────────────────────── */
const EmptyState = ({ onAdd }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMid }}>
    <div style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}>📄</div>
    <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>No pages yet</p>
    <p style={{ fontSize: 13, margin: "0 0 18px" }}>Create your first rich content page.</p>
    <BtnGreen onClick={onAdd}>+ Add New Page</BtnGreen>
  </div>
);

/* ─── Slug helpers ──────────────────────────────────────────── */
// Auto-generate slug from title (used only when not manually edited)
const titleToSlug = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-/]/g, "")   // strip invalid chars
    .replace(/\s+/g, "-")               // spaces → single hyphen
    .replace(/-{2,}/g, "-")             // collapse multiple hyphens
    .replace(/^[-/]+|[-/]+$/g, "");     // strip leading/trailing - and /
};

// Real-time slug sanitise as user types
const sanitiseSlug = (raw) => {
  return raw
    .toLowerCase()
    .replace(/ +/g, "-")               // every run of spaces → single -
    .replace(/-{2,}/g, "-")            // collapse consecutive hyphens
    .replace(/[^a-z0-9\-/]/g, "");     // strip anything else
};

const validateSlug = (value) => {
  if (!value) return "Slug is required";
  if (value.startsWith("/") || value.endsWith("/")) return "Slug cannot start or end with /";
  if (/[^a-z0-9\-/]/.test(value)) return "Only lowercase letters, numbers, hyphens and / allowed";
  return "";
};

/* ─── Copy-to-clipboard mini hook ──────────────────────────── */
const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} title="Copy URL" style={{
      ...btnBase, background: "none", border: `1px solid ${C.border}`,
      color: copied ? C.green : C.textMid, padding: "3px 7px", fontSize: 11,
    }}>
      {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
      {copied ? " Copied!" : " Copy"}
    </button>
  );
};

/* ─── Pagination bar ────────────────────────────────────────── */
const PaginationBar = ({ currentPage, totalPages, totalItems, shown, onPrev, onNext }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderTop: `1px solid ${C.line}`, background: "#f6f7f7", flexWrap: "wrap", gap: 8 }}>
    <span style={{ fontSize: 12, color: C.textLight }}>
      Showing <b>{shown}</b> of <b>{totalItems}</b> page{totalItems !== 1 ? "s" : ""}
    </span>
    {totalPages > 1 && (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button disabled={currentPage === 1} onClick={onPrev}
          style={{ ...btnBase, background: C.white, borderColor: C.border, color: C.text, fontSize: 12, padding: "2px 10px", opacity: currentPage === 1 ? .45 : 1 }}>
          ← Prev
        </button>
        <span style={{ fontSize: 12, color: C.textMid }}>Page {currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={onNext}
          style={{ ...btnBase, background: C.white, borderColor: C.border, color: C.text, fontSize: 12, padding: "2px 10px", opacity: currentPage === totalPages ? .45 : 1 }}>
          Next →
        </button>
      </div>
    )}
  </div>
);

/* ─── Empty form ────────────────────────────────────────────── */
const emptyForm = () => ({
  titleEn: "", titleHi: "", slug: "",
  shortDescriptionEn: "", shortDescriptionHi: "",
  descriptionEn: "", descriptionHi: "",
  metaKeywords: "", tags: "",
  categoryId: "", isActive: true,
});

/* ─── Shared input style ────────────────────────────────────── */
const fi = {
  border: `1px solid ${C.border}`, borderRadius: 4, padding: "6px 10px",
  fontSize: 14, color: C.text, outline: "none", fontFamily: FF,
  width: "100%", boxSizing: "border-box", background: C.white,
  lineHeight: 1.6, transition: "border-color .15s",
};
const lbl = {
  fontSize: 12, fontWeight: 600, color: C.textMid,
  textTransform: "uppercase", letterSpacing: ".06em",
  marginBottom: 6, display: "block",
};
const focusBlue = { onFocus: e => { e.target.style.borderColor = C.blue; }, onBlur: e => { e.target.style.borderColor = C.border; } };

/* ══════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                               */
/* ══════════════════════════════════════════════════════════════ */
const RichContentPageManagements = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pages, setPages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [editorContents, setEditorContents] = useState([{ id: 1, descriptionEn: "", descriptionHi: "" }]);
  const [slugError, setSlugError] = useState("");
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, active: 0, inactive: 0 });

  /* ── Auto-dismiss message ── */
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(t);
  }, [message]);

  /* ── Auto-slug from English title ── */
  useEffect(() => {
    if (slugManuallyEdited || !form.titleEn) return;
    const generated = titleToSlug(form.titleEn);
    if (generated !== form.slug) {
      setForm(prev => ({ ...prev, slug: generated }));
      setSlugError(validateSlug(generated));
    }
  }, [form.titleEn, slugManuallyEdited]);

  /* ── Fetch on filter/page/sort change ── */
  useEffect(() => { getAllPages(); }, [currentPage, filterStatus, search, sortBy, sortOrder]);

  /* ── Fetch categories once ── */
  useEffect(() => { fetchCategories(); }, []);

  /* ──────────────────────── API ────────────────────────────── */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`, { headers: authH() });
      setCategories(res.data.data || []);
    } catch { console.error("Failed to load categories"); }
  };

  const getAllPages = async () => {
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
      const ti = res.data.pagination?.totalItems ?? data.length;
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotalItems(ti);
      setCounts({
        all: ti,
        published: data.filter(p => p.isPublished).length,
        draft: data.filter(p => !p.isPublished).length,
        active: data.filter(p => p.isActive).length,
        inactive: data.filter(p => !p.isActive).length,
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const err = validateSlug(form.slug);
    if (err) { setSlugError(err); setMessage({ type: "danger", text: "Fix slug errors before saving." }); return; }
    try {
      setSaving(true);
      const ed = editorContents[0] || {};
      const payload = {
        ...form,
        descriptionEn: ed.descriptionEn || "",
        descriptionHi: ed.descriptionHi || "",
        metaKeywords: form.metaKeywords.split(",").map(x => x.trim()).filter(Boolean),
        tags: form.tags.split(",").map(x => x.trim()).filter(Boolean),
        categoryId: form.categoryId || null,
      };
      if (editingId) {
        await axios.post(`${API}/api/rich-content-page/update/${editingId}`, payload, { headers: authH() });
      } else {
        await axios.post(`${API}/api/rich-content-page/create`, payload, { headers: authH() });
      }
      setMessage({ type: "success", text: editingId ? "✓ Page updated successfully" : "✓ Page created successfully" });
      getAllPages(); resetForm(); setView("list");
    } catch (err) {
      setMessage({ type: "danger", text: err?.response?.data?.message || "Something went wrong" });
    } finally { setSaving(false); }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`${API}/api/rich-content-page/publish/${id}`, {}, { headers: authH() });
      setMessage({ type: "success", text: "✓ Page published" });
      getAllPages();
    } catch (err) { console.error(err); }
  };

  const handleDraft = async (id) => {
    try {
      await axios.post(`${API}/api/rich-content-page/draft/${id}`, {}, { headers: authH() });
      setMessage({ type: "success", text: "✓ Moved to draft" });
      getAllPages();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/rich-content-page/${id}`, { headers: authH() });
      setMessage({ type: "success", text: "✓ Page deleted" });
      getAllPages();
    } catch (err) { console.error(err); }
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
      isActive: row.isActive,
    });
    setEditorContents([{ id: 1, descriptionEn: row.descriptionEn || "", descriptionHi: row.descriptionHi || "" }]);
    setSlugManuallyEdited(true);
    setSlugError("");
    setFullscreenEdit(false);
    setView("form");
  };

  const resetForm = useCallback(() => {
    setEditingId(null); setForm(emptyForm());
    setEditorContents([{ id: 1, descriptionEn: "", descriptionHi: "" }]);
    setFullscreenEdit(false); setSlugManuallyEdited(false); setSlugError("");
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* ── Slug typing: sanitise live ── */
  const handleSlugChange = (e) => {
    setSlugManuallyEdited(true);
    const clean = sanitiseSlug(e.target.value);
    setForm(prev => ({ ...prev, slug: clean }));
    setSlugError(validateSlug(clean));
  };

  /* ── On blur: strip leading/trailing - and / ── */
  const handleSlugBlur = (e) => {
    const clean = e.target.value.replace(/^[-/]+|[-/]+$/g, "");
    setForm(prev => ({ ...prev, slug: clean }));
    setSlugError(validateSlug(clean));
  };

  /* ── Sort ── */
  const handleSort = (col) => {
    if (sortBy === col) setSortOrder(o => o === "desc" ? "asc" : "desc");
    else { setSortBy(col); setSortOrder("desc"); }
    setCurrentPage(1);
  };
  const sortIcon = (col) => sortBy !== col ? " ⇅" : (sortOrder === "desc" ? " ↓" : " ↑");

  /* ── current page's publish state (for sidebar) ── */
  const editingRow = pages.find(p => p._id === editingId);
  const isPublished = !!editingRow?.isPublished;
  const fullSlugURL = form.slug ? `${SITE_URL}/${form.slug}` : "";
  const previewfullSlugURL = form.slug? `${SITE_URL}/preview/${form.slug}`: "";

  /* ── Inline alert ── */
  const Alert = ({ msg }) => msg ? (
    <div style={{ margin: "14px 24px 0", padding: "10px 14px", borderRadius: 4, fontSize: 13, fontWeight: 500, background: msg.type === "success" ? C.greenBg : C.redBg, color: msg.type === "success" ? C.greenDark : C.red, border: `1px solid ${msg.type === "success" ? C.green : C.red}` }}>
      {msg.text}
    </div>
  ) : null;

  /* ══════════════════════════════════════════════════════════ */
  /*  LIST VIEW                                                 */
  /* ══════════════════════════════════════════════════════════ */
  if (view === "list") {
    const filters = [
      { k: "all", l: "All" },
      { k: "published", l: "Published" },
      { k: "draft", l: "Draft" },
      { k: "active", l: "Active" },
      { k: "inactive", l: "Inactive" },
    ];

    const thStyle = {
      padding: "9px 12px", fontWeight: 700, color: C.textMid, fontSize: 11,
      textTransform: "uppercase", letterSpacing: ".05em",
      background: "#f6f7f7", borderBottom: `1px solid ${C.line}`,
    };

    return (
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: FF }}>

        {/* ── Top bar ── */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 23, fontWeight: 400, color: C.text, lineHeight: 1.3 }}>Rich Content Pages</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid }}>{totalItems} page{totalItems !== 1 ? "s" : ""} total</p>
          </div>
          <BtnGreen onClick={() => { resetForm(); setView("form"); }}>+ Add New Page</BtnGreen>
        </div>

        <Alert msg={message} />

        {/* ── Filter tabs + search ── */}
        <div style={{ margin: "14px 24px 0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 13 }}>
            {filters.map((f, i) => (
              <React.Fragment key={f.k}>
                {i > 0 && <span style={{ color: C.border, margin: "0 5px" }}>|</span>}
                <button onClick={() => { setFilterStatus(f.k); setCurrentPage(1); }}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: FF, color: filterStatus === f.k ? C.blue : C.textMid, fontWeight: filterStatus === f.k ? 700 : 400, textDecoration: filterStatus === f.k ? "underline" : "none" }}>
                  {f.l} <span style={{ color: C.textLight, fontWeight: 400 }}>({counts[f.k] ?? 0})</span>
                </button>
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search pages…"
              style={{ ...fi, width: 220, padding: "5px 10px", fontSize: 13 }}
              {...focusBlue} />
          </div>
        </div>

        {/* ── Table card ── */}
        <div style={{ margin: "12px 24px 0" }}>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>

            {/* top pagination */}
            <PaginationBar
              currentPage={currentPage} totalPages={totalPages}
              totalItems={totalItems} shown={pages.length}
              onPrev={() => setCurrentPage(p => p - 1)}
              onNext={() => setCurrentPage(p => p + 1)}
            />

            {loading ? (
              <div style={{ padding: 40, textAlign: "center" }}><Spinner color="primary" /></div>
            ) : pages.length === 0 ? (
              <EmptyState onAdd={() => { resetForm(); setView("form"); }} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36, textAlign: "center" }}>#</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Title (EN)</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Category</th>
                    <th onClick={() => handleSort("createdAt")} style={{ ...thStyle, textAlign: "left", cursor: "pointer", userSelect: "none" }}>Created{sortIcon("createdAt")}</th>
                    <th onClick={() => handleSort("updatedAt")} style={{ ...thStyle, textAlign: "left", cursor: "pointer", userSelect: "none" }}>Updated{sortIcon("updatedAt")}</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Status</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((item, idx) => (
                    <tr key={item._id} style={{ borderBottom: `1px solid ${C.line}` }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>

                      <td style={{ padding: "10px 12px", color: C.textLight, fontSize: 12, textAlign: "center", width: 36 }}>
                        {(currentPage - 1) * 100 + idx + 1}
                      </td>

                      {/* Title + slug below */}
                      <td style={{ padding: "10px 12px" }}>
                        <div style={{ fontWeight: 600, color: C.text, fontSize: 14, marginBottom: 2 }}>
                          {item.titleEn || <span style={{ color: C.textLight, fontStyle: "italic" }}>Untitled</span>}
                        </div>
                        {item.titleHi && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 3 }}>{item.titleHi}</div>}
                        {/* Slug shown below title as green permalink line */}
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                          <span style={{ fontSize: 11, color: C.textLight }}>{SITE_URL}/</span>
                          <span style={{ fontSize: 11, color: C.green, fontWeight: 500 }}>{item.slug}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.textMid }}>
                        {categories.find(c => c._id === item.categoryId)?.categoryNameEn || <span style={{ color: C.border }}>—</span>}
                      </td>

                      {/* Dates */}
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.textMid }}>
                        {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: C.textMid }}>
                        {new Date(item.updatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>

                      {/* Status pills */}
                      <td style={{ padding: "10px 12px" }}>
                        <StatusPill published={item.isPublished} active={item.isActive} publishedAt={item.publishedAt} />
                      </td>

                      {/* Actions — all on one row, sm size */}
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end", flexWrap: "nowrap", alignItems: "center" }}>
                          <BtnSecondary size="sm" onClick={() => handleEdit(item)}>
                            <FaEdit size={11} /> Edit
                          </BtnSecondary>
                          <BtnSecondary size="sm" onClick={() => window.open(`${SITE_URL}/preview/${item.slug}`, "_blank")}>
                            <FaEye size={11} /> Preview
                          </BtnSecondary>
                          {/* Conditional: Publish OR Draft */}
                          {item.isPublished ? (
                            <BtnSecondary size="sm" onClick={() => handleDraft(item._id)}>
                              <FaFileAlt size={11} /> Draft
                            </BtnSecondary>
                          ) : (
                            <BtnGreen size="sm" onClick={() => handlePublish(item._id)}>
                              <FaCloudUploadAlt size={11} /> Publish
                            </BtnGreen>
                          )}
                          <BtnDanger size="sm" onClick={() => handleDelete(item._id)}>
                            <FaTrashAlt size={11} /> Delete
                          </BtnDanger>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* bottom pagination */}
            <PaginationBar
              currentPage={currentPage} totalPages={totalPages}
              totalItems={totalItems} shown={pages.length}
              onPrev={() => setCurrentPage(p => p - 1)}
              onNext={() => setCurrentPage(p => p + 1)}
            />
          </div>
        </div>
        <div style={{ height: 24 }} />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════ */
  /*  FORM VIEW                                                 */
  /* ══════════════════════════════════════════════════════════ */
  return (
    <div style={{
      background: C.bg, fontFamily: FF,
      ...(fullscreenEdit ? { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, overflowY: "auto" } : {}),
    }}>

      {/* ── Form top bar ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { resetForm(); setView("list"); }}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.blue, fontSize: 13, fontFamily: FF }}>
            ← All Pages
          </button>
          <span style={{ color: C.border }}>|</span>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: C.text }}>
            {editingId ? "Edit Page" : "Add New Page"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <BtnSecondary size="sm" onClick={() => previewfullSlugURL && window.open(previewfullSlugURL, "_blank")}>
            <FaEye size={11} /> Preview
          </BtnSecondary>
          <BtnSecondary size="sm" onClick={() => setFullscreenEdit(!fullscreenEdit)}>
            {fullscreenEdit ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
          </BtnSecondary>
          <BtnBlack onClick={() => { resetForm(); setView("list"); }}>
            ← Back to Pages
          </BtnBlack>
          <BtnGreen size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving…" : editingId ? "✓ Update Page" : "✓ Publish Page"}
          </BtnGreen>
        </div>
      </div>

      <Alert msg={message} />

      {/* ── Two-column grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: fullscreenEdit ? "1fr" : "1fr 268px", gap: 20, padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ────────── LEFT ────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title card */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
            <div style={{ padding: "11px 18px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Page Title</span>
            </div>
            <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Title (English) <span style={{ color: C.red }}>*</span></label>
                <input name="titleEn" value={form.titleEn} onChange={handleChange} style={fi} {...focusBlue} />
              </div>
              <div>
                <label style={lbl}>Title (Hindi)</label>
                <input name="titleHi" value={form.titleHi} onChange={handleChange} style={fi} {...focusBlue} />
              </div>

              {/* ── Slug field — full row ── */}
              <div style={{ gridColumn: "1/-1" }}>
                <label style={lbl}>Slug / URL Permalink</label>

                {/* Input with origin prefix */}
                <div style={{
                  display: "flex", alignItems: "stretch",
                  border: `1px solid ${slugError ? C.red : C.border}`,
                  borderRadius: 4, overflow: "hidden",
                }}>
                  <span style={{
                    background: "#f6f7f7", borderRight: `1px solid ${C.border}`,
                    padding: "6px 10px", fontSize: 12, color: C.textLight,
                    display: "flex", alignItems: "center", flexShrink: 0, whiteSpace: "nowrap",
                  }}>
                    {SITE_URL}/
                  </span>
                  <input
                    name="slug" value={form.slug}
                    onChange={handleSlugChange} onBlur={handleSlugBlur}
                    placeholder="my-page-slug"
                    style={{ ...fi, border: "none", borderRadius: 0, flex: 1, outline: "none" }}
                  />
                </div>

                {/* Error */}
                {slugError && (
                  <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>⚠ {slugError}</div>
                )}

                {/* Full URL preview + copy — shown below slug input like WP */}
                {!slugError && form.slug && (
                  <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: C.textLight }}>Permalink:</span>
                    <span style={{ fontSize: 12, color: C.green, fontWeight: 500, wordBreak: "break-all" }}>
                      {fullSlugURL}
                    </span>
                    <CopyBtn text={fullSlugURL} />
                  </div>
                )}

                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textLight }}>
                  Spaces convert to hyphens. Multiple hyphens collapse to one. Cannot start or end with /.
                </p>
              </div>
            </div>
          </div>

          {/* Short description */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
            <div style={{ padding: "11px 18px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Short Description (Excerpt)</span>
            </div>
            <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>English Excerpt</label>
                <textarea name="shortDescriptionEn" value={form.shortDescriptionEn} onChange={handleChange}
                  rows={3} style={{ ...fi, resize: "vertical", minHeight: 80 }} {...focusBlue} />
              </div>
              <div>
                <label style={lbl}>Hindi Excerpt</label>
                <textarea name="shortDescriptionHi" value={form.shortDescriptionHi} onChange={handleChange}
                  rows={3} style={{ ...fi, resize: "vertical", minHeight: 80 }} {...focusBlue} />
              </div>
            </div>
          </div>

        </div>

        {/* ────────── RIGHT SIDEBAR ────────── */}
        {!fullscreenEdit && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Publish box */}
            <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Publish</span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                {/* Status row */}
                <div style={{ marginBottom: 10, fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: C.textMid }}>Status:</span>
                  <span style={{ fontWeight: 600, color: isPublished ? C.green : C.amber }}>
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {/* Active toggle */}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13 }}>
                    <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                      style={{ width: 15, height: 15, accentColor: C.green }} />
                    <span style={{ color: C.text, fontWeight: 500 }}>Active (visible)</span>
                  </label>
                </div>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${C.line}`, margin: "10px 0" }} />

                {/* Action buttons — all same size, one per row */}
                <div style={{ display: "flex", flexDirection: "row", gap: 7 }}>
                  <BtnGreen onClick={handleSubmit} disabled={saving}>
                    {saving ? "⏳ Saving…" : editingId ? <><FaCheck style={{ marginRight: 5 }} />Update Page</> : <><FaCloudUploadAlt style={{ marginRight: 5 }} />Publish Page</>}
                  </BtnGreen>
                  {editingId && (
                    isPublished ? (
                      <BtnSecondary onClick={() => handleDraft(editingId)}>
                        <FaFileAlt style={{ marginRight: 5 }} /> Move to Draft
                      </BtnSecondary>
                    ) : (
                      <BtnGreen onClick={() => handlePublish(editingId)}>
                        <FaCloudUploadAlt style={{ marginRight: 5 }} /> Publish Now
                      </BtnGreen>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Category box */}
            <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Category</span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <label style={lbl}>Select Category</label>
                <select name="categoryId" value={form.categoryId} onChange={handleChange}
                  style={{ ...fi, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23787c82'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28 }}
                  {...focusBlue}>
                  <option value="">— No Category —</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.categoryNameEn}</option>
                  ))}
                </select>
                {form.categoryId && (
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textLight }}>
                    Hindi: {categories.find(c => c._id === form.categoryId)?.categoryNameHi || "—"}
                  </p>
                )}
              </div>
            </div>

            {/* SEO box */}
            <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
              <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>SEO & Meta</span>
              </div>
              <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 11 }}>
                <div>
                  <label style={lbl}>Meta Keywords</label>
                  <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange}
                    placeholder="keyword1, keyword2" style={{ ...fi, fontSize: 12 }} {...focusBlue} />
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: C.textLight }}>Separate with commas</p>
                </div>
                <div>
                  <label style={lbl}>Tags</label>
                  <input name="tags" value={form.tags} onChange={handleChange}
                    placeholder="tag1, tag2" style={{ ...fi, fontSize: 12 }} {...focusBlue} />
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: C.textLight }}>Separate with commas</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Rich content editor */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4 }}>
        <div style={{ padding: "11px 18px", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Page Content</span>
        </div>
        <div style={{ padding: 0 }}>
          <DynamicContentEditor
            contents={editorContents} setContents={setEditorContents}
            engField="descriptionEn" hinField="descriptionHi"
          />
        </div>
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
};

export default RichContentPageManagements;