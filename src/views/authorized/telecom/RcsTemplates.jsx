import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaComments, FaPlus, FaSearch, FaEdit, FaTrash,
  FaMobileAlt, FaCheckCircle, FaServer
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const RcsTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    senderId: "BeyondSend Official",
    cardType: "STANDALONE_RICH_CARD",
    provider: "JIO_RCS",
    providerTemplateId: "",
    rcsCardTitle: "",
    description: "",
    rcsMediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    buttons: [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
  });

  const [categories, setCategories] = useState([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/rcs/templates/list");
      const data = res?.data?.data || [];
      const provs = res?.data?.availableProviders || [];
      const cats = res?.data?.availableCategories || [];

      setTemplates(Array.isArray(data) ? data : []);
      if (provs.length > 0) setProviders(provs);
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error("Fetch RCS templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load RCS templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await apiClient.get("/rcs/templates/providers");
      const list = res?.data?.data || [];
      if (list.length > 0) setProviders(list);
    } catch {
      // Fallback: will be populated by fetchTemplates
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchProviders();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template._id);
      setForm({
        name: template.name || "",
        senderId: template.senderId || "BeyondSend Official",
        cardType: template.cardType || "STANDALONE_RICH_CARD",
        provider: template.provider || "JIO_RCS",
        providerTemplateId: template.providerTemplateId || template.jioTemplateId || "",
        rcsCardTitle: template.standaloneCard?.title || template.rcsCardTitle || "",
        description: template.standaloneCard?.description || template.description || "",
        rcsMediaUrl: template.standaloneCard?.media?.mediaUrl || template.rcsMediaUrl || "",
        buttons: (template.standaloneCard?.suggestions || template.buttons)?.length
          ? (template.standaloneCard?.suggestions || template.buttons)
          : [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        senderId: "BeyondSend Official",
        cardType: "STANDALONE_RICH_CARD",
        provider: providers[0]?.code || "JIO_RCS",
        providerTemplateId: "",
        rcsCardTitle: "",
        description: "",
        rcsMediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
        buttons: [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
      });
    }
    setModal(true);
  };

  const handleAddButton = () => {
    if (form.buttons.length >= 3) {
      toast.warning("RCS allows maximum 3 action chips per card.");
      return;
    }
    setForm({
      ...form,
      buttons: [...form.buttons, { type: "QUICK_REPLY", label: "Reply Yes", value: "YES" }]
    });
  };

  const handleRemoveButton = (idx) => {
    setForm({
      ...form,
      buttons: form.buttons.filter((_, i) => i !== idx)
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.rcsCardTitle.trim() || !form.description.trim()) {
      toast.warning("Please fill in Name, Card Title, and Description.");
      return;
    }

    try {
      setBtnLoading(true);
      const payload = {
        ...form,
        channelCategoryCode: form.channelCategoryCode || (form.category ? `RCS_${form.category}` : "RCS_SERVICE"),
        status: "APPROVED",
        standaloneCard: {
          title: form.rcsCardTitle,
          description: form.description,
          media: {
            mediaUrl: form.rcsMediaUrl,
            height: "MEDIUM_HEIGHT",
          },
          suggestions: form.buttons,
        },
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/rcs/templates/update/${editingId}`, payload);
        toast.success(res?.data?.message || "RCS template updated successfully");
      } else {
        const res = await apiClient.post("/rcs/templates/create", payload);
        toast.success(res?.data?.message || "RCS template submitted to carrier network");
      }
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save RCS template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete RCS Template?",
      `Are you sure you want to delete '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/rcs/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = templates.filter(
    (t) => {
      const matchSearch =
        (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.rcsCardTitle || t.standaloneCard?.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.provider || "").toLowerCase().includes(search.toLowerCase());
      const matchProv = filterProvider === "ALL" || (t.provider || "ALL") === filterProvider;
      return matchSearch && matchProv;
    }
  );

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaComments size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">RCS Business Messaging (Rich Cards & Multi-Carrier)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Google RBM & Jio CX verified dynamic rich card templates with interactive CTA buttons
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Add RCS Template
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {/* SEARCH & FILTERS */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col lg={4} md={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search RCS templates by title, provider..."
                    className="border-start-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col lg={3} md={6}>
                <Input
                  type="select"
                  size="sm"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                >
                  <option value="ALL">All Providers ({providers.length})</option>
                  {providers.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name || p.code}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col lg={5} md={12} className="text-end d-flex justify-content-end gap-2 align-items-center">
                <span className="badge bg-white border text-dark fw-bold px-2 py-1.5">
                  Total: {templates.length}
                </span>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Carrier Verified: {templates.filter((t) => t.status === "APPROVED").length}
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="p-5 text-center">
                <PageLoader />
              </div>
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Template Name & Title</th>
                    <th>Provider</th>
                    <th>Action Buttons</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No RCS templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted">{t.standaloneCard?.title || t.rcsCardTitle || t.description}</small>
                        </td>
                        <td>
                          {t.providerTemplates && t.providerTemplates.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {t.providerTemplates.map((p, pIdx) => (
                                <Badge key={pIdx} color="primary" pill className="font-monospace px-2 py-0.5 text-uppercase" style={{ fontSize: "10px" }}>
                                  <FaServer className="me-1" size={8} />
                                  {p.providerCode} {p.status ? `(${p.status})` : ""}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge color="primary" pill className="font-monospace px-2 py-1">
                              <FaServer className="me-1" size={9} />
                              {t.provider || "JIO_RCS"}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(t.standaloneCard?.suggestions || t.buttons || []).map((b, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-pill bg-light border text-primary fw-semibold"
                                style={{ fontSize: "10.5px" }}
                              >
                                {b.label || b.text}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <Badge
                            color="success"
                            pill
                            className="fw-semibold px-2 py-1"
                          >
                            {t.status || "APPROVED"}
                          </Badge>
                        </td>
                        <td className="text-muted small">
                          {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              title="Preview on Android Device"
                              onClick={() => setPreviewTemplate(t)}
                            >
                              <FaMobileAlt size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-success"
                              title="Edit Template"
                              onClick={() => handleOpenModal(t)}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              title="Delete Template"
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
        <ModalHeader toggle={() => setModal(false)} className="text-white bg-dark">
          {editingId ? "Edit RCS Template" : "New Rich Communication Services (RCS) Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. BeyondSend Order Shipped"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">RCS Carrier Provider</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  >
                    <option value="ALL">ALL (Dynamic Multi-Carrier)</option>
                    {providers.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name || p.code} ({p.code})
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Title (Headline) *</Label>
                  <Input
                    placeholder="e.g. Your Package is Out for Delivery!"
                    value={form.rcsCardTitle}
                    onChange={(e) => setForm({ ...form, rcsCardTitle: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Provider Template ID</Label>
                  <Input
                    placeholder="Carrier reference ID (e.g. JIO-CX-...)"
                    value={form.providerTemplateId}
                    onChange={(e) => setForm({ ...form, providerTemplateId: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Media URL (Image Banner)</Label>
                  <Input
                    placeholder="https://... (Direct HTTPS image link)"
                    value={form.rcsMediaUrl}
                    onChange={(e) => setForm({ ...form, rcsMediaUrl: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Description / Message Body *</Label>
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Detailed explanation of notification, order summary or marketing discount..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label className="fw-bold small text-dark mb-0">RCS Quick Action Chips (Max 3)</Label>
                  <Button
                    size="sm"
                    color="primary"
                    outline
                    onClick={handleAddButton}
                    disabled={form.buttons.length >= 3}
                    className="py-0 px-2 fw-semibold"
                  >
                    + Add Action Chip
                  </Button>
                </div>
                {form.buttons.map((btn, idx) => (
                  <Row key={idx} className="g-2 mb-2 align-items-center">
                    <Col md={3}>
                      <Input
                        type="select"
                        size="sm"
                        value={btn.type}
                        onChange={(e) => {
                          const updated = [...form.buttons];
                          updated[idx].type = e.target.value;
                          setForm({ ...form, buttons: updated });
                        }}
                      >
                        <option value="URL">Open URL</option>
                        <option value="DIAL">Dial Phone</option>
                        <option value="QUICK_REPLY">Quick Reply</option>
                      </Input>
                    </Col>
                    <Col md={4}>
                      <Input
                        size="sm"
                        placeholder="Button Label"
                        value={btn.label || btn.text || ""}
                        onChange={(e) => {
                          const updated = [...form.buttons];
                          updated[idx].label = e.target.value;
                          updated[idx].text = e.target.value;
                          setForm({ ...form, buttons: updated });
                        }}
                      />
                    </Col>
                    <Col md={4}>
                      <Input
                        size="sm"
                        placeholder="URL or Payload"
                        value={btn.value || ""}
                        onChange={(e) => {
                          const updated = [...form.buttons];
                          updated[idx].value = e.target.value;
                          setForm({ ...form, buttons: updated });
                        }}
                      />
                    </Col>
                    <Col md={1} className="text-center">
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        className="p-1"
                        onClick={() => handleRemoveButton(idx)}
                      >
                        <FaTrash size={11} />
                      </Button>
                    </Col>
                  </Row>
                ))}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? <Spinner size="sm" /> : "Save RCS Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── ANDROID PHONE PREVIEW MODAL ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-light">
          RCS Android Preview
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="rounded-4 bg-white text-start shadow-sm mx-auto overflow-hidden position-relative"
            style={{ maxWidth: "260px", border: "8px solid #0f172a" }}
          >
            {(previewTemplate?.standaloneCard?.media?.mediaUrl || previewTemplate?.rcsMediaUrl) && (
              <img
                src={previewTemplate?.standaloneCard?.media?.mediaUrl || previewTemplate?.rcsMediaUrl}
                alt="RCS Banner"
                className="w-100"
                style={{ height: "130px", objectFit: "cover" }}
              />
            )}
            <div className="p-3">
              <h6 className="fw-bold mb-1 text-dark">
                {previewTemplate?.standaloneCard?.title || previewTemplate?.rcsCardTitle || previewTemplate?.name}
              </h6>
              <p className="text-muted small mb-3" style={{ fontSize: "11px", lineHeight: "1.4" }}>
                {previewTemplate?.standaloneCard?.description || previewTemplate?.description}
              </p>
              <div className="d-grid gap-1.5">
                {(previewTemplate?.standaloneCard?.suggestions || previewTemplate?.buttons || []).map((b, i) => (
                  <Button
                    key={i}
                    size="sm"
                    color="primary"
                    outline
                    className="py-1 rounded-pill fw-semibold"
                    style={{ fontSize: "11px" }}
                  >
                    {b.label || b.text}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RcsTemplates;
