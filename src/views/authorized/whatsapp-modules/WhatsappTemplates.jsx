import { useState, useEffect, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner,
  Alert
} from "reactstrap";
import {
  FaWhatsapp, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCheckDouble, FaMobileAlt, FaSyncAlt, FaServer,
  FaExternalLinkAlt, FaPhone, FaCopy, FaReply, FaImage,
  FaVideo, FaFileAlt, FaInfoCircle, FaSave, FaPaperPlane,
  FaLanguage, FaShieldAlt, FaBolt, FaTimes, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaCheck, FaUndo, FaCalendarAlt
} from "react-icons/fa";
import apiClient, { getApiResponseData } from "@apiService";
import { useToast, ToastContainer, wpSwal, Swal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

/* ─────────────────────────────────────────────────────────────
 * 60+ Meta Cloud & WABA Official Supported Languages (wa req.pdf)
 * ───────────────────────────────────────────────────────────── */
export const META_WHATSAPP_LANGUAGES = [
  // Primary Indian & Common CPaaS Languages
  { code: "en_US", name: "English (US)", native: "English (US)" },
  { code: "en_GB", name: "English (UK)", native: "English (UK)" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "Urdu", native: "اردو" },
  // Global Meta WhatsApp Languages
  { code: "ar", name: "Arabic", native: "العربية" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "es_ES", name: "Spanish (Spain)", native: "Español (España)" },
  { code: "es_MX", name: "Spanish (Mexico)", native: "Español (México)" },
  { code: "es_AR", name: "Spanish (Argentina)", native: "Español (Argentina)" },
  { code: "pt_BR", name: "Portuguese (Brazil)", native: "Português (Brasil)" },
  { code: "pt_PT", name: "Portuguese (Portugal)", native: "Português (Portugal)" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "it", name: "Italian", native: "Italiano" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "ru", name: "Russian", native: "Русский" },
  { code: "tr", name: "Turkish", native: "Türkçe" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "zh_CN", name: "Chinese (Simplified)", native: "简体中文" },
  { code: "zh_TW", name: "Chinese (Traditional)", native: "繁體中文" },
  { code: "af", name: "Afrikaans", native: "Afrikaans" },
  { code: "sq", name: "Albanian", native: "Shqip" },
  { code: "az", name: "Azerbaijani", native: "Azərbaycan" },
  { code: "bg", name: "Bulgarian", native: "Български" },
  { code: "ca", name: "Catalan", native: "Català" },
  { code: "hr", name: "Croatian", native: "Hrvatski" },
  { code: "cs", name: "Czech", native: "Čeština" },
  { code: "da", name: "Danish", native: "Dansk" },
  { code: "nl", name: "Dutch", native: "Nederlands" },
  { code: "et", name: "Estonian", native: "Eesti" },
  { code: "fil", name: "Filipino", native: "Filipino" },
  { code: "fi", name: "Finnish", native: "Suomi" },
  { code: "el", name: "Greek", native: "Ελληνικά" },
  { code: "he", name: "Hebrew", native: "עבריت" },
  { code: "hu", name: "Hungarian", native: "Magyar" },
  { code: "ga", name: "Irish", native: "Gaeilge" },
  { code: "kk", name: "Kazakh", native: "Қазақ тілі" },
  { code: "lo", name: "Lao", native: "ລາວ" },
  { code: "lv", name: "Latvian", native: "Latviešu" },
  { code: "lt", name: "Lithuanian", native: "Lietuvių" },
  { code: "mk", name: "Macedonian", native: "Македонски" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "nb", name: "Norwegian", native: "Norsk bokmål" },
  { code: "fa", name: "Persian", native: "فارسی" },
  { code: "pl", name: "Polish", native: "Polski" },
  { code: "ro", name: "Romanian", native: "Română" },
  { code: "sr", name: "Serbian", native: "Српски" },
  { code: "sk", name: "Slovak", native: "Slovenčina" },
  { code: "sl", name: "Slovenian", native: "Slovenščina" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "sv", name: "Swedish", native: "Svenska" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "uk", name: "Ukrainian", native: "Українська" },
  { code: "uz", name: "Uzbek", native: "Oʻzbekcha" },
  { code: "zu", name: "Zulu", native: "isiZulu" }
];

const DRAFT_STORAGE_KEY = "beyondsend_wa_template_draft";

/* ── Status Badge Renderer ── */
const renderStatusBadge = (status) => {
  const s = String(status || "APPROVED").toUpperCase();
  if (s === "APPROVED" || s === "ACTIVE") {
    return (
      <span className="badge rounded-pill bg-success text-white fw-bold px-2.5 py-1 text-uppercase text-nowrap d-inline-flex align-items-center gap-1" style={{ fontSize: "10.5px", letterSpacing: "0.3px" }}>
        <FaCheckCircle size={10} /> APPROVED
      </span>
    );
  }
  if (s === "REJECTED" || s === "FAILED") {
    return (
      <span className="badge rounded-pill bg-danger text-white fw-bold px-2.5 py-1 text-uppercase text-nowrap d-inline-flex align-items-center gap-1" style={{ fontSize: "10.5px", letterSpacing: "0.3px" }}>
        <FaTimes size={10} /> REJECTED
      </span>
    );
  }
  if (s === "PENDING" || s === "PENDING_APPROVAL" || s === "SUBMITTED" || s === "UNDER_REVIEW") {
    return (
      <span className="badge rounded-pill bg-warning text-dark fw-bold px-2.5 py-1 text-uppercase text-nowrap d-inline-flex align-items-center gap-1" style={{ fontSize: "10.5px", letterSpacing: "0.3px" }}>
        <FaClock size={10} /> PENDING
      </span>
    );
  }
  if (s === "DRAFT") {
    return (
      <span className="badge rounded-pill bg-secondary text-white fw-bold px-2.5 py-1 text-uppercase text-nowrap d-inline-flex align-items-center gap-1" style={{ fontSize: "10.5px", letterSpacing: "0.3px" }}>
        <FaSave size={10} /> DRAFT
      </span>
    );
  }
  return (
    <span className="badge rounded-pill bg-secondary text-white fw-bold px-2.5 py-1 text-uppercase text-nowrap" style={{ fontSize: "10.5px" }}>
      {s}
    </span>
  );
};

/* ── WhatsApp Text Formatter (*bold*, _italic_, ~strike~) ── */
const renderFormattedText = (rawText = "") => {
  if (!rawText) return "";
  let formatted = rawText
    .replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    .replace(/_([^_]+)_/g, "<em>$1</em>")
    .replace(/~([^~]+)~/g, "<del>$1</del>")
    .replace(/```([^`]+)```/g, "<code class='bg-light px-1 rounded text-dark'>$1</code>");
  return formatted;
};

/* ── Date/Time Formatter for Table Displays ── */
const formatTableDateTime = (val) => {
  if (!val) return { date: "—", time: "" };
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return { date: "—", time: "" };
    const date = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date, time };
  } catch {
    return { date: "—", time: "" };
  }
};

const WhatsappTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [primaryProvider, setPrimaryProvider] = useState("");
  const [primaryConfigId, setPrimaryConfigId] = useState("");
  const [primaryConfigName, setPrimaryConfigName] = useState("");

  // Backend Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Language quick search in modal
  const [langSearch, setLangSearch] = useState("");

  // Form State
  const initialForm = {
    name: "",
    category: "MARKETING",
    channelCategoryCode: "WA_MARKETING",
    language: "en_US",
    provider: "",
    wabaTemplateId: "",
    headerType: "NONE",
    headerContent: "",
    mediaUrl: "",
    body: "Hi {{1}}, welcome to BeyondSend! Your order {{2}} has been confirmed and is on its way.",
    footer: "BeyondSend Telecom • Reply STOP to unsubscribe",
    buttons: [
      { type: "URL", text: "Track Order", value: "https://beyondsend.in/orders" },
      { type: "QUICK_REPLY", text: "Need Help?", value: "SUPPORT_HELP" }
    ],
    status: "APPROVED"
  };

  const [form, setForm] = useState(initialForm);

  // Dynamic Variable Sample Tester Map (e.g. { "1": "Rahul Sharma", "2": "BS-94821" })
  const [sampleVariables, setSampleVariables] = useState({
    "1": "Rahul Sharma",
    "2": "#BS-94821",
    "3": "₹1,499"
  });

  // Track if a local auto-saved draft exists
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Fetch templates from backend with server-side pagination & filtering
  const fetchTemplates = async (newPage = page, newLimit = limit, overrideFilters = {}) => {
    try {
      setLoading(true);
      const activeSearch = overrideFilters.search !== undefined ? overrideFilters.search : search;
      const activeCat = overrideFilters.filterCat !== undefined ? overrideFilters.filterCat : filterCat;
      const activeStatus = overrideFilters.filterStatus !== undefined ? overrideFilters.filterStatus : filterStatus;
      const activeFrom = overrideFilters.fromDate !== undefined ? overrideFilters.fromDate : fromDate;
      const activeTo = overrideFilters.toDate !== undefined ? overrideFilters.toDate : toDate;

      const params = {
        page: newPage,
        limit: newLimit,
      };
      if (activeSearch && activeSearch.trim()) params.search = activeSearch.trim();
      if (activeCat && activeCat !== "ALL") params.category = activeCat;
      if (activeStatus && activeStatus !== "ALL") params.status = activeStatus;
      if (activeFrom) params.fromDate = activeFrom;
      if (activeTo) params.toDate = activeTo;

      const res = await apiClient.get("/whatsapp/templates/list", { params });
      const responseBody = res?.success !== undefined
        ? res
        : res?.data?.success !== undefined
        ? res.data
        : res;
      const responseData = getApiResponseData(res);
      const list = Array.isArray(responseData) ? responseData : [];

      const cats = responseBody?.availableCategories || [];
      const primaryProv = responseBody?.primaryProvider || "";
      const primaryCfgId = responseBody?.primaryConfigId || "";
      const primaryCfgName = responseBody?.primaryConfigName || "";
      const pagination = responseBody?.pagination;
      const total = res?.total ?? (pagination?.total ?? (Array.isArray(list) ? list.length : 0));
      const tPages = pagination?.totalPages ?? Math.max(1, Math.ceil(total / newLimit));

      setTemplates(Array.isArray(list) ? list : []);
      setTotalCount(total);
      setTotalPages(tPages || 1);
      setPage(newPage);
      if (cats.length > 0) setCategories(cats);
      if (primaryProv) setPrimaryProvider(primaryProv);
      if (primaryCfgId) setPrimaryConfigId(primaryCfgId);
      if (primaryCfgName) setPrimaryConfigName(primaryCfgName);
    } catch (err) {
      console.error("Fetch WhatsApp templates error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load WhatsApp templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check local draft
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) setHasSavedDraft(true);
    } catch {
      // ignore
    }
  }, []);

  // Debounced fetch on filter/search change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates(1, limit);
    }, 350);
    return () => clearTimeout(timer);
  }, [search, filterCat, filterStatus, fromDate, toDate]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    fetchTemplates(newPage, limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    fetchTemplates(1, newLimit);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilterCat("ALL");
    setFilterStatus("ALL");
    setFromDate("");
    setToDate("");
    fetchTemplates(1, limit, {
      search: "",
      filterCat: "ALL",
      filterStatus: "ALL",
      fromDate: "",
      toDate: ""
    });
  };

  // Detect placeholders {{1}}, {{2}} in body and header
  const detectedVariables = useMemo(() => {
    const textToScan = `${form.headerContent || ""} ${form.body || ""}`;
    const matches = textToScan.match(/\{\{(\d+)\}\}/g) || [];
    const uniqueNums = Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, "")))).sort(
      (a, b) => Number(a) - Number(b)
    );
    return uniqueNums;
  }, [form.body, form.headerContent]);

  // Sync sampleVariables keys whenever new variables appear in text
  useEffect(() => {
    setSampleVariables((prev) => {
      const updated = { ...prev };
      detectedVariables.forEach((num) => {
        if (!updated[num]) {
          updated[num] = num === "1" ? "Customer" : num === "2" ? "#10029" : `Value ${num}`;
        }
      });
      return updated;
    });
  }, [detectedVariables]);

  // Real-time preview text with variables replaced
  const renderedBodyText = useMemo(() => {
    let replaced = form.body || "";
    detectedVariables.forEach((num) => {
      const regex = new RegExp(`\\{\\{${num}\\}\\}`, "g");
      const sampleVal = sampleVariables[num] || `{{${num}}}`;
      replaced = replaced.replace(regex, sampleVal);
    });
    return replaced;
  }, [form.body, detectedVariables, sampleVariables]);

  const renderedHeaderText = useMemo(() => {
    let replaced = form.headerContent || "";
    detectedVariables.forEach((num) => {
      const regex = new RegExp(`\\{\\{${num}\\}\\}`, "g");
      const sampleVal = sampleVariables[num] || `{{${num}}}`;
      replaced = replaced.replace(regex, sampleVal);
    });
    return replaced;
  }, [form.headerContent, detectedVariables, sampleVariables]);

  // Meta Compliance Validations (wa req.pdf guidelines)
  const metaCompliance = useMemo(() => {
    const checks = [];
    const nameValid = /^[a-z0-9_]+$/.test(form.name) && form.name.length >= 2;
    checks.push({
      label: "Name Format (lowercase alphanumeric & underscores)",
      valid: nameValid,
      critical: true,
      message: nameValid ? "Identifier matches Meta format" : "Must be lowercase letters, numbers & underscores only"
    });

    const bodyValid = form.body.trim().length > 0 && form.body.length <= 1024;
    checks.push({
      label: "Body Length (1 – 1024 chars)",
      valid: bodyValid,
      critical: true,
      message: `${form.body.length}/1024 characters`
    });

    // Check consecutive variables e.g. {{1}}{{2}}
    const hasConsecutiveVars = /\{\{\d+\}\}\s*\{\{\d+\}\}/.test(form.body);
    checks.push({
      label: "Variable Spacing (No consecutive variables)",
      valid: !hasConsecutiveVars,
      critical: true,
      message: hasConsecutiveVars
        ? "Meta rejects {{1}}{{2}} without text in between"
        : "Dynamic placeholders properly formatted"
    });

    // Marketing opt-out check
    if (form.category === "MARKETING") {
      const optOutInFooter = /(stop|unsubscribe|opt-out|optout)/i.test(form.footer || "");
      const optOutInBtn = form.buttons.some((b) => /(stop|unsubscribe)/i.test(b.text || b.value || ""));
      const hasOptOut = optOutInFooter || optOutInBtn;
      checks.push({
        label: "Marketing Opt-Out Option (Meta Requirement)",
        valid: hasOptOut,
        critical: false,
        message: hasOptOut
          ? "Opt-out keyword included (STOP/Unsubscribe)"
          : "Recommended: Add opt-out disclaimer or button for Meta Marketing compliance"
      });
    }

    // Meta Text Header restrictions: no emojis, newlines, or asterisks
    if (form.headerType === "TEXT" && form.headerContent?.trim()) {
      const hasInvalidHeaderChar = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\r\n\*]/gu.test(form.headerContent);
      checks.push({
        label: "Header Text Format (No emojis or newlines)",
        valid: !hasInvalidHeaderChar,
        critical: true,
        message: hasInvalidHeaderChar
          ? "Meta rejects emojis (like 🪔) & asterisks in Text Header. Emojis belong in Body."
          : "Header complies with Meta text rules"
      });
    }

    return checks;
  }, [form]);

  // Open modal handler
  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setForm({
        name: t.name || "",
        category: t.category || "MARKETING",
        channelCategoryCode: t.channelCategoryCode || `WA_${t.category || "MARKETING"}`,
        language: t.language || "en_US",
        provider: t.provider || primaryProvider || "routemobile",
        wabaTemplateId: t.wabaTemplateId || t.providerTemplateId || "",
        headerType: t.headerType || t.header?.type || "NONE",
        headerContent: t.headerText || t.header?.text || t.headerContent || "",
        mediaUrl: t.mediaUrl || "",
        body: t.body || "",
        footer: typeof t.footer === "object" ? t.footer?.text || "" : t.footer || "",
        buttons: Array.isArray(t.buttons) && t.buttons.length
          ? t.buttons.map((b) => ({
              type: b.type || "QUICK_REPLY",
              text: b.text || "",
              value: b.url || b.phoneNumber || b.payload || b.value || "",
              code: b.code || ""
            }))
          : [
              { type: "URL", text: "Open Console", value: "https://beyondsend.in" },
              { type: "QUICK_REPLY", text: "Contact Support", value: "SUPPORT" }
            ],
        status: t.status || "APPROVED"
      });
    } else {
      setEditingId(null);
      setForm({
        ...initialForm,
        provider: primaryProvider || "routemobile"
      });
    }
    setLangSearch("");
    setModal(true);
  };

  // Restore Draft from localStorage
  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm(parsed);
        setEditingId(null);
        setModal(true);
        toast.info("Restored draft template from your session!");
      }
    } catch {
      toast.error("Could not restore saved draft.");
    }
  };

  // Discard Local Draft
  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasSavedDraft(false);
    toast.info("Cleared local draft session.");
  };

  // Save template (supports Save as Draft or Submit for Meta Approval)
  const handleSave = async (submitType = "SUBMIT_META") => {
    if (!form.name.trim()) {
      toast.warning("Please provide a Template Identifier Name.");
      return;
    }
    if (!/^[a-z0-9_]+$/.test(form.name.trim())) {
      toast.warning("Template Name must contain only lowercase letters, numbers, and underscores.");
      return;
    }
    if (!form.body.trim()) {
      toast.warning("Message Body Text is required by Meta.");
      return;
    }

    if (
      submitType !== "DRAFT" &&
      form.headerType === "TEXT" &&
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\r\n\*]/gu.test(form.headerContent || "")
    ) {
      toast.warning("Meta does not allow emojis or special characters in the Text Header. Please remove the emoji from the header (you can keep emojis in the message body).");
      return;
    }

    const isDraft = submitType === "DRAFT";
    const targetStatus = isDraft ? "DRAFT" : "PENDING_APPROVAL";

    try {
      setBtnLoading(true);

      const normalizedButtons = (form.buttons || []).map((b) => ({
        type: b.type || "QUICK_REPLY",
        text: b.text || "",
        url: b.type === "URL" ? b.value || b.url || "" : "",
        phoneNumber: b.type === "PHONE_NUMBER" ? b.value || b.phoneNumber || "" : "",
        payload: b.type === "QUICK_REPLY" ? b.value || b.payload || b.text || "" : "",
        code: b.type === "COPY_CODE" ? b.code || b.value || "" : "",
        value: b.value || ""
      }));

      // Extract sample variables list for bodyExample
      const bodyExample = detectedVariables.map((num) => sampleVariables[num] || `Sample_${num}`);

      const payload = {
        ...form,
        name: form.name.trim(),
        provider: primaryProvider || form.provider || "routemobile",
        configId: primaryConfigId || "",
        providerTemplateId: (form.wabaTemplateId || "").trim(),
        wabaTemplateId: (form.wabaTemplateId || "").trim(),
        headerType: form.headerType,
        headerText: form.headerContent,
        headerContent: form.headerContent,
        mediaUrl: form.mediaUrl,
        header: {
          type: form.headerType,
          text: form.headerContent,
          mediaUrl: form.mediaUrl
        },
        footer: (form.footer || "").trim(),
        buttons: normalizedButtons,
        bodyExample,
        status: targetStatus,
        providerStatus: isDraft ? "DRAFT" : "PENDING"
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/whatsapp/templates/update/${editingId}`, payload);
        toast.success(
          res?.data?.message ||
            (isDraft ? "WhatsApp template updated as Draft" : "WhatsApp template submitted for Meta approval!")
        );
      } else {
        const res = await apiClient.post("/whatsapp/templates/create", payload);
        toast.success(
          res?.data?.message ||
            (isDraft ? "WhatsApp template saved as Draft successfully" : "WhatsApp template submitted for Meta approval!")
        );
      }

      // Clear local storage draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setHasSavedDraft(false);

      setModal(false);
      fetchTemplates();
    } catch (err) {
      console.error("Save template error:", err);
      toast.error(err?.response?.data?.message || "Failed to save WhatsApp template");
    } finally {
      setBtnLoading(false);
    }
  };

  // Auto-save form draft to localStorage on change
  useEffect(() => {
    if (modal && form.name) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(form));
        setHasSavedDraft(true);
      } catch {
        // ignore
      }
    }
  }, [form, modal]);

  // Delete Template with SweetAlert Confirmation & Dynamic Gateway Sync
  const handleDelete = async (id, name) => {
    if (!id) {
      toast.error("Template ID is missing");
      return;
    }

    const swalObj = Swal || wpSwal;
    const res = await swalObj.fire({
      title: "Delete WhatsApp Template?",
      html: `<div class="text-start">
        <p class="mb-2">Are you sure you want to delete template <strong class="text-danger font-monospace">${name}</strong>?</p>
        <p class="text-muted small mb-0">This action will permanently delete the template from your database and synchronize deletion with your active WhatsApp provider.</p>
      </div>`,
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger px-4 py-2",
        cancelButton: "btn btn-secondary px-4 py-2",
        actions: "gap-2"
      },
      buttonsStyling: false,
      confirmButtonText: "Yes, Delete Template",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      focusCancel: true,
    });

    if (res && res.isConfirmed) {
      try {
        if (swalObj.showLoading) {
          swalObj.fire({
            title: "Deleting Template...",
            text: `Deleting "${name}" from database and WhatsApp provider...`,
            allowOutsideClick: false,
            didOpen: () => {
              swalObj.showLoading();
            },
          });
        }

        const delRes = await apiClient.delete(`/whatsapp/templates/delete/${id}`);
        if (swalObj.close) swalObj.close();
        toast.success(delRes?.data?.message || `Template "${name}" deleted successfully!`);
        fetchTemplates();
      } catch (err) {
        if (swalObj.close) swalObj.close();
        toast.error(err?.response?.data?.message || "Failed to delete template");
      }
    }
  };

  // Sync Templates from Provider according to active primary configuration
  const handleSyncProvider = async () => {
    try {
      setSyncingProvider(true);
      const res = await apiClient.post("/whatsapp/templates/sync-provider", {
        provider: primaryProvider,
        configId: primaryConfigId,
      });
      toast.success(res?.data?.message || `WhatsApp templates synchronized from ${primaryProvider ? primaryProvider.toUpperCase() : "primary gateway"} successfully!`);
      fetchTemplates();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message;
      toast.error(
        message
          ? `Template sync failed: ${message}`
          : `Template sync failed. Check the ${primaryProvider ? primaryProvider.toUpperCase() : "primary provider"} API settings and backend logs.`
      );
    } finally {
      setSyncingProvider(false);
    }
  };

  // Filtered Templates List (server-side handles filtering)
  const filtered = templates;

  // Filtered languages for modal selection
  const filteredLanguages = useMemo(() => {
    if (!langSearch.trim()) return META_WHATSAPP_LANGUAGES;
    const q = langSearch.toLowerCase();
    return META_WHATSAPP_LANGUAGES.filter(
      (l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q) || l.native.toLowerCase().includes(q)
    );
  }, [langSearch]);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── PRO HEADER BANNER ── */}
      <Card className="adm-card mb-3 border-0 shadow-sm rounded-4 overflow-hidden wa-banner-card">
        <CardHeader className="adm-card-header bg-transparent border-0 d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 px-4">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-3 d-flex align-items-center justify-content-center shadow-sm wa-banner-icon">
              <FaWhatsapp size={24} className="text-white" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h4 className="mb-0 text-white fw-bold wa-banner-title">WhatsApp Templates</h4>
           
                <Badge pill color="dark" className="bg-opacity-50 text-white fw-semibold px-2.5 py-1 wa-banner-badge">
                  {totalCount} Total
                </Badge>

              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            {hasSavedDraft && (
              <Button
                color="warning"
                size="sm"
                className="fw-bold px-3 d-flex align-items-center gap-1.5 shadow-sm text-dark"
                onClick={handleRestoreDraft}
                title="Restore unsaved draft from local storage"
              >
                <FaUndo size={12} /> Resume Draft
              </Button>
            )}
            <Button
              color="light"
              outline
              size="sm"
              className="fw-bold px-3 d-flex align-items-center gap-1.5 text-white border-white border-opacity-50"
              onClick={handleSyncProvider}
              disabled={syncingProvider}
              title="Synchronize registered templates from your WhatsApp gateway"
            >
              {syncingProvider ? (
                <>
                  <Spinner size="sm" className="me-1" /> Syncing...
                </>
              ) : (
                <>
                  <FaSyncAlt size={12} className={syncingProvider ? "fa-spin" : ""} /> Sync Templates
                </>
              )}
            </Button>
            <Button
              color="light"
              size="sm"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5 text-dark"
              onClick={() => handleOpenModal()}
            >
              <FaPlus size={12} className="text-success" /> New Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {/* STATS & FILTER STRIP */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col lg={3} md={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch />
                  </InputGroupText>
                  <Input
                    placeholder="Search any field (name, body, ID)..."
                    className="border-start-0"
                    bsSize="sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <Button
                      close
                      className="p-1 pe-2 bg-white border-start-0"
                      onClick={() => setSearch("")}
                    />
                  )}
                </InputGroup>
              </Col>
              <Col lg={2} md={6}>
                <Input
                  type="select"
                  bsSize="sm"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                  <option value="SERVICE">Service</option>
                </Input>
              </Col>
              <Col lg={2} md={6}>
                <Input
                  type="select"
                  bsSize="sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved Only</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="DRAFT">Drafts</option>
                  <option value="REJECTED">Rejected</option>
                </Input>
              </Col>
              <Col lg={2} md={3} xs={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white px-2 text-muted" title="From Date">
                    <FaCalendarAlt size={11} />
                  </InputGroupText>
                  <Input
                    type="date"
                    bsSize="sm"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    title="Filter From Date"
                  />
                </InputGroup>
              </Col>
              <Col lg={2} md={3} xs={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white px-2 text-muted" title="To Date">
                    <FaCalendarAlt size={11} />
                  </InputGroupText>
                  <Input
                    type="date"
                    bsSize="sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    title="Filter To Date"
                  />
                </InputGroup>
              </Col>
              <Col lg={1} md={12} className="d-flex align-items-center justify-content-end gap-1">
                {(search || filterCat !== "ALL" || filterStatus !== "ALL" || fromDate || toDate) && (
                  <Button
                    size="sm"
                    color="light"
                    className="border text-danger fw-semibold px-2"
                    onClick={handleResetFilters}
                    title="Reset all filters"
                  >
                    <FaTimes size={11} /> Clear
                  </Button>
                )}
                <span className="badge bg-white border text-dark fw-bold px-2 py-1.5 ms-auto" style={{ whiteSpace: "nowrap" }}>
                  {templates.length} / {totalCount}
                </span>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            {loading ? (
              <div className="p-5 text-center">
                <PageLoader />
              </div>
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Identifier Name</th>
                    <th>Template Content</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Buttons</th>
                    <th>Status</th>
                    <th style={{ minWidth: "120px" }}>Created At</th>
                    <th style={{ minWidth: "120px" }}>Updated At</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-5 text-muted">
                        No WhatsApp templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-success font-monospace small">{t.name}</div>
                          {t.wabaTemplateId && t.wabaTemplateId !== t.name ? (
                            <small className="text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                              ID: {t.wabaTemplateId}
                            </small>
                          ) : (
                            <span className="badge bg-warning bg-opacity-10 text-warning border border-warning" style={{ fontSize: "9.5px", padding: "1px 5px" }}>
                              Pending Sync
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="fw-bold text-dark small">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "280px" }}>
                            {t.body}
                          </small>
                          {t.headerType && t.headerType !== "NONE" && (
                            <span className="badge bg-light text-dark border me-1" style={{ fontSize: "9.5px" }}>
                              {t.headerType} HEADER
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className="px-2.5 py-0.5 rounded-pill fw-semibold"
                            style={{
                              fontSize: "11px",
                              background:
                                t.category === "MARKETING"
                                   ? "#edf2ff"
                                   : t.category === "UTILITY"
                                   ? "#e6fcf5"
                                   : "#fff4e6",
                              color:
                                t.category === "MARKETING"
                                   ? "#3b5bdb"
                                   : t.category === "UTILITY"
                                   ? "#0ca678"
                                   : "#e8590c"
                            }}
                          >
                            {t.category}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-light border text-muted font-monospace">
                            {t.language || "en_US"}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-light border text-dark">
                            {t.buttons?.length || 0} Action(s)
                          </span>
                        </td>
                        <td>{renderStatusBadge(t.status)}</td>
                        <td>
                          {(() => {
                            const { date, time } = formatTableDateTime(t.createdAt);
                            return (
                              <div>
                                <div className="small fw-semibold text-dark text-nowrap">{date}</div>
                                {time && (
                                  <div className="text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                                    {time}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td>
                          {(() => {
                            const { date, time } = formatTableDateTime(t.updatedAt || t.createdAt);
                            return (
                              <div>
                                <div className="small fw-semibold text-dark text-nowrap">{date}</div>
                                {time && (
                                  <div className="text-muted font-monospace" style={{ fontSize: "10.5px" }}>
                                    {time}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-light border shadow-xs d-inline-flex align-items-center justify-content-center rounded-2 p-0"
                              style={{ width: "32px", height: "32px" }}
                              title="WhatsApp Mobile Preview"
                              onClick={() => setPreviewTemplate(t)}
                            >
                              <FaMobileAlt size={13} className="text-dark" />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success bg-success bg-opacity-10 border border-success border-opacity-25 text-success shadow-xs d-inline-flex align-items-center justify-content-center rounded-2 p-0"
                              style={{ width: "32px", height: "32px" }}
                              title="Edit Template"
                              onClick={() => handleOpenModal(t)}
                            >
                              <FaEdit size={13} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger shadow-xs d-inline-flex align-items-center justify-content-center rounded-2 p-0"
                              style={{ width: "32px", height: "32px" }}
                              title="Delete Template"
                              onClick={() => handleDelete(t._id, t.name)}
                            >
                              <FaTrash size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>

          {/* ── SERVER PAGINATION BAR ── */}
          {!loading && templates.length > 0 && (
            <div className="p-3 bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span>Rows per page:</span>
                <Input
                  type="select"
                  bsSize="sm"
                  style={{ width: "75px" }}
                  value={limit}
                  onChange={(e) => handleLimitChange(Number(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Input>
                <span className="ms-2">
                  Showing{" "}
                  <strong className="text-dark">
                    {totalCount === 0 ? 0 : (page - 1) * limit + 1}
                  </strong>{" "}
                  –{" "}
                  <strong className="text-dark">
                    {Math.min(page * limit, totalCount)}
                  </strong>{" "}
                  of <strong className="text-dark">{totalCount}</strong> templates
                </span>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <Button
                  size="sm"
                  color="light"
                  className="border px-2.5 fw-semibold"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(1)}
                  title="First Page"
                >
                  &laquo;
                </Button>
                <Button
                  size="sm"
                  color="light"
                  className="border px-3 fw-semibold"
                  disabled={page <= 1 || loading}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <span className="px-2 small fw-bold text-dark">
                  Page {page} of {totalPages || 1}
                </span>
                <Button
                  size="sm"
                  color="light"
                  className="border px-3 fw-semibold"
                  disabled={page >= totalPages || loading}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  color="light"
                  className="border px-2.5 fw-semibold"
                  disabled={page >= totalPages || loading}
                  onClick={() => handlePageChange(totalPages)}
                  title="Last Page"
                >
                  &raquo;
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─────────────────────────────────────────────────────────────
       * FULL META TEMPLATE SUITE REGISTRATION MODAL (DUAL PANE SPLIT)
       * ───────────────────────────────────────────────────────────── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="xl" backdrop="static" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white border-0 py-3 px-4"
          style={{ background: "#075E54" }}
        >
          <div className="d-flex align-items-center justify-content-between w-100 pe-3">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-white p-1.5 rounded-circle d-flex align-items-center justify-content-center">
                <FaWhatsapp size={18} className="text-success" />
              </div>
              <h5 className="mb-0 fw-bold">
                {editingId ? "Edit WhatsApp Template" : "New WhatsApp Template Registration"}
              </h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Badge color="light" className="text-dark fw-bold px-2 py-1">
                {form.category}
              </Badge>
              <Badge color="success" className="fw-bold px-2 py-1">
                {form.language}
              </Badge>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="p-0 bg-light">
          <Row className="g-0">
            {/* ── LEFT PANE: CONFIGURATION & BUILDER (COMPACT & CLEAN) ── */}
            <Col lg={7} md={12} className="p-3 border-end bg-white" style={{ maxHeight: "78vh", overflowY: "auto" }}>
              {/* SECTION 1: IDENTITY, CATEGORY & LANGUAGE */}
              <div className="p-2.5 rounded-3 border bg-light mb-2.5">
                <div className="d-flex align-items-center gap-1.5 mb-2 pb-1 border-bottom">
                  <FaShieldAlt className="text-success" size={13} />
                  <span className="fw-bold small text-dark">1. Template Identity & Categorization</span>
                </div>
                <Row className="g-2">
                  <Col md={5}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold small text-dark mb-1">
                        Identifier Name *
                      </Label>
                      <Input
                        bsSize="sm"
                        placeholder="e.g. order_shipped_alert"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_")
                          })
                        }
                        required
                        className="font-monospace"
                      />
                    </FormGroup>
                  </Col>
                  <Col md={3}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold small text-dark mb-1">Category *</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={form.category}
                        onChange={(e) => {
                          const cat = e.target.value;
                          setForm({
                            ...form,
                            category: cat,
                            channelCategoryCode: `WA_${cat}`
                          });
                        }}
                      >
                        <option value="MARKETING">MARKETING</option>
                        <option value="UTILITY">UTILITY</option>
                        <option value="AUTHENTICATION">AUTHENTICATION</option>
                        <option value="SERVICE">SERVICE</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md={4}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold small text-dark mb-1">Language *</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                      >
                        <optgroup label="Popular Regional">
                          {META_WHATSAPP_LANGUAGES.slice(0, 12).map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name} ({l.code})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Global Meta Languages">
                          {META_WHATSAPP_LANGUAGES.slice(12).map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name} ({l.code})
                            </option>
                          ))}
                        </optgroup>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
              </div>

              {/* SECTION 2: HEADER COMPONENT (OPTIONAL) */}
              <div className="p-2.5 rounded-3 border bg-light mb-2.5">
                <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                  <div className="d-flex align-items-center gap-1.5">
                    <FaImage className="text-info" size={13} />
                    <span className="fw-bold small text-dark">2. Header Component (Optional)</span>
                  </div>
                  <Badge color="light" className="text-muted border" style={{ fontSize: "10px" }}>
                    {form.headerType}
                  </Badge>
                </div>
                <Row className="g-2">
                  <Col md={4}>
                    <FormGroup className="mb-0">
                      <Label className="fw-semibold small text-dark mb-1">Header Type</Label>
                      <Input
                        type="select"
                        bsSize="sm"
                        value={form.headerType}
                        onChange={(e) => setForm({ ...form, headerType: e.target.value })}
                      >
                        <option value="NONE">None</option>
                        <option value="TEXT">Text Header</option>
                        <option value="IMAGE">Image (JPEG/PNG)</option>
                        <option value="VIDEO">Video (MP4)</option>
                        <option value="DOCUMENT">Document (PDF)</option>
                      </Input>
                    </FormGroup>
                  </Col>

                  {form.headerType === "TEXT" && (
                    <Col md={8}>
                      <FormGroup className="mb-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Label className="fw-semibold small text-dark mb-0">Header Text</Label>
                          <small className="text-muted" style={{ fontSize: "10.5px" }}>
                            {form.headerContent.length}/60 chars
                          </small>
                        </div>
                        <Input
                          bsSize="sm"
                          placeholder="e.g. Order Confirmation"
                          maxLength={60}
                          value={form.headerContent}
                          onChange={(e) => setForm({ ...form, headerContent: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                  )}

                  {["IMAGE", "VIDEO", "DOCUMENT"].includes(form.headerType) && (
                    <Col md={8}>
                      <FormGroup className="mb-0">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <Label className="fw-semibold small text-dark mb-0">Sample Media URL</Label>
                          <Button
                            size="sm"
                            color="link"
                            className="p-0 text-primary fw-semibold"
                            style={{ fontSize: "10.5px" }}
                            onClick={() =>
                              setForm({
                                ...form,
                                mediaUrl:
                                  form.headerType === "IMAGE"
                                    ? "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600"
                                    : form.headerType === "VIDEO"
                                    ? "https://www.w3schools.com/html/mov_bbb.mp4"
                                    : "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                              })
                            }
                          >
                            + Demo Asset
                          </Button>
                        </div>
                        <Input
                          bsSize="sm"
                          placeholder={
                            form.headerType === "IMAGE"
                              ? "https://assets.beyondsend.in/sample.jpg"
                              : form.headerType === "VIDEO"
                              ? "https://assets.beyondsend.in/sample.mp4"
                              : "https://assets.beyondsend.in/invoice.pdf"
                          }
                          value={form.mediaUrl}
                          onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
                        />
                      </FormGroup>
                    </Col>
                  )}
                </Row>
              </div>

              {/* SECTION 3: MESSAGE BODY & DYNAMIC VARIABLES */}
              <div className="p-2.5 rounded-3 border bg-light mb-2.5">
                <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                  <div className="d-flex align-items-center gap-1.5">
                    <FaBolt className="text-warning" size={13} />
                    <span className="fw-bold small text-dark">3. Message Body *</span>
                  </div>
                  <small className="text-muted fw-semibold" style={{ fontSize: "11px" }}>
                    {form.body.length}/1024 chars
                  </small>
                </div>

                <FormGroup className="mb-2">
                  <Input
                    type="textarea"
                    rows={3}
                    placeholder="Hi {{1}}, your order {{2}} has been confirmed and will be delivered by {{3}}."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                    style={{ fontSize: "13px" }}
                  />

                  {/* QUICK FORMATTING TOOLBAR */}
                  <div className="d-flex flex-wrap gap-1 mt-1.5 align-items-center">
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      className="py-0.5 px-2 fw-semibold d-flex align-items-center gap-1"
                      style={{ fontSize: "10.5px" }}
                      onClick={() => {
                        const count = (form.body.match(/\{\{\d+\}\}/g) || []).length + 1;
                        setForm({ ...form, body: form.body + ` {{${count}}}` });
                      }}
                    >
                      <FaPlus size={9} /> Placeholder &#123;&#123;{detectedVariables.length + 1}&#125;&#125;
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      className="border py-0.5 px-2 fw-bold"
                      style={{ fontSize: "10.5px" }}
                      onClick={() => setForm({ ...form, body: form.body + " *bold*" })}
                    >
                      *Bold*
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      className="border py-0.5 px-2 fst-italic"
                      style={{ fontSize: "10.5px" }}
                      onClick={() => setForm({ ...form, body: form.body + " _italic_" })}
                    >
                      _Italic_
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      className="border py-0.5 px-2 text-decoration-line-through"
                      style={{ fontSize: "10.5px" }}
                      onClick={() => setForm({ ...form, body: form.body + " ~strike~" })}
                    >
                      ~Strike~
                    </Button>
                  </div>
                </FormGroup>

                {/* DYNAMIC VARIABLE TEST VALUES */}
                {detectedVariables.length > 0 && (
                  <div className="p-2 rounded bg-white border mt-2">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="fw-semibold small text-muted" style={{ fontSize: "11px" }}>
                        Sample values for dynamic variables:
                      </span>
                      <Badge color="info" pill style={{ fontSize: "9.5px" }}>
                        {detectedVariables.length} Variable(s)
                      </Badge>
                    </div>
                    <Row className="g-1.5">
                      {detectedVariables.map((num) => (
                        <Col md={6} key={num}>
                          <InputGroup size="sm">
                            <InputGroupText className="bg-light font-monospace fw-bold text-primary py-0 px-2" style={{ fontSize: "10.5px" }}>
                              &#123;&#123;{num}&#125;&#125;
                            </InputGroupText>
                            <Input
                              placeholder={`Sample {{${num}}}`}
                              value={sampleVariables[num] || ""}
                              onChange={(e) =>
                                setSampleVariables({
                                  ...sampleVariables,
                                  [num]: e.target.value
                                })
                              }
                              style={{ fontSize: "11px" }}
                            />
                          </InputGroup>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </div>

              {/* SECTION 4: FOOTER COMPONENT (OPTIONAL) */}
              <div className="p-2.5 rounded-3 border bg-light mb-2.5">
                <div className="d-flex align-items-center justify-content-between mb-1.5 pb-1 border-bottom">
                  <div className="d-flex align-items-center gap-1.5">
                    <FaInfoCircle className="text-secondary" size={13} />
                    <span className="fw-bold small text-dark">4. Footer (Optional)</span>
                  </div>
                  <small className="text-muted" style={{ fontSize: "10.5px" }}>
                    {form.footer.length}/60 chars
                  </small>
                </div>
                <InputGroup size="sm">
                  <Input
                    placeholder="e.g. Reply STOP to unsubscribe • BeyondSend"
                    maxLength={60}
                    value={form.footer}
                    onChange={(e) => setForm({ ...form, footer: e.target.value })}
                  />
                  <Button
                    color="light"
                    className="border text-primary fw-semibold"
                    style={{ fontSize: "11px" }}
                    onClick={() =>
                      setForm({
                        ...form,
                        footer: form.footer ? `${form.footer} • Reply STOP to unsubscribe` : "Reply STOP to unsubscribe"
                      })
                    }
                  >
                    + Add Opt-Out (STOP)
                  </Button>
                </InputGroup>
              </div>

              {/* SECTION 5: INTERACTIVE ACTION BUTTONS */}
              <div className="p-2.5 rounded-3 border bg-light">
                <div className="d-flex justify-content-between align-items-center mb-1.5 pb-1 border-bottom">
                  <span className="fw-bold small text-dark">5. Interactive Action Buttons</span>
                  {form.buttons.length < 3 && (
                    <div className="d-flex gap-1">
                      <Button
                        size="sm"
                        color="success"
                        outline
                        className="py-0.5 px-2 fw-semibold d-flex align-items-center gap-1"
                        style={{ fontSize: "10.5px" }}
                        onClick={() =>
                          setForm({
                            ...form,
                            buttons: [
                              ...form.buttons,
                              { type: "URL", text: "Visit Website", value: "https://beyondsend.in" }
                            ]
                          })
                        }
                      >
                        <FaExternalLinkAlt size={9} /> + URL
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        className="py-0.5 px-2 fw-semibold d-flex align-items-center gap-1"
                        style={{ fontSize: "10.5px" }}
                        onClick={() =>
                          setForm({
                            ...form,
                            buttons: [
                              ...form.buttons,
                              { type: "QUICK_REPLY", text: "Talk to Human", value: "TALK_HUMAN" }
                            ]
                          })
                        }
                      >
                        <FaReply size={9} /> + Quick Reply
                      </Button>
                      <Button
                        size="sm"
                        color="warning"
                        outline
                        className="py-0.5 px-2 fw-semibold d-flex align-items-center gap-1"
                        style={{ fontSize: "10.5px" }}
                        onClick={() =>
                          setForm({
                            ...form,
                            buttons: [
                              ...form.buttons,
                              { type: "PHONE_NUMBER", text: "Call Support", value: "+918000012345" }
                            ]
                          })
                        }
                      >
                        <FaPhone size={9} /> + Phone
                      </Button>
                    </div>
                  )}
                </div>

                {form.buttons.length === 0 ? (
                  <div className="py-2 text-center text-muted small fst-italic" style={{ fontSize: "11px" }}>
                    No buttons added. Click buttons above to attach URL, Call, or Quick Reply.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-1.5">
                    {form.buttons.map((btn, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border">
                        <Row className="g-1.5 align-items-center">
                          <Col md={3}>
                            <Input
                              type="select"
                              size="sm"
                              value={btn.type}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], type: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                              style={{ fontSize: "11px" }}
                            >
                              <option value="URL">Website URL</option>
                              <option value="QUICK_REPLY">Quick Reply</option>
                              <option value="PHONE_NUMBER">Phone Call</option>
                              <option value="COPY_CODE">Copy Code</option>
                            </Input>
                          </Col>
                          <Col md={4}>
                            <Input
                              size="sm"
                              maxLength={25}
                              placeholder="Label (Max 25)"
                              value={btn.text}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], text: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                              style={{ fontSize: "11px" }}
                            />
                          </Col>
                          <Col md={4}>
                            <Input
                              size="sm"
                              placeholder={
                                btn.type === "URL"
                                  ? "https://..."
                                  : btn.type === "PHONE_NUMBER"
                                  ? "+91..."
                                  : btn.type === "COPY_CODE"
                                  ? "OFFER20"
                                  : "ACTION"
                              }
                              value={btn.value}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], value: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                              style={{ fontSize: "11px" }}
                            />
                          </Col>
                          <Col md={1} className="text-center">
                            <Button
                              size="sm"
                              color="link"
                              className="text-danger p-0"
                              title="Delete Button"
                              onClick={() => {
                                const updated = form.buttons.filter((_, i) => i !== idx);
                                setForm({ ...form, buttons: updated });
                              }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>

            {/* ── RIGHT PANE: LIVE PREVIEW & META GUIDELINES COMPLIANCE AUDIT ── */}
            <Col lg={5} md={12} className="p-3 bg-light d-flex flex-column align-items-center justify-content-start" style={{ maxHeight: "78vh", overflowY: "auto" }}>
              <div className="w-100 d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-bold text-dark d-flex align-items-center gap-1.5">
                  <FaWhatsapp className="text-success" size={15} /> Message Preview
                </span>
                <Badge color="light" className="text-muted border" style={{ fontSize: "10px" }}>
                  Live Rendering
                </Badge>
              </div>

              {/* COMPACT CLEAN PREVIEW CARD */}
              <div
                className="w-100 rounded-3 shadow-sm overflow-hidden"
                style={{
                  background: "#efeae2",
                  border: "1px solid #d1d7db",
                  maxWidth: "340px",
                }}
              >
                {/* Header Strip */}
                <div
                  className="px-3 py-2 text-white d-flex align-items-center justify-content-between"
                  style={{ background: "#008069" }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle bg-white d-flex align-items-center justify-content-center text-success fw-bold shadow-xs"
                      style={{ width: "26px", height: "26px" }}
                    >
                      <FaWhatsapp size={14} />
                    </div>
                    <div>
                      <div className="fw-bold small d-flex align-items-center gap-1 leading-none" style={{ fontSize: "12px" }}>
                        <span>BeyondSend</span>
                        <FaCheckCircle className="text-info" size={9} title="Verified" />
                      </div>
                      <div className="text-white-50" style={{ fontSize: "9px" }}>
                        Official Business Account
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conversation Body */}
                <div
                  className="p-2.5"
                  style={{
                    backgroundImage:
                      "radial-gradient(#d4cbbe 1px, transparent 1px), radial-gradient(#d4cbbe 1px, #ece5dd 1px)",
                    backgroundSize: "16px 16px",
                    minHeight: "200px",
                  }}
                >
                  {/* Timestamp */}
                  <div className="text-center mb-2">
                    <span
                      className="px-2 py-0.5 rounded-pill text-muted fw-semibold"
                      style={{ fontSize: "9.5px", background: "rgba(255,255,255,0.85)" }}
                    >
                      TODAY
                    </span>
                  </div>

                  {/* Outgoing Bubble */}
                  <div
                    className="bg-white rounded-3 p-2.5 shadow-sm mb-2"
                    style={{
                      borderRadius: "8px 8px 8px 0px",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Header */}
                    {form.headerType === "TEXT" && form.headerContent && (
                      <div className="fw-bold text-dark mb-1 pb-1 border-bottom" style={{ fontSize: "12px" }}>
                        {renderedHeaderText}
                      </div>
                    )}
                    {form.headerType === "IMAGE" && (
                      <div className="mb-2 rounded overflow-hidden bg-light text-center border">
                        {form.mediaUrl ? (
                          <img
                            src={form.mediaUrl}
                            alt="Header"
                            className="img-fluid w-100"
                            style={{ maxHeight: "110px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="py-2.5 text-muted small d-flex flex-column align-items-center gap-1" style={{ fontSize: "11px" }}>
                            <FaImage size={18} className="text-secondary" />
                            <span>[Sample Image Header]</span>
                          </div>
                        )}
                      </div>
                    )}
                    {form.headerType === "VIDEO" && (
                      <div
                        className="mb-2 rounded text-white p-2 text-center d-flex flex-column align-items-center justify-content-center"
                        style={{ background: "#334155", minHeight: "60px" }}
                      >
                        <FaVideo size={14} className="mb-1" />
                        <span style={{ fontSize: "10px" }}>WhatsApp Video Header</span>
                      </div>
                    )}
                    {form.headerType === "DOCUMENT" && (
                      <div className="mb-2 p-1.5 rounded bg-light border d-flex align-items-center gap-2">
                        <FaFileAlt size={16} className="text-danger" />
                        <span className="fw-semibold text-truncate" style={{ fontSize: "11px" }}>Document.pdf</span>
                      </div>
                    )}

                    {/* Body with formatted markdown & newlines */}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#111b21",
                        lineHeight: "1.4",
                        wordBreak: "break-word",
                        whiteSpace: "pre-line"
                      }}
                      dangerouslySetInnerHTML={{
                        __html: renderFormattedText(renderedBodyText.replace(/\\n/g, "\n"))
                      }}
                    />

                    {/* Footer */}
                    {form.footer && (
                      <div
                        className="mt-1.5 pt-1 border-top text-muted"
                        style={{ fontSize: "10px", color: "#667781" }}
                      >
                        {form.footer}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="d-flex justify-content-end align-items-center gap-1 mt-1 text-muted" style={{ fontSize: "9px" }}>
                      <span>12:45 PM</span>
                      <FaCheckDouble size={9} style={{ color: "#53bdeb" }} />
                    </div>
                  </div>

                  {/* Buttons */}
                  {form.buttons && form.buttons.length > 0 && (
                    <div className="d-flex flex-column gap-1">
                      {form.buttons.map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className="bg-white text-center py-1.5 px-2 rounded-2 shadow-xs border fw-semibold d-flex align-items-center justify-content-center gap-1"
                          style={{
                            fontSize: "11px",
                            color: "#00a884",
                          }}
                        >
                          {b.type === "URL" && <FaExternalLinkAlt size={9} />}
                          {b.type === "PHONE_NUMBER" && <FaPhone size={9} />}
                          {b.type === "QUICK_REPLY" && <FaReply size={9} />}
                          {b.type === "COPY_CODE" && <FaCopy size={9} />}
                          <span className="text-truncate">{b.text || b.value || "Action Button"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Variable Pills */}
                  {detectedVariables.length > 0 && (
                    <div className="mt-2 p-1.5 bg-white rounded border text-center">
                      <div className="text-muted fw-semibold" style={{ fontSize: "9.5px" }}>
                        {detectedVariables.length} variable(s) active
                      </div>
                      <div className="d-flex flex-wrap justify-content-center gap-1 mt-1">
                        {detectedVariables.map((num) => (
                          <span
                            key={num}
                            className="badge bg-light text-primary border"
                            style={{ fontSize: "9px" }}
                          >
                            &#123;&#123;{num}&#125;&#125; → {sampleVariables[num] || `Val_${num}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── META GUIDELINES COMPLIANCE LIVE AUDIT (MOVED INTO RIGHT PANE BLANK AREA) ── */}
              <div className="w-100 bg-white rounded-3 border shadow-sm p-3 mt-3" style={{ maxWidth: "340px" }}>
                <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                  <div className="d-flex align-items-center gap-1.5">
                    <FaShieldAlt className="text-success" size={13} />
                    <span className="fw-bold small text-dark">Compliance Live Audit</span>
                  </div>
                  <Badge
                    color={metaCompliance.every((c) => c.valid) ? "success" : "warning"}
                    pill
                    className="fw-bold"
                    style={{ fontSize: "10px" }}
                  >
                    {metaCompliance.filter((c) => c.valid).length}/{metaCompliance.length} Passed
                  </Badge>
                </div>
                <div className="d-flex flex-column gap-1.5">
                  {metaCompliance.map((chk, cIdx) => (
                    <div
                      key={cIdx}
                      className="d-flex align-items-start gap-2 p-2 rounded"
                      style={{
                        background: chk.valid ? "#f2fcf5" : chk.critical ? "#fff5f5" : "#fffbf0",
                        border: `1px solid ${chk.valid ? "#b7ebc7" : chk.critical ? "#fed7d7" : "#feebc8"}`
                      }}
                    >
                      {chk.valid ? (
                        <FaCheckCircle className="text-success mt-0.5 flex-shrink-0" size={12} />
                      ) : chk.critical ? (
                        <FaExclamationTriangle className="text-danger mt-0.5 flex-shrink-0" size={12} />
                      ) : (
                        <FaInfoCircle className="text-warning mt-0.5 flex-shrink-0" size={12} />
                      )}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-semibold text-dark" style={{ fontSize: "11px", lineHeight: "1.3" }}>
                          {chk.label}
                        </div>
                        <div
                          className={`small ${chk.valid ? "text-success" : chk.critical ? "text-danger" : "text-warning"}`}
                          style={{ fontSize: "10px", lineHeight: "1.2" }}
                        >
                          {chk.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </ModalBody>

        <ModalFooter className="bg-white d-flex justify-content-between align-items-center py-3 px-4">
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-flex align-items-center gap-1">
              <FaSave className="text-secondary" /> Auto-saved locally
            </span>
            {hasSavedDraft && (
              <Button
                color="link"
                size="sm"
                className="text-danger p-0 ms-2"
                style={{ fontSize: "11px" }}
                onClick={handleClearDraft}
              >
                Discard Session Draft
              </Button>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button color="light" outline onClick={() => setModal(false)} className="px-3">
              Cancel
            </Button>

            {/* SAVE AS DRAFT BUTTON */}
            <Button
              color="secondary"
              outline
              disabled={btnLoading}
              onClick={() => handleSave("DRAFT")}
              className="fw-bold px-3.5 d-flex align-items-center gap-1.5"
            >
              {btnLoading ? <Spinner size="sm" /> : <FaSave size={12} />}
              <span>Save as Draft</span>
            </Button>

            {/* SUBMIT FOR META APPROVAL BUTTON */}
            <Button
              color="success"
              disabled={btnLoading}
              onClick={() => handleSave("SUBMIT_META")}
              className="fw-bold px-4 d-flex align-items-center gap-1.5 shadow-sm text-white"
              style={{ background: "#008069", borderColor: "#008069" }}
            >
              {btnLoading ? <Spinner size="sm" /> : <FaPaperPlane size={12} />}
              <span>Submit for Meta Approval</span>
            </Button>
          </div>
        </ModalFooter>
      </Modal>

      {/* ── STANDALONE MOBILE PREVIEW MODAL (FROM TABLE ACTION) ── */}
      <Modal
        isOpen={!!previewTemplate}
        toggle={() => setPreviewTemplate(null)}
        centered
        modalClassName="wa-phone-modal-wrapper"
        className="wa-phone-modal-dialog"
        contentClassName="wa-phone-modal-content"
      >
        <ModalBody className="wa-phone-modal-body p-0 d-flex justify-content-center">
          {/* ── PHONE FRAME ── */}
          <div className="mx-auto position-relative wa-phone-frame">
            {/* ── Notch ── */}
            <div className="d-flex justify-content-center wa-phone-notch-area">
              <div className="wa-phone-notch">
                <div className="wa-phone-notch-camera"></div>
                <div className="wa-phone-notch-speaker"></div>
              </div>
            </div>

            {/* ── Status Bar ── */}
            <div className="d-flex justify-content-between align-items-center px-4 wa-phone-statusbar">
              <span>9:41</span>
              <div className="d-flex align-items-center gap-1">
                <svg width="12" height="9" viewBox="0 0 16 12" fill="white"><path d="M1 8h2v4H1zM5 5h2v7H5zM9 3h2v9H9zM13 0h2v12h-2z" fillOpacity="0.85"/></svg>
                <svg width="12" height="10" viewBox="0 0 16 12" fill="white"><path d="M8 2.8C5.6 2.8 3.4 3.8 1.8 5.4l1.4 1.4C4.4 5.6 6.1 4.8 8 4.8s3.6.8 4.8 2l1.4-1.4C12.6 3.8 10.4 2.8 8 2.8zM8 6.8c-1.2 0-2.3.5-3.1 1.3L6.3 9.5c.5-.5 1.1-.7 1.7-.7s1.2.2 1.7.7l1.4-1.4C10.3 7.3 9.2 6.8 8 6.8z" fillOpacity="0.85"/></svg>
                <div className="wa-phone-battery">
                  <div className="wa-phone-battery-fill"></div>
                  <div className="wa-phone-battery-tip"></div>
                </div>
              </div>
            </div>

            {/* ── WhatsApp Chat Header ── */}
            <div className="d-flex align-items-center gap-2 px-3 wa-phone-chat-header">
              <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 wa-phone-avatar">
                <FaWhatsapp size={18} className="text-white" />
              </div>
              <div className="flex-grow-1 overflow-hidden">
                <div className="text-white fw-bold text-truncate wa-phone-contact-name">
                  {previewTemplate?.name || "Template Preview"}
                </div>
                <div className="wa-phone-contact-status">
                  online
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="btn btn-danger btn-sm p-0 rounded-circle d-flex align-items-center justify-content-center wa-phone-close-btn shadow-sm"
                title="Close Preview"
                aria-label="Close"
              >
                <FaTimes size={11} className="text-white" />
              </button>
            </div>

            {/* ── Chat Area (WhatsApp Background) ── */}
            <div className="flex-grow-1 p-3 wa-phone-chat-area">
              {/* ── Date chip ── */}
              <div className="text-center mb-3">
                <span className="px-3 py-1 rounded-pill shadow-sm wa-phone-date-chip">
                  Today
                </span>
              </div>

              {/* ── Chat Bubble ── */}
              <div className="d-flex justify-content-start mb-2">
                <div className="position-relative wa-phone-bubble">
                  {/* Bubble tail */}
                  <div className="wa-phone-bubble-tail"></div>

                  {/* Header */}
                  {((previewTemplate?.headerType && previewTemplate.headerType !== "NONE") || previewTemplate?.header?.text) && (
                    <div className="mb-1 pb-1 wa-phone-header-sep">
                      {previewTemplate.headerType === "TEXT" || previewTemplate?.header?.type === "TEXT" ? (
                        <div className="fw-bold wa-phone-header-text">
                          {previewTemplate.headerText || previewTemplate?.header?.text || "Header Text"}
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-center rounded wa-phone-media-placeholder">
                          📷 {previewTemplate.headerType || previewTemplate?.header?.type || "MEDIA"} Header
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body */}
                  <div
                    className="wa-phone-body"
                    dangerouslySetInnerHTML={{
                      __html: renderFormattedText((previewTemplate?.body || "").replace(/\\n/g, "\n"))
                    }}
                  />

                  {/* Footer */}
                  {(previewTemplate?.footer || previewTemplate?.footer?.text) && (
                    <div className="mt-1 wa-phone-footer">
                      {typeof previewTemplate.footer === "object"
                        ? previewTemplate.footer.text
                        : previewTemplate.footer}
                    </div>
                  )}

                  {/* Timestamp + read receipts */}
                  <div className="d-flex justify-content-end align-items-center gap-1 mt-1 wa-phone-timestamp">
                    <span>12:45 PM</span>
                    <FaCheckDouble size={10} className="wa-phone-read-receipt" />
                  </div>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              {previewTemplate?.buttons?.length > 0 && (
                <div className="d-flex justify-content-start mb-2" style={{ maxWidth: "85%" }}>
                  <div className="w-100 d-flex flex-column gap-1">
                    {previewTemplate.buttons.map((b, i) => (
                      <div
                        key={i}
                        className="d-flex align-items-center justify-content-center gap-1 w-100 wa-phone-action-btn"
                      >
                        {b.type === "URL" && <FaExternalLinkAlt size={10} />}
                        {b.type === "PHONE_NUMBER" && <FaPhone size={10} />}
                        {b.type === "QUICK_REPLY" && <FaReply size={10} />}
                        {b.type === "COPY_CODE" && <FaCopy size={10} />}
                        <span>{b.text || b.value || b.url || "Action Button"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Input Bar ── */}
            <div className="d-flex align-items-center gap-2 px-2 wa-phone-input-bar">
              <div className="flex-grow-1 d-flex align-items-center rounded-pill px-3 wa-phone-input-field">
                Type a message
              </div>
              <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 wa-phone-send-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </div>
            </div>

            {/* ── Home indicator ── */}
            <div className="d-flex justify-content-center wa-phone-home-indicator">
              <div className="wa-phone-home-bar"></div>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WhatsappTemplates;
