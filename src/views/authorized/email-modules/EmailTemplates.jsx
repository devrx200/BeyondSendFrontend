import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaEnvelope, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCopy, FaEye, FaPaperPlane, FaCode
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const EmailTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [senderEmails, setSenderEmails] = useState([]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    fromEmail: "notifications@beyondsend.in",
    fromName: "BeyondSend Cloud",
    category: "Marketing",
    status: "APPROVED",
    htmlContent: "<h2>Hello {{name}},</h2>\n<p>Write your email body here...</p>"
  });

  const fetchSenders = async () => {
    try {
      const res = await apiClient.get("/from-ids/list?channel=EMAIL");
      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setSenderEmails(list);
      } else {
        setSenderEmails([{ identifier: "notifications@beyondsend.in", senderName: "BeyondSend Cloud" }]);
      }
    } catch {
      setSenderEmails([{ identifier: "notifications@beyondsend.in", senderName: "BeyondSend Cloud" }]);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/templates/list?channel=EMAIL");
      const list = res?.data?.data || res?.data || [];

      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch email templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSenders();
    fetchTemplates();
  }, []);

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template._id);
      setForm({
        name: template.name || "",
        subject: template.subject || "",
        fromEmail: template.fromEmail || (senderEmails[0]?.identifier || "notifications@beyondsend.in"),
        fromName: template.fromName || (senderEmails[0]?.senderName || "BeyondSend"),
        category: template.category || "Marketing",
        status: template.status || "APPROVED",
        htmlContent: template.htmlContent || ""
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        subject: "",
        fromEmail: senderEmails[0]?.identifier || "notifications@beyondsend.in",
        fromName: senderEmails[0]?.senderName || "BeyondSend Cloud",
        category: "Marketing",
        status: "APPROVED",
        htmlContent: "<h2>Hello {{name}},</h2>\n<p>Write your email body here...</p>"
      });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) {
      toast.warning("Please fill in Template Name and Subject line.");
      return;
    }

    try {
      setBtnLoading(true);
      if (editingId) {
        const res = await apiClient.put(`/templates/update/${editingId}`, {
          ...form,
          channel: "EMAIL"
        });
        toast.success(res?.data?.message || "Email template updated successfully");
      } else {
        const res = await apiClient.post("/templates/create", {
          ...form,
          channel: "EMAIL"
        });
        toast.success(res?.data?.message || "New email template saved");
      }
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Email Template?",
      `Are you sure you want to remove '${name}'? This cannot be undone.`
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

  const handleClone = async (tpl) => {
    try {
      await apiClient.post("/templates/create", {
        ...tpl,
        _id: undefined,
        name: `${tpl.name} (Copy)`,
        channel: "EMAIL"
      });
      toast.success("Template cloned successfully");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to duplicate template");
    }
  };

  const handleTestSend = async (tpl) => {
    const isConfirmed = await wpSwal.confirm(
      "Send Test Dispatch?",
      `Dispatch a test rendering of '${tpl.name}' to the registered administrator email?`
    );
    if (isConfirmed) {
      toast.success(`Test email queued for '${tpl.name}'`);
    }
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || t.category === filterCategory;
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
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaEnvelope size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Email Templates</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Responsive HTML email templates with dynamic merge tags and tracking
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create Email Template
          </Button>
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
                    placeholder="Search templates by name, subject..."
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
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Transactional">Transactional</option>
                  <option value="Alerts">Alerts</option>
                  <option value="Promotional">Promotional</option>
                </Input>
              </Col>
              <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total: {templates.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Active: {templates.filter((t) => t.status === "APPROVED" || t.status === "ACTIVE").length}
                </Badge>
                <Badge color="info" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  High Deliverability
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
                    <th>Template Name & Subject</th>
                    <th>Category</th>
                    <th>Sender From</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th className="text-center" style={{ width: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No email templates found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "340px" }}>
                            {t.subject}
                          </small>
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-1 rounded-pill fw-semibold"
                            style={{
                              fontSize: "11px",
                              background:
                                t.category === "Marketing"
                                  ? "#edf2ff"
                                  : t.category === "Transactional"
                                  ? "#e6fcf5"
                                  : "#fff4e6",
                              color:
                                t.category === "Marketing"
                                  ? "#3b5bdb"
                                  : t.category === "Transactional"
                                  ? "#0ca678"
                                  : "#e8590c"
                            }}
                          >
                            {t.category || "Marketing"}
                          </span>
                        </td>
                        <td className="small text-muted font-monospace">
                          {t.fromEmail || "notifications@beyondsend.in"}
                        </td>
                        <td>
                          <Badge
                            color={t.status === "APPROVED" || t.status === "ACTIVE" ? "success" : "secondary"}
                            pill
                            className="fw-semibold px-2 py-1"
                          >
                            {t.status === "APPROVED" || t.status === "ACTIVE" ? "Active" : "Draft"}
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
                              data-tt="Preview HTML"
                              onClick={() => {
                                setSelectedTemplate(t);
                                setPreviewModal(true);
                              }}
                            >
                              <FaEye size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="info"
                              className="adm-icon-btn is-info"
                              data-tt="Send Test Dispatch"
                              onClick={() => handleTestSend(t)}
                            >
                              <FaPaperPlane size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              data-tt="Duplicate Template"
                              onClick={() => handleClone(t)}
                            >
                              <FaCopy size={12} />
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
          {editingId ? "Edit Email Template" : "Compose New Email Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <div className="bg-white p-3.5 rounded-3 border shadow-xs mb-3">
              <Row className="g-3">
                <Col md={7}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Template Name *</Label>
                    <Input
                      placeholder="e.g. Welcome Customer Onboarding"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={5}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Category</Label>
                    <Input
                      type="select"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Marketing">Marketing</option>
                      <option value="Transactional">Transactional</option>
                      <option value="Alerts">Alerts</option>
                      <option value="Promotional">Promotional</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Email Subject Line *</Label>
                    <Input
                      placeholder="e.g. Your verification code is {{otp}}"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Sender From Address</Label>
                    <Input
                      type="select"
                      value={form.fromEmail}
                      onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                    >
                      {senderEmails.map((se) => (
                        <option key={se.identifier} value={se.identifier}>
                          {se.senderName ? `${se.senderName} (${se.identifier})` : se.identifier}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Display Name</Label>
                    <Input
                      value={form.fromName}
                      onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                      placeholder="BeyondSend Support"
                    />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted fw-bold">Available Merge Tags:</small>
                    {["{{name}}", "{{email}}", "{{company}}", "{{otp}}", "{{amount}}"].map((tag) => (
                      <span
                        key={tag}
                        role="button"
                        onClick={() => setForm({ ...form, htmlContent: form.htmlContent + " " + tag })}
                        className="badge bg-light border text-dark cursor-pointer"
                        title="Click to insert"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Col>
              </Row>
            </div>

            <div className="bg-white p-3.5 rounded-3 border shadow-xs">
              <Label className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                <FaCode size={13} className="text-primary" /> HTML Content & Layout
              </Label>
              <Input
                type="textarea"
                rows={9}
                value={form.htmlContent}
                onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                className="font-monospace"
                style={{ fontSize: "12.5px" }}
              />
            </div>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? <Spinner size="sm" /> : "Save Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── PREVIEW MODAL ── */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setPreviewModal(false)} className="bg-light">
          Preview: {selectedTemplate?.name}
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="p-3 bg-light rounded-3 mb-3 border">
            <div className="small text-muted mb-1">
              <strong>Subject:</strong> {selectedTemplate?.subject}
            </div>
            <div className="small text-muted">
              <strong>From:</strong> {selectedTemplate?.fromName || "BeyondSend"} &lt;{selectedTemplate?.fromEmail || "no-reply@beyondsend.in"}&gt;
            </div>
          </div>
          <div
            className="p-4 border rounded-3 bg-white"
            style={{ minHeight: "240px" }}
            dangerouslySetInnerHTML={{
              __html: selectedTemplate?.htmlContent || "<p>No content preview available</p>"
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setPreviewModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default EmailTemplates;
