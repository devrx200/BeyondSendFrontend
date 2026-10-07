import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Row, Col, Nav, NavItem, NavLink,
  Form, FormGroup, Label, Input, Spinner, Alert, Badge,
} from "reactstrap";
import {
  FaSlidersH, FaSave, FaUndo, FaSyncAlt, FaBell, FaPalette, FaBuilding, FaShieldAlt, FaGlobe,
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

const DATE_FORMATS = ["DD-MM-YYYY", "YYYY-MM-DD", "MM/DD/YYYY"];

const NOTIFICATION_FIELDS = [
  ["email", "Email notifications"],
  ["sms", "SMS notifications"],
  ["inApp", "In-app notifications"],
  ["creditThreshold", "Credit threshold alerts"],
  ["notifyLowCredits", "Low credit warnings"],
  ["notifyCampaignComplete", "Campaign completed"],
  ["notifyDeliveryFailure", "Delivery failures"],
];

const BRANDING_FIELDS = [
  ["brandName", "Brand name", "text"],
  ["logoUrl", "Logo URL", "url"],
  ["primaryColor", "Primary colour (hex)", "text"],
  ["supportEmail", "Support email", "email"],
  ["supportPhone", "Support phone", "tel"],
];

const COMPANY_FIELDS = [
  ["legalName", "Legal name", "text"],
  ["gstin", "GSTIN", "text"],
  ["pan", "PAN", "text"],
  ["website", "Website", "url"],
  ["addressLine", "Address", "text"],
  ["city", "City", "text"],
  ["state", "State", "text"],
  ["country", "Country", "text"],
  ["pincode", "PIN code", "text"],
];

const emptyForm = () => ({
  locale: "en",
  timezone: "Asia/Kolkata",
  dateFormat: "DD-MM-YYYY",
  twoFactorEnabled: false,
  loginAlerts: true,
  maxConcurrentSessions: 5,
  sessionTimeoutMinutes: 60,
  defaultScheduleTimezone: "Asia/Kolkata",
  respectQuietHours: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  defaultBatchSize: 500,
  notifications: {},
  branding: {},
  company: {},
});

/** Per-user preferences, branding and security settings. */
const UserSettings = ({ userId = null, readOnly = false }) => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("general");
  const [timezones, setTimezones] = useState([]);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = userId ? `/user-settings/${userId}` : "/user-settings";
      const res = await apiClient.get(url);
      const payload = res?.data?.data || {};
      setTimezones(payload.supportedTimezones || []);
      setUser(payload.user || null);

      const current = payload.settings || {};
      setForm({
        ...emptyForm(),
        ...current,
        notifications: { ...(current.notifications || {}) },
        branding: { ...(current.branding || {}) },
        company: { ...(current.company || {}) },
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const setTop = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setGroup = (group, key, value) =>
    setForm((p) => ({ ...p, [group]: { ...p[group], [key]: value } }));

  const save = async () => {
    try {
      setSaving(true);
      const res = await apiClient.put("/user-settings", {
        userId: userId || undefined,
        ...form,
      });
      toast.success(res?.data?.message || "Settings saved");
      await load();
    } catch (err) {
      const errors = err?.response?.data?.errors;
      toast.error(
        Array.isArray(errors) && errors.length
          ? errors.join("; ")
          : err?.message || "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm("Reset all settings back to their defaults? This cannot be undone.")) return;
    try {
      setSaving(true);
      const res = await apiClient.post("/user-settings/reset", { userId: userId || undefined });
      toast.success(res?.data?.message || "Settings reset to defaults");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const tabs = [
    { id: "general", label: "General", icon: FaGlobe },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "branding", label: "Branding", icon: FaPalette },
    { id: "company", label: "Company", icon: FaBuilding },
    { id: "security", label: "Security", icon: FaShieldAlt },
  ];

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaSlidersH className="text-primary" /> My Settings
          </h4>
          <small className="text-muted">
            {user ? `${user.name} (${user.email})` : "Your personal preferences"}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={load} disabled={loading}>
            <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          <Button color="danger" outline size="sm" onClick={reset} disabled={saving || readOnly}>
            <FaUndo /> Reset defaults
          </Button>
          <Button color="success" size="sm" onClick={save} disabled={saving || readOnly}>
            {saving ? <Spinner size="sm" /> : <FaSave className="me-1" />} Save
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardHeader className="bg-white px-0 pt-0">
          <Nav tabs card>
            {tabs.map((t) => (
              <NavItem key={t.id}>
                <NavLink
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className="d-flex align-items-center gap-1"
                >
                  <t.icon /> {t.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </CardHeader>

        <CardBody>
          {tab === "general" && (
            <Row className="g-3">
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Language</Label>
                  <Input
                    type="select" value={form.locale} disabled={readOnly}
                    onChange={(e) => setTop("locale", e.target.value)}
                  >
                    {LOCALES.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Timezone</Label>
                  <Input
                    type="select" value={form.timezone} disabled={readOnly}
                    onChange={(e) => setTop("timezone", e.target.value)}
                  >
                    {(timezones.length ? timezones : ["Asia/Kolkata"]).map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Date format</Label>
                  <Input
                    type="select" value={form.dateFormat} disabled={readOnly}
                    onChange={(e) => setTop("dateFormat", e.target.value)}
                  >
                    {DATE_FORMATS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Default schedule timezone</Label>
                  <Input
                    type="select" value={form.defaultScheduleTimezone} disabled={readOnly}
                    onChange={(e) => setTop("defaultScheduleTimezone", e.target.value)}
                  >
                    {(timezones.length ? timezones : [form.defaultScheduleTimezone]).map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Default campaign batch size</Label>
                  <Input
                    type="number" min="1" value={form.defaultBatchSize} disabled={readOnly}
                    onChange={(e) => setTop("defaultBatchSize", Number(e.target.value))}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          {tab === "notifications" && (
            <Row className="g-3">
              {NOTIFICATION_FIELDS.map(([key, label]) => (
                <Col md={6} key={key}>
                  <FormGroup check>
                    <Input
                      type="checkbox" id={`n-${key}`} disabled={readOnly}
                      checked={!!form.notifications?.[key]}
                      onChange={(e) => setGroup("notifications", key, e.target.checked)}
                    />
                    <Label className="small mb-0" for={`n-${key}`} check>{label}</Label>
                  </FormGroup>
                </Col>
              ))}
              <Col xs={12}>
                <hr className="my-2" />
                <FormGroup check>
                  <Input
                    type="checkbox" id="res-quiet" disabled={readOnly}
                    checked={!!form.respectQuietHours}
                    onChange={(e) => setTop("respectQuietHours", e.target.checked)}
                  />
                  <Label className="small mb-0" for="res-quiet" check>
                    Respect quiet hours (pause sends outside this window)
                  </Label>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Quiet hours start</Label>
                  <Input
                    type="time" value={form.quietHoursStart} disabled={readOnly || !form.respectQuietHours}
                    onChange={(e) => setTop("quietHoursStart", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Quiet hours end</Label>
                  <Input
                    type="time" value={form.quietHoursEnd} disabled={readOnly || !form.respectQuietHours}
                    onChange={(e) => setTop("quietHoursEnd", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          )}

          {tab === "branding" && (
            <Row className="g-3">
              {BRANDING_FIELDS.map(([key, label, type]) => (
                <Col md={6} key={key}>
                  <FormGroup>
                    <Label className="small fw-semibold">{label}</Label>
                    <Input
                      type={type} value={form.branding?.[key] ?? ""} disabled={readOnly}
                      onChange={(e) => setGroup("branding", key, e.target.value)}
                    />
                  </FormGroup>
                </Col>
              ))}
              {form.branding?.primaryColor && (
                <Col xs={12}>
                  <Badge color="light" className="border">
                    Preview
                    <span
                      className="ms-2 d-inline-block rounded"
                      style={{ width: 60, height: 16, background: form.branding.primaryColor }}
                    />
                  </Badge>
                </Col>
              )}
            </Row>
          )}

          {tab === "company" && (
            <Row className="g-3">
              {COMPANY_FIELDS.map(([key, label, type]) => (
                <Col md={6} key={key}>
                  <FormGroup>
                    <Label className="small fw-semibold">{label}</Label>
                    <Input
                      type={type} value={form.company?.[key] ?? ""} disabled={readOnly}
                      onChange={(e) => setGroup("company", key, e.target.value)}
                    />
                  </FormGroup>
                </Col>
              ))}
            </Row>
          )}

          {tab === "security" && (
            <Row className="g-3">
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Maximum concurrent sessions</Label>
                  <Input
                    type="number" min="1" max="50" value={form.maxConcurrentSessions} disabled={readOnly}
                    onChange={(e) => setTop("maxConcurrentSessions", Number(e.target.value))}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="small fw-semibold">Session timeout (minutes)</Label>
                  <Input
                    type="number" min="5" value={form.sessionTimeoutMinutes} disabled={readOnly}
                    onChange={(e) => setTop("sessionTimeoutMinutes", Number(e.target.value))}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup check>
                  <Input
                    type="switch" id="s-2fa" disabled={readOnly}
                    checked={!!form.twoFactorEnabled}
                    onChange={(e) => setTop("twoFactorEnabled", e.target.checked)}
                  />
                  <Label className="small mb-0" for="s-2fa" check>
                    Two-factor authentication
                  </Label>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup check>
                  <Input
                    type="checkbox" id="s-alerts" disabled={readOnly}
                    checked={!!form.loginAlerts}
                    onChange={(e) => setTop("loginAlerts", e.target.checked)}
                  />
                  <Label className="small mb-0" for="s-alerts" check>
                    Email me on new sign-in
                  </Label>
                </FormGroup>
              </Col>
              <Col xs={12}>
                <Alert color="light" className="small mb-0">
                  Sessions and activity logs are managed under{" "}
                  <strong>System &amp; Security → User Sessions</strong> by an administrator.
                </Alert>
              </Col>
            </Row>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default UserSettings;
