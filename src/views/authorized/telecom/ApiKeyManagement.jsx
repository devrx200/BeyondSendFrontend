import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col
} from "reactstrap";
import {
  FaKey, FaPlus, FaCopy, FaTrash, FaEye, FaEyeSlash,
  FaShieldAlt, FaCheck
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialKeys = [
  {
    id: "KEY-01",
    name: "Production Backend Service",
    env: "LIVE",
    token: "bs_live_9f82a17cb4204de8bb3481239fa8e811",
    ipWhitelist: "13.235.40.12, 13.235.40.13",
    rateLimit: "1,000 req/sec",
    scopes: ["sms.send", "whatsapp.send", "email.send", "reports.read"],
    created: "2026-08-14",
    lastUsed: "2 mins ago"
  },
  {
    id: "KEY-02",
    name: "Staging Testing Environment",
    env: "TEST",
    token: "bs_test_3c19b88fa0114ae7cc2109881ab7d922",
    ipWhitelist: "Any IP Allowed",
    rateLimit: "100 req/sec",
    scopes: ["sms.send", "whatsapp.send"],
    created: "2026-09-01",
    lastUsed: "1 hour ago"
  }
];

const ApiKeyManagement = () => {
  const [keys, setKeys] = useState(initialKeys);
  const [showTokens, setShowTokens] = useState({});
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    env: "LIVE",
    ipWhitelist: "",
    rateLimit: "500 req/sec"
  });

  const toggleShow = (id) => {
    setShowTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (token) => {
    navigator.clipboard.writeText(token);
    Swal.fire({
      icon: "success",
      title: "Copied!",
      text: "API Token copied to clipboard.",
      timer: 1200,
      showConfirmButton: false
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const prefix = form.env === "LIVE" ? "bs_live_" : "bs_test_";
    const randomHex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const newKey = {
      id: `KEY-0${keys.length + 1}`,
      name: form.name,
      env: form.env,
      token: `${prefix}${randomHex}`,
      ipWhitelist: form.ipWhitelist || "Any IP Allowed",
      rateLimit: form.rateLimit,
      scopes: ["sms.send", "whatsapp.send", "email.send"],
      created: new Date().toISOString().slice(0, 10),
      lastUsed: "Never"
    };

    setKeys([...keys, newKey]);
    setModal(false);
    setForm({ name: "", env: "LIVE", ipWhitelist: "", rateLimit: "500 req/sec" });
    Swal.fire("API Key Generated", "Keep this key secure. It provides programmatic access to your BeyondSend quota.", "success");
  };

  const handleRevoke = (id) => {
    Swal.fire({
      title: "Revoke API Key?",
      text: "Any applications using this key will immediately fail authorization.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Revoke Key"
    }).then((res) => {
      if (res.isConfirmed) {
        setKeys(keys.filter((k) => k.id !== id));
        Swal.fire("Revoked", "API Key revoked successfully.", "success");
      }
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
              <FaKey size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">API Keys & Authentication</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Generate Bearer authorization credentials, configure IP firewalls and rate controls
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Generate New Key
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Key Name & Environment</th>
                  <th>API Token Secret</th>
                  <th>IP Whitelist Filter</th>
                  <th>Throughput Rate Limit</th>
                  <th>Last Activity</th>
                  <th className="text-center" style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {keys.map((k) => {
                  const isVisible = showTokens[k.id];
                  const masked = k.token.slice(0, 10) + "•".repeat(18) + k.token.slice(-4);

                  return (
                    <tr key={k.id}>
                      <td className="fw-bold text-primary font-monospace">{k.id}</td>
                      <td>
                        <div className="fw-bold text-dark">{k.name}</div>
                        <Badge
                          color={k.env === "LIVE" ? "success" : "info"}
                          pill
                          className="px-2 py-0.5 mt-0.5"
                        >
                          {k.env} MODE
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <code className="p-1 px-2 rounded bg-light border font-monospace text-dark" style={{ fontSize: "12px" }}>
                            {isVisible ? k.token : masked}
                          </code>
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-1.5 text-muted"
                            title={isVisible ? "Hide Token" : "Reveal Token"}
                            onClick={() => toggleShow(k.id)}
                          >
                            {isVisible ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
                          </Button>
                          <Button
                            size="sm"
                            color="light"
                            className="border p-1 px-1.5 text-primary"
                            title="Copy to Clipboard"
                            onClick={() => handleCopy(k.token)}
                          >
                            <FaCopy size={11} />
                          </Button>
                        </div>
                      </td>
                      <td className="small text-muted font-monospace">{k.ipWhitelist}</td>
                      <td>
                        <span className="badge bg-light border text-dark fw-bold">
                          {k.rateLimit}
                        </span>
                      </td>
                      <td className="small text-muted">{k.lastUsed}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-danger"
                          title="Revoke Key"
                          onClick={() => handleRevoke(k.id)}
                        >
                          <FaTrash size={11} className="me-1" /> Revoke
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE KEY MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Generate API Access Key
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Key Friendly Name *</Label>
              <Input
                placeholder="e.g. ERP Transactional Gateway Key"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Environment</Label>
              <Input
                type="select"
                value={form.env}
                onChange={(e) => setForm({ ...form, env: e.target.value })}
              >
                <option value="LIVE">Live Production Key</option>
                <option value="TEST">Sandbox Test Key</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Allowed Server IPs (Optional)</Label>
              <Input
                placeholder="e.g. 13.235.40.12, 13.235.40.13"
                value={form.ipWhitelist}
                onChange={(e) => setForm({ ...form, ipWhitelist: e.target.value })}
              />
              <small className="text-muted">Leave empty to allow requests from any source IP.</small>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Generate Key
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiKeyManagement;
