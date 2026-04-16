import { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col,
  Spinner, Alert,
} from "reactstrap";
import {
  FaUsers, FaPlus, FaEdit, FaTrash,
  FaEye, FaEyeSlash, FaUserShield,
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
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
  if (name === "password" && isEditing) return "";
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

/* ================= HELPERS ================= */
const headerGradient = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

const statusColor = (status) => {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warning";
};

const roleColor = (role) => {
  if (role === "SUPERADMIN") return "danger";
  if (role === "ADMIN") return "primary";
  return "info";
};

/* ================================================= */
const AdminUserManagement = () => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [users, setUsers]               = useState([]);
  const [modal, setModal]               = useState(false);
  const [editing, setEditing]           = useState(null);
  const [formData, setFormData]         = useState(initialForm);
  const [loading, setLoading]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [errors, setErrors]             = useState({});
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
  const openModal  = () => setModal(true);
  const closeModal = () => {
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

    const rawForValidation = Array.isArray(newValue) ? newValue.join(",") : newValue;
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
      Swal.fire(
        "Validation Error",
        "Please fix the highlighted fields before saving.",
        "warning"
      );
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
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed. Please try again.",
        "error"
      );
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

  /* ================= RENDER ================= */
  return (
    <Card className="border-0 shadow-sm overflow-hidden">

      {/* ── Gradient Header ── */}
      <CardHeader
        className="border-0 py-4"
        style={headerGradient}
      >
        <Row className="align-items-center">
          <Col>
            <h4 className="fw-bold mb-1 text-white d-flex align-items-center gap-2">
              <FaUsers />
              {isHindi ? "उपयोगकर्ता प्रबंधन" : "User Management"}
            </h4>
            <p className="text-white-50 mb-0 small">
              {isHindi
                ? "अधिकारियों का प्रबंधन करें"
                : "Manage officers, roles & permissions"}
            </p>
          </Col>
          <Col xs="auto" className="d-flex gap-2 flex-wrap justify-content-end">
            {/* Session Manager Button */}
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1 border-white border-opacity-50 text-white"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)" }}
              onClick={() => navigate("/admin/session-manager")}
              title="View Session Manager"
            >
              <FaUserShield />
              {isHindi ? "सेशन" : "Sessions"}
            </Button>

            {/* Add Officer Button */}
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1 text-primary shadow-sm"
              onClick={openModal}
            >
              <FaPlus />
              {isHindi ? "नया अधिकारी" : "Add Officer"}
            </Button>
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">

        {/* ── Stats Row ── */}
        <div
          className="px-4 py-3 border-bottom d-flex align-items-center gap-3 flex-wrap"
          style={{ backgroundColor: "#f8f9ff" }}
        >
          <small className="text-muted fw-semibold">
            Total Officers:{" "}
            <Badge color="primary" pill className="ms-1" style={{ fontSize: "12px" }}>
              {users.length}
            </Badge>
          </small>
          <small className="text-muted fw-semibold">
            Active:{" "}
            <Badge color="success" pill className="ms-1" style={{ fontSize: "12px" }}>
              {users.filter((u) => u.isActive).length}
            </Badge>
          </small>
          <small className="text-muted fw-semibold">
            Approved:{" "}
            <Badge color="success" pill className="ms-1" style={{ fontSize: "12px" }}>
              {users.filter((u) => u.status === "APPROVED").length}
            </Badge>
          </small>
          <small className="text-muted fw-semibold">
            Pending:{" "}
            <Badge color="warning" pill className="ms-1" style={{ fontSize: "12px" }}>
              {users.filter((u) => u.status === "PENDING").length}
            </Badge>
          </small>
        </div>

        {/* ── Table ── */}
        <div className="table-responsive">
          <Table hover striped className="mb-0 align-middle">
            <thead style={headerGradient}>
              <tr>
                {["#", "Photo", "Name", "Role", "Email", "Mobile", "Designation", "Permissions", "Controls", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      className="text-white fw-semibold"
                      style={{ fontSize: "13px", whiteSpace: "nowrap", padding: "12px 14px" }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <Spinner color="primary" style={{ width: "2.5rem", height: "2.5rem" }} />
                    <p className="text-muted mt-2 mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                      Loading officers...
                    </p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-5">
                    <div style={{ fontSize: "3rem", lineHeight: 1 }}>👤</div>
                    <p className="text-muted mt-2 mb-0 fw-semibold" style={{ fontSize: "14px" }}>
                      No officers found.{" "}
                      <span
                        className="text-primary"
                        style={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={openModal}
                      >
                        Add one now
                      </span>
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u, i) => (
                  <tr
                    key={u._id}
                    style={{
                      backgroundColor: i % 2 === 0 ? "rgba(102,126,234,0.02)" : "transparent",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(102,126,234,0.06)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        i % 2 === 0 ? "rgba(102,126,234,0.02)" : "transparent")
                    }
                  >
                    {/* # */}
                    <td
                      className="fw-bold text-muted text-center"
                      style={{ fontSize: "13px", width: "48px" }}
                    >
                      {i + 1}
                    </td>

                    {/* Photo */}
                    <td style={{ width: "56px" }}>
                      {u.profileImage ? (
                        <img
                          src={`${API_URL}${u.profileImage}`}
                          height="40"
                          width="40"
                          alt={u.name}
                          className="rounded-circle"
                          style={{
                            objectFit: "cover",
                            border: "2px solid #e0e7ff",
                            boxShadow: "0 1px 4px rgba(102,126,234,0.25)",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: 40,
                            height: 40,
                            fontSize: 14,
                            ...headerGradient,
                            boxShadow: "0 1px 4px rgba(102,126,234,0.3)",
                          }}
                        >
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td>
                      <div className="fw-semibold text-dark" style={{ fontSize: "13px" }}>
                        {u.name}
                      </div>
                      <small
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        {u.isActive ? "🟢 Active" : "⚪ Inactive"}
                      </small>
                    </td>

                    {/* Role */}
                    <td>
                      <Badge
                        color={roleColor(u.role)}
                        pill
                        style={{ fontSize: "11px", letterSpacing: "0.3px" }}
                      >
                        {u.role}
                      </Badge>
                    </td>

                    {/* Email */}
                    <td style={{ fontSize: "13px" }}>{u.email}</td>

                    {/* Mobile */}
                    <td style={{ fontSize: "13px" }}>{u.mobile}</td>

                    {/* Designation */}
                    <td>
                      {u.userDeginations ? (
                        <Badge
                          color="info"
                          pill
                          style={{ fontSize: "11px" }}
                        >
                          {u.userDeginations}
                        </Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Permissions */}
                    <td style={{ maxWidth: "160px" }}>
                      {u.permissions?.length ? (
                        <div className="d-flex flex-wrap gap-1">
                          {u.permissions.map((p, idx) => (
                            <Badge
                              key={idx}
                              color="secondary"
                              style={{ fontSize: "10px" }}
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Controls */}
                    <td style={{ maxWidth: "160px" }}>
                      {u.controls?.length ? (
                        <div className="d-flex flex-wrap gap-1">
                          {u.controls.map((c, idx) => (
                            <Badge
                              key={idx}
                              color="dark"
                              style={{ fontSize: "10px" }}
                            >
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <Badge
                        color={statusColor(u.status)}
                        pill
                        style={{ fontSize: "11px" }}
                      >
                        {u.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          size="sm"
                          color="primary"
                          title="Edit Officer"
                          onClick={() => handleEdit(u)}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          title="Delete Officer"
                          onClick={() => handleDelete(u._id)}
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* ── Footer info ── */}
        {!loading && users.length > 0 && (
          <div
            className="px-4 py-2 border-top d-flex align-items-center justify-content-between"
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <small className="text-muted">
              Showing <strong>{users.length}</strong> officer(s)
            </small>
            <Button
              color="outline-primary"
              size="sm"
              onClick={loadUsers}
              style={{ fontSize: "12px" }}
            >
              🔄 Refresh
            </Button>
          </div>
        )}
      </CardBody>

      {/* ================= MODAL ================= */}
      <Modal isOpen={modal} toggle={closeModal} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={closeModal}
          style={{ ...headerGradient, color: "#fff" }}
          close={
            <button
              className="btn-close btn-close-white"
              onClick={closeModal}
            />
          }
        >
          {editing
            ? (isHindi ? "✏️ अधिकारी संपादित करें" : "✏️ Edit Officer")
            : (isHindi ? "➕ नया अधिकारी जोड़ें" : "➕ Add New Officer")}
        </ModalHeader>

        <Form onSubmit={handleSubmit} noValidate>
          <ModalBody className="p-4">
            <Row>
              {/* NAME */}
              <Col md={6}>
                <FormGroup>
                  <Label for="name" className="fw-semibold" style={{ fontSize: "13px" }}>
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
                    style={{ fontSize: "14px" }}
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.name}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* EMAIL */}
              <Col md={6}>
                <FormGroup>
                  <Label for="email" className="fw-semibold" style={{ fontSize: "13px" }}>
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
                    style={{ fontSize: "14px" }}
                  />
                  {editing && (
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Email cannot be changed.
                    </small>
                  )}
                  {errors.email && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.email}
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row>
              {/* MOBILE */}
              <Col md={6}>
                <FormGroup>
                  <Label for="mobile" className="fw-semibold" style={{ fontSize: "13px" }}>
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
                    style={{ fontSize: "14px" }}
                  />
                  {errors.mobile && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.mobile}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* PASSWORD — only on create */}
              {!editing && (
                <Col md={6}>
                  <FormGroup>
                    <Label for="password" className="fw-semibold" style={{ fontSize: "13px" }}>
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
                        style={{ paddingRight: "2.5rem", fontSize: "14px" }}
                      />
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((p) => !p)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setShowPassword((p) => !p)
                        }
                        className="position-absolute top-50 end-0 translate-middle-y pe-2 text-secondary"
                        style={{ cursor: "pointer", zIndex: 5 }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.password && (
                      <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                        {errors.password}
                      </div>
                    )}
                  </FormGroup>
                </Col>
              )}
            </Row>

            <Row>
              {/* DESIGNATION */}
              <Col md={6}>
                <FormGroup>
                  <Label for="userDeginations" className="fw-semibold" style={{ fontSize: "13px" }}>
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
                    style={{ fontSize: "14px" }}
                  />
                  {errors.userDeginations && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.userDeginations}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* ROLE */}
              <Col md={6}>
                <FormGroup>
                  <Label for="role" className="fw-semibold" style={{ fontSize: "13px" }}>
                    Role
                  </Label>
                  <Input
                    id="role"
                    type="select"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ fontSize: "14px" }}
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
                  <Label for="permissions" className="fw-semibold" style={{ fontSize: "13px" }}>
                    Permissions{" "}
                    <small className="text-muted fw-normal">(comma separated)</small>
                  </Label>
                  <Input
                    id="permissions"
                    name="permissions"
                    placeholder="e.g. view reports, manage users"
                    value={formData.permissions.join(", ")}
                    onChange={handleChange}
                    invalid={!!errors.permissions}
                    autoComplete="off"
                    style={{ fontSize: "14px" }}
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Separate each permission with a comma.
                  </small>
                  {errors.permissions && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.permissions}
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* CONTROLS */}
              <Col md={6}>
                <FormGroup>
                  <Label for="controls" className="fw-semibold" style={{ fontSize: "13px" }}>
                    Controls{" "}
                    <small className="text-muted fw-normal">(comma separated)</small>
                  </Label>
                  <Input
                    id="controls"
                    name="controls"
                    placeholder="e.g. dashboard, reports, users"
                    value={formData.controls.join(", ")}
                    onChange={handleChange}
                    invalid={!!errors.controls}
                    autoComplete="off"
                    style={{ fontSize: "14px" }}
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Separate each control with a comma.
                  </small>
                  {errors.controls && (
                    <div className="invalid-feedback d-block" style={{ fontSize: "12px" }}>
                      {errors.controls}
                    </div>
                  )}
                </FormGroup>
              </Col>
            </Row>

            <Row>
              {/* PROFILE IMAGE */}
              <Col md={6}>
                <FormGroup>
                  <Label for="profileImage" className="fw-semibold" style={{ fontSize: "13px" }}>
                    Profile Photo
                  </Label>
                  <Input
                    id="profileImage"
                    type="file"
                    name="profileImage"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    style={{ fontSize: "14px" }}
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    JPG, PNG or WEBP. Max 2MB.
                  </small>

                  {imagePreview && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded"
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          border: "2px solid #dee2e6",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        color="outline-danger"
                        style={{ fontSize: "12px" }}
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, profileImage: null }));
                        }}
                      >
                        ✕ Remove
                      </Button>
                    </div>
                  )}
                </FormGroup>
              </Col>

              {/* STATUS — only on edit */}
              {editing && (
                <Col md={6}>
                  <FormGroup>
                    <Label for="status" className="fw-semibold" style={{ fontSize: "13px" }}>
                      Status
                    </Label>
                    <Input
                      id="status"
                      type="select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      style={{ fontSize: "14px" }}
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

          <ModalFooter className="bg-light border-top">
            <Button
              color="secondary"
              outline
              type="button"
              onClick={closeModal}
              disabled={submitting}
              style={{ fontSize: "14px" }}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={submitting}
              style={{ fontSize: "14px", minWidth: "140px" }}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  {editing ? "Saving..." : "Creating..."}
                </>
              ) : (
                editing ? "💾 Save Changes" : "✅ Create Officer"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

    </Card>
  );
};

export default AdminUserManagement;