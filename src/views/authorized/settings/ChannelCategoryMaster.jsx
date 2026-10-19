import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Spinner, InputGroup, ButtonGroup, Alert
} from "reactstrap";
import {
  FaSlidersH, FaPlus, FaSearch, FaSyncAlt, FaEdit, FaTrash,
  FaCheck, FaTimes, FaToggleOn, FaToggleOff, FaLayerGroup,
  FaShieldAlt, FaCoins, FaInfoCircle
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

export const CHANNELS = [
  { id: "ALL", label: "All Channels" },
  { id: "SMS", label: "SMS", color: "#0ca678", icon: "✆" },
  { id: "WHATSAPP", label: "WhatsApp", color: "#25D366", icon: "💬" },
  { id: "RCS", label: "RCS", color: "#7950f2", icon: "◈" },
  { id: "VOICE", label: "Voice / OBD", color: "#fd7e14", icon: "☎" },
  { id: "EMAIL", label: "Email", color: "#228be6", icon: "✉" },
];

const emptyCategory = {
  channel: "SMS",
  category: "",
  code: "",
  name: "",
  shortName: "",
  description: "",
  creditKey: "",
  costPerUnit: 1,
  sortOrder: 100,
  isActive: true,
};

const unwrapData = (res) => {
  if (!res) return null;
  if (typeof res === "object") {
    if (res.data !== undefined && res.data !== null) {
      if (typeof res.data === "object" && res.data.data !== undefined) {
        return res.data.data;
      }
      return res.data;
    }
  }
  return res;
};

const ChannelCategoryMaster = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [channelsList, setChannelsList] = useState(CHANNELS);

  // Dynamically load all active channels from channels table (Channel registry)
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await apiClient.get("/registry/channels");
        const raw = unwrapData(res);
        const list = Array.isArray(raw) ? raw : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        if (Array.isArray(list) && list.length > 0) {
          const dynamicList = [
            { id: "ALL", label: "All Channels" },
            ...list.map((c) => ({
              id: c.code,
              label: c.name || c.code,
              color: c.code === "WHATSAPP" ? "#25D366" : c.code === "SMS" ? "#0ca678" : c.code === "RCS" ? "#7950f2" : c.code === "VOICE" ? "#fd7e14" : c.code === "EMAIL" ? "#228be6" : "#4f46e5",
              icon: c.code === "WHATSAPP" ? "💬" : c.code === "SMS" ? "✆" : c.code === "RCS" ? "◈" : c.code === "VOICE" ? "☎" : c.code === "EMAIL" ? "✉" : "⚡",
            })),
          ];
          setChannelsList(dynamicList);
        }
      } catch (err) {
        console.warn("Using default channels list", err);
      }
    };
    fetchChannels();
  }, []);

  // Role check: Only ADMIN and DEVOPS
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isAdminOrDevops = ["ADMIN", "DEVOPS"].includes((currentUser?.role || "").toUpperCase());

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyCategory);
  const [actionLoading, setActionLoading] = useState(false);
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedChannel && selectedChannel !== "ALL") params.set("channel", selectedChannel);
      if (statusFilter && statusFilter !== "ALL") params.set("isActive", statusFilter === "ACTIVE" ? "true" : "false");
      if (search.trim()) params.set("search", search.trim());

      const res = await apiClient.get(`/channel-categories?${params.toString()}`);
      const list = unwrapData(res) || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load channel categories");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, statusFilter, search, toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Open create modal
  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      ...emptyCategory,
      channel: selectedChannel !== "ALL" ? selectedChannel : "SMS",
    });
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      channel: item.channel || "SMS",
      category: item.category || "",
      code: item.code || "",
      name: item.name || "",
      shortName: item.shortName || "",
      description: item.description || "",
      creditKey: item.creditKey || "",
      costPerUnit: item.costPerUnit || 1,
      sortOrder: item.sortOrder || 100,
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  // Auto-generate code & creditKey on channel/category change
  const handleCategoryChange = (val) => {
    const cat = val.toUpperCase().replace(/\s+/g, "_");
    setForm((prev) => {
      const code = `${prev.channel}_${cat}`.toUpperCase();
      const creditKey = `${prev.channel.toLowerCase()}_${cat.toLowerCase()}_credits`;
      return {
        ...prev,
        category: cat,
        code: editingItem ? prev.code : code,
        creditKey: editingItem ? prev.creditKey : creditKey,
      };
    });
  };

  const handleChannelChange = (val) => {
    const ch = val.toUpperCase();
    setForm((prev) => {
      const code = prev.category ? `${ch}_${prev.category}`.toUpperCase() : prev.code;
      const creditKey = prev.category ? `${ch.toLowerCase()}_${prev.category.toLowerCase()}_credits` : prev.creditKey;
      return {
        ...prev,
        channel: ch,
        code: editingItem ? prev.code : code,
        creditKey: editingItem ? prev.creditKey : creditKey,
      };
    });
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.channel || !form.category || !form.code || !form.name) {
      toast.error("Please fill in Channel, Category, Code, and Name");
      return;
    }

    setActionLoading(true);
    try {
      if (editingItem) {
        await apiClient.put(`/channel-categories/${editingItem._id}`, form);
        toast.success("Channel category updated successfully");
      } else {
        await apiClient.post("/channel-categories", form);
        toast.success("Channel category created successfully");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save channel category");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle active
  const handleToggle = async (item) => {
    try {
      await apiClient.patch(`/channel-categories/${item._id}/toggle`);
      toast.success(`${item.name} is now ${item.isActive ? "Inactive" : "Active"}`);
      loadCategories();
    } catch (err) {
      toast.error(err?.message || "Failed to toggle status");
    }
  };

  // Delete
  const handleDelete = async (item) => {
    const isConfirmed = await wpSwal.confirm(
      "Remove Channel Category?",
      `Are you sure you want to remove <strong>${item.name}</strong> (${item.code})?`
    );
    if (!isConfirmed) return;
    try {
      await apiClient.delete(`/channel-categories/${item._id}`);
      toast.success("Channel category removed successfully");
      loadCategories();
    } catch (err) {
      toast.error(err?.message || "Failed to delete");
    }
  };

  // Restore defaults
  const handleRestoreDefaults = async () => {
    const isConfirmed = await wpSwal.confirm(
      "Restore Channel Categories?",
      "Restore and synchronize standard 20 telecom channel categories?"
    );
    if (!isConfirmed) return;
    try {
      const res = await apiClient.post("/channel-categories/seed");
      toast.success(res?.message || res?.data?.message || "Default categories synchronized");
      loadCategories();
    } catch (err) {
      toast.error(err?.message || "Failed to restore defaults");
    }
  };

  const channelColorMap = {
    SMS: "#0ca678",
    WHATSAPP: "#25D366",
    RCS: "#7950f2",
    VOICE: "#fd7e14",
    EMAIL: "#228be6",
  };

  if (!isAdminOrDevops) {
    return (
      <div className="telecom-module-wrapper p-4">
        <Alert color="danger" className="d-flex align-items-center gap-2">
          <FaShieldAlt size={20} />
          <div>
            <strong>Access Denied:</strong> Channel &amp; Category Master configuration is restricted to System Administrators and DevOps only.
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="channel-category-master-page p-3">
      <ToastContainer toasts={toasts} />

      {/* ── Page Header ── */}
      <Card className="shadow-sm border-0 mb-3 bg-gradient-primary text-white">
        <CardHeader className="bg-transparent border-0 d-flex flex-wrap align-items-center justify-content-between p-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 p-2.5">
              <FaLayerGroup size={22} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0 text-white fw-bold">Channel &amp; Category Master Table</h4>
              <p className="mb-0 text-white-50 small">
                DevOps &amp; Admin master registry for SMS, WhatsApp, RCS, Voice, and Email routing categories
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold bg-white bg-opacity-10 text-white border-0"
              onClick={handleRestoreDefaults}
              title="Reseed standard 20 carrier routes"
            >
              <FaShieldAlt className="me-1" size={12} /> Sync Defaults
            </Button>
            <Button
              color="light"
              size="sm"
              className="fw-semibold bg-white bg-opacity-10 text-white border-0"
              onClick={loadCategories}
              disabled={loading}
            >
              <FaSyncAlt size={11} className={loading ? "fa-spin me-1" : "me-1"} /> Refresh
            </Button>
            <Button
              color="success"
              size="sm"
              className="fw-bold shadow-sm px-3"
              onClick={openCreateModal}
            >
              <FaPlus size={11} className="me-1" /> Add Category
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Channel Filter Tabs ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <ButtonGroup size="sm" className="shadow-sm">
          {channelsList.map((c) => (
            <Button
              key={c.id}
              color={selectedChannel === c.id ? "primary" : "white"}
              className={`fw-semibold px-3 ${selectedChannel === c.id ? "text-white" : "text-dark border"}`}
              onClick={() => setSelectedChannel(c.id)}
            >
              {c.icon && <span className="me-1.5">{c.icon}</span>}
              {c.label}
              {c.id !== "ALL" && (
                <span className="badge rounded-pill bg-light text-dark ms-1.5 small border">
                  {items.filter((i) => i.channel === c.id).length}
                </span>
              )}
            </Button>
          ))}
        </ButtonGroup>

        <div className="d-flex align-items-center gap-2">
          <Input
            type="select"
            size="sm"
            style={{ width: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </Input>

          <InputGroup size="sm" style={{ width: 220 }}>
            <Input
              placeholder="Search code, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <Button color="light" onClick={() => setSearch("")}>
                <FaTimes size={10} />
              </Button>
            )}
          </InputGroup>
        </div>
      </div>

      {/* ── Master Table ── */}
      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          {loading ? (
            <div className="py-5 text-center">
              <Spinner color="primary" />
              <p className="text-muted small mt-2">Loading master categories...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-5 text-center text-muted">
              <FaInfoCircle size={32} className="text-muted mb-2 opacity-50" />
              <h6>No channel categories found</h6>
              <p className="small mb-3">Click below to restore the 20 standard telecom categories</p>
              <Button color="primary" size="sm" onClick={handleRestoreDefaults}>
                <FaShieldAlt className="me-1" /> Restore Standard Categories
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 small">
                <thead className="table-light text-muted">
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th>Channel</th>
                    <th>Category &amp; Code</th>
                    <th>Short Name</th>
                    <th>Display Name</th>
                    <th>Credit Key</th>
                    <th>Cost/Unit</th>
                    <th>Description</th>
                    <th className="text-center">Status</th>
                    <th className="text-end" style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const chColor = channelColorMap[item.channel] || "#495057";
                    return (
                      <tr key={item._id}>
                        <td className="text-muted">{idx + 1}</td>
                        <td>
                          <Badge
                            style={{
                              backgroundColor: `${chColor}18`,
                              color: chColor,
                              border: `1px solid ${chColor}40`,
                              fontWeight: 700,
                            }}
                            className="px-2 py-1"
                          >
                            {item.channel}
                          </Badge>
                        </td>
                        <td>
                          <div className="fw-bold text-dark">{item.category}</div>
                          <code className="text-secondary small">{item.code}</code>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border fw-semibold">
                            {item.shortName || item.category}
                          </span>
                        </td>
                        <td className="fw-semibold text-dark">{item.name}</td>
                        <td>
                          <code className="text-primary small">{item.creditKey}</code>
                        </td>
                        <td>
                          <span className="fw-bold text-success">₹{item.costPerUnit || 1}</span>
                        </td>
                        <td className="text-muted" style={{ maxWidth: 260 }}>
                          <span className="text-truncate d-inline-block" style={{ maxWidth: 250 }} title={item.description}>
                            {item.description || "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-link p-0 border-0 text-decoration-none"
                            onClick={() => handleToggle(item)}
                            title="Click to toggle status"
                          >
                            {item.isActive ? (
                              <Badge color="success" pill className="px-2">Active</Badge>
                            ) : (
                              <Badge color="secondary" pill className="px-2">Inactive</Badge>
                            )}
                          </button>
                        </td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <Button
                              size="sm"
                              color="light"
                              className="py-1 px-2 border"
                              onClick={() => openEditModal(item)}
                              title="Edit Category"
                            >
                              <FaEdit size={12} className="text-primary" />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="py-1 px-2 border"
                              onClick={() => handleToggle(item)}
                              title={item.isActive ? "Deactivate" : "Activate"}
                            >
                              {item.isActive ? (
                                <FaToggleOn size={14} className="text-success" />
                              ) : (
                                <FaToggleOff size={14} className="text-muted" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="py-1 px-2 border"
                              onClick={() => handleDelete(item)}
                              title="Delete Category"
                            >
                              <FaTrash size={12} className="text-danger" />
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

      {/* ── Add / Edit Modal ── */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" centered backdrop="static">
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={() => setModalOpen(false)} className="py-2.5 px-3">
            <span className="fw-bold d-flex align-items-center gap-2">
              <FaSlidersH className="text-primary" />
              {editingItem ? `Edit Channel Category: ${editingItem.code}` : "Register New Channel Category"}
            </span>
          </ModalHeader>
          <ModalBody className="p-3">
            <Row className="g-2.5">
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Channel *</Label>
                  <Input
                    type="select"
                    size="sm"
                    value={form.channel}
                    onChange={(e) => handleChannelChange(e.target.value)}
                    required
                  >
                    {channelsList
                      .filter((c) => c.id !== "ALL")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} ({c.label})
                        </option>
                      ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Category Code Identifier *</Label>
                  <Input
                    size="sm"
                    placeholder="e.g. OTP, MARKETING, 30S"
                    value={form.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                  />
                  <small className="text-muted">Uppercase key (e.g. OTP, IMPLICIT, MARKETING)</small>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Unique Master Code *</Label>
                  <Input
                    size="sm"
                    placeholder="e.g. SMS_OTP, WHATSAPP_MARKETING"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().trim() })}
                    required
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Short Name (Cards &amp; Badges) *</Label>
                  <Input
                    size="sm"
                    placeholder="e.g. SMS OTP, WA Mktg"
                    value={form.shortName}
                    onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Display Name *</Label>
                  <Input
                    size="sm"
                    placeholder="e.g. SMS OTP (24x7 Route)"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col md={8}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Credit Wallet Key *</Label>
                  <Input
                    size="sm"
                    placeholder="e.g. sms_otp_credits"
                    value={form.creditKey}
                    onChange={(e) => setForm({ ...form, creditKey: e.target.value.trim() })}
                    required
                  />
                  <small className="text-muted">Mongoose schema field on User / Wallet model</small>
                </FormGroup>
              </Col>
              <Col md={4}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Cost Per Unit (₹)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    size="sm"
                    value={form.costPerUnit}
                    onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) || 0 })}
                  />
                </FormGroup>
              </Col>

              <Col md={12}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Description / Routing Policy</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    size="sm"
                    placeholder="e.g. DLT Service Implicit 24x7 OTP/2FA route under TRAI regulations"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Sort Order</Label>
                  <Input
                    type="number"
                    size="sm"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 100 })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup className="mb-0 pt-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="catActiveSwitch"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="catActiveSwitch">
                      Category Enabled &amp; Active
                    </label>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            {/* Live Preview Card */}
            <div className="mt-3 p-2.5 rounded bg-light border">
              <div className="small fw-bold text-uppercase text-muted mb-1">Live Card Preview:</div>
              <div className="d-flex align-items-center justify-content-between p-2 rounded bg-white border">
                <div>
                  <Badge color="primary" className="me-2">{form.channel || "CHANNEL"}</Badge>
                  <strong className="text-dark">{form.name || "Category Name"}</strong>
                  <div className="text-muted small">{form.description || "Routing notes..."}</div>
                </div>
                <div className="text-end">
                  <span className="badge bg-secondary me-1">{form.shortName || form.category}</span>
                  <span className="fw-bold text-success">₹{form.costPerUnit || 1}/unit</span>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="py-2 px-3">
            <Button color="light" size="sm" onClick={() => setModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button color="primary" size="sm" type="submit" disabled={actionLoading} className="px-3 fw-semibold">
              {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
              {editingItem ? "Update Master Category" : "Save Category"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default ChannelCategoryMaster;
