import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col
} from "reactstrap";
import {
  FaNetworkWired, FaPlus, FaPlay, FaTrash, FaCheckCircle,
  FaShieldAlt, FaKey, FaPaperPlane
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialWebhooks = [
  {
    id: "WH-01",
    name: "Primary ERP Delivery Listener",
    url: "https://api.enterprise-client.com/webhooks/beyondsend",
    events: ["message.delivered", "message.failed", "inbound.message"],
    secret: "whsec_89dfa0021cbe81923a9e40",
    status: "ACTIVE",
    lastTrigger: "2026-09-23 23:14 (200 OK)"
  },
  {
    id: "WH-02",
    name: "CRM Two-Way WhatsApp Ingestion",
    url: "https://crm.business.in/api/v1/whatsapp-events",
    events: ["inbound.message", "message.read"],
    secret: "whsec_31bb489ef0234a9192cc55",
    status: "ACTIVE",
    lastTrigger: "2026-09-23 22:50 (200 OK)"
  }
];

const availableEvents = [
  "message.sent",
  "message.delivered",
  "message.read",
  "message.failed",
  "inbound.message",
  "campaign.completed"
];

const WebhookSetup = () => {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    url: "",
    events: ["message.delivered", "message.failed"]
  });

  const toggleEvent = (ev) => {
    if (form.events.includes(ev)) {
      setForm({ ...form, events: form.events.filter((e) => e !== ev) });
    } else {
      setForm({ ...form, events: [...form.events, ev] });
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name || !form.url) return;

    const newWh = {
      id: `WH-0${webhooks.length + 1}`,
      name: form.name,
      url: form.url,
      events: form.events,
      secret: `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      status: "ACTIVE",
      lastTrigger: "Never"
    };

    setWebhooks([...webhooks, newWh]);
    setModal(false);
    setForm({ name: "", url: "", events: ["message.delivered", "message.failed"] });
    Swal.fire("Webhook Created", "Endpoint registered with HMAC signature verification.", "success");
  };

  const handleTestPing = (wh) => {
    Swal.fire({
      title: "Sending Test Ping...",
      text: `Dispatching mock event payload to ${wh.url}`,
      icon: "info",
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      Swal.fire("Ping Delivered (200 OK)", "Server responded with HTTP 200 within 42ms.", "success");
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Webhook Endpoint?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Delete"
    }).then((res) => {
      if (res.isConfirmed) {
        setWebhooks(webhooks.filter((w) => w.id !== id));
        Swal.fire("Deleted", "Webhook removed.", "success");
      }
    });
  };

  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader
          className="border-0 py-3.5 px-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaNetworkWired size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Webhook Endpoints & Subscriptions</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Receive immediate HTTP POST callbacks for message deliveries, reads, failures & user replies
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Add Webhook Endpoint
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Endpoint Name & Target URL</th>
                  <th>Subscribed Events</th>
                  <th>HMAC Signing Secret</th>
                  <th>Status</th>
                  <th>Last Dispatch</th>
                  <th className="text-center" style={{ width: "130px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {webhooks.map((w) => (
                  <tr key={w.id}>
                    <td className="fw-bold text-primary font-monospace">{w.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{w.name}</div>
                      <code className="text-primary font-monospace small">{w.url}</code>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {w.events.map((ev, i) => (
                          <span
                            key={i}
                            className="badge bg-light border text-dark font-monospace"
                            style={{ fontSize: "10.5px" }}
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <code className="small text-muted font-monospace">{w.secret}</code>
                    </td>
                    <td>
                      <Badge color="success" pill className="px-2 py-1">
                        Active
                      </Badge>
                    </td>
                    <td className="small text-muted">{w.lastTrigger}</td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-primary"
                          title="Trigger Test Ping"
                          onClick={() => handleTestPing(w)}
                        >
                          <FaPlay size={10} className="me-1" /> Ping
                        </Button>
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-danger"
                          title="Delete"
                          onClick={() => handleDelete(w.id)}
                        >
                          <FaTrash size={11} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE WEBHOOK MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} size="md" centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Add Webhook Listener
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Endpoint Friendly Name *</Label>
              <Input
                placeholder="e.g. Production ERP Webhook"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Destination HTTPS URL *</Label>
              <Input
                type="url"
                placeholder="https://api.yourdomain.com/webhook"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark mb-2">Subscribe to Events</Label>
              <div className="d-flex flex-column gap-1.5">
                {availableEvents.map((ev) => (
                  <div key={ev} className="form-check">
                    <Input
                      type="checkbox"
                      id={`ev_${ev}`}
                      checked={form.events.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                    />
                    <Label for={`ev_${ev}`} className="small text-dark font-monospace">
                      {ev}
                    </Label>
                  </div>
                ))}
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Save Webhook
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default WebhookSetup;
