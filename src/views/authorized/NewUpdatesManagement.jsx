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
  Badge, Col, Row, CardHeader, Pagination, PaginationItem, PaginationLink, Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBullhorn, FaList, FaPlusCircle, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import apiClient from "@apiService";

const NewUpdates = () => {
  
  const token = sessionStorage.getItem("authToken");
  const [list, setList] = useState([]);
  
  // Use consistent keys for sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem("newUpdateActiveTab") || "1";
  });
  
  const [editingId, setEditingId] = useState(() => {
    const saved = sessionStorage.getItem("newUpdateEditingId");
    return saved ? JSON.parse(saved) : null;
  });
  
  const initialState = {
    titleEng: "",
    titleHin: "",
    link: "",
    isExternal: false,
    openInNewTab: false,
    displayOrder: "",
    isActive: false,
  };
  
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem("newUpdateFormData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch {
        return initialState;
      }
    }
    return initialState;
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentData = list.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(list.length / itemsPerPage);

  /* ================= LOAD LIST ================= */
  const loadNotices = async () => {
    try {
      const res = await apiClient.get('/notice-ticker/list-all');
      setList(res.data?.data || res.data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load notices", "error");
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("newUpdateActiveTab", activeTab);
  }, [activeTab]);

  // Save editing ID to sessionStorage
  useEffect(() => {
    if (editingId) {
      sessionStorage.setItem("newUpdateEditingId", JSON.stringify(editingId));
    } else {
      sessionStorage.removeItem("newUpdateEditingId");
    }
  }, [editingId]);

  // Save form data to sessionStorage whenever it changes
  useEffect(() => {
    const hasData = formData.titleEng || formData.titleHin || formData.link || 
                    formData.displayOrder;
    
    if (hasData || editingId) {
      sessionStorage.setItem("newUpdateFormData", JSON.stringify(formData));
    } else {
      sessionStorage.removeItem("newUpdateFormData");
    }
  }, [formData, editingId]);

  /* ================= RESET FORM ================= */
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titleEng: "",
      titleHin: "",
      link: "",
      isExternal: false,
      openInNewTab: false,
      displayOrder: "",
      isActive: false,
    });
    sessionStorage.removeItem("newUpdateEditingId");
    sessionStorage.removeItem("newUpdateFormData");
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEng: item.titleEng,
      titleHin: item.titleHin || "",
      link: item.link,
      isExternal: item.isExternal,
      openInNewTab: item.openInNewTab,
      displayOrder: item.displayOrder,
      isActive: item.isActive ? true : false
    });
    setActiveTab("2");
  };

  /* ================= DELETE (SOFT) ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Notice?",
      text: "This notice will be hidden from the website",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await apiClient.delete(`/notice-ticker/delete/${id}`);
      Swal.fire("Success", res.data?.message || "Deleted", "success");
      loadNotices();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  const isNoticeNew = (createdAt) => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffDays = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titleEng || !formData.link) {
      Swal.fire("Required", "Title (English) and Link are required", "warning");
      return;
    }

    try {
      let res;

      if (editingId) {
        res = await apiClient.put(`/notice-ticker/update/${editingId}`, formData);
      } else {
        res = await apiClient.post('/notice-ticker/create', formData);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      loadNotices();
      resetForm();
      setActiveTab("1");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
    }
  };

  /* ================= BACK TO LIST ================= */
  const goBackToList = () => {
    resetForm();
    setActiveTab("1");
  };

  /* ================= ADD NEW NOTICE ================= */
  const handleAddNew = () => {
    resetForm();
    setActiveTab("2");
  };

  /* ================= HANDLE TAB CHANGE ================= */
  const handleTabChange = (tab) => {
    if (tab === "1") {
      resetForm();
    } else if (tab === "2" && !editingId) {
      resetForm();
    }
    setActiveTab(tab);
  };

  /* ================= UI ================= */
  return (
    <Card>
      {/* HEADER */}
      <CardHeader >
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h3 className="mb-1 text-white" >
              <FaBullhorn className="me-2 text-danger" />
              Notice Ticker Management
            </h3>
            <small style={{ opacity: 1.85 }} className="text-shadow text-warning" fontSize={14}>
              New Update Slider on Home Page
            </small>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Badge
              pill
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: 500,
                backdropFilter: "blur(5px)",
              }}
            >
              Total: {list.length}
            </Badge>
            {activeTab === "1" && (
              <Button
                onClick={handleAddNew}
                style={{
                  background: "#fff",
                  color: "#0f766e",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <FaPlus className="me-2" />
                Add Notice
              </Button>
            )}
          </div>
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
            <div className="table-responsive">
              <Table responsive hover className="align-middle mb-0">
                <thead className="bg-light border-bottom border-2">
                  <tr>
                    <th className="py-3 px-3 text-secondary-emphasis small fw-semibold">S.No</th>
                    <th className="py-3 text-secondary-emphasis small fw-semibold">Title</th>
                    <th className="py-3 text-center text-secondary-emphasis small fw-semibold">Order</th>
                    <th className="py-3 text-center text-secondary-emphasis small fw-semibold">Type</th>
                    <th className="py-3 text-center text-secondary-emphasis small fw-semibold">Status</th>
                    <th className="py-3 text-center text-secondary-emphasis small fw-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
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
                    currentData.map((n, i) => (
                      <tr key={n._id} className="border-bottom">
                        <td className="py-3 px-3 align-middle">
                          <strong>{indexOfFirstItem + i + 1}</strong>
                        </td>

                        <td className="py-3 align-middle">
                          <div className="text-truncate fw-semibold" style={{ maxWidth: "400px" }}>
                            {n.titleEng}
                          </div>
                          {n.titleHin && (
                            <div className="text-truncate text-muted small mt-1" style={{ maxWidth: "400px" }}>
                              {n.titleHin}
                            </div>
                          )}
                        </td>

                        <td className="py-3 align-middle text-center">
                          <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-2 fw-bold border border-warning">
                            {n.displayOrder || 'N/A'}
                          </span>
                        </td>

                        <td className="py-3 align-middle text-center">
                          {isNoticeNew(n.createdAt) ? (
                            <span className="badge bg-primary rounded-pill px-3 py-2 fw-bold shadow-sm">
                              NEW
                            </span>
                          ) : (
                            <span className="badge bg-secondary rounded-pill px-3 py-2 fw-bold">
                              OLD
                            </span>
                          )}
                        </td>

                        <td className="text-center align-middle">
                          <span
                            className={`badge rounded-pill px-3 py-2 fw-semibold small ${n.isActive
                                ? "bg-success-subtle text-success border border-success-subtle"
                                : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                              }`}
                          >
                            {n.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>

                        <td className="py-3 align-middle text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <Button
                              color="light"
                              size="sm"
                              outline
                              onClick={() => handleEdit(n)}
                              className="rounded rounded-pill outline outline-primary border border-primary text-primary d-flex align-items-center justify-content-center"
                              style={{ width: "50px", height: "50px" }}
                              title="Edit"
                            >
                              <FaEdit size={18} />
                            </Button>

                            <Button
                              color="light"
                              size="sm"
                              outline
                              onClick={() => handleDelete(n._id)}
                              className="rounded rounded-pill outline outline-danger border border-danger text-danger d-flex align-items-center justify-content-center"
                              style={{ width: "50px", height: "50px" }}
                              title="Delete"
                            >
                              <FaTrash size={18} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {list.length > 0 && (
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
                <div className="text-muted small">
                  Showing {indexOfFirstItem + 1} -
                  {Math.min(indexOfLastItem, list.length)} of {list.length}
                </div>

                <Pagination>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                      previous
                      onClick={() => setCurrentPage((p) => p - 1)}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, index) => (
                    <PaginationItem
                      key={index}
                      active={currentPage === index + 1}
                    >
                      <PaginationLink
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                      next
                      onClick={() => setCurrentPage((p) => p + 1)}
                    />
                  </PaginationItem>
                </Pagination>
              </div>
            )}
          </CardBody>
        </TabPane>

        {/* TAB 2 - FORM VIEW */}
        <TabPane tabId="2">
          <CardBody>
            {/* Back to List Button */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <Button
                color="link"
                onClick={goBackToList}
                className="text-decoration-none p-0"
                style={{ fontWeight: 500 }}
              >
                <FaArrowLeft className="me-2" />
                Back to List
              </Button>
              {editingId && (
                <Button
                  color="primary"
                  size="sm"
                  onClick={handleAddNew}
                >
                  <FaPlus className="me-1" />
                  Add New
                </Button>
              )}
            </div>

            <Form onSubmit={handleSubmit}>
              <div className="p-4">
                <h5 className="mb-4">
                  {editingId ? "✏️ Edit Notice" : "➕ Add New Notice"}
                </h5>

                {/* Title Section */}
                <div className="mb-4">
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-semibold mb-2">
                          Title (English) <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="Enter English title"
                          value={formData.titleEng}
                          onChange={e => setFormData({ ...formData, titleEng: e.target.value })}
                          required
                          className="border-2 rounded-3 py-2"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                        <small className="text-muted">English title will be displayed on website</small>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-semibold mb-2">
                          Title (Hindi) <span className="text-muted">(Optional)</span>
                        </Label>
                        <Input
                          type="text"
                          placeholder="हिंदी शीर्षक दर्ज करें"
                          value={formData.titleHin}
                          onChange={e => setFormData({ ...formData, titleHin: e.target.value })}
                          className="border-2 rounded-3 py-2"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                        <small className="text-muted">Hindi title for bilingual support</small>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                {/* Link Section */}
                <div className="mb-4">
                  <Row>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-semibold mb-2">
                          Link URL <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={formData.link}
                          onChange={e => setFormData({ ...formData, link: e.target.value })}
                          required
                          className="border-2 rounded-3 py-2"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                        <small className="text-muted">Enter full URL including https://</small>
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-semibold mb-2">
                          Display Order
                        </Label>
                        <Input
                          type="number"
                          placeholder="Enter display order"
                          value={formData.displayOrder}
                          onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                          className="border-2 rounded-3 py-2"
                          style={{ borderColor: "#e2e8f0" }}
                        />
                        <small className="text-muted">Lower numbers appear first</small>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    {/* External Link Radio Buttons */}
                    <Col md={6}>
                      <div className="mb-3">
                        <Label className="fw-semibold mb-2 d-block">External Link</Label>
                        <div className="d-flex gap-4">
                          <FormGroup check className="me-4">
                            <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                              <Input
                                type="radio"
                                name="isExternal"
                                checked={formData.isExternal === false}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isExternal: false,
                                    openInNewTab: false
                                  })
                                }
                                className="form-check-input"
                              />
                              <span className="badge bg-light text-dark px-3 py-2 rounded-pill">
                                No
                              </span>
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                              <Input
                                type="radio"
                                name="isExternal"
                                checked={formData.isExternal === true}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isExternal: true,
                                  })
                                }
                                className="form-check-input"
                              />
                              <span className="badge bg-primary px-3 py-2 rounded-pill">
                                Yes
                              </span>
                            </Label>
                          </FormGroup>
                        </div>
                      </div>
                    </Col>

                    {/* Open in New Tab - Only shows when External Link is Yes */}
                    {formData.isExternal && (
                      <Col md={6}>
                        <div className="mb-3">
                          <Label className="fw-semibold mb-2 d-block">Open in New Tab</Label>
                          <div className="d-flex gap-4">
                            <FormGroup check className="me-4">
                              <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                                <Input
                                  type="radio"
                                  name="openInNewTab"
                                  checked={formData.openInNewTab === false}
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      openInNewTab: false
                                    })
                                  }
                                  className="form-check-input"
                                />
                                <span className="badge bg-secondary px-3 py-2 rounded-pill">
                                  No
                                </span>
                              </Label>
                            </FormGroup>
                            <FormGroup check>
                              <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                                <Input
                                  type="radio"
                                  name="openInNewTab"
                                  checked={formData.openInNewTab === true}
                                  onChange={() =>
                                    setFormData({
                                      ...formData,
                                      openInNewTab: true
                                    })
                                  }
                                  className="form-check-input"
                                />
                                <span className="badge bg-info px-3 py-2 rounded-pill text-white">
                                  Yes
                                </span>
                              </Label>
                            </FormGroup>
                          </div>
                        </div>
                      </Col>
                    )}
                    <Col md={6}>
                      <FormGroup className="mb-3">
                        <Label className="fw-semibold mb-2 d-block">Status</Label>
                        <div className="d-flex gap-4">
                          <FormGroup check className="me-4">
                            <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                              <Input
                                type="radio"
                                name="isActive"
                                checked={formData.isActive === true}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isActive: true
                                  })
                                }
                                className="form-check-input"
                              />
                              <span className="badge bg-success px-3 py-2 rounded-pill">
                                ✅ Active
                              </span>
                            </Label>
                          </FormGroup>
                          <FormGroup check>
                            <Label check className="d-flex align-items-center gap-2 cursor-pointer">
                              <Input
                                type="radio"
                                name="isActive"
                                checked={formData.isActive === false}
                                onChange={() =>
                                  setFormData({
                                    ...formData,
                                    isActive: false
                                  })
                                }
                                className="form-check-input"
                              />
                              <span className="badge bg-danger px-3 py-2 rounded-pill">
                                ⛔ Inactive
                              </span>
                            </Label>
                          </FormGroup>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                {/* Form Actions */}
                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Button color="secondary" onClick={goBackToList}>
                    <FaTimes className="me-2" />
                    Cancel
                  </Button>
                  <Button color="primary" type="submit">
                    <FaSave className="me-2" />
                    {editingId ? "Update Notice" : "Save Notice"}
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

export default NewUpdates;