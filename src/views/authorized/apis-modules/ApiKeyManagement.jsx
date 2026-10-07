import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Spinner
} from "reactstrap";
import {
  FaKey, FaPlus, FaCopy, FaTrash, FaEye, FaEyeSlash,
  FaShieldAlt, FaSyncAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const ApiKeyManagement = () => {
  const { toasts, toast } = useToast();

  const [keyInfo, setKeyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    name: "Production Gateway Service",
    expiresInDays: 365,
    permissions: ["READ", "WRITE"]
  });

  const fetchKeyDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/key/details");
      if (res?.data?.success && res?.data?.apiKeyInfo) {
        setKeyInfo(res.data.apiKeyInfo);
      } else {
        setKeyInfo(null);
      }
    } catch {
      setKeyInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeyDetails();
  }, []);

  const handleCopy = (token) => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    toast.success("API Key copied to clipboard");
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setBtnLoading(true);
      const res = await apiClient.post("/key/generate", {
        expiresInDays: Number(form.expiresInDays) || 365,
        permissions: form.permissions
      });
      toast.success(res?.data?.message || "API credentials generated successfully");
      setModal(false);
      fetchKeyDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to generate API Key");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const isConfirmed = await wpSwal.confirm(
      "Rotate / Regenerate API Key?",
      "The current key will be revoked immediately and replaced with a new cryptographic secret."
    );
    if (!isConfirmed) return;

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/key/regenerate", {
        expiresInDays: 365
      });
      toast.success(res?.data?.message || "API Key rotated successfully");
      fetchKeyDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Regeneration failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleRevoke = async () => {
    const isConfirmed = await wpSwal.confirm(
      "Revoke API Key?",
      "Any applications currently using this key will immediately fail authentication."
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.post("/key/revoke");
      toast.success(res?.data?.message || "API Key revoked");
      fetchKeyDetails();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Revoke failed");
    }
  };

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 p-3 p-md-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center text-white shadow-sm"
              style={{ width: "46px", height: "46px", background: "rgba(255, 255, 255, 0.15)", fontSize: "1.25rem", flexShrink: 0 }}
            >
              <FaKey size={20} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-1 text-white fw-bold">API Keys & Authentication</h4>
              <p className="adm-page-subtitle mb-0 text-white-50 small">
                Generate Bearer authorization credentials, configure rate controls and programmatically dispatch SMS & WhatsApp
              </p>
            </div>
          </div>
          {!keyInfo || keyInfo.status !== "ACTIVE" ? (
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              onClick={() => setModal(true)}
            >
              <FaPlus size={12} /> Generate API Key
            </Button>
          ) : (
            <Button
              color="warning"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              onClick={handleRegenerate}
              disabled={btnLoading}
            >
              <FaSyncAlt size={12} /> Rotate Key
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* ── ACTIVE CREDENTIALS TABLE ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardBody className="p-0">
          {loading ? (
            <PageLoader inline={true} />
          ) : !keyInfo || keyInfo.status !== "ACTIVE" ? (
            <div className="text-center py-5">
              <FaShieldAlt size={36} className="text-muted opacity-50 mb-3" />
              <h5>No Active API Key Found</h5>
              <p className="text-muted small mb-3">
                Generate an API key to dispatch messages programmatically via our REST API.
              </p>
              <Button color="primary" onClick={() => setModal(true)}>
                <FaPlus className="me-1" /> Generate New Key
              </Button>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th>Client Identifier</th>
                    <th>API Token Secret</th>
                    <th>Permissions</th>
                    <th>Rate Limit</th>
                    <th>Status</th>
                    <th>Generated / Expires</th>
                    <th className="text-center" style={{ width: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  <tr>
                    <td>
                      <span className="font-monospace fw-bold text-dark px-2 py-1 bg-light border rounded">
                        {keyInfo.clientId}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <code className="p-1 px-2 rounded bg-light border font-monospace text-dark" style={{ fontSize: "12px" }}>
                          {showToken ? keyInfo.apiKey : keyInfo.apiKeyPrefix || (keyInfo.apiKey ? `${keyInfo.apiKey.substring(0, 12)}••••••••••••` : "••••••••••••")}
                        </code>
                        <Button
                          size="sm"
                          color="light"
                          className="adm-icon-btn"
                          data-tt={showToken ? "Hide Key" : "Reveal Key"}
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
                        </Button>
                        <Button
                          size="sm"
                          color="light"
                          className="adm-icon-btn"
                          data-tt="Copy to Clipboard"
                          onClick={() => handleCopy(keyInfo.apiKey)}
                        >
                          <FaCopy size={11} />
                        </Button>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1 flex-wrap">
                        {(keyInfo.permissions || ["READ", "WRITE"]).map((perm) => (
                          <Badge key={perm} color="info" pill className="px-2 py-0.5">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark fw-bold">
                        {keyInfo.rateLimit || 1000} req/sec
                      </span>
                    </td>
                    <td>
                      <Badge color="success" pill className="px-2.5 py-1">
                        {keyInfo.status}
                      </Badge>
                    </td>
                    <td className="small text-muted">
                      <div>Gen: {keyInfo.generatedAt ? new Date(keyInfo.generatedAt).toLocaleDateString() : "Active"}</div>
                      <div>Exp: {keyInfo.expiresAt ? new Date(keyInfo.expiresAt).toLocaleDateString() : "365 days"}</div>
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border px-2.5 py-1 fw-semibold text-danger"
                        data-tt="Revoke Key"
                        onClick={handleRevoke}
                      >
                        <FaTrash size={11} className="me-1" /> Revoke
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── GENERATE KEY MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
        >
          Generate API Access Key
        </ModalHeader>
        <Form onSubmit={handleGenerate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Friendly Description</Label>
              <Input
                placeholder="e.g. ERP Transactional Gateway Key"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Key Validity Period</Label>
              <Input
                type="select"
                value={form.expiresInDays}
                onChange={(e) => setForm({ ...form, expiresInDays: e.target.value })}
              >
                <option value="90">90 Days</option>
                <option value="180">180 Days</option>
                <option value="365">1 Year (365 Days)</option>
                <option value="730">2 Years</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Default Scopes</Label>
              <div className="p-2.5 bg-white rounded border small text-muted">
                ✅ sms.dispatch · whatsapp.dispatch · email.send · logs.read · balance.read
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Generate Credentials"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default ApiKeyManagement;
