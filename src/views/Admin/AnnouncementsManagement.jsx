import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  FormGroup,
  Label,
  Input,
  Badge,
  Row,
  Col,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  CardHeader
} from "reactstrap";
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaImage, FaCalendar, FaLink, FaArrowLeft, FaList } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";

const AnnouncementsManagement = () => {
  const { isHindi } = useLanguage();
  const API = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const isSubmittingRef = useRef(false);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = sessionStorage.getItem("announcements_active_tab");
    return savedTab || "list";
  });

  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usedOrders, setUsedOrders] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // ── descriptionEn / descriptionHi now live inside formData ──
  const initialState = {
    titleEn: "",
    titleHi: "",
    slug: "",
    shortDescriptionEn: "",
    shortDescriptionHi: "",
    descriptionEn: "",
    descriptionHi: "",
    categoryId: "",
    image: null,
    fromDate: "",
    expiryDate: "",
    displayOrder: 0,
    isSchemes: false,
    isActive: true
  };

  const [formData, setFormData] = useState(initialState);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data.data || []);
    } catch {
      console.error("Failed to load categories");
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-announcements-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const list = (res.data.data || []).map((item) => ({
        ...item,
        _id: item.id || item._id,
        fromDate: item.fromDate ? item.fromDate.split("T")[0] : "",
        expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
        categoryId: item.categoryId || null,
        isActive: item.isActive !== false,
        isSchemes: !!item.isSchemes,
      }));

      setAnnouncements(list);
      const orders = list
        .map((a) => Number(a.displayOrder))
        .filter((o) => !isNaN(o));
      setUsedOrders(orders);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || "Failed to load announcements"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchCategories();
  }, [API, token]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem("announcements_active_tab", tab);
  };

  const getNextAvailableOrder = (requested, usedOrders) => {
    let order = requested;
    while (usedOrders.includes(order)) order++;
    return order;
  };

  useEffect(() => {
    const schemeOrders = announcements
      .filter(a => a.isSchemes === formData.isSchemes)
      .map(a => Number(a.displayOrder))
      .filter(Boolean);
    setUsedOrders(schemeOrders);
  }, [formData.isSchemes, announcements]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(initialState);
    handleTabChange("form");
  };

  const handleBackToList = () => {
    handleTabChange("list");
    setEditingId(null);
    setFormData(initialState);
    fetchAnnouncements();
  };

  const handleEdit = (item) => {
    if (!item) return;
    const itemId = item._id;
    if (!itemId) return;

    setEditingId(itemId);
    setFormData({
      titleEn: item.titleEn || "",
      titleHi: item.titleHi || "",
      slug: item.slug || "",
      shortDescriptionEn: item.shortDescriptionEn || "",
      shortDescriptionHi: item.shortDescriptionHi || "",
      descriptionEn: item.descriptionEn || "",
      descriptionHi: item.descriptionHi || "",
      categoryId: item.categoryId?._id || "",
      image: null,
      fromDate: item.fromDate,
      expiryDate: item.expiryDate,
      displayOrder: item.displayOrder !== undefined && item.displayOrder !== null ? String(item.displayOrder) : "",
      isSchemes: !!item.isSchemes,
      isActive: item.isActive !== false
    });
    handleTabChange("form");
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
      text: isHindi ? "यह घोषणा हटा दी जाएगी!" : "This announcement will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isHindi ? "हाँ, हटाएं" : "Yes, Delete",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/delete-announcement/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire({
        icon: "success",
        title: isHindi ? "हटाया गया!" : "Deleted!",
        text: "Announcement deleted successfully",
        timer: 2000,
        showConfirmButton: false
      });
      fetchAnnouncements();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || "Delete failed"
      });
    }
  };

  // ── handleSubmit: guarded against double-fires + uses formData.descriptionEn/Hi ──
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // Prevent duplicate/auto submissions firing back-to-back
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setSubmitting(true);

    const fd = new FormData();

    Object.keys(formData).forEach((key) => {
      if (key === "image") return;
      const value = formData[key];
      if (value === null || value === undefined) return;
      if (typeof value === "boolean") {
        fd.append(key, value.toString());
      } else {
        fd.append(key, value);
      }
    });

    if (formData.image && formData.image instanceof File) {
      fd.append('image', formData.image);
    }

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${API}/api/update-announcement/${editingId}`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        Swal.fire({
          icon: "success",
          title: isHindi ? "अपडेट किया गया!" : "Updated!",
          text: res.data?.message || "Announcement updated successfully",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        res = await axios.post(`${API}/api/create-announcement`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        Swal.fire({
          icon: "success",
          title: isHindi ? "बनाया गया!" : "Created!",
          text: res.data?.message || "Announcement created successfully",
          timer: 2000,
          showConfirmButton: false
        });
      }

      handleBackToList();
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || err.message || "Operation failed"
      });
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <Card className=" ">
      <CardHeader>
        <div  className="d-flex justify-content-between align-items-center p-2">
          <h4 className="mb-0 text-white d-flex align-items-center  fs-3 fw-3" >
            <FaBullhorn className="me-2 " />
            {isHindi ? "घोषणाएं प्रबंधन" : "Announcements Management"}
          </h4>
          {activeTab === "list" && (
            <Button color="light" onClick={handleAddNew} className="d-flex align-items-center text-success">
              <FaPlus className="me-2" />
              {isHindi ? "नई घोषणा" : "Add Announcement"}
            </Button>
          )}
        </div>

      </CardHeader>
      <CardBody >

        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              active={activeTab === "list"}
              onClick={() => {
                handleTabChange("list");
                fetchAnnouncements();
              }}
              style={{ cursor: "pointer" }}
            >
              <FaList className="me-2" />
              {isHindi ? "घोषणाओं की सूची" : "Announcements List"}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "form"}
              onClick={() => {
                if (!editingId) {
                  setFormData(initialState);
                }
                handleTabChange("form");
              }}
              style={{ cursor: "pointer" }}
            >
              <FaBullhorn className="me-2" />
              {editingId ? (isHindi ? "घोषणा संपादित करें" : "Edit Announcement") : (isHindi ? "नई घोषणा" : "New Announcement")}
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* LIST TAB */}
          <TabPane tabId="list">
            {loading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="mt-3 text-muted">{isHindi ? "लोड हो रहा है..." : "Loading..."}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Title (EN)</th>
                      <th>Category</th>
                      <th>From Date</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th style={{ width: "120px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          {isHindi ? "कोई घोषणा नहीं मिली" : "No announcements found"}
                        </td>
                      </tr>
                    ) : (
                      announcements.map((item, i) => (
                        <tr key={item._id || item.id}>
                          <td>{i + 1}</td>
                          <td>
                            <div className="fw-semibold">{item.titleEn}</div>
                            <small className="text-muted">{item.slug}</small>
                          </td>
                          <td>
                            <Badge color="info" pill>
                              {item.categoryId?.nameEn || "N/A"}
                            </Badge>
                          </td>
                          <td>
                            <small className="text-muted">
                              <FaCalendar className="me-1" />
                              {item.fromDate ? new Date(item.fromDate).toLocaleDateString() : "N/A"}
                            </small>
                          </td>
                          <td>
                            <small className="text-muted">
                              <FaCalendar className="me-1" />
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "N/A"}
                            </small>
                          </td>
                          <td>
                            <Badge color={item.isActive ? "success" : "secondary"}>
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                              <Button
                                size="sm"
                                color="info"
                                onClick={() => handleEdit(item)}
                                title="Edit"
                                type="button"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(item._id || item.id)}
                                title="Delete"
                                type="button"
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
              </div>
            )}
          </TabPane>

          {/* FORM TAB */}
          <TabPane tabId="form">

            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <Button
                color="link"
                onClick={handleBackToList}
                className="p-0 text-decoration-none fw-semibold"
                type="button"
              >
                <FaArrowLeft className="me-2" />
                {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
              </Button>

              <div className="d-flex gap-2">
                <Button
                  color="light"
                  className="border"
                  onClick={handleBackToList}
                  disabled={submitting}
                  type="button"
                >
                  {isHindi ? "रद्द करें" : "Cancel"}
                </Button>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  type="button"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {editingId ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/*
              IMPORTANT FIX:
              Changed <Form> (a native <form> tag with no onSubmit handler)
              to a plain <div>. Any internal button inside
              DynamicContentEditor (e.g. an EN/HI language toggle) that
              doesn't set type="button" was previously treated as a
              type="submit" button. Inside a real <form> with no onSubmit
              handler, clicking it triggered the browser's native form
              submission -> full page reload, wiping all state.
              Using a <div> here removes the native <form> element
              entirely, so no nested button can ever trigger that
              native submit/reload behavior. The actual save still
              happens only via the explicit "Create"/"Update" button's
              onClick={handleSubmit} above.
            */}
            <div onKeyDown={(e) => {
              // Extra safety: pressing Enter anywhere in the form
              // (e.g. inside an input or the editor) should never submit.
              if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
              }
            }}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Title (English) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      required
                      name="titleEn"
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
                    <Label className="fw-semibold">
                      Title (Hindi) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      required
                      value={formData.titleHi}
                      name="titleHi"
                      onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                      placeholder="हिंदी शीर्षक दर्ज करें"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Short Description (English) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      required
                      rows="3"
                      value={formData.shortDescriptionEn}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDescriptionEn: e.target.value })
                      }
                      placeholder="Brief description in English"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Short Description (Hindi) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      required
                      rows="3"
                      value={formData.shortDescriptionHi}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDescriptionHi: e.target.value })
                      }
                      placeholder="हिंदी में संक्षिप्त विवरण"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">Slug (Auto-generated)</Label>
                    <Input name="slug" value={formData.slug} disabled className="bg-light" />
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Category <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                          {cat.categoryNameEn} ({cat.categoryNameHi})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      <FaImage className="me-2" />
                      Image (JPG, JPEG, PNG - Max 520KB)
                    </Label>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    />
                    <small className="text-muted">Optional - Leave empty to keep existing</small>
                  </FormGroup>
                </Col>
              </Row>



              <Row>

                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">Display Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      name="displayOrder"
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!val) {
                          setFormData({ ...formData, displayOrder: "" });
                          return;
                        }
                        const nextOrder = getNextAvailableOrder(val, usedOrders);
                        setFormData({
                          ...formData,
                          displayOrder: String(nextOrder)
                        });
                      }}
                    />
                    <small className="text-muted">
                      If entered order exists, next available order is auto-selected
                    </small>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      From Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      name="fromDate"
                      required
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Expiry Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </FormGroup>
                </Col>


              </Row>
              <hr className="my-4" />
              <h6 className="mb-3 text-primary">Options</h6>

              <Row>
                <Col md={4}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <Label check for="isActive" className="fw-semibold">
                      Is Active
                    </Label>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="isSchemes"
                      checked={formData.isSchemes}
                      onChange={(e) => setFormData({ ...formData, isSchemes: e.target.checked })}
                    />
                    <Label check for="isSchemes" className="fw-semibold">
                      Is Schemes
                    </Label>
                  </FormGroup>
                </Col>


              </Row>
              {/* DynamicContentEditor */}
              <Row>
                <Col md={12}>
                  <FormGroup className="mb-3">
                    <Label className="fw-semibold mb-2">
                      Description (English & Hindi) <span className="text-danger">*</span>
                    </Label>
                    <DynamicContentEditor
                      engField="descriptionEn"
                      hinField="descriptionHi"
                      height={360}
                      initialEn={formData.descriptionEn}
                      initialHi={formData.descriptionHi}
                      onChange={(contentObj) => {
                        setFormData(prev => ({
                          ...prev,
                          descriptionEn: contentObj.descriptionEn,
                          descriptionHi: contentObj.descriptionHi,
                        }));
                      }}
                      instanceId="content_editor"
                    />
                  </FormGroup>
                </Col>
              </Row>


            </div>
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsManagement;