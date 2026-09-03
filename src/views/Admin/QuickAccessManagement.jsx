import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  Form,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  Badge,
  CardHeader,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import IconPicker from "../../components/IconPicker";
import { ICONS } from "../../utilities/icons";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaGlobe,
  FaToggleOn,
  FaToggleOff,
  FaThLarge,
  FaExternalLinkAlt
} from "react-icons/fa";
import { useLanguage } from "../../contexts/LanguageContext";

const COLOR_PRESETS = [
  { name: "Indigo", color: "#6366f1", bg: "#e0e7ff" },
  { name: "Emerald", color: "#10b981", bg: "#d1fae5" },
  { name: "Amber", color: "#f59e0b", bg: "#fef3c7" },
  { name: "Red", color: "#ef4444", bg: "#fee2e2" },
  { name: "Blue", color: "#3b82f6", bg: "#dbeafe" },
  { name: "Pink", color: "#ec4899", bg: "#fce7f3" },
  { name: "Purple", color: "#8b5cf6", bg: "#ede9fe" },
  { name: "Teal", color: "#0d9488", bg: "#ccfbf1" },
];

const QuickAccessManagement = () => {
  const API = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const { isHindi } = useLanguage();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(false);
  const [iconModal, setIconModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    titleEn: "",
    titleHi: "",
    link: "",
    icon: "FaUserGraduate",
    color: "#6366f1",
    bg: "#e0e7ff",
    isExternal: false,
    order: 0,
    isActive: true
  });

  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  /* ================= LOAD QUICK ACCESS ================= */
  const loadItems = async () => {
    try {
      const res = await axios.get(`${API}/api/quick-access-for-admin`, getAuthConfig());
      if (res.data?.data) {
        setItems(res.data.data);
      } else if (Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      try {
        const publicRes = await axios.get(`${API}/api/quick-access`);
        if (publicRes.data?.data) setItems(publicRes.data.data);
      } catch {
        console.error("Failed to load quick access:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const res = await axios.get(`${API}/api/quick-access-for-admin`, getAuthConfig());
        if (isMounted) {
          if (res.data?.data) setItems(res.data.data);
          else if (Array.isArray(res.data)) setItems(res.data);
        }
      } catch {
        try {
          const publicRes = await axios.get(`${API}/api/quick-access`);
          if (isMounted && publicRes.data?.data) setItems(publicRes.data.data);
        } catch (e) {
          console.error("Failed to load initial quick access:", e);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, token]);

  /* ================= OPEN ADD MODAL ================= */
  const openAdd = () => {
    setEditId(null);
    const nextColor = COLOR_PRESETS[items.length % COLOR_PRESETS.length];
    setForm({
      titleEn: "",
      titleHi: "",
      link: "",
      icon: "FaUserGraduate",
      color: nextColor.color,
      bg: nextColor.bg,
      isExternal: false,
      order: items.length + 1,
      isActive: true
    });
    setModal(true);
  };

  /* ================= OPEN EDIT MODAL ================= */
  const openEdit = (item) => {
    setEditId(item._id || item.id);
    setForm({
      titleEn: item.titleEn || item.titleEng || item.name || "",
      titleHi: item.titleHi || item.titleHin || "",
      link: item.link || item.url || "",
      icon: item.icon || "FaUserGraduate",
      color: item.color || "#6366f1",
      bg: item.bg || "#e0e7ff",
      isExternal: Boolean(item.isExternal),
      order: item.order ?? items.indexOf(item) + 1,
      isActive: item.isActive !== false
    });
    setModal(true);
  };

  /* ================= SAVE (CREATE / UPDATE) ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.titleEn.trim() || !form.link.trim()) {
      return Swal.fire({
        icon: "warning",
        title: isHindi ? "अधूरी जानकारी" : "Incomplete Form",
        text: isHindi ? "शीर्षक और लिंक आवश्यक हैं।" : "Title and Link are required."
      });
    }

    const payload = {
      titleEn: form.titleEn.trim(),
      titleHi: form.titleHi.trim() || form.titleEn.trim(),
      titleEng: form.titleEn.trim(),
      titleHin: form.titleHi.trim() || form.titleEn.trim(),
      link: form.link.trim(),
      url: form.link.trim(),
      icon: form.icon,
      color: form.color,
      bg: form.bg,
      isExternal: form.isExternal,
      order: Number(form.order) || 1,
      isActive: form.isActive
    };

    try {
      setSaving(true);
      if (editId) {
        await axios.put(`${API}/api/quick-access/${editId}`, payload, getAuthConfig());
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफलतापूर्वक अपडेट किया गया" : "Updated Successfully",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await axios.post(`${API}/api/quick-access`, payload, getAuthConfig());
        Swal.fire({
          icon: "success",
          title: isHindi ? "सफलतापूर्वक जोड़ा गया" : "Created Successfully",
          timer: 1500,
          showConfirmButton: false
        });
      }
      setModal(false);
      loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: isHindi ? "त्रुटि" : "Error",
        text: err.response?.data?.message || "Failed to save Quick Access card."
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= TOGGLE STATUS ================= */
  const handleToggleStatus = async (item) => {
    const id = item._id || item.id;
    try {
      await axios.patch(`${API}/api/quick-access/${id}/toggle-status`, {}, getAuthConfig());
      loadItems();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Toggle Failed",
        text: err.response?.data?.message || "Could not toggle status"
      });
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (item) => {
    const id = item._id || item.id;
    const title = item.titleEn || item.titleEng || "this item";

    Swal.fire({
      title: isHindi ? "क्या आप हटाना चाहते हैं?" : "Are you sure?",
      text: `Delete "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: isHindi ? "हाँ, हटाएं" : "Yes, Delete"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API}/api/quick-access/${id}`, getAuthConfig());
          Swal.fire({
            icon: "success",
            title: isHindi ? "हटा दिया गया" : "Deleted",
            timer: 1500,
            showConfirmButton: false
          });
          loadItems();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Delete Failed",
            text: err.response?.data?.message || "Failed to delete"
          });
        }
      }
    });
  };

  // Resolve Preview Icon
  const PreviewIcon = form.icon && ICONS[form.icon] ? ICONS[form.icon] : FaThLarge;

  return (
    <div className="p-3 p-md-4">
      {/* HEADER BANNER */}
      <div
        className="d-flex flex-wrap justify-content-between align-items-center p-3.5 mb-4 rounded-4 shadow-sm text-white"
        style={{
          background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)"
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 p-2.5 d-flex align-items-center justify-content-center"
            style={{ background: "rgba(255,255,255,0.18)" }}
          >
            <FaThLarge size={22} color="#fff" />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-white" style={{ fontSize: "1.25rem" }}>
              {isHindi ? "त्वरित पहुंच प्रबंधन" : "Quick Access Management"}
            </h4>
            <small className="text-white-50">
              {isHindi
                ? "होम पेज पर प्रदर्शित होने वाले 6-कार्ड त्वरित पहुंच लिंक का प्रबंधन करें"
                : "Manage dynamic 6-card curated student & academic service shortcuts on the homepage"}
            </small>
          </div>
        </div>

        <Button
          color="light"
          className="fw-bold d-flex align-items-center gap-2 shadow-xs text-teal mt-2 mt-sm-0"
          style={{ color: "#065f46", borderRadius: "10px" }}
          onClick={openAdd}
        >
          <FaPlus size={13} />
          {isHindi ? "नया लिंक जोड़ें" : "Add Quick Access Card"}
        </Button>
      </div>

      {/* MAIN TABLE CARD */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
        <CardHeader className="bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-dark">
            {isHindi ? "त्वरित पहुंच कार्ड सूची" : "Homepage Quick Access Cards"}
          </h6>
          <Badge color="light" className="text-dark border">
            {items.length} {isHindi ? "प्रविष्टियां" : "Items"}
          </Badge>
        </CardHeader>

        <CardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" />
              <p className="text-muted mt-2 small">{isHindi ? "लोड हो रहा है..." : "Loading records..."}</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-5">
              <FaThLarge size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-secondary mb-1">No Quick Access Cards Found</h6>
              <p className="text-muted small">Click "Add Quick Access Card" to create your first shortcut.</p>
              <Button color="primary" size="sm" onClick={openAdd}>
                <FaPlus className="me-1" /> Add Card
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead style={{ background: "#f8fafc" }}>
                  <tr>
                    <th className="ps-4" style={{ width: "60px" }}>Order</th>
                    <th>Icon & Color</th>
                    <th>Title (English)</th>
                    <th>Title (Hindi)</th>
                    <th>Target Route / URL</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th className="text-end pe-4" style={{ width: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const titleEn = item.titleEn || item.titleEng || item.name || "-";
                    const titleHi = item.titleHi || item.titleHin || "-";
                    const linkUrl = item.link || item.url || "-";
                    const color = item.color || "#6366f1";
                    const bg = item.bg || "#e0e7ff";
                    const ItemIcon = item.icon && ICONS[item.icon] ? ICONS[item.icon] : FaThLarge;
                    const isActive = item.isActive !== false;

                    return (
                      <tr key={item._id || item.id || index}>
                        <td className="ps-4 fw-bold text-muted">{item.order ?? index + 1}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: "38px", height: "38px", background: bg, color: color }}
                            >
                              <ItemIcon size={18} />
                            </div>
                            <small className="text-muted font-monospace">{item.icon || "FaThLarge"}</small>
                          </div>
                        </td>
                        <td className="fw-bold text-dark">{titleEn}</td>
                        <td className="text-secondary">{titleHi}</td>
                        <td>
                          <code className="text-primary small px-2 py-1 bg-light rounded">
                            {linkUrl}
                          </code>
                        </td>
                        <td>
                          {item.isExternal ? (
                            <Badge color="warning" pill className="d-inline-flex align-items-center gap-1">
                              <FaExternalLinkAlt size={9} /> External
                            </Badge>
                          ) : (
                            <Badge color="info" pill className="d-inline-flex align-items-center gap-1">
                              <FaGlobe size={9} /> Internal
                            </Badge>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm p-0 border-0"
                            onClick={() => handleToggleStatus(item)}
                            title="Click to toggle active status"
                          >
                            {isActive ? (
                              <Badge color="success" pill className="d-inline-flex align-items-center gap-1">
                                <FaToggleOn size={13} /> Active
                              </Badge>
                            ) : (
                              <Badge color="secondary" pill className="d-inline-flex align-items-center gap-1">
                                <FaToggleOff size={13} /> Inactive
                              </Badge>
                            )}
                          </button>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1.5">
                            <Button
                              color="light"
                              size="sm"
                              className="border text-primary shadow-2xs"
                              onClick={() => openEdit(item)}
                              title="Edit"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              color="light"
                              size="sm"
                              className="border text-danger shadow-2xs"
                              onClick={() => handleDelete(item)}
                              title="Delete"
                            >
                              <FaTrash />
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

      {/* CREATE / EDIT MODAL */}
      <Modal isOpen={modal} toggle={() => setModal(!modal)} size="lg" centered>
        <ModalHeader toggle={() => setModal(!modal)} className="border-bottom pb-2">
          <div className="d-flex align-items-center gap-2">
            <FaThLarge className="text-teal" style={{ color: "#0d9488" }} />
            <span className="fw-bold">
              {editId ? (isHindi ? "कार्ड संपादित करें" : "Edit Quick Access Card") : (isHindi ? "नया कार्ड जोड़ें" : "Add New Quick Access Card")}
            </span>
          </div>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <ModalBody className="p-4">
            <Row className="g-3">
              {/* ENGLISH TITLE */}
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark">
                    Title (English) <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Admissions"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              {/* HINDI TITLE */}
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark">
                    Title (Hindi / हिन्दी)
                  </Label>
                  <Input
                    type="text"
                    placeholder="उदा. प्रवेश"
                    value={form.titleHi}
                    onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
                  />
                </FormGroup>
              </Col>

              {/* TARGET ROUTE / URL */}
              <Col md={8}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark">
                    Target Page Route / URL <span className="text-danger">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. /admissions or https://portal.cg.nic.in"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    required
                  />
                  <small className="text-muted">
                    Use relative path (e.g. <code>/schemes</code>, <code>/downloads</code>) for internal pages or full URL for external sites.
                  </small>
                </FormGroup>
              </Col>

              {/* DISPLAY ORDER */}
              <Col md={4}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark">Display Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                  />
                </FormGroup>
              </Col>

              {/* ICON PICKER */}
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark d-flex justify-content-between align-items-center">
                    <span>Card Icon</span>
                    <Button
                      color="link"
                      size="sm"
                      className="p-0 text-decoration-none fw-bold"
                      onClick={() => setIconModal(true)}
                    >
                      Browse All Icons
                    </Button>
                  </Label>
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center shadow-xs"
                      style={{
                        width: "44px",
                        height: "44px",
                        background: form.bg,
                        color: form.color
                      }}
                    >
                      <PreviewIcon size={20} />
                    </div>
                    <Input
                      type="text"
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="Icon name (e.g. FaUserGraduate)"
                    />
                  </div>
                </FormGroup>
              </Col>

              {/* COLOR PRESETS */}
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="fw-bold small text-dark">Color Theme Preset</Label>
                  <div className="d-flex flex-wrap gap-2 pt-1">
                    {COLOR_PRESETS.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        className="rounded-circle border-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: "28px",
                          height: "28px",
                          background: p.color,
                          boxShadow: form.color === p.color ? "0 0 0 3px #0d9488" : "none",
                          cursor: "pointer"
                        }}
                        onClick={() => setForm({ ...form, color: p.color, bg: p.bg })}
                        title={p.name}
                      />
                    ))}
                  </div>
                </FormGroup>
              </Col>

              {/* SWITCHES */}
              <Col md={6}>
                <FormGroup switch className="pt-2">
                  <Input
                    type="switch"
                    id="isExternalSwitch"
                    checked={form.isExternal}
                    onChange={(e) => setForm({ ...form, isExternal: e.target.checked })}
                  />
                  <Label for="isExternalSwitch" check className="fw-semibold small">
                    Opens in New Tab (External Link)
                  </Label>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup switch className="pt-2">
                  <Input
                    type="switch"
                    id="isActiveSwitch"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <Label for="isActiveSwitch" check className="fw-semibold small">
                    Active & Visible on Homepage
                  </Label>
                </FormGroup>
              </Col>

              {/* LIVE PREVIEW BOX */}
              <Col xs={12}>
                <div className="p-3 bg-light rounded-3 border">
                  <small className="fw-bold text-muted d-block mb-2 text-uppercase" style={{ fontSize: "11px" }}>
                    Live Homepage Card Preview
                  </small>
                  <div style={{ maxWidth: "180px" }}>
                    <div
                      className="gov-interactive-card text-center p-3 d-flex flex-column align-items-center justify-content-between rounded-3 bg-white shadow-xs"
                      style={{
                        borderTop: `4px solid ${form.color}`,
                        minHeight: "130px"
                      }}
                    >
                      <div
                        className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "44px",
                          height: "44px",
                          background: form.bg,
                          color: form.color
                        }}
                      >
                        <PreviewIcon size={18} />
                      </div>
                      <p className="mb-0 fw-bold text-dark lh-sm text-truncate w-100" style={{ fontSize: "13px" }}>
                        {form.titleEn || "Preview Title"}
                      </p>
                      <p className="mb-0 text-muted mt-1 text-truncate w-100" style={{ fontSize: "11px" }}>
                        {form.titleHi || "हिन्दी शीर्षक"}
                      </p>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </ModalBody>

          <ModalFooter className="border-top">
            <Button color="light" onClick={() => setModal(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="text-white fw-bold px-4"
              style={{ background: "linear-gradient(135deg, #0d9488 0%, #065f46 100%)", border: "none" }}
              disabled={saving}
            >
              {saving ? <Spinner size="sm" className="me-1" /> : null}
              {editId ? "Update Card" : "Save Card"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ICON PICKER MODAL */}
      <IconPicker
        isOpen={iconModal}
        toggle={() => setIconModal(!iconModal)}
        onSelect={(selectedIcon) => {
          setForm({ ...form, icon: selectedIcon });
          setIconModal(false);
        }}
        selectedIcon={form.icon}
      />
    </div>
  );
};

export default QuickAccessManagement;
