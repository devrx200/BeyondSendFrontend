import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaEnvelope, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCopy, FaEye, FaPaperPlane, FaCode, FaCheckCircle,
  FaClock, FaTimesCircle
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialTemplates = [
  {
    id: "ET-1001",
    name: "Welcome Onboarding Sequence",
    subject: "Welcome to BeyondSend — Let's scale your communications 🚀",
    category: "Marketing",
    status: "ACTIVE",
    updatedAt: "2026-09-21 14:32",
    openRate: "48.2%",
    htmlContent: `<h2>Welcome {{name}}!</h2><p>Thank you for choosing BeyondSend. Your account is ready for high-throughput telecom dispatching.</p><p><a href="{{login_url}}" style="display:inline-block;padding:10px 20px;background:#4f6ef7;color:#fff;border-radius:6px;text-decoration:none;">Go To Dashboard</a></p>`
  },
  {
    id: "ET-1002",
    name: "Monthly Billing Statement",
    subject: "Your BeyondSend invoice for {{month}} {{year}} is ready",
    category: "Transactional",
    status: "ACTIVE",
    updatedAt: "2026-09-20 11:15",
    openRate: "64.7%",
    htmlContent: `<h2>Hi {{name}},</h2><p>Your monthly statement for {{month}} has been generated. Amount due: {{amount}}.</p>`
  },
  {
    id: "ET-1003",
    name: "High Volume Telecom Alert",
    subject: "Alert: Daily SMS credits balance below 10%",
    category: "Alerts",
    status: "ACTIVE",
    updatedAt: "2026-09-18 09:40",
    openRate: "72.1%",
    htmlContent: `<h3>Urgent: Low Credit Threshold</h3><p>Your account {{account_id}} has only {{credits_left}} remaining.</p>`
  },
  {
    id: "ET-1004",
    name: "Seasonal Festive Promo Offer",
    subject: "Special 20% cashback on WhatsApp & RCS credits 🎁",
    category: "Promotional",
    status: "DRAFT",
    updatedAt: "2026-09-15 16:20",
    openRate: "—",
    htmlContent: `<h2>Exclusive Offer!</h2><p>Top up your messaging balance today and receive instant bonus routing.</p>`
  }
];

const EmailTemplates = () => {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    subject: "",
    category: "Marketing",
    status: "ACTIVE",
    htmlContent: ""
  });

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template.id);
      setForm({ ...template });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        subject: "",
        category: "Marketing",
        status: "ACTIVE",
        htmlContent: "<h2>Hello {{name}},</h2>\n<p>Write your email body here...</p>"
      });
    }
    setModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.subject) {
      Swal.fire("Required", "Please fill in Template Name and Subject line.", "warning");
      return;
    }

    if (editingId) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? { ...t, ...form, updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ") }
            : t
        )
      );
      Swal.fire("Saved", "Email template updated successfully.", "success");
    } else {
      const newTemplate = {
        ...form,
        id: `ET-${Math.floor(1000 + Math.random() * 9000)}`,
        openRate: "0.0%",
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
      };
      setTemplates([newTemplate, ...templates]);
      Swal.fire("Created", "New email template saved successfully.", "success");
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Template?",
      text: "This action cannot be undone.",
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

  const handleClone = (tpl) => {
    const cloned = {
      ...tpl,
      id: `ET-${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${tpl.name} (Copy)`,
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    };
    setTemplates([cloned, ...templates]);
    Swal.fire("Cloned", "Template duplicate created.", "success");
  };

  const handleTestSend = (tpl) => {
    Swal.fire({
      title: "Send Test Email",
      input: "email",
      inputLabel: "Recipient Email Address",
      inputPlaceholder: "you@example.com",
      showCancelButton: true,
      confirmButtonText: "Send Test Dispatch",
      confirmButtonColor: "#4f6ef7"
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        Swal.fire("Dispatched!", `Test email sent to ${res.value}`, "success");
      }
    });
  };

  const filtered = templates.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "ALL" || t.category === filterCategory;
    return matchSearch && matchCat;
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
              <FaEnvelope size={22} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Email Templates</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Responsive HTML email templates with dynamic merge tags and tracking
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create Email Template
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
                    placeholder="Search templates by name, subject, ID..."
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
                  Active: {templates.filter((t) => t.status === "ACTIVE").length}
                </Badge>
                <Badge color="secondary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Avg Open Rate: 61.6%
                </Badge>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "100px" }}>ID</th>
                  <th>Template Name & Subject</th>
                  <th>Category</th>
                  <th>Open Rate</th>
                  <th>Status</th>
                  <th>Last Modified</th>
                  <th className="text-center" style={{ width: "160px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <FaEnvelope size={32} className="opacity-40 mb-2 d-block mx-auto" />
                      No email templates found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id}>
                      <td className="fw-bold text-primary font-monospace">{t.id}</td>
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
                          {t.category}
                        </span>
                      </td>
                      <td className="fw-semibold text-dark">{t.openRate}</td>
                      <td>
                        <Badge
                          color={t.status === "ACTIVE" ? "success" : "secondary"}
                          pill
                          className="fw-semibold px-2 py-1"
                        >
                          {t.status === "ACTIVE" ? "Active" : "Draft"}
                        </Badge>
                      </td>
                      <td className="text-muted small">{t.updatedAt}</td>
                      <td className="text-center">
                        <div className="d-inline-flex gap-1">
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-dark"
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
                            color="info"
                            className="p-1 px-2 text-white"
                            title="Send Test Dispatch"
                            onClick={() => handleTestSend(t)}
                          >
                            <FaPaperPlane size={12} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-primary"
                            title="Duplicate Template"
                            onClick={() => handleClone(t)}
                          >
                            <FaCopy size={12} />
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
              <strong>From:</strong> BeyondSend Cloud &lt;no-reply@beyondsend.in&gt;
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
