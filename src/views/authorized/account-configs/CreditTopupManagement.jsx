import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Nav, NavItem, NavLink,
  Spinner, InputGroup, ButtonGroup, Alert
} from "reactstrap";
import {
  FaCoins, FaPlus, FaMinus, FaSearch, FaSyncAlt,
  FaWallet, FaHistory, FaUsers, FaExchangeAlt, FaArrowUp,
  FaArrowDown, FaCheck, FaTimes, FaHourglassHalf, FaChartBar,
  FaUserTie, FaUser, FaIdBadge
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

export const CREDIT_KEYS = [
  "emailCredits",
  "smsCredits",
  "voiceCredits",
  "whatsappCredits",
  "whatsappPromoCredits",
  "rcsCredits",
  "pushCredits",
];

export const CHANNEL_META = {
  emailCredits: { label: "Email", color: "#2271b1", icon: "✉", desc: "Outbound SMTP & API Email" },
  smsCredits: { label: "SMS", color: "#0ca678", icon: "✆", desc: "Promotional & Transactional SMS" },
  voiceCredits: { label: "Voice", color: "#e8590c", icon: "☎", desc: "IVR & Voice Broadcasts" },
  whatsappCredits: { label: "WhatsApp", color: "#25D366", icon: "💬", desc: "WhatsApp Official API" },
  whatsappPromoCredits: { label: "WhatsApp Promo", color: "#128c7e", icon: "📣", desc: "WhatsApp Marketing Campaigns" },
  rcsCredits: { label: "RCS", color: "#7950f2", icon: "◈", desc: "Rich Communication Services" },
  pushCredits: { label: "Push", color: "#d63638", icon: "◆", desc: "Web & Mobile Push Notifications" },
};

const PAYMENT_MODES = ["cash", "upi", "neft", "imps", "card", "bank_transfer", "wallet", "other"];

const emptyForm = {
  userId: "",
  amount: 0,
  paymentMode: "cash",
  paymentReference: "",
  remarks: "",
  emailCredits: 0,
  smsCredits: 0,
  voiceCredits: 0,
  whatsappCredits: 0,
  whatsappPromoCredits: 0,
  rcsCredits: 0,
  pushCredits: 0,
};

const unwrapData = (res) => {
  if (!res) return null;
  if (typeof res === "object") {
    if (res.data !== undefined && res.data !== null) {
      if (typeof res.data === "object" && res.data.data !== undefined) {
        return res.data.data;
      }
      return res.data;
    }
  }
  return res;
};

const CreditTopupManagement = () => {
  const { toasts, toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlUserId = searchParams.get("userId") || "";

  const [tab, setTab] = useState("requests");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");

  const [requests, setRequests] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");

  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ totalRecords: 0, page: 1, limit: 25, totalPages: 1 });

  const [selectedUserId, setSelectedUserId] = useState(urlUserId);
  const [historySearch, setHistorySearch] = useState("");
  const [creditTypeFilter, setCreditTypeFilter] = useState("ALL");

  // Topup / Deduct modal
  const [modal, setModal] = useState(false);
  const [mode, setMode] = useState("topup"); // "topup" | "deduct"
  const [form, setForm] = useState(emptyForm);

  // Reject request modal
  const [rejectModal, setRejectModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiClient.get("/credits/users");
      const list = unwrapData(res) || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (requestStatusFilter && requestStatusFilter !== "ALL") {
        params.set("status", requestStatusFilter);
      }
      const res = await apiClient.get(`/credits/requests?${params.toString()}`);
      const list = unwrapData(res) || [];
      setRequests(Array.isArray(list) ? list : []);
    } catch {
      setRequests([]);
    }
  }, [requestStatusFilter]);

  const loadSummary = useCallback(async (userId) => {
    try {
      const url = userId ? `/credits/summary?userId=${userId}` : "/credits/summary";
      const res = await apiClient.get(url);
      return unwrapData(res) || null;
    } catch {
      return null;
    }
  }, []);

  const loadTotals = useCallback(async () => {
    try {
      const res = await apiClient.get("/credits/totals");
      setTotals(unwrapData(res) || null);
    } catch {
      setTotals(null);
    }
  }, []);

  const loadHistory = useCallback(async (userId, page = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (userId && userId !== "ALL") params.set("userId", userId);
      if (creditTypeFilter && creditTypeFilter !== "ALL") params.set("creditType", creditTypeFilter);
      if (historySearch.trim()) params.set("search", historySearch.trim());

      const res = await apiClient.get(`/credits/history?${params.toString()}`);
      const list = unwrapData(res);
      const total = res?.totalRecords ?? res?.data?.totalRecords ?? (Array.isArray(list) ? list.length : 0);
      const pageNum = res?.page ?? res?.data?.page ?? page;
      const totalP = res?.totalPages ?? res?.data?.totalPages ?? Math.max(1, Math.ceil(total / 25));

      setHistory(Array.isArray(list) ? list : []);
      setHistoryMeta({
        totalRecords: total,
        page: pageNum,
        limit: 25,
        totalPages: totalP,
      });
    } catch {
      setHistory([]);
    }
  }, [creditTypeFilter, historySearch]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes] = await Promise.all([
        loadSummary(selectedUserId),
        loadHistory(selectedUserId, 1),
        loadRequests(),
        loadUsers(),
        loadTotals(),
      ]);
      setSummary(sumRes);
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err) {
      toast.error(err?.message || "Failed to load management data");
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, loadSummary, loadHistory, loadRequests, loadUsers, loadTotals, toast]);

  useEffect(() => {
    refreshAll();
  }, [selectedUserId, refreshAll]);

  useEffect(() => {
    if (urlUserId && urlUserId !== selectedUserId) {
      setSelectedUserId(urlUserId);
    }
  }, [urlUserId]);

  useEffect(() => {
    loadRequests();
  }, [requestStatusFilter, loadRequests]);

  // Debounced search on history
  useEffect(() => {
    const t = setTimeout(() => {
      loadHistory(selectedUserId, 1);
    }, 300);
    return () => clearTimeout(t);
  }, [creditTypeFilter, historySearch, selectedUserId, loadHistory]);

  const handleUserFilterChange = (val) => {
    setSelectedUserId(val);
    if (val) {
      setSearchParams({ userId: val });
    } else {
      setSearchParams({});
    }
  };

  const openTopupModal = (openMode, targetUser = null) => {
    setMode(openMode);
    const targetId = targetUser?._id || selectedUserId || "";
    setForm({
      ...emptyForm,
      userId: targetId,
      paymentMode: "cash",
    });
    setModal(true);
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addPreset = (channelKey, amount) => {
    setForm((prev) => ({
      ...prev,
      [channelKey]: (Number(prev[channelKey]) || 0) + amount,
    }));
  };

  const creditSum = useMemo(
    () => CREDIT_KEYS.reduce((s, k) => s + (Number(form[k]) || 0), 0),
    [form]
  );

  const handleTopupSubmit = async (e) => {
    e.preventDefault();
    if (creditSum <= 0) {
      toast.warning("Enter at least one credit value greater than 0");
      return;
    }

    try {
      setActionLoading(true);
      const endpoint = mode === "topup" ? "/credits/topup" : "/credits/deduct";
      const res = await apiClient.post(endpoint, {
        ...form,
        amount: Number(form.amount) || creditSum,
      });

      toast.success(
        res?.message || res?.data?.message ||
          (mode === "topup" ? "Credits added successfully" : "Credits deducted successfully")
      );
      setModal(false);
      await refreshAll();
    } catch (err) {
      toast.error(err?.message || err?.data?.message || "Operation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Request
  const handleApprove = async (reqId) => {
    if (!window.confirm("Are you sure you want to approve this request and credit the user's wallet?")) return;
    try {
      setActionLoading(true);
      const res = await apiClient.post(`/credits/requests/${reqId}/approve`);
      toast.success(res?.message || res?.data?.message || "Request approved and wallet credited successfully!");
      await refreshAll();
    } catch (err) {
      toast.error(err?.message || err?.data?.message || "Failed to approve request");
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Request
  const handleRejectPrompt = (req) => {
    setActiveRequest(req);
    setRejectionReason("");
    setRejectModal(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    try {
      setActionLoading(true);
      const res = await apiClient.post(`/credits/requests/${activeRequest._id}/reject`, {
        reason: rejectionReason || "Rejected by administrator",
      });
      toast.success(res?.message || res?.data?.message || "Credit request marked as rejected.");
      setRejectModal(false);
      setActiveRequest(null);
      await loadRequests();
    } catch (err) {
      toast.error(err?.message || err?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const balances = useMemo(() => {
    return summary?.myWallet || summary?.balances || {};
  }, [summary]);

  const totalCurrentBalance = useMemo(() => {
    return CREDIT_KEYS.reduce((sum, key) => sum + (Number(balances[key]) || 0), 0);
  }, [balances]);

  const pendingRequestsCount = useMemo(
    () => requests.filter((r) => r.status === "PENDING").length,
    [requests]
  );

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.toLowerCase();
      return (
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.mobile && u.mobile.includes(q))
      );
    });
  }, [users, userSearch, userRoleFilter]);

  const resellerCount = useMemo(() => users.filter((u) => u.role === "RESELLER").length, [users]);
  const clientCount = useMemo(() => users.filter((u) => u.role === "CLIENT").length, [users]);
  const managerCount = useMemo(() => users.filter((u) => u.role === "MANAGER").length, [users]);

  if (loading && !summary) return <PageLoader />;

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── UNIFIED COMMAND CARD HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-20 flex-shrink-0 adm-header-icon-box">
              <FaCoins size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Credit &amp; Topup Management Console</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Approve topups, execute deductions, manage client wallets, and audit transactions
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1 bg-white bg-opacity-10 text-white border-0 shadow-sm"
              onClick={refreshAll}
              disabled={loading}
            >
              <FaSyncAlt size={11} className={loading ? "fa-spin" : ""} /> Refresh
            </Button>
            <Button
              color="success"
              className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5"
              onClick={() => openTopupModal("topup")}
            >
              <FaPlus size={11} /> Add Credits
            </Button>
            <Button
              color="danger"
              className="fw-bold shadow-sm px-3 d-flex align-items-center gap-1.5"
              onClick={() => openTopupModal("deduct")}
            >
              <FaMinus size={11} /> Deduct Credits
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Channel Balances Strip ── */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small fw-semibold text-uppercase text-muted">
            {selectedUserId ? `Filtered Balance — ${users.find(u => u._id === selectedUserId)?.name || "Selected User"}` : "System Overview Balances"}
          </span>
          <span className="badge bg-dark">
            Combined Credits: {totalCurrentBalance.toLocaleString()}
          </span>
        </div>
        <Row className="g-2">
          {CREDIT_KEYS.map((key) => {
            const meta = CHANNEL_META[key];
            const val = Number(balances[key]) || 0;
            return (
              <Col key={key} xs={6} sm={4} md={3} lg={true}>
                <Card className="h-100 shadow-sm border-0 border-top" style={{ borderTop: `3px solid ${meta.color} !important` }}>
                  <CardBody className="text-center py-2 px-2">
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-1"
                      style={{
                        width: 32,
                        height: 32,
                        background: `${meta.color}18`,
                        color: meta.color,
                        fontSize: 16,
                      }}
                      title={meta.desc}
                    >
                      {meta.icon}
                    </div>
                    <div className="fs-5 fw-bold lh-1 text-dark">{val.toLocaleString()}</div>
                    <div className="small text-muted text-truncate mt-1" title={meta.label}>
                      {meta.label}
                    </div>
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* ── Main Tabbed Content ── */}
      <Card className="shadow-sm border-0">
        <CardHeader className="bg-white p-0 border-bottom">
          <Nav tabs className="px-3 pt-2 border-0">
            <NavItem>
              <NavLink
                active={tab === "requests"}
                onClick={() => setTab("requests")}
                role="button"
                className="fw-semibold position-relative"
              >
                <FaHourglassHalf className="me-1 text-warning" /> Topup Requests
                {pendingRequestsCount > 0 && (
                  <Badge color="danger" pill className="ms-2">
                    {pendingRequestsCount} Pending
                  </Badge>
                )}
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={tab === "accounts"}
                onClick={() => setTab("accounts")}
                role="button"
                className="fw-semibold"
              >
                <FaUsers className="me-1 text-primary" /> Resellers &amp; Clients Directory ({users.length})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={tab === "history"}
                onClick={() => setTab("history")}
                role="button"
                className="fw-semibold"
              >
                <FaHistory className="me-1 text-success" /> All Users History &amp; Deductions ({historyMeta.totalRecords})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={tab === "reports"}
                onClick={() => setTab("reports")}
                role="button"
                className="fw-semibold"
              >
                <FaChartBar className="me-1 text-info" /> Platform Reports &amp; Analytics
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>

        <CardBody className="p-3">
          {/* ──── TAB 1: TOPUP REQUESTS (APPROVAL WORKFLOW) ──── */}
          {tab === "requests" && (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <ButtonGroup size="sm">
                  <Button
                    color={requestStatusFilter === "ALL" ? "primary" : "light"}
                    onClick={() => setRequestStatusFilter("ALL")}
                  >
                    All ({requests.length})
                  </Button>
                  <Button
                    color={requestStatusFilter === "PENDING" ? "warning" : "light"}
                    onClick={() => setRequestStatusFilter("PENDING")}
                  >
                    Pending ({pendingRequestsCount})
                  </Button>
                  <Button
                    color={requestStatusFilter === "APPROVED" ? "success" : "light"}
                    onClick={() => setRequestStatusFilter("APPROVED")}
                  >
                    Approved
                  </Button>
                  <Button
                    color={requestStatusFilter === "REJECTED" ? "danger" : "light"}
                    onClick={() => setRequestStatusFilter("REJECTED")}
                  >
                    Rejected
                  </Button>
                </ButtonGroup>
                <div className="small text-muted">
                  Showing {requests.length} credit topup requests
                </div>
              </div>

              <div className="table-responsive">
                <Table hover bordered size="sm" className="align-middle small">
                  <thead className="table-light text-nowrap">
                    <tr>
                      <th>Date</th>
                      <th>Requester Account</th>
                      <th>Credits Breakdown</th>
                      <th className="text-end">Units</th>
                      <th className="text-end">Amount (₹)</th>
                      <th>Mode</th>
                      <th>UTR / Reference</th>
                      <th>Remarks</th>
                      <th>Status</th>
                      <th className="text-center">Review Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted py-4">
                          No credit topup requests found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      requests.map((r) => (
                        <tr key={r._id}>
                          <td className="text-nowrap">
                            {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                          </td>
                          <td>
                            <div className="fw-bold text-dark d-flex align-items-center gap-1">
                              {r.user?.role === "RESELLER" ? <FaUserTie className="text-primary" /> : <FaUser className="text-info" />}
                              {r.user?.name || "User"}
                            </div>
                            <div className="text-muted small">
                              {r.user?.email} [{r.user?.role}]
                            </div>
                            {r.user?.role === "MANAGER" && (r.user?.owner || r.user?.createdBy) && (
                              <div className="text-primary small" style={{ fontSize: "11px" }}>
                                Parent Client ID: {r.user.owner?._id || r.user.createdBy?._id}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {CREDIT_KEYS.map((k) => {
                                const val = r[k] || r.creditsDelta?.[k];
                                if (!val) return null;
                                return (
                                  <Badge key={k} color="light" className="border text-dark">
                                    {CHANNEL_META[k].label}: +{val.toLocaleString()}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-end fw-bold">{r.units?.toLocaleString()}</td>
                          <td className="text-end fw-semibold">₹{Number(r.amount || 0).toLocaleString()}</td>
                          <td className="text-uppercase">{r.paymentMode}</td>
                          <td className="fw-semibold">{r.paymentReference || "—"}</td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: 150 }} title={r.remarks}>
                              {r.remarks || "—"}
                            </div>
                          </td>
                          <td>
                            {r.status === "PENDING" && (
                              <Badge color="warning" pill className="d-inline-flex align-items-center gap-1">
                                <FaHourglassHalf /> Pending
                              </Badge>
                            )}
                            {r.status === "APPROVED" && (
                              <Badge color="success" pill className="d-inline-flex align-items-center gap-1">
                                <FaCheck /> Approved
                              </Badge>
                            )}
                            {r.status === "REJECTED" && (
                              <Badge color="danger" pill className="d-inline-flex align-items-center gap-1">
                                <FaTimes /> Rejected
                              </Badge>
                            )}
                          </td>
                          <td className="text-center text-nowrap">
                            {r.status === "PENDING" ? (
                              <>
                                <Button
                                  color="success"
                                  size="sm"
                                  className="py-0 px-2 me-1"
                                  onClick={() => handleApprove(r._id)}
                                  disabled={actionLoading}
                                  title="Approve and credit wallet immediately"
                                >
                                  <FaCheck /> Approve
                                </Button>
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="py-0 px-2"
                                  onClick={() => handleRejectPrompt(r)}
                                  disabled={actionLoading}
                                  title="Reject request with note"
                                >
                                  <FaTimes /> Reject
                                </Button>
                              </>
                            ) : (
                              <span className="text-muted small">
                                {r.status === "APPROVED"
                                  ? `Approved by ${r.approvedBy?.name || "Admin"}`
                                  : r.rejectionReason || "Closed"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {/* ──── TAB 2: RESELLERS & CLIENTS DIRECTORY ──── */}
          {tab === "accounts" && (
            <>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 540 }}>
                  <Input
                    size="sm"
                    placeholder="Search accounts by name, email, mobile…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <ButtonGroup size="sm">
                    <Button
                      color={userRoleFilter === "ALL" ? "primary" : "light"}
                      onClick={() => setUserRoleFilter("ALL")}
                    >
                      All ({users.length})
                    </Button>
                    <Button
                      color={userRoleFilter === "RESELLER" ? "primary" : "light"}
                      onClick={() => setUserRoleFilter("RESELLER")}
                    >
                      Resellers ({resellerCount})
                    </Button>
                    <Button
                      color={userRoleFilter === "CLIENT" ? "primary" : "light"}
                      onClick={() => setUserRoleFilter("CLIENT")}
                    >
                      Clients ({clientCount})
                    </Button>
                    <Button
                      color={userRoleFilter === "MANAGER" ? "primary" : "light"}
                      onClick={() => setUserRoleFilter("MANAGER")}
                    >
                      Managers ({managerCount})
                    </Button>
                  </ButtonGroup>
                </div>
                <div className="small text-muted">
                  Showing {filteredUsers.length} accounts
                </div>
              </div>

              <div className="table-responsive">
                <Table hover bordered size="sm" className="align-middle small">
                  <thead className="table-light text-nowrap">
                    <tr>
                      <th>Account Name / Email</th>
                      <th>Role</th>
                      <th>Parent Client Details</th>
                      <th className="text-end">Email</th>
                      <th className="text-end">SMS</th>
                      <th className="text-end">WhatsApp</th>
                      <th className="text-end">Voice</th>
                      <th className="text-end">RCS</th>
                      <th className="text-end">Push</th>
                      <th className="text-end fw-bold">Total</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center text-muted py-4">
                          No accounts found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const w = u.myWallet || {};
                        const userTotal =
                          (w.emailCredits || 0) +
                          (w.smsCredits || 0) +
                          (w.whatsappCredits || 0) +
                          (w.whatsappPromoCredits || 0) +
                          (w.voiceCredits || 0) +
                          (w.rcsCredits || 0) +
                          (w.pushCredits || 0);

                        return (
                          <tr key={u._id} className={u._id === selectedUserId ? "table-active" : ""}>
                            <td>
                              <div className="fw-bold text-dark d-flex align-items-center gap-1">
                                {u.role === "RESELLER" ? <FaUserTie className="text-primary" /> : <FaUser className="text-info" />}
                                {u.name || "Unnamed"}
                              </div>
                              <div className="text-muted small">{u.email} {u.mobile ? `• ${u.mobile}` : ""}</div>
                            </td>
                            <td>
                              <Badge color={u.role === "RESELLER" ? "primary" : u.role === "CLIENT" ? "info" : "dark"}>
                                {u.role}
                              </Badge>
                            </td>
                            <td>
                              {u.parentClientId ? (
                                <div>
                                  <div className="fw-semibold text-dark small">{u.parentClientName || "Parent Client"}</div>
                                  <div className="text-muted small" style={{ fontSize: "11px" }}>
                                    ID: <code>{u.parentClientId}</code>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td className="text-end">{(w.emailCredits || 0).toLocaleString()}</td>
                            <td className="text-end">{(w.smsCredits || 0).toLocaleString()}</td>
                            <td className="text-end">{((w.whatsappCredits || 0) + (w.whatsappPromoCredits || 0)).toLocaleString()}</td>
                            <td className="text-end">{(w.voiceCredits || 0).toLocaleString()}</td>
                            <td className="text-end">{(w.rcsCredits || 0).toLocaleString()}</td>
                            <td className="text-end">{(w.pushCredits || 0).toLocaleString()}</td>
                            <td className="text-end fw-bold text-dark">{userTotal.toLocaleString()}</td>
                            <td className="text-center text-nowrap">
                              <Button
                                color="success"
                                size="sm"
                                className="py-0 px-2 me-1"
                                onClick={() => openTopupModal("topup", u)}
                                title="Topup Credits for this account"
                              >
                                <FaPlus /> Add
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                className="py-0 px-2 me-1"
                                onClick={() => openTopupModal("deduct", u)}
                                title="Deduct Credits from this account"
                              >
                                <FaMinus /> Deduct
                              </Button>
                              <Button
                                color="light"
                                size="sm"
                                className="py-0 px-2 border"
                                onClick={() => {
                                  handleUserFilterChange(u._id);
                                  setTab("history");
                                }}
                                title="View this account's transactions & deductions"
                              >
                                <FaHistory /> History
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {/* ──── TAB 3: ALL USERS HISTORY & DEDUCTIONS ──── */}
          {tab === "history" && (
            <>
              <Row className="g-2 mb-3">
                <Col md={4}>
                  <InputGroup size="sm">
                    <Input
                      placeholder="Search payment reference or remarks…"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    {historySearch && (
                      <Button color="light" onClick={() => setHistorySearch("")}>
                        ✕
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Input
                    type="select"
                    size="sm"
                    value={creditTypeFilter}
                    onChange={(e) => setCreditTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Types</option>
                    <option value="topup">Topups Only</option>
                    <option value="deduct">Deductions Only</option>
                    <option value="refund">Refunds Only</option>
                    <option value="usage">Usages Only</option>
                    <option value="adjustment">Adjustments</option>
                  </Input>
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    size="sm"
                    value={selectedUserId}
                    onChange={(e) => handleUserFilterChange(e.target.value)}
                  >
                    <option value="">All Accounts (Resellers &amp; Clients)</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || "Unnamed"} — {u.email} ({u.role})
                      </option>
                    ))}
                  </Input>
                </Col>
                <Col md={3} className="d-flex align-items-center justify-content-end gap-2">
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => loadHistory(selectedUserId, historyMeta.page - 1)}
                    disabled={historyMeta.page <= 1}
                  >
                    Prev
                  </Button>
                  <span className="small text-muted text-nowrap">
                    Page {historyMeta.page} / {historyMeta.totalPages || 1} ({historyMeta.totalRecords} txns)
                  </span>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => loadHistory(selectedUserId, historyMeta.page + 1)}
                    disabled={historyMeta.page >= historyMeta.totalPages}
                  >
                    Next
                  </Button>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table hover bordered size="sm" className="align-middle small">
                  <thead className="table-light text-nowrap">
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Account</th>
                      <th>Type</th>
                      <th>Credits Delta</th>
                      <th className="text-end">Units</th>
                      <th className="text-end">Amount (₹)</th>
                      <th>Payment Mode</th>
                      <th>Reference / Remarks</th>
                      <th>Executed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center text-muted py-4">
                          No transactions or deductions found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      history.map((row) => {
                        const isPlus = ["topup", "refund", "bonus"].includes(row.creditType);
                        return (
                          <tr key={row._id}>
                            <td className="text-nowrap">
                              {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{row.user?.name || "User"}</div>
                              <div className="text-muted small">
                                {row.user?.email} {row.user?.role ? `[${row.user.role}]` : ""}
                              </div>
                            </td>
                            <td>
                              {row.creditType === "topup" && (
                                <Badge color="success" pill>
                                  <FaArrowUp className="me-1" /> Topup
                                </Badge>
                              )}
                              {row.creditType === "deduct" && (
                                <Badge color="danger" pill>
                                  <FaArrowDown className="me-1" /> Deduct
                                </Badge>
                              )}
                              {row.creditType === "refund" && (
                                <Badge color="info" pill>Refund</Badge>
                              )}
                              {row.creditType === "usage" && (
                                <Badge color="warning" pill>Usage</Badge>
                              )}
                              {!["topup", "deduct", "refund", "usage"].includes(row.creditType) && (
                                <Badge color="secondary" pill>{row.creditType}</Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-1">
                                {CREDIT_KEYS.map((k) => {
                                  const val = row[k] || row.creditsDelta?.[k];
                                  if (!val) return null;
                                  return (
                                    <Badge
                                      key={k}
                                      color="light"
                                      className="border text-dark"
                                      style={{ fontSize: "11px" }}
                                    >
                                      {CHANNEL_META[k].label}: {isPlus ? "+" : "-"}{Math.abs(val).toLocaleString()}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="text-end fw-bold">
                              <span className={isPlus ? "text-success" : "text-danger"}>
                                {isPlus ? "+" : "-"}{(row.units || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="text-end fw-semibold">
                              {row.amount ? `₹${Number(row.amount).toLocaleString()}` : "—"}
                            </td>
                            <td className="text-uppercase">{row.paymentMode || "—"}</td>
                            <td>
                              <div className="text-truncate" style={{ maxWidth: 220 }} title={row.description || row.remarks || row.paymentReference}>
                                {row.paymentReference && <span className="fw-semibold me-1">[{row.paymentReference}]</span>}
                                {row.remarks || row.description || "—"}
                              </div>
                            </td>
                            <td className="text-muted">
                              {row.actor?.name || row.admin?.name || row.actor?.email || "System"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}

          {/* ──── TAB 4: PLATFORM REPORTS & ANALYTICS ──── */}
          {tab === "reports" && (
            <Row className="g-3">
              <Col lg={7}>
                <div className="border rounded p-3 h-100 bg-white shadow-sm">
                  <div className="fw-bold fs-6 mb-3 text-dark">
                    System-Wide Total Outstanding Credits Across All Accounts
                  </div>
                  <Table hover size="sm" className="align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Channel</th>
                        <th>Type</th>
                        <th className="text-end">Total Outstanding Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CREDIT_KEYS.map((key) => {
                        const meta = CHANNEL_META[key];
                        const val = totals?.[key] ?? 0;
                        return (
                          <tr key={key}>
                            <td>
                              <span
                                className="badge rounded-pill me-2"
                                style={{ background: `${meta.color}20`, color: meta.color }}
                              >
                                {meta.icon}
                              </span>
                              <strong className="text-dark">{meta.label}</strong>
                            </td>
                            <td className="small text-muted">{meta.desc}</td>
                            <td className="text-end fw-bold fs-6">{val.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </Col>

              <Col lg={5}>
                <div className="border rounded p-3 h-100 bg-white shadow-sm d-flex flex-column justify-content-between">
                  <div>
                    <div className="fw-bold fs-6 mb-3 text-dark">Platform Inflow &amp; Deductions Summary</div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Total Topup Inflows</span>
                      <strong className="text-success">
                        {summary?.totals?.topup?.amount ? `₹${summary.totals.topup.amount.toLocaleString()}` : "₹0"}
                        <span className="text-muted small ms-1">
                          ({summary?.totals?.topup?.count || 0} times)
                        </span>
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Total Deductions</span>
                      <strong className="text-danger">
                        {summary?.totals?.deduct?.amount ? `₹${summary.totals.deduct.amount.toLocaleString()}` : "₹0"}
                        <span className="text-muted small ms-1">
                          ({summary?.totals?.deduct?.count || 0} times)
                        </span>
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Total Campaign Dispatches Usage</span>
                      <strong className="text-warning">
                        {summary?.totals?.usage?.amount ? `₹${summary.totals.usage.amount.toLocaleString()}` : "₹0"}
                        <span className="text-muted small ms-1">
                          ({summary?.totals?.usage?.count || 0} times)
                        </span>
                      </strong>
                    </div>
                  </div>

                  <div className="alert alert-info small mt-3 mb-0">
<strong>Admin Notice:</strong> Credit changes are atomic and fully logged with before/after balances.
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>

      {/* ── Topup / Deduct Modal (Admin) ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="xl" centered backdrop="static">
        <Form onSubmit={handleTopupSubmit}>
          <ModalHeader toggle={() => setModal(false)} className="py-2.5 px-3">
            {mode === "topup" ? (
              <div className="text-white fw-bold d-flex align-items-center gap-2">
                <FaPlus /> Add Credits to Reseller / Client Wallet
              </div>
            ) : (
              <div className="text-white fw-bold d-flex align-items-center gap-2">
                <FaMinus /> Deduct Credits from Reseller / Client Wallet
              </div>
            )}
          </ModalHeader>
          <ModalBody className="p-3">
            {users.length > 0 && (
              <FormGroup className="mb-2.5">
                <Label className="small fw-semibold mb-1">Target Account</Label>
                <Input
                  type="select"
                  size="sm"
                  value={form.userId}
                  onChange={(e) => setField("userId", e.target.value)}
                >
                  <option value="">My Account (Self)</option>
                  <optgroup label="Resellers">
                    {users.filter(u => u.role === "RESELLER").map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || "Unnamed"} — {u.email} [RESELLER]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Clients">
                    {users.filter(u => u.role === "CLIENT").map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || "Unnamed"} — {u.email} [CLIENT]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Managers">
                    {users.filter(u => u.role === "MANAGER").map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || "Unnamed"} — {u.email} [MANAGER]
                      </option>
                    ))}
                  </optgroup>
                </Input>
              </FormGroup>
            )}

            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <Label className="fw-semibold small text-uppercase text-secondary mb-0">
                Channel Credits to {mode === "topup" ? "Credit" : "Deduct"}
              </Label>
              <span className="text-muted small">Click +1k / +5k presets to increment</span>
            </div>

            <Row className="g-2 mb-2.5">
              {CREDIT_KEYS.map((key) => {
                const meta = CHANNEL_META[key];
                return (
                  <Col key={key} xs={6} sm={6} md={3}>
                    <div className="border rounded-3 p-2 bg-light h-100 d-flex flex-column justify-content-between">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Label className="small fw-semibold mb-0 text-truncate mw-100" style={{ color: meta.color }} title={meta.label}>
                          {meta.icon} {meta.label}
                        </Label>
                        <ButtonGroup size="sm">
                          <Button
                            type="button"
                            color="light"
                            size="sm"
                            className="py-0 px-1 border small"
                            onClick={() => addPreset(key, 1000)}
                          >
                            +1k
                          </Button>
                          <Button
                            type="button"
                            color="light"
                            size="sm"
                            className="py-0 px-1 border small"
                            onClick={() => addPreset(key, 5000)}
                          >
                            +5k
                          </Button>
                        </ButtonGroup>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        size="sm"
                        className="fw-semibold"
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </Col>
                );
              })}

              {/* 8th slot in 4x2 grid: Live Transaction Summary Card */}
              <Col xs={6} sm={6} md={3}>
                <div className={`border rounded-3 p-2 h-100 d-flex flex-column justify-content-center align-items-center text-center ${mode === "topup" ? "border-success border-opacity-25 bg-success bg-opacity-10" : "border-danger border-opacity-25 bg-danger bg-opacity-10"}`}>
                  <span className={`small fw-bold text-uppercase ${mode === "topup" ? "text-success" : "text-danger"}`}>
                    Total {mode === "topup" ? "Allocation" : "Deduction"}
                  </span>
                  <span className={`fs-5 fw-bold my-0 lh-1 ${mode === "topup" ? "text-success" : "text-danger"}`}>
                    {creditSum.toLocaleString()}
                  </span>
                  <span className="text-muted small">units across channels</span>
                </div>
              </Col>
            </Row>

            <Row className="g-2">
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Amount (₹ / INR)</Label>
                  <Input
                    type="number"
                    min="0"
                    size="sm"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    placeholder="0"
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Payment Mode</Label>
                  <Input
                    type="select"
                    size="sm"
                    value={form.paymentMode}
                    onChange={(e) => setField("paymentMode", e.target.value)}
                  >
                    {PAYMENT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m.replace("_", " ").toUpperCase()}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">UTR / Transaction ID</Label>
                  <Input
                    size="sm"
                    value={form.paymentReference}
                    onChange={(e) => setField("paymentReference", e.target.value)}
                    placeholder="UTR / Txn ID"
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Remarks / Reason</Label>
                  <Input
                    size="sm"
                    value={form.remarks}
                    onChange={(e) => setField("remarks", e.target.value)}
                    placeholder="e.g. Allocation note"
                  />
                </FormGroup>
              </Col>
            </Row>

            {mode === "deduct" && (
              <div className="alert alert-warning small mb-0 py-1.5 px-2.5 mt-2">
                <strong>Caution:</strong> Deductions directly reduce the account's active credit balances. Balances cannot be deducted below zero.
              </div>
            )}
          </ModalBody>
          <ModalFooter className="py-2 px-3">
            <Button color="light" size="sm" onClick={() => setModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              color={mode === "topup" ? "success" : "danger"}
              size="sm"
              type="submit"
              disabled={actionLoading || creditSum <= 0}
              className="px-3 fw-semibold"
            >
              {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaExchangeAlt className="me-1" />}
              {mode === "topup" ? "Confirm Topup" : "Confirm Deduction"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal isOpen={rejectModal} toggle={() => setRejectModal(false)} backdrop="static">
        <Form onSubmit={handleRejectSubmit}>
          <ModalHeader toggle={() => setRejectModal(false)}>
            <span className="text-danger d-flex align-items-center gap-2">
              <FaTimes /> Reject Credit Topup Request
            </span>
          </ModalHeader>
          <ModalBody>
            <p className="small text-muted mb-3">
              Provide a reason for rejecting the topup request from <strong>{activeRequest?.user?.name || "User"}</strong> (Amount: ₹{activeRequest?.amount}).
            </p>
            <FormGroup>
              <Label className="small fw-semibold">Rejection Reason</Label>
              <Input
                type="textarea"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Invalid UTR reference, payment not received, duplicate request"
                required
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="py-2">
            <Button color="light" onClick={() => setRejectModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button color="danger" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaTimes className="me-1" />}
              Confirm Rejection
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CreditTopupManagement;
