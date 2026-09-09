import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  FormGroup,
  Label,
  Input,
  Badge,
  Row,
  Col,
  Spinner,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  CardHeader
} from "reactstrap";
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaImage, FaCalendar, FaArrowLeft, FaList, FaCopy, FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";
import PageLoader from "../../components/PageLoader";
import DynamicContentEditor from "../../utilities/DynamicContentEditor";
import { encodeBase64, decodeBase64 } from "../../utilities/rXBase64";

const STORAGE_KEYS = {
  tab: "announcements_active_tab",
  editingId: "announcements_editing_id",
  formData: "announcements_form_data"
};

const initialState = {
  titleEn: "",
  titleHi: "",
  slug: "",
  shortDescriptionEn: "",
  shortDescriptionHi: "",
  descriptionEn: "",
  descriptionHi: "",
  categoryId: "",
  image: null,
  fromDate: "",
  expiryDate: "",
  displayOrder: 0,
  isSchemes: false,
  isActive: true
};

// Safe JSON reader for sessionStorage
const readStoredJSON = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const AnnouncementsManagement = () => {
  const { isHindi } = useLanguage();
  const API = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const isSubmittingRef = useRef(false);

  // ── Restore everything needed to reconstruct the exact UI state on reload ──
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem(STORAGE_KEYS.tab) || "list"
  );
  const [editingId, setEditingId] = useState(
    () => sessionStorage.getItem(STORAGE_KEYS.editingId) || null
  );
  const [formData, setFormData] = useState(() => {
    const stored = readStoredJSON(STORAGE_KEYS.formData, null);
    // 'image' is a File object and can never be restored from storage
    return stored ? { ...initialState, ...stored, image: null } : initialState;
  });

  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Persist state to sessionStorage whenever it changes ──
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEYS.tab, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (editingId) {
      sessionStorage.setItem(STORAGE_KEYS.editingId, editingId);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.editingId);
    }
  }, [editingId]);

  useEffect(() => {
    const { image, ...serializable } = formData; // eslint-disable-line no-unused-vars
    sessionStorage.setItem(STORAGE_KEYS.formData, JSON.stringify(serializable));
  }, [formData]);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopyUrl = (slug, id, isSchemes = false) => {
    const routePrefix = isSchemes ? "scheme" : "announcement";
    const fullUrl = `${window.location.origin}/${routePrefix}/${slug}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(() => {});
    } else {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const generateSlug = useCallback(
    (text) =>
      text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    []
  );

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/get-announcements-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const list = (res.data.data || []).map((item) => ({
        ...item,
        _id: item.id || item._id,
        fromDate: item.fromDate ? item.fromDate.split("T")[0] : "",
        expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
        categoryId: item.categoryId || null,
        isActive: item.isActive !== false,
        isSchemes: !!item.isSchemes
      }));

      setAnnouncements(list);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || "Failed to load announcements"
      });
    } finally {
      setLoading(false);
    }
  }, [API, token, isHindi]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const [annRes, catRes] = await Promise.allSettled([
          axios.get(`${API}/api/get-announcements-list`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/api/get-categories`)
        ]);

        if (!isMounted) return;

        if (annRes.status === "fulfilled") {
          const list = (annRes.value.data?.data || []).map((item) => ({
            ...item,
            _id: item.id || item._id,
            fromDate: item.fromDate ? item.fromDate.split("T")[0] : "",
            expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
            categoryId: item.categoryId || null,
            isActive: item.isActive !== false,
            isSchemes: item.isSchemes === true
          }));
          setAnnouncements(list);
        }

        if (catRes.status === "fulfilled") {
          setCategories(catRes.value.data?.data || []);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [API, token]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // ── Derived value: recompute only when announcements or the scheme flag change ──
  const usedOrders = useMemo(() => {
    return announcements
      .filter((a) => a.isSchemes === formData.isSchemes)
      .map((a) => Number(a.displayOrder))
      .filter((o) => !isNaN(o) && o !== 0);
  }, [announcements, formData.isSchemes]);

  const getNextAvailableOrder = useCallback((requested, used) => {
    let order = requested;
    while (used.includes(order)) order++;
    return order;
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingId(null);
    setFormData(initialState);
    handleTabChange("form");
  }, [handleTabChange]);

  const handleBackToList = useCallback(() => {
    handleTabChange("list");
    setEditingId(null);
    setFormData(initialState);
    fetchAnnouncements();
  }, [handleTabChange, fetchAnnouncements]);

  const handleEdit = useCallback(
    (item) => {
      if (!item) return;
      const itemId = item._id;
      if (!itemId) return;

      setEditingId(itemId);
      setFormData({
        titleEn: item.titleEn || "",
        titleHi: item.titleHi || "",
        slug: item.slug || "",
        shortDescriptionEn: item.shortDescriptionEn || "",
        shortDescriptionHi: item.shortDescriptionHi || "",
        descriptionEn: decodeBase64(item.descriptionEn || ""),
        descriptionHi: decodeBase64(item.descriptionHi || ""),
        categoryId: item.categoryId?._id || "",
        image: null,
        fromDate: item.fromDate,
        expiryDate: item.expiryDate,
        displayOrder:
          item.displayOrder !== undefined && item.displayOrder !== null
            ? String(item.displayOrder)
            : "",
        isSchemes: !!item.isSchemes,
        isActive: item.isActive !== false
      });
      handleTabChange("form");
    },
    [handleTabChange]
  );
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];

    // Clear previous image if no file selected
    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: isHindi ? 'अमान्य फ़ाइल प्रकार' : 'Invalid File Type',
        text: isHindi
          ? 'कृपया केवल JPG, JPEG, या PNG फ़ाइलें अपलोड करें'
          : 'Please upload only JPG, JPEG, or PNG files',
      });
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file size (520 KB = 520 * 1024 bytes)
    const maxSize = 520 * 1024;
    if (file.size > maxSize) {
      const fileSizeKB = (file.size / 1024).toFixed(2);
      Swal.fire({
        icon: 'error',
        title: isHindi ? 'फ़ाइल बहुत बड़ी है' : 'File Too Large',
        text: isHindi
          ? `फ़ाइल का आकार ${fileSizeKB} KB है। कृपया 520 KB से कम की फ़ाइल अपलोड करें।`
          : `File size is ${fileSizeKB} KB. Please upload a file smaller than 520 KB.`,
      });
      e.target.value = ''; // Reset file input
      return;
    }

    // If validation passes, set the file
    setFormData((prev) => ({ ...prev, image: file }));
  }, [isHindi]);
  const handleDelete = useCallback(
    async (id) => {
      const confirm = await Swal.fire({
        title: isHindi ? "क्या आप निश्चित हैं?" : "Are you sure?",
        text: isHindi ? "यह घोषणा हटा दी जाएगी!" : "This announcement will be deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: isHindi ? "हाँ, हटाएं" : "Yes, Delete",
        cancelButtonText: isHindi ? "रद्द करें" : "Cancel"
      });

      if (!confirm.isConfirmed) return;

      try {
        await axios.delete(`${API}/api/delete-announcement/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire({
          icon: "success",
          title: isHindi ? "हटाया गया!" : "Deleted!",
          text: "Announcement deleted successfully",
          timer: 2000,
          showConfirmButton: false
        });
        fetchAnnouncements();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: isHindi ? "त्रुटि" : "Error",
          text: err.response?.data?.message || "Delete failed"
        });
      }
    },
    [API, token, isHindi, fetchAnnouncements]
  );

  const handleSubmit = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setSubmitting(true);

      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "image") return;
        const value = formData[key];
        if (value === null || value === undefined) return;
        if (key === "descriptionEn" || key === "descriptionHi") {
          fd.append(key, encodeBase64(value || ""));
        } else if (typeof value === "boolean") {
          fd.append(key, value.toString());
        } else {
          fd.append(key, value);
        }
      });

      if (formData.image && formData.image instanceof File) {
        fd.append("image", formData.image);
      }

      try {
        let res;
        if (editingId) {
          res = await axios.put(`${API}/api/update-announcement/${editingId}`, fd, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          });
          Swal.fire({
            icon: "success",
            title: isHindi ? "अपडेट किया गया!" : "Updated!",
            text: res.data?.message || "Announcement updated successfully",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          res = await axios.post(`${API}/api/create-announcement`, fd, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`
            }
          });
          Swal.fire({
            icon: "success",
            title: isHindi ? "बनाया गया!" : "Created!",
            text: res.data?.message || "Announcement created successfully",
            timer: 2000,
            showConfirmButton: false
          });
        }
        // Clear session storage
        sessionStorage.removeItem(STORAGE_KEYS.editingId);
        sessionStorage.removeItem(STORAGE_KEYS.formData);
        sessionStorage.removeItem(STORAGE_KEYS.tab);

        // Full page reload after a small delay to show success message
        setTimeout(() => {
          window.location.reload();
        }, 1600);
        handleBackToList();
      } catch (err) {
        console.error("Submit error:", err.response?.data || err.message);
        Swal.fire({
          icon: "error",
          title: isHindi ? "त्रुटि" : "Error",
          text: err.response?.data?.message || err.message || "Operation failed"
        });
      } finally {
        setSubmitting(false);
        isSubmittingRef.current = false;
      }
    },
    [formData, editingId, API, token, isHindi, handleBackToList]
  );

  return (
    <Card className=" ">
      <CardHeader>
        <div className="d-flex justify-content-between align-items-center p-2">
          <h4 className="mb-0 text-white d-flex align-items-center fs-3 fw-3">
            <FaBullhorn className="me-2" />
            {isHindi ? "घोषणाएं एवं योजनाएं प्रबंधन" : "Announcements & Schemes Management"}
          </h4>
          {activeTab === "list" && (
            <Button color="light" onClick={handleAddNew} className="d-flex align-items-center text-success">
              <FaPlus className="me-2" />
              {isHindi ? "नई प्रविष्टि जोड़ें" : "Add Announcement / Scheme"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <Nav tabs className="mb-3">
          <NavItem>
            <NavLink
              active={activeTab === "list"}
              onClick={() => {
                handleTabChange("list");
                fetchAnnouncements();
              }}
              style={{ cursor: "pointer" }}
            >
              <FaList className="me-2" />
              {isHindi ? "घोषणाएं एवं योजनाएं सूची" : "Announcements & Schemes List"}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              active={activeTab === "form"}
              onClick={() => {
                if (!editingId) {
                  setFormData(initialState);
                }
                handleTabChange("form");
              }}
              style={{ cursor: "pointer" }}
            >
              <FaBullhorn className="me-2" />
              {editingId
                ? isHindi
                  ? "संपादित करें"
                  : "Edit Entry"
                : isHindi
                  ? "नई प्रविष्टि"
                  : "New Entry"}
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab}>
          <TabPane tabId="list">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead className="table-light text-uppercase" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                    <tr>
                      <th style={{ width: "45px" }}>#</th>
                      <th style={{ minWidth: "260px" }}>{isHindi ? "शीर्षक / लिंक" : "Title & URL"}</th>
                      <th style={{ minWidth: "155px", whiteSpace: "nowrap" }}>{isHindi ? "प्रकार" : "Type"}</th>
                      <th style={{ minWidth: "120px", whiteSpace: "nowrap" }}>{isHindi ? "श्रेणी" : "Category"}</th>
                      <th style={{ minWidth: "115px", whiteSpace: "nowrap" }}>{isHindi ? "प्रारंभ तिथि" : "From Date"}</th>
                      <th style={{ minWidth: "115px", whiteSpace: "nowrap" }}>{isHindi ? "समाप्ति तिथि" : "Expiry Date"}</th>
                      <th style={{ minWidth: "110px", whiteSpace: "nowrap" }}>{isHindi ? "स्थिति" : "Status"}</th>
                      <th style={{ minWidth: "100px", whiteSpace: "nowrap" }}>{isHindi ? "क्रियाएं" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-5">
                          {isHindi ? "कोई घोषणा या योजना नहीं मिली" : "No announcements or schemes found"}
                        </td>
                      </tr>
                    ) : (
                      announcements.map((item, i) => (
                        <tr key={item._id || item.id}>
                          <td className="fw-semibold text-muted">{i + 1}</td>
                          <td>
                            <div className="fw-semibold text-dark" style={{ fontSize: "0.92rem", lineHeight: "1.35" }}>
                              {item.titleEn}
                            </div>
                            {item.titleHi && (
                              <div className="text-muted small mt-0.5" style={{ fontSize: "0.82rem" }}>
                                {item.titleHi}
                              </div>
                            )}
                            <div className="d-flex align-items-center gap-1 mt-1.5 flex-nowrap" style={{ maxWidth: "100%" }}>
                              <code
                                className="px-2 py-0.5 rounded bg-light border text-primary text-truncate"
                                style={{ fontSize: "11px", maxWidth: "300px", display: "inline-block" }}
                                title={`${window.location.origin}/${item.isSchemes ? "scheme" : "announcement"}/${item.slug}`}
                              >
                                {`${window.location.origin}/${item.isSchemes ? "scheme" : "announcement"}/${item.slug}`}
                              </code>
                              <Button
                                size="sm"
                                color={copiedId === (item._id || item.id) ? "success" : "light"}
                                className="border py-0 px-2 d-inline-flex align-items-center gap-1 flex-shrink-0"
                                style={{ fontSize: "11px", height: "22px" }}
                                onClick={() => handleCopyUrl(item.slug, (item._id || item.id), item.isSchemes)}
                                title={copiedId === (item._id || item.id) ? "Copied!" : "Copy Full URL"}
                                type="button"
                              >
                                {copiedId === (item._id || item.id) ? (
                                  <>
                                    <FaCheck size={10} /> <span style={{ fontSize: "10.5px" }}>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <FaCopy size={10} /> <span style={{ fontSize: "10.5px" }}>Copy</span>
                                  </>
                                )}
                              </Button>
                              <a
                                href={`/${item.isSchemes ? "scheme" : "announcement"}/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-light border py-0 px-1.5 d-inline-flex align-items-center text-secondary flex-shrink-0"
                                style={{ fontSize: "11px", height: "22px" }}
                                title="Open in new tab"
                              >
                                <FaExternalLinkAlt size={9} />
                              </a>
                            </div>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {item.isSchemes ? (
                              <span
                                className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-bold text-white shadow-sm"
                                style={{
                                  fontSize: "12px",
                                  background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                  letterSpacing: "0.2px",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                <span>🎯</span>
                                <span>{isHindi ? "योजना" : "Scheme"}</span>
                              </span>
                            ) : (
                              <span
                                className="d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-pill fw-bold text-white shadow-sm"
                                style={{
                                  fontSize: "12px",
                                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                  letterSpacing: "0.2px",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                <span>📢</span>
                                <span>{isHindi ? "घोषणा" : "Announcement"}</span>
                              </span>
                            )}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span
                              className="d-inline-flex align-items-center px-3 py-1 rounded-pill fw-semibold"
                              style={{
                                fontSize: "11.5px",
                                background: "#f1f5f9",
                                color: "#334155",
                                border: "1px solid #cbd5e1",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {item.categoryId?.nameEn || "N/A"}
                            </span>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <small className="text-muted d-inline-flex align-items-center" style={{ whiteSpace: "nowrap" }}>
                              <FaCalendar className="me-1 text-secondary" size={11} />
                              {item.fromDate ? new Date(item.fromDate).toLocaleDateString("en-IN") : "—"}
                            </small>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <small className="text-muted d-inline-flex align-items-center" style={{ whiteSpace: "nowrap" }}>
                              <FaCalendar className="me-1 text-secondary" size={11} />
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-IN") : "—"}
                            </small>
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span
                              className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold"
                              style={{
                                fontSize: "12px",
                                background: item.isActive ? "#ecfdf5" : "#f1f5f9",
                                color: item.isActive ? "#065f46" : "#475569",
                                border: `1px solid ${item.isActive ? "#6ee7b7" : "#cbd5e1"}`,
                                whiteSpace: "nowrap"
                              }}
                            >
                              <span
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: "50%",
                                  background: item.isActive ? "#10b981" : "#94a3b8",
                                  flexShrink: 0
                                }}
                              />
                              <span>
                                {item.isActive
                                  ? isHindi ? "सक्रिय" : "Active"
                                  : isHindi ? "निष्क्रिय" : "Inactive"}
                              </span>
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                              <Button size="sm" color="info" onClick={() => handleEdit(item)} title="Edit" type="button">
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(item._id || item.id)}
                                title="Delete"
                                type="button"
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
            )}
          </TabPane>

          {/* FORM TAB */}
          <TabPane tabId="form">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom flex-wrap gap-2">
              <Button color="link" onClick={handleBackToList} className="p-0 text-decoration-none fw-semibold text-primary d-inline-flex align-items-center" type="button">
                <FaArrowLeft className="me-2" />
                {isHindi ? "सूची पर वापस जाएं" : "Back to List"}
              </Button>

              <div className="d-flex align-items-center gap-2">
                <Button color="light" className="border px-3" onClick={handleBackToList} disabled={submitting} type="button">
                  {isHindi ? "रद्द करें" : "Cancel"}
                </Button>
                <Button color="success" className="px-4 fw-semibold shadow-sm" onClick={handleSubmit} disabled={submitting} type="button">
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {isHindi ? "सहेज रहा है..." : "Processing..."}
                    </>
                  ) : editingId ? (
                    isHindi ? "अपडेट करें" : "Update"
                  ) : (
                    isHindi ? "बनाएं" : "Create"
                  )}
                </Button>
              </div>
            </div>

            {/* ── Top Options & Configuration Strip ── */}
            <div className="p-3 mb-4 rounded-3 border bg-light d-flex align-items-center justify-content-between flex-wrap gap-3 shadow-sm">
              {/* Type Selection: Scheme vs Announcement */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
                  {isHindi ? "प्रकार चुनें:" : "Select Type:"}
                </span>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 rounded-start-pill ${
                      formData.isSchemes
                        ? "btn-success text-white shadow-sm"
                        : "btn-outline-secondary bg-white text-muted"
                    }`}
                    style={
                      formData.isSchemes
                        ? { background: "linear-gradient(135deg, #059669 0%, #047857 100%)", border: "1px solid #047857" }
                        : {}
                    }
                    onClick={() => setFormData((prev) => ({ ...prev, isSchemes: true }))}
                  >
                    🎯 <span>{isHindi ? "योजना (Scheme)" : "Scheme"}</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 rounded-end-pill ${
                      !formData.isSchemes
                        ? "btn-primary text-white shadow-sm"
                        : "btn-outline-secondary bg-white text-muted"
                    }`}
                    style={
                      !formData.isSchemes
                        ? { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", border: "1px solid #1d4ed8" }
                        : {}
                    }
                    onClick={() => setFormData((prev) => ({ ...prev, isSchemes: false }))}
                  >
                    📢 <span>{isHindi ? "घोषणा (Announcement)" : "Announcement"}</span>
                  </button>
                </div>
              </div>

              {/* Status Toggle: Active vs Inactive */}
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark small" style={{ fontSize: "0.85rem" }}>
                  {isHindi ? "स्थिति:" : "Status:"}
                </span>
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 rounded-start-pill ${
                      formData.isActive
                        ? "btn-success text-white shadow-sm"
                        : "btn-outline-secondary bg-white text-muted"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, isActive: true }))}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: formData.isActive ? "#ffffff" : "#94a3b8" }} />
                    <span>{isHindi ? "सक्रिय (Active)" : "Active"}</span>
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm px-3 py-1.5 fw-bold d-inline-flex align-items-center gap-1.5 rounded-end-pill ${
                      !formData.isActive
                        ? "btn-secondary text-white shadow-sm"
                        : "btn-outline-secondary bg-white text-muted"
                    }`}
                    onClick={() => setFormData((prev) => ({ ...prev, isActive: false }))}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: !formData.isActive ? "#ffffff" : "#94a3b8" }} />
                    <span>{isHindi ? "निष्क्रिय (Inactive)" : "Inactive"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
                  e.preventDefault();
                }
              }}
            >
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Title (English) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      required
                      name="titleEn"
                      value={formData.titleEn}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          titleEn: val,
                          slug: editingId ? prev.slug : generateSlug(val)
                        }));
                      }}
                      placeholder="Enter English title"
                    />
                  </FormGroup>
                </Col>

                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Title (Hindi) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      required
                      value={formData.titleHi}
                      name="titleHi"
                      onChange={(e) => setFormData((prev) => ({ ...prev, titleHi: e.target.value }))}
                      placeholder="हिंदी शीर्षक दर्ज करें"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Short Description (English) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      required
                      rows="3"
                      value={formData.shortDescriptionEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shortDescriptionEn: e.target.value }))}
                      placeholder="Brief description in English"
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Short Description (Hindi) <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="textarea"
                      required
                      rows="3"
                      value={formData.shortDescriptionHi}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shortDescriptionHi: e.target.value }))}
                      placeholder="हिंदी में संक्षिप्त विवरण"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">Slug</Label>
                    <Input 
                      name="slug" 
                      value={formData.slug} 
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    />
                    <small className="text-muted">Auto-generated from Title (Editable)</small>
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Category <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="select"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat._id || cat.id} value={cat._id || cat.id}>
                          {cat.categoryNameEn} ({cat.categoryNameHi})
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      <FaImage className="me-2" />
                      Image (JPG, JPEG, PNG - Max 520KB)
                    </Label>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleImageChange}
                    />
                    <small className="text-muted">Optional - Leave empty to keep existing</small>

                    {/* Show file info if image is selected */}
                    {formData.image && (
                      <div className="mt-2">
                        <Badge color="success" className="me-2">
                          <FaImage className="me-1" />
                          File Selected
                        </Badge>
                        <small className="text-muted">
                          {(formData.image.size / 1024).toFixed(2)} KB
                        </small>
                        <Button
                          size="sm"
                          color="danger"
                          className="ms-2"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image: null }));
                            // Reset file input
                            const fileInput = document.querySelector('input[type="file"]');
                            if (fileInput) fileInput.value = '';
                          }}
                          type="button"
                        >
                          <FaTrash className="me-1" />
                          Remove
                        </Button>
                      </div>
                    )}
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">Display Order</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.displayOrder}
                      name="displayOrder"
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (!val) {
                          setFormData((prev) => ({ ...prev, displayOrder: "" }));
                          return;
                        }
                        const nextOrder = getNextAvailableOrder(val, usedOrders);
                        setFormData((prev) => ({
                          ...prev,
                          displayOrder: String(nextOrder)
                        }));
                      }}
                    />
                    <small className="text-muted">If entered order exists, next available order is auto-selected</small>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      From Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      name="fromDate"
                      required
                      value={formData.fromDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="fw-semibold">
                      Expiry Date <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="date"
                      required
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <hr className="my-4" />

              <Row>
                <Col md={12}>
                  <FormGroup className="mb-3">
                    <Label className="fw-semibold mb-2">
                      Description (English & Hindi) <span className="text-danger">*</span>
                    </Label>
                    <DynamicContentEditor
                      engField="descriptionEn"
                      hinField="descriptionHi"
                      height={360}
                      initialEn={formData.descriptionEn}
                      initialHi={formData.descriptionHi}
                      onChange={(contentObj) => {
                        setFormData(prev => ({
                          ...prev,
                          descriptionEn: contentObj.descriptionEn,
                          descriptionHi: contentObj.descriptionHi,
                        }));
                      }}
                      instanceId="content_editor"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>
          </TabPane>
        </TabContent>
      </CardBody>
    </Card>
  );
};

export default AnnouncementsManagement;