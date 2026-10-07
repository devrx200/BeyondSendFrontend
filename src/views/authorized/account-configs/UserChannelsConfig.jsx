import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Badge, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter, Form,
  FormGroup, Label, Input, Spinner, Alert,
} from "reactstrap";
import {
  FaPlug, FaSyncAlt, FaTrash, FaSave, FaCheckCircle,
  FaEye, FaEyeSlash, FaBolt, FaToggleOn, FaToggleOff, FaExclamationTriangle,
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";
import { ICON_MAP } from "@/config/menu/authorizedMenu";

const resolveIcon = (key) => ICON_MAP[key] || FaBolt;

const CATEGORY_LABELS = {
  MESSAGING: "Messaging",
  TELEPHONY: "Telephony",
  ENGAGEMENT: "Engagement",
  CUSTOM: "Custom",
};

/**
 * Per-user channel & provider configuration.
 *
 * The form is generated from the provider's credentialSchema, so a provider
 * added at runtime in the admin screen appears here with no code change.
 * Secrets arrive masked; re-saving without editing one keeps the stored value.
 */
const UserChannelsConfig = ({ userId = null, readOnly = false }) => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({ user: null, channels: [] });

  const [editing, setEditing] = useState(null); // { channel, providerCode, schema, credentials }
  const [reveal, setReveal] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = userId ? `/user-channels/${userId}` : "/user-channels";
      const res = await apiClient.get(url);
      setData(res?.data?.data || { user: null, channels: [] });
    } catch (err) {
      toast.error(err?.message || "Failed to load channel configuration");
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const boundCount = useMemo(
    () => data.channels.filter((c) => c.bound).length,
    [data.channels]
  );
  const activeCount = useMemo(
    () => data.channels.filter((c) => c.bound && c.binding?.enabled).length,
    [data.channels]
  );

  const openEditor = (channel, provider) => {
    const existing = channel.binding;
    const schema = provider?.credentialSchema || [];
    const stored = existing?.credentials || {};

    // Seed the form with what is stored; masked secrets stay masked so the
    // backend knows they were not changed.
    const credentials = {};
    schema.forEach((f) => {
      const value = stored[f.name];
      credentials[f.name] = value === undefined || value === null ? "" : value;
    });

    setReveal({});
    setEditing({
      channel: channel.channel,
      channelName: channel.name,
      providerCode: provider?.code || existing?.provider || "",
      providerName: provider?.name || "",
      schema,
      credentials,
      options: { ...(provider?.defaultOptions || {}), ...(existing?.options || {}) },
      rateLimitPerMinute: existing?.rateLimitPerMinute || 0,
      dailyLimit: existing?.dailyLimit || 0,
      notes: existing?.notes || "",
    });
  };

  const setCredential = (name, value) =>
    setEditing((prev) => ({
      ...prev,
      credentials: { ...prev.credentials, [name]: value },
    }));

  const saveBinding = async () => {
    if (!editing?.providerCode) {
      toast.warning("Select a provider first");
      return;
    }

    // Only send fields the schema declares, so masked/unknown keys are dropped.
    const payload = {};
    editing.schema.forEach((f) => {
      const v = editing.credentials[f.name];
      if (v !== undefined && v !== null) payload[f.name] = v;
    });

    try {
      setSaving(true);
      const res = await apiClient.post("/user-channels", {
        userId: userId || undefined,
        channel: editing.channel,
        provider: editing.providerCode,
        credentials: payload,
        options: editing.options,
        rateLimitPerMinute: editing.rateLimitPerMinute,
        dailyLimit: editing.dailyLimit,
        notes: editing.notes,
      });
      toast.success(res?.data?.message || "Channel configured");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to save channel configuration");
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = async (channel) => {
    try {
      const res = await apiClient.patch(
        `/user-channels/${channel.channel}/toggle`,
        { userId: userId || undefined, enabled: !channel.binding?.enabled }
      );
      toast.success(res?.data?.message || "Channel updated");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to toggle channel");
    }
  };

  const removeChannel = async (channel) => {
    if (!window.confirm(`Remove the ${channel.name} configuration and its stored credentials?`)) return;
    try {
      const res = await apiClient.delete(`/user-channels/${channel.channel}`, {
        params: { userId: userId || undefined },
      });
      toast.success(res?.data?.message || "Channel removed");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to remove channel");
    }
  };

  if (loading && !data.channels.length) return <PageLoader />;

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaPlug className="text-primary" /> Channels &amp; APIs
          </h4>
          <small className="text-muted">
            {data.user ? `Configuration for ${data.user.name} (${data.user.email})` : "Your configuration"}
            {boundCount > 0 && ` — ${boundCount} configured, ${activeCount} active`}
          </small>
        </div>
        <Button color="light" size="sm" onClick={load} disabled={loading}>
          <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
        </Button>
      </div>

      {data.channels.length === 0 && !loading ? (
        <Alert color="warning">
          No channels are registered yet. An administrator can add them under
          <strong> Settings → Channels</strong>.
        </Alert>
      ) : (
        <Row className="g-3">
          {data.channels.map((channel) => {
            const Icon = resolveIcon(channel.icon);
            const bound = channel.bound;
            const binding = channel.binding;

            return (
              <Col key={channel.channel} xs={12} md={6} xl={4}>
                <Card className="h-100 shadow-sm border-0">
                  <CardHeader className="bg-white d-flex align-items-center justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2 min-w-0">
                      <span
                        className="rounded d-inline-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 34, height: 34, background: "#2271b115" }}
                      >
                        <Icon className="text-primary" />
                      </span>
                      <div className="text-truncate">
                        <div className="fw-semibold text-truncate">{channel.name}</div>
                        <small className="text-muted">{CATEGORY_LABELS[channel.category] || channel.category}</small>
                      </div>
                    </div>
                    {bound ? (
                      binding.enabled ? (
                        <Badge color="success">Active</Badge>
                      ) : (
                        <Badge color="secondary">Disabled</Badge>
                      )
                    ) : (
                      <Badge color="light" className="text-muted">Not configured</Badge>
                    )}
                  </CardHeader>

                  <CardBody className="d-flex flex-column">
                    {channel.description && (
                      <p className="small text-muted mb-2">{channel.description}</p>
                    )}

                    {bound ? (
                      <>
                        <div className="border rounded p-2 mb-2 small">
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Provider</span>
                            <span className="fw-semibold text-end">{binding.providerName}</span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Status</span>
                            <span className="fw-semibold">{binding.status}</span>
                          </div>
                          {Number(binding.rateLimitPerMinute) > 0 && (
                            <div className="d-flex justify-content-between">
                              <span className="text-muted">Rate limit</span>
                              <span className="fw-semibold">{binding.rateLimitPerMinute}/min</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-auto d-flex gap-2">
                          <Button
                            color="primary" outline size="sm" className="flex-grow-1"
                            disabled={readOnly}
                            onClick={() => openEditor(channel, channel.availableProviders.find((p) => p.code === binding.provider))}
                          >
                            Edit
                          </Button>
                          <Button
                            color="light" size="sm"
                            disabled={readOnly}
                            onClick={() => toggleChannel(channel)}
                            className="adm-icon-btn is-success"
                            data-tt={binding.enabled ? "Disable" : "Enable"}
                          >
                            {binding.enabled ? <FaToggleOn className="text-success" /> : <FaToggleOff className="text-muted" />}
                          </Button>
                          <Button
                            color="light" size="sm"
                            disabled={readOnly}
                            onClick={() => removeChannel(channel)}
                            className="adm-icon-btn is-danger"
                            data-tt="Remove configuration"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-auto">
                        {channel.availableProviders.length === 0 ? (
                          <Alert color="light" className="small mb-0 py-2">
                            <FaExclamationTriangle className="me-1 text-warning" />
                            No provider API is registered for this channel.
                          </Alert>
                        ) : (
                          <>
                            <small className="text-muted d-block mb-1">
                              {channel.availableProviders.length} provider
                              {channel.availableProviders.length > 1 ? "s" : ""} available
                            </small>
                            <Button
                              color="primary" size="sm" className="w-100"
                              disabled={readOnly}
                              onClick={() => openEditor(channel, channel.availableProviders[0])}
                            >
                              Configure
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* ── Provider / credential editor ── */}
      <Modal isOpen={!!editing} toggle={() => setEditing(null)} size="lg" backdrop="static">
        {editing && (
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              saveBinding();
            }}
          >
            <ModalHeader toggle={() => setEditing(null)}>
              {editing.channelName} — Configure API
            </ModalHeader>
            <ModalBody>
              {editing.schema.length === 0 ? (
                <Alert color="info" className="small">
                  This provider needs no credentials.
                </Alert>
              ) : (
                <Row className="g-3">
                  {editing.schema.map((field) => {
                    const value = editing.credentials[field.name] ?? "";
                    const isSecret = !!field.secret;
                    // The backend returns an unchanged secret as "•" + suffix,
                    // so we can tell "still stored" from "never set".
                    const isStoredSecret =
                      isSecret && /^•+.{0,4}$/.test(String(value));

                    return (
                      <Col key={field.name} md={field.type === "textarea" ? 12 : 6}>
                        <FormGroup>
                          <Label className="small fw-semibold">
                            {field.label || field.name}
                            {field.required && <span className="text-danger"> *</span>}
                          </Label>
                          <div className="d-flex gap-2">
                            {field.type === "select" ? (
                              <Input
                                type="select"
                                value={value}
                                onChange={(e) => setCredential(field.name, e.target.value)}
                              >
                                <option value="">-- Select --</option>
                                {(field.options || []).map((o) => (
                                  <option key={o} value={o}>{o}</option>
                                ))}
                              </Input>
                            ) : field.type === "textarea" ? (
                              <Input
                                type="textarea"
                                rows={4}
                                value={value}
                                onChange={(e) => setCredential(field.name, e.target.value)}
                              />
                            ) : field.type === "boolean" ? (
                              <FormGroup check className="mt-2">
                                <Input
                                  type="switch"
                                  checked={value === true || value === "true"}
                                  onChange={(e) => setCredential(field.name, e.target.checked)}
                                />
                              </FormGroup>
                            ) : (
                              <>
                                <Input
                                  type={
                                    isSecret && !reveal[field.name] ? "password" : field.type || "text"
                                  }
                                  value={value}
                                  placeholder={field.placeholder || ""}
                                  autoComplete="off"
                                  onChange={(e) => setCredential(field.name, e.target.value)}
                                />
                                {isSecret && (
                                  <Button
                                    color="light" type="button"
                                    onClick={() =>
                                      setReveal((prev) => ({ ...prev, [field.name]: !prev[field.name] }))
                                    }
                                  >
                                    {reveal[field.name] ? <FaEyeSlash /> : <FaEye />}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                          {field.helpText && (
                            <small className="text-muted">{field.helpText}</small>
                          )}
                          {isStoredSecret && (
                            <small className="text-muted">
                              <FaCheckCircle className="me-1 text-success" />
                              Stored — leave unchanged to keep it
                            </small>
                          )}
                        </FormGroup>
                      </Col>
                    );
                  })}
                </Row>
              )}

              <hr />
              <Row className="g-2">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Rate limit (per minute)</Label>
                    <Input
                      type="number" min="0"
                      value={editing.rateLimitPerMinute}
                      onChange={(e) =>
                        setEditing((p) => ({ ...p, rateLimitPerMinute: e.target.value }))
                      }
                    />
                    <small className="text-muted">0 = unlimited</small>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Daily limit</Label>
                    <Input
                      type="number" min="0"
                      value={editing.dailyLimit}
                      onChange={(e) => setEditing((p) => ({ ...p, dailyLimit: e.target.value }))}
                    />
                    <small className="text-muted">0 = unlimited</small>
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <FormGroup>
                    <Label className="small fw-semibold">Notes</Label>
                    <Input
                      value={editing.notes}
                      onChange={(e) => setEditing((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Optional note"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={saving || readOnly}>
                {saving ? <Spinner size="sm" /> : <FaSave className="me-1" />} Save
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default UserChannelsConfig;
