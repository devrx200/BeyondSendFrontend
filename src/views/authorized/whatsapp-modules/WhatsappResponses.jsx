import { useState, useMemo } from "react";
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
import Swal from "sweetalert2";

const SENDER_NUMBERS = [
  { id: "SND-01", phone: "+91 98221 14455", label: "Official Support WABA", tier: "TIER_100K", quality: "GREEN", isDefault: true },
  { id: "SND-02", phone: "+91 98765 43210", label: "Enterprise Sales & Onboarding", tier: "TIER_10K", quality: "GREEN", isDefault: false },
  { id: "SND-03", phone: "+91 88888 22334", label: "Transactional Alerts Gateway", tier: "UNLIMITED", quality: "GREEN", isDefault: false },
];

const META_APPROVED_TEMPLATES = [
  {
    name: "support_reengage_notice",
    category: "CUSTOMER_CARE",
    language: "en_US",
    text: "Hello {{1}}, we are following up on your inquiry with BeyondSend. Please reply to this message to continue our conversation.",
  },
  {
    name: "dlt_compliance_update",
    category: "TRANSACTIONAL",
    language: "en_US",
    text: "Dear Customer, your TRAI DLT Principal Entity header has been scrubbed and verified. Reference ID: {{1}}.",
  },
  {
    name: "billing_invoice_ready",
    category: "BILLING",
    language: "en_US",
    text: "Your BeyondSend telecom billing statement for this billing cycle is ready. Total: ₹{{1}}. Login to portal to view details.",
  },
];

const initialThreads = [
  {
    id: "TH-01",
    customerName: "Vikram Malhotra",
    phone: "+91 98221 14455",
    email: "vikram@malhotratelecom.com",
    lastMsg: "Please share pricing for 50,000 SMS credits",
    time: "2 mins ago",
    unread: 1,
    status: "OPEN",
    tags: ["VIP Enterprise", "DLT Verified"],
    assignedAgent: "Mr. Anand Charpe",
    // Customer last sent 25 mins ago (within 24h window)
    lastCustomerMsgTimestamp: Date.now() - 25 * 60 * 1000,
    messages: [
      { sender: "customer", text: "Hello BeyondSend Team", time: "23:20" },
      { sender: "bot", text: "Welcome! How can our telecom specialists assist you today?", time: "23:21" },
      { sender: "customer", text: "Please share pricing for 50,000 SMS credits", time: "23:25" }
    ]
  },
  {
    id: "TH-02",
    customerName: "Sneha Patel",
    phone: "+91 99123 77889",
    email: "sneha.p@techlogix.in",
    lastMsg: "Thank you, our WhatsApp WABA sender ID is now verified!",
    time: "15 mins ago",
    unread: 0,
    status: "RESOLVED",
    tags: ["WhatsApp WABA", "Onboarded"],
    assignedAgent: "Support Desk",
    // Customer last sent 28 hours ago (EXPIRED window)
    lastCustomerMsgTimestamp: Date.now() - 28 * 60 * 60 * 1000,
    messages: [
      { sender: "agent", text: "Your Meta WABA registration has passed compliance checks.", time: "Yesterday" },
      { sender: "customer", text: "Thank you, our WhatsApp WABA sender ID is now verified!", time: "Yesterday" }
    ]
  },
  {
    id: "TH-03",
    customerName: "Amit Sharma",
    phone: "+91 97000 88991",
    email: "asharma@indiatelecom.org",
    lastMsg: "Can you help update our DLT Principal Entity certificate?",
    time: "1 hour ago",
    unread: 0,
    status: "PENDING",
    tags: ["DLT Help", "Lead"],
    assignedAgent: "Unassigned",
    // Customer last sent 1 hour ago (within 24h window)
    lastCustomerMsgTimestamp: Date.now() - 60 * 60 * 1000,
    messages: [
      { sender: "customer", text: "Can you help update our DLT Principal Entity certificate?", time: "22:30" }
    ]
  }
];

