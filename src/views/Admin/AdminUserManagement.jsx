import { useEffect, useState } from "react";
import {
  Card, CardBody, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col,
} from "reactstrap";
import { FaUsers, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
const token = sessionStorage.getItem("authToken");
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

const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;

const PHONE_REGEX = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const AdminUserManagement = () => {
  const { isHindi } = useLanguage();

  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-all-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
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

  const validateField = (name, value) => {
    if (!value || !value.trim()) return "This field is required";

    switch (name) {
      case "name":
        if (!ENGLISH_TEXT_ONLY.test(value))
          return "Name must contain English characters only";
        break;

      case "userDeginations":
        if (!ENGLISH_TEXT_ONLY.test(value))
          return "Designation must be in English only";
        break;

      case "mobile":
        if (!PHONE_REGEX.test(value))
          return "Invalid mobile number";
        break;

      case "email":
        if (!EMAIL_REGEX.test(value))
          return "Invalid email address";
        break;

      case "permissions":
      case "controls":
        // comma-separated English words
        if (!ENGLISH_WITH_NUMBERS.test(value.replace(/,/g, "")))
          return "Only English text and numbers allowed";
        break;
      case "password":
        if (!PASSWORD_REGEX.test(value))
          return "Password must be 8+ chars with uppercase, lowercase, number & special character";
        break;
      default:
        break;
    }

    return "";
  };

  /* ================= INPUT CHANGE ================= */
  // const handleChange = (e) => {
  //   const { name, value, type, checked, files } = e.target;

  //   if (type === "file") {
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: files[0] || null
  //     }));
  //     return;
  //   }

  //   if (name === "permissions" || name === "controls") {
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: value.split(",").map(v => v.trim()).filter(Boolean)
  //     }));
  //   } else {
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: type === "checkbox" ? checked : value
  //     }));
  //   }

  // };
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    let newValue;

    if (type === "file") {
      newValue = files[0] || null;
    } else if (name === "permissions" || name === "controls") {
      newValue = value.split(",").map(v => v.trim()).filter(Boolean);
    } else if (type === "checkbox") {
      newValue = checked;
    } else {
      newValue = value;
    }

    // update form data
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // validate immediately
    const error = validateField(
      name,
      Array.isArray(newValue) ? newValue.join(",") : newValue
    );

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach(key => {
      if (["permissions", "controls", "profileImage", "isActive"].includes(key))
        return;

      const value =
        Array.isArray(formData[key]) ? formData[key].join(",") : formData[key];

      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire(
        "Validation Error",
        "Please fix the highlighted errors",
        "warning"
      );
      return;
    }

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
              <th>Role</th>
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
                    <img src={`${API_URL}${u.profileImage}`} height="45" width="45" alt="Profile" className="rounded" style={{ objectFit: 'cover' }} />
                  </td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
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
                    <Button size="sm" color="primary" className="me-1 p-2" onClick={() => handleEdit(u)}>
                      <FaEdit />
                    </Button>
                    <Button size="sm" color="danger" className="p-2" onClick={() => handleDelete(u._id)}>
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
                    <Input name="name" value={formData.name} onChange={handleChange} required invalid={!!errors.name} />
                    {errors.name && <small className="text-danger">{errors.name}</small>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Email</Label>
                    <Input type="email" autoComplete="off" name="email" value={formData.email} onChange={handleChange} disabled={!!editing} required invalid={!!errors.email} />
                    {errors.email && <small className="text-danger">{errors.email}</small>}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Mobile</Label>
                    <Input name="mobile" autoComplete="off" value={formData.mobile} onChange={handleChange} required invalid={!!errors.mobile} maxLength={10} />
                    {errors.mobile && <small className="text-danger">{errors.mobile}</small>}
                  </FormGroup>
                </Col>
                {!editing && (
                  <Col md={6}>
                    <FormGroup>
                      <Label>Password</Label>

                      <div style={{ position: "relative" }}>
                        <Input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="off"
                          invalid={!!errors.password}
                        />

                        <span
                          onClick={() => setShowPassword(prev => !prev)}
                          style={{
                            position: "absolute",
                            top: "50%",
                            right: "10px",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            color: "#6c757d",
                            zIndex: 2
                          }}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>

                      {errors.password && (
                        <small className="text-danger">{errors.password}</small>
                      )}
                    </FormGroup>
                  </Col>
                )}

              </Row>

              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Designation</Label>
                    <Input name="userDeginations" autoComplete="off"
                      data-form-type="other" value={formData.userDeginations} onChange={handleChange} required invalid={!!errors.userDeginations} />
                    {errors.userDeginations && <small className="text-danger">{errors.userDeginations}</small>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Permissions (comma separated)</Label>
                    <Input autoComplete="off" name="permissions" value={formData.permissions.join(", ")} onChange={handleChange} invalid={!!errors.permissions} />
                    {errors.permissions && <small className="text-danger">{errors.permissions}</small>}
                  </FormGroup>
                </Col>

              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label>Controls (comma separated)</Label>
                    <Input autoComplete="off" name="controls" value={formData.controls.join(", ")} onChange={handleChange} invalid={!!errors.controls} />
                    {errors.controls && <small className="text-danger">{errors.controls}</small>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label>Profile Image</Label>
                    <Input type="file" name="profileImage" accept="image/*" onChange={handleChange} invalid={!!errors.profileImage} />
                    {errors.profileImage && <small className="text-danger">{errors.profileImage}</small>}

                    {formData.profileImage && (
                      <img
                        src={URL.createObjectURL(formData.profileImage)}
                        alt="Preview"
                        style={{ width: "80px", marginTop: "10px", borderRadius: "6px" }}
                      />
                    )}
                  </FormGroup>
                </Col>

              </Row>
              {editing && (
                <FormGroup>
                  <Label>Status</Label>
                  <Input type="select" name="status" value={formData.status} onChange={handleChange} invalid={!!errors.profileImage}>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </Input>
                  {errors.status && <small className="text-danger">{errors.status}</small>}
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
