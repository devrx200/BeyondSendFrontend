import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Nav, NavItem, NavLink, Spinner
} from "reactstrap";
import {
  FaCogs, FaPlus, FaCheckCircle, FaTrash, FaEdit,
  FaShieldAlt, FaWhatsapp, FaEnvelope, FaCommentAlt, FaPhoneAlt, FaStar, FaRegStar
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const FromIdsConfig = () => {
  const { toasts, toast } = useToast();
  const [searchParams] = useSearchParams();
  const channelParam = searchParams.get("channel");

  const [fromIds, setFromIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => (channelParam ? channelParam.toUpperCase() : "ALL"));
  const [modal, setModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // Edit State
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [form, setForm] = useState({
    channel: channelParam ? channelParam.toUpperCase() : "SMS",
    identifier: "",
    senderName: "",
    dltEntityId: "",
    dltHeaderId: "",
    description: "",
    isDefault: false
  });

  useEffect(() => {
    if (channelParam) {
      setActiveTab(channelParam.toUpperCase());
      setForm((prev) => ({ ...prev, channel: channelParam.toUpperCase() }));
    } else {
      setActiveTab("ALL");
    }
  }, [channelParam]);

  const fetchFromIds = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/from-ids/list");
      const list = res?.data?.data || res?.data || [];
      setFromIds(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch from-ids failed:", err);
      toast.error(err?.response?.data?.message || "Failed to load sender identifiers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromIds();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim()) {
      toast.warning("Sender identifier is required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/from-ids/create", form);
      toast.success(res?.data?.message || "Sender identifier registered successfully");
      setModal(false);
      setForm({
        channel: "SMS",
        identifier: "",
        senderName: "",
        dltEntityId: "",
        dltHeaderId: "",
        description: "",
        isDefault: false
      });
      fetchFromIds();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setBtnLoading(true);
      const res = await apiClient.put(`/from-ids/update/${editingItem._id}`, {
        senderName: editingItem.senderName,
        dltEntityId: editingItem.dltEntityId,
        dltHeaderId: editingItem.dltHeaderId,
        description: editingItem.description,
        isDefault: editingItem.isDefault,
        status: editingItem.status
      });
      toast.success(res?.data?.message || "Updated successfully");
      setEditModal(false);
      fetchFromIds();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Remove Sender Identifier?",
      `Are you sure you want to delete '${name}'? This cannot be undone.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/from-ids/delete/${id}`);
      toast.success(res?.data?.message || "Sender ID deleted successfully");
      fetchFromIds();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const handleToggleDefault = async (item) => {
    try {
      await apiClient.put(`/from-ids/update/${item._id}`, {
        isDefault: !item.isDefault
      });
      toast.success(
        item.isDefault
          ? "Default status removed"
          : `Set '${item.identifier}' as default for ${item.channel}`
      );
      fetchFromIds();
    } catch (err) {
      toast.error("Failed to update default route");
    }
  };

  const getChannelBadge = (ch) => {
    switch (ch) {
      case "SMS":
        return <Badge color="primary" pill className="px-2.5 py-1"><FaCommentAlt className="me-1" /> SMS</Badge>;
      case "WHATSAPP":
        return <Badge color="success" pill className="px-2.5 py-1"><FaWhatsapp className="me-1" /> WhatsApp</Badge>;
      case "EMAIL":
        return <Badge color="info" pill className="px-2.5 py-1"><FaEnvelope className="me-1" /> Email</Badge>;
      case "VOICE":
        return <Badge color="warning" pill className="px-2.5 py-1"><FaPhoneAlt className="me-1" /> Voice</Badge>;
      case "RCS":
        return <Badge color="secondary" pill className="px-2.5 py-1"><FaShieldAlt className="me-1" /> RCS</Badge>;
      default:
        return <Badge color="dark" pill className="px-2.5 py-1">{ch}</Badge>;
    }
  };

  const filtered = fromIds.filter(
    (f) => activeTab === "ALL" || f.channel === activeTab
  );

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaCogs size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">From IDs & Sender Routing</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Manage approved DLT SMS Headers, WABA Business Numbers, Email Sending Domains & Caller CLIs
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Add Sender Identifier
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {/* TABS */}
          <div className="p-3 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
            <Nav pills className="gap-2">
              {["ALL", "SMS", "WHATSAPP", "EMAIL", "VOICE", "RCS"].map((tab) => (
                <NavItem key={tab}>
                  <NavLink
                    className={`cursor-pointer fw-semibold py-1.5 px-3 rounded-pill ${
                      activeTab === tab
                        ? "active bg-primary text-white"
                        : "bg-white text-dark border"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "ALL" ? `All Channels (${fromIds.length})` : tab}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>

            <span className="small text-muted fw-semibold">
              Total Active: {filtered.filter((f) => f.status === "ACTIVE").length} / {filtered.length}
            </span>
          </div>

          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th style={{ width: "120px" }}>Channel</th>
                    <th>Sender Identifier / Header</th>
                    <th>Display / Sender Name</th>
                    <th>DLT / Compliance Details</th>
                    <th>Default Route</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th className="text-center" style={{ width: "110px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length > 0 ? (
                    filtered.map((f, idx) => (
                      <tr key={f._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>{getChannelBadge(f.channel)}</td>
                        <td>
                          <span className="fw-bold font-monospace text-dark px-2 py-1 bg-light border rounded">
                            {f.identifier}
                          </span>
                        </td>
                        <td>{f.senderName || <span className="text-muted small">—</span>}</td>
                        <td>
                          {f.channel === "SMS" && (f.dltEntityId || f.dltHeaderId) ? (
                            <div className="small">
                              {f.dltHeaderId && <div><strong>Header ID:</strong> {f.dltHeaderId}</div>}
                              {f.dltEntityId && <div className="text-muted">PE ID: {f.dltEntityId}</div>}
                            </div>
                          ) : (
                            <span className="small text-muted">{f.description || "—"}</span>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color="link"
                            className="p-0 text-decoration-none"
                            onClick={() => handleToggleDefault(f)}
                            data-tt="Click to toggle default route"
                          >
                            {f.isDefault ? (
                              <span className="badge bg-success bg-opacity-10 text-success fw-bold d-inline-flex align-items-center gap-1">
                                <FaStar size={11} /> Default
                              </span>
                            ) : (
                              <span className="text-muted small d-inline-flex align-items-center gap-1">
                                <FaRegStar size={11} /> Set Default
                              </span>
                            )}
                          </Button>
                        </td>
                        <td>
                          <Badge
                            color={f.status === "ACTIVE" ? "success" : "secondary"}
                            pill
                            className="px-2.5 py-1"
                          >
                            {f.status}
                          </Badge>
                        </td>
                        <td className="small text-muted">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              data-tt="Edit Sender Identifier"
                              onClick={() => handleOpenEdit(f)}
                            >
                              <FaEdit size={12} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              data-tt="Delete Sender Identifier"
                              onClick={() => handleDelete(f._id, f.identifier)}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-0">
                        <div className="adm-empty-state">
                          <div className="adm-empty-title">No sender identifiers</div>
                          <p className="adm-empty-sub mb-0">
                            No sender identifiers registered for this filter. Click <strong>Add Sender Identifier</strong> to configure one.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="lg">
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
        >
          Add New Sender Identifier
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Channel Type *</Label>
                  <Input
                    type="select"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    <option value="SMS">SMS (DLT Approved Header)</option>
                    <option value="WHATSAPP">WhatsApp (Meta WABA Phone)</option>
                    <option value="EMAIL">Email (Verified From Address)</option>
                    <option value="VOICE">Voice (Outbound CLI Phone)</option>
                    <option value="RCS">RCS (Verified Bot Agent)</option>
                  </Input>
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">
                    {form.channel === "SMS" && "Sender Header (6 Alpha) *"}
                    {form.channel === "WHATSAPP" && "WhatsApp Business Phone *"}
                    {form.channel === "EMAIL" && "From Email Address *"}
                    {form.channel === "VOICE" && "Caller CLI Number *"}
                    {form.channel === "RCS" && "RCS Agent Identifier *"}
                  </Label>
                  <Input
                    placeholder={
                      form.channel === "SMS"
                        ? "e.g. BYDSND"
                        : form.channel === "WHATSAPP"
                        ? "+919876543210"
                        : form.channel === "EMAIL"
                        ? "notifications@beyondsend.in"
                        : "022-68904400"
                    }
                    value={form.identifier}
                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Sender / Display Name</Label>
                  <Input
                    placeholder="e.g. BeyondSend Alerts"
                    value={form.senderName}
                    onChange={(e) => setForm({ ...form, senderName: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Default Routing</Label>
                  <div className="pt-2">
                    <div className="form-check">
                      <Input
                        type="checkbox"
                        id="defRoute"
                        checked={form.isDefault}
                        onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      />
                      <Label for="defRoute" className="small fw-semibold text-dark">
                        Set as primary default for {form.channel}
                      </Label>
                    </div>
                  </div>
                </FormGroup>
              </Col>
            </Row>

            {form.channel === "SMS" && (
              <Row className="p-3 bg-white rounded border mb-3">
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">DLT Principal Entity ID</Label>
                    <Input
                      placeholder="e.g. 140129000000001"
                      value={form.dltEntityId}
                      onChange={(e) => setForm({ ...form, dltEntityId: e.target.value })}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup className="mb-0">
                    <Label className="fw-bold small text-dark">DLT Header Registration ID</Label>
                    <Input
                      placeholder="e.g. 140129000000002"
                      value={form.dltHeaderId}
                      onChange={(e) => setForm({ ...form, dltHeaderId: e.target.value })}
                    />
                  </FormGroup>
                </Col>
              </Row>
            )}

            <FormGroup>
              <Label className="fw-bold small text-dark">Description & Compliance Notes</Label>
              <Input
                type="textarea"
                rows="2"
                placeholder="Optional notes or gateway approval reference"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading}>
              {btnLoading ? <Spinner size="sm" /> : "Register Identifier"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── EDIT MODAL ── */}
      {editingItem && (
        <Modal isOpen={editModal} toggle={() => setEditModal(false)} centered size="lg">
          <ModalHeader toggle={() => setEditModal(false)} className="text-white bg-dark">
            Edit Sender Identifier: {editingItem.identifier}
          </ModalHeader>
          <Form onSubmit={handleUpdate}>
            <ModalBody className="p-4 bg-light">
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold small text-dark">Sender / Display Name</Label>
                    <Input
                      value={editingItem.senderName || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, senderName: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="fw-bold small text-dark">Status</Label>
                    <Input
                      type="select"
                      value={editingItem.status || "ACTIVE"}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, status: e.target.value })
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="PENDING">PENDING</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>

              {editingItem.channel === "SMS" && (
                <Row className="p-3 bg-white rounded border mb-3">
                  <Col md={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark">DLT Principal Entity ID</Label>
                      <Input
                        value={editingItem.dltEntityId || ""}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, dltEntityId: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup className="mb-0">
                      <Label className="fw-bold small text-dark">DLT Header Registration ID</Label>
                      <Input
                        value={editingItem.dltHeaderId || ""}
                        onChange={(e) =>
                          setEditingItem({ ...editingItem, dltHeaderId: e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                </Row>
              )}

              <FormGroup>
                <Label className="fw-bold small text-dark">Description</Label>
                <Input
                  type="textarea"
                  rows="2"
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                />
              </FormGroup>

              <div className="form-check">
                <Input
                  type="checkbox"
                  id="editDefRoute"
                  checked={!!editingItem.isDefault}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isDefault: e.target.checked })
                  }
                />
                <Label for="editDefRoute" className="small fw-semibold text-dark">
                  Set as default sender identifier for {editingItem.channel}
                </Label>
              </div>
            </ModalBody>
            <ModalFooter className="bg-white">
              <Button color="secondary" outline onClick={() => setEditModal(false)}>
                Cancel
              </Button>
              <Button color="primary" type="submit" disabled={btnLoading}>
                {btnLoading ? <Spinner size="sm" /> : "Save Changes"}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default FromIdsConfig;
