// AboutAndHelp.jsx — List + Single Page Editor with Preview + Update
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
  Alert,
  Table,
} from "reactstrap";
import axios from "axios";
import DynamicContentEditor from "../../utilies/DynamicContentEditor";
import "../../css/aboutAndHelp.css";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");

const ContentUploaderForm = () => {
  const [currentView, setCurrentView] = useState("list"); // list | form
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

  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [contents, setContents] = useState([]);

  const [viewMode, setViewMode] = useState(false); // 👈 preview toggle only
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const [savedContentList, setSavedContentList] = useState([]);

  /* ==================== LIFECYCLE ==================== */
  useEffect(() => {
    fetchPages();
    fetchCategories();
    fetchSavedContent();
  }, []);

  /* ==================== API ==================== */
  const fetchPages = async () => {
    const res = await axios.get(`${API}/api/menu-list-all/get-all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPages(extractPagesFromMenu(res.data.data || []));
  };

  const extractPagesFromMenu = (menus, pages = [], parentId = null) => {
    menus.forEach((item) => {
      pages.push({
        _id: item._id,
        titleEn: item.titleEng,
        titleHi: item.titleHi,
        parentId,
      });
      if (Array.isArray(item.submenu) && item.submenu.length > 0) {
        extractPagesFromMenu(item.submenu, pages, item._id);
      }
    });
    return pages;
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/api/get-categories`);

    console.log(res.data, "Getting Categories");

    setCategories(res.data || []);
  };

  const fetchSavedContent = async () => {
    const res = await axios.get(`${API}/api/get-about-and-help`);
    setSavedContentList(res.data);

    // console.log(res.data,"res.data?.data res.data?.data");

  };

  /* ==================== FORM ==================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const resetForm = () => {
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
    setEditingId(null);
    setViewMode(false);
  };

  /* ==================== CREATE / UPDATE ==================== */
  const handleSubmit = async () => {
    setLoading(true);
    setSaveStatus(null);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined) formData.append(k, v);
      });

      formData.append("selectedPage", selectedPage);

      const contentsPayload = contents.map((item) => {
        const clean = { ...item };
        delete clean.file;
        delete clean.imageFile;
        return clean;
      });

      formData.append("contents", JSON.stringify(contentsPayload));

      const url = editingId
        ? `${API}/api/about-and-help/${editingId}`
        : `${API}/api/about-and-help`;

      await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" , Authorization: `Bearer ${token}`},
      });

      setSaveStatus("success");
      fetchSavedContent();

      setTimeout(() => {
        setSaveStatus(null);
        resetForm();
        setCurrentView("list");
      }, 1200);
    } catch (err) {
      console.error(err);
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  };

  /* ==================== EDIT ==================== */
  const handleEdit = async (item) => {
    const res = await axios.get(`${API}/api/get-about-and-help/${item._id}`);
    const data = res.data;

    setEditingId(item._id);

    setForm({
      titleEn: data.titleEn || "",
      titleHi: data.titleHi || "",
      shortDescriptionEn: data.shortDescriptionEn || "",
      shortDescriptionHi: data.shortDescriptionHi || "",
      descriptionEn: data.descriptionEn || "",
      descriptionHi: data.descriptionHi || "",
      categoryId: data.categoryId || "",
      fromDate: data.fromDate || "",
      expirydate: data.expirydate || "",
      link: data.link || "",
      isActive: data.isActive ?? true,
    });

    setSelectedPage(data.selectedPage || "");
    setContents(data.contents || []);

    setViewMode(false);
    setCurrentView("form");
  };

  /* ==================== LIST VIEW ==================== */
  const renderListView = () => (
    <div className="cms-container">
      <div className="cms-wrapper">
        <Row className="mb-3">
          <Col md={6}>
            <h4 className="text-white">New Content Uploader</h4>
          </Col>
          <Col md={6} className="text-end">
            <Button
              color="success"
              onClick={() => {
                resetForm();
                setCurrentView("form");
              }}
            >
              + Create New
            </Button>
          </Col>
        </Row>

        <Card>
          <CardBody>
            <Table hover>
              <thead>
                <tr>
                  <th>Title (EN)</th>
                  <th>Page</th>
                  <th>Status</th>
                  <th width="140">Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedContentList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-4">
                      No content found
                    </td>
                  </tr>
                ) : (
                  savedContentList.map((item) => {
                    const page = pages.find(
                      (p) => p._id === item.selectedPage
                    );
                    return (
                      <tr key={item._id}>
                        <td>{item.titleEn}</td>
                        <td>{page?.titleEn || "-"}</td>
                        <td>
                          <span
                            className={`badge ${item.isActive ? "bg-success" : "bg-secondary"
                              }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  /* ==================== FORM VIEW ==================== */
  const renderFormView = () => (
    <div className="cms-container">
      <div className="cms-wrapper">
        <Row className="mb-3 align-items-center">
          <Col md={6}>
            <h4 className="text-white">{editingId ? "Update Content" : "Create Content"}</h4>
          </Col>

          <Col md={6} className="text-end d-flex justify-content-end gap-2">
            <Button
              size="sm"
              color={viewMode ? "warning" : "success"}
              className="fw-semibold px-3"
              onClick={() => setViewMode(!viewMode)}
            >
              {viewMode ? "✏️ Edit Mode" : "👁️ Preview Mode"}
            </Button>

            <Button
              size="sm"
              color="danger"
              className="fw-semibold px-3"
              onClick={() => {
                resetForm();
                setCurrentView("list");
              }}
            >
              🔙 Back to List
            </Button>
          </Col>


        </Row>

        {saveStatus && (
          <Alert
            color={saveStatus === "success" ? "success" : "danger"}
          >
            {saveStatus === "success"
              ? "✅ Content saved successfully"
              : "❌ Error saving content"}
          </Alert>
        )}

        <Card>
          <CardBody>
            {/* BASIC INFO */}
            <Row>
              <Col md="6">
                <Label>Title (EN)</Label>
                <Input
                  name="titleEn"
                  value={form.titleEn}
                  onChange={handleChange}
                  disabled={viewMode}
                />
              </Col>
              <Col md="6">
                <Label>Title (HI)</Label>
                <Input
                  name="titleHi"
                  value={form.titleHi}
                  onChange={handleChange}
                  disabled={viewMode}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col md="6">
                <Label>Category</Label>
                <Input
                  type="select"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  disabled={viewMode}
                >
                  <option value="">-- Select Category --</option>
                  {categories && categories.length > 0 && categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name || c.title}
                    </option>
                  ))}
                </Input>
              </Col>

              <Col md="6">
                <Label>Selected Page</Label>
                <Input
                  type="select"
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
              </Col>
            </Row>

            {/* RICH TEXT */}
            <div className="mt-4">
              <h6>Content</h6>
              <DynamicContentEditor
                contents={contents}
                setContents={setContents}
                viewMode={viewMode}
              />
            </div>

            {/* DESCRIPTIONS */}
            <Row className="mt-4">
              <Col md="6">
                <Label>Short Description (EN)</Label>
                <Input
                  type="textarea"
                  name="shortDescriptionEn"
                  value={form.shortDescriptionEn}
                  onChange={handleChange}
                  disabled={viewMode}
                />
              </Col>
              <Col md="6">
                <Label>Short Description (HI)</Label>
                <Input
                  type="textarea"
                  name="shortDescriptionHi"
                  value={form.shortDescriptionHi}
                  onChange={handleChange}
                  disabled={viewMode}
                />
              </Col>
            </Row>

            {/* FOOTER */}
            {!viewMode && (
              <div className="text-end mt-4">
                <Button
                  color="success"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                      ? "Update Content"
                      : "Save Content"}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );

  return currentView === "list" ? renderListView() : renderFormView();
};

export default ContentUploaderForm;
