// AboutAndHelp.jsx - Professional CMS Main Page with List & Edit Features
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Badge,
  Progress,
  Alert,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";
import "../../css/aboutAndHelp.css";

const API = import.meta.env.VITE_API_URL;

const AboutAndHelp = () => {
  // ==================== STATE MANAGEMENT ====================
  const [currentView, setCurrentView] = useState("list"); // "list" or "form"
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    titleEn: "",
    titleHi: "",
    shortDescriptionEn: "",
    shortDescriptionHi: "",
    descriptionEn: "",
    descriptionHi: "",
    categoryId: "",
    fromDate: "",
    expirydate: "",
    link: "",
    isActive: true,
  });

  function formatDateForInput(isoDate) {
    return isoDate ? isoDate.split("T")[0] : "";
  }

  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [contents, setContents] = useState([]);
  const [savedContentList, setSavedContentList] = useState([]);
  const [viewMode, setViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  console.log(contents, "Getting Contents");

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    fetchPages();
    fetchCategories();
    fetchSavedContent();
  }, []);

  // console.log(savedContentList[0]?.contents, "Getting content list");

  // ==================== API CALLS ====================
  const fetchPages = async () => {
    try {
      const res = await axios.get(`${API}api/menu-list`);
      setPages(extractPages(res.data.data || []));
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const extractPages = (menus, list = []) => {
    menus.forEach((m) => {
      list.push({ _id: m._id, titleEn: m.titleEng, titleHi: m.titleHi });
      if (m.submenu?.length) extractPages(m.submenu, list);
    });
    return list;
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}api/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSavedContent = async () => {
    try {
      const res = await axios.get(`${API}api/get-about-and-help`);
      setSavedContentList(res.data.data || res.data || []);
      setContents(res.data.data[0].contents);
    } catch (error) {
      console.error("Error fetching saved content:", error);
    }
  };

  // ==================== FORM HANDLERS ====================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validateForm = () => {
    if (!form.titleEn || !form.titleHi) {
      alert("⚠️ Please fill in both English and Hindi titles");
      return false;
    }
    if (!selectedPage) {
      alert("⚠️ Please select a page");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setSaveStatus(null);

    try {
      const formData = new FormData();

      // 1️⃣ Append simple form fields
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      formData.append("selectedPage", selectedPage);

      // 2️⃣ Prepare CONTENTS (WITHOUT FILE OBJECTS)
      const contentsPayload = contents.map((item) => {
        const cleanItem = { ...item };

        // remove file objects before JSON stringify
        delete cleanItem.file;
        delete cleanItem.imageFile;

        return cleanItem;
      });

      formData.append("contents", JSON.stringify(contentsPayload));

      // 3️⃣ Append files separately (index-safe)
      contents.forEach((item, index) => {
        if (item.file) {
          formData.append(`files[${index}]`, item.file);
        }
        if (item.imageFile) {
          formData.append(`files[${index}]`, item.imageFile);
        }
      });

      // 4️⃣ API call
      const url = editMode
        ? `${API}api/about-and-help/${editingId}`
        : `${API}api/about-and-help`;

      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus(null);
        handleBackToList();
      }, 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const [selectedContent, setSelectedContent] = useState({});

  const handleEdit = async (item) => {
    const res = await axios.get(`${API}api/get-about-and-help/${item._id}`);
    // console.log("geting somthing adslkfjalkdsjfklajsdlfkjaslkdjf ladsfjl",res.data);
    
    setSelectedContent(res.data.contents);

    setEditMode(true);
    setEditingId(item._id);
    setForm({
      titleEn: item.titleEn || "",
      titleHi: item.titleHi || "",
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionHi: item.shortDescriptionHi || "",
      descriptionEn: item.descriptionEn || "",
      descriptionHi: item.descriptionHi || "",
      categoryId: item.categoryId || "",
      fromDate: item.fromDate || "",
      expirydate: item.expirydate || "",
      link: item.link || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setSelectedPage(item.selectedPage || "");

    

    setContents(item.content || item.contents || []);
    setCurrentView("form");
    setActiveTab("1");
  };

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API}api/about-and-help/${id}`);
      setSavedContentList((prev) => prev.filter((item) => item._id !== id));

      setDeleteModal(false);
      setDeleteId(null);
      alert("✅ Content deleted successfully");
    } catch (error) {
      console.error("Error deleting content:", error);
      alert("❌ Error deleting content");
    }
  };

  const handleDraft = () => {
    const draft = {
      form,
      selectedPage,
      contents,
      editMode,
      editingId,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cms_draft", JSON.stringify(draft));
    alert("✅ Draft saved to browser storage");
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("cms_draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setForm(parsed.form);
      setSelectedPage(parsed.selectedPage);
      setContents(parsed.contents);
      setEditMode(parsed.editMode || false);
      setEditingId(parsed.editingId || null);
      setCurrentView("form");
      alert("✅ Draft loaded successfully");
    } else {
      alert("ℹ️ No draft found");
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setEditMode(false);
    setEditingId(null);
    setCurrentView("form");
  };

  const handleBackToList = () => {
    resetForm();
    setCurrentView("list");
    fetchSavedContent();
  };

  const resetForm = () => {
    if (
      currentView === "form" &&
      (form.titleEn || form.titleHi || contents.length > 0)
    ) {
      if (!confirm("Are you sure you want to reset all fields?")) return;
    }
    setForm({
      titleEn: "",
      titleHi: "",
      shortDescriptionEn: "",
      shortDescriptionHi: "",
      descriptionEn: "",
      descriptionHi: "",
      categoryId: "",
      fromDate: "",
      expirydate: "",
      link: "",
      isActive: true,
    });
    setSelectedPage("");
    setContents([]);
    setActiveTab("1");
    setEditMode(false);
    setEditingId(null);
    localStorage.removeItem("cms_draft");
  };

  const getCompletionPercentage = () => {
    let completed = 0,
      total = 5;
    if (form.titleEn && form.titleHi) completed++;
    if (selectedPage) completed++;
    if (contents.length > 0) completed++;
    if (form.shortDescriptionEn || form.shortDescriptionHi) completed++;
    if (form.descriptionEn || form.descriptionHi) completed++;
    return Math.round((completed / total) * 100);
  };

  // ==================== RENDER LIST VIEW ====================
  const renderListView = () => (
    <div className="cms-container">
      <div className="cms-wrapper">
        <div className="cms-header">
          <Row className="align-items-center">
            <Col md={6}>
              <div className="d-flex align-items-center">
                <div className="cms-icon-wrapper">
                  <i className="bi bi-list-check"></i>
                </div>
                <div>
                  <h4 className="mb-0">Content Management</h4>
                  <small className="text-muted">
                    Manage About & Help Content
                  </small>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-end">
              <Button color="success" size="lg" onClick={handleCreateNew}>
                <i className="bi bi-plus-circle me-2"></i>Create New Content
              </Button>
            </Col>
          </Row>
        </div>

        <Card className="cms-card shadow-lg">
          <CardBody className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4">Title (English)</th>
                    <th>Title (Hindi)</th>
                    <th>Category</th>
                    <th>Page</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-end px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedContentList.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5">
                        <div className="text-muted">
                          <i className="bi bi-inbox display-4 d-block mb-3"></i>
                          <h5>No Content Found</h5>
                          <p className="mb-3">
                            Start by creating your first content entry
                          </p>
                          <Button color="success" onClick={handleCreateNew}>
                            <i className="bi bi-plus-circle me-2"></i>Create
                            Content
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    savedContentList.map((item) => {
                      const category = categories.find(
                        (c) => c._id === item.categoryId
                      );
                      const page = pages.find(
                        (p) => p._id === item.selectedPage
                      );
                      return (
                        <tr key={item._id}>
                          <td className="px-4">
                            <div>
                              <strong>{item.titleEn}</strong>
                              {item.shortDescriptionEn && (
                                <>
                                  <br />
                                  <small className="text-muted">
                                    {item.shortDescriptionEn.substring(0, 60)}
                                    {item.shortDescriptionEn.length > 60
                                      ? "..."
                                      : ""}
                                  </small>
                                </>
                              )}
                            </div>
                          </td>
                          <td>{item.titleHi || "-"}</td>
                          <td>
                            {category ? (
                              <Badge color="info">
                                {category.name || category.title}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>{page ? <small>{page.titleEn}</small> : "-"}</td>
                          <td>
                            <Badge
                              color={item.isActive ? "success" : "secondary"}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleDateString()
                                : "-"}
                            </small>
                          </td>
                          <td className="text-end px-4">
                            <div className="btn-group">
                              <Button
                                color="primary"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                              <Button
                                color="danger"
                                size="sm"
                                onClick={() => {
                                  setDeleteId(item._id);
                                  setDeleteModal(true);
                                }}
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // ==================== RENDER FORM VIEW ====================
  const renderFormView = () => (
    <div className="cms-container">
      <div className="cms-wrapper">
        <div className="cms-header">
          <Row className="align-items-center">
            <Col md={4}>
              <div className="d-flex align-items-center">
                <Button
                  color="link"
                  onClick={handleBackToList}
                  className="me-3 p-0"
                  style={{ fontSize: "1.5rem" }}
                >
                  <i className="bi bi-arrow-left"></i>
                </Button>
                <div className="cms-icon-wrapper">
                  <i className="bi bi-gear-fill"></i>
                </div>
                <div>
                  <h4 className="mb-0">
                    {editMode ? "Edit Content" : "Create New Content"}
                  </h4>
                  <small className="text-muted">
                    {editMode
                      ? `Editing: ${form.titleEn || "Untitled"}`
                      : "Fill in the details below"}
                  </small>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="completion-badge">
                <small className="text-muted d-block mb-1">
                  Form Completion
                </small>
                <Progress
                  value={getCompletionPercentage()}
                  className="mb-1"
                  style={{ height: "8px" }}
                >
                  {getCompletionPercentage()}%
                </Progress>
                <Badge
                  color={
                    getCompletionPercentage() === 100 ? "success" : "warning"
                  }
                >
                  {getCompletionPercentage()}% Complete
                </Badge>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <div className="btn-group">
                <Button
                  color={viewMode ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => setViewMode(!viewMode)}
                >
                  <i
                    className={`bi bi-${viewMode ? "pencil" : "eye"} me-1`}
                  ></i>
                  {viewMode ? "Edit" : "Preview"}
                </Button>
                <Button
                  color="outline-secondary"
                  size="sm"
                  onClick={handleDraft}
                >
                  <i className="bi bi-save me-1"></i> Draft
                </Button>
                <Button color="outline-secondary" size="sm" onClick={loadDraft}>
                  <i className="bi bi-folder-open me-1"></i> Load
                </Button>
                <Button color="outline-danger" size="sm" onClick={resetForm}>
                  <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {saveStatus && (
          <Alert
            color={saveStatus === "success" ? "success" : "danger"}
            className="mb-3"
          >
            <i
              className={`bi bi-${
                saveStatus === "success" ? "check-circle" : "x-circle"
              } me-2`}
            ></i>
            {saveStatus === "success"
              ? `✅ Content ${editMode ? "updated" : "saved"} successfully!`
              : "❌ Error saving content. Please try again."}
          </Alert>
        )}

        <Card className="cms-card shadow-lg">
          <CardBody className="p-0">
            <Nav tabs className="cms-tabs">
              <NavItem>
                <NavLink
                  className={activeTab === "1" ? "active" : ""}
                  onClick={() => setActiveTab("1")}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  <span>Basic Information</span>
                  {form.titleEn && form.titleHi && (
                    <Badge color="success" className="ms-2">
                      ✓
                    </Badge>
                  )}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "2" ? "active" : ""}
                  onClick={() => setActiveTab("2")}
                >
                  <i className="bi bi-file-richtext me-2"></i>
                  <span>Content Blocks</span>
                  {contents.length > 0 && (
                    <Badge color="success" className="ms-2">
                      {contents.length}
                    </Badge>
                  )}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={activeTab === "3" ? "active" : ""}
                  onClick={() => setActiveTab("3")}
                >
                  <i className="bi bi-card-text me-2"></i>
                  <span>Descriptions</span>
                  {(form.shortDescriptionEn || form.descriptionEn) && (
                    <Badge color="success" className="ms-2">
                      ✓
                    </Badge>
                  )}
                </NavLink>
              </NavItem>
            </Nav>

            <div className="cms-content">
              <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                  <div className="content-section">
                    <h5 className="section-title">
                      <i className="bi bi-card-heading me-2"></i>Title
                      Information
                    </h5>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="titleEn" className="required-field">
                            Title (English)
                          </Label>
                          <Input
                            id="titleEn"
                            name="titleEn"
                            value={form.titleEn}
                            onChange={handleChange}
                            placeholder="Enter English title"
                            disabled={viewMode}
                            bsSize="lg"
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="titleHi" className="required-field">
                            Title (Hindi)
                          </Label>
                          <Input
                            id="titleHi"
                            name="titleHi"
                            value={form.titleHi}
                            onChange={handleChange}
                            placeholder="हिंदी शीर्षक दर्ज करें"
                            disabled={viewMode}
                            bsSize="lg"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="content-section">
                    <h5 className="section-title">
                      <i className="bi bi-folder me-2"></i>Category & Page
                      Selection
                    </h5>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="categoryId">Category</Label>
                          <Input
                            type="select"
                            id="categoryId"
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            disabled={viewMode}
                          >
                            <option value="">-- Select Category --</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name || cat.title}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="selectedPage" className="required-field">
                            Selected Page
                          </Label>
                          <Input
                            type="select"
                            id="selectedPage"
                            value={selectedPage}
                            onChange={(e) => setSelectedPage(e.target.value)}
                            disabled={viewMode}
                          >
                            <option value="">-- Select Page --</option>
                            {pages.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.titleHi} / {p.titleEn}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="content-section">
                    <h5 className="section-title">
                      <i className="bi bi-calendar-event me-2"></i>Date & Link
                      Information
                    </h5>
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <Label for="fromDate">From Date</Label>
                          <Input
                            type="date"
                            id="fromDate"
                            name="fromDate"
                            value={formatDateForInput(form.fromDate)}
                            onChange={handleChange}
                            disabled={viewMode}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="expirydate">Expiry Date</Label>
                          <Input
                            type="date"
                            id="expirydate"
                            name="expirydate"
                            value={formatDateForInput(form.expirydate)}
                            onChange={handleChange}
                            disabled={viewMode}
                          />
                        </FormGroup>
                      </Col>
                      <Col md="4">
                        <FormGroup>
                          <Label for="link">External Link</Label>
                          <Input
                            id="link"
                            name="link"
                            value={form.link}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            disabled={viewMode}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <FormGroup check className="mt-3">
                      <Input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleChange}
                        disabled={viewMode}
                      />
                      <Label check for="isActive">
                        <strong>Active</strong> (Enable this content for public
                        display)
                      </Label>
                    </FormGroup>
                  </div>

                  <div className="navigation-footer">
                    <Button
                      color="primary"
                      size="lg"
                      onClick={() => setActiveTab("2")}
                    >
                      Next: Add Content Blocks{" "}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                  </div>
                </TabPane>

                <TabPane tabId="2">
                  <div className="content-section">
                    <DynamicContentEditor
                      contents={contents}
                      setContents={setContents}
                      viewMode={viewMode}
                    />
                  </div>

                  <b>Uploded Content List</b>
                  <Row>
                    <Col className="d-flex">
                      {selectedContent && selectedContent?.length === 0 && (
                        <small className="text-muted">
                          No content uploaded
                        </small>
                      )}

                      {selectedContent && selectedContent?.length === 0 && selectedContent?.map((block, index) => (
                        <Card key={index} className="mb-2 shadow-sm">
                          <CardBody className="p-2">
                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge
                                color={
                                  block.fileType === "RICH_TEXT"
                                    ? "primary"
                                    : block.fileType === "PDF"
                                    ? "danger"
                                    : block.fileType === "IMAGE"
                                    ? "info"
                                    : block.fileType === "EXCEL"
                                    ? "success"
                                    : "secondary"
                                }
                                className="text-uppercase"
                              >
                                <i
                                  className={`bi bi-${
                                    block.fileType === "RICH_TEXT"
                                      ? "file-richtext"
                                      : block.fileType === "PDF"
                                      ? "file-pdf"
                                      : block.fileType === "IMAGE"
                                      ? "image"
                                      : block.fileType === "EXCEL"
                                      ? "file-excel"
                                      : "file-earmark"
                                  } me-1`}
                                ></i>
                                {block.fileType}
                              </Badge>

                              <small className="text-muted">#{index + 1}</small>
                            </div>

                            {/* Body */}
                            <div
                              className="mt-1"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {/* RICH TEXT */}
                              {block.fileType === "RICH_TEXT" && (
                                <div className="text-muted">
                                  {block.richTextContent
                                    ?.replace(/<[^>]*>/g, "")
                                    ?.slice(0, 90)}
                                  ...
                                </div>
                              )}

                              {/* FILE BASED */}
                              {["PDF", "IMAGE", "EXCEL"].includes(
                                block.fileType
                              ) && (
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className="text-truncate"
                                    style={{ maxWidth: "220px" }}
                                  >
                                    {block.fileName}
                                  </span>
                                </div>
                              )}

                              {/* TABLE */}
                              {block.fileType === "TABLE" && (
                                <small className="text-muted">
                                  Table ({block.tableData?.columns?.length || 0}{" "}
                                  columns)
                                </small>
                              )}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </Col>
                  </Row>

                  <div className="navigation-footer">
                    <Button
                      color="outline-secondary"
                      onClick={() => setActiveTab("1")}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back: Basic Info
                    </Button>
                    <Button color="primary" onClick={() => setActiveTab("3")}>
                      Next: Add Descriptions{" "}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                  </div>
                </TabPane>

                <TabPane tabId="3">
                  <div className="content-section">
                    <h5 className="section-title">
                      <i className="bi bi-text-paragraph me-2"></i>Short
                      Descriptions
                    </h5>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="shortDescriptionEn">
                            Short Description (English)
                          </Label>
                          <Input
                            type="textarea"
                            id="shortDescriptionEn"
                            name="shortDescriptionEn"
                            rows="4"
                            value={form.shortDescriptionEn}
                            onChange={handleChange}
                            placeholder="Enter short description in English..."
                            disabled={viewMode}
                          />
                          <small className="text-muted">
                            Brief overview for preview/listing pages
                          </small>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="shortDescriptionHi">
                            Short Description (Hindi)
                          </Label>
                          <Input
                            type="textarea"
                            id="shortDescriptionHi"
                            name="shortDescriptionHi"
                            rows="4"
                            value={form.shortDescriptionHi}
                            onChange={handleChange}
                            placeholder="हिंदी में संक्षिप्त विवरण दर्ज करें..."
                            disabled={viewMode}
                          />
                          <small className="text-muted">
                            पूर्वावलोकन/सूची पृष्ठों के लिए संक्षिप्त अवलोकन
                          </small>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="content-section">
                    <h5 className="section-title">
                      <i className="bi bi-file-text me-2"></i>Full Descriptions
                    </h5>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="descriptionEn">
                            Full Description (English)
                          </Label>
                          <Input
                            type="textarea"
                            id="descriptionEn"
                            name="descriptionEn"
                            rows="8"
                            value={form.descriptionEn}
                            onChange={handleChange}
                            placeholder="Enter detailed description in English..."
                            disabled={viewMode}
                          />
                          <small className="text-muted">
                            Detailed content for the main page
                          </small>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="descriptionHi">
                            Full Description (Hindi)
                          </Label>
                          <Input
                            type="textarea"
                            id="descriptionHi"
                            name="descriptionHi"
                            rows="8"
                            value={form.descriptionHi}
                            onChange={handleChange}
                            placeholder="हिंदी में विस्तृत विवरण दर्ज करें..."
                            disabled={viewMode}
                          />
                          <small className="text-muted">
                            मुख्य पृष्ठ के लिए विस्तृत सामग्री
                          </small>
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>

                  <div className="navigation-footer">
                    <Button
                      color="outline-secondary"
                      onClick={() => setActiveTab("2")}
                    >
                      <i className="bi bi-arrow-left me-2"></i>Back: Content
                      Blocks
                    </Button>
                  </div>
                </TabPane>
              </TabContent>
            </div>

            {!viewMode && (
              <div className="cms-footer">
                <Row className="align-items-center">
                  <Col md="8">
                    <div className="d-flex align-items-center">
                      <div className="me-4">
                        <h5 className="mb-1">
                          {editMode ? "Update Content" : "Ready to Publish?"}
                        </h5>
                        <p className="text-muted mb-0 small">
                          <i className="bi bi-check-circle me-1"></i>
                          Form is {getCompletionPercentage()}% complete |
                          <i className="bi bi-files ms-2 me-1"></i>
                          {contents.length} content blocks added
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col md="4" className="text-end">
                    <Button
                      color="success"
                      size="lg"
                      onClick={handleSubmit}
                      disabled={loading || getCompletionPercentage() < 40}
                      className="publish-btn"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          {editMode ? "Updating..." : "Publishing..."}
                        </>
                      ) : (
                        <>
                          <i
                            className={`bi bi-${
                              editMode ? "check-circle" : "send"
                            } me-2`}
                          ></i>
                          {editMode ? "Update Content" : "Publish Content"}
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );

  // ==================== MAIN RENDER ====================
  return (
    <>
      {currentView === "list" ? renderListView() : renderFormView()}

      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          <p className="mb-0">
            <i className="bi bi-exclamation-triangle text-warning me-2"></i>
            Are you sure you want to delete this content? This action cannot be
            undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={() => handleDelete(deleteId)}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AboutAndHelp;
