import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaWhatsapp, FaPlus, FaSearch, FaEdit, FaTrash,
  FaCheckDouble, FaMobileAlt, FaSyncAlt, FaServer
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const WhatsappTemplates = () => {
  const { toasts, toast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [syncingProvider, setSyncingProvider] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("ALL");
  const [filterProvider, setFilterProvider] = useState("ALL");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "MARKETING",
    channelCategoryCode: "WA_MARKETING",
    language: "en_US",
    provider: "META_CLOUD",
    wabaTemplateId: "",
    headerType: "NONE",
    headerContent: "",
    body: "Hi {{1}}, welcome to BeyondSend! Your account is active.",
    footer: "BeyondSend Support",
    buttons: [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
  });

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/whatsapp/templates/list");
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      const provs = res?.availableProviders || res?.data?.availableProviders || [];
      const cats = res?.availableCategories || res?.data?.availableCategories || [];

      setTemplates(Array.isArray(list) ? list : []);
      if (provs.length > 0) setProviders(provs);
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      console.error("Fetch WhatsApp templates error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load WhatsApp templates");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const res = await apiClient.get("/whatsapp/templates/providers");
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      if (list.length > 0) setProviders(list);
    } catch {
      // Handled by fetchTemplates availableProviders
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchProviders();
  }, []);

  const handleOpenModal = (t = null) => {
    if (t) {
      setEditingId(t._id);
      setForm({
        name: t.name || "",
        category: t.category || "MARKETING",
        language: t.language || "en_US",
        provider: t.provider || "META_CLOUD",
        wabaTemplateId: t.wabaTemplateId || t.providerTemplateId || "",
        headerType: t.headerType || t.header?.type || "NONE",
        headerContent: t.headerText || t.header?.text || t.headerContent || "",
        body: t.body || "",
        footer: typeof t.footer === "object" ? (t.footer?.text || "") : (t.footer || ""),
        buttons: Array.isArray(t.buttons) && t.buttons.length
          ? t.buttons.map((b) => ({
              type: b.type || "URL",
              text: b.text || "",
              value: b.url || b.phoneNumber || b.payload || b.value || "",
            }))
          : [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        category: "MARKETING",
        language: "en_US",
        provider: providers[0]?.code || "META_CLOUD",
        wabaTemplateId: "",
        headerType: "NONE",
        headerContent: "",
        body: "Hi {{1}}, welcome to BeyondSend! Your account is active.",
        footer: "BeyondSend Telecom",
        buttons: [{ type: "URL", text: "Open Console", value: "https://beyondsend.in" }]
      });
    }
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.body.trim()) {
      toast.warning("Please fill in Template Name and Message Body.");
      return;
    }

    try {
      setBtnLoading(true);
      const normalizedButtons = (form.buttons || []).map((b) => ({
        type: b.type || "QUICK_REPLY",
        text: b.text || "",
        url: b.type === "URL" ? (b.value || b.url || "") : "",
        phoneNumber: b.type === "PHONE_NUMBER" ? (b.value || b.phoneNumber || "") : "",
        payload: b.type === "QUICK_REPLY" ? (b.value || b.payload || b.text || "") : "",
        value: b.value || "",
      }));

      const payload = {
        ...form,
        channelCategoryCode: form.channelCategoryCode || (form.category ? `WA_${form.category}` : "WA_MARKETING"),
        providerTemplateId: form.wabaTemplateId,
        headerType: form.headerType,
        headerText: form.headerContent,
        headerContent: form.headerContent,
        header: {
          type: form.headerType,
          text: form.headerContent,
        },
        footer: (form.footer || "").trim(),
        buttons: normalizedButtons,
      };
      delete payload.channel;

      if (editingId) {
        const res = await apiClient.put(`/whatsapp/templates/update/${editingId}`, payload);
        toast.success(res?.data?.message || "WhatsApp template updated");
      } else {
        const res = await apiClient.post("/whatsapp/templates/create", payload);
        toast.success(res?.data?.message || "WhatsApp template registered & synced");
      }
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save WhatsApp template");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete WhatsApp Template?",
      `Are you sure you want to remove '${name}'? Provider mapping will be deprecated.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/whatsapp/templates/delete/${id}`);
      toast.success(res?.data?.message || "Template removed");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleSyncProvider = async () => {
    try {
      setSyncingProvider(true);
      const res = await apiClient.post("/whatsapp/templates/sync-provider");
      toast.success(res?.data?.message || "WhatsApp templates synced from provider successfully!");
      fetchTemplates();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to sync provider templates");
    } finally {
      setSyncingProvider(false);
    }
  };

  const filtered = templates.filter((t) => {
    const s = (search || "").toLowerCase().trim();
    const matchSearch =
      !s ||
      (t.name || "").toLowerCase().includes(s) ||
      (t.body || "").toLowerCase().includes(s) ||
      (t.provider || "").toLowerCase().includes(s) ||
      (t.wabaTemplateId || "").toLowerCase().includes(s) ||
      (t.category || "").toLowerCase().includes(s);

    const matchCat =
      filterCat === "ALL" ||
      (t.category || "").toUpperCase() === filterCat.toUpperCase() ||
      (t.channelCategoryCode || "").toUpperCase() === filterCat.toUpperCase();

    const selectedProv = (filterProvider || "ALL").toUpperCase();
    const tProv = (t.provider || "").toUpperCase();
    const hasMatchingSubProvider =
      Array.isArray(t.providerTemplates) &&
      t.providerTemplates.some(
        (p) =>
          (p.providerCode || "").toUpperCase() === selectedProv ||
          selectedProv.includes((p.providerCode || "").toUpperCase()) ||
          (p.providerCode || "").toUpperCase().includes(selectedProv)
      );

    const matchProv =
      selectedProv === "ALL" ||
      tProv === selectedProv ||
      selectedProv.includes(tProv) ||
      tProv.includes(selectedProv) ||
      hasMatchingSubProvider;

    return matchSearch && matchCat && matchProv;
  });

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "44px", height: "44px", background: "#25D366" }}
            >
              <FaWhatsapp size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">WhatsApp Message Templates (WABA & Meta Cloud)</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Meta verified interactive WhatsApp message templates with multi-provider routing & button support
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              color="light"
              outline
              className="fw-bold px-3 d-flex align-items-center gap-1.5 text-white border-white border-opacity-25"
              onClick={handleSyncProvider}
              disabled={syncingProvider}
              title="Synchronize registered templates directly from active primary provider (Route Mobile, Meta, etc.)"
            >
              {syncingProvider ? (
                <>
                  <Spinner size="sm" className="me-1" /> Syncing Provider...
                </>
              ) : (
                <>
                  <FaSyncAlt size={12} /> Sync Provider
                </>
              )}
            </Button>
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              onClick={() => handleOpenModal()}
            >
              <FaPlus size={12} /> New WhatsApp Template
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
              <Col lg={4} md={6}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0">
                    <FaSearch className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search WABA templates, provider, ID..."
                    className="border-start-0"
                    bsSize="sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col lg={3} md={6}>
                <Input
                  type="select"
                  bsSize="sm"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  {categories.length > 0 ? (
                    categories.map((c, cIdx) => {
                      const codeVal = c.category || c.code || c.categoryCode || `CAT_${cIdx}`;
                      const nameVal = c.name || c.categoryName || codeVal;
                      return (
                        <option key={c.code || c.categoryCode || cIdx} value={c.category || codeVal}>
                          {nameVal}
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="MARKETING">Marketing (Offers & Announcements)</option>
                      <option value="UTILITY">Utility (Account & Order Updates)</option>
                      <option value="AUTHENTICATION">Authentication (OTP & Security)</option>
                    </>
                  )}
                </Input>
              </Col>
              <Col lg={3} md={6}>
                <Input
                  type="select"
                  bsSize="sm"
                  value={filterProvider}
                  onChange={(e) => setFilterProvider(e.target.value)}
                >
                  <option value="ALL">All Providers ({providers.length})</option>
                  {providers.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name || p.code}
                    </option>
                  ))}
                </Input>
              </Col>
              <Col lg={2} md={6} className="text-end">
                <span className="badge bg-white border text-dark fw-bold px-2 py-1.5">
                  Total: {templates.length}
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
                    <th>Provider</th>
                    <th>Language</th>
                    <th>Buttons</th>
                    <th>Status</th>
                    <th className="text-center" style={{ width: "140px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5 text-muted">
                        No WhatsApp templates found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t, idx) => (
                      <tr key={t._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td className="fw-bold text-success font-monospace">
                          {t.name}
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{t.name}</div>
                          <small className="text-muted text-truncate d-block" style={{ maxWidth: "280px" }}>
                            {t.body}
                          </small>
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
                          {t.providerTemplates && t.providerTemplates.length > 0 ? (
                            <div className="d-flex flex-wrap gap-1">
                              {t.providerTemplates.map((p, pIdx) => (
                                <Badge key={pIdx} color="info" pill className="font-monospace px-2 py-0.5 text-uppercase" style={{ fontSize: "10px" }}>
                                  <FaServer className="me-1" size={8} />
                                  {p.providerCode} {p.status ? `(${p.status})` : ""}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Badge color="info" pill className="font-monospace px-2 py-1">
                              <FaServer className="me-1" size={9} />
                              {t.provider || "META_CLOUD"}
                            </Badge>
                          )}
                        </td>
                        <td className="font-monospace small text-muted">{t.language || "en_US"}</td>
                        <td>
                          <span className="badge bg-light border text-dark">
                            {t.buttons?.length || 0} Button(s)
                          </span>
                        </td>
                        <td>
                          <Badge color="success" pill className="fw-semibold px-2 py-1">
                            {t.status || "APPROVED"}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              title="WhatsApp Preview"
                              onClick={() => setPreviewTemplate(t)}
                            >
                              <FaMobileAlt size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-success"
                              title="Edit Template"
                              onClick={() => handleOpenModal(t)}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              title="Delete Template"
                              onClick={() => handleDelete(t._id, t.name)}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE / EDIT MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="lg" backdrop="static" centered>
        <ModalHeader toggle={() => setModal(false)} className="bg-dark text-white">
          {editingId ? "Edit WhatsApp Template" : "New WhatsApp Template Registration"}
        </ModalHeader>
        <Form onSubmit={handleSave}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col md={7}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Template Name (Lowercase identifier) *</Label>
                  <Input
                    placeholder="e.g. order_shipped_v1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    required
                  />
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    Allowed: lowercase alphanumeric and underscores
                  </small>
                </FormGroup>
              </Col>
              <Col md={5}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Category *</Label>
                  <Input
                    type="select"
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const catObj = categories.find(
                        (c) =>
                          (c.code || c.categoryCode || c.category) === `WA_${cat}` ||
                          (c.code || c.categoryCode || c.category) === cat
                      );
                      setForm({
                        ...form,
                        category: cat,
                        channelCategoryCode: catObj?.code || catObj?.categoryCode || `WA_${cat}`,
                      });
                    }}
                  >
                    {categories.length > 0 ? (
                      categories.map((c, cIdx) => {
                        const rawCode = c.category || c.code || c.categoryCode || `CAT_${cIdx}`;
                        const val = String(c.category || rawCode).replace(/^WA_/, "").toUpperCase();
                        const label = c.name || c.categoryName || val;
                        return (
                          <option key={c.code || c.categoryCode || cIdx} value={val}>
                            {val} {label && label !== val ? `(${label})` : ""}
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value="MARKETING">MARKETING</option>
                        <option value="UTILITY">UTILITY</option>
                        <option value="AUTHENTICATION">AUTHENTICATION</option>
                        <option value="SERVICE">SERVICE</option>
                      </>
                    )}
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Provider Routing (Dynamic)</Label>
                  <Input
                    type="select"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  >
                    <option value="ALL">ALL (Dynamic Routing & Failover)</option>
                    {providers.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name || p.code} ({p.code})
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">WABA / Provider Template ID</Label>
                  <Input
                    placeholder="Meta WABA Template ID (optional)"
                    value={form.wabaTemplateId}
                    onChange={(e) => setForm({ ...form, wabaTemplateId: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Header Type</Label>
                  <Input
                    type="select"
                    value={form.headerType}
                    onChange={(e) => setForm({ ...form, headerType: e.target.value })}
                  >
                    <option value="NONE">None</option>
                    <option value="TEXT">Text Header</option>
                    <option value="IMAGE">Image Header</option>
                    <option value="DOCUMENT">Document Header</option>
                    <option value="VIDEO">Video Header</option>
                  </Input>
                </FormGroup>
              </Col>
              {form.headerType === "TEXT" && (
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">Header Text</Label>
                    <Input
                      placeholder="e.g. Order Confirmation"
                      value={form.headerContent}
                      onChange={(e) => setForm({ ...form, headerContent: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              )}

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Message Body Text *</Label>
                  <Input
                    type="textarea"
                    rows={4}
                    placeholder="Hi {{1}}, thank you for shopping with us! Your order {{2}} has been confirmed."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    required
                  />
                  <div className="mt-1 d-flex gap-2">
                    <Button
                      size="sm"
                      color="light"
                      className="border py-0 px-2 fw-semibold"
                      onClick={() => {
                        const count = (form.body.match(/\{\{\d+\}\}/g) || []).length + 1;
                        setForm({ ...form, body: form.body + ` {{${count}}}` });
                      }}
                    >
                      + Add &#123;&#123;var&#125;&#125;
                    </Button>
                  </div>
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Footer Text (Optional)</Label>
                  <Input
                    placeholder="e.g. Reply STOP to unsubscribe"
                    value={form.footer}
                    onChange={(e) => setForm({ ...form, footer: e.target.value })}
                  />
                </FormGroup>
              </Col>

              {/* ── INTERACTIVE BUTTON BUILDER ── */}
              <Col md={12}>
                <div className="d-flex justify-content-between align-items-center mb-2 mt-2 pt-2 border-top">
                  <div>
                    <Label className="fw-bold small text-dark mb-0">Interactive Action Buttons</Label>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      Add Quick Reply, Website Link, or Call Phone button (up to 3)
                    </div>
                  </div>
                  {form.buttons.length < 3 && (
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      className="py-0.5 px-2.5 fw-semibold d-flex align-items-center gap-1"
                      onClick={() =>
                        setForm({
                          ...form,
                          buttons: [
                            ...form.buttons,
                            { type: "URL", text: "Visit Website", value: "https://beyondsend.in" },
                          ],
                        })
                      }
                    >
                      <FaPlus size={10} /> Add Button
                    </Button>
                  )}
                </div>

                {form.buttons.length === 0 ? (
                  <div className="p-3 bg-white rounded border text-muted small text-center fst-italic">
                    No interactive buttons added. Click "+ Add Button" above if you wish to attach actions.
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {form.buttons.map((btn, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded border shadow-sm">
                        <Row className="g-2 align-items-center">
                          <Col md={3}>
                            <Label className="text-muted small mb-1" style={{ fontSize: "10.5px" }}>Type</Label>
                            <Input
                              type="select"
                              size="sm"
                              value={btn.type}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], type: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                            >
                              <option value="URL">URL Link</option>
                              <option value="QUICK_REPLY">Quick Reply</option>
                              <option value="PHONE_NUMBER">Phone Call</option>
                            </Input>
                          </Col>
                          <Col md={4}>
                            <Label className="text-muted small mb-1" style={{ fontSize: "10.5px" }}>Button Text</Label>
                            <Input
                              size="sm"
                              placeholder="e.g. Visit Site / Call Us"
                              value={btn.text}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], text: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                            />
                          </Col>
                          <Col md={4}>
                            <Label className="text-muted small mb-1" style={{ fontSize: "10.5px" }}>
                              {btn.type === "URL" ? "URL (https://...)" : btn.type === "PHONE_NUMBER" ? "Phone Number" : "Action Payload"}
                            </Label>
                            <Input
                              size="sm"
                              placeholder={
                                btn.type === "URL"
                                  ? "https://..."
                                  : btn.type === "PHONE_NUMBER"
                                  ? "+919876543210"
                                  : "QUICK_REPLY_ACTION"
                              }
                              value={btn.value}
                              onChange={(e) => {
                                const updated = [...form.buttons];
                                updated[idx] = { ...updated[idx], value: e.target.value };
                                setForm({ ...form, buttons: updated });
                              }}
                            />
                          </Col>
                          <Col md={1} className="text-center pt-3">
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
                              <FaTrash size={13} />
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={btnLoading} className="fw-bold px-4">
              {btnLoading ? <Spinner size="sm" /> : "Save & Submit to Meta"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── MOBILE PREVIEW MODAL ── */}
      <Modal isOpen={!!previewTemplate} toggle={() => setPreviewTemplate(null)} centered size="sm">
        <ModalHeader toggle={() => setPreviewTemplate(null)} className="bg-success text-white">
          <div className="d-flex align-items-center gap-2">
            <FaWhatsapp size={18} />
            <span className="fw-bold">WhatsApp Mobile Preview</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-3 text-center bg-dark rounded-bottom">
          <div
            className="p-3 rounded-4 bg-white text-start shadow-sm mx-auto position-relative"
            style={{
              maxWidth: "280px",
              minHeight: "360px",
              border: "8px solid #0f172a",
              background: "#ece5dd",
            }}
          >
            {/* CHAT BUBBLE */}
            <div className="bg-white p-3 rounded-3 shadow-sm border mb-2 position-relative">
              {/* Header preview */}
              {((previewTemplate?.headerType && previewTemplate.headerType !== "NONE") || previewTemplate?.header?.text) && (
                <div className="mb-2 pb-1 border-bottom">
                  {previewTemplate.headerType === "TEXT" || previewTemplate?.header?.type === "TEXT" ? (
                    <div className="fw-bold text-dark small">
                      {previewTemplate.headerText || previewTemplate?.header?.text || "Header Text"}
                    </div>
                  ) : (
                    <div className="bg-light text-center py-3 rounded text-muted small fw-semibold">
                      [{previewTemplate.headerType || previewTemplate?.header?.type || "MEDIA"} HEADER]
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              <div style={{ fontSize: "12.5px", color: "#111b21", whiteSpace: "pre-line", lineHeight: "1.4" }}>
                {previewTemplate?.body}
              </div>

              {/* Footer */}
              {(previewTemplate?.footer || previewTemplate?.footer?.text) && (
                <div style={{ fontSize: "10.5px", color: "#667781" }} className="mt-2 pt-1 border-top">
                  {typeof previewTemplate.footer === "object"
                    ? previewTemplate.footer.text
                    : previewTemplate.footer}
                </div>
              )}
            </div>

            {/* BUTTONS PREVIEW */}
            {previewTemplate?.buttons?.map((b, i) => (
              <div
                key={i}
                className="bg-white text-primary text-center p-2 rounded-3 shadow-sm border mb-1.5 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                style={{ fontSize: "12px", cursor: "pointer" }}
              >
                {b.type === "URL" && <span>🔗</span>}
                {b.type === "PHONE_NUMBER" && <span>📞</span>}
                {b.type === "QUICK_REPLY" && <span>↩️</span>}
                <span>{b.text || b.value || b.url || "Action Button"}</span>
              </div>
            ))}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WhatsappTemplates;
