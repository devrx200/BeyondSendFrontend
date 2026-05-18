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
  FaSearch,
  FaFileWord,
  FaFileExcel,
  FaEye
} from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";


const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
/* ================= INITIAL FORM STATE ================= */
const initialFormData = {
  titleEng: "",
  titleHin: "",
  slug: "",
  mainSlug: "",
  menuId: "",
  department: "",
  htmlContent: "",
  htmlContentHi: "",
  documentsUpdate: [],
  isActive: true
};

const initialDocumentData = {
  titleEng: "",
  titleHin: "",
  fileUrl: "",
  fileName: "",
  fileSize: "",
  fileType: "",
  file: null,
  shortDescriptionEn: "",
  shortDescriptionHin: "",
};

const PageCreatorManagement = () => {

  const { isHindi } = useLanguage();

  // Main state
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

      if (searchTerm?.trim()) params.append("search", searchTerm.trim());
      if (filterDepartment?.trim()) params.append("department", filterDepartment.trim());
      if (filterMenuId?.trim()) params.append("menuId", filterMenuId.trim());

      const response = await axios.get(
        `${API_URL}/api/get-all-content?${params.toString()}`,{ headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        setList(response.data.data || []);
        setCurrentPage(response.data.pagination?.currentPage || 1);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalDocuments(response.data.pagination?.totalDocuments || 0);
      } else {
        throw new Error(response.data?.message || "Failed to load pages");
      }
    } catch (error) {
      console.error("Error loading pages:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load pages. Please try again.";

      await Swal.fire({
        icon: "error",
        title: "Error Loading Pages",
        text: errorMessage,
        confirmButtonText: "OK"
      });

      setList([]);
      setTotalPages(1);
      setTotalDocuments(0);
    } finally {
      setLoading(false);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu-list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success !== false) {
        setMenuList(response.data?.data || []);
      } else {
        throw new Error(response.data?.message || "Failed to load menus");
      }
    } catch (error) {
      console.error("Error loading menus:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load menus";

      await Swal.fire({
        icon: "warning",
        title: "Menu Load Error",
        text: errorMessage,
        timer: 3000,
        showConfirmButton: false
      });

      setMenuList([]);
    }
  };

  useEffect(() => {
    loadData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterDepartment, filterMenuId]);

  useEffect(() => {
    loadMenus();
  }, []);

  /* ================= HELPER FUNCTIONS ================= */
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
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
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

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFilePdf />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return <FaFilePdf className="text-danger" />;
    if (type.includes("word") || type.includes("doc")) return <FaFileWord className="text-primary" />;
    if (type.includes("excel") || type.includes("xls") || type.includes("sheet"))
      return <FaFileExcel className="text-success" />;

    return <FaFilePdf />;
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
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      Swal.fire({
        icon: "warning",
        title: "File Too Large 📁",
        text: "File size should not exceed 30 MB.",
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6"
      });

      e.target.value = null; // Reset file input
      return;
    }

    // Calculate file size
    const fileSizeKB = (file.size / 1024).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const displaySize =
      file.size < 1024 * 1024
        ? `${fileSizeKB} KB`
        : `${fileSizeMB} MB`;

    // Update document state
    setCurrentDocument((prev) => ({
      ...prev,
      file: file,
      fileName: file.name,
      fileSize: displaySize,
      fileType: file.type.split("/").pop() || file.name.split(".").pop()
    }));
  };

  const handleAddDocument = async () => {
    // Validation
    if (!currentDocument.titleEng?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please enter document title in English",
        confirmButtonText: "OK"
      });
      return;
    }

    if (!currentDocument.titleHin?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please enter document title in Hindi",
        confirmButtonText: "OK"
      });
      return;
    }

    // For new documents, file is required
    if (editingDocIndex === null && !currentDocument.file) {
      Swal.fire({
        icon: "warning",
        title: "Required Field",
        text: "Please upload a file",
        confirmButtonText: "OK"
      });
      return;
    }

    // If content doesn't exist yet (creating new content), manage locally
    if (!editingId) {
      const updatedDocs = [...formData.documentsUpdate];

      if (editingDocIndex !== null) {
        // Update existing document locally
        updatedDocs[editingDocIndex] = {
          ...updatedDocs[editingDocIndex],
          ...currentDocument
        };
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Document updated successfully",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Add new document locally
        updatedDocs.push({ ...currentDocument });
        Swal.fire({
          icon: "success",
          title: "Added",
          text: "Document added successfully",
          timer: 1500,
          showConfirmButton: false
        });
      }

      setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));
      toggleDocumentModal();
      return;
    }

    // If content exists (editing mode), use API
    try {
      const fd = new FormData();
      fd.append("titleEng", currentDocument.titleEng);
      fd.append("titleHin", currentDocument.titleHin);
      fd.append("shortDescriptionEn", currentDocument.shortDescriptionEn || "");
      fd.append("shortDescriptionHin", currentDocument.shortDescriptionHin || "");

      if (currentDocument.file) {
        fd.append("file", currentDocument.file);
        // Calculate file size
        const fileSizeKB = (currentDocument.file.size / 1024).toFixed(2);
        const fileSizeMB = (currentDocument.file.size / (1024 * 1024)).toFixed(2);
        const displaySize = currentDocument.file.size < 1024 * 1024
          ? `${fileSizeKB} KB`
          : `${fileSizeMB} MB`;

        fd.append("fileSize", displaySize);
        fd.append("fileType", currentDocument.file.type.split("/").pop() || currentDocument.file.name.split(".").pop());
      }

      if (editingDocIndex !== null) {
        // Update existing document via API
        const docId = formData.documentsUpdate[editingDocIndex]._id;

        if (!docId) {
          throw new Error("Document ID not found");
        }

        const response = await axios.put(
          `${API_URL}/api/update-single-document/${editingId}/${docId}`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state with the updated document
        const updatedDocs = [...formData.documentsUpdate];
        updatedDocs[editingDocIndex] = {
          ...updatedDocs[editingDocIndex],
          ...response.data.data
        };
        setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: response.data?.message || "Document updated successfully",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Add new document via API
        const response = await axios.post(
          `${API_URL}/api/add-document-to-content/${editingId}`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Add the new document to local state
        const newDocument = response.data.data;
        setFormData((prev) => ({
          ...prev,
          documentsUpdate: [...prev.documentsUpdate, newDocument]
        }));

        Swal.fire({
          icon: "success",
          title: "Added",
          text: response.data?.message || "Document added successfully",
          timer: 1500,
          showConfirmButton: false
        });
      }

      toggleDocumentModal();
    } catch (error) {
      console.error("Error saving document:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to save document",
        confirmButtonText: "OK"
      });
    }
  };

  const handleEditDocument = (index) => {
    const doc = formData.documentsUpdate[index];
    setCurrentDocument({
      ...doc,
      file: null // Don't carry over file object when editing
    });
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

    // If content doesn't exist yet (creating new content), manage locally
    if (!editingId) {
      const updatedDocs = formData.documentsUpdate.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Document removed successfully",
        timer: 1500,
        showConfirmButton: false
      });
      return;
    }

    // If content exists (editing mode), use API
    try {
      const docId = formData.documentsUpdate[index]._id;

      if (!docId) {
        throw new Error("Document ID not found");
      }

      const response = await axios.delete(
        `${API_URL}/api/delete-document/${editingId}/${docId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state by removing the deleted document
      const updatedDocs = formData.documentsUpdate.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, documentsUpdate: updatedDocs }));

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: response.data?.message || "Document deleted successfully",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to delete document",
        confirmButtonText: "OK"
      });
    }
  };

  /* ================= CRUD OPERATIONS ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
      titleEng: item.titleEng || "",
      titleHin: item.titleHin || "",
      slug: item.slug || "",
      mainSlug: item.mainSlug || "",
      menuId: item.menuId?._id || item.menuId || "",
      department: item.department || "",
      htmlContent: item.htmlContent || "",
      htmlContentHi: item.htmlContentHi || "",
      isActive: item.isActive !== false,
      documentsUpdate: Array.isArray(item.documentsUpdate)
        ? item.documentsUpdate.map((doc) => ({
          ...doc,
          file: null // Don't include file object for existing documents
        }))
        : []
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
      const response = await axios.delete(`${API_URL}/api/delete-content/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const successMessage =
        response.data?.message || "Page deleted successfully";

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text: successMessage,
        timer: 2000,
        showConfirmButton: false
      });

      // Reload data - if current page is empty, go to previous page
      const newTotal = totalDocuments - 1;
      const newTotalPages = Math.ceil(newTotal / limit) || 1;

      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
        loadData(newTotalPages);
      } else {
        loadData(currentPage);
      }
    } catch (error) {
      console.error("Delete error:", error);

      const errorMessage =
        error.response?.data?.message || error.message || "Delete failed";

      Swal.fire({
        icon: "error",
        title: "Error Deleting Page",
        text: errorMessage,
        confirmButtonText: "OK"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const apiUrl = editingId
        ? `${API_URL}/api/update-content/${editingId}`
        : `${API_URL}/api/create-content`;

      const multipart = hasNewFiles();
      const payload = multipart ? buildFormData() : buildJsonPayload();
      const config = {
        ...getAxiosConfig(multipart),
        headers: {
          ...getAxiosConfig(multipart)?.headers,
          Authorization: `Bearer ${token}`,
        },
      };
      const response = editingId
        ? await axios.put(apiUrl, payload, config)
        : await axios.post(apiUrl, payload, config);

      await Swal.fire({
        icon: "success",
        title: editingId ? "Updated" : "Created",
        text: response.data?.message || "Saved successfully",
        timer: 2000,
        showConfirmButton: false
      });

      toggleModal();
      loadData(currentPage);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error Saving Page",
        text:
          error.response?.data?.message ||
          "Server error. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= HELPERS ================= */

  const validateForm = () => {
    const requiredFields = {
      titleEng: "Title (English)",
      titleHin: "Title (Hindi)",
      slug: "Slug",
      mainSlug: "Main Slug",
      menuId: "Menu",
      department: "Department",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key]?.toString().trim()) {
        Swal.fire({
          icon: "warning",
          title: "Required Field",
          text: `Please fill: ${label}`
        });
        return false;
      }
    }
    return true;
  };

  const hasNewFiles = () =>
    formData.documentsUpdate?.some(doc => doc.file instanceof File);

  const buildFormData = () => {
    const fd = new FormData();

    // Append basic content fields
    [
      "titleEng",
      "titleHin",
      "slug",
      "mainSlug",
      "menuId",
      "department",
    ].forEach(key => fd.append(key, formData[key]));

    fd.append("htmlContent", formData.htmlContent || "");
    fd.append("htmlContentHi", formData.htmlContentHi || "");
    fd.append("isActive", formData.isActive);
    let fileIndex = 0;

    const documents = formData.documentsUpdate.map(doc => {
      const obj = {
        titleEng: doc.titleEng || "",
        titleHin: doc.titleHin || "",
        fileUrl: doc.fileUrl || "",
        fileName: doc.fileName || "",
        fileSize: doc.fileSize || "",
        fileType: doc.fileType || "",
        fileIndex: -1,
        shortDescriptionEn: doc.shortDescriptionEn || "",
        shortDescriptionHin: doc.shortDescriptionHin || "",

      };

      // Append file with field name "file" (matches backend middleware)
      if (doc.file instanceof File) {
        obj.fileIndex = fileIndex;
        fd.append("file", doc.file);  // Changed from "files" to "file"
        fileIndex++;
      }

      return obj;
    });

    fd.append("documentsUpdate", JSON.stringify(documents));

    console.log("FormData being sent:");
    console.log("- Documents:", documents);
    console.log("- Total files:", fileIndex);

    return fd;
  };

  const buildJsonPayload = () => ({
    titleEng: formData.titleEng.trim(),
    titleHin: formData.titleHin.trim(),
    slug: formData.slug.trim(),
    mainSlug: formData.mainSlug.trim(),
    menuId: formData.menuId,
    department: formData.department.trim(),
    htmlContent: formData.htmlContent || "",
    htmlContentHi: formData.htmlContentHi || "",
    isActive: formData.isActive,
    documentsUpdate: formData.documentsUpdate.map(doc => ({
      titleEng: doc.titleEng || "",
      titleHin: doc.titleHin || "",
      fileUrl: doc.fileUrl || "",
      fileName: doc.fileName || "",
      fileSize: doc.fileSize || "",
      fileType: doc.fileType || "",
      shortDescriptionEn: doc.shortDescriptionEn || "",
      shortDescriptionHin: doc.shortDescriptionHin || ""

    }))
  });

  const getAxiosConfig = (isMultipart) =>
    isMultipart
      ? {} // IMPORTANT: let axios set multipart headers
      : { headers: { "Content-Type": "application/json" } };


  /* ================= UI RENDER ================= */
  return (
    <div className="container mt-4">
      <Card>
        <CardBody>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">📄 Page Creator Management</h4>
            <Button color="primary" onClick={toggleModal} disabled={loading}>
              <FaPlus className="me-1" /> Add Page
            </Button>
          </div>

          {/* Filters */}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearch();
                          }
                        }}
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
                          {menu.titleEng || menu.name || "Unnamed Menu"}
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

          {/* Stats */}
          <div className="mb-3">
            <small className="text-muted">
              Showing {list.length} of {totalDocuments} pages (Page{" "}
              {currentPage} of {totalPages})
            </small>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner
                color="primary"
                style={{ width: "3rem", height: "3rem" }}
              />
              <p className="mt-3 text-muted">Loading pages...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Title (EN)</th>
                      <th>Menu</th>
                      <th>Main Slug</th>
                      <th>Slug</th>
                      <th>Department</th>
                      <th style={{ width: "100px" }}>Documents</th>
                      <th style={{ width: "120px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <p className="mb-0 text-muted">
                            No pages found. Try adjusting your filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      list.map((item, i) => (
                        <tr key={item._id || i}>
                          <td>{(currentPage - 1) * limit + i + 1}</td>
                          <td>{item.titleEng || "N/A"}</td>
                          <td>
                            {item.menuId?.titleEng ||
                              item.menuId?.name ||
                              "N/A"}
                          </td>
                          <td>
                            <code className="text-primary">
                              {item.mainSlug || "N/A"}
                            </code>
                          </td>
                          <td>
                            <code className="text-primary">
                              {item.slug || "N/A"}
                            </code>
                          </td>
                          <td>{item.department || "N/A"}</td>


                          <td className="text-center">
                            <span className="badge bg-info">
                              {item.documentsUpdate?.length || 0}
                            </span>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              color="warning"
                              className="me-1 p-1 text-dark"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              className="p-1"
                              onClick={() => handleDelete(item._id)}
                              title="Delete"
                            >
                              <FaTrash />
                            </Button>

                            {/* Visit Page */}
                            <Button
                              size="sm"
                              color="primary"
                              className="p-1 ms-1"
                              onClick={() =>
                                window.open(
                                  `${item.menuId?.path}/${item.mainSlug}`,
                                  "_blank"
                                )
                              }
                              title="Visit Page"
                            >
                              <FaEye className="me-1" />
                              {isHindi ? "देखें" : "View"}

                            </Button>

                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </CardBody>
      </Card>

      {/* Main Form Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="xl" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          {editingId ? "✏️ Edit Page" : "➕ Create Page"}
        </ModalHeader>
        <Form onSubmit={handleSubmit}>
          <ModalBody style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {/* Title Fields */}
            <Row>
              <Col md={12}>
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
            </Row>
            <Row>
              <Col md={12}>
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
                      setFormData((prev) => ({
                        ...prev,
                        titleHin: e.target.value
                      }))
                    }
                  />
                </FormGroup>
              </Col>
            </Row>

            {/* Slug Fields */}
            <Row>
              <Col md={4}>
                <FormGroup>
                  <Label>
                    Menu <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="select"
                    required
                    value={formData.menuId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        menuId: e.target.value
                      }))
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
              <Col md={4}>
                <FormGroup>
                  <Label>
                    Main Slug (Main List Page ) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    required
                    placeholder="main-slug"
                    value={formData.mainSlug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        mainSlug: e.target.value
                      }))
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={4}>
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
                      setFormData((prev) => ({
                        ...prev,
                        slug: generateSlug(e.target.value)
                      }))
                    }
                    disabled={editingId}
                  />
                  <small className="text-muted">
                    Auto-generated from title
                  </small>
                </FormGroup>
              </Col>

            </Row>
            {/* Menu and Department */}
            <Row>
              <Col md={8}>
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
                      setFormData((prev) => ({
                        ...prev,
                        department: e.target.value
                      }))
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={4} className="mt-5 ml-3">
                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.checked   // 🔥 THIS IS IMPORTANT
                      })
                    }
                  />
                  <Label check for="isActive" className="fw-semibold">
                    Is Active
                  </Label>
                </FormGroup>
              </Col>
            </Row>


            {/* Documents Section */}
            <hr className="my-4" />
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                📎 Documents For Sub Page Content (
                {formData.documentsUpdate.length})
              </h5>
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
              <div className="table-responsive">
                <Table size="sm" bordered hover>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Title (EN)</th>
                      <th>Title (HI)</th>
                      <th>File</th>
                      <th style={{ width: "100px" }}>Size</th>
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
                              {getFileIcon(doc.fileType)}{" "}
                              {doc.fileName || "View"}
                            </a>
                          ) : doc.fileName ? (
                            <span className="text-success">
                              {getFileIcon(doc.fileType)} {doc.fileName}
                            </span>
                          ) : (
                            <span className="text-muted">No file</span>
                          )}
                        </td>
                        <td>{doc.fileSize || "N/A"}</td>

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
              </div>
            ) : (
              <div className="text-center text-muted py-3 bg-light rounded">
                <p className="mb-0">No documents added yet</p>
              </div>
            )}

            {/* HTML Content */}
            <hr className="my-4" />
            <FormGroup>
              <Label>HTML Content (English)</Label>
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
            <FormGroup>
              <Label>HTML Content (Hindi)</Label>
              <ReactQuill
                theme="snow"
                value={formData.htmlContentHi}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, htmlContentHi: value }))
                }
                style={{ height: "200px", marginBottom: "50px" }}
                placeholder="यहाँ पेज की सामग्री दर्ज करें..."
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
                  <FaSave className="me-1" />{" "}
                  {editingId ? "Update" : "Publish"}
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

      {/* Document Modal */}
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
                  Document Title (English){" "}
                  <span className="text-danger">*</span>
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
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Short Description (English)
                </Label>
                <Input
                  type="textarea"
                  placeholder="Enter Short Description"
                  value={currentDocument.shortDescriptionEn}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      shortDescriptionEn: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Short Description (Hindi)
                </Label>
                <Input
                  type="textarea"
                  placeholder="संक्षिप्त विवरण दर्ज करें"
                  value={currentDocument.shortDescriptionHin}
                  onChange={(e) =>
                    setCurrentDocument({
                      ...currentDocument,
                      shortDescriptionHin: e.target.value
                    })
                  }
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Upload File{" "}
                  {editingDocIndex === null && (
                    <span className="text-danger">*</span>
                  )}
                  <small className="text-muted d-block">
                    Maximum allowed file size: 30 MB
                  </small>
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
                {editingDocIndex !== null &&
                  !currentDocument.file &&
                  currentDocument.fileUrl && (
                    <small className="text-info d-block mt-2">
                      📎 Current file will be kept if no new file is uploaded
                    </small>
                  )}
              </FormGroup>
            </Col>
          </Row>
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
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddDocument}>
            <FaSave className="me-1" />{" "}
            {editingDocIndex !== null ? "Update" : "Add"}
          </Button>
          <Button color="secondary" onClick={toggleDocumentModal}>
            <FaTimes className="me-1" /> Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default PageCreatorManagement;