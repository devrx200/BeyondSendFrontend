import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Row, Col, Input,
  Badge, InputGroup, InputGroupText, Modal, ModalHeader,
  ModalBody, ModalFooter, FormGroup, Label
} from "reactstrap";
import {
  FaWhatsapp, FaSearch, FaPaperPlane, FaUser, FaCheckDouble,
  FaPhoneAlt, FaReply, FaClock, FaCheckCircle, FaExclamationTriangle,
  FaTag, FaUserCheck, FaChevronRight, FaTimes, FaFileAlt, FaSlidersH
} from "react-icons/fa";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import apiClient, { getApiResponseData } from "@apiService";
import { BASE_HOST } from "../../../services/api.service";

const WhatsappResponses = () => {
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [showProfileSidebar, setShowProfileSidebar] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [agents, setAgents] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [templateParameters, setTemplateParameters] = useState([]);
  const [messageType, setMessageType] = useState("text");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileTags, setProfileTags] = useState("");
  const [quickReplyTitle, setQuickReplyTitle] = useState("");
  const [quickReplyText, setQuickReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const selectedTemplate = templates.find((template) => template._id === selectedTemplateId);
  const templateVariableNumbers = useMemo(
    () =>
      Array.from(new Set(selectedTemplate?.body?.match(/\{\{\d+\}\}/g) || []))
        .map((variable) => Number(variable.replace(/[{}]/g, "")))
        .sort((first, second) => first - second),
    [selectedTemplate]
  );

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    try {
      const [conversationResponse, templateResponse, agentResponse, quickReplyResponse] = await Promise.all([
        apiClient.get("/whatsapp/conversations/list"),
        apiClient.get("/whatsapp/templates/list", {
          params: { status: "APPROVED", provider: "PRIMARY", limit: "ALL" }
        }),
        apiClient.get("/whatsapp/inbox/agents"),
        apiClient.get("/whatsapp/quick-replies")
      ]);
      const conversationData = getApiResponseData(conversationResponse);
      const templateData = getApiResponseData(templateResponse);
      const agentData = getApiResponseData(agentResponse);
      const quickReplyData = getApiResponseData(quickReplyResponse);
      const nextThreads = Array.isArray(conversationData) ? conversationData : [];
      const nextTemplates = Array.isArray(templateData) ? templateData : [];
      setThreads(nextThreads);
      setAgents(Array.isArray(agentData) ? agentData : []);
      setQuickReplies(Array.isArray(quickReplyData) ? quickReplyData : []);
      setTemplates(
        Array.isArray(nextTemplates)
          ? nextTemplates.filter(
              (template) =>
                String(template.providerStatus || template.status || "").toUpperCase() === "APPROVED"
            )
          : []
      );
      setActiveThreadId((current) => (
        nextThreads.some((thread) => thread.id === current) ? current : nextThreads[0]?.id || ""
      ));
      setSelectedTemplateId((current) =>
        nextTemplates.some((template) => template._id === current)
          ? current
          : nextTemplates.find(
              (template) =>
                String(template.providerStatus || template.status || "").toUpperCase() === "APPROVED"
            )?._id || ""
      );
    } catch (error) {
      console.error("Fetch WhatsApp inbox error:", error);
      if (!silent) {
        Swal.fire({
          icon: "error",
          title: "Unable to load WhatsApp inbox",
          text: error?.response?.data?.message || "Check the selected WhatsApp provider configuration and try again."
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => fetchData(), 0);
    const timer = window.setInterval(() => fetchData({ silent: true }), 30000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [fetchData]);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (!token) return undefined;
    const socket = io(BASE_HOST, { auth: { token }, transports: ["websocket", "polling"] });
    socket.on("whatsapp:conversation", () => fetchData({ silent: true }));
    return () => socket.disconnect();
  }, [fetchData]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfileName(activeThread?.customerName || "");
      setProfileEmail(activeThread?.email || "");
      setProfileTags((activeThread?.tags || []).join(", "));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeThreadId, activeThread?.customerName, activeThread?.email, activeThread?.tags]);

  useEffect(() => {
    const initialUpdate = window.setTimeout(() => setCurrentTime(Date.now()), 0);
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(timer);
    };
  }, []);

  // 24-hour Meta Messaging Window calculation
  const messagingWindowStatus = useMemo(() => {
    if (!currentTime || !activeThread?.lastCustomerMessageTimestamp) {
      return { isOpen: false, hoursLeft: 0, minsLeft: 0 };
    }
    const elapsedMs = currentTime - activeThread.lastCustomerMessageTimestamp;
    const windowTotalMs = 24 * 60 * 60 * 1000;
    const remainingMs = windowTotalMs - elapsedMs;

    if (remainingMs <= 0) {
      return { isOpen: false, hoursLeft: 0, minsLeft: 0 };
    }
    const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return { isOpen: true, hoursLeft, minsLeft };
  }, [activeThread, currentTime]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if ((!replyText.trim() && messageType === "text") || !activeThread || sending) return;

    if (!messagingWindowStatus.isOpen) {
      Swal.fire({
        icon: "warning",
        title: "24-hour customer service window expired",
        text: "WhatsApp only allows free-form replies within 24 hours of the customer's last message. Send an approved template instead.",
        confirmButtonText: "Select template",
      }).then((res) => {
        if (res.isConfirmed) setShowTemplateModal(true);
      });
      return;
    }

    try {
      setSending(true);
      const payload = messageType === "text"
        ? { text: replyText.trim(), type: "text" }
        : messageType === "location"
          ? {
              type: "location",
              location: {
                latitude: Number(mediaUrl.split(",")[0]),
                longitude: Number(mediaUrl.split(",")[1]),
                name: mediaCaption.trim(),
              },
            }
          : {
              type: messageType,
              mediaUrl: mediaUrl.trim(),
              caption: mediaCaption.trim(),
            };
      await apiClient.post(`/whatsapp/conversations/${activeThread.id}/messages`, payload);
      setReplyText("");
      setMediaUrl("");
      setMediaCaption("");
      await fetchData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Message was not sent",
        text: error?.response?.data?.message || "The selected provider could not send this message."
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate || !activeThread || sending) return;
    try {
      setSending(true);
      await apiClient.post(`/whatsapp/conversations/${activeThread.id}/messages`, {
        templateId: selectedTemplate._id,
        parameters: templateParameters
      });
      setShowTemplateModal(false);
      setTemplateParameters([]);
      await fetchData();
      Swal.fire({
        icon: "success",
        title: "Template accepted by the provider",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Template was not sent",
        text: error?.response?.data?.message || "The selected provider could not send this template."
      });
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!activeThread) return;
    try {
      await apiClient.patch(`/whatsapp/conversations/${activeThread.id}/status`, { status: newStatus });
      await fetchData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Conversation was not updated",
        text: error?.response?.data?.message || "Could not update the conversation status."
      });
    }
  };

  const handleAssignmentChange = async (assignedTo) => {
    if (!activeThread) return;
    try {
      await apiClient.patch(`/whatsapp/conversations/${activeThread.id}/assignment`, {
        assignedTo: assignedTo || null,
      });
      await fetchData({ silent: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Conversation was not assigned",
        text: error?.response?.data?.message || error?.message || "Could not update the assignment.",
      });
    }
  };

  const handleSaveContact = async () => {
    if (!activeThread) return;
    try {
      await apiClient.patch(`/whatsapp/conversations/${activeThread.id}/contact`, {
        name: profileName,
        email: profileEmail,
        tags: profileTags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      await fetchData({ silent: true });
      Swal.fire({ icon: "success", title: "Contact updated", timer: 1200, showConfirmButton: false });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Contact was not updated",
        text: error?.response?.data?.message || error?.message || "Could not update contact details.",
      });
    }
  };

  const handleCreateQuickReply = async (event) => {
    event.preventDefault();
    try {
      await apiClient.post("/whatsapp/quick-replies", {
        title: quickReplyTitle,
        text: quickReplyText,
      });
      setQuickReplyTitle("");
      setQuickReplyText("");
      await fetchData({ silent: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Quick reply was not saved",
        text: error?.response?.data?.message || error?.message || "Could not save this quick reply.",
      });
    }
  };

  const handleDeleteQuickReply = async (replyId) => {
    try {
      await apiClient.delete(`/whatsapp/quick-replies/${replyId}`);
      await fetchData({ silent: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Quick reply was not deleted",
        text: error?.response?.data?.message || error?.message || "Could not delete this quick reply.",
      });
    }
  };

  const handleSelectThread = async (thread) => {
    setActiveThreadId(thread.id);
    if (!thread.unread) return;
    try {
      await apiClient.patch(`/whatsapp/conversations/${thread.id}/status`, {
        status: thread.status
      });
      await fetchData({ silent: true });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Conversation could not be marked as read",
        text: error?.response?.data?.message || "Could not update unread status."
      });
    }
  };

  const filteredThreads = threads.filter((thread) => {
    const term = search.toLowerCase();
    return (
      (thread.customerName || "").toLowerCase().includes(term) ||
      (thread.phone || "").includes(term) ||
      (thread.lastMsg || "").toLowerCase().includes(term)
    );
  });

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
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "44px", height: "44px", background: "#25D366" }}
            >
              <FaWhatsapp size={24} className="text-white" />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-white">WhatsApp Two-Way Inbox</h5>
                <Badge color="success" pill className="px-2 py-0.5 fw-semibold" style={{ fontSize: "11px" }}>
                  Provider inbox
                </Badge>
              </div>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Provider-backed messages, approved templates, and customer-window enforcement
              </small>
              <small className="d-block text-white-50" style={{ fontSize: "11px" }}>
                Provider callbacks are received at /api/v0/whatsapp/callback.
              </small>
            </div>
          </div>

          <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={() => setShowQuickReplyModal(true)}>
            <FaReply className="me-1" /> Quick replies
          </Button>
          <Button color="light" size="sm" onClick={() => fetchData()} disabled={loading}>
            <FaSlidersH className="me-1" /> Refresh inbox
          </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <Row className="g-0">
            {/* 1. THREADS SIDEBAR */}
            <Col xs={12} md={3} className="border-end bg-light" style={{ maxHeight: "640px", overflowY: "auto" }}>
              <div className="p-2.5 border-bottom bg-white">
                <InputGroup size="sm">
                  <InputGroupText className="bg-light border-end-0">
                    <FaSearch size={11} className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search chats, numbers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-light"
                  />
                </InputGroup>
              </div>

              <div className="d-flex flex-column">
                {loading && (
                  <div className="p-3 text-center text-muted small">Loading WhatsApp conversations…</div>
                )}
                {!loading && filteredThreads.length === 0 && (
                  <div className="p-3 text-center text-muted small">
                    No WhatsApp conversations have arrived through a configured provider callback.
                  </div>
                )}
                {filteredThreads.map((t) => (
                  <div
                    key={t.id}
                    role="button"
                    onClick={() => handleSelectThread(t)}
                    className={`p-3 border-bottom cursor-pointer transition-all ${
                      activeThreadId === t.id ? "bg-white border-start border-4 border-success shadow-xs" : "bg-light"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark" style={{ fontSize: "13px" }}>
                        {t.customerName}
                      </strong>
                      <small className="text-muted" style={{ fontSize: "10.5px" }}>
                        {t.time ? new Date(t.time).toLocaleString() : "—"}
                      </small>
                    </div>
                    <div className="small text-muted font-monospace mb-1">{t.phone}</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-truncate text-secondary" style={{ maxWidth: "160px" }}>
                        {t.lastMsg}
                      </small>
                      <div className="d-flex align-items-center gap-1">
                        <Badge
                          color={t.status === "OPEN" ? "danger" : t.status === "RESOLVED" ? "success" : "warning"}
                          pill
                          style={{ fontSize: "9px" }}
                        >
                          {t.status}
                        </Badge>
                        {t.unread > 0 && (
                          <span className="badge bg-success rounded-circle" style={{ width: 17, height: 17, fontSize: 10 }}>
                            {t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* 2. CHAT WINDOW */}
            <Col xs={12} md={showProfileSidebar ? 6 : 9} className="d-flex flex-column" style={{ minHeight: "580px", maxHeight: "640px" }}>
              {/* CHAT HEADER */}
              <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center shadow-xs"
                    style={{ width: "38px", height: "38px", background: "#25D366" }}
                  >
                    {activeThread?.customerName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>
                      {activeThread?.customerName}
                    </h6>
                    <div className="d-flex align-items-center gap-2">
                      <small className="text-muted font-monospace">{activeThread?.phone}</small>
                      <Badge color="light" className="text-secondary border py-0.5 px-1.5" style={{ fontSize: "10px" }}>
                        From: {activeThread?.senderId || "—"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <Button
                    color="light"
                    size="sm"
                    className="border text-secondary fw-semibold py-1 px-2.5 d-flex align-items-center gap-1.5"
                    onClick={() => setShowTemplateModal(true)}
                    title="Send an approved WhatsApp template"
                    disabled={!activeThread || templates.length === 0}
                  >
                    <FaFileAlt size={12} className="text-primary" /> Send Template
                  </Button>
                  <Button
                    color={showProfileSidebar ? "primary" : "light"}
                    size="sm"
                    className="border py-1 px-2.5 fw-semibold"
                    onClick={() => setShowProfileSidebar(!showProfileSidebar)}
                    title="Toggle CRM Customer Details"
                  >
                    <FaUser size={11} className="me-1" /> Profile
                  </Button>
                </div>
              </div>

              {/* 24-HOUR CUSTOMER CARE WINDOW BANNER */}
              <div
                className={`py-2 px-3 border-bottom d-flex align-items-center justify-content-between ${
                  messagingWindowStatus.isOpen ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-dark"
                }`}
              >
                <div className="d-flex align-items-center gap-2 small">
                  {messagingWindowStatus.isOpen ? (
                    <>
                      <FaClock className="text-success" />
                      <span>
                        <strong>24-hour customer service window active:</strong> Free-form messaging permitted ({messagingWindowStatus.hoursLeft}h {messagingWindowStatus.minsLeft}m remaining)
                      </span>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="text-warning" />
                      <span>
                        <strong>24-hour customer service window expired:</strong> Free-form replies are disabled. Send an approved template.
                      </span>
                    </>
                  )}
                </div>
                {!messagingWindowStatus.isOpen && (
                  <Button
                    color="warning"
                    size="sm"
                    className="py-0 px-2 fw-semibold text-dark shadow-xs"
                    style={{ fontSize: "11px" }}
                    onClick={() => setShowTemplateModal(true)}
                  >
                    Use template
                  </Button>
                )}
              </div>

              {/* MESSAGES BODY */}
              <div
                className="p-3 flex-grow-1 overflow-auto d-flex flex-column gap-2"
                style={{ background: "#E5DDD5" }}
              >
                {activeThread?.messages?.map((m, idx) => {
                  const isAgent = m.sender === "agent" || m.sender === "bot";
                  return (
                    <div
                      key={idx}
                      className={`d-flex ${isAgent ? "justify-content-end" : "justify-content-start"}`}
                    >
                      <div
                        className="p-2.5 rounded-3 shadow-xs position-relative"
                        style={{
                          maxWidth: "75%",
                          background: isAgent ? (m.isTemplate ? "#e1f5fe" : "#dcf8c6") : "#ffffff",
                          fontSize: "12.5px"
                        }}
                      >
                        {m.isTemplate && (
                          <div className="small fw-bold text-primary mb-1 border-bottom pb-1" style={{ fontSize: "10px" }}>
                            ⚡ META HSM APPROVED TEMPLATE
                          </div>
                        )}
                        <div style={{ whiteSpace: "pre-line" }}>{m.text}</div>
                        {m.mediaUrl && ["image", "video", "audio"].includes(String(m.type).toLowerCase()) && (
                          String(m.type).toLowerCase() === "image" ? (
                            <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                              <img src={m.mediaUrl} alt={m.fileName || "WhatsApp attachment"} className="img-fluid rounded mt-1" style={{ maxHeight: 240 }} />
                            </a>
                          ) : String(m.type).toLowerCase() === "video" ? (
                            <video src={m.mediaUrl} controls className="d-block mt-1 rounded" style={{ maxWidth: 280 }} />
                          ) : (
                            <audio src={m.mediaUrl} controls className="d-block mt-1" />
                          )
                        )}
                        {m.mediaUrl && !["image", "video", "audio"].includes(String(m.type).toLowerCase()) && (
                          <a href={m.mediaUrl} target="_blank" rel="noreferrer" className="d-block mt-1 small">
                            {m.fileName || `View ${m.type || "attachment"}`}
                          </a>
                        )}
                        {m.type === "location" && m.location?.latitude != null && m.location?.longitude != null && (
                          <a
                            href={`https://www.google.com/maps?q=${m.location.latitude},${m.location.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            className="d-block mt-1 small"
                          >
                            Open shared location
                          </a>
                        )}
                        <div className="text-end mt-1 text-muted" style={{ fontSize: "9px" }}>
                          {m.time ? new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          {isAgent && <FaCheckDouble size={9} style={{ color: "#34B7F1" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REPLY BAR */}
              <form onSubmit={handleSendReply} className="p-2.5 bg-white border-top">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Input
                    type="select"
                    bsSize="sm"
                    value={messageType}
                    onChange={(event) => setMessageType(event.target.value)}
                    disabled={!messagingWindowStatus.isOpen}
                    style={{ maxWidth: 150 }}
                  >
                    <option value="text">Text message</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                    <option value="location">Location</option>
                  </Input>
                  <small className="text-muted">
                    {messagingWindowStatus.isOpen ? "Free-form messaging is available." : "Use an approved template outside the 24-hour window."}
                  </small>
                </div>
                {messageType === "text" ? (
                  <InputGroup>
                    <Input
                      placeholder={messagingWindowStatus.isOpen ? "Type WhatsApp reply..." : "24-hour window expired; send an approved template"}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={!messagingWindowStatus.isOpen}
                    />
                    <Button color="success" type="submit" disabled={!messagingWindowStatus.isOpen || !replyText.trim() || sending}>
                      <FaPaperPlane size={12} className="me-1" /> Send
                    </Button>
                  </InputGroup>
                ) : (
                  <>
                    <Input
                      className="mb-2"
                      placeholder={messageType === "location" ? "Latitude, longitude" : "Public HTTPS media URL"}
                      value={mediaUrl}
                      onChange={(event) => setMediaUrl(event.target.value)}
                      disabled={!messagingWindowStatus.isOpen}
                    />
                    <InputGroup>
                      <Input
                        placeholder={messageType === "location" ? "Location name (optional)" : "Caption (optional)"}
                        value={mediaCaption}
                        onChange={(event) => setMediaCaption(event.target.value)}
                        disabled={!messagingWindowStatus.isOpen}
                      />
                      <Button color="success" type="submit" disabled={!messagingWindowStatus.isOpen || !mediaUrl.trim() || sending}>
                        <FaPaperPlane size={12} className="me-1" /> Send
                      </Button>
                    </InputGroup>
                  </>
                )}
                {quickReplies.length > 0 && (
                  <div className="d-flex flex-wrap gap-1 mt-2">
                    {quickReplies.slice(0, 6).map((reply) => (
                      <Button
                        key={reply._id}
                        type="button"
                        color="light"
                        size="sm"
                        className="border"
                        title={reply.text}
                        onClick={() => {
                          setMessageType("text");
                          setReplyText(reply.text);
                        }}
                      >
                        {reply.title}
                      </Button>
                    ))}
                  </div>
                )}
              </form>
            </Col>

            {/* 3. CUSTOMER CRM PROFILE SIDEBAR */}
            {showProfileSidebar && (
              <Col xs={12} md={3} className="border-start bg-white p-3" style={{ maxHeight: "640px", overflowY: "auto" }}>
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <h6 className="fw-bold mb-0 text-dark">Customer CRM Hub</h6>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted p-0"
                    onClick={() => setShowProfileSidebar(false)}
                  >
                    <FaTimes size={13} />
                  </button>
                </div>

                <div className="text-center mb-3">
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm"
                    style={{ width: "52px", height: "52px", background: "#25D366", fontSize: "20px" }}
                  >
                    {activeThread?.customerName?.charAt(0) || "U"}
                  </div>
                  <h6 className="fw-bold mb-0 text-dark">{activeThread?.customerName}</h6>
                  <small className="text-muted font-monospace">{activeThread?.phone}</small>
                </div>

                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Thread Status</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={activeThread?.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                  >
                    <option value="OPEN">🔴 Open / Needs Attention</option>
                    <option value="PENDING">🟡 Pending Customer Reply</option>
                    <option value="RESOLVED">🟢 Resolved / Closed</option>
                  </Input>
                </div>

                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Assigned Support Agent</Label>
                  <Input
                    type="select"
                    bsSize="sm"
                    value={activeThread?.assignedTo?._id || activeThread?.assignedTo || ""}
                    onChange={(event) => handleAssignmentChange(event.target.value)}
                  >
                    <option value="">Unassigned</option>
                    {agents.map((agent) => (
                      <option key={agent._id} value={agent._id}>
                        {agent.name} ({agent.role})
                      </option>
                    ))}
                  </Input>
                </div>

                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Contact name</Label>
                  <Input bsSize="sm" value={profileName} onChange={(event) => setProfileName(event.target.value)} />
                </div>

                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Email</Label>
                  <Input type="email" bsSize="sm" value={profileEmail} onChange={(event) => setProfileEmail(event.target.value)} />
                </div>
                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Tags (comma-separated)</Label>
                  <Input bsSize="sm" value={profileTags} onChange={(event) => setProfileTags(event.target.value)} />
                </div>
                <Button color="success" size="sm" className="w-100 mb-3" onClick={handleSaveContact} disabled={!activeThread}>
                  Save contact details
                </Button>
                <div className="p-2 rounded bg-light border small text-muted">
                  <FaUserCheck className="text-primary me-1" /> {activeThread?.assignedAgent || "Unassigned"}
                </div>
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>

      <Modal isOpen={showQuickReplyModal} toggle={() => setShowQuickReplyModal(false)} centered>
        <ModalHeader toggle={() => setShowQuickReplyModal(false)}>Manage quick replies</ModalHeader>
        <ModalBody>
          <form onSubmit={handleCreateQuickReply} className="mb-3">
            <FormGroup>
              <Label>Shortcut title</Label>
              <Input value={quickReplyTitle} onChange={(event) => setQuickReplyTitle(event.target.value)} maxLength={80} required />
            </FormGroup>
            <FormGroup>
              <Label>Message</Label>
              <Input type="textarea" value={quickReplyText} onChange={(event) => setQuickReplyText(event.target.value)} maxLength={2000} required />
            </FormGroup>
            <Button type="submit" color="success" size="sm">Save quick reply</Button>
          </form>
          <div className="d-flex flex-column gap-2">
            {quickReplies.map((reply) => (
              <div key={reply._id} className="border rounded p-2 d-flex justify-content-between align-items-start gap-2">
                <div>
                  <strong className="d-block">{reply.title}</strong>
                  <small className="text-muted">{reply.text}</small>
                </div>
                <Button color="danger" outline size="sm" onClick={() => handleDeleteQuickReply(reply._id)}>Delete</Button>
              </div>
            ))}
            {quickReplies.length === 0 && <div className="small text-muted">No quick replies created yet.</div>}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="light" onClick={() => setShowQuickReplyModal(false)}>Close</Button>
        </ModalFooter>
      </Modal>

      {/* ── APPROVED TEMPLATE MODAL ── */}
      <Modal isOpen={showTemplateModal} toggle={() => setShowTemplateModal(false)} centered size="md">
        <ModalHeader toggle={() => setShowTemplateModal(false)} className="py-2.5 px-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="p-1.5 rounded bg-success bg-opacity-10 text-success">
              <FaFileAlt size={16} />
            </span>
            <span className="fw-bold text-dark">Send Approved WhatsApp Template</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-3">
          <p className="text-muted small mb-3">
            The selected provider submits approved templates for delivery outside the 24-hour customer service window.
          </p>

          <FormGroup>
            <Label className="small fw-semibold text-secondary">Select Template</Label>
            <Input
              type="select"
              value={selectedTemplateId}
              onChange={(e) => {
                const found = templates.find((template) => template._id === e.target.value);
                setSelectedTemplateId(found?._id || "");
                const variableCount = new Set(found?.body?.match(/\{\{\d+\}\}/g) || []).size;
                setTemplateParameters(Array.from({ length: variableCount }, () => ""));
              }}
            >
              <option value="">-- Select an approved template --</option>
              {templates.map((template) => (
                <option key={template._id} value={template._id}>
                  {template.name} ({template.category})
                </option>
              ))}
            </Input>
          </FormGroup>

          {templateVariableNumbers.map((variable, index) => (
            <FormGroup key={`${selectedTemplateId}-${variable}`}>
              <Label className="small fw-semibold text-secondary">
                Template variable {`{{${variable}}}`}
              </Label>
              <Input
                value={templateParameters[index] || ""}
                onChange={(event) => {
                  const nextParameters = [...templateParameters];
                  nextParameters[index] = event.target.value;
                  setTemplateParameters(nextParameters);
                }}
                required
              />
            </FormGroup>
          ))}

          <div className="p-3 rounded-3 bg-light border mt-3">
            <span className="small text-muted fw-semibold d-block mb-1">Template Preview:</span>
            <div className="p-2.5 rounded bg-white border text-dark small" style={{ whiteSpace: "pre-line" }}>
              {templateVariableNumbers.reduce(
                (body, variable, index) =>
                  body.replace(
                    new RegExp(`\\{\\{${variable}\\}\\}`, "g"),
                    templateParameters[index] || `{{${variable}}}`
                  ),
                selectedTemplate?.body || "Select an approved template to preview its content."
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="py-2 px-3 bg-light border-top">
          <Button color="light" size="sm" onClick={() => setShowTemplateModal(false)}>
            Cancel
          </Button>
          <Button
            color="success"
            size="sm"
            className="fw-semibold px-3"
            onClick={handleSendTemplate}
            disabled={!activeThread || !selectedTemplate || sending}
          >
            <FaPaperPlane size={11} className="me-1" /> {sending ? "Sending…" : "Send Template"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default WhatsappResponses;
