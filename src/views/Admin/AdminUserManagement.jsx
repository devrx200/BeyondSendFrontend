import { useEffect, useState, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col,
  Spinner, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaUsers, FaPlus, FaEdit, FaTrash,
  FaEye, FaEyeSlash, FaUserShield, FaCheck, FaTimes,
  FaSearch, FaFilter, FaBuilding, FaUserTie, FaShieldAlt,
  FaSyncAlt
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import PageLoader from "../../components/PageLoader";
import { jwtDecode } from "jwt-decode";

/* ================= INITIAL FORM ================= */
const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "OFFICER",
  employeeType: "DIRECTORATE",
  userDesignations: "",
  permissions: [],
  controls: [],
  profileImage: null,
  status: "APPROVED",
  isActive: true,
};

/* ================= REGEX VALIDATORS ================= */
const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-_/\n\r]+$/;
const PHONE_REGEX = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* ================= FIELD VALIDATOR ================= */
const validateField = (name, value, isEditing = false) => {
  if (name === "password" && isEditing && !value) return "";
  if (["profileImage", "isActive", "role", "status", "employeeType"].includes(name)) return "";

  const trimmed = Array.isArray(value)
    ? value.join(",").trim()
    : (value ?? "").toString().trim();

  if (!trimmed && ["name", "email", "mobile", "userDesignations"].includes(name)) {
    return "This field is required.";
  }
  if (!trimmed) return "";

  switch (name) {
    case "name":
      if (!ENGLISH_TEXT_ONLY.test(trimmed))
        return "Name must contain English letters only.";
      if (trimmed.length < 2)
        return "Name must be at least 2 characters.";
      break;
    case "userDesignations":
      if (!ENGLISH_TEXT_ONLY.test(trimmed))
        return "Designation must be in English letters only.";
      break;
    case "mobile":
      if (!PHONE_REGEX.test(trimmed))
        return "Enter a valid 10-digit Indian mobile number.";
      break;
    case "email":
      if (!EMAIL_REGEX.test(trimmed))
        return "Enter a valid email address (e.g. officer@gov.in).";
      break;
    case "password":
      if (!PASSWORD_REGEX.test(trimmed))
        return "Min 8 chars with uppercase, lowercase, number & special char (@$!%*?&).";
      break;
    case "permissions":
    case "controls":
      if (!ENGLISH_WITH_NUMBERS.test(trimmed.replace(/,/g, " ")))
        return "Only letters, numbers, and hyphens/underscores allowed.";
      break;
    default:
      break;
  }
  return "";
};

/* ================= HELPERS & THEMES ================= */
const headerGradient = {
  background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)",
};

const getEmployeeTypeBadge = (type) => {
  switch (type?.toUpperCase()) {
    case "NIC":
      return { bg: "#7c3aed", color: "#ffffff", label: "NIC SuperAdmin" };
    case "DIRECTORATE":
      return { bg: "#0f766e", color: "#ffffff", label: "Directorate" };
    case "DEPARTMENT":
      return { bg: "#0d9488", color: "#ffffff", label: "Department" };
    default:
      return { bg: "#64748b", color: "#ffffff", label: type || "N/A" };
  }
};

const getRoleBadge = (role) => {
  switch (role?.toUpperCase()) {
    case "NIC":
      return { bg: "#6d28d9", color: "#ffffff", label: "NIC" };
    case "ADMIN":
      return { bg: "#0f766e", color: "#ffffff", label: "Admin" };
    case "OFFICER":
      return { bg: "#059669", color: "#ffffff", label: "Officer" };
    default:
      return { bg: "#475569", color: "#ffffff", label: role || "Officer" };
  }
};

