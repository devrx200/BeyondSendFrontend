import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label,
  Table
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBuilding, FaUniversity } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;

const ContactCardCMS = () => {
  const [cards, setCards] = useState([]);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    type: "department",
    title: "",
    subtitle: "",
    badge: "",
    address: "",
    phone: "",
    fax: "",
    email: "",
    color: "primary"
  });

  // ================= FETCH =================
  const fetchCards = async () => {
    const res = await axios.get(`${API}/api/contact-card/get`);
    setCards(res.data.data || []);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE =================
  const save = async () => {
    try {
      await axios.post(`${API}/api/contact-card/save`, form);

      Swal.fire("Success", "Saved successfully", "success");

      setForm({
        type: "department",
        title: "",
        subtitle: "",
        badge: "",
        address: "",
        phone: "",
        fax: "",
        email: "",
        color: "primary"
      });

      setEditId(null);
      fetchCards();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Error", "error");
    }
  };

  // ================= EDIT =================
  const handleEdit = (item) => {
    setForm(item);
    setEditId(item._id);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true
    });

    if (!confirm.isConfirmed) return;

    await axios.delete(`${API}/api/contact-card/delete/${id}`);

    Swal.fire("Deleted", "Removed", "success");
    fetchCards();
  };

  return (
    <Container className="mt-4">

      <h3 className="mb-3">📇 Contact Card Management</h3>

      {/* ================= FORM ================= */}
      <Card className="mb-4 shadow-sm">
        <CardBody>
          <Row>

            <Col md={3}>
              <Label>Type</Label>
              <Input type="select" name="type" value={form.type} onChange={handleChange}>
                <option value="department">Department</option>
                <option value="directorate">Directorate</option>
              </Input>
            </Col>

            <Col md={3}>
              <Label>Color</Label>
              <Input type="select" name="color" value={form.color} onChange={handleChange}>
                <option value="primary">Blue</option>
                <option value="success">Green</option>
              </Input>
            </Col>

            <Col md={6}>
              <Label>Badge</Label>
              <Input name="badge" value={form.badge} onChange={handleChange} />
            </Col>

            <Col md={6}>
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} />
            </Col>

            <Col md={6}>
              <Label>Subtitle</Label>
              <Input name="subtitle" value={form.subtitle} onChange={handleChange} />
            </Col>

            <Col md={12}>
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} />
            </Col>

            <Col md={4}>
              <Label>Phone</Label>
              <Input name="phone" value={form.phone} onChange={handleChange} />
            </Col>

            <Col md={4}>
              <Label>Fax</Label>
              <Input name="fax" value={form.fax} onChange={handleChange} />
            </Col>

            <Col md={4}>
              <Label>Email</Label>
              <Input name="email" value={form.email} onChange={handleChange} />
            </Col>

          </Row>

          <div className="text-end mt-3">
            <Button color="success" onClick={save}>
              {editId ? "Update" : "Save"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* ================= LIST ================= */}
      <Card className="shadow-sm">
        <CardBody>

          <Table bordered hover>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {cards.map((item) => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>{item.phone}</td>

                  <td>
                    <Button size="sm" color="warning" onClick={() => handleEdit(item)}>
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      color="danger"
                      className="ms-2"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>

          </Table>

        </CardBody>
      </Card>

      {/* ================= PREVIEW ================= */}
      <Row className="mt-4">
        {cards.map((item) => (
          <Col md={6} key={item._id}>
            <Card className="shadow rounded-4">

              <div className={`bg-${item.color}`} style={{ height: 5 }} />

              <CardBody>

                <div className="d-flex gap-3 align-items-center mb-3">
                  <div className={`bg-${item.color} text-white p-3 rounded`}>
                    {item.type === "department" ? <FaBuilding /> : <FaUniversity />}
                  </div>

                  <div>
                    <b>{item.title}</b>
                    <div>{item.subtitle}</div>
                  </div>
                </div>

                <p><b>Address:</b> {item.address}</p>
                <p><b>Phone:</b> {item.phone}</p>
                <p><b>Email:</b> {item.email}</p>

              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default ContactCardCMS;