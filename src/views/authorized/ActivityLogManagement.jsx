import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Badge,
  Input,
  InputGroup,
  Pagination,
  PaginationItem,
  PaginationLink,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  FormGroup,
  Label,
  Spinner
} from 'reactstrap';
import {
  FaTrashAlt,
  FaSearch,
  FaSyncAlt,
  FaEye,
  FaListAlt,
  FaFilter,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';
import apiClient from "@apiService";
import Swal from 'sweetalert2';
import { useLanguage } from '../../contexts/LanguageContext';
import { PageLoader } from "@/components";

const ActivityLogManagement = () => {
  const { isHindi } = useLanguage();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);

  // Fetch logs with pagination, search, limit
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/activity-logs/list', {
        params: { page: currentPage, limit, search: searchTerm }
      });
      const dataPayload = res?.data ?? res;
      const logList = Array.isArray(dataPayload?.data)
        ? dataPayload.data
        : Array.isArray(dataPayload)
        ? dataPayload
        : [];
      const total = dataPayload?.total ?? res?.total ?? logList.length;
      const pages = dataPayload?.pages ?? res?.pages ?? Math.max(1, Math.ceil(total / limit));

      setLogs(logList);
      setTotalLogs(total);
      if (currentPage > pages && pages > 0) {
        setCurrentPage(pages);
      }
    } catch (error) {
      console.error("fetchLogs error:", error);
      if (error?.response?.status !== 401) {
        Swal.fire({
          icon: "error",
          title: isHindi ? "त्रुटि" : "Error",
          text: error?.response?.data?.message || (isHindi ? "लॉग लोड करने में विफल" : "Failed to load logs")
        });
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, isHindi]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle search submit
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
  };

  // Reset search
  const handleReset = () => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1);
  };

  // View single log details
  const handleViewLog = async (logId) => {
    try {
      setViewLoading(true);
      const res = await apiClient.get(`/activity-logs/detail/${logId}`);
      const logData = res?.data?.data || res?.data || res;
      if (logData) {
        setSelectedLog(logData);
        setViewModal(true);
      } else {
        throw new Error("Log not found");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: error?.response?.data?.message || (isHindi ? "लॉग विवरण लोड करने में विफल" : "Failed to load log details")
      });
    } finally {
      setViewLoading(false);
    }
  };

  // Delete single log
  const handleDeleteSingle = async (logId, logMethod, logUrl) => {
    const confirmText = isHindi
      ? `क्या आप यह लॉग हटाना चाहते हैं? (${logMethod} ${logUrl})`
      : `Are you sure you want to delete this log? (${logMethod} ${logUrl})`;
    const result = await Swal.fire({
      title: isHindi ? "पुष्टि करें" : "Confirm Delete",
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: isHindi ? "हटाएँ" : "Delete",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await apiClient.delete(`/activity-logs/delete/${logId}`);
      Swal.fire({
        icon: "success",
        title: res?.data?.message || res?.message || (isHindi ? "लॉग हटा दिया गया" : "Log deleted"),
        timer: 1500,
        showConfirmButton: false
      });
      fetchLogs();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "हटाने में त्रुटि" : "Delete Failed",
        text: error?.response?.data?.message || (isHindi ? "लॉग हटाने में विफल" : "Unable to delete log")
      });
    }
  };

  // Delete all logs
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: isHindi ? "सभी लॉग हटाएँ?" : "Delete All Logs?",
      text: isHindi
        ? "क्या आप वाकई सभी एक्टिविटी लॉग को स्थायी रूप से हटाना चाहते हैं? यह क्रिया उलटी नहीं जा सकती।"
        : "Are you sure you want to permanently delete ALL activity logs? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: isHindi ? "हाँ, सभी हटाएँ" : "Yes, delete all",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
    });
    if (!result.isConfirmed) return;

    try {
      const res = await apiClient.delete('/activity-logs/delete-all');
      Swal.fire({
        icon: "success",
        title: res?.data?.message || res?.message || (isHindi ? "सभी लॉग हटा दिए गए" : "All logs deleted"),
        timer: 1500,
        showConfirmButton: false
      });
      setCurrentPage(1);
      fetchLogs();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: error?.response?.data?.message || (isHindi ? "सभी लॉग हटाने में विफल" : "Failed to delete all logs")
      });
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString(isHindi ? 'hi-IN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get method badge color
  const getMethodBadgeColor = (method) => {
    switch (method?.toUpperCase()) {
      case 'GET': return 'success';
      case 'POST': return 'primary';
      case 'PUT': return 'warning';
      case 'DELETE': return 'danger';
      default: return 'secondary';
    }
  };

  // Pagination helpers
  const totalPages = Math.max(1, Math.ceil(totalLogs / limit));
  const canPrevious = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render pagination items
  const renderPagination = () => {
    let items = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i} active={i === currentPage}>
          <PaginationLink onClick={() => goToPage(i)}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <>
      <Card className="adm-card border-0 shadow-sm overflow-hidden mb-4">
        {/* ── UNIFIED COMMAND HEADER ── */}
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-3 px-md-4">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs flex-shrink-0"
              style={{ width: "38px", height: "38px", background: "rgba(255, 255, 255, 0.15)", fontSize: "1.1rem" }}
            >
              <FaListAlt />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                <span>{isHindi ? 'गतिविधि लॉग प्रबंधन' : 'Activity Log Management'}</span>
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small">
                <span>
                  {isHindi
                    ? 'सभी API अनुरोधों, उपयोगकर्ता क्रियाओं और सिस्टम गतिविधियों को देखें और प्रबंधित करें'
                    : 'View and manage all API requests, user actions, and system activities'}
                </span>
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button
              color="danger"
              size="sm"
              className="fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
              onClick={handleDeleteAll}
              disabled={loading || totalLogs === 0}
            >
              <FaTrashAlt size={11} />
              <span>{isHindi ? 'सभी हटाएँ' : 'Delete All'}</span>
            </Button>
            <Button
              color="light"
              size="sm"
              className="text-primary fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
              onClick={fetchLogs}
              disabled={loading}
            >
              <FaSyncAlt size={11} className={loading ? "fa-spin" : ""} />
              <span>{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
            </Button>
          </div>
        </CardHeader>

        {/* ── Search & Filter Bar ── */}
        <div className="bg-light border-bottom py-2.5 px-3 px-md-4">
          <Row className="g-2 align-items-center">
            <Col md={5} lg={4}>
              <InputGroup size="sm">
                <Input
                  placeholder={isHindi ? "विधि, URL, IP खोजें..." : "Search method, URL, IP..."}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="shadow-none bg-white"
                />
                <Button color="primary" onClick={handleSearch} className="px-3">
                  <FaSearch size={11} />
                </Button>
                {searchTerm && (
                  <Button color="secondary" outline onClick={handleReset} title={isHindi ? 'साफ करें' : 'Clear'}>
                    <FaTimes size={11} />
                  </Button>
                )}
              </InputGroup>
            </Col>

            <Col md={3} lg={2}>
              <Input
                type="select"
                bsSize="sm"
                value={limit}
                onChange={handleLimitChange}
                className="shadow-none bg-white"
              >
                <option value={10}>10 {isHindi ? 'पंक्तियाँ' : 'Rows'}</option>
                <option value={20}>20 {isHindi ? 'पंक्तियाँ' : 'Rows'}</option>
                <option value={50}>50 {isHindi ? 'पंक्तियाँ' : 'Rows'}</option>
                <option value={100}>100 {isHindi ? 'पंक्तियाँ' : 'Rows'}</option>
              </Input>
            </Col>

            <Col md={4} lg={6} className="text-md-end">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                {isHindi ? 'कुल लॉग:' : 'Total Logs:'} <strong>{totalLogs.toLocaleString()}</strong>
              </span>
            </Col>
          </Row>
        </div>

        <CardBody className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner color="primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5">
              <div
                className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-xs"
                style={{ width: "54px", height: "54px", background: "#f1f5f9", color: "#64748b", fontSize: "1.5rem" }}
              >
                <FaListAlt />
              </div>
              <p className="text-muted fw-semibold mb-0 small">
                {isHindi ? 'कोई गतिविधि लॉग नहीं मिला' : 'No activity logs found'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold" style={{ width: 55 }}>#</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold text-center" style={{ width: 90 }}>{isHindi ? 'विधि' : 'Method'}</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold">{isHindi ? 'URL' : 'URL'}</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold" style={{ width: 140 }}>{isHindi ? 'IP पता' : 'IP Address'}</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold" style={{ width: 180 }}>{isHindi ? 'उपयोगकर्ता' : 'User'}</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold" style={{ width: 170 }}>{isHindi ? 'समय' : 'Timestamp'}</th>
                    <th className="py-2.5 px-3 text-secondary small fw-semibold text-center" style={{ width: 90 }}>{isHindi ? 'कार्य' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const serial = (currentPage - 1) * limit + idx + 1;
                    const userDisplay = log.user
                      ? `${log.user.name || ''} ${log.user.email ? `(${log.user.email})` : ''}`.trim()
                      : (isHindi ? 'अनाम / सिस्टम' : 'Anonymous / System');
                    return (
                      <tr key={log._id || idx}>
                        <td className="px-3 text-muted small">{serial}</td>
                        <td className="px-3 text-center">
                          <Badge color={getMethodBadgeColor(log.method)} pill className="px-2 py-0.5">
                            {log.method || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-3 font-monospace small text-break" style={{ maxWidth: 300 }}>
                          <code className="text-dark">{log.url || '-'}</code>
                        </td>
                        <td className="px-3 small text-muted font-monospace">{log.ip || '-'}</td>
                        <td className="px-3 small text-dark fw-medium text-truncate" style={{ maxWidth: 180 }} title={userDisplay}>
                          {userDisplay}
                        </td>
                        <td className="px-3 small text-muted text-nowrap">{formatDate(log.createdAt)}</td>
                        <td className="px-3 text-center text-nowrap">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm"
                              color="light"
                              className="border text-primary px-2 py-1"
                              onClick={() => handleViewLog(log._id)}
                              title={isHindi ? "विवरण देखें" : "View Details"}
                            >
                              <FaEye size={11} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="border text-danger px-2 py-1"
                              onClick={() => handleDeleteSingle(log._id, log.method, log.url)}
                              title={isHindi ? "हटाएं" : "Delete"}
                            >
                              <FaTrashAlt size={10} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <small className="text-muted">
                {isHindi ? 'पृष्ठ' : 'Page'} <strong>{currentPage}</strong> {isHindi ? 'का' : 'of'} <strong>{totalPages}</strong>
              </small>
              <Pagination size="sm" className="mb-0">
                <PaginationItem disabled={!canPrevious}>
                  <PaginationLink previous onClick={() => goToPage(currentPage - 1)} />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem disabled={!canNext}>
                  <PaginationLink next onClick={() => goToPage(currentPage + 1)} />
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Log Detail Modal ── */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setViewModal(false)} className="adm-card-header text-white">
          <div className="d-flex align-items-center gap-2 text-white">
            <FaInfoCircle />
            <span>{isHindi ? 'लॉग विवरण' : 'Activity Log Details'}</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          {viewLoading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : selectedLog ? (
            <div>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'विधि' : 'Method'}:</Col>
                <Col md={9}>
                  <Badge color={getMethodBadgeColor(selectedLog.method)} pill>
                    {selectedLog.method}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">URL:</Col>
                <Col md={9} className="font-monospace text-break"><code>{selectedLog.url}</code></Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'IP पता' : 'IP Address'}:</Col>
                <Col md={9} className="font-monospace">{selectedLog.ip || '-'}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'उपयोगकर्ता' : 'User'}:</Col>
                <Col md={9}>
                  {selectedLog.user
                    ? `${selectedLog.user.name || ''} (${selectedLog.user.email || ''})`
                    : (isHindi ? 'अनाम / सिस्टम' : 'Anonymous / System')}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'यूज़र एजेंट' : 'User Agent'}:</Col>
                <Col md={9} className="small text-muted text-break">{selectedLog.userAgent || '-'}</Col>
              </Row>
              <Row className="mb-2">
                <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'समय' : 'Timestamp'}:</Col>
                <Col md={9}>{formatDate(selectedLog.createdAt)}</Col>
              </Row>
              {selectedLog.requestBody && (
                <Row className="mb-2">
                  <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'अनुरोध बॉडी' : 'Request Body'}:</Col>
                  <Col md={9}>
                    <pre className="bg-light p-2.5 rounded border" style={{ fontSize: '11px', maxHeight: '180px', overflow: 'auto' }}>
                      {typeof selectedLog.requestBody === 'object'
                        ? JSON.stringify(selectedLog.requestBody, null, 2)
                        : selectedLog.requestBody || '-'}
                    </pre>
                  </Col>
                </Row>
              )}
              {selectedLog.responseStatus && (
                <Row className="mb-2">
                  <Col md={3} className="fw-bold text-secondary small">{isHindi ? 'प्रतिक्रिया स्थिति' : 'Response Status'}:</Col>
                  <Col md={9}>
                    <Badge color={selectedLog.responseStatus < 400 ? 'success' : 'danger'}>
                      {selectedLog.responseStatus}
                    </Badge>
                  </Col>
                </Row>
              )}
            </div>
          ) : (
            <p className="text-muted text-center mb-0">{isHindi ? 'कोई डेटा नहीं' : 'No data available'}</p>
          )}
        </ModalBody>
        <ModalFooter className="bg-light py-2">
          <Button color="secondary" size="sm" onClick={() => setViewModal(false)}>
            {isHindi ? 'बंद करें' : 'Close'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ActivityLogManagement;