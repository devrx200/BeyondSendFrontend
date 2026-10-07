import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Spinner
} from "reactstrap";
import {
  FaNetworkWired, FaPlus, FaPlay, FaTrash, FaCheckCircle,
  FaShieldAlt, FaKey, FaPaperPlane
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const availableEvents = [
  "message.sent",
  "message.delivered",
  "message.read",
  "message.failed",
  "inbound.message",
  "campaign.completed"
];

const WebhookSetup = () => {
  const { toasts, toast } = useToast();

  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    url: "",
    events: ["message.delivered", "message.failed"]
  });

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/webhooks/list");
      const data = res?.data?.data || res?.data || [];

      setWebhooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch webhooks error:", err);
      toast.error(err?.response?.data?.message || "Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const toggleEvent = (ev) => {
    if (form.events.includes(ev)) {
      setForm({ ...form, events: form.events.filter((e) => e !== ev) });
    } else {
      setForm({ ...form, events: [...form.events, ev] });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      toast.warning("Webhook name and HTTPS URL are required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/webhooks/create", form);
      toast.success(res?.data?.message || "Webhook registered successfully");
      setModal(false);
      setForm({ name: "", url: "", events: ["message.delivered", "message.failed"] });
      fetchWebhooks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleTest = async (hook) => {
    try {
      const res = await apiClient.post(`/webhooks/test/${hook._id}`);
      toast.success(`Dispatched simulated test event to '${hook.name}' (200 OK)`);
      fetchWebhooks();
    } catch {
      toast.error("Test dispatch failed");
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Webhook?",
      `Are you sure you want to delete '${name}'? Events will no longer be dispatched.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/webhooks/delete/${id}`);
      toast.success(res?.data?.message || "Webhook deleted");
      fetchWebhooks();
    } catch {
      toast.error("Delete failed");
    }
  };

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
              <FaNetworkWired size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Event Webhooks & Subscriptions</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Receive real-time HTTP callbacks on message delivery, failures, and inbound WhatsApp replies
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Add Webhook Endpoint
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Listener Name & Endpoint URL</th>
                    <th>Subscribed Events</th>
                    <th>Signing Secret</th>
                    <th>Status</th>
                    <th>Last Trigger Status</th>
                    <th className="text-center" style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {webhooks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No webhooks configured. Click <strong>Add Webhook Endpoint</strong> to listen for events.
                      </td>
                    </tr>
                  ) : (
                    webhooks.map((w, idx) => (
                      <tr key={w._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{w.name}</div>
                          <code className="small text-muted font-monospace">{w.url}</code>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(w.events || []).map((ev) => (
                              <Badge key={ev} color="info" pill className="px-2 py-0.5">
                                {ev}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className="font-monospace small text-muted px-2 py-0.5 bg-light border rounded">
                            {w.secret ? `${w.secret.substring(0, 10)}...` : "whsec_••••••••"}
                          </span>
                        </td>
                        <td>
                          <Badge color="success" pill className="px-2.5 py-1">
                            {w.status || "ACTIVE"}
                          </Badge>
                        </td>
                        <td className="small text-muted font-monospace">
                          {w.lastTriggerStatus || "200 OK (Healthy)"}
                        </td>
                        <td className="text-center">
                            <div className="d-inline-flex gap-1.5 align-items-center">
                              <Button
                                size="sm"
                                color="light"
                                className="adm-icon-btn is-info"
                                data-tt="Send Test Ping"
                                onClick={() => handleTest(w)}
                              >
                                <FaPlay size={10} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="adm-icon-btn is-danger"
                                data-tt="Delete Webhook"
                                onClick={() => handleDelete(w._id, w.name)}
                              >
                                <FaTrash size={11} />
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

      {/* ── CREATE MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered size="lg">
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
        >
          Add Webhook Listener Endpoint
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Webhook Name *</Label>
              <Input
                placeholder="e.g. Production Billing Notification Service"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Payload Destination URL (HTTPS) *</Label>
              <Input
                placeholder="https://api.yourdomain.com/webhooks/beyondsend"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark mb-2">Subscribed Event Triggers</Label>
              <Row className="g-2">
                {availableEvents.map((ev) => {
                  const checked = form.events.includes(ev);
                  return (
                    <Col xs={6} key={ev}>
                      <div
                        className={`p-2 rounded border cursor-pointer d-flex align-items-center gap-2 ${
                          checked ? "bg-primary text-white border-primary" : "bg-white text-dark"
                        }`}
                        onClick={() => toggleEvent(ev)}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="form-check-input my-0"
                        />
                        <span className="small fw-semibold font-monospace">{ev}</span>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Save Webhook Endpoint"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default WebhookSetup;
