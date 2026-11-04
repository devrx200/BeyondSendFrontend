import { useState, useEffect, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText,
  Spinner
} from "reactstrap";
import {
  FaCommentAlt, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaTrash, FaCheck,
  FaSyncAlt, FaUsers, FaUser, FaFileImport,
  FaMobileAlt, FaLayerGroup, FaPaperPlane
} from "react-icons/fa";
import * as XLSX from "xlsx";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const SmsCampaigns = () => {
  const { toasts, toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [lists, setLists] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [fromIds, setFromIds] = useState([]);
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
  const [directNumbersText, setDirectNumbersText] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    senderId: "BYDSND",
    dltTemplateId: "",
    selectedTemplateObj: null,
    listId: "",
    audienceName: "",
    totalRecipients: 0,
    scheduleType: "IMMEDIATE",
    scheduledFor: new Date().toISOString().slice(0, 16),
    messageBody: "Dear Customer, use code FLASH20 to get 20% off on your order at BeyondSend."
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmpRes, listRes, fromRes, tplRes, conRes] = await Promise.all([
        apiClient.get("/sms/campaigns/list"),
        apiClient.get("/contact-lists/list").catch(() => ({ data: [] })),
        apiClient.get("/from-ids/list").catch(() => ({ data: [] })),
        apiClient.get("/sms/templates/list").catch(() => ({ data: [] })),
        apiClient.get("/contacts/list", { params: { limit: 150 } }).catch(() => ({ data: [] }))
      ]);

      const cmpData = cmpRes?.data?.data || cmpRes?.data || [];
      const listData = listRes?.data?.data || listRes?.data || [];
      const fromData = fromRes?.data?.data || fromRes?.data || [];
      const tplData = tplRes?.data?.data || tplRes?.data || [];
      const conData = conRes?.data?.data || [];

      setCampaigns(Array.isArray(cmpData) ? cmpData : []);
      setLists(Array.isArray(listData) ? listData : []);
      setFromIds(Array.isArray(fromData) ? fromData : []);
      setTemplates(Array.isArray(tplData) ? tplData : []);
      setAllContacts(Array.isArray(conData) ? conData : []);
    } catch (err) {
      console.error("Fetch SMS campaigns error:", err);
      toast.error(err?.response?.data?.message || "Failed to load SMS campaigns");
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
      dltTemplateId: tplId,
      selectedTemplateObj: found || null,
      messageBody: found ? (found.body || found.message || found.content || "") : prev.messageBody
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
          const phone = String(r["Mobile Number"] || r.Mobile || r.mobile || r.Phone || r.phone || "").trim();
          return { fullName: name, name, phone, mobileNumber: phone };
        }).filter(c => c.phone);

        setParsedCsvContacts(normalized);
        setForm(prev => ({ ...prev, totalRecipients: normalized.length, audienceName: `CSV Import (${file.name})` }));
        toast.info(`Parsed ${normalized.length} contacts from ${file.name}`);
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
      const parts = directNumbersText.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
      return parts.length;
    }
    return 0;
  }, [targetMode, form.totalRecipients, selectedIndividualIds, parsedCsvContacts, directNumbersText]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("Campaign Name is required");
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
      toast.warning("Please upload a CSV file with mobile numbers");
      return;
    }
    if (targetMode === "DIRECT" && effectiveRecipientCount === 0) {
      toast.warning("Please enter at least one mobile number");
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
          groupChannel: "SMS"
        });
        targetListId = importRes?.data?.list?._id || form.listId;
        calculatedAudienceName = `${form.name} (CSV Audience)`;
      } else if (targetMode === "DIRECT") {
        const numbers = directNumbersText.split(/[\n,]+/).map(p => p.trim()).filter(Boolean);
        const contactsToImport = numbers.map((num, i) => ({
          fullName: `Subscriber ${i + 1}`,
          phone: num,
          mobileNumber: num
        }));
        const importRes = await apiClient.post("/contacts/import", {
          contacts: contactsToImport,
          groupName: `${form.name.trim()} (Direct)`,
          groupChannel: "SMS"
        });
        targetListId = importRes?.data?.list?._id || form.listId;
        calculatedAudienceName = `${form.name} (${numbers.length} numbers)`;
      } else if (targetMode === "INDIVIDUAL") {
        calculatedAudienceName = `Selected ${selectedIndividualIds.length} Contacts`;
      }

      const res = await apiClient.post("/sms/campaigns/create", {
        name: form.name.trim(),
        senderId: form.senderId || "BYDSND",
        dltTemplateId: form.dltTemplateId || undefined,
        audienceName: calculatedAudienceName || "SMS Audience",
        listId: targetListId || undefined,
        totalRecipients: effectiveRecipientCount || 500,
        scheduleType: form.scheduleType,
        scheduledFor: form.scheduleType === "SCHEDULED" ? form.scheduledFor : undefined,
        messageBody: form.messageBody.trim()
      });

      toast.success(res?.data?.message || "SMS campaign created successfully!");
      setModal(false);
      setParsedCsvContacts([]);
      setSelectedIndividualIds([]);
      setDirectNumbersText("");
      setForm({
        name: "",
        senderId: "BYDSND",
        dltTemplateId: "",
        selectedTemplateObj: null,
        listId: "",
        audienceName: "",
        totalRecipients: 0,
        scheduleType: "IMMEDIATE",
        scheduledFor: new Date().toISOString().slice(0, 16),
        messageBody: "Dear Customer, use code FLASH20 to get 20% off on your order at BeyondSend."
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
      const res = await apiClient.patch(`/sms/campaigns/toggle-status/${id}`, { status: nextStatus });
      toast.success(res?.data?.message || `SMS Campaign ${nextStatus.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status toggle failed");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete SMS Campaign?",
      `Are you sure you want to remove '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/sms/campaigns/delete/${id}`);
      toast.success(res?.data?.message || "SMS Campaign deleted");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Deletion failed");
    }
  };

  const filtered = campaigns.filter(c => {
    const matchesSearch = (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (c.senderId || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDelivered = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.delivered || c.deliveredCount || 0), 0);
  }, [campaigns]);

  const grandAudienceCount = useMemo(() => {
    return lists.reduce((acc, l) => acc + (l.totalContacts || 0), 0);
  }, [lists]);

  const charLength = form.messageBody.length;
  const creditsPerSms = charLength <= 160 ? 1 : Math.ceil(charLength / 153);

  const filteredIndividualContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) return allContacts;
    const term = contactSearchTerm.toLowerCase();
    return allContacts.filter(c =>
      (c.fullName || c.name || "").toLowerCase().includes(term) ||
      (c.mobileNumber || c.phone || "").includes(term)
    );
  }, [allContacts, contactSearchTerm]);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* COMPACT HEADER BANNER */}
      <Card className="border-0 shadow-sm rounded-3 mb-3" style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)" }}>
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2.5 px-3 border-0 bg-transparent">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-25 border border-primary border-opacity-50"
              style={{ width: "38px", height: "38px" }}
            >
              <FaCommentAlt size={18} className="text-primary" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "16px" }}>SMS Bulk Campaigning</h5>
              <p className="mb-0 text-white-50" style={{ fontSize: "12px" }}>
                TRAI DLT compliant enterprise SMS broadcaster with 6-character sender headers and dynamic audience reach
              </p>
            </div>
          </div>
          <Button
            color="primary"
            size="sm"
            className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5"
            onClick={() => {
              if (lists.length > 0 && !form.listId) {
                handleListChange(lists[0]._id);
              }
              setModal(true);
            }}
          >
            <FaPlus size={11} /> Launch SMS Campaign
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
                <small className="text-primary fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheck size={9} className="me-1" />DLT Scrubbed
                </small>
              </div>
              <div className="rounded-2 bg-primary bg-opacity-10 p-2 text-primary">
                <FaCommentAlt size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Delivered SMS
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{totalDelivered.toLocaleString()}</h4>
                <small className="text-success fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheckCircle size={9} className="me-1" />Handset delivered
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
                  Sender Headers
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{fromIds.length > 0 ? fromIds.length : "1 Active"}</h4>
                <small className="text-info fw-semibold" style={{ fontSize: "10.5px" }}>
                  BYDSND Verified
                </small>
              </div>
              <div className="rounded-2 bg-info bg-opacity-10 p-2 text-info">
                <FaMobileAlt size={18} />
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

      {/* TABLE CARD */}
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
                    placeholder="Search SMS campaigns by name or sender header..."
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
                    <th style={{ padding: "8px 10px" }}>Campaign Name & Header</th>
                    <th style={{ padding: "8px 10px" }}>Target Audience</th>
                    <th style={{ padding: "8px 10px" }}>Delivery Progress</th>
                    <th style={{ padding: "8px 10px" }}>Schedule</th>
                    <th style={{ padding: "8px 10px" }}>Status</th>
                    <th className="text-center" style={{ width: "110px", padding: "8px 10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12.5px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        <FaCommentAlt size={32} className="text-primary opacity-50 mb-2" />
                        <h6 className="fw-bold text-dark mb-1">No SMS Campaigns Found</h6>
                        <p className="text-muted small mb-2">
                          Launch your first bulk SMS broadcast campaign using your verified DLT headers.
                        </p>
                        <Button color="primary" size="sm" onClick={() => setModal(true)}>
                          <FaPlus size={10} className="me-1" /> Launch SMS Campaign
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => {
                      const total = c.totalRecipients || c.totalSent || 1;
                      const delivered = c.delivered || c.deliveredCount || 0;
                      const progressPct = Math.min(100, Math.round((delivered / total) * 100));

                      return (
                        <tr key={c._id || idx}>
                          <td className="text-muted small" style={{ padding: "8px 10px" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div className="d-flex align-items-center gap-1.5">
                              <FaCommentAlt size={12} className="text-primary flex-shrink-0" />
                              <span className="fw-bold text-dark">{c.name}</span>
                            </div>
                            <small className="text-muted font-monospace d-block" style={{ fontSize: "10.5px" }}>
                              Header: <strong className="text-dark">{c.senderId || "BYDSND"}</strong>
                            </small>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge color="light" className="border text-dark py-0.5 px-2 fw-semibold">
                              <FaUsers size={9} className="me-1 text-primary" />
                              {c.audienceName || (c.listId?.name) || "SMS Audience"}
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
                            <Progress value={progressPct} color="primary" style={{ height: "4px" }} className="rounded-pill" />
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

      {/* LAUNCH SMS MODAL */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="xl">
        <ModalHeader toggle={() => setModal(false)} className="bg-dark text-white py-2.5 px-3">
          <FaCommentAlt className="me-2 text-primary" /> Launch SMS Bulk Campaign
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-3 bg-light">
            <Row className="g-3">
              <Col xs={12} lg={7}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Campaign Name *</Label>
                  <Input
                    placeholder="e.g. Festive Discount SMS Blast"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    size="sm"
                  />
                </FormGroup>

                <Row className="g-2 mb-2">
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">DLT Sender Header</Label>
                      <Input
                        type="select"
                        size="sm"
                        value={form.senderId}
                        onChange={(e) => setForm({ ...form, senderId: e.target.value })}
                        required
                      >
                        <option value="BYDSND">BYDSND (Default)</option>
                        {fromIds.map(f => (
                          <option key={f._id || f.id} value={f.senderId || f.name}>{f.senderId || f.name}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">DLT Template ID</Label>
                      <Input
                        type="select"
                        size="sm"
                        value={form.dltTemplateId}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                      >
                        <option value="">-- Choose Template (Optional) --</option>
                        {templates.map(t => (
                          <option key={t._id || t.id} value={t._id || t.id}>{t.name || t.dltTemplateId}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                {/* TARGET AUDIENCE 4-MODE SWITCHER */}
                <div className="border rounded-2 p-2.5 bg-white mb-2 shadow-xs">
                  <Label className="fw-bold small text-dark mb-1.5 d-block">
                    Select Audience Targeting Mode *
                  </Label>
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "GROUP" ? "primary" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "GROUP" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("GROUP")}
                    >
                      <FaLayerGroup size={11} /> Saved Group ({lists.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "INDIVIDUAL" ? "primary" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "INDIVIDUAL" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("INDIVIDUAL")}
                    >
                      <FaUser size={11} /> Individual Contacts ({selectedIndividualIds.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "CSV" ? "primary" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "CSV" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("CSV")}
                    >
                      <FaFileImport size={11} /> Import CSV ({parsedCsvContacts.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "DIRECT" ? "primary" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "DIRECT" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("DIRECT")}
                    >
                      <FaMobileAlt size={11} /> Direct Numbers
                    </Button>
                  </div>

                  {/* MODE 1: TARGET GROUP */}
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

                  {/* MODE 2: INDIVIDUAL CONTACTS */}
                  {targetMode === "INDIVIDUAL" && (
                    <div>
                      <InputGroup size="sm" className="mb-1.5">
                        <InputGroupText className="bg-light py-0 px-2">
                          <FaSearch size={10} />
                        </InputGroupText>
                        <Input
                          placeholder="Search subscribers by name or mobile..."
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
                                    <td className="font-monospace text-muted" style={{ padding: "4px 8px" }}>
                                      {c.mobileNumber || c.phone || "—"}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <small className="text-primary fw-semibold d-block mt-1" style={{ fontSize: "11px" }}>
                        {selectedIndividualIds.length} contact(s) selected
                      </small>
                    </div>
                  )}

                  {/* MODE 3: CSV IMPORT */}
                  {targetMode === "CSV" && (
                    <div>
                      <div
                        className="p-2.5 text-center border-2 rounded-2 bg-light"
                        style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}
                      >
                        <FaFileImport size={18} className="text-primary mb-1" />
                        <p className="fw-bold text-dark small mb-1" style={{ fontSize: "11.5px" }}>Upload CSV / Excel with Mobile Numbers</p>
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleCsvUpload}
                          className="d-none"
                          id="smsModalCsvUpload"
                        />
                        <Label for="smsModalCsvUpload" className="btn btn-outline-primary btn-sm py-0.5 px-3 fw-bold mb-0" style={{ fontSize: "11px" }}>
                          Browse File
                        </Label>
                      </div>
                      {parsedCsvContacts.length > 0 && (
                        <div className="mt-1.5 text-success small fw-semibold" style={{ fontSize: "11px" }}>
                          <FaCheck size={10} className="me-1" />
                          {parsedCsvContacts.length} numbers ready for broadcast!
                        </div>
                      )}
                    </div>
                  )}

                  {/* MODE 4: DIRECT NUMBERS */}
                  {targetMode === "DIRECT" && (
                    <div>
                      <Input
                        type="textarea"
                        rows={2}
                        placeholder="Type or paste mobile numbers separated by commas or lines"
                        value={directNumbersText}
                        onChange={(e) => setDirectNumbersText(e.target.value)}
                        className="font-monospace"
                        style={{ fontSize: "11px" }}
                      />
                      <small className="text-muted d-block mt-0.5" style={{ fontSize: "10.5px" }}>
                        {effectiveRecipientCount} valid number(s) entered
                      </small>
                    </div>
                  )}
                </div>

                <FormGroup className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label className="fw-bold small text-dark mb-0">SMS Message Body *</Label>
                    <span className="small text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                      {charLength} chars · {creditsPerSms} credit(s)
                    </span>
                  </div>
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Enter DLT approved SMS message text..."
                    value={form.messageBody}
                    onChange={(e) => setForm({ ...form, messageBody: e.target.value })}
                    required
                    style={{ fontSize: "12px" }}
                  />
                </FormGroup>

                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark mb-1">Schedule Dispatch</Label>
                  <div className="d-flex gap-2 mb-1.5">
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "IMMEDIATE" ? "primary" : "light"}
                      className={`fw-semibold py-1 px-3 border ${form.scheduleType === "IMMEDIATE" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setForm({ ...form, scheduleType: "IMMEDIATE" })}
                    >
                      Immediate Blast
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "SCHEDULED" ? "primary" : "light"}
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

              {/* RIGHT COLUMN: SMS PHONE PREVIEW */}
              <Col xs={12} lg={5}>
                <div className="rounded-3 p-2.5 shadow-sm border bg-white h-100 d-flex flex-column">
                  <div className="border-bottom pb-1.5 mb-2 text-center">
                    <span className="fw-bold text-dark d-block" style={{ fontSize: "12px" }}>
                      {form.senderId || "BYDSND"}
                    </span>
                    <small className="text-muted" style={{ fontSize: "10px" }}>TRAI DLT Verified Header</small>
                  </div>

                  <div className="flex-grow-1 p-2.5 rounded-2" style={{ background: "#f1f5f9" }}>
                    <div className="bg-white p-2.5 rounded-2 shadow-xs border" style={{ maxWidth: "250px" }}>
                      <p className="mb-1 text-dark" style={{ whiteSpace: "pre-wrap", fontSize: "11.5px" }}>
                        {form.messageBody || "Dear Customer, use code FLASH20 to get 20% off on your order at BeyondSend."}
                      </p>
                      <small className="text-muted d-block text-end" style={{ fontSize: "9.5px" }}>Now</small>
                    </div>
                  </div>

                  <div className="mt-2 p-1.5 bg-light rounded text-center small text-muted border" style={{ fontSize: "11px" }}>
                    Target: <strong className="text-dark">{targetMode}</strong> · Recipients: <strong className="text-primary">{effectiveRecipientCount.toLocaleString()}</strong> · Est. Credits: <strong>{(effectiveRecipientCount * creditsPerSms).toLocaleString()}</strong>
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white py-2 px-3">
            <Button color="secondary" outline size="sm" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" size="sm" disabled={btnLoading || effectiveRecipientCount === 0} className="fw-bold px-3">
              {btnLoading ? <Spinner size="sm" /> : (
                <>
                  <FaPaperPlane size={11} className="me-1" /> Start SMS Broadcast ({effectiveRecipientCount.toLocaleString()})
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SmsCampaigns;
