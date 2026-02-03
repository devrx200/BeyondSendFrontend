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
  Row,
  Col,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink
} from "reactstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaFilePdf,
  FaSearch
} from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= INITIAL FORM STATE ================= */
const initialFormData = {
  titleEng: "",
  titleHin: "",
  slug: "",
  mainSlug: "",
  menuId: "",
  department: "",
  publishDate: "",
  htmlContent: "",
  documentsUpdate: []
};

const initialDocumentData = {
  titleEng: "",
  titleHin: "",
  fileUrl: "",
  fileSize: "",
  fileType: "",
  publishDate: ""
};

const PageCreatorManagement = () => {
  const [list, setList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [limit] = useState(10);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterMenuId, setFilterMenuId] = useState("");

  // Document form state
  const [documentModal, setDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(initialDocumentData);
  const [editingDocIndex, setEditingDocIndex] = useState(null);

  /* ================= LOAD DATA WITH PAGINATION ================= */
  const loadData = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterDepartment) params.append("department", filterDepartment);
      if (filterMenuId) params.append("menuId", filterMenuId);

      const res = await axios.get(`${API_URL}/api/get-all-content?${params.toString()}`);

      if (res.data?.success) {
        setList(res.data.data || []);
        setCurrentPage(res.data.pagination?.currentPage || 1);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalDocuments(res.data.pagination?.totalDocuments || 0);
      }
    } catch (err) {
      console.error("Error loading pages:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to load pages"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu-list`);
      setMenuList(res.data?.data || []);
    } catch (err) {
      console.error("Error loading menus:", err);
    }
  };

  useEffect(() => {
    loadData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterDepartment, filterMenuId]);

  useEffect(() => {
    loadMenus();
  }, []);

  /* ================= HELPERS ================= */
  const toggleModal = () => {
    if (modal) {
      resetForm();
    }
    setModal(!modal);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  const generateSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadData(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterDepartment("");
    setFilterMenuId("");
    setCurrentPage(1);
  };

  /* ================= PAGINATION ================= */
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

    return (
      <Pagination className="mt-3">
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink first onClick={() => setCurrentPage(1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === 1}>
          <PaginationLink previous onClick={() => setCurrentPage(currentPage - 1)} />
        </PaginationItem>

        {startPage > 1 && (
          <>
            <PaginationItem>
              <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && (
              <PaginationItem disabled>
                <PaginationLink>...</PaginationLink>
              </PaginationItem>
            )}
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page} active={page === currentPage}>
            <PaginationLink onClick={() => setCurrentPage(page)}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
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
          <PaginationLink next onClick={() => setCurrentPage(currentPage + 1)} />
        </PaginationItem>
        <PaginationItem disabled={currentPage === totalPages}>
          <PaginationLink last onClick={() => setCurrentPage(totalPages)} />
        </PaginationItem>
      </Pagination>
    );
  };

  /* ================= DOCUMENT MANAGEMENT ================= */
  const toggleDocumentModal = () => {
    if (documentModal) {
      setCurrentDocument(initialDocumentData);
      setEditingDocIndex(null);
    }
    setDocumentModal(!documentModal);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      Swal.fire({
        icon: "warning",
        title: "File Too Large",
        text: "File size should not exceed 10MB"
      });
      e.target.value = "";
      return;
    }

    // Store file object directly
    setCurrentDocument((prev) => ({
      ...prev,
      file: file,
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + " KB",
      fileType: file.type || file.name.split(".").pop()
    }));
  };

  const handleAddDocument = () => {
    // Validation
    if (
      !currentDocument.titleEng?.trim() ||
      !currentDocument.titleHin?.trim() ||
      !currentDocument.publishDate
    ) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill all document fields"
      });
      return;
    }

    // Always update local state - will be sent with create/update
    const updatedDocs = [...formData.documentsUpdate];

    if (editingDocIndex !== null) {
      updatedDocs[editingDocIndex] = { ...currentDocument };
      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Document updated",
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      updatedDocs.push({ ...currentDocument });
      Swal.fire({
        icon: "success",
        title: "Added",
        text: "Document added",
        timer: 1500,
        showConfirmButton: false
      });
    }

    setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));
    toggleDocumentModal();
  };

  const handleEditDocument = (index) => {
    setCurrentDocument({ ...formData.documentsUpdate[index] });
    setEditingDocIndex(index);
    setDocumentModal(true);
  };

  const handleDeleteDocument = async (index) => {
    const result = await Swal.fire({
      title: "Delete Document?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    // Always update local state - will be sent with update
    const updatedDocs = formData.documentsUpdate.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));

    Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Document removed",
      timer: 1500,
      showConfirmButton: false
    });
  };

  /* ================= CRUD ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEng: item.titleEng || "",
      titleHin: item.titleHin || "",
      slug: item.slug || "",
      mainSlug: item.mainSlug || "",
      menuId: item.menuId?._id || item.menuId || "",
      department: item.department || "",
      publishDate: item.publishDate?.slice(0, 10) || "",
      htmlContent: item.htmlContent || "",
      documentsUpdate: Array.isArray(item.documentsUpdate) ? item.documentsUpdate : []
    });
    setModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Page?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/delete-content/${id}`);
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Page deleted successfully",
        timer: 2000,
        showConfirmButton: false
      });
      loadData(currentPage);
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Delete failed"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = {
      titleEng: "Title (English)",
      titleHin: "Title (Hindi)",
      slug: "Slug",
      mainSlug: "Main Slug",
      menuId: "Menu",
      department: "Department",
      publishDate: "Publish Date"
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field]?.toString().trim()) {
        Swal.fire({
          icon: "warning",
          title: "Required Field",
          text: `Please fill: ${label}`
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      // Prepare FormData for file upload
      const formDataToSend = new FormData();

      // Append basic fields
      formDataToSend.append("titleEng", formData.titleEng);
      formDataToSend.append("titleHin", formData.titleHin);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("mainSlug", formData.mainSlug);
      formDataToSend.append("menuId", formData.menuId);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("publishDate", formData.publishDate);
      formDataToSend.append("htmlContent", formData.htmlContent || "");

      // Append documents as JSON string and files separately
      if (formData.documentsUpdate && formData.documentsUpdate.length > 0) {
        const documentsData = [];

        formData.documentsUpdate.forEach((doc) => {
          // Add document metadata
          documentsData.push({
            titleEng: doc.titleEng || "",
            titleHin: doc.titleHin || "",
            fileUrl: doc.fileUrl || "",
            fileName: doc.fileName || "",
            fileSize: doc.fileSize || "",
            fileType: doc.fileType || "",
            publishDate: doc.publishDate || ""
          });

          // If document has file object, append it
          if (doc.file) {
            formDataToSend.append(`files`, doc.file);
          }
        });

        // Append documents metadata as JSON string
        formDataToSend.append("documentsUpdate", JSON.stringify(documentsData));
      }

      if (editingId) {
        await axios.put(`${API_URL}/update-content/${editingId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Page updated successfully",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API_URL}/api/create-content`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Page created successfully",
          timer: 2000,
          showConfirmButton: false
        });
      }
      toggleModal();
      loadData(currentPage);
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Save failed"
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="container-fluid mt-4">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">📄 Page Creator Management</h4>
            <Button color="primary" onClick={toggleModal} disabled={loading}>
              <FaPlus className="me-1" /> Add Page
            </Button>
          </div>

          {/* ================= FILTERS ================= */}
          <Card className="mb-3 bg-light">
            <CardBody>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label>Search</Label>
                    <div className="d-flex">
                      <Input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <Button
                        color="primary"
                        className="ms-2"
                        onClick={handleSearch}
                        disabled={loading}
                      >
                        <FaSearch />
                      </Button>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Filter by Department</Label>
                    <Input
                      type="text"
                      placeholder="Department name"
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup>
                    <Label>Filter by Menu</Label>
                    <Input
                      type="select"
                      value={filterMenuId}
                      onChange={(e) => setFilterMenuId(e.target.value)}
                    >
                      <option value="">All Menus</option>
                      {menuList.map((menu) => (
                        <option key={menu._id} value={menu._id}>
                          {menu.titleEng || menu.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <FormGroup className="w-100">
                    <Button
                      color="secondary"
                      className="w-100"
                      onClick={handleResetFilters}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* ================= STATS ================= */}
          <div className="mb-3">
            <small className="text-muted">
              Showing {list.length} of {totalDocuments} pages (Page {currentPage} of {totalPages})
            </small>
          </div>

          {/* ================= TABLE ================= */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted">Loading pages...</p>
            </div>
          ) : (
            <>
              <Table responsive bordered hover>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Title (EN)</th>
                    <th>Slug</th>
                    <th>Department</th>
                    <th>Menu</th>
                    <th>Publish Date</th>
                    <th style={{ width: "100px" }}>Documents</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <p className="mb-0 text-muted">No pages found</p>
                      </td>
                    </tr>
                  ) : (
                    list.map((item, i) => (
                      <tr key={item._id || i}>
                        <td>{(currentPage - 1) * limit + i + 1}</td>
                        <td>{item.titleEng || "N/A"}</td>
                        <td>
                          <code className="text-primary">{item.slug || "N/A"}</code>
                        </td>
                        <td>{item.department || "N/A"}</td>
                        <td>{item.menuId?.titleEng || "N/A"}</td>
                        <td>
                          {item.publishDate
                            ? new Date(item.publishDate).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-info">
                            {item.documentsUpdate?.length || 0}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="warning"
                            className="me-1"
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
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              {/* ================= PAGINATION ================= */}
              {renderPagination()}
            </>
          )}
        </CardBody>
      </Card>

      {/* ================= MAIN MODAL ================= */}
      <Modal isOpen={modal} toggle={toggleModal} size="xl" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          {editingId ? "✏️ Edit Page" : "➕ Create Page"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Title (English) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter title in English"
                    value={formData.titleEng}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        titleEng: title,
                        slug: generateSlug(title)
                      }));
                    }}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Title (Hindi) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="शीर्षक हिंदी में दर्ज करें"
                    value={formData.titleHin}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, titleHin: e.target.value }))
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Slug <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="auto-generated-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, slug: e.target.value }))
                    }
                  />
                  <small className="text-muted">Auto-generated from title</small>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Main Slug <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="main-slug"
                    value={formData.mainSlug}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, mainSlug: e.target.value }))
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Menu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    required
                    value={formData.menuId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, menuId: e.target.value }))
                    }
                  >
                    <option value="">-- Select Menu --</option>
                    {menuList.map((menu) => (
                      <option key={menu._id} value={menu._id}>
                        {menu.titleEng || menu.name || "Unnamed Menu"}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>
                    Department <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter department name"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, department: e.target.value }))
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <FormGroup>
                  <Label>
                    Publish Date <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="date"
                    required
                    value={formData.publishDate}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, publishDate: e.target.value }))
                    }
                  />
                </FormGroup>
              </Col>
            </Row>



            {/* ================= DOCUMENTS SECTION ================= */}
            <hr className="my-4" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">📎 Documents For Sub Page Content ({formData.documentsUpdate.length})</h5>
              <Button
                color="success"
                size="sm"
                onClick={toggleDocumentModal}
                type="button"
              >
                <FaPlus className="me-1" /> Add Document
              </Button>
            </div>

            {formData.documentsUpdate.length > 0 ? (
              <Table size="sm" bordered hover>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Title (EN)</th>
                    <th>Title (HI)</th>
                    <th>File</th>
                    <th style={{ width: "100px" }}>Size</th>
                    <th style={{ width: "120px" }}>Publish Date</th>
                    <th style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.documentsUpdate.map((doc, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{doc.titleEng || "N/A"}</td>
                      <td>{doc.titleHin || "N/A"}</td>
                      <td>
                        {doc.fileUrl ? (
                          <a
                            href={`${API_URL}${doc.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            <FaFilePdf className="me-1" /> View
                          </a>
                        ) : (
                          <span className="text-muted">No file</span>
                        )}
                      </td>
                      <td>{doc.fileSize || "N/A"}</td>
                      <td>
                        {doc.publishDate
                          ? new Date(doc.publishDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          color="warning"
                          className="me-1"
                          onClick={() => handleEditDocument(idx)}
                          type="button"
                          title="Edit Document"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDeleteDocument(idx)}
                          type="button"
                          title="Delete Document"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center text-muted py-3 bg-light rounded">
                <p className="mb-0">No documents added yet</p>
              </div>
            )}
            <hr />

            <FormGroup>
              <Label>HTML Content</Label>
              <ReactQuill
                theme="snow"
                value={formData.htmlContent}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, htmlContent: value }))
                }
                style={{ height: "200px", marginBottom: "50px" }}
                placeholder="Enter page content here..."
              />
            </FormGroup>


          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  {editingId ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  <FaSave className="me-1" /> {editingId ? "Update" : "Save"}
                </>
              )}
            </Button>
            <Button
              color="secondary"
              onClick={toggleModal}
              type="button"
              disabled={submitting}
            >
              <FaTimes className="me-1" /> Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ================= DOCUMENT MODAL ================= */}
      <Modal
        isOpen={documentModal}
        toggle={toggleDocumentModal}
        size="lg"
        backdrop="static"
      >
        <ModalHeader toggle={toggleDocumentModal}>
          {editingDocIndex !== null ? "✏️ Edit Document" : "➕ Add Document"}
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Document Title (English) <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="Enter document title"
                  value={currentDocument.titleEng}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      titleEng: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Document Title (Hindi) <span className="text-danger">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="दस्तावेज़ शीर्षक दर्ज करें"
                  value={currentDocument.titleHin}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      titleHin: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>
              Upload File <span className="text-danger">*</span>
            </Label>
            <Input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            {currentDocument.fileName && (
              <small className="text-success d-block mt-2">
                ✓ File Selected: {currentDocument.fileName}
              </small>
            )}
          </FormGroup>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>File Size (auto-filled)</Label>
                <Input
                  type="text"
                  value={currentDocument.fileSize}
                  readOnly
                  disabled
                  className="bg-light"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>File Type (auto-filled)</Label>
                <Input
                  type="text"
                  value={currentDocument.fileType}
                  readOnly
                  disabled
                  className="bg-light"
                />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>
              Publish Date <span className="text-danger">*</span>
            </Label>
            <Input
              type="date"
              value={currentDocument.publishDate}
              onChange={(e) =>
                setCurrentDocument({
                  ...currentDocument,
                  publishDate: e.target.value
                })
              }
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={handleAddDocument}
          >
            <FaSave className="me-1" /> {editingDocIndex !== null ? "Update" : "Add"}
          </Button>
          <Button
            color="secondary"
            onClick={toggleDocumentModal}
          >
            <FaTimes className="me-1" /> Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PageCreatorManagement;

