// components/SessionManager.jsx

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Table,
  Spinner,
  Badge,
  Button,
  Input,
  InputGroup,
  InputGroupText,
  Card,
  CardBody,
  CardHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  UncontrolledTooltip,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  ButtonGroup,
  Progress,
} from "reactstrap";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const SessionManager = () => {
  // ─── State ──────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Search & Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [logoutReasonFilter, setLogoutReasonFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeAllModalOpen, setRevokeAllModalOpen] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeReason, setRevokeReason] = useState("USER_LOGOUT");
  const [revokeMessage, setRevokeMessage] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    loggedOut: 0,
  });

  // ─── Debounce Search ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Format Helpers ─────────────────────────────────────
  const formatDateTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const getRelativeTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return `${months}mo ago`;
  };

  const getExpiryProgress = (createdAt, expiresAt) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(expiresAt);
    const total = end - start;
    const elapsed = now - start;
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    return progress;
  };

  const truncate = (str, len = 20) => {
    if (!str) return "—";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMsg("Copied to clipboard!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // ─── Session Status Logic ──────────────────────────────
  const getSessionStatus = (session) => {
    if (session.logoutAt) return "LOGGED_OUT";
    if (!session.isActive) return "INACTIVE";
    if (new Date(session.expiresAt) < new Date()) return "EXPIRED";
    return "ACTIVE";
  };

  const getStatusBadge = (session) => {
    const status = getSessionStatus(session);
    const config = {
      ACTIVE: { color: "success", icon: "🟢", label: "Active" },
      EXPIRED: { color: "warning", icon: "🟡", label: "Expired" },
      LOGGED_OUT: { color: "danger", icon: "🔴", label: "Logged Out" },
      INACTIVE: { color: "secondary", icon: "⚪", label: "Inactive" },
    };
    const c = config[status] || config.INACTIVE;
    return (
      <Badge
        color={c.color}
        pill
        className="px-3 py-2"
        style={{ fontSize: "12px", letterSpacing: "0.3px" }}
      >
        {c.icon} {c.label}
      </Badge>
    );
  };

  const getLogoutReasonBadge = (reason) => {
    if (!reason) return <span className="text-muted">—</span>;
    const config = {
      USER_LOGOUT: { color: "info", label: "User Logout", icon: "🚪" },
      SESSION_EXPIRED: { color: "warning", label: "Session Expired", icon: "⏰" },
      NEW_LOGIN: { color: "primary", label: "New Login", icon: "🔄" },
    };
    const c = config[reason] || { color: "secondary", label: reason, icon: "❓" };
    return (
      <Badge color={c.color} pill className="px-2 py-1" style={{ fontSize: "11px" }}>
        {c.icon} {c.label}
      </Badge>
    );
  };

  // ─── Parse UserAgent ───────────────────────────────────
  const parseBrowser = (ua) => {
    if (!ua) return "Unknown";
    if (ua.includes("Edg")) return "🔵 Edge";
    if (ua.includes("OPR") || ua.includes("Opera")) return "🔴 Opera";
    if (ua.includes("Chrome")) return "🌐 Chrome";
    if (ua.includes("Firefox")) return "🦊 Firefox";
    if (ua.includes("Safari")) return "🧭 Safari";
    return "🌍 Other";
  };

  const parseOS = (ua) => {
    if (!ua) return "Unknown";
    if (ua.includes("Windows")) return "🪟 Windows";
    if (ua.includes("Mac")) return "🍎 macOS";
    if (ua.includes("Android")) return "🤖 Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "📱 iOS";
    if (ua.includes("Linux")) return "🐧 Linux";
    return "💻 Other";
  };

  // ─── API Error Handler ─────────────────────────────────
  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (err.message) return err.message;
    return "Something went wrong. Please try again.";
  };

  // ─── Fetch Sessions ────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: currentPage,
        limit: perPage,
        sortBy,
        sortOrder,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (logoutReasonFilter !== "ALL") params.logoutReason = logoutReasonFilter;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

     const res = await axios.get(`${API}/api/sessions`, {
  params,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      if (res.data?.success) {
        setSessions(res.data.data.sessions || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalSessions(res.data.data.total || 0);
        setStats(
          res.data.data.stats || {
            total: 0,
            active: 0,
            expired: 0,
            loggedOut: 0,
          }
        );
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    perPage,
    debouncedSearch,
    statusFilter,
    logoutReasonFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // ─── Revoke Single Session ─────────────────────────────
  const handleRevokeSession = async () => {
    if (!selectedSession) return;

    try {
      setRevoking(true);
      setError("");

      const res = await axios.patch(
        `${API}/api/sessions/${selectedSession._id}/revoke`,
        {
          reason: revokeReason,
          message: revokeMessage || undefined,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );
         

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "Session revoked successfully!");
        setRevokeModalOpen(false);
        setDetailModalOpen(false);
        setSelectedSession(null);
        setRevokeReason("USER_LOGOUT");
        setRevokeMessage("");
        fetchSessions();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRevoking(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // ─── Revoke All Sessions ───────────────────────────────
  const handleRevokeAll = async () => {
    try {
      setRevoking(true);
      setError("");

      const res = await axios.patch(`${API}/api/sessions/revoke-all`, {
        reason: revokeReason,
        message: revokeMessage || "All sessions revoked by admin",
      },
    {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
  

      if (res.data?.success) {
        setSuccessMsg(res.data.message || "All sessions revoked successfully!");
        setRevokeAllModalOpen(false);
        setRevokeReason("USER_LOGOUT");
        setRevokeMessage("");
        fetchSessions();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRevoking(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // ─── Sort Handler ──────────────────────────────────────
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "⬆️" : "⬇️";
  };

  // ─── Reset Filters ────────────────────────────────────
  const resetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setLogoutReasonFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // ─── Pagination Range ─────────────────────────────────
  const getPaginationRange = () => {
    const range = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  };

  const hasActiveFilters =
    search ||
    statusFilter !== "ALL" ||
    logoutReasonFilter !== "ALL" ||
    dateFrom ||
    dateTo;

  // ─── Shared gradient style ─────────────────────────────
  const headerGradient = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  // ─── Render ────────────────────────────────────────────
  return (
    <div className="p-2 p-md-3">

      {/* ══════════ Header ══════════ */}
      <Card
        className="mb-4 border-0 shadow-lg overflow-hidden"
        style={headerGradient}
      >
        <CardBody className="py-4">
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="text-white mb-1 fw-bold">🔐 Session Management</h3>
              <p className="text-white-50 mb-0 small">
                Monitor and manage all user sessions in real-time
              </p>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <Button
                color="light"
                outline
                className="me-2 text-white border-white border-opacity-50"
                onClick={fetchSessions}
                disabled={loading}
                style={{ minWidth: "110px" }}
              >
                {loading ? <Spinner size="sm" className="me-1" /> : "🔄 "}
                Refresh
              </Button>
              <Button
                color="danger"
                className="shadow-sm fw-semibold"
                onClick={() => setRevokeAllModalOpen(true)}
              >
                ⛔ Revoke All Active
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* ══════════ Alerts ══════════ */}
      {successMsg && (
        <Alert
          color="success"
          className="shadow-sm border-0 d-flex align-items-center rounded-3"
          toggle={() => setSuccessMsg("")}
          fade
        >
          <span className="me-2 fs-5">✅</span>
          <div>
            <strong>Success!</strong> {successMsg}
          </div>
        </Alert>
      )}
      {error && (
        <Alert
          color="danger"
          className="shadow-sm border-0 d-flex align-items-center rounded-3"
          toggle={() => setError("")}
          fade
        >
          <span className="me-2 fs-5">❌</span>
          <div>
            <strong>Error!</strong> {error}
          </div>
        </Alert>
      )}

      {/* ══════════ Stats Cards ══════════ */}
      <Row className="mb-4 g-3">
        {[
          {
            icon: "📊",
            label: "TOTAL SESSIONS",
            value: stats.total,
            color: "#6366f1",
            bg: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
            border: "#6366f1",
          },
          {
            icon: "🟢",
            label: "ACTIVE",
            value: stats.active,
            color: "#22c55e",
            bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
            border: "#22c55e",
          },
          {
            icon: "🟡",
            label: "EXPIRED",
            value: stats.expired,
            color: "#f59e0b",
            bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
            border: "#f59e0b",
          },
          {
            icon: "🔴",
            label: "LOGGED OUT",
            value: stats.loggedOut,
            color: "#ef4444",
            bg: "linear-gradient(135deg, #fef2f2, #fee2e2)",
            border: "#ef4444",
          },
        ].map((stat, i) => (
          <Col xs={6} md={3} key={i}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderLeft: `4px solid ${stat.border} !important`,
                borderLeftColor: stat.border,
                borderLeftWidth: "4px",
                borderLeftStyle: "solid",
                background: stat.bg,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <CardBody className="text-center py-3">
                <div style={{ fontSize: "2rem", lineHeight: 1.2 }} className="mb-1">
                  {stat.icon}
                </div>
                <h2
                  className="fw-bold mb-0"
                  style={{ color: stat.color, fontSize: "2rem", lineHeight: 1.1 }}
                >
                  {loading ? (
                    <Spinner size="sm" style={{ color: stat.color }} />
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </h2>
                <small
                  className="fw-semibold text-uppercase d-block mt-1"
                  style={{ color: stat.color, letterSpacing: "1px", fontSize: "10px" }}
                >
                  {stat.label}
                </small>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ══════════ Filters Card ══════════ */}
      <Card className="mb-4 border-0 shadow-sm rounded-3">
        <CardHeader className="bg-white border-bottom py-3 rounded-top-3">
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0 fw-bold">
                🔍 Search &amp; Filters
                {hasActiveFilters && (
                  <Badge color="primary" pill className="ms-2 align-middle" style={{ fontSize: "11px" }}>
                    Active
                  </Badge>
                )}
              </h5>
            </Col>
            <Col xs="auto">
              {hasActiveFilters && (
                <Button
                  color="danger"
                  outline
                  size="sm"
                  onClick={resetFilters}
                  className="fw-semibold"
                >
                  ✖ Clear All
                </Button>
              )}
            </Col>
          </Row>
        </CardHeader>
        <CardBody className="py-3">
          <Row className="g-3">
            {/* Search */}
            <Col md={4}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                🔎 Search
              </label>
              <InputGroup>
                <InputGroupText
                  style={{
                    ...headerGradient,
                    color: "#fff",
                    border: "1px solid #667eea",
                  }}
                >
                  🔍
                </InputGroupText>
                <Input
                  type="text"
                  placeholder="IP, token, user agent, message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ borderColor: "#667eea" }}
                />
                {search && (
                  <Button
                    color="outline-secondary"
                    size="sm"
                    onClick={() => setSearch("")}
                    style={{ borderColor: "#ced4da" }}
                  >
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Status Filter */}
            <Col md={2}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                📌 Status
              </label>
              <Input
                type="select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderColor: "#22c55e" }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">🟢 Active</option>
                <option value="EXPIRED">🟡 Expired</option>
                <option value="LOGGED_OUT">🔴 Logged Out</option>
                <option value="INACTIVE">⚪ Inactive</option>
              </Input>
            </Col>

            {/* Logout Reason */}
            <Col md={2}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                📝 Logout Reason
              </label>
              <Input
                type="select"
                value={logoutReasonFilter}
                onChange={(e) => {
                  setLogoutReasonFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderColor: "#0dcaf0" }}
              >
                <option value="ALL">All Reasons</option>
                <option value="USER_LOGOUT">🚪 User Logout</option>
                <option value="SESSION_EXPIRED">⏰ Session Expired</option>
                <option value="NEW_LOGIN">🔄 New Login</option>
              </Input>
            </Col>

            {/* Date From */}
            <Col md={2}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                📅 From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderColor: "#f59e0b" }}
              />
            </Col>

            {/* Date To */}
            <Col md={2}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                📅 To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderColor: "#f59e0b" }}
              />
            </Col>
          </Row>

          {/* Quick Filters Row */}
          <Row className="mt-3 g-3 align-items-end">
            <Col md={2}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                📄 Per Page
              </label>
              <Input
                type="select"
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[5, 10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} rows
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={6}>
              <label className="form-label fw-semibold text-muted small text-uppercase mb-1">
                ⚡ Quick Filters
              </label>
              <div>
                <ButtonGroup size="sm">
                  {[
                    { val: "ALL", label: "All", color: "primary" },
                    { val: "ACTIVE", label: "🟢 Active", color: "success" },
                    { val: "EXPIRED", label: "🟡 Expired", color: "warning" },
                    { val: "LOGGED_OUT", label: "🔴 Logged Out", color: "danger" },
                    { val: "INACTIVE", label: "⚪ Inactive", color: "secondary" },
                  ].map((btn) => (
                    <Button
                      key={btn.val}
                      color={
                        statusFilter === btn.val
                          ? btn.color
                          : `outline-${btn.color}`
                      }
                      onClick={() => {
                        setStatusFilter(btn.val);
                        setCurrentPage(1);
                      }}
                    >
                      {btn.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <small className="text-muted">
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    Loading...
                  </>
                ) : (
                  <>
                    Found{" "}
                    <strong className="text-dark">{totalSessions.toLocaleString()}</strong>{" "}
                    session(s)
                  </>
                )}
              </small>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* ══════════ Loading ══════════ */}
      {loading && (
        <Card className="border-0 shadow-sm text-center py-5 mb-4">
          <CardBody className="py-5">
            <Spinner
              color="primary"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted fw-semibold mb-0">Loading sessions...</p>
          </CardBody>
        </Card>
      )}

      {/* ══════════ Empty State ══════════ */}
      {!loading && sessions.length === 0 && (
        <Card className="border-0 shadow-sm text-center py-5 rounded-3">
          <CardBody className="py-5">
            <div style={{ fontSize: "4rem", lineHeight: 1 }}>📭</div>
            <h4 className="text-muted mt-3 fw-semibold">No Sessions Found</h4>
            <p className="text-muted mb-4">
              {hasActiveFilters
                ? "Try adjusting your search or filter criteria"
                : "No sessions have been created yet"}
            </p>
            {hasActiveFilters && (
              <Button color="primary" onClick={resetFilters} className="px-4">
                🔄 Reset All Filters
              </Button>
            )}
          </CardBody>
        </Card>
      )}

      {/* ══════════ Sessions Table ══════════ */}
      {!loading && sessions.length > 0 && (
        <Card className="border-0 shadow-sm overflow-hidden rounded-3">
          <CardHeader className="bg-white py-3 border-bottom">
            <Row className="align-items-center">
              <Col>
                <h5 className="mb-0 fw-bold">
                  📋 Sessions{" "}
                  <Badge color="primary" pill className="ms-1 align-middle" style={{ fontSize: "12px" }}>
                    {totalSessions.toLocaleString()}
                  </Badge>
                </h5>
              </Col>
              <Col xs="auto">
                <small className="text-muted">
                  Showing{" "}
                  <strong>{(currentPage - 1) * perPage + 1}</strong>–
                  <strong>{Math.min(currentPage * perPage, totalSessions)}</strong>{" "}
                  of <strong>{totalSessions}</strong>
                </small>
              </Col>
            </Row>
          </CardHeader>

          <div className="table-responsive">
            <Table bordered hover striped className="mb-0 align-middle">
              <thead style={headerGradient}>
                <tr>
                  <th className="text-dark text-center fw-semibold" style={{ width: "55px", fontSize: "13px" }}>
                    #
                  </th>
                  <th
                    className="text-dark fw-semibold"
                    style={{ cursor: "pointer", fontSize: "13px", userSelect: "none" }}
                    onClick={() => handleSort("user")}
                  >
                    👤 User {getSortIcon("user")}
                  </th>
                  <th className="text-dark fw-semibold" style={{ fontSize: "13px" }}>
                    🔑 Token
                  </th>
                  <th
                    className="text-dark text-center fw-semibold"
                    style={{ cursor: "pointer", fontSize: "13px", userSelect: "none" }}
                    onClick={() => handleSort("isActive")}
                  >
                    📌 Status {getSortIcon("isActive")}
                  </th>
                  <th className="text-dark fw-semibold" style={{ fontSize: "13px" }}>
                    🌐 IP
                  </th>
                  <th className="text-dark fw-semibold" style={{ fontSize: "13px" }}>
                    🖥️ Device
                  </th>
                  <th
                    className="text-dark fw-semibold"
                    style={{ cursor: "pointer", fontSize: "13px", userSelect: "none" }}
                    onClick={() => handleSort("createdAt")}
                  >
                    📅 Created {getSortIcon("createdAt")}
                  </th>
                  <th
                    className="text-dark fw-semibold"
                    style={{ cursor: "pointer", fontSize: "13px", userSelect: "none" }}
                    onClick={() => handleSort("expiresAt")}
                  >
                    ⏰ Expires {getSortIcon("expiresAt")}
                  </th>
                  <th className="text-dark fw-semibold" style={{ fontSize: "13px" }}>
                    🚪 Logout
                  </th>
                  <th
                    className="text-dark text-center fw-semibold"
                    style={{ width: "130px", fontSize: "13px" }}
                  >
                    ⚙️ Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {sessions.map((session, index) => {
                  const status = getSessionStatus(session);
                  const rowBgMap = {
                    ACTIVE: "rgba(34,197,94,0.04)",
                    EXPIRED: "rgba(245,158,11,0.04)",
                    LOGGED_OUT: "rgba(239,68,68,0.04)",
                    INACTIVE: "rgba(20, 95, 245, 0.04)",
                  };

                  return (
                    <tr
                      key={session._id}
                      style={{ backgroundColor: rowBgMap[status] || "transparent" }}
                    >
                      {/* # */}
                      <td className="text-center fw-bold text-muted" style={{ fontSize: "13px" }}>
                        {(currentPage - 1) * perPage + index + 1}
                      </td>

                      {/* User */}
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0 fw-bold text-dark"
                            style={{
                              width: "36px",
                              height: "36px",
                              ...headerGradient,
                              fontSize: "14px",
                            }}
                          >
                            {(
                              session.user?.name ||
                              session.user?.email ||
                              "U"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              className="fw-bold text-dark text-truncate"
                              style={{ maxWidth: "130px", fontSize: "13px" }}
                            >
                              {session.user?.name || "Unknown User"}
                            </div>
                            <small
                              className="text-muted text-truncate d-block"
                              style={{ maxWidth: "130px", fontSize: "11px" }}
                            >
                              {session.user?.email ||
                                truncate(
                                  session.user?._id || String(session.user),
                                  15
                                )}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Token */}
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <code
                            className="bg-light p-1 rounded text-dark"
                            style={{
                              fontSize: "10px",
                              maxWidth: "100px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "inline-block",
                              border: "1px solid #e9ecef",
                            }}
                            id={`tok-${session._id}`}
                          >
                            {session.token}
                          </code>
                          <UncontrolledTooltip
                            target={`tok-${session._id}`}
                            placement="top"
                          >
                            {session.token}
                          </UncontrolledTooltip>
                          <Button
                            color="outline-primary"
                            size="sm"
                            className="py-0 px-1 border-0"
                            style={{ fontSize: "12px", lineHeight: 1.5 }}
                            onClick={() => copyToClipboard(session.token)}
                            title="Copy token"
                          >
                            📋
                          </Button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="text-center">{getStatusBadge(session)}</td>

                      {/* IP */}
                      <td>
                        <Badge
                          color="dark"
                          pill
                          className="px-2 py-1"
                          style={{ fontSize: "11px" }}
                        >
                          {session.ipAddress || "N/A"}
                        </Badge>
                      </td>

                      {/* Device */}
                      <td>
                        <small className="d-block fw-semibold" style={{ fontSize: "12px" }}>
                          {parseBrowser(session.userAgent)}
                        </small>
                        <small className="text-muted" style={{ fontSize: "11px" }}>
                          {parseOS(session.userAgent)}
                        </small>
                      </td>

                      {/* Created */}
                      <td>
                        <small className="d-block fw-semibold" style={{ fontSize: "12px" }}>
                          {formatDateTime(session.createdAt)}
                        </small>
                        <Badge
                          color="light"
                          className="text-muted mt-1"
                          style={{ fontSize: "10px", border: "1px solid #e9ecef" }}
                        >
                          {getRelativeTime(session.createdAt)}
                        </Badge>
                      </td>

                      {/* Expires */}
                      <td>
                        <small className="d-block fw-semibold" style={{ fontSize: "12px" }}>
                          {formatDateTime(session.expiresAt)}
                        </small>
                        <Progress
                          value={getExpiryProgress(
                            session.createdAt,
                            session.expiresAt
                          )}
                          color={
                            getExpiryProgress(session.createdAt, session.expiresAt) >= 100
                              ? "danger"
                              : getExpiryProgress(session.createdAt, session.expiresAt) >= 75
                              ? "warning"
                              : "success"
                          }
                          className="mt-1"
                          style={{ height: "4px", borderRadius: "2px" }}
                        />
                      </td>

                      {/* Logout */}
                      <td>
                        {session.logoutAt ? (
                          <div>
                            {getLogoutReasonBadge(session.logoutReason)}
                            <small
                              className="d-block text-muted mt-1"
                              style={{ fontSize: "10px" }}
                            >
                              {formatDateTime(session.logoutAt)}
                            </small>
                            {session.logoutMessage && (
                              <small
                                className="d-block text-muted fst-italic"
                                style={{ fontSize: "10px" }}
                              >
                                &ldquo;{truncate(session.logoutMessage, 25)}&rdquo;
                              </small>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-center">
                        <Button
                          color="info"
                          size="sm"
                          className="me-1 px-2 py-1 text-white fw-semibold"
                          style={{ fontSize: "11px" }}
                          onClick={() => {
                            setSelectedSession(session);
                            setDetailModalOpen(true);
                          }}
                        >
                          👁️ View
                        </Button>
                        {status === "ACTIVE" && (
                          <Button
                            color="danger"
                            size="sm"
                            className="px-2 py-1 fw-semibold"
                            style={{ fontSize: "11px" }}
                            onClick={() => {
                              setSelectedSession(session);
                              setRevokeModalOpen(true);
                            }}
                            title="Revoke session"
                          >
                            ⛔
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* ══════════ Pagination ══════════ */}
          <CardBody className="border-top py-3" style={{ backgroundColor: "#f8f9fa" }}>
            <Row className="align-items-center">
              <Col md={5}>
                <small className="text-muted">
                  Page <strong className="text-dark">{currentPage}</strong> of{" "}
                  <strong className="text-dark">{totalPages}</strong>{" "}
                  &bull; Total:{" "}
                  <strong className="text-dark">{totalSessions.toLocaleString()}</strong> sessions
                </small>
              </Col>
              <Col md={7}>
                <Pagination
                  className="mb-0 justify-content-end"
                  listClassName="mb-0"
                  size="sm"
                >
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink first onClick={() => setCurrentPage(1)} />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                      previous
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>

                  {getPaginationRange()[0] > 1 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {getPaginationRange()[0] > 2 && (
                        <PaginationItem disabled>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {getPaginationRange().map((pg) => (
                    <PaginationItem key={pg} active={pg === currentPage}>
                      <PaginationLink onClick={() => setCurrentPage(pg)}>
                        {pg}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {getPaginationRange()[getPaginationRange().length - 1] < totalPages && (
                    <>
                      {getPaginationRange()[getPaginationRange().length - 1] <
                        totalPages - 1 && (
                        <PaginationItem disabled>
                          <PaginationLink>...</PaginationLink>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                      next
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink last onClick={() => setCurrentPage(totalPages)} />
                  </PaginationItem>
                </Pagination>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}

      {/* ══════════ Detail Modal ══════════ */}
      <Modal
        isOpen={detailModalOpen}
        toggle={() => setDetailModalOpen(false)}
        size="lg"
        centered
        scrollable
      >
        <ModalHeader
          toggle={() => setDetailModalOpen(false)}
          style={{ ...headerGradient, color: "#fff" }}
          close={
            <button
              className="btn-close btn-close-white"
              onClick={() => setDetailModalOpen(false)}
            />
          }
        >
          🔐 Session Details
        </ModalHeader>
        {selectedSession && (
          <ModalBody className="p-4">
            <Row className="g-3">
              {/* Session ID */}
              <Col md={12}>
                <Card className="border-0 rounded-3" style={{ backgroundColor: "#f8f9ff" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      Session ID
                    </small>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <code className="text-dark" style={{ fontSize: "12px", wordBreak: "break-all" }}>
                        {selectedSession._id}
                      </code>
                      <Button
                        color="outline-primary"
                        size="sm"
                        className="py-0 px-2 flex-shrink-0"
                        style={{ fontSize: "11px" }}
                        onClick={() => copyToClipboard(selectedSession._id)}
                      >
                        📋 Copy
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* User */}
              <Col md={6}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#f0f4ff" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      👤 User
                    </small>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
                        style={{ width: "40px", height: "40px", ...headerGradient }}
                      >
                        {(
                          selectedSession.user?.name ||
                          selectedSession.user?.email ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: "14px" }}>
                          {selectedSession.user?.name || "Unknown"}
                        </div>
                        <small className="text-muted" style={{ fontSize: "12px" }}>
                          {selectedSession.user?.email || "—"}
                        </small>
                        {selectedSession.user?.role && (
                          <Badge
                            color="primary"
                            pill
                            className="ms-1"
                            style={{ fontSize: "10px" }}
                          >
                            {selectedSession.user.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* Status */}
              <Col md={6}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#f0fff4" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      📌 Status
                    </small>
                    <div className="mt-2">
                      {getStatusBadge(selectedSession)}
                    </div>
                    <div className="mt-2">
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        Expiry Progress:
                      </small>
                      <Progress
                        value={getExpiryProgress(
                          selectedSession.createdAt,
                          selectedSession.expiresAt
                        )}
                        color={
                          getExpiryProgress(
                            selectedSession.createdAt,
                            selectedSession.expiresAt
                          ) >= 100
                            ? "danger"
                            : "success"
                        }
                        className="mt-1"
                        style={{ height: "6px", borderRadius: "3px" }}
                      />
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* Token */}
              <Col md={12}>
                <Card className="border-0 rounded-3" style={{ backgroundColor: "#fff8f0" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      🔑 Token
                    </small>
                    <div
                      className="bg-white p-2 rounded mt-1 border"
                      style={{
                        wordBreak: "break-all",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        maxHeight: "80px",
                        overflowY: "auto",
                        borderColor: "#dee2e6",
                      }}
                    >
                      {selectedSession.token}
                    </div>
                    <Button
                      color="outline-primary"
                      size="sm"
                      className="mt-1"
                      style={{ fontSize: "11px" }}
                      onClick={() => copyToClipboard(selectedSession.token)}
                    >
                      📋 Copy Token
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              {/* IP Address */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#f8f0ff" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      🌐 IP Address
                    </small>
                    <div className="mt-1">
                      <Badge color="dark" pill className="px-3 py-2" style={{ fontSize: "12px" }}>
                        {selectedSession.ipAddress || "N/A"}
                      </Badge>
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* Browser */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#f0f8ff" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      🖥️ Browser
                    </small>
                    <div className="fw-bold mt-1" style={{ fontSize: "15px" }}>
                      {parseBrowser(selectedSession.userAgent)}
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* OS */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#fff0f0" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      💻 Operating System
                    </small>
                    <div className="fw-bold mt-1" style={{ fontSize: "15px" }}>
                      {parseOS(selectedSession.userAgent)}
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* Full User Agent */}
              <Col md={12}>
                <Card className="border-0 rounded-3" style={{ backgroundColor: "#f5f5f5" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      📝 Full User Agent
                    </small>
                    <div
                      className="bg-white p-2 rounded mt-1 border text-muted"
                      style={{
                        fontSize: "11px",
                        wordBreak: "break-all",
                        maxHeight: "60px",
                        overflowY: "auto",
                        borderColor: "#dee2e6",
                      }}
                    >
                      {selectedSession.userAgent || "N/A"}
                    </div>
                  </CardBody>
                </Card>
              </Col>

              {/* Created At */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#eef6ff" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      📅 Created At
                    </small>
                    <div className="fw-semibold mt-1" style={{ fontSize: "13px" }}>
                      {formatDateTime(selectedSession.createdAt)}
                    </div>
                    <Badge
                      color="light"
                      className="text-muted mt-1"
                      style={{ fontSize: "10px", border: "1px solid #dee2e6" }}
                    >
                      {getRelativeTime(selectedSession.createdAt)}
                    </Badge>
                  </CardBody>
                </Card>
              </Col>

              {/* Expires At */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#fff9ee" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      ⏰ Expires At
                    </small>
                    <div className="fw-semibold mt-1" style={{ fontSize: "13px" }}>
                      {formatDateTime(selectedSession.expiresAt)}
                    </div>
                    {new Date(selectedSession.expiresAt) < new Date() ? (
                      <Badge color="danger" pill className="mt-1" style={{ fontSize: "10px" }}>
                        ⚠️ Expired
                      </Badge>
                    ) : (
                      <Badge color="success" pill className="mt-1" style={{ fontSize: "10px" }}>
                        ✅ Still Valid
                      </Badge>
                    )}
                  </CardBody>
                </Card>
              </Col>

              {/* Updated At */}
              <Col md={4}>
                <Card className="border-0 h-100 rounded-3" style={{ backgroundColor: "#f0fff8" }}>
                  <CardBody className="py-2 px-3">
                    <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                      🔄 Last Updated
                    </small>
                    <div className="fw-semibold mt-1" style={{ fontSize: "13px" }}>
                      {formatDateTime(selectedSession.updatedAt)}
                    </div>
                    <Badge
                      color="light"
                      className="text-muted mt-1"
                      style={{ fontSize: "10px", border: "1px solid #dee2e6" }}
                    >
                      {getRelativeTime(selectedSession.updatedAt)}
                    </Badge>
                  </CardBody>
                </Card>
              </Col>

              {/* Logout Details (if exists) */}
              {selectedSession.logoutAt && (
                <Col md={12}>
                  <Card
                    className="border-0 rounded-3"
                    style={{
                      backgroundColor: "#fef2f2",
                      borderLeft: "4px solid #ef4444",
                      borderLeftColor: "#ef4444",
                      borderLeftWidth: "4px",
                      borderLeftStyle: "solid",
                    }}
                  >
                    <CardBody className="py-3 px-3">
                      <h6 className="fw-bold text-danger mb-3" style={{ fontSize: "14px" }}>
                        🚪 Logout Details
                      </h6>
                      <Row className="g-2">
                        <Col md={4}>
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "11px" }}>
                            Reason
                          </small>
                          <div className="mt-1">
                            {getLogoutReasonBadge(selectedSession.logoutReason)}
                          </div>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "11px" }}>
                            Logged Out At
                          </small>
                          <div className="fw-semibold mt-1" style={{ fontSize: "13px" }}>
                            {formatDateTime(selectedSession.logoutAt)}
                          </div>
                          <Badge
                            color="light"
                            className="text-muted"
                            style={{ fontSize: "10px", border: "1px solid #dee2e6" }}
                          >
                            {getRelativeTime(selectedSession.logoutAt)}
                          </Badge>
                        </Col>
                        <Col md={4}>
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "11px" }}>
                            Message
                          </small>
                          <div className="fst-italic mt-1" style={{ fontSize: "13px" }}>
                            {selectedSession.logoutMessage ? (
                              <span>&ldquo;{selectedSession.logoutMessage}&rdquo;</span>
                            ) : (
                              <span className="text-muted">No message</span>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              )}

              {/* Session Timeline */}
              <Col md={12}>
                <Card className="border-0 rounded-3" style={{ backgroundColor: "#fafafa" }}>
                  <CardBody className="py-3 px-3">
                    <h6 className="fw-bold mb-3" style={{ fontSize: "14px" }}>
                      📊 Session Timeline
                    </h6>
                    <div className="position-relative ps-4">
                      {/* Created */}
                      <div className="mb-3 position-relative">
                        <div
                          className="position-absolute rounded-circle"
                          style={{
                            left: "-24px",
                            top: "3px",
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#22c55e",
                            border: "2px solid #fff",
                            boxShadow: "0 0 0 2px #22c55e",
                          }}
                        />
                        <div
                          className="position-absolute"
                          style={{
                            left: "-19px",
                            top: "17px",
                            width: "2px",
                            height: "calc(100% + 8px)",
                            backgroundColor: "#e5e7eb",
                          }}
                        />
                        <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "10px" }}>
                          Session Created
                        </small>
                        <div className="fw-semibold" style={{ fontSize: "13px" }}>
                          {formatDateTime(selectedSession.createdAt)}
                        </div>
                      </div>

                      {/* Last Updated */}
                      {selectedSession.updatedAt !== selectedSession.createdAt && (
                        <div className="mb-3 position-relative">
                          <div
                            className="position-absolute rounded-circle"
                            style={{
                              left: "-24px",
                              top: "3px",
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#6366f1",
                              border: "2px solid #fff",
                              boxShadow: "0 0 0 2px #6366f1",
                            }}
                          />
                          <div
                            className="position-absolute"
                            style={{
                              left: "-19px",
                              top: "17px",
                              width: "2px",
                              height: "calc(100% + 8px)",
                              backgroundColor: "#e5e7eb",
                            }}
                          />
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "10px" }}>
                            Last Updated
                          </small>
                          <div className="fw-semibold" style={{ fontSize: "13px" }}>
                            {formatDateTime(selectedSession.updatedAt)}
                          </div>
                        </div>
                      )}

                      {/* Logged Out */}
                      {selectedSession.logoutAt && (
                        <div className="mb-3 position-relative">
                          <div
                            className="position-absolute rounded-circle"
                            style={{
                              left: "-24px",
                              top: "3px",
                              width: "12px",
                              height: "12px",
                              backgroundColor: "#ef4444",
                              border: "2px solid #fff",
                              boxShadow: "0 0 0 2px #ef4444",
                            }}
                          />
                          <div
                            className="position-absolute"
                            style={{
                              left: "-19px",
                              top: "17px",
                              width: "2px",
                              height: "calc(100% + 8px)",
                              backgroundColor: "#e5e7eb",
                            }}
                          />
                          <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "10px" }}>
                            Logged Out
                          </small>
                          <div className="fw-semibold" style={{ fontSize: "13px" }}>
                            {formatDateTime(selectedSession.logoutAt)}
                          </div>
                          <div className="mt-1">
                            {getLogoutReasonBadge(selectedSession.logoutReason)}
                          </div>
                        </div>
                      )}

                      {/* Expires */}
                      <div className="position-relative">
                        <div
                          className="position-absolute rounded-circle"
                          style={{
                            left: "-24px",
                            top: "3px",
                            width: "12px",
                            height: "12px",
                            backgroundColor:
                              new Date(selectedSession.expiresAt) < new Date()
                                ? "#f59e0b"
                                : "#9ca3af",
                            border: "2px solid #fff",
                            boxShadow: `0 0 0 2px ${
                              new Date(selectedSession.expiresAt) < new Date()
                                ? "#f59e0b"
                                : "#9ca3af"
                            }`,
                          }}
                        />
                        <small className="text-muted fw-bold text-uppercase d-block" style={{ fontSize: "10px" }}>
                          {new Date(selectedSession.expiresAt) < new Date()
                            ? "Expired At"
                            : "Will Expire At"}
                        </small>
                        <div className="fw-semibold" style={{ fontSize: "13px" }}>
                          {formatDateTime(selectedSession.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </ModalBody>
        )}
        <ModalFooter className="bg-light border-top">
          <Button
            color="secondary"
            outline
            onClick={() => setDetailModalOpen(false)}
          >
            Close
          </Button>
          {selectedSession &&
            getSessionStatus(selectedSession) === "ACTIVE" && (
              <Button
                color="danger"
                className="fw-semibold"
                onClick={() => {
                  setDetailModalOpen(false);
                  setRevokeModalOpen(true);
                }}
              >
                ⛔ Revoke This Session
              </Button>
            )}
        </ModalFooter>
      </Modal>

      {/* ══════════ Revoke Single Session Modal ══════════ */}
      <Modal
        isOpen={revokeModalOpen}
        toggle={() => {
          setRevokeModalOpen(false);
          setRevokeReason("USER_LOGOUT");
          setRevokeMessage("");
        }}
        centered
      >
        <ModalHeader
          toggle={() => setRevokeModalOpen(false)}
          className="bg-danger text-white"
          close={
            <button
              className="btn-close btn-close-white"
              onClick={() => setRevokeModalOpen(false)}
            />
          }
        >
          ⛔ Revoke Session
        </ModalHeader>
        <ModalBody className="p-4">
          {selectedSession && (
            <>
              <Alert color="warning" className="border-0 rounded-3">
                <strong>⚠️ Warning!</strong> You are about to revoke this
                session. The user will be logged out immediately.
              </Alert>

              {/* Session Info Summary */}
              <Card className="border-0 rounded-3 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
                <CardBody className="py-2 px-3">
                  <Row>
                    <Col xs={6}>
                      <small className="text-muted fw-bold d-block" style={{ fontSize: "11px" }}>
                        User
                      </small>
                      <div className="fw-bold" style={{ fontSize: "14px" }}>
                        {selectedSession.user?.name || "Unknown"}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <small className="text-muted fw-bold d-block" style={{ fontSize: "11px" }}>
                        IP Address
                      </small>
                      <div className="fw-bold" style={{ fontSize: "14px" }}>
                        {selectedSession.ipAddress || "N/A"}
                      </div>
                    </Col>
                    <Col xs={6} className="mt-2">
                      <small className="text-muted fw-bold d-block" style={{ fontSize: "11px" }}>
                        Browser
                      </small>
                      <div style={{ fontSize: "13px" }}>
                        {parseBrowser(selectedSession.userAgent)}
                      </div>
                    </Col>
                    <Col xs={6} className="mt-2">
                      <small className="text-muted fw-bold d-block" style={{ fontSize: "11px" }}>
                        Created
                      </small>
                      <div style={{ fontSize: "12px" }}>
                        {formatDateTime(selectedSession.createdAt)}
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              {/* Revoke Reason */}
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
                  📝 Logout Reason <span className="text-danger">*</span>
                </label>
                <Input
                  type="select"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  style={{ borderColor: "#dc3545" }}
                >
                  <option value="USER_LOGOUT">🚪 User Logout</option>
                  <option value="SESSION_EXPIRED">⏰ Session Expired</option>
                  <option value="NEW_LOGIN">🔄 New Login</option>
                </Input>
              </div>

              {/* Revoke Message */}
              <div className="mb-1">
                <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
                  💬 Message{" "}
                  <span className="text-muted fw-normal">(Optional)</span>
                </label>
                <Input
                  type="textarea"
                  rows={3}
                  placeholder="Enter a reason message for this revocation..."
                  value={revokeMessage}
                  onChange={(e) => setRevokeMessage(e.target.value)}
                  style={{ resize: "none" }}
                />
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter className="border-top bg-light">
          <Button
            color="secondary"
            outline
            onClick={() => {
              setRevokeModalOpen(false);
              setRevokeReason("USER_LOGOUT");
              setRevokeMessage("");
            }}
            disabled={revoking}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            className="fw-semibold"
            onClick={handleRevokeSession}
            disabled={revoking}
            style={{ minWidth: "140px" }}
          >
            {revoking ? (
              <>
                <Spinner size="sm" className="me-1" /> Revoking...
              </>
            ) : (
              "⛔ Confirm Revoke"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ══════════ Revoke All Sessions Modal ══════════ */}
      <Modal
        isOpen={revokeAllModalOpen}
        toggle={() => {
          setRevokeAllModalOpen(false);
          setRevokeReason("USER_LOGOUT");
          setRevokeMessage("");
        }}
        centered
      >
        <ModalHeader
          toggle={() => setRevokeAllModalOpen(false)}
          className="bg-danger text-white"
          close={
            <button
              className="btn-close btn-close-white"
              onClick={() => setRevokeAllModalOpen(false)}
            />
          }
        >
          ⛔ Revoke ALL Active Sessions
        </ModalHeader>
        <ModalBody className="p-4">
          <Alert color="danger" className="border-0 rounded-3">
            <h5 className="alert-heading fw-bold" style={{ fontSize: "16px" }}>
              🚨 Critical Action!
            </h5>
            <p className="mb-0" style={{ fontSize: "14px" }}>
              This will revoke <strong>ALL active sessions</strong> across all
              users. Every logged-in user will be forced to log out immediately.
            </p>
          </Alert>

          <Card className="border-0 rounded-3 mb-3 text-center" style={{ backgroundColor: "#f8f9fa" }}>
            <CardBody className="py-3">
              <div style={{ fontSize: "2.5rem", lineHeight: 1 }} className="mb-2">
                ⚠️
              </div>
              <h4 className="text-danger fw-bold mb-1" style={{ fontSize: "2rem" }}>
                {stats.active.toLocaleString()}
              </h4>
              <small className="text-muted fw-bold text-uppercase" style={{ letterSpacing: "1px", fontSize: "11px" }}>
                Active Sessions Will Be Revoked
              </small>
            </CardBody>
          </Card>

          {/* Revoke Reason */}
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
              📝 Logout Reason <span className="text-danger">*</span>
            </label>
            <Input
              type="select"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              style={{ borderColor: "#dc3545" }}
            >
              <option value="USER_LOGOUT">🚪 User Logout</option>
              <option value="SESSION_EXPIRED">⏰ Session Expired</option>
              <option value="NEW_LOGIN">🔄 New Login</option>
            </Input>
          </div>

          {/* Revoke Message */}
          <div className="mb-1">
            <label className="form-label fw-semibold" style={{ fontSize: "14px" }}>
              💬 Message{" "}
              <span className="text-muted fw-normal">(Optional)</span>
            </label>
            <Input
              type="textarea"
              rows={3}
              placeholder="Enter a reason for revoking all sessions..."
              value={revokeMessage}
              onChange={(e) => setRevokeMessage(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>
        </ModalBody>
        <ModalFooter className="border-top bg-light">
          <Button
            color="secondary"
            outline
            onClick={() => {
              setRevokeAllModalOpen(false);
              setRevokeReason("USER_LOGOUT");
              setRevokeMessage("");
            }}
            disabled={revoking}
          >
            Cancel
          </Button>
          <Button
            color="danger"
            className="fw-semibold"
            onClick={handleRevokeAll}
            disabled={revoking}
            style={{ minWidth: "160px" }}
          >
            {revoking ? (
              <>
                <Spinner size="sm" className="me-1" /> Revoking All...
              </>
            ) : (
              "⛔ Confirm Revoke All"
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SessionManager;