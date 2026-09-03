import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
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
  CardHeader,
  Pagination,
  PaginationItem,
  PaginationLink,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaList, FaPlusCircle, FaSave, FaTimes, FaArrowLeft, FaBullhorn, FaCopy, FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";

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

const DirectorateNoticeManagement = () => {
  const API = import.meta.env.VITE_API_URL;
  const token = getToken();
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("directorateActiveTab") || "1";
  });
  const [editingId, setEditingId] = useState(() => {
    const saved = sessionStorage.getItem("directorateEditingId");
    return saved ? JSON.parse(saved) : null;
  });

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

  // Get saved form data from sessionStorage
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("directorateFormData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Don't restore file from sessionStorage
        return { ...parsed, file: null };
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyUrl = (slug, id) => {
    const fullUrl = `${window.location.origin}/directorate-notice/${slug}`;
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

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  /* ================= FETCH DATA ================= */
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-directorate-notice-all`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setList(res.data.data || []);
      setCurrentPage(1);
    } catch {
      Swal.fire("Error", "Failed to load notices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setLoading(true);
      try {
        const [noticesRes, catRes] = await Promise.allSettled([
          axios.get(`${API}/api/get-directorate-notice-all`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/api/get-categories`)
        ]);

        if (!isMounted) return;

        if (noticesRes.status === "fulfilled") {
          setList(noticesRes.value.data?.data || []);
        } else {
          Swal.fire("Error", "Failed to load notices", "error");
        }

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.data?.data || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, [API, token]);

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("directorateActiveTab", activeTab);
  }, [activeTab]);

  // Save editing ID to sessionStorage
  useEffect(() => {
    if (editingId) {
      sessionStorage.setItem("directorateEditingId", JSON.stringify(editingId));
    } else {
      sessionStorage.removeItem("directorateEditingId");
    }
  }, [editingId]);

  // Save form data to sessionStorage whenever it changes (except file)
  useEffect(() => {
    // Only save if there's data to save (not empty form) or in edit mode
    const hasData = formData.titleEn || formData.titleHi || formData.slug ||
      formData.shortDescriptionEn || formData.shortDescriptionHi ||
      formData.descriptionEn || formData.descriptionHi ||
      formData.categoryId;

    if (hasData || editingId) {
      const dataToSave = { ...formData };
      delete dataToSave.file; // Don't save file object
      sessionStorage.setItem("directorateFormData", JSON.stringify(dataToSave));
    } else {
      sessionStorage.removeItem("directorateFormData");
    }
  }, [formData, editingId]);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    // Clear editing state
    setEditingId(null);
    // Reset form to initial state
    setFormData({ ...initialState });
    // Clear session storage
    sessionStorage.removeItem("directorateEditingId");
    sessionStorage.removeItem("directorateFormData");
  };

  /* ================= BACK TO LIST ================= */
  const goBackToList = () => {
    resetForm();
    setActiveTab("1");
  };

  /* ================= ADD NEW NOTICE ================= */
  // const handleAddNew = () => {
  //   // First reset everything
  //   setEditingId(null);
  //   setFormData({ ...initialState });
  //   sessionStorage.removeItem("directorateEditingId");
  //   sessionStorage.removeItem("directorateFormData");
  //   // Then switch to form tab
  //   setActiveTab("2");

  // };
  const handleAddNew = () => {
    sessionStorage.removeItem("directorateEditingId");
    sessionStorage.removeItem("directorateFormData");

    window.location.reload();
    setActiveTab("2");
  };
  /* ================= EDIT ================= */
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
      categoryId: item.categoryId?._id || "",
      file: null,
      isActive: item.isActive !== false
    };
    setFormData(newFormData);
    setActiveTab("2");
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
        { headers: { Authorization: `Bearer ${getToken()}` } }
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
              Authorization: `Bearer ${getToken()}`
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
              Authorization: `Bearer ${getToken()}`
            }
          }
        );
        Swal.fire("Created!", "Notice created successfully", "success");
      }

      resetForm();
      setActiveTab("1");
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

  /* ================= HANDLE TAB CHANGE ================= */
  const handleTabChange = (tab) => {
    if (tab === "1") {
      resetForm();
    } else if (tab === "2") {
      // If switching to form tab and not editing, reset form
      if (!editingId) {
        resetForm();
      }
    }
    setActiveTab(tab);
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
          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink first onClick={() => handlePageChange(1)} />
          </PaginationItem>

          <PaginationItem disabled={currentPage === 1}>
            <PaginationLink previous onClick={() => handlePageChange(currentPage - 1)} />
          </PaginationItem>

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

          {pages.map((page) => (
            <PaginationItem key={page} active={page === currentPage}>
              <PaginationLink onClick={() => handlePageChange(page)}>
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
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem disabled={currentPage === totalPages}>
            <PaginationLink next onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>

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
        <div className="d-flex justify-content-between align-items-center p-2">
           
          <h4 className="mb-0"> <FaBullhorn className="me-2 " /> Directorate Notices</h4>
          {activeTab === "1" && (
            <Button color="light" className="text-success" onClick={handleAddNew}>
              <FaPlus /> Add Notice
            </Button>
          )}
        </div>
      </CardHeader>

      {/* TABS */}
      <Nav tabs className="px-3 pt-3">
        <NavItem>
          <NavLink
            active={activeTab === "1"}
            onClick={() => handleTabChange("1")}
            style={{ cursor: "pointer" }}
          >
            <FaList className="me-2" />
            List View
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={activeTab === "2"}
            onClick={() => handleTabChange("2")}
            style={{ cursor: "pointer" }}
          >
            <FaPlusCircle className="me-2" />
            {editingId ? "Edit Notice" : "Add Notice"}
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        {/* TAB 1 - LIST VIEW */}
        <TabPane tabId="1">
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
                            <Button
                              color="primary"
                              className="mt-3"
                              onClick={handleAddNew}
                            >
                              <FaPlus className="me-2" />
                              Add Your First Notice
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentData.map((item, i) => (
                        <tr key={item._id}>
                          <td>{indexOfFirstItem + i + 1}</td>
                          <td>
                            <div className="fw-semibold">{item.titleEn}</div>
                            {item.titleHi && (
                              <div className="text-secondary small">{item.titleHi}</div>
                            )}
                            <div className="d-flex align-items-center gap-1 mt-1 flex-wrap">
                              <code
                                className="px-2 py-0.5 rounded bg-light border text-primary"
                                style={{ fontSize: "11px", wordBreak: "break-all" }}
                              >
                                {`${window.location.origin}/directorate-notice/${item.slug}`}
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
                                href={`/directorate-notice/${item.slug}`}
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
          </CardBody>
        </TabPane>

        {/* TAB 2 - FORM VIEW */}
        <TabPane tabId="2">
          <CardBody>
            <Form onSubmit={handleSubmit}>
              {/* Back to List & Top Action Buttons */}
              <div className="mb-4 pb-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <Button
                    type="button"
                    color="link"
                    onClick={goBackToList}
                    className="text-decoration-none p-0 fw-semibold text-secondary d-flex align-items-center"
                  >
                    <FaArrowLeft className="me-2" />
                    Back to List
                  </Button>
                  <Badge color={editingId ? "warning" : "success"} className="px-3 py-2 rounded-pill ms-2">
                    {editingId ? "Editing Notice" : "New Notice"}
                  </Badge>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {editingId && (
                    <Button
                      type="button"
                      color="outline-primary"
                      size="sm"
                      onClick={handleAddNew}
                      className="d-flex align-items-center gap-1 fw-semibold py-1.5 px-3 rounded-3"
                    >
                      <FaPlus size={11} className="me-1" />
                      Add New
                    </Button>
                  )}
                  <Button
                    type="button"
                    color="light"
                    className="border px-3 py-1.5 fw-semibold rounded-3 d-flex align-items-center gap-1"
                    onClick={goBackToList}
                    disabled={submitting}
                  >
                    <FaTimes className="me-1" /> Cancel
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-1" />
                        {editingId ? "Update Notice" : "Create Notice"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-1">
                {/* Titles */}
                <Row>
                  <Col md={6}>
                    <FormGroup>
                      <Label>Title (English) <span className="text-danger">*</span></Label>
                      <Input
                        required
                        value={formData.titleEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({
                            ...formData,
                            titleEn: val,
                            slug: editingId ? formData.slug : generateSlug(val)
                          });
                        }}
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
                      <Input 
                        name="slug"
                        value={formData.slug} 
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                      <small className="text-muted">Auto-generated from title (Editable)</small>
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

                {/* Rich Description: DynamicContentEditor */}
                <div className="mb-4">
                  <Label className="fw-bold text-dark fs-6 mb-2">
                    Detailed Description (Dynamic Editor - English & Hindi)
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
                      instanceId="directorate_notice_dynamic_editor"
                    />
                  </div>
                </div>

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

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Button color="secondary" onClick={goBackToList} disabled={submitting}>
                    <FaTimes className="me-2" />
                    Cancel
                  </Button>
                  <Button color="primary" type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        {editingId ? "Update" : "Create"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          </CardBody>
        </TabPane>
      </TabContent>
    </Card>
  );
};

export default DirectorateNoticeManagement;