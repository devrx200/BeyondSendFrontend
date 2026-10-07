import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Table, Badge,
  Row, Col, InputGroup, InputGroupText, Input
} from "reactstrap";
import {
  FaExclamationCircle, FaSearch, FaTrash, FaFileExport
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const BouncesSpamManagement = () => {
  const { toasts, toast } = useToast();
  const [searchParams] = useSearchParams();
  const channelParam = searchParams.get("channel");

  const [bounces, setBounces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [channelFilter, setChannelFilter] = useState(() => (channelParam ? channelParam.toUpperCase() : "ALL"));

  useEffect(() => {
    if (channelParam) {
      setChannelFilter(channelParam.toUpperCase());
    } else {
      setChannelFilter("ALL");
    }
  }, [channelParam]);

  const fetchBounces = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/suppressions/list");
      const data = res?.data?.data || res?.data || [];

      setBounces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch bounces error:", err);
      toast.error(err?.response?.data?.message || "Failed to load bounce logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounces();
  }, []);

  const handleClear = async (id, identifier) => {
    const isConfirmed = await wpSwal.confirm(
      "Remove from Bounce Log?",
      `Re-enable message dispatching to '${identifier}'?`
    );
    if (!isConfirmed) return;

    try {
      await apiClient.delete(`/suppressions/delete/${id}`);
      toast.success("Recipient removed from bounce suppression");
      fetchBounces();
    } catch {
      toast.error("Failed to remove bounce record");
    }
  };

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Identifier,Channel,Type,Reason,Date"]
        .concat(
          filtered.map(
            (b) =>
              `"${b.identifier}","${b.channel}","${b.type}","${b.reason}","${b.createdAt || ""}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BeyondSend_Bounces_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bounce log exported as CSV");
  };

  const filtered = bounces.filter((b) => {
    const matchSearch =
      (b.identifier || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "ALL" || b.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaExclamationCircle size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Bounces & SPAM Logs</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Delivery failure audit, hard/soft bounce diagnosis, and spam complaint monitoring
              </p>
            </div>
          </div>
          <Button
            color="light"
            size="sm"
            className="fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
            onClick={handleExport}
          >
            <FaFileExport size={12} /> Export Failure Log
          </Button>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search by recipient or reason..."
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
                  <option value="UNSUBSCRIBE">Unsubscribed</option>
                </Input>
              </Col>
              <Col xs={12} md={4} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="danger" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total Failures: {bounces.length}
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
                    <th style={{ width: "40px" }}>#</th>
                    <th>Failed Recipient</th>
                    <th>Channel</th>
                    <th>Failure Type</th>
                    <th>Carrier Error & Diagnosis</th>
                    <th>Timestamp</th>
                    <th className="text-center" style={{ width: "110px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No bounce or spam records found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b, idx) => (
                      <tr key={b._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td className="fw-bold font-monospace text-dark">
                          {b.identifier}
                        </td>
                        <td>
                          <Badge color="secondary" pill className="px-2 py-0.5">
                            {b.channel || "ALL"}
                          </Badge>
                        </td>
                        <td>
                          <span
                            className={`badge px-2.5 py-1 ${
                              b.type === "HARD_BOUNCE"
                                ? "bg-danger bg-opacity-10 text-danger"
                                : b.type === "SPAM_COMPLAINT"
                                ? "bg-warning bg-opacity-20 text-dark"
                                : "bg-info bg-opacity-10 text-info"
                            } fw-bold`}
                          >
                            {(b.type || "HARD_BOUNCE").replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="small text-muted">{b.reason || "Delivery failed"}</td>
                        <td className="small text-muted">
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            color="light"
                            className="border px-2.5 py-1 fw-semibold"
                            data-tt="Whitelist / Clear Bounce"
                            onClick={() => handleClear(b._id, b.identifier)}
                          >
                            <FaTrash size={11} className="me-1" /> Clear
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default BouncesSpamManagement;
