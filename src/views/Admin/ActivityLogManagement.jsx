import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, CardBody, Button, Table, Modal, ModalHeader, ModalBody, ModalFooter,
  FormGroup, Label, Input, Row, Col, Container, Badge, Spinner,
  InputGroup, Pagination, PaginationItem, PaginationLink
} from 'reactstrap';
import { FaTrash, FaEye, FaSyncAlt, FaTrashAlt, FaSearch, FaInfoCircle } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import axios from "axios";
import Swal from "sweetalert2";

const ActivityLogManagement = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { isHindi } = useLanguage();

  // State variables
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewModal, setViewModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Helper: Get auth headers (adjust token key as per your project)
  const getAuthHeaders = () => {
   const token = sessionStorage.getItem("authToken");
    return {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Fetch logs with pagination, search, limit
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/get-all-activity-logs`, {
        params: {
          page: currentPage,
          limit: limit,
          search: searchTerm
        },
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setLogs(response.data.data);
        setTotalLogs(response.data.total);
        // Adjust currentPage if out of bounds (optional)
        if (currentPage > response.data.pages && response.data.pages > 0) {
          setCurrentPage(response.data.pages);
        }
      } else {
        throw new Error("Failed to fetch logs");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: error?.response?.data?.message || (isHindi ? "लॉग लोड करने में विफल" : "Failed to load logs")
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, API_URL, isHindi]);

  // Refetch when dependencies change
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

  // View single log details (using separate API call for full details if needed)
  const handleViewLog = async (logId) => {
    try {
      setViewLoading(true);
      const response = await axios.get(`${API_URL}/api/get-single-activity-log/${logId}`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setSelectedLog(response.data.data);
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
      const response = await axios.delete(`${API_URL}/api/delete-activity-log/${logId}`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: response.data.message,
          timer: 2000,
          showConfirmButton: false
        });
        fetchLogs(); // Refresh list
      } else {
        throw new Error("Delete failed");
      }
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
      const response = await axios.delete(`${API_URL}/api/delete-all-activity-logs`, {
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: response.data.message,
          timer: 2000,
          showConfirmButton: false
        });
        // Reset to page 1 and refetch
        setCurrentPage(1);
        fetchLogs();
      } else {
        throw new Error("Delete all failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: error?.response?.data?.message || (isHindi ? "सभी लॉग हटाने में विफल" : "Failed to delete all logs")
      });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString(isHindi ? "hi-IN" : "en-US", {
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
  const totalPages = Math.ceil(totalLogs / limit);
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
    <Container className="py-3">
      <Card className="border-0 shadow-sm">
        <CardBody className="p-4">
          {/* Header Section */}
          <Row className="align-items-center mb-3">
            <Col>
              <h5 className="fw-bold mb-1">
                <FaInfoCircle className="me-2 text-primary" />
                {isHindi ? 'गतिविधि लॉग प्रबंधन' : 'Activity Log Management'}
              </h5>
              <p className="text-muted small mb-0">
                {isHindi
                  ? 'सभी API अनुरोधों, उपयोगकर्ता क्रियाओं और सिस्टम गतिविधियों को देखें और प्रबंधित करें'
                  : 'View and manage all API requests, user actions, and system activities'}
              </p>
            </Col>
            <Col xs="auto" className="d-flex gap-2">
              <Button color="danger" outline size="sm" onClick={handleDeleteAll}>
                <FaTrashAlt className="me-1" /> {isHindi ? 'सभी हटाएँ' : 'Delete All'}
              </Button>
              <Button color="secondary" outline size="sm" onClick={fetchLogs}>
                <FaSyncAlt className="me-1" /> {isHindi ? 'रिफ्रेश' : 'Refresh'}
              </Button>
            </Col>
          </Row>

          <hr className="mb-3" />

          {/* Search and Filter Row */}
          <Row className="mb-4 g-2 align-items-end">
            <Col md={5}>
              <FormGroup className="mb-0">
                <Label className="small fw-bold mb-1">
                  {isHindi ? 'खोजें (विधि, URL, IP)' : 'Search (Method, URL, IP)'}
                </Label>
                <InputGroup size="sm">
                  <Input
                    placeholder={isHindi ? "GET, /api/users, 192.168..." : "GET, /api/users, 192.168..."}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button color="primary" onClick={handleSearch}>
                    <FaSearch />
                  </Button>
                  {searchTerm && (
                    <Button color="secondary" onClick={handleReset}>
                      {isHindi ? 'साफ करें' : 'Clear'}
                    </Button>
                  )}
                </InputGroup>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup className="mb-0">
                <Label className="small fw-bold mb-1">{isHindi ? 'प्रति पृष्ठ पंक्तियाँ' : 'Rows per page'}</Label>
                <Input type="select" name="limit" value={limit} onChange={handleLimitChange} bsSize="sm">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="text-muted small mt-2">
                {isHindi ? 'कुल लॉग:' : 'Total logs:'} <strong>{totalLogs}</strong>
              </div>
            </Col>
          </Row>

          {/* Logs Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="mt-2 text-muted">{isHindi ? 'लोड हो रहा है...' : 'Loading logs...'}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5 bg-light rounded">
              <p className="text-muted mb-0">
                {isHindi ? 'कोई गतिविधि लॉग नहीं मिला' : 'No activity logs found'}
              </p>
            </div>
          ) : (
            <Table responsive bordered hover size="sm" className="mb-0 align-middle">
              <thead className="table-primary">
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th style={{ width: 80 }}>{isHindi ? 'विधि' : 'Method'}</th>
                  <th>{isHindi ? 'URL' : 'URL'}</th>
                  <th style={{ width: 140 }}>{isHindi ? 'IP पता' : 'IP Address'}</th>
                  <th style={{ width: 160 }}>{isHindi ? 'उपयोगकर्ता' : 'User'}</th>
                  <th style={{ width: 170 }}>{isHindi ? 'समय' : 'Timestamp'}</th>
                  <th style={{ width: 100 }}>{isHindi ? 'कार्य' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const serial = (currentPage - 1) * limit + idx + 1;
                  const userDisplay = log.user
                    ? `${log.user.name || ''} ${log.user.email ? `(${log.user.email})` : ''} ${log.user.mobile ? `- ${log.user.mobile}` : ''}`.trim()
                    : (isHindi ? 'अनाम/प्रणाली' : 'Anonymous/System');
                  return (
                    <tr key={log._id}>
                      <td className="text-center fw-bold">{serial}</td>
                      <td className="text-center">
                        <Badge color={getMethodBadgeColor(log.method)} pill>
                          {log.method || 'N/A'}
                        </Badge>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '300px' }} title={log.url}>
                        {log.url || '-'}
                      </td>
                      <td>{log.ip || '-'}</td>
                      <td className="small">{userDisplay}</td>
                      <td className="small">{formatDate(log.createdAt)}</td>
                      <td className="text-center text-nowrap">
                        <Button
                          color="info"
                          size="sm"
                          className="me-1 px-2 py-1"
                          title={isHindi ? 'विवरण देखें' : 'View Details'}
                          onClick={() => handleViewLog(log._id)}
                          disabled={viewLoading}
                        >
                          <FaEye size={11} />
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          className="px-2 py-1"
                          title={isHindi ? 'हटाएँ' : 'Delete'}
                          onClick={() => handleDeleteSingle(log._id, log.method, log.url)}
                        >
                          <FaTrash size={11} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                {isHindi
                  ? `पृष्ठ ${currentPage} of ${totalPages} (कुल ${totalLogs} लॉग)`
                  : `Page ${currentPage} of ${totalPages} (${totalLogs} total logs)`}
              </div>
              <Pagination size="sm" aria-label="Logs pagination">
                <PaginationItem disabled={!canPrevious}>
                  <PaginationLink first onClick={() => goToPage(1)} />
                </PaginationItem>
                <PaginationItem disabled={!canPrevious}>
                  <PaginationLink previous onClick={() => goToPage(currentPage - 1)} />
                </PaginationItem>
                {renderPagination()}
                <PaginationItem disabled={!canNext}>
                  <PaginationLink next onClick={() => goToPage(currentPage + 1)} />
                </PaginationItem>
                <PaginationItem disabled={!canNext}>
                  <PaginationLink last onClick={() => goToPage(totalPages)} />
                </PaginationItem>
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>

      {/* View Log Details Modal */}
      <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="lg" scrollable>
        <ModalHeader toggle={() => setViewModal(false)} className="bg-light">
          <FaEye className="me-2 text-info" />
          {isHindi ? 'लॉग विवरण' : 'Log Details'}
        </ModalHeader>
        <ModalBody>
          {viewLoading ? (
            <div className="text-center py-4"><Spinner color="info" /></div>
          ) : selectedLog ? (
            <div>
              <Row className="mb-3">
                <Col md={3} className="fw-bold">{isHindi ? 'विधि' : 'Method'}:</Col>
                <Col md={9}><Badge color={getMethodBadgeColor(selectedLog.method)} pill>{selectedLog.method}</Badge></Col>
              </Row>
              <Row className="mb-3">
                <Col md={3} className="fw-bold">URL:</Col>
                <Col md={9}><code>{selectedLog.url}</code></Col>
              </Row>
              <Row className="mb-3">
                <Col md={3} className="fw-bold">{isHindi ? 'IP पता' : 'IP Address'}:</Col>
                <Col md={9}>{selectedLog.ip || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col md={3} className="fw-bold">{isHindi ? 'उपयोगकर्ता' : 'User'}:</Col>
                <Col md={9}>
                  {selectedLog.user ? (
                    <div>
                      <div><strong>{isHindi ? 'नाम' : 'Name'}:</strong> {selectedLog.user.name || '-'}</div>
                      <div><strong>Email:</strong> {selectedLog.user.email || '-'}</div>
                      <div><strong>{isHindi ? 'मोबाइल' : 'Mobile'}:</strong> {selectedLog.user.mobile || '-'}</div>
                    </div>
                  ) : (isHindi ? 'कोई उपयोगकर्ता नहीं' : 'No user associated')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={3} className="fw-bold">{isHindi ? 'समय' : 'Timestamp'}:</Col>
                <Col md={9}>{formatDate(selectedLog.createdAt)}</Col>
              </Row>
              {selectedLog.requestBody && (
                <Row className="mb-3">
                  <Col md={3} className="fw-bold">{isHindi ? 'अनुरोध बॉडी' : 'Request Body'}:</Col>
                  <Col md={9}>
                    <pre className="bg-light p-2 rounded" style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                      {typeof selectedLog.requestBody === 'object'
                        ? JSON.stringify(selectedLog.requestBody, null, 2)
                        : selectedLog.requestBody || '-'}
                    </pre>
                  </Col>
                </Row>
              )}
              {selectedLog.responseStatus && (
                <Row className="mb-3">
                  <Col md={3} className="fw-bold">{isHindi ? 'प्रतिक्रिया स्थिति' : 'Response Status'}:</Col>
                  <Col md={9}>{selectedLog.responseStatus}</Col>
                </Row>
              )}
            </div>
          ) : (
            <p className="text-muted text-center">{isHindi ? 'कोई डेटा नहीं' : 'No data available'}</p>
          )}
        </ModalBody>
        <ModalFooter className="bg-light">
          <Button color="secondary" size="sm" onClick={() => setViewModal(false)}>
            {isHindi ? 'बंद करें' : 'Close'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
};

export default ActivityLogManagement;