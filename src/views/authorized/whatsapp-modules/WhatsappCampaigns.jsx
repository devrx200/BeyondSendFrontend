import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Progress, InputGroup, InputGroupText,
  Spinner, Alert
} from "reactstrap";
import {
  FaWhatsapp, FaPlus, FaSearch, FaPlay, FaPause,
  FaCheckCircle, FaClock, FaChartBar, FaTrash, FaCheck,
  FaSyncAlt, FaUsers, FaUser, FaFileImport,
  FaMobileAlt, FaLayerGroup, FaPaperPlane
} from "react-icons/fa";
import * as XLSX from "xlsx";
import apiClient, { getApiResponseData } from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const WhatsappCampaigns = () => {
  const { toasts, toast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [lists, setLists] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [primaryAccount, setPrimaryAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [campaignError, setCampaignError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modal, setModal] = useState(false);

  // Audience targeting mode: "GROUP" | "INDIVIDUAL" | "CSV" | "DIRECT"
  const [targetMode, setTargetMode] = useState("GROUP");

  // Selection states
  const [selectedIndividualIds, setSelectedIndividualIds] = useState([]);
  const [parsedCsvContacts, setParsedCsvContacts] = useState([]);
  const [directNumbersText, setDirectNumbersText] = useState("");
  const [contactSearchTerm, setContactSearchTerm] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    senderId: "",
    category: "MARKETING",
    wabaTemplateId: "",
    selectedTemplateObj: null,
    listId: "",
    audienceName: "",
    totalRecipients: 0,
    templateParameters: [],
    scheduleType: "IMMEDIATE",
    scheduledFor: new Date().toISOString().slice(0, 16),
    messageBody: ""
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [cmpRes, listRes, tplRes, conRes] = await Promise.all([
        apiClient.get("/whatsapp/campaigns/list", { params: { syncProvider: true } }),
        apiClient.get("/contact-lists/list", { params: { channel: "WHATSAPP" } }),
        apiClient.get("/whatsapp/templates/list", {
          params: { status: "APPROVED", limit: "ALL" }
        }),
        apiClient.get("/contacts/list", { params: { channel: "WHATSAPP", limit: 200 } })
      ]);

      const cmpData = getApiResponseData(cmpRes);
      const listData = getApiResponseData(listRes);
      const tplData = getApiResponseData(tplRes);
      const conData = getApiResponseData(conRes);
      const templateResponse =
        tplRes?.success !== undefined
          ? tplRes
          : tplRes?.data?.success !== undefined
            ? tplRes.data
            : tplRes;
      const configId = String(templateResponse?.primaryConfigId || "");
      const provider = String(templateResponse?.primaryProvider || "").toLowerCase();

      setCampaigns(Array.isArray(cmpData) ? cmpData : []);
      const metricWarnings = cmpRes?.warnings?.providerMetrics || [];
      if (metricWarnings.length) {
        toast.error(`Campaign metrics could not be refreshed: ${metricWarnings.join("; ")}`);
      }
      setLists(Array.isArray(listData) ? listData : []);
      setPrimaryAccount({
        configId,
        configName: templateResponse?.primaryConfigName || "",
        provider,
        senderNumber: templateResponse?.primarySenderNumber || "",
        credentialsConfigured: templateResponse?.primaryCredentialsConfigured === true,
      });
      setTemplates(
        Array.isArray(tplData)
          ? tplData.filter((template) => {
              const mappings = template.providerTemplates || [];
              const activeMapping = configId
                ? mappings.find((mapping) => mapping.configId === configId)
                : mappings.find(
                    (mapping) =>
                      String(mapping.providerCode || "").toLowerCase() === provider
                  );
              if (mappings.length > 0 && !activeMapping) return false;
              return (
                String(
                  activeMapping?.status ||
                    (mappings.length === 0
                      ? template.providerStatus || template.status
                      : "")
                ).toUpperCase() === "APPROVED"
              );
            })
          : []
      );
      setAllContacts(Array.isArray(conData) ? conData : []);
    } catch (err) {
      console.error("Fetch WhatsApp campaigns error:", err);
      toast.error(err?.response?.data?.message || "Failed to load WhatsApp campaigns");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  const handleListChange = (listId) => {
    const found = lists.find(l => String(l._id) === String(listId));
    setForm(prev => ({
      ...prev,
      listId,
      audienceName: found ? found.name : "Custom Audience",
      totalRecipients: found ? (found.validContacts ?? found.totalContacts ?? 0) : 0
    }));
  };

  const handleTemplateChange = (tplId) => {
    const found = templates.find(t => String(t._id) === String(tplId) || String(t.id) === String(tplId));
    const variableCount = new Set(found?.body?.match(/\{\{\d+\}\}/g) || []).size;
    setForm(prev => ({
      ...prev,
      wabaTemplateId: found?._id || found?.id || "",
      selectedTemplateObj: found || null,
      messageBody: found ? (found.body || "") : "",
      templateParameters: Array.from({ length: variableCount }, () => "")
    }));
  };

  const filteredTemplates = useMemo(() => {
    const term = templateSearch.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter((template) =>
      [template.name, template.category, template.body]
        .some((value) => String(value || "").toLowerCase().includes(term))
    );
  }, [templateSearch, templates]);

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
          const phone = String(r["WhatsApp Number"] || r.WhatsApp || r.Mobile || r.Phone || r.phone || "").trim();
          return { fullName: name, name, phone, mobileNumber: phone, whatsappNumber: phone };
        }).filter(c => c.phone);

        setParsedCsvContacts(normalized);
        setForm(prev => ({ ...prev, totalRecipients: normalized.length, audienceName: `CSV Import (${file.name})` }));
        toast.info(`Parsed ${normalized.length} contacts from ${file.name}`);
      } catch (err) {
        console.error("Parse CSV error:", err);
        toast.error("Failed to parse CSV file. Please check columns.");
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
    setCampaignError("");
    if (!form.name.trim()) {
      toast.warning("Campaign Name is required");
      return;
    }

    if (targetMode === "GROUP" && !form.listId) {
      toast.warning("Please select a target Audience Group");
      return;
    }
    if (targetMode === "INDIVIDUAL" && selectedIndividualIds.length === 0) {
      toast.warning("Please select at least one contact");
      return;
    }
    if (targetMode === "CSV" && parsedCsvContacts.length === 0) {
      toast.warning("Please upload a CSV file with WhatsApp numbers");
      return;
    }
    if (targetMode === "DIRECT" && effectiveRecipientCount === 0) {
      toast.warning("Please enter at least one WhatsApp number");
      return;
    }
    if (!form.wabaTemplateId) {
      toast.warning("Select an approved WhatsApp template");
      return;
    }
    if (
      form.scheduleType === "SCHEDULED" &&
      (!form.scheduledFor || new Date(form.scheduledFor) <= new Date())
    ) {
      toast.warning("Choose a schedule time in the future");
      return;
    }

    try {
      setBtnLoading(true);

      const contacts =
        targetMode === "CSV"
          ? parsedCsvContacts
          : targetMode === "DIRECT"
            ? directNumbersText
                .split(/[\n,]+/)
                .map((phone, index) => ({
                  fullName: `Subscriber ${index + 1}`,
                  whatsappNumber: phone.trim()
                }))
                .filter((contact) => contact.whatsappNumber)
            : undefined;
      const calculatedAudienceName =
        targetMode === "GROUP"
          ? lists.find((list) => String(list._id) === String(form.listId))?.name
          : targetMode === "CSV"
            ? `CSV Import (${parsedCsvContacts.length})`
            : targetMode === "DIRECT"
              ? `Direct Numbers (${effectiveRecipientCount})`
              : `Selected Contacts (${selectedIndividualIds.length})`;

      const res = await apiClient.post("/whatsapp/campaigns/create", {
        name: form.name.trim(),
        category: form.category,
        templateId: form.wabaTemplateId,
        templateParameters: form.templateParameters,
        configId: primaryAccount?.configId || undefined,
        audienceName: calculatedAudienceName || "WhatsApp Audience",
        listId: targetMode === "GROUP" ? form.listId : undefined,
        contactIds: targetMode === "INDIVIDUAL" ? selectedIndividualIds : undefined,
        contacts,
        scheduleType: form.scheduleType,
        scheduledFor: form.scheduleType === "SCHEDULED"
          ? new Date(form.scheduledFor).toISOString()
          : undefined
      });

      toast.success(res?.data?.message || "WhatsApp campaign created successfully!");
      setModal(false);
      setParsedCsvContacts([]);
      setSelectedIndividualIds([]);
      setDirectNumbersText("");
      setForm({
        name: "",
        category: "MARKETING",
        wabaTemplateId: "",
        selectedTemplateObj: null,
        listId: "",
        audienceName: "",
        totalRecipients: 0,
        templateParameters: [],
        scheduleType: "IMMEDIATE",
        scheduledFor: new Date().toISOString().slice(0, 16),
        messageBody: ""
      });
      await fetchData();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Campaign creation failed. Check the active WhatsApp account and try again.";
      setCampaignError(message);
      toast.error(message);
    } finally {
      setBtnLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await apiClient.patch(`/whatsapp/campaigns/toggle-status/${id}`);
      toast.success(res?.data?.message || `Campaign status updated`);
      await fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Status toggle failed");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete WhatsApp Campaign?",
      `Are you sure you want to remove '${name}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/whatsapp/campaigns/delete/${id}`);
      toast.success(res?.data?.message || "Campaign deleted");
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

  // Accurate dynamic sums
  const totalDelivered = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.delivered || c.deliveredCount || 0), 0);
  }, [campaigns]);

  const totalRead = useMemo(() => {
    return campaigns.reduce((acc, c) => acc + (c.read || c.readCount || 0), 0);
  }, [campaigns]);

  const grandAudienceCount = useMemo(() => {
    return lists.reduce((acc, l) => acc + (l.totalContacts || 0), 0);
  }, [lists]);

  const filteredIndividualContacts = useMemo(() => {
    if (!contactSearchTerm.trim()) return allContacts;
    const term = contactSearchTerm.toLowerCase();
    return allContacts.filter(c =>
      (c.fullName || c.name || "").toLowerCase().includes(term) ||
      (c.whatsappNumber || c.mobileNumber || c.phone || "").includes(term)
    );
  }, [allContacts, contactSearchTerm]);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* COMPACT HEADER BANNER */}
      <Card className="border-0 shadow-sm rounded-3 mb-3" style={{ background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)" }}>
        <CardHeader className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-2.5 px-3 border-0 bg-transparent">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-success bg-opacity-25 border border-success border-opacity-50"
              style={{ width: "38px", height: "38px" }}
            >
              <FaWhatsapp size={20} className="text-success" />
            </div>
            <div>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: "16px" }}>WhatsApp Bulk Campaigns</h5>
              <p className="mb-0 text-white-50" style={{ fontSize: "12px" }}>
                Launch template-based campaigns and track delivery metrics
              </p>
            </div>
          </div>
          <Button
            color="success"
            size="sm"
            className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5"
            onClick={() => {
              setCampaignError("");
              if (lists.length > 0 && !form.listId) {
                handleListChange(lists[0]._id);
              }
              setModal(true);
            }}
          >
            <FaPlus size={11} /> Launch WhatsApp Campaign
          </Button>
        </CardHeader>
      </Card>

      {/* COMPACT METRIC CARDS (ZERO EXCESS MARGIN/PADDING) */}
      <Row className="g-2 mb-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Total Campaigns
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{campaigns.length}</h4>
                <small className="text-success fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheck size={9} className="me-1" />WABA Active
                </small>
              </div>
              <div className="rounded-2 bg-success bg-opacity-10 p-2 text-success">
                <FaWhatsapp size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Delivered Messages
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{totalDelivered.toLocaleString()}</h4>
                <small className="text-primary fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheckCircle size={9} className="me-1" />Delivered to phone
                </small>
              </div>
              <div className="rounded-2 bg-primary bg-opacity-10 p-2 text-primary">
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
                  Read Receipts
                </span>
                <h4 className="fw-bold text-dark mb-0 mt-0.5">{totalRead.toLocaleString()}</h4>
                <small className="text-info fw-semibold" style={{ fontSize: "10.5px" }}>
                  <FaCheckCircle size={9} className="me-1" />Blue ticks verified
                </small>
              </div>
              <div className="rounded-2 bg-info bg-opacity-10 p-2 text-info">
                <FaCheckCircle size={18} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm rounded-3 bg-white">
            <CardBody className="p-2.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted fw-semibold text-uppercase d-block" style={{ fontSize: "10.5px", letterSpacing: "0.4px" }}>
                  Target Audience
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

      {/* COMPACT TABLE CARD */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CardBody className="p-0">
          {/* TIGHT TOOLBAR */}
          <div className="p-2.5 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} sm={6} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted py-1">
                    <FaSearch size={11} />
                  </InputGroupText>
                  <Input
                    placeholder="Search campaigns by name or sender..."
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
                  <option value="PROCESSING">Processing</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAUSED">Paused</option>
                  <option value="DRAFT">Draft</option>
                  <option value="FAILED">Failed</option>
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
                    <th style={{ padding: "8px 10px" }}>Campaign Name & Sender</th>
                    <th style={{ padding: "8px 10px" }}>Target Audience Group</th>
                    <th style={{ padding: "8px 10px" }}>Progress & Delivery</th>
                    <th style={{ padding: "8px 10px" }}>Read Receipts</th>
                    <th style={{ padding: "8px 10px" }}>Schedule</th>
                    <th style={{ padding: "8px 10px" }}>Status</th>
                    <th className="text-center" style={{ width: "110px", padding: "8px 10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12.5px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        <FaWhatsapp size={32} className="text-success opacity-50 mb-2" />
                        <h6 className="fw-bold text-dark mb-1">No WhatsApp Campaigns Found</h6>
                        <p className="text-muted small mb-2">
                          Launch your first WhatsApp campaign targeting an Audience Group, Individual Contacts, or direct CSV.
                        </p>
                        <Button color="success" size="sm" onClick={() => setModal(true)}>
                          <FaPlus size={10} className="me-1" /> Launch WhatsApp Campaign
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((c, idx) => {
                      const total = c.totalRecipients || 0;
                      const sent = c.totalSent || 0;
                      const delivered = c.delivered || c.deliveredCount || 0;
                      const read = c.read || c.readCount || 0;
                      const progressPct = total > 0 ? Math.min(100, Math.round((sent / total) * 100)) : 0;
                      const readPct = delivered > 0 ? Math.min(100, Math.round((read / delivered) * 100)) : 0;

                      return (
                        <tr key={c._id || idx}>
                          <td className="text-muted small" style={{ padding: "8px 10px" }}>{idx + 1}</td>
                          <td style={{ padding: "8px 10px" }}>
                            <div className="d-flex align-items-center gap-1.5">
                              <FaWhatsapp size={13} className="text-success flex-shrink-0" />
                              <span className="fw-bold text-dark">{c.name}</span>
                            </div>
                            <small className="text-muted font-monospace d-block" style={{ fontSize: "10.5px" }}>
                              Sender: {c.senderId || "Configured sender"}
                            </small>
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <Badge color="light" className="border text-dark py-0.5 px-2 fw-semibold">
                              <FaUsers size={9} className="me-1 text-primary" />
                              {c.audienceName || (c.listId?.name) || "WhatsApp Audience"}
                            </Badge>
                            <small className="text-muted d-block mt-0.5" style={{ fontSize: "10.5px" }}>
                              {total.toLocaleString()} recipients
                            </small>
                          </td>
                          <td style={{ minWidth: "140px", padding: "8px 10px" }}>
                            <div className="d-flex justify-content-between small mb-0.5">
                              <span className="fw-semibold text-dark" style={{ fontSize: "11px" }}>{sent.toLocaleString()} submitted</span>
                              <span className="text-muted" style={{ fontSize: "10.5px" }}>{progressPct}%</span>
                            </div>
                            <Progress value={progressPct} color="success" style={{ height: "4px" }} className="rounded-pill" />
                          </td>
                          <td style={{ padding: "8px 10px" }}>
                            <span className="fw-bold text-info">
                              {read.toLocaleString()}
                            </span>
                            <small className="text-muted ms-1">({readPct}%)</small>
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
                                c.status === "PROCESSING" ? "success" :
                                (c.status === "SCHEDULED" ? "info" :
                                (c.status === "COMPLETED" ? "primary" :
                                (c.status === "PAUSED" ? "warning" :
                                (c.status === "FAILED" ? "danger" : "secondary"))))
                              }
                              className="py-0.5 px-2 rounded-pill font-monospace"
                              style={{ fontSize: "10px" }}
                            >
                              {c.status || "COMPLETED"}
                            </Badge>
                          </td>
                          <td className="text-center" style={{ padding: "8px 10px" }}>
                            <div className="d-inline-flex gap-1 align-items-center">
                              {["PROCESSING", "SCHEDULED", "PAUSED"].includes(c.status) && (
                                <Button
                                  size="sm"
                                  color="light"
                                  className="border px-1.5 py-0.5 text-secondary"
                                  title={c.status === "PAUSED" ? "Resume Campaign" : "Pause Campaign"}
                                  onClick={() => handleToggleStatus(c._id)}
                                >
                                  {c.status === "PAUSED" ? <FaPlay size={9} /> : <FaPause size={9} />}
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

      {/* ══════════════════════════════════════════════════════════
          MODAL: LAUNCH WHATSAPP CAMPAIGN (WITH 4 TARGETING MODES)
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="xl">
        <ModalHeader toggle={() => setModal(false)} className="bg-dark text-white py-2.5 px-3">
          <FaWhatsapp className="me-2 text-success" /> Launch WhatsApp Campaign
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-3 bg-light">
            {campaignError && (
              <Alert color="danger" className="py-2 small" role="alert">
                <strong>Campaign was not sent.</strong> {campaignError}
              </Alert>
            )}
            <Row className="g-3">
              {/* LEFT COLUMN: CONFIG & TARGETING */}
              <Col xs={12} lg={7}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Campaign Name *</Label>
                  <Input
                    placeholder="e.g. Diwali Flash Sale Announcement"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    size="sm"
                  />
                </FormGroup>

                <Row className="g-2 mb-2">
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">WhatsApp Sender</Label>
                      <div className="form-control form-control-sm bg-light d-flex align-items-center justify-content-between gap-2">
                        <span className={primaryAccount?.senderNumber ? "text-dark" : "text-danger"}>
                          {primaryAccount?.senderNumber || "Sender number not configured"}
                          {primaryAccount?.configName ? ` · ${primaryAccount.configName}` : ""}
                        </span>
                        <Badge
                          color={primaryAccount?.credentialsConfigured ? "success" : "warning"}
                          className="flex-shrink-0"
                          title="Credentials are used from the active account and remain hidden."
                        >
                          {primaryAccount?.credentialsConfigured ? "Credentials configured" : "Check account setup"}
                        </Badge>
                      </div>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark mb-1">Category</Label>
                      <Input
                        type="select"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        size="sm"
                      >
                        <option value="MARKETING">Marketing / Promotional</option>
                        <option value="UTILITY">Utility / Order Updates</option>
                        <option value="AUTHENTICATION">Authentication / OTP</option>
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
                      color={targetMode === "GROUP" ? "success" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "GROUP" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("GROUP")}
                    >
                      <FaLayerGroup size={11} /> Saved Group ({lists.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "INDIVIDUAL" ? "success" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "INDIVIDUAL" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("INDIVIDUAL")}
                    >
                      <FaUser size={11} /> Individual Contacts ({selectedIndividualIds.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "CSV" ? "success" : "light"}
                      className={`fw-semibold py-1 px-2.5 border d-flex align-items-center gap-1 ${targetMode === "CSV" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setTargetMode("CSV")}
                    >
                      <FaFileImport size={11} /> Import CSV ({parsedCsvContacts.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={targetMode === "DIRECT" ? "success" : "light"}
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
                          placeholder="Search subscribers by name or number..."
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
                                      {c.whatsappNumber || c.mobileNumber || c.phone || "—"}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </Table>
                      </div>
                      <small className="text-success fw-semibold d-block mt-1" style={{ fontSize: "11px" }}>
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
                        <FaFileImport size={18} className="text-success mb-1" />
                        <p className="fw-bold text-dark small mb-1" style={{ fontSize: "11.5px" }}>Upload CSV / Excel with WhatsApp Numbers</p>
                        <input
                          type="file"
                          accept=".csv, .xlsx, .xls"
                          onChange={handleCsvUpload}
                          className="d-none"
                          id="modalCsvUpload"
                        />
                        <Label for="modalCsvUpload" className="btn btn-outline-success btn-sm py-0.5 px-3 fw-bold mb-0" style={{ fontSize: "11px" }}>
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
                        placeholder="Type or paste WhatsApp numbers separated by commas or lines"
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
                  <Label className="fw-bold small text-dark mb-1">Approved WhatsApp Template *</Label>
                  <InputGroup size="sm" className="mb-1">
                    <InputGroupText className="bg-white">
                      <FaSearch size={11} />
                    </InputGroupText>
                    <Input
                      aria-label="Search approved WhatsApp templates"
                      placeholder="Search templates by name or content..."
                      value={templateSearch}
                      onChange={(event) => setTemplateSearch(event.target.value)}
                    />
                  </InputGroup>
                  <Input
                    type="select"
                    size="sm"
                    value={form.wabaTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    required
                  >
                    <option value="">-- Select an approved template --</option>
                    {filteredTemplates.map(t => (
                      <option key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.category || "UTILITY"})</option>
                    ))}
                  </Input>
                  {templates.length === 0 && (
                    <small className="text-danger d-block mt-1">
                      No approved templates are available for the active WhatsApp account. Sync templates for this account first.
                    </small>
                  )}
                  {templates.length > 0 && filteredTemplates.length === 0 && (
                    <small className="text-muted d-block mt-1">No templates match your search.</small>
                  )}
                </FormGroup>

                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark mb-1">Approved Template Content</Label>
                  <Input
                    type="textarea"
                    rows={3}
                    value={form.messageBody}
                    readOnly
                    style={{ fontSize: "12px" }}
                    placeholder="Select an approved template to view its content"
                  />
                </FormGroup>

                {form.templateParameters.map((value, index) => (
                  <FormGroup className="mb-2" key={`${form.wabaTemplateId}-${index}`}>
                    <Label className="fw-bold small text-dark mb-1">
                      Template variable {`{{${index + 1}}}`} *
                    </Label>
                    <Input
                      size="sm"
                      value={value}
                      onChange={(event) => {
                        const templateParameters = [...form.templateParameters];
                        templateParameters[index] = event.target.value;
                        setForm({ ...form, templateParameters });
                      }}
                      required
                    />
                  </FormGroup>
                ))}

                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark mb-1">Schedule Dispatch</Label>
                  <div className="d-flex gap-2 mb-1.5">
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "IMMEDIATE" ? "success" : "light"}
                      className={`fw-semibold py-1 px-3 border ${form.scheduleType === "IMMEDIATE" ? "text-white" : "text-muted"}`}
                      style={{ fontSize: "11px" }}
                      onClick={() => setForm({ ...form, scheduleType: "IMMEDIATE" })}
                    >
                      Immediate Blast
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      color={form.scheduleType === "SCHEDULED" ? "success" : "light"}
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

              {/* RIGHT COLUMN: WHATSAPP PHONE SCREEN PREVIEW */}
              <Col xs={12} lg={5}>
                <div className="rounded-3 p-2.5 shadow-sm border bg-white h-100 d-flex flex-column">
                  <div className="d-flex align-items-center justify-content-between border-bottom pb-1.5 mb-2">
                    <div className="d-flex align-items-center gap-1.5">
                      <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
                        <FaWhatsapp size={16} />
                      </div>
                      <div>
                        <span className="fw-bold text-dark d-block" style={{ fontSize: "12px" }}>WhatsApp template preview</span>
                        <small className="text-muted" style={{ fontSize: "10px" }}>
                          {primaryAccount?.senderNumber || "Active WhatsApp sender"}
                        </small>
                      </div>
                    </div>
                    <Badge color="success-subtle" className="text-success border border-success-subtle py-0.5 px-1.5" style={{ fontSize: "10px" }}>
                      Preview only
                    </Badge>
                  </div>

                  <div className="flex-grow-1 p-2.5 rounded-2" style={{ background: "#e5ddd5" }}>
                    <div className="bg-white p-2.5 rounded-2 shadow-xs" style={{ maxWidth: "250px" }}>
                      <p className="mb-1 text-dark" style={{ whiteSpace: "pre-wrap", fontSize: "11.5px" }}>
                        {form.templateParameters.reduce(
                          (message, value, index) =>
                            message.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, "g"), value || `{{${index + 1}}}`),
                          form.messageBody || "Select an approved template to preview the message."
                        )}
                      </p>
                      <div className="d-flex justify-content-end align-items-center gap-1 text-muted" style={{ fontSize: "9.5px" }}>
                        <span>Not sent</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 p-1.5 bg-light rounded text-center small text-muted border" style={{ fontSize: "11px" }}>
                    Target: <strong className="text-dark">{targetMode}</strong> · Recipients: <strong className="text-success">{effectiveRecipientCount.toLocaleString()}</strong> WhatsApp users
                    <div className="mt-1">Preview only; delivery status appears after provider confirmation.</div>
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white py-2 px-3">
            <Button color="secondary" outline size="sm" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="success" type="submit" size="sm" disabled={btnLoading || effectiveRecipientCount === 0} className="fw-bold px-3">
              {btnLoading ? <Spinner size="sm" /> : (
                <>
                  <FaPaperPlane size={11} className="me-1" /> Start WhatsApp Broadcast ({effectiveRecipientCount.toLocaleString()})
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default WhatsappCampaigns;
