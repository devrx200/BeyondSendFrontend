import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaPaperPlane, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaWhatsapp, FaEnvelope,
  FaCommentAlt, FaComments, FaPhoneAlt, FaTrash
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const CampaignsManagement = () => {
  const { toasts, toast } = useToast();
  const [searchParams] = useSearchParams();
  const channelParam = searchParams.get("channel");

  const [campaigns, setCampaigns] = useState([]);
  const [lists, setLists] = useState([]);
  const [fromIds, setFromIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState(() => (channelParam ? channelParam.toUpperCase() : "ALL"));
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    channel: channelParam ? channelParam.toUpperCase() : "WHATSAPP",
    senderId: "",
    listId: "",
    audienceName: "All Subscribers",
    totalRecipients: 1000,
    scheduleType: "IMMEDIATE",
    scheduledFor: new Date().toISOString().slice(0, 16),
    messageBody: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (channelParam) {
      const ch = channelParam.toUpperCase();
      if (ch === "WHATSAPP") {
        navigate("/authorized/whatsapp/campaigns", { replace: true });
      } else if (ch === "SMS") {
        navigate("/authorized/sms/campaigns", { replace: true });
      } else if (ch === "EMAIL") {
        navigate("/authorized/email/campaigns", { replace: true });
      } else if (ch === "RCS") {
        navigate("/authorized/rcs/campaigns", { replace: true });
      } else if (ch === "VOICE") {
        navigate("/authorized/voice/campaigns", { replace: true });
      } else {
        setChannelFilter(ch);
      }
    } else {
      setChannelFilter("ALL");
    }
  }, [channelParam, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmpRes, listRes, fromRes] = await Promise.all([
        apiClient.get("/campaigns/list"),
        apiClient.get("/contact-lists/list"),
        apiClient.get("/from-ids/list")
      ]);

      let cmpData = cmpRes?.data?.data || cmpRes?.data || [];
      const listData = listRes?.data?.data || listRes?.data || [];
      const fromData = fromRes?.data?.data || fromRes?.data || [];

      setLists(Array.isArray(listData) ? listData : []);
      setFromIds(Array.isArray(fromData) ? fromData : []);

      setCampaigns(Array.isArray(cmpData) ? cmpData : []);
    } catch (err) {
      console.error("Fetch campaigns error:", err);
      toast.error(err?.response?.data?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenModal = () => {
    const relevantSenders = fromIds.filter((f) => f.channel === form.channel);
    setForm({
      ...form,
      name: "",
      senderId: relevantSenders[0]?.identifier || (form.channel === "SMS" ? "BYDSND" : "notifications@beyondsend.in"),
      audienceName: lists[0]?.name || "All Subscribers",
      listId: lists[0]?._id || "",
      totalRecipients: lists[0]?.totalContacts || 1000
    });
    setModal(true);
  };

  const handleChannelChange = (channel) => {
    const relevantSenders = fromIds.filter((f) => f.channel === channel);
    setForm({
      ...form,
      channel,
      senderId: relevantSenders[0]?.identifier || (channel === "SMS" ? "BYDSND" : "support@beyondsend.in")
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.senderId.trim()) {
      toast.warning("Campaign name and sender identifier are required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/campaigns/create", form);
      toast.success(res?.data?.message || "Campaign queued successfully");
      setModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Campaign dispatch failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleToggleStatus = async (cmp) => {
    try {
      const res = await apiClient.patch(`/campaigns/toggle-status/${cmp._id}`);
      toast.success(res?.data?.message || "Status updated");
      fetchData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Campaign?",
      `Are you sure you want to delete campaign '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/campaigns/delete/${id}`);
      toast.success(res?.data?.message || "Campaign deleted");
      fetchData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.senderId || "").toLowerCase().includes(search.toLowerCase());
    const matchCh = channelFilter === "ALL" || c.channel === channelFilter;
    return matchSearch && matchCh;
  });

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-3 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2.5 px-3 border-0 bg-transparent">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-25 border border-primary border-opacity-50"
              style={{ width: "38px", height: "38px" }}
            >
              <FaPaperPlane size={18} className="text-primary" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "16px" }}>All Campaigns (Omnichannel Overview)</h5>
              <p className="mb-0 text-white-50" style={{ fontSize: "12px" }}>
                Multi-channel blast overview (WhatsApp, SMS, Email, RCS, Voice) with aggregated delivery tracking
              </p>
            </div>
          </div>
          <Button
            color="primary"
            size="sm"
            className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5"
            onClick={handleOpenModal}
          >
            <FaPlus size={11} /> Launch New Campaign
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
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
                  <option value="VOICE">Voice</option>
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
                  Scheduled / Running: {campaigns.filter((c) => ["SCHEDULED", "PROCESSING"].includes(c.status)).length}
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
                    <th>Campaign Name & Sender</th>
                    <th>Channel</th>
                    <th>Target Audience</th>
                    <th>Delivery Rate</th>
                    <th>Status</th>
                    <th>Created / Scheduled</th>
                    <th className="text-center" style={{ width: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-5 text-muted">
                        No campaigns found. Click <strong>Launch New Campaign</strong> to start a blast.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => {
                      const total = c.totalSent || c.totalRecipients || 1;
                      const delivered = c.delivered || 0;
                      const delivPct = Math.round((delivered / total) * 100);

                      return (
                        <tr key={c._id || idx}>
                          <td className="text-muted small">{idx + 1}</td>
                          <td>
                            <div className="fw-bold text-dark">{c.name}</div>
                            <small className="text-muted font-monospace">{c.senderId}</small>
                          </td>
                          <td>{getChannelBadge(c.channel)}</td>
                          <td className="small text-muted">{c.audienceName || "All Subscribers"}</td>
                          <td style={{ minWidth: "140px" }}>
                            <div className="d-flex justify-content-between small fw-bold mb-1">
                              <span>{delivered.toLocaleString()} / {total.toLocaleString()}</span>
                              <span className="text-success">{delivPct}%</span>
                            </div>
                            <Progress
                              value={delivPct}
                              color={delivPct > 90 ? "success" : "primary"}
                              style={{ height: "6px" }}
                            />
                          </td>
                          <td>
                            <Badge
                              color={
                                c.status === "COMPLETED"
                                  ? "success"
                                  : c.status === "PROCESSING"
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
                          <td className="small text-muted">
                            {c.scheduledFor ? new Date(c.scheduledFor).toLocaleString() : c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Immediate"}
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex gap-1.5 align-items-center">
                              {["PROCESSING", "PAUSED"].includes(c.status) && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="adm-icon-btn is-warning"
                                  data-tt={c.status === "PROCESSING" ? "Pause Campaign" : "Resume Campaign"}
                                  onClick={() => handleToggleStatus(c)}
                                >
                                  {c.status === "PROCESSING" ? <FaPause size={10} /> : <FaPlay size={10} />}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="light"
                                className="adm-icon-btn"
                                data-tt="Metrics Breakdown"
                                onClick={() =>
                                  wpSwal.alert(
                                    c.name,
                                    `Sent: ${total.toLocaleString()} | Delivered: ${delivered.toLocaleString()} | Read: ${(c.read || 0).toLocaleString()} | Clicked: ${(c.clicked || 0).toLocaleString()} | Failed: ${(c.failed || 0).toLocaleString()}`
                                  )
                                }
                              >
                                <FaChartBar size={11} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="adm-icon-btn is-danger"
                                data-tt="Delete Campaign"
                                onClick={() => handleDelete(c._id, c.name)}
                              >
                                <FaTrash size={11} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE CAMPAIGN MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
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
                    placeholder="e.g. Festive Weekend Blast"
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
                    onChange={(e) => handleChannelChange(e.target.value)}
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
                  <Label className="fw-bold small text-dark">Sender Identifier / Header *</Label>
                  <Input
                    placeholder={form.channel === "SMS" ? "BYDSND" : "support@beyondsend.in"}
                    value={form.senderId}
                    onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Target Audience List</Label>
                  <Input
                    type="select"
                    value={form.listId}
                    onChange={(e) => {
                      const selected = lists.find((l) => l._id === e.target.value);
                      setForm({
                        ...form,
                        listId: e.target.value,
                        audienceName: selected ? selected.name : "All Subscribers",
                        totalRecipients: selected ? selected.totalContacts : 1000
                      });
                    }}
                  >
                    {lists.length > 0 ? (
                      lists.map((l) => (
                        <option key={l._id} value={l._id}>
                          {l.name} ({l.totalContacts || 0} contacts)
                        </option>
                      ))
                    ) : (
                      <option value="">Default All Subscribers</option>
                    )}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Schedule Type</Label>
                  <Input
                    type="select"
                    value={form.scheduleType}
                    onChange={(e) => setForm({ ...form, scheduleType: e.target.value })}
                  >
                    <option value="IMMEDIATE">Immediate Dispatch</option>
                    <option value="SCHEDULED">Schedule for Later</option>
                  </Input>
                </FormGroup>
              </Col>
              {form.scheduleType === "SCHEDULED" && (
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Schedule Time</Label>
                    <Input
                      type="datetime-local"
                      value={form.scheduledFor}
                      onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              )}
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
              {btnLoading ? <Spinner size="sm" /> : "🚀 Queue & Dispatch Campaign"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignsManagement;
