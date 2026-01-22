import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col
} from "reactstrap";
import { FaUsers, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= INITIAL FORM ================= */
const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "OFFICER",
  userDeginations: "",
  permissions: [],
  controls: [],
  profileImage: null,
  status: "PENDING",
  isActive: true
};

const AdminUserManagement = () => {
  const { isHindi } = useLanguage();

  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-all-users`);
      setUsers(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) {
      setEditing(null);
      setFormData(initialForm);
    }
  };

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }));
      return;
    }

    if (name === "permissions" || name === "controls") {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(",").map(v => v.trim()).filter(Boolean)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      });

      if (editing) {
        await axios.put(
          `${API_URL}/api/update-user/${editing._id}`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        Swal.fire("Updated", "User updated successfully", "success");
      } else {
        await axios.post(
          `${API_URL}/api/create-user`,
          payload,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        Swal.fire("Created", "User created successfully", "success");
      }

      toggleModal();
      loadUsers();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: user.role || "OFFICER",
      userDeginations: user.userDeginations || "",
      permissions: user.permissions || [],
      controls: user.controls || [],
      profileImage: null,
      status: user.status || "PENDING",
      isActive: user.isActive ?? true
    });
    setModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
      text: isHindi ? "यह उपयोगकर्ता हटाया जाएगा" : "This user will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: isHindi ? "हाँ, हटाएँ" : "Yes, delete"
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/delete-user/${id}`);
      Swal.fire("Deleted", "User deleted successfully", "success");
      loadUsers();
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">
              <FaUsers className="me-2" />
              {isHindi ? "उपयोगकर्ता प्रबंधन" : "User Management"}
            </h4>
            <small className="text-muted">
              {isHindi ? "अधिकारी प्रबंधन" : "Manage Officers"}
            </small>
          </div>

          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" />
            {isHindi ? "नया अधिकारी" : "Add Officer"}
          </Button>
        </div>

        {/* TABLE */}
        <Table responsive hover striped>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Profile Images</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Designation</th>
              <th>Permissions</th>
              <th>Controls</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="9" className="text-center">No users found</td></tr>
            ) : (
              users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>
                    <img
                      src={`${API_URL}${u.profileImage}`}
                      height="40"
                      width="40"
                      alt="Profile"
                      className="rounded"
                      style={{ objectFit: 'cover' }}
                    />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.mobile}</td>
                  <td><Badge color="info">{u.userDeginations}</Badge></td>
                  <td>{u.permissions?.map((p, idx) => (
                    <Badge key={idx} color="secondary" className="me-1">{p}</Badge>
                  ))}</td>
                  <td>{u.controls?.map((c, idx) => (
                    <Badge key={idx} color="dark" className="me-1">{c}</Badge>
                  ))}</td>
                  <td>
                    <Badge color={
                      u.status === "APPROVED" ? "success" :
                      u.status === "REJECTED" ? "danger" : "warning"
                    }>
                      {u.status}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" color="primary" className="me-1" onClick={() => handleEdit(u)}>
                      <FaEdit />
                    </Button>
                    <Button size="sm" color="danger" onClick={() => handleDelete(u._id)}>
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
            {editing ? "Edit Officer" : "Add Officer"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Name</Label>
                    <Input name="name" value={formData.name} onChange={handleChange} required />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="email" name="email" value={formData.email} onChange={handleChange} disabled={!!editing} required />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Mobile</Label>
                    <Input name="mobile" value={formData.mobile} onChange={handleChange} required />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Designation</Label>
                    <Input name="userDeginations" value={formData.userDeginations} onChange={handleChange} required />
                  </FormGroup>
                </Col>
              </Row>

              {!editing && (
                <FormGroup>
                  <Label>Password</Label>
                  <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </FormGroup>
              )}

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Permissions (comma separated)</Label>
                    <Input name="permissions" value={formData.permissions.join(", ")} onChange={handleChange} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Controls (comma separated)</Label>
                    <Input name="controls" value={formData.controls.join(", ")} onChange={handleChange} />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>Profile Image</Label>
                <Input type="file" name="profileImage" accept="image/*" onChange={handleChange} />
                {formData.profileImage && (
                  <img
                    src={URL.createObjectURL(formData.profileImage)}
                    alt="Preview"
                    style={{ width: "80px", marginTop: "10px", borderRadius: "6px" }}
                  />
                )}
              </FormGroup>

              {editing && (
                <FormGroup>
                  <Label>Status</Label>
                  <Input type="select" name="status" value={formData.status} onChange={handleChange}>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </Input>
                </FormGroup>
              )}

            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">Save</Button>
              <Button color="secondary" onClick={toggleModal}>Cancel</Button>
            </ModalFooter>
          </Form>
        </Modal>

      </CardBody>
    </Card>
  );
};

export default AdminUserManagement;
