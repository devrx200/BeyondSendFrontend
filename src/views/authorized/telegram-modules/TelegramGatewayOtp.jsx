import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup,
  Label, Input, Row, Col, Spinner, Badge, Table, Alert,
  InputGroup, InputGroupText
} from "reactstrap";
import {
  FaTelegramPlane, FaShieldAlt, FaPaperPlane, FaCheckCircle,
  FaTimes, FaUndo, FaExternalLinkAlt, FaMobileAlt, FaKey, FaHistory
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";

const TelegramGatewayOtp = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState(null);

  // Send OTP State
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState(60);
  const [checkingAbility, setCheckingAbility] = useState(false);
  const [abilityResult, setAbilityResult] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastOtpResult, setLastOtpResult] = useState(null);

  // Verify Code State
  const [verifyRequestId, setVerifyRequestId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [revoking, setRevoking] = useState(false);

  // History Log State
  const [logs, setLogs] = useState([]);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/credits/summary");
      const wb =
        res?.data?.myWallet?.telegramCredits ||
        res?.data?.balances?.telegramCredits ||
        res?.balances?.telegramCredits ||
        res?.myWallet?.telegramCredits;
      if (wb) setWallet(wb);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // 1. Check Send Ability
  const handleCheckAbility = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number in E.164 format (e.g. +919876543210)");
      return;
    }

    try {
      setCheckingAbility(true);
      const res = await apiClient.post("/telegram/gateway/check-ability", {
        phoneNumber: phoneNumber.trim(),
      });
      const data = res?.data?.result || res?.data;
      setAbilityResult(data);
      toast.success(data?.can_send ? "Recipient can receive Telegram OTP!" : "Recipient not on Telegram");
    } catch (err) {
      toast.error(err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setCheckingAbility(false);
    }
  };

  // 2. Send Verification OTP
  const handleSendVerification = async (e) => {
    if (e) e.preventDefault();
    if (!phoneNumber.trim()) {
      toast.error("Please enter destination mobile phone number in E.164 format");
      return;
    }

    try {
      setSendingOtp(true);
      const payload = {
        phoneNumber: phoneNumber.trim(),
        code: customCode ? customCode.trim() : undefined,
        ttl: Number(ttlSeconds) || 60,
      };

      const res = await apiClient.post("/telegram/gateway/send-verification", payload);
      const data = res?.data?.result || res?.data;

      if (data) {
        setLastOtpResult(data);
        if (data.request_id) {
          setVerifyRequestId(data.request_id);
        }
        toast.success(`Verification OTP sent! Request ID: ${data.request_id || "OK"}`);
        setLogs((prev) => [
          {
            id: data.request_id || `req_${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            phone: phoneNumber,
            cost: data.request_cost ?? 0.01,
            status: data.delivery_status?.status || "sent",
          },
          ...prev,
        ]);
        loadWallet();
      } else {
        toast.error("Delivery failed");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // 3. Verify Code
  const handleVerifyCode = async () => {
    if (!verifyRequestId || !verifyCode) {
      toast.error("Please provide both Request ID and the OTP code to verify");
      return;
    }

    try {
      setVerifying(true);
      const res = await apiClient.post("/telegram/gateway/check-status", {
        requestId: verifyRequestId.trim(),
        code: verifyCode.trim(),
      });
      const data = res?.data?.result || res?.data;
      setVerifyResult(data);
      if (data?.verification_status?.status === "code_valid") {
        toast.success("Success! OTP Code is valid.");
      } else {
        toast.error(`Verification status: ${data?.verification_status?.status || "Invalid"}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setVerifying(false);
    }
  };

  // 4. Revoke Message
  const handleRevoke = async () => {
    if (!verifyRequestId) return;
    try {
      setRevoking(true);
      await apiClient.post("/telegram/gateway/revoke", {
        requestId: verifyRequestId.trim(),
      });
      toast.success("Verification message revoked on Telegram");
    } catch (err) {
      toast.error(err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-md-4">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* Header */}
      <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="p-2.5 rounded-3 text-white shadow-sm" style={{ backgroundColor: "#0088cc" }}>
              <FaShieldAlt size={24} />
            </span>
            <div>
              <h4 className="fw-bold mb-0 text-dark">Official Telegram Gateway OTP &amp; Verification</h4>
              <p className="text-muted small mb-0 mt-1">
                Direct mobile verification passcodes without bots or 3rd-party aggregators. Testing on your personal phone number is 100% free!
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 px-3 rounded-2 bg-light border text-end">
              <span className="text-muted small d-block">Available Gateway OTP Credits</span>
              <strong className="fs-5 text-success">
                {wallet?.telegram_gateway_otp_credits ?? 0}
              </strong>
            </div>
            <Button color="light" size="sm" className="border" onClick={loadWallet} disabled={loading}>
              <FaUndo className={loading ? "fa-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <Alert color="info" className="d-flex align-items-center justify-content-between py-2 px-3 small border-0 shadow-sm mb-4">
        <div className="d-flex align-items-center gap-2">
          <FaTelegramPlane size={18} className="text-primary flex-shrink-0" />
          <span>
            Powered by <strong>gatewayapi.telegram.org</strong>. Recipient receives a secure official Telegram security code directly in their app.
          </span>
        </div>
        <a
          href="https://core.telegram.org/gateway/verification-tutorial"
          target="_blank"
          rel="noreferrer"
          className="fw-bold text-decoration-none text-primary"
        >
          View Verification Docs <FaExternalLinkAlt size={10} />
        </a>
      </Alert>

      <Row className="g-4">
        {/* Left Column: Send OTP */}
        <Col lg={7}>
          <Card className="border shadow-sm mb-4">
            <CardHeader className="bg-white py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaPaperPlane className="text-primary" /> Step 1: Send Verification Passcode
              </h6>
            </CardHeader>
            <CardBody className="p-4">
              <Form onSubmit={handleSendVerification}>
                {/* Phone Number */}
                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary">
                    Recipient Phone Number (E.164 with Country Code) *
                  </Label>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="+919876543210 or +1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <Button
                      color="outline-primary"
                      type="button"
                      disabled={checkingAbility || !phoneNumber.trim()}
                      onClick={handleCheckAbility}
                    >
                      {checkingAbility ? <Spinner size="sm" /> : <FaCheckCircle className="me-1" />} Check Ability
                    </Button>
                  </InputGroup>
                  <small className="text-muted d-block mt-1">
                    Free testing when sent to the Telegram number of your own Gateway account.
                  </small>
                </FormGroup>

                {abilityResult && (
                  <div className="p-2 mb-3 rounded bg-light border small d-flex align-items-center justify-content-between">
                    <div>
                      Ability Status:{" "}
                      <Badge color={abilityResult.can_send ? "success" : "danger"}>
                        {abilityResult.can_send ? "ELIGIBLE (CAN SEND)" : "CANNOT SEND"}
                      </Badge>
                    </div>
                    <div>
                      Estimated Request Cost: <strong>${abilityResult.request_cost ?? "0.01"}</strong>
                    </div>
                  </div>
                )}

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold text-secondary">
                        Custom Code (Leave blank for Telegram 6-digit auto-gen)
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g. 842109"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                  <Col md={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold text-secondary">
                        Validity TTL (Seconds)
                      </Label>
                      <Input
                        type="number"
                        min="30"
                        max="3600"
                        value={ttlSeconds}
                        onChange={(e) => setTtlSeconds(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Button
                  color="success"
                  size="lg"
                  className="w-100 text-white fw-semibold shadow-sm"
                  disabled={sendingOtp || !phoneNumber.trim()}
                  type="submit"
                >
                  {sendingOtp ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Dispatching Gateway Verification...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" /> Send Verification OTP Code
                    </>
                  )}
                </Button>
              </Form>

              {lastOtpResult && (
                <div className="p-3 mt-3 rounded bg-light border small">
                  <h6 className="fw-bold text-success mb-2 d-flex align-items-center gap-1">
                    <FaCheckCircle /> Dispatched Successfully
                  </h6>
                  <div>Request ID: <code>{lastOtpResult.request_id}</code></div>
                  <div>Delivery Status: <Badge color="info">{lastOtpResult.delivery_status?.status || "sent"}</Badge></div>
                  <div>Cost: ${lastOtpResult.request_cost ?? 0.01}</div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>

        {/* Right Column: Verify Code & Logs */}
        <Col lg={5}>
          {/* Verify Code Box */}
          <Card className="border shadow-sm mb-4">
            <CardHeader className="bg-white py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaKey className="text-warning" /> Step 2: Validate User OTP Code
              </h6>
            </CardHeader>
            <CardBody className="p-3">
              <FormGroup className="mb-2">
                <Label className="small fw-semibold text-secondary">Telegram Request ID *</Label>
                <Input
                  type="text"
                  placeholder="req_..."
                  value={verifyRequestId}
                  onChange={(e) => setVerifyRequestId(e.target.value)}
                />
              </FormGroup>

              <FormGroup className="mb-3">
                <Label className="small fw-semibold text-secondary">Enter Received OTP Code *</Label>
                <Input
                  type="text"
                  placeholder="e.g. 842109"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
              </FormGroup>

              <div className="d-flex gap-2">
                <Button
                  color="primary"
                  className="flex-fill"
                  disabled={verifying || !verifyRequestId || !verifyCode}
                  onClick={handleVerifyCode}
                >
                  {verifying ? <Spinner size="sm" /> : <FaCheckCircle className="me-1" />} Verify Code
                </Button>
                <Button
                  color="outline-danger"
                  disabled={revoking || !verifyRequestId}
                  onClick={handleRevoke}
                  title="Revoke Verification Message"
                >
                  {revoking ? <Spinner size="sm" /> : <FaTimes className="me-1" />} Revoke
                </Button>
              </div>

              {verifyResult && (
                <div className="p-2 mt-3 rounded bg-light border small">
                  <div>
                    Verification Result:{" "}
                    <Badge color={verifyResult.verification_status?.status === "code_valid" ? "success" : "danger"}>
                      {verifyResult.verification_status?.status || "PENDING"}
                    </Badge>
                  </div>
                  <div>Delivery Status: <strong>{verifyResult.status?.status || "delivered"}</strong></div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Gateway Logs */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-white py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaHistory className="text-secondary" /> Recent Dispatch Logs
              </h6>
            </CardHeader>
            <CardBody className="p-0">
              {logs.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No verification codes dispatched in this session yet.
                </div>
              ) : (
                <Table responsive hover className="mb-0 small align-middle">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Phone</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((l, idx) => (
                      <tr key={idx}>
                        <td>{l.time}</td>
                        <td>{l.phone}</td>
                        <td><Badge color="success">{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TelegramGatewayOtp;
