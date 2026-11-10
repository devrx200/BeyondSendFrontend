import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import Swal from "sweetalert2";
import apiClient, { API_BASE_URL, getApiResponseData } from "@apiService";

const EMPTY_FORM = {
  name: "",
  allowedOrigins: "",
  enabled: true,
  aiEnabled: true,
  themeColor: "#20a56b",
  position: "BOTTOM_RIGHT",
  welcomeMessage: "Hi! How can we help you today?",
  captureName: true,
  captureEmail: false,
  capturePhone: false,
  teamMembers: [],
};

const WhatsappWidgets = () => {
  const [widgets, setWidgets] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState(null);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item._id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const loadData = useCallback(async () => {
    try {
      const [widgetResponse, conversationResponse, agentResponse] = await Promise.all([
        apiClient.get("/whatsapp/widgets"),
        apiClient.get("/whatsapp/widget-conversations"),
        apiClient.get("/whatsapp/inbox/agents"),
      ]);
      const nextWidgets = getApiResponseData(widgetResponse);
      const nextConversations = getApiResponseData(conversationResponse);
      const nextAgents = getApiResponseData(agentResponse);
      setWidgets(Array.isArray(nextWidgets) ? nextWidgets : []);
      setConversations(Array.isArray(nextConversations) ? nextConversations : []);
      setAgents(Array.isArray(nextAgents) ? nextAgents : []);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Unable to load website chat", text: error?.message || "Please retry." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    const interval = window.setInterval(loadData, 10000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, [loadData]);

  const editWidget = (widget) => setForm({
    ...widget,
    allowedOrigins: widget.allowedOrigins.join("\n"),
    teamMembers: widget.teamMembers.map((id) => String(id?._id || id)),
  });

  const saveWidget = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      allowedOrigins: String(form.allowedOrigins || "").split(/[\n,]+/).map((origin) => origin.trim()).filter(Boolean),
    };
    try {
      if (form._id) await apiClient.put(`/whatsapp/widgets/${form._id}`, payload);
      else await apiClient.post("/whatsapp/widgets", payload);
      setForm(null);
      await loadData();
      Swal.fire({ icon: "success", title: "Website chat saved", timer: 1300, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Widget was not saved", text: error?.message || "Check the website origins and retry." });
    }
  };

  const deleteWidget = async (id) => {
    const result = await Swal.fire({ icon: "warning", title: "Delete this widget?", showCancelButton: true });
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete(`/whatsapp/widgets/${id}`);
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Widget was not deleted", text: error?.message || "Please retry." });
    }
  };

  const copyEmbed = async (widget) => {
    const code = `<script async src="${API_BASE_URL}/whatsapp/widgets/${widget.publicId}/embed.js"></script>`;
    try {
      await navigator.clipboard.writeText(code);
      Swal.fire({ icon: "success", title: "Embed code copied", timer: 1200, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "info", title: "Embed code", text: code });
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!selectedConversation || !reply.trim()) return;
    try {
      await apiClient.post(`/whatsapp/widget-conversations/${selectedConversation._id}/messages`, { text: reply.trim() });
      setReply("");
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Reply was not sent", text: error?.message || "Please retry." });
    }
  };

  const updateConversationStatus = async (status) => {
    if (!selectedConversation) return;
    try {
      await apiClient.patch(`/whatsapp/widget-conversations/${selectedConversation._id}`, { status });
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Conversation was not updated", text: error?.message || "Please retry." });
    }
  };

  return (
    <div className="telecom-module-wrapper">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">Website Chat & Leads</h4>
            <div className="small text-white-50">Create embeddable widgets and reply to website visitors.</div>
          </div>
          <Button color="success" onClick={() => setForm({ ...EMPTY_FORM })}>Create widget</Button>
        </CardHeader>
        <CardBody>
          {loading && <div className="text-muted">Loading website chat…</div>}
          {!loading && widgets.length === 0 && <div className="text-muted">No website chat widgets yet.</div>}
          <Row className="g-3">
            {widgets.map((widget) => (
              <Col md={6} xl={4} key={widget._id}>
                <Card className="h-100 border">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start">
                      <strong>{widget.name}</strong>
                      <Badge color={widget.enabled ? "success" : "secondary"}>{widget.enabled ? "Enabled" : "Disabled"}</Badge>
                    </div>
                    <div className="small text-muted my-2">{widget.allowedOrigins.join(", ")}</div>
                    <Button size="sm" color="primary" onClick={() => copyEmbed(widget)}>Copy embed code</Button>
                    <Button size="sm" color="secondary" outline className="ms-2" onClick={() => editWidget(widget)}>Edit</Button>
                    <Button size="sm" color="danger" outline className="ms-2" onClick={() => deleteWidget(widget._id)}>Delete</Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      {form && (
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <strong>{form._id ? "Edit widget" : "New widget"}</strong>
            <Button color="light" onClick={() => setForm(null)}>Close</Button>
          </CardHeader>
          <CardBody>
            <form onSubmit={saveWidget}>
              <Row>
                <Col md={6}>
                  <FormGroup><Label>Widget name</Label><Input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormGroup>
                  <FormGroup><Label>Allowed website origins (one per line)</Label><Input type="textarea" required rows={3} placeholder={"https://example.com\nhttps://shop.example.com"} value={form.allowedOrigins} onChange={(event) => setForm({ ...form, allowedOrigins: event.target.value })} /></FormGroup>
                  <FormGroup><Label>Welcome message</Label><Input maxLength={500} value={form.welcomeMessage} onChange={(event) => setForm({ ...form, welcomeMessage: event.target.value })} /></FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup><Label>Theme color</Label><Input type="color" value={form.themeColor} onChange={(event) => setForm({ ...form, themeColor: event.target.value })} /></FormGroup>
                  <FormGroup><Label>Position</Label><Input type="select" value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })}><option value="BOTTOM_RIGHT">Bottom right</option><option value="BOTTOM_LEFT">Bottom left</option></Input></FormGroup>
                  <FormGroup><Label>Conversation agents</Label><Input type="select" multiple value={form.teamMembers} onChange={(event) => setForm({ ...form, teamMembers: Array.from(event.target.selectedOptions, (option) => option.value) })}>{agents.map((agent) => <option key={agent._id} value={agent._id}>{agent.name || agent.fullName || agent.email || agent._id}</option>)}</Input><div className="small text-muted">Leave empty to assign to an active account user.</div></FormGroup>
                </Col>
              </Row>
              <div className="d-flex flex-wrap gap-3 mb-3">
                {[["enabled", "Widget enabled"], ["aiEnabled", "AI replies enabled"], ["captureName", "Capture name"], ["captureEmail", "Capture email"], ["capturePhone", "Capture phone"]].map(([key, label]) => (
                  <FormGroup check key={key}><Input type="checkbox" checked={Boolean(form[key])} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} /><Label check>{label}</Label></FormGroup>
                ))}
              </div>
              <Button color="success" type="submit">Save widget</Button>
            </form>
          </CardBody>
        </Card>
      )}

      <Card className="border-0 shadow-sm rounded-4">
        <CardHeader className="bg-white"><strong>Website conversations</strong></CardHeader>
        <CardBody>
          <Row>
            <Col md={4} className="border-end">
              <div className="d-flex flex-column gap-2">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation._id}
                    color={conversation._id === selectedConversationId ? "primary" : "light"}
                    className="text-start"
                    onClick={() => setSelectedConversationId(conversation._id)}
                  >
                    <strong>{conversation.name || conversation.email || conversation.phone || "Website visitor"}</strong>
                    <div className="small">{conversation.messages?.at(-1)?.text || conversation.widget?.name || "New conversation"}</div>
                    <Badge color={conversation.status === "RESOLVED" ? "secondary" : "success"}>{conversation.status}</Badge>
                  </Button>
                ))}
                {!conversations.length && <div className="text-muted small">No website conversations yet.</div>}
              </div>
            </Col>
            <Col md={8}>
              {selectedConversation ? (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div><strong>{selectedConversation.name || "Website visitor"}</strong><div className="small text-muted">{selectedConversation.email} {selectedConversation.phone}</div></div>
                    <Input type="select" value={selectedConversation.status} onChange={(event) => updateConversationStatus(event.target.value)} style={{ maxWidth: 150 }}>
                      <option value="OPEN">Open</option><option value="PENDING">Pending</option><option value="RESOLVED">Resolved</option>
                    </Input>
                  </div>
                  <div style={{ maxHeight: 380, minHeight: 180, overflowY: "auto" }} className="border rounded p-3 mb-3">
                    {(selectedConversation.messages || []).map((message) => (
                      <div key={message._id} className={`mb-2 ${message.sender === "visitor" ? "text-start" : "text-end"}`}>
                        <span className={`d-inline-block rounded px-3 py-2 ${message.sender === "visitor" ? "bg-light" : "bg-success text-white"}`} style={{ maxWidth: "85%", whiteSpace: "pre-wrap" }}>{message.text}</span>
                      </div>
                    ))}
                  </div>
                  <form className="d-flex gap-2" onSubmit={sendReply}>
                    <Input value={reply} maxLength={4000} onChange={(event) => setReply(event.target.value)} placeholder="Reply to visitor…" />
                    <Button color="success" type="submit">Send</Button>
                  </form>
                </>
              ) : <div className="text-muted">Select a website conversation to view and reply.</div>}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default WhatsappWidgets;
