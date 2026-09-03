import { useEffect, useState, useRef, useMemo } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Row,
  Col,
  Spinner,
  Pagination,
  PaginationItem,
  PaginationLink,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaList,
  FaSave,
  FaTimes,
  FaArrowLeft,
  FaSearch,
  FaFileAlt,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaCopy,
  FaCheck,
  FaExternalLinkAlt
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";

const STORAGE_KEYS = {
  tab: "dept_notices_active_tab",
  editingId: "dept_notices_editing_id",
  formData: "dept_notices_form_data"
};

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
  existingFile: "",
  isActive: true
};

const readStoredJSON = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getToken = () => {
  const raw = sessionStorage.getItem("authToken");
  if (!raw) return "";
  try {
    const p = JSON.parse(raw);
    return p?.token || p?.access || raw;
  } catch {
    return raw;
  }
};

const getAuthHeaders = (isMultipart = false) => {
  const t = getToken();
  const headers = {};
  if (t) headers["Authorization"] = `Bearer ${t}`;
  if (isMultipart) headers["Content-Type"] = "multipart/form-data";
  return headers;
};

const DepartmentNoticeManagement = () => {
  const { isHindi } = useLanguage();
  const API = import.meta.env.VITE_API_URL;

  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Tabs & Form State
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem(STORAGE_KEYS.tab) || "1"
  );
  const [editingId, setEditingId] = useState(
    () => readStoredJSON(STORAGE_KEYS.editingId, null)
  );
  const [formData, setFormData] = useState(() => {
    const stored = readStoredJSON(STORAGE_KEYS.formData, null);
    return stored ? { ...initialState, ...stored, file: null } : initialState;
  });

  // Persist Tab & State
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.tab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (editingId) {
      sessionStorage.setItem(STORAGE_KEYS.editingId, JSON.stringify(editingId));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.editingId);
    }
  }, [editingId]);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyUrl = (slug, id) => {
    const fullUrl = `${window.location.origin}/department-notice/${slug}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {});
    } else {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    const { file, ...serializable } = formData;
    sessionStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(serializable));
  }, [formData]);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  /* ================= FETCH LIST & CATEGORIES ================= */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-department-notice-all`, {
        headers: getAuthHeaders()
      });
      setList(res.data.data || []);
    } catch (err) {
      console.error("Fetch list error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to load notices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Category load failed", err);
    }
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  /* ================= FILTERED & PAGINATED DATA ================= */
  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        (item.titleEn && item.titleEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.titleHi && item.titleHi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.slug && item.slug.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        !filterCategory ||
        item.categoryId?._id === filterCategory ||
        item.categoryId === filterCategory;

      return matchesSearch && matchesCat;
    });
  }, [list, searchTerm, filterCategory]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  const resetForm = () => {
    setEditingId(null);
    setFormData({ ...initialState });
    sessionStorage.removeItem(STORAGE_KEYS.editingId);
    sessionStorage.removeItem(STORAGE_KEYS.formData);
  };

  const goBackToList = () => {
    resetForm();
    setActiveTab("1");
  };

  const handleOpenCreate = () => {
    resetForm();
    setActiveTab("2");
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    const newFormData = {
      titleEn: item.titleEn || "",
      titleHi: item.titleHi || "",
      slug: item.slug || "",
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionHi: item.shortDescriptionHi || "",
      descriptionEn: item.descriptionEn || "",
      descriptionHi: item.descriptionHi || "",
      categoryId: item.categoryId?._id || item.categoryId || "",
      file: null,
      existingFile: item.file || "",
      isActive: item.isActive !== false
    };
    setFormData(newFormData);
    setActiveTab("2");
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This department notice will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await axios.delete(`${API}/api/dept-notice/delete/${id}`, {
        headers: getAuthHeaders()
      });

      Swal.fire(
        "Deleted!",
        response.data?.message || "Department notice deleted successfully",
        "success"
      );

      fetchList();
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire("Error", error.response?.data?.message || "Delete failed", "error");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titleEn?.trim()) {
      Swal.fire("Validation Error", "Title (English) is required", "warning");
      return;
    }
    if (!formData.titleHi?.trim()) {
      Swal.fire("Validation Error", "Title (Hindi) is required", "warning");
      return;
    }
    if (!formData.categoryId) {
      Swal.fire("Validation Error", "Please select a category", "warning");
      return;
    }

    setSubmitting(true);

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "file" || key === "existingFile") return;
      if (formData[key] !== null && formData[key] !== undefined) {
        fd.append(key, formData[key]);
      }
    });

    if (formData.file instanceof File) {
      fd.append("file", formData.file);
    }

    try {
      if (editingId) {
        await axios.put(
          `${API}/api/update-dept-notice/${editingId}`,
          fd,
          { headers: getAuthHeaders(true) }
        );
        Swal.fire("Updated!", "Department notice updated successfully", "success");
      } else {
        await axios.post(
          `${API}/api/create-dept-notice`,
          fd,
          { headers: getAuthHeaders(true) }
        );
        Swal.fire("Created!", "Department notice created successfully", "success");
      }

      resetForm();
      setActiveTab("1");
      fetchList();
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire("Error", err.response?.data?.message || "Failed to save notice", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        {/* Card Header with Tabs */}
        <CardHeader className="bg-white border-bottom py-3 px-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                style={{
                  width: 44,
                  height: 44,
                  background: "linear-gradient(135deg, #0a3d1f 0%, #1a6b3a 100%)"
                }}
              >
                <FaBuilding size={20} />
              </div>
              <div>
                <h4 className="mb-0 fw-bold text-white ">
                  {isHindi ? "विभाग सूचना प्रबंधन" : "Department Notice Management"}
                </h4>
                <small className="text-muted">
                  {isHindi
                    ? "महानदी भवन सूचनाओं का निर्माण, संपादन एवं प्रबंधन करें"
                    : "Create, edit and manage Mahanadi Bhavan Department notices"}
                </small>
              </div>
            </div>

            <Nav pills className="custom-admin-tabs">
              <NavItem>
                <NavLink
                  className={`px-3 py-2 fw-semibold rounded-3 cursor-pointer text-white ${activeTab === "1" ? "active bg-success text-white" : "text-secondary"}`}
                  onClick={() => setActiveTab("1")}
                  style={{ cursor: "pointer" }}
                >
                  <FaList className="me-2" />
                  {isHindi ? "सभी सूचनाएं" : "All Notices"} ({list.length})
                </NavLink>
              </NavItem>
              <NavItem className="ms-2">
                <NavLink
                  className={`px-3 py-2 fw-semibold rounded-3 cursor-pointer text-white ${activeTab === "2" ? "active bg-success text-white" : "text-secondary"}`}
                  onClick={editingId ? () => setActiveTab("2") : handleOpenCreate}
                  style={{ cursor: "pointer" }}
                >
                  <FaPlus className="me-2" />
                  {editingId ? (isHindi ? "सूचना संपादित करें" : "Edit Notice") : (isHindi ? "नई सूचना जोड़ें" : "Add Notice")}
                </NavLink>
              </NavItem>
            </Nav>
          </div>
        </CardHeader>

        <TabContent activeTab={activeTab}>
          {/* TAB 1: LIST VIEW */}
          <TabPane tabId="1">
            <CardBody className="p-4">
              {/* Search & Filter Toolbar */}
              <Row className="g-3 align-items-center mb-4">
                <Col xs={12} md={5}>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <FaSearch className="text-muted" />
                    </span>
                    <Input
                      type="text"
                      className="border-start-0 ps-0"
                      placeholder={isHindi ? "शीर्षक या स्लग द्वारा खोजें..." : "Search by title or slug..."}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    {searchTerm && (
                      <Button
                        color="light"
                        className="border"
                        onClick={() => setSearchTerm("")}
                      >
                        <FaTimes />
                      </Button>
                    )}
                  </div>
                </Col>

                <Col xs={12} sm={6} md={4}>
                  <Input
                    type="select"
                    value={filterCategory}
                    onChange={(e) => {
                      setFilterCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="">{isHindi ? "सभी श्रेणियां" : "All Categories"}</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {isHindi ? c.categoryNameHi : c.categoryNameEn}
                      </option>
                    ))}
                  </Input>
                </Col>

                <Col xs={12} sm={6} md={3} className="text-md-end">
                  <Button
                    color="success"
                    className="fw-semibold px-3 py-2 rounded-3 shadow-sm w-100 w-md-auto"
                    onClick={handleOpenCreate}
                  >
                    <FaPlus className="me-1.5" /> {isHindi ? "नई सूचना जोड़ें" : "Add Notice"}
                  </Button>
                </Col>
              </Row>

              {/* Table */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner color="success" />
                  <p className="text-muted mt-2 small">{isHindi ? "लोड हो रहा है..." : "Loading notices..."}</p>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 my-3">
                  <FaBuilding size={42} className="text-muted opacity-50 mb-3" />
                  <h6 className="text-muted fw-semibold">
                    {isHindi ? "कोई सूचना नहीं मिली" : "No department notices found"}
                  </h6>
                  <p className="text-muted small mb-3">
                    {searchTerm || filterCategory
                      ? (isHindi ? "फ़िल्टर साफ़ करके पुनः प्रयास करें" : "Try adjusting your search or filters")
                      : (isHindi ? "प्रारंभ करने के लिए 'नई सूचना जोड़ें' पर क्लिक करें" : "Click 'Add Notice' to create your first notice")}
                  </p>
                  {(searchTerm || filterCategory) && (
                    <Button
                      color="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterCategory("");
                      }}
                    >
                      {isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="table-responsive rounded-3 border">
                    <Table hover align="middle" className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: 60 }} className="text-center">#</th>
                          <th>{isHindi ? "शीर्षक (Title)" : "Title"}</th>
                          <th style={{ width: 170 }}>{isHindi ? "श्रेणी" : "Category"}</th>
                          <th style={{ width: 130 }}>{isHindi ? "दस्तावेज़" : "Attachment"}</th>
                          <th style={{ width: 100 }} className="text-center">{isHindi ? "स्थिति" : "Status"}</th>
                          <th style={{ width: 130 }} className="text-center">{isHindi ? "कार्रवाई" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.map((item, i) => (
                          <tr key={item._id}>
                            <td className="text-center text-muted fw-semibold">
                              {indexOfFirstItem + i + 1}
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{item.titleEn}</div>
                              {item.titleHi && (
                                <div className="text-secondary small">{item.titleHi}</div>
                              )}
                              <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
                                <code
                                  className="px-2 py-0.5 rounded bg-light border text-primary"
                                  style={{ fontSize: "11px", wordBreak: "break-all" }}
                                >
                                  {`${window.location.origin}/department-notice/${item.slug}`}
                                </code>
                                <Button
                                  size="sm"
                                  color={copiedId === item._id ? "success" : "light"}
                                  className="border py-0 px-1.5 d-inline-flex align-items-center gap-1"
                                  style={{ fontSize: "11px", height: "22px" }}
                                  onClick={() => handleCopyUrl(item.slug, item._id)}
                                  title={copiedId === item._id ? "Copied!" : "Copy Full URL"}
                                >
                                  {copiedId === item._id ? (
                                    <>
                                      <FaCheck size={10} /> <span style={{ fontSize: "10.5px" }}>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaCopy size={10} /> <span style={{ fontSize: "10.5px" }}>Copy</span>
                                    </>
                                  )}
                                </Button>
                                <a
                                  href={`/department-notice/${item.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-light border py-0 px-1.5 d-inline-flex align-items-center text-secondary"
                                  style={{ fontSize: "11px", height: "22px" }}
                                  title="Open in new tab"
                                >
                                  <FaExternalLinkAlt size={9} />
                                </a>
                              </div>
                            </td>
                            <td>
                              <Badge color="light" className="text-dark border px-2.5 py-1.5 rounded-pill">
                                {isHindi
                                  ? item.categoryId?.categoryNameHi || item.categoryId?.categoryNameEn || "N/A"
                                  : item.categoryId?.categoryNameEn || "N/A"}
                              </Badge>
                            </td>
                            <td>
                              {item.file ? (
                                <a
                                  href={`${API}${item.file}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary py-1 px-2 d-inline-flex align-items-center gap-1 rounded-2"
                                  style={{ fontSize: "12px" }}
                                >
                                  <FaDownload size={11} /> {isHindi ? "फ़ाइल" : "File"}
                                </a>
                              ) : (
                                <span className="text-muted small">—</span>
                              )}
                            </td>
                            <td className="text-center">
                              {item.isActive ? (
                                <Badge color="success" pill className="px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                                  <FaCheckCircle size={10} /> Active
                                </Badge>
                              ) : (
                                <Badge color="secondary" pill className="px-2.5 py-1.5 d-inline-flex align-items-center gap-1">
                                  <FaTimesCircle size={10} /> Inactive
                                </Badge>
                              )}
                            </td>
                            <td className="text-center">
                              <div className="d-inline-flex gap-1.5">
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-primary border"
                                  onClick={() => handleEdit(item)}
                                  title="Edit Notice"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  size="sm"
                                  color="light"
                                  className="text-danger border"
                                  onClick={() => handleDelete(item._id)}
                                  title="Delete Notice"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination & Count */}
                  <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
                    <small className="text-muted">
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredList.length)} of {filteredList.length} notices
                    </small>

                    {totalPages > 1 && (
                      <Pagination size="sm" className="mb-0">
                        <PaginationItem disabled={currentPage === 1}>
                          <PaginationLink first onClick={() => setCurrentPage(1)} />
                        </PaginationItem>
                        <PaginationItem disabled={currentPage === 1}>
                          <PaginationLink previous onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <PaginationItem key={p} active={p === currentPage}>
                            <PaginationLink onClick={() => setCurrentPage(p)}>{p}</PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem disabled={currentPage === totalPages}>
                          <PaginationLink next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                        </PaginationItem>
                        <PaginationItem disabled={currentPage === totalPages}>
                          <PaginationLink last onClick={() => setCurrentPage(totalPages)} />
                        </PaginationItem>
                      </Pagination>
                    )}
                  </div>
                </>
              )}
            </CardBody>
          </TabPane>

          {/* TAB 2: CREATE / EDIT FORM VIEW */}
          <TabPane tabId="2">
            <CardBody className="p-4">
              <Form onSubmit={handleSubmit}>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      type="button"
                      color="link"
                      onClick={goBackToList}
                      className="text-decoration-none p-0 fw-semibold text-secondary d-flex align-items-center gap-1.5"
                    >
                      <FaArrowLeft size={13} /> {isHindi ? "वापस सूची पर जाएं" : "Back to List"}
                    </Button>
                    <Badge color={editingId ? "warning" : "success"} className="px-3 py-2 rounded-pill ms-2">
                      {editingId ? (isHindi ? "संपादन मोड" : "Editing Notice") : (isHindi ? "नई प्रविष्टि" : "New Notice")}
                    </Badge>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="d-flex align-items-center gap-2">
                    {editingId && (
                      <Button
                        type="button"
                        color="outline-success"
                        size="sm"
                        onClick={handleOpenCreate}
                        className="d-flex align-items-center gap-1 fw-semibold py-1.5 px-3 rounded-3"
                      >
                        <FaPlus size={11} /> {isHindi ? "नया जोड़ें" : "Add New"}
                      </Button>
                    )}
                    <Button
                      type="button"
                      color="light"
                      className="border px-3 py-1.5 fw-semibold rounded-3 d-flex align-items-center gap-1"
                      onClick={goBackToList}
                      disabled={submitting}
                    >
                      <FaTimes className="me-1" /> {isHindi ? "रद्द करें" : "Cancel"}
                    </Button>
                    <Button
                      type="submit"
                      color="success"
                      className="px-3 py-1.5 fw-semibold shadow-sm rounded-3 d-flex align-items-center gap-1"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          {isHindi ? "सहेजा जा रहा है..." : "Saving..."}
                        </>
                      ) : (
                        <>
                          <FaSave className="me-1" />
                          {editingId ? (isHindi ? "अपडेट करें" : "Update Notice") : (isHindi ? "सूचना सहेजें" : "Create Notice")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Row className="g-3 mb-3">
                  {/* Title (English) */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "शीर्षक (अंग्रेज़ी)" : "Title (English)"} <span className="text-danger">*</span>
                      </Label>
                      <Input
                        required
                        type="text"
                        placeholder="Enter English Title"
                        value={formData.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            titleEn: val,
                            slug: editingId ? prev.slug : generateSlug(val)
                          }));
                        }}
                      />
                    </FormGroup>
                  </Col>

                  {/* Title (Hindi) */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "शीर्षक (हिन्दी)" : "Title (Hindi)"} <span className="text-danger">*</span>
                      </Label>
                      <Input
                        required
                        type="text"
                        placeholder="हिन्दी शीर्षक दर्ज करें"
                        value={formData.titleHi}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, titleHi: e.target.value }));
                        }}
                      />
                    </FormGroup>
                  </Col>

                  {/* Slug */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "स्लग (URL Path)" : "Slug (URL Path)"} <span className="text-danger">*</span>
                      </Label>
                      <Input
                        required
                        type="text"
                        placeholder="e.g. departmental-notification-2026"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      />
                      <small className="text-muted">Auto-generated from Title (English), editable</small>
                    </FormGroup>
                  </Col>

                  {/* Category */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "श्रेणी (Category)" : "Category"} <span className="text-danger">*</span>
                      </Label>
                      <Input
                        required
                        type="select"
                        value={formData.categoryId}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      >
                        <option value="">-- {isHindi ? "श्रेणी चुनें" : "Select Category"} --</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.categoryNameEn} {c.categoryNameHi ? `(${c.categoryNameHi})` : ""}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>

                  {/* Short Description (English) */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "संक्षिप्त विवरण (अंग्रेज़ी)" : "Short Description (English)"}
                      </Label>
                      <Input
                        type="textarea"
                        rows={2}
                        placeholder="Brief summary in English"
                        value={formData.shortDescriptionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescriptionEn: e.target.value }))}
                      />
                    </FormGroup>
                  </Col>

                  {/* Short Description (Hindi) */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "संक्षिप्त विवरण (हिन्दी)" : "Short Description (Hindi)"}
                      </Label>
                      <Input
                        type="textarea"
                        rows={2}
                        placeholder="संक्षिप्त सारांश हिन्दी में"
                        value={formData.shortDescriptionHi}
                        onChange={(e) => setFormData(prev => ({ ...prev, shortDescriptionHi: e.target.value }))}
                      />
                    </FormGroup>
                  </Col>

                  {/* File Upload (PDF / DOC) */}
                  <Col md={6}>
                    <FormGroup>
                      <Label className="fw-semibold text-dark">
                        {isHindi ? "दस्तावेज़ अपलोड (PDF / DOC - Max 10MB)" : "Upload File (PDF / DOC - Max 10MB)"}
                      </Label>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, file }));
                          }
                        }}
                      />
                      {formData.existingFile && !formData.file && (
                        <div className="mt-2 small text-muted d-flex align-items-center gap-2">
                          <FaFileAlt className="text-primary" />
                          <span>Current File:</span>
                          <a
                            href={`${API}${formData.existingFile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary text-decoration-none fw-semibold"
                          >
                            View Attachment
                          </a>
                        </div>
                      )}
                    </FormGroup>
                  </Col>

                  {/* IsActive Status */}
                  <Col md={6} className="d-flex align-items-center">
                    <FormGroup check className="mt-3">
                      <Input
                        id="deptIsActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      <Label check for="deptIsActive" className="fw-semibold ms-2 cursor-pointer">
                        {isHindi ? "सक्रिय रखें (Is Active)" : "Active (Visible on public portal)"}
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>

                {/* Rich Content: DynamicContentEditor */}
                <div className="mb-4">
                  <Label className="fw-bold text-dark fs-6 mb-2">
                    {isHindi ? "विस्तृत विवरण (Dynamic Editor - English & Hindi)" : "Detailed Description (Dynamic Editor - English & Hindi)"}
                  </Label>
                  <div className="border rounded-3 overflow-hidden p-1 bg-white">
                    <DynamicContentEditor
                      engField="descriptionEn"
                      hinField="descriptionHi"
                      height={380}
                      initialEn={formData.descriptionEn}
                      initialHi={formData.descriptionHi}
                      onChange={(contentObj) => {
                        setFormData(prev => ({
                          ...prev,
                          descriptionEn: contentObj.descriptionEn,
                          descriptionHi: contentObj.descriptionHi
                        }));
                      }}
                      instanceId="dept_notice_dynamic_editor"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                  <Button
                    type="button"
                    color="light"
                    className="border px-4 py-2 fw-semibold"
                    onClick={goBackToList}
                    disabled={submitting}
                  >
                    <FaTimes className="me-1.5" /> {isHindi ? "रद्द करें" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    color="success"
                    className="px-4 py-2 fw-semibold shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        {isHindi ? "सहेजा जा रहा है..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1.5" />
                        {editingId ? (isHindi ? "अपडेट करें" : "Update Notice") : (isHindi ? "सूचना सहेजें" : "Create Notice")}
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </TabPane>
        </TabContent>
      </Card>
    </div>
  );
};

export default DepartmentNoticeManagement;
