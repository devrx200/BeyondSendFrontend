import React, { useMemo } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input,
  Button, ButtonGroup, Badge, Row, Col, InputGroup, Spinner
} from "reactstrap";
import {
  FaPlus, FaMinus, FaSearch, FaUserTie, FaUser, FaExchangeAlt
} from "react-icons/fa";
import {
  CREDIT_KEYS, CHANNELS_LIST, CHANNEL_META, CHANNEL_CATEGORIES_BY_CHANNEL
} from "../creditConstants";

const PAYMENT_MODES = ["cash", "upi", "neft", "imps", "card", "bank_transfer", "wallet", "other"];

const getChannelTotal = (user, channel) => {
  if (!user) return 0;
  const w = user.creditWallet || user.myWallet || {};
  if (channel === "ALL") {
    return CREDIT_KEYS.reduce((sum, key) => sum + (Number(w[key]) || 0), 0);
  }
  const keys = (CHANNEL_CATEGORIES_BY_CHANNEL[channel] || []).map((c) =>
    typeof c === "string" ? c : c?.creditKey || c?.key
  );
  return keys.reduce((sum, key) => sum + (Number(w[key]) || 0), 0);
};

const DirectCreditAdjustmentModal = ({
  isOpen,
  toggle,
  mode = "topup",
  form,
  setField,
  addPreset,
  creditSum = 0,
  users = [],
  modalTargetSearch = "",
  setModalTargetSearch,
  modalRoleFilter = "ALL",
  setModalRoleFilter,
  modalChannel = "ALL",
  setModalChannel,
  onSubmit,
  actionLoading = false,
}) => {
  const targetUsers = useMemo(
    () => users.filter((u) => ["RESELLER", "CLIENT"].includes(u.role)),
    [users]
  );

  const filteredModalUsers = useMemo(() => {
    return targetUsers.filter((u) => {
      if (modalRoleFilter !== "ALL" && u.role !== modalRoleFilter) return false;
      if (!modalTargetSearch.trim()) return true;
      const q = modalTargetSearch.toLowerCase();
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.mobile || "").toLowerCase().includes(q)
      );
    });
  }, [targetUsers, modalTargetSearch, modalRoleFilter]);

  const modalResellerCount = useMemo(
    () => targetUsers.filter((u) => u.role === "RESELLER").length,
    [targetUsers]
  );
  const modalClientCount = useMemo(
    () => targetUsers.filter((u) => u.role === "CLIENT").length,
    [targetUsers]
  );

  const selectedAccount = useMemo(
    () => users.find((u) => u._id === form.userId) || null,
    [users, form.userId]
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered backdrop="static">
      <Form onSubmit={onSubmit}>
        <ModalHeader toggle={toggle} className="py-2.5 px-3">
          {mode === "topup" ? (
            <div className="text-white fw-bold d-flex align-items-center gap-2">
              <FaPlus /> Add Credits to Reseller / Client Wallet
            </div>
          ) : (
            <div className="text-white fw-bold d-flex align-items-center gap-2">
              <FaMinus /> Deduct Credits from Reseller / Client Wallet
            </div>
          )}
        </ModalHeader>
        <ModalBody className="p-3">
          {/* Target Account Searchable Selector */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1.5">
              <Label className="small fw-bold text-uppercase text-secondary mb-0">
                Target Account <span className="text-danger">*</span> (Resellers &amp; Clients Only)
              </Label>
              {selectedAccount && (
                <span className="badge bg-success-subtle text-success border border-success-subtle small py-1 px-2">
                  ✓ Account Selected: {selectedAccount.role}
                </span>
              )}
            </div>

            {selectedAccount ? (
              <div className="border border-primary border-opacity-25 rounded-3 p-2.5 bg-light shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex align-items-center gap-2.5">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                      style={{
                        width: 38,
                        height: 38,
                        background: selectedAccount.role === "RESELLER" ? "#0d6efd" : "#0dcaf0",
                      }}
                    >
                      {selectedAccount.role === "RESELLER" ? <FaUserTie size={17} /> : <FaUser size={17} />}
                    </div>
                    <div>
                      <div className="fw-bold text-dark fs-6 d-flex align-items-center gap-2">
                        <span>{selectedAccount.name || "Unnamed"}</span>
                        <Badge color={selectedAccount.role === "RESELLER" ? "primary" : "info"} pill>
                          {selectedAccount.role}
                        </Badge>
                        {selectedAccount.status && (
                          <span className="badge bg-secondary small text-uppercase" style={{ fontSize: "10px" }}>
                            {selectedAccount.status}
                          </span>
                        )}
                      </div>
                      <div className="text-muted small mt-0.5 d-flex flex-wrap align-items-center gap-2">
                        <span>✉ {selectedAccount.email}</span>
                        {selectedAccount.mobile ? (
                          <span>📞 {selectedAccount.mobile}</span>
                        ) : (
                          <span className="text-muted opacity-75">📞 No mobile</span>
                        )}
                        {selectedAccount.parentClientName && (
                          <span className="text-secondary fw-semibold">
                            (Parent: {selectedAccount.parentClientName})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      type="button"
                      color="outline-primary"
                      size="sm"
                      className="fw-semibold px-2.5"
                      onClick={() => {
                        setField("userId", "");
                        setModalTargetSearch("");
                      }}
                    >
                      <FaSearch className="me-1" size={10} /> Change / Search Account
                    </Button>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-top d-flex flex-wrap gap-1.5 align-items-center">
                  <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: "11px" }}>
                    Current Balances:
                  </span>
                  <Badge color="light" className="border text-dark">
                    SMS: {getChannelTotal(selectedAccount, "SMS").toLocaleString()}
                  </Badge>
                  <Badge color="light" className="border text-dark">
                    WhatsApp: {getChannelTotal(selectedAccount, "WHATSAPP").toLocaleString()}
                  </Badge>
                  <Badge color="light" className="border text-dark">
                    RCS: {getChannelTotal(selectedAccount, "RCS").toLocaleString()}
                  </Badge>
                  <Badge color="light" className="border text-dark">
                    Voice: {getChannelTotal(selectedAccount, "VOICE").toLocaleString()}
                  </Badge>
                  <Badge color="light" className="border text-dark">
                    Email: {getChannelTotal(selectedAccount, "EMAIL").toLocaleString()}
                  </Badge>
                  <Badge color="dark" className="ms-auto fw-bold">
                    Total: {getChannelTotal(selectedAccount, "ALL").toLocaleString()} credits
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="border rounded-3 p-2.5 bg-white shadow-sm">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                  <InputGroup size="sm" style={{ maxWidth: 440 }}>
                    <Input
                      placeholder="Search by account name, email, or mobile number…"
                      value={modalTargetSearch}
                      onChange={(e) => setModalTargetSearch(e.target.value)}
                      autoFocus
                    />
                    {modalTargetSearch && (
                      <Button color="light" onClick={() => setModalTargetSearch("")}>
                        ✕
                      </Button>
                    )}
                  </InputGroup>

                  <ButtonGroup size="sm">
                    <Button
                      type="button"
                      color={modalRoleFilter === "ALL" ? "primary" : "light"}
                      onClick={() => setModalRoleFilter("ALL")}
                    >
                      All ({targetUsers.length})
                    </Button>
                    <Button
                      type="button"
                      color={modalRoleFilter === "RESELLER" ? "primary" : "light"}
                      onClick={() => setModalRoleFilter("RESELLER")}
                    >
                      Resellers ({modalResellerCount})
                    </Button>
                    <Button
                      type="button"
                      color={modalRoleFilter === "CLIENT" ? "primary" : "light"}
                      onClick={() => setModalRoleFilter("CLIENT")}
                    >
                      Clients ({modalClientCount})
                    </Button>
                  </ButtonGroup>
                </div>

                <div className="border rounded-2 overflow-auto" style={{ maxHeight: 210, background: "#fafafa" }}>
                  {filteredModalUsers.length === 0 ? (
                    <div className="text-center text-muted py-4 small">
                      {modalTargetSearch ? (
                        <>
                          No reseller or client found matching &ldquo;<strong>{modalTargetSearch}</strong>&rdquo;.
                        </>
                      ) : (
                        "No accounts available with RESELLER or CLIENT roles."
                      )}
                    </div>
                  ) : (
                    <div className="list-group list-group-flush small">
                      {filteredModalUsers.map((u) => {
                        const userBal = getChannelTotal(u, "ALL");
                        return (
                          <button
                            key={u._id}
                            type="button"
                            className="list-group-item list-group-item-action py-2 px-3 d-flex justify-content-between align-items-center"
                            onClick={() => {
                              setField("userId", u._id);
                              setModalTargetSearch("");
                            }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                                style={{
                                  width: 30,
                                  height: 30,
                                  background: u.role === "RESELLER" ? "#0d6efd" : "#0dcaf0",
                                  fontSize: "12px",
                                }}
                              >
                                {u.role === "RESELLER" ? <FaUserTie /> : <FaUser />}
                              </div>
                              <div className="text-start">
                                <div className="fw-bold text-dark d-flex align-items-center gap-1.5">
                                  <span>{u.name || "Unnamed"}</span>
                                  <Badge color={u.role === "RESELLER" ? "primary" : "info"} pill style={{ fontSize: "10px" }}>
                                    {u.role}
                                  </Badge>
                                  {u.parentClientName && (
                                    <span className="text-muted" style={{ fontSize: "10px" }}>
                                      • Parent: {u.parentClientName}
                                    </span>
                                  )}
                                </div>
                                <div className="text-muted" style={{ fontSize: "12px" }}>
                                  <span>{u.email}</span>
                                  {u.mobile ? <span className="ms-2">📞 {u.mobile}</span> : ""}
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <div className="text-end">
                                <div className="fw-semibold text-dark" style={{ fontSize: "12px" }}>
                                  {userBal.toLocaleString()} credits
                                </div>
                                <span className="text-muted" style={{ fontSize: "10px" }}>Available</span>
                              </div>
                              <span className="btn btn-outline-primary btn-sm py-0 px-2 fw-semibold" style={{ fontSize: "11px" }}>
                                Select
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Channel selector & routes */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
            <div className="d-flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                color={modalChannel === "ALL" ? "dark" : "light"}
                className="py-0 px-2 fw-semibold"
                onClick={() => setModalChannel("ALL")}
              >
                All Channels (20)
              </Button>
              {CHANNELS_LIST.filter((c) => c.id !== "ALL").map((c) => {
                const count = (CHANNEL_CATEGORIES_BY_CHANNEL[c.id] || []).length;
                return (
                  <Button
                    key={c.id}
                    type="button"
                    size="sm"
                    color={modalChannel === c.id ? "primary" : "light"}
                    className="py-0 px-2 fw-semibold"
                    onClick={() => setModalChannel(c.id)}
                  >
                    {c.icon} {c.name || c.label} ({count})
                  </Button>
                );
              })}
            </div>
            <span className="text-muted small">Click +1k / +5k presets to increment</span>
          </div>

          <Row className="g-2 mb-2.5">
            {(modalChannel === "ALL"
              ? CREDIT_KEYS
              : (CHANNEL_CATEGORIES_BY_CHANNEL[modalChannel] || []).map((c) =>
                  typeof c === "string" ? c : c?.creditKey || c?.key
                )
            ).map((key) => {
              const meta = CHANNEL_META[key] || { label: key, color: "#333", icon: "•", desc: "" };
              return (
                <Col key={key} xs={6} sm={6} md={3}>
                  <div className="border rounded-3 p-2 bg-light h-100 d-flex flex-column justify-content-between">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Label
                        className="small fw-semibold mb-0 text-truncate mw-100"
                        style={{ color: meta.color }}
                        title={meta.desc || meta.label}
                      >
                        {meta.icon} {meta.label}
                      </Label>
                      <ButtonGroup size="sm">
                        <Button
                          type="button"
                          color="light"
                          size="sm"
                          className="py-0 px-1 border small"
                          onClick={() => addPreset(key, 1000)}
                        >
                          +1k
                        </Button>
                        <Button
                          type="button"
                          color="light"
                          size="sm"
                          className="py-0 px-1 border small"
                          onClick={() => addPreset(key, 5000)}
                        >
                          +5k
                        </Button>
                      </ButtonGroup>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      size="sm"
                      className="fw-semibold"
                      value={form[key] || 0}
                      onChange={(e) => setField(key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </Col>
              );
            })}

            <Col xs={6} sm={6} md={3}>
              <div
                className={`border rounded-3 p-2 h-100 d-flex flex-column justify-content-center align-items-center text-center ${
                  mode === "topup"
                    ? "border-success border-opacity-25 bg-success bg-opacity-10"
                    : "border-danger border-opacity-25 bg-danger bg-opacity-10"
                }`}
              >
                <span className={`small fw-bold text-uppercase ${mode === "topup" ? "text-success" : "text-danger"}`}>
                  Total {mode === "topup" ? "Allocation" : "Deduction"}
                </span>
                <span className={`fs-5 fw-bold my-0 lh-1 ${mode === "topup" ? "text-success" : "text-danger"}`}>
                  {creditSum.toLocaleString()}
                </span>
                <span className="text-muted small">units across all routes</span>
              </div>
            </Col>
          </Row>

          <Row className="g-2">
            <Col xs={12} sm={6} md={3}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold mb-1">Amount (₹ / INR)</Label>
                <Input
                  type="number"
                  min="0"
                  size="sm"
                  value={form.amount}
                  onChange={(e) => setField("amount", e.target.value)}
                  placeholder="0"
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold mb-1">Payment Mode</Label>
                <Input
                  type="select"
                  size="sm"
                  value={form.paymentMode}
                  onChange={(e) => setField("paymentMode", e.target.value)}
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold mb-1">UTR / Transaction ID</Label>
                <Input
                  size="sm"
                  value={form.paymentReference}
                  onChange={(e) => setField("paymentReference", e.target.value)}
                  placeholder="UTR / Txn ID"
                />
              </FormGroup>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <FormGroup className="mb-0">
                <Label className="small fw-semibold mb-1">Remarks / Reason</Label>
                <Input
                  size="sm"
                  value={form.remarks}
                  onChange={(e) => setField("remarks", e.target.value)}
                  placeholder="e.g. Allocation note"
                />
              </FormGroup>
            </Col>
          </Row>

          {mode === "deduct" && (
            <div className="alert alert-warning small mb-0 py-1.5 px-2.5 mt-2">
              <strong>Caution:</strong> Deductions directly reduce the account's active credit balances. Balances cannot be deducted below zero.
            </div>
          )}
        </ModalBody>
        <ModalFooter className="py-2 px-3">
          <Button color="light" size="sm" onClick={toggle} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            color={mode === "topup" ? "success" : "danger"}
            size="sm"
            type="submit"
            disabled={actionLoading || creditSum <= 0}
            className="px-3 fw-semibold"
          >
            {actionLoading ? <Spinner size="sm" className="me-1" /> : <FaExchangeAlt className="me-1" />}
            {mode === "topup" ? "Confirm Topup" : "Confirm Deduction"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default DirectCreditAdjustmentModal;
