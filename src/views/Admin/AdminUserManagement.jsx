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
  isActive: true,
};

/* ================= REGEX ================= */
const ENGLISH_TEXT_ONLY    = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;
const PHONE_REGEX          = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
const EMAIL_REGEX          = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX       =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* ================= FIELD VALIDATOR ================= */
const validateField = (name, value, isEditing = false) => {
  // password is optional during edit
  if (name === "password" && isEditing) return "";

  // fields that are never text-validated
  if (["profileImage", "isActive", "role", "status"].includes(name)) return "";

  const trimmed = Array.isArray(value)
    ? value.join(",").trim()
    : (value ?? "").trim();

  if (!trimmed) return "This field is required.";

  switch (name) {
    case "name":
      if (!ENGLISH_TEXT_ONLY.test(trimmed))
        return "Name must contain English letters only.";
      if (trimmed.length < 2)
        return "Name must be at least 2 characters.";
      break;

    case "userDeginations":
      if (!ENGLISH_TEXT_ONLY.test(trimmed))
        return "Designation must be in English letters only.";
      break;

    case "mobile":
      if (!PHONE_REGEX.test(trimmed))
        return "Enter a valid 10-digit Indian mobile number.";
      break;

    case "email":
      if (!EMAIL_REGEX.test(trimmed))
        return "Enter a valid email address (e.g. john@example.com).";
      break;

    case "password":
      if (!PASSWORD_REGEX.test(trimmed))
        return "Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&).";
      break;

    case "permissions":
    case "controls":
      if (!ENGLISH_WITH_NUMBERS.test(trimmed.replace(/,/g, " ")))
        return "Only English letters and numbers are allowed.";
      break;

    default:
      break;
  }

  return "";
};

