import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaCommentAlt, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCopy, FaMobileAlt, FaPaperPlane, FaShieldAlt
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialSmsTemplates = [
  {
    id: "SMS-201",
    name: "OTP Verification Login",
    senderId: "BYDSND",
    dltTemplateId: "1407161234567890123",
    type: "SERVICE_IMPLICIT",
    body: "Your BeyondSend verification OTP is {#var#}. Valid for 10 minutes. Do not share this OTP with anyone.",
    status: "APPROVED",
    credits: 1,
    charCount: 96,
    updatedAt: "2026-09-22 10:14"
  },
  {
    id: "SMS-202",
    name: "Transaction Success Alert",
    senderId: "BYDSND",
    dltTemplateId: "1407161234567890124",
    type: "TRANSACTIONAL",
    body: "Dear {#var#}, your payment of INR {#var#} for Invoice {#var#} has been successfully processed. Thank you!",
    status: "APPROVED",
    credits: 1,
    charCount: 104,
    updatedAt: "2026-09-20 16:30"
  },
  {
    id: "SMS-203",
    name: "Weekend Mega Discount Offer",
    senderId: "BYDPRM",
    dltTemplateId: "1407161234567890125",
    type: "PROMOTIONAL",
    body: "Flash Sale Alert! Get 30% bonus credits on all SMS & WhatsApp packages this weekend only. Use code FLASH30 on beyondsend.in.",
    status: "APPROVED",
    credits: 1,
    charCount: 133,
    updatedAt: "2026-09-18 11:20"
  },
  {
    id: "SMS-204",
    name: "Account Security Password Reset",
    senderId: "BYDSND",
    dltTemplateId: "1407161234567890126",
    type: "SERVICE_EXPLICIT",
    body: "Password change requested for your BeyondSend console. Click link to reset: {#var#}. If not requested, contact support.",
    status: "PENDING_APPROVAL",
    credits: 1,
    charCount: 120,
    updatedAt: "2026-09-23 09:15"
  }
];

const SmsTemplates = () => {
  const [templates, setTemplates] = useState(initialSmsTemplates);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    senderId: "BYDSND",
    dltTemplateId: "",
    type: "SERVICE_IMPLICIT",
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

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template.id);
      setForm({ ...template });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        senderId: "BYDSND",
        dltTemplateId: "",
        type: "SERVICE_IMPLICIT",
        body: "Hello {#var#}, your requested update is ready. Visit {#var#}",
        status: "APPROVED"
      });
    }
    setModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.body || !form.senderId) {
      Swal.fire("Required", "Please fill in Template Name, Sender ID, and Message Body.", "warning");
      return;
    }

    const calc = calculateSmsCredits(form.body);

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...form,
                charCount: calc.chars,
                credits: calc.credits,
                updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
              }
            : t
        )
      );
      Swal.fire("Updated", "SMS template saved successfully.", "success");
    } else {
      const newTpl = {
        ...form,
        id: `SMS-${Math.floor(200 + Math.random() * 800)}`,
        charCount: calc.chars,
        credits: calc.credits,
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
      };
      setTemplates([newTpl, ...templates]);
      Swal.fire("Created", "New SMS template submitted for DLT sync.", "success");
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete SMS Template?",
      text: "This DLT registered template mapping will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Delete"
    }).then((res) => {
      if (res.isConfirmed) {
        setTemplates(templates.filter((t) => t.id !== id));
        Swal.fire("Deleted", "Template removed.", "success");
      }
    });
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.senderId.toLowerCase().includes(search.toLowerCase()) ||
      t.body.toLowerCase().includes(search.toLowerCase()) ||
      t.dltTemplateId.includes(search);
    const matchType = filterType === "ALL" || t.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader
          className="border-0 py-3.5 px-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaCommentAlt size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">SMS Templates (DLT Aligned)</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                TRAI DLT compliant SMS templates with automated character & credit calculation
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Add SMS Template
          </Button>
        </CardHeader>

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
                  <option value="ALL">All SMS Types</option>
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
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "90px" }}>ID</th>
                  <th>Header (Sender ID)</th>
                  <th>Template Name & Content</th>
                  <th>SMS Type</th>
                  <th>DLT Content ID</th>
                  <th>Credit Cost</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <FaCommentAlt size={32} className="opacity-40 mb-2 d-block mx-auto" />
                      No SMS templates found matching query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-bold text-primary font-monospace">{t.id}</td>
                      <td>
                        <span className="badge bg-dark font-monospace px-2.5 py-1" style={{ letterSpacing: "1px" }}>
                          {t.senderId}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{t.name}</div>
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: "320px" }}>
                          {t.body}
                        </small>
                      </td>
                      <td>
                        <span
                          className="px-2 py-0.5 rounded-pill fw-semibold"
                          style={{
                            fontSize: "11px",
                            background:
                              t.type === "TRANSACTIONAL"
                                ? "#e6fcf5"
                                : t.type === "SERVICE_IMPLICIT"
                                  ? "#edf2ff"
                                  : "#fff4e6",
                            color:
                              t.type === "TRANSACTIONAL"
                                ? "#0ca678"
                                : t.type === "SERVICE_IMPLICIT"
                                  ? "#3b5bdb"
                                  : "#e8590c"
                          }}
                        >
                          {t.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="font-monospace small text-muted">
                        {t.dltTemplateId || <span className="fst-italic text-warning">DLT Pending</span>}
                      </td>
                      <td>
                        <span className="badge bg-light border text-dark fw-bold">
                          {t.credits} Credit ({t.charCount} chars)
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
                        <div className="d-inline-flex gap-1">
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-dark"
                            title="Preview on Mobile"
                            onClick={() => setPreviewTemplate(t)}
                          >
                            <FaMobileAlt size={12} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-success"
                            title="Edit Template"
                            onClick={() => handleOpenModal(t)}
                          >
                            <FaEdit size={12} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-danger"
                            title="Delete"
                            onClick={() => handleDelete(t.id)}
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
        </CardBody>
      </Card>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
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
                  <Label className="fw-bold small text-dark">Sender ID (6-Alpha Header) *</Label>
                  <Input
                    placeholder="e.g. BYDSND"
                    value={form.senderId}
                    maxLength={6}
                    onChange={(e) => setForm({ ...form, senderId: e.target.value.toUpperCase() })}
                    className="font-monospace fw-bold text-uppercase"
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">SMS Category *</Label>
                  <Input
                    type="select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
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
            <Button
              color="primary"
              type="submit"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Save Template
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── MOBILE PREVIEW MODAL ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-light">
          SMS Preview: {previewTemplate?.senderId}
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="p-3 rounded-4 bg-white text-start shadow-sm mx-auto position-relative"
            style={{ maxWidth: "260px", minHeight: "360px", border: "8px solid #0f172a" }}
          >
            <div className="text-center pb-2 mb-2 border-bottom">
              <small className="fw-bold text-muted font-monospace">{previewTemplate?.senderId}</small>
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
