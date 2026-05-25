// AboutAndHelp.jsx — Content Uploader with Reactstrap Bootstrap UI
import React, { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader,
  Row, Col, FormGroup, Label, Input,
  Button, Alert, Table, Badge, Spinner,
  Nav, NavItem, NavLink,
} from "reactstrap";
import axios from "axios";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";

const API   = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const authH = { Authorization: `Bearer ${token}` };

/* ─── small reusable field wrapper ──────────────────────── */
const Field = ({ label, children, required }) => (
  <FormGroup>
    <Label className="fw-semibold text-secondary small text-uppercase mb-1">
      {label}{required && <span className="text-danger ms-1">*</span>}
    </Label>
    {children}
  </FormGroup>
);

/* ══════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════ */
const ContentUploaderForm = () => {
  const [currentView, setCurrentView] = useState("list");
  const [editingId, setEditingId]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [saveStatus, setSaveStatus]   = useState(null); // "success" | "error"
  const [viewMode, setViewMode]       = useState(false);

  const [form, setForm] = useState({
    titleEn: "", titleHi: "",
    shortDescriptionEn: "", shortDescriptionHi: "",
    descriptionEn: "", descriptionHi: "",
    categoryId: "", fromDate: "", expirydate: "",
    link: "", isActive: true,
  });

  const [pages, setPages]                   = useState([]);
  const [categories, setCategories]         = useState([]);
  const [selectedPage, setSelectedPage]     = useState("");
  const [contents, setContents]             = useState([]);
  const [savedContentList, setSavedContent] = useState([]);

  /* ── lifecycle ── */
  useEffect(() => {
    fetchPages();
    fetchCategories();
    fetchSavedContent();
  }, []);

  /* ── API helpers ── */
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API}/api/menu-list-all/get-all`, { headers: authH });
      setPages(extractPagesFromMenu(res.data.data || []));
    } catch (e) { console.error(e); }
  };

  const extractPagesFromMenu = (menus, acc = [], parentId = null) => {
    menus.forEach(item => {
      acc.push({ _id: item._id, titleEn: item.titleEng, titleHi: item.titleHi, parentId });
      if (Array.isArray(item.submenu) && item.submenu.length)
        extractPagesFromMenu(item.submenu, acc, item._id);
    });
    return acc;
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchSavedContent = async () => {
    try {
      const res = await axios.get(`${API}/api/get-about-and-help`);
      setSavedContent(res.data || []);
    } catch (e) { console.error(e); }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setForm({ titleEn:"", titleHi:"", shortDescriptionEn:"", shortDescriptionHi:"",
              descriptionEn:"", descriptionHi:"", categoryId:"", fromDate:"",
              expirydate:"", link:"", isActive: true });
    setSelectedPage(""); setContents([]); setEditingId(null);
    setViewMode(false); setSaveStatus(null);
  };

  const handleSubmit = async () => {
    setLoading(true); setSaveStatus(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== null && v !== undefined && fd.append(k, v));
      fd.append("selectedPage", selectedPage);
      fd.append("contents", JSON.stringify(
        contents.map(c => { const x = { ...c }; delete x.file; delete x.imageFile; return x; })
      ));
      const url = editingId ? `${API}/api/about-and-help/${editingId}` : `${API}/api/about-and-help`;
      await axios.post(url, fd, { headers: { "Content-Type": "multipart/form-data", ...authH } });
      setSaveStatus("success");
      fetchSavedContent();
      setTimeout(() => { setSaveStatus(null); resetForm(); setCurrentView("list"); }, 1400);
    } catch (err) {
      console.error(err); setSaveStatus("error");
    } finally { setLoading(false); }
  };

  const handleEdit = async item => {
    try {
      const res  = await axios.get(`${API}/api/get-about-and-help/${item._id}`);
      const data = res.data;
      setEditingId(item._id);
      setForm({
        titleEn: data.titleEn || "", titleHi: data.titleHi || "",
        shortDescriptionEn: data.shortDescriptionEn || "", shortDescriptionHi: data.shortDescriptionHi || "",
        descriptionEn: data.descriptionEn || "", descriptionHi: data.descriptionHi || "",
        categoryId: data.categoryId || "", fromDate: data.fromDate || "",
        expirydate: data.expirydate || "", link: data.link || "",
        isActive: data.isActive ?? true,
      });
      setSelectedPage(data.selectedPage || "");
      setContents(data.contents || []);
      setViewMode(false); setCurrentView("form");
    } catch (e) { console.error(e); }
  };

  /* ════════════════════════════════════════════════════
     LIST VIEW
  ═══════════════════════════════════════════════════ */
  const renderListView = () => (
    <>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-0 fw-bold text-white">Content Manager</h4>
          <p className="mb-0 text-white-50 small mt-1">Manage About & Help page content</p>
        </div>
        <Button color="success" className="fw-semibold px-4 d-flex align-items-center gap-2"
          onClick={() => { resetForm(); setCurrentView("form"); }}>
          <span>+</span> Create New
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-white border-bottom d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark">All Content</span>
            <Badge color="secondary" pill className="px-2">
              {savedContentList.length}
            </Badge>
          </div>
          <small className="text-muted">{savedContentList.filter(i => i.isActive).length} active</small>
        </CardHeader>
        <CardBody className="p-0">
          <Table hover responsive className="mb-0 align-middle">
            <thead>
              <tr className="table-light border-bottom">
                <th className="ps-4 py-3 fw-semibold text-secondary small text-uppercase">#</th>
                <th className="py-3 fw-semibold text-secondary small text-uppercase">Title</th>
                <th className="py-3 fw-semibold text-secondary small text-uppercase">Page</th>
                <th className="py-3 fw-semibold text-secondary small text-uppercase">Category</th>
                <th className="py-3 fw-semibold text-secondary small text-uppercase">Status</th>
                <th className="py-3 fw-semibold text-secondary small text-uppercase pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {savedContentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">
                    <div className="fs-1 mb-2 opacity-25">📄</div>
                    <p className="mb-0">No content found. Create your first entry.</p>
                  </td>
                </tr>
              ) : savedContentList.map((item, idx) => {
                const page = pages.find(p => p._id === item.selectedPage);
                // const cat  = categories.find(c => c._id === item.categoryId);
                let cat
                return (
                  <tr key={item._id}>
                    <td className="ps-4 text-muted small">{idx + 1}</td>
                    <td>
                      <div className="fw-semibold text-dark">{item.titleEn || "—"}</div>
                      {item.titleHi && <div className="small text-muted">{item.titleHi}</div>}
                    </td>
                    <td className="small text-muted">{page?.titleEn || "—"}</td>
                    <td className="small text-muted">{cat?.name || cat?.title || "—"}</td>
                    <td>
                      <Badge
                        color={item.isActive ? "success" : "secondary"}
                        pill className="px-3 py-1 fw-semibold"
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="pe-4">
                      <Button size="sm" color="primary" outline
                        className="fw-semibold px-3"
                        onClick={() => handleEdit(item)}>
                        ✏️ Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </>
  );

  /* ════════════════════════════════════════════════════
     FORM VIEW
  ═══════════════════════════════════════════════════ */
  const renderFormView = () => (
    <>
      {/* Page header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="mb-0 fw-bold text-white">
            {editingId ? "✏️ Update Content" : "➕ Create Content"}
          </h4>
          <p className="mb-0 text-white-50 small mt-1">
            {editingId ? "Edit and update existing content" : "Fill in the details to publish new content"}
          </p>
        </div>

        <div className="d-flex gap-2">
          <Button
            size="sm" outline
            color={viewMode ? "warning" : "info"}
            className="fw-semibold px-3"
            onClick={() => setViewMode(!viewMode)}
          >
            {viewMode ? "✏️ Edit Mode" : "👁 Preview"}
          </Button>
          <Button
            size="sm" color="light"
            className="fw-semibold px-3 text-dark"
            onClick={() => { resetForm(); setCurrentView("list"); }}
          >
            ← Back
          </Button>
        </div>
      </div>

      {/* Alert */}
      {saveStatus && (
        <Alert color={saveStatus === "success" ? "success" : "danger"} className="mb-4">
          {saveStatus === "success" ? "✅ Content saved successfully!" : "❌ Error saving content. Please try again."}
        </Alert>
      )}

      {/* ── Section 1: Basic Info ── */}
      <Card className="border-0 shadow-sm mb-4">
        <CardHeader className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-circle p-2" style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>1</span>
            <span className="fw-bold text-dark">Basic Information</span>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <Row>
            <Col md={6}>
              <Field label="Title (English)" required>
                <Input name="titleEn" value={form.titleEn} onChange={handleChange}
                  disabled={viewMode} placeholder="Enter English title" bsSize="sm" />
              </Field>
            </Col>
            <Col md={6}>
              <Field label="Title (Hindi)">
                <Input name="titleHi" value={form.titleHi} onChange={handleChange}
                  disabled={viewMode} placeholder="हिंदी शीर्षक" bsSize="sm" />
              </Field>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Field label="Category">
                <Input type="select" name="categoryId" value={form.categoryId}
                  onChange={handleChange} disabled={viewMode} bsSize="sm">
                  <option value="">— Select Category —</option>
                  {/* {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name || c.title}</option>
                  ))} */}
                </Input>
              </Field>
            </Col>
            <Col md={6}>
              <Field label="Page">
                <Input type="select" value={selectedPage}
                  onChange={e => setSelectedPage(e.target.value)}
                  disabled={viewMode} bsSize="sm">
                  <option value="">— Select Page —</option>
                  {pages.map(p => (
                    <option key={p._id} value={p._id}>{p.titleHi} / {p.titleEn}</option>
                  ))}
                </Input>
              </Field>
            </Col>
          </Row>

          <Row>
            
            <Col md={4}>
              <Field label="External Link">
                <Input name="link" value={form.link} onChange={handleChange}
                  disabled={viewMode} placeholder="https://..." bsSize="sm" />
              </Field>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <FormGroup check>
                <Input type="checkbox" name="isActive"
                  checked={form.isActive} onChange={handleChange} disabled={viewMode} />
                <Label check className="fw-semibold ms-2 text-secondary small">
                  Mark as Active
                </Label>
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* ── Section 2: Rich Text Content ── */}
      <Card className="border-0 shadow-sm mb-4">
        <CardHeader className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success rounded-circle p-2" style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>2</span>
            <span className="fw-bold text-dark">Main Content</span>
            {viewMode && (
              <Badge color="warning" pill className="ms-2 px-2 small">Preview Mode</Badge>
            )}
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <DynamicContentEditor
            contents={contents}
            setContents={setContents}
            viewMode={viewMode}
          />
        </CardBody>
      </Card>

      {/* ── Section 3: Descriptions ── */}
      <Card className="border-0 shadow-sm mb-4">
        <CardHeader className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-info rounded-circle p-2" style={{ width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>3</span>
            <span className="fw-bold text-dark">Short Descriptions</span>
          </div>
        </CardHeader>
        <CardBody className="p-4">
          <Row>
            <Col md={6}>
              <Field label="Short Description (English)">
                <Input type="textarea" name="shortDescriptionEn" rows={4}
                  value={form.shortDescriptionEn} onChange={handleChange}
                  disabled={viewMode} placeholder="Brief summary in English…"
                  style={{ resize:"vertical" }} />
              </Field>
            </Col>
            <Col md={6}>
              <Field label="Short Description (Hindi)">
                <Input type="textarea" name="shortDescriptionHi" rows={4}
                  value={form.shortDescriptionHi} onChange={handleChange}
                  disabled={viewMode} placeholder="संक्षिप्त विवरण…"
                  style={{ resize:"vertical" }} />
              </Field>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* ── Submit bar ── */}
      {!viewMode && (
        <Card className="border-0 shadow-sm">
          <CardBody className="py-3 px-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="text-muted small">
                {editingId
                  ? "Changes will overwrite the existing record."
                  : "Content will be published after saving."}
              </div>
              <div className="d-flex gap-2">
                <Button color="light" className="fw-semibold text-dark px-4"
                  onClick={() => { resetForm(); setCurrentView("list"); }}>
                  Cancel
                </Button>
                <Button color="success" className="fw-semibold px-5"
                  onClick={handleSubmit} disabled={loading}>
                  {loading
                    ? <><Spinner size="sm" className="me-2" />Saving…</>
                    : editingId ? "💾 Update Content" : "🚀 Save Content"
                  }
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );

  /* ─── Shell ──────────────────────────────────────────── */
  return (
    <div className="px-3 pb-5" style={{ marginTop: -20 }}>
      {currentView === "list" ? renderListView() : renderFormView()}
    </div>
  );
};

export default ContentUploaderForm;