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
  Spinner
} from "reactstrap";
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaImage, FaCalendar, FaLink } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API = import.meta.env.VITE_API_URL;

const AnnouncementsManagement = () => {
  const { isHindi } = useLanguage();

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usedOrders, setUsedOrders] = useState([]);

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
    isExternal: false,
    openInNewTab: false,
    link: "",
    displayOrder: 0,
    isNew: false,
    isSchemes: false,
    isActive: true
  };

  const [formData, setFormData] = useState(initialState);

  /* ================= QUILL MODULES ================= */
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"]
    ]
  };

  /* ================= SLUG AUTO ================= */
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data.data || []);
    } catch {
      console.error("Failed to load categories");
    }
  };

  /* ================= FETCH LIST ================= */
  // const fetchAnnouncements = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(`${API}/api/get-announcements-list`);
  //     setAnnouncements(res.data.data || []);
  //   } catch (err) {
  //     Swal.fire({
  //       icon: "error",
  //       title: isHindi ? "त्रुटि" : "Error",
  //       text: err.response?.data?.message || "Failed to load announcements"
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-announcements-list`);

      const list = (res.data.data || []).map((item) => ({
        ...item,
        _id: item.id || item._id,
        fromDate: item.fromDate ? item.fromDate.split("T")[0] : "",
        expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
        categoryId: item.categoryId || null,
        isActive: item.isActive !== false,
        isExternal: !!item.isExternal,
        isNew: !!item.isNew,
        isSchemes: !!item.isSchemes,
        openInNewTab: !!item.openInNewTab
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
  }, []);

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

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      // Reset when closing modal
      setEditingId(null);
      setFormData(initialState);
    }
  };

  /* ================= OPEN CREATE MODAL ================= */
  const handleCreate = () => {
    setEditingId(null);
    setFormData(initialState);
    setModal(true);
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    if (!item) return;
    console.log(item, "getting this data");
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
      isExternal: !!item.isExternal,
      openInNewTab: !!item.openInNewTab,
      link: item.link || "",
      displayOrder:
        item.displayOrder !== undefined && item.displayOrder !== null
          ? String(item.displayOrder)
          : "",
      isNew: !!item.isNew,
      isSchemes: !!item.isSchemes,
      isActive: item.isActive !== false
    });

    setModal(true);
  };


  /* ================= DELETE ================= */
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
      const res = await axios.delete(`${API}/api/delete-announcement/${id}`);
      Swal.fire({
        icon: "success",
        title: isHindi ? "हटाया गया!" : "Deleted!",
        text: res.data?.message || "Announcement deleted successfully",
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

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData();

    // Add all fields except image (handle separately)
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


    // Only add image if a new file was selected
    if (formData.image && formData.image instanceof File) {
      fd.append('image', formData.image);
    }



    // Debug logging
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Editing ID:", editingId);
    console.log("Form Data Object:", formData);
    console.log("FormData entries:");
    for (let [key, value] of fd.entries()) {
      console.log(`  ${key}:`, value, `(${typeof value})`);
    }
    console.log("============================");

    try {
      let res;
      if (editingId) {
        console.log("🔄 Updating announcement with ID:", editingId);
        res = await axios.put(`${API}/api/update-announcement/${editingId}`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data'
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
        console.log("✨ Creating new announcement");
        res = await axios.post(`${API}/api/create-announcement`, fd, {
          headers: {
            'Content-Type': 'multipart/form-data'
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
      toggleModal();
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ Submit error:", err.response?.data || err.message);
      console.error("Full error:", err);
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || err.message || "Operation failed"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0 d-flex align-items-center">
            <FaBullhorn className="me-2 text-primary" />
            {isHindi ? "घोषणाएं प्रबंधन" : "Announcements Management"}
          </h4>
          <Button color="primary" onClick={handleCreate} className="d-flex align-items-center">
            <FaPlus className="me-2" />
            {isHindi ? "नई घोषणा" : "Add Announcement"}
          </Button>
        </div>

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
                        <Button
                          size="sm"
                          color="info"
                          className="me-2"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(item._id || item.id)}
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
          </div>
        )}

        {/* ================= MODAL ================= */}
        <Modal isOpen={modal} toggle={toggleModal} size="xl">
          <ModalHeader toggle={toggleModal} className="bg-light">
            <FaBullhorn className="me-2" />
            {editingId ? (isHindi ? "घोषणा संपादित करें" : "Edit Announcement") : (isHindi ? "नई घोषणा बनाएं" : "Create Announcement")}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                    <Label className="fw-semibold">Slug (Auto-generated)</Label>
                    <Input name="slug" value={formData.slug} disabled className="bg-light" />
                  </FormGroup>
                </Col>

                <Col md={6}>
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

              <FormGroup className="mb-3">
                <Label className="fw-semibold">
                  Description (English) <span className="text-danger">*</span>
                </Label>
                <div style={{ height: "200px" }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.descriptionEn}
                    onChange={(value) => setFormData({ ...formData, descriptionEn: value })}
                    modules={quillModules}
                    placeholder="Write detailed description in English..."
                    style={{ height: "150px" }}
                  />
                </div>
              </FormGroup>

              <FormGroup className="mb-3">
                <Label className="fw-semibold">
                  Description (Hindi) <span className="text-danger">*</span>
                </Label>
                <div style={{ height: "200px" }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.descriptionHi}
                    name="descriptionHi"
                    onChange={(value) => setFormData({ ...formData, descriptionHi: value })}
                    modules={quillModules}
                    placeholder="हिंदी में विस्तृत विवरण लिखें..."
                    style={{ height: "150px" }}
                  />
                </div>
              </FormGroup>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      <FaLink className="me-2" />
                      Link <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="url"
                      required
                      placeholder="https://example.com"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
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

                    {/* <small className="text-muted">Lower numbers appear first</small> */}
                  </FormGroup>
                </Col>
              </Row>

              <hr className="my-4" />
              <h6 className="mb-3 text-primary">
                <i className="bi bi-gear me-2"></i>Options
              </h6>

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

                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="isNew"
                      checked={formData.isNew}
                      onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    />
                    <Label check for="isNew" className="fw-semibold">
                      Mark as New
                    </Label>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="isExternal"
                      checked={formData.isExternal}
                      onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                    />
                    <Label check for="isExternal" className="fw-semibold">
                      Is External Link
                    </Label>
                  </FormGroup>

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

                <Col md={4}>
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      id="openInNewTab"
                      checked={formData.openInNewTab}
                      onChange={(e) =>
                        setFormData({ ...formData, openInNewTab: e.target.checked })
                      }
                    />
                    <Label check for="openInNewTab" className="fw-semibold">
                      Open in New Tab
                    </Label>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>

            <ModalFooter className="bg-light">
              <Button color="secondary" onClick={toggleModal} disabled={submitting}>
                {isHindi ? "रद्द करें" : "Cancel"}
              </Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {isHindi ? "प्रोसेसिंग..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {editingId ? (isHindi ? "अपडेट करें" : "Update") : (isHindi ? "बनाएं" : "Create")}
                  </>
                )}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsManagement;
