import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaPhoneAlt, FaPlus, FaSearch, FaEdit, FaTrash,
  FaPlay, FaVolumeUp, FaMicrophone, FaHeadset
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialVoiceTemplates = [
  {
    id: "VT-501",
    name: "Payment Due Reminder Call",
    type: "TTS",
    voiceGender: "FEMALE",
    language: "en-IN",
    textScript: "Hello {{name}}, this is an automated reminder from BeyondSend regarding your telecom invoice due today.",
    durationSec: 18,
    dtmfOption: "Press 1 to pay now, Press 2 to talk to support",
    status: "ACTIVE",
    updatedAt: "2026-09-22 11:30"
  },
  {
    id: "VT-502",
    name: "Customer Satisfaction Survey IVR",
    type: "PRE_RECORDED",
    audioFile: "csat_survey_v2.wav",
    durationSec: 25,
    dtmfOption: "Press 1 to 5 to rate your recent support experience",
    status: "ACTIVE",
    updatedAt: "2026-09-21 09:15"
  },
  {
    id: "VT-503",
    name: "Emergency Service Disruption Alert",
    type: "TTS",
    voiceGender: "MALE",
    language: "hi-IN",
    textScript: "नमस्ते {{name}}, आपके क्षेत्र में टेलीकॉम रखरखाव कार्य के कारण सेवा में कुछ समय के लिए रुकावट हो सकती है।",
    durationSec: 22,
    dtmfOption: "Press 9 to repeat message",
    status: "ACTIVE",
    updatedAt: "2026-09-19 16:45"
  }
];

const VoiceTemplates = () => {
  const [templates, setTemplates] = useState(initialVoiceTemplates);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    type: "TTS",
    voiceGender: "FEMALE",
    language: "en-IN",
    textScript: "",
    durationSec: 15,
    dtmfOption: "Press 1 to confirm"
  });

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingId(t.id);
      setForm({ ...t });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        type: "TTS",
        voiceGender: "FEMALE",
        language: "en-IN",
        textScript: "Hello {{name}}, this is an automated voice message from BeyondSend.",
        durationSec: 15,
        dtmfOption: "Press 1 to connect with an agent"
      });
    }
    setModal(true);
  };

  const handleTestAudio = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/\{\{[^}]+\}\}/g, "John"));
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
      Swal.fire({
        icon: "info",
        title: "Playing TTS Audio",
        text: "Playing synthesized voice preview in browser.",
        timer: 1800,
        showConfirmButton: false
      });
    } else {
      Swal.fire("TTS Audio", "Audio synthesis playback simulated.", "info");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name) {
      Swal.fire("Required", "Template Name is required.", "warning");
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
      Swal.fire("Saved", "Voice template updated.", "success");
    } else {
      const newTpl = {
        ...form,
        id: `VT-${Math.floor(500 + Math.random() * 500)}`,
        status: "ACTIVE",
        updatedAt: new Date().toISOString().slice(0, 16).replace("T", " ")
      };
      setTemplates([newTpl, ...templates]);
      Swal.fire("Created", "Voice IVR template created.", "success");
    }
    setModal(false);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Voice Template?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Delete"
    }).then((res) => {
      if (res.isConfirmed) {
        setTemplates(templates.filter((t) => t.id !== id));
        Swal.fire("Deleted", "Voice template removed.", "success");
      }
    });
  };

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.textScript && t.textScript.toLowerCase().includes(search.toLowerCase())) ||
      t.id.toLowerCase().includes(search.toLowerCase())
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
              <FaPhoneAlt size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Voice & IVR Broadcast Templates</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Outbound voice broadcasting (OBD), Text-to-Speech synthesis & DTMF keypress menus
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => handleOpenModal()}
          >
            <FaPlus size={12} /> Create Voice Template
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

          {/* TABLE */}
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Template Name & Speech Script</th>
                  <th>Type</th>
                  <th>Voice / Gender</th>
                  <th>DTMF Keypress Action</th>
                  <th>Est. Duration</th>
                  <th className="text-center" style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td className="fw-bold text-primary font-monospace">{t.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{t.name}</div>
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: "340px" }}>
                        {t.textScript || t.audioFile}
                      </small>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark fw-semibold">
                        {t.type === "TTS" ? "Text-To-Speech" : "Audio Upload"}
                      </span>
                    </td>
                    <td>
                      <span className="small text-dark fw-semibold">
                        {t.voiceGender ? `${t.voiceGender} (${t.language})` : "Studio Master"}
                      </span>
                    </td>
                    <td>
                      <span className="small text-muted">{t.dtmfOption || "None"}</span>
                    </td>
                    <td>
                      <Badge color="secondary" pill className="px-2 py-1">
                        ~{t.durationSec}s
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          color="info"
                          className="p-1 px-2 text-white"
                          title="Play Preview"
                          onClick={() => handleTestAudio(t.textScript || t.name)}
                        >
                          <FaPlay size={10} />
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
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="TTS">Text-To-Speech (AI Synthesis)</option>
                    <option value="PRE_RECORDED">Upload Pre-recorded Audio</option>
                  </Input>
                </FormGroup>
              </Col>
              {form.type === "TTS" && (
                <>
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
                        placeholder="Type script here. Use {{name}} for dynamic tags..."
                        value={form.textScript}
                        onChange={(e) => setForm({ ...form, textScript: e.target.value })}
                        required
                      />
                    </FormGroup>
                  </Col>
                </>
              )}
              {form.type === "PRE_RECORDED" && (
                <Col md={12}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Upload Audio File (.wav or .mp3)</Label>
                    <Input type="file" accept=".wav,.mp3" />
                  </FormGroup>
                </Col>
              )}
              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">DTMF Keypress Capture Menu</Label>
                  <Input
                    placeholder="e.g. Press 1 for Sales, Press 2 for Accounts"
                    value={form.dtmfOption}
                    onChange={(e) => setForm({ ...form, dtmfOption: e.target.value })}
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
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Save Voice Template
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default VoiceTemplates;