/* ================================================= */
const AdminUserManagement = () => {
  const { isHindi } = useLanguage();

  const [users, setUsers]             = useState([]);
  const [modal, setModal]             = useState(false);
  const [editing, setEditing]         = useState(null);
  const [formData, setFormData]       = useState(initialForm);
  const [loading, setLoading]         = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [errors, setErrors]           = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data?.data || []);
    } catch {
      Swal.fire("Error", "Failed to load users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  /* ================= MODAL TOGGLE ================= */
  const openModal  = ()  => { setModal(true); };
  const closeModal = ()  => {
    setModal(false);
    setEditing(null);
    setFormData(initialForm);
    setErrors({});
    setShowPassword(false);
    setImagePreview(null);
  };

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    let newValue;

    if (type === "file") {
      const file = files[0] || null;
      newValue = file;
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else if (name === "permissions" || name === "controls") {
      newValue = value.split(",").map((v) => v.trim()).filter(Boolean);
    } else if (type === "checkbox") {
      newValue = checked;
    } else {
      newValue = value;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // live validation
    const rawForValidation = Array.isArray(newValue)
      ? newValue.join(",")
      : newValue;

    const error = validateField(name, rawForValidation, !!editing);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* ================= FULL FORM VALIDATE ================= */
  const validateForm = () => {
    const fieldsToValidate = ["name", "email", "mobile", "userDeginations"];
    if (!editing) fieldsToValidate.push("password");

    const newErrors = {};
    fieldsToValidate.forEach((key) => {
      const value = Array.isArray(formData[key])
        ? formData[key].join(",")
        : formData[key];
      const error = validateField(key, value, !!editing);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire("Validation Error", "Please fix the highlighted fields before saving.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      });

      if (editing) {
        await axios.put(`${API_URL}/api/update-user/${editing._id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("Updated!", "Officer updated successfully.", "success");
      } else {
        await axios.post(`${API_URL}/api/create-user`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire("Created!", "Officer created successfully.", "success");
      }

      closeModal();
      loadUsers();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Operation failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (user) => {
    setEditing(user);
    setFormData({
      name:            user.name            || "",
      email:           user.email           || "",
      mobile:          user.mobile          || "",
      password:        "",
      role:            user.role            || "OFFICER",
      userDeginations: user.userDeginations || "",
      permissions:     user.permissions     || [],
      controls:        user.controls        || [],
      profileImage:    null,
      status:          user.status          || "PENDING",
      isActive:        user.isActive        ?? true,
    });
    setErrors({});
    setImagePreview(null);
    openModal();
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
      text: isHindi
        ? "यह उपयोगकर्ता हमेशा के लिए हटाया जाएगा।"
        : "This officer will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isHindi ? "हाँ, हटाएँ" : "Yes, Delete",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Deleted!", "Officer has been deleted.", "success");
      loadUsers();
    } catch {
      Swal.fire("Error", "Failed to delete officer.", "error");
    }
  };

  /* ================= STATUS COLOR ================= */
  const statusColor = (status) => {
    if (status === "APPROVED")  return "success";
    if (status === "REJECTED")  return "danger";
    return "warning";
  };

  /* ================= RENDER ================= */
  return (
    <Card className="border-0 shadow-sm">
      <CardBody className="p-4">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">
              <FaUsers className="me-2 text-primary" />
              {isHindi ? "उपयोगकर्ता प्रबंधन" : "User Management"}
            </h4>
            <small className="text-muted">
              {isHindi ? "अधिकारियों का प्रबंधन करें" : "Manage Officers & Permissions"}
            </small>
          </div>

          <Button color="primary" onClick={openModal}>
            <FaPlus className="me-2" />
            {isHindi ? "नया अधिकारी" : "Add Officer"}
          </Button>
        </div>

        {/* TABLE */}
        <Table responsive hover striped className="align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Photo</th>
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
              <tr>
                <td colSpan="11" className="text-center py-4 text-muted">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-4 text-muted">
                  No officers found. Click <strong>Add Officer</strong> to get started.
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u._id}>
                  <td>{i + 1}</td>
                  <td>
                    {u.profileImage ? (
                      <img
                        src={`${API_URL}${u.profileImage}`}
                        height="40"
                        width="40"
                        alt={u.name}
                        className="rounded-circle"
                        style={{ objectFit: "cover" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{ width: 40, height: 40, fontSize: 14 }}
                      >
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold">{u.name}</td>
                  <td>
                    <Badge color="primary" pill>{u.role}</Badge>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.mobile}</td>
                  <td>
                    <Badge color="info" pill>{u.userDeginations || "—"}</Badge>
                  </td>
                  <td>
                    {u.permissions?.length
                      ? u.permissions.map((p, idx) => (
                          <Badge key={idx} color="secondary" className="me-1 mb-1">{p}</Badge>
                        ))
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    {u.controls?.length
                      ? u.controls.map((c, idx) => (
                          <Badge key={idx} color="dark" className="me-1 mb-1">{c}</Badge>
                        ))
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <Badge color={statusColor(u.status)} pill>
                      {u.status}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      color="primary"
                      className="me-1"
                      title="Edit Officer"
                      onClick={() => handleEdit(u)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      title="Delete Officer"
                      onClick={() => handleDelete(u._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* ================= MODAL ================= */}
        <Modal isOpen={modal} toggle={closeModal} size="lg" backdrop="static">
          <ModalHeader toggle={closeModal}>
            {editing
              ? (isHindi ? "अधिकारी संपादित करें" : "Edit Officer")
              : (isHindi ? "नया अधिकारी जोड़ें" : "Add New Officer")}
          </ModalHeader>

          <Form onSubmit={handleSubmit} noValidate>
            <ModalBody>

              <Row>
                {/* NAME */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="name">
                      Full Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      invalid={!!errors.name}
                      autoComplete="off"
                    />
                    {errors.name && (
                      <div className="invalid-feedback d-block">{errors.name}</div>
                    )}
                  </FormGroup>
                </Col>

                {/* EMAIL */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="email">
                      Email Address <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="e.g. officer@gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!!editing}
                      invalid={!!errors.email}
                      autoComplete="off"
                    />
                    {editing && (
                      <small className="text-muted">Email cannot be changed.</small>
                    )}
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                {/* MOBILE */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="mobile">
                      Mobile Number <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      placeholder="e.g. 9876543210"
                      value={formData.mobile}
                      onChange={handleChange}
                      invalid={!!errors.mobile}
                      maxLength={13}
                      autoComplete="off"
                    />
                    {errors.mobile && (
                      <div className="invalid-feedback d-block">{errors.mobile}</div>
                    )}
                  </FormGroup>
                </Col>

                {/* PASSWORD — only on create */}
                {!editing && (
                  <Col md={6}>
                    <FormGroup>
                      <Label for="password">
                        Password <span className="text-danger">*</span>
                      </Label>
                      <div className="position-relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Min 8 chars, A-Z, 0-9, @$!%*?&"
                          value={formData.password}
                          onChange={handleChange}
                          invalid={!!errors.password}
                          autoComplete="new-password"
                          style={{ paddingRight: "2.5rem" }}
                        />
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((p) => !p)}
                          onKeyDown={(e) => e.key === "Enter" && setShowPassword((p) => !p)}
                          className="position-absolute top-50 end-0 translate-middle-y pe-2 text-secondary"
                          style={{ cursor: "pointer", zIndex: 5 }}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                      </div>
                      {errors.password && (
                        <div className="invalid-feedback d-block">{errors.password}</div>
                      )}
                    </FormGroup>
                  </Col>
                )}
              </Row>

              <Row>
                {/* DESIGNATION */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="userDeginations">
                      Designation <span className="text-danger">*</span>
                    </Label>
                    <Input
                      id="userDeginations"
                      name="userDeginations"
                      placeholder="e.g. District Officer"
                      value={formData.userDeginations}
                      onChange={handleChange}
                      invalid={!!errors.userDeginations}
                      autoComplete="off"
                    />
                    {errors.userDeginations && (
                      <div className="invalid-feedback d-block">{errors.userDeginations}</div>
                    )}
                  </FormGroup>
                </Col>

                {/* ROLE */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="role">Role</Label>
                    <Input
                      id="role"
                      type="select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="OFFICER">Officer</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPERADMIN">Super Admin</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                {/* PERMISSIONS */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="permissions">
                      Permissions{" "}
                      <small className="text-muted">(comma separated)</small>
                    </Label>
                    <Input
                      id="permissions"
                      name="permissions"
                      placeholder="e.g. view reports, manage users"
                      value={formData.permissions.join(", ")}
                      onChange={handleChange}
                      invalid={!!errors.permissions}
                      autoComplete="off"
                    />
                    <small className="text-muted">
                      Separate each permission with a comma.
                    </small>
                    {errors.permissions && (
                      <div className="invalid-feedback d-block">{errors.permissions}</div>
                    )}
                  </FormGroup>
                </Col>

                {/* CONTROLS */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="controls">
                      Controls{" "}
                      <small className="text-muted">(comma separated)</small>
                    </Label>
                    <Input
                      id="controls"
                      name="controls"
                      placeholder="e.g. dashboard, reports, users"
                      value={formData.controls.join(", ")}
                      onChange={handleChange}
                      invalid={!!errors.controls}
                      autoComplete="off"
                    />
                    <small className="text-muted">
                      Separate each control with a comma.
                    </small>
                    {errors.controls && (
                      <div className="invalid-feedback d-block">{errors.controls}</div>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                {/* PROFILE IMAGE */}
                <Col md={6}>
                  <FormGroup>
                    <Label for="profileImage">Profile Photo</Label>
                    <Input
                      id="profileImage"
                      type="file"
                      name="profileImage"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleChange}
                    />
                    <small className="text-muted">JPG, PNG or WEBP. Max 2MB.</small>

                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="rounded"
                          style={{ width: 80, height: 80, objectFit: "cover", border: "2px solid #dee2e6" }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          color="link"
                          className="text-danger d-block mt-1 p-0"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData((prev) => ({ ...prev, profileImage: null }));
                          }}
                        >
                          Remove photo
                        </Button>
                      </div>
                    )}
                  </FormGroup>
                </Col>

                {/* STATUS — only on edit */}
                {editing && (
                  <Col md={6}>
                    <FormGroup>
                      <Label for="status">Status</Label>
                      <Input
                        id="status"
                        type="select"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </Input>
                    </FormGroup>
                  </Col>
                )}
              </Row>

            </ModalBody>

            <ModalFooter>
              <Button color="secondary" type="button" onClick={closeModal} disabled={submitting}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={submitting}>
                {submitting
                  ? (editing ? "Saving..." : "Creating...")
                  : (editing ? "Save Changes" : "Create Officer")}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

      </CardBody>
    </Card>
  );
};

export default AdminUserManagement;