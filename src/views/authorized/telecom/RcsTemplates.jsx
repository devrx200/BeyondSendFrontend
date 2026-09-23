import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaComments, FaPlus, FaSearch, FaEdit, FaTrash,
  FaMobileAlt, FaImage, FaLink, FaPhone, FaReply, FaCheckCircle
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialRcsTemplates = [
  {
    id: "RCS-301",
    name: "Product Showcase Card",
    brand: "BeyondSend Retail",
    cardType: "STANDALONE_RICH_CARD",
    title: "Introducing Cloud Telecom 2.0 🚀",
    description: "Experience ultra-fast SMS, WhatsApp, and Voice dispatch with 99.99% deliverability SLA.",
    mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
    buttons: [
      { type: "URL", label: "Explore Platform", value: "https://beyondsend.in" },
      { type: "DIAL", label: "Call Telecom Support", value: "+919876543210" }
    ],
    status: "VERIFIED",
    updatedAt: "2026-09-21 16:40"
  },
  {
    id: "RCS-302",
    name: "Interactive Appointment Confirm",
    brand: "BeyondSend Support",
    cardType: "QUICK_REPLY_CARD",
    title: "Appointment Confirmation Required",
    description: "Your technical onboarding call is scheduled for tomorrow at 3:00 PM IST.",
    mediaUrl: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=80",
    buttons: [
      { type: "QUICK_REPLY", label: "✅ Confirm Booking", value: "CONFIRM_APPT" },
      { type: "QUICK_REPLY", label: "🔄 Reschedule", value: "RESCHEDULE_APPT" }
    ],
    status: "VERIFIED",
    updatedAt: "2026-09-19 12:15"
  },
  {
    id: "RCS-303",
    name: "E-Commerce Carousel Offer",
    brand: "BeyondSend Deals",
    cardType: "CAROUSEL",
    title: "Festival Telecom Credit Bundle",
    description: "Save big on enterprise high-throughput routes today.",
    mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    buttons: [
      { type: "URL", label: "Claim Offer", value: "https://beyondsend.in/pricing" }
    ],
    status: "SUBMITTED",
    updatedAt: "2026-09-23 10:00"
  }
];

const RcsTemplates = () => {
  const [templates, setTemplates] = useState(initialRcsTemplates);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    brand: "BeyondSend Official",
    cardType: "STANDALONE_RICH_CARD",
    title: "",
    description: "",
    mediaUrl: "",
    buttons: [
      { type: "URL", label: "Visit Website", value: "https://beyondsend.in" }
    ]
  });

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingId(template.id);
      setForm({ ...template });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        brand: "BeyondSend Official",
        cardType: "STANDALONE_RICH_CARD",
        title: "",
        description: "",
        mediaUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80",
        buttons: [{ type: "URL", label: "Explore Platform", value: "https://beyondsend.in" }]
      });
    }
    setModal(true);
  };

  const handleAddButton = () => {
    if (form.buttons.length >= 3) {
      Swal.fire("Limit Reached", "RCS allows maximum 3 action chips per card.", "info");
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

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.title || !form.description) {
      Swal.fire("Required", "Please fill in Name, Title, and Description.", "warning");
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
      Swal.fire("Saved", "RCS template updated.", "success");
    } else {
      const newTpl = {
        ...form,
        id: `RCS-${Math.floor(300 + Math.random() * 700)}`,
        status: "SUBMITTED",
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
      };
      setTemplates([newTpl, ...templates]);
      Swal.fire("Submitted", "RCS template submitted to Google Jibe carrier network.", "success");
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete RCS Template?",
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

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.brand.toLowerCase().includes(search.toLowerCase())
  );

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
              <FaComments size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">RCS Templates (Rich Communication Services)</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Next-gen interactive messaging with high-res media, carousels & instant action buttons
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create RCS Template
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          {/* STATS STRIP */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search RCS templates by title, brand, ID..."
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
                  Carrier Verified: {templates.filter((t) => t.status === "VERIFIED").length}
                </Badge>
                <Badge color="info" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Google Jibe Connected
                </Badge>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Template Name & Brand</th>
                  <th>Layout Card Type</th>
                  <th>Action Buttons</th>
                  <th>Status</th>
                  <th>Last Modified</th>
                  <th className="text-center" style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-bold text-primary font-monospace">{t.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{t.name}</div>
                      <small className="text-muted">{t.brand} · {t.title}</small>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark fw-semibold">
                        {t.cardType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {t.buttons.map((b, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-pill bg-light border text-primary fw-semibold"
                            style={{ fontSize: "10.5px" }}
                          >
                            {b.type === "URL" ? "🔗 " : b.type === "DIAL" ? "📞 " : "💬 "}
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge
                        color={t.status === "VERIFIED" ? "success" : "info"}
                        pill
                        className="fw-semibold px-2 py-1"
                      >
                        {t.status === "VERIFIED" ? "Verified" : "Submitted"}
                      </Badge>
                    </td>
                    <td className="text-muted small">{t.updatedAt}</td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-dark"
                          title="Preview on Android Device"
                          onClick={() => setPreviewTemplate(t)}
                        >
                          <FaMobileAlt size={12} />
                        </Button>
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-success"
                          title="Edit"
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
                ))}
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
                  <Label className="fw-bold small text-dark">Verified Brand Sender</Label>
                  <Input
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Type</Label>
                  <Input
                    type="select"
                    value={form.cardType}
                    onChange={(e) => setForm({ ...form, cardType: e.target.value })}
                  >
                    <option value="STANDALONE_RICH_CARD">Standalone Rich Card</option>
                    <option value="CAROUSEL">Multi-Card Carousel</option>
                    <option value="QUICK_REPLY_CARD">Quick Reply Action Card</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Media Image URL</Label>
                  <Input
                    placeholder="https://domain.com/banner.jpg"
                    value={form.mediaUrl}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Card Title *</Label>
                  <Input
                    placeholder="Bold primary headline"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                        placeholder="URL / Phone / Reply Payload"
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
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Save RCS Template
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── GOOGLE MESSAGES RCS MOCKUP PREVIEW ── */}
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
                  {previewTemplate?.brand} <FaCheckCircle size={10} className="text-primary ms-0.5" />
                </small>
                <span style={{ fontSize: "9.5px", color: "#64748b" }}>RCS Business Messaging</span>
              </div>
            </div>

            {/* RCS CARD */}
            <div className="rounded-3 border overflow-hidden shadow-xs bg-light">
              {previewTemplate?.mediaUrl && (
                <img
                  src={previewTemplate.mediaUrl}
                  alt="RCS Banner"
                  style={{ width: "100%", height: "120px", objectFit: "cover" }}
                />
              )}
              <div className="p-2.5">
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "13px" }}>
                  {previewTemplate?.title}
                </h6>
                <p className="text-muted mb-2" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                  {previewTemplate?.description}
                </p>
                <div className="d-flex flex-column gap-1.5 pt-1 border-top">
                  {previewTemplate?.buttons?.map((b, i) => (
                    <div
                      key={i}
                      className="text-center py-1 rounded bg-white border text-primary fw-bold cursor-pointer"
                      style={{ fontSize: "11px" }}
                    >
                      {b.label}
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
