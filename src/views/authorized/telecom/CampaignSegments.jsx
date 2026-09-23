import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaLayerGroup, FaPlus, FaSearch, FaFilter, FaTrash,
  FaCheckCircle, FaUserCheck, FaBolt
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialSegments = [
  {
    id: "SEG-01",
    name: "Highly Engaged WhatsApp Users",
    criteria: "WhatsApp Read Rate > 60% in last 30 days",
    audienceCount: 18450,
    status: "ACTIVE",
    updatedAt: "2026-09-22"
  },
  {
    id: "SEG-02",
    name: "Metro Cities High-Spenders",
    criteria: "Location in (Mumbai, Delhi, Bengaluru) AND Spends > 50,000",
    audienceCount: 9200,
    status: "ACTIVE",
    updatedAt: "2026-09-21"
  },
  {
    id: "SEG-03",
    name: "Dormant SMS Users (Needs Winback)",
    criteria: "No SMS link clicks in last 60 days",
    audienceCount: 34100,
    status: "ACTIVE",
    updatedAt: "2026-09-19"
  }
];

const CampaignSegments = () => {
  const [segments, setSegments] = useState(initialSegments);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    channel: "WHATSAPP",
    condition: "ENGAGEMENT",
    threshold: "READ_RATE_HIGH"
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const newSeg = {
      id: `SEG-0${segments.length + 1}`,
      name: form.name,
      criteria: `${form.channel} · ${form.condition} (${form.threshold})`,
      audienceCount: Math.floor(2500 + Math.random() * 15000),
      status: "ACTIVE",
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setSegments([newSeg, ...segments]);
    setModal(false);
    setForm({ name: "", channel: "WHATSAPP", condition: "ENGAGEMENT", threshold: "READ_RATE_HIGH" });
    Swal.fire("Created", "Dynamic segment calculated.", "success");
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Segment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Delete"
    }).then((res) => {
      if (res.isConfirmed) {
        setSegments(segments.filter((s) => s.id !== id));
        Swal.fire("Deleted", "Segment removed.", "success");
      }
    });
  };

  const filtered = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.criteria.toLowerCase().includes(search.toLowerCase())
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
              <FaLayerGroup size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Audience Segments</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Behavioral and demographic rule-based audience filtering for targeted campaigns
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Create Segment Rule
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search segments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Active Segments: {segments.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Real-time Query Sync
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "90px" }}>ID</th>
                  <th>Segment Name</th>
                  <th>Filter Criteria / Rule Expression</th>
                  <th>Est. Match Count</th>
                  <th>Status</th>
                  <th>Last Evaluated</th>
                  <th className="text-center" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-bold text-primary font-monospace">{s.id}</td>
                    <td className="fw-bold text-dark">{s.name}</td>
                    <td>
                      <code className="text-dark bg-light px-2 py-0.5 rounded border">
                        {s.criteria}
                      </code>
                    </td>
                    <td>
                      <span className="badge bg-light border text-primary fw-bold">
                        <FaUserCheck size={11} className="me-1" />
                        {s.audienceCount.toLocaleString()} Subscribers
                      </span>
                    </td>
                    <td>
                      <Badge color="success" pill className="px-2 py-1">
                        Active
                      </Badge>
                    </td>
                    <td className="text-muted small">{s.updatedAt}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border p-1 px-2 text-danger"
                        title="Delete"
                        onClick={() => handleDelete(s.id)}
                      >
                        <FaTrash size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE SEGMENT MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Build Audience Segment
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Segment Title *</Label>
              <Input
                placeholder="e.g. High Value Active SMS Users"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Primary Channel</Label>
              <Input
                type="select"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS DLT</option>
                <option value="EMAIL">Email</option>
                <option value="RCS">RCS</option>
                <option value="VOICE">Voice Call</option>
              </Input>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Behavior Rule</Label>
              <Input
                type="select"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
              >
                <option value="READ_RATE_HIGH">Delivered and Read within 1 hour</option>
                <option value="CLICK_PAST_30D">Clicked promotional links in last 30 days</option>
                <option value="NO_ACTIVITY_60D">Inactive for over 60 days (Winback)</option>
              </Input>
            </FormGroup>
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
              Compile Segment
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignSegments;
