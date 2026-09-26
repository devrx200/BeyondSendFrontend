import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label,
  Table,
  FormFeedback,
  CardHeader,
  Badge,
  Spinner
} from "reactstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTrash,
  FaPlus,
  FaLink,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaBuilding,
  FaShareAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaUpload,
  FaGlobe
} from "react-icons/fa";
import apiClient, { BASE_HOST } from "@apiService";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
import { PageLoader } from "@/components";

const HINDI_TEXT_ONLY = /^[\u0900-\u097F .,!?'"()\-\n\r]+$/;
const HINDI_WITH_NUMBERS = /^[\u0900-\u097F0-9०-९ .,!?'"()\-\n\r]+$/;
const ENGLISH_TEXT_ONLY = /^[A-Za-z .,!?'"()\-\n\r]+$/;
const ENGLISH_WITH_NUMBERS = /^[A-Za-z0-9 .,!?'"()\-\n\r]+$/;
const PHONE_REGEX = /^(\+91[- ]?)?[6-9][0-9]{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FooterSection = () => {
  const { isHindi } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [footer, setFooter] = useState({
    contactInfo: {
      departmentNameHi: "",
      departmentNameEn: "",
      addressHi: "",
      addressEn: "",
      phone: "",
      email: "",
      organizerNameEn: "",
      organizerNameHi: "",
      organizerLogo: null,
    },
    quickLinks: [],
    importantLinks: [],
    socialLinks: [],
  });

  const [newLink, setNewLink] = useState({
    titleEn: "",
    titleHin: "",
    url: "",
    type: "quick",
  });

  const [newSocial, setNewSocial] = useState({
    platform: "",
    url: "",
  });

  const [editRow, setEditRow] = useState({
    type: null,
    index: null,
    data: null,
  });

  /* ─── Initial Load ────────────────────────────────────────────────────────── */
  useEffect(() => {
    fetchFooter();
  }, []);

  const fetchFooter = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/footer/detail');
      const data = res?.data || res;
      if (data && typeof data === 'object') {
        setFooter({
          contactInfo: {
            departmentNameHi: data.contactInfo?.departmentNameHi || "",
            departmentNameEn: data.contactInfo?.departmentNameEn || "",
            addressHi: data.contactInfo?.addressHi || "",
            addressEn: data.contactInfo?.addressEn || "",
            phone: data.contactInfo?.phone || "",
            email: data.contactInfo?.email || "",
            organizerNameEn: data.contactInfo?.organizerNameEn || "",
            organizerNameHi: data.contactInfo?.organizerNameHi || "",
            organizerLogo: data.contactInfo?.organizerLogo || null,
          },
          quickLinks: Array.isArray(data.quickLinks) ? data.quickLinks : [],
          importantLinks: Array.isArray(data.importantLinks) ? data.importantLinks : [],
          socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
        });
      }
    } catch (err) {
      console.error("Failed to load footer data:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Validation Helpers ─────────────────────────────────────────────────── */
  const validateField = (name, value, options = {}) => {
    const { isFieldHindi = false, isTextarea = false } = options;

    if (!value || !value.trim()) {
      return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    }

    if (isFieldHindi) {
      const regex = isTextarea ? HINDI_WITH_NUMBERS : HINDI_TEXT_ONLY;
      if (!regex.test(value)) {
        return isTextarea
          ? "कृपया केवल हिंदी अक्षर और अंक प्रयोग करें"
          : "कृपया केवल हिंदी अक्षर प्रयोग करें";
      }
    } else {
      const regex = isTextarea ? ENGLISH_WITH_NUMBERS : ENGLISH_TEXT_ONLY;
      if (!regex.test(value)) {
        return isTextarea
          ? "Please enter English text and numbers only"
          : "Please enter English text only";
      }
    }

    return "";
  };

  const validateRequired = (value) => {
    if (!value || !value.trim()) {
      return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    }
    return "";
  };

  const validateEnglish = (value) => {
    if (!value || !value.trim()) return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    if (!ENGLISH_TEXT_ONLY.test(value)) {
      return isHindi ? "केवल अंग्रेज़ी अक्षर मान्य हैं" : "Only English characters are allowed";
    }
    return "";
  };

  const validateHindiInput = (value) => {
    if (!value || !value.trim()) return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    if (!HINDI_TEXT_ONLY.test(value)) {
      return "केवल हिंदी अक्षर मान्य हैं";
    }
    return "";
  };

  const validateSocialUrl = (value) => {
    if (!value || !value.trim()) {
      return isHindi ? "यह फ़ील्ड आवश्यक है" : "This field is required";
    }
    if (!/^https?:\/\//i.test(value)) {
      return isHindi ? "कृपया पूरा URL दर्ज करें (https://...)" : "Please enter full URL (https://...)";
    }
    return "";
  };

  const handleChange = (field, value, options = {}) => {
    setFooter(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));

    const error = validateField(field, value, options);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateFooter = () => {
    const errs = {};
    const { contactInfo } = footer;

    if (!contactInfo.departmentNameEn?.trim())
      errs.departmentNameEn = "Department Name (English) is required";

    if (!contactInfo.departmentNameHi?.trim())
      errs.departmentNameHi = "Department Name (Hindi) is required";

    if (!contactInfo.addressEn?.trim())
      errs.addressEn = "Address (English) is required";

    if (!contactInfo.addressHi?.trim())
      errs.addressHi = "Address (Hindi) is required";

    if (!contactInfo.phone?.trim())
      errs.phone = "Mobile number is required";

    if (!contactInfo.email?.trim())
      errs.email = "Email is required";

    if (!contactInfo.organizerNameEn?.trim())
      errs.organizerNameEn = "Organizer Name (English) is required";

    if (!contactInfo.organizerNameHi?.trim())
      errs.organizerNameHi = "Organizer Name (Hindi) is required";

    if (
      contactInfo.departmentNameEn &&
      !ENGLISH_TEXT_ONLY.test(contactInfo.departmentNameEn)
    ) {
      errs.departmentNameEn = "Department Name (English) must contain only English characters";
    }

    if (
      contactInfo.departmentNameHi &&
      !HINDI_TEXT_ONLY.test(contactInfo.departmentNameHi)
    ) {
      errs.departmentNameHi = "Department Name (Hindi) must contain only Hindi characters";
    }

    if (
      contactInfo.addressEn &&
      !ENGLISH_WITH_NUMBERS.test(contactInfo.addressEn)
    ) {
      errs.addressEn = "Address (English) must be in English";
    }

    if (
      contactInfo.addressHi &&
      !HINDI_WITH_NUMBERS.test(contactInfo.addressHi)
    ) {
      errs.addressHi = "Address (Hindi) must be in Hindi";
    }

    if (contactInfo.phone && !PHONE_REGEX.test(contactInfo.phone)) {
      errs.phone = "Invalid mobile number format";
    }

    if (contactInfo.email && !EMAIL_REGEX.test(contactInfo.email)) {
      errs.email = "Invalid email address format";
    }

    return errs;
  };

  /* ─── Save Handlers ───────────────────────────────────────────────────────── */
  const saveFooterToDB = async (footerPayload) => {
    const formData = new FormData();
    formData.append("contactInfo", JSON.stringify(footerPayload.contactInfo));
    formData.append("quickLinks", JSON.stringify(footerPayload.quickLinks));
    formData.append("importantLinks", JSON.stringify(footerPayload.importantLinks));
    formData.append("socialLinks", JSON.stringify(footerPayload.socialLinks));

    if (footerPayload.contactInfo?.organizerLogo instanceof File) {
      formData.append("organizerLogo", footerPayload.contactInfo.organizerLogo);
    }

    await apiClient.post('/footer/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  };

  const saveFooter = async () => {
    const validationErrors = validateFooter();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return Swal.fire({
        icon: "warning",
        title: isHindi ? "सत्यापन त्रुटि" : "Validation Error",
        text: isHindi ? "कृपया हाइलाइट की गई त्रुटियों को ठीक करें" : "Please fix the highlighted errors",
      });
    }

    try {
      setSaving(true);
      Swal.fire({
        title: isHindi ? "सहेज रहा है..." : "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await saveFooterToDB(footer);

      Swal.fire({
        icon: "success",
        title: isHindi ? "सफल" : "Success",
        text: isHindi ? "पाद सामग्री सफलतापूर्वक सहेजी गई" : "Footer content saved successfully"
      });

      fetchFooter();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: error?.response?.data?.message || (isHindi ? "सहेजने में विफल" : "Footer save failed")
      });
    } finally {
      setSaving(false);
    }
  };

  /* ─── Link & Social Operations ────────────────────────────────────────────── */
  const deleteAnyLink = async (type, link, index) => {
    const key =
      type === "social"
        ? "socialLinks"
        : type === "quick"
          ? "quickLinks"
          : "importantLinks";

    const confirm = await Swal.fire({
      title: isHindi ? "क्या आप इस लिंक को हटाना चाहते हैं?" : "Delete this link?",
      text: isHindi ? "यह क्रिया वापस नहीं ली जा सकती" : "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: isHindi ? "हाँ, हटाएं" : "Yes, delete",
      cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
    });

    if (!confirm.isConfirmed) return;

    try {
      const updatedList = footer[key].filter((_, i) => i !== index);
      const updatedFooter = { ...footer, [key]: updatedList };
      setFooter(updatedFooter);

      if (link?._id) {
        await apiClient.delete(`/footer/link/delete/${type}/${link._id}`);
      }

      await saveFooterToDB(updatedFooter);

      Swal.fire({
        icon: "success",
        title: isHindi ? "हटाया गया" : "Deleted",
        text: isHindi ? "लिंक सफलतापूर्वक हटा दिया गया" : "Link removed successfully",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: isHindi ? "हटाने में विफलता हुई" : "Delete failed"
      });
      fetchFooter();
    }
  };

  const handleEditLink = (type, link, index) => {
    if (!link) return;
    setEditRow({ type, index, data: link });
    setNewLink({
      titleEn: link.titleEn || "",
      titleHin: link.titleHin || "",
      url: link.url || "",
      type,
    });
  };

  const handleEditSocial = (item, index) => {
    setEditRow({ type: "social", index, data: item });
    setNewSocial({
      platform: item.platform || "",
      url: item.url || "",
    });
  };

  const cancelEdit = () => {
    setEditRow({ type: null, index: null, data: null });
    setNewLink({ titleEn: "", titleHin: "", url: "", type: "quick" });
    setNewSocial({ platform: "", url: "" });
    setErrors(prev => ({
      ...prev,
      newLinkTitle: "",
      newLinkTitleHin: "",
      newLinkUrl: "",
      socialPlatform: "",
      socialUrl: ""
    }));
  };

  const addOrUpdateLink = async () => {
    try {
      let payload = {};
      let type = editRow.type || (newSocial.platform || newSocial.url ? "social" : newLink.type);

      if (type === "social") {
        const platformError = validateRequired(newSocial.platform);
        const urlError = validateSocialUrl(newSocial.url);

        if (platformError || urlError) {
          setErrors(prev => ({ ...prev, socialPlatform: platformError, socialUrl: urlError }));
          return;
        }

        payload = { platform: newSocial.platform.trim(), url: newSocial.url.trim() };
      } else {
        const titleEnError = validateEnglish(newLink.titleEn);
        const titleHinError = validateHindiInput(newLink.titleHin);
        const urlError = validateRequired(newLink.url);

        if (titleEnError || titleHinError || urlError) {
          setErrors(prev => ({
            ...prev,
            newLinkTitle: titleEnError,
            newLinkTitleHin: titleHinError,
            newLinkUrl: urlError,
          }));
          return;
        }

        payload = {
          titleEn: newLink.titleEn.trim(),
          titleHin: newLink.titleHin.trim(),
          url: newLink.url.trim(),
        };
      }

      Swal.fire({
        title: isHindi ? "सहेज रहा है..." : "Saving...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      let updatedFooter = { ...footer };
      const key =
        type === "social"
          ? "socialLinks"
          : type === "quick"
            ? "quickLinks"
            : "importantLinks";

      if (editRow.data?._id) {
        updatedFooter[key] = updatedFooter[key].map(item =>
          item._id === editRow.data._id ? { ...item, ...payload } : item
        );
      } else {
        updatedFooter[key] = [...updatedFooter[key], payload];
      }

      await saveFooterToDB(updatedFooter);
      setFooter(updatedFooter);

      Swal.fire({
        icon: "success",
        title: isHindi ? "सफल" : "Success",
        text: editRow.data
          ? (isHindi ? "सफलतापूर्वक अद्यतन किया गया" : "Updated successfully")
          : (isHindi ? "सफलतापूर्वक जोड़ा गया" : "Added successfully"),
        timer: 1500,
        showConfirmButton: false
      });

      cancelEdit();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err?.response?.data?.message || (isHindi ? "कार्यवाही विफल रही" : "Operation failed")
      });
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      {/* ── Main Unified Card ────────────────────────────────────────── */}
      <Card className="adm-card border-0 shadow-sm overflow-hidden mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2 py-3 px-3 px-md-4">
          <div className="d-flex align-items-center gap-2.5">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-xs flex-shrink-0"
              style={{ width: "38px", height: "38px", background: "rgba(255, 255, 255, 0.15)", fontSize: "1.1rem" }}
            >
              <FaGlobe />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white fw-bold d-flex align-items-center gap-2" style={{ fontSize: "1.1rem" }}>
                <span>{isHindi ? "पाद अनुभाग प्रबंधक" : "Footer Section Manager"}</span>
              </h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small">
                <span>
                  {isHindi
                    ? "फ़ूटर लिंक, संपर्क विवरण, सोशल मीडिया और सार्वजनिक पोर्टल सामग्री प्रबंधित करें"
                    : "Manage footer links, contact details, social media and portal footer content"}
                </span>
              </p>
            </div>
          </div>

          <Button
            color="light"
            size="sm"
            className="text-primary fw-bold shadow-sm d-flex align-items-center gap-1.5 px-3 py-1.5 border-0"
            onClick={saveFooter}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : <FaSave className="text-primary" />}
            <span>{isHindi ? "फ़ूटर सामग्री सहेजें" : "Save Footer Content"}</span>
          </Button>
        </CardHeader>

        <CardBody className="p-3 p-md-4">
          {/* ── Section 1: Contact Information & Organizer ───────────────── */}
          <div className="border rounded-3 p-3 mb-4 bg-white shadow-xs">
            <div className="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
              <FaBuilding className="text-primary" />
              <h6 className="mb-0 fw-bold text-dark fs-6">
                {isHindi ? "संपर्क जानकारी और आयोजक विवरण" : "Contact Information & Organizer Details"}
              </h6>
            </div>
            <Row className="g-3">
            {/* Department Name EN */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small">
                  {isHindi ? "विभाग का नाम (अंग्रेज़ी) *" : "Department Name (English) *"}
                </Label>
                <Input
                  name="departmentNameEn"
                  placeholder="e.g. BeyondSend Communications"
                  value={footer.contactInfo.departmentNameEn}
                  onChange={e => handleChange("departmentNameEn", e.target.value)}
                  invalid={!!errors.departmentNameEn}
                  className="shadow-none"
                />
                {errors.departmentNameEn && (
                  <FormFeedback>{errors.departmentNameEn}</FormFeedback>
                )}
              </FormGroup>
            </Col>

            {/* Department Name HI */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small">
                  {isHindi ? "विभाग का नाम (हिंदी) *" : "Department Name (Hindi) *"}
                </Label>
                <Input
                  name="departmentNameHi"
                  placeholder="उदा. बियॉन्डसेंड कम्युनिकेशंस"
                  value={footer.contactInfo.departmentNameHi}
                  onChange={e => handleChange("departmentNameHi", e.target.value, { isFieldHindi: true })}
                  invalid={!!errors.departmentNameHi}
                  className="shadow-none"
                />
                {errors.departmentNameHi && (
                  <FormFeedback>{errors.departmentNameHi}</FormFeedback>
                )}
              </FormGroup>
            </Col>

            {/* Phone */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaPhoneAlt className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "फ़ोन / मोबाइल नंबर *" : "Phone / Mobile *"}</span>
                </Label>
                <Input
                  name="phone"
                  placeholder="+91 9876543210"
                  value={footer.contactInfo.phone}
                  onChange={e => {
                    const value = e.target.value;
                    setFooter(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: value }
                    }));
                    setErrors(prev => ({
                      ...prev,
                      phone: PHONE_REGEX.test(value) ? "" : (isHindi ? "अमान्य मोबाइल नंबर" : "Invalid mobile number")
                    }));
                  }}
                  invalid={!!errors.phone}
                  className="shadow-none"
                />
                {errors.phone && <FormFeedback>{errors.phone}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Email */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaEnvelope className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "ईमेल पता *" : "Email Address *"}</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="contact@beyondsend.org"
                  value={footer.contactInfo.email}
                  onChange={e => {
                    const value = e.target.value;
                    setFooter(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: value }
                    }));
                    setErrors(prev => ({
                      ...prev,
                      email: EMAIL_REGEX.test(value) ? "" : (isHindi ? "अमान्य ईमेल पता" : "Invalid email address")
                    }));
                  }}
                  invalid={!!errors.email}
                  className="shadow-none"
                />
                {errors.email && <FormFeedback>{errors.email}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Address EN */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaMapMarkerAlt className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "पता (अंग्रेज़ी) *" : "Address (English) *"}</span>
                </Label>
                <Input
                  type="textarea"
                  rows="2"
                  name="addressEn"
                  placeholder="Enter full office address in English"
                  value={footer.contactInfo.addressEn}
                  onChange={e => handleChange("addressEn", e.target.value, { isTextarea: true })}
                  invalid={!!errors.addressEn}
                  className="shadow-none"
                />
                {errors.addressEn && <FormFeedback>{errors.addressEn}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Address HI */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaMapMarkerAlt className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "पता (हिंदी) *" : "Address (Hindi) *"}</span>
                </Label>
                <Input
                  type="textarea"
                  rows="2"
                  name="addressHi"
                  placeholder="पूरा कार्यालय का पता हिंदी में दर्ज करें"
                  value={footer.contactInfo.addressHi}
                  onChange={e => handleChange("addressHi", e.target.value, { isFieldHindi: true, isTextarea: true })}
                  invalid={!!errors.addressHi}
                  className="shadow-none"
                />
                {errors.addressHi && <FormFeedback>{errors.addressHi}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Organizer Name EN */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaUser className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "आयोजक का नाम (अंग्रेज़ी) *" : "Organizer Name (English) *"}</span>
                </Label>
                <Input
                  name="organizerNameEn"
                  placeholder="e.g. Web Information Manager"
                  value={footer.contactInfo.organizerNameEn}
                  onChange={e => {
                    const value = e.target.value;
                    setFooter(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, organizerNameEn: value }
                    }));
                    setErrors(prev => ({
                      ...prev,
                      organizerNameEn: !value.trim() ? "Organizer Name is required" : ""
                    }));
                  }}
                  invalid={!!errors.organizerNameEn}
                  className="shadow-none"
                />
                {errors.organizerNameEn && <FormFeedback>{errors.organizerNameEn}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Organizer Name HI */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaUser className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "आयोजक का नाम (हिंदी) *" : "Organizer Name (Hindi) *"}</span>
                </Label>
                <Input
                  name="organizerNameHi"
                  placeholder="उदा. वेब सूचना प्रबंधक"
                  value={footer.contactInfo.organizerNameHi}
                  onChange={e => {
                    const value = e.target.value;
                    setFooter(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, organizerNameHi: value }
                    }));
                    setErrors(prev => ({
                      ...prev,
                      organizerNameHi: !value.trim() ? "Organizer Name is required" : ""
                    }));
                  }}
                  invalid={!!errors.organizerNameHi}
                  className="shadow-none"
                />
                {errors.organizerNameHi && <FormFeedback>{errors.organizerNameHi}</FormFeedback>}
              </FormGroup>
            </Col>

            {/* Organizer Logo Upload */}
            <Col md="6" lg="4">
              <FormGroup className="mb-0">
                <Label className="fw-semibold text-secondary small d-flex align-items-center gap-1">
                  <FaUpload className="text-muted" style={{ fontSize: "11px" }} />
                  <span>{isHindi ? "आयोजक का लोगो (अपलोड)" : "Organizer Logo (Upload)"}</span>
                </Label>
                <Input
                  name="organizerLogo"
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) {
                      setFooter(prev => ({
                        ...prev,
                        contactInfo: { ...prev.contactInfo, organizerLogo: file }
                      }));
                    }
                  }}
                  className="shadow-none"
                />
                {footer?.contactInfo?.organizerLogo && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <img
                      src={
                        footer.contactInfo.organizerLogo instanceof File
                          ? URL.createObjectURL(footer.contactInfo.organizerLogo)
                          : `${BASE_HOST}${footer.contactInfo.organizerLogo}`
                      }
                      alt="Organizer Logo Preview"
                      style={{ maxHeight: "48px", maxWidth: "120px", objectFit: "contain" }}
                      className="border rounded p-1 bg-white shadow-xs"
                    />
                    <Badge color="light" className="text-secondary border">
                      {isHindi ? "वर्तमान लोगो" : "Current Logo"}
                    </Badge>
                  </div>
                )}
              </FormGroup>
            </Col>
          </Row>
        </div>

        {/* ── Section 2: Footer Links Manager ──────────────────────────── */}
        <div className="border rounded-3 p-3 mb-4 bg-white shadow-xs">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <FaLink className="text-primary" />
              <h6 className="mb-0 fw-bold text-dark fs-6">
                {isHindi ? "फ़ूटर लिंक्स प्रबंधक (त्वरित एवं महत्वपूर्ण लिंक्स)" : "Footer Links Manager (Quick & Important Links)"}
              </h6>
            </div>
            {editRow.data && editRow.type !== "social" && (
              <Badge color="warning" className="px-2 py-1 fs-xs">
                {isHindi ? "संपादन मोड चालू" : "Editing Mode Active"}
              </Badge>
            )}
          </div>
          {/* Add / Update Link Form Bar */}
          <div className="p-3 border rounded-3 bg-light bg-opacity-50 mb-4">
            <Row className="g-3 align-items-end">
              <Col md="6" lg="3">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "लिंक शीर्षक (अंग्रेज़ी) *" : "Link Title (English) *"}
                  </Label>
                  <Input
                    placeholder="e.g. About Us"
                    value={newLink.titleEn}
                    invalid={!!errors.newLinkTitle}
                    onChange={e => {
                      const value = e.target.value;
                      setNewLink(prev => ({ ...prev, titleEn: value }));
                      setErrors(prev => ({ ...prev, newLinkTitle: validateEnglish(value) }));
                    }}
                    className="shadow-none bg-white"
                  />
                  {errors.newLinkTitle && <FormFeedback>{errors.newLinkTitle}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md="6" lg="3">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "लिंक शीर्षक (हिंदी) *" : "Link Title (Hindi) *"}
                  </Label>
                  <Input
                    placeholder="उदा. हमारे बारे में"
                    value={newLink.titleHin}
                    invalid={!!errors.newLinkTitleHin}
                    onChange={e => {
                      const value = e.target.value;
                      setNewLink(prev => ({ ...prev, titleHin: value }));
                      setErrors(prev => ({ ...prev, newLinkTitleHin: validateHindiInput(value) }));
                    }}
                    className="shadow-none bg-white"
                  />
                  {errors.newLinkTitleHin && <FormFeedback>{errors.newLinkTitleHin}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md="6" lg="3">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "लक्ष्य URL / पाथ *" : "Target URL / Path *"}
                  </Label>
                  <Input
                    placeholder="/about, /downloads, https://..."
                    value={newLink.url}
                    invalid={!!errors.newLinkUrl}
                    onChange={e => {
                      const value = e.target.value;
                      setNewLink(prev => ({ ...prev, url: value }));
                      setErrors(prev => ({ ...prev, newLinkUrl: validateRequired(value) }));
                    }}
                    className="shadow-none bg-white"
                  />
                  {errors.newLinkUrl && <FormFeedback>{errors.newLinkUrl}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md="6" lg="2">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "लिंक प्रकार *" : "Link Type *"}
                  </Label>
                  <Input
                    type="select"
                    value={newLink.type}
                    onChange={e => setNewLink(prev => ({ ...prev, type: e.target.value }))}
                    className="shadow-none bg-white"
                    disabled={!!editRow.data}
                  >
                    <option value="quick">{isHindi ? "त्वरित लिंक" : "Quick Links"}</option>
                    <option value="important">{isHindi ? "महत्वपूर्ण लिंक" : "Important Links"}</option>
                  </Input>
                </FormGroup>
              </Col>

              <Col md="12" lg="1" className="d-flex gap-2">
                <Button
                  color={editRow.data && editRow.type !== "social" ? "warning" : "primary"}
                  onClick={addOrUpdateLink}
                  className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                  style={{ minHeight: "38px" }}
                >
                  {editRow.data && editRow.type !== "social" ? (
                    <>{isHindi ? "अपडेट" : "Update"}</>
                  ) : (
                    <>
                      <FaPlus style={{ fontSize: "11px" }} />
                      <span>{isHindi ? "जोड़ें" : "Add"}</span>
                    </>
                  )}
                </Button>

                {editRow.data && editRow.type !== "social" && (
                  <Button
                    color="secondary"
                    outline
                    onClick={cancelEdit}
                    title={isHindi ? "रद्द करें" : "Cancel"}
                    className="px-2"
                  >
                    <FaTimes />
                  </Button>
                )}
              </Col>
            </Row>
          </div>

          {/* Quick & Important Tables Grid */}
          <Row className="g-4">
            {/* Quick Links Table */}
            <Col lg="6">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 rounded">
                    {footer.quickLinks.length}
                  </span>
                  <span>{isHindi ? "त्वरित लिंक्स (Quick Links)" : "Quick Links"}</span>
                </h6>
              </div>
              <div className="table-responsive border rounded-3 overflow-hidden">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "शीर्षक (EN)" : "Title (EN)"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "शीर्षक (HI)" : "Title (HI)"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "URL" : "URL"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3 text-center" style={{ width: "110px" }}>{isHindi ? "कार्रवाई" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {footer.quickLinks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4 small">
                          {isHindi ? "कोई त्वरित लिंक उपलब्ध नहीं है" : "No quick links added yet"}
                        </td>
                      </tr>
                    ) : (
                      footer.quickLinks.map((link, idx) => (
                        <tr key={link._id || idx}>
                          <td className="fw-medium text-dark px-3 py-2">{link.titleEn}</td>
                          <td className="text-muted px-3 py-2">{link.titleHin}</td>
                          <td className="px-3 py-2 small text-truncate" style={{ maxWidth: "120px" }}>
                            <code className="text-primary">{link.url}</code>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                color="light"
                                className="border text-primary px-2 py-1"
                                onClick={() => handleEditLink("quick", link, idx)}
                                title={isHindi ? "संपादित करें" : "Edit"}
                              >
                                <FaEdit style={{ fontSize: "12px" }} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="border text-danger px-2 py-1"
                                onClick={() => deleteAnyLink("quick", link, idx)}
                                title={isHindi ? "हटाएं" : "Delete"}
                              >
                                <FaTrash style={{ fontSize: "11px" }} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>

            {/* Important Links Table */}
            <Col lg="6">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <span className="badge bg-info bg-opacity-10 text-info px-2 py-1 rounded">
                    {footer.importantLinks.length}
                  </span>
                  <span>{isHindi ? "महत्वपूर्ण लिंक्स (Important Links)" : "Important Links"}</span>
                </h6>
              </div>
              <div className="table-responsive border rounded-3 overflow-hidden">
                <Table hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "शीर्षक (EN)" : "Title (EN)"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "शीर्षक (HI)" : "Title (HI)"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3">{isHindi ? "URL" : "URL"}</th>
                      <th className="fw-semibold text-secondary small py-2 px-3 text-center" style={{ width: "110px" }}>{isHindi ? "कार्रवाई" : "Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {footer.importantLinks.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-4 small">
                          {isHindi ? "कोई महत्वपूर्ण लिंक उपलब्ध नहीं है" : "No important links added yet"}
                        </td>
                      </tr>
                    ) : (
                      footer.importantLinks.map((link, idx) => (
                        <tr key={link._id || idx}>
                          <td className="fw-medium text-dark px-3 py-2">{link.titleEn}</td>
                          <td className="text-muted px-3 py-2">{link.titleHin}</td>
                          <td className="px-3 py-2 small text-truncate" style={{ maxWidth: "120px" }}>
                            <code className="text-info">{link.url}</code>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="d-flex gap-1 justify-content-center">
                              <Button
                                size="sm"
                                color="light"
                                className="border text-primary px-2 py-1"
                                onClick={() => handleEditLink("important", link, idx)}
                                title={isHindi ? "संपादित करें" : "Edit"}
                              >
                                <FaEdit style={{ fontSize: "12px" }} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="border text-danger px-2 py-1"
                                onClick={() => deleteAnyLink("important", link, idx)}
                                title={isHindi ? "हटाएं" : "Delete"}
                              >
                                <FaTrash style={{ fontSize: "11px" }} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </div>

        {/* ── Section 3: Social Media Links ────────────────────────────── */}
        <div className="border rounded-3 p-3 bg-white shadow-xs">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <FaShareAlt className="text-primary" />
              <h6 className="mb-0 fw-bold text-dark fs-6">
                {isHindi ? "सोशल मीडिया लिंक्स (Social Media Channels)" : "Social Media Links"}
              </h6>
            </div>
            {editRow.data && editRow.type === "social" && (
              <Badge color="warning" className="px-2 py-1 fs-xs">
                {isHindi ? "सोशल लिंक संपादन मोड" : "Editing Social Link"}
              </Badge>
            )}
          </div>
          {/* Add / Update Social Form Bar */}
          <div className="p-3 border rounded-3 bg-light bg-opacity-50 mb-4">
            <Row className="g-3 align-items-end">
              <Col md="6" lg="4">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "प्लेटफ़ॉर्म नाम *" : "Platform Name *"}
                  </Label>
                  <Input
                    placeholder="e.g. YouTube, Facebook, Twitter, LinkedIn"
                    value={newSocial.platform}
                    invalid={!!errors.socialPlatform}
                    onChange={e => {
                      const value = e.target.value;
                      setNewSocial(prev => ({ ...prev, platform: value }));
                      setErrors(prev => ({ ...prev, socialPlatform: validateRequired(value) }));
                    }}
                    className="shadow-none bg-white"
                  />
                  {errors.socialPlatform && <FormFeedback>{errors.socialPlatform}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md="6" lg="6">
                <FormGroup className="mb-0">
                  <Label className="fw-semibold text-secondary small">
                    {isHindi ? "पूरा प्रोफ़ाइल URL *" : "Full Profile URL *"}
                  </Label>
                  <Input
                    placeholder="https://youtube.com/@beyondsend, https://x.com/..."
                    value={newSocial.url}
                    invalid={!!errors.socialUrl}
                    onChange={e => {
                      const value = e.target.value;
                      setNewSocial(prev => ({ ...prev, url: value }));
                      setErrors(prev => ({ ...prev, socialUrl: validateSocialUrl(value) }));
                    }}
                    className="shadow-none bg-white"
                  />
                  {errors.socialUrl && <FormFeedback>{errors.socialUrl}</FormFeedback>}
                </FormGroup>
              </Col>

              <Col md="12" lg="2" className="d-flex gap-2">
                <Button
                  color={editRow.data && editRow.type === "social" ? "warning" : "primary"}
                  onClick={addOrUpdateLink}
                  className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 shadow-sm"
                  style={{ minHeight: "38px" }}
                >
                  {editRow.data && editRow.type === "social" ? (
                    <>{isHindi ? "अपडेट" : "Update"}</>
                  ) : (
                    <>
                      <FaPlus style={{ fontSize: "11px" }} />
                      <span>{isHindi ? "जोड़ें" : "Add Social"}</span>
                    </>
                  )}
                </Button>

                {editRow.data && editRow.type === "social" && (
                  <Button
                    color="secondary"
                    outline
                    onClick={cancelEdit}
                    title={isHindi ? "रद्द करें" : "Cancel"}
                    className="px-2"
                  >
                    <FaTimes />
                  </Button>
                )}
              </Col>
            </Row>
          </div>

          {/* Social Links Table */}
          <div className="table-responsive border rounded-3 overflow-hidden">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold text-secondary small py-2 px-3" style={{ width: "220px" }}>
                    {isHindi ? "प्लेटफ़ॉर्म" : "Platform"}
                  </th>
                  <th className="fw-semibold text-secondary small py-2 px-3">
                    {isHindi ? "URL लिंक" : "Target URL"}
                  </th>
                  <th className="fw-semibold text-secondary small py-2 px-3 text-center" style={{ width: "120px" }}>
                    {isHindi ? "कार्रवाई" : "Action"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {footer.socialLinks.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-4 small">
                      {isHindi ? "कोई सोशल मीडिया लिंक उपलब्ध नहीं है" : "No social media links added yet"}
                    </td>
                  </tr>
                ) : (
                  footer.socialLinks.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td className="fw-medium text-dark px-3 py-2 d-flex align-items-center gap-2">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1 rounded">
                          {item.platform}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-primary d-inline-flex align-items-center gap-1 small"
                        >
                          <span className="text-break">{item.url}</span>
                          <FaExternalLinkAlt style={{ fontSize: "10px" }} />
                        </a>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            size="sm"
                            color="light"
                            className="border text-primary px-2 py-1"
                            onClick={() => handleEditSocial(item, idx)}
                            title={isHindi ? "संपादित करें" : "Edit"}
                          >
                            <FaEdit style={{ fontSize: "12px" }} />
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="border text-danger px-2 py-1"
                            onClick={() => deleteAnyLink("social", item, idx)}
                            title={isHindi ? "हटाएं" : "Delete"}
                          >
                            <FaTrash style={{ fontSize: "11px" }} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </CardBody>
    </Card>
  </>
);
};

export default FooterSection;
