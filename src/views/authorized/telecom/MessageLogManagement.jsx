import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Badge, Row, Col,
  InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaListUl, FaSearch, FaEye, FaWhatsapp, FaEnvelope,
  FaCommentAlt, FaCheckDouble, FaTimesCircle, FaClock
} from "react-icons/fa";

const initialLogs = [
  {
    msgId: "msg_9011af28ec",
    channel: "WHATSAPP",
    recipient: "+91 98765 12345",
    senderId: "+91 98765 00000",
    template: "order_dispatch_update",
    status: "DELIVERED",
    creditsCost: 1.0,
    timestamp: "2026-09-23 23:28:10",
    payload: {
      recipient: "+919876512345",
      template: "order_dispatch_update",
      parameters: ["John", "ORD-9982", "https://beyondsend.in/track/9982"],
      deliveryReceipt: {
        networkTime: "2026-09-23T23:28:12Z",
        wabaStatus: "read"
      }
    }
  },
  {
    msgId: "msg_8012bb49ed",
    channel: "SMS",
    recipient: "+91 99123 44556",
    senderId: "BYDSND",
    template: "OTP_VERIFY",
    status: "DELIVERED",
    creditsCost: 1.0,
    timestamp: "2026-09-23 23:27:44",
    payload: {
      recipient: "+919912344556",
      senderId: "BYDSND",
      dltContentId: "1407161234567890123",
      text: "Your BeyondSend verification OTP is 482910. Valid for 10 minutes."
    }
  },
  {
    msgId: "msg_7013cc50fe",
    channel: "EMAIL",
    recipient: "finance@enterprise-client.com",
    senderId: "billing@beyondsend.in",
    template: "MONTHLY_INVOICE",
    status: "SENT",
    creditsCost: 0.2,
    timestamp: "2026-09-23 23:25:02",
    payload: {
      to: "finance@enterprise-client.com",
      subject: "Your BeyondSend invoice for September 2026",
      status: "smtp_delivered_250"
    }
  },
  {
    msgId: "msg_6014dd61aa",
    channel: "SMS",
    recipient: "+91 90000 00000",
    senderId: "BYDSND",
    template: "OTP_VERIFY",
    status: "FAILED",
    creditsCost: 0.0,
    timestamp: "2026-09-23 23:20:15",
    payload: {
      error: "ERR_UNALLOCATED_NUMBER",
      description: "Carrier reported subscriber does not exist"
    }
  }
];

const MessageLogManagement = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [selectedPayload, setSelectedPayload] = useState(null);

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.msgId.toLowerCase().includes(search.toLowerCase()) ||
      l.recipient.toLowerCase().includes(search.toLowerCase()) ||
      l.senderId.toLowerCase().includes(search.toLowerCase());
    const matchCh = channelFilter === "ALL" || l.channel === channelFilter;
    return matchSearch && matchCh;
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
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaListUl size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Transactional Message Log</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Real-time stream of all outbound SMS, WhatsApp, and Email transactional dispatches
              </small>
            </div>
          </div>
          <Badge color="light" className="text-dark py-1.5 px-3 rounded-pill fw-semibold">
            Live Stream Connected
          </Badge>
        </CardHeader>

        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search by Message ID, recipient phone, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={6} md={3}>
                <Input
                  type="select"
                  size="sm"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All Channels</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS DLT</option>
                  <option value="EMAIL">Email</option>
                </Input>
              </Col>
              <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Captured: {logs.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Delivered: {logs.filter((l) => l.status === "DELIVERED").length}
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "130px" }}>Message ID</th>
                  <th>Channel</th>
                  <th>Recipient Destination</th>
                  <th>Sender ID</th>
                  <th>Template Code</th>
                  <th>Delivery Status</th>
                  <th>Credit</th>
                  <th>Timestamp</th>
                  <th className="text-center" style={{ width: "90px" }}>Payload</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((l) => (
                  <tr key={l.msgId}>
                    <td className="fw-bold font-monospace text-primary">{l.msgId}</td>
                    <td>
                      <Badge
                        color={
                          l.channel === "WHATSAPP"
                            ? "success"
                            : l.channel === "SMS"
                              ? "primary"
                              : "info"
                        }
                        pill
                        className="px-2 py-0.5"
                      >
                        {l.channel}
                      </Badge>
                    </td>
                    <td className="font-monospace fw-semibold text-dark">{l.recipient}</td>
                    <td className="font-monospace small text-muted">{l.senderId}</td>
                    <td className="small text-muted">{l.template}</td>
                    <td>
                      <span
                        className="px-2 py-0.5 rounded-pill fw-semibold"
                        style={{
                          fontSize: "11px",
                          background:
                            l.status === "DELIVERED"
                              ? "#e6fcf5"
                              : l.status === "SENT"
                                ? "#edf2ff"
                                : "#ffe3e3",
                          color:
                            l.status === "DELIVERED"
                              ? "#0ca678"
                              : l.status === "SENT"
                                ? "#3b5bdb"
                                : "#c92a2a"
                        }}
                      >
                        {l.status === "DELIVERED" ? "✓✓ Delivered" : l.status === "SENT" ? "✓ Sent" : "✕ Failed"}
                      </span>
                    </td>
                    <td className="small fw-bold text-dark">{l.creditsCost}</td>
                    <td className="small text-muted">{l.timestamp}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border p-1 px-2 text-primary"
                        title="Inspect JSON Payload"
                        onClick={() => setSelectedPayload(l)}
                      >
                        <FaEye size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── PAYLOAD INSPECT MODAL ── */}
      <Modal isOpen={!!selectedPayload} toggle={() => setSelectedPayload(null)} centered size="md">
        <ModalHeader toggle={() => setSelectedPayload(null)} className="bg-light">
          Payload: {selectedPayload?.msgId}
        </ModalHeader>
        <ModalBody className="p-3 bg-dark">
          <pre className="text-white mb-0 font-monospace" style={{ fontSize: "12px", maxHeight: "360px", overflow: "auto" }}>
            {JSON.stringify(selectedPayload?.payload, null, 2)}
          </pre>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSelectedPayload(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MessageLogManagement;
