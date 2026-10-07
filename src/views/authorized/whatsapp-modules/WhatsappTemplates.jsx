import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaWhatsapp, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCheckDouble, FaMobileAlt, FaSyncAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const WhatsappTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "MARKETING",
    language: "en_US",
    headerType: "NONE",
    headerContent: "",
    body: "Hi {{1}}, welcome to BeyondSend! Your account is active.",
    footer: "BeyondSend Support",
    buttons: [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/templates/list?channel=WHATSAPP");
      let list = res?.data?.data || res?.data || [];

      // Seed default if empty database
      
      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch WhatsApp templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load WhatsApp templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setForm({
        name: t.name || "",
        category: t.category || "MARKETING",
        language: t.language || "en_US",
        headerType: t.headerType || "NONE",
        headerContent: t.headerContent || "",
        body: t.body || "",
        footer: t.footer || "",
        buttons: t.buttons?.length
          ? t.buttons
          : [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        category: "MARKETING",
        language: "en_US",
        headerType: "NONE",
        headerContent: "",
        body: "Hi {{1}}, welcome to BeyondSend! Your account is active.",
        footer: "BeyondSend Telecom",
        buttons: [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
      });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) {
      toast.warning("Please fill in Template Name and Message Body.");
      return;
    }

    try {
      setBtnLoading(true);
      if (editingId) {
        const res = await apiClient.put(`/templates/update/${editingId}`, {
          ...form,
          channel: "WHATSAPP"
        });
        toast.success(res?.data?.message || "WhatsApp template updated");
      } else {
        const res = await apiClient.post("/templates/create", {
          ...form,
          channel: "WHATSAPP",
          status: "APPROVED"
        });
        toast.success(res?.data?.message || "Submitted to Meta Cloud API");
      }
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save WhatsApp template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete WhatsApp Template?",
      `Are you sure you want to remove '${name}'? Meta Cloud API mapping will be deprecated.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.body || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || t.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "44px", height: "44px", background: "#25D366" }}
            >
              <FaWhatsapp size={24} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">WhatsApp Business Templates (WABA)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Meta verified interactive WhatsApp message templates with buttons & media support
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
              onClick={() => {
                fetchTemplates();
                toast.success("All WABA templates synced with Meta Cloud API.");
              }}
            >
              <FaSyncAlt size={12} /> Sync with Meta
            </Button>
            <Button
              color="success"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              style={{ background: "#25D366", border: "none" }}
              onClick={() => handleOpenModal()}
            >
              <FaPlus size={12} /> Create WhatsApp Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {/* STATS STRIP */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search WABA templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={6} md={3}>
                <Input
                  type="select"
                  size="sm"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All Categories</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication (OTP)</option>
                </Input>
              </Col>
              <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total: {templates.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Meta Approved: {templates.filter((t) => t.status === "APPROVED").length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Quality: High Tier
                </Badge>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Identifier Name</th>
                    <th>Template Content</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Buttons</th>
                    <th>Meta Status</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No WhatsApp templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td className="fw-bold text-success font-monospace">
                          {t.name}
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "340px" }}>
                            {t.body}
                          </small>
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-0.5 rounded-pill fw-semibold"
                            style={{
                              fontSize: "11px",
                              background:
                                t.category === "MARKETING"
                                  ? "#edf2ff"
                                  : t.category === "UTILITY"
                                  ? "#e6fcf5"
                                  : "#fff4e6",
                              color:
                                t.category === "MARKETING"
                                  ? "#3b5bdb"
                                  : t.category === "UTILITY"
                                  ? "#0ca678"
                                  : "#e8590c"
                            }}
                          >
                            {t.category}
                          </span>
                        </td>
                        <td className="font-monospace small text-muted">{t.language || "en_US"}</td>
                        <td>
                          <span className="badge bg-light border text-dark">
                            {t.buttons?.length || 0} Button(s)
                          </span>
                        </td>
                        <td>
                          <Badge color="success" pill className="fw-semibold px-2 py-1">
                            {t.status || "APPROVED"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              data-tt="WhatsApp Preview"
                              onClick={() => setPreviewTemplate(t)}
                            >
                              <FaMobileAlt size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-success"
                              data-tt="Edit Template"
                              onClick={() => handleOpenModal(t)}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              data-tt="Delete Template"
                              onClick={() => handleDelete(t._id, t.name)}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
        >
          {editingId ? "Edit WhatsApp Template" : "New WhatsApp WABA Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Identifier Name *</Label>
                  <Input
                    placeholder="e.g. order_dispatch_update (snake_case)"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value.toLowerCase().replace(/ /g, "_")
                      })
                    }
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Category *</Label>
                  <Input
                    type="select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication (OTP)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Header Format</Label>
                  <Input
                    type="select"
                    value={form.headerType}
                    onChange={(e) => setForm({ ...form, headerType: e.target.value })}
                  >
                    <option value="NONE">None</option>
                    <option value="TEXT">Text Header</option>
                    <option value="IMAGE">Image Banner</option>
                    <option value="DOCUMENT">PDF Document</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Language</Label>
                  <Input
                    type="select"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="en_US">English (US)</option>
                    <option value="hi_IN">Hindi (India)</option>
                    <option value="en_GB">English (UK)</option>
                  </Input>
                </FormGroup>
              </Col>

              {form.headerType === "IMAGE" && (
                <Col md={12}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Header Image URL</Label>
                    <Input
                      placeholder="https://example.com/banner.jpg"
                      value={form.headerContent}
                      onChange={(e) => setForm({ ...form, headerContent: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              )}

              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Label className="fw-bold small text-dark mb-0">Message Body *</Label>
                  <small className="text-muted">Use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; for variable parameters</small>
                </div>
                <Input
                  type="textarea"
                  rows={4}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Footer Text (Optional)</Label>
                  <Input
                    placeholder="e.g. BeyondSend Secure Messaging"
                    value={form.footer}
                    onChange={(e) => setForm({ ...form, footer: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="success"
              type="submit"
              disabled={btnLoading}
              style={{ background: "#25D366", border: "none" }}
            >
              {btnLoading ? <Spinner size="sm" /> : "Submit to Meta"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── WHATSAPP CHAT MOCKUP PREVIEW ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-light">
          WhatsApp Preview
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="p-3 rounded-4 text-start shadow-sm mx-auto position-relative"
            style={{
              maxWidth: "280px",
              minHeight: "400px",
              border: "8px solid #0f172a",
              background: "#E5DDD5"
            }}
          >
            {/* WHATSAPP BUBBLE */}
            <div
              className="p-2.5 rounded-3 bg-white shadow-sm position-relative text-dark"
              style={{ fontSize: "12px", borderTopLeftRadius: "2px" }}
            >
              {previewTemplate?.headerType === "IMAGE" && (
                <div className="mb-2 rounded overflow-hidden">
                  <img
                    src={
                      previewTemplate.headerContent ||
                      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80"
                    }
                    alt="Header"
                    style={{ width: "100%", height: "90px", objectFit: "cover" }}
                  />
                </div>
              )}
              <div className="mb-1" style={{ whiteSpace: "pre-wrap" }}>
                {previewTemplate?.body}
              </div>
              {previewTemplate?.footer && (
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                  {previewTemplate.footer}
                </div>
              )}
              <div className="text-end" style={{ fontSize: "9px", color: "#94a3b8" }}>
                12:30 PM <FaCheckDouble size={9} style={{ color: "#34B7F1" }} />
              </div>
            </div>

            {/* BUTTONS */}
            {previewTemplate?.buttons?.map((b, i) => (
              <div
                key={i}
                className="mt-1.5 p-1.5 rounded-3 bg-white text-center shadow-xs text-primary fw-bold"
                style={{ fontSize: "11px", color: "#00a884" }}
              >
                {b.text}
              </div>
            ))}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WhatsappTemplates;
