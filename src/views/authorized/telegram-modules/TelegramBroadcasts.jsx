import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup,
  Label, Input, Row, Col, Spinner, Badge, Table, Alert,
  InputGroup, InputGroupText
} from "reactstrap";
import {
  FaTelegramPlane, FaPaperPlane, FaUsers, FaPlus, FaTrash,
  FaLink, FaCheckCircle, FaExclamationTriangle, FaUndo,
  FaFileCsv, FaHistory, FaCoins
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";

const TelegramBroadcasts = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [wallet, setWallet] = useState(null);

  // Broadcast Form State
  const [recipientsText, setRecipientsText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [buttons, setButtons] = useState([]);
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  // Broadcast Results State
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch Live Wallet Balances
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

  // Parse recipient chat IDs
  const parsedChatIds = recipientsText
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => /^-?\d+$/.test(s));

  const uniqueChatIds = Array.from(new Set(parsedChatIds));
  const availableCredits = wallet?.telegram_marketing_broadcasts ?? 0;
  const isBalanceSufficient = availableCredits >= uniqueChatIds.length;

  const handleAddButton = () => {
    if (!buttonText || !buttonUrl) {
      toast.error("Please enter both button text and a valid URL");
      return;
    }
    setButtons((prev) => [...prev, { text: buttonText, url: buttonUrl }]);
    setButtonText("");
    setButtonUrl("");
  };

  const handleRemoveButton = (index) => {
    setButtons((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendBroadcast = async () => {
    if (uniqueChatIds.length === 0) {
      toast.error("Please enter at least one valid destination Chat ID");
      return;
    }
    if (!messageText.trim()) {
      toast.error("Please enter your broadcast message text");
      return;
    }

    try {
      setSending(true);
      const payload = {
        chatIds: uniqueChatIds,
        text: messageText,
        buttons: buttons.map((b) => [{ text: b.text, url: b.url }]),
      };

      const res = await apiClient.post("/telegram/campaigns/broadcast", payload);
      const data = res?.data || res;

      if (data?.success) {
        setLastResult(data);
        toast.success(`Broadcast completed! Delivered: ${data.delivered}/${data.totalTargeted}`);
        setHistory((prev) => [
          {
            id: `bc_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            targets: data.totalTargeted,
            delivered: data.delivered,
            failed: data.failed,
            snippet: messageText.substring(0, 40) + "...",
          },
          ...prev,
        ]);
        // Refresh wallet balance
        loadWallet();
      } else {
        toast.error(data?.error || "Broadcast dispatch failed");
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || err?.response?.data?.error || err.message);
    } finally {
      setSending(false);
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
              <FaTelegramPlane size={24} />
            </span>
            <div>
              <h4 className="fw-bold mb-0 text-dark">Telegram Marketing Broadcasts &amp; Campaigns</h4>
              <p className="text-muted small mb-0 mt-1">
                Dispatch rich marketing promotions, bulletins, and interactive media updates to Telegram subscribers.
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 px-3 rounded-2 bg-light border text-end">
              <span className="text-muted small d-block">Available Broadcast Credits</span>
              <strong className="fs-5 text-primary">
                {wallet?.telegram_marketing_broadcasts ?? 0}
              </strong>
            </div>
            <Button color="light" size="sm" className="border" onClick={loadWallet} disabled={loading}>
              <FaUndo className={loading ? "fa-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      <Row className="g-4">
        {/* Left Column: Broadcast Composer */}
        <Col lg={7}>
          <Card className="border shadow-sm mb-4">
            <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaPaperPlane className="text-primary" /> Campaign Composer
              </h6>
              <Badge color="info" pill>Markdown &amp; Inline Keys Supported</Badge>
            </CardHeader>
            <CardBody className="p-4">
              <Form onSubmit={(e) => { e.preventDefault(); handleSendBroadcast(); }}>
                {/* Recipients */}
                <FormGroup className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <Label className="small fw-semibold text-secondary mb-0">
                      Destination Chat IDs (One per line or comma-separated) *
                    </Label>
                    <Badge color={uniqueChatIds.length > 0 ? "primary" : "secondary"}>
                      {uniqueChatIds.length} Targets Selected
                    </Badge>
                  </div>
                  <Input
                    type="textarea"
                    rows="4"
                    placeholder="e.g. 1207697252&#10;987654321&#10;-1001234567890 (Channel/Group ID)"
                    value={recipientsText}
                    onChange={(e) => setRecipientsText(e.target.value)}
                  />
                  <small className="text-muted d-block mt-1">
                    Users must have interacted with your bot or subscribed to your Telegram channel.
                  </small>
                </FormGroup>

                {/* Message Body */}
                <FormGroup className="mb-3">
                  <Label className="small fw-semibold text-secondary">
                    Broadcast Message Content (Markdown formatted) *
                  </Label>
                  <Input
                    type="textarea"
                    rows="6"
                    placeholder="🌟 *Exclusive Flash Sale!*\n\nGet 30% off across all CPaaS communication routes this weekend.\n\nUse promo code: *TELE30*"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <small className="text-muted d-block mt-1">
                    Supports <code>*bold*</code>, <code>_italic_</code>, and <code>`code`</code> tags.
                  </small>
                </FormGroup>

                {/* Interactive Inline Buttons */}
                <FormGroup className="mb-3 p-3 bg-light rounded border">
                  <Label className="small fw-semibold text-secondary mb-2 d-block">
                    Interactive CTA Buttons (Inline Keyboard)
                  </Label>
                  <Row className="g-2 mb-2">
                    <Col md={5}>
                      <Input
                        type="text"
                        placeholder="Button Label (e.g. Visit Website)"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                      />
                    </Col>
                    <Col md={5}>
                      <Input
                        type="url"
                        placeholder="Destination URL (https://...)"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                      />
                    </Col>
                    <Col md={2}>
                      <Button color="primary" type="button" className="w-100" onClick={handleAddButton}>
                        <FaPlus /> Add
                      </Button>
                    </Col>
                  </Row>

                  {buttons.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {buttons.map((b, idx) => (
                        <Badge key={idx} color="secondary" className="p-2 d-flex align-items-center gap-2">
                          <FaLink /> {b.text} ({b.url})
                          <FaTrash className="cursor-pointer text-danger" onClick={() => handleRemoveButton(idx)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormGroup>

                {/* Live Estimator & Dispatch Button */}
                <div className="p-3 bg-light rounded border mb-3 d-flex align-items-center justify-content-between">
                  <div className="small">
                    <div>Estimated Cost: <strong>{uniqueChatIds.length} Broadcast Credits</strong></div>
                    <div className="text-muted">Available in wallet: {availableCredits}</div>
                  </div>
                  {!isBalanceSufficient && uniqueChatIds.length > 0 && (
                    <Badge color="danger">Insufficient Credits</Badge>
                  )}
                </div>

                <Button
                  color="primary"
                  size="lg"
                  className="w-100 fw-semibold text-white shadow-sm"
                  style={{ backgroundColor: "#0088cc", borderColor: "#0088cc" }}
                  disabled={sending || uniqueChatIds.length === 0 || !messageText.trim()}
                  type="submit"
                >
                  {sending ? (
                    <>
                      <Spinner size="sm" className="me-2" /> Dispatching Broadcast Pipeline...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" /> Dispatch Broadcast to {uniqueChatIds.length} Recipients
                    </>
                  )}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* Right Column: Preview & History */}
        <Col lg={5}>
          {/* Live Mobile Telegram Preview */}
          <Card className="border shadow-sm mb-4">
            <CardHeader className="bg-white py-3 border-bottom">
              <h6 className="fw-bold text-dark mb-0">Telegram Message Preview</h6>
            </CardHeader>
            <CardBody className="p-3 bg-light" style={{ minHeight: "260px" }}>
              <div
                className="p-3 rounded-3 shadow-sm bg-white border"
                style={{ maxWidth: "340px", margin: "0 auto", borderBottomRightRadius: "4px" }}
              >
                <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                  <div className="rounded-circle p-2 text-white" style={{ backgroundColor: "#0088cc" }}>
                    <FaTelegramPlane size={14} />
                  </div>
                  <strong className="small text-dark">BeyondSend Bot</strong>
                  <span className="badge bg-secondary ms-auto" style={{ fontSize: "10px" }}>bot</span>
                </div>

                <div className="text-dark small" style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {messageText || "Your broadcast message will appear here in native Telegram format."}
                </div>

                {buttons.length > 0 && (
                  <div className="mt-3 pt-2 border-top d-flex flex-column gap-1">
                    {buttons.map((b, idx) => (
                      <div
                        key={idx}
                        className="py-1 px-2 text-center rounded text-primary fw-semibold border small bg-light"
                      >
                        {b.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Last Broadcast Result Card */}
          {lastResult && (
            <Card className="border shadow-sm mb-4">
              <CardHeader className="bg-success text-white py-2">
                <strong className="small d-flex align-items-center gap-2">
                  <FaCheckCircle /> Latest Broadcast Execution
                </strong>
              </CardHeader>
              <CardBody className="p-3 small">
                <div>Total Targeted: <strong>{lastResult.totalTargeted}</strong></div>
                <div>Delivered: <strong className="text-success">{lastResult.delivered}</strong></div>
                <div>Failed: <strong className="text-danger">{lastResult.failed}</strong></div>
                <div>Charged Credits: <strong>{lastResult.chargedCredits}</strong></div>
              </CardBody>
            </Card>
          )}

          {/* Recent Broadcast History */}
          <Card className="border shadow-sm">
            <CardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaHistory className="text-secondary" /> Recent Broadcast Logs
              </h6>
            </CardHeader>
            <CardBody className="p-0">
              {history.length === 0 ? (
                <div className="p-4 text-center text-muted small">
                  No broadcasts dispatched in this session yet.
                </div>
              ) : (
                <Table responsive hover className="mb-0 small align-middle">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Targets</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td>{h.timestamp}</td>
                        <td>{h.targets}</td>
                        <td>
                          <Badge color="success">{h.delivered} sent</Badge>{" "}
                          {h.failed > 0 && <Badge color="danger">{h.failed} failed</Badge>}
                        </td>
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

export default TelegramBroadcasts;
