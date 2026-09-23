import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Badge,
  Row, Col, InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaComments, FaSearch, FaCheckCircle, FaMousePointer,
  FaReply, FaMobileAlt
} from "react-icons/fa";

const initialResponses = [
  {
    id: "RCS-RESP-01",
    customer: "+91 98765 00112",
    campaign: "Interactive Product Showcase Card",
    actionType: "SUGGESTION_CHIP_CLICK",
    responsePayload: "Claim Offer",
    device: "Google Pixel 8 (Android 14)",
    timestamp: "2026-09-23 23:22:10"
  },
  {
    id: "RCS-RESP-02",
    customer: "+91 99123 44550",
    campaign: "Interactive Appointment Confirm",
    actionType: "QUICK_REPLY",
    responsePayload: "CONFIRM_APPT",
    device: "Samsung Galaxy S24",
    timestamp: "2026-09-23 23:18:45"
  },
  {
    id: "RCS-RESP-03",
    customer: "+91 98222 33110",
    campaign: "Interactive Product Showcase Card",
    actionType: "DIAL_ACTION",
    responsePayload: "Dialed +919876543210",
    device: "OnePlus 12",
    timestamp: "2026-09-23 22:50:01"
  }
];

const RcsResponses = () => {
  const [responses, setResponses] = useState(initialResponses);
  const [search, setSearch] = useState("");

  const filtered = responses.filter(
    (r) =>
      r.customer.includes(search) ||
      r.campaign.toLowerCase().includes(search.toLowerCase()) ||
      r.responsePayload.toLowerCase().includes(search.toLowerCase())
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
              <FaComments size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">RCS Interactive User Responses</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Real-time stream of chip clicks, call actions, and text replies from Google Messages RCS users
              </small>
            </div>
          </div>
          <Badge color="info" className="py-1.5 px-3 rounded-pill fw-semibold">
            Google Jibe Stream Active
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
                    placeholder="Search responses by customer, campaign, payload..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Captured Responses: {responses.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Avg Action Latency: 1.2s
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "120px" }}>Response ID</th>
                  <th>Customer Phone</th>
                  <th>Source RCS Campaign</th>
                  <th>Action Trigger Type</th>
                  <th>User Response Payload</th>
                  <th>Device / Client</th>
                  <th>Captured At</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-bold text-primary font-monospace">{r.id}</td>
                    <td className="fw-semibold font-monospace text-dark">{r.customer}</td>
                    <td className="small text-muted">{r.campaign}</td>
                    <td>
                      <span className="badge bg-light border text-primary font-monospace">
                        <FaMousePointer size={10} className="me-1" />
                        {r.actionType}
                      </span>
                    </td>
                    <td>
                      <code className="text-dark bg-light px-2 py-0.5 rounded border fw-bold">
                        {r.responsePayload}
                      </code>
                    </td>
                    <td className="small text-muted">{r.device}</td>
                    <td className="small text-muted">{r.timestamp}</td>
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

export default RcsResponses;
