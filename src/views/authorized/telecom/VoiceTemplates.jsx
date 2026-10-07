import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaPhoneAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaPlay
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const VoiceTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    voiceType: "TTS",
    voiceGender: "FEMALE",
    language: "en-IN",
    voiceTtsText: "",
    description: "Press 1 to confirm"
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/templates/list?channel=VOICE");
      const data = res?.data?.data || res?.data || [];

      setTemplates(Array.isArray(data) ? data : []);
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
        voiceTtsText: t.voiceTtsText || "",
        description: t.description || ""
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        voiceType: "TTS",
        voiceGender: "FEMALE",
        language: "en-IN",
        voiceTtsText: "Hello {{name}}, this is an automated voice call from BeyondSend Telecom.",
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
      if (editingId) {
        const res = await apiClient.put(`/templates/update/${editingId}`, {
          ...form,
          channel: "VOICE"
        });
        toast.success(res?.data?.message || "Voice template updated successfully");
      } else {
        const res = await apiClient.post("/templates/create", {
          ...form,
          channel: "VOICE",
          status: "APPROVED"
        });
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
      (t.voiceTtsText || "").toLowerCase().includes(search.toLowerCase())
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
              <h4 className="adm-page-title mb-0 text-white">Voice & IVR Broadcast Templates</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Outbound voice broadcasting (OBD), Text-to-Speech synthesis & DTMF keypress menus
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create Voice Template
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
                    placeholder="Search voice templates..."
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
                  TTS Engine: Neural High-Def
                </Badge>
                <Badge color="info" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  IVR Enabled
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
                    <th>Template Name & Speech Script</th>
                    <th>Type</th>
                    <th>Voice / Gender</th>
                    <th>DTMF Keypress Action</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No voice templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "340px" }}>
                            {t.voiceTtsText || t.description}
                          </small>
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
                          <span className="small text-muted">{t.description || "None"}</span>
                        </td>
                        <td>
                          <Badge color="success" pill className="px-2 py-1">
                            {t.status || "APPROVED"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="info"
                              className="adm-icon-btn is-info"
                              data-tt="Play Audio Preview"
                              onClick={() => handleTestAudio(t.voiceTtsText || t.name)}
                            >
                              <FaPlay size={10} />
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
          {editingId ? "Edit Voice Broadcast Template" : "New Voice OBD / IVR Template"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name *</Label>
                  <Input
                    placeholder="e.g. Overdue Payment IVR Broadcast"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Voice Type</Label>
                  <Input
                    type="select"
                    value={form.voiceType}
                    onChange={(e) => setForm({ ...form, voiceType: e.target.value })}
                  >
                    <option value="TTS">Text-To-Speech (AI Synthesis)</option>
                    <option value="AUDIO_FILE">Upload Pre-recorded Audio</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Voice Gender & Tone</Label>
                  <Input
                    type="select"
                    value={form.voiceGender}
                    onChange={(e) => setForm({ ...form, voiceGender: e.target.value })}
                  >
                    <option value="FEMALE">Female (Natural Professional)</option>
                    <option value="MALE">Male (Authoritative Clear)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Language Accent</Label>
                  <Input
                    type="select"
                    value={form.language}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                  >
                    <option value="en-IN">Indian English (en-IN)</option>
                    <option value="hi-IN">Hindi (hi-IN)</option>
                    <option value="en-US">US English (en-US)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Voice Script Text *</Label>
                  <Input
                    type="textarea"
                    rows={4}
                    placeholder="Type speech script here. Use {{name}} for dynamic tags..."
                    value={form.voiceTtsText}
                    onChange={(e) => setForm({ ...form, voiceTtsText: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">DTMF Keypress Capture Menu</Label>
                  <Input
                    placeholder="e.g. Press 1 for Sales, Press 2 for Accounts"
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
            <Button
              color="primary"
              type="submit"
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Save Voice Template"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default VoiceTemplates;
