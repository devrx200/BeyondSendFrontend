import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaPhoneAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaPlay, FaServer
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

const VoiceTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    voiceType: "TTS",
    voiceGender: "FEMALE",
    language: "en-IN",
    provider: "MOBIGLITZ_VOICE",
    providerTemplateId: "",
    pulseDuration: 30,
    ttsText: "",
    audioFileUrl: "",
    description: "Press 1 to confirm"
  });

  const [categories, setCategories] = useState([]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/voice/templates/list");
      const data = res?.data?.data || [];
      const provs = res?.data?.availableProviders || [];
      const cats = res?.data?.availableCategories || [];

      setTemplates(Array.isArray(data) ? data : []);
      if (provs.length > 0) setProviders(provs);
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error("Fetch voice templates error:", err);
      toast.error(err?.response?.data?.message || "Failed to load voice templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setForm({
        name: t.name || "",
        voiceType: t.voiceType || "TTS",
        voiceGender: t.voiceGender || "FEMALE",
        language: t.language || "en-IN",
        provider: t.provider || "MOBIGLITZ_VOICE",
        providerTemplateId: t.providerTemplateId || "",
        pulseDuration: t.pulseDuration || 30,
        ttsText: t.ttsText || t.voiceTtsText || "",
        audioFileUrl: t.audioFileUrl || "",
        description: t.description || ""
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        voiceType: "TTS",
        voiceGender: "FEMALE",
        language: "en-IN",
        provider: providers[0]?.code || "MOBIGLITZ_VOICE",
        providerTemplateId: "",
        pulseDuration: 30,
        ttsText: "Hello {{name}}, this is an automated voice call from BeyondSend Telecom.",
        audioFileUrl: "",
        description: "Press 1 to talk to an agent"
      });
    }
    setModal(true);
  };

  const handleTestAudio = (text) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/\{\{[^}]+\}\}/g, "John"));
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      toast.info("Playing synthesized voice preview in browser audio.");
    } else {
      toast.info("Audio synthesis simulated.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Template Name is required.");
      return;
    }

    try {
      setBtnLoading(true);
      const payload = {
        ...form,
        channelCategoryCode: form.channelCategoryCode || (form.category ? `VOICE_${form.category}` : "VOICE_30S"),
        voiceTtsText: form.ttsText,
        status: "APPROVED"
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/voice/templates/update/${editingId}`, payload);
        toast.success(res?.data?.message || "Voice template updated successfully");
      } else {
        const res = await apiClient.post("/voice/templates/create", payload);
        toast.success(res?.data?.message || "Voice IVR template created");
      }
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save voice template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Voice Template?",
      `Are you sure you want to delete '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/voice/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filtered = templates.filter(
    (t) => {
      const matchSearch =
        (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (t.ttsText || t.voiceTtsText || "").toLowerCase().includes(search.toLowerCase()) ||
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
              <FaPhoneAlt size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Voice & OBD IVR Templates (Multi-Carrier Gateways)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Text-To-Speech (TTS) & pre-recorded outbound interactive voice broadcast campaigns with multi-provider routing
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Add Voice Template
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
                    placeholder="Search voice templates, provider..."
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
                  <option value="ALL">All Voice Providers ({providers.length})</option>
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
                  IVR Ready: {templates.filter((t) => t.status === "APPROVED").length}
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
                    <th>Template Name & Speech Script</th>
                    <th>Provider</th>
                    <th>Type</th>
                    <th>Voice / Gender</th>
                    <th>Pulse (Sec)</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No voice templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "300px" }}>
                            {t.ttsText || t.voiceTtsText || t.description}
                          </small>
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
                            renderProviderBadge(t.provider || "MOBIGLITZ_VOICE", t.status)
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light border text-dark fw-semibold">
                            {t.voiceType === "TTS" ? "Text-To-Speech" : "Audio Upload"}
                          </span>
                        </td>
                        <td>
                          <span className="small text-dark fw-semibold">
                            {t.voiceGender ? `${t.voiceGender} (${t.language || "en-IN"})` : "Studio Master"}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light border text-primary">
                            {t.pulseDuration || 30}s ({t.credits || 1} credit)
                          </span>
                        </td>
                        <td>
                          {renderStatusBadge(t.status)}
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="info"
                              className="adm-icon-btn is-info"
                              title="Play Audio Preview"
                              onClick={() => handleTestAudio(t.ttsText || t.voiceTtsText || t.name)}
                            >
                              <FaPlay size={10} />
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
          {editingId ? "Edit Voice IVR Template" : "New Voice Broadcast & IVR Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. Appointment Reminder OBD"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Voice Gateway Provider</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
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

              <Col md={4}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Synthesis Type</Label>
                  <Input
                    type="select"
                    value={form.voiceType}
                    onChange={(e) => setForm({ ...form, voiceType: e.target.value })}
                  >
                    <option value="TTS">Text-To-Speech Engine</option>
                    <option value="AUDIO_FILE">Pre-Recorded MP3 / WAV</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Voice Persona</Label>
                  <Input
                    type="select"
                    value={form.voiceGender}
                    onChange={(e) => setForm({ ...form, voiceGender: e.target.value })}
                  >
                    <option value="FEMALE">Female (Natural Indian Accent)</option>
                    <option value="MALE">Male (Natural Indian Accent)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Pulse Duration (Sec)</Label>
                  <Input
                    type="number"
                    min="15"
                    max="180"
                    step="15"
                    value={form.pulseDuration}
                    onChange={(e) => setForm({ ...form, pulseDuration: Number(e.target.value) })}
                  />
                </FormGroup>
              </Col>

              {form.voiceType === "TTS" ? (
                <Col md={12}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label className="fw-bold small text-dark mb-0">Text-To-Speech Script *</Label>
                    <Button
                      size="sm"
                      color="info"
                      outline
                      className="py-0 px-2 fw-semibold"
                      onClick={() => handleTestAudio(form.ttsText)}
                      disabled={!form.ttsText}
                    >
                      <FaPlay size={10} className="me-1" /> Test Synthesized Voice
                    </Button>
                  </div>
                  <Input
                    type="textarea"
                    rows={4}
                    placeholder="Enter speech text to be spoken by telecom IVR. Use {{variable}} for custom placeholders..."
                    value={form.ttsText}
                    onChange={(e) => setForm({ ...form, ttsText: e.target.value })}
                    required
                  />
                </Col>
              ) : (
                <Col md={12}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Pre-Recorded Audio File URL (MP3/WAV) *</Label>
                    <Input
                      placeholder="https://... (Public HTTPS audio URL)"
                      value={form.audioFileUrl}
                      onChange={(e) => setForm({ ...form, audioFileUrl: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
              )}

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">DTMF Interactive Keypress Instruction</Label>
                  <Input
                    placeholder="e.g. Press 1 to confirm appointment, Press 2 to reschedule"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              {btnLoading ? <Spinner size="sm" /> : "Save Voice Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default VoiceTemplates;
