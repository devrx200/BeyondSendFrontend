import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaCommentAlt, FaPlus, FaSearch, FaEdit, FaTrash,
  FaMobileAlt, FaShieldAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const SmsTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [senderIds, setSenderIds] = useState([]);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    senderId: "BYDSND",
    dltTemplateId: "",
    category: "SERVICE_IMPLICIT",
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
      const res = await apiClient.get("/templates/list?channel=SMS");
      const list = res?.data?.data || res?.data || [];

      setTemplates(Array.isArray(list) ? list : []);
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
        category: template.category || "SERVICE_IMPLICIT",
        body: template.body || "",
        status: template.status || "APPROVED"
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        senderId: senderIds[0] || "BYDSND",
        dltTemplateId: "",
        category: "SERVICE_IMPLICIT",
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
      if (editingId) {
        const res = await apiClient.put(`/templates/update/${editingId}`, {
          ...form,
          channel: "SMS"
        });
        toast.success(res?.data?.message || "SMS template updated successfully");
      } else {
        const res = await apiClient.post("/templates/create", {
          ...form,
          channel: "SMS"
        });
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
      const res = await apiClient.delete(`/templates/delete/${id}`);
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
      (t.dltTemplateId || "").includes(search);
    const matchType = filterType === "ALL" || t.category === filterType;
    return matchSearch && matchType;
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
              <h4 className="adm-page-title mb-0 text-white">SMS Templates (DLT Aligned)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                TRAI DLT compliant SMS templates with automated character & credit calculation
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
          {/* STATS STRIP */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search by name, sender ID, DLT ID, text..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All SMS Categories</option>
                  <option value="SERVICE_IMPLICIT">Service Implicit (OTP)</option>
                  <option value="TRANSACTIONAL">Transactional</option>
                  <option value="SERVICE_EXPLICIT">Service Explicit</option>
                  <option value="PROMOTIONAL">Promotional</option>
                </Input>
              </Col>
              <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total: {templates.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Approved: {templates.filter((t) => t.status === "APPROVED").length}
                </Badge>
                <Badge color="warning" className="py-1.5 px-2.5 rounded-pill shadow-xs text-dark">
                  Pending: {templates.filter((t) => t.status === "PENDING_APPROVAL").length}
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
                    <th>Header (Sender ID)</th>
                    <th>Template Name & Content</th>
                    <th>SMS Category</th>
                    <th>DLT Content ID</th>
                    <th>Credit Cost</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-0">
                        <div className="adm-empty-state">
                          <span className="adm-empty-icon">
                            <FaCommentAlt size={24} />
                          </span>
                          <div className="adm-empty-title">No SMS templates found</div>
                          <p className="adm-empty-sub mb-0">
                            No templates match your current search or category filter. Try adjusting the query or register a new DLT template.
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
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "340px" }}>
                            {t.body}
                          </small>
                        </td>
                        <td>
                          <span
                            className="px-2 py-0.5 rounded-pill fw-semibold"
                            style={{
                              fontSize: "11px",
                              background:
                                t.category === "TRANSACTIONAL"
                                  ? "#e6fcf5"
                                  : t.category === "SERVICE_IMPLICIT"
                                  ? "#edf2ff"
                                  : "#fff4e6",
                              color:
                                t.category === "TRANSACTIONAL"
                                  ? "#0ca678"
                                  : t.category === "SERVICE_IMPLICIT"
                                  ? "#3b5bdb"
                                  : "#e8590c"
                            }}
                          >
                            {(t.category || "SERVICE_IMPLICIT").replace("_", " ")}
                          </span>
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
                          <Badge
                            color={t.status === "APPROVED" ? "success" : "warning"}
                            pill
                            className={`fw-semibold px-2 py-1 ${t.status === "PENDING_APPROVAL" ? "text-dark" : ""}`}
                          >
                            {t.status === "APPROVED" ? "Approved" : "Under Review"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              data-tt="Preview on Mobile"
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
                    <option value="SERVICE_IMPLICIT">Service Implicit (OTP / Alerts)</option>
                    <option value="TRANSACTIONAL">Transactional (Banking & Invoices)</option>
                    <option value="SERVICE_EXPLICIT">Service Explicit (Opted Updates)</option>
                    <option value="PROMOTIONAL">Promotional (Marketing / Sales)</option>
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
