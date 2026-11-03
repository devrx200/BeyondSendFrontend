import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaTelegramPlane, FaPlus, FaSearch, FaEdit, FaTrash,
  FaRobot, FaCheckDouble, FaPaperPlane, FaSyncAlt, FaMobileAlt, FaServer
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";
// Pure Bootstrap 5 Status & Provider badge helpers
const renderStatusBadge = (status) => {
  const s = String(status || "APPROVED").toUpperCase();
  if (s === "APPROVED" || s === "ACTIVE") {
    return (
      <span className="badge rounded-pill bg-success text-white fw-semibold px-2.5 py-1 text-uppercase">
        APPROVED
      </span>
    );
  }
  if (s === "REJECTED" || s === "FAILED") {
    return (
      <span className="badge rounded-pill bg-danger text-white fw-semibold px-2.5 py-1 text-uppercase">
        REJECTED
      </span>
    );
  }
  if (s === "PENDING" || s === "PENDING_APPROVAL" || s === "SUBMITTED" || s === "UNDER_REVIEW") {
    return (
      <span className="badge rounded-pill bg-warning text-dark fw-semibold px-2.5 py-1 text-uppercase">
        {s === "PENDING_APPROVAL" ? "PENDING" : s}
      </span>
    );
  }
  if (s === "DRAFT") {
    return (
      <span className="badge rounded-pill bg-secondary text-white fw-semibold px-2.5 py-1 text-uppercase">
        DRAFT
      </span>
    );
  }
  return (
    <span className="badge rounded-pill bg-secondary text-white fw-semibold px-2.5 py-1 text-uppercase">
      {s}
    </span>
  );
};

const renderProviderBadge = (providerCode, status) => {
  const s = String(status || "").toUpperCase();
  let bgClass = "bg-secondary text-white";
  if (s === "APPROVED") bgClass = "bg-success text-white";
  else if (s === "REJECTED") bgClass = "bg-danger text-white";
  else if (s === "PENDING" || s === "SUBMITTED") bgClass = "bg-warning text-dark";
  else if (providerCode) bgClass = "bg-info text-white";

  return (
    <span
      className={`badge rounded-pill font-monospace px-2 py-1 text-uppercase d-inline-flex align-items-center gap-1 ${bgClass}`}
      style={{ fontSize: "10px" }}
    >
      <FaServer size={8} />
      <span>{providerCode}</span>
      {status ? <span className="fw-bold">({status})</span> : null}
    </span>
  );
};

const TelegramTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en",
    provider: "TELEGRAM_BOT",
    providerTemplateId: "",
    body: "Hello {{1}}, your order #{{2}} has been confirmed! Track here: {{3}}",
    interactiveType: "INLINE_KEYBOARD",
    buttons: [
      { type: "URL", text: "Track Order 📦", value: "https://beyondsend.com/track" },
      { type: "CALLBACK", text: "Contact Support 🎧", value: "action_support" }
    ]
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/telegram/templates/list");
      const list = res?.data?.data || [];
      const provs = res?.data?.availableProviders || [];

      setTemplates(Array.isArray(list) ? list : []);
      if (provs.length > 0) setProviders(provs);
    } catch (err) {
      console.error("Fetch Telegram templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load Telegram templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      category: "UTILITY",
      language: "en",
      provider: providers[0]?.code || "TELEGRAM_BOT",
      providerTemplateId: "",
      body: "Hello {{1}}, your notification alert #{{2}} is ready.",
      interactiveType: "INLINE_KEYBOARD",
      buttons: [
        { type: "URL", text: "Open Console", value: "https://beyondsend.com" }
      ]
    });
    setModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t._id);
    const existingButtons = t.buttons || t.telegramConfig?.buttons || t.structure?.buttons || [];
    setForm({
      name: t.name || "",
      category: t.category || "UTILITY",
      language: t.language || "en",
      provider: t.provider || "TELEGRAM_BOT",
      providerTemplateId: t.providerTemplateId || "",
      body: t.body || t.telegramConfig?.bodyText || t.structure?.bodyText || "",
      interactiveType: t.interactiveType || t.telegramConfig?.interactiveType || t.structure?.interactiveType || "INLINE_KEYBOARD",
      buttons: Array.isArray(existingButtons) && existingButtons.length > 0 ? existingButtons : []
    });
    setModal(true);
  };

  const handleAddButton = () => {
    if (form.buttons.length >= 4) {
      return toast.warning("Maximum 4 inline buttons allowed");
    }
    setForm({
      ...form,
      buttons: [...form.buttons, { type: "URL", text: "Button Text", value: "https://beyondsend.com" }]
    });
  };

  const handleRemoveButton = (idx) => {
    const updated = form.buttons.filter((_, i) => i !== idx);
    setForm({ ...form, buttons: updated });
  };

  const handleButtonChange = (idx, field, val) => {
    const updated = [...form.buttons];
    updated[idx][field] = val;
    setForm({ ...form, buttons: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Template name is required");
    if (!form.body.trim()) return toast.error("Message body text is required");

    try {
      setBtnLoading(true);
      const payload = {
        channel: "TELEGRAM",
        name: form.name.trim(),
        category: form.category,
        language: form.language,
        provider: form.provider,
        providerTemplateId: form.providerTemplateId,
        body: form.body,
        interactiveType: form.interactiveType,
        buttons: form.buttons.map(b => ({
          type: b.type,
          text: b.text,
          value: b.value,
          url: b.type === "URL" ? b.value : undefined,
          payload: b.type !== "URL" ? b.value : undefined
        }))
      };

      if (editingId) {
        await apiClient.put(`/telegram/templates/update/${editingId}`, payload);
        toast.success("Telegram template updated successfully");
      } else {
        await apiClient.post("/telegram/templates/create", payload);
        toast.success("Telegram template created successfully");
      }

      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save Telegram template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = (id, name) => {
    wpSwal.fire({
      title: "Delete Telegram Template?",
      text: `Are you sure you want to delete "${name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/telegram/templates/delete/${id}`);
          toast.success("Template deleted successfully");
          fetchTemplates();
        } catch (err) {
          toast.error(err?.response?.data?.message || "Failed to delete template");
        }
      }
    });
  };

  const filtered = templates.filter(t => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.body || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.provider || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "ALL" || t.category === filterCat;
    const matchProv = filterProvider === "ALL" || (t.provider || "ALL") === filterProvider;
    return matchSearch && matchCat && matchProv;
  });

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: "#0088cc" }}>
            <FaTelegramPlane size={24} /> Telegram Templates (Bot & Gateway Relays)
          </h4>
          <p className="text-muted small mb-0">
            Design, test, and manage interactive Telegram Bot message layouts with dynamic multi-provider routing.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button color="light" className="border shadow-sm d-flex align-items-center gap-1.5" onClick={fetchTemplates}>
            <FaSyncAlt /> Refresh
          </Button>
          <Button color="primary" className="shadow-sm d-flex align-items-center gap-1.5" onClick={handleOpenCreate} style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}>
            <FaPlus /> New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4 rounded-3">
        <CardBody className="p-3">
          <Row className="g-2">
            <Col md={5}>
              <InputGroup size="sm">
                <InputGroupText className="bg-light">
                  <FaSearch className="text-muted" />
                </InputGroupText>
                <Input
                  placeholder="Search Telegram templates by name, content, provider..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Input
                type="select"
                size="sm"
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
                <option value="SERVICE">Service</option>
              </Input>
            </Col>
            <Col md={4}>
              <Input
                type="select"
                size="sm"
                value={filterProvider}
                onChange={e => setFilterProvider(e.target.value)}
              >
                <option value="ALL">All Telegram Providers ({providers.length})</option>
                {providers.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name || p.code} ({p.code})
                  </option>
                ))}
              </Input>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Templates Table */}
      <Card className="border-0 shadow-sm rounded-3">
        <CardBody className="p-0">
          <div className="table-responsive">
            {loading ? (
              <div className="p-5 text-center">
                <PageLoader />
              </div>
            ) : (
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Template Name</th>
                    <th>Category</th>
                    <th>Provider</th>
                    <th>Message Content</th>
                    <th>Inline Buttons</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No Telegram templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td className="fw-semibold text-dark">
                          {t.name}
                        </td>
                        <td>
                          <Badge color="info" pill className="px-2 py-1">
                            {t.category || "UTILITY"}
                          </Badge>
                        </td>
                        <td>
                          {renderProviderBadge(t.provider || "TELEGRAM_BOT", t.status)}
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: "260px" }}>
                            {t.body || t.telegramConfig?.bodyText}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light border text-dark">
                            {(t.buttons || t.telegramConfig?.buttons || []).length} Buttons
                          </span>
                        </td>
                        <td>
                          {renderStatusBadge(t.status)}
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              title="Preview Layout"
                              onClick={() => setPreviewTemplate(t)}
                            >
                              <FaMobileAlt size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-success"
                              title="Edit Template"
                              onClick={() => handleOpenEdit(t)}
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

      {/* Create / Edit Modal */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setModal(false)} className="text-white" style={{ backgroundColor: "#0088cc" }}>
          {editingId ? "Edit Telegram Template" : "New Telegram Template"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. order_shipped_v1"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Provider Routing (Dynamic)</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={e => setForm({ ...form, provider: e.target.value })}
                  >
                    <option value="ALL">ALL (Dynamic Failover)</option>
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
                  <Label className="fw-bold small text-dark">Category *</Label>
                  <Input
                    type="select"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="UTILITY">Utility (Transactional notifications)</option>
                    <option value="MARKETING">Marketing (Promotional broadcasts)</option>
                    <option value="AUTHENTICATION">Authentication (2FA / OTP)</option>
                    <option value="SERVICE">Service (Customer support)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Keyboard Type</Label>
                  <Input
                    type="select"
                    value={form.interactiveType}
                    onChange={e => setForm({ ...form, interactiveType: e.target.value })}
                  >
                    <option value="INLINE_KEYBOARD">Inline Keyboard (Under Message)</option>
                    <option value="REPLY_KEYBOARD">Reply Keyboard (Bottom Menu)</option>
                    <option value="NONE">None (Plain Text Message)</option>
                  </Input>
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Message Body Text *</Label>
                  <Input
                    type="textarea"
                    rows={4}
                    placeholder="Enter Telegram message text. Use {{1}}, {{2}} for dynamic variables..."
                    value={form.body}
                    onChange={e => setForm({ ...form, body: e.target.value })}
                    required
                  />
                  <div className="mt-1 d-flex gap-2">
                    <Button
                      size="sm"
                      color="light"
                      className="border py-0 px-2 fw-semibold"
                      onClick={() => {
                        const count = (form.body.match(/\{\{\d+\}\}/g) || []).length + 1;
                        setForm({ ...form, body: form.body + ` {{${count}}}` });
                      }}
                    >
                      + Add &#123;&#123;var&#125;&#125;
                    </Button>
                  </div>
                </FormGroup>
              </Col>

              {form.interactiveType !== "NONE" && (
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label className="fw-bold small text-dark mb-0">Interactive Action Buttons</Label>
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      onClick={handleAddButton}
                      disabled={form.buttons.length >= 4}
                      className="py-0 px-2 fw-semibold"
                    >
                      + Add Button
                    </Button>
                  </div>
                  {form.buttons.map((btn, idx) => (
                    <Row key={idx} className="g-2 mb-2 align-items-center">
                      <Col md={3}>
                        <Input
                          type="select"
                          size="sm"
                          value={btn.type}
                          onChange={e => handleButtonChange(idx, "type", e.target.value)}
                        >
                          <option value="URL">Open URL</option>
                          <option value="CALLBACK">Callback Data</option>
                          <option value="WEB_APP">Web App URL</option>
                        </Input>
                      </Col>
                      <Col md={4}>
                        <Input
                          size="sm"
                          placeholder="Button Label"
                          value={btn.text}
                          onChange={e => handleButtonChange(idx, "text", e.target.value)}
                        />
                      </Col>
                      <Col md={4}>
                        <Input
                          size="sm"
                          placeholder="URL or Callback Action"
                          value={btn.value || ""}
                          onChange={e => handleButtonChange(idx, "value", e.target.value)}
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
              )}
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading} style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}>
              {btnLoading ? <Spinner size="sm" /> : "Save Telegram Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} style={{ backgroundColor: "#0088cc", color: "#fff" }}>
          Telegram Message Preview
        </ModalHeader>
        <ModalBody className="p-3 bg-dark">
          <div
            className="rounded-4 p-3 shadow-sm mx-auto position-relative"
            style={{ maxWidth: "260px", background: "#517da2", border: "6px solid #0f172a" }}
          >
            <div className="bg-white p-2.5 rounded-3 shadow-xs mb-2 text-dark small" style={{ whiteSpace: "pre-line" }}>
              {previewTemplate?.body || previewTemplate?.telegramConfig?.bodyText}
            </div>
            <div className="d-grid gap-1">
              {(previewTemplate?.buttons || previewTemplate?.telegramConfig?.buttons || []).map((b, i) => (
                <Button key={i} size="sm" color="light" className="text-primary fw-bold py-1 border shadow-xs" style={{ fontSize: "11px" }}>
                  {b.text || "Action"}
                </Button>
              ))}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default TelegramTemplates;
