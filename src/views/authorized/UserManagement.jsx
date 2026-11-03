import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Card, CardBody, CardHeader, CardFooter, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter,
  Form, FormGroup, Label, Input, Badge, Row, Col,
  Spinner, InputGroup, InputGroupText,
  Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import {
  FaUsers, FaPlus, FaEdit, FaTrash,
  FaEye, FaEyeSlash, FaUserShield, FaCheck, FaTimes,
  FaSearch, FaSyncAlt, FaWallet, FaSlidersH, FaClock,
  FaChevronDown, FaChevronRight, FaSitemap, FaCogs,
  FaBuilding, FaFileInvoice, FaKey, FaEnvelope, FaPhoneAlt,
  FaComments, FaBroadcastTower, FaCopy, FaExternalLinkAlt,
  FaUserCheck, FaUserTag, FaExchangeAlt, FaShieldAlt, FaIdBadge,
  FaTelegramPlane, FaBell
} from "react-icons/fa";
import apiClient, { BASE_HOST } from "@apiService";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { PageLoader } from "@/components";
import { jwtDecode } from "jwt-decode";
import { encryptUserId } from "@/utilities/secureId";

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

const ALL_TELECOM_CHANNELS = [
  { key: "sms", label: "SMS", icon: <FaPhoneAlt />, color: "#0ca678", name: "SMS (DLT Routes)" },
  { key: "whatsapp", label: "WhatsApp", icon: <FaComments />, color: "#25D366", name: "WhatsApp (Meta API)" },
  { key: "rcs", label: "RCS", icon: <FaBroadcastTower />, color: "#7950f2", name: "RCS (Google RBM)" },
  { key: "voice", label: "Voice", icon: <FaPhoneAlt />, color: "#fd7e14", name: "Voice / OBD" },
  { key: "email", label: "Email", icon: <FaEnvelope />, color: "#228be6", name: "Email (SMTP)" },
  { key: "telegram", label: "Telegram", icon: <FaTelegramPlane />, color: "#0088cc", name: "Telegram Bot & Gateway" },
  { key: "push", label: "Push", icon: <FaBell />, color: "#e64980", name: "Push Notifications" },
];

/* ================= INITIAL FORM ================= */
const initialForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "CLIENT",
  userDesignations: "",
  companyName: "",
  designation: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  gstin: "",
  pan: "",
  enabledChannels: ["sms", "whatsapp"],
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
  if (["profileImage", "isActive", "role", "status", "companyName", "designation", "address", "city", "state", "country", "pincode", "gstin", "pan", "enabledChannels"].includes(name)) return "";

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
    for (const item of items) {
      result.push(item);
      if (Array.isArray(item.children) && item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return result;
};

export const filterUserTree = (nodes = [], searchQuery = "", filterRole = "ALL", filterStatus = "ALL") => {
  if (!Array.isArray(nodes)) return [];

  const q = searchQuery.toLowerCase().trim();

  const matchesUser = (user) => {
    const nameMatch = user.name && user.name.toLowerCase().includes(q);
    const fullNameMatch = user.fullName && user.fullName.toLowerCase().includes(q);
    const emailMatch = user.email && user.email.toLowerCase().includes(q);
    const mobileMatch = user.mobile && user.mobile.includes(q);
    const regMatch = user.uRegistrationNo && user.uRegistrationNo.toLowerCase().includes(q);
    const designationMatch = user.userDesignations && user.userDesignations.toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || fullNameMatch || emailMatch || mobileMatch || regMatch || designationMatch;

    const matchesRole = filterRole === "ALL" || (user.role && user.role.toUpperCase() === filterRole.toUpperCase());

    let matchesStatus = true;
    if (filterStatus !== "ALL") {
      if (filterStatus === "ACTIVE") matchesStatus = user.isActive === true;
      else if (filterStatus === "INACTIVE") matchesStatus = user.isActive === false;
      else matchesStatus = user.status && user.status.toUpperCase() === filterStatus.toUpperCase();
    }

    return matchesSearch && matchesRole && matchesStatus;
  };

  const processNode = (node) => {
    const isSelfMatch = matchesUser(node);

    let filteredChildren = [];
    if (Array.isArray(node.children) && node.children.length > 0) {
      filteredChildren = node.children.map(processNode).filter(Boolean);
    }

    if (isSelfMatch || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
        hasMatchedDescendant: filteredChildren.length > 0,
      };
    }
    return null;
  };

  return nodes.map(processNode).filter(Boolean);
};

export const buildOrNormalizeUserTree = (rawUsers = [], loggedRole = "", currentUserId = "", currentUserEmail = "") => {
  if (!Array.isArray(rawUsers) || rawUsers.length === 0) return [];

  const isAlreadyNested = rawUsers.some((u) => Array.isArray(u.children) && u.children.length > 0);

  let fullTree = [];

  if (isAlreadyNested) {
    fullTree = rawUsers;
  } else {
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

    fullTree = roots.length > 0 ? roots : rawUsers;
  }

  const normalizedRole = (loggedRole || "").toUpperCase();
  if (normalizedRole === "DEVOPS" || normalizedRole === "ADMIN") {
    return fullTree.length > 0 ? fullTree : rawUsers;
  }

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

  return fullTree.length > 0 ? fullTree : rawUsers;
};

