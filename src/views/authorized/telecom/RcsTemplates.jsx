import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaComments, FaPlus, FaSearch, FaEdit, FaTrash,
  FaMobileAlt, FaCheckCircle
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const RcsTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    senderId: "BeyondSend Official",
    cardType: "STANDALONE_RICH_CARD",
    rcsCardTitle: "",
    description: "",
    rcsMediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    buttons: [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/templates/list?channel=RCS");
      const data = res?.data?.data || res?.data || [];

      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch RCS templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load RCS templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template._id);
      setForm({
        name: template.name || "",
        senderId: template.senderId || "BeyondSend Official",
        cardType: template.cardType || "STANDALONE_RICH_CARD",
        rcsCardTitle: template.rcsCardTitle || "",
        description: template.description || "",
        rcsMediaUrl: template.rcsMediaUrl || "",
        buttons: template.buttons?.length
          ? template.buttons
          : [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        senderId: "BeyondSend Official",
        cardType: "STANDALONE_RICH_CARD",
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
      if (editingId) {
        const res = await apiClient.put(`/templates/update/${editingId}`, {
          ...form,
          channel: "RCS"
        });
        toast.success(res?.data?.message || "RCS template updated successfully");
      } else {
        const res = await apiClient.post("/templates/create", {
          ...form,
          channel: "RCS",
          status: "APPROVED"
        });
        toast.success(res?.data?.message || "RCS template submitted to Google Jibe carrier network");
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
      const res = await apiClient.delete(`/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filtered = templates.filter(
    (t) =>
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.rcsCardTitle || "").toLowerCase().includes(search.toLowerCase())
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
              <FaComments size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">RCS Templates (Rich Communication Services)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Next-gen interactive messaging with high-res media, carousels & instant action buttons
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create RCS Template
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search RCS templates by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total: {templates.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Carrier Verified: {templates.filter((t) => t.status === "APPROVED").length}
                </Badge>
                <Badge color="info" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Google Jibe Connected
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Template Name & Title</th>
                    <th>Sender ID</th>
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
                          <small className="text-muted">{t.rcsCardTitle || t.description}</small>
                        </td>
                        <td>
                          <span className="badge bg-light border text-dark font-monospace">
                            {t.senderId || "BeyondSend"}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(t.buttons || []).map((b, i) => (
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
                              data-tt="Preview on Android Device"
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
          {editingId ? "Edit RCS Template" : "Build Interactive RCS Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. Festival Offer Card"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Sender Identifier</Label>
                  <Input
                    value={form.senderId}
                    onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Media Image URL</Label>
                  <Input
                    placeholder="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                    value={form.rcsMediaUrl}
                    onChange={(e) => setForm({ ...form, rcsMediaUrl: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Title *</Label>
                  <Input
                    placeholder="Bold primary headline"
                    value={form.rcsCardTitle}
                    onChange={(e) => setForm({ ...form, rcsCardTitle: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Description *</Label>
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Supporting marketing message body..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              {/* ACTION BUTTONS BUILDER */}
              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label className="fw-bold small text-dark mb-0">Action Chips (Max 3)</Label>
                  {form.buttons.length < 3 && (
                    <Button size="sm" color="light" className="border" onClick={handleAddButton}>
                      + Add Action Chip
                    </Button>
                  )}
                </div>
                {form.buttons.map((btn, idx) => (
                  <Row key={idx} className="g-2 mb-2 align-items-center">
                    <Col xs={3}>
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
                    <Col xs={4}>
                      <Input
                        size="sm"
                        placeholder="Button Label"
                        value={btn.label}
                        onChange={(e) => {
                          const updated = [...form.buttons];
                          updated[idx].label = e.target.value;
                          setForm({ ...form, buttons: updated });
                        }}
                      />
                    </Col>
                    <Col xs={4}>
                      <Input
                        size="sm"
                        placeholder="URL / Payload"
                        value={btn.value}
                        onChange={(e) => {
                          const updated = [...form.buttons];
                          updated[idx].value = e.target.value;
                          setForm({ ...form, buttons: updated });
                        }}
                      />
                    </Col>
                    <Col xs={1}>
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => handleRemoveButton(idx)}
                      >
                        ✕
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
            <Button
              color="primary"
              type="submit"
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Save RCS Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── PREVIEW MODAL ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-light">
          Google Messages RCS View
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="p-3 rounded-4 bg-white text-start shadow-sm mx-auto position-relative"
            style={{ maxWidth: "280px", minHeight: "420px", border: "8px solid #0f172a" }}
          >
            <div className="d-flex align-items-center gap-2 pb-2 mb-2 border-bottom">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "28px", height: "28px", fontSize: "11px" }}
              >
                BS
              </div>
              <div>
                <small className="fw-bold d-block text-dark lh-1">
                  {previewTemplate?.senderId || "BeyondSend"} <FaCheckCircle size={10} className="text-primary ms-0.5" />
                </small>
                <span style={{ fontSize: "9.5px", color: "#64748b" }}>RCS Business Messaging</span>
              </div>
            </div>

            {/* RCS CARD */}
            <div className="rounded-3 border overflow-hidden shadow-xs bg-light">
              {previewTemplate?.rcsMediaUrl && (
                <img
                  src={previewTemplate.rcsMediaUrl}
                  alt="RCS Banner"
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                />
              )}
              <div className="p-2.5">
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "13px" }}>
                  {previewTemplate?.rcsCardTitle || previewTemplate?.name}
                </h6>
                <p className="text-muted mb-2" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                  {previewTemplate?.description}
                </p>
                <div className="d-flex flex-column gap-1.5 pt-1 border-top">
                  {(previewTemplate?.buttons || []).map((b, i) => (
                    <div
                      key={i}
                      className="text-center py-1 rounded bg-white border text-primary fw-bold cursor-pointer"
                      style={{ fontSize: "11px" }}
                    >
                      {b.label || b.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RcsTemplates;
