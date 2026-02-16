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
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const API = import.meta.env.VITE_API_URL;

const DirectorateNoticeManagement = () => {

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const [formData, setFormData] = useState(initialState);

  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"]
    ]
  };

  /* ================= FETCH DATA ================= */

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-directorate-notice-all`);
      setList(res.data.data || []);
    } catch {
      Swal.fire("Error", "Failed to load notices", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/api/get-categories`);
      setCategories(res.data.data || []);
    } catch {
      console.error("Category load failed");
    }
  };

  useEffect(() => {
    fetchList();
    fetchCategories();
  }, []);

  /* ================= MODAL ================= */

  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditingId(null);
      setFormData(initialState);
    }
  };

  /* ================= EDIT ================= */

  const handleEdit = (item) => {
    setEditingId(item._id);

    setFormData({
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
    });

    setModal(true);
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
        `${API}/api/directorate-notice/delete/${id}`
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
          fd
        );
        Swal.fire("Updated!", "Notice updated successfully", "success");
      } else {
        await axios.post(
          `${API}/api/create-directorate-notice`,
          fd
        );
        Swal.fire("Created!", "Notice created successfully", "success");
      }

      toggleModal();
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

  return (
    <Card className="shadow-sm">
      <CardBody>

        <div className="d-flex justify-content-between mb-3">
          <h4>Directorate Notices</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus /> Add Notice
          </Button>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>{item.titleEn}</td>
                  <td>{item.categoryId?.categoryNameEn || "N/A"}</td>
                  <td>
                    <Badge color={item.isActive ? "success" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </Button>{" "}
                    <Button size="sm" color="danger" onClick={() => handleDelete(item._id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* ================= MODAL ================= */}

        <Modal isOpen={modal} toggle={toggleModal} size="xl">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit Notice" : "Create Notice"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody style={{ maxHeight: "75vh", overflowY: "auto" }}>

              {/* Titles */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Title (English)</Label>
                    <Input
                      required
                      value={formData.titleEn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          titleEn: e.target.value,
                          slug: generateSlug(e.target.value)
                        })
                      }
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
                        setFormData({ ...formData, titleHi: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Slug + Category */}
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Slug</Label>
                    <Input value={formData.slug} disabled />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Category</Label>
                    <Input
                      type="select"
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
                      value={formData.shortDescriptionEn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortDescriptionEn: e.target.value
                        })
                      }
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Short Description (Hindi)</Label>
                    <Input
                      type="textarea"
                      value={formData.shortDescriptionHi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shortDescriptionHi: e.target.value
                        })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Description */}
              <Row>
                <Col md={6}>
                  <Label>Description (English)</Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.descriptionEn}
                    onChange={(value) =>
                      setFormData({ ...formData, descriptionEn: value })
                    }
                    modules={quillModules}
                  />
                </Col>

                <Col md={6}>
                  <Label>Description (Hindi)</Label>
                  <ReactQuill
                    theme="snow"
                    value={formData.descriptionHi}
                    onChange={(value) =>
                      setFormData({ ...formData, descriptionHi: value })
                    }
                    modules={quillModules}
                  />
                </Col>
              </Row>

              {/* File */}
              <Row className="mt-3">
                <Col md={12}>
                  <FormGroup>
                    <Label>Upload File (PDF/DOC - Max 5MB)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setFormData({ ...formData, file: e.target.files[0] })
                      }
                    />
                  </FormGroup>
                </Col>
              </Row>

              {/* Active */}
              <FormGroup check className="mt-2">
                <Input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
                <Label check>Is Active</Label>
              </FormGroup>

            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" /> : editingId ? "Update" : "Create"}
              </Button>
            </ModalFooter>

          </Form>
        </Modal>

      </CardBody>
    </Card>
  );
};

export default DirectorateNoticeManagement;
