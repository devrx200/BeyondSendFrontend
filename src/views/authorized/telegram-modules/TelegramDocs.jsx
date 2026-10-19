import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Badge, Row, Col, Nav, NavItem, NavLink
} from "reactstrap";
import {
  FaTelegramPlane, FaCode, FaCopy, FaCheck, FaBookOpen, FaShieldAlt, FaRobot
} from "react-icons/fa";
import { useToast, ToastContainer } from "@/utilities/WPToast";

const TelegramDocs = () => {
  const { toasts, toast } = useToast();
  const [activeTab, setActiveTab] = useState("gateway-otp");
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Snippet copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const snippets = {
    "gateway-otp": `// 1. Send OTP via Official Telegram Gateway API directly to Phone Number
curl -X POST https://beyondsend.com/api/v0/telegram/gateway/send-verification \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "+919876543210",
    "code": "842109",
    "ttl": 60
  }'`,

    "gateway-check": `// 2. Check Recipient Delivery Ability & Cost
curl -X POST https://beyondsend.com/api/v0/telegram/gateway/check-ability \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "+919876543210"
  }'`,

    "gateway-verify": `// 3. Verify OTP Code against Telegram Request ID
curl -X POST https://beyondsend.com/api/v0/telegram/gateway/check-status \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "requestId": "req_1234567890",
    "code": "842109"
  }'`,

    "broadcast": `// 4. Marketing Broadcast to Bulk Chat IDs
curl -X POST https://beyondsend.com/api/v0/telegram/campaigns/broadcast \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatIds": ["1207697252", "987654321"],
    "text": "*Flash Sale!* Use coupon code TELE30 for 30% off.",
    "buttons": [
      [{"text": "Shop Now", "url": "https://example.com/shop"}]
    ]
  }'`,

    "utility": `// 5. Transactional & Account Utility Alert
curl -X POST https://beyondsend.com/api/v0/telegram/messages/utility \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatId": "1207697252",
    "text": "Your order #BS-8291 has been confirmed and shipped!"
  }'`,
  };

  return (
    <div className="container-fluid py-3 px-md-4">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
        <div className="d-flex align-items-center gap-2">
          <span className="p-2.5 rounded-3 text-white shadow-sm" style={{ backgroundColor: "#0088cc" }}>
            <FaBookOpen size={24} />
          </span>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Telegram CPaaS API &amp; Webhook Documentation</h4>
            <p className="text-muted small mb-0 mt-1">
              Complete developer reference for Telegram Gateway API, Bot Campaigns, and Real-Time Delivery Webhooks.
            </p>
          </div>
        </div>
      </div>

      <Row className="g-4">
        <Col md={4}>
          <Card className="border shadow-sm">
            <CardHeader className="bg-white py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0">API Endpoints</h6>
            </CardHeader>
            <CardBody className="p-2">
              <Nav vertical pills className="gap-1">
                <NavItem>
                  <NavLink
                    className={`cursor-pointer ${activeTab === "gateway-otp" ? "active" : ""}`}
                    onClick={() => setActiveTab("gateway-otp")}
                  >
                    <FaShieldAlt className="me-2" /> Gateway Send OTP
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`cursor-pointer ${activeTab === "gateway-check" ? "active" : ""}`}
                    onClick={() => setActiveTab("gateway-check")}
                  >
                    <FaCheck className="me-2" /> Gateway Check Ability
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`cursor-pointer ${activeTab === "gateway-verify" ? "active" : ""}`}
                    onClick={() => setActiveTab("gateway-verify")}
                  >
                    <FaCode className="me-2" /> Gateway Verify Code
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`cursor-pointer ${activeTab === "broadcast" ? "active" : ""}`}
                    onClick={() => setActiveTab("broadcast")}
                  >
                    <FaTelegramPlane className="me-2" /> Marketing Broadcasts
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={`cursor-pointer ${activeTab === "utility" ? "active" : ""}`}
                    onClick={() => setActiveTab("utility")}
                  >
                    <FaRobot className="me-2" /> Utility Alerts
                  </NavLink>
                </NavItem>
              </Nav>
            </CardBody>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border shadow-sm">
            <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaCode className="text-primary" /> cURL Request Example
              </h6>
              <Button
                color="light"
                size="sm"
                className="border"
                onClick={() => copyToClipboard(snippets[activeTab], activeTab)}
              >
                {copiedKey === activeTab ? <FaCheck className="text-success me-1" /> : <FaCopy className="me-1" />}
                {copiedKey === activeTab ? "Copied" : "Copy Code"}
              </Button>
            </CardHeader>
            <CardBody className="p-3 bg-dark rounded-bottom">
              <pre className="text-light mb-0" style={{ fontSize: "13px", lineHeight: 1.6, overflowX: "auto", backgroundColor: "transparent" }}>
                <code style={{ backgroundColor: "transparent", color: "#f8f9fa", fontFamily: "monospace" }}>{snippets[activeTab]}</code>
              </pre>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TelegramDocs;
