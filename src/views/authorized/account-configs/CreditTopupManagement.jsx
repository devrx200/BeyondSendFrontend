import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Row, Col, Input
} from "reactstrap";
import {
  FaCoins, FaPlus, FaMinus, FaSyncAlt, FaHistory, FaExchangeAlt,
  FaTimes, FaHourglassHalf, FaChartBar, FaShieldAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

import {
  CREDIT_KEYS,
  CHANNEL_META,
  getEmptyCreditForm,
} from "./creditConstants";

// Separated Modular Tab and Modal Components
import TopupRequestsTab from "./credit-topup/TopupRequestsTab";
import ResellersDirectoryTab from "./credit-topup/ResellersDirectoryTab";
import UsersHistoryTab from "./credit-topup/UsersHistoryTab";
import CreditReportsTab from "./credit-topup/CreditReportsTab";
import CarrierDlrSimulatorTab from "./credit-topup/CarrierDlrSimulatorTab";
import DirectCreditAdjustmentModal from "./credit-topup/DirectCreditAdjustmentModal";
import RejectTopupModal from "./credit-topup/RejectTopupModal";
import AssignPricingPlanModal from "./credit-topup/AssignPricingPlanModal";

export { CREDIT_KEYS, CHANNEL_META };

const emptyForm = {
  userId: "",
  amount: 0,
  paymentMode: "cash",
  paymentReference: "",
  remarks: "",
  ...getEmptyCreditForm(),
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

const CreditTopupManagement = ({ defaultTab = "accounts" }) => {
  const { toasts, toast } = useToast();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlUserId = searchParams.get("userId") || "";

  const activeTab = useMemo(() => {
    if (location.pathname.includes("/requests")) return "requests";
    if (location.pathname.includes("/history")) return "history";
    if (location.pathname.includes("/reports")) return "reports";
    if (location.pathname.includes("/dlr")) return "dlr";
    if (location.pathname.includes("/accounts")) return "accounts";
    return searchParams.get("tab") || defaultTab || "accounts";
  }, [location.pathname, searchParams, defaultTab]);

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

  // Topup / Deduct modal state
  const [modal, setModal] = useState(false);
  const [mode, setMode] = useState("topup"); // "topup" | "deduct"
  const [form, setForm] = useState(emptyForm);
  const [modalChannel, setModalChannel] = useState("ALL");
  const [modalTargetSearch, setModalTargetSearch] = useState("");
  const [modalRoleFilter, setModalRoleFilter] = useState("ALL");

  // Reject request modal state
  const [rejectModal, setRejectModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Pricing Plan Mapping Modal state
  const [planModal, setPlanModal] = useState(false);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [planForm, setPlanForm] = useState({
    creditPlanId: "",
    isActive: true,
    isShow: true,
    isUse: true,
  });

  // DLR Webhook Simulator state
  const [dlrForm, setDlrForm] = useState({
    userId: "",
    channel: "SMS",
    category: "OTP",
    status: "DELIVERED",
    campaignId: "CAMP-SIM-" + Math.floor(100000 + Math.random() * 900000),
    units: 1,
  });
  const [dlrLoading, setDlrLoading] = useState(false);
  const [dlrResult, setDlrResult] = useState(null);

  // Overview small cards channel filter
  const [overviewChannelFilter, setOverviewChannelFilter] = useState("ALL");

  // Current user role check
  const currentUserData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isAdminOrDevops = ["ADMIN", "DEVOPS"].includes((currentUserData?.role || "").toUpperCase());

  const headerMeta = useMemo(() => {
    switch (activeTab) {
      case "requests":
        return {
          title: "Topup Requests Approval Workflow",
          subtitle: "Review, approve, or reject user credit allocation requests",
          icon: <FaHourglassHalf size={20} className="text-white" />,
        };
      case "history":
        return {
          title: "Credit Transactions & Deductions History",
          subtitle: "Comprehensive audit ledger of all credit topups, deductions, refunds, and usage",
          icon: <FaHistory size={20} className="text-white" />,
        };
      case "reports":
        return {
          title: "Platform Credit Analytics & Reports",
          subtitle: "System-wide credit breakdown, inflows, and deductions overview",
          icon: <FaChartBar size={20} className="text-white" />,
        };
      case "dlr":
        return {
          title: "Carrier DLR Webhook Simulator",
          subtitle: "Simulate live carrier delivery receipts and verify automated wallet refunds",
          icon: <FaExchangeAlt size={20} className="text-white" />,
        };
      case "accounts":
      default:
        return {
          title: "Credit Wallets & Directory",
          subtitle: "Manage client and reseller wallets, allocate credits, and set pricing plans",
          icon: <FaCoins size={20} className="text-white" />,
        };
    }
  }, [activeTab]);

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

  const loadAvailablePlans = useCallback(async () => {
    try {
      const res = await apiClient.get("/credit-plans");
      const list = unwrapData(res) || [];
      setAvailablePlans(Array.isArray(list) ? list : []);
    } catch {
      setAvailablePlans([]);
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
        loadAvailablePlans(),
      ]);
      setSummary(sumRes);
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err) {
      toast.error(err?.message || "Failed to load management data");
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, loadSummary, loadHistory, loadRequests, loadUsers, loadTotals, loadAvailablePlans, toast]);

  useEffect(() => {
    refreshAll();
  }, [selectedUserId, refreshAll]);

  useEffect(() => {
    if (urlUserId && urlUserId !== selectedUserId) {
      setSelectedUserId(urlUserId);
    }
  }, [urlUserId, selectedUserId]);

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
    setModalTargetSearch("");
    setModalRoleFilter("ALL");
    setModalChannel("ALL");
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

  const handleApprove = async (reqId) => {
    const isConfirmed = await wpSwal.confirm(
      "Approve Topup Request?",
      "Are you sure you want to approve this request and credit the user's wallet?"
    );
    if (!isConfirmed) return;
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

  const handleSimulateDlr = async (e) => {
    e.preventDefault();
    if (!dlrForm.userId) {
      toast.warning("Please select a target user for DLR webhook simulation");
      return;
    }
    try {
      setDlrLoading(true);
      setDlrResult(null);
      const res = await apiClient.post("/webhooks/delivery-report/simulate", dlrForm);
      const data = unwrapData(res) || res;
      setDlrResult(data);
      const isDelivered = ["DELIVERED", "SENT", "ANSWERED"].includes((dlrForm.status || "").toUpperCase());
      toast.success(
        isDelivered
          ? `Settled delivery unit for ${dlrForm.channel}/${dlrForm.category}`
          : `Processed carrier status (${dlrForm.status}) & auto-refunded credit back to user wallet!`
      );
      await refreshAll();
    } catch (err) {
      toast.error(err?.message || "Failed to simulate carrier webhook");
    } finally {
      setDlrLoading(false);
    }
  };

  const openPlanModal = (user) => {
    setSelectedUserForPlan(user);
    const existing = user.myCreditPlan || {};
    const hasExisting = Boolean(existing.creditPlanId);
    setPlanForm({
      creditPlanId: existing.creditPlanId?._id || existing.creditPlanId || "",
      isActive: hasExisting ? existing.isActive === true : false,
      isShow: hasExisting ? existing.isShow === true : false,
      isUse: hasExisting ? existing.isUse === true : false,
    });
    setPlanModal(true);
  };

  const handleAssignPlanSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForPlan?._id) return;
    setActionLoading(true);
    try {
      const payload = {
        creditPlanId: planForm.creditPlanId || null,
        isActive: Boolean(planForm.creditPlanId && planForm.isActive),
        isShow: Boolean(planForm.creditPlanId && planForm.isShow),
        isUse: Boolean(planForm.creditPlanId && planForm.isUse),
      };
      const res = await apiClient.patch(`/credit-plans/user/${selectedUserForPlan._id}/assign`, payload);
      if (res?.data?.success !== false) {
        toast.success(`Credit Pricing Plan updated for ${selectedUserForPlan.name}`);
        setPlanModal(false);
        await loadUsers();
      } else {
        toast.error(res?.data?.message || "Failed to assign pricing plan");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to assign pricing plan");
    } finally {
      setActionLoading(false);
    }
  };

  const balances = useMemo(() => {
    if (selectedUserId) {
      const u = users.find((x) => x._id === selectedUserId);
      if (u) {
        const w = u.creditWallet || u.myWallet || u;
        return CREDIT_KEYS.reduce((acc, k) => {
          acc[k] = Number(w[k]) || 0;
          return acc;
        }, {});
      }
      return summary?.myWallet || summary?.balances || {};
    }

    const targetAccounts = users.filter((u) => {
      if (["ADMIN", "DEVOPS"].includes((u.role || "").toUpperCase())) return false;
      if (userRoleFilter !== "ALL" && u.role !== userRoleFilter) return false;
      return true;
    });

    if (targetAccounts.length > 0) {
      return CREDIT_KEYS.reduce((acc, k) => {
        acc[k] = targetAccounts.reduce((sum, u) => {
          const w = u.creditWallet || u.myWallet || u;
          return sum + (Number(w[k]) || 0);
        }, 0);
        return acc;
      }, {});
    }

    if (totals && typeof totals === "object") {
      return CREDIT_KEYS.reduce((acc, k) => {
        acc[k] = Number(totals[k]) || 0;
        return acc;
      }, {});
    }

    return summary?.myWallet || summary?.balances || {};
  }, [selectedUserId, users, userRoleFilter, totals, summary]);

  const totalCurrentBalance = useMemo(() => {
    return CREDIT_KEYS.reduce((sum, key) => sum + (Number(balances[key]) || 0), 0);
  }, [balances]);

  const channelSubtotals = useMemo(() => {
    return {
      SMS: CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === "SMS")
        .reduce((s, k) => s + (Number(balances[k]) || 0), 0),
      WHATSAPP: CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === "WHATSAPP")
        .reduce((s, k) => s + (Number(balances[k]) || 0), 0),
      RCS: CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === "RCS")
        .reduce((s, k) => s + (Number(balances[k]) || 0), 0),
      VOICE: CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === "VOICE")
        .reduce((s, k) => s + (Number(balances[k]) || 0), 0),
      EMAIL: CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === "EMAIL")
        .reduce((s, k) => s + (Number(balances[k]) || 0), 0),
    };
  }, [balances]);

  const displayedCreditKeys = useMemo(() => {
    if (!overviewChannelFilter || overviewChannelFilter === "ALL") return CREDIT_KEYS;
    return CREDIT_KEYS.filter((k) => CHANNEL_META[k]?.channel === overviewChannelFilter);
  }, [overviewChannelFilter]);

  const targetUsers = useMemo(() => {
    return users.filter((u) => u.role === "RESELLER" || u.role === "CLIENT");
  }, [users]);

  const selectedUserObj = useMemo(() => {
    return users.find((u) => u._id === selectedUserId) || null;
  }, [users, selectedUserId]);

  const pendingRequestsCount = useMemo(
    () => requests.filter((r) => r.status === "PENDING").length,
    [requests]
  );

  if (loading && !summary) return <PageLoader />;

  if (!isAdminOrDevops) {
    return (
      <div className="telecom-module-wrapper p-4">
        <ToastContainer toasts={toasts} onRemove={toast.remove} />
        <Card className="border-0 shadow-sm">
          <CardBody className="p-5 text-center">
            <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger p-3 mb-3">
              <FaShieldAlt size={40} />
            </div>
            <h4 className="fw-bold text-dark">Access Denied: Admin Console Only</h4>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: 480 }}>
              The Credit &amp; Topup Management Console is strictly restricted to System Administrators and DevOps.
            </p>
            <Button color="primary" onClick={() => (window.location.href = "/authorized/account/my-wallet")}>
              Go to My Credit Wallet
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── UNIFIED COMMAND CARD HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-20 flex-shrink-0 adm-header-icon-box">
              {headerMeta.icon}
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">{headerMeta.title}</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                {headerMeta.subtitle}
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

      {/* ── CLIENT WALLETS AVAILABLE BALANCE STRIP (Shown on accounts overview) ── */}
      {activeTab === "accounts" && (
        <div className="mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2.5">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-semibold px-2 py-1">
                {selectedUserId ? "FILTERED ACCOUNT" : "ALL CLIENTS OVERVIEW"}
              </span>
              <span className="fw-bold text-dark small">
                {selectedUserId
                  ? `${selectedUserObj?.name || "Selected Client"} (${selectedUserObj?.role || "CLIENT"}) — Available Credits`
                  : `Total Available Balance Across All ${targetUsers.length} Clients & Resellers`}
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center gap-1.5">
                <span className="text-muted small fw-semibold text-nowrap d-none d-sm-inline">Filter Account:</span>
                <Input
                  type="select"
                  bsSize="sm"
                  value={selectedUserId}
                  onChange={(e) => handleUserFilterChange(e.target.value)}
                  style={{ width: "auto", minWidth: 200, fontSize: "12px" }}
                  className="py-1"
                >
                  <option value="">All Client Accounts (Combined)</option>
                  {targetUsers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name || "Unnamed"} ({u.role}) — {u.email}
                    </option>
                  ))}
                </Input>
                {selectedUserId && (
                  <Button
                    color="light"
                    size="sm"
                    className="py-1 px-2 text-danger small fw-semibold border"
                    onClick={() => handleUserFilterChange("")}
                    title="Clear filter"
                  >
                    <FaTimes size={10} className="me-1" /> All
                  </Button>
                )}
              </div>

              <span
                className="badge rounded-pill fw-bold px-3 py-1.5 shadow-sm text-nowrap"
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  color: "#38bdf8",
                  fontSize: "12px",
                  letterSpacing: "0.2px",
                }}
              >
                Combined Pool: {totalCurrentBalance.toLocaleString()} units
              </span>
            </div>
          </div>

          {/* Channel Filter Pills */}
          <div className="d-flex flex-wrap gap-1.5 mb-2.5">
            <Button
              size="sm"
              color={overviewChannelFilter === "ALL" ? "dark" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "ALL" ? "shadow-sm" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("ALL")}
            >
              All Channels (20)
            </Button>
            <Button
              size="sm"
              color={overviewChannelFilter === "SMS" ? "success" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "SMS" ? "shadow-sm text-white" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("SMS")}
            >
              SMS (6) <span className="badge bg-success bg-opacity-25 text-white ms-1.5 small">{channelSubtotals.SMS.toLocaleString()}</span>
            </Button>
            <Button
              size="sm"
              color={overviewChannelFilter === "WHATSAPP" ? "success" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "WHATSAPP" ? "shadow-sm text-white" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("WHATSAPP")}
            >
              WhatsApp (5) <span className="badge bg-success bg-opacity-25 text-white ms-1.5 small">{channelSubtotals.WHATSAPP.toLocaleString()}</span>
            </Button>
            <Button
              size="sm"
              color={overviewChannelFilter === "RCS" ? "primary" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "RCS" ? "shadow-sm text-white" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("RCS")}
            >
              RCS (3) <span className="badge bg-primary bg-opacity-25 text-primary ms-1.5 small">{channelSubtotals.RCS.toLocaleString()}</span>
            </Button>
            <Button
              size="sm"
              color={overviewChannelFilter === "VOICE" ? "warning" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "VOICE" ? "shadow-sm text-dark" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("VOICE")}
            >
              Voice (4) <span className="badge bg-warning bg-opacity-25 text-dark ms-1.5 small">{channelSubtotals.VOICE.toLocaleString()}</span>
            </Button>
            <Button
              size="sm"
              color={overviewChannelFilter === "EMAIL" ? "info" : "light"}
              className={`py-1 px-2.5 fw-semibold border ${overviewChannelFilter === "EMAIL" ? "shadow-sm text-white" : "text-secondary"}`}
              style={{ fontSize: "11.5px" }}
              onClick={() => setOverviewChannelFilter("EMAIL")}
            >
              Email (2) <span className="badge bg-info bg-opacity-25 text-info ms-1.5 small">{channelSubtotals.EMAIL.toLocaleString()}</span>
            </Button>
          </div>

          {/* High-Density Small Cards Grid */}
          <Row className="g-2">
            {displayedCreditKeys.map((key) => {
              const meta = CHANNEL_META[key];
              const val = Number(balances[key]) || 0;
              return (
                <Col key={key} xs={6} sm={4} md={3} lg={2}>
                  <div
                    className="telecom-small-card h-100 p-2 rounded-2 bg-white border shadow-sm d-flex align-items-center gap-2"
                    style={{
                      borderLeft: `3.5px solid ${meta?.color || "#0d6efd"} !important`,
                      minHeight: 52,
                    }}
                    title={`${meta?.label || key}: ${meta?.desc || ""}`}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 28,
                        height: 28,
                        background: `${meta?.color || "#0d6efd"}15`,
                        color: meta?.color || "#0d6efd",
                        fontSize: 12,
                      }}
                    >
                      {meta?.icon}
                    </div>
                    <div className="min-w-0 flex-grow-1">
                      <div
                        className="text-truncate fw-semibold text-muted text-uppercase"
                        style={{ fontSize: "10.5px", letterSpacing: "0.3px", lineHeight: 1.2 }}
                        title={meta?.label || key}
                      >
                        {meta?.shortName || meta?.label || key}
                      </div>
                      <div
                        className={`fw-bold lh-1 mt-0.5 ${val > 0 ? "text-dark" : "text-muted opacity-75"}`}
                        style={{ fontSize: "13.5px" }}
                      >
                        {val.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {/* ── Direct Dedicated Content (No Wrapped Tab Bar) ── */}
      <Card className="shadow-sm border-0">
        <CardBody className="p-3">
          {activeTab === "requests" && (
            <TopupRequestsTab
              requests={requests}
              requestStatusFilter={requestStatusFilter}
              setRequestStatusFilter={setRequestStatusFilter}
              pendingRequestsCount={pendingRequestsCount}
              onApprove={handleApprove}
              onOpenRejectModal={handleRejectPrompt}
              actionLoading={actionLoading}
            />
          )}

          {activeTab === "accounts" && (
            <ResellersDirectoryTab
              users={users}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              userRoleFilter={userRoleFilter}
              setUserRoleFilter={setUserRoleFilter}
              selectedUserId={selectedUserId}
              isAdminOrDevops={isAdminOrDevops}
              onOpenPlanModal={openPlanModal}
              onOpenTopupModal={openTopupModal}
              onSelectUserForHistory={(uid) => {
                handleUserFilterChange(uid);
                window.location.href = `/authorized/credits/history?userId=${uid}`;
              }}
            />
          )}

          {activeTab === "history" && (
            <UsersHistoryTab
              history={history}
              historyMeta={historyMeta}
              historySearch={historySearch}
              setHistorySearch={setHistorySearch}
              creditTypeFilter={creditTypeFilter}
              setCreditTypeFilter={setCreditTypeFilter}
              selectedUserId={selectedUserId}
              onUserFilterChange={handleUserFilterChange}
              users={users}
              onPageChange={(p) => loadHistory(selectedUserId, p)}
            />
          )}

          {activeTab === "reports" && (
            <CreditReportsTab
              totals={totals}
              summary={summary}
            />
          )}

          {activeTab === "dlr" && (
            <CarrierDlrSimulatorTab
              users={users}
              dlrForm={dlrForm}
              setDlrForm={setDlrForm}
              dlrLoading={dlrLoading}
              dlrResult={dlrResult}
              setDlrResult={setDlrResult}
              onSimulateDlr={handleSimulateDlr}
            />
          )}
        </CardBody>
      </Card>

      {/* Topup / Deduct Modal */}
      <DirectCreditAdjustmentModal
        isOpen={modal}
        toggle={() => setModal(false)}
        mode={mode}
        form={form}
        setField={setField}
        addPreset={addPreset}
        creditSum={creditSum}
        users={users}
        modalTargetSearch={modalTargetSearch}
        setModalTargetSearch={setModalTargetSearch}
        modalRoleFilter={modalRoleFilter}
        setModalRoleFilter={setModalRoleFilter}
        modalChannel={modalChannel}
        setModalChannel={setModalChannel}
        onSubmit={handleTopupSubmit}
        actionLoading={actionLoading}
      />

      {/* Reject Request Modal */}
      <RejectTopupModal
        isOpen={rejectModal}
        toggle={() => setRejectModal(false)}
        activeRequest={activeRequest}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onSubmit={handleRejectSubmit}
        actionLoading={actionLoading}
      />

      {/* Assign Pricing Plan Modal */}
      <AssignPricingPlanModal
        isOpen={planModal}
        toggle={() => setPlanModal(false)}
        selectedUser={selectedUserForPlan}
        availablePlans={availablePlans}
        planForm={planForm}
        setPlanForm={setPlanForm}
        onSubmit={handleAssignPlanSubmit}
        actionLoading={actionLoading}
      />
    </div>
  );
};

export default CreditTopupManagement;