const WhatsappResponses = () => {
  const [threads, setThreads] = useState(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState("TH-01");
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSenderId, setSelectedSenderId] = useState("SND-01");
  const [showProfileSidebar, setShowProfileSidebar] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(META_APPROVED_TEMPLATES[0]);
  const [templateVar, setTemplateVar] = useState("");

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // 24-hour Meta Messaging Window calculation
  const messagingWindowStatus = useMemo(() => {
    if (!activeThread?.lastCustomerMsgTimestamp) {
      return { isOpen: true, hoursLeft: 24, minsLeft: 0 };
    }
    const elapsedMs = Date.now() - activeThread.lastCustomerMsgTimestamp;
    const windowTotalMs = 24 * 60 * 60 * 1000;
    const remainingMs = windowTotalMs - elapsedMs;

    if (remainingMs <= 0) {
      return { isOpen: false, hoursLeft: 0, minsLeft: 0 };
    }
    const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
    const minsLeft = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return { isOpen: true, hoursLeft, minsLeft };
  }, [activeThread]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    if (!messagingWindowStatus.isOpen) {
      Swal.fire({
        icon: "warning",
        title: "24h Customer Care Window Expired",
        text: "Meta Cloud API policy prohibits free-form messages after 24 hours of customer inactivity. Please send an Approved Meta HSM Template to re-open the conversation window.",
        confirmButtonText: "Select Meta Template",
      }).then((res) => {
        if (res.isConfirmed) setShowTemplateModal(true);
      });
      return;
    }

    const newMsg = {
      sender: "agent",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMsg: replyText.trim(),
              unread: 0
            }
          : t
      )
    );
    setReplyText("");
  };

  const handleSendTemplate = () => {
    if (!selectedTemplate) return;
    const textFormatted = selectedTemplate.text.replace("{{1}}", templateVar || activeThread?.customerName || "Customer");
    const newMsg = {
      sender: "agent",
      text: `[Meta HSM Template: ${selectedTemplate.name}]\n${textFormatted}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isTemplate: true
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastMsg: textFormatted,
              // Sending approved template re-activates engagement
              lastCustomerMsgTimestamp: Date.now(),
              unread: 0
            }
          : t
      )
    );

    setShowTemplateModal(false);
    setTemplateVar("");
    Swal.fire({
      icon: "success",
      title: "HSM Template Dispatched",
      text: `Meta approved template "${selectedTemplate.name}" dispatched successfully to ${activeThread?.phone}`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleStatusChange = (newStatus) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, status: newStatus } : t))
    );
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.lastMsg.toLowerCase().includes(search.toLowerCase())
  );

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
                <h5 className="fw-bold mb-0 text-white">WhatsApp Two-Way Inbound Desk</h5>
                <Badge color="success" pill className="px-2 py-0.5 fw-semibold" style={{ fontSize: "11px" }}>
                  Meta Cloud API v19.0
                </Badge>
              </div>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Multi-number customer inbox, 24h compliance window tracker, and Meta HSM template re-engagement
              </small>
            </div>
          </div>

          {/* SENDER NUMBER SELECTOR (Multi-number architecture per wa req.pdf) */}
          <div className="d-flex align-items-center gap-2 bg-dark bg-opacity-50 p-2 rounded-3 border border-secondary border-opacity-50">
            <span className="small text-white-50">Send From:</span>
            <Input
              type="select"
              bsSize="sm"
              className="bg-dark text-white border-0 fw-semibold"
              style={{ fontSize: "12px", width: "auto" }}
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
            >
              {SENDER_NUMBERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.phone} — {s.label} ({s.tier})
                </option>
              ))}
            </Input>
            <Badge color="success" pill className="px-2 py-1">
              Active WABA
            </Badge>
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
                {filteredThreads.map((t) => (
                  <div
                    key={t.id}
                    role="button"
                    onClick={() => setActiveThreadId(t.id)}
                    className={`p-3 border-bottom cursor-pointer transition-all ${
                      activeThreadId === t.id ? "bg-white border-start border-4 border-success shadow-xs" : "bg-light"
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="text-dark" style={{ fontSize: "13px" }}>
                        {t.customerName}
                      </strong>
                      <small className="text-muted" style={{ fontSize: "10.5px" }}>
                        {t.time}
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
                        Thread: {activeThread?.id}
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
                    title="Send Pre-Approved Meta HSM Template"
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
                        <strong>24-Hour Customer Care Window Active:</strong> Free-form messaging permitted ({messagingWindowStatus.hoursLeft}h {messagingWindowStatus.minsLeft}m remaining)
                      </span>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="text-warning" />
                      <span>
                        <strong>24-Hour Messaging Window Expired:</strong> Free-form text is locked by Meta policy. Send an approved HSM template to re-engage.
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
                    Use HSM Template
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
                        <div className="text-end mt-1 text-muted" style={{ fontSize: "9px" }}>
                          {m.time} {isAgent && <FaCheckDouble size={9} style={{ color: "#34B7F1" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REPLY BAR */}
              <form onSubmit={handleSendReply} className="p-2.5 bg-white border-top">
                <InputGroup>
                  <Input
                    placeholder={
                      messagingWindowStatus.isOpen
                        ? "Type official WhatsApp reply..."
                        : "24h window closed - Click 'Send Template' or choose HSM template..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={!messagingWindowStatus.isOpen}
                    style={{ background: messagingWindowStatus.isOpen ? "#fff" : "#f8fafc" }}
                  />
                  <Button
                    color="success"
                    type="submit"
                    disabled={!messagingWindowStatus.isOpen || !replyText.trim()}
                    style={{ background: "#25D366", border: "none" }}
                  >
                    <FaPaperPlane size={12} className="me-1" /> Send
                  </Button>
                </InputGroup>
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
                  <div className="p-2 rounded bg-light border text-dark small fw-semibold d-flex align-items-center gap-1.5">
                    <FaUserCheck className="text-primary" /> {activeThread?.assignedAgent || "Unassigned"}
                  </div>
                </div>

                <div className="mb-3">
                  <Label className="small fw-semibold text-secondary mb-1">Customer Tags</Label>
                  <div className="d-flex flex-wrap gap-1">
                    {(activeThread?.tags || []).map((tg, i) => (
                      <Badge key={i} color="light" className="text-dark border px-2 py-1">
                        <FaTag size={9} className="text-muted me-1" /> {tg}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-light border small text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Email:</span>
                    <strong className="text-dark text-truncate" style={{ maxWidth: "130px" }}>{activeThread?.email || "—"}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Opt-In:</span>
                    <span className="text-success fw-bold">✓ Verified</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>WABA Tier:</span>
                    <span className="text-primary fw-bold">Tier 100K</span>
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>

      {/* ── META HSM APPROVED TEMPLATE MODAL ── */}
      <Modal isOpen={showTemplateModal} toggle={() => setShowTemplateModal(false)} centered size="md">
        <ModalHeader toggle={() => setShowTemplateModal(false)} className="py-2.5 px-3 bg-light border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="p-1.5 rounded bg-success bg-opacity-10 text-success">
              <FaFileAlt size={16} />
            </span>
            <span className="fw-bold text-dark">Send Approved Meta HSM Template</span>
          </div>
        </ModalHeader>
        <ModalBody className="p-3">
          <p className="text-muted small mb-3">
            Pre-approved Meta templates bypass the 24-hour messaging restriction and allow initiating conversations at any time.
          </p>

          <FormGroup>
            <Label className="small fw-semibold text-secondary">Select Template</Label>
            <Input
              type="select"
              value={selectedTemplate?.name}
              onChange={(e) => {
                const found = META_APPROVED_TEMPLATES.find((tpl) => tpl.name === e.target.value);
                if (found) setSelectedTemplate(found);
              }}
            >
              {META_APPROVED_TEMPLATES.map((tpl) => (
                <option key={tpl.name} value={tpl.name}>
                  {tpl.name} ({tpl.category})
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label className="small fw-semibold text-secondary">Parameter Value ({"{{1}}"})</Label>
            <Input
              placeholder={activeThread?.customerName || "Customer Name or Reference"}
              value={templateVar}
              onChange={(e) => setTemplateVar(e.target.value)}
            />
          </FormGroup>

          <div className="p-3 rounded-3 bg-light border mt-3">
            <span className="small text-muted fw-semibold d-block mb-1">Template Preview:</span>
            <div className="p-2.5 rounded bg-white border text-dark small" style={{ whiteSpace: "pre-line" }}>
              {selectedTemplate?.text.replace("{{1}}", templateVar || activeThread?.customerName || "Customer")}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="py-2 px-3 bg-light border-top">
          <Button color="light" size="sm" onClick={() => setShowTemplateModal(false)}>
            Cancel
          </Button>
          <Button color="success" size="sm" className="fw-semibold px-3" onClick={handleSendTemplate}>
            <FaPaperPlane size={11} className="me-1" /> Send HSM Template
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default WhatsappResponses;
