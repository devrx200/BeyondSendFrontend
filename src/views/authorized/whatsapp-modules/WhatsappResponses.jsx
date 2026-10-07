import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Row, Col, Input,
  Badge, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaWhatsapp, FaSearch, FaPaperPlane, FaUser, FaCheckDouble,
  FaPhoneAlt, FaReply, FaClock
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialThreads = [
  {
    id: "TH-01",
    customerName: "Vikram Malhotra",
    phone: "+91 98221 14455",
    lastMsg: "Please share pricing for 50,000 SMS credits",
    time: "2 mins ago",
    unread: 1,
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
    lastMsg: "Thank you, our WhatsApp WABA sender ID is now verified!",
    time: "15 mins ago",
    unread: 0,
    messages: [
      { sender: "agent", text: "Your Meta WABA registration has passed compliance checks.", time: "23:10" },
      { sender: "customer", text: "Thank you, our WhatsApp WABA sender ID is now verified!", time: "23:15" }
    ]
  },
  {
    id: "TH-03",
    customerName: "Amit Sharma",
    phone: "+91 97000 88991",
    lastMsg: "Can you help update our DLT Principal Entity certificate?",
    time: "1 hour ago",
    unread: 0,
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

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

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
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "44px", height: "44px", background: "#25D366" }}
            >
              <FaWhatsapp size={24} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">WhatsApp Two-Way Inbound Desk</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Live two-way customer chat inbox, automated agent responses, and thread resolution
              </small>
            </div>
          </div>
          <Badge color="success" className="py-1.5 px-3 rounded-pill fw-semibold">
            ● Live WABA Socket Active
          </Badge>
        </CardHeader>

        <CardBody className="p-0">
          <Row className="g-0">
            {/* THREADS SIDEBAR */}
            <Col xs={12} md={4} className="border-end bg-light" style={{ maxHeight: "600px", overflowY: "auto" }}>
              <div className="p-3 border-bottom bg-white">
                <InputGroup size="sm">
                  <InputGroupText className="bg-light border-end-0">
                    <FaSearch size={11} className="text-muted" />
                  </InputGroupText>
                  <Input
                    placeholder="Search conversations..."
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
                    className={`p-3 border-bottom cursor-pointer transition-all ${activeThreadId === t.id ? "bg-white border-start border-4 border-primary" : "bg-light"}`}
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
                      <small className="text-truncate text-secondary" style={{ maxWidth: "200px" }}>
                        {t.lastMsg}
                      </small>
                      {t.unread > 0 && (
                        <span className="badge bg-success rounded-circle" style={{ width: 18, height: 18, fontSize: 10 }}>
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Col>

            {/* CHAT WINDOW */}
            <Col xs={12} md={8} className="d-flex flex-column" style={{ minHeight: "540px", maxHeight: "600px" }}>
              {/* CHAT HEADER */}
              <div className="p-3 border-bottom bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold"
                    style={{ width: "36px", height: "36px" }}
                  >
                    {activeThread?.customerName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: "14px" }}>
                      {activeThread?.customerName}
                    </h6>
                    <small className="text-muted font-monospace">{activeThread?.phone}</small>
                  </div>
                </div>
                <Badge color="light" className="text-dark border">
                  Thread ID: {activeThread?.id}
                </Badge>
              </div>

              {/* MESSAGES BODY */}
              <div
                className="p-3.5 flex-grow-1 overflow-auto d-flex flex-column gap-2.5"
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
                          background: isAgent ? "#dcf8c6" : "#ffffff",
                          fontSize: "12.5px"
                        }}
                      >
                        <div>{m.text}</div>
                        <div className="text-end mt-1 text-muted" style={{ fontSize: "9px" }}>
                          {m.time} {isAgent && <FaCheckDouble size={9} style={{ color: "#34B7F1" }} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* REPLY BAR */}
              <form onSubmit={handleSendReply} className="p-3 bg-white border-top">
                <InputGroup>
                  <Input
                    placeholder="Type an official WhatsApp reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button color="success" type="submit" style={{ background: "#25D366", border: "none" }}>
                    <FaPaperPlane size={12} className="me-1" /> Send
                  </Button>
                </InputGroup>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default WhatsappResponses;
