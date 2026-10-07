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
  FaIdBadge, FaPaperPlane
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

const PAYMENT_MODES = ["upi", "neft", "imps", "bank_transfer", "card", "cash", "other"];

const emptyRequestForm = {
  amount: "",
  paymentMode: "upi",
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

const MyCreditWallet = () => {
  const { toasts, toast } = useToast();

  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyMeta, setHistoryMeta] = useState({ totalRecords: 0, page: 1, limit: 25, totalPages: 1 });
  const [myRequests, setMyRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [creditTypeFilter, setCreditTypeFilter] = useState("ALL");

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
      const params = new URLSearchParams({ page: String(page), limit: "25" });
      if (creditTypeFilter && creditTypeFilter !== "ALL") params.set("creditType", creditTypeFilter);
      if (search.trim()) params.set("search", search.trim());

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
  }, [creditTypeFilter, search]);

  const loadMyRequests = useCallback(async () => {
    try {
      const res = await apiClient.get("/credits/my-requests");
      const list = unwrapData(res) || [];
      setMyRequests(Array.isArray(list) ? list : []);
    } catch {
      setMyRequests([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes] = await Promise.all([
        loadSummary(),
        loadHistory(1),
        loadMyRequests(),
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

  // Debounced search on history
  useEffect(() => {
    const t = setTimeout(() => {
      loadHistory(1);
    }, 300);
    return () => clearTimeout(t);
  }, [creditTypeFilter, search, loadHistory]);

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
        amount: Number(form.amount) || creditSum,
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
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1 bg-white bg-opacity-10 text-white border-0 shadow-sm"
              onClick={refreshAll}
              disabled={loading}
            >
              <FaSyncAlt size={11} className={loading ? "fa-spin" : ""} /> Refresh
            </Button>
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              onClick={() => setRequestModal(true)}
            >
              <FaPlus size={12} /> Request Credit Topup
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

      {/* ── Channel Balance Cards ── */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="small fw-semibold text-uppercase text-muted">
            Available Wallet Balances
          </span>
          <span className="badge bg-dark">
            Total Combined Credits: {totalCurrentBalance.toLocaleString()}
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
                active={tab === "overview"}
                onClick={() => setTab("overview")}
                role="button"
                className="fw-semibold"
              >
                <FaWallet className="me-1 text-primary" /> Wallet Overview &amp; Limits
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={tab === "history"}
                onClick={() => setTab("history")}
                role="button"
                className="fw-semibold"
              >
                <FaHistory className="me-1 text-success" /> Transaction History &amp; Deductions ({historyMeta.totalRecords})
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                active={tab === "requests"}
                onClick={() => setTab("requests")}
                role="button"
                className="fw-semibold"
              >
                <FaHourglassHalf className="me-1 text-warning" /> My Topup Requests ({myRequests.length})
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>

        <CardBody className="p-3">
          {/* ──── TAB 1: OVERVIEW ──── */}
          {tab === "overview" && (
            <Row className="g-3">
              <Col lg={7}>
                <div className="border rounded p-3 h-100 bg-white shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold fs-6 text-dark">Channel Balance Breakdown</span>
                    <Badge color="primary" pill>Active Account</Badge>
                  </div>
                  <Table hover size="sm" className="align-middle mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Channel</th>
                        <th>Scope</th>
                        <th className="text-end">Available Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CREDIT_KEYS.map((key) => {
                        const meta = CHANNEL_META[key];
                        const val = balances[key] ?? 0;
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
                    <div className="fw-bold fs-6 mb-3 text-dark">Aggregated Wallet Movements</div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Total Topup Credits Added</span>
                      <strong className="text-success">
                        {summary?.totals?.topup?.amount ? `₹${summary.totals.topup.amount.toLocaleString()}` : "₹0"}
                        <span className="text-muted small ms-1">
                          ({summary?.totals?.topup?.count || 0} times)
                        </span>
                      </strong>
                    </div>
                    <div className="d-flex justify-content-between border-bottom py-2">
                      <span className="text-muted">Total System Deductions</span>
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
                    <strong>Need more credits?</strong> Click <em>"Request Credit Topup"</em> to submit payment details for admin approval.
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* ──── TAB 2: HISTORY & DEDUCTIONS ──── */}
          {tab === "history" && (
            <>
              <Row className="g-2 mb-3">
                <Col md={5}>
                  <InputGroup size="sm">
                    <Input
                      placeholder="Search payment reference or remarks…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <Button color="light" onClick={() => setSearch("")}>
                        ✕
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Input
                    type="select"
                    size="sm"
                    value={creditTypeFilter}
                    onChange={(e) => setCreditTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All Transaction Types</option>
                    <option value="topup">Topups (Credits Added)</option>
                    <option value="deduct">Deductions (Debited)</option>
                    <option value="refund">Refunds</option>
                    <option value="usage">Campaign Usages</option>
                  </Input>
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-end gap-2">
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => loadHistory(historyMeta.page - 1)}
                    disabled={historyMeta.page <= 1}
                  >
                    Prev
                  </Button>
                  <span className="small text-muted text-nowrap">
                    Page {historyMeta.page} / {historyMeta.totalPages || 1} ({historyMeta.totalRecords} total)
                  </span>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => loadHistory(historyMeta.page + 1)}
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
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-muted py-4">
                          No transactions or deductions found in your wallet history.
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
            </>
          )}

          {/* ──── TAB 3: MY TOPUP REQUESTS ──── */}
          {tab === "requests" && (
            <div className="table-responsive">
              <Table hover bordered size="sm" className="align-middle small">
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
                  {myRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        You have not submitted any credit topup requests yet.
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

            <Label className="fw-semibold small text-uppercase text-secondary mb-1.5">
              Channel Credits Needed
            </Label>
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

              {/* 8th slot in 4x2 grid: Live Summary Card */}
              <Col xs={6} sm={6} md={3}>
                <div className="border border-primary border-opacity-25 rounded-3 p-2 bg-primary bg-opacity-10 h-100 d-flex flex-column justify-content-center align-items-center text-center">
                  <span className="small text-primary fw-bold text-uppercase">
                    Total Requested
                  </span>
                  <span className="fs-5 fw-bold text-primary my-0 lh-1">
                    {creditSum.toLocaleString()}
                  </span>
                  <span className="text-muted small">units across channels</span>
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
                    placeholder="e.g. 5000"
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
                    placeholder="UTR / Txn ID"
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
                    placeholder="Optional message"
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
    </div>
  );
};

export default MyCreditWallet;
