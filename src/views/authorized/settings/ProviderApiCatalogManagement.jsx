import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Badge,
  Row,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Alert,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  FaCode,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaSearch,
  FaCheck,
  FaCopy,
  FaPlay,
  FaInfoCircle,
  FaShieldAlt,
  FaEllipsisV,
  FaNetworkWired,
  FaExternalLinkAlt,
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

const API_CATEGORIES = [
  "TEMPLATES",
  "MESSAGING",
  "CAMPAIGNS",
  "MEDIA",
  "REPORTS",
  "ACCOUNT",
  "AUTH",
  "WEBHOOK",
  "OPTIN",
  "CATALOG",
  "GATEWAY_OTP",
  "GENERAL",
];

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const AUTH_TYPES = [
  "BEARER",
  "API_KEY_HEADER",
  "QUERY_PARAM",
  "BASIC",
  "BOT_TOKEN_PATH",
  "CUSTOM",
  "NONE",
];

const METHOD_COLOR_MAP = {
  GET: "primary",
  POST: "success",
  PUT: "warning",
  DELETE: "danger",
  PATCH: "info",
};

const CHANNEL_COLOR_MAP = {
  WHATSAPP: "#25D366",
  SMS: "#0ca678",
  RCS: "#7950f2",
  VOICE: "#fd7e14",
  EMAIL: "#228be6",
  TELEGRAM: "#0088cc",
  PUSH: "#e03131",
};

/* ── Date/Time Formatter for Table Displays ── */
const formatTableDateTime = (val) => {
  if (!val) return { date: "—", time: "" };
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return { date: "—", time: "" };
    const date = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: "—", time: "" };
  }
};

const emptyApiForm = () => ({
  channelCode: "WHATSAPP",
  providerCode: "ROUTEMOBILE_WA",
  operation: "",
  name: "",
  category: "TEMPLATES",
  description: "",
  method: "POST",
  baseUrl: "https://apis.rmlconnect.net",
  endpointPath: "/wba/templates",
  authType: "BEARER",
  authKeyField: "jwtAuth",
  headersTemplate: '{\n  "Content-Type": "application/json"\n}',
  requestMapping: "{}",
  responseMapping: "{}",
  samplePayload: "{}",
  sampleResponse: "{}",
  version: "v1",
  rateLimitPerSec: 50,
  isActive: true,
});

const unwrapData = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};

