import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaPaperPlane, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaWhatsapp, FaEnvelope,
  FaCommentAlt, FaComments, FaPhoneAlt
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialCampaigns = [
  {
    id: "CMP-801",
    name: "Festive Flash Sale Blast",
    channel: "WHATSAPP",
    senderId: "+91 98765 00000",
    audience: "Enterprise Prime Clients (14,250)",
    totalSent: 14250,
    delivered: 13980,
    read: 11420,
    clicked: 3820,
    failed: 270,
    status: "COMPLETED",
    scheduledFor: "2026-09-22 10:00"
  },
  {
    id: "CMP-802",
    name: "September Monthly Statement Notification",
    channel: "EMAIL",
    senderId: "billing@beyondsend.in",
    audience: "All Active B2B Accounts (8,400)",
    totalSent: 8400,
    delivered: 8320,
    read: 5210,
    clicked: 2100,
    failed: 80,
    status: "IN_PROGRESS",
    scheduledFor: "2026-09-23 09:00"
  },
  {
    id: "CMP-803",
    name: "OTP Service Route Stress Test",
    channel: "SMS",
    senderId: "BYDSND",
    audience: "VIP Loyalty Members (6,400)",
    totalSent: 6400,
    delivered: 6385,
    read: 0,
    clicked: 0,
    failed: 15,
    status: "COMPLETED",
    scheduledFor: "2026-09-20 14:00"
  },
  {
    id: "CMP-804",
    name: "Interactive Product Showcase Card",
    channel: "RCS",
    senderId: "BeyondSend Retail",
    audience: "Metro Cities High-Spenders (9,200)",
    totalSent: 9200,
    delivered: 0,
    read: 0,
    clicked: 0,
    failed: 0,
    status: "SCHEDULED",
    scheduledFor: "2026-09-24 11:30"
  }
];

