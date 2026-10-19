import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Nav, NavItem, NavLink,
  Spinner, InputGroup, ButtonGroup, Alert
} from "reactstrap";
import {
  FaCoins, FaPlus, FaSearch, FaSyncAlt,
  FaWallet, FaHistory, FaExchangeAlt, FaArrowUp,
  FaArrowDown, FaCheckCircle, FaTimesCircle, FaHourglassHalf,
  FaIdBadge, FaPaperPlane, FaFilter, FaCalendarAlt, FaUndo,
  FaEye, FaReceipt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

import {
  CREDIT_KEYS,
  CHANNELS_LIST,
  CHANNEL_META,
  CHANNEL_CATEGORIES_BY_CHANNEL,
  getEmptyCreditForm,
  getWalletCredit,
} from "./creditConstants";

const PAYMENT_MODES = ["upi", "neft", "imps", "bank_transfer", "card", "cash", "other"];

const emptyRequestForm = {
  amount: "",
  paymentMode: "upi",
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

const MyCreditWallet = () => {
  const { toasts, toast } = useToast();

  // ── Tab State with Refresh Persistence ──
  const storedTab = useMemo(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlTab = urlParams.get("tab");
      if (urlTab && ["history", "requests"].includes(urlTab)) {
        return urlTab;
      }
      const saved = sessionStorage.getItem("myCreditWalletActiveTab");
      if (saved && ["history", "requests"].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // fallback
    }
    return "history";
  }, []);

  const [tab, setTabState] = useState(storedTab);

  const setTab = useCallback((newTab) => {
    setTabState(newTab);
    try {
      sessionStorage.setItem("myCreditWalletActiveTab", newTab);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    } catch (e) {
      // ignore
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  const [summary, setSummary] = useState(null);

  // ── Tab 1: History State ──
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ totalRecords: 0, page: 1, limit: 25, totalPages: 1 });
  const [historySearch, setHistorySearch] = useState("");
  const [historyCreditType, setHistoryCreditType] = useState("ALL");
  const [historyPaymentMode, setHistoryPaymentMode] = useState("ALL");
  const [historyFromDate, setHistoryFromDate] = useState("");
  const [historyToDate, setHistoryToDate] = useState("");
  const [historyLimit, setHistoryLimit] = useState(25);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ── Tab 2: Requests State ──
  const [myRequests, setMyRequests] = useState([]);
  const [requestsMeta, setRequestsMeta] = useState({ totalRecords: 0, page: 1, limit: 25, totalPages: 1 });
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatus, setRequestStatus] = useState("ALL");
  const [requestPaymentMode, setRequestPaymentMode] = useState("ALL");
  const [requestFromDate, setRequestFromDate] = useState("");
  const [requestToDate, setRequestToDate] = useState("");
  const [requestLimit, setRequestLimit] = useState(25);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [activeChannelFilter, setActiveChannelFilter] = useState("ALL");
  const [requestModalChannel, setRequestModalChannel] = useState("ALL");

  const [requestModal, setRequestModal] = useState(false);
  const [form, setForm] = useState(emptyRequestForm);

  const currentUserData = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isManager = (currentUserData?.role || "").toUpperCase() === "MANAGER";
  const parentClientId = currentUserData?.owner || currentUserData?.createdBy || currentUserData?.reseller;

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiClient.get("/credits/summary");
      return unwrapData(res) || null;
    } catch {
      return null;
    }
  }, []);

  const loadHistory = useCallback(async (page = 1) => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(historyLimit || 25),
      });
      if (historyCreditType && historyCreditType !== "ALL") params.set("creditType", historyCreditType);
      if (historyPaymentMode && historyPaymentMode !== "ALL") params.set("paymentMode", historyPaymentMode);
      if (historySearch.trim()) params.set("search", historySearch.trim());
      if (historyFromDate) params.set("fromDate", historyFromDate);
      if (historyToDate) params.set("toDate", historyToDate);

      const res = await apiClient.get(`/credits/history?${params.toString()}`);
      const list = unwrapData(res);
      const total = res?.totalRecords ?? res?.data?.totalRecords ?? (Array.isArray(list) ? list.length : 0);
      const pageNum = res?.page ?? res?.data?.page ?? page;
      const totalP = res?.totalPages ?? res?.data?.totalPages ?? Math.max(1, Math.ceil(total / (Number(historyLimit) || 25)));

      setHistory(Array.isArray(list) ? list : []);
      setHistoryMeta({
        totalRecords: total,
        page: pageNum,
        limit: Number(historyLimit) || 25,
        totalPages: totalP,
      });
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyCreditType, historyPaymentMode, historySearch, historyFromDate, historyToDate, historyLimit]);

  const loadMyRequests = useCallback(async (page = 1) => {
    try {
      setRequestsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(requestLimit || 25),
      });
      if (requestStatus && requestStatus !== "ALL") params.set("status", requestStatus);
      if (requestPaymentMode && requestPaymentMode !== "ALL") params.set("paymentMode", requestPaymentMode);
      if (requestSearch.trim()) params.set("search", requestSearch.trim());
      if (requestFromDate) params.set("fromDate", requestFromDate);
      if (requestToDate) params.set("toDate", requestToDate);

      const res = await apiClient.get(`/credits/my-requests?${params.toString()}`);
      const list = unwrapData(res);
      const total = res?.totalRecords ?? res?.data?.totalRecords ?? (Array.isArray(list) ? list.length : 0);
      const pageNum = res?.page ?? res?.data?.page ?? page;
      const totalP = res?.totalPages ?? res?.data?.totalPages ?? Math.max(1, Math.ceil(total / (Number(requestLimit) || 25)));

      setMyRequests(Array.isArray(list) ? list : []);
      setRequestsMeta({
        totalRecords: total,
        page: pageNum,
        limit: Number(requestLimit) || 25,
        totalPages: totalP,
      });
    } catch {
      setMyRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [requestStatus, requestPaymentMode, requestSearch, requestFromDate, requestToDate, requestLimit]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes] = await Promise.all([
        loadSummary(),
        loadHistory(1),
        loadMyRequests(1),
      ]);
      setSummary(sumRes);
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err) {
      toast.error(err?.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  }, [loadSummary, loadHistory, loadMyRequests, toast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Debounced search & filter on history
  useEffect(() => {
    const t = setTimeout(() => {
      loadHistory(1);
    }, 300);
    return () => clearTimeout(t);
  }, [historyCreditType, historyPaymentMode, historySearch, historyFromDate, historyToDate, historyLimit, loadHistory]);

  // Debounced search & filter on requests
  useEffect(() => {
    const t = setTimeout(() => {
      loadMyRequests(1);
    }, 300);
    return () => clearTimeout(t);
  }, [requestStatus, requestPaymentMode, requestSearch, requestFromDate, requestToDate, requestLimit, loadMyRequests]);

  const resetHistoryFilters = () => {
    setHistorySearch("");
    setHistoryCreditType("ALL");
    setHistoryPaymentMode("ALL");
    setHistoryFromDate("");
    setHistoryToDate("");
    setHistoryLimit(25);
  };

  const resetRequestFilters = () => {
    setRequestSearch("");
    setRequestStatus("ALL");
    setRequestPaymentMode("ALL");
    setRequestFromDate("");
    setRequestToDate("");
    setRequestLimit(25);
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

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planModalFilter, setPlanModalFilter] = useState("ALL");
  const [planModalSearch, setPlanModalSearch] = useState("");

  const showPrice = Boolean(
    summary?.showCalculatedPrice ||
    summary?.isUse ||
    (summary?.myCreditPlan?.isActive === true && summary?.myCreditPlan?.isUse === true)
  );

  const calculatedTotalAmount = useMemo(() => {
    const rates = summary?.effectiveRates || {};
    const sum = CREDIT_KEYS.reduce((acc, k) => {
      const u = Number(form[k]) || 0;
      const rate = Number(rates[k]?.costPerUnit) || 1;
      return acc + (u * rate);
    }, 0);
    return Math.round(sum * 100) / 100;
  }, [form, summary?.effectiveRates]);

  useEffect(() => {
    if (showPrice && calculatedTotalAmount > 0) {
      setForm((prev) => ({
        ...prev,
        amount: String(calculatedTotalAmount),
      }));
    }
  }, [showPrice, calculatedTotalAmount]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (creditSum <= 0) {
      toast.warning("Please request at least one channel credit greater than 0");
      return;
    }

    try {
      setRequestLoading(true);
      const res = await apiClient.post("/credits/request", {
        ...form,
        amount: Number(form.amount) || calculatedTotalAmount || creditSum,
      });

      toast.success(
        res?.message || res?.data?.message || "Topup request submitted successfully! Awaiting admin approval."
      );
      setRequestModal(false);
      setForm(emptyRequestForm);
      setTab("requests");
      await Promise.all([loadMyRequests(), refreshAll()]);
      window.dispatchEvent(new Event("wallet-updated"));
    } catch (err) {
      toast.error(err?.message || err?.data?.message || "Failed to submit credit request");
    } finally {
      setRequestLoading(false);
    }
  };

  const balances = useMemo(() => {
    return summary?.myWallet || summary?.balances || {};
  }, [summary]);

  const totalCurrentBalance = useMemo(() => {
    return CREDIT_KEYS.reduce((sum, key) => sum + (Number(balances[key]) || 0), 0);
  }, [balances]);

  if (loading && !summary) return <PageLoader />;

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── UNIFIED COMMAND CARD HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-20 flex-shrink-0 adm-header-icon-box">
              <FaWallet size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">My Credit Wallet</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Real-time channel balances, usage limits, deductions, and topup requests
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              type="button"
              size="sm"
              className="fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-2 text-white border-0 shadow-sm"
              style={{
                background: "rgba(255, 255, 255, 0.14)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                borderRadius: "9px",
                transition: "all 0.2s ease",
              }}
              onClick={refreshAll}
              disabled={loading}
            >
              <FaSyncAlt size={12} className={loading ? "fa-spin text-info" : "text-dark"} />
              <span className="text-dark">Refresh</span>
            </Button>
            <Button
              type="button"
              className="fw-bold px-3.5 py-2 d-inline-flex align-items-center gap-2 text-white border-0 shadow"
              style={{
                background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #1d4ed8 100%)",
                borderRadius: "9px",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.45)",
                transition: "all 0.2s ease",
                letterSpacing: "0.2px",
              }}
              onClick={() => setRequestModal(true)}
            >
              <FaPlus size={12} />
              <span>Request Credit Topup</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Manager Info Notice ── */}
      {isManager && (
        <Alert color="info" className="d-flex align-items-center gap-2 py-2 mb-3 small">
          <FaIdBadge className="fs-5 text-primary" />
          <div>
            <strong>Manager Account:</strong> You are managing this workspace.
            {parentClientId && (
              <span className="ms-1">
                Associated Parent Client ID: <code>{parentClientId}</code>
              </span>
            )}
          </div>
        </Alert>
      )}

      {/* ── Active Pricing Plan Banner (Shown ONLY when BOTH isActive AND isShow are true) ── */}
      {summary?.pricingPlan &&
        summary?.myCreditPlan?.isActive === true &&
        summary?.myCreditPlan?.isShow === true && (
          <Card className="border-0 shadow-sm mb-3 bg-white border-start border-4 border-success">
            <CardBody className="py-2.5 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 fw-bold px-2 py-1">
                  ACTIVE PRICING PLAN
                </span>
                <strong className="text-dark small">
                  {summary.pricingPlan.planName}
                </strong>
                {summary.pricingPlan.description && (
                  <span className="text-muted small d-none d-md-inline">
                    — {summary.pricingPlan.description}
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                {summary?.myCreditPlan?.isUse === true ? (
                  <span className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-30 small px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                    <FaCheckCircle size={11} /> Custom Rates Applied to Credit Requests
                  </span>
                ) : (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary border small px-2.5 py-1.5">
                    Standard Rates (Plan Assigned For Reference)
                  </span>
                )}
                <Button
                  color="primary"
                  size="sm"
                  className="fw-bold d-inline-flex align-items-center gap-1.5 px-3 py-1.5 text-white border-0 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
                  }}
                  onClick={() => setShowPlanModal(true)}
                >
                  <FaEye size={12} /> View Plan
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

      {/* ── Channel Balance Cards ── */}
      <div className="mb-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
          <div className="d-flex flex-wrap align-items-center gap-1">
            <span className="small fw-semibold text-uppercase text-muted me-2">
              Balances:
            </span>
            <Button
              type="button"
              size="sm"
              color={activeChannelFilter === "ALL" ? "dark" : "light"}
              className="py-0 px-2 fw-semibold"
              onClick={() => setActiveChannelFilter("ALL")}
            >
              All (20)
            </Button>
            {CHANNELS_LIST.filter((c) => c.id !== "ALL").map((c) => {
              const count = (CHANNEL_CATEGORIES_BY_CHANNEL[c.id] || []).length;
              return (
                <Button
                  key={c.id}
                  type="button"
                  size="sm"
                  color={activeChannelFilter === c.id ? "primary" : "light"}
                  className="py-0 px-2 fw-semibold"
                  onClick={() => setActiveChannelFilter(c.id)}
                >
                  {c.icon} {c.name || c.label} ({count})
                </Button>
              );
            })}
          </div>
          <span className="badge bg-dark fs-6 py-1.5 px-2.5">
            Total Combined Credits: {totalCurrentBalance.toLocaleString()}
          </span>
        </div>
        <Row className="g-2">
          {(activeChannelFilter === "ALL"
            ? CREDIT_KEYS
            : (CHANNEL_CATEGORIES_BY_CHANNEL[activeChannelFilter] || []).map((c) => typeof c === "string" ? c : (c?.creditKey || c?.key))
          ).map((key) => {
            const meta = CHANNEL_META[key] || { label: key, color: "#333", icon: "•", desc: "" };
            const val = getWalletCredit(balances, key);
            return (
              <Col key={key} xs={6} sm={4} md={3} lg={2}>
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

      {/* ── Scoped Hover & Active Tab Styles ── */}
      <style>{`
        .wallet-tab-btn {
          transition: all 0.22s ease-in-out;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          border-radius: 8px;
          border: 1px solid transparent;
        }
        .wallet-tab-btn.inactive-tab {
          background-color: rgba(255, 255, 255, 0.08) !important;
          color: #e2e8f0 !important;
          border-color: rgba(255, 255, 255, 0.16) !important;
        }
        .wallet-tab-btn.inactive-tab:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          color: #ffffff !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transform: translateY(-1px);
        }
        .wallet-tab-btn.active-history {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          color: #ffffff !important;
          border-color: #60a5fa !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
        }
        .wallet-tab-btn.active-requests {
          background: linear-gradient(135deg, #0d9488, #0f766e) !important;
          color: #ffffff !important;
          border-color: #2dd4bf !important;
          box-shadow: 0 4px 14px rgba(13, 148, 136, 0.45);
        }
        .filter-input-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 2px;
          display: block;
        }
      `}</style>

      {/* ── Main Tabbed Content (History & Requests) ── */}
      <Card className="shadow-sm border-0">
        <CardHeader
          className="py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderBottom: "2px solid #0ea5e9"
          }}
        >
          {/* LEFT: Full High-Contrast Tab Buttons with Hover Effects */}
          <div className="d-flex align-items-center flex-wrap gap-2">
            <button
              type="button"
              className={`wallet-tab-btn d-flex align-items-center gap-2 px-3 py-2 ${
                tab === "history" ? "active-history" : "inactive-tab"
              }`}
              onClick={() => setTab("history")}
            >
              <FaHistory className="me-1" />
              <span>Transaction History &amp; Deductions</span>
              <span
                className="badge rounded-pill fw-bold"
                style={{
                  backgroundColor: tab === "history" ? "#ffffff" : "rgba(255,255,255,0.22)",
                  color: tab === "history" ? "#1d4ed8" : "#ffffff",
                  fontSize: "11px",
                  padding: "3px 8px",
                  lineHeight: "1",
                }}
              >
                {Number(historyMeta?.totalRecords) || 0}
              </span>
            </button>

            <button
              type="button"
              className={`wallet-tab-btn d-flex align-items-center gap-2 px-3 py-2 ${
                tab === "requests" ? "active-requests" : "inactive-tab"
              }`}
              onClick={() => setTab("requests")}
            >
              <FaHourglassHalf className="me-1" />
              <span>My Topup Requests</span>
              <span
                className="badge rounded-pill fw-bold"
                style={{
                  backgroundColor: tab === "requests" ? "#ffffff" : "rgba(255,255,255,0.22)",
                  color: tab === "requests" ? "#0f766e" : "#ffffff",
                  fontSize: "11px",
                  padding: "3px 8px",
                  lineHeight: "1",
                }}
              >
                {Number(requestsMeta?.totalRecords) || 0}
              </span>
            </button>
          </div>

          {/* RIGHT: Quick Action & Refresh Controls */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <Button
              color="light"
              size="sm"
              className="d-flex align-items-center gap-1.5 px-2.5 py-1.5 text-white fw-semibold border-0"
              style={{ background: "rgba(255, 255, 255, 0.12)" }}
              onClick={refreshAll}
              disabled={loading || historyLoading || requestsLoading}
              title="Refresh wallet balances and transactions"
            >
              <FaSyncAlt size={11} className={loading || historyLoading || requestsLoading ? "fa-spin" : ""} />
              <span className="d-none d-sm-inline">Refresh</span>
            </Button>

            <Button
              color="success"
              size="sm"
              className="fw-bold shadow-sm px-3 py-1.5 d-flex align-items-center gap-1.5 border-0 text-white"
              style={{ background: "#10b981" }}
              onClick={() => setRequestModal(true)}
            >
              <FaPlus size={11} />
              <span>Request Topup</span>
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-3">

          {/* ──── TAB 1: HISTORY & DEDUCTIONS ──── */}
          {tab === "history" && (
            <>
              {/* Filter Toolbar for History */}
              <div className="p-2.5 mb-3 bg-light rounded border">
                <Row className="g-2 align-items-end">
                  <Col xs={12} md={4} lg={3}>
                    <span className="filter-input-label">Search Query</span>
                    <InputGroup size="sm">
                      <Input
                        placeholder="Reference, remarks, invoice..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                      />
                      {historySearch && (
                        <Button color="secondary" outline onClick={() => setHistorySearch("")}>
                          ✕
                        </Button>
                      )}
                    </InputGroup>
                  </Col>

                  <Col xs={6} md={4} lg={2}>
                    <span className="filter-input-label">Credit Type</span>
                    <Input
                      type="select"
                      size="sm"
                      value={historyCreditType}
                      onChange={(e) => setHistoryCreditType(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="topup">Topup (Added)</option>
                      <option value="deduct">Deduct (Debited)</option>
                      <option value="refund">Refund</option>
                      <option value="usage">Campaign Usage</option>
                    </Input>
                  </Col>

                  <Col xs={6} md={4} lg={2}>
                    <span className="filter-input-label">Payment Mode</span>
                    <Input
                      type="select"
                      size="sm"
                      value={historyPaymentMode}
                      onChange={(e) => setHistoryPaymentMode(e.target.value)}
                    >
                      <option value="ALL">All Modes</option>
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>{m.toUpperCase()}</option>
                      ))}
                    </Input>
                  </Col>

                  <Col xs={6} md={3} lg={2}>
                    <span className="filter-input-label">From Date</span>
                    <Input
                      type="date"
                      size="sm"
                      value={historyFromDate}
                      onChange={(e) => setHistoryFromDate(e.target.value)}
                    />
                  </Col>

                  <Col xs={6} md={3} lg={2}>
                    <span className="filter-input-label">To Date</span>
                    <Input
                      type="date"
                      size="sm"
                      value={historyToDate}
                      onChange={(e) => setHistoryToDate(e.target.value)}
                    />
                  </Col>

                  <Col xs={12} md={6} lg={1} className="d-flex align-items-center gap-1">
                    <Button
                      color="secondary"
                      size="sm"
                      outline
                      className="w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={resetHistoryFilters}
                      title="Reset all filters"
                    >
                      <FaUndo size={10} />
                      <span>Reset</span>
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Transactions Table */}
              <div className="table-responsive">
                <Table hover bordered size="sm" className="align-middle small mb-2">
                  <thead className="table-light text-nowrap">
                    <tr>
                      <th>Date &amp; Time</th>
                      <th>Type</th>
                      <th>Credits Delta</th>
                      <th className="text-end">Units</th>
                      <th className="text-end">Amount (₹)</th>
                      <th>Payment Mode</th>
                      <th>Reference / Remarks</th>
                      <th>Processed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <Spinner size="sm" color="primary" className="me-2" />
                          <span className="text-muted">Filtering transactions from server...</span>
                        </td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No transactions or deductions found matching the selected criteria.
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

              {/* Bottom Pagination Bar for History */}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Rows per page:</span>
                  <Input
                    type="select"
                    size="sm"
                    style={{ width: "75px" }}
                    value={historyLimit}
                    onChange={(e) => setHistoryLimit(Number(e.target.value) || 25)}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Input>
                  <span className="small text-muted ms-2">
                    Showing {history.length > 0 ? ((historyMeta.page - 1) * historyMeta.limit) + 1 : 0} to{" "}
                    {Math.min(historyMeta.page * historyMeta.limit, historyMeta.totalRecords)} of {historyMeta.totalRecords} records
                  </span>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadHistory(1)}
                    disabled={historyMeta.page <= 1 || historyLoading}
                  >
                    « First
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadHistory(historyMeta.page - 1)}
                    disabled={historyMeta.page <= 1 || historyLoading}
                  >
                    ‹ Prev
                  </Button>
                  <span className="px-2 small fw-semibold text-dark">
                    Page {historyMeta.page} of {historyMeta.totalPages || 1}
                  </span>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadHistory(historyMeta.page + 1)}
                    disabled={historyMeta.page >= historyMeta.totalPages || historyLoading}
                  >
                    Next ›
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadHistory(historyMeta.totalPages)}
                    disabled={historyMeta.page >= historyMeta.totalPages || historyLoading}
                  >
                    Last »
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ──── TAB 2: MY TOPUP REQUESTS ──── */}
          {tab === "requests" && (
            <>
              {/* Filter Toolbar for Requests */}
              <div className="p-2.5 mb-3 bg-light rounded border">
                <Row className="g-2 align-items-end">
                  <Col xs={12} md={4} lg={3}>
                    <span className="filter-input-label">Search Query</span>
                    <InputGroup size="sm">
                      <Input
                        placeholder="Reference, remarks, note, UTR..."
                        value={requestSearch}
                        onChange={(e) => setRequestSearch(e.target.value)}
                      />
                      {requestSearch && (
                        <Button color="secondary" outline onClick={() => setRequestSearch("")}>
                          ✕
                        </Button>
                      )}
                    </InputGroup>
                  </Col>

                  <Col xs={6} md={4} lg={2}>
                    <span className="filter-input-label">Status</span>
                    <Input
                      type="select"
                      size="sm"
                      value={requestStatus}
                      onChange={(e) => setRequestStatus(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">Pending Approval</option>
                      <option value="APPROVED">Approved &amp; Credited</option>
                      <option value="REJECTED">Rejected</option>
                    </Input>
                  </Col>

                  <Col xs={6} md={4} lg={2}>
                    <span className="filter-input-label">Payment Mode</span>
                    <Input
                      type="select"
                      size="sm"
                      value={requestPaymentMode}
                      onChange={(e) => setRequestPaymentMode(e.target.value)}
                    >
                      <option value="ALL">All Modes</option>
                      {PAYMENT_MODES.map((m) => (
                        <option key={m} value={m}>{m.toUpperCase()}</option>
                      ))}
                    </Input>
                  </Col>

                  <Col xs={6} md={3} lg={2}>
                    <span className="filter-input-label">From Date</span>
                    <Input
                      type="date"
                      size="sm"
                      value={requestFromDate}
                      onChange={(e) => setRequestFromDate(e.target.value)}
                    />
                  </Col>

                  <Col xs={6} md={3} lg={2}>
                    <span className="filter-input-label">To Date</span>
                    <Input
                      type="date"
                      size="sm"
                      value={requestToDate}
                      onChange={(e) => setRequestToDate(e.target.value)}
                    />
                  </Col>

                  <Col xs={12} md={6} lg={1} className="d-flex align-items-center gap-1">
                    <Button
                      color="secondary"
                      size="sm"
                      outline
                      className="w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={resetRequestFilters}
                      title="Reset all filters"
                    >
                      <FaUndo size={10} />
                      <span>Reset</span>
                    </Button>
                  </Col>
                </Row>
              </div>

              {/* Topup Requests Table */}
              <div className="table-responsive">
                <Table hover bordered size="sm" className="align-middle small mb-2">
                  <thead className="table-light text-nowrap">
                    <tr>
                      <th>Request Date</th>
                      <th>Credits Requested</th>
                      <th className="text-end">Total Units</th>
                      <th className="text-end">Amount (₹)</th>
                      <th>Payment Mode</th>
                      <th>Reference / UTR</th>
                      <th>Status</th>
                      <th>Admin Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestsLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <Spinner size="sm" color="primary" className="me-2" />
                          <span className="text-muted">Filtering requests from server...</span>
                        </td>
                      </tr>
                    ) : myRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No credit topup requests found matching the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      myRequests.map((req) => (
                        <tr key={req._id}>
                          <td className="text-nowrap">
                            {req.createdAt ? new Date(req.createdAt).toLocaleString() : "—"}
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {CREDIT_KEYS.map((k) => {
                                const val = req[k] || req.creditsDelta?.[k];
                                if (!val) return null;
                                return (
                                  <Badge key={k} color="light" className="border text-dark">
                                    {CHANNEL_META[k].label}: +{val.toLocaleString()}
                                  </Badge>
                                );
                              })}
                            </div>
                          </td>
                          <td className="text-end fw-bold">{req.units?.toLocaleString()}</td>
                          <td className="text-end fw-semibold">₹{Number(req.amount || 0).toLocaleString()}</td>
                          <td className="text-uppercase">{req.paymentMode}</td>
                          <td>{req.paymentReference || "—"}</td>
                          <td>
                            {req.status === "PENDING" && (
                              <Badge color="warning" pill className="d-inline-flex align-items-center gap-1">
                                <FaHourglassHalf /> Pending Approval
                              </Badge>
                            )}
                            {req.status === "APPROVED" && (
                              <Badge color="success" pill className="d-inline-flex align-items-center gap-1">
                                <FaCheckCircle /> Approved &amp; Credited
                              </Badge>
                            )}
                            {req.status === "REJECTED" && (
                              <Badge color="danger" pill className="d-inline-flex align-items-center gap-1">
                                <FaTimesCircle /> Rejected
                              </Badge>
                            )}
                          </td>
                          <td>
                            {req.rejectionReason ? (
                              <span className="text-danger">{req.rejectionReason}</span>
                            ) : req.approvedBy ? (
                              <span className="text-success small">Approved by {req.approvedBy.name}</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Bottom Pagination Bar for Requests */}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted">Rows per page:</span>
                  <Input
                    type="select"
                    size="sm"
                    style={{ width: "75px" }}
                    value={requestLimit}
                    onChange={(e) => setRequestLimit(Number(e.target.value) || 25)}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Input>
                  <span className="small text-muted ms-2">
                    Showing {myRequests.length > 0 ? ((requestsMeta.page - 1) * requestsMeta.limit) + 1 : 0} to{" "}
                    {Math.min(requestsMeta.page * requestsMeta.limit, requestsMeta.totalRecords)} of {requestsMeta.totalRecords} requests
                  </span>
                </div>

                <div className="d-flex align-items-center gap-1">
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadMyRequests(1)}
                    disabled={requestsMeta.page <= 1 || requestsLoading}
                  >
                    « First
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadMyRequests(requestsMeta.page - 1)}
                    disabled={requestsMeta.page <= 1 || requestsLoading}
                  >
                    ‹ Prev
                  </Button>
                  <span className="px-2 small fw-semibold text-dark">
                    Page {requestsMeta.page} of {requestsMeta.totalPages || 1}
                  </span>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadMyRequests(requestsMeta.page + 1)}
                    disabled={requestsMeta.page >= requestsMeta.totalPages || requestsLoading}
                  >
                    Next ›
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    className="border"
                    onClick={() => loadMyRequests(requestsMeta.totalPages)}
                    disabled={requestsMeta.page >= requestsMeta.totalPages || requestsLoading}
                  >
                    Last »
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* ── Request Credit Topup Modal ── */}
      <Modal isOpen={requestModal} toggle={() => setRequestModal(false)} size="xl" centered backdrop="static">
        <Form onSubmit={handleRequestSubmit}>
          <ModalHeader toggle={() => setRequestModal(false)} className="py-2.5 px-3">
            <div className="d-flex align-items-center gap-2 text-white fw-bold">
              <FaPaperPlane /> Request Credit Topup
            </div>
          </ModalHeader>
          <ModalBody className="p-3">
            <p className="text-muted small mb-2">
              Select the channels and credit units you need, enter payment reference details, and submit for instant admin verification.
            </p>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <div className="d-flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  color={requestModalChannel === "ALL" ? "dark" : "light"}
                  className="py-0 px-2 fw-semibold"
                  onClick={() => setRequestModalChannel("ALL")}
                >
                  All Channels (20)
                </Button>
                {CHANNELS_LIST.filter((c) => c.id !== "ALL").map((c) => {
                  const count = (CHANNEL_CATEGORIES_BY_CHANNEL[c.id] || []).length;
                  return (
                    <Button
                      key={c.id}
                      type="button"
                      size="sm"
                      color={requestModalChannel === c.id ? "primary" : "light"}
                      className="py-0 px-2 fw-semibold"
                      onClick={() => setRequestModalChannel(c.id)}
                    >
                      {c.icon} {c.name || c.label} ({count})
                    </Button>
                  );
                })}
              </div>
              <span className="text-muted small">Click +1k / +5k presets to increment</span>
            </div>

            <Row className="g-2 mb-2.5">
              {(requestModalChannel === "ALL"
                ? CREDIT_KEYS
                : (CHANNEL_CATEGORIES_BY_CHANNEL[requestModalChannel] || []).map((c) => typeof c === "string" ? c : (c?.creditKey || c?.key))
              ).map((key) => {
                const meta = CHANNEL_META[key] || { label: key, color: "#333", icon: "•", desc: "" };
                const rateInfo = summary?.effectiveRates?.[key] || { costPerUnit: 1, isCustom: false };
                const rate = Number(rateInfo.costPerUnit) || 1;
                const units = Number(form[key]) || 0;
                const lineAmount = units * rate;

                return (
                  <Col key={key} xs={6} sm={6} md={3}>
                    <div className="border rounded-3 p-2 bg-light h-100 d-flex flex-column justify-content-between">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Label className="small fw-semibold mb-0 text-truncate mw-100" style={{ color: meta.color }} title={meta.desc || meta.label}>
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
                      <div className="d-flex align-items-center justify-content-between mb-1" style={{ fontSize: "10.5px" }}>
                        {showPrice ? (
                          <>
                            <span className="text-muted">
                              Rate: <strong className="text-dark">₹{rate.toFixed(2)}</strong>
                            </span>
                            {rateInfo.isCustom && (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: "9px" }}>
                                Plan
                              </span>
                            )}
                            {units > 0 && (
                              <span className="text-success fw-bold">
                                ₹{lineAmount.toLocaleString()}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "10px" }}>
                            {meta.shortName || meta.category || "Route"}
                          </span>
                        )}
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

              {/* Live Summary Card */}
              <Col xs={6} sm={6} md={3}>
                <div className="border border-primary border-opacity-25 rounded-3 p-2 bg-primary bg-opacity-10 h-100 d-flex flex-column justify-content-center align-items-center text-center">
                  <span className="small text-primary fw-bold text-uppercase">
                    Total Requested
                  </span>
                  <span className="fs-5 fw-bold text-primary my-0 lh-1">
                    {creditSum.toLocaleString()} <span className="small fs-6 fw-normal">units</span>
                  </span>
                  {showPrice ? (
                    <div className="border-top border-primary border-opacity-25 w-100 mt-2 pt-1 text-center">
                      <span className="small text-secondary fw-semibold">Calculated Cost:</span>
                      <div className="fs-5 fw-bold text-success lh-1 mt-0.5">
                        ₹{calculatedTotalAmount.toLocaleString()}
                      </div>
                      {summary?.isCustomPlanApplied && (
                        <span className="badge bg-success bg-opacity-25 text-success small mt-1">
                          Active Plan Rates Applied
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="border-top border-primary border-opacity-25 w-100 mt-2 pt-1 text-center">
                      <span className="small text-muted">
                        Enter payment details below
                      </span>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            <Row className="g-2">
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Amount Paid (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    size="sm"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    placeholder={showPrice && calculatedTotalAmount > 0 ? `₹${calculatedTotalAmount}` : "e.g. 5000"}
                    required
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
                  <Label className="small fw-semibold mb-1">UTR / Transaction Ref</Label>
                  <Input
                    size="sm"
                    value={form.paymentReference}
                    onChange={(e) => setField("paymentReference", e.target.value)}
                    placeholder="e.g. 12-digit UTR / Txn Ref No."
                    required
                  />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6} md={3}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Remarks / Note</Label>
                  <Input
                    size="sm"
                    value={form.remarks}
                    onChange={(e) => setField("remarks", e.target.value)}
                    placeholder="e.g. Monthly topup or quota notes"
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="py-2 px-3">
            <Button color="light" size="sm" onClick={() => setRequestModal(false)} disabled={requestLoading}>
              Cancel
            </Button>
            <Button color="primary" size="sm" type="submit" disabled={requestLoading || creditSum <= 0} className="px-3 fw-semibold">
              {requestLoading ? <Spinner size="sm" className="me-1" /> : <FaPaperPlane className="me-1" />}
              Submit Request
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── Active Pricing Plan Details Modal ── */}
      <Modal isOpen={showPlanModal} toggle={() => setShowPlanModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setShowPlanModal(false)} className="py-2.5 px-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-2 text-dark fw-bold">
            <FaReceipt className="text-primary" /> Pricing Plan Details: {summary?.pricingPlan?.planName}
          </div>
        </ModalHeader>
        <ModalBody className="p-3">
          {summary?.pricingPlan && (
            <>
              {/* Plan Metadata Overview */}
              <div className="p-3 rounded-3 bg-light border mb-3">
                <Row className="g-2 small">
                  <Col sm={4}>
                    <div className="text-muted">Plan Name:</div>
                    <div className="fw-bold text-dark fs-6">{summary.pricingPlan.planName}</div>
                  </Col>
                  <Col sm={4}>
                    <div className="text-muted">Channel Scope:</div>
                    <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 mt-0.5">
                      {summary.pricingPlan.channel === "ALL" ? "All Channels (20 Routes)" : summary.pricingPlan.channel}
                    </span>
                  </Col>
                  <Col sm={4}>
                    <div className="text-muted">Billing Currency:</div>
                    <div className="fw-semibold text-dark">{summary.pricingPlan.currency || "INR (₹)"}</div>
                  </Col>
                  {summary.pricingPlan.description && (
                    <Col xs={12} className="mt-1 pt-1 border-top">
                      <span className="text-muted">Description: </span>
                      <span className="text-dark">{summary.pricingPlan.description}</span>
                    </Col>
                  )}
                </Row>
              </div>

              {/* Filter bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                <div className="d-flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    color={planModalFilter === "ALL" ? "dark" : "light"}
                    className="py-0 px-2 fw-semibold"
                    onClick={() => setPlanModalFilter("ALL")}
                  >
                    All Channels
                  </Button>
                  {CHANNELS_LIST.filter((c) => c.id !== "ALL").map((c) => (
                    <Button
                      key={c.id}
                      size="sm"
                      color={planModalFilter === c.id ? "primary" : "light"}
                      className="py-0 px-2 fw-semibold"
                      onClick={() => setPlanModalFilter(c.id)}
                    >
                      {c.icon} {c.name || c.label}
                    </Button>
                  ))}
                </div>
                <div style={{ maxWidth: 220 }} className="w-100">
                  <Input
                    size="sm"
                    type="text"
                    placeholder="Search route or code..."
                    value={planModalSearch}
                    onChange={(e) => setPlanModalSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Rates Table */}
              <div className="table-responsive border rounded-3" style={{ maxHeight: 380, overflowY: "auto" }}>
                <Table hover size="sm" className="mb-0 align-middle">
                  <thead className="table-light small text-uppercase sticky-top">
                    <tr>
                      <th className="py-2 px-3">Channel / Route</th>
                      <th className="py-2 px-2">Category Code</th>
                      <th className="py-2 px-2 text-end">Plan Unit Rate (₹)</th>
                      <th className="py-2 px-2 text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {(() => {
                      const ratesList = Array.isArray(summary.pricingPlan.rates) && summary.pricingPlan.rates.length > 0
                        ? summary.pricingPlan.rates
                        : Object.values(summary.effectiveRates || {}).filter(r => r.isCustom);

                      const displayList = ratesList.length > 0
                        ? ratesList
                        : Object.values(summary.effectiveRates || {});

                      const filtered = displayList.filter((r) => {
                        const channelMatch = planModalFilter === "ALL" || (r.channel || "").toUpperCase() === planModalFilter.toUpperCase();
                        const searchLower = planModalSearch.trim().toLowerCase();
                        const searchMatch = !searchLower ||
                          (r.creditKey || "").toLowerCase().includes(searchLower) ||
                          (r.code || "").toLowerCase().includes(searchLower) ||
                          (r.category || "").toLowerCase().includes(searchLower) ||
                          (r.channel || "").toLowerCase().includes(searchLower);
                        return channelMatch && searchMatch;
                      });

                      if (!filtered.length) {
                        return (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">
                              No route rates found matching current filter
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((r, idx) => {
                        const meta = CHANNEL_META[r.creditKey] || { label: r.category || r.creditKey, icon: "•", color: "#333" };
                        const cost = Number(r.costPerUnit) || 1;
                        return (
                          <tr key={r.creditKey || idx}>
                            <td className="py-2 px-3">
                              <span className="fw-semibold me-1" style={{ color: meta.color }}>
                                {meta.icon} {r.channel}
                              </span>
                              <span className="text-muted">— {meta.label || r.category}</span>
                            </td>
                            <td className="py-2 px-2 font-monospace text-secondary">
                              <code>{r.code || r.creditKey}</code>
                            </td>
                            <td className="py-2 px-2 text-end fw-bold text-success">
                              ₹{cost.toFixed(4)}
                            </td>
                            <td className="py-2 px-2 text-end">
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25">
                                Active Rate
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="py-2 px-3 bg-light border-top">
          <Button color="secondary" size="sm" onClick={() => setShowPlanModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MyCreditWallet;
