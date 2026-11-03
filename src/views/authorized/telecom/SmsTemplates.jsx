import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaCommentAlt, FaPlus, FaSearch, FaEdit, FaTrash,
  FaMobileAlt, FaServer, FaShieldAlt
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

const SmsTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [senderIds, setSenderIds] = useState([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    senderId: "BYDSND",
    dltTemplateId: "",
    category: "IMPLICIT",
    provider: "ALL",
    providerTemplateId: "",
    body: "",
    status: "APPROVED"
  });

  const calculateSmsCredits = (text = "") => {
    const len = text.length;
    if (len === 0) return { chars: 0, credits: 0 };
    if (len <= 160) return { chars: len, credits: 1 };
    return { chars: len, credits: Math.ceil(len / 153) };
  };

  const currentCalc = calculateSmsCredits(form.body);

  const [categories, setCategories] = useState([]);

  const fetchSenders = async () => {
    try {
      const res = await apiClient.get("/from-ids/list?channel=SMS");
      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setSenderIds(list.map((s) => s.identifier));
      } else {
        setSenderIds(["BYDSND", "BYDPRM", "BYDTRX"]);
      }
    } catch {
      setSenderIds(["BYDSND", "BYDPRM"]);
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/sms/templates/list");
      const list = res?.data?.data || [];
      const provs = res?.data?.availableProviders || [];
      const cats = res?.data?.availableCategories || [];

      setTemplates(Array.isArray(list) ? list : []);
      if (provs.length > 0) setProviders(provs);
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error("Fetch SMS templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load SMS templates");
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
        senderId: template.senderId || (senderIds[0] || "BYDSND"),
        dltTemplateId: template.dltTemplateId || "",
        category: template.category || "IMPLICIT",
        provider: template.provider || "ALL",
        providerTemplateId: template.providerTemplateId || "",
        body: template.body || "",
        status: template.status || "APPROVED"
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        senderId: senderIds[0] || "BYDSND",
        dltTemplateId: "",
        category: "IMPLICIT",
        provider: "ALL",
        providerTemplateId: "",
        body: "Hello {#var#}, your requested OTP is {#var#}. Valid for 10 minutes.",
        status: "APPROVED"
      });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim() || !form.senderId.trim()) {
      toast.warning("Please fill in Template Name, Sender ID, and Message Body.");
      return;
    }

    try {
      setBtnLoading(true);
      const payload = {
        ...form,
        channelCategoryCode: form.channelCategoryCode || (form.category ? `SMS_${form.category}` : "SMS_IMPLICIT"),
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/sms/templates/update/${editingId}`, payload);
        toast.success(res?.data?.message || "SMS template updated successfully");
      } else {
        const res = await apiClient.post("/sms/templates/create", payload);
        toast.success(res?.data?.message || "New SMS template registered");
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
      "Delete SMS Template?",
      `Are you sure you want to delete '${name}'? This DLT template will be unmapped.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/sms/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template deleted");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.senderId || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.body || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.dltTemplateId || "").includes(search) ||
      (t.provider || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || t.category === filterType;
    const matchProvider = filterProvider === "ALL" || (t.provider || "ALL") === filterProvider;
    return matchSearch && matchType && matchProvider;
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
              <FaCommentAlt size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">SMS Templates (DLT & Multi-Provider Aligned)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                TRAI DLT compliant SMS templates with dynamic provider routing and automated character & credit calculation
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Add SMS Template
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {/* STATS STRIP & FILTERS */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col lg={4} md={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search templates, DLT ID, sender, provider..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="OTP">OTP (24x7 Route)</option>
                  <option value="IMPLICIT">Service Implicit (Alerts/Bills)</option>
                  <option value="EXPLICIT">Service Explicit (Consented)</option>
                  <option value="PROMOTIONAL">Promotional (Marketing)</option>
                  <option value="INTERNATIONAL">International Route</option>
                  <option value="DLT_SCRUBBING">DLT Scrubbing Active</option>
                </Input>
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
              <Col lg={2} md={6} className="text-end">
                <span className="badge bg-white border text-dark fw-bold px-2 py-1.5">
                  Total: {templates.length}
                </span>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="p-5 text-center">
              <PageLoader />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="table-light text-muted small text-uppercase">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Sender ID</th>
                    <th>Template Name & Preview</th>
                    <th>Category</th>
                    <th>Provider</th>
                    <th>DLT ID</th>
                    <th>Credits</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="adm-empty-state">
                          <FaCommentAlt size={36} className="text-muted mb-2 opacity-50" />
                          <div className="adm-empty-title">No SMS templates found</div>
                          <p className="adm-empty-sub mb-0">
                            No templates match your current filters. Try adjusting your query or create a new template.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <span className="badge bg-dark font-monospace px-2.5 py-1" style={{ letterSpacing: "1px" }}>
                            {t.senderId || "BYDSND"}
                          </span>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "300px" }}>
                            {t.body}
                          </small>
                        </td>
                        <td>
                          <Badge color="light" className="border text-dark">
                            {t.category}
                          </Badge>
                        </td>
                        <td>
                          {t.providerTemplates && t.providerTemplates.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {t.providerTemplates.map((p, pIdx) => (
                                <span key={pIdx}>
                                  {renderProviderBadge(p.providerCode, p.status)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            renderProviderBadge(t.provider || "ALL", t.status)
                          )}
                        </td>
                        <td className="font-monospace small text-muted">
                          {t.dltTemplateId || <span className="fst-italic text-warning">DLT Pending</span>}
                        </td>
                        <td>
                          <span className="badge bg-light border text-dark fw-bold">
                            {t.credits || 1} Credit ({t.charCount || (t.body ? t.body.length : 0)} chars)
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
                              title="Preview on Mobile"
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
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader toggle={() => setModal(false)} className="text-white bg-dark">
          {editingId ? "Edit SMS Template" : "Register New SMS Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. User OTP Login Service"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Sender ID (DLT Header) *</Label>
                  <Input
                    type="select"
                    value={form.senderId}
                    onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                    className="font-monospace fw-bold"
                  >
                    {senderIds.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">SMS Category *</Label>
                  <Input
                    type="select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="OTP">OTP (DLT Service Implicit - 24x7 Route)</option>
                    <option value="IMPLICIT">Service Implicit (Transactional notifications)</option>
                    <option value="EXPLICIT">Service Explicit (Consented updates)</option>
                    <option value="PROMOTIONAL">Promotional (Marketing campaigns)</option>
                    <option value="INTERNATIONAL">International Route (Global SMS)</option>
                    <option value="DLT_SCRUBBING">DLT Scrubbing Active (Strict Verification)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Carrier Provider (Dynamic)</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  >
                    <option value="ALL">ALL (Dynamic Routing & Failover)</option>
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
                  <Label className="fw-bold small text-dark">DLT Content Template ID</Label>
                  <Input
                    placeholder="19-digit DLT ID (e.g. 1407161...)"
                    value={form.dltTemplateId}
                    onChange={(e) => setForm({ ...form, dltTemplateId: e.target.value })}
                    className="font-monospace"
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Provider External Template ID</Label>
                  <Input
                    placeholder="External provider template reference ID"
                    value={form.providerTemplateId}
                    onChange={(e) => setForm({ ...form, providerTemplateId: e.target.value })}
                    className="font-monospace"
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Label className="fw-bold small text-dark mb-0">SMS Body Text *</Label>
                  <small className="fw-bold text-primary">
                    {currentCalc.chars} chars | {currentCalc.credits} SMS Credit(s)
                  </small>
                </div>
                <Input
                  type="textarea"
                  rows={4}
                  placeholder="Use {#var#} for dynamic variables..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                />
                <div className="mt-2 d-flex align-items-center gap-2">
                  <small className="text-muted fw-bold">Insert Variable:</small>
                  <Button
                    size="sm"
                    color="light"
                    className="border py-0 px-2 fw-semibold"
                    onClick={() => setForm({ ...form, body: form.body + " {#var#}" })}
                  >
                    + Add &#123;#var#&#125;
                  </Button>
                </div>
              </Col>
            </Row>
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

      {/* ── MOBILE PREVIEW MODAL ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-light">
          SMS Preview: {previewTemplate?.senderId || "BYDSND"}
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="p-3 rounded-4 bg-white text-start shadow-sm mx-auto position-relative"
            style={{ maxWidth: "260px", minHeight: "360px", border: "8px solid #0f172a" }}
          >
            <div className="text-center pb-2 mb-2 border-bottom">
              <small className="fw-bold text-muted font-monospace">{previewTemplate?.senderId || "BYDSND"}</small>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>Today 12:45 PM</div>
            </div>
            <div
              className="p-2.5 rounded-3 bg-light border text-dark"
              style={{ fontSize: "12px", lineHeight: "1.4" }}
            >
              {previewTemplate?.body}
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default SmsTemplates;