const CampaignsManagement = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    channel: "WHATSAPP",
    senderId: "BYDSND",
    audience: "Enterprise Prime Clients (14,250)",
    scheduledFor: new Date().toISOString().slice(0, 16)
  });

  const getChannelBadge = (ch) => {
    switch (ch) {
      case "WHATSAPP":
        return <span className="badge text-white px-2 py-1" style={{ background: "#25D366" }}><FaWhatsapp className="me-1" /> WhatsApp</span>;
      case "EMAIL":
        return <span className="badge text-white px-2 py-1" style={{ background: "#4f6ef7" }}><FaEnvelope className="me-1" /> Email</span>;
      case "SMS":
        return <span className="badge text-white px-2 py-1" style={{ background: "#0ca678" }}><FaCommentAlt className="me-1" /> SMS</span>;
      case "RCS":
        return <span className="badge text-white px-2 py-1" style={{ background: "#7950f2" }}><FaComments className="me-1" /> RCS</span>;
      case "VOICE":
        return <span className="badge text-white px-2 py-1" style={{ background: "#e8590c" }}><FaPhoneAlt className="me-1" /> Voice</span>;
      default:
        return <Badge color="secondary">{ch}</Badge>;
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const newCmp = {
      ...form,
      id: `CMP-${Math.floor(800 + Math.random() * 200)}`,
      totalSent: 5000,
      delivered: 0,
      read: 0,
      clicked: 0,
      failed: 0,
      status: "SCHEDULED"
    };

    setCampaigns([newCmp, ...campaigns]);
    setModal(false);
    Swal.fire("Campaign Scheduled", "Your multi-channel broadcast has been queued for dispatch.", "success");
  };

  const handleToggleStatus = (cmp) => {
    const nextStatus = cmp.status === "IN_PROGRESS" ? "PAUSED" : cmp.status === "PAUSED" ? "IN_PROGRESS" : cmp.status;
    setCampaigns(
      campaigns.map((c) => (c.id === cmp.id ? { ...c, status: nextStatus } : c))
    );
    Swal.fire("Status Updated", `Campaign is now ${nextStatus}`, "info");
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.senderId.toLowerCase().includes(search.toLowerCase());
    const matchCh = channelFilter === "ALL" || c.channel === channelFilter;
    return matchSearch && matchCh;
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
              <FaPaperPlane size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Bulk Campaigns Dispatcher</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Multi-channel blast orchestrator (WhatsApp, SMS, Email, RCS, Voice) with delivery tracking
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Launch New Campaign
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search campaigns..."
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
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All Channels</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS DLT</option>
                  <option value="EMAIL">Email</option>
                  <option value="RCS">RCS</option>
                </Input>
              </Col>
              <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total: {campaigns.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Completed: {campaigns.filter((c) => c.status === "COMPLETED").length}
                </Badge>
                <Badge color="info" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Running: {campaigns.filter((c) => c.status === "IN_PROGRESS").length}
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Campaign Name & Sender</th>
                  <th>Channel</th>
                  <th>Target Audience</th>
                  <th>Delivery Rate</th>
                  <th>Status</th>
                  <th>Scheduled / Executed</th>
                  <th className="text-center" style={{ width: "110px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((c) => {
                  const delivPct = c.totalSent > 0 ? Math.round((c.delivered / c.totalSent) * 100) : 0;

                  return (
                    <tr key={c.id}>
                      <td className="fw-bold text-primary font-monospace">{c.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{c.name}</div>
                        <small className="text-muted">{c.senderId}</small>
                      </td>
                      <td>{getChannelBadge(c.channel)}</td>
                      <td className="small text-muted">{c.audience}</td>
                      <td style={{ minWidth: "140px" }}>
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>{c.delivered.toLocaleString()} / {c.totalSent.toLocaleString()}</span>
                          <span className="text-success">{delivPct}%</span>
                        </div>
                        <Progress value={delivPct} color={delivPct > 90 ? "success" : "primary"} style={{ height: "6px" }} />
                      </td>
                      <td>
                        <Badge
                          color={
                            c.status === "COMPLETED"
                              ? "success"
                              : c.status === "IN_PROGRESS"
                                ? "primary"
                                : c.status === "SCHEDULED"
                                  ? "info"
                                  : "secondary"
                          }
                          pill
                          className="fw-semibold px-2 py-1"
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="small text-muted">{c.scheduledFor}</td>
                      <td className="text-center">
                        <div className="d-inline-flex gap-1">
                          {(c.status === "IN_PROGRESS" || c.status === "PAUSED") && (
                            <Button
                              size="sm"
                              color="light"
                              className="border p-1 px-2 text-warning"
                              onClick={() => handleToggleStatus(c)}
                              title={c.status === "IN_PROGRESS" ? "Pause" : "Resume"}
                            >
                              {c.status === "IN_PROGRESS" ? <FaPause size={10} /> : <FaPlay size={10} />}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-2 text-primary"
                            title="Analytics Breakdown"
                            onClick={() =>
                              Swal.fire({
                                title: c.name,
                                html: `
                                  <div style="text-align:left;font-size:13px;line-height:1.8;">
                                    <b>Total Sent:</b> ${c.totalSent.toLocaleString()}<br/>
                                    <b>Delivered:</b> ${c.delivered.toLocaleString()}<br/>
                                    <b>Read:</b> ${c.read.toLocaleString()}<br/>
                                    <b>Clicked:</b> ${c.clicked.toLocaleString()}<br/>
                                    <b>Failed:</b> ${c.failed.toLocaleString()}
                                  </div>
                                `,
                                icon: "info"
                              })
                            }
                          >
                            <FaChartBar size={11} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE CAMPAIGN WIZARD MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Launch Multi-Channel Campaign
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Campaign Name *</Label>
                  <Input
                    placeholder="e.g. October Festival Weekend Blast"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Dispatch Channel *</Label>
                  <Input
                    type="select"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    <option value="WHATSAPP">WhatsApp Official WABA</option>
                    <option value="SMS">SMS DLT Route</option>
                    <option value="EMAIL">High-Volume Email</option>
                    <option value="RCS">Google RCS Business</option>
                    <option value="VOICE">Outbound Voice Broadcast</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Target Contact Audience *</Label>
                  <Input
                    type="select"
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                  >
                    <option value="Enterprise Prime Clients (14,250)">Enterprise Prime Clients (14,250)</option>
                    <option value="E-Commerce Festival Leads Q3 (48,900)">E-Commerce Festival Leads Q3 (48,900)</option>
                    <option value="WhatsApp VIP Loyalty Members (6,400)">WhatsApp VIP Loyalty Members (6,400)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Schedule Timing</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
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
              🚀 Schedule & Queue Campaign
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignsManagement;
