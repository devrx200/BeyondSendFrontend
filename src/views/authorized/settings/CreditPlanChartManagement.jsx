import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Spinner, InputGroup, ButtonGroup, Alert
} from "reactstrap";
import {
  FaCoins, FaPlus, FaSearch, FaSyncAlt, FaEdit, FaTrash,
  FaCheck, FaTimes, FaToggleOn, FaToggleOff, FaLayerGroup,
  FaShieldAlt, FaInfoCircle, FaUserCheck, FaArrowUp, FaTag
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

const CreditPlanChartManagement = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [search, setSearch] = useState("");

  // Role check: Only ADMIN and DEVOPS
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("userData") || localStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isAdminOrDevops = ["ADMIN", "DEVOPS"].includes((currentUser?.role || "").toUpperCase());

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    planName: "",
    description: "",
    isDefault: false,
    rates: {},
  });

  // Assign user modal state
  const [assignModal, setAssignModal] = useState(false);
  const [assignUser, setAssignUser] = useState(null);
  const [targetUsers, setTargetUsers] = useState([]);
  const [assignForm, setAssignForm] = useState({
    userId: "",
    creditPlanId: "",
    isActive: true,
    isShow: true,
    isUse: true,
  });

  // Map of master base rates: { [creditKey]: number }
  const masterBaseRates = useMemo(() => {
    const map = {};
    masterCategories.forEach((m) => {
      map[m.creditKey] = Number(m.costPerUnit) || 1;
    });
    return map;
  }, [masterCategories]);

  // Load master categories
  const loadMasterCategories = useCallback(async () => {
    try {
      const res = await apiClient.get("/channel-categories");
      const list = unwrapData(res) || [];
      setMasterCategories(Array.isArray(list) ? list : []);
    } catch {
      setMasterCategories([]);
    }
  }, []);

  // Load plans
  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedChannel && selectedChannel !== "ALL") params.set("channel", selectedChannel);
      if (search.trim()) params.set("search", search.trim());

      const res = await apiClient.get(`/credit-plans?${params.toString()}`);
      const list = unwrapData(res) || [];
      setPlans(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load credit pricing plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, search, toast]);

  // Load manageable users for assignment
  const loadTargetUsers = useCallback(async () => {
    try {
      const res = await apiClient.get("/credits/users");
      const list = unwrapData(res) || [];
      const filtered = Array.isArray(list)
        ? list.filter((u) => u.role === "CLIENT" || u.role === "RESELLER")
        : [];
      setTargetUsers(filtered);
    } catch {
      setTargetUsers([]);
    }
  }, []);

  useEffect(() => {
    loadMasterCategories();
    loadPlans();
    loadTargetUsers();
  }, [loadMasterCategories, loadPlans, loadTargetUsers]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPlan(null);
    // Initialize rates with master base rates + 0.10 margin (strictly greater than master)
    const initialRates = {};
    masterCategories.forEach((cat) => {
      const base = Number(cat.costPerUnit) || 1;
      initialRates[cat.creditKey] = Math.round((base + 0.10) * 100) / 100;
    });

    setForm({
      planName: "",
      description: "",
      isDefault: false,
      rates: initialRates,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (plan) => {
    setEditingPlan(plan);
    const planRates = {};

    // First populate default rates based on master + 0.10
    masterCategories.forEach((cat) => {
      const base = Number(cat.costPerUnit) || 1;
      planRates[cat.creditKey] = Math.round((base + 0.10) * 100) / 100;
    });

    // Then overwrite with plan's existing rates
    if (Array.isArray(plan.rates)) {
      plan.rates.forEach((r) => {
        planRates[r.creditKey] = Number(r.costPerUnit);
      });
    }

    setForm({
      planName: plan.planName || "",
      description: plan.description || "",
      isDefault: plan.isDefault || false,
      rates: planRates,
    });
    setModalOpen(true);
  };

  // Handle Rate Input Change
  const handleRateChange = (creditKey, value) => {
    setForm((prev) => ({
      ...prev,
      rates: {
        ...prev.rates,
        [creditKey]: value,
      },
    }));
  };

  // Form Submit with Validation (> master table costPerUnit)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.planName.trim()) {
      toast.error("Plan name is required");
      return;
    }

    // Prepare rates array and validate strictly greater than master rate
    const ratesArray = [];
    for (const cat of masterCategories) {
      const userVal = Number(form.rates[cat.creditKey]);
      const baseRate = Number(cat.costPerUnit) || 1;
      const displayBaseRate = baseRate % 1 === 0 ? baseRate.toFixed(2) : Number(baseRate.toFixed(4));
      if (Number.isNaN(userVal) || (userVal - baseRate) <= 0.0000001) {
        toast.error(
          `Validation Error: Rate for "${cat.name}" (₹${userVal}) must be strictly greater than Master Table rate (₹${displayBaseRate}). Plan rates cannot be less than or equal to master rates.`
        );
        return;
      }

      ratesArray.push({
        channel: cat.channel,
        category: cat.category,
        code: cat.code,
        creditKey: cat.creditKey,
        costPerUnit: userVal,
        description: cat.name,
        isActive: true,
      });
    }

    const payload = {
      planName: form.planName.trim(),
      description: form.description.trim(),
      channel: "ALL",
      category: "ALL",
      costPerUnit: ratesArray[0]?.costPerUnit || 1,
      isDefault: Boolean(form.isDefault),
      rates: ratesArray,
    };

    setActionLoading(true);
    try {
      if (editingPlan) {
        const res = await apiClient.put(`/credit-plans/${editingPlan._id}`, payload);
        toast.success(res?.message || res?.data?.message || "Credit pricing plan updated successfully");
      } else {
        const res = await apiClient.post("/credit-plans", payload);
        toast.success(res?.message || res?.data?.message || "Credit pricing plan created successfully");
      }
      setModalOpen(false);
      await loadPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save credit plan");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggle = async (plan) => {
    try {
      await apiClient.patch(`/credit-plans/${plan._id}/toggle`);
      toast.success(`${plan.planName} is now ${plan.isActive ? "Inactive" : "Active"}`);
      loadPlans();
    } catch (err) {
      toast.error(err?.message || "Failed to toggle status");
    }
  };

  // Delete Plan
  const handleDelete = async (plan) => {
    const isConfirmed = await wpSwal.confirm(
      "Remove Pricing Plan?",
      `Are you sure you want to remove plan <strong>"${plan.planName}"</strong>? Any users assigned to this plan will revert to global master pricing.`
    );
    if (!isConfirmed) return;
    try {
      await apiClient.delete(`/credit-plans/${plan._id}`);
      toast.success("Plan removed successfully");
      loadPlans();
    } catch (err) {
      toast.error(err?.message || "Failed to delete plan");
    }
  };

  // Open Assign User Modal
  const openAssignModal = (user = null) => {
    setAssignUser(user);
    const existingPlan = user?.myCreditPlan || {};
    const hasExistingPlan = Boolean(existingPlan.creditPlanId);
    setAssignForm({
      userId: user?._id || "",
      creditPlanId: existingPlan.creditPlanId?._id || existingPlan.creditPlanId || "",
      isActive: hasExistingPlan ? existingPlan.isActive === true : false,
      isShow: hasExistingPlan ? existingPlan.isShow === true : false,
      isUse: hasExistingPlan ? existingPlan.isUse === true : false,
    });
    setAssignModal(true);
  };

  // Submit User Plan Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.userId) {
      toast.error("Please select a target client/reseller");
      return;
    }

    setActionLoading(true);
    try {
      const res = await apiClient.patch(`/credit-plans/user/${assignForm.userId}/assign`, {
        creditPlanId: assignForm.creditPlanId || null,
        isActive: Boolean(assignForm.creditPlanId && assignForm.isActive),
        isShow: Boolean(assignForm.creditPlanId && assignForm.isShow),
        isUse: Boolean(assignForm.creditPlanId && assignForm.isUse),
      });

      toast.success(res?.message || res?.data?.message || "Pricing plan mapped to user successfully!");
      setAssignModal(false);
      await loadTargetUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to assign pricing plan");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdminOrDevops) {
    return (
      <div className="telecom-module-wrapper p-4">
        <Alert color="danger" className="d-flex align-items-center gap-2">
          <FaShieldAlt size={20} />
          <div>
            <strong>Access Denied:</strong> Credit Pricing Plan management is restricted to Administrators and DevOps personnel only.
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="credit-plan-chart-page">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── Page Header ── */}
      <Card className="shadow-sm border-0 mb-3 bg-gradient-primary text-white">
        <CardHeader className="bg-transparent border-0 d-flex flex-wrap align-items-center justify-content-between p-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 p-2.5">
              <FaTag size={22} className="text-white" />
            </div>
            <div>
              <h4 className="mb-0 text-white fw-bold">Credit Pricing Plans &amp; Rate Chart</h4>
              <p className="mb-0 text-white-50 small">
                DevOps &amp; Admin custom client rates. Enforced constraint: Plan rate &gt; Master Table base rate (+ margin).
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold bg-white bg-opacity-10 text-white border-0"
              onClick={() => openAssignModal()}
              title="Assign a plan to a specific client/reseller"
            >
              <FaUserCheck className="me-1" size={12} /> Assign User Plan
            </Button>
            <Button
              color="light"
              size="sm"
              className="fw-semibold bg-white bg-opacity-10 text-white border-0"
              onClick={() => { loadPlans(); loadMasterCategories(); }}
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
              <FaPlus size={11} className="me-1" /> Create Credit Plan
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── Filter Bar ── */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <ButtonGroup size="sm" className="shadow-sm">
          {CHANNELS.map((c) => (
            <Button
              key={c.id}
              color={selectedChannel === c.id ? "primary" : "white"}
              className={`fw-semibold px-3 ${selectedChannel === c.id ? "text-white" : "text-dark border"}`}
              onClick={() => setSelectedChannel(c.id)}
            >
              {c.icon && <span className="me-1.5">{c.icon}</span>}
              {c.label}
            </Button>
          ))}
        </ButtonGroup>

        <div className="d-flex align-items-center gap-2">
          <InputGroup size="sm" style={{ width: 240 }}>
            <Input
              placeholder="Search plan name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button color="light" className="border">
              <FaSearch size={12} />
            </Button>
          </InputGroup>
        </div>
      </div>

      {/* ── Plan Cards List ── */}
      {loading ? (
        <PageLoader />
      ) : plans.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <CardBody>
            <FaCoins size={40} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-dark">No Credit Pricing Plans Created Yet</h5>
            <p className="text-muted small mx-auto" style={{ maxWidth: 460 }}>
              Create custom plans to set specific per-channel pricing for clients. If no custom plan is mapped, accounts default to Master Table rates (₹1.00/unit).
            </p>
            <Button color="primary" size="sm" onClick={openCreateModal}>
              <FaPlus className="me-1" /> Create First Credit Plan
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Row className="g-3">
          {plans.map((plan) => (
            <Col key={plan._id} xs={12} lg={6}>
              <Card className="h-100 shadow-sm border rounded-3">
                <CardHeader className="bg-white py-2.5 px-3 border-bottom d-flex align-items-center justify-content-between">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0 fw-bold text-dark">{plan.planName}</h6>
                      <Badge color={plan.isActive ? "success" : "secondary"} pill className="small">
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {plan.isDefault && (
                        <Badge color="info" pill className="small">Default</Badge>
                      )}
                    </div>
                    {plan.description && (
                      <small className="text-muted">{plan.description}</small>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Button
                      color={plan.isActive ? "success" : "light"}
                      size="sm"
                      className="p-1 px-2 border"
                      onClick={() => handleToggle(plan)}
                      title="Toggle Active/Inactive"
                    >
                      {plan.isActive ? <FaToggleOn size={14} /> : <FaToggleOff size={14} />}
                    </Button>
                    <Button
                      color="light"
                      size="sm"
                      className="p-1 px-2 text-primary border"
                      onClick={() => openEditModal(plan)}
                      title="Edit Plan"
                    >
                      <FaEdit size={12} />
                    </Button>
                    <Button
                      color="light"
                      size="sm"
                      className="p-1 px-2 text-danger border"
                      onClick={() => handleDelete(plan)}
                      title="Delete Plan"
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="table-responsive" style={{ maxHeight: 280 }}>
                    <Table size="sm" hover className="align-middle mb-0" style={{ fontSize: "12px" }}>
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>CHANNEL ROUTE</th>
                          <th>MASTER BASE</th>
                          <th>PLAN RATE</th>
                          <th>MARGIN</th>
                        </tr>
                      </thead>
                      <tbody>
                        {masterCategories
                          .filter((c) => selectedChannel === "ALL" || c.channel === selectedChannel)
                          .map((cat) => {
                            const matchedRate = Array.isArray(plan.rates)
                              ? plan.rates.find((r) => r.creditKey === cat.creditKey)
                              : null;
                            const planCost = matchedRate ? Number(matchedRate.costPerUnit) : (Number(cat.costPerUnit) || 1);
                            const masterBase = Number(cat.costPerUnit) || 1;
                            const diff = Math.round((planCost - masterBase) * 100) / 100;

                            return (
                              <tr key={cat.creditKey}>
                                <td>
                                  <div className="fw-semibold text-dark">{cat.name}</div>
                                  <div className="text-muted small" style={{ fontSize: "10px" }}>
                                    {cat.channel} &bull; {cat.category}
                                  </div>
                                </td>
                                <td>
                                  <span className="badge bg-light text-dark border">
                                    ₹{masterBase}
                                  </span>
                                </td>
                                <td>
                                  <span className="fw-bold text-success">
                                    ₹{planCost}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${diff > 0 ? "bg-success bg-opacity-10 text-success border border-success" : "bg-secondary text-white"}`}>
                                    {diff > 0 ? `+₹${diff}` : "₹0"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* ── CREATE / EDIT PLAN MODAL ── */}
      {/* ── CREATE / EDIT PLAN MODAL ── */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg" backdrop="static">
        <Form onSubmit={handleSubmit} noValidate>
          <ModalHeader toggle={() => setModalOpen(false)} className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <FaCoins className="text-primary" />
              <span className="fw-bold">
                {editingPlan ? `Edit Pricing Plan: ${editingPlan.planName}` : "Create New Credit Pricing Plan"}
              </span>
            </div>
          </ModalHeader>
          <ModalBody className="p-3">
            <Alert color="info" className="py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <FaInfoCircle size={16} />
              <div>
                <strong>Rate Enforcement Rule:</strong> Each route's <code>costPerUnit</code> must be strictly greater than (<code>&gt;</code>) the Master Table base rate (+ margin). It cannot be less than or equal to the master rate.
              </div>
            </Alert>

            <Row className="g-2 mb-3">
              <Col sm={8}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Plan Name *</Label>
                  <Input
                    size="sm"
                    value={form.planName}
                    onChange={(e) => setForm((p) => ({ ...p, planName: e.target.value }))}
                    placeholder="e.g. Enterprise Tier 1 / Gold VIP Route"
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm={4}>
                <FormGroup className="mb-0">
                  <Label className="small fw-semibold mb-1">Set as Default Plan?</Label>
                  <Input
                    type="select"
                    size="sm"
                    value={form.isDefault ? "true" : "false"}
                    onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.value === "true" }))}
                  >
                    <option value="false">No (Custom Assignment)</option>
                    <option value="true">Yes (Default for New Clients)</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={12}>
                <FormGroup className="mb-0 mt-2">
                  <Label className="small fw-semibold mb-1">Description / Notes</Label>
                  <Input
                    size="sm"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description of this tier and minimum commitment..."
                  />
                </FormGroup>
              </Col>
            </Row>

            <h6 className="fw-bold border-bottom pb-1.5 mb-2 small text-uppercase text-secondary">
              Per-Channel Route Rates Matrix (20 Routes)
            </h6>

            <div className="table-responsive" style={{ maxHeight: 340 }}>
              <Table size="sm" bordered hover className="align-middle mb-0" style={{ fontSize: "12px" }}>
                <thead className="table-light sticky-top">
                  <tr>
                    <th>CHANNEL &amp; ROUTE</th>
                    <th style={{ width: 120 }}>MASTER BASE</th>
                    <th style={{ width: 180 }}>CUSTOM PLAN RATE (₹) *</th>
                    <th style={{ width: 120 }}>MARGIN STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {masterCategories.map((cat) => {
                    const currentVal = form.rates[cat.creditKey] !== undefined ? form.rates[cat.creditKey] : "";
                    const baseRate = Number(cat.costPerUnit) || 1;
                    const displayBaseRate = baseRate % 1 === 0 ? baseRate.toFixed(2) : Number(baseRate.toFixed(4));
                    const numVal = Number(currentVal);
                    const isValid = !Number.isNaN(numVal) && (numVal - baseRate) > 0.0000001;
                    const margin = Math.round((numVal - baseRate) * 10000) / 10000;

                    return (
                      <tr key={cat.creditKey} className={!isValid && currentVal !== "" ? "table-danger" : ""}>
                        <td>
                          <div className="fw-semibold text-dark">{cat.name}</div>
                          <div className="text-muted small" style={{ fontSize: "10.5px" }}>
                            <code>{cat.creditKey}</code> &bull; {cat.channel}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary bg-opacity-25 text-dark fw-bold">
                            ₹{displayBaseRate}
                          </span>
                        </td>
                        <td>
                          <InputGroup size="sm">
                            <span className="inputGroup-text py-0 px-2 bg-light">₹</span>
                            <Input
                              type="number"
                              step="any"
                              min="0"
                              value={currentVal}
                              onChange={(e) => handleRateChange(cat.creditKey, e.target.value)}
                              required
                              className={`fw-bold text-end ${!isValid ? "is-invalid" : "is-valid"}`}
                            />
                          </InputGroup>
                          {!isValid && currentVal !== "" && (
                            <small className="text-danger d-block mt-0.5" style={{ fontSize: "10px" }}>
                              Must be &gt; ₹{displayBaseRate}
                            </small>
                          )}
                        </td>
                        <td>
                          {isValid ? (
                            <span className="badge bg-success text-white small">
                              <FaArrowUp className="me-0.5" size={8} /> +₹{margin >= 0.01 ? margin.toFixed(2) : margin}
                            </span>
                          ) : (
                            <span className="badge bg-danger text-white small">
                              Invalid (&le; ₹{displayBaseRate})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </ModalBody>
          <ModalFooter className="bg-light py-2">
            <Button color="light" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="success" size="sm" type="submit" disabled={actionLoading} className="fw-bold px-3">
              {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
              {editingPlan ? "Update Plan" : "Create Plan"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── ASSIGN PLAN TO USER MODAL ── */}
      <Modal isOpen={assignModal} toggle={() => setAssignModal(false)} backdrop="static">
        <Form onSubmit={handleAssignSubmit}>
          <ModalHeader toggle={() => setAssignModal(false)} className="bg-light">
            <div className="d-flex align-items-center gap-2">
              <FaUserCheck className="text-primary" />
              <span className="fw-bold">Map Credit Pricing Plan to User Account</span>
            </div>
          </ModalHeader>
          <ModalBody className="p-3">
            <FormGroup className="mb-3">
              <Label className="small fw-semibold mb-1">Target Client / Reseller *</Label>
              <Input
                type="select"
                size="sm"
                value={assignForm.userId}
                onChange={(e) => setAssignForm((p) => ({ ...p, userId: e.target.value }))}
                required
              >
                <option value="">-- Select Target Account --</option>
                {targetUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role}) — {u.email}
                  </option>
                ))}
              </Input>
            </FormGroup>

            <FormGroup className="mb-3">
              <Label className="small fw-semibold mb-1">Pricing Plan *</Label>
              <Input
                type="select"
                size="sm"
                value={assignForm.creditPlanId}
                onChange={(e) => {
                  const val = e.target.value;
                  setAssignForm((p) => ({
                    ...p,
                    creditPlanId: val,
                    isActive: Boolean(val),
                    isShow: Boolean(val),
                    isUse: Boolean(val),
                  }));
                }}
              >
                <option value="">Default Global Master Pricing (Base Rates)</option>
                {plans.filter((p) => p.isActive).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.planName} {p.isDefault ? "[Default]" : ""}
                  </option>
                ))}
              </Input>
              <small className="text-muted">
                Select a custom tier for this account, or choose Default Global to use standard rates.
              </small>
            </FormGroup>

            <div className="border rounded p-2.5 bg-light mb-2">
              <h6 className="fw-bold small mb-2 text-dark">Plan Flags &amp; Behavior:</h6>
              <FormGroup check className="mb-2">
                <Label check className="small">
                  <Input
                    type="checkbox"
                    checked={assignForm.isActive}
                    onChange={(e) => setAssignForm((p) => ({ ...p, isActive: e.target.checked }))}
                  />
                  <strong>IsActive:</strong> Plan is active for this user account (Default: true)
                </Label>
              </FormGroup>
              <FormGroup check className="mb-2">
                <Label check className="small">
                  <Input
                    type="checkbox"
                    checked={assignForm.isShow}
                    onChange={(e) => setAssignForm((p) => ({ ...p, isShow: e.target.checked }))}
                  />
                  <strong>IsShow:</strong> Display plan badge &amp; rates on client dashboard (Default: true)
                </Label>
              </FormGroup>
              <FormGroup check className="mb-0">
                <Label check className="small">
                  <Input
                    type="checkbox"
                    checked={assignForm.isUse}
                    onChange={(e) => setAssignForm((p) => ({ ...p, isUse: e.target.checked }))}
                  />
                  <strong>IsUse:</strong> Automatically use plan rates when calculating credit topup requests (Default: true)
                </Label>
              </FormGroup>
            </div>
          </ModalBody>
          <ModalFooter className="bg-light py-2">
            <Button color="light" size="sm" onClick={() => setAssignModal(false)}>
              Cancel
            </Button>
            <Button color="primary" size="sm" type="submit" disabled={actionLoading} className="fw-bold px-3">
              {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaCheck className="me-1" />}
              Save Assignment
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CreditPlanChartManagement;
