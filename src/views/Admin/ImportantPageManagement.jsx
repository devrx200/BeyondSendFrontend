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
  Spinner
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

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
      const res = await axios.get(`${API}/api/get-all-important-pages`);
      if (res.data?.success) {
        setList(res.data.data || []);
      }
    } catch (err) {
      Swal.fire("Error", "Failed to load pages", "error");
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
          fd
        );
      } else {
        res = await axios.post(
          `${API}/api/create-important-page`,
          fd
        );
      }

      Swal.fire(
        "Success",
        res.data?.message || "Operation successful",
        "success"
      );

      toggleModal();
      loadPages();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
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
    const confirm = await Swal.fire({
      title: "Delete Page?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API}/api/delete-important-page/${id}`
      );

      Swal.fire(
        "Success",
        res.data?.message || "Deleted successfully",
        "success"
      );

      loadPages();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Delete failed",
        "error"
      );
    }
  };

  return (
    <div className="container-fluid mt-4">
      <Card>
        <CardBody>
          <div className="d-flex justify-content-between mb-3">
            <h4>📄 Important Page Management</h4>
            <Button color="primary" onClick={toggleModal}>
              <FaPlus className="me-1" /> Add Page
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <Spinner color="primary" />
            </div>
          ) : (
            <Table bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Title (EN)</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Pages Found
                    </td>
                  </tr>
                ) : (
                  list.map((item, i) => (
                    <tr key={item._id}>
                      <td>{i + 1}</td>
                      <td>{item.titleEn}</td>
                      <td><code>{item.slug}</code></td>
                      <td>
                        {item.isActive ? (
                          <span className="badge bg-success">Active</span>
                        ) : (
                          <span className="badge bg-danger">Inactive</span>
                        )}
                      </td>
                      <td>
                        {new Date(item.createdAt).toLocaleDateString()}
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
                          onClick={() => handleDelete(item._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={toggleModal} size="xl" backdrop="static">
        <ModalHeader toggle={toggleModal}>
          {editingId ? "Edit Page" : "Create Page"}
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label>Title (English)</Label>
                  <Input
                    required
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
                  <Label>Title (Hindi)</Label>
                  <Input
                    required
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
              <Label>Slug (Editable – Used in URL)</Label>
              <Input
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
              <Label>Page Content (English)</Label>
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
              <Label>Page Content (Hindi)</Label>
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

            <FormGroup>
              <Label>Upload File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) =>
                  setFile(e.target.files[0])
                }
              />
            </FormGroup>

            <FormGroup check>
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
              <Label check>Is Active</Label>
            </FormGroup>
          </ModalBody>

          <ModalFooter>
            <Button color="primary" type="submit" disabled={submitting}>
              <FaSave className="me-1" />
              {submitting ? "Saving..." : "Save"}
            </Button>
            <Button color="secondary" onClick={toggleModal}>
              <FaTimes className="me-1" />
              Cancel
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default ImportantPageManagement;