/* ================= MAIN USER MANAGEMENT ================= */
const UserManagement = () => {
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("basic");
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // User 360 Hub Modal State
  const [hubModal, setHubModal] = useState(false);
  const [hubUser, setHubUser] = useState(null);
  const [hubUpdating, setHubUpdating] = useState(false);
  const [hubPlanForm, setHubPlanForm] = useState({
    creditPlanId: "",
    isActive: true,
    isShow: true,
    isUse: true,
    showCalculatedPrice: false,
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");

  // Accordion Expand/Collapse Map
  const [expandedRows, setExpandedRows] = useState({});

  // Auth User
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
  const storedRole =
    sessionStorage.getItem("userRole") ||
    localStorage.getItem("userRole") ||
    "";
  const loggedRole = (
    storedRole ||
    currentUser?.role ||
    storedUser?.role ||
    "ADMIN"
  ).toUpperCase();
  const loggedWeight = ROLE_WEIGHTS[loggedRole] ?? 0;

  const isDevOps = loggedRole === "DEVOPS";
  const isAdmin = loggedRole === "ADMIN";
  const isReseller = loggedRole === "RESELLER";

  // Assignable Roles
  // Assignable Roles according to platform hierarchy:
  // DEVOPS/ADMIN -> ADMIN, RESELLER, CLIENT, MANAGER
  // RESELLER -> CLIENT, MANAGER
  // CLIENT -> MANAGER
  // MANAGER -> none
  const assignableRoles = useMemo(() => {
    if (isDevOps) return ["ADMIN", "RESELLER", "CLIENT", "MANAGER"];
    if (isAdmin) return ["ADMIN", "RESELLER", "CLIENT", "MANAGER"];
    if (isReseller) return ["CLIENT", "MANAGER"];
    if (loggedRole === "CLIENT") return ["MANAGER"];
    return [];
  }, [isDevOps, isAdmin, isReseller, loggedRole]);

  const canCreateUser = assignableRoles.length > 0;

  /* ================= LOAD USERS & PRICING PLANS ================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, plansRes] = await Promise.allSettled([
        apiClient.get('/users/list'),
        apiClient.get('/credit-plans'),
      ]);

      let rawUserList = [];
      if (usersRes.status === "fulfilled") {
        const val = usersRes.value;
        if (Array.isArray(val?.data)) {
          rawUserList = val.data;
        } else if (Array.isArray(val?.users)) {
          rawUserList = val.users;
        } else if (Array.isArray(val?.data?.data)) {
          rawUserList = val.data.data;
        } else if (Array.isArray(val)) {
          rawUserList = val;
        }
      }

      if (plansRes.status === "fulfilled") {
        const pVal = plansRes.value;
        let rawPlans = [];
        if (Array.isArray(pVal?.data)) {
          rawPlans = pVal.data;
        } else if (Array.isArray(pVal?.data?.data)) {
          rawPlans = pVal.data.data;
        } else if (Array.isArray(pVal)) {
          rawPlans = pVal;
        }
        setPlansList(rawPlans);
      }

      const userList = buildOrNormalizeUserTree(rawUserList, loggedRole, currentUserId, currentUserEmail);
      setUsers(userList);

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
    let tree = filterUserTree(users, searchQuery, filterRole, filterStatus);
    if (channelFilter !== "ALL") {
      const filterByChannel = (nodes) => {
        return nodes
          .map((n) => {
            const hasChannel = (n.enabledChannels || []).includes(channelFilter);
            const filteredChildren = n.children ? filterByChannel(n.children) : [];
            if (hasChannel || filteredChildren.length > 0) {
              return { ...n, children: filteredChildren };
            }
            return null;
          })
          .filter(Boolean);
      };
      tree = filterByChannel(tree);
    }
    return tree;
  }, [users, searchQuery, filterRole, filterStatus, channelFilter]);

  useEffect(() => {
    if (searchQuery.trim() || filterRole !== "ALL" || filterStatus !== "ALL" || channelFilter !== "ALL") {
      const flattened = flattenUserTree(filteredTree);
      setExpandedRows((prev) => {
        const next = { ...prev };
        flattened.forEach((u) => {
          if (u._id) next[u._id] = true;
        });
        return next;
      });
    }
  }, [searchQuery, filterRole, filterStatus, channelFilter, filteredTree]);

  // Statistics
  const allFlattenedUsers = useMemo(() => flattenUserTree(users), [users]);
  const totalUsers = allFlattenedUsers.length;
  const activeUsers = allFlattenedUsers.filter((u) => u.isActive).length;
  const pendingUsers = allFlattenedUsers.filter((u) => u.status === "PENDING").length;
  const clientCount = allFlattenedUsers.filter((u) => u.role === "CLIENT").length;
  const resellerCount = allFlattenedUsers.filter((u) => u.role === "RESELLER").length;
  const filteredFlattenedUsers = useMemo(() => flattenUserTree(filteredTree), [filteredTree]);

  /* ================= MODAL HANDLERS ================= */
  const openModal = () => {
    setEditing(null);
    setFormData(initialForm);
    setErrors({});
    setImagePreview(null);
    setModalActiveTab("basic");
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditing(null);
    setFormData(initialForm);
    setErrors({});
    setImagePreview(null);
    setShowPassword(false);
    setModalActiveTab("basic");
  };

  const openHubModal = (user) => {
    setHubUser(user);
    const planObj = user.myCreditPlan || user.MyCreditPlan || {};
    const planId =
      typeof planObj.creditPlanId === "object" && planObj.creditPlanId?._id
        ? planObj.creditPlanId._id
        : planObj.creditPlanId || "";

    setHubPlanForm({
      creditPlanId: planId,
      isActive: planObj.isActive ?? true,
      isShow: planObj.isShow ?? true,
      isUse: planObj.isUse ?? true,
      showCalculatedPrice: Boolean(user.showCalculatedPrice || user.myCreditPlanShowCalculatedPrice),
    });
    setHubModal(true);
  };

  const handleSaveHubPlan = async () => {
    if (!hubUser) return;
    setHubUpdating(true);
    try {
      await apiClient.patch(`/credit-plans/user/${hubUser._id}/assign`, hubPlanForm);
      Swal.fire({
        icon: "success",
        title: "Pricing Plan Updated!",
        text: "Custom route rate card and visibility rules updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      loadUsers();
    } catch (err) {
      console.error("Save Plan Error:", err);
      Swal.fire({
        icon: "error",
        title: "Plan Update Failed",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setHubUpdating(false);
    }
  };

  const canImpersonate = (target) => {
    if (!target || !target._id) return false;
    if (String(target._id) === String(currentUserId)) return false;
    if (isDevOps) return true;
    if (isAdmin) return (target.role || "").toUpperCase() !== "DEVOPS";
    if (isReseller) return ["CLIENT", "MANAGER", "USER"].includes((target.role || "").toUpperCase());
    return false;
  };

  const handleImpersonateLogin = async (targetUser) => {
    const targetName = targetUser.fullName || targetUser.name || targetUser.email;
    const result = await Swal.fire({
      title: `Login as "${targetName}"?`,
      html: `You are about to access the console as <strong>${targetName}</strong> (${targetUser.role}).<br/><br/>
        <div class="alert alert-light border text-start small mb-0 py-2">
          <div><i class="fa fa-external-link-alt text-primary me-1"></i> <strong>New Tab:</strong> Keeps your Admin console session completely active and untouched here.</div>
          <div class="text-muted mt-1"><i class="fa fa-shield-alt text-success me-1"></i> The user's ongoing login sessions and credentials remain 100% safe.</div>
        </div>`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#2563eb",
      denyButtonColor: "#475569",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "🚀 Open in New Tab",
      denyButtonText: "Open in Current Tab",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed && !result.isDenied) return;
    const isNewTab = result.isConfirmed;

    try {
      const res = await apiClient.post(`/users/impersonate/${targetUser._id}`);
      const { token, user } = res.data?.data || {};

      if (!token) throw new Error("No token returned from server");

      const origToken = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      const origUser = sessionStorage.getItem("userData") || localStorage.getItem("userData");
      const origRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || loggedRole;

      if (isNewTab) {
        const bridgeUrl = `/auth/impersonate-session#token=${encodeURIComponent(token)}&role=${encodeURIComponent(user?.role || targetUser.role)}&user=${encodeURIComponent(JSON.stringify(user || targetUser))}&adminToken=${encodeURIComponent(origToken || "")}&adminRole=${encodeURIComponent(origRole || "")}&adminUser=${encodeURIComponent(origUser || "")}`;

        window.open(bridgeUrl, "_blank");

        Swal.fire({
          icon: "success",
          title: "Session Launched in New Tab!",
          html: `Logged into <strong>${targetName}</strong> in a new tab.<br/><small class="text-muted">Your Admin console in this tab remains active and preserved.</small>`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        sessionStorage.setItem("impersonatorAdminToken", origToken);
        sessionStorage.setItem("impersonatorAdminUser", origUser);
        sessionStorage.setItem("impersonatorAdminRole", origRole);
        localStorage.setItem("impersonatorAdminToken", origToken);

        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userRole", user.role);
        sessionStorage.setItem("userData", JSON.stringify(user));

        await Swal.fire({
          icon: "success",
          title: "Session Switched!",
          text: `Now managing ${targetName}. Redirecting to dashboard...`,
          timer: 1200,
          showConfirmButton: false,
        });

        window.location.href = "/authorized/dashboard";
      }
    } catch (err) {
      console.error("Impersonate Error:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err?.response?.data?.message || err.message || "Failed to log in as user",
      });
    }
  };

  /* ================= FORM INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files?.[0] || null;
      if (file) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          return Swal.fire({
            icon: "warning",
            title: isHindi ? "अमान्य फ़ाइल प्रकार" : "Invalid File Type",
            text: isHindi ? "केवल JPG, PNG, या WEBP प्रारूप समर्थित हैं।" : "Only JPG, PNG, or WEBP formats are supported."
          });
        }
        if (file.size > 2 * 1024 * 1024) {
          return Swal.fire({
            icon: "warning",
            title: isHindi ? "फ़ाइल बहुत बड़ी है" : "File Too Large",
            text: isHindi ? "छवि का आकार 2MB से कम होना चाहिए।" : "Image size must be less than 2MB."
          });
        }
        setFormData((prev) => ({ ...prev, [name]: file }));
        setImagePreview(URL.createObjectURL(file));
      }
      return;
    }

    let parsedValue = value;
    if (name === "isActive") {
      parsedValue = value === "true" || value === true;
    } else if (name === "permissions" || name === "controls") {
      parsedValue = value.split(",").map((s) => s.trim()).filter(Boolean);
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }));

    const error = validateField(name, parsedValue, !!editing);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const toggleChannel = (channelKey) => {
    setFormData((prev) => {
      const current = prev.enabledChannels || [];
      const next = current.includes(channelKey)
        ? current.filter((c) => c !== channelKey)
        : [...current, channelKey];
      return { ...prev, enabledChannels: next };
    });
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
      name: user.name || user.fullName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      password: "",
      role: user.role || assignableRoles[0] || "CLIENT",
      userDesignations: user.userDesignations || "",
      companyName: user.companyName || "",
      designation: user.designation || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "India",
      pincode: user.pincode || "",
      gstin: user.gstin || "",
      pan: user.pan || "",
      enabledChannels: Array.isArray(user.enabledChannels) ? user.enabledChannels : ["sms", "whatsapp"],
      permissions: user.permissions || [],
      controls: user.controls || [],
      profileImage: null,
      status: user.status || "APPROVED",
      isActive: user.isActive ?? true,
    });
    setErrors({});
    setImagePreview(user.profileImage ? `${BASE_HOST}${user.profileImage}` : null);
    setModalActiveTab("basic");
    setModal(true);
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async (user) => {
    const targetRole = (user.role || "").toUpperCase();
    const targetWeight = ROLE_WEIGHTS[targetRole] || 0;

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

  // Quick Channel Toggle inside Hub Modal
  const handleHubToggleChannel = async (channelKey) => {
    if (!hubUser) return;
    const current = hubUser.enabledChannels || [];
    const next = current.includes(channelKey)
      ? current.filter((c) => c !== channelKey)
      : [...current, channelKey];

    setHubUpdating(true);
    try {
      const payload = new FormData();
      payload.append("enabledChannels", JSON.stringify(next));
      await apiClient.put(`/users/update/${hubUser._id}`, payload);
      setHubUser((prev) => ({ ...prev, enabledChannels: next }));
      loadUsers();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to update channel access",
        text: err?.response?.data?.message || err.message,
      });
    } finally {
      setHubUpdating(false);
    }
  };

  /* ================= RECURSIVE USER ROW COMPONENT ================= */
  const UserTreeRow = ({ user, level = 0, index = 1 }) => {
    const hasChildren = Array.isArray(user.children) && user.children.length > 0;
    const isExpanded = !!expandedRows[user._id];
    const roleBadge = getRoleBadge(user.role);
    const channels = Array.isArray(user.enabledChannels) ? user.enabledChannels : [];

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
                      : "bg-info"
                }`}
                style={{
                  width: "36px",
                  height: "36px",
                  fontSize: "14px"
                }}
              >
                {(user.name || user.fullName || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </td>

          {/* User Details & Hierarchy */}
          <td className="align-middle">
            <div className="d-flex align-items-center">
              {level > 0 && (
                <span
                  className="me-2 text-muted fw-bold d-inline-flex align-items-center"
                  style={{
                    marginLeft: `${(level - 1) * 24}px`,
                    fontSize: "16px",
                    color: "#94a3b8"
                  }}
                  title={`Level ${level} Downline`}
                >
                  ↳
                </span>
              )}

              {hasChildren ? (
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 me-2 text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center"
                  style={{ width: "24px", height: "24px" }}
                  onClick={() => toggleRow(user._id)}
                  title={isExpanded ? "Collapse Downlines" : "Expand Downlines"}
                >
                  {isExpanded ? (
                    <FaChevronDown size={11} className="text-primary" />
                  ) : (
                    <FaChevronRight size={11} className="text-muted" />
                  )}
                </button>
              ) : (
                <span style={{ display: "inline-block", width: "24px" }} className="me-2" />
              )}

              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2 flex-wrap">
                  <span>{user.name || user.fullName}</span>
                  {user.uRegistrationNo && (
                    <span
                      className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 font-monospace fw-semibold py-1 px-2"
                      style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                      title="Unique 11-Digit System Registration Number"
                    >
                      🆔 {user.uRegistrationNo}
                    </span>
                  )}
                  {hasChildren && (
                    <Badge color="light" className="text-secondary border py-1 px-2 fw-normal">
                      {user.children.length} {user.children.length === 1 ? "downline" : "downlines"}
                    </Badge>
                  )}
                  {user.companyName && (
                    <span className="badge bg-light text-muted border small fw-normal">
                      🏢 {user.companyName}
                    </span>
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
          <td className="text-nowrap align-middle">
            <a href={`tel:${user.mobile}`} className="text-decoration-none text-dark small">
              {user.mobile || "—"}
            </a>
          </td>

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

          {/* Authorized Channels */}
          <td className="align-middle" style={{ minWidth: "150px" }}>
            {channels.length ? (
              <div className="d-flex flex-wrap gap-1">
                {channels.map((chKey) => {
                  const meta = ALL_TELECOM_CHANNELS.find((c) => c.key === chKey);
                  return (
                    <span
                      key={chKey}
                      className="badge rounded-pill fw-semibold"
                      style={{
                        backgroundColor: `${meta?.color || "#333"}18`,
                        color: meta?.color || "#333",
                        border: `1px solid ${meta?.color || "#333"}30`,
                        fontSize: "10.5px",
                      }}
                      title={meta?.name || chKey}
                    >
                      {meta?.label || chKey.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="text-muted small">No channels</span>
            )}
          </td>

          {/* Access & Approval Status */}
          <td className="align-middle text-center">
            <div className="d-flex flex-column align-items-center justify-content-center gap-1 py-1">
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

              {/* Login As User (Impersonate / Masquerade) */}
              {canImpersonate(user) && (
                <Button
                  size="sm"
                  color="warning"
                  className="p-1 px-2 shadow-sm text-dark fw-bold border"
                  title={`Login as ${user.name || user.fullName} (${user.role})`}
                  onClick={() => handleImpersonateLogin(user)}
                >
                  <FaKey size={11} />
                </Button>
              )}

              {/* 360° Management Hub */}
              <Button
                size="sm"
                color="primary"
                outline
                className="p-1 px-2 shadow-sm"
                title="User 360° Configuration Hub"
                onClick={() => openHubModal(user)}
              >
                <FaSlidersH size={12} />
              </Button>

              {/* Profile & Settings (Direct Management Hub) */}
              <Button
                size="sm"
                color="dark"
                className="p-1 px-2 text-white shadow-sm border-0"
                style={{ background: "#334155" }}
                title={isHindi ? "प्रोफ़ाइल और सेटिंग्स (Profile & Settings)" : "User Profile & Account Settings"}
                onClick={() => navigate(`/authorized/account/profile-settings?userId=${user._id}`)}
              >
                <FaIdBadge size={12} />
              </Button>

              {/* Communication Config — ADMIN & DEVOPS ONLY */}
              {(isAdmin || isDevOps) && (
                <Button
                  size="sm"
                  color="primary"
                  className="p-1 px-2 text-white shadow-sm"
                  title={isHindi ? "संचार विन्यास (Communication Config)" : "Communication Gateways Setup"}
                  onClick={() => navigate(`/authorized/config/communication/${encryptUserId(user._id)}`)}
                >
                  <FaCogs size={12} />
                </Button>
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

              {/* Edit Button */}
              <Button
                size="sm"
                color="info"
                className="p-1 px-2 text-white shadow-sm"
                title="Edit User Details"
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
                ? "DevOps Platform Administration & Hierarchy Control"
                : isAdmin
                  ? "Administrative Control & Client/Reseller Directory"
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
        {/* ── COMMAND STATS CARDS ── */}
        <div className="p-3 bg-white border-bottom">
          <Row className="g-2">
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Total Accounts</span>
                <strong className="fs-5 text-dark">{totalUsers}</strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Active (Allowed)</span>
                <strong className="fs-5 text-success">{activeUsers}</strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Clients</span>
                <strong className="fs-5 text-primary">{clientCount}</strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Resellers</span>
                <strong className="fs-5 text-purple" style={{ color: "#7950f2" }}>{resellerCount}</strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Pending Review</span>
                <strong className="fs-5 text-warning">{pendingUsers}</strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Filtered Matches</span>
                <strong className="fs-5 text-secondary">{filteredFlattenedUsers.length}</strong>
              </div>
            </Col>
          </Row>
        </div>

        {/* ── FILTERS & SEARCH BAR ── */}
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
                {searchQuery && (
                  <Button color="white" className="border border-start-0 bg-white" onClick={() => setSearchQuery("")}>
                    <FaTimes size={11} className="text-muted" />
                  </Button>
                )}
              </InputGroup>
            </Col>

            {/* Filter: Role */}
            <Col xs={6} md={2} lg={2}>
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
            <Col xs={6} md={2} lg={2}>
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

            {/* Filter: Channel */}
            <Col xs={6} md={2} lg={2}>
              <Input
                type="select"
                size="sm"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="shadow-sm bg-white fw-semibold cursor-pointer"
              >
                <option value="ALL">All Channels</option>
                <option value="sms">SMS Active</option>
                <option value="whatsapp">WhatsApp Active</option>
                <option value="rcs">RCS Active</option>
                <option value="voice">Voice Active</option>
                <option value="email">Email Active</option>
              </Input>
            </Col>

            {/* Tree Expand / Collapse controls */}
            <Col xs={6} md={2} lg={3} className="d-flex align-items-center justify-content-lg-end gap-1">
              <Button
                color="light"
                size="sm"
                className="border bg-white text-secondary shadow-sm px-2.5 py-1 small fw-semibold"
                onClick={expandAll}
                title="Expand All Hierarchy"
              >
                <FaChevronDown size={10} className="me-1" /> Expand
              </Button>
              <Button
                color="light"
                size="sm"
                className="border bg-white text-secondary shadow-sm px-2.5 py-1 small fw-semibold"
                onClick={collapseAll}
                title="Collapse All Hierarchy"
              >
                <FaChevronRight size={10} className="me-1" /> Collapse
              </Button>
            </Col>
          </Row>
        </div>

        {/* ── USERS TABLE (RECURSIVE ACCORDION TREE) ── */}
        <div className="table-responsive">
          <Table hover className="table-hover mb-0 align-middle">
            <thead className="table-light small text-uppercase">
              <tr>
                <th className="text-center" style={{ width: "50px" }}>#</th>
                <th style={{ width: "55px" }}>Photo</th>
                <th style={{ minWidth: "220px" }}>User Details &amp; Hierarchy</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Designation</th>
                <th>Authorized Channels</th>
                <th className="text-center" style={{ minWidth: "135px" }}>Access / Status</th>
                <th className="text-center" style={{ minWidth: "180px" }}>Actions</th>
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
            <FaSitemap className="text-secondary" /> BeyondSend Cloud Telecom Hierarchy Engine
          </small>
        </div>
      </CardBody>

      {/* ── MODAL: CREATE / EDIT USER WITH TABS ── */}
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
            ? (isHindi ? "✏️ उपयोगकर्ता विवरण संपादित करें" : "✏️ Edit Account Configuration")
            : (isHindi ? "➕ नया उपयोगकर्ता जोड़ें" : "➕ Onboard New Client / Reseller")}
        </ModalHeader>

        <Form onSubmit={handleSubmit} noValidate>
          {/* TAB NAV IN MODAL */}
          <Nav tabs className="bg-light px-3 pt-2 border-bottom">
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  modalActiveTab === "basic" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setModalActiveTab("basic")}
              >
                👤 1. Account &amp; Login
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  modalActiveTab === "company" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setModalActiveTab("company")}
              >
                🏢 2. Company &amp; Billing
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  modalActiveTab === "channels" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setModalActiveTab("channels")}
              >
                ⚡ 3. Channels &amp; Access
              </NavLink>
            </NavItem>
          </Nav>

          <ModalBody className="p-4 bg-light">
            <TabContent activeTab={modalActiveTab}>
              {/* TAB 1: BASIC PROFILE */}
              <TabPane tabId="basic">
                {/* AVATAR UPLOAD */}
                <div className="d-flex flex-column align-items-center mb-3 pb-3 border-bottom">
                  <div className="position-relative mb-2">
                    <img
                      src={imagePreview || "https://ui-avatars.com/api/?name=User&background=e2e8f0&color=1e40af&size=120"}
                      alt="Avatar Preview"
                      className="rounded-circle shadow-sm bg-white border border-3 border-white"
                      style={{
                        width: "84px",
                        height: "84px",
                        objectFit: "cover"
                      }}
                    />
                    {imagePreview && (
                      <Button
                        color="danger"
                        size="sm"
                        className="position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex justify-content-center align-items-center shadow"
                        style={{ width: "22px", height: "22px" }}
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
                  <small className="text-muted mt-1 small">JPG, PNG or WEBP (Max 2MB)</small>
                </div>

                <div className="bg-white p-3 rounded-3 shadow-sm border">
                  <Row className="g-3">
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="fw-bold text-dark small mb-1">
                          Full Name <span className="text-danger">*</span>
                        </Label>
                        <Input
                          name="name"
                          placeholder="e.g. Anand Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          invalid={!!errors.name}
                          className="shadow-sm"
                          required
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                      </FormGroup>
                    </Col>

                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="fw-bold text-dark small mb-1">
                          Email Address <span className="text-danger">*</span>
                        </Label>
                        <Input
                          type="email"
                          name="email"
                          placeholder="e.g. client@beyondsend.com"
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

                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="fw-bold text-dark small mb-1">
                          Designation <span className="text-danger">*</span>
                        </Label>
                        <Input
                          name="userDesignations"
                          placeholder="e.g. Account Administrator / Marketing Lead"
                          value={formData.userDesignations}
                          onChange={handleChange}
                          invalid={!!errors.userDesignations}
                          className="shadow-sm"
                          required
                        />
                        {errors.userDesignations && <div className="invalid-feedback">{errors.userDesignations}</div>}
                      </FormGroup>
                    </Col>

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

                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="fw-bold text-dark small mb-1">System Access</Label>
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

                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="fw-bold text-dark small mb-1">Approval Status</Label>
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
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: COMPANY & BILLING */}
              <TabPane tabId="company">
                <div className="bg-white p-3 rounded-3 shadow-sm border">
                  <h6 className="fw-bold text-dark mb-2">Corporate &amp; Billing Profile</h6>
                  <p className="text-muted small mb-3">
                    Enter business organization tax details and billing address for invoices and recharge receipts.
                  </p>
                  <Row className="g-3">
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Company / Organization Name</Label>
                        <Input
                          type="text"
                          name="companyName"
                          placeholder="e.g. Acme Telecom Solutions Pvt Ltd"
                          value={formData.companyName}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Corporate Designation</Label>
                        <Input
                          type="text"
                          name="designation"
                          placeholder="e.g. Managing Director / CTO"
                          value={formData.designation}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">GSTIN Number</Label>
                        <Input
                          type="text"
                          name="gstin"
                          placeholder="e.g. 27AAAAA0000A1Z5"
                          value={formData.gstin}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">PAN Number</Label>
                        <Input
                          type="text"
                          name="pan"
                          placeholder="e.g. AAAAA0000A"
                          value={formData.pan}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Registered Billing Address</Label>
                        <Input
                          type="text"
                          name="address"
                          placeholder="e.g. Suite 402, Cyber Tower, Sector 62"
                          value={formData.address}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">City</Label>
                        <Input
                          type="text"
                          name="city"
                          placeholder="e.g. Mumbai"
                          value={formData.city}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">State</Label>
                        <Input
                          type="text"
                          name="state"
                          placeholder="e.g. Maharashtra"
                          value={formData.state}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Country</Label>
                        <Input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">PIN Code</Label>
                        <Input
                          type="text"
                          name="pincode"
                          placeholder="e.g. 400001"
                          value={formData.pincode}
                          onChange={handleChange}
                          className="shadow-sm"
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 3: CHANNELS & PERMISSIONS */}
              <TabPane tabId="channels">
                <div className="bg-white p-3 rounded-3 shadow-sm border mb-3">
                  <h6 className="fw-bold text-dark mb-1">Authorized Telecom Channels</h6>
                  <p className="text-muted small mb-3">
                    Select which communication channels are authorized for this account to dispatch campaigns.
                  </p>
                  <Row className="g-2">
                    {ALL_TELECOM_CHANNELS.map((ch) => {
                      const isChecked = (formData.enabledChannels || []).includes(ch.key);
                      return (
                        <Col xs={6} md={4} key={ch.key}>
                          <div
                            className={`p-2.5 border rounded-3 transition-all d-flex align-items-center justify-content-between ${
                              isChecked ? "bg-primary bg-opacity-10 border-primary" : "bg-light"
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => toggleChannel(ch.key)}
                          >
                            <span className="small fw-semibold d-flex align-items-center gap-1.5" style={{ color: ch.color }}>
                              <span>{ch.icon}</span> {ch.name}
                            </span>
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={isChecked}
                              onChange={() => toggleChannel(ch.key)}
                              style={{ width: 17, height: 17, cursor: "pointer" }}
                            />
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>

                <div className="bg-white p-3 rounded-3 shadow-sm border">
                  <FormGroup className="mb-0">
                    <Label className="fw-bold text-dark small mb-1">
                      Custom Feature Permissions <small className="text-muted">(Comma separated)</small>
                    </Label>
                    <Input
                      name="permissions"
                      placeholder="e.g. send_sms, send_whatsapp, view_analytics, export_reports, manage_dlt"
                      value={formData.permissions.join(", ")}
                      onChange={handleChange}
                      invalid={!!errors.permissions}
                      className="shadow-sm"
                    />
                    {errors.permissions && <div className="invalid-feedback">{errors.permissions}</div>}
                    <small className="text-muted mt-1 d-block small">
                      Leave blank to grant default permissions for role <strong>{formData.role}</strong>.
                    </small>
                  </FormGroup>
                </div>
              </TabPane>
            </TabContent>
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
                  {editing ? "Saving Changes..." : "Creating Account..."}
                </>
              ) : (
                editing ? "💾 Save Changes" : "✅ Create Account"
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── USER 360° CONFIGURATION HUB MODAL ── */}
      {hubUser && (
        <Modal isOpen={hubModal} toggle={() => setHubModal(false)} size="lg" centered>
          <ModalHeader toggle={() => setHubModal(false)} className="bg-dark text-white border-0 py-2.5 px-3">
            <div className="d-flex align-items-center gap-2 fw-bold">
              <FaSlidersH className="text-primary" /> User 360° Management Hub
            </div>
          </ModalHeader>
          <ModalBody className="p-3 bg-light">
            {/* User Profile Card */}
            <Card className="border-0 shadow-sm mb-3 bg-white">
              <CardBody className="py-3 px-3">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: hubUser.role === "RESELLER" ? "#7950f2" : "#228be6",
                        fontSize: "18px",
                      }}
                    >
                      {(hubUser.name || hubUser.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="fw-bold mb-0 text-dark">{hubUser.name || hubUser.fullName}</h6>
                        <Badge color={hubUser.role === "RESELLER" ? "info" : "primary"} pill>
                          {hubUser.role}
                        </Badge>
                        <Badge color={hubUser.status === "APPROVED" ? "success" : "warning"} pill>
                          {hubUser.status || "APPROVED"}
                        </Badge>
                      </div>
                      <div className="text-muted small mt-0.5">
                        <span>{hubUser.email}</span> • <span>{hubUser.mobile || "No Mobile"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div className="text-end">
                      <span className="small text-muted d-block" style={{ fontSize: "11px" }}>Secure ID Token:</span>
                      <code className="bg-light px-2 py-0.5 rounded border text-primary small">
                        {encryptUserId(hubUser._id).slice(0, 14)}...
                      </code>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {canImpersonate(hubUser) && (
                        <Button
                          color="warning"
                          size="sm"
                          className="fw-bold d-flex align-items-center gap-1.5 shadow-sm text-dark px-3 border"
                          title={`Login as ${hubUser.name || hubUser.fullName}`}
                          onClick={() => {
                            setHubModal(false);
                            handleImpersonateLogin(hubUser);
                          }}
                        >
                          <FaKey size={11} /> Login as {hubUser.name || hubUser.fullName}
                        </Button>
                      )}
                      <Button
                        color="light"
                        size="sm"
                        className="py-1 px-1.5 border"
                        title="Copy Secure Token"
                        onClick={() => {
                          navigator.clipboard.writeText(encryptUserId(hubUser._id));
                          Swal.fire({ icon: "success", title: "Copied!", timer: 1000, showConfirmButton: false });
                        }}
                      >
                        <FaCopy size={11} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Credit Pricing Plan & Rate Visibility Management */}
            <Card className="border-0 shadow-sm mb-3 bg-white">
              <CardHeader className="bg-white py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold small text-uppercase text-dark">
                  📊 Credit Pricing Plan &amp; Rate Visibility Tier
                </span>
                <Badge color="info" pill>Tier Engine</Badge>
              </CardHeader>
              <CardBody className="py-3 px-3">
                <Row className="g-3 align-items-center">
                  <Col md={5}>
                    <Label className="small fw-semibold text-secondary mb-1">Assigned Pricing Plan</Label>
                    <Input
                      type="select"
                      size="sm"
                      value={hubPlanForm.creditPlanId}
                      onChange={(e) => setHubPlanForm((prev) => ({ ...prev, creditPlanId: e.target.value }))}
                      disabled={hubUpdating}
                      className="fw-semibold"
                    >
                      <option value="">🌐 Standard Global Master Base Rates (Default)</option>
                      {plansList.map((plan) => (
                        <option key={plan._id} value={plan._id}>
                          📑 {plan.planName || plan.name} {plan.description ? `(${plan.description})` : ""}
                        </option>
                      ))}
                    </Input>
                  </Col>

                  <Col md={7}>
                    <div className="d-flex flex-wrap gap-2 align-items-center pt-3">
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="hubPlanIsActive"
                          checked={hubPlanForm.isActive}
                          onChange={(e) => setHubPlanForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                        />
                        <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="hubPlanIsActive">
                          Plan Active
                        </label>
                      </div>

                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="hubPlanIsUse"
                          checked={hubPlanForm.isUse}
                          onChange={(e) => setHubPlanForm((prev) => ({ ...prev, isUse: e.target.checked }))}
                        />
                        <label className="form-check-label small fw-semibold cursor-pointer" htmlFor="hubPlanIsUse">
                          Apply in Topups
                        </label>
                      </div>

                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="hubPlanShowPrice"
                          checked={hubPlanForm.showCalculatedPrice}
                          onChange={(e) => setHubPlanForm((prev) => ({ ...prev, showCalculatedPrice: e.target.checked }))}
                        />
                        <label className="form-check-label small fw-semibold text-primary cursor-pointer" htmlFor="hubPlanShowPrice">
                          Show Rates
                        </label>
                      </div>

                      <Button
                        color="primary"
                        size="sm"
                        disabled={hubUpdating}
                        className="ms-auto fw-bold px-3 shadow-sm text-white"
                        onClick={handleSaveHubPlan}
                      >
                        {hubUpdating ? <Spinner size="sm" /> : "💾 Save Plan"}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Telecom Channel Access Toggles */}
            <Card className="border-0 shadow-sm mb-3 bg-white">
              <CardHeader className="bg-white py-2 px-3 border-bottom d-flex align-items-center justify-content-between">
                <span className="fw-bold small text-uppercase text-dark">
                  ⚡ Authorized Telecom Channels ({hubUser.enabledChannels?.length || 0}/{ALL_TELECOM_CHANNELS.length})
                </span>
                <span className="text-muted small">Click any channel to toggle access</span>
              </CardHeader>
              <CardBody className="py-2.5 px-3">
                <div className="d-flex flex-wrap gap-2">
                  {ALL_TELECOM_CHANNELS.map((ch) => {
                    const isEnabled = (hubUser.enabledChannels || []).includes(ch.key);
                    return (
                      <Button
                        key={ch.key}
                        size="sm"
                        color={isEnabled ? "light" : "light"}
                        disabled={hubUpdating}
                        className={`d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold border ${
                          isEnabled ? "border-success bg-success bg-opacity-10 text-success" : "text-muted"
                        }`}
                        onClick={() => handleHubToggleChannel(ch.key)}
                      >
                        <span>{ch.icon}</span> {ch.name}
                        {isEnabled ? <FaCheck size={10} className="ms-1" /> : <FaTimes size={10} className="ms-1 text-danger" />}
                      </Button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Direct Configuration Hub Jump Cards */}
            <h6 className="fw-bold text-dark small text-uppercase mb-2">Connected Management Modules</h6>
            <Row className="g-2">
              <Col md={4}>
                <Card className="border shadow-sm h-100 hover-shadow transition-all bg-white">
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-primary mb-1">
                        <FaCogs size={16} />
                        <strong className="text-dark small">Communication Gateways</strong>
                      </div>
                      <p className="text-muted small mb-3" style={{ fontSize: "11.5px" }}>
                        Configure Jio RCS, Meta WhatsApp, Mobiglitz DLT route keys, and SMTP server.
                      </p>
                    </div>
                    <Button
                      color="primary"
                      size="sm"
                      className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        setHubModal(false);
                        navigate(`/authorized/config/communication/${encryptUserId(hubUser._id)}`);
                      }}
                    >
                      Configure Gateways <FaExternalLinkAlt size={10} />
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border shadow-sm h-100 hover-shadow transition-all bg-white">
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-success mb-1">
                        <FaWallet size={16} />
                        <strong className="text-dark small">Wallet &amp; Credits</strong>
                      </div>
                      <p className="text-muted small mb-3" style={{ fontSize: "11.5px" }}>
                        View 20 granular route balances, add topup credits, or deduct balance.
                      </p>
                    </div>
                    <Button
                      color="success"
                      size="sm"
                      className="w-100 fw-semibold text-white d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        setHubModal(false);
                        navigate(`/authorized/account/credits-topup-management?userId=${hubUser._id}`);
                      }}
                    >
                      Manage Wallet <FaExternalLinkAlt size={10} />
                    </Button>
                  </CardBody>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border shadow-sm h-100 hover-shadow transition-all bg-white">
                  <CardBody className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center gap-2 text-info mb-1">
                        <FaSlidersH size={16} />
                        <strong className="text-dark small">Pricing Plan Tier</strong>
                      </div>
                      <p className="text-muted small mb-3" style={{ fontSize: "11.5px" }}>
                        Map custom route unit rate cards or enforce Global Master Base Rates.
                      </p>
                    </div>
                    <Button
                      color="info"
                      size="sm"
                      className="w-100 fw-semibold text-white d-flex align-items-center justify-content-center gap-1"
                      onClick={() => {
                        setHubModal(false);
                        navigate(`/authorized/config/credit-plans`);
                      }}
                    >
                      Pricing Plans <FaExternalLinkAlt size={10} />
                    </Button>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="py-2 px-3 bg-white">
            <Button color="light" size="sm" onClick={() => setHubModal(false)}>
              Close Hub
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Card>
  );
};

export default UserManagement;