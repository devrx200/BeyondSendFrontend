import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup,
  Label, Input, Row, Col, Spinner, Badge, Alert,
  InputGroup, InputGroupText, Nav, NavItem, NavLink
} from "reactstrap";
import {
  FaTelegramPlane, FaRobot, FaCheck, FaEye, FaEyeSlash,
  FaPaperPlane, FaUndo, FaExternalLinkAlt, FaCopy, FaShieldAlt,
  FaCheckCircle, FaSave
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";

const TelegramBotConfig = () => {
  const { toasts, toast } = useToast();

  const [activeTab, setActiveTab] = useState("bot"); // 'bot' | 'gateway'
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [showSecretBot, setShowSecretBot] = useState(false);
  const [showSecretGw, setShowSecretGw] = useState(false);

  // Bot State
  const [botToken, setBotToken] = useState("");
  const [botDetails, setBotDetails] = useState(null);
  const [testChatId, setTestChatId] = useState("");
  const [wallet, setWallet] = useState(null);

  // Gateway API State (Official gateway.telegram.org)
  const [gatewayToken, setGatewayToken] = useState("");
  const [gatewaySenderUsername, setGatewaySenderUsername] = useState("");
  const [gatewayCallbackUrl, setGatewayCallbackUrl] = useState("");
  const [gwStatus, setGwStatus] = useState("PENDING");

  // Gateway Live Testing Suite State
  const [gwPhone, setGwPhone] = useState("");
  const [gwCheckingAbility, setGwCheckingAbility] = useState(false);
  const [gwAbilityInfo, setGwAbilityInfo] = useState(null);
  const [gwSendingVerification, setGwSendingVerification] = useState(false);
  const [gwVerificationInfo, setGwVerificationInfo] = useState(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const [resConfig, resWallet] = await Promise.allSettled([
        apiClient.get("/telegram/config"),
        apiClient.get("/credits/summary"),
      ]);

      if (resConfig.status === "fulfilled") {
        const raw = resConfig.value?.data || resConfig.value || {};
        const tc = raw.telegramConfig || {};

        if (tc.botToken) setBotToken(tc.botToken);
        if (tc.gatewayApiToken) {
          setGatewayToken(tc.gatewayApiToken);
          setGwStatus("ACTIVE");
        }
        if (tc.gatewaySenderUsername) setGatewaySenderUsername(tc.gatewaySenderUsername);
        if (tc.gatewayCallbackUrl) {
          setGatewayCallbackUrl(tc.gatewayCallbackUrl);
        } else {
          setGatewayCallbackUrl(`${window.location.origin}/api/v0/telegram/gateway/webhook`);
        }

        if (tc.botId) {
          setBotDetails({
            bot_id: tc.botId,
            bot_name: tc.botName || tc.name,
            username: tc.botUsername || tc.username,
          });
        }
      }

      if (resWallet.status === "fulfilled") {
        const wb =
          resWallet.value?.data?.myWallet?.telegramCredits ||
          resWallet.value?.data?.balances?.telegramCredits ||
          resWallet.value?.balances?.telegramCredits ||
          resWallet.value?.myWallet?.telegramCredits;
        if (wb) setWallet(wb);
      }
    } catch (err) {
      console.warn("Load config warning:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // 1. Validate & Bind Bot Token from @BotFather
  const handleValidateBot = async () => {
    if (!botToken.trim()) {
      toast.error("Please enter your Telegram Bot Token from @BotFather");
      return;
    }

    try {
      setValidating(true);
      const res = await apiClient.post("/telegram/onboard-client", {
        botToken: botToken.trim(),
      });
      const data = res?.data || res;

      if (data?.success) {
        setBotDetails(data.channelDetails);
        toast.success(data.message || "Telegram Bot verified & webhook registered!");
        loadConfig();
      } else {
        toast.error(data?.error || "Validation failed");
      }
    } catch (err) {
      toast.error(err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setValidating(false);
    }
  };

  // 2. Quick Test Message Send to Chat ID
  const handleSendTest = async () => {
    if (!testChatId.trim()) {
      toast.error("Please enter destination Chat ID");
      return;
    }

    try {
      setTesting(true);
      const res = await apiClient.post("/telegram/messages/utility", {
        chatId: testChatId.trim(),
        botToken: botToken.trim() || undefined,
        text: "BeyondSend CPaaS Live Verification: Telegram Bot integration operational!",
      });
      const data = res?.data || res;

      if (data?.success) {
        toast.success(`Test alert sent successfully! Message ID: ${data.messageId}`);
        loadConfig();
      } else {
        toast.error(data?.error || "Failed to send test alert");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setTesting(false);
    }
  };

  // 3. Save Telegram Gateway Configuration
  const handleSaveGateway = async (e) => {
    if (e) e.preventDefault();
    if (!gatewayToken.trim()) {
      toast.error("Please enter Telegram Gateway API Token");
      return;
    }

    try {
      setSavingGateway(true);
      const payload = {
        gatewayApiToken: gatewayToken.trim(),
        gatewaySenderUsername: gatewaySenderUsername.trim(),
        gatewayCallbackUrl: gatewayCallbackUrl.trim() || `${window.location.origin}/api/v0/telegram/gateway/webhook`,
      };

      const res = await apiClient.put("/telegram/config", payload);
      const data = res?.data || res;

      if (data?.success) {
        toast.success("Telegram Gateway parameters saved successfully!");
        setGwStatus("ACTIVE");
        loadConfig();
      } else {
        toast.error(data?.message || "Failed to save Gateway parameters");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Error saving Gateway configuration");
    } finally {
      setSavingGateway(false);
    }
  };

  // 4. Check Send Ability (Gateway API)
  const handleCheckAbility = async () => {
    if (!gwPhone.trim()) {
      toast.error("Please enter destination mobile phone in E.164 format (e.g. +919876543210)");
      return;
    }

    try {
      setGwCheckingAbility(true);
      const res = await apiClient.post("/telegram/gateway/check-ability", {
        phoneNumber: gwPhone.trim(),
        gatewayToken: gatewayToken.trim() || undefined,
      });
      const data = res?.data?.result || res?.data;
      setGwAbilityInfo(data);
      toast.success(data?.can_send ? "Recipient can receive Telegram OTP!" : "Recipient not found on Telegram");
    } catch (err) {
      toast.error(err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setGwCheckingAbility(false);
    }
  };

  // 5. Send Verification Code (Gateway API)
  const handleSendVerification = async () => {
    if (!gwPhone.trim()) {
      toast.error("Please enter destination phone number");
      return;
    }

    try {
      setGwSendingVerification(true);
      const res = await apiClient.post("/telegram/gateway/send-verification", {
        phoneNumber: gwPhone.trim(),
        gatewayToken: gatewayToken.trim() || undefined,
        senderUsername: gatewaySenderUsername.trim() || undefined,
        codeLength: 6,
        ttl: 60,
      });
      const data = res?.data?.result || res?.data;
      setGwVerificationInfo(data);
      toast.success("Telegram Gateway Verification code sent!");
      loadConfig();
    } catch (err) {
      toast.error(err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setGwSendingVerification(false);
    }
  };

  return (
    <div className="container-fluid py-3 px-md-4">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* Header */}
      <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className="p-3 rounded-3 text-white shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: "#0088cc" }}>
              <FaTelegramPlane size={26} />
            </span>
            <div>
              <h4 className="fw-bold mb-0 text-dark">Telegram CPaaS Configuration &amp; Status</h4>
              <p className="text-muted small mb-0 mt-1">
                Configure official Telegram Bot credentials, Telegram Gateway API token, live webhooks, and testing suites.
              </p>
            </div>
          </div>
          <Button color="light" size="sm" className="border shadow-sm d-flex align-items-center gap-2" onClick={loadConfig} disabled={loading}>
            <FaUndo className={loading ? "fa-spin" : ""} /> Refresh Status
          </Button>
        </div>

        {/* Sub-Tab Navigation */}
        <Nav tabs className="mt-4 border-bottom">
          <NavItem>
            <NavLink
              className={`py-2.5 px-4 fw-semibold cursor-pointer ${activeTab === "bot" ? "active text-primary border-primary border-bottom-0" : "text-secondary"}`}
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("bot")}
            >
              <FaRobot className="me-2" /> 1. Telegram Bot API (@BotFather)
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={`py-2.5 px-4 fw-semibold cursor-pointer ${activeTab === "gateway" ? "active text-primary border-primary border-bottom-0" : "text-secondary"}`}
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("gateway")}
            >
              <FaShieldAlt className="me-2" /> 2. Telegram Gateway API (gateway.telegram.org)
            </NavLink>
          </NavItem>
        </Nav>
      </div>

      {/* TAB 1: TELEGRAM BOT API */}
      {activeTab === "bot" && (
        <Row className="g-4">
          <Col lg={7}>
            {/* Bot Token Setup */}
            <Card className="border shadow-sm mb-4">
              <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                <h6 className="fw-bold text-dark mb-0">Bot Token from @BotFather</h6>
                <span className="badge bg-light text-dark border">Official Telegram Bot API</span>
              </CardHeader>
              <CardBody className="p-4">
                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary">Bot Token *</Label>
                  <InputGroup>
                    <Input
                      type={showSecretBot ? "text" : "password"}
                      placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ123456789"
                      value={botToken}
                      onChange={(e) => setBotToken(e.target.value)}
                    />
                    <Button color="light" className="border" onClick={() => setShowSecretBot(!showSecretBot)}>
                      {showSecretBot ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                    <Button
                      color="primary"
                      disabled={validating || !botToken.trim()}
                      onClick={handleValidateBot}
                      style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}
                    >
                      {validating ? <Spinner size="sm" /> : <FaCheck className="me-1" />} Validate &amp; Bind
                    </Button>
                  </InputGroup>
                  <small className="text-muted d-block mt-1">
                    Obtain your bot token from <a href="https://t.me/BotFather" target="_blank" rel="noreferrer">@BotFather on Telegram</a>. Awards complimentary onboarding service credits.
                  </small>
                </FormGroup>

                {/* Webhook Endpoint */}
                <div className="p-3 bg-light rounded border mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <Label className="small fw-semibold text-secondary mb-0">Incoming Updates Webhook Endpoint</Label>
                    <Button
                      color="link"
                      size="sm"
                      className="p-0 text-decoration-none"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/v0/telegram/bot/webhook`);
                        toast.success("Webhook URL copied to clipboard!");
                      }}
                    >
                      <FaCopy size={12} className="me-1" /> Copy URL
                    </Button>
                  </div>
                  <code className="p-2 bg-white rounded border d-block text-primary small">
                    {window.location.origin}/api/v0/telegram/bot/webhook
                  </code>
                </div>

                {/* Quick Test Alert */}
                <div className="p-3 bg-light rounded border">
                  <Label className="small fw-semibold text-secondary mb-1">Quick Delivery Test</Label>
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder="Enter destination Chat ID (e.g. 1207697252)"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                    />
                    <Button
                      color="info"
                      className="text-white"
                      disabled={testing || !testChatId.trim()}
                      onClick={handleSendTest}
                    >
                      {testing ? <Spinner size="sm" /> : <FaPaperPlane className="me-1" />} Send Test
                    </Button>
                  </InputGroup>
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5}>
            {/* Bot Status Card */}
            <Card className="border shadow-sm mb-4">
              <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                <h6 className="fw-bold text-dark mb-0">Bot Identity Status</h6>
                <Badge color={botDetails || botToken ? "success" : "secondary"} pill>
                  {botDetails || botToken ? "ACTIVE / BOUND" : "PENDING"}
                </Badge>
              </CardHeader>
              <CardBody className="p-3">
                {botDetails ? (
                  <div className="small">
                    <div className="mb-2"><strong>Bot Name:</strong> {botDetails.bot_name}</div>
                    <div className="mb-2"><strong>Username:</strong> @{botDetails.username}</div>
                    <div className="mb-2"><strong>Bot ID:</strong> <code>{botDetails.bot_id}</code></div>
                    <Alert color="success" className="py-2 px-3 small border-0 mb-0">
                      Bot is connected and ready to transmit campaigns, OTP, and utility alerts.
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted small">
                    No active bot bound yet. Enter your BotFather token and click &quot;Validate &amp; Bind&quot;.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Wallet Balance Card */}
            <Card className="border shadow-sm">
              <CardHeader className="bg-white py-3 border-bottom">
                <h6 className="fw-bold text-dark mb-0">Telegram Service Credits</h6>
              </CardHeader>
              <CardBody className="p-3 small">
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span>Broadcasts:</span>
                  <strong className="text-primary">{wallet?.telegram_marketing_broadcasts ?? 200}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span>Utility Sessions:</span>
                  <strong className="text-info">{wallet?.telegram_utility_session_credits ?? 200}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span>Gateway OTP:</span>
                  <strong className="text-success">{wallet?.telegram_gateway_otp_credits ?? 200}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 border-bottom">
                  <span>AI Bot Queries:</span>
                  <strong className="text-warning">{wallet?.telegram_ai_bot_credits ?? 200}</strong>
                </div>
                <div className="d-flex justify-content-between py-1 pt-2">
                  <span>Service Backup:</span>
                  <strong className="text-dark">{wallet?.telegram_service_credits ?? 200}</strong>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* TAB 2: TELEGRAM GATEWAY API (Official Phone OTP Delivery) */}
      {activeTab === "gateway" && (
        <div>
          {/* Informational Banner */}
          <Alert color="info" className="d-flex align-items-start gap-2 mb-4 py-3 px-4 border-0 shadow-sm rounded-3">
            <FaTelegramPlane size={24} className="mt-1 flex-shrink-0 text-primary" />
            <div>
              <div className="fw-bold">Official Telegram Gateway Integration (gateway.telegram.org)</div>
              <p className="small mb-1 mt-0.5">
                Transmit one-time passcodes (OTP) directly to phone numbers around the world without requiring users to chat with a bot first.
              </p>
              <div className="mt-2">
                <span className="badge bg-success me-2">Free Self-Testing</span>
                Sending verification codes to your own account phone number is <strong>100% free</strong>.
                <a
                  href="https://gateway.telegram.org/"
                  target="_blank"
                  rel="noreferrer"
                  className="ms-3 fw-bold text-decoration-none"
                >
                  Open Gateway Portal <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>
          </Alert>

          <Row className="g-4">
            <Col lg={7}>
              {/* Gateway Form */}
              <Card className="border shadow-sm mb-4">
                <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold text-dark mb-0">Gateway Authentication &amp; Parameters</h6>
                  <Badge color={gwStatus === "ACTIVE" ? "success" : "secondary"} pill>
                    {gwStatus}
                  </Badge>
                </CardHeader>
                <CardBody className="p-4">
                  <Form onSubmit={handleSaveGateway}>
                    <FormGroup className="mb-3">
                      <Label className="small fw-semibold text-secondary">
                        Telegram Gateway API Token (Bearer Token) *
                      </Label>
                      <InputGroup>
                        <Input
                          type={showSecretGw ? "text" : "password"}
                          placeholder="e.g. AAAA... (Generate at gateway.telegram.org)"
                          value={gatewayToken}
                          onChange={(e) => setGatewayToken(e.target.value)}
                        />
                        <Button color="light" className="border" onClick={() => setShowSecretGw(!showSecretGw)}>
                          {showSecretGw ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </InputGroup>
                      <small className="text-muted d-block mt-1">
                        Used to authenticate requests with header: <code>Authorization: Bearer &lt;TOKEN&gt;</code>.
                      </small>
                    </FormGroup>

                    <Row className="g-3 mb-3">
                      <Col md={6}>
                        <FormGroup className="mb-0">
                          <Label className="small fw-semibold text-secondary">Sender Username (Optional)</Label>
                          <Input
                            type="text"
                            placeholder="e.g. @MyChannel or @MyBot"
                            value={gatewaySenderUsername}
                            onChange={(e) => setGatewaySenderUsername(e.target.value)}
                          />
                          <small className="text-muted d-block mt-1">
                            Telegram channel or bot to appear as the sender.
                          </small>
                        </FormGroup>
                      </Col>

                      <Col md={6}>
                        <FormGroup className="mb-0">
                          <Label className="small fw-semibold text-secondary">Delivery Report Webhook Callback</Label>
                          <Input
                            type="text"
                            placeholder={`${window.location.origin}/api/v0/telegram/gateway/webhook`}
                            value={gatewayCallbackUrl}
                            onChange={(e) => setGatewayCallbackUrl(e.target.value)}
                          />
                          <small className="text-muted d-block mt-1">
                            Endpoint for POST delivery status updates.
                          </small>
                        </FormGroup>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end pt-2">
                      <Button
                        type="submit"
                        color="primary"
                        disabled={savingGateway || !gatewayToken.trim()}
                        style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}
                      >
                        {savingGateway ? <Spinner size="sm" /> : <FaSave className="me-1" />} Save Gateway Configuration
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            <Col lg={5}>
              {/* Interactive Gateway Testing Suite */}
              <Card className="border shadow-sm mb-4">
                <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
                  <h6 className="fw-bold text-dark mb-0">Live Gateway Testing Suite</h6>
                  <span className="badge bg-secondary">gatewayapi.telegram.org</span>
                </CardHeader>
                <CardBody className="p-3">
                  <p className="text-muted small mb-3">
                    Verify destination eligibility and send an instant verification OTP to test integration.
                  </p>

                  <FormGroup className="mb-3">
                    <Label className="small fw-semibold text-secondary">Destination Phone (E.164 format) *</Label>
                    <InputGroup>
                      <Input
                        type="text"
                        placeholder="+919876543210"
                        value={gwPhone}
                        onChange={(e) => setGwPhone(e.target.value)}
                      />
                      <Button
                        color="outline-primary"
                        disabled={gwCheckingAbility || !gwPhone.trim()}
                        onClick={handleCheckAbility}
                      >
                        {gwCheckingAbility ? <Spinner size="sm" /> : <FaCheckCircle className="me-1" />} Check Ability
                      </Button>
                    </InputGroup>
                  </FormGroup>

                  {gwAbilityInfo && (
                    <div className="p-2.5 bg-light rounded border small mb-3">
                      <div><strong>Can Send:</strong> {gwAbilityInfo.can_send ? "Yes ✅" : "No ❌"}</div>
                      {gwAbilityInfo.cost !== undefined && <div><strong>Estimated Cost:</strong> {gwAbilityInfo.cost} TON</div>}
                    </div>
                  )}

                  <Button
                    color="primary"
                    block
                    disabled={gwSendingVerification || !gwPhone.trim() || !gatewayToken.trim()}
                    onClick={handleSendVerification}
                    style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}
                  >
                    {gwSendingVerification ? <Spinner size="sm" /> : <FaPaperPlane className="me-1" />} Send Verification OTP
                  </Button>

                  {gwVerificationInfo && (
                    <Alert color="success" className="py-2 px-3 small border-0 mt-3 mb-0">
                      <div><strong>Request ID:</strong> <code>{gwVerificationInfo.request_id || gwVerificationInfo.requestId}</code></div>
                      <div><strong>Delivery Status:</strong> {gwVerificationInfo.delivery_status?.status || "Sent"}</div>
                    </Alert>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

export default TelegramBotConfig;
