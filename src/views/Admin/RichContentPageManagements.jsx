// RichContentPageManagements.jsx — WordPress-style CMS with DynamicContentEditor
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Card, CardBody, CardHeader,
  Row, Col, Input, Button, Badge,
  Table, Alert, Spinner, FormGroup, Label,
} from "reactstrap";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const authH = { Authorization: `Bearer ${token}` };

/* ─── Design tokens (minimal, CMS-grade) ──────────────────── */
const C = {
  bg: "#f0f0f1",        // WP admin bg
  sidebar: "#1d2327",        // WP sidebar dark
  header: "#1d2327",
  card: "#ffffff",
  border: "#c3c4c7",
  text: "#1d2327",
  textMid: "#50575e",
  textLight: "#787c82",
  green: "#00a32a",        // WP green
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

/* ─── Shared button base ──────────────────────────────────── */
const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid transparent",
  borderRadius: 3,
  fontSize: 13,
  fontWeight: 400,
  lineHeight: "2.15384615",
  padding: "0 10px",
  cursor: "pointer",
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
  textDecoration: "none",
  whiteSpace: "nowrap",
  transition: "background .12s,border-color .12s",
};

const BtnGreen = ({ children, onClick, disabled, size }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...btnBase,
      background: C.green,
      borderColor: C.greenDark,
      color: "#fff",
      fontSize: size === "sm" ? 12 : 13,
      padding: size === "sm" ? "2px 8px" : "0 12px",
      opacity: disabled ? .6 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = C.greenDark; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = C.green; }}
  >
    {children}
  </button>
);

const BtnBlack = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...btnBase,
      background: C.black,
      borderColor: C.blackHov,
      color: "#fff",
      opacity: disabled ? .6 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = C.blackHov; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = C.black; }}
  >
    {children}
  </button>
);

const BtnSecondary = ({ children, onClick, size }) => (
  <button
    onClick={onClick}
    style={{
      ...btnBase,
      background: C.white,
      borderColor: C.border,
      color: C.text,
      fontSize: size === "sm" ? 12 : 13,
      padding: size === "sm" ? "2px 8px" : "0 10px",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.text; }}
  >
    {children}
  </button>
);

const BtnDanger = ({ children, onClick, size }) => (
  <button
    onClick={onClick}
    style={{
      ...btnBase,
      background: C.white,
      borderColor: C.red,
      color: C.red,
      fontSize: size === "sm" ? 12 : 13,
      padding: size === "sm" ? "2px 8px" : "0 10px",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = C.redBg; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = C.white; }}
  >
    {children}
  </button>
);

/* ─── Status pill ─────────────────────────────────────────── */
const StatusPill = ({ published, active }) => {
  const pStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 11,
    fontSize: 11,
    fontWeight: 600,
    marginRight: 4,
  };
  return (
    <span style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
      <span style={{ ...pStyle, background: published ? C.greenBg : C.orangeBg, color: published ? C.green : C.amber, border: `1px solid ${published ? C.green : C.orange}` }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: published ? C.green : C.orange, display: "inline-block" }} />
        {published ? "Published" : "Draft"}
      </span>
      <span style={{ ...pStyle, background: active ? C.greenBg : "#f6f7f7", color: active ? C.greenDark : C.textLight, border: `1px solid ${active ? C.green : C.border}` }}>
        {active ? "Active" : "Inactive"}
      </span>
    </span>
  );
};

