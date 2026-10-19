import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, CardBody, CardHeader, CardFooter, Button, Form, FormGroup,
  Label, Input, Row, Col, Spinner, Alert, Badge,
  Nav, NavItem, NavLink, TabContent, TabPane,
  InputGroup, InputGroupText, Table, Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import {
  FaArrowLeft, FaSave, FaEye, FaEyeSlash, FaCheck, FaCogs,
  FaServer, FaComments, FaPhoneAlt, FaEnvelope, FaKey,
  FaShieldAlt, FaSearch, FaUserFriends, FaCopy, FaExchangeAlt,
  FaFilter, FaTimes, FaUndo, FaBroadcastTower, FaUserTag,
  FaExternalLinkAlt, FaCheckCircle, FaSlidersH, FaSignInAlt,
  FaTelegramPlane, FaRobot, FaPaperPlane, FaPlug, FaStar, FaGlobe
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal, Swal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";
import { encryptUserId, decryptUserId } from "@/utilities/secureId";

const AVAILABLE_CHANNELS = [
  { key: "email", label: "Email", icon: <FaEnvelope />, color: "#228be6", desc: "Transactional & SMTP Relay" },
  { key: "sms", label: "SMS", icon: <FaPhoneAlt />, color: "#0ca678", desc: "DLT OTP, Promo & Transactional" },
  { key: "whatsapp", label: "WhatsApp", icon: <FaComments />, color: "#25D366", desc: "Meta Graph API & WBS" },
  { key: "rcs", label: "RCS", icon: <FaBroadcastTower />, color: "#7950f2", desc: "Google RBM & Verified Rich Cards" },
  { key: "voice", label: "Voice", icon: <FaPhoneAlt />, color: "#fd7e14", desc: "OBD IVR & Click2Call Pulse" },
  { key: "telegram", label: "Telegram", icon: <FaTelegramPlane />, color: "#0088cc", desc: "BotFather Token & Webhooks" },
  { key: "push", label: "Push", icon: <FaBroadcastTower />, color: "#e64980", desc: "Firebase Cloud Messaging & WebPush" },
];

const initialConfigState = {
  // Dynamic CPaaS Routing & Aggregator Failover
  smsPrimaryVendor: "mobiglitz",
  smsSecondaryVendor: "airtel",
  smsBackupVendor: "",
  smsDefaultRouting: "primary_failover",

  whatsappPrimaryVendor: "meta",
  whatsappSecondaryVendor: "wbs",
  whatsappBackupVendor: "",
  whatsappDefaultRouting: "primary_failover",

  rcsPrimaryVendor: "routemobile",
  rcsSecondaryVendor: "jio",
  rcsBackupVendor: "",
  rcsDefaultRouting: "primary_failover",

  voicePrimaryVendor: "mobiglitz",
  voiceSecondaryVendor: "buzzdial",
  voiceBackupVendor: "",
  voiceDefaultRouting: "primary_failover",

  emailPrimaryVendor: "smtp",
  emailSecondaryVendor: "ses",
  emailBackupVendor: "",
  emailDefaultRouting: "primary_failover",

  // RCS
  rcsVendor: "",
  rcsVendorCompany: "",
  rcsUserId: "",
  rcsPassword: "",
  rcsApiToken: "",
  jioRcsAgentId: "",
  jioRcsApiKey: "",

  // WhatsApp
  whatsappVendor: "",
  wbsUserId: "",
  wbsPassword: "",
  wbsJwtAuth: "",
  routemobileUsername: "",
  routemobilePassword: "",
  routemobileJwtAuth: "",
  whatsappBrandMsisdn: "",
  phoneNumberId: "",
  wabaId: "",
  metaToken: "",

  // SMS
  smsVendor: "",
  mobiglitzSmsUsername: "",
  mobiglitzSmsPassword: "",
  mglitzSmsTransactionalRouteKey: "",
  mglitzSmsPromotionalRouteKey: "",
  mglitzSmsOtpRouteKey: "",
  mglitzSmsImplicitRouteKey: "",
  mglitzSmsExplicitRouteKey: "",
  smsDltEntityId: "",
  airtelSmsCustomerId: "",
  airtelSmsCookie: "",
  airtelSmsAuthCode: "",

  // Voice
  mglitzVoiceApiUsername: "",
  mglitzVoiceApiPassword: "",
  buzzdialCallApiKey: "",

  // SMTP Email
  emailSmtpEndpoint: "",
  emailSmtpPort: "",
  emailSmtpUsername: "",
  emailSmtpPassword: "",

  // Telegram
  telegramBotToken: "",
  telegramBotName: "",
  telegramUsername: "",
  telegramBotId: "",
  telegramGatewayToken: "",
  telegramGatewaySenderUsername: "",
  telegramGatewayCallbackUrl: "",
};

const DEFAULT_PROVIDERS_BY_CHANNEL = {
  SMS: [
    { code: "mobiglitz", name: "Mobiglitz DLT Gateway" },
    { code: "airtel", name: "Airtel IQ Gateway" },
    { code: "jio", name: "Jio Enterprise SMS" },
    { code: "routemobile", name: "RouteMobile DLT" },
    { code: "infobip", name: "Infobip CPaaS" },
    { code: "other", name: "Other Telco API" },
  ],
  WHATSAPP: [
    { code: "meta", name: "Meta Cloud Graph API (v19.0+)" },
    { code: "wbs", name: "WhatsApp Business Solution (WBS)" },
    { code: "routemobile", name: "RouteMobile WBS" },
    { code: "wati", name: "WATI Gateway" },
    { code: "interakt", name: "Interakt Business API" },
    { code: "gupshup", name: "Gupshup WhatsApp" },
  ],
  RCS: [
    { code: "routemobile", name: "RouteMobile Google RBM" },
    { code: "jio", name: "Jio RCS Business Messaging" },
    { code: "google_rbm", name: "Google Direct RBM" },
    { code: "dotgo", name: "Dotgo / Sinch RCS" },
    { code: "other", name: "Other Aggregator" },
  ],
  VOICE: [
    { code: "mobiglitz", name: "Mobiglitz OBD IVR" },
    { code: "buzzdial", name: "Buzzdial Click2Call" },
    { code: "routemobile", name: "RouteMobile Voice" },
    { code: "other", name: "Other SIP Gateway" },
  ],
  EMAIL: [
    { code: "smtp", name: "Direct SMTP Relay" },
    { code: "ses", name: "Amazon SES" },
    { code: "sendgrid", name: "SendGrid API" },
    { code: "mailgun", name: "Mailgun API" },
  ],
  TELEGRAM: [
    { code: "telegram_gateway", name: "Official Telegram Gateway API (gateway.telegram.org)" },
    { code: "telegram_bot", name: "Official Telegram Bot API (@BotFather)" },
  ],
};

const UserCommunicationConfig = ({ userId: propUserId = null }) => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { toasts, toast } = useToast();

  // Decrypt URL parameter if provided
  const effectiveUserId = useMemo(() => {
    const raw = propUserId || routeUserId || "";
    if (!raw) return "";
    const dec = decryptUserId(raw);
    return dec || raw;
  }, [propUserId, routeUserId]);

  const [activeTab, setActiveTab] = useState("channels");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [enabledChannels, setEnabledChannels] = useState([]);
  const [providersByChannel, setProvidersByChannel] = useState(DEFAULT_PROVIDERS_BY_CHANNEL);
  const [formData, setFormData] = useState(initialConfigState);
  const [showSecrets, setShowSecrets] = useState({});
  const [secretsSet, setSecretsSet] = useState({});
  const [syncingProvider, setSyncingProvider] = useState(false);

  // Telegram state
  const [tgSubTab, setTgSubTab] = useState("gateway"); // 'gateway' | 'bot'
  const [tgValidating, setTgValidating] = useState(false);
  const [tgBotDetails, setTgBotDetails] = useState(null);
  const [tgTestChatId, setTgTestChatId] = useState("");
  const [tgTesting, setTgTesting] = useState(false);

  // Telegram Gateway API testing state
  const [tgGwPhone, setTgGwPhone] = useState("");
  const [tgGwOtpCode, setTgGwOtpCode] = useState("");
  const [tgGwCheckingAbility, setTgGwCheckingAbility] = useState(false);
  const [tgGwAbilityInfo, setTgGwAbilityInfo] = useState(null);
  const [tgGwSendingVerification, setTgGwSendingVerification] = useState(false);
  const [tgGwVerificationInfo, setTgGwVerificationInfo] = useState(null);
  const [tgGwRequestId, setTgGwRequestId] = useState("");
  const [tgGwVerifyCode, setTgGwVerifyCode] = useState("");
  const [tgGwCheckingStatus, setTgGwCheckingStatus] = useState(false);
  const [tgGwStatusInfo, setTgGwStatusInfo] = useState(null);
  const [tgGwRevoking, setTgGwRevoking] = useState(false);

  // Telegram Live Wallet Balances
  const [tgWallet, setTgWallet] = useState(null);
  const [tgWalletLoading, setTgWalletLoading] = useState(false);

  // Multi-WhatsApp Numbers (Meta Cloud API & WABA per wa req.pdf)
  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [editingNumberIdx, setEditingNumberIdx] = useState(null);
  const [numberFormData, setNumberFormData] = useState({
    phoneNumber: "",
    displayName: "",
    phoneNumberId: "",
    wabaId: "",
    metaToken: "",
    qualityRating: "GREEN",
    messagingLimitTier: "TIER_1K",
    status: "CONNECTED",
    isDefault: false,
  });

  // Directory State (Clients & Resellers list)
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [switchModal, setSwitchModal] = useState(false);
  const [switchSearch, setSwitchSearch] = useState("");

  // Live Provider Details Modal & Connect State
  const [rawConfig, setRawConfig] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeDetailsProvider, setActiveDetailsProvider] = useState(null);
  const [connectingProvider, setConnectingProvider] = useState(false);

  const toggleSecret = (fieldKey) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  const copyToClipboard = (text, label = "Value") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Load Directory of Accounts using standard /users/list API
  const loadDirectory = useCallback(async () => {
    setDirectoryLoading(true);
    try {
      const res = await apiClient.get("/users/list");
      const resData = res?.data || res;
      let rawList = [];
      if (Array.isArray(resData?.users)) {
        rawList = resData.users;
      } else if (Array.isArray(resData?.data)) {
        rawList = resData.data;
      } else if (Array.isArray(resData)) {
        rawList = resData;
      }

      // Flatten hierarchy tree so all accounts are present in directory
      const flatten = (items) => {
        let result = [];
        items.forEach((item) => {
          result.push(item);
          if (Array.isArray(item.children) && item.children.length > 0) {
            result = result.concat(flatten(item.children));
          }
        });
        return result;
      };

      const flatUsers = flatten(rawList);
      // Ensure name and fullName are always non-empty
      const normalized = flatUsers.map((u) => ({
        ...u,
        name: u.name || u.fullName || u.email?.split("@")[0] || "User",
        fullName: u.fullName || u.name || u.email?.split("@")[0] || "User",
        enabledChannels: Array.isArray(u.enabledChannels) ? u.enabledChannels : [],
      }));

      setUsersList(normalized);
    } catch (err) {
      console.error("Failed to load users directory", err);
      setUsersList([]);
    } finally {
      setDirectoryLoading(false);
    }
  }, []);

  // Load Configuration for selected target user
  const loadConfig = useCallback(async () => {
    if (!effectiveUserId && routeUserId) return;
    setLoading(true);
    try {
      const endpoint = effectiveUserId ? `/user-config/${effectiveUserId}` : "/user-config";
      const res = await apiClient.get(endpoint);
      const resData = (res && res.data && (res.data.user || res.data.config)) ? res.data : (res?.data?.data || res?.data || res || {});

      setRawConfig(resData.config || resData);

      if (resData.user) {
        setTargetUser(resData.user);
      }
      if (Array.isArray(resData.enabledChannels)) {
        setEnabledChannels(resData.enabledChannels);
      } else if (resData.config?.enabledChannels && typeof resData.config.enabledChannels === "object") {
        const obj = resData.config.enabledChannels;
        const keys = Object.keys(obj).filter((k) => obj[k]);
        setEnabledChannels(keys);
      }
      if (resData.providersByChannel) {
        setProvidersByChannel((prev) => ({
          ...prev,
          ...resData.providersByChannel,
        }));
      }

      const cfg = resData.config || {};
      if (Array.isArray(cfg.whatsappNumbers)) {
        setWhatsappNumbers(cfg.whatsappNumbers);
      }
      if (cfg.__secretsSet) {
        setSecretsSet(cfg.__secretsSet);
      }
      setFormData((prev) => {
        const next = { ...prev };
        Object.keys(initialConfigState).forEach((key) => {
          if (cfg[key] !== undefined && cfg[key] !== null) {
            next[key] = cfg[key];
          }
        });
        return next;
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load communication config");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, routeUserId, toast]);

  // Load config on mount or whenever effectiveUserId/routeUserId changes
  useEffect(() => {
    if (effectiveUserId || routeUserId) {
      loadConfig();
    }
  }, [effectiveUserId, routeUserId, loadConfig]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  const loadTelegramWallet = useCallback(async () => {
    const uid = targetUser?._id || effectiveUserId;
    if (!uid) return;
    try {
      setTgWalletLoading(true);
      const res = await apiClient.get(`/credits/summary?userId=${uid}`);
      const wb =
        res?.data?.balances?.telegramCredits ||
        res?.data?.myWallet?.telegramCredits ||
        res?.balances?.telegramCredits ||
        res?.myWallet?.telegramCredits;
      if (wb) setTgWallet(wb);
    } catch {
      // non-critical
    } finally {
      setTgWalletLoading(false);
    }
  }, [targetUser, effectiveUserId]);

  useEffect(() => {
    if (activeTab === "telegram" && (targetUser?._id || effectiveUserId)) {
      loadTelegramWallet();
    }
  }, [activeTab, targetUser, effectiveUserId, loadTelegramWallet]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChannelToggle = (channelKey) => {
    setEnabledChannels((prev) => {
      if (prev.includes(channelKey)) {
        return prev.filter((c) => c !== channelKey);
      } else {
        return [...prev, channelKey];
      }
    });
  };

  const handleOpenNumberModal = (idx = null) => {
    if (idx !== null && whatsappNumbers[idx]) {
      setEditingNumberIdx(idx);
      setNumberFormData({ ...whatsappNumbers[idx] });
    } else {
      setEditingNumberIdx(null);
      setNumberFormData({
        phoneNumber: "",
        displayName: "",
        phoneNumberId: "",
        wabaId: "",
        metaToken: "",
        qualityRating: "GREEN",
        messagingLimitTier: "TIER_1K",
        status: "CONNECTED",
        isDefault: whatsappNumbers.length === 0,
      });
    }
    setNumberModalOpen(true);
  };

  const handleSaveNumber = () => {
    if (!numberFormData.phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!numberFormData.phoneNumberId.trim()) {
      toast.error("Meta Phone Number ID is required");
      return;
    }

    setWhatsappNumbers((prev) => {
      let updated;
      if (editingNumberIdx !== null) {
        updated = prev.map((item, i) => (i === editingNumberIdx ? { ...numberFormData } : item));
      } else {
        updated = [...prev, { ...numberFormData, numberId: Date.now().toString() }];
      }

      if (numberFormData.isDefault) {
        const targetId = editingNumberIdx !== null ? updated[editingNumberIdx]?.numberId : updated[updated.length - 1]?.numberId;
        updated = updated.map((num) => ({
          ...num,
          isDefault: num.numberId === targetId || (!num.numberId && num.phoneNumber === numberFormData.phoneNumber),
        }));
      }
      return updated;
    });

    setNumberModalOpen(false);
    toast.success(editingNumberIdx !== null ? "WhatsApp number updated" : "WhatsApp number added");
  };

  const handleDeleteNumber = async (idx) => {
    const isConfirmed = await wpSwal.confirm("Remove WhatsApp Number?", "Remove this connected WhatsApp number?");
    if (!isConfirmed) return;
    setWhatsappNumbers((prev) => prev.filter((_, i) => i !== idx));
    toast.info("WhatsApp number removed");
  };

  const handleSetDefaultNumber = (idx) => {
    setWhatsappNumbers((prev) =>
      prev.map((num, i) => ({
        ...num,
        isDefault: i === idx,
      }))
    );
    toast.success("Default sender updated");
  };

  const handleSyncProviderTemplates = async () => {
    setSyncingProvider(true);
    try {
      const res = await apiClient.post("/templates/whatsapp/sync-provider", {
        userId: effectiveUserId || targetUser?._id,
        username: formData.wbsUserId || formData.routemobileUsername || "digiglitzwbs",
        password: formData.wbsPassword || formData.routemobilePassword,
        provider: formData.whatsappPrimaryVendor || "routemobile",
      });
      toast.success(res?.data?.message || "WhatsApp templates synced from provider successfully!");
      loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to sync provider templates");
    } finally {
      setSyncingProvider(false);
    }
  };

  const handleConnectProvider = async (channel, provider, customCreds = {}) => {
    setConnectingProvider(true);
    try {
      const uid = targetUser?._id || effectiveUserId;
      const res = await apiClient.post("/user-config/connect-provider", {
        userId: uid,
        channel,
        provider,
        credentials: {
          username: formData.routemobileUsername || formData.wbsUserId || "digiglitzwbs",
          password: formData.routemobilePassword || formData.wbsPassword || "new@25rmlSs",
          ...customCreds,
        },
        settings: {
          brandMsisdn: formData.whatsappBrandMsisdn || "9977679866",
          wabaId: formData.wabaId || "892158596877894",
        },
      });

      toast.success(res?.data?.message || res?.message || `${provider} connected and verified successfully!`);
      await loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to connect ${provider}`);
    } finally {
      setConnectingProvider(false);
    }
  };

  const handleSetPrimary = async (channel, provider) => {
    try {
      const uid = targetUser?._id || effectiveUserId;
      const res = await apiClient.post("/user-config/set-primary-provider", {
        userId: uid,
        channel,
        provider,
      });

      toast.success(res?.data?.message || res?.message || `Primary provider set to ${provider}`);
      handleInputChange(`${channel}PrimaryVendor`, provider);
      await loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || `Failed to set primary provider`);
    }
  };

  const handleOpenProviderDetails = (channel, provider) => {
    const channelCfg = rawConfig?.[`${channel}Config`];
    let provCfg = null;
    if (channelCfg) {
      if (channelCfg[provider]) {
        provCfg = channelCfg[provider]?.configurations?.[0] || channelCfg[provider];
      }
    }
    setActiveDetailsProvider({
      channel,
      provider,
      config: provCfg,
      userData: provCfg?.settings?.userData || rawConfig?.routemobileUserData || null,
      senderInfo: provCfg?.senderInfo || [],
      routing: rawConfig?.routingConfig?.[channel] || {},
      baseUrl: provCfg?.credentials?.baseUrl || "https://apis.rmlconnect.net",
    });
    setDetailsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId: effectiveUserId || undefined,
        enabledChannels,
        ...formData,
        whatsappNumbers,
      };

      const endpoint = effectiveUserId ? `/user-config/${effectiveUserId}` : "/user-config";
      const res = await apiClient.put(endpoint, payload);

      toast.success(res?.data?.message || res?.message || "Communication configuration saved successfully!");
      const resPayload = (res && res.data && (res.data.config || res.data.user)) ? res.data : (res?.data || res);
      const updatedCfg = resPayload?.config || resPayload?.data?.config;
      if (updatedCfg) {
        setFormData((prev) => ({
          ...prev,
          ...updatedCfg,
        }));
        if (Array.isArray(updatedCfg.whatsappNumbers)) {
          setWhatsappNumbers(updatedCfg.whatsappNumbers);
        }
        if (updatedCfg.__secretsSet) {
          setSecretsSet(updatedCfg.__secretsSet);
        }
      }
      const updatedChannels = resPayload?.enabledChannels || resPayload?.data?.enabledChannels;
      if (Array.isArray(updatedChannels)) {
        setEnabledChannels(updatedChannels);
      }
      // Refresh directory in background
      loadDirectory();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const isConfirmed = await wpSwal.confirm(
      "Reset Communication Settings?",
      "Are you sure you want to reset all communication settings for this account to system defaults?"
    );
    if (!isConfirmed) return;
    setResetting(true);
    try {
      const endpoint = "/user-config/reset";
      const payload = { userId: effectiveUserId || undefined };
      const res = await apiClient.post(endpoint, payload);
      toast.success(res?.data?.message || "Configuration reset to defaults successfully!");
      setEnabledChannels([]);
      setFormData(initialConfigState);
      loadConfig();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to reset configuration");
    } finally {
      setResetting(false);
    }
  };

  const handleSelectUser = (user) => {
    const encId = encryptUserId(user._id);
    navigate(`/authorized/config/communication/${encId}`);
    setSwitchModal(false);
  };

  // Filtered Users List for Directory
  const filteredUsers = useMemo(() => {
    let list = usersList.filter((u) => u.role === "ADMIN" || u.role === "CLIENT" || u.role === "RESELLER");
    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (channelFilter !== "ALL") {
      list = list.filter((u) => (u.enabledChannels || []).includes(channelFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.mobile && u.mobile.includes(q))
      );
    }
    return list;
  }, [usersList, roleFilter, channelFilter, searchQuery]);

  // Quick switch filtered users
  const quickSwitchFiltered = useMemo(() => {
    const base = usersList.filter((u) => u.role === "ADMIN" || u.role === "CLIENT" || u.role === "RESELLER");
    if (!switchSearch.trim()) return base;
    const q = switchSearch.toLowerCase().trim();
    return base.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }, [usersList, switchSearch]);

  const encryptedCurrentId = useMemo(() => {
    return targetUser?._id ? encryptUserId(targetUser._id) : (routeUserId || "");
  }, [targetUser, routeUserId]);

  // Direct login / impersonation for Admin and DevOps
  const handleDirectLogin = async (specificUser = null) => {
    const target = specificUser || targetUser || usersList.find((u) => String(u._id) === String(effectiveUserId || targetUser?._id));
    if (!target || !target._id) {
      toast.error("User details not available for direct login");
      return;
    }
    const targetName = target.fullName || target.name || target.email || "User";
    const targetRole = target.role || "CLIENT";

    const result = await Swal.fire({
      title: `Login as "${targetName}"?`,
      html: `You are about to access the console directly as <strong>${targetName}</strong> (${targetRole}).<br/><br/>
        <div class="alert alert-light border text-start small mb-0 py-2">
          <div><i class="fa fa-external-link-alt text-primary me-1"></i> <strong>New Tab:</strong> Keeps your Admin console session completely active and untouched in this tab.</div>
          <div class="text-muted mt-1"><i class="fa fa-shield-alt text-success me-1"></i> The user's own ongoing login sessions and credentials remain 100% safe.</div>
        </div>`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: "#3c0082",
      denyButtonColor: "#475569",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "🚀 Open in New Tab",
      denyButtonText: "Open in Current Tab",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed && !result.isDenied) return;
    const isNewTab = result.isConfirmed;

    try {
      const res = await apiClient.post(`/users/impersonate/${target._id}`);
      const { token, user } = res.data?.data || res.data || {};

      if (!token) throw new Error("No token returned from server");

      const origToken = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
      const origUser = sessionStorage.getItem("userData") || localStorage.getItem("userData");
      const origRole = sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || "ADMIN";

      if (isNewTab) {
        const bridgeUrl = `/auth/impersonate-session#token=${encodeURIComponent(token)}&role=${encodeURIComponent(user?.role || targetRole)}&user=${encodeURIComponent(JSON.stringify(user || target))}&adminToken=${encodeURIComponent(origToken || "")}&adminRole=${encodeURIComponent(origRole || "")}&adminUser=${encodeURIComponent(origUser || "")}`;

        window.open(bridgeUrl, "_blank");

        Swal.fire({
          icon: "success",
          title: "Session Launched in New Tab!",
          html: `Logged into <strong>${targetName}</strong> (${targetRole}) in a new tab.<br/><small class="text-muted">Your Admin console in this tab remains active and preserved.</small>`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        sessionStorage.setItem("impersonatorAdminToken", origToken);
        sessionStorage.setItem("impersonatorAdminUser", origUser);
        sessionStorage.setItem("impersonatorAdminRole", origRole);
        localStorage.setItem("impersonatorAdminToken", origToken);

        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userRole", user?.role || targetRole);
        sessionStorage.setItem("userData", JSON.stringify(user || target));

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
      console.error("Direct Login Error:", err);
      Swal.fire({
        icon: "error",
        title: "Direct Login Failed",
        text: err?.response?.data?.message || err.message || "Failed to log in as user",
      });
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: DIRECTORY MODE (When on /authorized/config/communication with no :userId)
  // ──────────────────────────────────────────────────────────────────────────
  if (!routeUserId && !propUserId) {
    return (
      <div className="container-fluid py-3 px-md-4">
        <ToastContainer toasts={toasts} onRemove={toast.remove} />

        {/* Hero Header */}
        <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary">
                  <FaCogs size={22} />
                </span>
                <h4 className="fw-bold mb-0 text-dark">Client &amp; Reseller Communication Setup</h4>
              </div>
              <p className="text-muted small mb-0 mt-1">
                Configure telecom vendor credentials, Meta WhatsApp Cloud API, Jio RCS, Mobiglitz DLT gateways, and SMTP relays for each account.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                color="primary"
                size="sm"
                className="d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
                onClick={() => {
                  if (usersList.length > 0) {
                    const first = usersList.find((u) => u.role === "CLIENT" || u.role === "RESELLER");
                    if (first) handleSelectUser(first);
                  }
                }}
              >
                <FaSlidersH /> Quick Setup First Client
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <Row className="g-2 mt-3 pt-3 border-top">
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Total Accounts</span>
                <strong className="fs-5 text-dark">
                  {usersList.filter((u) => ["ADMIN", "CLIENT", "RESELLER"].includes(u.role)).length}
                </strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Clients</span>
                <strong className="fs-5 text-primary">
                  {usersList.filter((u) => u.role === "CLIENT").length}
                </strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">Resellers</span>
                <strong className="fs-5 text-purple" style={{ color: "#7950f2" }}>
                  {usersList.filter((u) => u.role === "RESELLER").length}
                </strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">WhatsApp Active</span>
                <strong className="fs-5 text-success">
                  {usersList.filter((u) => (u.enabledChannels || []).includes("whatsapp")).length}
                </strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">RCS Active</span>
                <strong className="fs-5 text-info">
                  {usersList.filter((u) => (u.enabledChannels || []).includes("rcs")).length}
                </strong>
              </div>
            </Col>
            <Col xs={6} sm={4} md={2}>
              <div className="p-2.5 rounded-2 bg-light border text-center">
                <span className="text-muted small d-block">SMS Active</span>
                <strong className="fs-5 text-warning">
                  {usersList.filter((u) => (u.enabledChannels || []).includes("sms")).length}
                </strong>
              </div>
            </Col>
          </Row>
        </div>

        {/* Search & Filters */}
        <Card className="shadow-sm border mb-3">
          <CardBody className="py-2.5 px-3">
            <Row className="g-2 align-items-center">
              <Col md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroupText>
                  <Input
                    type="text"
                    placeholder="Search by client name, email, or mobile..."
                    className="border-start-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      color="light"
                      className="border"
                      onClick={() => setSearchQuery("")}
                    >
                      <FaTimes size={12} />
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={5}>
                <div className="d-flex align-items-center gap-1 flex-wrap">
                  <span className="small text-muted fw-semibold me-1">Role:</span>
                  <Button
                    size="sm"
                    color={roleFilter === "ALL" ? "dark" : "light"}
                    className="py-1 px-2.5 small fw-semibold"
                    onClick={() => setRoleFilter("ALL")}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    color={roleFilter === "ADMIN" ? "primary" : "light"}
                    className="py-1 px-2.5 small fw-semibold"
                    onClick={() => setRoleFilter("ADMIN")}
                  >
                    Admins
                  </Button>
                  <Button
                    size="sm"
                    color={roleFilter === "CLIENT" ? "primary" : "light"}
                    className="py-1 px-2.5 small fw-semibold"
                    onClick={() => setRoleFilter("CLIENT")}
                  >
                    Clients
                  </Button>
                  <Button
                    size="sm"
                    color={roleFilter === "RESELLER" ? "info" : "light"}
                    className="py-1 px-2.5 small fw-semibold"
                    onClick={() => setRoleFilter("RESELLER")}
                  >
                    Resellers
                  </Button>
                </div>
              </Col>
              <Col md={3}>
                <Input
                  type="select"
                  size="sm"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                >
                  <option value="ALL">All Enabled Channels</option>
                  <option value="sms">SMS Gateway Active</option>
                  <option value="whatsapp">WhatsApp Cloud Active</option>
                  <option value="rcs">RCS Business Messaging Active</option>
                  <option value="voice">Voice / OBD Active</option>
                  <option value="email">Email SMTP Active</option>
                </Input>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Accounts Table */}
        <Card className="shadow-sm border">
          <CardHeader className="bg-white py-2.5 px-3 d-flex align-items-center justify-content-between border-bottom">
            <span className="fw-bold text-dark small text-uppercase">
              <FaUserFriends className="text-primary me-2" />
              Manageable Clients &amp; Resellers ({filteredUsers.length})
            </span>
            <span className="text-muted small">
              Click &quot;Configure Setup&quot; to manage credentials &amp; gateways
            </span>
          </CardHeader>
          <CardBody className="p-0">
            {directoryLoading ? (
              <div className="text-center py-5">
                <Spinner color="primary" />
                <p className="text-muted small mt-2">Loading client accounts directory...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <FaSearch size={32} className="text-muted mb-2" />
                <h6 className="fw-bold text-dark">No accounts match your search</h6>
                <p className="text-muted small">Try adjusting your search criteria or role filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="bg-light text-muted small text-uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Account / User</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Enabled Channels</th>
                      <th className="py-2.5 px-3 text-end">Setup Gateway</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const name = u.name || u.fullName || "Unnamed User";
                      const initial = name.charAt(0).toUpperCase();
                      const channels = Array.isArray(u.enabledChannels) ? u.enabledChannels : [];
                      const encId = encryptUserId(u._id);

                      return (
                        <tr key={u._id}>
                          <td className="py-2.5 px-3">
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                  width: 36,
                                  height: 36,
                                  backgroundColor: u.role === "RESELLER" ? "#7950f2" : "#228be6",
                                  fontSize: "15px",
                                }}
                              >
                                {initial}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{name}</div>
                                <div className="text-muted small">
                                  {u.email} {u.mobile && <span className="ms-1">• {u.mobile}</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              color={u.role === "RESELLER" ? "info" : "primary"}
                              pill
                              className="px-2.5 py-1"
                            >
                              {u.role}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              color={u.status === "APPROVED" || u.isActive ? "success" : "secondary"}
                              pill
                            >
                              {u.status || "ACTIVE"}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {channels.length === 0 ? (
                              <span className="text-muted small">No channels active</span>
                            ) : (
                              <div className="d-flex flex-wrap gap-1">
                                {channels.map((chKey) => {
                                  const meta = AVAILABLE_CHANNELS.find((c) => c.key === chKey);
                                  return (
                                    <span
                                      key={chKey}
                                      className="badge rounded-pill fw-semibold"
                                      style={{
                                        backgroundColor: `${meta?.color || "#333"}20`,
                                        color: meta?.color || "#333",
                                        border: `1px solid ${meta?.color || "#333"}40`,
                                        fontSize: "11px",
                                      }}
                                    >
                                      {meta?.label || chKey.toUpperCase()}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-end">
                            <div className="d-flex align-items-center justify-content-end gap-1.5">
                              <Button
                                color="light"
                                size="sm"
                                className="border fw-semibold px-2.5 py-1.5 shadow-sm d-inline-flex align-items-center gap-1 text-primary"
                                title={`Login directly as ${u.name || u.fullName || u.email}`}
                                onClick={() => handleDirectLogin(u)}
                              >
                                <FaSignInAlt size={11} /> Login
                              </Button>
                              <Button
                                color="primary"
                                size="sm"
                                className="fw-semibold px-3 py-1.5 shadow-sm d-inline-flex align-items-center gap-1.5"
                                onClick={() => handleSelectUser(u)}
                              >
                                <FaSlidersH size={12} /> Configure Setup
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: CONFIGURATION SETUP MODE (When an account is selected)
  // ──────────────────────────────────────────────────────────────────────────
  if (loading) return <PageLoader />;

  const matchedUser = usersList.find((u) => String(u._id) === String(effectiveUserId || targetUser?._id));
  const displayName = targetUser?.fullName || targetUser?.name || matchedUser?.fullName || matchedUser?.name || "Account Profile";
  const displayRole = targetUser?.role || matchedUser?.role || "CLIENT";
  const displayEmail = targetUser?.email || matchedUser?.email || "—";
  const displayMobile = targetUser?.mobile || matchedUser?.mobile || "—";
  const displayRegNo = targetUser?.uRegistrationNo || matchedUser?.uRegistrationNo || "";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="container-fluid py-3 px-md-4">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* Top Header Navigation */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <Button
          color="light"
          size="sm"
          className="d-flex align-items-center gap-2 px-3 py-1.5 border shadow-sm fw-semibold"
          onClick={() => navigate("/authorized/config/communication")}
        >
          <FaArrowLeft size={12} /> All Accounts Directory
        </Button>
        <div className="d-flex align-items-center gap-2">
          <Button
            color="primary"
            outline
            size="sm"
            className="d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold shadow-sm"
            onClick={() => setSwitchModal(true)}
          >
            <FaExchangeAlt size={12} /> Switch Client / Reseller
          </Button>
        </div>
      </div>

      {/* Target User Profile Banner */}
      <Card className="shadow-sm border mb-3 bg-white">
        <CardBody className="py-3 px-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-sm"
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: displayRole === "RESELLER" ? "#7950f2" : "#228be6",
                  fontSize: "20px",
                }}
              >
                {displayInitial}
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h5 className="fw-bold mb-0 text-dark">{displayName}</h5>
                  {displayRegNo && (
                    <span
                      className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 font-monospace fw-semibold"
                      style={{ fontSize: "11px" }}
                      title="Registration No."
                    >
                      🆔 {displayRegNo}
                    </span>
                  )}
                  <Badge color={displayRole === "RESELLER" ? "info" : "primary"} pill>
                    {displayRole}
                  </Badge>
                  <Badge color="success" pill>
                    ACTIVE
                  </Badge>
                </div>
                <div className="text-muted small mt-0.5">
                  <span>{displayEmail}</span>
                  {displayMobile !== "—" && <span className="ms-2">• {displayMobile}</span>}
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <Button
                color="primary"
                className="d-flex align-items-center gap-2 px-3 py-1.5 shadow-sm fw-bold border-0"
                style={{ background: "#3c0082" }}
                onClick={() => handleDirectLogin()}
                title={`Direct single-click login as ${displayName} (${displayRole}) for Admin / DevOps`}
              >
                <FaSignInAlt size={13} /> Login as {displayRole}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tabbed Pro Setup Form */}
      <Card className="shadow-sm border mb-4">
        <CardHeader className="bg-light border-bottom p-0">
          <Nav tabs className="border-0 px-2 pt-2">
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "channels" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("channels")}
              >
                <FaSlidersH className="me-1.5" /> 1. Channels &amp; Vendors
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "rcs" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("rcs")}
              >
                <FaBroadcastTower className="me-1.5" /> 2. RCS Messaging
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "whatsapp" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("whatsapp")}
              >
                <FaComments className="me-1.5" /> 3. WhatsApp Business
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "sms" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("sms")}
              >
                <FaPhoneAlt className="me-1.5" /> 4. SMS &amp; DLT Gateway
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "voice" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("voice")}
              >
                <FaPhoneAlt className="me-1.5" /> 5. Voice &amp; OBD Pulse
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "smtp" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("smtp")}
              >
                <FaEnvelope className="me-1.5" /> 6. Email SMTP Relay
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={`py-2 px-3 fw-semibold cursor-pointer border-0 rounded-top ${
                  activeTab === "telegram" ? "active bg-white text-primary border-top border-primary border-2" : "text-secondary"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("telegram")}
              >
                <FaTelegramPlane className="me-1.5" /> 7. Telegram Services
              </NavLink>
            </NavItem>
          </Nav>
        </CardHeader>

        <Form onSubmit={handleSubmit}>
          <CardBody className="p-4">
            <TabContent activeTab={activeTab}>
              {/* TAB 1: Channels & Vendor Selection */}
              <TabPane tabId="channels">
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-1">Channel Activation &amp; Authorization</h6>
                  <p className="text-muted small mb-3">
                    Check the communication channels authorized for this client or reseller account.
                  </p>
                  <Row className="g-2 row-cols-2 row-cols-sm-3 row-cols-lg-5">
                    {AVAILABLE_CHANNELS.map((ch) => {
                      const isChecked = enabledChannels.includes(ch.key);
                      return (
                        <Col key={ch.key}>
                          <div
                            className={`p-2 border rounded-2 transition-all h-100 ${
                              isChecked ? "bg-primary bg-opacity-10 border-primary" : "bg-light"
                            }`}
                            style={{ cursor: "pointer", minHeight: "64px" }}
                            onClick={() => handleChannelToggle(ch.key)}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <span className="fw-bold d-flex align-items-center gap-1.5" style={{ color: ch.color, fontSize: "12.5px" }}>
                                <span style={{ fontSize: "13px" }}>{ch.icon}</span> {ch.label}
                              </span>
                              <input
                                type="checkbox"
                                className="form-check-input mt-0"
                                checked={isChecked}
                                onChange={() => handleChannelToggle(ch.key)}
                                style={{ width: 15, height: 15, cursor: "pointer" }}
                              />
                            </div>
                            <div className="text-muted text-truncate mt-1" style={{ fontSize: "10.5px", lineHeight: "1.2" }} title={ch.desc}>
                              {ch.desc}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>

                <div className="pt-3 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Enterprise CPaaS Provider &amp; Failover Routing Engine</h6>
                      <small className="text-muted">
                        Configure dynamic Primary upstream gateway, Secondary auto-failover, and routing policy per channel.
                      </small>
                    </div>
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      className="d-flex align-items-center gap-1.5 fw-semibold shadow-none"
                      style={{ borderRadius: "8px", fontSize: "12px" }}
                      onClick={() => navigate("/authorized/settings/providers")}
                      title="Manage global Provider Master to add or register new telecom and CPaaS carrier gateways"
                    >
                      <FaServer size={12} /> Manage Provider Master
                    </Button>
                  </div>

                  <Row className="g-3">
                    {/* SMS ROUTING */}
                    <Col md={6}>
                      <Card className="border shadow-none h-100 bg-white">
                        <CardHeader className="py-2 px-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaPhoneAlt className="text-success" /> SMS Gateway Routing Policy
                          </span>
                          <Badge color="success" pill style={{ fontSize: "10px" }}>DLT TRAI</Badge>
                        </CardHeader>
                        <CardBody className="p-3">
                          <Row className="g-2">
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Primary Vendor Service</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.smsPrimaryVendor || "mobiglitz"}
                                onChange={(e) => {
                                  handleInputChange("smsPrimaryVendor", e.target.value);
                                  handleInputChange("smsVendor", e.target.value);
                                }}
                              >
                                {(providersByChannel.SMS || []).map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                                <option value="other">Other Telco API</option>
                              </Input>
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Secondary (Auto-Failover)</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.smsSecondaryVendor || "airtel"}
                                onChange={(e) => handleInputChange("smsSecondaryVendor", e.target.value)}
                              >
                                {(providersByChannel.SMS || []).map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                                <option value="">None (No Secondary)</option>
                              </Input>
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Backup (Contingency)</Label>
                              <Input
                                type="text"
                                bsSize="sm"
                                placeholder="Optional 3rd Provider"
                                value={formData.smsBackupVendor || ""}
                                onChange={(e) => handleInputChange("smsBackupVendor", e.target.value)}
                              />
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Failover Strategy</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.smsDefaultRouting || "primary_failover"}
                                onChange={(e) => handleInputChange("smsDefaultRouting", e.target.value)}
                              >
                                <option value="primary_failover">Auto-Failover on Timeout/5xx</option>
                                <option value="primary_only">Strict Primary Only</option>
                                <option value="round_robin">Round-Robin Load Balancing</option>
                                <option value="priority_cost">Lowest Cost / Priority First</option>
                              </Input>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>

                    {/* WHATSAPP ROUTING */}
                    <Col md={6}>
                      <Card className="border shadow-none h-100 bg-white">
                        <CardHeader className="py-2 px-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaComments className="text-success" /> WhatsApp Business Routing
                          </span>
                          <Badge color="success" pill style={{ fontSize: "10px" }}>Meta Graph API</Badge>
                        </CardHeader>
                        <CardBody className="p-3">
                          <Row className="g-2">
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Primary Vendor Service</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.whatsappPrimaryVendor || "meta"}
                                onChange={(e) => {
                                  handleInputChange("whatsappPrimaryVendor", e.target.value);
                                  handleInputChange("whatsappVendor", e.target.value);
                                }}
                              >
                                {(providersByChannel.WHATSAPP || []).map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                                <option value="other">Other WhatsApp Gateway</option>
                              </Input>
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Secondary (Failover)</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.whatsappSecondaryVendor || "wbs"}
                                onChange={(e) => handleInputChange("whatsappSecondaryVendor", e.target.value)}
                              >
                                {(providersByChannel.WHATSAPP || []).map((p) => (
                                  <option key={p.code} value={p.code}>
                                    {p.name}
                                  </option>
                                ))}
                                <option value="">None (No Secondary)</option>
                              </Input>
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Backup (Contingency)</Label>
                              <Input
                                type="text"
                                bsSize="sm"
                                placeholder="Optional 3rd Provider"
                                value={formData.whatsappBackupVendor || ""}
                                onChange={(e) => handleInputChange("whatsappBackupVendor", e.target.value)}
                              />
                            </Col>
                            <Col sm={6}>
                              <Label className="small fw-semibold text-secondary mb-1">Routing Strategy</Label>
                              <Input
                                type="select"
                                bsSize="sm"
                                value={formData.whatsappDefaultRouting || "primary_failover"}
                                onChange={(e) => handleInputChange("whatsappDefaultRouting", e.target.value)}
                              >
                                <option value="primary_failover">Auto-Failover on Rate Limit</option>
                                <option value="primary_only">Strict Primary Only</option>
                                <option value="round_robin">Round-Robin Multiple Numbers</option>
                              </Input>
                            </Col>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>

                    {/* RCS ROUTING */}
                    <Col md={4}>
                      <Card className="border shadow-none h-100 bg-white">
                        <CardHeader className="py-2 px-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaBroadcastTower className="text-primary" /> RCS Routing
                          </span>
                          <Badge color="primary" pill style={{ fontSize: "10px" }}>Google RBM</Badge>
                        </CardHeader>
                        <CardBody className="p-3">
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Primary Vendor</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.rcsPrimaryVendor || "routemobile"}
                              onChange={(e) => {
                                handleInputChange("rcsPrimaryVendor", e.target.value);
                                handleInputChange("rcsVendor", e.target.value);
                              }}
                            >
                              {(providersByChannel.RCS || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                              <option value="other">Other Aggregator</option>
                            </Input>
                          </div>
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Secondary Vendor</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.rcsSecondaryVendor || "jio"}
                              onChange={(e) => handleInputChange("rcsSecondaryVendor", e.target.value)}
                            >
                              {(providersByChannel.RCS || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                              <option value="">None</option>
                            </Input>
                          </div>
                          <div>
                            <Label className="small fw-semibold text-secondary mb-1">RCS Company Brand</Label>
                            <Input
                              type="text"
                              bsSize="sm"
                              placeholder="e.g. InSign Technologies"
                              value={formData.rcsVendorCompany || ""}
                              onChange={(e) => handleInputChange("rcsVendorCompany", e.target.value)}
                            />
                          </div>
                        </CardBody>
                      </Card>
                    </Col>

                    {/* VOICE ROUTING */}
                    <Col md={4}>
                      <Card className="border shadow-none h-100 bg-white">
                        <CardHeader className="py-2 px-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaPhoneAlt className="text-warning" /> Voice &amp; OBD Routing
                          </span>
                          <Badge color="warning" pill style={{ fontSize: "10px" }}>IVR Pulse</Badge>
                        </CardHeader>
                        <CardBody className="p-3">
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Primary Voice Gateway</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.voicePrimaryVendor || "mobiglitz"}
                              onChange={(e) => handleInputChange("voicePrimaryVendor", e.target.value)}
                            >
                              {(providersByChannel.VOICE || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                              <option value="other">Other SIP Gateway</option>
                            </Input>
                          </div>
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Secondary Voice Gateway</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.voiceSecondaryVendor || "buzzdial"}
                              onChange={(e) => handleInputChange("voiceSecondaryVendor", e.target.value)}
                            >
                              {(providersByChannel.VOICE || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                              <option value="">None</option>
                            </Input>
                          </div>
                          <div>
                            <Label className="small fw-semibold text-secondary mb-1">Voice Routing Strategy</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.voiceDefaultRouting || "primary_failover"}
                              onChange={(e) => handleInputChange("voiceDefaultRouting", e.target.value)}
                            >
                              <option value="primary_failover">Auto-Failover on Channel Busy</option>
                              <option value="primary_only">Strict Primary Only</option>
                            </Input>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>

                    {/* EMAIL ROUTING */}
                    <Col md={4}>
                      <Card className="border shadow-none h-100 bg-white">
                        <CardHeader className="py-2 px-3 bg-light border-bottom d-flex align-items-center justify-content-between">
                          <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                            <FaEnvelope className="text-info" /> Email Relay Routing
                          </span>
                          <Badge color="info" pill style={{ fontSize: "10px" }}>SMTP &amp; SES</Badge>
                        </CardHeader>
                        <CardBody className="p-3">
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Primary Email Relay</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.emailPrimaryVendor || "smtp"}
                              onChange={(e) => handleInputChange("emailPrimaryVendor", e.target.value)}
                            >
                              {(providersByChannel.EMAIL || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                            </Input>
                          </div>
                          <div className="mb-2">
                            <Label className="small fw-semibold text-secondary mb-1">Secondary Relay</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.emailSecondaryVendor || "ses"}
                              onChange={(e) => handleInputChange("emailSecondaryVendor", e.target.value)}
                            >
                              {(providersByChannel.EMAIL || []).map((p) => (
                                <option key={p.code} value={p.code}>
                                  {p.name}
                                </option>
                              ))}
                              <option value="">None</option>
                            </Input>
                          </div>
                          <div>
                            <Label className="small fw-semibold text-secondary mb-1">Email Failover Strategy</Label>
                            <Input
                              type="select"
                              bsSize="sm"
                              value={formData.emailDefaultRouting || "primary_failover"}
                              onChange={(e) => handleInputChange("emailDefaultRouting", e.target.value)}
                            >
                              <option value="primary_failover">Auto-Failover on Bounce/Timeout</option>
                              <option value="primary_only">Strict Primary Only</option>
                            </Input>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 2: RCS Messaging */}
              <TabPane tabId="rcs">
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-danger">Jio Google RBM</span>
                    <h6 className="fw-bold text-dark mb-0">Jio RCS Business Messaging Credentials</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Configured credentials for Jio RCS agent verification &amp; message delivery.
                  </p>
                  <Row className="g-3">
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">RCS Agent ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. agent-102948-jio"
                          value={formData.jioRcsAgentId || ""}
                          onChange={(e) => handleInputChange("jioRcsAgentId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">RCS API Key</Label>
                          {secretsSet.jioRcsApiKey && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.jioRcsApiKey ? "text" : "password"}
                            placeholder="Enter Jio RCS API Key"
                            value={formData.jioRcsApiKey || ""}
                            onChange={(e) => handleInputChange("jioRcsApiKey", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("jioRcsApiKey")}
                          >
                            {showSecrets.jioRcsApiKey ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                <div className="pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary">Routemobile</span>
                    <h6 className="fw-bold text-dark mb-0">Routemobile RCS Gateway Credentials</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Alternative RCS gateway credentials through Routemobile carrier API.
                  </p>
                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">RCS User ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. rcs_user_01"
                          value={formData.rcsUserId || ""}
                          onChange={(e) => handleInputChange("rcsUserId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">RCS User Password</Label>
                          {secretsSet.rcsPassword && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.rcsPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.rcsPassword || ""}
                            onChange={(e) => handleInputChange("rcsPassword", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("rcsPassword")}
                          >
                            {showSecrets.rcsPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">RCS Bearer API Token</Label>
                          {secretsSet.rcsApiToken && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.rcsApiToken ? "text" : "password"}
                            placeholder="Optional bearer token"
                            value={formData.rcsApiToken || ""}
                            onChange={(e) => handleInputChange("rcsApiToken", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("rcsApiToken")}
                          >
                            {showSecrets.rcsApiToken ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 3: WhatsApp Business */}
              <TabPane tabId="whatsapp">
                <div className="mb-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-success">Meta Cloud API</span>
                        <h6 className="fw-bold text-dark mb-0">Official WhatsApp Cloud API Credentials</h6>
                      </div>
                      <p className="text-muted small mb-0">
                        Configured via Meta Developers portal: Permanent System User Access Token, WABA ID, and Phone Number ID.
                      </p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {["meta", "meta_cloud"].includes(String(formData.whatsappPrimaryVendor || "").toLowerCase()) ? (
                        <Badge color="success" pill className="px-2.5 py-1.5 fw-semibold d-flex align-items-center gap-1">
                          <FaCheckCircle size={11} /> Primary Provider
                        </Badge>
                      ) : (
                        <Button
                          color="light"
                          size="sm"
                          className="border fw-semibold py-1 px-2.5 d-flex align-items-center gap-1"
                          onClick={() => handleSetPrimary("whatsapp", "meta")}
                          title="Set Meta Cloud as primary provider for WhatsApp"
                        >
                          <FaStar className="text-warning" size={11} /> Set as Primary
                        </Button>
                      )}
                    </div>
                  </div>
                  <Row className="g-3">
                    <Col md={12}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">Meta Permanent Access Token</Label>
                          {secretsSet.metaToken && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.metaToken ? "text" : "password"}
                            placeholder="EAAG... (Permanent System User Token)"
                            value={formData.metaToken || ""}
                            onChange={(e) => handleInputChange("metaToken", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("metaToken")}
                          >
                            {showSecrets.metaToken ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          {formData.metaToken && (
                            <Button
                              type="button"
                              color="light"
                              className="border"
                              title="Copy Token"
                              onClick={() => copyToClipboard(formData.metaToken, "Meta Token")}
                            >
                              <FaCopy />
                            </Button>
                          )}
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">WhatsApp Business Account ID (WABA ID)</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 109283746592819"
                          value={formData.wabaId || ""}
                          onChange={(e) => handleInputChange("wabaId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Phone Number ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 293847192837461"
                          value={formData.phoneNumberId || ""}
                          onChange={(e) => handleInputChange("phoneNumberId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Brand Sender MSISDN</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 919876543210"
                          value={formData.whatsappBrandMsisdn || ""}
                          onChange={(e) => handleInputChange("whatsappBrandMsisdn", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                {/* MULTI-WHATSAPP NUMBERS CONSOLE (wa req.pdf) */}
                <div className="pt-3 border-top mb-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-success">Meta WABA Multi-Number</span>
                        <h6 className="fw-bold text-dark mb-0">Connected WhatsApp Phone Numbers</h6>
                      </div>
                      <p className="text-muted small mb-0 mt-0.5">
                        Manage multiple verified Meta Phone Number IDs, quality rating health, messaging tier limits, and default outbound sender.
                      </p>
                    </div>
                    <Button
                      color="success"
                      size="sm"
                      className="d-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                      onClick={() => handleOpenNumberModal(null)}
                    >
                      + Connect WhatsApp Number
                    </Button>
                  </div>

                  {whatsappNumbers.length === 0 ? (
                    <div className="p-4 border rounded-3 bg-light text-center">
                      <FaComments size={28} className="text-muted mb-2 opacity-50" />
                      <h6 className="fw-semibold text-dark mb-1">No Dedicated Numbers Registered Yet</h6>
                      <p className="text-muted small mb-2">
                        If using the global credentials above, this account uses the primary Phone Number ID ({formData.phoneNumberId || "not set"}).
                        Click below to connect dedicated multi-numbers.
                      </p>
                      <Button
                        color="success"
                        outline
                        size="sm"
                        className="fw-semibold"
                        onClick={() => handleOpenNumberModal(null)}
                      >
                        + Register First WhatsApp Number
                      </Button>
                    </div>
                  ) : (
                    <div className="table-responsive border rounded-3 bg-white">
                      <Table hover size="sm" className="align-middle mb-0">
                        <thead className="bg-light text-muted small text-uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Phone Number &amp; Display Name</th>
                            <th className="py-2.5 px-3">Phone Number ID / WABA</th>
                            <th className="py-2.5 px-3">Quality Rating</th>
                            <th className="py-2.5 px-3">Messaging Tier</th>
                            <th className="py-2.5 px-3">Default Sender</th>
                            <th className="py-2.5 px-3 text-end">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {whatsappNumbers.map((num, idx) => (
                            <tr key={idx}>
                              <td className="py-2.5 px-3">
                                <div className="fw-bold text-dark">{num.phoneNumber || "—"}</div>
                                <small className="text-muted">{num.displayName || "Unverified Name"}</small>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-monospace small text-dark">{num.phoneNumberId || "—"}</div>
                                <small className="text-muted font-monospace">WABA: {num.wabaId || "—"}</small>
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge
                                  color={
                                    num.qualityRating === "GREEN"
                                      ? "success"
                                      : num.qualityRating === "YELLOW"
                                      ? "warning"
                                      : "danger"
                                  }
                                  pill
                                  className="px-2"
                                >
                                  {num.qualityRating === "GREEN" ? "High Quality (Green)" : num.qualityRating || "GREEN"}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge color="primary" pill className="px-2">
                                  {num.messagingLimitTier || "TIER_1K"}
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3">
                                {num.isDefault ? (
                                  <Badge color="success" className="px-2 py-1">
                                    ✓ DEFAULT SENDER
                                  </Badge>
                                ) : (
                                  <Button
                                    color="light"
                                    size="sm"
                                    className="py-0 px-2 small border text-muted"
                                    onClick={() => handleSetDefaultNumber(idx)}
                                  >
                                    Set Default
                                  </Button>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-end">
                                <Button
                                  color="light"
                                  size="sm"
                                  className="py-0.5 px-2 border me-1 text-primary"
                                  onClick={() => handleOpenNumberModal(idx)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  color="light"
                                  size="sm"
                                  className="py-0.5 px-2 border text-danger"
                                  onClick={() => handleDeleteNumber(idx)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>

                  {(() => {
                    const isRmlConnected = Boolean(
                      formData.routemobileJwtAuth ||
                      formData.wbsJwtAuth ||
                      secretsSet.wbsJwtAuth ||
                      secretsSet.routemobileJwtAuth ||
                      rawConfig?.whatsappConfig?.routemobile?.configurations?.[0]?.status === "ACTIVE"
                    );

                    return (
                      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                        <div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">Route Mobile WBS</span>
                            <h6 className="fw-bold text-dark mb-0">WhatsApp Business Solution (Route Mobile WBS)</h6>
                          </div>
                          <p className="text-muted small mb-0 mt-0.5">
                            Route Mobile enterprise carrier WBS gateway with auto-generated template synchronization.
                          </p>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-2">
                          {/* Set Primary Button */}
                          {["routemobile", "routemobile_wa", "wbs"].includes(String(formData.whatsappPrimaryVendor || "").toLowerCase()) ? (
                            <Badge color="success" pill className="px-2.5 py-1.5 fw-semibold d-flex align-items-center gap-1">
                              <FaCheckCircle size={11} /> Primary Provider
                            </Badge>
                          ) : (
                            <Button
                              color="light"
                              size="sm"
                              className="border fw-semibold py-1 px-2.5 d-flex align-items-center gap-1"
                              onClick={() => handleSetPrimary("whatsapp", "routemobile")}
                              title="Set Route Mobile as primary provider for WhatsApp"
                            >
                              <FaStar className="text-warning" size={11} /> Set as Primary
                            </Button>
                          )}

                          {/* Connect Button */}
                          {isRmlConnected ? (
                            <Button
                              color="success"
                              size="sm"
                              className="d-flex align-items-center gap-1.5 fw-semibold"
                              disabled
                              title="Carrier gateway connected and authenticated in database"
                            >
                              <FaCheckCircle size={12} /> Connected
                            </Button>
                          ) : (
                            <Button
                              color="primary"
                              size="sm"
                              className="d-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                              onClick={() => handleConnectProvider("whatsapp", "routemobile")}
                              disabled={connectingProvider}
                              title="Authenticate credentials and connect Route Mobile WBS"
                            >
                              {connectingProvider ? (
                                <>
                                  <Spinner size="sm" className="me-1" /> Connecting...
                                </>
                              ) : (
                                <>
                                  <FaPlug size={12} /> Connect
                                </>
                              )}
                            </Button>
                          )}

                          {/* View Details Modal Button */}
                          <Button
                            color="info"
                            outline
                            size="sm"
                            className="d-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                            onClick={() => handleOpenProviderDetails("whatsapp", "routemobile")}
                            title="View Route Mobile account details, user data and gateway configuration"
                          >
                            <FaEye size={12} /> View Details
                          </Button>

                          {/* Sync Provider Templates Button */}
                          <Button
                            color="secondary"
                            outline
                            size="sm"
                            className="d-flex align-items-center gap-1.5 fw-semibold shadow-xs"
                            onClick={handleSyncProviderTemplates}
                            disabled={syncingProvider}
                            title="Sync live registered templates from active provider carrier API"
                          >
                            {syncingProvider ? (
                              <>
                                <Spinner size="sm" className="me-1" /> Syncing Templates...
                              </>
                            ) : (
                              <>
                                <FaBroadcastTower size={12} /> Sync Provider Templates
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })()}

                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Route Mobile / WBS User ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. digiglitzwbs"
                          value={formData.wbsUserId || formData.routemobileUsername || ""}
                          onChange={(e) => {
                            handleInputChange("wbsUserId", e.target.value);
                            handleInputChange("routemobileUsername", e.target.value);
                          }}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">Route Mobile Password</Label>
                          {(secretsSet.wbsPassword || secretsSet.routemobilePassword) && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.wbsPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.wbsPassword || formData.routemobilePassword || ""}
                            onChange={(e) => {
                              handleInputChange("wbsPassword", e.target.value);
                              handleInputChange("routemobilePassword", e.target.value);
                            }}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("wbsPassword")}
                          >
                            {showSecrets.wbsPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Sender MSISDN / Mobile</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 9977679866"
                          value={formData.whatsappBrandMsisdn || ""}
                          onChange={(e) => handleInputChange("whatsappBrandMsisdn", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={12}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">
                            Route Mobile JWTAUTH Token (Bearer API Token)
                          </Label>
                          {(formData.wbsJwtAuth || formData.routemobileJwtAuth || secretsSet.wbsJwtAuth || secretsSet.routemobileJwtAuth) && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Authenticated &amp; Stored</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.wbsJwtAuth ? "text" : "password"}
                            placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9... (Route Mobile JWTAUTH Token)"
                            value={formData.wbsJwtAuth || formData.routemobileJwtAuth || ""}
                            onChange={(e) => {
                              handleInputChange("wbsJwtAuth", e.target.value);
                              handleInputChange("routemobileJwtAuth", e.target.value);
                            }}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("wbsJwtAuth")}
                          >
                            {showSecrets.wbsJwtAuth ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          {(formData.wbsJwtAuth || formData.routemobileJwtAuth) && (
                            <Button
                              type="button"
                              color="light"
                              className="border"
                              title="Copy Token"
                              onClick={() => copyToClipboard(formData.wbsJwtAuth || formData.routemobileJwtAuth, "JWTAUTH Token")}
                            >
                              <FaCopy />
                            </Button>
                          )}
                        </InputGroup>
                        <small className="text-muted d-block mt-1">
                          Auto-generated via Route Mobile <code>/auth/v1/login/</code> endpoint. Used for template management and message dispatch.
                        </small>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 4: SMS & DLT Gateway */}
              <TabPane tabId="sms">
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-success">Mobiglitz DLT</span>
                    <h6 className="fw-bold text-dark mb-0">Mobiglitz SMS Gateway Credentials</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    TRAI DLT compliant enterprise SMS route credentials and route keys.
                  </p>
                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Mobiglitz Username</Label>
                        <Input
                          type="text"
                          placeholder="e.g. mglitz_client_user"
                          value={formData.mobiglitzSmsUsername || ""}
                          onChange={(e) => handleInputChange("mobiglitzSmsUsername", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">Mobiglitz Password</Label>
                          {secretsSet.mobiglitzSmsPassword && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.mobiglitzSmsPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.mobiglitzSmsPassword || ""}
                            onChange={(e) => handleInputChange("mobiglitzSmsPassword", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("mobiglitzSmsPassword")}
                          >
                            {showSecrets.mobiglitzSmsPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">DLT Principal Entity ID (PE ID)</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 1701159876543210"
                          value={formData.smsDltEntityId || ""}
                          onChange={(e) => handleInputChange("smsDltEntityId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <h6 className="fw-bold text-dark small text-uppercase mt-3 pt-3 border-top mb-2">
                    Mobiglitz Category Route API Keys
                  </h6>
                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">OTP 24x7 Route API Key</Label>
                        <Input
                          type="text"
                          placeholder="Route API key for OTP"
                          value={formData.mglitzSmsOtpRouteKey || ""}
                          onChange={(e) => handleInputChange("mglitzSmsOtpRouteKey", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Transactional Route API Key</Label>
                        <Input
                          type="text"
                          placeholder="Route API key"
                          value={formData.mglitzSmsTransactionalRouteKey || ""}
                          onChange={(e) => handleInputChange("mglitzSmsTransactionalRouteKey", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Promotional Route API Key</Label>
                        <Input
                          type="text"
                          placeholder="Route API key"
                          value={formData.mglitzSmsPromotionalRouteKey || ""}
                          onChange={(e) => handleInputChange("mglitzSmsPromotionalRouteKey", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Service Implicit Route API Key</Label>
                        <Input
                          type="text"
                          placeholder="Route API key"
                          value={formData.mglitzSmsImplicitRouteKey || ""}
                          onChange={(e) => handleInputChange("mglitzSmsImplicitRouteKey", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Service Explicit Route API Key</Label>
                        <Input
                          type="text"
                          placeholder="Route API key"
                          value={formData.mglitzSmsExplicitRouteKey || ""}
                          onChange={(e) => handleInputChange("mglitzSmsExplicitRouteKey", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                <div className="pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-danger">Airtel IQ</span>
                    <h6 className="fw-bold text-dark mb-0">Airtel SMS Gateway Credentials</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Direct Airtel carrier gateway credentials.
                  </p>
                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Airtel Customer ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. AIRTEL_CUST_1234"
                          value={formData.airtelSmsCustomerId || ""}
                          onChange={(e) => handleInputChange("airtelSmsCustomerId", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Airtel SMS Session Cookie</Label>
                        <InputGroup>
                          <Input
                            type={showSecrets.airtelSmsCookie ? "text" : "password"}
                            placeholder="Cookie value"
                            value={formData.airtelSmsCookie || ""}
                            onChange={(e) => handleInputChange("airtelSmsCookie", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("airtelSmsCookie")}
                          >
                            {showSecrets.airtelSmsCookie ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Airtel SMS Auth Code</Label>
                        <InputGroup>
                          <Input
                            type={showSecrets.airtelSmsAuthCode ? "text" : "password"}
                            placeholder="Auth code"
                            value={formData.airtelSmsAuthCode || ""}
                            onChange={(e) => handleInputChange("airtelSmsAuthCode", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("airtelSmsAuthCode")}
                          >
                            {showSecrets.airtelSmsAuthCode ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 5: Voice & OBD Pulse */}
              <TabPane tabId="voice">
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-warning text-dark">Mobiglitz Voice</span>
                    <h6 className="fw-bold text-dark mb-0">Mobiglitz Bulk OBD Voice Broadcast</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Outbound dialer credentials for voice pulse campaigns (15s, 30s, 60s pulses).
                  </p>
                  <Row className="g-3">
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Voice API Username</Label>
                        <Input
                          type="text"
                          placeholder="e.g. mglitz_voice_user"
                          value={formData.mglitzVoiceApiUsername || ""}
                          onChange={(e) => handleInputChange("mglitzVoiceApiUsername", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Voice API Password</Label>
                        <InputGroup>
                          <Input
                            type={showSecrets.mglitzVoiceApiPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={formData.mglitzVoiceApiPassword || ""}
                            onChange={(e) => handleInputChange("mglitzVoiceApiPassword", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("mglitzVoiceApiPassword")}
                          >
                            {showSecrets.mglitzVoiceApiPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                <div className="pt-3 border-top">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-info">Buzzdial</span>
                    <h6 className="fw-bold text-dark mb-0">Buzzdial Interactive IVR &amp; Click2Call</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Interactive IVR dialer key for press-1 surveys and inbound call routing.
                  </p>
                  <Row className="g-3">
                    <Col md={6}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">Buzzdial API Key</Label>
                        <InputGroup>
                          <Input
                            type={showSecrets.buzzdialCallApiKey ? "text" : "password"}
                            placeholder="Enter Buzzdial API key"
                            value={formData.buzzdialCallApiKey || ""}
                            onChange={(e) => handleInputChange("buzzdialCallApiKey", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("buzzdialCallApiKey")}
                          >
                            {showSecrets.buzzdialCallApiKey ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 6: Email SMTP Relay */}
              <TabPane tabId="smtp">
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge bg-primary">SMTP Relay</span>
                    <h6 className="fw-bold text-dark mb-0">Dedicated IP SMTP Relay Server Configuration</h6>
                  </div>
                  <p className="text-muted small mb-3">
                    Configured SMTP relay host for transactional emails, invoices, and newsletter delivery.
                  </p>
                  <Row className="g-3">
                    <Col md={4}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">SMTP Server Host Endpoint</Label>
                        <Input
                          type="text"
                          placeholder="e.g. smtp.beyondsend.com"
                          value={formData.emailSmtpEndpoint || ""}
                          onChange={(e) => handleInputChange("emailSmtpEndpoint", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">SMTP Port</Label>
                        <Input
                          type="number"
                          placeholder="587"
                          value={formData.emailSmtpPort || ""}
                          onChange={(e) => handleInputChange("emailSmtpPort", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <Label className="small fw-semibold text-secondary">SMTP Username / Auth ID</Label>
                        <Input
                          type="text"
                          placeholder="e.g. postmaster@domain.com"
                          value={formData.emailSmtpUsername || ""}
                          onChange={(e) => handleInputChange("emailSmtpUsername", e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup className="mb-0">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <Label className="small fw-semibold text-secondary mb-0">SMTP Password</Label>
                          {secretsSet.emailSmtpPassword && (
                            <Badge color="success" pill style={{ fontSize: "10px" }}>✓ Saved in DB</Badge>
                          )}
                        </div>
                        <InputGroup>
                          <Input
                            type={showSecrets.emailSmtpPassword ? "text" : "password"}
                            placeholder="Enter SMTP password"
                            value={formData.emailSmtpPassword || ""}
                            onChange={(e) => handleInputChange("emailSmtpPassword", e.target.value)}
                          />
                          <Button
                            type="button"
                            color="light"
                            className="border"
                            onClick={() => toggleSecret("emailSmtpPassword")}
                          >
                            {showSecrets.emailSmtpPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                        </InputGroup>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </TabPane>

              {/* TAB 7: Telegram Services (Gateway API & Bot Integration) */}
              <TabPane tabId="telegram">
                <div className="mb-4">
                  {/* Top Live Credit Wallets Header */}
                  <div className="p-3 mb-4 rounded-3 border bg-white shadow-sm">
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2 pb-2 border-bottom">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-2 rounded-2 text-white" style={{ backgroundColor: "#0088cc" }}>
                          <FaTelegramPlane size={18} />
                        </span>
                        <div>
                          <h6 className="fw-bold mb-0 text-dark">Telegram CPaaS &amp; Verification Suite</h6>
                          <small className="text-muted">
                            Dual-Engine: Official Telegram Gateway API (Phone OTP) &amp; Bot API (@BotFather)
                          </small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          color="light"
                          size="sm"
                          className="border text-primary fw-semibold"
                          onClick={loadTelegramWallet}
                          disabled={tgWalletLoading}
                        >
                          {tgWalletLoading ? <Spinner size="sm" /> : <FaUndo className="me-1" />} Refresh Balances
                        </Button>
                      </div>
                    </div>

                    {/* 5 Telegram Credit Metric Badges */}
                    <Row className="g-2 text-center">
                      <Col xs={6} md={2}>
                        <div className="p-2 rounded bg-light border">
                          <small className="text-muted d-block" style={{ fontSize: "11px" }}>Gateway OTP</small>
                          <strong className="text-success fs-6">
                            {tgWallet?.telegram_gateway_otp_credits ?? 200}
                          </strong>
                        </div>
                      </Col>
                      <Col xs={6} md={2}>
                        <div className="p-2 rounded bg-light border">
                          <small className="text-muted d-block" style={{ fontSize: "11px" }}>Broadcasts</small>
                          <strong className="text-primary fs-6">
                            {tgWallet?.telegram_marketing_broadcasts ?? 200}
                          </strong>
                        </div>
                      </Col>
                      <Col xs={6} md={2}>
                        <div className="p-2 rounded bg-light border">
                          <small className="text-muted d-block" style={{ fontSize: "11px" }}>Utility Sessions</small>
                          <strong className="text-info fs-6">
                            {tgWallet?.telegram_utility_session_credits ?? 200}
                          </strong>
                        </div>
                      </Col>
                      <Col xs={6} md={3}>
                        <div className="p-2 rounded bg-light border">
                          <small className="text-muted d-block" style={{ fontSize: "11px" }}>AI Bot Queries</small>
                          <strong className="text-warning fs-6">
                            {tgWallet?.telegram_ai_bot_credits ?? 200}
                          </strong>
                        </div>
                      </Col>
                      <Col xs={12} md={3}>
                        <div className="p-2 rounded bg-light border">
                          <small className="text-muted d-block" style={{ fontSize: "11px" }}>Service Credits (Fallback)</small>
                          <strong className="text-dark fs-6">
                            {tgWallet?.telegram_service_credits ?? 200}
                          </strong>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Sub-Tabs Selector */}
                  <Nav pills className="mb-3 p-1 bg-light rounded border">
                    <NavItem className="flex-fill">
                      <NavLink
                        className={`text-center py-2 fw-semibold cursor-pointer ${tgSubTab === "gateway" ? "active shadow-sm" : "text-secondary"}`}
                        style={tgSubTab === "gateway" ? { backgroundColor: "#0088cc", color: "#fff" } : {}}
                        onClick={() => setTgSubTab("gateway")}
                      >
                        <FaShieldAlt className="me-1" /> 1. Telegram Gateway API (Phone OTP &amp; Verification)
                      </NavLink>
                    </NavItem>
                    <NavItem className="flex-fill">
                      <NavLink
                        className={`text-center py-2 fw-semibold cursor-pointer ${tgSubTab === "bot" ? "active shadow-sm" : "text-secondary"}`}
                        style={tgSubTab === "bot" ? { backgroundColor: "#0088cc", color: "#fff" } : {}}
                        onClick={() => setTgSubTab("bot")}
                      >
                        <FaRobot className="me-1" /> 2. Telegram Bot API (@BotFather)
                      </NavLink>
                    </NavItem>
                  </Nav>

                  {/* SUBTAB 1: OFFICIAL TELEGRAM GATEWAY API */}
                  {tgSubTab === "gateway" && (
                    <div>
                      {/* Explanatory Banner */}
                      <Alert color="info" className="d-flex align-items-start gap-2 mb-3 py-2 px-3 small border-0 shadow-sm">
                        <FaTelegramPlane size={20} className="mt-1 flex-shrink-0 text-primary" />
                        <div>
                          <strong>Official Telegram Gateway Integration (gateway.telegram.org):</strong> Send one-time verification passcodes (OTP) directly to phone numbers without requiring users to open a chat with a bot first.
                          <div className="mt-1">
                            <span className="badge bg-success me-2">Free Self-Testing</span>
                            Sending verification codes to your own account phone number is <strong>100% free</strong>. Funded via Fragment/TON platform.
                            <a
                              href="https://gateway.telegram.org/"
                              target="_blank"
                              rel="noreferrer"
                              className="ms-2 fw-bold text-decoration-none"
                            >
                              Open Gateway Portal <FaExternalLinkAlt size={10} />
                            </a>
                            <a
                              href="https://core.telegram.org/gateway/verification-tutorial"
                              target="_blank"
                              rel="noreferrer"
                              className="ms-2 fw-bold text-decoration-none"
                            >
                              Verification Docs <FaExternalLinkAlt size={10} />
                            </a>
                          </div>
                        </div>
                      </Alert>

                      {/* Gateway API Credentials Form */}
                      <div className="border rounded-2 p-3 bg-white mb-3 shadow-sm">
                        <h6 className="fw-bold small text-dark mb-3">Gateway Authentication &amp; Parameters</h6>
                        <Row className="g-3">
                          <Col md={8}>
                            <FormGroup className="mb-0">
                              <Label className="small fw-semibold text-secondary">
                                Telegram Gateway API Token (Bearer Token) *
                              </Label>
                              <InputGroup>
                                <Input
                                  type={showSecrets.telegramGatewayToken ? "text" : "password"}
                                  placeholder="e.g. AAAA... (Generate at gateway.telegram.org)"
                                  value={formData.telegramGatewayToken || ""}
                                  onChange={(e) => handleInputChange("telegramGatewayToken", e.target.value)}
                                />
                                <Button
                                  type="button"
                                  color="light"
                                  className="border"
                                  onClick={() => toggleSecret("telegramGatewayToken")}
                                >
                                  {showSecrets.telegramGatewayToken ? <FaEyeSlash /> : <FaEye />}
                                </Button>
                              </InputGroup>
                              <small className="text-muted d-block mt-1">
                                Used to authenticate requests with header: <code>Authorization: Bearer &lt;TOKEN&gt;</code>.
                              </small>
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup className="mb-0">
                              <Label className="small fw-semibold text-secondary">
                                Sender Username (Optional)
                              </Label>
                              <Input
                                type="text"
                                placeholder="e.g. @MyChannel or @MyBot"
                                value={formData.telegramGatewaySenderUsername || ""}
                                onChange={(e) => handleInputChange("telegramGatewaySenderUsername", e.target.value)}
                              />
                              <small className="text-muted d-block mt-1">
                                Telegram channel or bot to appear as the sender.
                              </small>
                            </FormGroup>
                          </Col>
                          <Col md={12}>
                            <FormGroup className="mb-0">
                              <Label className="small fw-semibold text-secondary">
                                Delivery Report Webhook Callback URL
                              </Label>
                              <Input
                                type="text"
                                placeholder={`${window.location.origin}/api/v0/telegram/gateway/webhook`}
                                value={formData.telegramGatewayCallbackUrl || `${window.location.origin}/api/v0/telegram/gateway/webhook`}
                                onChange={(e) => handleInputChange("telegramGatewayCallbackUrl", e.target.value)}
                              />
                              <small className="text-muted d-block mt-1">
                                Telegram Gateway will POST delivery receipts and status updates to this endpoint.
                              </small>
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>

                      {/* Interactive Live Testing Suite for Telegram Gateway */}
                      <div className="border rounded-2 p-3 bg-light shadow-sm">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-bold small text-dark mb-0">
                            Live Gateway Testing Suite (Send &amp; Verify Code)
                          </h6>
                          <span className="badge bg-secondary">Official gatewayapi.telegram.org</span>
                        </div>
                        <p className="text-muted small mb-3">
                          Test phone eligibility, send instant verification codes, and validate user OTP response in real-time.
                        </p>

                        <Row className="g-3">
                          <Col md={6}>
                            <Label className="small fw-semibold text-secondary">
                              Destination Phone Number (E.164 format) *
                            </Label>
                            <InputGroup>
                              <Input
                                type="text"
                                placeholder="+919876543210"
                                value={tgGwPhone}
                                onChange={(e) => setTgGwPhone(e.target.value)}
                              />
                              <Button
                                color="outline-primary"
                                disabled={tgGwCheckingAbility || !tgGwPhone}
                                onClick={async () => {
                                  try {
                                    setTgGwCheckingAbility(true);
                                    const res = await apiClient.post("/telegram/gateway/check-ability", {
                                      userId: targetUser?._id || effectiveUserId,
                                      phoneNumber: tgGwPhone,
                                      gatewayToken: formData.telegramGatewayToken,
                                    });
                                    setTgGwAbilityInfo(res?.data?.result || res?.data);
                                    toast.success("Send ability verified!");
                                  } catch (err) {
                                    toast.error(err?.response?.data?.error || err.message);
                                  } finally {
                                    setTgGwCheckingAbility(false);
                                  }
                                }}
                              >
                                {tgGwCheckingAbility ? <Spinner size="sm" /> : <FaCheckCircle className="me-1" />}
                                Check Ability
                              </Button>
                            </InputGroup>

                            {tgGwAbilityInfo && (
                              <div className="p-2 mt-2 rounded bg-white border small">
                                <span className={`badge ${tgGwAbilityInfo.can_send ? "bg-success" : "bg-danger"} me-2`}>
                                  {tgGwAbilityInfo.can_send ? "CAN SEND" : "CANNOT SEND"}
                                </span>
                                Estimated Cost: <strong>${tgGwAbilityInfo.request_cost ?? "0.00"}</strong>
                              </div>
                            )}
                          </Col>

                          <Col md={6}>
                            <Label className="small fw-semibold text-secondary">
                              Custom OTP Code (Leave blank for 6-digit auto-gen)
                            </Label>
                            <InputGroup>
                              <Input
                                type="text"
                                placeholder="e.g. 582910 (or auto)"
                                value={tgGwOtpCode}
                                onChange={(e) => setTgGwOtpCode(e.target.value)}
                              />
                              <Button
                                color="success"
                                className="text-white"
                                disabled={tgGwSendingVerification || !tgGwPhone}
                                onClick={async () => {
                                  try {
                                    setTgGwSendingVerification(true);
                                    const res = await apiClient.post("/telegram/gateway/send-verification", {
                                      userId: targetUser?._id || effectiveUserId,
                                      phoneNumber: tgGwPhone,
                                      code: tgGwOtpCode || undefined,
                                      gatewayToken: formData.telegramGatewayToken,
                                      senderUsername: formData.telegramGatewaySenderUsername,
                                      callbackUrl: formData.telegramGatewayCallbackUrl,
                                    });
                                    const resultData = res?.data?.result || res?.data;
                                    setTgGwVerificationInfo(resultData);
                                    if (resultData?.request_id) {
                                      setTgGwRequestId(resultData.request_id);
                                    }
                                    toast.success(`Verification sent! Request ID: ${resultData?.request_id || "OK"}`);
                                    loadTelegramWallet();
                                  } catch (err) {
                                    toast.error(err?.response?.data?.error || err?.response?.data?.message || err.message);
                                  } finally {
                                    setTgGwSendingVerification(false);
                                  }
                                }}
                              >
                                {tgGwSendingVerification ? <Spinner size="sm" /> : <FaPaperPlane className="me-1" />}
                                Send Verification OTP
                              </Button>
                            </InputGroup>

                            {tgGwVerificationInfo && (
                              <div className="p-2 mt-2 rounded bg-white border small">
                                <div><strong>Request ID:</strong> <code>{tgGwVerificationInfo.request_id}</code></div>
                                <div><strong>Delivery Status:</strong> <Badge color="info">{tgGwVerificationInfo.delivery_status?.status || "sent"}</Badge></div>
                                <div><strong>Cost:</strong> ${tgGwVerificationInfo.request_cost ?? 0} | <strong>Remaining Balance:</strong> ${tgGwVerificationInfo.remaining_balance ?? "N/A"}</div>
                              </div>
                            )}
                          </Col>

                          {/* Step 3: Verify OTP Code */}
                          <Col md={12} className="pt-2 border-top">
                            <h6 className="fw-semibold small text-dark mb-2">Check Verification Status / Validate User Code</h6>
                            <Row className="g-2">
                              <Col md={5}>
                                <Input
                                  type="text"
                                  placeholder="Request ID (from above dispatch)"
                                  value={tgGwRequestId}
                                  onChange={(e) => setTgGwRequestId(e.target.value)}
                                />
                              </Col>
                              <Col md={4}>
                                <Input
                                  type="text"
                                  placeholder="Enter user-entered code to verify"
                                  value={tgGwVerifyCode}
                                  onChange={(e) => setTgGwVerifyCode(e.target.value)}
                                />
                              </Col>
                              <Col md={3} className="d-flex gap-1">
                                <Button
                                  color="primary"
                                  className="w-100"
                                  disabled={tgGwCheckingStatus || !tgGwRequestId}
                                  onClick={async () => {
                                    try {
                                      setTgGwCheckingStatus(true);
                                      const res = await apiClient.post("/telegram/gateway/check-status", {
                                        userId: targetUser?._id || effectiveUserId,
                                        requestId: tgGwRequestId,
                                        code: tgGwVerifyCode || undefined,
                                        gatewayToken: formData.telegramGatewayToken,
                                      });
                                      setTgGwStatusInfo(res?.data?.result || res?.data);
                                      toast.success("Status checked successfully!");
                                    } catch (err) {
                                      toast.error(err?.response?.data?.error || err.message);
                                    } finally {
                                      setTgGwCheckingStatus(false);
                                    }
                                  }}
                                >
                                  {tgGwCheckingStatus ? <Spinner size="sm" /> : <FaCheck className="me-1" />} Verify
                                </Button>
                                <Button
                                  color="outline-danger"
                                  size="sm"
                                  disabled={tgGwRevoking || !tgGwRequestId}
                                  onClick={async () => {
                                    try {
                                      setTgGwRevoking(true);
                                      await apiClient.post("/telegram/gateway/revoke", {
                                        userId: targetUser?._id || effectiveUserId,
                                        requestId: tgGwRequestId,
                                        gatewayToken: formData.telegramGatewayToken,
                                      });
                                      toast.success("Verification revoked successfully!");
                                    } catch (err) {
                                      toast.error(err?.response?.data?.error || err.message);
                                    } finally {
                                      setTgGwRevoking(false);
                                    }
                                  }}
                                  title="Revoke active verification"
                                >
                                  {tgGwRevoking ? <Spinner size="sm" /> : <FaTimes />}
                                </Button>
                              </Col>
                            </Row>

                            {tgGwStatusInfo && (
                              <div className="p-2 mt-2 rounded bg-white border small">
                                <span className={`badge ${tgGwStatusInfo.verification_status?.status === "code_valid" ? "bg-success" : "bg-warning"} me-2`}>
                                  {tgGwStatusInfo.verification_status?.status || "PENDING"}
                                </span>
                                Delivery Status: <strong>{tgGwStatusInfo.status?.status || "sent"}</strong>
                              </div>
                            )}
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: TELEGRAM BOT API (@BotFather) */}
                  {tgSubTab === "bot" && (
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge" style={{ backgroundColor: "#0088cc" }}>
                          <FaTelegramPlane className="me-1" /> Telegram Bot API
                        </span>
                        <h6 className="fw-bold text-dark mb-0">Telegram Enterprise Bot Integration</h6>
                      </div>
                      <p className="text-muted small mb-3">
                        Connect your @BotFather token to enable OTP verification, marketing broadcasts, utility alerts, and automated AI webhook processors.
                      </p>

                      <Row className="g-3 mb-4">
                        <Col md={8}>
                          <FormGroup className="mb-0">
                            <Label className="small fw-semibold text-secondary">
                              Telegram Bot Token (from @BotFather) *
                            </Label>
                            <InputGroup>
                              <Input
                                type={showSecrets.telegramBotToken ? "text" : "password"}
                                placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789"
                                value={formData.telegramBotToken || ""}
                                onChange={(e) => handleInputChange("telegramBotToken", e.target.value)}
                              />
                              <Button
                                type="button"
                                color="light"
                                className="border"
                                onClick={() => toggleSecret("telegramBotToken")}
                              >
                                {showSecrets.telegramBotToken ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                              <Button
                                type="button"
                                color="primary"
                                disabled={tgValidating || !formData.telegramBotToken}
                                onClick={async () => {
                                  try {
                                    setTgValidating(true);
                                    const res = await apiClient.post("/telegram/onboard-client", {
                                      botToken: formData.telegramBotToken,
                                      userId: targetUser?._id || effectiveUserId,
                                    });
                                    if (res.data?.success) {
                                      setTgBotDetails(res.data.channelDetails);
                                      toast.success(res.data.message || "Telegram Bot verified & webhook registered!");
                                      loadTelegramWallet();
                                    } else {
                                      toast.error(res.data?.error || "Validation failed");
                                    }
                                  } catch (err) {
                                    toast.error(err?.response?.data?.error || err.message);
                                  } finally {
                                    setTgValidating(false);
                                  }
                                }}
                                style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}
                              >
                                {tgValidating ? <Spinner size="sm" /> : <FaCheck className="me-1" />}
                                Validate &amp; Bind Bot
                              </Button>
                            </InputGroup>
                            <small className="text-muted d-block mt-1">
                              Creates secure webhook binding and awards +50 complimentary service credits on initial onboarding.
                            </small>
                          </FormGroup>
                        </Col>

                        <Col md={4}>
                          <div className="border rounded-2 p-3 bg-light h-100 d-flex flex-column justify-content-center">
                            <div className="d-flex align-items-center justify-content-between mb-1">
                              <span className="small text-muted fw-semibold">Bot Status</span>
                              <Badge color={tgBotDetails || formData.telegramBotToken ? "success" : "secondary"} pill>
                                {tgBotDetails || formData.telegramBotToken ? "ACTIVE / BOUND" : "PENDING"}
                              </Badge>
                            </div>
                            {tgBotDetails && (
                              <div className="small text-dark mt-1">
                                <div><strong>Name:</strong> {tgBotDetails.bot_name}</div>
                                <div><strong>Username:</strong> @{tgBotDetails.username}</div>
                                <div><strong>Bot ID:</strong> {tgBotDetails.bot_id}</div>
                              </div>
                            )}
                          </div>
                        </Col>
                      </Row>

                      {/* Webhook Endpoint Info */}
                      <div className="border rounded-2 p-3 bg-white mb-4 shadow-sm">
                        <h6 className="fw-bold small text-dark mb-1">Incoming Updates Webhook Endpoint</h6>
                        <p className="text-muted small mb-2">
                          Telegram updates (messages, callbacks) are securely funnelled to:
                        </p>
                        <code className="p-2 bg-light rounded d-block text-primary small">
                          {window.location.origin}/api/v0/telegram/bot/webhook
                        </code>
                      </div>

                      {/* Quick Test Message Dispatcher */}
                      <div className="border rounded-2 p-3 bg-light">
                        <h6 className="fw-bold small text-dark mb-2">Quick Delivery Test (Chat ID)</h6>
                        <Row className="g-2 align-items-center">
                          <Col md={6}>
                            <Input
                              type="text"
                              placeholder="Enter destination Chat ID (e.g. 1207697252)"
                              value={tgTestChatId}
                              onChange={(e) => setTgTestChatId(e.target.value)}
                            />
                          </Col>
                          <Col md={3}>
                            <Button
                              type="button"
                              color="info"
                              className="w-100 text-white"
                              disabled={tgTesting || !tgTestChatId || !formData.telegramBotToken}
                              onClick={async () => {
                                try {
                                  setTgTesting(true);
                                  const res = await apiClient.post("/telegram/messages/utility", {
                                    userId: targetUser?._id || effectiveUserId,
                                    chatId: tgTestChatId,
                                    botToken: formData.telegramBotToken,
                                    text: "BeyondSend CPaaS Test: Telegram integration is live and operational!",
                                  });
                                  if (res.data?.success) {
                                    toast.success(`Test sent! Message ID: ${res.data.messageId}`);
                                    loadTelegramWallet();
                                  } else {
                                    toast.error(res.data?.error || "Send failed");
                                  }
                                } catch (e) {
                                  toast.error(e?.data?.message || e?.data?.error || e?.response?.data?.error || e.message);
                                } finally {
                                  setTgTesting(false);
                                }
                              }}
                            >
                              {tgTesting ? <Spinner size="sm" /> : <FaPaperPlane className="me-1" />}
                              Send Test Alert
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </div>
                  )}
                </div>
              </TabPane>
            </TabContent>
          </CardBody>

          {/* Sticky Pro Action Toolbar */}
          <CardFooter className="bg-light py-3 px-4 border-top d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Configuring for:</span>
              <strong className="text-dark small">{displayName}</strong>
              <Badge color={displayRole === "RESELLER" ? "info" : "primary"} pill>
                {displayRole}
              </Badge>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Button
                type="submit"
                color="primary"
                disabled={saving}
                className="px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              >
                {saving ? <Spinner size="sm" /> : <FaSave />} Save Configuration
              </Button>
            </div>
          </CardFooter>
        </Form>
      </Card>

      {/* Switch Client / Reseller Modal */}
      <Modal isOpen={switchModal} toggle={() => setSwitchModal(false)} size="lg" centered>
        <ModalHeader toggle={() => setSwitchModal(false)} className="py-2.5 px-3">
          <div className="d-flex align-items-center gap-2 fw-bold text-dark">
            <FaExchangeAlt className="text-primary" /> Select Client or Reseller Account
          </div>
        </ModalHeader>
        <ModalBody className="p-3">
          <InputGroup size="sm" className="mb-3">
            <InputGroupText className="bg-light">
              <FaSearch className="text-muted" />
            </InputGroupText>
            <Input
              type="text"
              placeholder="Search user by name, email, or mobile..."
              value={switchSearch}
              onChange={(e) => setSwitchSearch(e.target.value)}
              autoFocus
            />
            {switchSearch && (
              <Button color="light" className="border" onClick={() => setSwitchSearch("")}>
                <FaTimes size={12} />
              </Button>
            )}
          </InputGroup>

          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            <Table hover size="sm" className="align-middle mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="py-2 px-2.5">User</th>
                  <th className="py-2 px-2.5">Role</th>
                  <th className="py-2 px-2.5 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {quickSwitchFiltered.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted small">
                      No accounts found matching &quot;{switchSearch}&quot;
                    </td>
                  </tr>
                ) : (
                  quickSwitchFiltered.map((u) => {
                    const uName = u.name || u.fullName || "User";
                    const isSelected = String(u._id) === String(targetUser?._id);
                    return (
                      <tr
                        key={u._id}
                        className={isSelected ? "table-primary" : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectUser(u)}
                      >
                        <td className="py-2 px-2.5">
                          <div className="fw-semibold text-dark">{uName}</div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            {u.email} {u.mobile && `• ${u.mobile}`}
                          </div>
                        </td>
                        <td className="py-2 px-2.5">
                          <Badge color={u.role === "RESELLER" ? "info" : "primary"} pill>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-2 px-2.5 text-end">
                          <Button
                            color={isSelected ? "success" : "primary"}
                            size="sm"
                            className="py-0.5 px-2.5 small fw-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectUser(u);
                            }}
                          >
                            {isSelected ? "Current" : "Select"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </ModalBody>
        <ModalFooter className="py-2 px-3 bg-light">
          <Button color="light" size="sm" onClick={() => setSwitchModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* CONNECT / EDIT WHATSAPP NUMBER MODAL */}
      <Modal isOpen={numberModalOpen} toggle={() => setNumberModalOpen(false)} centered size="md">
        <ModalHeader toggle={() => setNumberModalOpen(false)} className="py-2.5 px-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="p-1.5 rounded bg-success bg-opacity-10 text-success">
              <FaComments size={16} />
            </span>
            <span className="fw-bold text-white">
              {editingNumberIdx !== null ? "Edit WhatsApp Phone Number" : "Connect New WhatsApp Phone Number"}
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="p-3">
          <Row className="g-3">
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">Phone Number (with Country Code)</Label>
                <Input
                  placeholder="e.g. +91 98765 43210"
                  value={numberFormData.phoneNumber}
                  onChange={(e) => setNumberFormData({ ...numberFormData, phoneNumber: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">Verified Display Name</Label>
                <Input
                  placeholder="e.g. BeyondSend Support"
                  value={numberFormData.displayName}
                  onChange={(e) => setNumberFormData({ ...numberFormData, displayName: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">Meta Phone Number ID</Label>
                <Input
                  placeholder="e.g. 109284719283741"
                  value={numberFormData.phoneNumberId}
                  onChange={(e) => setNumberFormData({ ...numberFormData, phoneNumberId: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">WABA Account ID</Label>
                <Input
                  placeholder="e.g. 293847192837461"
                  value={numberFormData.wabaId}
                  onChange={(e) => setNumberFormData({ ...numberFormData, wabaId: e.target.value })}
                />
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">Quality Rating</Label>
                <Input
                  type="select"
                  value={numberFormData.qualityRating}
                  onChange={(e) => setNumberFormData({ ...numberFormData, qualityRating: e.target.value })}
                >
                  <option value="GREEN">🟢 High Quality (Green)</option>
                  <option value="YELLOW">🟡 Medium Quality (Yellow)</option>
                  <option value="RED">🔴 Low Quality (Red)</option>
                </Input>
              </FormGroup>
            </Col>
            <Col sm={6}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold text-secondary">Messaging Limit Tier</Label>
                <Input
                  type="select"
                  value={numberFormData.messagingLimitTier}
                  onChange={(e) => setNumberFormData({ ...numberFormData, messagingLimitTier: e.target.value })}
                >
                  <option value="TIER_1K">Tier 1K (1,000 chats/24h)</option>
                  <option value="TIER_10K">Tier 10K (10,000 chats/24h)</option>
                  <option value="TIER_100K">Tier 100K (100,000 chats/24h)</option>
                  <option value="UNLIMITED">Tier Unlimited</option>
                </Input>
              </FormGroup>
            </Col>
            <Col xs={12}>
              <FormGroup check className="mt-1">
                <Input
                  type="checkbox"
                  id="defaultSenderCheck"
                  checked={numberFormData.isDefault}
                  onChange={(e) => setNumberFormData({ ...numberFormData, isDefault: e.target.checked })}
                />
                <Label check for="defaultSenderCheck" className="small fw-semibold text-dark">
                  Mark as Default Sender for Outbound Campaigns
                </Label>
              </FormGroup>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter className="py-2 px-3 bg-light border-top">
          <Button color="light" size="sm" onClick={() => setNumberModalOpen(false)}>
            Cancel
          </Button>
          <Button color="success" size="sm" className="fw-semibold px-3" onClick={handleSaveNumber}>
            {editingNumberIdx !== null ? "Update Number" : "Add Number"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* DYNAMIC PROVIDER DETAILS MODAL (FROM MONGO LIVE CONFIG) */}
      <Modal isOpen={detailsModalOpen} toggle={() => setDetailsModalOpen(false)} size="lg" centered>
        <ModalHeader toggle={() => setDetailsModalOpen(false)} className="bg-light border-bottom">
          <div className="d-flex align-items-center gap-2">
            <Badge color="primary" pill className="text-uppercase px-2.5 py-1">
              {activeDetailsProvider?.channel || "WHATSAPP"}
            </Badge>
            <span className="fw-bold text-dark">
              {activeDetailsProvider?.provider?.toUpperCase() === "ROUTEMOBILE" ? "Route Mobile WhatsApp WBS" : (activeDetailsProvider?.provider?.toUpperCase() || "CARRIER")} Live Configuration Details
            </span>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          {activeDetailsProvider && (
            <div>
              {/* CARRIER STATUS & OVERVIEW */}
              <div className="p-3 bg-light rounded-3 border mb-3">
                <Row className="g-3 align-items-center">
                  <Col sm={6}>
                    <div className="small text-muted mb-0.5">Carrier Gateway Connection</div>
                    <Badge color="success" pill className="px-2.5 py-1 fw-bold">
                      <FaCheckCircle className="me-1" />
                      {activeDetailsProvider.config?.status || "ACTIVE"}
                    </Badge>
                    {activeDetailsProvider.config?.isPrimary && (
                      <Badge color="info" pill className="ms-2 px-2.5 py-1 fw-bold">
                        ★ Primary Vendor
                      </Badge>
                    )}
                  </Col>
                  <Col sm={6} className="text-sm-end">
                    <div className="small text-muted mb-0.5">Base Gateway URL</div>
                    <code className="text-primary fw-bold" style={{ fontSize: "12px" }}>
                      {activeDetailsProvider.baseUrl || "https://apis.rmlconnect.net"}
                    </code>
                  </Col>
                </Row>
              </div>

              {/* LIVE ACCOUNT USER INFORMATION */}
              {activeDetailsProvider.userData ? (
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2 pb-1 border-bottom d-flex align-items-center gap-1.5">
                    <FaUserTag className="text-primary" /> Live Carrier Account User Information (from Route Mobile DB)
                  </h6>
                  <div className="table-responsive">
                    <Table size="sm" bordered hover className="mb-0 font-monospace small">
                      <tbody>
                        <tr>
                          <td className="fw-semibold text-muted bg-light" style={{ width: "220px" }}>Account Full Name</td>
                          <td className="fw-bold text-dark">
                            {activeDetailsProvider.userData.first_name} {activeDetailsProvider.userData.last_name !== "-" ? activeDetailsProvider.userData.last_name : ""}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted bg-light">WBS Username / User ID</td>
                          <td className="text-dark fw-bold">{activeDetailsProvider.userData.username || "digiglitzwbs"}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted bg-light">Registered Email</td>
                          <td className="text-dark">{activeDetailsProvider.userData.email || "shainesh@digiglitz.com"}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted bg-light">Primary Phone Number</td>
                          <td className="text-dark">{activeDetailsProvider.userData.phone_number || "+919036880158"}</td>
                        </tr>
                        {Array.isArray(activeDetailsProvider.userData.additional_phone_numbers) && activeDetailsProvider.userData.additional_phone_numbers.length > 0 && (
                          <tr>
                            <td className="fw-semibold text-muted bg-light">Additional MSISDNs</td>
                            <td className="text-dark">{activeDetailsProvider.userData.additional_phone_numbers.join(", ")}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="fw-semibold text-muted bg-light">Customer ID</td>
                          <td className="text-dark">{activeDetailsProvider.userData.customer_id || "HdQ4I2GU3QQn"}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted bg-light">Partner Role</td>
                          <td className="text-dark">
                            {activeDetailsProvider.userData.is_reseller ? (
                              <Badge color="info" pill>Reseller Partner</Badge>
                            ) : (
                              <Badge color="secondary" pill>Standard Client</Badge>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="fw-semibold text-muted bg-light">Authentication IP / Level</td>
                          <td className="text-dark">{activeDetailsProvider.userData.ip || "1stepauth"}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-light rounded text-muted small">
                  Live user data will automatically sync upon next gateway connection.
                </div>
              )}

              {/* SENDER IDENTITY & WABA DETAILS */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-2 pb-1 border-bottom d-flex align-items-center gap-1.5">
                  <FaComments className="text-success" /> Registered Brand Senders &amp; Identities
                </h6>
                {activeDetailsProvider.senderInfo && activeDetailsProvider.senderInfo.length > 0 ? (
                  <div className="table-responsive">
                    <Table size="sm" bordered hover className="mb-0 font-monospace small">
                      <thead className="table-light">
                        <tr>
                          <th>Sender MSISDN</th>
                          <th>Display Name</th>
                          <th>WABA ID</th>
                          <th>Quality</th>
                          <th>Tier</th>
                          <th>Status</th>
                          <th>Default</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeDetailsProvider.senderInfo.map((s, sIdx) => (
                          <tr key={sIdx}>
                            <td className="fw-bold text-success">{s.phoneNumber || formData.whatsappBrandMsisdn}</td>
                            <td>{s.displayName || "BeyondSend Enterprise"}</td>
                            <td>{s.wabaId || "892158596877894"}</td>
                            <td>
                              <Badge color="success" pill>{s.qualityRating || "GREEN"}</Badge>
                            </td>
                            <td><Badge color="primary" pill>{s.messagingLimitTier || "TIER_1K"}</Badge></td>
                            <td>
                              <Badge color="success" pill>
                                {s.status || "CONNECTED"}
                              </Badge>
                            </td>
                            <td>{s.isDefault ? "✓ DEFAULT" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded text-muted small">
                    Registered MSISDN: <strong>{formData.whatsappBrandMsisdn || "9977679866"}</strong> | WABA ID: <strong>{formData.wabaId || "892158596877894"}</strong>
                  </div>
                )}
              </div>

              {/* DYNAMIC API CATALOG ENDPOINTS */}
              <div className="mb-2">
                <h6 className="fw-bold text-dark mb-2 pb-1 border-bottom d-flex align-items-center gap-1.5">
                  <FaServer className="text-info" /> Dynamic Gateway API Catalog (Registered Endpoints)
                </h6>
                <div className="table-responsive">
                  <Table size="sm" bordered hover className="mb-0 font-monospace" style={{ fontSize: "11.5px" }}>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "80px" }}>Method</th>
                        <th>Operation</th>
                        <th>Service Base URL</th>
                        <th>Endpoint Path</th>
                        <th>Auth Scheme</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Badge color="primary">POST</Badge></td>
                        <td>AUTH_LOGIN</td>
                        <td>https://apis.rmlconnect.net/auth/v1</td>
                        <td><code>/login/</code></td>
                        <td>Credentials (Username/Password)</td>
                      </tr>
                      <tr>
                        <td><Badge color="success">GET</Badge></td>
                        <td>GET_TEMPLATES</td>
                        <td>https://apis.rmlconnect.net/wba</td>
                        <td><code>/templates</code></td>
                        <td>Bearer (JWTAUTH Token)</td>
                      </tr>
                      <tr>
                        <td><Badge color="primary">POST</Badge></td>
                        <td>CREATE_TEMPLATE</td>
                        <td>https://apis.rmlconnect.net/wba</td>
                        <td><code>/template/create</code></td>
                        <td>Bearer (JWTAUTH Token)</td>
                      </tr>
                      <tr>
                        <td><Badge color="danger">DELETE</Badge></td>
                        <td>DELETE_TEMPLATE</td>
                        <td>https://apis.rmlconnect.net/wba</td>
                        <td><code>/template/</code></td>
                        <td>Bearer (JWTAUTH Token)</td>
                      </tr>
                      <tr>
                        <td><Badge color="primary">POST</Badge></td>
                        <td>SEND_MESSAGE</td>
                        <td>https://apis.rmlconnect.net/wba/v1</td>
                        <td><code>/messages</code></td>
                        <td>Bearer (JWTAUTH Token)</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="bg-light border-top d-flex justify-content-between">
          <Button
            color="secondary"
            outline
            size="sm"
            onClick={() => setDetailsModalOpen(false)}
          >
            Close
          </Button>
          <Button
            color="primary"
            size="sm"
            className="fw-bold"
            onClick={() => {
              setDetailsModalOpen(false);
              handleSyncProviderTemplates();
            }}
          >
            <FaBroadcastTower className="me-1" /> Sync Templates Now
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default UserCommunicationConfig;
