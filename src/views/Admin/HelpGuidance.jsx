import { useEffect, useState } from "react";
import {
  Card, CardBody, Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Label, Input, Badge, Spinner,
  Container, Row, Col, Collapse
} from "reactstrap";
import {
  FaPlus, FaEdit, FaTrash,
  FaFilePdf, FaVideo, FaEye, FaSearch,
  FaTh, FaList, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";


const HelpGuidance = () => {
const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [openDesc, setOpenDesc] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "VIDEO",
    videoUrl: "",
    order: "",
    status: "active",
    accessBy: "USER"
  });

  /* ── LOAD ── */
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/get-help-guidance`,
        {
          params: {
            page,
            limit: 6,
            search,
            status: statusFilter,
            accessBy: accessFilter
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setList(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);

    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [page, search, statusFilter, accessFilter, token, API_URL]);

  /* ── HELPERS ── */
  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes("youtube.com"))
        return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
      if (parsed.hostname.includes("youtu.be"))
        return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
      return url;
    } catch { return url; }
  };

  const openPreview = (item) => {
    setPreviewUrl(item.contentType === "pdf" ? `${API_URL}${item.pdfUrl}` : getEmbedUrl(item.videoUrl));
    setPreviewTitle(item.title);
    setPreviewModal(true);
  };

  const toggleModal = () => { setModal(!modal); if (modal) resetForm(); };

  const resetForm = () => {
    setEditingId(null);
    setFile(null);
    setForm({ title: "", description: "", contentType: "VIDEO", videoUrl: "", order: "", status: "active", accessBy: "USER" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!form.title.trim()) {
    return Swal.fire("Validation", "Title required", "warning");
  }
  
  const fd = new FormData();
  Object.keys(form).forEach(k => fd.append(k, form[k]));
  if (form.contentType === "PDF" && file) fd.append("file", file);
  
  try {
    const url = editingId
      ? `${API_URL}/api/update-help-guidance/${editingId}`
      : `${API_URL}/api/create-help-guidance`;
    const method = editingId ? "put" : "post";
    
    // Fix: Move headers to config object, not as second parameter after data
    const res = await axios({
      method, 
      url, 
      data: fd,
      headers: { 
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data" // Required for file upload
      }
    });
    
    Swal.fire("Success", res?.data?.message || "Operation successful", "success");
    toggleModal();
    loadData();
  } catch (err) {
    Swal.fire("Error", err?.response?.data?.message || "Error occurred", "error");
  }
};

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      contentType: item.contentType?.toUpperCase(),
      videoUrl: item.videoUrl || "",
      order: item.order,
      status: item.status,
      accessBy: item.accessBy
    });
    setModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete"
    });
    if (!result.isConfirmed) return;
    await axios.delete(`${API_URL}/api/delete-help-guidance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const toggleDesc = (id) => setOpenDesc(prev => prev === id ? null : id);

  const accessBadgeColor = { USER: "primary", OFFICER: "warning", ADMIN: "danger" };

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container fluid="xl">

        {/* ── HEADER ── */}
        <div className="d-flex align-items-center justify-content-between bg-white rounded-4 shadow-sm p-3 mb-4">
          <div>
            <h4 className="fw-bold mb-0">📘 Help &amp; Tutorials</h4>
            <small className="text-muted">Manage guides, videos and PDF resources</small>
          </div>
          <Button color="primary" className="d-flex align-items-center gap-2 rounded-3 fw-semibold" onClick={toggleModal}>
            <FaPlus size={12} /> Add New
          </Button>
        </div>

        {/* ── FILTERS ── */}
        <div className="bg-white rounded-4 shadow-sm p-3 mb-4">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={5}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <FaSearch size={13} />
                </span>
                <Input
                  placeholder="Search..."
                  className="border-start-0 bg-light"
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </Col>
            <Col xs={6} md={3}>
              <Input type="select" className="bg-light" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Input>
            </Col>
            <Col xs={6} md={3}>
              <Input type="select" className="bg-light" onChange={(e) => { setAccessFilter(e.target.value); setPage(1); }}>
                <option value="">All Access</option>
                <option value="USER">User</option>
                <option value="OFFICER">Officer</option>
                <option value="ADMIN">Admin</option>
              </Input>
            </Col>

            {/* view toggle */}
            <Col xs={12} md={1} className="d-flex justify-content-end">
              <div className="btn-group">
                <Button size="sm" color={viewMode === "grid" ? "primary" : "light"} className="border px-3" onClick={() => setViewMode("grid")} title="Grid view">
                  <FaTh size={12} />
                </Button>
                <Button size="sm" color={viewMode === "list" ? "primary" : "light"} className="border px-3" onClick={() => setViewMode("list")} title="List view">
                  <FaList size={12} />
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
            <p className="text-muted mt-3 mb-0">Loading resources...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 shadow-sm">
            <div className="display-4 mb-3">📭</div>
            <h5 className="text-muted">No resources found</h5>
            <p className="text-muted small mb-0">Try adjusting your filters or add a new item.</p>
          </div>

        ) : viewMode === "grid" ? (
          /* ── GRID VIEW ── */
          <Row className="g-3">
            {list.map(item => (
              <Col xs={12} sm={6} lg={4} key={item._id}>
                <Card className="h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                  <div className={item.contentType === "pdf" ? "bg-danger" : "bg-primary"} style={{ height: 4 }} />
                  <CardBody className="d-flex flex-column p-3">

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge color={accessBadgeColor[item.accessBy] || "secondary"} pill className="px-2">
                        {item.accessBy}
                      </Badge>
                      <Badge color={item.status === "active" ? "success" : "secondary"} pill className="px-2">
                        {item.status}
                      </Badge>
                    </div>

                    <div className="d-flex align-items-center gap-1 mb-2">
                      {item.contentType === "pdf"
                        ? <FaFilePdf className="text-danger" size={12} />
                        : <FaVideo className="text-primary" size={12} />}
                      <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                        {item.contentType}
                      </small>
                      {item.order && (
                        <Badge color="light" pill className="ms-auto border text-muted" style={{ fontSize: "0.65rem" }}>#{item.order}</Badge>
                      )}
                    </div>

                    <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.88rem" }}>{item.title}</h6>

                    {/* accordion description */}
                    <div className="mb-3">
                      <Button
                        size="sm"
                        color="light"
                        className="d-flex align-items-center gap-1 w-100 border rounded-3 px-2 py-1 text-muted"
                        style={{ fontSize: "0.72rem" }}
                        onClick={() => toggleDesc(item._id)}
                      >
                        <span className="flex-grow-1 text-start">Description</span>
                        {openDesc === item._id ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
                      </Button>
                      <Collapse isOpen={openDesc === item._id}>
                        <div className="bg-light border rounded-3 p-2 mt-1 text-muted small" style={{ fontSize: "0.78rem" }}>
                          {item.description || "No description provided."}
                        </div>
                      </Collapse>
                    </div>

                    <div className="d-flex gap-1 mt-auto">
                      <Button size="sm" color="info" outline className="flex-fill rounded-3 fw-semibold" style={{ fontSize: "0.75rem" }} onClick={() => openPreview(item)}>
                        <FaEye size={10} className="me-1" /> Preview
                      </Button>
                      <Button size="sm" color="warning" outline className="rounded-3 px-2" title="Edit" onClick={() => handleEdit(item)}>
                        <FaEdit size={10} />
                      </Button>
                      <Button size="sm" color="danger" outline className="rounded-3 px-2" title="Delete" onClick={() => handleDelete(item._id)}>
                        <FaTrash size={10} />
                      </Button>
                    </div>

                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

        ) : (
          /* ── LIST VIEW ── */
          <div>
            {list.map(item => (
              <Card key={item._id} className="border-0 shadow-sm rounded-3 overflow-hidden mb-2">
                <div className={item.contentType === "pdf" ? "bg-danger" : "bg-primary"} style={{ height: 3 }} />
                <CardBody className="p-2 px-3">

                  <div className="d-flex align-items-center gap-3">

                    {/* icon */}
                    <div className="flex-shrink-0">
                      {item.contentType === "pdf"
                        ? <FaFilePdf className="text-danger" size={20} />
                        : <FaVideo className="text-primary" size={20} />}
                    </div>

                    {/* title + meta */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-center flex-wrap gap-2">
                        <span className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>{item.title}</span>
                        {item.order && (
                          <Badge color="light" pill className="border text-muted" style={{ fontSize: "0.65rem" }}>#{item.order}</Badge>
                        )}
                      </div>
                      <Collapse isOpen={openDesc === item._id}>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.78rem" }}>
                          {item.description || "No description provided."}
                        </p>
                      </Collapse>
                    </div>

                    {/* badges */}
                    <div className="d-none d-md-flex flex-column align-items-end gap-1 flex-shrink-0">
                      <Badge color={accessBadgeColor[item.accessBy] || "secondary"} pill className="px-2" style={{ fontSize: "0.65rem" }}>
                        {item.accessBy}
                      </Badge>
                      <Badge color={item.status === "active" ? "success" : "secondary"} pill className="px-2" style={{ fontSize: "0.65rem" }}>
                        {item.status}
                      </Badge>
                    </div>

                    {/* actions */}
                    <div className="d-flex gap-1 flex-shrink-0">
                      <Button size="sm" color="light" className="border rounded-3 px-2" title="Description" onClick={() => toggleDesc(item._id)}>
                        {openDesc === item._id ? <FaChevronUp size={10} className="text-muted" /> : <FaChevronDown size={10} className="text-muted" />}
                      </Button>
                      <Button size="sm" color="info" outline className="rounded-3 px-2" title="Preview" onClick={() => openPreview(item)}>
                        <FaEye size={11} />
                      </Button>
                      <Button size="sm" color="warning" outline className="rounded-3 px-2" title="Edit" onClick={() => handleEdit(item)}>
                        <FaEdit size={11} />
                      </Button>
                      <Button size="sm" color="danger" outline className="rounded-3 px-2" title="Delete" onClick={() => handleDelete(item._id)}>
                        <FaTrash size={11} />
                      </Button>
                    </div>

                  </div>

                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
            <Button size="sm" color="light" className="rounded-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ‹ Prev
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                color={page === i + 1 ? "primary" : "light"}
                className="rounded-3 fw-semibold"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button size="sm" color="light" className="rounded-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next ›
            </Button>
          </div>
        )}

        {/* ── ADD / EDIT MODAL ── */}
        <Modal isOpen={modal} toggle={toggleModal} centered size="md">
          <ModalHeader toggle={toggleModal} className="border-0 pb-1 fw-bold">
            {editingId ? "✏️ Edit Resource" : "➕ Add New Resource"}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody className="pt-1">
              <Row className="g-3">

                <Col xs={12}>
                  <Label className="fw-semibold small">Title <span className="text-danger">*</span></Label>
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="Enter a clear title..." />
                </Col>

                <Col xs={12}>
                  <Label className="fw-semibold small">Description</Label>
                  <Input type="textarea" rows={3} name="description" value={form.description} onChange={handleChange} placeholder="Short description..." />
                </Col>

                <Col xs={6}>
                  <Label className="fw-semibold small">Content Type</Label>
                  <Input type="select" name="contentType" value={form.contentType} onChange={handleChange}>
                    <option value="VIDEO">🎬 Video</option>
                    <option value="PDF">📄 PDF</option>
                  </Input>
                </Col>

                <Col xs={6}>
                  <Label className="fw-semibold small">Order</Label>
                  <Input type="number" name="order" value={form.order} onChange={handleChange} placeholder="e.g. 1" min={1} />
                </Col>

                {form.contentType === "VIDEO" && (
                  <Col xs={12}>
                    <Label className="fw-semibold small">Video URL</Label>
                    <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
                  </Col>
                )}

                {form.contentType === "PDF" && (
                  <Col xs={12}>
                    <Label className="fw-semibold small">Upload PDF</Label>
                    <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                  </Col>
                )}

                <Col xs={6}>
                  <Label className="fw-semibold small">Status</Label>
                  <Input type="select" name="status" value={form.status} onChange={handleChange}>
                    <option value="active">✅ Active</option>
                    <option value="inactive">⛔ Inactive</option>
                  </Input>
                </Col>

                <Col xs={6}>
                  <Label className="fw-semibold small">Access By</Label>
                  <Input type="select" name="accessBy" value={form.accessBy} onChange={handleChange}>
                    <option value="USER">👤 Public User On Site</option>
                    <option value="OFFICER">🧑‍💼 Officer</option>
                    <option value="ADMIN">🛡️ Admin</option>
                  </Input>
                </Col>

              </Row>
            </ModalBody>
            <ModalFooter className="border-0 pt-0 d-flex justify-content-between">
              <Button type="button" color="dark" className="rounded-3 px-4" onClick={toggleModal}>Cancel</Button>
              <Button type="submit" color="primary" className="rounded-3 px-4 fw-semibold">
                {editingId ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* ── PREVIEW MODAL ── */}
        <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl" centered>
          <ModalHeader toggle={() => setPreviewModal(false)} className="border-0 fw-bold">
            👁️ {previewTitle}
          </ModalHeader>
          <ModalBody className="p-0" style={{ height: "70vh" }}>
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              title={previewTitle}
              allowFullScreen
            />
          </ModalBody>
        </Modal>

      </Container>
    </div>
  );
};

export default HelpGuidance;