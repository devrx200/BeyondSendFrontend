import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col,
  Spinner, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaUsers, FaPlus, FaEdit, FaTrash,
  FaEye, FaEyeSlash, FaUserShield, FaCheck, FaTimes,
  FaSearch, FaSyncAlt, FaWallet, FaSlidersH, FaClock,
  FaChevronDown, FaChevronRight, FaSitemap
} from "react-icons/fa";
import apiClient, { BASE_HOST } from "@apiService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { PageLoader } from "@/components";
import { jwtDecode } from "jwt-decode";

/* ================= ROLE HIERARCHY & WEIGHTS ================= */
export const ROLE_WEIGHTS = {
  DEVOPS: 5,
  ADMIN: 4,
  RESELLER: 3,
  CLIENT: 2,
  MANAGER: 1,
  USER: 0,
};

export const ROLE_BADGES = {
  DEVOPS: { color: "primary", label: "DevOps" },
  ADMIN: { color: "indigo", bgClass: "bg-primary text-white", label: "Admin" },
  RESELLER: { color: "success", bgClass: "bg-success text-white", label: "Reseller" },
  CLIENT: { color: "info", bgClass: "bg-info text-dark", label: "Client" },
  MANAGER: { color: "warning", bgClass: "bg-warning text-dark", label: "Manager" },
  USER: { color: "secondary", bgClass: "bg-secondary text-white", label: "User" },
};

const getRoleBadge = (role) => {
  const normalized = (role || "").toUpperCase();
  return ROLE_BADGES[normalized] || { color: "secondary", bgClass: "bg-secondary text-white", label: role || "User" };
};

/* ================= INITIAL FORM ================= */
const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "CLIENT",
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
  if (["profileImage", "isActive", "role", "status"].includes(name)) return "";

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
        return "Enter a valid email address (e.g. user@beyondsend.com).";
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

/* ================= RECURSIVE TREE HELPERS ================= */
export const flattenUserTree = (nodes = []) => {
  const result = [];
  const walk = (items) => {
    if (!Array.isArray(items)) return;
    items.forEach((user) => {
      result.push(user);
      if (Array.isArray(user.children) && user.children.length > 0) {
        walk(user.children);
      }
    });
  };
  walk(nodes);
  return result;
};

const filterUserTree = (nodes = [], query = "", role = "ALL", status = "ALL") => {
  const q = query.trim().toLowerCase();

  const nodeMatchesSelf = (u) => {
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.mobile?.includes(q) ||
      u.userDesignations?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);

    const matchRole =
      role === "ALL" || (u.role || "").toUpperCase() === role;

    const matchStatus =
      status === "ALL" ||
      (status === "ACTIVE" && u.isActive) ||
      (status === "INACTIVE" && !u.isActive) ||
      u.status === status;

    return matchSearch && matchRole && matchStatus;
  };

  const processNode = (node) => {
    const isMatch = nodeMatchesSelf(node);
    const filteredChildren = Array.isArray(node.children)
      ? node.children.map(processNode).filter(Boolean)
      : [];

    if (isMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children:
          isMatch && role === "ALL" && status === "ALL" && filteredChildren.length === 0 && Array.isArray(node.children)
            ? node.children
            : filteredChildren,
        __hasMatchingDescendant: filteredChildren.length > 0,
      };
    }
    return null;
  };

  return nodes.map(processNode).filter(Boolean);
};

