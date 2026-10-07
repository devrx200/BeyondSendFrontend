import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup,
  Label, Input, Row, Col, Spinner, Alert, Badge
} from "reactstrap";
import {
  FaArrowLeft, FaSave, FaEye, FaEyeSlash, FaChevronDown,
  FaChevronUp, FaCheck, FaCogs, FaServer, FaComments,
  FaPhoneAlt, FaEnvelope, FaKey, FaShieldAlt
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

const AVAILABLE_CHANNELS = [
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "whatsapp", label: "Whatsapp" },
  { key: "rcs", label: "RCS" },
  { key: "voice", label: "Voice" },
];

const initialConfigState = {
  // RCS
  rcsVendor: "",
  rcsVendorCompany: "",
  rcsUserId: "",
  rcsPassword: "",
  jioRcsAgentId: "",
  jioRcsApiKey: "",

  // WhatsApp
  whatsappVendor: "",
  wbsUserId: "",
  wbsPassword: "",
  whatsappBrandMsisdn: "",
  phoneNumberId: "",
  wabaId: "",
  metaToken: "",

  // SMS
  smsVendor: "",
  mobiglitzSmsUsername: "",
  mobiglitzSmsPassword: "",
  mglitzSmsTransactionalRouteKey: "",
  mglitzSmsPromotionalRouteKey: "",
  mglitzSmsOtpRouteKey: "",
  mglitzSmsImplicitRouteKey: "",
  mglitzSmsExplicitRouteKey: "",
  smsDltEntityId: "",
  airtelSmsCustomerId: "",
  airtelSmsCookie: "",
  airtelSmsAuthCode: "",

  // Voice
  mglitzVoiceApiUsername: "",
  mglitzVoiceApiPassword: "",
  buzzdialCallApiKey: "",

  // SMTP Email
  emailSmtpEndpoint: "",
  emailSmtpPort: "",
  emailSmtpUsername: "",
  emailSmtpPassword: "",
};

