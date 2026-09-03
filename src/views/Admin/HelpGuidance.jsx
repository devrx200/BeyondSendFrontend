import { useCallback, useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Form, Label, Input, Badge, Spinner,
  Container, Row, Col, Collapse
} from "reactstrap";
import {
  FaPlus, FaEdit, FaTrash,
  FaFilePdf, FaVideo, FaEye, FaSearch,
  FaTh, FaList, FaChevronDown, FaChevronUp,
  FaExternalLinkAlt, FaDownload
} from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";
import { useLanguage } from "../../contexts/LanguageContext";

const HelpGuidance = () => {
  const { isHindi } = useLanguage();
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [openDesc, setOpenDesc] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    contentType: "VIDEO",
    videoUrl: "",
    order: "",
    status: "active",
    accessBy: "USER"
  });

  const getEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const trimmed = url.trim();
      if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return `${API_URL}${trimmed.startsWith("/") ? "" : "/"}${trimmed}`;
      }
      const parsed = new URL(trimmed);
      let id = "";
      if (parsed.searchParams.has("v")) {
        id = parsed.searchParams.get("v");
      } else if (parsed.pathname.includes("/shorts/")) {
        id = parsed.pathname.split("/shorts/")[1]?.split("/")[0]?.split("?")[0];
      } else if (parsed.pathname.includes("/embed/")) {
        id = parsed.pathname.split("/embed/")[1]?.split("/")[0]?.split("?")[0];
      } else if (parsed.hostname.includes("youtu.be")) {
        id = parsed.pathname.slice(1).split("?")[0];
      }
      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      }
      if (parsed.hostname.includes("drive.google.com")) {
        return trimmed.replace(/\/view(\?.*)?$/, "/preview").replace(/\/edit(\?.*)?$/, "/preview");
      }
      return trimmed;
    } catch { return url; }
  };

  const isVideoFile = (url) => {
    if (!url) return false;
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".ogg") || clean.endsWith(".mov");
  };

  const isPdfFile = (url) => {
    if (!url) return false;
    const clean = url.split("?")[0].toLowerCase();
    return clean.endsWith(".pdf") || url.toLowerCase().includes("/pdf");
  };

  const openPreview = (item) => {
    setPreviewUrl(item.contentType === "pdf" || item.contentType === "PDF" ? `${API_URL}${item.pdfUrl}` : getEmbedUrl(item.videoUrl));
    setPreviewTitle(item.title);
    setPreviewModal(true);
  };

  /* ── LOAD ── */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/api/get-help-guidance`,
        {
          params: {
            page,
            limit: 6,
            search,
            status: statusFilter,
            accessBy: accessFilter
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setList(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);

    } catch (err) {
      Swal.fire(
        "Error",
        err?.response?.data?.message || "Failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [API_URL, accessFilter, page, search, statusFilter, token]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/api/get-help-guidance`,
          {
            params: {
              page,
              limit: 6,
              search,
              status: statusFilter,
              accessBy: accessFilter
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        if (isMounted) {
          setList(res.data?.data || []);
          setTotalPages(res.data?.totalPages || 1);
        }
      } catch (err) {
        if (isMounted) {
          Swal.fire("Error", err?.response?.data?.message || "Failed", "error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [API_URL, accessFilter, page, search, statusFilter, token]);

  const toggleModal = () => { setModal(!modal); if (modal) resetForm(); };

  const resetForm = () => {
    setEditingId(null);
    setFile(null);
    setForm({ title: "", description: "", contentType: "VIDEO", videoUrl: "", order: "", status: "active", accessBy: "USER" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      return Swal.fire("Validation", "Title required", "warning");
    }

    const fd = new FormData();
    Object.keys(form).forEach(k => fd.append(k, form[k]));
    if (form.contentType === "PDF" && file) fd.append("file", file);

    try {
      const url = editingId
        ? `${API_URL}/api/update-help-guidance/${editingId}`
        : `${API_URL}/api/create-help-guidance`;
      const method = editingId ? "put" : "post";

      // Fix: Move headers to config object, not as second parameter after data
      const res = await axios({
        method,
        url,
        data: fd,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" // Required for file upload
        }
      });

      Swal.fire("Success", res?.data?.message || "Operation successful", "success");
      toggleModal();
      loadData();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Error occurred", "error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      description: item.description,
      contentType: item.contentType?.toUpperCase(),
      videoUrl: item.videoUrl || "",
      order: item.order,
      status: item.status,
      accessBy: item.accessBy
    });
    setModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete this item?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete"
    });
    if (!result.isConfirmed) return;
    await axios.delete(`${API_URL}/api/delete-help-guidance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    loadData();
  };

  const toggleDesc = (id) => setOpenDesc(prev => prev === id ? null : id);

  const t = (en, hi) => (isHindi ? (hi || en) : en);
  const accessBadgeColor = { USER: "primary", OFFICER: "warning", ADMIN: "danger" };

  return (
    <>
      {/* PAGE HEADER */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1">
              📖 {t("Help & Guidance", "सहायता और मार्गदर्शन")}
            </h3>
            <p className="adm-page-subtitle mb-0 text-white">
              {t("Manage guides, videos and PDF resources", "गाइड, वीडियो और PDF संसाधनों का प्रबंधन करें")}
            </p>
          </div>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-1" />
            {t("Add New Resource", "नया जोड़ें")}
          </Button>
        </CardHeader>
      </Card>

      <Card className="adm-card shadow-sm border-0 mb-4">
        <CardBody className="p-3">
          {/* ── FILTERS ── */}
          <div className="mb-4 p-3 border rounded-3">
            <h6 className="mb-3 fw-semibold">{t("Search & Filters", "खोज और फ़िल्टर")}</h6>
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <FaSearch size={13} />
                  </span>
                  <Input
                    placeholder={t("Search...", "खोजें...")}
                    className="border-start-0 bg-white"
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </Col>
              <Col xs={6} md={3}>
                <Input type="select" className="bg-white" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">{t("All Status", "सभी स्थिति")}</option>
                  <option value="active">{t("Active", "सक्रिय")}</option>
                  <option value="inactive">{t("Inactive", "निष्क्रिय")}</option>
                </Input>
              </Col>
              <Col xs={6} md={3}>
                <Input type="select" className="bg-white" onChange={(e) => { setAccessFilter(e.target.value); setPage(1); }}>
                  <option value="">{t("All Access", "सभी पहुँच")}</option>
                  <option value="USER">{t("User", "उपयोगकर्ता")}</option>
                  <option value="OFFICER">{t("Officer", "अधिकारी")}</option>
                  <option value="ADMIN">{t("Admin", "प्रशासन")}</option>
                </Input>
              </Col>

              {/* view toggle */}
              <Col xs={12} md={1} className="d-flex justify-content-end">
                <div className="btn-group">
                  <Button size="sm" color={viewMode === "grid" ? "primary" : "light"} className="border px-3" onClick={() => setViewMode("grid")} title={t("Grid view", "ग्रिड दृश्य")}>
                    <FaTh size={12} />
                  </Button>
                  <Button size="sm" color={viewMode === "list" ? "primary" : "light"} className="border px-3" onClick={() => setViewMode("list")} title={t("List view", "सूची दृश्य")}>
                    <FaList size={12} />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* ── CONTENT ── */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="text-muted mt-3 mb-0">{t("Loading resources...", "संसाधन लोड हो रहे हैं...")}</p>
            </div>
          ) : list.length === 0 ? (
            <Card className="adm-card text-center py-5">
              <CardBody>
                <div className="display-4 mb-3">📭</div>
                <h5 className="text-muted">No resources found</h5>
                <p className="text-muted small mb-0">{t("Try adjusting your filters or add a new item.", "अपने फ़िल्टर बदलें या कोई नया आइटम जोड़ें।")}</p>
              </CardBody>
            </Card>

          ) : viewMode === "grid" ? (
            /* ── GRID VIEW ── */
            <Row className="g-3">
              {list.map(item => (
                <Col xs={12} sm={6} lg={4} key={item._id}>
                  <Card className="h-100 adm-card">
                    <div className={item.contentType === "pdf" ? "bg-danger" : "bg-primary"} style={{ height: 4 }} />
                    <CardBody className="d-flex flex-column p-3">

                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge color={accessBadgeColor[item.accessBy] || "secondary"} pill className="px-2">
                          {item.accessBy}
                        </Badge>
                        <Badge color={item.status === "active" ? "success" : "secondary"} pill className="px-2">
                          {item.status}
                        </Badge>
                      </div>

                      <div className="d-flex align-items-center gap-1 mb-2">
                        {item.contentType === "pdf"
                          ? <FaFilePdf className="text-danger" size={12} />
                          : <FaVideo className="text-primary" size={12} />}
                        <small className="text-muted fw-semibold text-uppercase" style={{ fontSize: "0.68rem" }}>
                          {item.contentType}
                        </small>
                        {item.order && (
                          <Badge color="light" pill className="ms-auto border text-muted" style={{ fontSize: "0.65rem" }}>#{item.order}</Badge>
                        )}
                      </div>

                      <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "0.88rem" }}>{item.title}</h6>

                      {/* accordion description */}
                      <div className="mb-3">
                        <Button
                          size="sm"
                          color="light"
                          className="d-flex align-items-center gap-1 w-100 border rounded-3 px-2 py-1 text-muted"
                          style={{ fontSize: "0.72rem" }}
                          onClick={() => toggleDesc(item._id)}
                        >
                          <span className="flex-grow-1 text-start">{t("Description", "विवरण")}</span>
                          {openDesc === item._id ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
                        </Button>
                        <Collapse isOpen={openDesc === item._id}>
                          <div className="bg-light border rounded-3 p-2 mt-1 text-muted small" style={{ fontSize: "0.78rem" }}>
                            {item.description || t("No description provided.", "कोई विवरण उपलब्ध नहीं है।")}
                          </div>
                        </Collapse>
                      </div>

                      <div className="d-flex gap-1 mt-auto">
                        <Button size="sm" color="info" outline className="flex-fill rounded-3 fw-semibold" style={{ fontSize: "0.75rem" }} onClick={() => openPreview(item)}>
                          <FaEye size={10} className="me-1" /> {t("Preview", "पूर्वावलोकन")}
                        </Button>
                        <Button size="sm" color="warning" outline className="rounded-3 px-2" title={t("Edit", "संपादित करें")} onClick={() => handleEdit(item)}>
                          <FaEdit size={10} />
                        </Button>
                        <Button size="sm" color="danger" outline className="rounded-3 px-2" title={t("Delete", "हटाएं")} onClick={() => handleDelete(item._id)}>
                          <FaTrash size={10} />
                        </Button>
                      </div>

                    </CardBody>
                  </Card>
                </Col>
              ))}
            </Row>

          ) : (
            /* ── LIST VIEW ── */
            <div>
              {list.map(item => (
                <Card key={item._id} className="adm-card mb-2">
                  <div className={item.contentType === "pdf" ? "bg-danger" : "bg-primary"} style={{ height: 3 }} />
                  <CardBody className="p-2 px-3">

                    <div className="d-flex align-items-center gap-3">

                      {/* icon */}
                      <div className="flex-shrink-0">
                        {item.contentType === "pdf"
                          ? <FaFilePdf className="text-danger" size={20} />
                          : <FaVideo className="text-primary" size={20} />}
                      </div>

                      {/* title + meta */}
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center flex-wrap gap-2">
                          <span className="fw-bold text-dark" style={{ fontSize: "0.88rem" }}>{item.title}</span>
                          {item.order && (
                            <Badge color="light" pill className="border text-muted" style={{ fontSize: "0.65rem" }}>#{item.order}</Badge>
                          )}
                        </div>
                        <Collapse isOpen={openDesc === item._id}>
                          <p className="text-muted mb-0 mt-1" style={{ fontSize: "0.78rem" }}>
                            {item.description || t("No description provided.", "कोई विवरण उपलब्ध नहीं है।")}
                          </p>
                        </Collapse>
                      </div>

                      {/* badges */}
                      <div className="d-none d-md-flex flex-column align-items-end gap-1 flex-shrink-0">
                        <Badge color={accessBadgeColor[item.accessBy] || "secondary"} pill className="px-2" style={{ fontSize: "0.65rem" }}>
                          {item.accessBy}
                        </Badge>
                        <Badge color={item.status === "active" ? "success" : "secondary"} pill className="px-2" style={{ fontSize: "0.65rem" }}>
                          {item.status}
                        </Badge>
                      </div>

                      {/* actions */}
                      <div className="d-flex gap-1 flex-shrink-0">
                        <Button size="sm" color="light" className="border rounded-3 px-2" title={t("Description", "विवरण")} onClick={() => toggleDesc(item._id)}>
                          {openDesc === item._id ? <FaChevronUp size={10} className="text-muted" /> : <FaChevronDown size={10} className="text-muted" />}
                        </Button>
                        <Button size="sm" color="info" outline className="rounded-3 px-2" title={t("Preview", "पूर्वावलोकन")} onClick={() => openPreview(item)}>
                          <FaEye size={11} />
                        </Button>
                        <Button size="sm" color="warning" outline className="rounded-3 px-2" title={t("Edit", "संपादित करें")} onClick={() => handleEdit(item)}>
                          <FaEdit size={11} />
                        </Button>
                        <Button size="sm" color="danger" outline className="rounded-3 px-2" title={t("Delete", "हटाएं")} onClick={() => handleDelete(item._id)}>
                          <FaTrash size={11} />
                        </Button>
                      </div>

                    </div>

                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-4">
              <Button size="sm" color="light" className="rounded-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ‹ {t("Prev", "पिछला")}
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  color={page === i + 1 ? "primary" : "light"}
                  className="rounded-3 fw-semibold"
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button size="sm" color="light" className="rounded-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                {t("Next", "अगला")} ›
              </Button>
            </div>
          )}

          {/* ── ADD / EDIT MODAL ── */}
          <Modal isOpen={modal} toggle={toggleModal} centered size="md">
            <ModalHeader toggle={toggleModal} className="border-0 pb-1 fw-bold">
              {editingId ? `✏️ ${t("Edit Resource", "संसाधन संपादित करें")}` : `➕ ${t("Add New Resource", "नया संसाधन जोड़ें")}`}
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <ModalBody className="pt-1">
                <Row className="g-3">

                  <Col xs={12}>
                    <Label className="fw-semibold small">{t("Title", "शीर्षक")} <span className="text-danger">*</span></Label>
                    <Input name="title" value={form.title} onChange={handleChange} placeholder={t("Enter a clear title...", "स्पष्ट शीर्षक दर्ज करें...")} />
                  </Col>

                  <Col xs={12}>
                    <Label className="fw-semibold small">{t("Description", "विवरण")}</Label>
                    <Input type="textarea" rows={3} name="description" value={form.description} onChange={handleChange} placeholder={t("Short description...", "संक्षिप्त विवरण...")} />
                  </Col>

                  <Col xs={6}>
                    <Label className="fw-semibold small">{t("Content Type", "सामग्री प्रकार")}</Label>
                    <Input type="select" name="contentType" value={form.contentType} onChange={handleChange}>
                      <option value="VIDEO">🎬 {t("Video", "वीडियो")}</option>
                      <option value="PDF">📄 PDF</option>
                    </Input>
                  </Col>

                  <Col xs={6}>
                    <Label className="fw-semibold small">{t("Order", "क्रम")}</Label>
                    <Input type="number" name="order" value={form.order} onChange={handleChange} placeholder="e.g. 1" min={1} />
                  </Col>

                  {form.contentType === "VIDEO" && (
                    <Col xs={12}>
                      <Label className="fw-semibold small">{t("Video URL", "वीडियो URL")}</Label>
                      <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
                    </Col>
                  )}

                  {form.contentType === "PDF" && (
                    <Col xs={12}>
                      <Label className="fw-semibold small">{t("Upload PDF", "PDF अपलोड करें")}</Label>
                      <Input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                    </Col>
                  )}

                  <Col xs={6}>
                    <Label className="fw-semibold small">{t("Status", "स्थिति")}</Label>
                    <Input type="select" name="status" value={form.status} onChange={handleChange}>
                      <option value="active">✅ {t("Active", "सक्रिय")}</option>
                      <option value="inactive">⛔ {t("Inactive", "निष्क्रिय")}</option>
                    </Input>
                  </Col>

                  <Col xs={6}>
                    <Label className="fw-semibold small">{t("Access By", "द्वारा पहुँच")}</Label>
                    <Input type="select" name="accessBy" value={form.accessBy} onChange={handleChange}>
                      <option value="USER">👤 {t("Public User On Site", "साइट पर सार्वजनिक उपयोगकर्ता")}</option>
                      <option value="OFFICER">🧑‍💼 {t("Officer", "अधिकारी")}</option>
                      <option value="ADMIN">🛡️ {t("Admin", "प्रशासन")}</option>
                    </Input>
                  </Col>

                </Row>
              </ModalBody>
              <ModalFooter className="border-0 pt-0 d-flex justify-content-between">
                <Button type="button" color="dark" className="rounded-3 px-4" onClick={toggleModal}>{t("Cancel", "रद्द करें")}</Button>
                <Button type="submit" color="primary" className="rounded-3 px-4 fw-semibold">
                  {editingId ? t("Update", "अपडेट करें") : t("Save", "सहेजें")}
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* ── PREVIEW MODAL ── */}
          <Modal isOpen={previewModal} toggle={() => setPreviewModal(false)} size="xl" centered>
            <ModalHeader toggle={() => setPreviewModal(false)} className="border-0 fw-bold bg-dark text-white">
              <span className="text-truncate" style={{ fontSize: "1rem" }}>👁️ {previewTitle}</span>
            </ModalHeader>
            <div className="bg-light border-bottom px-3 py-2 d-flex align-items-center justify-content-between flex-wrap gap-2">
              <small className="text-muted text-truncate" style={{ maxWidth: "60%" }}>
                🔗 <span className="user-select-all">{previewUrl}</span>
              </small>
              <div className="d-flex gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5"
                  style={{ fontSize: "0.78rem" }}
                >
                  <FaExternalLinkAlt size={10} />
                  <span>{t("Open in New Tab", "नए टैब में खोलें")}</span>
                </a>
                {isPdfFile(previewUrl) && (
                  <a
                    href={previewUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-inline-flex align-items-center gap-1.5"
                    style={{ fontSize: "0.78rem" }}
                  >
                    <FaDownload size={10} />
                    <span>{t("Download", "डाउनलोड")}</span>
                  </a>
                )}
              </div>
            </div>
            <ModalBody className="p-0 bg-dark" style={{ height: "72vh" }}>
              {isVideoFile(previewUrl) ? (
                <video
                  src={previewUrl}
                  controls
                  autoPlay
                  className="w-100 h-100"
                  style={{ objectFit: "contain", background: "#000" }}
                />
              ) : isPdfFile(previewUrl) ? (
                <object
                  data={previewUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={{ display: "block" }}
                >
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    title={previewTitle}
                  />
                </object>
              ) : (
                <iframe
                  src={previewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: "none", display: "block" }}
                  title={previewTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              )}
            </ModalBody>
          </Modal>

        </CardBody>
      </Card>
    </>
  );
};

export default HelpGuidance;