export const buildOrNormalizeUserTree = (rawUsers = [], loggedRole = "", currentUserId = "", currentUserEmail = "") => {
  if (!Array.isArray(rawUsers) || rawUsers.length === 0) return [];

  // Check if rawUsers is already nested (i.e. has at least one node with children array)
  const isAlreadyNested = rawUsers.some((u) => Array.isArray(u.children) && u.children.length > 0);

  let fullTree = [];

  if (isAlreadyNested) {
    fullTree = rawUsers;
  } else {
    // If backend returned flat list, construct tree using createdBy / owner / manager
    const idMap = new Map();
    rawUsers.forEach((u) => {
      idMap.set(String(u._id), { ...u, children: [] });
    });

    const roots = [];
    rawUsers.forEach((u) => {
      const node = idMap.get(String(u._id));
      const parentId =
        (u.manager && typeof u.manager === "object" ? u.manager._id : u.manager) ||
        (u.owner && typeof u.owner === "object" ? u.owner._id : u.owner) ||
        (u.createdBy && typeof u.createdBy === "object" ? u.createdBy._id : u.createdBy);

      if (parentId && idMap.has(String(parentId)) && String(parentId) !== String(u._id)) {
        idMap.get(String(parentId)).children.push(node);
      } else {
        roots.push(node);
      }
    });

    fullTree = roots;
  }

  // Hierarchy access filter:
  // DEVOPS & ADMIN see ALL users
  const normalizedRole = (loggedRole || "").toUpperCase();
  if (normalizedRole === "DEVOPS" || normalizedRole === "ADMIN") {
    return fullTree;
  }

  // RESELLER, CLIENT, MANAGER, USER only see their own authorized hierarchy:
  // Traverse fullTree to find the logged-in user's node
  const findSubtree = (nodes) => {
    for (const node of nodes) {
      const matchId = currentUserId && String(node._id) === String(currentUserId);
      const matchEmail = currentUserEmail && node.email && node.email.toLowerCase() === currentUserEmail.toLowerCase();
      if (matchId || matchEmail) {
        return node;
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        const found = findSubtree(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const userSubtree = findSubtree(fullTree);
  if (userSubtree) {
    return [userSubtree];
  }

  // Fallback: If not found in tree, return fullTree
  return fullTree;
};

/* ================================================= */
const UserManagement = () => {
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
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Accordion Expand/Collapse Map
  const [expandedRows, setExpandedRows] = useState({});

  // Decode Token and Logged-In User Information
  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
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
      const data =
        sessionStorage.getItem("userData") ||
        localStorage.getItem("userData") ||
        sessionStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId ||
    storedUser?._id ||
    storedUser?.id ||
    "";
  const currentUserEmail = currentUser?.email || storedUser?.email || "";
  const loggedRole = (
    currentUser?.role ||
    storedUser?.role ||
    sessionStorage.getItem("userRole") ||
    localStorage.getItem("userRole") ||
    window.userRole ||
    ""
  ).toUpperCase();
  const isDevOps = loggedRole === "DEVOPS";
  const isAdmin = loggedRole === "ADMIN";
  const isReseller = loggedRole === "RESELLER";
  const isClient = loggedRole === "CLIENT";
  const loggedWeight = ROLE_WEIGHTS[loggedRole] || 0;

  // Determine assignable roles based on hierarchy:
  // DEVOPS -> ADMIN, RESELLER, CLIENT, MANAGER
  // ADMIN -> RESELLER, CLIENT, MANAGER
  // RESELLER -> CLIENT, MANAGER
  // CLIENT -> MANAGER
  // MANAGER -> USER
  const assignableRoles = useMemo(() => {
    if (isDevOps) return ["ADMIN", "RESELLER", "CLIENT", "MANAGER"];
    if (isAdmin) return ["RESELLER", "CLIENT", "MANAGER"];
    if (isReseller) return ["CLIENT", "MANAGER"];
    if (isClient) return ["MANAGER"];
    if (loggedRole === "MANAGER") return ["USER"];
    return [];
  }, [isDevOps, isAdmin, isReseller, isClient, loggedRole]);

  const canCreateUser = assignableRoles.length > 0;

  /* ================= LOAD USERS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/list');
      const responseUsers = res.data?.data || [];
      const rawUserList = Array.isArray(responseUsers) ? responseUsers : [];

      const userList = buildOrNormalizeUserTree(rawUserList, loggedRole, currentUserId, currentUserEmail);
      setUsers(userList);

      // Auto-expand all root and intermediate nodes initially
      const initialExpanded = {};
      const allTreeUsers = flattenUserTree(userList);
      allTreeUsers.forEach((u) => {
        if (u._id) initialExpanded[u._id] = true;
      });
      setExpandedRows(initialExpanded);
    } catch (err) {
      console.error("Failed to load users", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isHindi ? "उपयोगकर्ता लोड करने में विफल। कृपया पुन: प्रयास करें।" : "Failed to load users. Please try again.");
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= TOGGLE EXPAND ================= */
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const all = flattenUserTree(users);
    const next = {};
    all.forEach((u) => {
      if (u._id) next[u._id] = true;
    });
    setExpandedRows(next);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  /* ================= FILTERED HIERARCHY ================= */
  const filteredTree = useMemo(() => {
    return filterUserTree(users, searchQuery, filterRole, filterStatus);
  }, [users, searchQuery, filterRole, filterStatus]);

  // When searching or filtering, automatically expand matching branches
  useEffect(() => {
    if (searchQuery.trim() || filterRole !== "ALL" || filterStatus !== "ALL") {
      const flattened = flattenUserTree(filteredTree);
      setExpandedRows((prev) => {
        const next = { ...prev };
        flattened.forEach((u) => {
          if (u.children?.length) next[u._id] = true;
        });
        return next;
      });
    }
  }, [searchQuery, filterRole, filterStatus, filteredTree]);

  /* ================= STATISTICS (FLATTENED) ================= */
  const allFlattenedUsers = useMemo(() => flattenUserTree(users), [users]);
  const filteredFlattenedUsers = useMemo(() => flattenUserTree(filteredTree), [filteredTree]);

  const totalUsers = allFlattenedUsers.length;
  const activeUsers = allFlattenedUsers.filter((u) => u.isActive).length;
  const pendingUsers = allFlattenedUsers.filter((u) => u.status === "PENDING").length;

  /* ================= MODAL TOGGLE & INITIALIZATION ================= */
  const openModal = () => {
    const defaultRole = assignableRoles[0] || "CLIENT";
    setFormData({
      ...initialForm,
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

    setFormData((prev) => ({ ...prev, [name]: newValue }));

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
        if (key === "password" && editing && !value) return;
        if (Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      });

      if (editing) {
        const res = await apiClient.put(`/users/update/${editing._id}`, payload);
        const successMsg =
          res.data?.message ||
          (isHindi ? "उपयोगकर्ता विवरण सफलतापूर्वक अद्यतन किया गया।" : "User details updated successfully.");
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफल" : "Updated!",
          text: successMsg,
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        const res = await apiClient.post('/users/create', payload);
        const successMsg =
          res.data?.message ||
          (isHindi ? "नया उपयोगकर्ता सफलतापूर्वक जोड़ा गया।" : "New user created successfully.");
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफल" : "Created!",
          text: successMsg,
          timer: 1500,
          showConfirmButton: false
        });
      }

      closeModal();
      loadUsers();
    } catch (err) {
      console.error("Submit Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isHindi ? "ऑपरेशन विफल रहा। कृपया पुन: प्रयास करें।" : "Operation failed. Please try again.");
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: errMsg
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= EDIT USER ================= */
  const handleEdit = (user) => {
    const targetRole = (user.role || "").toUpperCase();
    const targetWeight = ROLE_WEIGHTS[targetRole] || 0;

    // Check authority: cannot edit superiors, or peers unless DevOps
    if (!isDevOps && targetWeight >= loggedWeight) {
      return Swal.fire({
        icon: "warning",
        title: isHindi ? "अनुमति अस्वीकृत" : "Permission Denied",
        text: isHindi
          ? "आपके पास इस स्तर के खाते को संपादित करने की अनुमति नहीं है।"
          : "You do not have permission to edit accounts of equal or higher authority."
      });
    }

    setEditing(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: user.role || assignableRoles[0] || "CLIENT",
      userDesignations: user.userDesignations || "",
      permissions: user.permissions || [],
      controls: user.controls || [],
      profileImage: null,
      status: user.status || "APPROVED",
      isActive: user.isActive ?? true,
    });
    setErrors({});
    setImagePreview(user.profileImage ? `${BASE_HOST}${user.profileImage}` : null);
    setModal(true);
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async (user) => {
    const targetRole = (user.role || "").toUpperCase();
    const targetWeight = ROLE_WEIGHTS[targetRole] || 0;

    // Check authority: cannot delete superiors or peers unless DevOps
    if (!isDevOps && targetWeight >= loggedWeight) {
      return Swal.fire({
        icon: "warning",
        title: isHindi ? "अनुमति अस्वीकृत" : "Permission Denied",
        text: isHindi
          ? "आपके पास इस स्तर के खाते को हटाने की अनुमति नहीं है।"
          : "You do not have permission to delete accounts of equal or higher authority."
      });
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
      const res = await apiClient.delete(`/users/delete/${user._id}`);
      const successMsg =
        res.data?.message ||
        (isHindi ? "उपयोगकर्ता को सफलतापूर्वक हटा दिया गया।" : "User has been deleted successfully.");
      Swal.fire({
        icon: "success",
        title: isHindi ? "हटाया गया!" : "Deleted!",
        text: successMsg,
        timer: 1500,
        showConfirmButton: false
      });
      loadUsers();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isHindi ? "हटाने में विफल।" : "Failed to delete user.");
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: errMsg
      });
    }
  };

  /* ================= QUICK APPROVE / REJECT ================= */
  const handleQuickStatus = async (user, newStatus) => {
    try {
      const payload = new FormData();
      payload.append("status", newStatus);

      const res = await apiClient.put(`/users/update/${user._id}`, payload);
      const defaultStatusText =
        newStatus === "APPROVED"
          ? (isHindi ? "उपयोगकर्ता स्वीकृत किया गया" : "User Approved")
          : (isHindi ? "उपयोगकर्ता अस्वीकृत किया गया" : "User Rejected");
      const msg = res.data?.message || defaultStatusText;

      Swal.fire({
        icon: "success",
        title: msg,
        timer: 1500,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isHindi ? "स्थिति अद्यतन करने में विफल" : "Failed to update status");
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: errMsg
      });
    }
  };

  /* ================= QUICK ACTIVE TOGGLE ================= */
  const handleToggleActive = async (user) => {
    try {
      const payload = new FormData();
      payload.append("isActive", !user.isActive);

      const res = await apiClient
        .put(`/users/update/${user._id}`, payload)
        .catch(() => apiClient.put(`/update-user/${user._id}`, payload));

      const defaultToggleText = !user.isActive
        ? (isHindi ? "उपयोगकर्ता सक्रिय किया गया" : "User Activated")
        : (isHindi ? "उपयोगकर्ता निष्क्रिय किया गया" : "User Deactivated");
      const msg = res.data?.message || defaultToggleText;

      Swal.fire({
        icon: "success",
        title: msg,
        timer: 1500,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        (isHindi ? "स्थिति बदलने में विफल" : "Failed to toggle status");
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: errMsg
      });
    }
  };

  /* ================= RECURSIVE USER ROW COMPONENT ================= */
  const UserTreeRow = ({ user, level = 0, index = 1 }) => {
    const hasChildren = Array.isArray(user.children) && user.children.length > 0;
    const isExpanded = !!expandedRows[user._id];
    const roleBadge = getRoleBadge(user.role);

    return (
      <>
        <tr
          className={`${user.isActive ? "" : "table-secondary bg-opacity-25"} ${level > 0 ? "bg-light bg-opacity-50" : ""}`}
        >
          {/* # & Hierarchy Indent */}
          <td className="text-center align-middle" style={{ width: "50px" }}>
            <span className="small text-muted fw-bold">{level === 0 ? index : ""}</span>
          </td>

          {/* Photo */}
          <td className="align-middle" style={{ width: "55px" }}>
            {user.profileImage ? (
              <img
                src={`${BASE_HOST}${user.profileImage}`}
                alt={user.name}
                className="rounded-circle shadow-sm border"
                style={{
                  width: "36px",
                  height: "36px",
                  objectFit: "cover"
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${
                  user.role === "ADMIN"
                    ? "bg-primary"
                    : user.role === "RESELLER"
                      ? "bg-success"
                      : user.role === "CLIENT"
                        ? "bg-info text-dark"
                        : user.role === "MANAGER"
                          ? "bg-warning text-dark"
                          : "bg-secondary"
                }`}
                style={{ width: "36px", height: "36px", fontSize: "14px" }}
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </td>

          {/* User Details & Expand Chevron */}
          <td className="align-middle">
            <div
              className="d-flex align-items-center gap-2"
              style={{ paddingLeft: `${level * 24}px` }}
            >
              {/* Expand / Collapse Button if has children */}
              {hasChildren ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary p-0 d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "22px", height: "22px" }}
                  onClick={() => toggleRow(user._id)}
                  title={isExpanded ? "Collapse Downline" : "Expand Downline"}
                >
                  {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                </button>
              ) : level > 0 ? (
                <span
                  className="text-muted d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "22px", height: "22px", opacity: 0.4 }}
                >
                  └
                </span>
              ) : null}

              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2 flex-wrap">
                  <span>{user.name}</span>
                  {hasChildren && (
                    <Badge color="light" className="text-secondary border py-1 px-2 fw-normal">
                      {user.children.length} {user.children.length === 1 ? "downline" : "downlines"}
                    </Badge>
                  )}
                </div>
                <small className="text-muted">{user.email}</small>
              </div>
            </div>
          </td>

          {/* Role */}
          <td className="align-middle">
            <span className={`badge rounded-pill fw-bold ${roleBadge.bgClass || "bg-secondary text-white"}`}>
              {roleBadge.label}
            </span>
          </td>

          {/* Contact */}
          <td className="text-nowrap align-middle">{user.mobile || "—"}</td>

          {/* Designation */}
          <td className="align-middle">
            {user.userDesignations ? (
              <span className="badge bg-light text-dark border fw-normal">
                {user.userDesignations}
              </span>
            ) : (
              <span className="text-muted small">—</span>
            )}
          </td>

          {/* Permissions */}
          <td className="align-middle" style={{ maxWidth: "180px" }}>
            {user.permissions?.length ? (
              <div className="d-flex flex-wrap gap-1">
                {user.permissions.slice(0, 3).map((p, pIdx) => (
                  <span key={pIdx} className="badge bg-light text-secondary border fw-normal">
                    {p}
                  </span>
                ))}
                {user.permissions.length > 3 && (
                  <span className="badge bg-secondary">
                    +{user.permissions.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted small">Standard</span>
            )}
          </td>

          {/* Access & Approval Status */}
          <td className="align-middle text-center">
            <div className="d-flex flex-column align-items-center justify-content-center gap-1 py-1">
              {/* Approval Status Badge */}
              <span
                className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1 ${
                  user.status === "APPROVED"
                    ? "bg-success-subtle text-success border border-success"
                    : user.status === "REJECTED"
                      ? "bg-danger-subtle text-danger border border-danger"
                      : "bg-warning-subtle text-warning-emphasis border border-warning"
                }`}
              >
                {user.status === "APPROVED" && <FaCheck size={9} />}
                {user.status === "REJECTED" && <FaTimes size={9} />}
                {user.status === "PENDING" && <FaClock size={9} />}
                <span>
                  {user.status === "APPROVED" ? "Approved" : user.status === "REJECTED" ? "Rejected" : "Pending"}
                </span>
              </span>

              {/* Modern Bootstrap Switch Toggle */}
              <div className="form-check form-switch d-inline-flex align-items-center justify-content-center m-0 gap-1">
                <input
                  className="form-check-input m-0"
                  type="checkbox"
                  role="switch"
                  id={`switch-user-${user._id}`}
                  checked={!!user.isActive}
                  onChange={() => handleToggleActive(user)}
                  title={user.isActive ? "Click to Deactivate" : "Click to Activate"}
                  style={{ cursor: "pointer" }}
                />
                <label
                  className={`form-check-label small fw-semibold cursor-pointer user-select-none ${user.isActive ? "text-success" : "text-danger"}`}
                  htmlFor={`switch-user-${user._id}`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </label>
              </div>
            </div>
          </td>

          {/* Actions */}
          <td className="text-center text-nowrap align-middle">
            <div className="d-inline-flex gap-1 align-items-center justify-content-center">
              {/* Quick Approve / Reject for Pending */}
              {user.status === "PENDING" && (
                <>
                  <Button
                    size="sm"
                    color="success"
                    className="p-1 px-2 shadow-sm text-white"
                    title="Approve User"
                    onClick={() => handleQuickStatus(user, "APPROVED")}
                  >
                    <FaCheck size={11} />
                  </Button>
                  <Button
                    size="sm"
                    color="warning"
                    className="p-1 px-2 shadow-sm text-dark"
                    title="Reject User"
                    onClick={() => handleQuickStatus(user, "REJECTED")}
                  >
                    <FaTimes size={11} />
                  </Button>
                </>
              )}

              {/* Manage Wallet & Topup — ADMIN & DEVOPS ONLY */}
              {(isAdmin || isDevOps) && (
                <Button
                  size="sm"
                  color="success"
                  className="p-1 px-2 text-white shadow-sm"
                  title={isHindi ? "वॉलेट और टॉपअप (Wallet & Topup)" : "Manage Wallet & Topup"}
                  onClick={() => navigate(`/authorized/account/credits-topup-management?userId=${user._id}`)}
                >
                  <FaWallet size={12} />
                </Button>
              )}

              {/* Communication Config — ADMIN & DEVOPS ONLY */}
              {(isAdmin || isDevOps) && (
                <Button
                  size="sm"
                  color="primary"
                  className="p-1 px-2 text-white shadow-sm"
                  title={isHindi ? "संचार विन्यास (Communication Config)" : "Communication Configuration"}
                  onClick={() => navigate(`/authorized/config/communication/${user._id}`)}
                >
                  <FaSlidersH size={12} />
                </Button>
              )}

              {/* Edit Button */}
              <Button
                size="sm"
                color="info"
                className="p-1 px-2 text-white shadow-sm"
                title="Edit User"
                onClick={() => handleEdit(user)}
              >
                <FaEdit size={12} />
              </Button>

              {/* Delete Button */}
              <Button
                size="sm"
                color="danger"
                className="p-1 px-2 text-white shadow-sm"
                title="Delete User"
                onClick={() => handleDelete(user)}
              >
                <FaTrash size={12} />
              </Button>
            </div>
          </td>
        </tr>

        {/* Recursive Children (Downlines) if expanded */}
        {hasChildren && isExpanded && (
          user.children.map((child, cIdx) => (
            <UserTreeRow
              key={child._id || `${user._id}-child-${cIdx}`}
              user={child}
              level={level + 1}
              index={`${index}.${cIdx + 1}`}
            />
          ))
        )}
      </>
    );
  };

  return (
    <Card className="border-0 shadow-sm overflow-hidden mb-4">
      {/* ── UNIFIED COMMAND HEADER ── */}
      <CardHeader className="bg-dark text-white d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-3 px-md-4">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white bg-white bg-opacity-10 p-2 fs-5 flex-shrink-0"
            style={{ width: "38px", height: "38px" }}
          >
            <FaUsers />
          </div>
          <div>
            <h4 className="mb-0 text-white fw-bold d-flex align-items-center gap-2 fs-5">
              <span>{isHindi ? "उपयोगकर्ता एवं भूमिका प्रबंधन" : "User & Role Management"}</span>
            </h4>
            <small className="text-white-50">
              {isDevOps
                ? "DevOps Platform Administration"
                : isAdmin
                  ? "Administrative Control & Hierarchy Tree"
                  : isReseller
                    ? "Reseller Account & Client Hierarchy"
                    : "Client Team & Manager Hierarchy"}
            </small>
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Session Manager (DevOps or Admin) */}
          {(isDevOps || isAdmin) && (
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1 bg-white bg-opacity-10 text-white border-0 shadow-sm"
              onClick={() => navigate("/authorized/session-manager")}
              title="View Active Sessions"
            >
              <FaUserShield size={12} />
              <span>{isHindi ? "सक्रिय सत्र" : "Sessions"}</span>
            </Button>
          )}

          {/* Refresh Button */}
          <Button
            color="light"
            size="sm"
            className="fw-semibold d-flex align-items-center gap-1 bg-white bg-opacity-10 text-white border-0 shadow-sm"
            onClick={loadUsers}
            title="Refresh user list"
          >
            <FaSyncAlt size={11} className={loading ? "fa-spin" : ""} />
            <span className="d-none d-md-inline">{isHindi ? "रिफ्रेश" : "Refresh"}</span>
          </Button>

          {/* Add User Button */}
          {canCreateUser && (
            <Button
              color="primary"
              size="sm"
              className="fw-bold d-flex align-items-center gap-1 shadow-sm px-3 text-white border-0"
              onClick={openModal}
            >
              <FaPlus size={11} />
              <span>{isHindi ? "नया उपयोगकर्ता" : "Add New User"}</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="p-0">
        {/* ── STATS & FILTERS BAR ── */}
        <div className="p-3 bg-light border-bottom">
          <Row className="g-2 align-items-center">
            {/* Search Box */}
            <Col xs={12} md={4} lg={3}>
              <InputGroup size="sm" className="shadow-sm">
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

            {/* Filter: Role */}
            <Col xs={6} md={3} lg={2}>
              <Input
                type="select"
                size="sm"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="shadow-sm bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                {isDevOps && <option value="DEVOPS">DevOps</option>}
                {(isDevOps || isAdmin) && <option value="ADMIN">Admin</option>}
                {(isDevOps || isAdmin || isReseller) && <option value="RESELLER">Reseller</option>}
                <option value="CLIENT">Client</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
              </Input>
            </Col>

            {/* Filter: Status */}
            <Col xs={6} md={3} lg={2}>
              <Input
                type="select"
                size="sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="shadow-sm bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
                <option value="ACTIVE">Active (Allowed)</option>
                <option value="INACTIVE">Inactive (Blocked)</option>
              </Input>
            </Col>

            {/* Tree Expand / Collapse controls */}
            <Col xs={12} md={2} lg={2} className="d-flex align-items-center gap-1">
              <Button
                color="light"
                size="sm"
                className="border bg-white text-secondary shadow-sm px-2 py-1 small fw-semibold"
                onClick={expandAll}
                title="Expand All Hierarchy"
              >
                <FaChevronDown size={10} className="me-1" /> Expand All
              </Button>
              <Button
                color="light"
                size="sm"
                className="border bg-white text-secondary shadow-sm px-2 py-1 small fw-semibold"
                onClick={collapseAll}
                title="Collapse All Hierarchy"
              >
                <FaChevronRight size={10} className="me-1" /> Collapse
              </Button>
            </Col>

            {/* Stats Summary Badges (from recursive flattened count) */}
            <Col xs={12} md={12} lg={3} className="d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
              <Badge color="primary" className="py-1 px-2 rounded-pill shadow-sm fw-semibold">
                Total: {totalUsers}
              </Badge>
              <Badge color="success" className="py-1 px-2 rounded-pill shadow-sm fw-semibold">
                Active: {activeUsers}
              </Badge>
              <Badge color="warning" className="py-1 px-2 rounded-pill shadow-sm text-dark fw-semibold">
                Pending: {pendingUsers}
              </Badge>
            </Col>
          </Row>
        </div>

        {/* ── USERS TABLE (RECURSIVE ACCORDION TREE) ── */}
        <div className="table-responsive">
          <Table hover className="table-hover mb-0 align-middle">
            <thead className="table-light small">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>#</th>
                <th style={{ width: "55px" }}>Photo</th>
                <th style={{ minWidth: "220px" }}>User Details & Hierarchy</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Permissions</th>
                <th className="text-center" style={{ minWidth: "135px" }}>Access / Status</th>
                <th className="text-center" style={{ minWidth: "160px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <PageLoader inline={true} />
                  </td>
                </tr>
              ) : filteredTree.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <div className="fs-1">👥</div>
                    <p className="fw-semibold mb-1">No users found matching your criteria.</p>
                    {canCreateUser && (
                      <Button color="primary" size="sm" onClick={openModal} className="mt-2">
                        <FaPlus className="me-1" /> Add New User
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTree.map((u, i) => (
                  <UserTreeRow
                    key={u._id || `root-${i}`}
                    user={u}
                    level={0}
                    index={i + 1}
                  />
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="px-4 py-2.5 bg-light border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted fw-semibold">
            Showing <strong>{filteredFlattenedUsers.length}</strong> of <strong>{totalUsers}</strong> user(s) across hierarchy
          </small>
          <small className="text-muted d-flex align-items-center gap-1">
            <FaSitemap className="text-secondary" /> BeyondSend Cloud Telecom Hierarchy
          </small>
        </div>
      </CardBody>

      {/* ── MODAL: CREATE / EDIT USER ── */}
      <Modal isOpen={modal} toggle={closeModal} size="lg" backdrop="static" centered>
        <ModalHeader
          toggle={closeModal}
          className="bg-dark text-white border-0 shadow-sm"
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
            : (isHindi ? "➕ नया उपयोगकर्ता जोड़ें" : "➕ Add New User")}
        </ModalHeader>

        <Form onSubmit={handleSubmit} noValidate>
          <ModalBody className="p-4 bg-light">
            {/* AVATAR UPLOAD */}
            <div className="d-flex flex-column align-items-center mb-4 pb-3 border-bottom">
              <div className="position-relative mb-2">
                <img
                  src={imagePreview || "https://ui-avatars.com/api/?name=User&background=e2e8f0&color=1e40af&size=120"}
                  alt="Avatar Preview"
                  className="rounded-circle shadow-sm bg-white border border-3 border-white"
                  style={{
                    width: "96px",
                    height: "96px",
                    objectFit: "cover"
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
                className="form-control form-control-sm shadow-sm w-auto"
              />
              <small className="text-muted mt-1 small">
                JPG, PNG or WEBP (Max 2MB)
              </small>
            </div>

            {/* FORM INPUTS */}
            <div className="bg-white p-3 p-md-4 rounded-3 shadow-sm border">
              <Row className="g-3">
                {/* FULL NAME */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Full Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      name="name"
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={handleChange}
                      invalid={!!errors.name}
                      className="shadow-sm"
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
                      placeholder="e.g. alex@beyondsend.com"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!!editing}
                      invalid={!!errors.email}
                      className="shadow-sm"
                      required
                    />
                    {editing && <small className="text-muted small">Email cannot be altered once registered.</small>}
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
                      className="shadow-sm"
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
                      placeholder="e.g. Telecom Account Lead / Operations Manager"
                      value={formData.userDesignations}
                      onChange={handleChange}
                      invalid={!!errors.userDesignations}
                      className="shadow-sm"
                      required
                    />
                    {errors.userDesignations && <div className="invalid-feedback">{errors.userDesignations}</div>}
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
                      className="shadow-sm fw-semibold cursor-pointer"
                    >
                      {assignableRoles.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_BADGES[r]?.label || r}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>

                {/* PASSWORD */}
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      {editing ? "Password (Leave blank to keep current)" : "Password"} {!editing && <span className="text-danger">*</span>}
                    </Label>
                    <InputGroup className="shadow-sm">
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
                      className="shadow-sm fw-semibold cursor-pointer"
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
                      className="shadow-sm fw-semibold cursor-pointer"
                    >
                      <option value="APPROVED">✅ Approved</option>
                      <option value="PENDING">⏳ Pending Review</option>
                      <option value="REJECTED">❌ Rejected</option>
                    </Input>
                  </FormGroup>
                </Col>

                {/* PERMISSIONS */}
                <Col md={12}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Permissions <small className="text-muted">(Comma separated, e.g. send_sms, send_whatsapp, view_analytics)</small>
                    </Label>
                    <Input
                      name="permissions"
                      placeholder="e.g. send_sms, send_whatsapp, view_analytics, manage_contacts"
                      value={formData.permissions.join(", ")}
                      onChange={handleChange}
                      invalid={!!errors.permissions}
                      className="shadow-sm"
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
              className="px-4 shadow-sm text-white fw-bold"
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

export default UserManagement;