const ProviderApiCatalogManagement = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [apis, setApis] = useState([]);
  const [channels, setChannels] = useState([]);
  const [providers, setProviders] = useState([]);

  // Filters
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [selectedProvider, setSelectedProvider] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Role check: Only ADMIN and DEVOPS
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isAdminOrDevops = ["ADMIN", "DEVOPS"].includes((currentUser?.role || "").toUpperCase());

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState(null);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testItem, setTestItem] = useState(null);
  const [testPayload, setTestPayload] = useState("{}");
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyApiForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalTab, setModalTab] = useState("general");
  const [copiedKey, setCopiedKey] = useState(null);

  // Load Channels & Providers dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [chRes, prRes] = await Promise.all([
          apiClient.get("/registry/channels").catch(() => null),
          apiClient.get("/registry/providers").catch(() => null),
        ]);

        const rawCh = unwrapData(chRes);
        if (rawCh.length > 0) {
          setChannels(rawCh);
        } else {
          setChannels([
            { code: "WHATSAPP", name: "WhatsApp Business" },
            { code: "SMS", name: "SMS Gateway" },
            { code: "RCS", name: "RCS Messaging" },
            { code: "TELEGRAM", name: "Telegram Bot" },
            { code: "EMAIL", name: "Email Relay" },
            { code: "VOICE", name: "Voice / OBD" },
            { code: "PUSH", name: "Push Notifications" },
          ]);
        }

        const rawPr = unwrapData(prRes);
        if (rawPr.length > 0) {
          setProviders(rawPr);
        } else {
          setProviders([
            { code: "ROUTEMOBILE_WA", name: "RouteMobile WhatsApp" },
            { code: "META_CLOUD", name: "Meta Cloud API" },
            { code: "JIO_RCS", name: "Jio Business Messaging" },
            { code: "TELEGRAM_BOT", name: "Official Telegram Bot" },
            { code: "MOBIGLITZ_SMS", name: "Mobiglitz SMS" },
            { code: "TWILIO_SMS", name: "Twilio Gateway" },
          ]);
        }
      } catch (err) {
        console.warn("Metadata fetch error:", err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch API Catalog items
  const loadApis = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedChannel && selectedChannel !== "ALL") params.set("channelCode", selectedChannel);
      if (selectedProvider && selectedProvider !== "ALL") params.set("providerCode", selectedProvider);
      if (selectedCategory && selectedCategory !== "ALL") params.set("category", selectedCategory);
      if (selectedMethod && selectedMethod !== "ALL") params.set("method", selectedMethod);
      if (statusFilter && statusFilter !== "ALL") params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
      if (search.trim()) params.set("search", search.trim());

      const res = await apiClient.get(`/provider-api-catalogs?${params.toString()}`);
      const list = unwrapData(res) || [];
      setApis(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load provider API catalog");
      setApis([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedProvider, selectedCategory, selectedMethod, statusFilter, search, toast]);

  useEffect(() => {
    loadApis();
  }, [loadApis]);

  // Providers filtered by currently selected channel in modal form
  const availableModalProviders = useMemo(() => {
    if (!form.channelCode) return providers;
    const filtered = providers.filter((p) => {
      if (!Array.isArray(p.channels) || p.channels.length === 0) return true;
      return p.channels.some((c) => String(c).toUpperCase() === form.channelCode.toUpperCase());
    });
    return filtered.length > 0 ? filtered : providers;
  }, [form.channelCode, providers]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyApiForm(),
      channelCode: selectedChannel !== "ALL" ? selectedChannel : (channels[0]?.code || "WHATSAPP"),
      providerCode: selectedProvider !== "ALL" ? selectedProvider : (providers[0]?.code || "ROUTEMOBILE_WA"),
    });
    setModalTab("general");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingId(item._id);
    setForm({
      channelCode: item.channelCode || item.channel || "WHATSAPP",
      providerCode: item.providerCode || item.provider || "ROUTEMOBILE_WA",
      operation: item.operation || "",
      name: item.name || "",
      category: item.category || "GENERAL",
      description: item.description || "",
      method: item.method || "POST",
      baseUrl: item.baseUrl || "",
      endpointPath: item.endpointPath || "",
      authType: item.authType || "BEARER",
      authKeyField: item.authKeyField || "apiKey",
      headersTemplate: typeof item.headersTemplate === "object" ? JSON.stringify(item.headersTemplate, null, 2) : (item.headersTemplate || "{}"),
      requestMapping: typeof item.requestMapping === "object" ? JSON.stringify(item.requestMapping, null, 2) : (item.requestMapping || "{}"),
      responseMapping: typeof item.responseMapping === "object" ? JSON.stringify(item.responseMapping, null, 2) : (item.responseMapping || "{}"),
      samplePayload: typeof item.samplePayload === "object" ? JSON.stringify(item.samplePayload, null, 2) : (item.samplePayload || "{}"),
      sampleResponse: typeof item.sampleResponse === "object" ? JSON.stringify(item.sampleResponse, null, 2) : (item.sampleResponse || "{}"),
      version: item.version || "v1",
      rateLimitPerSec: item.rateLimitPerSec || 50,
      isActive: item.isActive !== false,
    });
    setModalTab("general");
    setModalOpen(true);
  };

  // Open Inspect Modal
  const openInspectModal = (item) => {
    setInspectItem(item);
    setInspectModalOpen(true);
  };

  // Open Test Probe Modal
  const openTestModal = (item) => {
    setTestItem(item);
    setTestResult(null);
    setTestPayload(
      typeof item.samplePayload === "object" && item.samplePayload
        ? JSON.stringify(item.samplePayload, null, 2)
        : "{}"
    );
    setTestModalOpen(true);
  };

  // Handle Save (Create / Update)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.channelCode.trim() || !form.providerCode.trim() || !form.operation.trim() || !form.name.trim() || !form.baseUrl.trim() || !form.endpointPath.trim()) {
      toast.warning("Please fill in all required fields (Channel, Provider, Operation, Name, Base URL, Endpoint)");
      return;
    }

    let parsedHeaders = {};
    let parsedReqMap = {};
    let parsedResMap = {};
    let parsedSample = null;
    let parsedSampleRes = null;

    try {
      if (form.headersTemplate?.trim()) parsedHeaders = JSON.parse(form.headersTemplate);
    } catch {
      toast.warning("Invalid JSON in Headers Template");
      return;
    }

    try {
      if (form.requestMapping?.trim()) parsedReqMap = JSON.parse(form.requestMapping);
    } catch {
      toast.warning("Invalid JSON in Request Mapping");
      return;
    }

    try {
      if (form.responseMapping?.trim()) parsedResMap = JSON.parse(form.responseMapping);
    } catch {
      toast.warning("Invalid JSON in Response Mapping");
      return;
    }

    try {
      if (form.samplePayload?.trim()) parsedSample = JSON.parse(form.samplePayload);
    } catch {
      toast.warning("Invalid JSON in Sample Payload");
      return;
    }

    try {
      if (form.sampleResponse?.trim()) parsedSampleRes = JSON.parse(form.sampleResponse);
    } catch {
      toast.warning("Invalid JSON in Sample Response");
      return;
    }

    const payload = {
      channelCode: form.channelCode.trim().toUpperCase(),
      channel: form.channelCode.trim().toUpperCase(),
      providerCode: form.providerCode.trim().toUpperCase(),
      provider: form.providerCode.trim().toUpperCase(),
      operation: form.operation.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      method: form.method.toUpperCase(),
      baseUrl: form.baseUrl.trim().replace(/\/+$/, ""),
      endpointPath: form.endpointPath.trim().startsWith("/") ? form.endpointPath.trim() : `/${form.endpointPath.trim()}`,
      authType: form.authType,
      authKeyField: form.authKeyField.trim(),
      headersTemplate: parsedHeaders,
      requestMapping: parsedReqMap,
      responseMapping: parsedResMap,
      samplePayload: parsedSample,
      sampleResponse: parsedSampleRes,
      version: form.version.trim() || "v1",
      rateLimitPerSec: Number(form.rateLimitPerSec) || 50,
      isActive: form.isActive,
    };

    try {
      setActionLoading(true);
      if (editingId) {
        await apiClient.put(`/provider-api-catalogs/${editingId}`, payload);
        toast.success("Provider API definition updated successfully");
      } else {
        await apiClient.post("/provider-api-catalogs", payload);
        toast.success("Provider API registered into catalog successfully");
      }
      setModalOpen(false);
      loadApis();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save Provider API");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active status
  const handleToggle = async (item) => {
    try {
      await apiClient.patch(`/provider-api-catalogs/${item._id}/toggle`);
      toast.success(`${item.name} is now ${item.isActive ? "Inactive" : "Active"}`);
      loadApis();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to toggle status");
    }
  };

  // Delete API definition
  const handleDelete = async (item) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Provider API Definition?",
      `Are you sure you want to remove <strong>${item.name}</strong> (${item.providerCode} / ${item.operation})?`
    );
    if (!isConfirmed) return;

    try {
      await apiClient.delete(`/provider-api-catalogs/${item._id}`);
      toast.success("Provider API definition deleted successfully");
      loadApis();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete API definition");
    }
  };

  // Test Dispatch Probe
  const handleExecuteTest = async () => {
    if (!testItem) return;
    setTestLoading(true);
    setTestResult(null);

    let parsedData = {};
    try {
      if (testPayload.trim()) parsedData = JSON.parse(testPayload);
    } catch {
      toast.warning("Invalid JSON in Test Payload");
      setTestLoading(false);
      return;
    }

    try {
      const res = await apiClient.post("/provider-api-catalogs/dispatch-test", {
        channelCode: testItem.channelCode || testItem.channel,
        operation: testItem.operation,
        data: parsedData,
      });
      setTestResult({ success: true, data: res?.data || res });
      toast.success("Test dispatch executed!");
    } catch (err) {
      setTestResult({
        success: false,
        error: err?.response?.data || err?.message || "Dispatch error",
      });
      toast.error(err?.response?.data?.message || err?.message || "Test dispatch failed");
    } finally {
      setTestLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(typeof text === "object" ? JSON.stringify(text, null, 2) : String(text));
    setCopiedKey(key);
    toast.info("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compute summary metrics
  const stats = useMemo(() => {
    const total = apis.length;
    const active = apis.filter((a) => a.isActive).length;
    const wa = apis.filter((a) => (a.channelCode || a.channel) === "WHATSAPP").length;
    const rcs = apis.filter((a) => (a.channelCode || a.channel) === "RCS").length;
    return { total, active, wa, rcs };
  }, [apis]);

  if (!isAdminOrDevops) {
    return (
      <div className="telecom-module-wrapper p-4">
        <Alert color="danger" className="d-flex align-items-center gap-2">
          <FaShieldAlt size={22} />
          <div>
            <strong>Access Denied:</strong> Provider API Catalog Management is restricted to DevOps and Platform Administrators only.
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="provider-api-catalog-page p-3">
      <ToastContainer toasts={toasts} />

      {/* ── Page Header (Matching Channel Category Master Style) ── */}
      <Card className="shadow-sm border-0 mb-3 bg-gradient-primary text-white">
        <CardHeader className="bg-transparent border-0 d-flex flex-wrap align-items-center justify-content-between p-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 p-2.5" style={{ width: 48, height: 48 }}>
              <FaCode size={22} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0 text-white fw-bold">Provider API Catalog Master</h4>
              <p className="mb-0 text-white-50 small">
                DevOps &amp; Admin registry of vendor endpoints, dynamic parameter mappings &amp; authentication schemes
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              outline
              color="light"
              size="sm"
              onClick={loadApis}
              disabled={loading}
              className="d-flex align-items-center gap-1 shadow-sm"
            >
              <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
            </Button>
            <Button
              color="success"
              size="sm"
              onClick={openCreateModal}
              className="d-flex align-items-center gap-1 fw-semibold shadow-sm"
            >
              <FaPlus /> + Add Provider API
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Metrics Summary Cards ── */}
      <Row className="g-3 mb-3">
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Total Catalog APIs</span>
                <h3 className="mb-0 fw-bold mt-1 text-primary">{stats.total}</h3>
              </div>
              <div className="rounded-circle p-2 bg-primary bg-opacity-10 text-primary">
                <FaCode size={20} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">Active Endpoints</span>
                <h3 className="mb-0 fw-bold mt-1 text-success">{stats.active}</h3>
              </div>
              <div className="rounded-circle p-2 bg-success bg-opacity-10 text-success">
                <FaCheck size={20} />
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">WhatsApp WBS APIs</span>
                <h3 className="mb-0 fw-bold mt-1" style={{ color: "#25D366" }}>{stats.wa}</h3>
              </div>
              <div className="rounded-circle p-2 text-white" style={{ backgroundColor: "#25D366" }}>
                💬
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="border-0 shadow-sm h-100">
            <CardBody className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small text-uppercase fw-semibold">RCS CX APIs</span>
                <h3 className="mb-0 fw-bold mt-1 text-info">{stats.rcs}</h3>
              </div>
              <div className="rounded-circle p-2 bg-info bg-opacity-10 text-info">
                ◈
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── Channel Filter Tabs & Search Controls ── */}
      <Card className="border-0 shadow-sm mb-3">
        <CardBody className="p-3">
          {/* Channel Pills */}
          <div className="d-flex flex-wrap gap-1 mb-3 pb-2 border-bottom">
            <Button
              size="sm"
              color={selectedChannel === "ALL" ? "primary" : "light"}
              className="fw-semibold px-3 rounded-pill"
              onClick={() => setSelectedChannel("ALL")}
            >
              All Channels ({apis.length})
            </Button>
            {channels.map((c) => {
              const code = (c.code || c.channelCode || "").toUpperCase();
              const isSel = selectedChannel === code;
              return (
                <Button
                  key={code}
                  size="sm"
                  color={isSel ? "dark" : "light"}
                  className="fw-semibold px-3 rounded-pill d-flex align-items-center gap-1"
                  style={isSel ? { backgroundColor: CHANNEL_COLOR_MAP[code] || "#4f46e5", borderColor: CHANNEL_COLOR_MAP[code] || "#4f46e5" } : {}}
                  onClick={() => setSelectedChannel(code)}
                >
                  <span
                    className="d-inline-block rounded-circle"
                    style={{ width: 8, height: 8, backgroundColor: CHANNEL_COLOR_MAP[code] || "#6c757d" }}
                  />
                  {c.name || code}
                </Button>
              );
            })}
          </div>

          {/* Filter Selects & Search Input */}
          <Row className="g-2 align-items-center">
            <Col xs={12} md={3}>
              <div className="position-relative">
                <Input
                  size="sm"
                  placeholder="Search API name, path, operation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ps-4"
                />
                <FaSearch className="position-absolute text-muted" style={{ left: 10, top: 9 }} size={12} />
              </div>
            </Col>
            <Col xs={6} md={2}>
              <Input
                size="sm"
                type="select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="ALL">All Providers</option>
                {providers.map((p) => (
                  <option key={p.code} value={p.code}>{p.name || p.code}</option>
                ))}
              </Input>
            </Col>
            <Col xs={6} md={2}>
              <Input
                size="sm"
                type="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {API_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Input>
            </Col>
            <Col xs={6} md={2}>
              <Input
                size="sm"
                type="select"
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
              >
                <option value="ALL">All Methods</option>
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Input>
            </Col>
            <Col xs={6} md={2}>
              <Input
                size="sm"
                type="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </Input>
            </Col>
            <Col xs={12} md={1} className="text-end">
              <Button
                color="secondary"
                outline
                size="sm"
                className="w-100"
                onClick={() => {
                  setSelectedChannel("ALL");
                  setSelectedProvider("ALL");
                  setSelectedCategory("ALL");
                  setSelectedMethod("ALL");
                  setStatusFilter("ALL");
                  setSearch("");
                }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* ── Table Card ── */}
      <Card className="border-0 shadow-sm">
        <CardBody className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner color="primary" />
              <p className="mt-2 text-muted small">Loading Provider APIs...</p>
            </div>
          ) : apis.length === 0 ? (
            <div className="py-5 text-center text-muted">
              <FaCode size={40} className="mb-2 text-secondary opacity-50" />
              <h5>No Provider APIs found</h5>
              <p className="small mb-3">No matching API definitions in catalog for the selected filters.</p>
              <Button color="primary" size="sm" onClick={openCreateModal}>
                <FaPlus className="me-1" /> Add New API
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 140 }}>CHANNEL &amp; PROVIDER</th>
                    <th>OPERATION &amp; NAME</th>
                    <th>METHOD &amp; ENDPOINT</th>
                    <th>AUTH TYPE</th>
                    <th className="text-center" style={{ width: 90 }}>STATUS</th>
                    <th style={{ minWidth: 120 }}>CREATED AT</th>
                    <th style={{ minWidth: 120 }}>UPDATED AT</th>
                    <th className="text-end" style={{ width: 100 }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {apis.map((item) => {
                    const ch = (item.channelCode || item.channel || "GENERAL").toUpperCase();
                    const pr = (item.providerCode || item.provider || "UNKNOWN").toUpperCase();
                    const fullUrl = `${item.baseUrl || ""}${item.endpointPath || ""}`;
                    const method = (item.method || "POST").toUpperCase();

                    return (
                      <tr key={item._id}>
                        {/* Channel & Provider */}
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <span
                              className="badge px-2 py-1 text-white fw-semibold"
                              style={{
                                backgroundColor: CHANNEL_COLOR_MAP[ch] || "#4f46e5",
                                width: "fit-content",
                                fontSize: "0.75rem",
                              }}
                            >
                              {ch}
                            </span>
                            <span className="fw-bold small text-dark">{pr}</span>
                          </div>
                        </td>

                        {/* Operation & Name */}
                        <td>
                          <div>
                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                              <Badge color="light" className="text-dark border font-monospace px-1.5 py-1">
                                {item.operation}
                              </Badge>
                              <Badge color="info" pill className="text-uppercase" style={{ fontSize: "0.68rem" }}>
                                {item.category || "GENERAL"}
                              </Badge>
                            </div>
                            <div className="fw-bold mt-1 text-primary" style={{ fontSize: "0.88rem" }}>
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-muted small text-truncate" style={{ maxWidth: 350 }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Method & Endpoint */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge color={METHOD_COLOR_MAP[method] || "secondary"} className="fw-bold px-2 py-1">
                              {method}
                            </Badge>
                            <span className="font-monospace small text-truncate" style={{ maxWidth: 300 }} title={fullUrl}>
                              {item.endpointPath}
                            </span>
                          </div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: 350 }}>
                            {item.baseUrl}
                          </div>
                        </td>

                        {/* Auth */}
                        <td>
                          <Badge color="secondary" outline className="text-uppercase font-monospace px-2 py-1">
                            {item.authType || "BEARER"}
                          </Badge>
                          {item.authKeyField && (
                            <div className="text-muted small font-monospace">
                              key: {item.authKeyField}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="text-center">
                          <Button
                            color={item.isActive ? "success" : "secondary"}
                            size="sm"
                            className="px-2 py-0.5 rounded-pill fw-semibold"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => handleToggle(item)}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Button>
                        </td>

                        {/* Created At */}
                        <td>
                          {(() => {
                            const { date, time } = formatTableDateTime(item.createdAt);
                            return (
                              <div>
                                <div className="small fw-semibold text-dark text-nowrap">{date}</div>
                                {time && (
                                  <div className="text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                                    {time}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Updated At */}
                        <td>
                          {(() => {
                            const { date, time } = formatTableDateTime(item.updatedAt || item.createdAt);
                            return (
                              <div>
                                <div className="small fw-semibold text-dark text-nowrap">{date}</div>
                                {time && (
                                  <div className="text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                                    {time}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="text-end">
                          <UncontrolledDropdown>
                            <DropdownToggle color="light" size="sm" className="btn-icon">
                              <FaEllipsisV />
                            </DropdownToggle>
                            <DropdownMenu end>
                              <DropdownItem onClick={() => openInspectModal(item)}>
                                <FaInfoCircle className="me-2 text-info" /> Inspect Details &amp; Payload
                              </DropdownItem>
                              <DropdownItem onClick={() => openTestModal(item)}>
                                <FaPlay className="me-2 text-success" /> Test Dispatch Probe
                              </DropdownItem>
                              <DropdownItem onClick={() => openEditModal(item)}>
                                <FaEdit className="me-2 text-primary" /> Edit API Definition
                              </DropdownItem>
                              <DropdownItem onClick={() => handleToggle(item)}>
                                <span className={item.isActive ? "text-warning" : "text-success"}>
                                  {item.isActive ? "Deactivate API" : "Activate API"}
                                </span>
                              </DropdownItem>
                              <DropdownItem divider />
                              <DropdownItem onClick={() => handleDelete(item)} className="text-danger">
                                <FaTrash className="me-2" /> Delete API
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" backdrop="static">
        <ModalHeader toggle={() => setModalOpen(false)} className="bg-light">
          <span className="fw-bold">{editingId ? "Edit Provider API Definition" : "Register New Provider API"}</span>
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4">
            {/* Modal Tabs */}
            <Nav tabs className="mb-3">
              <NavItem>
                <NavLink
                  className={modalTab === "general" ? "active fw-bold text-primary" : "text-muted"}
                  onClick={() => setModalTab("general")}
                  style={{ cursor: "pointer" }}
                >
                  1. General &amp; Endpoint
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={modalTab === "auth" ? "active fw-bold text-primary" : "text-muted"}
                  onClick={() => setModalTab("auth")}
                  style={{ cursor: "pointer" }}
                >
                  2. Auth &amp; Headers
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={modalTab === "mappings" ? "active fw-bold text-primary" : "text-muted"}
                  onClick={() => setModalTab("mappings")}
                  style={{ cursor: "pointer" }}
                >
                  3. Payloads &amp; Mappings
                </NavLink>
              </NavItem>
            </Nav>

            {modalTab === "general" && (
              <Row className="g-3">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Channel Code <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      value={form.channelCode}
                      onChange={(e) => setForm({ ...form, channelCode: e.target.value.toUpperCase() })}
                    >
                      {channels.map((c) => (
                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Provider Code <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      value={form.providerCode}
                      onChange={(e) => setForm({ ...form, providerCode: e.target.value.toUpperCase() })}
                    >
                      {availableModalProviders.map((p) => (
                        <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Operation Machine Key <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      placeholder="e.g. CREATE_TEMPLATE, SEND_MESSAGE, LOGIN"
                      value={form.operation}
                      onChange={(e) => setForm({ ...form, operation: e.target.value.toUpperCase() })}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Functional Category</Label>
                    <Input
                      type="select"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      {API_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label className="small fw-bold">API Name <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      placeholder="e.g. Route Mobile WBS Template Submission API"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label className="small fw-bold">Description</Label>
                    <Input
                      type="textarea"
                      rows={2}
                      placeholder="What this provider API does..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label className="small fw-bold">HTTP Method <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      value={form.method}
                      onChange={(e) => setForm({ ...form, method: e.target.value })}
                    >
                      {HTTP_METHODS.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={5}>
                  <FormGroup>
                    <Label className="small fw-bold">Base URL <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      placeholder="https://apis.rmlconnect.net"
                      value={form.baseUrl}
                      onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-bold">Endpoint Path <span className="text-danger">*</span></Label>
                    <Input
                      type="text"
                      placeholder="/wba/templates"
                      value={form.endpointPath}
                      onChange={(e) => setForm({ ...form, endpointPath: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            {modalTab === "auth" && (
              <Row className="g-3">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Authentication Type</Label>
                    <Input
                      type="select"
                      value={form.authType}
                      onChange={(e) => setForm({ ...form, authType: e.target.value })}
                    >
                      {AUTH_TYPES.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Auth Key Field (Credential Reference)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. jwtAuth, apiKey, token, password"
                      value={form.authKeyField}
                      onChange={(e) => setForm({ ...form, authKeyField: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup>
                    <Label className="small fw-bold">Headers Template (JSON format)</Label>
                    <Input
                      type="textarea"
                      rows={4}
                      className="font-monospace small"
                      value={form.headersTemplate}
                      onChange={(e) => setForm({ ...form, headersTemplate: e.target.value })}
                    />
                    <small className="text-muted">Dynamic placeholders like <code>{`{jwtAuth}`}</code> or <code>{`Bearer {token}`}</code> will be injected at runtime.</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Rate Limit (req/sec)</Label>
                    <Input
                      type="number"
                      value={form.rateLimitPerSec}
                      onChange={(e) => setForm({ ...form, rateLimitPerSec: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={6} className="d-flex align-items-center pt-4">
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="apiActiveCheck"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <Label check for="apiActiveCheck" className="fw-semibold">
                      API Endpoint is Active &amp; Ready for Transmission
                    </Label>
                  </FormGroup>
                </Col>
              </Row>
            )}

            {modalTab === "mappings" && (
              <Row className="g-3">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Request Parameter Mapping (JSON)</Label>
                    <Input
                      type="textarea"
                      rows={5}
                      className="font-monospace small"
                      value={form.requestMapping}
                      onChange={(e) => setForm({ ...form, requestMapping: e.target.value })}
                    />
                    <small className="text-muted">Maps BeyondSend canonical payload keys to vendor payload keys.</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Response Parameter Mapping (JSON)</Label>
                    <Input
                      type="textarea"
                      rows={5}
                      className="font-monospace small"
                      value={form.responseMapping}
                      onChange={(e) => setForm({ ...form, responseMapping: e.target.value })}
                    />
                    <small className="text-muted">Extracts vendor response IDs, status codes, and error reasons.</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Sample Payload (JSON)</Label>
                    <Input
                      type="textarea"
                      rows={5}
                      className="font-monospace small"
                      value={form.samplePayload}
                      onChange={(e) => setForm({ ...form, samplePayload: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-bold">Sample Response (JSON)</Label>
                    <Input
                      type="textarea"
                      rows={5}
                      className="font-monospace small"
                      value={form.sampleResponse}
                      onChange={(e) => setForm({ ...form, sampleResponse: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}
          </ModalBody>
          <ModalFooter className="bg-light">
            <Button color="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" size="sm" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" className="me-1" /> : null}
              {editingId ? "Save Changes" : "Register API"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── Inspect Details Modal ── */}
      <Modal isOpen={inspectModalOpen} toggle={() => setInspectModalOpen(false)} size="lg">
        <ModalHeader toggle={() => setInspectModalOpen(false)}>
          <span className="fw-bold">{inspectItem?.name || "API Specification"}</span>
        </ModalHeader>
        <ModalBody className="p-3">
          {inspectItem && (
            <div>
              <div className="p-2.5 rounded bg-light mb-3 d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <Badge color={METHOD_COLOR_MAP[inspectItem.method] || "primary"}>{inspectItem.method}</Badge>
                  <span className="font-monospace small fw-bold">{inspectItem.baseUrl}{inspectItem.endpointPath}</span>
                </div>
                <Button
                  size="sm"
                  color="light"
                  className="border"
                  onClick={() => handleCopy(`${inspectItem.baseUrl}${inspectItem.endpointPath}`, "url")}
                >
                  {copiedKey === "url" ? <FaCheck className="text-success" /> : <FaCopy />}
                </Button>
              </div>

              <Row className="g-2 mb-3">
                <Col xs={4}>
                  <small className="text-muted d-block">Channel</small>
                  <span className="fw-bold">{inspectItem.channelCode || inspectItem.channel}</span>
                </Col>
                <Col xs={4}>
                  <small className="text-muted d-block">Provider</small>
                  <span className="fw-bold">{inspectItem.providerCode || inspectItem.provider}</span>
                </Col>
                <Col xs={4}>
                  <small className="text-muted d-block">Auth Scheme</small>
                  <span className="fw-bold">{inspectItem.authType} ({inspectItem.authKeyField || "apiKey"})</span>
                </Col>
                <Col xs={6} className="mt-2">
                  <small className="text-muted d-block">Created At</small>
                  <span className="fw-semibold text-dark font-monospace small">
                    {formatTableDateTime(inspectItem.createdAt).date} {formatTableDateTime(inspectItem.createdAt).time}
                  </span>
                </Col>
                <Col xs={6} className="mt-2">
                  <small className="text-muted d-block">Last Updated</small>
                  <span className="fw-semibold text-dark font-monospace small">
                    {formatTableDateTime(inspectItem.updatedAt || inspectItem.createdAt).date} {formatTableDateTime(inspectItem.updatedAt || inspectItem.createdAt).time}
                  </span>
                </Col>
              </Row>

              <Label className="small fw-bold mt-2">Headers Template</Label>
              <pre className="p-2 bg-dark text-white rounded font-monospace small" style={{ maxHeight: 150 }}>
                {JSON.stringify(inspectItem.headersTemplate || {}, null, 2)}
              </pre>

              {inspectItem.samplePayload && (
                <>
                  <Label className="small fw-bold mt-2">Sample Request Payload</Label>
                  <pre className="p-2 bg-dark text-white rounded font-monospace small" style={{ maxHeight: 180 }}>
                    {JSON.stringify(inspectItem.samplePayload, null, 2)}
                  </pre>
                </>
              )}

              {inspectItem.sampleResponse && (
                <>
                  <Label className="small fw-bold mt-2">Sample Response Format</Label>
                  <pre className="p-2 bg-dark text-white rounded font-monospace small" style={{ maxHeight: 180 }}>
                    {JSON.stringify(inspectItem.sampleResponse, null, 2)}
                  </pre>
                </>
              )}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" size="sm" onClick={() => setInspectModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* ── Test Probe Modal ── */}
      <Modal isOpen={testModalOpen} toggle={() => setTestModalOpen(false)} size="md">
        <ModalHeader toggle={() => setTestModalOpen(false)}>
          <span className="fw-bold">Test Dispatch Probe: {testItem?.operation}</span>
        </ModalHeader>
        <ModalBody className="p-3">
          <p className="small text-muted mb-2">
            Simulate or dispatch a live request to <strong>{testItem?.name}</strong> using current account credentials.
          </p>
          <FormGroup>
            <Label className="small fw-bold">Test Request Payload (JSON)</Label>
            <Input
              type="textarea"
              rows={6}
              className="font-monospace small"
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
          </FormGroup>

          {testResult && (
            <div className="mt-3">
              <Label className="small fw-bold">Dispatch Result</Label>
              <pre
                className={`p-2 rounded font-monospace small ${testResult.success ? "bg-success bg-opacity-10 text-success border border-success" : "bg-danger bg-opacity-10 text-danger border border-danger"}`}
                style={{ maxHeight: 200 }}
              >
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" size="sm" onClick={() => setTestModalOpen(false)}>
            Close
          </Button>
          <Button color="success" size="sm" onClick={handleExecuteTest} disabled={testLoading}>
            {testLoading ? <Spinner size="sm" className="me-1" /> : <FaPlay className="me-1" />} Execute Probe
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProviderApiCatalogManagement;
