import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaEnvelope, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCopy, FaEye, FaPaperPlane, FaCode, FaServer
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const EmailTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [senderEmails, setSenderEmails] = useState([]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterProvider, setFilterProvider] = useState("ALL");
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
    provider: "SENDGRID",
    providerTemplateId: "",
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

  const [categories, setCategories] = useState([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/email/templates/list");
      const list = res?.data?.data || [];
      const provs = res?.data?.availableProviders || [];
      const cats = res?.data?.availableCategories || [];

      setTemplates(Array.isArray(list) ? list : []);
      if (provs.length > 0) setProviders(provs);
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error("Fetch email templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await apiClient.get("/email/templates/providers");
      const list = res?.data?.data || [];
      if (list.length > 0) setProviders(list);
    } catch {
      // Fallback: will be populated by fetchTemplates
    }
  };

  useEffect(() => {
    fetchSenders();
    fetchTemplates();
    fetchProviders();
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
        provider: template.provider || "SENDGRID",
        providerTemplateId: template.providerTemplateId || "",
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
        provider: providers[0]?.code || "SENDGRID",
        providerTemplateId: "",
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
      const payload = {
        ...form,
        channelCategoryCode: form.channelCategoryCode || (form.category ? `EMAIL_${form.category}` : "EMAIL_TRANSACTIONAL"),
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/email/templates/update/${editingId}`, payload);
        toast.success(res?.data?.message || "Email template updated successfully");
      } else {
        const res = await apiClient.post("/email/templates/create", payload);
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
      const res = await apiClient.delete(`/email/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.subject || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.fromEmail || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.provider || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || (t.category || "").toLowerCase() === filterCategory.toLowerCase();
    const matchProv = filterProvider === "ALL" || (t.provider || "ALL") === filterProvider;
    return matchSearch && matchCat && matchProv;
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
              <FaEnvelope size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Email Templates (HTML & Multi-Gateway Relays)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Responsive HTML email templates with dynamic merge variables and multi-provider relay routing (SendGrid, SES, SMTP, Mailgun)
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
          {/* SEARCH & FILTERS */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col lg={4} md={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search templates, subject, provider..."
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
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Transactional">Transactional</option>
                  <option value="Alerts">Alerts</option>
                  <option value="Promotional">Promotional</option>
                </Input>
              </Col>
              <Col lg={3} md={6}>
                <Input
                  type="select"
                  size="sm"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                >
                  <option value="ALL">All Email Gateways ({providers.length})</option>
                  {providers.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name || p.code}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col lg={2} md={6} className="text-end">
                <span className="badge bg-white border text-dark fw-bold px-2 py-1.5">
                  Total: {templates.length}
                </span>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
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
                    <th>Template Name & Subject</th>
                    <th>Category</th>
                    <th>Gateway Provider</th>
                    <th>Sender From</th>
                    <th>Status</th>
                    <th>Last Modified</th>
                    <th className="text-center" style={{ width: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No email templates found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "300px" }}>
                            {t.subject}
                          </small>
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-1 rounded-pill fw-semibold"
                            style={{
                              fontSize: "11px",
                              background:
                                (t.category || "").toLowerCase() === "marketing"
                                  ? "#edf2ff"
                                  : (t.category || "").toLowerCase() === "transactional"
                                  ? "#e6fcf5"
                                  : "#fff4e6",
                              color:
                                (t.category || "").toLowerCase() === "marketing"
                                  ? "#3b5bdb"
                                  : (t.category || "").toLowerCase() === "transactional"
                                  ? "#0ca678"
                                  : "#e8590c"
                            }}
                          >
                            {t.category || "Marketing"}
                          </span>
                        </td>
                        <td>
                          {t.providerTemplates && t.providerTemplates.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {t.providerTemplates.map((p, pIdx) => (
                                <Badge key={pIdx} color="info" pill className="font-monospace px-2 py-0.5 text-uppercase" style={{ fontSize: "10px" }}>
                                  <FaServer className="me-1" size={8} />
                                  {p.providerCode} {p.status ? `(${p.status})` : ""}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge color="info" pill className="font-monospace px-2 py-1">
                              <FaServer className="me-1" size={9} />
                              {t.provider || "SENDGRID"}
                            </Badge>
                          )}
                        </td>
                        <td className="small text-muted font-monospace">
                          {t.fromEmail || "notifications@beyondsend.in"}
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
                              title="Preview HTML"
                              onClick={() => {
                                setSelectedTemplate(t);
                                setPreviewModal(true);
                              }}
                            >
                              <FaEye size={12} />
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
          {editingId ? "Edit Email Template" : "New Email Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. Monthly Invoicing Receipt"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Email Relay Gateway</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  >
                    <option value="ALL">ALL (Dynamic Relay)</option>
                    {providers.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name || p.code} ({p.code})
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Email Subject Line *</Label>
                  <Input
                    placeholder="e.g. Your Monthly BeyondSend Bill is Ready (#{{invoiceId}})"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">From Email Address</Label>
                  <Input
                    type="select"
                    value={form.fromEmail}
                    onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                  >
                    {senderEmails.map((s) => (
                      <option key={s.identifier} value={s.identifier}>
                        {s.senderName ? `${s.senderName} <${s.identifier}>` : s.identifier}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
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
                  <Label className="fw-bold small text-dark">HTML Content Body *</Label>
                  <Input
                    type="textarea"
                    rows={8}
                    placeholder="<html>... Use {{name}}, {{amount}} for dynamic variables"
                    value={form.htmlContent}
                    onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                    className="font-monospace small"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? <Spinner size="sm" /> : "Save Email Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── HTML PREVIEW MODAL ── */}
      <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setPreviewModal(false)} className="bg-light">
          Preview: {selectedTemplate?.name}
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="p-3 bg-light rounded-3 border mb-3">
            <div className="small"><strong>Subject:</strong> {selectedTemplate?.subject}</div>
            <div className="small"><strong>From:</strong> {selectedTemplate?.fromEmail}</div>
            <div className="small"><strong>Gateway Provider:</strong> <Badge color="info">{selectedTemplate?.provider || "SENDGRID"}</Badge></div>
          </div>
          <div
            className="p-4 bg-white border rounded-3 shadow-xs"
            dangerouslySetInnerHTML={{ __html: selectedTemplate?.htmlContent || "" }}
            style={{ minHeight: "220px" }}
          />
        </ModalBody>
      </Modal>
    </div>
  );
};

export default EmailTemplates;
