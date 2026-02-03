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
  Input
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PageCreatorManagement = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    titleEng: "",
    titleHin: "",
    slug: "",
    mainSlug: "",
    menuId: "",
    department: "",
    examYear: "",
    publishDate: "",
    htmlContent: ""
  });

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/content/get-all-content`);
      setList(res.data?.data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load pages", "error");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ================= HELPERS ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titleEng: "",
      titleHin: "",
      slug: "",
      mainSlug: "",
      menuId: "",
      department: "",
      examYear: "",
      publishDate: "",
      htmlContent: ""
    });
  };

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

  /* ================= CRUD ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEng: item.titleEng || "",
      titleHin: item.titleHin || "",
      slug: item.slug || "",
      mainSlug: item.mainSlug || "",
      menuId: item.menuId?._id || item.menuId || "",
      department: item.department || "",
      examYear: item.examYear || "",
      publishDate: item.publishDate?.slice(0, 10) || "",
      htmlContent: item.htmlContent || ""
    });
    setModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Page?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/content/delete-content/${id}`);
      Swal.fire("Deleted", "Page deleted successfully", "success");
      loadData();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = [
      "titleEng",
      "titleHin",
      "slug",
      "mainSlug",
      "menuId",
      "department",
      "examYear",
      "publishDate"
    ];

    for (let field of required) {
      if (!formData[field]) {
        Swal.fire("Required", "Please fill all required fields", "warning");
        return;
      }
    }

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/api/content/update-content/${editingId}`,
          formData
        );
        Swal.fire("Updated", "Page updated successfully", "success");
      } else {
        await axios.post(
          `${API_URL}/api/content/create-content`,
          formData
        );
        Swal.fire("Created", "Page created successfully", "success");
      }

      toggleModal();
      loadData();
    } catch {
      Swal.fire("Error", "Save failed", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>Page Creator Management</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add Page
          </Button>
        </div>

        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Title (EN)</th>
              <th>Slug</th>
              <th>Publish Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No pages found
                </td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>{item.titleEng}</td>
                  <td>{item.slug}</td>
                  <td>{item.publishDate?.slice(0, 10)}</td>
                  <td>
                    <Button
                      size="sm"
                      color="warning"
                      className="me-2"
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

        <Modal isOpen={modal} toggle={toggleModal} size="xl">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit Page" : "Create Page"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label>Title (English)</Label>
                <Input
                  value={formData.titleEng}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      titleEng: title,
                      slug: generateSlug(title)
                    });
                  }}
                />
              </FormGroup>

              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input
                  value={formData.titleHin}
                  onChange={(e) =>
                    setFormData({ ...formData, titleHin: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Main Slug</Label>
                <Input
                  value={formData.mainSlug}
                  onChange={(e) =>
                    setFormData({ ...formData, mainSlug: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Menu ID</Label>
                <Input
                  value={formData.menuId}
                  onChange={(e) =>
                    setFormData({ ...formData, menuId: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Exam Year</Label>
                <Input
                  value={formData.examYear}
                  onChange={(e) =>
                    setFormData({ ...formData, examYear: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Publish Date</Label>
                <Input
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishDate: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>HTML Content</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.htmlContent}
                  onChange={(value) =>
                    setFormData({ ...formData, htmlContent: value })
                  }
                />
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {editingId ? "Update" : "Save"}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                <FaTimes className="me-2" />
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default PageCreatorManagement;