/* ================================================= */
const AdminUserManagement = () => {
  const token = sessionStorage.getItem("authToken");
  const API_URL = import.meta.env.VITE_API_URL;
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployeeType, setFilterEmployeeType] = useState("ALL");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Decode Token and Logged-In User Information
  const currentUser = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const storedUser = useMemo(() => {
    try {
      const data = sessionStorage.getItem("userData") || sessionStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const loggedInId = currentUser?._id || currentUser?.id || currentUser?.userId || storedUser?._id || storedUser?.id || storedUser?.userId;
  const loggedInEmail = (currentUser?.email || storedUser?.email || "").toLowerCase().trim();

  const loggedRole = (currentUser?.role || storedUser?.role || window.userRole || "").toUpperCase();
  const loggedEmployeeType = (currentUser?.employeeType || storedUser?.employeeType || window.employeeType || "").toUpperCase();

  const isNIC = loggedRole === "NIC" || loggedEmployeeType === "NIC";
  const isDirectorateAdmin = loggedRole === "ADMIN" && loggedEmployeeType === "DIRECTORATE";
  const isDepartmentAdmin = loggedRole === "ADMIN" && loggedEmployeeType === "DEPARTMENT";

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = res.data?.data || [];

      // Hierarchy filtering:
      // 1. NIC: Sees ALL users without restriction
      // 2. Directorate Admin: Sees ALL Directorate and Department users (he is the boss of the portal)
      // 3. Department Admin: Sees only DEPARTMENT users
      let visibleUsers = allUsers;
      if (isNIC) {
        visibleUsers = allUsers;
      } else if (isDirectorateAdmin) {
        // Directorate Admin sees all Directorate and Department users (filters out NIC superadmin if any)
        visibleUsers = allUsers.filter((u) => u.employeeType !== "NIC" && u.role !== "NIC");
      } else if (isDepartmentAdmin) {
        visibleUsers = allUsers.filter((u) => u.employeeType === "DEPARTMENT");
      }

      // Filter out self account so the logged-in user does not see themselves in the management list
      visibleUsers = visibleUsers.filter((u) => {
        const uId = u._id || u.id;
        const uEmail = (u.email || "").toLowerCase().trim();
        const isSelf =
          (loggedInId && uId && String(uId) === String(loggedInId)) ||
          (loggedInEmail && uEmail && uEmail === loggedInEmail);
        return !isSelf;
      });

      setUsers(visibleUsers);
    } catch (err) {
      console.error("Failed to load users", err);
      Swal.fire("Error", "Failed to load users. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [API_URL, token]);

  /* ================= FILTERED USERS ================= */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile?.includes(searchQuery) ||
        u.userDesignations?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchEmpType =
        filterEmployeeType === "ALL" || u.employeeType === filterEmployeeType;

      const matchRole =
        filterRole === "ALL" || u.role === filterRole;

      const matchStatus =
        filterStatus === "ALL" ||
        (filterStatus === "ACTIVE" && u.isActive) ||
        (filterStatus === "INACTIVE" && !u.isActive) ||
        u.status === filterStatus;

      return matchSearch && matchEmpType && matchRole && matchStatus;
    });
  }, [users, searchQuery, filterEmployeeType, filterRole, filterStatus]);

  /* ================= MODAL TOGGLE & INITIALIZATION ================= */
  const openModal = () => {
    let defaultEmpType = "DIRECTORATE";
    let defaultRole = "OFFICER";

    if (isDepartmentAdmin) {
      defaultEmpType = "DEPARTMENT";
      defaultRole = "OFFICER";
    } else if (isDirectorateAdmin) {
      defaultEmpType = "DIRECTORATE";
      defaultRole = "OFFICER";
    } else if (isNIC) {
      defaultEmpType = "DIRECTORATE";
      defaultRole = "OFFICER";
    }

    setFormData({
      ...initialForm,
      employeeType: defaultEmpType,
      role: defaultRole,
      status: "APPROVED",
      isActive: true,
    });
    setErrors({});
    setImagePreview(null);
    setShowPassword(false);
    setEditing(null);
    setModal(true);
  };

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
    } else if (name === "isActive") {
      newValue = value === "true" || value === true;
    } else if (type === "checkbox") {
      newValue = checked;
    } else {
      newValue = value;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Role adjustment on employeeType change if not editing
      if (name === "employeeType") {
        if (newValue === "DEPARTMENT") {
          // If Directorate Admin creates for Department, can default to ADMIN or OFFICER
          updated.role = isDirectorateAdmin ? "ADMIN" : "OFFICER";
        } else if (newValue === "DIRECTORATE") {
          updated.role = "OFFICER";
        } else if (newValue === "NIC") {
          updated.role = "NIC";
        }
      }

      return updated;
    });

    const rawForValidation = Array.isArray(newValue) ? newValue.join(",") : newValue;
    const error = validateField(name, rawForValidation, !!editing);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* ================= FORM VALIDATION ================= */
  const validateForm = () => {
    const fieldsToValidate = ["name", "email", "mobile", "userDesignations"];
    if (!editing) fieldsToValidate.push("password");
    else if (formData.password) fieldsToValidate.push("password");

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

  /* ================= SUBMIT CREATE / EDIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      Swal.fire({
        icon: "warning",
        title: isHindi ? "अमान्य फ़ील्ड" : "Validation Error",
        text: isHindi ? "कृपया हाइलाइट की गई त्रुटियों को ठीक करें।" : "Please fix the highlighted fields before saving."
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        if (key === "password" && editing && !value) return; // don't send empty password on edit
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
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफल" : "Updated!",
          text: isHindi ? "उपयोगकर्ता विवरण सफलतापूर्वक अद्यतन किया गया।" : "User details updated successfully.",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API_URL}/api/create-user`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफल" : "Created!",
          text: isHindi ? "नया उपयोगकर्ता सफलतापूर्वक जोड़ा गया।" : "New user created successfully.",
          timer: 1500,
          showConfirmButton: false
        });
      }

      closeModal();
      loadUsers();
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || "Operation failed. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT USER ================= */
  const handleEdit = (user) => {
    // Check permission:
    if (user.role === "NIC" && !isNIC) {
      return Swal.fire("Permission Denied", "Only NIC SuperAdmins can edit NIC accounts.", "warning");
    }

    setEditing(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: user.role || "OFFICER",
      employeeType: user.employeeType || "DIRECTORATE",
      userDesignations: user.userDesignations || "",
      permissions: user.permissions || [],
      controls: user.controls || [],
      profileImage: null,
      status: user.status || "APPROVED",
      isActive: user.isActive ?? true,
    });
    setErrors({});
    setImagePreview(user.profileImage ? `${API_URL}${user.profileImage}` : null);
    setModal(true);
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async (user) => {
    if (user.role === "NIC" && !isNIC) {
      return Swal.fire("Permission Denied", "Only NIC SuperAdmins can delete NIC accounts.", "warning");
    }

    const result = await Swal.fire({
      title: isHindi ? "क्या आप निश्चित हैं?" : `Delete "${user.name}"?`,
      text: isHindi
        ? "यह उपयोगकर्ता हमेशा के लिए हटाया जाएगा।"
        : "This user account will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: isHindi ? "हाँ, हटाएँ" : "Yes, Delete",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/delete-user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire("Deleted!", "User has been deleted.", "success");
      loadUsers();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete user.", "error");
    }
  };

  /* ================= QUICK APPROVE / REJECT ================= */
  const handleQuickStatus = async (user, newStatus) => {
    try {
      const payload = new FormData();
      payload.append("status", newStatus);

      await axios.put(`${API_URL}/api/update-user/${user._id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: `Status set to ${newStatus}`,
        timer: 1200,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  /* ================= QUICK ACTIVE TOGGLE ================= */
  const handleToggleActive = async (user) => {
    try {
      const payload = new FormData();
      payload.append("isActive", !user.isActive);

      await axios.put(`${API_URL}/api/update-user/${user._id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: "success",
        title: user.isActive ? "User Deactivated" : "User Activated",
        timer: 1200,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      Swal.fire("Error", "Failed to toggle status", "error");
    }
  };

  /* ================= PERMISSION CHECKS FOR ACTIONS ================= */
  const canCreateUser = isNIC || isDirectorateAdmin || isDepartmentAdmin;

  return (
    <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* ── GRADIENT HEADER ── */}
      <CardHeader className="border-0 py-3.5 px-4 text-white" style={headerGradient}>
        <Row className="align-items-center g-2">
          <Col xs={12} sm={6}>
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <FaUsers size={20} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-white" style={{ letterSpacing: "-0.2px" }}>
                  {isHindi ? "उपयोगकर्ता एवं अधिकारी प्रबंधन" : "User & Officer Management"}
                </h5>
                <small className="text-white-50" style={{ fontSize: "11.5px" }}>
                  {isNIC
                    ? "NIC Central SuperAdmin Control"
                    : isDirectorateAdmin
                      ? "Directorate Apex Administrative Management"
                      : "Department Administrative Management"}
                </small>
              </div>
            </div>
          </Col>

          <Col xs={12} sm={6} className="d-flex gap-2 justify-content-sm-end align-items-center flex-wrap">
            {/* Session Manager (NIC or Directorate) */}
            {(isNIC || isDirectorateAdmin) && (
              <Button
                color="light"
                size="sm"
                className="fw-semibold d-flex align-items-center gap-1.5 border-white border-opacity-40 text-white shadow-xs"
                style={{ background: "rgba(255,255,255,0.15)" }}
                onClick={() => navigate("/admin/session-manager")}
                title="View Active Sessions"
              >
                <FaUserShield size={13} />
                <span>{isHindi ? "सक्रिय सत्र" : "Sessions"}</span>
              </Button>
            )}

            {/* Refresh Button */}
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1.5 border-white border-opacity-40 text-white shadow-xs"
              style={{ background: "rgba(255,255,255,0.15)" }}
              onClick={loadUsers}
              title="Refresh user list"
            >
              <FaSyncAlt size={12} className={loading ? "fa-spin" : ""} />
              <span className="d-none d-md-inline">{isHindi ? "रिफ्रेश" : "Refresh"}</span>
            </Button>

            {/* Add User Button */}
            {canCreateUser && (
              <Button
                color="light"
                size="sm"
                className="fw-bold d-flex align-items-center gap-1.5 shadow-sm px-3"
                style={{ color: "#065f46" }}
                onClick={openModal}
              >
                <FaPlus size={12} />
                <span>{isHindi ? "नया उपयोगकर्ता" : "Add New User"}</span>
              </Button>
            )}
          </Col>
        </Row>
      </CardHeader>

      <CardBody className="p-0">
        {/* ── STATS & FILTERS BAR ── */}
        <div className="p-3 bg-light border-bottom">
          <Row className="g-2 align-items-center">
            {/* Search Box */}
            <Col xs={12} md={4} lg={3}>
              <InputGroup size="sm" className="shadow-xs">
                <InputGroupText className="bg-white border-end-0 text-muted">
                  <FaSearch size={12} />
                </InputGroupText>
                <Input
                  type="text"
                  placeholder={isHindi ? "नाम, ईमेल, मोबाइल से खोजें..." : "Search name, email, mobile..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0 ps-0 bg-white"
                />
              </InputGroup>
            </Col>

            {/* Filter: Employee Type */}
            <Col xs={6} md={2}>
              <Input
                type="select"
                size="sm"
                value={filterEmployeeType}
                onChange={(e) => setFilterEmployeeType(e.target.value)}
                className="shadow-xs bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Units</option>
                <option value="DIRECTORATE">Directorate</option>
                <option value="DEPARTMENT">Department</option>
                {isNIC && <option value="NIC">NIC</option>}
              </Input>
            </Col>

            {/* Filter: Role */}
            <Col xs={6} md={2}>
              <Input
                type="select"
                size="sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="shadow-xs bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="OFFICER">Officer</option>
                {isNIC && <option value="NIC">NIC</option>}
              </Input>
            </Col>

            {/* Filter: Status */}
            <Col xs={6} md={2}>
              <Input
                type="select"
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="shadow-xs bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="ACTIVE">Active (Allowed)</option>
                <option value="INACTIVE">Inactive (Blocked)</option>
              </Input>
            </Col>

            {/* Stats Summary Badges */}
            <Col xs={12} md={12} lg={3} className="d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
              <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs fw-semibold">
                Total: {users.length}
              </Badge>
              <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs fw-semibold">
                Active: {users.filter((u) => u.isActive).length}
              </Badge>
              <Badge color="warning" className="py-1.5 px-2.5 rounded-pill shadow-xs text-dark fw-semibold">
                Pending: {users.filter((u) => u.status === "PENDING").length}
              </Badge>
            </Col>
          </Row>
        </div>

        {/* ── USERS TABLE ── */}
        <div className="table-responsive">
          <Table hover striped className="mb-0 align-middle">
            <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
              <tr>
                <th className="text-center" style={{ width: "45px" }}>#</th>
                <th style={{ width: "55px" }}>Photo</th>
                <th>User Details</th>
                <th>Unit / Dept</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Permissions</th>
                <th>Access / Status</th>
                <th className="text-center" style={{ width: "110px" }}>Actions</th>
              </tr>
            </thead>

            <tbody style={{ fontSize: "13px" }}>
              {loading ? (
                <tr>
                  <td colSpan="10" className="text-center py-4">
                    <PageLoader inline={true} />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-muted">
                    <div style={{ fontSize: "2.5rem" }}>👥</div>
                    <p className="fw-semibold mb-1">No users found matching your criteria.</p>
                    {canCreateUser && (
                      <Button color="primary" size="sm" onClick={openModal} className="mt-2">
                        <FaPlus className="me-1" /> Add New User
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const empBadge = getEmployeeTypeBadge(u.employeeType);
                  const roleBadge = getRoleBadge(u.role);

                  return (
                    <tr key={u._id || i}>
                      {/* # */}
                      <td className="text-center fw-bold text-muted">{i + 1}</td>

                      {/* Photo */}
                      <td>
                        {u.profileImage ? (
                          <img
                            src={`${API_URL}${u.profileImage}`}
                            alt={u.name}
                            className="rounded-circle shadow-xs"
                            style={{
                              width: "38px",
                              height: "38px",
                              objectFit: "cover",
                              border: "2px solid #e2e8f0"
                            }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs"
                            style={{
                              width: "38px",
                              height: "38px",
                              fontSize: "13px",
                              background: "linear-gradient(135deg, #1e40af 0%, #0d9488 100%)"
                            }}
                          >
                            {u.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                      </td>

                      {/* Name & Email */}
                      <td>
                        <div className="fw-bold text-dark">{u.name}</div>
                        <small className="text-muted">{u.email}</small>
                      </td>

                      {/* Unit / Employee Type */}
                      <td>
                        <span
                          className="px-2.5 py-1 rounded-pill fw-bold text-white shadow-xs d-inline-block"
                          style={{
                            fontSize: "10.5px",
                            letterSpacing: "0.2px",
                            backgroundColor: empBadge.bg
                          }}
                        >
                          {empBadge.label}
                        </span>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className="px-2.5 py-1 rounded-pill fw-bold text-white shadow-xs d-inline-block"
                          style={{
                            fontSize: "10.5px",
                            letterSpacing: "0.2px",
                            backgroundColor: roleBadge.bg
                          }}
                        >
                          {roleBadge.label}
                        </span>
                      </td>

                      {/* Mobile */}
                      <td className="text-nowrap">{u.mobile || "—"}</td>

                      {/* Designation */}
                      <td>
                        {u.userDesignations ? (
                          <span
                            className="px-2 py-0.5 rounded-pill fw-semibold"
                            style={{ fontSize: "11px", background: "#f1f5f9", color: "#334155" }}
                          >
                            {u.userDesignations}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Permissions */}
                      <td style={{ maxWidth: "160px" }}>
                        {u.permissions?.length ? (
                          <div className="d-flex flex-wrap gap-1">
                            {u.permissions.slice(0, 3).map((p, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-1.5 py-0.5 rounded bg-light border text-dark fw-semibold"
                                style={{ fontSize: "10px" }}
                              >
                                {p}
                              </span>
                            ))}
                            {u.permissions.length > 3 && (
                              <span className="badge bg-secondary" style={{ fontSize: "9.5px" }}>
                                +{u.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted small">Standard</span>
                        )}
                      </td>

                      {/* Access & Approval Status */}
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {/* Approval Status Badge */}
                          <span
                            className="px-2 py-0.5 rounded-pill fw-bold text-center"
                            style={{
                              fontSize: "10.5px",
                              background:
                                u.status === "APPROVED"
                                  ? "#ecfdf5"
                                  : u.status === "REJECTED"
                                    ? "#fef2f2"
                                    : "#fffbeb",
                              color:
                                u.status === "APPROVED"
                                  ? "#047857"
                                  : u.status === "REJECTED"
                                    ? "#b91c1c"
                                    : "#b45309",
                              border: `1px solid ${
                                u.status === "APPROVED"
                                  ? "#a7f3d0"
                                  : u.status === "REJECTED"
                                    ? "#fecaca"
                                    : "#fde68a"
                              }`
                            }}
                          >
                            {u.status === "APPROVED" ? "✅ Approved" : u.status === "REJECTED" ? "❌ Rejected" : "⏳ Pending"}
                          </span>

                          {/* Active / Inactive switch badge */}
                          <span
                            role="button"
                            onClick={() => handleToggleActive(u)}
                            className={`badge ${u.isActive ? "bg-success" : "bg-danger"} shadow-xs cursor-pointer`}
                            title="Click to toggle active status"
                            style={{ fontSize: "10px", cursor: "pointer" }}
                          >
                            {u.isActive ? "🟢 Active" : "🔴 Inactive"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-center text-nowrap">
                        <div className="d-inline-flex gap-1.5 align-items-center">
                          {/* Quick Approve / Reject for Pending */}
                          {u.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                className="p-1 px-1.5"
                                title="Approve User"
                                onClick={() => handleQuickStatus(u, "APPROVED")}
                              >
                                <FaCheck size={11} />
                              </Button>
                              <Button
                                size="sm"
                                color="warning"
                                className="p-1 px-1.5 text-dark"
                                title="Reject User"
                                onClick={() => handleQuickStatus(u, "REJECTED")}
                              >
                                <FaTimes size={11} />
                              </Button>
                            </>
                          )}

                          {/* Edit Button */}
                          <Button
                            size="sm"
                            color="info"
                            className="p-1 px-2 text-white"
                            title="Edit User"
                            onClick={() => handleEdit(u)}
                          >
                            <FaEdit size={12} />
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            color="danger"
                            className="p-1 px-2"
                            title="Delete User"
                            onClick={() => handleDelete(u)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="px-4 py-2.5 bg-light border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted fw-semibold">
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> user(s)
          </small>
          <small className="text-muted">
            Department of Higher Education, Govt. of Chhattisgarh
          </small>
        </div>
      </CardBody>

      {/* ── MODAL: CREATE / EDIT USER ── */}
      <Modal isOpen={modal} toggle={closeModal} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={closeModal}
          className="border-bottom-0 shadow-sm text-white"
          style={headerGradient}
          close={
            <button
              className="btn-close btn-close-white"
              onClick={closeModal}
              aria-label="Close"
            />
          }
        >
          {editing
            ? (isHindi ? "✏️ उपयोगकर्ता विवरण संपादित करें" : "✏️ Edit User Details")
            : (isHindi ? "➕ नया उपयोगकर्ता / अधिकारी जोड़ें" : "➕ Add New User / Officer")}
        </ModalHeader>

        <Form onSubmit={handleSubmit} noValidate>
          <ModalBody className="p-4 bg-light">
            {/* AVATAR UPLOAD */}
            <div className="d-flex flex-column align-items-center mb-4 pb-3 border-bottom">
              <div className="position-relative mb-2">
                <img
                  src={imagePreview || "https://ui-avatars.com/api/?name=Officer&background=e2e8f0&color=1e40af&size=120"}
                  alt="Avatar Preview"
                  className="rounded-circle shadow-sm bg-white"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    border: "3px solid #ffffff"
                  }}
                />
                {imagePreview && (
                  <Button
                    color="danger"
                    size="sm"
                    className="position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex justify-content-center align-items-center shadow"
                    style={{ width: "24px", height: "24px" }}
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, profileImage: null }));
                    }}
                    title="Remove Image"
                  >
                    ✕
                  </Button>
                )}
              </div>

              <Input
                id="profileImage"
                type="file"
                name="profileImage"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleChange}
                className="form-control form-control-sm shadow-xs"
                style={{ maxWidth: "240px" }}
              />
              <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                JPG, PNG or WEBP (Max 2MB)
              </small>
            </div>

            {/* FORM INPUTS */}
            <div className="bg-white p-3.5 p-md-4 rounded-3 shadow-xs border">
              <Row className="g-3">
                {/* FULL NAME */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Full Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      name="name"
                      placeholder="e.g. Rajesh Kumar"
                      value={formData.name}
                      onChange={handleChange}
                      invalid={!!errors.name}
                      className="shadow-xs"
                      required
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </FormGroup>
                </Col>

                {/* EMAIL */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Email Address <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="e.g. officer@gov.in"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!!editing}
                      invalid={!!errors.email}
                      className="shadow-xs"
                      required
                    />
                    {editing && <small className="text-muted" style={{ fontSize: "11px" }}>Email cannot be altered once registered.</small>}
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </FormGroup>
                </Col>

                {/* MOBILE */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Mobile Number <span className="text-danger">*</span>
                    </Label>
                    <Input
                      name="mobile"
                      placeholder="e.g. 9876543210"
                      value={formData.mobile}
                      onChange={handleChange}
                      invalid={!!errors.mobile}
                      maxLength={13}
                      className="shadow-xs"
                      required
                    />
                    {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                  </FormGroup>
                </Col>

                {/* DESIGNATION */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Designation <span className="text-danger">*</span>
                    </Label>
                    <Input
                      name="userDesignations"
                      placeholder="e.g. District Officer / Section Officer"
                      value={formData.userDesignations}
                      onChange={handleChange}
                      invalid={!!errors.userDesignations}
                      className="shadow-xs"
                      required
                    />
                    {errors.userDesignations && <div className="invalid-feedback">{errors.userDesignations}</div>}
                  </FormGroup>
                </Col>

                {/* EMPLOYEE TYPE (UNIT) */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Employee Unit Type <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      name="employeeType"
                      value={formData.employeeType}
                      onChange={handleChange}
                      className="shadow-xs fw-semibold cursor-pointer"
                    >
                      {/* NIC can select all */}
                      {isNIC && (
                        <>
                          <option value="DIRECTORATE">Directorate</option>
                          <option value="DEPARTMENT">Department</option>
                          <option value="NIC">NIC</option>
                        </>
                      )}

                      {/* Directorate Admin can create Directorate or Department */}
                      {isDirectorateAdmin && (
                        <>
                          <option value="DIRECTORATE">Directorate</option>
                          <option value="DEPARTMENT">Department</option>
                        </>
                      )}

                      {/* Department Admin only creates Department */}
                      {isDepartmentAdmin && (
                        <option value="DEPARTMENT">Department</option>
                      )}
                    </Input>
                  </FormGroup>
                </Col>

                {/* ROLE ALLOCATION */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Role Allocation <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="shadow-xs fw-semibold cursor-pointer"
                    >
                      {/* NIC can assign any role */}
                      {isNIC && (
                        <>
                          <option value="OFFICER">Officer</option>
                          <option value="ADMIN">Admin</option>
                          <option value="NIC">NIC SuperAdmin</option>
                        </>
                      )}

                      {/* Directorate Admin can assign ADMIN or OFFICER */}
                      {isDirectorateAdmin && (
                        <>
                          <option value="OFFICER">Officer</option>
                          <option value="ADMIN">Admin</option>
                        </>
                      )}

                      {/* Department Admin creates Officer */}
                      {isDepartmentAdmin && (
                        <option value="OFFICER">Officer</option>
                      )}
                    </Input>
                  </FormGroup>
                </Col>

                {/* PASSWORD */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      {editing ? "Password (Leave blank to keep current)" : "Password"} {!editing && <span className="text-danger">*</span>}
                    </Label>
                    <InputGroup className="shadow-xs">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder={editing ? "Enter new password if changing" : "Min 8 chars (A-Z, a-z, 0-9, @$!%*?&)"}
                        value={formData.password}
                        onChange={handleChange}
                        invalid={!!errors.password}
                        autoComplete="new-password"
                      />
                      <InputGroupText
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </InputGroupText>
                    </InputGroup>
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
                  </FormGroup>
                </Col>

                {/* SYSTEM ACCESS (ACTIVE / INACTIVE) */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      System Access
                    </Label>
                    <Input
                      type="select"
                      name="isActive"
                      value={formData.isActive ? "true" : "false"}
                      onChange={handleChange}
                      className="shadow-xs fw-semibold cursor-pointer"
                    >
                      <option value="true">🟢 Active (Allowed to Login)</option>
                      <option value="false">🔴 Inactive (Blocked / Suspended)</option>
                    </Input>
                  </FormGroup>
                </Col>

                {/* APPROVAL STATUS */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Approval Status
                    </Label>
                    <Input
                      type="select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="shadow-xs fw-semibold cursor-pointer"
                    >
                      <option value="APPROVED">✅ Approved</option>
                      <option value="PENDING">⏳ Pending Review</option>
                      <option value="REJECTED">❌ Rejected</option>
                    </Input>
                  </FormGroup>
                </Col>

                {/* PERMISSIONS */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Permissions <small className="text-muted">(Comma separated)</small>
                    </Label>
                    <Input
                      name="permissions"
                      placeholder="e.g. view_reports, manage_notices, edit_pages"
                      value={formData.permissions.join(", ")}
                      onChange={handleChange}
                      invalid={!!errors.permissions}
                      className="shadow-xs"
                    />
                    {errors.permissions && <div className="invalid-feedback">{errors.permissions}</div>}
                  </FormGroup>
                </Col>
              </Row>
            </div>
          </ModalBody>

          {/* MODAL FOOTER */}
          <ModalFooter className="bg-white border-top shadow-sm">
            <Button
              color="secondary"
              outline
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="px-4"
            >
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={submitting}
              className="px-4 shadow-sm text-white"
              style={{ background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)", border: "none" }}
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  {editing ? "Saving Changes..." : "Creating User..."}
                </>
              ) : (
                editing ? "💾 Save Changes" : "✅ Create User"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminUserManagement;