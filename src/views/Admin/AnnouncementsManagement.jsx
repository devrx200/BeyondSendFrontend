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
  Badge
} from "reactstrap";
import { FaBullhorn, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const API = import.meta.env.VITE_API_URL;

const AnnouncementsManagement = () => {
  const { isHindi } = useLanguage();

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

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
    link: "",
    displayOrder: 0,
    isNew: false,
    isSchemes: false,
    isActive: true
  };

  const [formData, setFormData] = useState(initialState);

  /* ================= SLUG AUTO ================= */
  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  /* ================= FETCH LIST ================= */
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-announcements-list`);
      setAnnouncements(res.data.data || []);
    } catch {
      Swal.fire("Error", "Failed to load announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
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
    setEditingId(item.id);
    setFormData({
      titleEn: item.titleEn,
      titleHi: item.titleHi,
      slug: item.slug,
      shortDescriptionEn: item.shortDescriptionEn,
      shortDescriptionHi: item.shortDescriptionHi,
      descriptionEn: item.descriptionEn,
      descriptionHi: item.descriptionHi,
      categoryId: item.categoryId?._id || "",
      image: null,
      fromDate: item.fromDate?.slice(0, 10),
      expiryDate: item.expiryDate?.slice(0, 10),
      isExternal: item.isExternal,
      link: item.link,
      displayOrder: item.displayOrder || 0,
      isNew: item.isNew,
      isSchemes: item.isSchemes,
      isActive: item.isActive
    });
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/delete-announcement/${id}`);
      Swal.fire("Deleted", "Announcement deleted successfully", "success");
      fetchAnnouncements();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.isExternal && !formData.link) {
      Swal.fire("Error", "External link is required", "error");
      return;
    }

    const fd = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        fd.append(key, formData[key]);
      }
    });

    try {
      if (editingId) {
        await axios.put(`${API}/api/update-announcement/${editingId}`, fd);
        Swal.fire("Updated", "Announcement updated successfully", "success");
      } else {
        await axios.post(`${API}/api/create-announcement`, fd);
        Swal.fire("Created", "Announcement created successfully", "success");
      }
      toggleModal();
      fetchAnnouncements();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">
        <div className="d-flex justify-content-between mb-4">
          <h4>
            <FaBullhorn className="me-2" />
            {isHindi ? "घोषणाएं प्रबंधन" : "Announcements Management"}
          </h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? "नई घोषणा" : "Add Announcement"}
          </Button>
        </div>

        <Table responsive hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Title (EN)</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              announcements.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.titleEn}</td>
                  <td className="text-muted small">{item.slug}</td>
                  <td>
                    <Badge color={item.isActive ? "success" : "secondary"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="info" className="me-2" onClick={() => handleEdit(item)}>
                      <FaEdit />
                    </Button>
                    <Button size="sm" color="danger" onClick={() => handleDelete(item.id)}>
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>

        {/* ================= MODAL ================= */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit Announcement" : "Create Announcement"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
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

              <FormGroup>
                <Label>Slug (Auto)</Label>
                <Input value={formData.slug} disabled />
              </FormGroup>

              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input
                  required
                  value={formData.titleHi}
                  onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Short Description (EN)</Label>
                <Input
                  type="textarea"
                  required
                  value={formData.shortDescriptionEn}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescriptionEn: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Short Description (HI)</Label>
                <Input
                  type="textarea"
                  required
                  value={formData.shortDescriptionHi}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDescriptionHi: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Description (EN)</Label>
                <Input
                  type="textarea"
                  required
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionEn: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Description (HI)</Label>
                <Input
                  type="textarea"
                  required
                  value={formData.descriptionHi}
                  onChange={(e) =>
                    setFormData({ ...formData, descriptionHi: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.files[0] })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>From Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.fromDate}
                  onChange={(e) =>
                    setFormData({ ...formData, fromDate: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup>
                <Label>Expiry Date</Label>
                <Input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryDate: e.target.value })
                  }
                />
              </FormGroup>

              <FormGroup check>
                <Input
                  type="checkbox"
                  checked={formData.isExternal}
                  onChange={(e) =>
                    setFormData({ ...formData, isExternal: e.target.checked })
                  }
                />
                <Label check>External Link</Label>
              </FormGroup>

              {formData.isExternal && (
                <FormGroup className="mt-2">
                  <Label>Link</Label>
                  <Input
                    required
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                  />
                </FormGroup>
              )}
            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
              <Button color="primary" type="submit">
                {editingId ? "Update" : "Create"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsManagement;
