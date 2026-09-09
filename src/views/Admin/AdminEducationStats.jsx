import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Row,
  Col,
  CardHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Spinner
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import PageLoader from "../../components/PageLoader";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSearch, FaFilter } from "react-icons/fa";


/* ---------- CURRENT ACADEMIC YEAR ---------- */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const AdminEducationStats = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state
  const [form, setForm] = useState({
    totalGovernmentUniversities: 0,
    totalPrivateUniversities: 0,
    totalCentralUniversities: 0,
    governmentColleges: 0,
    privateColleges: 0,
    aidedColleges: 0,
    totalStudents: 0,
    totalCourses: 0,
    academicYear: getCurrentAcademicYear(),
    lastUpdatedBy: "",
    isActive: true
  });

  /* ================= LOAD LIST ================= */
  const loadList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/education-stats/list-for-admin`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setList(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load stats list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  /* ================= FILTERING ================= */
  const filteredList = list.filter(item => {
    const matchesSearch = searchTerm === "" ||
      item.academicYear?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "active" ? item.isActive : !item.isActive);
    return matchesSearch && matchesStatus;
  });

  /* ================= PAGINATION CALCULATIONS ================= */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  /* ================= PAGINATION RENDER ================= */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    const handlePageChange = (page) => {
      if (page === currentPage) return;
      setCurrentPage(page);
    };

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination className="mb-0" size="md">
          {/* First Page */}
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink first onClick={() => handlePageChange(1)} />
          </PaginationItem>

          {/* Previous Page */}
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
          </PaginationItem>

          {/* First page ellipsis */}
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem disabled>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
            </>
          )}

          {/* Page numbers */}
          {pages.map((page) => (
            <PaginationItem key={page} active={page === currentPage}>
              <PaginationLink onClick={() => handlePageChange(page)}>
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Last page ellipsis */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem disabled>
                  <PaginationLink>...</PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next Page */}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>

          {/* Last Page */}
          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink last onClick={() => handlePageChange(totalPages)} />
          </PaginationItem>
        </Pagination>
      </div>
    );
  };

  /* ================= ITEMS PER PAGE SELECTOR ================= */
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  /* ================= RESET FILTERS ================= */
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  /* ================= INPUT HANDLING ================= */
  const blockInvalidNumberKeys = (e) => {
    if (["-", "+", "e", "E", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberInput = (e, key) => {
    const value = e.target.value;

    if (value === "") {
      setForm({ ...form, [key]: 0 });
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setForm({ ...form, [key]: Number(value) });
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      totalGovernmentUniversities: 0,
      totalPrivateUniversities: 0,
      totalCentralUniversities: 0,
      governmentColleges: 0,
      privateColleges: 0,
      aidedColleges: 0,
      totalStudents: 0,
      totalCourses: 0,
      academicYear: getCurrentAcademicYear(),
      lastUpdatedBy: "",
      isActive: true
    });
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !editingId &&
      list.some(item => item.academicYear === form.academicYear)
    ) {
      Swal.fire(
        "Duplicate",
        "Statistics already exist for this academic year",
        "warning"
      );
      return;
    }

    try {
      let res;

      if (editingId) {
        res = await axios.put(
          `${API_URL}/api/education-stats/update/${editingId}`,
          form,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }
        );
      } else {
        res = await axios.post(
          `${API_URL}/api/education-stats/create`,
          form,
          {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
          }
        );
      }

      Swal.fire("Success", res.data.message, "success");
      toggleModal();
      loadList();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      totalGovernmentUniversities: item.totalGovernmentUniversities,
      totalPrivateUniversities: item.totalPrivateUniversities,
      totalCentralUniversities: item.totalCentralUniversities,
      governmentColleges: item.governmentColleges,
      privateColleges: item.privateColleges,
      aidedColleges: item.aidedColleges || 0,
      totalStudents: item.totalStudents,
      totalCourses: item.totalCourses,
      academicYear: item.academicYear,
      lastUpdatedBy: item.lastUpdatedBy || "",
      isActive: item.isActive
    });
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Statistics?",
      text: "This academic year will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/education-stats/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success", res.data.message, "success");
      loadList();
    } catch (err) {
      Swal.fire("Error", "Failed to delete", "error");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center p-2">
          <h4 className="mb-0 text-white">Education Statistics (Admin)</h4>
          <Button color="light" className="text-success" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add Academic Year
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Filters */}
        <div className="mb-4 p-3 bg-light rounded-3">
          <Row className="d-flex">
            <Col lg={3}>
              <FormGroup className="mb-0">
                <Label className="fw-semibold mb-1 text-secondary">
                  <FaSearch className="me-1 text-primary" size={14} />
                  Search by Academic Year
                </Label>
                <Input
                  type="text"
                  placeholder="Search notices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 rounded-3"
                  style={{
                    borderColor: "#e2e8f0",
                    height: "42px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d6efd";
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(13, 110, 253, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </FormGroup>
            </Col>

            <Col lg={3}>
              <FormGroup className="mb-0">
                <Label className="fw-semibold mb-1 text-secondary">
                  <FaFilter className="me-1 text-primary" size={14} />
                  Filter by Status
                </Label>
                <Input
                  type="select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border-2 rounded-3"
                  style={{
                    borderColor: "#e2e8f0",
                    height: "42px",
                    transition: "all 0.3s ease"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d6efd";
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(13, 110, 253, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="all">📋 All</option>
                  <option value="active">✅ Active</option>
                  <option value="inactive">⛔ Inactive</option>
                </Input>
              </FormGroup>
            </Col>

            <Col lg={3} className="mt-4">

              <Button
                color="secondary"
                size="small"
                onClick={handleResetFilters}
                className="btn btn-secondary rounded-3 fw-semibold"
               
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 15px rgba(108, 117, 125, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <FaTimes className="me-2" size={14} />
                Reset 
              </Button>
            </Col>

            <Col lg={3}>
              <div className="d-flex align-items-center gap-2 justify-content-md-end justify-content-start" style={{ height: "42px" }}>
                <small className="text-muted fw-semibold">Show:</small>
                <select
                  className="form-select form-select-sm border-2 rounded-3"
                  style={{
                    width: "auto",
                    borderColor: "#e2e8f0",
                    padding: "6px 12px",
                    fontWeight: 500,
                    height: "42px",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#0d6efd";
                    e.target.style.boxShadow = "0 0 0 0.2rem rgba(13, 110, 253, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </Col>
          </Row>
        </div>

        {/* Stats Info */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="text-muted small">
            Showing {filteredList.length === 0 ? 0 : indexOfFirstItem + 1} -
            {Math.min(indexOfLastItem, filteredList.length)} of {filteredList.length} records
          </div>
        </div>

        {loading ? (
          <PageLoader inline={true} />
        ) : (
          <>
            <Table responsive striped hover>
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Academic Year</th>

                  <th>Total Universities</th>

                  <th>Total Colleges</th>
                  <th>Total Students</th>
                  <th>Total Courses</th>
                  <th style={{ width: "80px" }}>Status</th>
                  <th style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="text-center py-5 text-muted">
                      No statistics found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, i) => {
                    const totalUniversities = (item.totalGovernmentUniversities || 0) +
                      (item.totalPrivateUniversities || 0) +
                      (item.totalCentralUniversities || 0);
                    const totalColleges = (item.governmentColleges || 0) +
                      (item.privateColleges || 0) +
                      (item.aidedColleges || 0);

                    return (
                      <tr key={item._id}>
                        <td>{indexOfFirstItem + i + 1}</td>
                        <td className="fw-semibold">{item.academicYear}</td>
                        <td className="fw-semibold text-primary">{totalUniversities}</td>
                        <td className="fw-semibold text-primary">{totalColleges}</td>
                        <td className="fw-semibold">{item.totalStudents?.toLocaleString() || 0}</td>
                        <td>{item.totalCourses || 0}</td>
                        <td>
                          <Badge color={item.isActive ? "success" : "danger"}>
                            {item.isActive ? "ACTIVE" : "INACTIVE"}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              color="warning"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleDelete(item._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* MODAL */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg" backdrop="static">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "✏️ Edit Education Statistics" : "➕ Add Education Statistics"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row>
                {[
                  ["totalGovernmentUniversities", "Government Universities"],
                  ["totalPrivateUniversities", "Private Universities"],
                  ["totalCentralUniversities", "Central Universities"],
                  ["governmentColleges", "Government Colleges"],
                  ["privateColleges", "Private Colleges"],
                  ["aidedColleges", "Aided Colleges"],
                  ["totalStudents", "Total Students"],
                  ["totalCourses", "Total Courses"]
                ].map(([key, label]) => (
                  <Col md={4} key={key}>
                    <FormGroup>
                      <Label>{label}</Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={form[key]}
                        onKeyDown={blockInvalidNumberKeys}
                        onChange={(e) => handleNumberInput(e, key)}
                      />
                    </FormGroup>
                  </Col>
                ))}

                <Col md={4}>
                  <FormGroup>
                    <Label>Academic Year</Label>
                    <Input
                      value={form.academicYear}
                      disabled={!!editingId}
                      onChange={(e) =>
                        setForm({ ...form, academicYear: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>Last Updated By</Label>
                    <Input
                      value={form.lastUpdatedBy}
                      onChange={(e) =>
                        setForm({ ...form, lastUpdatedBy: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>Status</Label>
                    <Input
                      type="select"
                      value={form.isActive}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isActive: e.target.value === "true"
                        })
                      }
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {editingId ? "Update" : "Create"}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default AdminEducationStats;