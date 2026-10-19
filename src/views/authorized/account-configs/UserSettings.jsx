import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Row, Col, Nav, NavItem, NavLink,
  Form, FormGroup, Label, Input, Spinner, Alert, Badge, InputGroup, InputGroupText,
} from "reactstrap";
import {
  FaSlidersH, FaSave, FaUndo, FaSyncAlt, FaBell, FaPalette, FaBuilding,
  FaShieldAlt, FaGlobe, FaUser, FaIdBadge, FaLock, FaUnlock, FaCheckCircle,
  FaBriefcase, FaEnvelope, FaPhoneAlt, FaKey, FaCogs, FaSearch, FaUserTie,
  FaTimes, FaExternalLinkAlt, FaCheck, FaExclamationTriangle
} from "react-icons/fa";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import apiClient, { BASE_HOST } from "@apiService";
import { useToast, ToastContainer, wpSwal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";
import { useLanguage } from "@/contexts/LanguageContext";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

const DATE_FORMATS = ["DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

const NOTIFICATION_FIELDS = [
  ["email", "Email notifications"],
  ["sms", "SMS notifications"],
  ["inApp", "In-app notifications"],
  ["creditThreshold", "Credit threshold alerts"],
  ["notifyLowCredits", "Low credit warnings"],
  ["notifyCampaignComplete", "Campaign completed"],
  ["notifyDeliveryFailure", "Delivery failures"],
];

const BRANDING_FIELDS = [
  ["brandName", "Brand name", "text", "e.g. Acme Communications"],
  ["logoUrl", "Logo URL", "url", "https://example.com/logo.png"],
  ["primaryColor", "Primary colour (hex)", "text", "#2563eb"],
  ["domainName", "Custom Domain / CNAME", "text", "e.g. portal.mybrand.com"],
  ["supportEmail", "Support email", "email", "support@company.com"],
  ["supportPhone", "Support phone", "tel", "+91 9876543210"],
];

const emptyForm = () => ({
  locale: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD-MM-YYYY",
  twoFactorEnabled: false,
  loginAlerts: true,
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 60,
  defaultScheduleTimezone: "Asia/Kolkata",
  respectQuietHours: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  defaultBatchSize: 500,
  notifications: {},
  branding: {},
});

/** Unified Profile Details & User Settings Component */
const UserSettings = ({ userId: propUserId = null, defaultTab = null, readOnly: propReadOnly = false }) => {
  const { isHindi } = useLanguage();
  const { toasts, toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const routeParams = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve target userId (prop > route :userId > query ?userId)
  const effectiveUserId = useMemo(() => {
    return propUserId || routeParams?.userId || searchParams.get("userId") || null;
  }, [propUserId, routeParams?.userId, searchParams]);

  // Pure local tab state — URL remains clean (/authorized/account/profile-settings)
  const [tab, setTab] = useState(defaultTab || "profile");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lockingLoading, setLockingLoading] = useState(false);

  const [timezones, setTimezones] = useState([]);
  const [user, setUser] = useState(null);
  const [isViewerSuper, setIsViewerSuper] = useState(false);
  const [form, setForm] = useState(emptyForm());

  // Editable profile state (syncs with users table)
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    mobile: "",
    userDesignations: "",
    companyName: "",
    website: "",
    designation: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    gstin: "",
    pan: "",
  });

  // Admin User Switcher State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Load User Data & Settings
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = effectiveUserId ? `/user-settings/${effectiveUserId}` : "/user-settings";
      const res = await apiClient.get(url);
      const payload = res?.data?.data || {};

      setTimezones(payload.supportedTimezones || []);
      const u = payload.user || null;
      setUser(u);
      setIsViewerSuper(Boolean(payload.isViewerSuper));

      if (u) {
        let fallbackName = "";
        try {
          const stored = JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
          fallbackName = stored?.fullName || stored?.name || "";
        } catch {}

        setProfileForm({
          fullName: u.fullName || u.name || fallbackName || "",
          mobile: u.mobile || "",
          userDesignations: u.userDesignations || "",
          companyName: u.companyName || "",
          website: u.website || "",
          designation: u.designation || "",
          address: u.address || "",
          city: u.city || "",
          state: u.state || "",
          country: u.country || "India",
          pincode: u.pincode || "",
          gstin: u.gstin || "",
          pan: u.pan || "",
        });
      }

      const current = payload.settings || {};
      setForm({
        ...emptyForm(),
        ...current,
        notifications: { ...(current.notifications || {}) },
        branding: { ...(current.branding || {}) },
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load user settings & profile");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Admin Search Users Handler
  useEffect(() => {
    if (!isViewerSuper || !userSearchQuery.trim()) {
      setUserSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await apiClient.get(`/user-settings/search-users?search=${encodeURIComponent(userSearchQuery.trim())}`);
        setUserSearchResults(res?.data?.data || []);
        setShowSearchDropdown(true);
      } catch {
        setUserSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [userSearchQuery, isViewerSuper]);

  const selectUserToManage = (selectedUser) => {
    setShowSearchDropdown(false);
    setUserSearchQuery("");
    navigate(`/authorized/account/profile-settings?userId=${selectedUser._id}`);
  };

  const returnToMyProfile = () => {
    navigate("/authorized/account/profile-settings");
  };

  // Profile Lock Status Checks
  const isProfileLocked = Boolean(user?.isProfileLocked);
  // Normal users cannot edit if locked; superusers (Admin/DevOps) can always edit
  const isLockedForUser = isProfileLocked && !isViewerSuper;
  const isReadOnly = propReadOnly || isLockedForUser;

  // Toggle Profile Lock Handler (Admin/DevOps only)
  const handleToggleLock = async () => {
    if (!isViewerSuper || !user?._id) return;
    try {
      setLockingLoading(true);
      const res = await apiClient.post("/user-settings/toggle-lock", {
        userId: user._id,
        isLocked: !isProfileLocked,
      });
      toast.success(res?.data?.message || (!isProfileLocked ? "Profile is now LOCKED." : "Profile is now UNLOCKED."));
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to toggle profile lock status");
    } finally {
      setLockingLoading(false);
    }
  };

  // Form Field Updaters
  const [errors, setErrors] = useState({});

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  // Form Field Updaters
  const setTop = (key, value) => {
    clearError(key);
    setForm((p) => ({ ...p, [key]: value }));
  };
  const setGroup = (group, key, value) => {
    clearError(`${group}.${key}`);
    setForm((p) => ({ ...p, [group]: { ...p[group], [key]: value } }));
  };
  const setProfileField = (key, value) => {
    clearError(key);
    setProfileForm((p) => ({ ...p, [key]: value }));
  };

  // Comprehensive Client Validation Engine
  const validateForm = () => {
    const errs = {};

    // 1. Full Name
    const nameVal = (profileForm.fullName || "").trim();
    if (!nameVal) {
      errs.fullName = isHindi ? "पूरा नाम आवश्यक है।" : "Full name is required.";
    } else if (nameVal.length < 2) {
      errs.fullName = isHindi ? "नाम कम से कम 2 अक्षरों का होना चाहिए।" : "Full name must be at least 2 characters.";
    }

    // 2. Mobile (Indian 10-digit mobile)
    const mobileVal = (profileForm.mobile || "").trim();
    if (!mobileVal) {
      errs.mobile = isHindi ? "मोबाइल नंबर आवश्यक है।" : "Mobile number is required.";
    } else if (!/^[6-9]\d{9}$/.test(mobileVal)) {
      errs.mobile = isHindi
        ? "कृपया 10 अंकों का मान्य भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।"
        : "Please enter a valid 10-digit Indian mobile number (starts with 6-9).";
    }

    // 3. GSTIN (Optional, but if filled must be valid)
    const gstinVal = (profileForm.gstin || "").trim().toUpperCase();
    if (gstinVal && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstinVal)) {
      errs.gstin = isHindi
        ? "अमान्य GSTIN प्रारूप (उदा. 22AAAAA0000A1Z5)"
        : "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)";
    }

    // 4. PAN (Optional, but if filled must be valid)
    const panVal = (profileForm.pan || "").trim().toUpperCase();
    if (panVal && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panVal)) {
      errs.pan = isHindi
        ? "अमान्य PAN प्रारूप (उदा. ABCDE1234F)"
        : "Invalid PAN format (e.g. ABCDE1234F)";
    }

    // 5. PIN Code (Optional, but if filled must be 6 digits)
    const pinVal = (profileForm.pincode || "").trim();
    if (pinVal && !/^[1-9][0-9]{5}$/.test(pinVal)) {
      errs.pincode = isHindi
        ? "कृपया 6 अंकों का मान्य पिन कोड दर्ज करें।"
        : "Please enter a valid 6-digit Indian PIN code.";
    }

    // 6. Security Controls
    if (form.maxConcurrentSessions !== undefined && form.maxConcurrentSessions !== "") {
      const num = Number(form.maxConcurrentSessions);
      if (isNaN(num) || num < 1 || num > 50) {
        errs.maxConcurrentSessions = isHindi
          ? "समवर्ती सत्र 1 से 50 के बीच होने चाहिए।"
          : "Concurrent sessions must be between 1 and 50.";
      }
    }

    if (form.sessionTimeoutMinutes !== undefined && form.sessionTimeoutMinutes !== "") {
      const num = Number(form.sessionTimeoutMinutes);
      if (isNaN(num) || num < 5 || num > 1440) {
        errs.sessionTimeoutMinutes = isHindi
          ? "सत्र समाप्ति समय 5 से 1440 मिनट के बीच होना चाहिए।"
          : "Session timeout must be between 5 and 1440 minutes.";
      }
    }

    // 7. Quiet Hours
    if (form.respectQuietHours) {
      if (!form.quietHoursStart || !/^\d{2}:\d{2}$/.test(form.quietHoursStart)) {
        errs.quietHoursStart = isHindi ? "प्रारंभ समय HH:MM प्रारूप में होना चाहिए।" : "Start time must be HH:MM.";
      }
      if (!form.quietHoursEnd || !/^\d{2}:\d{2}$/.test(form.quietHoursEnd)) {
        errs.quietHoursEnd = isHindi ? "समाप्ति समय HH:MM प्रारूप में होना चाहिए।" : "End time must be HH:MM.";
      }
    }

    // 8. Branding Validations
    if (form.branding?.supportEmail && form.branding.supportEmail.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.branding.supportEmail.trim())) {
        errs["branding.supportEmail"] = isHindi ? "मान्य सहायता ईमेल दर्ज करें।" : "Invalid support email address.";
      }
    }
    if (form.branding?.primaryColor && form.branding.primaryColor.trim()) {
      if (!/^#[0-9a-fA-F]{3,8}$/.test(form.branding.primaryColor.trim())) {
        errs["branding.primaryColor"] = isHindi ? "मान्य हेक्स रंग कोड दर्ज करें (#RRGGBB)।" : "Invalid hex color code (#RRGGBB).";
      }
    }

    // 9. Profile Website Validation
    if (profileForm.website && profileForm.website.trim()) {
      if (!/^https?:\/\/.+/i.test(profileForm.website.trim())) {
        errs.website = isHindi ? "URL http:// या https:// से शुरू होना चाहिए।" : "Website URL must start with http:// or https://.";
      }
    }

    return errs;
  };

  // Save Settings & Profile (regular users automatically lock on save)
  const save = async (lockOnSubmit = !isViewerSuper) => {
    if (isLockedForUser) {
      toast.warning("Profile is locked and verified. Contact an administrator to make changes.");
      return;
    }

    const valErrors = validateForm();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);

      // Auto switch to tab containing errors
      if (valErrors.fullName || valErrors.mobile || valErrors.gstin || valErrors.pan || valErrors.pincode || valErrors.website) {
        if (tab !== "profile") setTab("profile");
      } else if (valErrors.maxConcurrentSessions || valErrors.sessionTimeoutMinutes) {
        if (tab !== "security") setTab("security");
      } else if (valErrors.quietHoursStart || valErrors.quietHoursEnd) {
        if (tab !== "general") setTab("general");
      } else if (valErrors["branding.supportEmail"] || valErrors["branding.primaryColor"]) {
        if (tab !== "branding") setTab("branding");
      }

      toast.warning(
        isHindi
          ? "कृपया फ़ॉर्म में चिह्नित त्रुटियों को ठीक करें।"
          : "Please correct the highlighted errors before saving."
      );
      return;
    }
    setErrors({});

    try {
      setSaving(true);
      const res = await apiClient.put("/user-settings", {
        userId: effectiveUserId || undefined,
        ...form,
        ...profileForm,
        lockOnSubmit: Boolean(lockOnSubmit),
      });

      toast.success(res?.data?.message || (isHindi ? "परिवर्तन सफलतापूर्वक सहेजे गए" : "Changes saved successfully"));
      await load();
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      const respErrors = err?.response?.data?.errors;
      toast.error(
        Array.isArray(respErrors) && respErrors.length
          ? respErrors.join("; ")
          : err?.response?.data?.message || err?.message || "Failed to save profile and settings"
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const reset = async () => {
    const isConfirmed = await wpSwal.confirm(
      "Reset Settings to Defaults?",
      "Reset all preferences back to system defaults? This cannot be undone."
    );
    if (!isConfirmed) return;
    try {
      setSaving(true);
      const res = await apiClient.post("/user-settings/reset", { userId: effectiveUserId || undefined });
      toast.success(res?.data?.message || "Settings reset to defaults");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) return <PageLoader />;

  const tabs = [
    { id: "profile", label: isHindi ? "प्रोफ़ाइल विवरण" : "Profile Details", icon: FaUser },
    { id: "general", label: isHindi ? "सामान्य" : "General", icon: FaGlobe },
    { id: "notifications", label: isHindi ? "सूचनाएं" : "Notifications", icon: FaBell },
    { id: "branding", label: isHindi ? "ब्रांडिंग" : "Branding", icon: FaPalette },
    { id: "security", label: isHindi ? "सुरक्षा" : "Security", icon: FaShieldAlt },
  ];

  return (
    <div className="telecom-module-wrapper">
      {/* ── UNIFIED COMMAND CARD HEADER ── */}
      <Card className="adm-card mb-3">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-info bg-opacity-20 flex-shrink-0 adm-header-icon-box">
              <FaIdBadge size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">
                {isHindi ? "उपयोगकर्ता प्रोफ़ाइल और सेटिंग्स" : "User Profile & Account Settings"}
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                {user ? `${user.name} (${user.email}) · ${user.role}` : "Manage identity, verified credentials, and preferences"}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Superuser Switcher Return Button */}
            {isViewerSuper && effectiveUserId && (
              <Button
                color="warning"
                size="sm"
                className="fw-bold shadow-sm d-flex align-items-center gap-1.5"
                onClick={returnToMyProfile}
                title="Return to your own profile"
              >
                <FaUser size={11} />
                <span>My Profile</span>
              </Button>
            )}

            <Button
              size="sm"
              className="btn-outline-secondary d-flex align-items-center gap-1.5"
              onClick={load}
              disabled={loading}
              title="Refresh profile details"
            >
              <FaSyncAlt size={11} className={loading ? "fa-spin" : ""} />
              <span>{isHindi ? "रिफ्रेश" : "Refresh"}</span>
            </Button>

            {!isLockedForUser && (
              <Button
                size="sm"
                onClick={reset}
                disabled={saving || isReadOnly}
                className="btn-ghost-danger d-flex align-items-center gap-1.5"
              >
                <FaUndo size={11} />
                <span>{isHindi ? "रीसेट" : "Reset"}</span>
              </Button>
            )}

            <Button
              size="sm"
              className="btn-emerald d-flex align-items-center gap-1.5 px-3.5"
              onClick={() => save(!isViewerSuper)}
              disabled={saving || isLockedForUser}
            >
              {saving ? <Spinner size="sm" /> : <FaSave size={12} />}
              <span>{isLockedForUser ? "🔒 Profile Locked" : (!isViewerSuper ? (isHindi ? "सहेजें और लॉक करें" : "Save & Lock Profile") : (isHindi ? "सहेजें" : "Save Changes"))}</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── ADMIN / DEVOPS USER SWITCHER TOOLBAR ── */}
      {isViewerSuper && (
        <Card className="border-0 shadow-sm mb-3 bg-white border-start border-4 border-primary">
          <CardBody className="py-2.5 px-3">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={6}>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 fw-bold px-2 py-1">
                    ADMIN MODE
                  </span>
                  <span className="small text-muted">
                    Managing account: <strong className="text-dark">{user?.name}</strong> ({user?.role})
                  </span>
                  {user?.uRegistrationNo && (
                    <span className="badge bg-light text-secondary border font-monospace small">
                      {user.uRegistrationNo}
                    </span>
                  )}
                </div>
              </Col>

              <Col xs={12} md={6}>
                <div className="position-relative">
                  <InputGroup size="sm">
                    <InputGroupText className="bg-light border-end-0 text-muted">
                      <FaSearch size={11} />
                    </InputGroupText>
                    <Input
                      type="text"
                      placeholder="Search any user by name, email, or mobile..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      onFocus={() => setShowSearchDropdown(true)}
                      className="border-start-0 bg-light"
                    />
                    {userSearchQuery && (
                      <Button color="light" className="border" onClick={() => setUserSearchQuery("")}>
                        <FaTimes size={10} />
                      </Button>
                    )}
                  </InputGroup>

                  {/* Dropdown Menu Results */}
                  {showSearchDropdown && userSearchResults.length > 0 && (
                    <div
                      className="position-absolute start-0 end-0 mt-1 bg-white border rounded shadow-lg z-3 overflow-hidden"
                      style={{ maxHeight: 260, overflowY: "auto" }}
                    >
                      {userSearchResults.map((u) => (
                        <div
                          key={u._id}
                          className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between hover-bg-light cursor-pointer"
                          style={{ cursor: "pointer" }}
                          onClick={() => selectUserToManage(u)}
                        >
                          <div>
                            <div className="fw-bold small text-dark">{u.name}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>{u.email} · {u.mobile}</div>
                          </div>
                          <div className="d-flex align-items-center gap-1.5">
                            <span className="badge bg-secondary rounded-pill small">{u.role}</span>
                            {u.isProfileLocked && (
                              <span className="badge bg-danger rounded-pill small">🔒 Locked</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}

      {/* ── PROFILE LOCK STATUS BANNER ── */}
      {isProfileLocked ? (
        <Alert color="danger" className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2.5 px-3 mb-3 shadow-sm border-danger border-opacity-25">
          <div className="d-flex align-items-center gap-2.5">
            <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-2 d-flex align-items-center justify-content-center">
              <FaLock size={16} />
            </div>
            <div>
              <strong className="d-block text-danger">🔒 Verified Profile is Locked</strong>
              <span className="small text-muted">
                {isViewerSuper
                  ? `Locked on ${user?.profileLockedAt ? new Date(user.profileLockedAt).toLocaleString() : "record"}. Regular user self-editing is disabled.`
                  : "Your official profile details are locked and verified. Only an Administrator or DevOps can unlock it for modifications."}
              </span>
            </div>
          </div>

          {/* Admin Unlock Toggle Button */}
          {isViewerSuper && (
            <Button
              size="sm"
              className="btn-emerald d-flex align-items-center gap-1.5 shadow-sm"
              onClick={handleToggleLock}
              disabled={lockingLoading}
            >
              {lockingLoading ? <Spinner size="sm" /> : <FaUnlock size={12} />}
              <span>Unlock Profile for User</span>
            </Button>
          )}
        </Alert>
      ) : (
        <Alert color="success" className="d-flex align-items-center justify-content-between flex-wrap gap-2 py-2 px-3 mb-3 shadow-sm border-success border-opacity-25 bg-success bg-opacity-10">
          <div className="d-flex align-items-center gap-2">
            <FaCheckCircle className="text-success fs-5" />
            <div>
              <strong className="text-success small">🔓 Profile is Unlocked &amp; Editable</strong>
              <span className="small text-muted ms-1">
                {isViewerSuper
                  ? "User is currently permitted to make updates to their account and company profile."
                  : "You can update your personal, corporate, and billing details below. Once saved, your profile will be locked and can only be unlocked by an Admin."}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {!isViewerSuper && (
              <Button
                size="sm"
                className="btn-dark d-flex align-items-center gap-1.5 py-1.5 px-3"
                onClick={() => save(true)}
                disabled={saving}
                title="Save changes and lock profile"
              >
                <FaLock size={11} />
                <span>Submit &amp; Lock Profile</span>
              </Button>
            )}

            {isViewerSuper && (
              <Button
                size="sm"
                className="btn-dark d-flex align-items-center gap-1.5 py-1.5 px-3"
                onClick={handleToggleLock}
                disabled={lockingLoading}
              >
                {lockingLoading ? <Spinner size="sm" /> : <FaLock size={11} />}
                <span>Lock Profile</span>
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* ── MAIN TABBED CARD ── */}
      <Card className="shadow-sm border-0">
        <CardHeader className="adm-tab-card-header px-3 pt-2 pb-2">
          <Nav className="subtle-tab-nav">
            {tabs.map((t) => (
              <NavItem key={t.id}>
                <NavLink
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`d-flex align-items-center gap-2 ${tab === t.id ? "active" : ""}`}
                >
                  <t.icon size={13} />
                  <span>{t.label}</span>
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </CardHeader>

        <CardBody className="p-3 p-md-4">

          {/* ════════ TAB: USER PROFILE DETAILS ════════ */}
          {tab === "profile" && (
            <div className="d-flex flex-column gap-3">
              {/* HERO PROFILE CARD */}
              <div className="card border shadow-sm rounded-3 overflow-hidden position-relative bg-white mb-2">
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex align-items-center flex-column flex-sm-row gap-3 gap-md-4">
                    {/* AVATAR WITH ACTIVE GLOW */}
                    <div className="position-relative flex-shrink-0">
                      <img
                        src={
                          user?.profileImage
                            ? `${BASE_HOST}${user.profileImage}`
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.fullName || user?.name || "User")}&background=0F172A&color=fff&bold=true&size=160`
                        }
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.fullName || user?.name || "User")}&background=0F172A&color=fff&bold=true&size=160`;
                        }}
                        alt={profileForm.fullName || user?.name || "Profile"}
                        className="rounded-circle shadow-sm border border-3 border-white object-fit-cover"
                        width="92"
                        height="92"
                      />
                      <span
                        className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white p-1.5 ${user?.isActive ? "bg-success" : "bg-secondary"}`}
                        title={user?.isActive ? "Active Now" : "Inactive"}
                      />
                    </div>

                    {/* NAME & META INFO */}
                    <div className="flex-grow-1 text-center text-sm-start">
                      <div className="d-flex align-items-center justify-content-center justify-content-sm-start gap-2 flex-wrap mb-1">
                        <h4 className="fw-bold text-dark mb-0">
                          {profileForm.fullName || user?.name || user?.fullName || (isHindi ? "उपयोगकर्ता प्रोफ़ाइल" : "User Profile")}
                        </h4>
                        {user?.uRegistrationNo && (
                          <span className="badge-soft-info font-monospace fw-semibold py-1 px-2" style={{ fontSize: "11px" }}>
                            🆔 {user.uRegistrationNo}
                          </span>
                        )}
                      </div>

                      <p className="text-secondary fw-semibold mb-2 d-flex align-items-center justify-content-center justify-content-sm-start gap-1.5 small flex-wrap">
                        <span className="d-inline-flex align-items-center gap-1.5">
                          <FaBriefcase size={12} className="text-primary flex-shrink-0" />
                          <span>{profileForm.designation || user?.userDesignations || user?.designation || user?.role || "Account Member"}</span>
                        </span>
                        {(profileForm.companyName || user?.companyName) && (
                          <span className="text-muted ms-1">· 🏢 {profileForm.companyName || user?.companyName}</span>
                        )}
                      </p>

                      <div className="d-flex align-items-center justify-content-center justify-content-sm-start flex-wrap gap-2">
                        {/* ROLE PILL */}
                        <span className="badge-soft-neutral">
                          <FaShieldAlt size={11} />
                          <span>{user?.role || "CLIENT"}</span>
                        </span>

                        {/* ACTIVE STATUS PILL */}
                        <span className={user?.isActive ? "badge-soft-success" : "badge-soft-neutral"}>
                          <span
                            className={`rounded-circle d-inline-block ${user?.isActive ? "bg-success" : "bg-secondary"}`}
                            style={{ width: "7px", height: "7px" }}
                          />
                          <span>{user?.isActive ? (isHindi ? "सक्रिय" : "Active") : (isHindi ? "निष्क्रिय" : "Inactive")}</span>
                        </span>

                        {/* APPROVAL STATUS */}
                        {user?.status && (
                          <span className={user?.status === "APPROVED" ? "badge-soft-success" : user?.status === "REJECTED" ? "badge-soft-danger" : "badge-soft-neutral"}>
                            <FaCheckCircle size={10} />
                            <span>{user?.status}</span>
                          </span>
                        )}

                        {/* LOCK STATUS */}
                        <span className={isProfileLocked ? "badge-soft-danger" : "badge-soft-success"}>
                          {isProfileLocked ? <FaLock size={10} /> : <FaUnlock size={10} />}
                          <span>{isProfileLocked ? (isHindi ? "लॉक किया गया" : "Locked") : (isHindi ? "अनलॉक" : "Unlocked")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILS GRID */}
              <Row className="g-3">
                {/* 1. CONTACT & IDENTITY DETAILS */}
                <Col xs={12} lg={12}>
                  <Card className="border shadow-sm rounded-4 h-100 bg-white">
                    <CardBody className="p-3 p-md-4">
                      <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                        <div className="rounded-3 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary p-2">
                          <FaEnvelope size={14} />
                        </div>
                        <h6 className="fw-bold text-dark mb-0 fs-6">
                          {isHindi ? "व्यक्तिगत एवं संपर्क विवरण" : "Identity & Contact Details"}
                        </h6>
                      </div>

                      <Row className="g-3">
                        <Col xs={12}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">
                              Full Name / Display Name <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="text"
                              value={profileForm.fullName}
                              disabled={isReadOnly}
                              invalid={!!errors.fullName}
                              onChange={(e) => setProfileField("fullName", e.target.value)}
                              placeholder="Full Name"
                              className="shadow-sm"
                            />
                            {errors.fullName && <div className="invalid-feedback d-block">{errors.fullName}</div>}
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Email Address (Login ID)</Label>
                            <Input
                              type="email"
                              value={user?.email || ""}
                              disabled={true}
                              title="Email address is permanent and cannot be modified"
                              className="bg-light shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">
                              Mobile Number <span className="text-danger">*</span>
                            </Label>
                            <Input
                              type="tel"
                              value={profileForm.mobile}
                              disabled={isReadOnly}
                              invalid={!!errors.mobile}
                              maxLength={10}
                              onChange={(e) => setProfileField("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                              placeholder="10-digit mobile number"
                              className="shadow-sm"
                            />
                            {errors.mobile && <div className="invalid-feedback d-block">{errors.mobile}</div>}
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Corporate Designation</Label>
                            <Input
                              type="text"
                              value={profileForm.designation}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("designation", e.target.value)}
                              placeholder="e.g. Director, Operations Lead"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={6}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Account Tag / Sub-Designation</Label>
                            <Input
                              type="text"
                              value={profileForm.userDesignations}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("userDesignations", e.target.value)}
                              placeholder="e.g. Account User"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                {/* 3. BUSINESS / BILLING / KYC PROFILE */}
                <Col xs={12}>
                  <Card className="border shadow-sm rounded-4 bg-white">
                    <CardBody className="p-3 p-md-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-3 d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success p-2">
                            <FaBuilding size={14} />
                          </div>
                          <h6 className="fw-bold text-dark mb-0 fs-6">
                            {isHindi ? "कंपनी व कॉर्पोरेट बिलिंग विवरण" : "Corporate KYC & Billing Details"}
                          </h6>
                        </div>
                        {isProfileLocked && (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 fw-bold px-2.5 py-1">
                            🔒 KYC Details Locked &amp; Verified
                          </span>
                        )}
                      </div>

                      <Row className="g-3">
                        <Col md={4}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Company / Organization Legal Name</Label>
                            <Input
                              type="text"
                              value={profileForm.companyName}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("companyName", e.target.value)}
                              placeholder="e.g. Acme Telecom Solutions Pvt Ltd"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={4}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Official Website</Label>
                            <Input
                              type="url"
                              value={profileForm.website}
                              disabled={isReadOnly}
                              invalid={!!errors.website}
                              onChange={(e) => setProfileField("website", e.target.value)}
                              placeholder="https://www.company.com"
                              className="shadow-sm"
                            />
                            {errors.website && <div className="invalid-feedback d-block">{errors.website}</div>}
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">GSTIN Number</Label>
                            <Input
                              type="text"
                              value={profileForm.gstin}
                              disabled={isReadOnly}
                              invalid={!!errors.gstin}
                              maxLength={15}
                              onChange={(e) => setProfileField("gstin", e.target.value.toUpperCase().slice(0, 15))}
                              placeholder="22AAAAA0000A1Z5"
                              className="shadow-sm font-monospace text-uppercase"
                            />
                            {errors.gstin && <div className="invalid-feedback d-block">{errors.gstin}</div>}
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">PAN Number</Label>
                            <Input
                              type="text"
                              value={profileForm.pan}
                              disabled={isReadOnly}
                              invalid={!!errors.pan}
                              maxLength={10}
                              onChange={(e) => setProfileField("pan", e.target.value.toUpperCase().slice(0, 10))}
                              placeholder="ABCDE1234F"
                              className="shadow-sm font-monospace text-uppercase"
                            />
                            {errors.pan && <div className="invalid-feedback d-block">{errors.pan}</div>}
                          </FormGroup>
                        </Col>

                        <Col md={4}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Billing Address</Label>
                            <Input
                              type="text"
                              value={profileForm.address}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("address", e.target.value)}
                              placeholder="Street address, office suite..."
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">City</Label>
                            <Input
                              type="text"
                              value={profileForm.city}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("city", e.target.value)}
                              placeholder="City"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">State</Label>
                            <Input
                              type="text"
                              value={profileForm.state}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("state", e.target.value)}
                              placeholder="State"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">Country</Label>
                            <Input
                              type="text"
                              value={profileForm.country}
                              disabled={isReadOnly}
                              onChange={(e) => setProfileField("country", e.target.value)}
                              placeholder="Country"
                              className="shadow-sm"
                            />
                          </FormGroup>
                        </Col>

                        <Col md={2}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">PIN Code</Label>
                            <Input
                              type="text"
                              value={profileForm.pincode}
                              disabled={isReadOnly}
                              invalid={!!errors.pincode}
                              maxLength={6}
                              onChange={(e) => setProfileField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                              placeholder="PIN Code"
                              className="shadow-sm font-monospace"
                            />
                            {errors.pincode && <div className="invalid-feedback d-block">{errors.pincode}</div>}
                          </FormGroup>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>

                {/* 3. SYSTEM & ACCESS SPECIFICATIONS (READ-ONLY FROM USERS TABLE) */}
                <Col xs={12}>
                  <Card className="border shadow-sm rounded-4 bg-white">
                    <CardBody className="p-3 p-md-4">
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-3 d-flex align-items-center justify-content-center bg-info bg-opacity-10 text-info p-2">
                            <FaShieldAlt size={14} />
                          </div>
                          <h6 className="fw-bold text-dark mb-0 fs-6">
                            {isHindi ? "सिस्टम खाता एवं अनुमतियां (केवल दृश्य)" : "System Account & Access Specifications (Read-Only)"}
                          </h6>
                        </div>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2.5 py-1">
                          🔒 System Controlled &amp; Non-Editable
                        </span>
                      </div>

                      <Row className="g-3">
                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Registration No</div>
                            <div className="fw-bold font-monospace text-primary">{user?.uRegistrationNo || "—"}</div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Login Email</div>
                            <div className="fw-semibold text-dark text-truncate" title={user?.email}>{user?.email || "—"}</div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Account Role</div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-1.5">
                              <Badge color="primary" className="fw-semibold">{user?.role || "CLIENT"}</Badge>
                            </div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">KYC Status</div>
                            <div>
                              <Badge color={user?.status === "APPROVED" ? "success" : user?.status === "REJECTED" ? "danger" : "warning"} className="fw-semibold">
                                {user?.status || "APPROVED"}
                              </Badge>
                            </div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Account State</div>
                            <div className="fw-semibold d-flex align-items-center gap-1.5">
                              <span className={`rounded-circle d-inline-block ${user?.isActive ? "bg-success" : "bg-danger"}`} style={{ width: 8, height: 8 }} />
                              <span className={user?.isActive ? "text-success fw-bold" : "text-danger fw-bold"}>
                                {user?.isActive ? "Active Account" : "Inactive / Suspended"}
                              </span>
                            </div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Profile Lock State</div>
                            <div>
                              <Badge color={isProfileLocked ? "danger" : "success"} className="fw-semibold">
                                {isProfileLocked ? "🔒 Locked & Verified" : "🔓 Unlocked & Editable"}
                              </Badge>
                            </div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Member Since</div>
                            <div className="text-dark small fw-semibold">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                            </div>
                          </div>
                        </Col>

                        <Col md={3} sm={6}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold">Last Login</div>
                            <div className="text-dark small fw-semibold">
                              {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Active Session"}
                            </div>
                          </div>
                        </Col>

                        <Col xs={12}>
                          <div className="p-2.5 rounded-3 bg-light border">
                            <div className="text-muted small fw-semibold mb-1.5">Assigned Permissions &amp; Feature Capabilities</div>
                            <div className="d-flex flex-wrap gap-1.5">
                              {Array.isArray(user?.permissions) && user.permissions.length > 0 ? (
                                user.permissions.map((perm) => (
                                  <Badge key={perm} color="info" className="bg-opacity-10 text-info border border-info border-opacity-25 fw-normal">
                                    ✓ {perm}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted small">Standard Account Permissions</span>
                              )}
                              {Array.isArray(user?.controls) && user.controls.length > 0 && (
                                user.controls.map((ctrl) => (
                                  <Badge key={ctrl} color="secondary" className="bg-opacity-10 text-secondary border fw-normal">
                                    ⚙ {ctrl}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {/* ════════ TAB: GENERAL PREFERENCES ════════ */}
          {tab === "general" && (
            <Row className="g-3">
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Language</Label>
                  <Input
                    type="select"
                    value={form.locale}
                    disabled={isReadOnly}
                    onChange={(e) => setTop("locale", e.target.value)}
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Timezone</Label>
                  <Input
                    type="select"
                    value={form.timezone}
                    disabled={isReadOnly}
                    onChange={(e) => setTop("timezone", e.target.value)}
                  >
                    {(timezones.length ? timezones : ["Asia/Kolkata"]).map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Date Format</Label>
                  <Input
                    type="select"
                    value={form.dateFormat}
                    disabled={isReadOnly}
                    onChange={(e) => setTop("dateFormat", e.target.value)}
                  >
                    {DATE_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Default Schedule Timezone</Label>
                  <Input
                    type="select"
                    value={form.defaultScheduleTimezone}
                    disabled={isReadOnly}
                    onChange={(e) => setTop("defaultScheduleTimezone", e.target.value)}
                  >
                    {(timezones.length ? timezones : [form.defaultScheduleTimezone]).map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Default Campaign Batch Size</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g. 500"
                    value={form.defaultBatchSize}
                    disabled={isReadOnly}
                    onChange={(e) => setTop("defaultBatchSize", Number(e.target.value))}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          {/* ════════ TAB: NOTIFICATIONS ════════ */}
          {tab === "notifications" && (
            <Row className="g-3">
              {NOTIFICATION_FIELDS.map(([key, label]) => (
                <Col md={6} key={key}>
                  <FormGroup check>
                    <Input
                      type="checkbox"
                      id={`n-${key}`}
                      disabled={isReadOnly}
                      checked={!!form.notifications?.[key]}
                      onChange={(e) => setGroup("notifications", key, e.target.checked)}
                    />
                    <Label className="small mb-0" for={`n-${key}`} check>{label}</Label>
                  </FormGroup>
                </Col>
              ))}

              <Col xs={12}>
                <hr className="my-2" />
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="res-quiet"
                    disabled={isReadOnly}
                    checked={!!form.respectQuietHours}
                    onChange={(e) => setTop("respectQuietHours", e.target.checked)}
                  />
                  <Label className="small mb-0" for="res-quiet" check>
                    Respect quiet hours (pause sends outside this window)
                  </Label>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Quiet hours start</Label>
                  <Input
                    type="time"
                    value={form.quietHoursStart}
                    disabled={isReadOnly || !form.respectQuietHours}
                    onChange={(e) => setTop("quietHoursStart", e.target.value)}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Quiet hours end</Label>
                  <Input
                    type="time"
                    value={form.quietHoursEnd}
                    disabled={isReadOnly || !form.respectQuietHours}
                    onChange={(e) => setTop("quietHoursEnd", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          {/* ════════ TAB: BRANDING ════════ */}
          {tab === "branding" && (
            <Row className="g-3">
              {BRANDING_FIELDS.map(([key, label, type, placeholder]) => (
                <Col md={6} key={key}>
                  <FormGroup>
                    <Label className="small fw-semibold">{label}</Label>
                    <Input
                      type={type}
                      value={form.branding?.[key] ?? ""}
                      disabled={isReadOnly}
                      placeholder={placeholder}
                      onChange={(e) => setGroup("branding", key, e.target.value)}
                    />
                  </FormGroup>
                </Col>
              ))}

              {form.branding?.primaryColor && (
                <Col xs={12}>
                  <Badge color="light" className="border">
                    Preview
                    <span
                      className="ms-2 d-inline-block rounded"
                      style={{ width: 60, height: 16, background: form.branding.primaryColor }}
                    />
                  </Badge>
                </Col>
              )}

              {form.branding?.domainName && (
                <Col xs={12}>
                  <Alert color="info" className="small py-2 px-3 mb-0 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div>
                      <strong>Custom Domain Setup:</strong> Point your CNAME record for <code>{form.branding.domainName}</code> to <code>cname.beyondsend.com</code>.
                    </div>
                    <Badge color={form.branding?.domainVerified ? "success" : "warning"} className="px-2 py-1">
                      {form.branding?.domainVerified ? "✓ Domain Verified" : "⏳ Pending DNS Verification"}
                    </Badge>
                  </Alert>
                </Col>
              )}
            </Row>
          )}

          {/* ════════ TAB: SECURITY ════════ */}
          {tab === "security" && (
            <Row className="g-3">
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Maximum concurrent sessions (1-50)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g. 5"
                    value={form.maxConcurrentSessions}
                    disabled={isReadOnly}
                    invalid={!!errors.maxConcurrentSessions}
                    onChange={(e) => setTop("maxConcurrentSessions", e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  {errors.maxConcurrentSessions && (
                    <div className="invalid-feedback d-block">{errors.maxConcurrentSessions}</div>
                  )}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Session timeout (5 - 1440 minutes)</Label>
                  <Input
                    type="number"
                    min="5"
                    max="1440"
                    placeholder="e.g. 60"
                    value={form.sessionTimeoutMinutes}
                    disabled={isReadOnly}
                    invalid={!!errors.sessionTimeoutMinutes}
                    onChange={(e) => setTop("sessionTimeoutMinutes", e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  {errors.sessionTimeoutMinutes && (
                    <div className="invalid-feedback d-block">{errors.sessionTimeoutMinutes}</div>
                  )}
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup check>
                  <Input
                    type="switch"
                    id="s-2fa"
                    disabled={isReadOnly}
                    checked={!!form.twoFactorEnabled}
                    onChange={(e) => setTop("twoFactorEnabled", e.target.checked)}
                  />
                  <Label className="small mb-0" for="s-2fa" check>
                    Two-factor authentication
                  </Label>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup check>
                  <Input
                    type="checkbox"
                    id="s-alerts"
                    disabled={isReadOnly}
                    checked={!!form.loginAlerts}
                    onChange={(e) => setTop("loginAlerts", e.target.checked)}
                  />
                  <Label className="small mb-0" for="s-alerts" check>
                    Email me on new sign-in
                  </Label>
                </FormGroup>
              </Col>

              <Col xs={12}>
                <Alert color="light" className="small mb-0">
                  Sessions and activity logs are managed under{" "}
                  <strong>System &amp; Security → User Sessions</strong> by an administrator.
                </Alert>
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default UserSettings;
