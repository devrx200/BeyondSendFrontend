import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaComments, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaTrash, FaCheck,
  FaSyncAlt, FaUsers, FaPaperPlane, FaMobileAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const RcsCampaigns = () => {
  const { toasts, toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [lists, setLists] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    botId: "beyondsend_verified_bot",
    templateId: "",
    selectedTemplateObj: null,
    listId: "",
    audienceName: "",
    totalRecipients: 0,
    scheduleType: "IMMEDIATE",
    scheduledFor: new Date().toISOString().slice(0, 16),
    messageBody: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmpRes, listRes, tplRes] = await Promise.all([
        apiClient.get("/rcs/campaigns/list"),
        apiClient.get("/contact-lists/list", { params: { channel: "RCS" } }).catch(() => apiClient.get("/contact-lists/list")),
        apiClient.get("/rcs/templates/list").catch(() => ({ data: [] }))
      ]);

      const cmpData = cmpRes?.data?.data || cmpRes?.data || [];
      const listData = listRes?.data?.data || listRes?.data || [];
      const tplData = tplRes?.data?.data || tplRes?.data || [];

      setCampaigns(Array.isArray(cmpData) ? cmpData : []);
      setLists(Array.isArray(listData) ? listData : []);
      setTemplates(Array.isArray(tplData) ? tplData : []);
    } catch (err) {
      console.error("Fetch RCS campaigns error:", err);
      toast.error(err?.response?.data?.message || "Failed to load RCS campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleListChange = (listId) => {
    const found = lists.find(l => String(l._id) === String(listId));
    setForm(prev => ({
      ...prev,
      listId,
      audienceName: found ? found.name : "Custom Audience",
      totalRecipients: found ? (found.validContacts || found.totalContacts || 100) : 100
    }));
  };

  const handleTemplateChange = (tplId) => {
    const found = templates.find(t => String(t._id) === String(tplId) || String(t.id) === String(tplId));
    setForm(prev => ({
      ...prev,
      templateId: tplId,
      selectedTemplateObj: found || null,
      messageBody: found ? (found.body || found.description || found.content || "") : prev.messageBody
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Campaign name is required");
      return;
    }
    if (!form.listId && lists.length > 0) {
      toast.warning("Please select a target Audience Group");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/rcs/campaigns/create", {
        name: form.name.trim(),
        botId: form.botId,
        templateId: form.templateId || undefined,
        audienceName: form.audienceName || "RCS Subscribers",
        listId: form.listId || undefined,
        totalRecipients: Number(form.totalRecipients) || 500,
        scheduleType: form.scheduleType,
        scheduledFor: form.scheduleType === "SCHEDULED" ? form.scheduledFor : undefined,
        messageBody: form.messageBody || "RCS Rich Message"
      });

      toast.success(res?.data?.message || "RCS campaign created successfully");
      setModal(false);
      setForm({
        name: "",
        botId: "beyondsend_verified_bot",
        templateId: "",
        selectedTemplateObj: null,
        listId: "",
        audienceName: "",
        totalRecipients: 0,
        scheduleType: "IMMEDIATE",
        scheduledFor: new Date().toISOString().slice(0, 16),
        messageBody: ""
      });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Campaign creation failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === "RUNNING" ? "PAUSED" : "RUNNING";
      const res = await apiClient.patch(`/rcs/campaigns/toggle-status/${id}`, { status: nextStatus });
      toast.success(res?.data?.message || `RCS Campaign ${nextStatus.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status toggle failed");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete RCS Campaign?",
      `Are you sure you want to remove '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/rcs/campaigns/delete/${id}`);
      toast.success(res?.data?.message || "RCS Campaign deleted");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deletion failed");
    }
  };

  const filtered = campaigns.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (c.botId || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDelivered = campaigns.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* HEADER */}
      <Card className="adm-card mb-4 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)" }}>
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-25 border border-info border-opacity-50"
              style={{ width: "52px", height: "52px" }}
            >
              <FaComments size={26} className="text-white" />
            </div>
            <div>
              <h3 className="adm-page-title mb-1 text-white fw-bold">Google RCS Bulk Campaigns</h3>
              <p className="adm-page-subtitle mb-0 text-white-50" style={{ fontSize: "13.5px" }}>
                Next-gen Rich Business Messaging (RBM), interactive carousels, action buttons, and verified brand messaging
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              className="fw-bold shadow px-3.5 d-flex align-items-center gap-2 text-dark"
              onClick={() => {
                if (lists.length > 0 && !form.listId) {
                  handleListChange(lists[0]._id);
                }
                setModal(true);
              }}
            >
              <FaPlus size={12} className="text-info" /> Launch RCS Campaign
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* STATS STRIP */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Campaigns</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{campaigns.length}</h3>
                <small className="text-info fw-semibold"><FaCheck size={10} className="me-1" />RBM Verified</small>
              </div>
              <div className="rounded-3 bg-info bg-opacity-10 p-3 text-info">
                <FaComments size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Delivered RCS</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{totalDelivered.toLocaleString()}</h3>
                <small className="text-success fw-semibold"><FaCheckCircle size={10} className="me-1" />Interactive cards</small>
              </div>
              <div className="rounded-3 bg-success bg-opacity-10 p-3 text-success">
                <FaChartBar size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Verified Bot ID</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">BeyondSend Bot</h3>
                <small className="text-primary fw-semibold">Google Jibe Verified</small>
              </div>
              <div className="rounded-3 bg-primary bg-opacity-10 p-3 text-primary">
                <FaCheckCircle size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Audience Groups</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{lists.length} Groups</h3>
                <small className="text-secondary fw-semibold">Dynamic subscriber lists</small>
              </div>
              <div className="rounded-3 bg-warning bg-opacity-10 p-3 text-warning">
                <FaUsers size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
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
                    placeholder="Search RCS campaigns by name or bot ID..."
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
                  className="bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RUNNING">Running / Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAUSED">Paused</option>
                  <option value="DRAFT">Draft</option>
                </Input>
              </Col>
              <Col xs={6} md={4} className="d-flex justify-content-end gap-2">
                <Button color="light" size="sm" className="border" onClick={fetchData}>
                  <FaSyncAlt size={11} className="me-1" /> Refresh
                </Button>
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
                    <th style={{ width: "35px" }}>#</th>
                    <th>Campaign & Bot ID</th>
                    <th>Target Audience Group</th>
                    <th>Delivery Progress</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        <div className="py-4">
                          <FaComments size={40} className="text-info opacity-50 mb-3" />
                          <h6 className="fw-bold text-dark">No RCS Campaigns Found</h6>
                          <p className="text-muted small mb-3">
                            Launch interactive Google RCS business messages to your audience.
                          </p>
                          <Button color="info" size="sm" className="text-white" onClick={() => setModal(true)}>
                            <FaPlus size={11} className="me-1" /> Create RCS Campaign
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => {
                      const total = c.totalRecipients || 1;
                      const delivered = c.deliveredCount || 0;
                      const progressPct = Math.min(100, Math.round((delivered / total) * 100));

                      return (
                        <tr key={c._id || idx}>
                          <td className="text-muted small">{idx + 1}</td>
                          <td>
                            <div className="fw-bold text-dark d-flex align-items-center gap-1.5">
                              <FaComments size={13} className="text-info" />
                              {c.name}
                            </div>
                            <small className="text-muted d-block font-monospace" style={{ fontSize: "11px" }}>
                              Bot: {c.botId || "BeyondSend Bot"}
                            </small>
                          </td>
                          <td>
                            <Badge color="light" className="border text-dark py-1 px-2 fw-semibold">
                              <FaUsers size={10} className="me-1 text-primary" />
                              {c.audienceName || (c.listId?.name) || "RCS Audience"}
                            </Badge>
                            <small className="text-muted d-block mt-0.5" style={{ fontSize: "11px" }}>
                              {total.toLocaleString()} recipients
                            </small>
                          </td>
                          <td style={{ minWidth: "160px" }}>
                            <div className="d-flex justify-content-between small mb-1">
                              <span className="fw-semibold text-dark">{delivered.toLocaleString()} delivered</span>
                              <span className="text-muted">{progressPct}%</span>
                            </div>
                            <Progress value={progressPct} color="info" style={{ height: "6px" }} className="rounded-pill" />
                          </td>
                          <td>
                            <span className="text-secondary small">
                              {c.scheduleType === "IMMEDIATE" ? "Immediate Blast" : (
                                <>
                                  <FaClock size={10} className="me-1 text-warning" />
                                  {c.scheduledFor ? new Date(c.scheduledFor).toLocaleString() : "Scheduled"}
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <Badge
                              color={
                                c.status === "RUNNING" ? "success" :
                                (c.status === "COMPLETED" ? "primary" :
                                (c.status === "PAUSED" ? "warning" : "secondary"))
                              }
                              className="py-1 px-2 rounded-pill font-monospace"
                              style={{ fontSize: "10.5px" }}
                            >
                              {c.status || "COMPLETED"}
                            </Badge>
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex gap-1.5 align-items-center">
                              {c.status !== "COMPLETED" && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="border px-2 py-0.5 text-secondary"
                                  title={c.status === "RUNNING" ? "Pause Campaign" : "Resume Campaign"}
                                  onClick={() => handleToggleStatus(c._id, c.status)}
                                >
                                  {c.status === "RUNNING" ? <FaPause size={10} /> : <FaPlay size={10} />}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="light"
                                className="border px-2 py-0.5 text-danger"
                                title="Delete Campaign"
                                onClick={() => handleDelete(c._id, c.name)}
                              >
                                <FaTrash size={10} />
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

      {/* LAUNCH RCS MODAL */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="lg">
        <ModalHeader toggle={() => setModal(false)} className="bg-dark text-white">
          <FaComments className="me-2 text-info" /> Launch New RCS Rich Campaign
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col xs={12} md={7}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Campaign Name *</Label>
                  <Input
                    placeholder="e.g. Interactive Card Showcase"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>

                <Row className="g-2">
                  <Col xs={12} md={6}>
                    <FormGroup>
                      <Label className="fw-bold small text-dark">Google RBM Bot ID</Label>
                      <Input
                        value={form.botId}
                        onChange={(e) => setForm({ ...form, botId: e.target.value })}
                        required
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} md={6}>
                    <FormGroup>
                      <Label className="fw-bold small text-dark">RCS Rich Template</Label>
                      <Input
                        type="select"
                        value={form.templateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                      >
                        <option value="">-- Choose Template (Optional) --</option>
                        {templates.map(t => (
                          <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label className="fw-bold small text-dark">Select Target Audience Group *</Label>
                  <Input
                    type="select"
                    value={form.listId}
                    onChange={(e) => handleListChange(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Target Audience List --</option>
                    {lists.map(l => (
                      <option key={l._id} value={l._id}>{l.name} ({l.totalContacts || 0} contacts)</option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label className="fw-bold small text-dark">RCS Message Text *</Label>
                  <Input
                    type="textarea"
                    rows={4}
                    placeholder="Enter your rich message text..."
                    value={form.messageBody}
                    onChange={(e) => setForm({ ...form, messageBody: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Schedule Dispatch</Label>
                  <div className="d-flex gap-2 mb-2">
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "IMMEDIATE" ? "info" : "light"}
                      className={`fw-bold border ${form.scheduleType === "IMMEDIATE" ? "text-white" : "text-muted"}`}
                      onClick={() => setForm({ ...form, scheduleType: "IMMEDIATE" })}
                    >
                      Immediate Blast
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "SCHEDULED" ? "info" : "light"}
                      className={`fw-bold border ${form.scheduleType === "SCHEDULED" ? "text-white" : "text-muted"}`}
                      onClick={() => setForm({ ...form, scheduleType: "SCHEDULED" })}
                    >
                      Schedule Later
                    </Button>
                  </div>
                  {form.scheduleType === "SCHEDULED" && (
                    <Input
                      type="datetime-local"
                      value={form.scheduledFor}
                      onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                      required
                    />
                  )}
                </FormGroup>
              </Col>

              {/* RCS SMARTPHONE PREVIEW */}
              <Col xs={12} md={5}>
                <div className="rounded-4 p-3 shadow-sm border bg-white h-100 d-flex flex-column">
                  <div className="border-bottom pb-2 mb-3 text-center">
                    <span className="fw-bold text-dark d-block small">Google RCS Messaging</span>
                    <small className="text-muted" style={{ fontSize: "10.5px" }}>Verified Brand Agent</small>
                  </div>

                  <div className="flex-grow-1 p-3 rounded-3" style={{ background: "#f0fdf4" }}>
                    <div className="bg-white p-3 rounded-3 shadow-xs border">
                      <div className="d-flex align-items-center gap-1.5 mb-2">
                        <Badge color="info-subtle" className="text-info border border-info-subtle">
                          Verified Brand
                        </Badge>
                      </div>
                      <p className="mb-2 text-dark small" style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
                        {form.messageBody || "Explore our new product catalog with Google RCS Rich Card. Tap the button below to buy."}
                      </p>
                      <Button color="primary" size="sm" outline className="w-100 fw-bold py-1" style={{ fontSize: "11px" }}>
                        View Details & Shop
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-light rounded text-center small text-muted">
                    Recipients: <strong>{form.totalRecipients.toLocaleString()}</strong> RCS devices
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="info" type="submit" disabled={btnLoading} className="fw-bold px-4 text-white">
              {btnLoading ? <Spinner size="sm" /> : (
                <>
                  <FaPaperPlane size={12} className="me-1.5" /> Start RCS Broadcast
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default RcsCampaigns;
