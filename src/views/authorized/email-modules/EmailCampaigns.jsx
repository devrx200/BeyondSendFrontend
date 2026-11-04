import { useState, useEffect, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText,
  Spinner
} from "reactstrap";
import {
  FaEnvelope, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaTrash, FaCheck,
  FaSyncAlt, FaUsers, FaUser, FaFileImport, FaEye,
  FaPaperPlane
} from "react-icons/fa";
import * as XLSX from "xlsx";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const EmailCampaigns = () => {
  const { toasts, toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [lists, setLists] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(false);

  // Audience targeting mode: "GROUP" | "INDIVIDUAL" | "CSV" | "DIRECT"
  const [targetMode, setTargetMode] = useState("GROUP");
  const [selectedIndividualIds, setSelectedIndividualIds] = useState([]);
  const [parsedCsvContacts, setParsedCsvContacts] = useState([]);
  const [directEmailsText, setDirectEmailsText] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    fromName: "BeyondSend Team",
    fromEmail: "updates@beyondsend.in",
    subject: "",
    previewText: "",
    templateId: "",
    selectedTemplateObj: null,
    listId: "",
    audienceName: "",
    totalRecipients: 0,
    scheduleType: "IMMEDIATE",
    scheduledFor: new Date().toISOString().slice(0, 16),
    htmlContent: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmpRes, listRes, tplRes, conRes] = await Promise.all([
        apiClient.get("/email/campaigns/list"),
        apiClient.get("/contact-lists/list").catch(() => ({ data: [] })),
        apiClient.get("/email/templates/list").catch(() => ({ data: [] })),
        apiClient.get("/contacts/list", { params: { limit: 150 } }).catch(() => ({ data: [] }))
      ]);

      const cmpData = cmpRes?.data?.data || cmpRes?.data || [];
      const listData = listRes?.data?.data || listRes?.data || [];
      const tplData = tplRes?.data?.data || tplRes?.data || [];
      const conData = conRes?.data?.data || [];

      setCampaigns(Array.isArray(cmpData) ? cmpData : []);
      setLists(Array.isArray(listData) ? listData : []);
      setTemplates(Array.isArray(tplData) ? tplData : []);
      setAllContacts(Array.isArray(conData) ? conData : []);
    } catch (err) {
      console.error("Fetch Email campaigns error:", err);
      toast.error(err?.response?.data?.message || "Failed to load Email campaigns");
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
      subject: prev.subject || (found ? found.subject || found.name : ""),
      htmlContent: found ? (found.html || found.content || found.body || "") : prev.htmlContent
    }));
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        let rows = [];
        if (isExcel) {
          const workbook = XLSX.read(data, { type: "binary" });
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
          const workbook = XLSX.read(data, { type: "string" });
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        }

        const normalized = rows.map(r => {
          const name = r.Name || r["Full Name"] || r.fullName || r.name || "";
          const email = String(r.Email || r.email || "").trim();
          return { fullName: name, name, email };
        }).filter(c => c.email && c.email.includes("@"));

        setParsedCsvContacts(normalized);
        setForm(prev => ({ ...prev, totalRecipients: normalized.length, audienceName: `CSV Import (${file.name})` }));
        toast.info(`Parsed ${normalized.length} email contacts from ${file.name}`);
      } catch (err) {
        toast.error("Failed to parse CSV file");
      }
    };

    if (isExcel) reader.readAsBinaryString(file);
    else reader.readAsText(file);
  };

  const effectiveRecipientCount = useMemo(() => {
    if (targetMode === "GROUP") return form.totalRecipients || 0;
    if (targetMode === "INDIVIDUAL") return selectedIndividualIds.length;
    if (targetMode === "CSV") return parsedCsvContacts.length;
    if (targetMode === "DIRECT") {
      const parts = directEmailsText.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
      return parts.length;
    }
    return 0;
  }, [targetMode, form.totalRecipients, selectedIndividualIds, parsedCsvContacts, directEmailsText]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Campaign Name is required");
      return;
    }
    if (!form.subject.trim()) {
      toast.warning("Subject Line is required");
      return;
    }

    if (targetMode === "GROUP" && !form.listId && lists.length > 0) {
      toast.warning("Please select a target Audience Group");
      return;
    }
    if (targetMode === "INDIVIDUAL" && selectedIndividualIds.length === 0) {
      toast.warning("Please select at least one contact");
      return;
    }
    if (targetMode === "CSV" && parsedCsvContacts.length === 0) {
      toast.warning("Please upload a CSV file with email addresses");
      return;
    }
    if (targetMode === "DIRECT" && effectiveRecipientCount === 0) {
      toast.warning("Please enter at least one email address");
      return;
    }

    try {
      setBtnLoading(true);

      let targetListId = form.listId;
      let calculatedAudienceName = form.audienceName;

      if (targetMode === "CSV" && parsedCsvContacts.length > 0) {
        const importRes = await apiClient.post("/contacts/import", {
          contacts: parsedCsvContacts,
          groupName: `${form.name.trim()} (CSV)`,
          groupChannel: "EMAIL"
        });
        targetListId = importRes?.data?.list?._id || form.listId;
        calculatedAudienceName = `${form.name} (CSV Audience)`;
      } else if (targetMode === "DIRECT") {
        const emails = directEmailsText.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
        const contactsToImport = emails.map((em, i) => ({
          fullName: `Subscriber ${i + 1}`,
          email: em
        }));
        const importRes = await apiClient.post("/contacts/import", {
          contacts: contactsToImport,
          groupName: `${form.name.trim()} (Direct)`,
          groupChannel: "EMAIL"
        });
        targetListId = importRes?.data?.list?._id || form.listId;
        calculatedAudienceName = `${form.name} (${emails.length} emails)`;
      } else if (targetMode === "INDIVIDUAL") {
        calculatedAudienceName = `Selected ${selectedIndividualIds.length} Contacts`;
      }

      const res = await apiClient.post("/email/campaigns/create", {
        name: form.name.trim(),
        fromName: form.fromName.trim(),
        fromEmail: form.fromEmail.trim(),
        subject: form.subject.trim(),
        previewText: form.previewText.trim(),
        templateId: form.templateId || undefined,
        audienceName: calculatedAudienceName || "Email Audience",
        listId: targetListId || undefined,
        totalRecipients: effectiveRecipientCount || 500,
        scheduleType: form.scheduleType,
        scheduledFor: form.scheduleType === "SCHEDULED" ? form.scheduledFor : undefined,
        htmlContent: form.htmlContent || `<p>${form.subject}</p>`
      });

      toast.success(res?.data?.message || "Email campaign created successfully!");
      setModal(false);
      setParsedCsvContacts([]);
      setSelectedIndividualIds([]);
      setDirectEmailsText("");
      setForm({
        name: "",
        fromName: "BeyondSend Team",
        fromEmail: "updates@beyondsend.in",
        subject: "",
        previewText: "",
        templateId: "",
        selectedTemplateObj: null,
        listId: "",
        audienceName: "",
        totalRecipients: 0,
        scheduleType: "IMMEDIATE",
        scheduledFor: new Date().toISOString().slice(0, 16),
        htmlContent: ""
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
      const res = await apiClient.patch(`/email/campaigns/toggle-status/${id}`, { status: nextStatus });
      toast.success(res?.data?.message || `Email campaign ${nextStatus.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status toggle failed");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Email Campaign?",
      `Are you sure you want to remove '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/email/campaigns/delete/${id}`);
      toast.success(res?.data?.message || "Email campaign deleted");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deletion failed");
    }
  };

  const filtered = campaigns.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (c.subject || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDelivered = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.delivered || c.deliveredCount || 0), 0);
  }, [campaigns]);

  const totalOpened = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.opened || c.openCount || c.openedCount || 0), 0);
  }, [campaigns]);

  const grandAudienceCount = useMemo(() => {
    return lists.reduce((acc, l) => acc + (l.totalContacts || 0), 0);
  }, [lists]);

  const filteredIndividualContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) return allContacts;
    const term = contactSearchTerm.toLowerCase();
    return allContacts.filter(c =>
      (c.fullName || c.name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term)
    );
  }, [allContacts, contactSearchTerm]);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* COMPACT HEADER BANNER */}
      <Card className="border-0 shadow-sm rounded-3 mb-3" style={{ background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)" }}>
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2.5 px-3 border-0 bg-transparent">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center border"
              style={{ width: "38px", height: "38px", backgroundColor: "rgba(99, 102, 241, 0.2)", borderColor: "rgba(99, 102, 241, 0.4)" }}
            >
              <FaEnvelope size={18} className="text-info" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "16px" }}>Email Bulk Campaigning</h5>
              <p className="mb-0 text-white-50" style={{ fontSize: "12px" }}>
                High-deliverability newsletters, promotional email sequences, open & click analytics, and audience dispatch
              </p>
            </div>
          </div>
          <Button
            color="info"
            size="sm"
            className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5 text-white"
            onClick={() => {
              if (lists.length > 0 && !form.listId) {
                handleListChange(lists[0]._id);
              }
              setModal(true);
            }}
          >
            <FaPlus size={11} /> Launch Email Campaign
          </Button>
        </CardHeader>
      </Card>

      {/* COMPACT METRIC CARDS */}
      <Row className="g-2 mb-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Total Campaigns
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{campaigns.length}</h4>
                <small className="text-info fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheck size={9} className="me-1" />DKIM / SPF Verified
                </small>
              </div>
              <div className="rounded-2 bg-info bg-opacity-10 p-2 text-info">
                <FaEnvelope size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Delivered Emails
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{totalDelivered.toLocaleString()}</h4>
                <small className="text-success fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheckCircle size={9} className="me-1" />Inbox delivered
                </small>
              </div>
              <div className="rounded-2 bg-success bg-opacity-10 p-2 text-success">
                <FaChartBar size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Total Opens
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{totalOpened.toLocaleString()}</h4>
                <small className="text-primary fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaEye size={9} className="me-1" />Unique opens
                </small>
              </div>
              <div className="rounded-2 bg-primary bg-opacity-10 p-2 text-primary">
                <FaEye size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Audience Groups
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{lists.length} Groups</h4>
                <small className="text-secondary fw-semibold" style={{ fontSize: "10.5px" }}>
                  {grandAudienceCount.toLocaleString()} Subscribers
                </small>
              </div>
              <div className="rounded-2 bg-warning bg-opacity-10 p-2 text-warning">
                <FaUsers size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CardBody className="p-0">
          <div className="p-2.5 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} sm={6} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted py-1">
                    <FaSearch size={11} />
                  </InputGroupText>
                  <Input
                    placeholder="Search Email campaigns by name or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={6} sm={3} md={3}>
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
              <Col xs={6} sm={3} md={4} className="d-flex justify-content-end gap-1.5">
                <Button color="light" size="sm" className="border px-2.5" onClick={fetchData}>
                  <FaSyncAlt size={10} className="me-1" /> Refresh
                </Button>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11px", letterSpacing: "0.3px" }}>
                  <tr>
                    <th style={{ width: "30px", padding: "8px 10px" }}>#</th>
                    <th style={{ padding: "8px 10px" }}>Campaign & Subject</th>
                    <th style={{ padding: "8px 10px" }}>Target Audience</th>
                    <th style={{ padding: "8px 10px" }}>Delivery Progress</th>
                    <th style={{ padding: "8px 10px" }}>Open Rate</th>
                    <th style={{ padding: "8px 10px" }}>Schedule</th>
                    <th style={{ padding: "8px 10px" }}>Status</th>
                    <th className="text-center" style={{ width: "110px", padding: "8px 10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12.5px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        <FaEnvelope size={32} className="text-info opacity-50 mb-2" />
                        <h6 className="fw-bold text-dark mb-1">No Email Campaigns Found</h6>
                        <p className="text-muted small mb-2">
                          Launch your first email broadcast campaign to your audience.
                        </p>
                        <Button color="info" size="sm" className="text-white" onClick={() => setModal(true)}>
                          <FaPlus size={10} className="me-1" /> Launch Email Campaign
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => {
                      const total = c.totalRecipients || c.totalSent || 1;
                      const delivered = c.delivered || c.deliveredCount || 0;
                      const opens = c.opened || c.openCount || c.openedCount || 0;
                      const progressPct = Math.min(100, Math.round((delivered / total) * 100));
                      const openPct = delivered > 0 ? Math.min(100, Math.round((opens / delivered) * 100)) : 0;

                      return (
                        <tr key={c._id || idx}>
                          <td className="text-muted small" style={{ padding: "8px 10px" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div className="d-flex align-items-center gap-1.5">
                              <FaEnvelope size={12} className="text-info flex-shrink-0" />
                              <span className="fw-bold text-dark">{c.name}</span>
                            </div>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "10.5px", maxWidth: "220px" }}>
                              Subject: <em>{c.subject || "No subject"}</em>
                            </small>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge color="light" className="border text-dark py-0.5 px-2 fw-semibold">
                              <FaUsers size={9} className="me-1 text-primary" />
                              {c.audienceName || (c.listId?.name) || "Email Audience"}
                            </Badge>
                            <small className="text-muted d-block mt-0.5" style={{ fontSize: "10.5px" }}>
                              {total.toLocaleString()} recipients
                            </small>
                          </td>
                          <td style={{ minWidth: "140px", padding: "8px 10px" }}>
                            <div className="d-flex justify-content-between small mb-0.5">
                              <span className="fw-semibold text-dark" style={{ fontSize: "11px" }}>{delivered.toLocaleString()} sent</span>
                              <span className="text-muted" style={{ fontSize: "10.5px" }}>{progressPct}%</span>
                            </div>
                            <Progress value={progressPct} color="info" style={{ height: "4px" }} className="rounded-pill" />
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span className="fw-bold text-primary">
                              {opens.toLocaleString()}
                            </span>
                            <small className="text-muted ms-1">({openPct}%)</small>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span className="text-secondary small" style={{ fontSize: "11.5px" }}>
                              {c.scheduleType === "IMMEDIATE" ? "Immediate Blast" : (
                                <>
                                  <FaClock size={9} className="me-1 text-warning" />
                                  {c.scheduledFor ? new Date(c.scheduledFor).toLocaleDateString() : "Scheduled"}
                                </>
                              )}
                            </span>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge
                              color={
                                c.status === "RUNNING" ? "success" :
                                (c.status === "COMPLETED" ? "primary" :
                                (c.status === "PAUSED" ? "warning" : "secondary"))
                              }
                              className="py-0.5 px-2 rounded-pill font-monospace"
                              style={{ fontSize: "10px" }}
                            >
                              {c.status || "COMPLETED"}
                            </Badge>
                          </td>
                          <td className="text-center" style={{ padding: "8px 10px" }}>
                            <div className="d-inline-flex gap-1 align-items-center">
                              {c.status !== "COMPLETED" && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="border px-1.5 py-0.5 text-secondary"
                                  title={c.status === "RUNNING" ? "Pause Campaign" : "Resume Campaign"}
                                  onClick={() => handleToggleStatus(c._id, c.status)}
                                >
                                  {c.status === "RUNNING" ? <FaPause size={9} /> : <FaPlay size={9} />}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="light"
                                className="border px-1.5 py-0.5 text-danger"
                                title="Delete Campaign"
                                onClick={() => handleDelete(c._id, c.name)}
                              >
                                <FaTrash size={9} />
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

      {/* LAUNCH EMAIL MODAL */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="xl">
        <ModalHeader toggle={() => setModal(false)} className="bg-dark text-white py-2.5 px-3">
          <FaEnvelope className="me-2 text-info" /> Launch Email Bulk Campaign
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-3 bg-light">
            <Row className="g-3">
              <Col xs={12} lg={7}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Campaign Name *</Label>
                  <Input
                    placeholder="e.g. October Product Launch Newsletter"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    size="sm"
                  />
                </FormGroup>

                <Row className="g-2 mb-2">
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">From Name</Label>
                      <Input
                        value={form.fromName}
                        onChange={(e) => setForm({ ...form, fromName: e.target.value })}
                        required
                        size="sm"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">From Email</Label>
                      <Input
                        type="email"
                        value={form.fromEmail}
                        onChange={(e) => setForm({ ...form, fromEmail: e.target.value })}
                        required
                        size="sm"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Email Subject Line *</Label>
                  <Input
                    placeholder="e.g. Exciting updates inside: Discover our latest release"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    size="sm"
                  />
                </FormGroup>

                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Preview / Preheader Text</Label>
                  <Input
                    placeholder="Short summary displayed in the email inbox snippet"
                    value={form.previewText}
                    onChange={(e) => setForm({ ...form, previewText: e.target.value })}
                    size="sm"
                  />
                </FormGroup>

                {/* TARGET AUDIENCE 4-MODE SWITCHER */}
                <div className="border rounded-2 p-2.5 bg-white mb-2 shadow-xs">
                  <Label className="fw-bold small text-dark mb-1.5 d-block">
                    Select Audience Targeting Mode *
                  </Label>
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "GROUP" ? "info" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "GROUP" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("GROUP")}
                    >
                      <FaUsers size={11} /> Saved Group ({lists.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "INDIVIDUAL" ? "info" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "INDIVIDUAL" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("INDIVIDUAL")}
                    >
                      <FaUser size={11} /> Individual Contacts ({selectedIndividualIds.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "CSV" ? "info" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "CSV" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("CSV")}
                    >
                      <FaFileImport size={11} /> Import CSV ({parsedCsvContacts.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "DIRECT" ? "info" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "DIRECT" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("DIRECT")}
                    >
                      <FaEnvelope size={11} /> Direct Emails
                    </Button>
                  </div>

                  {targetMode === "GROUP" && (
                    <FormGroup className="mb-0">
                      <Input
                        type="select"
                        size="sm"
                        value={form.listId}
                        onChange={(e) => handleListChange(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Target Audience List --</option>
                        {lists.map(l => (
                          <option key={l._id} value={l._id}>
                            {l.name} ({l.totalContacts || 0} subscribers)
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  )}

                  {targetMode === "INDIVIDUAL" && (
                    <div>
                      <InputGroup size="sm" className="mb-1.5">
                        <InputGroupText className="bg-light py-0 px-2">
                          <FaSearch size={10} />
                        </InputGroupText>
                        <Input
                          placeholder="Search subscribers by name or email..."
                          value={contactSearchTerm}
                          onChange={(e) => setContactSearchTerm(e.target.value)}
                        />
                      </InputGroup>
                      <div className="table-responsive border rounded-2" style={{ maxHeight: "140px", overflowY: "auto" }}>
                        <Table size="sm" hover className="mb-0 small align-middle">
                          <tbody>
                            {filteredIndividualContacts.length === 0 ? (
                              <tr>
                                <td colSpan="3" className="text-center text-muted py-2">
                                  No contacts found.
                                </td>
                              </tr>
                            ) : (
                              filteredIndividualContacts.map(c => {
                                const isChecked = selectedIndividualIds.includes(c._id);
                                return (
                                  <tr key={c._id} style={{ cursor: "pointer" }} onClick={() => {
                                    if (isChecked) {
                                      setSelectedIndividualIds(prev => prev.filter(id => id !== c._id));
                                    } else {
                                      setSelectedIndividualIds(prev => [...prev, c._id]);
                                    }
                                  }}>
                                    <td style={{ width: "25px", padding: "4px 8px" }}>
                                      <Input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {}}
                                      />
                                    </td>
                                    <td style={{ padding: "4px 8px" }}>
                                      <strong>{c.fullName || c.name || "Subscriber"}</strong>
                                    </td>
                                    <td className="text-muted" style={{ padding: "4px 8px" }}>
                                      {c.email || "—"}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <small className="text-info fw-semibold d-block mt-1" style={{ fontSize: "11px" }}>
                        {selectedIndividualIds.length} contact(s) selected
                      </small>
                    </div>
                  )}

                  {targetMode === "CSV" && (
                    <div>
                      <div
                        className="p-2.5 text-center border-2 rounded-2 bg-light"
                        style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}
                      >
                        <FaFileImport size={18} className="text-info mb-1" />
                        <p className="fw-bold text-dark small mb-1" style={{ fontSize: "11.5px" }}>Upload CSV / Excel with Email Addresses</p>
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleCsvUpload}
                          className="d-none"
                          id="emailModalCsvUpload"
                        />
                        <Label for="emailModalCsvUpload" className="btn btn-outline-info btn-sm py-0.5 px-3 fw-bold mb-0" style={{ fontSize: "11px" }}>
                          Browse File
                        </Label>
                      </div>
                      {parsedCsvContacts.length > 0 && (
                        <div className="mt-1.5 text-success small fw-semibold" style={{ fontSize: "11px" }}>
                          <FaCheck size={10} className="me-1" />
                          {parsedCsvContacts.length} emails ready for broadcast!
                        </div>
                      )}
                    </div>
                  )}

                  {targetMode === "DIRECT" && (
                    <div>
                      <Input
                        type="textarea"
                        rows={2}
                        placeholder="Type or paste emails separated by commas or lines"
                        value={directEmailsText}
                        onChange={(e) => setDirectEmailsText(e.target.value)}
                        className="font-monospace"
                        style={{ fontSize: "11px" }}
                      />
                      <small className="text-muted d-block mt-0.5" style={{ fontSize: "10.5px" }}>
                        {effectiveRecipientCount} valid email(s) entered
                      </small>
                    </div>
                  )}
                </div>

                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Email Template</Label>
                  <Input
                    type="select"
                    size="sm"
                    value={form.templateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    <option value="">-- Choose Template (Optional) --</option>
                    {templates.map(t => (
                      <option key={t._id || t.id} value={t._id || t.id}>{t.name}</option>
                    ))}
                  </Input>
                </FormGroup>

                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark mb-1">Schedule Dispatch</Label>
                  <div className="d-flex gap-2 mb-1.5">
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "IMMEDIATE" ? "info" : "light"}
                      className={`fw-semibold py-1 px-3 border ${form.scheduleType === "IMMEDIATE" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setForm({ ...form, scheduleType: "IMMEDIATE" })}
                    >
                      Immediate Blast
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "SCHEDULED" ? "info" : "light"}
                      className={`fw-semibold py-1 px-3 border ${form.scheduleType === "SCHEDULED" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setForm({ ...form, scheduleType: "SCHEDULED" })}
                    >
                      Schedule Later
                    </Button>
                  </div>
                  {form.scheduleType === "SCHEDULED" && (
                    <Input
                      type="datetime-local"
                      size="sm"
                      value={form.scheduledFor}
                      onChange={(e) => setForm({ ...form, scheduledFor: e.target.value })}
                      required
                    />
                  )}
                </FormGroup>
              </Col>

              {/* RIGHT COLUMN: EMAIL PREVIEW */}
              <Col xs={12} lg={5}>
                <div className="rounded-3 p-2.5 shadow-sm border bg-white h-100 d-flex flex-column">
                  <div className="border-bottom pb-1.5 mb-2">
                    <span className="fw-bold text-dark d-block" style={{ fontSize: "12px" }}>Inbox Snippet Preview</span>
                    <small className="text-muted" style={{ fontSize: "10px" }}>Live subscriber preview</small>
                  </div>

                  <div className="flex-grow-1 p-2.5 rounded-2 border" style={{ background: "#f8fafc" }}>
                    <div className="bg-white p-2.5 rounded-2 shadow-xs border">
                      <div className="d-flex align-items-center gap-1.5 mb-2 border-bottom pb-1.5">
                        <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px", fontSize: "10px" }}>
                          BS
                        </div>
                        <div>
                          <strong className="text-dark d-block" style={{ fontSize: "11.5px" }}>{form.fromName}</strong>
                          <span className="text-muted" style={{ fontSize: "9.5px" }}>&lt;{form.fromEmail}&gt;</span>
                        </div>
                      </div>
                      <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "12px" }}>
                        {form.subject || "Subject line goes here"}
                      </h6>
                      <p className="text-muted small mb-2" style={{ fontSize: "10.5px" }}>
                        {form.previewText || "Inbox preview text snippet..."}
                      </p>
                      <div className="p-2 bg-light rounded text-center small text-secondary" style={{ fontSize: "10.5px" }}>
                        HTML Template Body Content
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-1.5 bg-light rounded text-center small text-muted border" style={{ fontSize: "11px" }}>
                    Target: <strong className="text-dark">{targetMode}</strong> · Recipients: <strong className="text-info">{effectiveRecipientCount.toLocaleString()}</strong> subscribers
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white py-2 px-3">
            <Button color="secondary" outline size="sm" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="info" type="submit" size="sm" disabled={btnLoading || effectiveRecipientCount === 0} className="fw-bold px-3 text-white">
              {btnLoading ? <Spinner size="sm" /> : (
                <>
                  <FaPaperPlane size={11} className="me-1" /> Start Email Broadcast ({effectiveRecipientCount.toLocaleString()})
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default EmailCampaigns;
