import { useEffect, useState, useCallback } from "react";
import apiClient from "@apiService";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Alert,
  ButtonGroup,
  Progress,
} from "reactstrap";
import {
  FaShieldAlt,
  FaUsers,
  FaCheckCircle,
  FaClock,
  FaSignOutAlt,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaBan,
  FaCalendarAlt,
  FaTimes,
  FaDesktop,
  FaMobileAlt,
  FaGlobe,
  FaKey,
  FaUser,
  FaCopy,
  FaInfoCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaTrashAlt,
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import { PageLoader } from "@/components";

const SessionManager = () => {
  const { isHindi } = useLanguage();

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
    }, 400);
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
    if (!date) return "—";
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return isHindi ? "अभी" : "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} ${isHindi ? "मिनट पहले" : "min ago"}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ${isHindi ? "घंटे पहले" : "hr ago"}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ${isHindi ? "दिन पहले" : "d ago"}`;
    const months = Math.floor(days / 30);
    return `${months} ${isHindi ? "माह पहले" : "mo ago"}`;
  };

  const getExpiryProgress = (createdAt, expiresAt) => {
    const now = new Date();
    const start = new Date(createdAt);
    const end = new Date(expiresAt);
    const total = end - start;
    if (total <= 0) return 100;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const truncate = (str, len = 20) => {
    if (!str) return "—";
    return str.length > len ? str.substring(0, len) + "..." : str;
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {}
      document.body.removeChild(textArea);
    }
    setSuccessMsg(isHindi ? "क्लिपबोर्ड पर कॉपी किया गया!" : "Copied to clipboard!");
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
    switch (status) {
      case "ACTIVE":
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
            <FaCheckCircle size={10} /> {isHindi ? "सक्रिय" : "Active"}
          </span>
        );
      case "EXPIRED":
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
            <FaClock size={10} /> {isHindi ? "समाप्त" : "Expired"}
          </span>
        );
      case "LOGGED_OUT":
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 fw-semibold d-inline-flex align-items-center gap-1">
            <FaSignOutAlt size={10} /> {isHindi ? "लॉग आउट" : "Logged Out"}
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 fw-semibold">
            {isHindi ? "निष्क्रिय" : "Inactive"}
          </span>
        );
    }
  };

  const getLogoutReasonBadge = (reason) => {
    if (!reason) return <span className="text-muted">—</span>;
    const config = {
      USER_LOGOUT: { color: "info", label: isHindi ? "उपयोगकर्ता लॉगआउट" : "User Logout" },
      SESSION_EXPIRED: { color: "warning", label: isHindi ? "सत्र समाप्ति" : "Session Expired" },
      NEW_LOGIN: { color: "primary", label: isHindi ? "नया लॉगिन" : "New Login" },
    };
    const c = config[reason] || { color: "secondary", label: reason };
    return (
      <Badge color={c.color} pill className="px-2 py-0.5">
        {c.label}
      </Badge>
    );
  };

  // ─── Parse UserAgent ───────────────────────────────────
  const parseBrowser = (ua) => {
    if (!ua) return "Unknown";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("OPR") || ua.includes("Opera")) return "Opera";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    return "Browser";
  };

  const parseOS = (ua) => {
    if (!ua) return "Unknown";
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac")) return "macOS";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    if (ua.includes("Linux")) return "Linux";
    return "OS";
  };

  const getErrorMessage = (err) => {
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.data?.error) return err.response.data.error;
    if (err.message) return err.message;
    return isHindi ? "कुछ गड़बड़ हुई। कृपया पुनः प्रयास करें।" : "Something went wrong. Please try again.";
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

      const res = await apiClient.get("/sessions/list", { params });
      const isSuccess = res?.success ?? res?.data?.success ?? true;
      const payload = res?.data || res;

      if (isSuccess && payload) {
        setSessions(payload.sessions || []);
        setTotalPages(payload.totalPages || 1);
        setTotalSessions(payload.total || 0);
        setStats(
          payload.stats || {
            total: payload.total || 0,
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

      const res = await apiClient.patch(
        `/sessions/revoke/${selectedSession._id}`,
        {
          reason: revokeReason,
          message: revokeMessage || undefined,
        }
      );

      const isSuccess = res?.success ?? res?.data?.success ?? true;
      if (isSuccess) {
        setSuccessMsg(
          res?.message || res?.data?.message || (isHindi ? "सत्र सफलतापूर्वक रद्द किया गया!" : "Session revoked successfully!")
        );
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

      const res = await apiClient.patch("/sessions/revoke-all", {});
      const isSuccess = res?.success ?? res?.data?.success ?? true;

      if (isSuccess) {
        setSuccessMsg(
          res?.message || res?.data?.message || (isHindi ? "सभी सक्रिय सत्र रद्द कर दिए गए हैं!" : "All sessions revoked successfully!")
        );
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
    if (sortBy !== field) return <FaSort className="ms-1 text-muted opacity-50" size={11} />;
    return sortOrder === "asc" ? (
      <FaSortUp className="ms-1 text-primary" size={11} />
    ) : (
      <FaSortDown className="ms-1 text-primary" size={11} />
    );
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

  return (
    <>
      {/* ══════════ Alerts ══════════ */}
      {successMsg && (
        <Alert
          color="success"
          className="shadow-sm border-0 d-flex align-items-center rounded-3 mb-3"
          toggle={() => setSuccessMsg("")}
        >
          <FaCheckCircle className="me-2 text-success" size={16} />
          <div>{successMsg}</div>
        </Alert>
      )}

      {error && (
        <Alert
          color="danger"
          className="shadow-sm border-0 d-flex align-items-center rounded-3 mb-3"
          toggle={() => setError("")}
        >
          <FaInfoCircle className="me-2 text-danger" size={16} />
          <div>{error}</div>
        </Alert>
      )}

      {/* ══════════ KPI Metric Cards ══════════ */}
      <Row className="g-3 mb-4">
        {[
          {
            icon: FaUsers,
            label: isHindi ? "कुल सत्र" : "TOTAL SESSIONS",
            value: stats.total,
            color: "text-primary",
            bgClass: "bg-primary-subtle",
            borderClass: "border-primary",
          },
          {
            icon: FaCheckCircle,
            label: isHindi ? "सक्रिय सत्र" : "ACTIVE",
            value: stats.active,
            color: "text-success",
            bgClass: "bg-success-subtle",
            borderClass: "border-success",
          },
          {
            icon: FaClock,
            label: isHindi ? "समाप्त सत्र" : "EXPIRED",
            value: stats.expired,
            color: "text-warning",
            bgClass: "bg-warning-subtle",
            borderClass: "border-warning",
          },
          {
            icon: FaSignOutAlt,
            label: isHindi ? "लॉग आउट सत्र" : "LOGGED OUT",
            value: stats.loggedOut,
            color: "text-danger",
            bgClass: "bg-danger-subtle",
            borderClass: "border-danger",
          },
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <Col xs={12} sm={6} lg={3} key={idx}>
              <Card className={`border-0 shadow-sm h-100 border-start border-4 ${item.borderClass}`}>
                <CardBody className="p-3 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                      {item.label}
                    </div>
                    <div className={`fs-3 fw-bold mt-1 ${item.color}`}>
                      {loading ? <Spinner size="sm" /> : item.value.toLocaleString()}
                    </div>
                  </div>
                  <div className={`rounded-circle p-3 d-flex align-items-center justify-content-center ${item.bgClass}`}>
                    <IconComp size={20} className={item.color} />
                  </div>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ══════════ Master Table & Controls Card ══════════ */}
      <Card className="adm-card shadow-sm border-0 mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2 rounded-3 d-flex align-items-center justify-content-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.12)" }}
            >
              <FaShieldAlt className="text-white" size={20} />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white fw-bold d-flex align-items-center gap-2">
                <span>{isHindi ? "सत्र प्रबंधन" : "Session Manager"}</span>
                <Badge color="light" className="text-dark fs-xs px-2 py-1">
                  {totalSessions}
                </Badge>
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small">
                <span>
                  {isHindi
                    ? "सभी सक्रिय और ऐतिहासिक उपयोगकर्ता सत्रों की वास्तविक समय में निगरानी करें"
                    : "Monitor and manage all real-time and historical user authentication sessions"}
                </span>
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              color="light"
              size="sm"
              className="text-primary fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
              onClick={fetchSessions}
              disabled={loading}
            >
              <FaSyncAlt size={12} className={loading ? "fa-spin" : ""} />
              <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
            </Button>
            <Button
              color="danger"
              size="sm"
              className="fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
              onClick={() => setRevokeAllModalOpen(true)}
              disabled={loading || stats.active === 0}
            >
              <FaBan size={12} />
              <span>{isHindi ? "सभी सत्र रद्द करें" : "Revoke All Active"}</span>
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-3 p-md-4">
          {/* ── Search & Filter Controls Bar ────────────────────────────── */}
          <div className="border rounded-3 p-3 bg-light bg-opacity-50 mb-4">
            <Row className="g-3 align-items-end">
              <Col md={12} lg={4}>
                <label className="fw-semibold text-secondary small mb-1">
                  {isHindi ? "सत्र खोजें" : "Search Sessions"}
                </label>
                <InputGroup>
                  <InputGroupText className="bg-white border-end-0">
                    <FaSearch className="text-muted" size={13} />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder={isHindi ? "IP, टोकन, ब्राउज़र, संदेश..." : "IP, token, user agent, email..."}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="shadow-none border-start-0"
                  />
                  {search && (
                    <Button
                      color="light"
                      className="border border-start-0"
                      onClick={() => setSearch("")}
                    >
                      <FaTimes size={12} />
                    </Button>
                  )}
                </InputGroup>
              </Col>

              <Col sm={6} md={3} lg={2}>
                <label className="fw-semibold text-secondary small mb-1">
                  {isHindi ? "स्थिति" : "Status"}
                </label>
                <Input
                  type="select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="shadow-none bg-white"
                >
                  <option value="ALL">{isHindi ? "सभी स्थितियां" : "All Status"}</option>
                  <option value="ACTIVE">{isHindi ? "सक्रिय" : "Active"}</option>
                  <option value="EXPIRED">{isHindi ? "समाप्त" : "Expired"}</option>
                  <option value="LOGGED_OUT">{isHindi ? "लॉग आउट" : "Logged Out"}</option>
                  <option value="INACTIVE">{isHindi ? "निष्क्रिय" : "Inactive"}</option>
                </Input>
              </Col>

              <Col sm={6} md={3} lg={2}>
                <label className="fw-semibold text-secondary small mb-1">
                  {isHindi ? "लॉगआउट कारण" : "Logout Reason"}
                </label>
                <Input
                  type="select"
                  value={logoutReasonFilter}
                  onChange={(e) => {
                    setLogoutReasonFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="shadow-none bg-white"
                >
                  <option value="ALL">{isHindi ? "सभी कारण" : "All Reasons"}</option>
                  <option value="USER_LOGOUT">{isHindi ? "उपयोगकर्ता लॉगआउट" : "User Logout"}</option>
                  <option value="SESSION_EXPIRED">{isHindi ? "सत्र समाप्ति" : "Session Expired"}</option>
                  <option value="NEW_LOGIN">{isHindi ? "नया लॉगिन" : "New Login"}</option>
                </Input>
              </Col>

              <Col sm={6} md={3} lg={2}>
                <label className="fw-semibold text-secondary small mb-1">
                  {isHindi ? "दिनांक से" : "Date From"}
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="shadow-none bg-white"
                />
              </Col>

              <Col sm={6} md={3} lg={2}>
                <label className="fw-semibold text-secondary small mb-1">
                  {isHindi ? "दिनांक तक" : "Date To"}
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="shadow-none bg-white"
                />
              </Col>
            </Row>

            {hasActiveFilters && (
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-3 pt-2 border-top">
                <div className="d-flex align-items-center gap-1.5 small text-muted">
                  <FaFilter size={11} className="text-primary" />
                  <span>{isHindi ? "फ़िल्टर लागू हैं" : "Active Filters Applied"}</span>
                </div>
                <Button
                  color="link"
                  size="sm"
                  onClick={resetFilters}
                  className="text-danger p-0 text-decoration-none fw-semibold small d-inline-flex align-items-center gap-1"
                >
                  <FaTimes size={11} /> {isHindi ? "फ़िल्टर साफ़ करें" : "Clear All Filters"}
                </Button>
              </div>
            )}
          </div>

          {/* ── Table or Loader ────────────────────────────────────────── */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <div className="mt-2 text-muted small">{isHindi ? "सत्र लोड हो रहे हैं..." : "Loading sessions..."}</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-5 border rounded-3 bg-light bg-opacity-25">
              <FaShieldAlt className="text-muted opacity-25 mb-3" size={48} />
              <h5 className="fw-bold text-dark">{isHindi ? "कोई सत्र नहीं मिला" : "No Sessions Found"}</h5>
              <p className="text-muted small mb-0">
                {hasActiveFilters
                  ? isHindi
                    ? "फ़िल्टर समायोजित करने का प्रयास करें"
                    : "Try adjusting your search query or filter options."
                  : isHindi
                  ? "वर्तमान में कोई सत्र रिकॉर्ड उपलब्ध नहीं है।"
                  : "Currently no session records exist in the database."}
              </p>
            </div>
          ) : (
            <div className="table-responsive border rounded-3 overflow-hidden">
              <Table hover className="mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold text-secondary small py-2.5 px-3 text-center" style={{ width: "50px" }}>
                      #
                    </th>
                    <th className="fw-semibold text-secondary small py-2.5 px-3" style={{ width: "200px" }}>
                      {isHindi ? "उपयोगकर्ता" : "User"}
                    </th>
                    <th
                      className="fw-semibold text-secondary small py-2.5 px-3 text-center cursor-pointer user-select-none"
                      onClick={() => handleSort("isActive")}
                      style={{ width: "120px" }}
                    >
                      {isHindi ? "स्थिति" : "Status"} {getSortIcon("isActive")}
                    </th>
                    <th className="fw-semibold text-secondary small py-2.5 px-3" style={{ width: "140px" }}>
                      {isHindi ? "IP पता" : "IP Address"}
                    </th>
                    <th className="fw-semibold text-secondary small py-2.5 px-3">
                      {isHindi ? "डिवाइस / ब्राउज़र" : "Device & OS"}
                    </th>
                    <th
                      className="fw-semibold text-secondary small py-2.5 px-3 cursor-pointer user-select-none"
                      onClick={() => handleSort("createdAt")}
                      style={{ width: "150px" }}
                    >
                      {isHindi ? "बनाया गया" : "Created"} {getSortIcon("createdAt")}
                    </th>
                    <th
                      className="fw-semibold text-secondary small py-2.5 px-3 cursor-pointer user-select-none"
                      onClick={() => handleSort("expiresAt")}
                      style={{ width: "150px" }}
                    >
                      {isHindi ? "समाप्ति" : "Expires"} {getSortIcon("expiresAt")}
                    </th>
                    <th className="fw-semibold text-secondary small py-2.5 px-3 text-center" style={{ width: "110px" }}>
                      {isHindi ? "कार्रवाई" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session, index) => {
                    const status = getSessionStatus(session);
                    const isSessionActive = status === "ACTIVE";

                    return (
                      <tr key={session._id}>
                        {/* Index */}
                        <td className="text-center text-muted small fw-medium">
                          {(currentPage - 1) * perPage + index + 1}
                        </td>

                        {/* User */}
                        <td className="px-3 py-2">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: "32px", height: "32px", fontSize: "12px" }}
                            >
                              {(session.user?.name || session.user?.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div className="fw-semibold text-dark text-truncate small">
                                {session.user?.name || (isHindi ? "अज्ञात उपयोगकर्ता" : "Unknown User")}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>
                                {session.user?.email || truncate(session.user?._id || String(session.user), 15)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-2 text-center">
                          {getStatusBadge(session)}
                        </td>

                        {/* IP Address */}
                        <td className="px-3 py-2">
                          <code className="text-dark small bg-light px-1.5 py-0.5 rounded border">
                            {session.ipAddress || session.ip || "—"}
                          </code>
                        </td>

                        {/* Device / OS */}
                        <td className="px-3 py-2">
                          <div className="d-flex align-items-center gap-1.5 text-secondary small">
                            {session.userAgent?.toLowerCase().includes("mobile") ? (
                              <FaMobileAlt size={12} className="text-primary flex-shrink-0" />
                            ) : (
                              <FaDesktop size={12} className="text-primary flex-shrink-0" />
                            )}
                            <span className="fw-medium text-dark">{parseBrowser(session.userAgent)}</span>
                            <span className="text-muted">/</span>
                            <span>{parseOS(session.userAgent)}</span>
                          </div>
                        </td>

                        {/* Created */}
                        <td className="px-3 py-2 small text-secondary">
                          <div className="fw-medium text-dark">{formatDateTime(session.createdAt)}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            {getRelativeTime(session.createdAt)}
                          </div>
                        </td>

                        {/* Expires */}
                        <td className="px-3 py-2 small text-secondary">
                          <div className="fw-medium text-dark">{formatDateTime(session.expiresAt)}</div>
                          {isSessionActive && (
                            <Progress
                              value={getExpiryProgress(session.createdAt, session.expiresAt)}
                              style={{ height: "4px" }}
                              className="mt-1 rounded-pill"
                            />
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-3 py-2 text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm"
                              color="light"
                              className="border text-primary px-2 py-1"
                              onClick={() => {
                                setSelectedSession(session);
                                setDetailModalOpen(true);
                              }}
                              title={isHindi ? "विवरण देखें" : "View Details"}
                            >
                              <FaEye size={12} />
                            </Button>

                            {isSessionActive && (
                              <Button
                                size="sm"
                                color="light"
                                className="border text-danger px-2 py-1"
                                onClick={() => {
                                  setSelectedSession(session);
                                  setRevokeModalOpen(true);
                                }}
                                title={isHindi ? "सत्र रद्द करें" : "Revoke Session"}
                              >
                                <FaBan size={11} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* ── Pagination & Per Page Row ───────────────────────────────── */}
          {!loading && sessions.length > 0 && (
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mt-4 pt-3 border-top">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span>{isHindi ? "प्रति पृष्ठ पंक्तियाँ:" : "Rows per page:"}</span>
                <Input
                  type="select"
                  bsSize="sm"
                  style={{ width: "80px" }}
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="shadow-none bg-white"
                >
                  {[5, 10, 20, 50].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Input>
                <span className="ms-2">
                  {isHindi
                    ? `कुल ${totalSessions} में से ${(currentPage - 1) * perPage + 1} - ${Math.min(currentPage * perPage, totalSessions)}`
                    : `Showing ${(currentPage - 1) * perPage + 1} - ${Math.min(currentPage * perPage, totalSessions)} of ${totalSessions}`}
                </span>
              </div>

              {totalPages > 1 && (
                <Pagination size="sm" className="mb-0">
                  <PaginationItem disabled={currentPage <= 1}>
                    <PaginationLink
                      first
                      onClick={() => setCurrentPage(1)}
                      className="shadow-none"
                    />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage <= 1}>
                    <PaginationLink
                      previous
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="shadow-none"
                    />
                  </PaginationItem>

                  {getPaginationRange().map((page) => (
                    <PaginationItem key={page} active={currentPage === page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        className="shadow-none"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem disabled={currentPage >= totalPages}>
                    <PaginationLink
                      next
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="shadow-none"
                    />
                  </PaginationItem>
                  <PaginationItem disabled={currentPage >= totalPages}>
                    <PaginationLink
                      last
                      onClick={() => setCurrentPage(totalPages)}
                      className="shadow-none"
                    />
                  </PaginationItem>
                </Pagination>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ══════════ Detail Modal ══════════ */}
      <Modal
        isOpen={detailModalOpen}
        toggle={() => setDetailModalOpen(false)}
        size="lg"
        centered
      >
        <ModalHeader
          toggle={() => setDetailModalOpen(false)}
          className="bg-adm-dark text-white border-0"
        >
          <div className="d-flex align-items-center gap-2">
            <FaShieldAlt className="text-primary" />
            <span className="fw-bold">{isHindi ? "सत्र विवरण" : "Session Details"}</span>
          </div>
        </ModalHeader>
        {selectedSession && (
          <ModalBody className="p-4">
            <Row className="g-3">
              <Col xs={12}>
                <div className="p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <small className="text-secondary fw-semibold text-uppercase d-block" style={{ fontSize: "11px" }}>
                        {isHindi ? "सत्र ID" : "Session ID"}
                      </small>
                      <code className="text-dark small">{selectedSession._id}</code>
                    </div>
                    <div>{getStatusBadge(selectedSession)}</div>
                  </div>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 border rounded-3 h-100">
                  <small className="text-secondary fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                    {isHindi ? "उपयोगकर्ता" : "User Info"}
                  </small>
                  <div className="fw-bold text-dark">{selectedSession.user?.name || "Unknown"}</div>
                  <div className="text-muted small">{selectedSession.user?.email || "—"}</div>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 border rounded-3 h-100">
                  <small className="text-secondary fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                    {isHindi ? "IP एवं नेटवर्क" : "IP & Network"}
                  </small>
                  <div className="fw-bold text-dark">{selectedSession.ipAddress || selectedSession.ip || "—"}</div>
                  <div className="text-muted small">{parseBrowser(selectedSession.userAgent)} on {parseOS(selectedSession.userAgent)}</div>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 border rounded-3 h-100">
                  <small className="text-secondary fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                    {isHindi ? "निर्माण समय" : "Created At"}
                  </small>
                  <div className="fw-semibold text-dark">{formatDateTime(selectedSession.createdAt)}</div>
                  <div className="text-muted small">{getRelativeTime(selectedSession.createdAt)}</div>
                </div>
              </Col>

              <Col sm={6}>
                <div className="p-3 border rounded-3 h-100">
                  <small className="text-secondary fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                    {isHindi ? "समाप्ति समय" : "Expires At"}
                  </small>
                  <div className="fw-semibold text-dark">{formatDateTime(selectedSession.expiresAt)}</div>
                </div>
              </Col>

              {selectedSession.logoutAt && (
                <Col xs={12}>
                  <div className="p-3 border rounded-3 bg-danger bg-opacity-10 border-danger border-opacity-25">
                    <small className="text-danger fw-semibold text-uppercase d-block mb-1" style={{ fontSize: "11px" }}>
                      {isHindi ? "लॉगआउट विवरण" : "Logout Details"}
                    </small>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold text-dark">{formatDateTime(selectedSession.logoutAt)}</span>
                      {getLogoutReasonBadge(selectedSession.logoutReason)}
                    </div>
                  </div>
                </Col>
              )}

              {selectedSession.token && (
                <Col xs={12}>
                  <div className="p-3 border rounded-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <small className="text-secondary fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                        JWT Token
                      </small>
                      <Button
                        color="link"
                        size="sm"
                        className="p-0 text-primary text-decoration-none small d-inline-flex align-items-center gap-1"
                        onClick={() => copyToClipboard(selectedSession.token)}
                      >
                        <FaCopy size={11} /> {isHindi ? "कॉपी" : "Copy"}
                      </Button>
                    </div>
                    <code className="text-break small text-muted d-block" style={{ maxHeight: "80px", overflowY: "auto" }}>
                      {selectedSession.token}
                    </code>
                  </div>
                </Col>
              )}
            </Row>
          </ModalBody>
        )}
        <ModalFooter className="bg-light border-top">
          <Button color="secondary" size="sm" onClick={() => setDetailModalOpen(false)}>
            {isHindi ? "बंद करें" : "Close"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ══════════ Revoke Single Modal ══════════ */}
      <Modal
        isOpen={revokeModalOpen}
        toggle={() => setRevokeModalOpen(false)}
        centered
      >
        <ModalHeader
          toggle={() => setRevokeModalOpen(false)}
          className="bg-danger text-white border-0"
        >
          <div className="d-flex align-items-center gap-2">
            <FaBan />
            <span className="fw-bold">{isHindi ? "सत्र रद्द करें" : "Revoke Session"}</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <p className="text-secondary mb-3">
            {isHindi
              ? "क्या आप निश्चित रूप से इस उपयोगकर्ता सत्र को अमान्य करना चाहते हैं? उपयोगकर्ता तुरंत लॉग आउट हो जाएगा।"
              : "Are you sure you want to revoke this session? The user will be immediately logged out on their device."}
          </p>
          <div className="mb-3">
            <label className="fw-semibold text-secondary small mb-1">
              {isHindi ? "रद्द करने का कारण" : "Revocation Reason"}
            </label>
            <Input
              type="select"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="shadow-none bg-white"
            >
              <option value="USER_LOGOUT">{isHindi ? "उपयोगकर्ता लॉगआउट" : "User Logout"}</option>
              <option value="SESSION_EXPIRED">{isHindi ? "सत्र समाप्ति" : "Session Expired"}</option>
              <option value="NEW_LOGIN">{isHindi ? "नया लॉगिन" : "New Login"}</option>
            </Input>
          </div>
          <div>
            <label className="fw-semibold text-secondary small mb-1">
              {isHindi ? "अतिरिक्त संदेश (वैकल्पिक)" : "Reason Message (Optional)"}
            </label>
            <Input
              type="textarea"
              rows={2}
              value={revokeMessage}
              onChange={(e) => setRevokeMessage(e.target.value)}
              placeholder={isHindi ? "उदा. व्यवस्थापक द्वारा सुरक्षा कारणों से रद्द किया गया" : "e.g. Session terminated by Admin"}
              className="shadow-none"
            />
          </div>
        </ModalBody>
        <ModalFooter className="bg-light border-top">
          <Button color="secondary" size="sm" onClick={() => setRevokeModalOpen(false)} disabled={revoking}>
            {isHindi ? "रद्द करें" : "Cancel"}
          </Button>
          <Button color="danger" size="sm" onClick={handleRevokeSession} disabled={revoking} className="fw-bold">
            {revoking ? <Spinner size="sm" /> : <FaBan className="me-1" />}
            {isHindi ? "सत्र रद्द करें" : "Revoke Session"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ══════════ Revoke All Modal ══════════ */}
      <Modal
        isOpen={revokeAllModalOpen}
        toggle={() => setRevokeAllModalOpen(false)}
        centered
      >
        <ModalHeader
          toggle={() => setRevokeAllModalOpen(false)}
          className="bg-danger text-white border-0"
        >
          <div className="d-flex align-items-center gap-2">
            <FaBan />
            <span className="fw-bold">{isHindi ? "सभी सक्रिय सत्र रद्द करें" : "Revoke All Active Sessions"}</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <Alert color="warning" className="border-0 small mb-3">
            <FaInfoCircle className="me-1.5" />
            {isHindi
              ? "यह कार्रवाई सभी उपयोगकर्ताओं के सभी सक्रिय टोकन को अमान्य कर देगी।"
              : "This action will invalidate all active sessions across all users in the system."}
          </Alert>
          <p className="text-secondary small mb-0">
            {isHindi
              ? "क्या आप निश्चित रूप से जारी रखना चाहते हैं?"
              : "Are you completely sure you want to proceed with terminating all active sessions?"}
          </p>
        </ModalBody>
        <ModalFooter className="bg-light border-top">
          <Button color="secondary" size="sm" onClick={() => setRevokeAllModalOpen(false)} disabled={revoking}>
            {isHindi ? "रद्द करें" : "Cancel"}
          </Button>
          <Button color="danger" size="sm" onClick={handleRevokeAll} disabled={revoking} className="fw-bold">
            {revoking ? <Spinner size="sm" /> : <FaBan className="me-1" />}
            {isHindi ? "सभी सत्र रद्द करें" : "Revoke All Sessions"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default SessionManager;