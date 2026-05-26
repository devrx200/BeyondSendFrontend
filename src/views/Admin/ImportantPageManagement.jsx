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
  Row,
  Col,
  Spinner,
  Badge
} from "reactstrap";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaEye,
  FaFileAlt, FaBolt, FaFont, FaLanguage, FaLink, FaFileUpload, FaToggleOn
} from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import {
  confirmDelete, confirmAction, swalSuccess, swalError
} from "../../utilies/swalHelper";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const initialForm = {
  titleEn: "",
  titleHi: "",
  slug: "",
  descriptionEn: "",
  descriptionHi: "",
  isActive: true
};

const generateSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const ImportantPageManagement = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  /* ================= LOAD PAGES ================= */
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-all-important-pages`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });
      if (res.data?.success) {
        setList(res.data.data || []);
      }
    } catch (err) {
      swalError("Error", "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  /* ================= MODAL ================= */
  const toggleModal = () => {
    if (modal) {
      setEditingId(null);
      setFormData(initialForm);
      setFile(null);
      setSlugManuallyEdited(false);
    }
    setModal(!modal);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("titleEn", formData.titleEn);
      fd.append("titleHi", formData.titleHi);
      fd.append("slug", formData.slug);
      fd.append("descriptionEn", formData.descriptionEn);
      fd.append("descriptionHi", formData.descriptionHi);
      fd.append("isActive", formData.isActive);

      if (file) {
        fd.append("file", file);
      }

      let res;

      if (editingId) {
        res = await axios.put(
          `${API}/api/update-important-page/${editingId}`,
          fd ,{
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            },
          }
        );
      } else {
        res = await axios.post(
          `${API}/api/create-important-page`,
          fd ,{
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            },
          }
        );
      }

      swalSuccess("Saved", res.data?.message || "Operation successful");

      toggleModal();
      loadPages();
    } catch (err) {
      swalError("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEn: item.titleEn || "",
      titleHi: item.titleHi || "",
      slug: item.slug || "",
      descriptionEn: item.descriptionEn || "",
      descriptionHi: item.descriptionHi || "",
      isActive: item.isActive
    });
    setSlugManuallyEdited(true);
    setFile(null);
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const ok = await confirmDelete({
      title: "Delete this page?",
      text: "This page will be permanently removed."
    });
    if (!ok) return;

    try {
      const res = await axios.delete(
        `${API}/api/delete-important-page/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        }
      );

      swalSuccess("Deleted", res.data?.message || "Deleted successfully");
      loadPages();
    } catch (err) {
      swalError("Error", err.response?.data?.message || "Delete failed");
    }
  };



  const viewPage = async (slug) => {
    const ok = await confirmAction({
      title: "Open this page?",
      text: "The page will open in a new tab.",
      confirmButtonText: "Yes, Open it",
      icon: "question"
    });
    if (ok) window.open(`/${slug}`, "_blank");
  };


  return (
    <>
      {/* PAGE HEADER */}
      <div className="adm-page-head">
        <div>
          <h3 className="adm-page-title"><FaFileAlt /> Important Page Management</h3>
          <p className="adm-page-subtitle">Create and manage informational pages shown on the public site.</p>
        </div>
        {!modal && (
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-1" /> Add Page
          </Button>
        )}
      </div>

      {/* INLINE FORM CARD (replaces modal) */}
      {modal && (
        <div className="adm-form-card">
          <div className="adm-form-card-header">
            <div className="adm-form-card-icon"><FaFileAlt /></div>
            <div className="adm-form-card-titles">
              <h4 className="adm-form-card-title">
                {editingId ? "Edit Page" : "Create New Page"}
              </h4>
              <p className="adm-form-card-subtitle">
                <FaBolt /> Fill in the bilingual content and publish it on the site
              </p>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <div className="adm-form-card-body">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label><FaFont /> Title (English) <span className="text-danger">*</span></Label>
                    <Input
                      required
                      placeholder="e.g. About the Department"
                      value={formData.titleEn}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          titleEn: value,
                          slug: slugManuallyEdited
                            ? prev.slug
                            : generateSlug(value)
                        }));
                      }}
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label><FaLanguage /> Title (Hindi) <span className="text-danger">*</span></Label>
                    <Input
                      required
                      placeholder="जैसे - विभाग के बारे में"
                      value={formData.titleHi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleHi: e.target.value
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label><FaLink /> Slug (Editable – Used in URL)</Label>
                <Input
                  placeholder="auto-generated-from-title"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData({
                      ...formData,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                />
              </FormGroup>

              <FormGroup>
                <Label><FaFont /> Page Content (English)</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.descriptionEn}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      descriptionEn: value
                    })
                  }
                  style={{ height: "200px", marginBottom: "50px" }}
                />
              </FormGroup>

              <FormGroup>
                <Label><FaLanguage /> Page Content (Hindi)</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.descriptionHi}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      descriptionHi: value
                    })
                  }
                  style={{ height: "200px", marginBottom: "50px" }}
                />
              </FormGroup>

              <Row>
                <Col md={8}>
                  <FormGroup>
                    <Label><FaFileUpload /> Upload File (PDF / Image)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setFile(e.target.files[0])
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <FormGroup check className="mb-3">
                    <Input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked
                        })
                      }
                    />
                    <Label check><FaToggleOn className="me-1" /> Is Active</Label>
                  </FormGroup>
                </Col>
              </Row>
            </div>

            <div className="adm-form-card-footer">
              <div className="adm-actions-left">
                <Button outline color="secondary" type="button" onClick={toggleModal}>
                  <FaTimes className="me-1" /> Cancel
                </Button>
              </div>
              <div className="adm-actions-right">
                <Button color="primary" type="submit" disabled={submitting}>
                  <FaSave className="me-1" />
                  {submitting ? "Saving..." : editingId ? "Update Page" : "Save Page"}
                </Button>
              </div>
            </div>
          </Form>
        </div>
      )}

      {/* DATA TABLE */}
      <Card className="adm-card">
        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
            </div>
          ) : (
            <Table bordered hover responsive className="mb-0">
              <thead>
                <tr className="align-middle text-center">
                  <th>SN.</th>
                  <th>Title (EN)</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Actions</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No Pages Found
                    </td>
                  </tr>
                ) : (
                  list.map((item, i) => (
                    <tr key={item._id} className="align-middle text-center">
                      <td>{i + 1}</td>
                      <td className="text-start">{item.titleEn}</td>
                      <td><code>{item.slug}</code></td>
                      <td>
                        <Badge color={item.isActive ? "success" : "secondary"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          color="warning"
                          className="me-1"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          className="me-1"
                          onClick={() => handleDelete(item._id)}
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          size="sm"
                          color="primary"
                          onClick={() => viewPage(item.slug)}
                        >
                          <FaEye />
                        </Button>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default ImportantPageManagement;
