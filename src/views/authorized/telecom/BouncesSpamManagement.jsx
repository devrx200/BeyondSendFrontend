import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Badge,
  Row, Col, InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaExclamationCircle, FaSearch, FaTrash, FaShieldAlt,
  FaFileExport, FaRedoAlt, FaCheckCircle
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialBounces = [
  {
    id: "BNC-101",
    recipient: "+91 90000 00001",
    channel: "SMS",
    type: "HARD_BOUNCE",
    errorCode: "ERR_UNALLOCATED_NUMBER",
    reason: "Subscriber number does not exist on carrier network",
    timestamp: "2026-09-22 17:42"
  },
  {
    id: "BNC-102",
    recipient: "invalid-user@corporate-defunct.org",
    channel: "EMAIL",
    type: "HARD_BOUNCE",
    errorCode: "550_NO_SUCH_USER",
    reason: "Mailbox unavailable or disabled by domain MX",
    timestamp: "2026-09-21 11:20"
  },
  {
    id: "BNC-103",
    recipient: "+91 98111 22334",
    channel: "WHATSAPP",
    type: "SPAM_COMPLAINT",
    errorCode: "WABA_USER_REPORT",
    reason: "Recipient flagged message as unsolicited marketing",
    timestamp: "2026-09-20 15:05"
  },
  {
    id: "BNC-104",
    recipient: "+91 97222 33445",
    channel: "SMS",
    type: "SOFT_BOUNCE",
    errorCode: "ERR_OUT_OF_COVERAGE",
    reason: "Subscriber out of cellular range / handset turned off",
    timestamp: "2026-09-23 08:30"
  }
];

const BouncesSpamManagement = () => {
  const [bounces, setBounces] = useState(initialBounces);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const handleClear = (id) => {
    Swal.fire({
      title: "Remove from Bounce Log?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove"
    }).then((res) => {
      if (res.isConfirmed) {
        setBounces(bounces.filter((b) => b.id !== id));
        Swal.fire("Cleared", "Record removed.", "success");
      }
    });
  };

  const filtered = bounces.filter((b) => {
    const matchSearch =
      b.recipient.toLowerCase().includes(search.toLowerCase()) ||
      b.errorCode.toLowerCase().includes(search.toLowerCase()) ||
      b.reason.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || b.type === filterType;
    return matchSearch && matchType;
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
              <FaExclamationCircle size={22} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Bounces & SPAM Logs</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Delivery failure audit, hard/soft bounce diagnosis, and spam complaint monitoring
              </small>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="fw-semibold d-flex align-items-center gap-1.5"
            onClick={() => Swal.fire("Exported", "Bounce report downloaded.", "info")}
          >
            <FaFileExport size={12} /> Export Failure Log
          </Button>
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
                    placeholder="Search by recipient, error code..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white fw-semibold"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="HARD_BOUNCE">Hard Bounce</option>
                  <option value="SOFT_BOUNCE">Soft Bounce</option>
                  <option value="SPAM_COMPLAINT">SPAM Complaint</option>
                </Input>
              </Col>
              <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="danger" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Hard Bounces: {bounces.filter((b) => b.type === "HARD_BOUNCE").length}
                </Badge>
                <Badge color="warning" className="py-1.5 px-2.5 rounded-pill shadow-xs text-dark">
                  Complaints: {bounces.filter((b) => b.type === "SPAM_COMPLAINT").length}
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Recipient Contact</th>
                  <th>Channel</th>
                  <th>Failure Classification</th>
                  <th>Carrier Error Code</th>
                  <th>Reason Description</th>
                  <th>Event Time</th>
                  <th className="text-center" style={{ width: "90px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="fw-bold text-primary font-monospace">{b.id}</td>
                    <td className="fw-bold font-monospace text-dark">{b.recipient}</td>
                    <td>
                      <Badge color="secondary" pill className="px-2 py-1">
                        {b.channel}
                      </Badge>
                    </td>
                    <td>
                      <span
                        className="px-2.5 py-0.5 rounded-pill fw-semibold"
                        style={{
                          fontSize: "11px",
                          background:
                            b.type === "HARD_BOUNCE"
                              ? "#ffe3e3"
                              : b.type === "SPAM_COMPLAINT"
                                ? "#ffec99"
                                : "#e9ecef",
                          color:
                            b.type === "HARD_BOUNCE"
                              ? "#c92a2a"
                              : b.type === "SPAM_COMPLAINT"
                                ? "#e67700"
                                : "#495057"
                        }}
                      >
                        {b.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <code className="text-danger small">{b.errorCode}</code>
                    </td>
                    <td className="small text-muted">{b.reason}</td>
                    <td className="small text-muted">{b.timestamp}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border p-1 px-2 text-danger"
                        title="Dismiss Record"
                        onClick={() => handleClear(b.id)}
                      >
                        <FaTrash size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BouncesSpamManagement;
