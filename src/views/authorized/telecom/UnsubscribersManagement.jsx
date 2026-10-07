import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaUserSlash, FaPlus, FaSearch, FaTrash, FaBan
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const UnsubscribersManagement = () => {
  const { toasts, toast } = useToast();
  const [searchParams] = useSearchParams();
  const channelParam = searchParams.get("channel");

  const [unsubs, setUnsubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState(() => (channelParam ? channelParam.toUpperCase() : "ALL"));
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    channel: channelParam ? channelParam.toUpperCase() : "ALL",
    type: "UNSUBSCRIBE",
    reason: "Manual Request"
  });

  useEffect(() => {
    if (channelParam) {
      setChannelFilter(channelParam.toUpperCase());
      setForm((prev) => ({ ...prev, channel: channelParam.toUpperCase() }));
    } else {
      setChannelFilter("ALL");
    }
  }, [channelParam]);

  const fetchSuppressions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/suppressions/list");
      const data = res?.data?.data || res?.data || [];

      setUnsubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch suppressions error:", err);
      toast.error(err?.response?.data?.message || "Failed to load suppression records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppressions();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim()) {
      toast.warning("Phone number or Email address is required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/suppressions/create", form);
      toast.success(res?.data?.message || "Added to suppression list");
      setModal(false);
      setForm({ identifier: "", channel: "ALL", type: "UNSUBSCRIBE", reason: "Manual Request" });
      fetchSuppressions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add suppression");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleRemove = async (id, identifier) => {
    const isConfirmed = await wpSwal.confirm(
      "Remove from Suppression?",
      `Re-enable message delivery to '${identifier}'?`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/suppressions/delete/${id}`);
      toast.success(res?.data?.message || "Removed from suppression list");
      fetchSuppressions();
    } catch (err) {
      toast.error("Failed to remove suppression");
    }
  };

  const filtered = unsubs.filter((u) => {
    const matchSearch =
      (u.identifier || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.channel || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.reason || "").toLowerCase().includes(search.toLowerCase());
    const matchChannel =
      channelFilter === "ALL" || (u.channel || "ALL").toUpperCase() === channelFilter;
    return matchSearch && matchChannel;
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
              <FaUserSlash size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Suppression & Opt-Out Registry</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Automated opt-outs, DND blacklist, and hard bounce suppression firewall
              </p>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Add Contact to Suppression
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
                    placeholder="Search blocked contact, channel or reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="danger" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total Suppressed: {unsubs.length}
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
                    <th>Suppressed Identifier</th>
                    <th>Channel</th>
                    <th>Type</th>
                    <th>Opt-Out Reason</th>
                    <th>Added Date</th>
                    <th className="text-center" style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No suppressed contacts found matching query.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, idx) => (
                      <tr key={u._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td className="fw-bold font-monospace text-dark">
                          {u.identifier}
                        </td>
                        <td>
                          <Badge color="secondary" pill className="px-2 py-0.5">
                            {u.channel || "ALL"}
                          </Badge>
                        </td>
                        <td>
                          <span className="badge bg-danger bg-opacity-10 text-danger fw-semibold">
                            {u.type || "UNSUBSCRIBE"}
                          </span>
                        </td>
                        <td className="small text-muted">{u.reason || "Opt-out"}</td>
                        <td className="small text-muted">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            color="light"
                            className="border px-2.5 py-1 fw-semibold"
                            data-tt="Remove from blacklist"
                            onClick={() => handleRemove(u._id, u.identifier)}
                          >
                            <FaTrash size={11} className="me-1" /> Re-enable
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

      {/* ── ADD MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
        >
          Add Contact to Global Suppression
        </ModalHeader>
        <Form onSubmit={handleAdd}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Contact Phone or Email *</Label>
              <Input
                placeholder="e.g. +919876543210 or user@example.com"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
            </FormGroup>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Channel Scope</Label>
                  <Input
                    type="select"
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  >
                    <option value="ALL">All Channels</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="EMAIL">Email</option>
                    <option value="VOICE">Voice</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Suppression Category</Label>
                  <Input
                    type="select"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="UNSUBSCRIBE">User Opt-Out (STOP)</option>
                    <option value="HARD_BOUNCE">Hard Bounce / Invalid</option>
                    <option value="SPAM_COMPLAINT">Spam Complaint</option>
                    <option value="MANUAL_BLOCK">Manual Administrator Block</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Reason / Notes</Label>
              <Input
                placeholder="e.g. Customer requested unsubscribe via support"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="danger"
              type="submit"
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Block & Suppress"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default UnsubscribersManagement;
