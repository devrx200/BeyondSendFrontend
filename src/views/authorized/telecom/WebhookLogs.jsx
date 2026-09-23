import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Badge, Row, Col,
  InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaHistory, FaSearch, FaRedoAlt, FaEye, FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialLogs = [
  {
    id: "WHL-501",
    event: "message.delivered",
    endpoint: "https://api.enterprise-client.com/webhooks/beyondsend",
    httpStatus: 200,
    attempts: 1,
    durationMs: 38,
    timestamp: "2026-09-23 23:28:12",
    requestBody: {
      event: "message.delivered",
      msgId: "msg_9011af28ec",
      channel: "WHATSAPP",
      recipient: "+919876512345",
      deliveredAt: "2026-09-23T23:28:12Z"
    },
    responseBody: '{"status":"received","ack":true}'
  },
  {
    id: "WHL-502",
    event: "inbound.message",
    endpoint: "https://crm.business.in/api/v1/whatsapp-events",
    httpStatus: 200,
    attempts: 1,
    durationMs: 54,
    timestamp: "2026-09-23 23:25:40",
    requestBody: {
      event: "inbound.message",
      from: "+919922114455",
      channel: "WHATSAPP",
      message: "Please share pricing for 50,000 SMS credits",
      timestamp: 1758650140
    },
    responseBody: '{"ok":true,"threadId":"CRM-8812"}'
  },
  {
    id: "WHL-503",
    event: "message.failed",
    endpoint: "https://api.enterprise-client.com/webhooks/beyondsend",
    httpStatus: 500,
    attempts: 3,
    durationMs: 420,
    timestamp: "2026-09-23 23:20:18",
    requestBody: {
      event: "message.failed",
      msgId: "msg_6014dd61aa",
      error: "ERR_UNALLOCATED_NUMBER"
    },
    responseBody: 'Internal Server Error: DB connection failed'
  }
];

const WebhookLogs = () => {
  const [logs, setLogs] = useState(initialLogs);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);

  const handleRetry = (log) => {
    Swal.fire({
      title: "Retrying Webhook Dispatch...",
      text: `Posting payload to ${log.endpoint}`,
      icon: "info",
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === log.id ? { ...l, httpStatus: 200, attempts: l.attempts + 1 } : l
        )
      );
      Swal.fire("Dispatched", "Webhook re-sent successfully (HTTP 200).", "success");
    });
  };

  const filtered = logs.filter(
    (l) =>
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      l.endpoint.toLowerCase().includes(search.toLowerCase())
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
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaHistory size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Webhook Delivery Logs</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Outbound HTTP webhook dispatch attempts, response latency, and automatic retry execution
              </small>
            </div>
          </div>
          <Badge color="light" className="text-dark py-1.5 px-3 rounded-pill fw-semibold">
            Auto-Retry: Exponential Backoff
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
                    placeholder="Search by ID, event or URL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Logged: {logs.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Success Rate: 99.1%
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Event Type</th>
                  <th>Destination Webhook URL</th>
                  <th>HTTP Code</th>
                  <th>Response Time</th>
                  <th>Attempts</th>
                  <th>Timestamp</th>
                  <th className="text-center" style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="fw-bold text-primary font-monospace">{l.id}</td>
                    <td>
                      <code className="text-dark bg-light px-2 py-0.5 rounded border font-monospace">
                        {l.event}
                      </code>
                    </td>
                    <td>
                      <small className="font-monospace text-muted text-truncate d-block" style={{ maxWidth: "280px" }}>
                        {l.endpoint}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`badge ${l.httpStatus === 200 ? "bg-success" : "bg-danger"} font-monospace`}
                      >
                        {l.httpStatus} {l.httpStatus === 200 ? "OK" : "ERROR"}
                      </span>
                    </td>
                    <td className="small text-muted font-monospace">{l.durationMs}ms</td>
                    <td>
                      <Badge color={l.attempts > 1 ? "warning" : "light"} className="text-dark">
                        {l.attempts}x
                      </Badge>
                    </td>
                    <td className="small text-muted">{l.timestamp}</td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-primary"
                          title="View Payload Details"
                          onClick={() => setSelectedLog(l)}
                        >
                          <FaEye size={11} />
                        </Button>
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-warning"
                          title="Re-dispatch Webhook"
                          onClick={() => handleRetry(l)}
                        >
                          <FaRedoAlt size={10} />
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

      {/* ── PAYLOAD MODAL ── */}
      <Modal isOpen={!!selectedLog} toggle={() => setSelectedLog(null)} centered size="md">
        <ModalHeader toggle={() => setSelectedLog(null)} className="bg-light">
          Webhook Dispatch Audit: {selectedLog?.id}
        </ModalHeader>
        <ModalBody className="p-3 bg-dark">
          <small className="text-muted d-block mb-1">Outbound HTTP Request Body:</small>
          <pre className="text-white mb-3 font-monospace p-2 rounded bg-black" style={{ fontSize: "11.5px" }}>
            {JSON.stringify(selectedLog?.requestBody, null, 2)}
          </pre>
          <small className="text-muted d-block mb-1">Server Response Body:</small>
          <pre className="text-success mb-0 font-monospace p-2 rounded bg-black" style={{ fontSize: "11.5px" }}>
            {selectedLog?.responseBody}
          </pre>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default WebhookLogs;
