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
  Col
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaImage } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

const AboutSectionMangement = () => {
  const { isHindi } = useLanguage();

  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    imgNameEng: "",
    imgNameHin: "",
    designationEng: "",
    designationHin: "",
    aboutContentEn: "",
    aboutContentHi: "",
    image: null
  });

  /* ================= LOAD LIST ================= */
  const loadList = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-about-sections`, {
        headers: { "web-url": window.location.href }
      });
      setList(res.data || []);
    } catch {
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  /* ================= RESET ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      imgNameEng: "",
      imgNameHin: "",
      designationEng: "",
      designationHin: "",
      aboutContentEn: "",
      aboutContentHi: "",
      image: null
    });
    setImagePreview(null);
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  /* ================= HANDLE INPUT ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });

      let res;
      if (editingId) {
        res = await axios.put(
          `${API_URL}/api/update-about-section/${editingId}`,
          payload,
          { headers: { "web-url": window.location.href } }
        );
      } else {
        res = await axios.post(`${API_URL}/api/create-about-section`, payload, {
          headers: { "web-url": window.location.href }
        });
      }

      Swal.fire("Success", res.data.msg, "success");
      toggleModal();
      loadList();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.msg || "Operation failed", "error");
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      imgNameEng: item.imgNameEng,
      imgNameHin: item.imgNameHin,
      designationEng: item.designationEng,
      designationHin: item.designationHin,
      aboutContentEn: item.aboutContentEn,
      aboutContentHi: item.aboutContentHi,
      image: null
    });
    setImagePreview(item.image ? `${API_URL}${item.image}` : null);
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Record?",
      text: "This record will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/delete-about-section/${id}`,
        { headers: { "web-url": window.location.href } }
      );
      Swal.fire("Deleted", res.data.msg, "success");
      loadList();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardBody>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <FaImage className="me-2" /> About Section
          </h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add
          </Button>
        </div>

        {/* TABLE */}
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Designation</th>
              <th>About</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No records found
                </td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>
                    <img src={`${API_URL}${item.image}`} width={60} />
                  </td>
                  <td>{isHindi ? item.imgNameHin : item.imgNameEng}</td>
                  <td>{isHindi ? item.designationHin : item.designationEng}</td>
                  <td>{isHindi ? item.aboutContentHi : item.aboutContentEn}</td>
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

        {/* MODAL */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit About Section" : "Add About Section"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Name (English)</Label>
                    <Input name="imgNameEng" value={form.imgNameEng} onChange={handleChange} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Name (Hindi)</Label>
                    <Input name="imgNameHin" value={form.imgNameHin} onChange={handleChange} />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>Designation (English)</Label>
                    <Input name="designationEng" value={form.designationEng} onChange={handleChange} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Designation (Hindi)</Label>
                    <Input name="designationHin" value={form.designationHin} onChange={handleChange} />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label>About (English)</Label>
                    <Input
                      type="textarea"
                      rows="4"
                      name="aboutContentEn"
                      value={form.aboutContentEn}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>About (Hindi)</Label>
                    <Input
                      type="textarea"
                      rows="4"
                      name="aboutContentHi"
                      value={form.aboutContentHi}
                      onChange={handleChange}
                    />
                  </FormGroup>
                </Col>

                <Col md={12}>
                  <FormGroup>
                    <Label>Image</Label>
                    <Input type="file" onChange={handleImageChange} />
                    {imagePreview && (
                      <img src={imagePreview} className="mt-2" width={120} />
                    )}
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {editingId ? "Update" : "Save"}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

      </CardBody>
    </Card>
  );
};

export default AboutSectionMangement;
