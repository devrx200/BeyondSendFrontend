import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Badge, Row, Col,
  Nav, NavItem, NavLink
} from "reactstrap";
import {
  FaBook, FaCode, FaCopy, FaCheck, FaServer, FaTerminal
} from "react-icons/fa";
import Swal from "sweetalert2";

const snippets = {
  SMS: {
    curl: `curl -X POST https://api.beyondsend.in/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "senderId": "BYDSND",
    "templateId": "1407161234567890123",
    "message": "Your BeyondSend verification OTP is 482910."
  }'`,
    node: `const axios = require('axios');

const res = await axios.post('https://api.beyondsend.in/v1/sms/send', {
  to: '+919876543210',
  senderId: 'BYDSND',
  templateId: '1407161234567890123',
  message: 'Your BeyondSend verification OTP is 482910.'
}, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
console.log(res.data);`,
    python: `import requests

url = "https://api.beyondsend.in/v1/sms/send"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
payload = {
    "to": "+919876543210",
    "senderId": "BYDSND",
    "templateId": "1407161234567890123",
    "message": "Your BeyondSend verification OTP is 482910."
}

res = requests.post(url, json=payload, headers=headers)
print(res.json())`
  },
  WHATSAPP: {
    curl: `curl -X POST https://api.beyondsend.in/v1/whatsapp/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+919876543210",
    "templateName": "order_dispatch_update",
    "language": "en_US",
    "parameters": ["John", "ORD-9982", "https://beyondsend.in/track/9982"]
  }'`,
    node: `const axios = require('axios');

const res = await axios.post('https://api.beyondsend.in/v1/whatsapp/send', {
  to: '+919876543210',
  templateName: 'order_dispatch_update',
  language: 'en_US',
  parameters: ['John', 'ORD-9982', 'https://beyondsend.in/track/9982']
}, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});`,
    python: `import requests

res = requests.post("https://api.beyondsend.in/v1/whatsapp/send",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "to": "+919876543210",
        "templateName": "order_dispatch_update",
        "language": "en_US",
        "parameters": ["John", "ORD-9982", "https://beyondsend.in/track/9982"]
    }
)`
  }
};

const ApiDocViewer = () => {
  const [channel, setChannel] = useState("SMS");
  const [lang, setLang] = useState("curl");

  const code = snippets[channel]?.[lang] || "// Code example";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      timer: 1000,
      showConfirmButton: false
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
              <FaBook size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Developer API Documentation</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Integrate BeyondSend high-speed messaging into your backend applications
              </small>
            </div>
          </div>
          <Badge color="info" className="py-1.5 px-3 rounded-pill fw-semibold">
            API Version: v1.4 REST
          </Badge>
        </CardHeader>

        <CardBody className="p-4 bg-light">
          <Row className="g-3">
            {/* CHANNEL SELECTOR */}
            <Col xs={12}>
              <div className="d-flex gap-2 mb-2">
                {["SMS", "WHATSAPP"].map((ch) => (
                  <Button
                    key={ch}
                    size="sm"
                    color={channel === ch ? "primary" : "light"}
                    className="border fw-bold px-3"
                    onClick={() => setChannel(ch)}
                  >
                    {ch === "SMS" ? "SMS DLT Dispatch" : "WhatsApp Cloud API"}
                  </Button>
                ))}
              </div>
            </Col>

            {/* CODE VIEWER BOX */}
            <Col xs={12}>
              <div className="rounded-3 border overflow-hidden shadow-sm bg-dark">
                <div className="p-2.5 bg-black bg-opacity-40 d-flex justify-content-between align-items-center border-bottom border-secondary border-opacity-20">
                  <div className="d-flex gap-2">
                    {["curl", "node", "python"].map((l) => (
                      <span
                        key={l}
                        role="button"
                        onClick={() => setLang(l)}
                        className={`badge font-monospace px-2.5 py-1.5 cursor-pointer ${lang === l ? "bg-primary text-white" : "bg-transparent text-secondary"}`}
                      >
                        {l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" color="light" outline className="p-1 px-2.5" onClick={handleCopy}>
                    <FaCopy size={11} className="me-1" /> Copy Code
                  </Button>
                </div>
                <pre className="p-3.5 mb-0 text-light font-monospace" style={{ fontSize: "12.5px", lineHeight: "1.6" }}>
                  {code}
                </pre>
              </div>
            </Col>

            {/* RESPONSE SAMPLE */}
            <Col xs={12}>
              <div className="p-3 bg-white rounded-3 border shadow-xs">
                <small className="fw-bold text-muted text-uppercase d-block mb-1">
                  Sample JSON Response (HTTP 200 OK)
                </small>
                <pre className="mb-0 text-dark font-monospace bg-light p-2.5 rounded border" style={{ fontSize: "12px" }}>
{`{
  "success": true,
  "messageId": "msg_9011af28ec",
  "status": "QUEUED",
  "creditsDeducted": 1.0,
  "timestamp": 1758650892
}`}
                </pre>
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </div>
  );
};

export default ApiDocViewer;
