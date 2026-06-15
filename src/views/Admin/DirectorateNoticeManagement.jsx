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
  Spinner,
  CardHeader,
  Pagination,
  PaginationItem,
  PaginationLink
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DirectorateNoticeManagement = () => {
  const API = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = list.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  const initialState = {
    titleEn: "",
    titleHi: "",
    slug: "",
    shortDescriptionEn: "",
    shortDescriptionHi: "",
    descriptionEn: "",
    descriptionHi: "",
    categoryId: "",
    file: null,
    isActive: true
  };

  const [formData, setFormData] = useState(initialState);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  /* ================= FETCH DATA ================= */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-directorate-notice-all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList(res.data.data || []);
    } catch {
      Swal.fire("Error", "Failed to load notices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data.data || []);
    } catch {
      console.error("Category load failed");
    }
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, [API, token]);

  // Reset to page 1 when list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [list.length]);

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingId(null);
      setFormData(initialState);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialState);
    setModal(true);
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEn: item.titleEn || "",
      titleHi: item.titleHi || "",
      slug: item.slug || "",
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionHi: item.shortDescriptionHi || "",
      descriptionEn: item.descriptionEn || "",
      descriptionHi: item.descriptionHi || "",
      categoryId: item.categoryId?._id || "",
      file: null,
      isActive: item.isActive !== false
    });
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This notice will be deleted",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API}/api/directorate-notice/delete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire(
        "Deleted!",
        res.data?.message || "Notice deleted successfully",
        "success"
      );

      fetchList();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "file") {
        fd.append(key, formData[key]);
      }
    });

    if (formData.file instanceof File) {
      fd.append("file", formData.file);
    }

    try {
      if (editingId) {
        await axios.put(
          `${API}/api/update-directorate-notice/${editingId}`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          }
        );
        Swal.fire("Updated!", "Notice updated successfully", "success");
      } else {
        await axios.post(
          `${API}/api/create-directorate-notice`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          }
        );
        Swal.fire("Created!", "Notice created successfully", "success");
      }

      toggleModal();
      fetchList();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      <div className="d-flex justify-content-center mt-3">
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

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="text-white mb-0">Directorate Notices</h4>
          <Button color="light" className="text-success" onClick={handleOpenCreate}>
            <FaPlus /> Add Notice
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        {/* Stats and Items Per Page */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="text-muted small">
            Showing {list.length === 0 ? 0 : indexOfFirstItem + 1} - 
            {Math.min(indexOfLastItem, list.length)} of {list.length} notices
          </div>
          <div className="d-flex align-items-center gap-2">
            <small className="text-muted">Show:</small>
            <select
              className="form-select form-select-sm"
              style={{ width: "auto" }}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
            <p className="mt-3 text-muted">Loading notices...</p>
          </div>
        ) : (
          <>
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="py-4 text-muted">
                        <span className="display-4 d-block mb-3">📢</span>
                        <p className="mb-0">No notices found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, i) => (
                    <tr key={item._id}>
                      <td>{indexOfFirstItem + i + 1}</td>
                      <td>
                        <div className="fw-semibold">{item.titleEn}</div>
                        <small className="text-muted">{item.slug}</small>
                      </td>
                      <td>
                        <Badge color="info" pill>
                          {item.categoryId?.categoryNameEn || "N/A"}
                        </Badge>
                      </td>
                      <td>
                        <Badge color={item.isActive ? "success" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
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
                  ))
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}

        {/* ================= MODAL ================= */}
        <Modal isOpen={modal} toggle={toggleModal} size="xl" backdrop="static">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "✏️ Edit Notice" : "➕ Create Notice"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {/* Titles */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Title (English) <span className="text-danger">*</span></Label>
                    <Input
                      required
                      value={formData.titleEn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleEn: e.target.value,
                          slug: generateSlug(e.target.value)
                        })
                      }
                      placeholder="Enter English title"
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Title (Hindi) <span className="text-danger">*</span></Label>
                    <Input
                      required
                      value={formData.titleHi}
                      onChange={(e) =>
                        setFormData({ ...formData, titleHi: e.target.value })
                      }
                      placeholder="Enter Hindi title"
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Slug + Category */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Slug</Label>
                    <Input value={formData.slug} disabled className="bg-light" />
                    <small className="text-muted">Auto-generated from title</small>
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Category <span className="text-danger">*</span></Label>
                    <Input
                      type="select"
                      required
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.categoryNameEn}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              {/* Short Description */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Short Description (English)</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={formData.shortDescriptionEn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortDescriptionEn: e.target.value
                        })
                      }
                      placeholder="Brief description in English"
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Short Description (Hindi)</Label>
                    <Input
                      type="textarea"
                      rows="3"
                      value={formData.shortDescriptionHi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortDescriptionHi: e.target.value
                        })
                      }
                      placeholder="Brief description in Hindi"
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Description */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Description (English)</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.descriptionEn}
                      onChange={(value) =>
                        setFormData({ ...formData, descriptionEn: value })
                      }
                      modules={quillModules}
                      placeholder="Write detailed description in English..."
                      style={{ height: "200px", marginBottom: "50px" }}
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Description (Hindi)</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.descriptionHi}
                      onChange={(value) =>
                        setFormData({ ...formData, descriptionHi: value })
                      }
                      modules={quillModules}
                      placeholder="Write detailed description in Hindi..."
                      style={{ height: "200px", marginBottom: "50px" }}
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* File */}
              <Row className="mt-4">
                <Col md={12}>
                  <FormGroup>
                    <Label>Upload File (PDF/DOC/DOCX - Max 5MB)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                    />
                    <small className="text-muted">
                      {editingId && "Leave empty to keep existing file"}
                    </small>
                  </FormGroup>
                </Col>
              </Row>

              {/* Active */}
              <Row className="mt-3">
                <Col md={12}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    <Label check for="isActive" className="fw-semibold">
                      Is Active
                    </Label>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={toggleModal} disabled={submitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-1" />
                    {editingId ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  editingId ? "Update" : "Create"
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default DirectorateNoticeManagement;