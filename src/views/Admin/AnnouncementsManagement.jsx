import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card, CardBody, Button, Table,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaBullhorn } from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";
import Swal from "sweetalert2";

const AnnouncementsManagement = () => {
  const { isHindi } = useLanguage();
  const API = import.meta.env.VITE_API_URL;

  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleHi: "",
    descriptionEn: "",
    descriptionHi: "",
    categoryId: "",
    date: "",
    link: "",
    isActive: true
  });

  /* ================= FETCH ================= */
  const fetchAnnouncements = async () => {
    const res = await axios.get(`${API}/api/get-announcements`);
    setAnnouncements(res.data.data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titleEn: "",
      titleHi: "",
      descriptionEn: "",
      descriptionHi: "",
      categoryId: "",
      date: "",
      link: "",
      isActive: true
    });
  };
const [categories, setCategories] = useState([]);
const fetchCategories = async () => {
  const res = await axios.get(`${API}/api/get-categories`);
  setCategories(res.data.data);
};

useEffect(() => {
  fetchAnnouncements();
  fetchCategories();
}, []);

  /* ================= EDIT ================= */
  const handleEdit = async (id) => {
    const res = await axios.get(`${API}/api/get-announcement/${id}`);
    setFormData(res.data.data);
    setEditingId(id);
    setModal(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await axios.put(`${API}/api/update-announcement/${editingId}`, formData);
      Swal.fire("Updated", "Announcement Updated", "success");
    } else {
      await axios.post(`${API}/api/create-announcement`, formData);
      Swal.fire("Created", "Announcement Created", "success");
    }

    toggleModal();
    fetchAnnouncements();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33"
    });

    if (confirm.isConfirmed) {
      await axios.delete(`${API}/delete-announcement/${id}`);
      Swal.fire("Deleted", "Announcement Removed", "success");
      fetchAnnouncements();
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>{isHindi ? "घोषणाएं" : "Announcements"}</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> {isHindi ? "नई" : "New"}
          </Button>
        </div>

        <Table hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Title (EN)</th>
              <th>Title (HI)</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((a, i) => (
              <tr key={a._id}>
                <td>{i + 1}</td>
                <td>{a.titleEn}</td>
                <td>{a.titleHi}</td>
                <td>{new Date(a.date).toLocaleDateString()}</td>
                <td>
                  <span className={`badge bg-${a.isActive ? "success" : "secondary"}`}>
                    {a.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <Button size="sm" color="info" className="me-2" onClick={() => handleEdit(a._id)}>
                    <FaEdit />
                  </Button>
                  <Button size="sm" color="danger" onClick={() => handleDelete(a._id)}>
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
            <FaBullhorn className="me-2" />
            {editingId ? "Edit Announcement" : "New Announcement"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label>Title (English)</Label>
                <Input value={formData.titleEn} onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })} required />
              </FormGroup>

              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input value={formData.titleHi} onChange={(e) => setFormData({ ...formData, titleHi: e.target.value })} required />
              </FormGroup>

              <FormGroup>
                <Label>Description (English)</Label>
                <Input type="textarea" value={formData.descriptionEn} onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <Label>Description (Hindi)</Label>
                <Input type="textarea" value={formData.descriptionHi} onChange={(e) => setFormData({ ...formData, descriptionHi: e.target.value })} />
              </FormGroup>

              <FormGroup>
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </FormGroup>
              <FormGroup>
  <Label>
    {isHindi ? "श्रेणी" : "Category"} <span className="text-danger">*</span>
  </Label>

  <Input
    type="select"
    value={formData.categoryId}
    onChange={(e) =>
      setFormData({ ...formData, categoryId: e.target.value })
    }
    required
  >
    <option value="">-- Select Category --</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat._id}>
        {cat.categoryNameEn} ({ cat.categoryNameHi })
      </option>
    ))}
  </Input>
</FormGroup>

            </ModalBody>

            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>Cancel</Button>
              <Button color="primary" type="submit">Save</Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsManagement;
