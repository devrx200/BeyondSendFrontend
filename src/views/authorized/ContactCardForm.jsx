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
  Table,
  CardHeader
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaBuilding, FaUniversity } from "react-icons/fa";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
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
    color: "primary",
    isActive: true,
  });

  // ================= FETCH =================
  const fetchCards = async () => {
    const res = await axios.get(`${API}/api/contact-card/get-all`);
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
      await axios.post(`${API}/api/contact-card/save`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
        color: "primary",
        isActive: true,
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

    await axios.delete(`${API}/api/contact-card/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    Swal.fire("Deleted", "Removed", "success");
    fetchCards();
  };

  return (
    <>
      {/* PAGE HEADER */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1">
              📇 Contact Card Management
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              Manage contact cards for departments and directorates
            </p>
          </div>
          <Button color="primary" onClick={save}>
            <FaBuilding className="me-1" />
            {editId ? "Update Card" : "Save Card"}
          </Button>
        </CardHeader>
      </Card>

      <Card className="adm-card shadow-sm border-0 mb-4">
        <CardBody>

          {/* ================= FORM ================= */}
          <Card className="border rounded-3 mb-4 shadow-none">
            <CardBody className="p-3">
              <h6 className="fw-semibold mb-3 text-primary">Card Information</h6>
              <Row className="g-3">
                <Col md={3}>
                  <Label className="fw-semibold">Type</Label>
                  <Input type="select" name="type" value={form.type} onChange={handleChange}>
                    <option value="department">Department</option>
                    <option value="directorate">Directorate</option>
                  </Input>
                </Col>

                <Col md={3}>
                  <Label className="fw-semibold">Color</Label>
                  <Input type="select" name="color" value={form.color} onChange={handleChange}>
                    <option value="primary">Blue</option>
                    <option value="success">Green</option>
                  </Input>
                </Col>

                <Col md={6}>
                  <Label className="fw-semibold">Badge</Label>
                  <Input name="badge" value={form.badge} onChange={handleChange} placeholder="e.g. Support Team" />
                </Col>

                <Col md={6}>
                  <Label className="fw-semibold">Title</Label>
                  <Input name="title" value={form.title} onChange={handleChange} placeholder="Card Title" />
                </Col>

                <Col md={6}>
                  <Label className="fw-semibold">Subtitle</Label>
                  <Input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Card Subtitle" />
                </Col>

                <Col md={12}>
                  <Label className="fw-semibold">Address</Label>
                  <Input name="address" value={form.address} onChange={handleChange} placeholder="Office Address" />
                </Col>

                <Col md={4}>
                  <Label className="fw-semibold">Phone</Label>
                  <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                </Col>

                <Col md={4}>
                  <Label className="fw-semibold">Fax</Label>
                  <Input name="fax" value={form.fax} onChange={handleChange} placeholder="Fax number" />
                </Col>

                <Col md={4}>
                  <Label className="fw-semibold">Email</Label>
                  <Input name="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </Col>

                <Col md={4}>
                  <Label className="fw-semibold">Status</Label>
                  <Input
                    type="select"
                    name="isActive"
                    value={form.isActive}
                    onChange={handleChange}
                  >
                    <option value="true">🟢 Active</option>
                    <option value="false">🔴 Inactive</option>
                  </Input>
                </Col>
              </Row>

              <div className="text-end mt-3">
                <Button color="success" onClick={save}>
                  {editId ? "Update Card" : "Save Card"}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* ================= LIST ================= */}
          <Card className="border rounded-3 mb-4 shadow-none">
            <CardBody className="p-3">
              <h6 className="fw-semibold mb-3 text-primary">Card List</h6>
              <div className="table-responsive rounded-3 border">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">
                          No contact cards found.
                        </td>
                      </tr>
                    ) : (
                      cards.map((item) => (
                        <tr key={item._id}>
                          <td className="fw-semibold">{item.title}</td>
                          <td><span className="badge bg-secondary">{item.type}</span></td>
                          <td>{item.phone || "—"}</td>
                          <td>
                            <span
                              className={`badge rounded-pill px-3 py-1 ${item.isActive ? "bg-success" : "bg-danger"
                                }`}
                            >
                              {item.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="text-end">
                            <Button size="sm" color="warning" className="me-2" onClick={() => handleEdit(item)}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </CardBody>
          </Card>

          {/* ================= PREVIEW ================= */}
          {cards.length > 0 && (
            <div className="mt-4">
              <h6 className="fw-semibold mb-3 text-primary">Live Card Previews</h6>
              <Row className="g-3">
                {cards.map((item) => (
                  <Col md={6} key={item._id}>
                    <Card className="border rounded-3 shadow-sm h-100">
                      <div className={`bg-${item.color}`} style={{ height: 4 }} />
                      <CardBody className="p-3">
                        <div className="d-flex gap-3 align-items-center mb-3">
                          <div className={`bg-${item.color} text-white p-3 rounded-3`}>
                            {item.type === "department" ? <FaBuilding size={20} /> : <FaUniversity size={20} />}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">{item.title}</h6>
                            <small className="text-muted">{item.subtitle}</small>
                          </div>
                        </div>
                        <p className="mb-1 small"><b>Address:</b> {item.address || "—"}</p>
                        <p className="mb-1 small"><b>Phone:</b> {item.phone || "—"}</p>
                        <p className="mb-0 small"><b>Email:</b> {item.email || "—"}</p>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

        </CardBody>
      </Card>
    </>
  );
};

export default ContactCardCMS;