const UserCommunicationConfig = ({ userId: propUserId = null }) => {
  const { userId: routeUserId } = useParams();
  const targetUserId = propUserId || routeUserId || "";
  const navigate = useNavigate();
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [enabledChannels, setEnabledChannels] = useState([]);
  const [formData, setFormData] = useState(initialConfigState);
  const [showSecrets, setShowSecrets] = useState({});

  // Accordion open/close states (all open by default)
  const [openSections, setOpenSections] = useState({
    channels: true,
    vendors: true,
    jio: true,
    airtel: true,
    routemobile: true,
    smtp: true,
    mobiglitzSms: true,
    voice: true,
    buzzdial: true,
    meta: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const toggleSecret = (fieldKey) => {
    setShowSecrets((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  // Load configuration
  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = targetUserId ? `/user-config/${targetUserId}` : "/user-config";
      const res = await apiClient.get(endpoint);
      const resData = res?.data?.data || res?.data || {};

      if (resData.user) {
        setTargetUser(resData.user);
      }
      if (Array.isArray(resData.enabledChannels)) {
        setEnabledChannels(resData.enabledChannels);
      }

      const cfg = resData.config || {};
      setFormData((prev) => {
        const next = { ...prev };
        Object.keys(initialConfigState).forEach((key) => {
          if (cfg[key] !== undefined && cfg[key] !== null) {
            next[key] = cfg[key];
          }
        });
        return next;
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load communication config");
    } finally {
      setLoading(false);
    }
  }, [targetUserId, toast]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChannelToggle = (channelKey) => {
    setEnabledChannels((prev) => {
      if (prev.includes(channelKey)) {
        return prev.filter((c) => c !== channelKey);
      } else {
        return [...prev, channelKey];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        userId: targetUserId || undefined,
        enabledChannels,
        ...formData,
      };

      const endpoint = targetUserId ? `/user-config/${targetUserId}` : "/user-config";
      const res = await apiClient.put(endpoint, payload);

      toast.success(res?.data?.message || "Communication configuration saved successfully!");
      if (res?.data?.data?.config) {
        const updatedCfg = res.data.data.config;
        setFormData((prev) => ({
          ...prev,
          ...updatedCfg,
        }));
      }
      if (res?.data?.data?.enabledChannels) {
        setEnabledChannels(res.data.data.enabledChannels);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="container-fluid py-3 px-md-4">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h4 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <FaCogs className="text-primary" /> Update Communication Config
          </h4>
          {targetUser ? (
            <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
              <span>Configuring for:</span>
              <strong className="text-dark">{targetUser.name}</strong>
              <Badge color="info" pill>{targetUser.role}</Badge>
              <span className="text-secondary">({targetUser.email})</span>
            </div>
          ) : (
            <span className="small text-muted">Configure telecom vendors, credentials and channels</span>
          )}
        </div>

        <Button
          outline
          color="secondary"
          size="sm"
          className="d-flex align-items-center gap-2 px-3 py-1.5 shadow-sm"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft size={12} /> Go Back
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* 1. Enabled / Disable Channels */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("channels")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Enabled / Disable Channels
            </span>
            <span className="text-muted">
              {openSections.channels ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.channels && (
            <CardBody className="py-3 px-3">
              <div className="d-flex flex-wrap align-items-center gap-4">
                {AVAILABLE_CHANNELS.map((ch) => {
                  const isChecked = enabledChannels.includes(ch.key);
                  return (
                    <div key={ch.key} className="form-check d-flex align-items-center gap-2 m-0">
                      <input
                        type="checkbox"
                        className="form-check-input mt-0"
                        id={`channel-${ch.key}`}
                        checked={isChecked}
                        onChange={() => handleChannelToggle(ch.key)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      <label
                        className="form-check-label user-select-none fw-medium text-dark"
                        htmlFor={`channel-${ch.key}`}
                        style={{ cursor: "pointer", fontSize: "14px" }}
                      >
                        {ch.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          )}
        </Card>

        {/* 2. RCS, Whatsapp and SMS Vendor Selection */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("vendors")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              RCS, Whatsapp and SMS Vendor Selection
            </span>
            <span className="text-muted">
              {openSections.vendors ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.vendors && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS Vendor</Label>
                    <Input
                      type="select"
                      value={formData.rcsVendor || ""}
                      onChange={(e) => handleInputChange("rcsVendor", e.target.value)}
                    >
                      <option value="">Select RCS Vendor</option>
                      <option value="routemobile">Routemobile</option>
                      <option value="jio">Jio</option>
                      <option value="other">Other</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS Vendor Company</Label>
                    <Input
                      type="text"
                      placeholder="e.g. InSign"
                      value={formData.rcsVendorCompany || ""}
                      onChange={(e) => handleInputChange("rcsVendorCompany", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">SMS Vendor</Label>
                    <Input
                      type="select"
                      value={formData.smsVendor || ""}
                      onChange={(e) => handleInputChange("smsVendor", e.target.value)}
                    >
                      <option value="">Select SMS Vendor</option>
                      <option value="mobiglitz">Mobiglitz</option>
                      <option value="airtel">Airtel</option>
                      <option value="other">Other</option>
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Whatsapp Vendor</Label>
                    <Input
                      type="select"
                      value={formData.whatsappVendor || ""}
                      onChange={(e) => handleInputChange("whatsappVendor", e.target.value)}
                    >
                      <option value="">Select Whatsapp Vendor</option>
                      <option value="routemobile">Routemobile</option>
                      <option value="meta">Meta</option>
                      <option value="wati">Wati</option>
                      <option value="interakt">Interakt</option>
                      <option value="other">Other</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 3. Jio Settings */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("jio")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold" style={{ fontSize: "15px", color: "#dc2626" }}>
              Jio Settings
            </span>
            <span className="text-muted">
              {openSections.jio ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.jio && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS Agent ID</Label>
                    <Input
                      type="text"
                      value={formData.jioRcsAgentId || ""}
                      onChange={(e) => handleInputChange("jioRcsAgentId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS Api Key</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.jioRcsApiKey ? "text" : "password"}
                        value={formData.jioRcsApiKey || ""}
                        onChange={(e) => handleInputChange("jioRcsApiKey", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("jioRcsApiKey")}
                      >
                        {showSecrets.jioRcsApiKey ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 4. Airtel Settings */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("airtel")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold" style={{ fontSize: "15px", color: "#dc2626" }}>
              Airtel Settings
            </span>
            <span className="text-muted">
              {openSections.airtel ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.airtel && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Airtel Customer ID</Label>
                    <Input
                      type="text"
                      value={formData.airtelSmsCustomerId || ""}
                      onChange={(e) => handleInputChange("airtelSmsCustomerId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Airtel SMS Cookie</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.airtelSmsCookie ? "text" : "password"}
                        value={formData.airtelSmsCookie || ""}
                        onChange={(e) => handleInputChange("airtelSmsCookie", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("airtelSmsCookie")}
                      >
                        {showSecrets.airtelSmsCookie ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Airtel SMS Authcode</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.airtelSmsAuthCode ? "text" : "password"}
                        value={formData.airtelSmsAuthCode || ""}
                        onChange={(e) => handleInputChange("airtelSmsAuthCode", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("airtelSmsAuthCode")}
                      >
                        {showSecrets.airtelSmsAuthCode ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 5. Routemobile Settings */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("routemobile")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Routemobile Settings
            </span>
            <span className="text-muted">
              {openSections.routemobile ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.routemobile && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS User ID</Label>
                    <Input
                      type="text"
                      value={formData.rcsUserId || ""}
                      onChange={(e) => handleInputChange("rcsUserId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">RCS user password</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.rcsPassword ? "text" : "password"}
                        value={formData.rcsPassword || ""}
                        onChange={(e) => handleInputChange("rcsPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("rcsPassword")}
                      >
                        {showSecrets.rcsPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">WBS User ID</Label>
                    <Input
                      type="text"
                      value={formData.wbsUserId || ""}
                      onChange={(e) => handleInputChange("wbsUserId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">WBS user password</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.wbsPassword ? "text" : "password"}
                        value={formData.wbsPassword || ""}
                        onChange={(e) => handleInputChange("wbsPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("wbsPassword")}
                      >
                        {showSecrets.wbsPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">WBS Business Mobile Number</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 919876543210"
                      value={formData.whatsappBrandMsisdn || ""}
                      onChange={(e) => handleInputChange("whatsappBrandMsisdn", e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 6. SMTP Settings */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("smtp")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              SMTP Settings
            </span>
            <span className="text-muted">
              {openSections.smtp ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.smtp && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">SMTP Server Endpoint</Label>
                    <Input
                      type="text"
                      placeholder="smtp.example.com"
                      value={formData.emailSmtpEndpoint || ""}
                      onChange={(e) => handleInputChange("emailSmtpEndpoint", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">SMTP Port</Label>
                    <Input
                      type="number"
                      placeholder="587"
                      value={formData.emailSmtpPort || ""}
                      onChange={(e) => handleInputChange("emailSmtpPort", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">SMTP Username</Label>
                    <Input
                      type="text"
                      value={formData.emailSmtpUsername || ""}
                      onChange={(e) => handleInputChange("emailSmtpUsername", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={3} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">SMTP password</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.emailSmtpPassword ? "text" : "password"}
                        value={formData.emailSmtpPassword || ""}
                        onChange={(e) => handleInputChange("emailSmtpPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("emailSmtpPassword")}
                      >
                        {showSecrets.emailSmtpPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 7. Mobiglitz SMS Api Keys */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("mobiglitzSms")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Mobiglitz SMS Api Keys
            </span>
            <span className="text-muted">
              {openSections.mobiglitzSms ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.mobiglitzSms && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Transactional Route Api Key</Label>
                    <Input
                      type="text"
                      value={formData.mglitzSmsTransactionalRouteKey || ""}
                      onChange={(e) => handleInputChange("mglitzSmsTransactionalRouteKey", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Promotional Route Api Key</Label>
                    <Input
                      type="text"
                      value={formData.mglitzSmsPromotionalRouteKey || ""}
                      onChange={(e) => handleInputChange("mglitzSmsPromotionalRouteKey", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">OTP Route Api Key</Label>
                    <Input
                      type="text"
                      value={formData.mglitzSmsOtpRouteKey || ""}
                      onChange={(e) => handleInputChange("mglitzSmsOtpRouteKey", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Implicit Route Api Key</Label>
                    <Input
                      type="text"
                      value={formData.mglitzSmsImplicitRouteKey || ""}
                      onChange={(e) => handleInputChange("mglitzSmsImplicitRouteKey", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Explicit Route Api Key</Label>
                    <Input
                      type="text"
                      value={formData.mglitzSmsExplicitRouteKey || ""}
                      onChange={(e) => handleInputChange("mglitzSmsExplicitRouteKey", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Mobiglitz username</Label>
                    <Input
                      type="text"
                      value={formData.mobiglitzSmsUsername || ""}
                      onChange={(e) => handleInputChange("mobiglitzSmsUsername", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Mobiglitz password</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.mobiglitzSmsPassword ? "text" : "password"}
                        value={formData.mobiglitzSmsPassword || ""}
                        onChange={(e) => handleInputChange("mobiglitzSmsPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("mobiglitzSmsPassword")}
                      >
                        {showSecrets.mobiglitzSmsPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">DLT Principal Entity ID</Label>
                    <Input
                      type="text"
                      value={formData.smsDltEntityId || ""}
                      onChange={(e) => handleInputChange("smsDltEntityId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 8. Mobiglitz Bulk Voice */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("voice")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Mobiglitz Bulk Voice
            </span>
            <span className="text-muted">
              {openSections.voice ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.voice && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Api Username</Label>
                    <Input
                      type="text"
                      value={formData.mglitzVoiceApiUsername || ""}
                      onChange={(e) => handleInputChange("mglitzVoiceApiUsername", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Api Password</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.mglitzVoiceApiPassword ? "text" : "password"}
                        value={formData.mglitzVoiceApiPassword || ""}
                        onChange={(e) => handleInputChange("mglitzVoiceApiPassword", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("mglitzVoiceApiPassword")}
                      >
                        {showSecrets.mglitzVoiceApiPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 9. Buzzdial Click2Call */}
        <Card className="shadow-sm border mb-3">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("buzzdial")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Buzzdial Click2Call
            </span>
            <span className="text-muted">
              {openSections.buzzdial ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.buzzdial && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Api Key</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.buzzdialCallApiKey ? "text" : "password"}
                        value={formData.buzzdialCallApiKey || ""}
                        onChange={(e) => handleInputChange("buzzdialCallApiKey", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("buzzdialCallApiKey")}
                      >
                        {showSecrets.buzzdialCallApiKey ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* 10. Meta Whatsapp Settings */}
        <Card className="shadow-sm border mb-4">
          <CardHeader
            className="bg-white py-2.5 px-3 d-flex justify-content-between align-items-center cursor-pointer user-select-none"
            onClick={() => toggleSection("meta")}
            style={{ cursor: "pointer" }}
          >
            <span className="fw-bold text-primary" style={{ fontSize: "15px" }}>
              Meta Whatsapp Settings
            </span>
            <span className="text-muted">
              {openSections.meta ? <FaChevronUp size={13} /> : <FaChevronDown size={13} />}
            </span>
          </CardHeader>
          {openSections.meta && (
            <CardBody className="py-3 px-3">
              <Row className="g-3">
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Phone Number ID</Label>
                    <Input
                      type="text"
                      value={formData.phoneNumberId || ""}
                      onChange={(e) => handleInputChange("phoneNumberId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">WABA ID</Label>
                    <Input
                      type="text"
                      value={formData.wabaId || ""}
                      onChange={(e) => handleInputChange("wabaId", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} sm={6}>
                  <FormGroup className="mb-0">
                    <Label className="small text-muted fw-semibold">Meta Token</Label>
                    <div className="input-group">
                      <Input
                        type={showSecrets.metaToken ? "text" : "password"}
                        value={formData.metaToken || ""}
                        onChange={(e) => handleInputChange("metaToken", e.target.value)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => toggleSecret("metaToken")}
                      >
                        {showSecrets.metaToken ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
              </Row>
            </CardBody>
          )}
        </Card>

        {/* Submit Bar */}
        <div className="d-flex align-items-center gap-3">
          <Button
            type="submit"
            color="primary"
            disabled={saving}
            className="px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
          >
            {saving ? <Spinner size="sm" /> : <FaSave />}
            Save
          </Button>
          <Button
            type="button"
            color="light"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="px-3 py-2 border"
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default UserCommunicationConfig;
