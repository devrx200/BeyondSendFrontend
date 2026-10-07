import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Badge, Row, Col,
  InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaListUl, FaSearch, FaEye, FaWhatsapp, FaEnvelope,
  FaCommentAlt, FaCheckDouble, FaTimesCircle, FaClock
} from "react-icons/fa";
import apiClient from "@apiService";
import { PageLoader } from "@/components";

const MessageLogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/telecom-reports/logs");
      const list = res?.data?.data || res?.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch message logs failed:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getChannelBadge = (ch) => {
    switch (ch) {
      case "WHATSAPP":
        return <Badge color="success" pill className="px-2 py-0.5"><FaWhatsapp className="me-1" /> WhatsApp</Badge>;
      case "EMAIL":
        return <Badge color="info" pill className="px-2 py-0.5"><FaEnvelope className="me-1" /> Email</Badge>;
      case "SMS":
        return <Badge color="primary" pill className="px-2 py-0.5"><FaCommentAlt className="me-1" /> SMS</Badge>;
      default:
        return <Badge color="secondary" pill className="px-2 py-0.5">{ch}</Badge>;
    }
  };

  const filtered = logs.filter((l) => {
    const matchSearch =
      (l.recipient || "").includes(search) ||
      (l.msgId || l._id || "").includes(search) ||
      (l.senderId || "").includes(search);
    const matchCh = channelFilter === "ALL" || l.channel === channelFilter;
    return matchSearch && matchCh;
  });

  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaListUl size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Live Message & Delivery Logs</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Audit trail, delivery receipts (DLR), telco response codes, and error traces
              </p>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="fw-bold shadow-xs px-3"
            onClick={fetchLogs}
          >
            Refresh Stream
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={4}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search by recipient phone, email or msg_id..."
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
              <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Active Log Stream: {filtered.length}
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "125px" }}>Message ID</th>
                    <th>Channel</th>
                    <th>Recipient</th>
                    <th>Sender CLI / Header</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Timestamp</th>
                    <th className="text-center" style={{ width: "90px" }}>Inspect</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.map((l, idx) => (
                    <tr key={l._id || l.msgId || idx}>
                      <td className="font-monospace text-primary fw-bold small">
                        {l.msgId || (l._id ? l._id.slice(-10) : `msg_${idx}`)}
                      </td>
                      <td>{getChannelBadge(l.channel)}</td>
                      <td className="fw-bold font-monospace text-dark">{l.recipient}</td>
                      <td className="small text-muted font-monospace">{l.senderId}</td>
                      <td>
                        <Badge
                          color={l.status === "DELIVERED" ? "success" : l.status === "FAILED" ? "danger" : "info"}
                          pill
                          className="px-2 py-0.5"
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="small font-monospace">{l.creditsCost || l.costCredits || 1.0} cr</td>
                      <td className="small text-muted">{l.timestamp || (l.date ? new Date(l.date).toLocaleString() : "Just now")}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          color="light"
                          className="adm-icon-btn"
                          data-tt="View Raw DLR"
                          onClick={() => setSelectedLog(l)}
                        >
                          <FaEye size={12} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── INSPECT MODAL ── */}
      <Modal isOpen={!!selectedLog} toggle={() => setSelectedLog(null)} size="lg" centered>
        <ModalHeader toggle={() => setSelectedLog(null)} className="bg-light">
          Delivery Receipt (DLR) Payload: {selectedLog?.msgId || selectedLog?._id}
        </ModalHeader>
        <ModalBody className="p-4 bg-dark">
          <pre className="text-success font-monospace mb-0" style={{ fontSize: "12px", maxHeight: "380px", overflowY: "auto" }}>
            {JSON.stringify(selectedLog?.payload || selectedLog, null, 2)}
          </pre>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSelectedLog(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default MessageLogManagement;
