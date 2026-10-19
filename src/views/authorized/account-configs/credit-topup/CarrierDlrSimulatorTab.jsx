import React from "react";
import {
  Card, CardBody, CardHeader, Button, Badge, Row, Col, Form, FormGroup, Label, Input, Spinner
} from "reactstrap";
import { FaExchangeAlt, FaPaperPlane } from "react-icons/fa";
import { CHANNELS_LIST, CHANNEL_CATEGORIES_BY_CHANNEL } from "../creditConstants";

const CarrierDlrSimulatorTab = ({
  users = [],
  dlrForm,
  setDlrForm,
  dlrLoading = false,
  dlrResult = null,
  setDlrResult,
  onSimulateDlr,
}) => {
  return (
    <div className="p-2">
      <Row className="g-3">
        <Col lg={6}>
          <Card className="border shadow-sm">
            <CardHeader className="bg-light py-2 px-3 fw-bold small text-dark d-flex align-items-center justify-content-between">
              <span>
                <FaExchangeAlt className="me-1.5 text-danger" /> Inbound Carrier DLR Webhook Tester
              </span>
              <Badge color="info">POST /webhooks/delivery-report</Badge>
            </CardHeader>
            <CardBody className="p-3">
              <p className="small text-muted mb-3">
                Simulate a live carrier delivery receipt (Airtel, Jio, Meta WhatsApp Graph API, Google RBM, OBD Gateway). 
                Successful statuses (<code>DELIVERED</code>, <code>SENT</code>, <code>ANSWERED</code>) settle campaign delivery units. 
                Failed statuses (<code>FAILED</code>, <code>REJECTED</code>, <code>DND_BLOCKED</code>, <code>UNDELIVERED</code>, <code>BUSY</code>) 
                <strong>immediately auto-refund 100% of the credits back</strong> to the user's specific channel/category wallet.
              </p>
              <Form onSubmit={onSimulateDlr}>
                <FormGroup className="mb-2">
                  <Label className="small fw-semibold mb-1">Target User Account</Label>
                  <Input
                    type="select"
                    size="sm"
                    value={dlrForm.userId}
                    onChange={(e) => setDlrForm((p) => ({ ...p, userId: e.target.value }))}
                    required
                  >
                    <option value="">-- Select Target User --</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name || "Unnamed"} ({u.email}) [{u.role}]
                      </option>
                    ))}
                  </Input>
                </FormGroup>

                <Row className="g-2 mb-2">
                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold mb-1">Channel</Label>
                      <Input
                        type="select"
                        size="sm"
                        value={dlrForm.channel}
                        onChange={(e) => {
                          const ch = e.target.value;
                          const firstCat = CHANNEL_CATEGORIES_BY_CHANNEL[ch]?.[0]?.category || "OTP";
                          setDlrForm((p) => ({ ...p, channel: ch, category: firstCat }));
                        }}
                      >
                        {CHANNELS_LIST.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold mb-1">Category Route</Label>
                      <Input
                        type="select"
                        size="sm"
                        value={dlrForm.category}
                        onChange={(e) => setDlrForm((p) => ({ ...p, category: e.target.value }))}
                      >
                        {(CHANNEL_CATEGORIES_BY_CHANNEL[dlrForm.channel] || []).map((cat) => (
                          <option key={cat.code} value={cat.category}>
                            {cat.category} — {cat.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="g-2 mb-2">
                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold mb-1">Carrier Status</Label>
                      <Input
                        type="select"
                        size="sm"
                        value={dlrForm.status}
                        onChange={(e) => setDlrForm((p) => ({ ...p, status: e.target.value }))}
                      >
                        <optgroup label="Success (Settled)">
                          <option value="DELIVERED">DELIVERED (Finalized)</option>
                          <option value="SENT">SENT (Handed to Carrier)</option>
                          <option value="ANSWERED">ANSWERED (Voice OBD Picked)</option>
                        </optgroup>
                        <optgroup label="Failed (Auto-Refunded)">
                          <option value="FAILED">FAILED (Auto-Refund)</option>
                          <option value="REJECTED">REJECTED (Auto-Refund)</option>
                          <option value="DND_BLOCKED">DND_BLOCKED (Auto-Refund)</option>
                          <option value="UNDELIVERED">UNDELIVERED (Auto-Refund)</option>
                          <option value="BUSY">BUSY (Auto-Refund)</option>
                        </optgroup>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup className="mb-0">
                      <Label className="small fw-semibold mb-1">Campaign ID</Label>
                      <Input
                        size="sm"
                        value={dlrForm.campaignId}
                        onChange={(e) => setDlrForm((p) => ({ ...p, campaignId: e.target.value }))}
                        placeholder="e.g. CAMP-1002"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button
                    type="button"
                    color="light"
                    size="sm"
                    onClick={() => {
                      setDlrResult(null);
                      setDlrForm((p) => ({
                        ...p,
                        campaignId: "CAMP-SIM-" + Math.floor(100000 + Math.random() * 900000),
                      }));
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    color={["DELIVERED", "SENT", "ANSWERED"].includes(dlrForm.status) ? "success" : "danger"}
                    size="sm"
                    disabled={dlrLoading || !dlrForm.userId}
                    className="fw-bold px-3"
                  >
                    {dlrLoading ? <Spinner size="sm" className="me-1" /> : <FaPaperPlane className="me-1" />}
                    Simulate Carrier Webhook
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border shadow-sm h-100">
            <CardHeader className="bg-light py-2 px-3 fw-bold small text-dark">
              Simulation Result &amp; Audit Response
            </CardHeader>
            <CardBody className="p-3">
              {dlrResult ? (
                <div>
                  <div className={`alert ${dlrResult.autoRefundTriggered ? "alert-warning" : "alert-success"} py-2 px-3 mb-3 small`}>
                    <strong>Action Taken: </strong>
                    {dlrResult.autoRefundTriggered
                      ? `Refunded ${dlrResult.refundedCredits || 1} unit(s) back to key "${dlrResult.creditKey}" for user ${dlrResult.userId}.`
                      : `Finalized ${dlrResult.settledCredits || 1} delivered unit(s) for key "${dlrResult.creditKey}".`}
                  </div>
                  <pre className="bg-dark text-light p-3 rounded small mb-0" style={{ maxHeight: 300, overflow: "auto" }}>
                    {JSON.stringify(dlrResult, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  <FaExchangeAlt size={36} className="text-muted opacity-25 mb-2 d-block mx-auto" />
                  <p className="mb-0 small">No simulation run yet.</p>
                  <span className="small text-muted">Select an account, choose status, and trigger simulation.</span>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CarrierDlrSimulatorTab;