/* ─── Empty state ─────────────────────────────────────────── */
const EmptyState = ({ onAdd }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: C.textMid }}>
    <div style={{ fontSize: 48, marginBottom: 12, opacity: .3 }}>📄</div>
    <p style={{ fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 6px" }}>No pages yet</p>
    <p style={{ fontSize: 13, margin: "0 0 18px" }}>Create your first rich content page.</p>
    <BtnGreen onClick={onAdd}>+ Add New Page</BtnGreen>
  </div>
);

/* ─── EMPTY FORM STATE ────────────────────────────────────── */
const emptyForm = () => ({
  titleEn: "",
  titleHi: "",
  slug: "",
  shortDescriptionEn: "",
  shortDescriptionHi: "",
  descriptionEn: "",
  descriptionHi: "",
  metaKeywords: "",
  tags: "",
  isActive: true,
});

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
const RichContentPageManagements = () => {
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [view, setView] = useState("list");   // "list" | "form"
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Preview mode for the rich editor
  const [previewMode, setPreviewMode] = useState(false);

  // DynamicContentEditor state — holds descriptionEn and descriptionHi inside item[0]
  const [editorContents, setEditorContents] = useState([
    { id: 1, descriptionEn: "", descriptionHi: "" },
  ]);

  useEffect(() => { getAllPages(); }, []);

  // Auto-dismiss message
  useEffect(() => {
    if (message) { const t = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(t); }
  }, [message]);

  const getAllPages = async () => {
    try {
      const res = await axios.get(`${API}/api/rich-content-pages/get-all`, { headers: authH });
      setPages(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(emptyForm());
    setEditorContents([{ id: 1, descriptionEn: "", descriptionHi: "" }]);
    setPreviewMode(false);
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Merge editor HTML content into form payload
      const editorItem = editorContents[0] || {};
      const payload = {
        ...form,
        descriptionEn: editorItem.descriptionEn || "",
        descriptionHi: editorItem.descriptionHi || "",
        metaKeywords: form.metaKeywords.split(",").map(x => x.trim()).filter(Boolean),
        tags: form.tags.split(",").map(x => x.trim()).filter(Boolean),
      };
      if (editingId) {
        await axios.post(`${API}/api/rich-content-page/update/${editingId}`, payload, { headers: authH });
      } else {
        await axios.post(`${API}/api/rich-content-page/create`, payload, { headers: authH });
      }
      setMessage({ type: "success", text: editingId ? "✓ Page updated successfully" : "✓ Page created successfully" });
      getAllPages();
      resetForm();
      setView("list");
    } catch (err) {
      setMessage({ type: "danger", text: err?.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditingId(row._id);
    const f = {
      titleEn: row.titleEn || "",
      titleHi: row.titleHi || "",
      slug: row.slug || "",
      shortDescriptionEn: row.shortDescriptionEn || "",
      shortDescriptionHi: row.shortDescriptionHi || "",
      descriptionEn: row.descriptionEn || "",
      descriptionHi: row.descriptionHi || "",
      metaKeywords: (row.metaKeywords || []).join(", "),
      tags: (row.tags || []).join(", "),
      isActive: row.isActive,
    };
    setForm(f);
    setEditorContents([{
      id: 1,
      descriptionEn: row.descriptionEn || "",
      descriptionHi: row.descriptionHi || "",
    }]);
    setPreviewMode(false);
    setView("form");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this page? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/rich-content-page/${id}`, { headers: authH });
      getAllPages();
    } catch (err) { console.error(err); }
  };

  const handlePublish = async (id) => {
    try {
      await axios.post(`${API}/api/rich-content-page/publish/${id}`, {}, { headers: authH });
      getAllPages();
    } catch (err) { console.error(err); }
  };

  const handleDraft = async (id) => {
    try {
      await axios.post(`${API}/api/rich-content-page/draft/${id}`, {}, { headers: authH });
      getAllPages();
    } catch (err) { console.error(err); }
  };

  /* ── Filtered pages ── */
  const filteredPages = pages.filter(p => {
    const matchSearch = !search ||
      p.titleEn?.toLowerCase().includes(search.toLowerCase()) ||
      p.slug?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && p.isPublished) ||
      (filterStatus === "draft" && !p.isPublished) ||
      (filterStatus === "active" && p.isActive) ||
      (filterStatus === "inactive" && !p.isActive);
    return matchSearch && matchStatus;
  });

  /* ── Section label styles ── */
  const sectionLabel = {
    fontSize: 12,
    fontWeight: 600,
    color: C.textMid,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    marginBottom: 6,
    display: "block",
  };

  const fieldInput = {
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: "6px 10px",
    fontSize: 14,
    color: C.text,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
    background: C.white,
    lineHeight: 1.6,
    transition: "border-color .15s",
  };

  /* ════════════════════════════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════════════════════════ */
  if (view === "list") {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,sans-serif" }}>

        {/* Page header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 23, fontWeight: 400, color: C.text, lineHeight: 1.3 }}>Rich Content Pages</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMid }}>
              {pages.length} page{pages.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <BtnGreen onClick={() => { resetForm(); setView("form"); }}>
              + Add New Page
            </BtnGreen>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{ margin: "16px 24px 0", padding: "10px 14px", borderRadius: 4, fontSize: 13, fontWeight: 500, background: message.type === "success" ? C.greenBg : C.redBg, color: message.type === "success" ? C.greenDark : C.red, border: `1px solid ${message.type === "success" ? C.green : C.red}`, display: "flex", alignItems: "center", gap: 8 }}>
            {message.text}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ margin: "16px 24px 0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Status filter links */}
          <div style={{ display: "flex", gap: 0, fontSize: 13, color: C.textMid }}>
            {[{ k: "all", l: "All" }, { k: "published", l: "Published" }, { k: "draft", l: "Draft" }, { k: "active", l: "Active" }, { k: "inactive", l: "Inactive" }].map((f, i) => (
              <React.Fragment key={f.k}>
                {i > 0 && <span style={{ color: C.border, margin: "0 6px" }}>|</span>}
                <button onClick={() => setFilterStatus(f.k)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: filterStatus === f.k ? C.blue : C.textMid, fontWeight: filterStatus === f.k ? 700 : 400, textDecoration: filterStatus === f.k ? "underline" : "none" }}>
                  {f.l}
                  <span style={{ marginLeft: 3, color: C.textLight, fontSize: 11 }}>
                    ({f.k === "all" ? pages.length : f.k === "published" ? pages.filter(p => p.isPublished).length : f.k === "draft" ? pages.filter(p => !p.isPublished).length : f.k === "active" ? pages.filter(p => p.isActive).length : pages.filter(p => !p.isActive).length})
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages…"
              style={{ ...fieldInput, width: 220, padding: "5px 10px", fontSize: 13 }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>
        </div>

        {/* Table card */}
        <div style={{ margin: "12px 24px 24px" }}>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            {filteredPages.length === 0 ? (
              <EmptyState onAdd={() => { resetForm(); setView("form"); }} />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                    {["#", "Title (EN)", "Slug", "Status", "Actions"].map((h, i) => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: i === 4 ? "right" : "left", fontWeight: 700, color: C.textMid, fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", background: "#f6f7f7", borderBottom: `1px solid ${C.line}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((item, index) => (
                    <tr key={item._id} style={{ borderBottom: `1px solid ${C.line}`, transition: "background .1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f9f9f9"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td style={{ padding: "10px 14px", color: C.textLight, fontSize: 12, width: 36 }}>{index + 1}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <div style={{ fontWeight: 600, color: C.text, fontSize: 14, marginBottom: 2 }}>{item.titleEn || <span style={{ color: C.textLight, fontStyle: "italic", fontWeight: 400 }}>Untitled</span>}</div>
                        {item.titleHi && <div style={{ fontSize: 12, color: C.textMid }}>{item.titleHi}</div>}
                        {/* Row actions on hover - WP style */}
                        <div className="row-actions" style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 12 }}>
                          <button onClick={() => handleEdit(item)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.blue, fontSize: 12, fontFamily: "inherit" }}>Edit</button>
                          <span style={{ color: C.border }}>|</span>
                          <button onClick={() => handlePublish(item._id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.green, fontSize: 12, fontFamily: "inherit" }}>Publish</button>
                          <span style={{ color: C.border }}>|</span>
                          <button onClick={() => handleDraft(item._id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.amber, fontSize: 12, fontFamily: "inherit" }}>Draft</button>
                          <span style={{ color: C.border }}>|</span>
                          <button onClick={() => handleDelete(item._id)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.red, fontSize: 12, fontFamily: "inherit" }}>Delete</button>
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <code style={{ fontSize: 12, background: C.bg, color: C.textMid, padding: "2px 6px", borderRadius: 3 }}>{item.slug || "—"}</code>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <StatusPill published={item.isPublished} active={item.isActive} />
                      </td>
                      <td style={{ padding: "10px 14px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", flexWrap: "wrap" }}>
                          <BtnSecondary size="sm" onClick={() => handleEdit(item)}>✏️ Edit</BtnSecondary>
                          <BtnGreen size="sm" onClick={() => handlePublish(item._id)}>↑ Publish</BtnGreen>
                          <BtnSecondary size="sm" onClick={() => handleDraft(item._id)}>↓ Draft</BtnSecondary>
                          <BtnDanger size="sm" onClick={() => handleDelete(item._id)}>🗑 Delete</BtnDanger>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: C.textLight }}>
            Showing {filteredPages.length} of {pages.length} page{pages.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     FORM VIEW
  ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,sans-serif" }}>

      {/* Page header */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.line}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetForm(); setView("list"); }} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: C.blue, fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            ← All Pages
          </button>
          <span style={{ color: C.border }}>|</span>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 400, color: C.text }}>
            {editingId ? "Edit Page" : "Add New Page"}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <BtnSecondary onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? "✏️ Edit Mode" : "👁️ Preview"}
          </BtnSecondary>
          <BtnBlack onClick={() => { resetForm(); setView("list"); }}>← Back</BtnBlack>
          <BtnGreen onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : editingId ? "✓ Update Page" : "✓ Publish Page"}
          </BtnGreen>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{ margin: "16px 24px 0", padding: "10px 14px", borderRadius: 4, fontSize: 13, fontWeight: 500, background: message.type === "success" ? C.greenBg : C.redBg, color: message.type === "success" ? C.greenDark : C.red, border: `1px solid ${message.type === "success" ? C.green : C.red}` }}>
          {message.text}
        </div>
      )}

      {/* Two-column layout: main + sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, padding: "20px 24px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── MAIN COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Title card */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Page Title</span>
            </div>
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={sectionLabel}>Title (English) <span style={{ color: C.red }}>*</span></label>
                <input name="titleEn" value={form.titleEn} onChange={handleChange}
                  placeholder="Enter English title…"
                  style={fieldInput}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div>
                <label style={sectionLabel}>Title (Hindi)</label>
                <input name="titleHi" value={form.titleHi} onChange={handleChange}
                  placeholder="हिंदी शीर्षक…"
                  style={fieldInput}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={sectionLabel}>Slug / URL Permalink</label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textLight, flexShrink: 0 }}><b>{window.location.origin}</b></span>
                  <input name="slug" value={form.slug} onChange={handleChange}
                    placeholder="my-page-slug"
                    style={{ ...fieldInput }}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Short descriptions */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Short Description (Excerpt)</span>
            </div>
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={sectionLabel}>English Excerpt</label>
                <textarea name="shortDescriptionEn" value={form.shortDescriptionEn} onChange={handleChange}
                  rows={3} placeholder="Brief English description…"
                  style={{ ...fieldInput, resize: "vertical", minHeight: 80 }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
              <div>
                <label style={sectionLabel}>Hindi Excerpt</label>
                <textarea name="shortDescriptionHi" value={form.shortDescriptionHi} onChange={handleChange}
                  rows={3} placeholder="संक्षिप्त हिंदी विवरण…"
                  style={{ ...fieldInput, resize: "vertical", minHeight: 80 }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
              </div>
            </div>
          </div>

        </div>

        {/* ── SIDEBAR COLUMN ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Publish box */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Publish</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ marginBottom: 12, fontSize: 13, color: C.textMid, display: "flex", alignItems: "center", gap: 8 }}>
                <span>Status:</span>
                <span style={{ fontWeight: 600, color: C.text }}>
                  {editingId ? "Editing" : "New Draft"}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange}
                    style={{ width: 16, height: 16, accentColor: C.green, cursor: "pointer" }}
                  />
                  <span style={{ color: C.text, fontWeight: 500 }}>Active (visible)</span>
                </label>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <BtnGreen onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span>⏳</span> Saving…</> : editingId ? "✓ Update Page" : "✓ Publish Page"}
                </BtnGreen>
                <BtnBlack onClick={() => { resetForm(); setView("list"); }}>← Back to Pages</BtnBlack>
              </div>
            </div>
          </div>

          {/* SEO / Meta */}
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)" }}>
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>SEO & Meta</span>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={sectionLabel}>Meta Keywords</label>
                <input name="metaKeywords" value={form.metaKeywords} onChange={handleChange}
                  placeholder="keyword1, keyword2"
                  style={{ ...fieldInput, fontSize: 12 }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textLight }}>Separate with commas</p>
              </div>
              <div>
                <label style={sectionLabel}>Tags</label>
                <input name="tags" value={form.tags} onChange={handleChange}
                  placeholder="tag1, tag2"
                  style={{ ...fieldInput, fontSize: 12 }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textLight }}>Separate with commas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Rich Content Editor (English + Hindi) ── */}
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 4, boxShadow: "0 1px 1px rgba(0,0,0,.04)", margin: "0 24px 24px 24px" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Page Content</span>
          {previewMode && (
            <span style={{ fontSize: 12, background: C.blueLight, color: C.blue, padding: "2px 8px", borderRadius: 3 }}>Preview Mode</span>
          )}
        </div>
        <div style={{ padding: 0 }}>
          <DynamicContentEditor
            contents={editorContents}
            setContents={setEditorContents}
            engField="descriptionEn"
            hinField="descriptionHi"
            viewMode={previewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default RichContentPageManagements;