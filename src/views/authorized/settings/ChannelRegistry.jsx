import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Badge, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label,
  Input, Spinner, Alert, UncontrolledDropdown, DropdownToggle,
  DropdownMenu, DropdownItem,
} from "reactstrap";
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaSyncAlt, FaToggleOn, FaToggleOff, FaEllipsisV } from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";
import { ICON_MAP } from "@/config/menu/authorizedMenu";

const CATEGORIES = ["MESSAGING", "TELEPHONY", "ENGAGEMENT", "CUSTOM"];
const FIELD_TYPES = ["text", "password", "number", "url", "select", "textarea", "boolean"];

const emptyChannel = () => ({
  code: "",
  name: "",
  description: "",
  icon: "FaBullhorn",
  category: "MESSAGING",
  creditKey: "",
  isCreditMetered: true,
  capabilities: "{}",
  configSchema: [],
  isActive: true,
  sortOrder: 100,
});

const FieldEditor = ({ value = [], onChange }) => {
  const update = (idx, patch) => {
    const next = value.map((f, i) => (i === idx ? { ...f, ...patch } : f));
    onChange(next);
  };

  return (
    <div>
      {value.map((field, idx) => (
        <div key={idx} className="border rounded p-2 mb-2">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Label className="small mb-1">Name</Label>
              <Input
                size="sm" value={field.name || ""}
                onChange={(e) => update(idx, { name: e.target.value })}
              />
            </Col>
            <Col md={3}>
              <Label className="small mb-1">Label</Label>
              <Input
                size="sm" value={field.label || ""}
                onChange={(e) => update(idx, { label: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Label className="small mb-1">Type</Label>
              <Input
                size="sm" type="select" value={field.type || "text"}
                onChange={(e) => update(idx, { type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Input>
            </Col>
            <Col md={2}>
              <Label className="small mb-1">Options (comma)</Label>
              <Input
                size="sm"
                value={(field.options || []).join(",")}
                onChange={(e) =>
                  update(idx, {
                    options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </Col>
            <Col md={2} className="d-flex gap-3 align-items-center pb-1">
              <FormGroup check className="mb-0">
                <Input
                  type="checkbox" checked={!!field.required}
                  onChange={(e) => update(idx, { required: e.target.checked })}
                />
                <Label className="small mb-0" check>Required</Label>
              </FormGroup>
              <FormGroup check className="mb-0">
                <Input
                  type="checkbox" checked={!!field.secret}
                  onChange={(e) => update(idx, { secret: e.target.checked })}
                />
                <Label className="small mb-0" check>Secret</Label>
              </FormGroup>
              <Button color="danger" outline size="sm" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
                <FaTrash />
              </Button>
            </Col>
          </Row>
        </div>
      ))}
      <Button
        color="light" size="sm"
        onClick={() => onChange([...value, { name: "", label: "", type: "text", required: false, secret: false, options: [] }])}
      >
        <FaPlus /> Add field
      </Button>
    </div>
  );
};

/** Channel registry administration — channels are data, not code. */
const ChannelRegistry = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/registry/channels/all");
      setChannels(res?.data?.data || []);
    } catch (err) {
      toast.error(err?.message || "Failed to load channels");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setIsNew(true);
    setEditing(emptyChannel());
  };

  const openEdit = (channel) => {
    setIsNew(false);
    setEditing({
      ...channel,
      capabilities: JSON.stringify(channel.capabilities || {}, null, 2),
      configSchema: channel.configSchema || [],
    });
  };

  const save = async () => {
    let capabilities = {};
    if (editing.capabilities) {
      try {
        capabilities = JSON.parse(editing.capabilities);
      } catch {
        toast.error("Capabilities must be valid JSON");
        return;
      }
    }

    const payload = {
      name: editing.name,
      description: editing.description,
      icon: editing.icon,
      category: editing.category,
      creditKey: editing.creditKey,
      isCreditMetered: editing.isCreditMetered,
      capabilities,
      configSchema: editing.configSchema,
      isActive: editing.isActive,
      sortOrder: Number(editing.sortOrder) || 0,
    };

    try {
      setSaving(true);
      const res = isNew
        ? await apiClient.post("/registry/channels", { ...payload, code: editing.code })
        : await apiClient.put(`/registry/channels/${editing.code}`, payload);
      toast.success(res?.data?.message || "Channel saved");
      setEditing(null);
      await load();
    } catch (err) {
      const errors = err?.response?.data?.errors;
      toast.error(
        Array.isArray(errors) && errors.length
          ? errors.join("; ")
          : err?.message || "Failed to save channel"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (channel) => {
    if (!window.confirm(`Delete channel ${channel.code}? Users bound to it will lose the configuration.`)) return;
    try {
      const res = await apiClient.delete(`/registry/channels/${channel.code}`);
      toast.success(res?.data?.message || "Channel deleted");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to delete channel");
    }
  };

  const toggle = async (channel) => {
    try {
      const res = await apiClient.put(`/registry/channels/${channel.code}`, {
        ...channel,
        capabilities: channel.capabilities || {},
        isActive: !channel.isActive,
      });
      toast.success(res?.data?.message || "Channel updated");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update channel");
    }
  };

  const set = (key, value) => setEditing((p) => ({ ...p, [key]: value }));

  if (loading && !channels.length) return <PageLoader />;

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaBullhorn className="text-primary" /> Channels
          </h4>
          <small className="text-muted">
            Register or retire a communication channel. {channels.length} registered.
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={load} disabled={loading}>
            <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          <Button color="primary" size="sm" onClick={openNew}>
            <FaPlus className="me-1" /> New channel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          {channels.length === 0 ? (
            <Alert color="info" className="m-3">No channels registered yet.</Alert>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Category</th>
                  <th>Credit key</th>
                  <th>Fields</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {channels.map((c) => {
                  const Icon = ICON_MAP[c.icon] || FaBullhorn;
                  return (
                    <tr key={c.code}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Icon className="text-primary" />
                          <div>
                            <div className="fw-semibold">{c.name}</div>
                            <small className="text-muted">{c.code}</small>
                          </div>
                        </div>
                      </td>
                      <td><Badge color="light" className="text-dark border">{c.category}</Badge></td>
                      <td>
                        <code className="small">{c.creditKey || "—"}</code>
                      </td>
                      <td>
                        <small className="text-muted">
                          {(c.configSchema || []).length} field(s)
                        </small>
                      </td>
                      <td>
                        {c.isActive
                          ? <Badge color="success">Active</Badge>
                          : <Badge color="secondary">Inactive</Badge>}
                        {c.isSystem && <Badge color="info" className="ms-1">System</Badge>}
                      </td>
                      <td className="text-end">
                        <UncontrolledDropdown>
                          <DropdownToggle color="light" size="sm" className="adm-icon-btn" data-tt="Channel Actions">
                            <FaEllipsisV />
                          </DropdownToggle>
                          <DropdownMenu end>
                            <DropdownItem onClick={() => openEdit(c)}><FaEdit className="me-2" />Edit</DropdownItem>
                            <DropdownItem onClick={() => toggle(c)}>
                              {c.isActive ? <FaToggleOff className="me-2" /> : <FaToggleOn className="me-2" />}
                              {c.isActive ? "Deactivate" : "Activate"}
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem className="text-danger" onClick={() => remove(c)}>
                              <FaTrash className="me-2" />Delete
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!editing} toggle={() => setEditing(null)} size="lg">
        {editing && (
          <Form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <ModalHeader toggle={() => setEditing(null)}>
              {isNew ? "Register channel" : `Edit ${editing.code}`}
            </ModalHeader>
            <ModalBody>
              <Row className="g-3">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Code <span className="text-danger">*</span></Label>
                    <Input
                      value={editing.code} disabled={!isNew} placeholder="WHATSAPP"
                      onChange={(e) => set("code", e.target.value.toUpperCase())}
                    />
                    {isNew && <small className="text-muted">A-Z, digits and underscores. Immutable once created.</small>}
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Name <span className="text-danger">*</span></Label>
                    <Input value={editing.name} onChange={(e) => set("name", e.target.value)} />
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <FormGroup>
                    <Label className="small fw-semibold">Description</Label>
                    <Input
                      type="textarea" rows={2} value={editing.description || ""}
                      onChange={(e) => set("description", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-semibold">Category</Label>
                    <Input
                      type="select" value={editing.category}
                      onChange={(e) => set("category", e.target.value)}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-semibold">Icon key</Label>
                    <Input
                      value={editing.icon || "FaBullhorn"}
                      onChange={(e) => set("icon", e.target.value)}
                    />
                    {ICON_MAP[editing.icon] ? (
                      <small className="text-success">Known icon</small>
                    ) : (
                      <small className="text-muted">Unknown key — FaBullhorn will be used</small>
                    )}
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-semibold">Sort order</Label>
                    <Input
                      type="number" value={editing.sortOrder}
                      onChange={(e) => set("sortOrder", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={8}>
                  <FormGroup>
                    <Label className="small fw-semibold">Credit key</Label>
                    <Input
                      value={editing.creditKey || ""} placeholder="whatsappCredits"
                      onChange={(e) => set("creditKey", e.target.value)}
                    />
                    <small className="text-muted">Field on the user document holding this channel&apos;s balance.</small>
                  </FormGroup>
                </Col>
                <Col md={4} className="d-flex align-items-end pb-2">
                  <FormGroup check className="mb-0">
                    <Input
                      type="switch" checked={!!editing.isCreditMetered}
                      onChange={(e) => set("isCreditMetered", e.target.checked)}
                    />
                    <Label className="small mb-0" check>Metered</Label>
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <FormGroup>
                    <Label className="small fw-semibold">Capabilities (JSON)</Label>
                    <Input
                      type="textarea" rows={3} className="font-monospace"
                      value={editing.capabilities || "{}"}
                      onChange={(e) => set("capabilities", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <Label className="small fw-semibold">Configuration fields</Label>
                  <FieldEditor
                    value={editing.configSchema || []}
                    onChange={(v) => set("configSchema", v)}
                  />
                </Col>
                <Col xs={12}>
                  <FormGroup check>
                    <Input
                      type="switch" checked={!!editing.isActive}
                      onChange={(e) => set("isActive", e.target.checked)}
                    />
                    <Label className="small mb-0" check>Active</Label>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>
            <ModalFooter>
              <Button color="light" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
              <Button color="success" type="submit" disabled={saving}>
                {saving ? <Spinner size="sm" /> : "Save"}
              </Button>
            </ModalFooter>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ChannelRegistry;
