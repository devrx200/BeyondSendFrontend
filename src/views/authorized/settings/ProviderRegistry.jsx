import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Badge, Row, Col,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label,
  Input, Spinner, Alert, UncontrolledDropdown, DropdownToggle,
  DropdownMenu, DropdownItem,
} from "reactstrap";
import { FaPlug, FaPlus, FaEdit, FaTrash, FaSyncAlt, FaToggleOn, FaToggleOff, FaExternalLinkAlt, FaEllipsisV } from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

const AUTH_TYPES = ["api_key", "basic", "oauth2", "bearer", "custom"];
const FIELD_TYPES = ["text", "password", "number", "url", "select", "textarea", "boolean"];

const emptyProvider = () => ({
  code: "",
  name: "",
  description: "",
  channels: [],
  authType: "api_key",
  baseUrl: "",
  docsUrl: "",
  credentialSchema: [],
  defaultOptions: "{}",
  priority: 100,
  supportsFailover: false,
  isActive: true,
});

const CredentialFieldEditor = ({ value = [], onChange }) => {
  const update = (idx, patch) => onChange(value.map((f, i) => (i === idx ? { ...f, ...patch } : f)));

  return (
    <div>
      {value.map((field, idx) => (
        <div key={idx} className="border rounded p-2 mb-2">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Label className="small mb-1">Name</Label>
              <Input size="sm" value={field.name || ""} onChange={(e) => update(idx, { name: e.target.value })} />
            </Col>
            <Col md={3}>
              <Label className="small mb-1">Label</Label>
              <Input size="sm" value={field.label || ""} onChange={(e) => update(idx, { label: e.target.value })} />
            </Col>
            <Col md={2}>
              <Label className="small mb-1">Type</Label>
              <Input
                size="sm" type="select" value={field.type || "text"}
                onChange={(e) => update(idx, { type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Input>
            </Col>
            <Col md={2}>
              <Label className="small mb-1">Placeholder</Label>
              <Input size="sm" value={field.placeholder || ""} onChange={(e) => update(idx, { placeholder: e.target.value })} />
            </Col>
            <Col md={2} className="d-flex gap-3 align-items-center pb-1">
              <FormGroup check className="mb-0">
                <Input type="checkbox" checked={!!field.required} onChange={(e) => update(idx, { required: e.target.checked })} />
                <Label className="small mb-0" check>Req</Label>
              </FormGroup>
              <FormGroup check className="mb-0">
                <Input type="checkbox" checked={!!field.secret} onChange={(e) => update(idx, { secret: e.target.checked })} />
                <Label className="small mb-0" check>Secret</Label>
              </FormGroup>
              <Button color="danger" outline size="sm" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
                <FaTrash />
              </Button>
            </Col>
            <Col xs={12}>
              <Input
                size="sm" placeholder="Help text shown under the field"
                value={field.helpText || ""}
                onChange={(e) => update(idx, { helpText: e.target.value })}
              />
            </Col>
          </Row>
        </div>
      ))}
      <Button
        color="light" size="sm"
        onClick={() => onChange([...value, { name: "", label: "", type: "text", required: false, secret: true, helpText: "", options: [] }])}
      >
        <FaPlus /> Add credential field
      </Button>
    </div>
  );
};

/** Provider (vendor API) registry administration. */
const ProviderRegistry = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState([]);
  const [channels, setChannels] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        apiClient.get("/registry/providers/all"),
        apiClient.get("/registry/channels/all"),
      ]);
      const provList = Array.isArray(pRes?.data)
        ? pRes.data
        : Array.isArray(pRes?.data?.data)
        ? pRes.data.data
        : Array.isArray(pRes)
        ? pRes
        : [];
      const chanList = Array.isArray(cRes?.data)
        ? cRes.data
        : Array.isArray(cRes?.data?.data)
        ? cRes.data.data
        : Array.isArray(cRes)
        ? cRes
        : [];
      setProviders(provList);
      setChannels(chanList);
    } catch (err) {
      toast.error(err?.message || "Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setIsNew(true);
    setEditing(emptyProvider());
  };

  const openEdit = (p) => {
    setIsNew(false);
    setEditing({
      ...p,
      credentialSchema: p.credentialSchema || [],
      defaultOptions: JSON.stringify(p.defaultOptions || {}, null, 2),
    });
  };

  const save = async () => {
    let defaultOptions = {};
    if (editing.defaultOptions) {
      try {
        defaultOptions = JSON.parse(editing.defaultOptions);
      } catch {
        toast.error("Default options must be valid JSON");
        return;
      }
    }

    const payload = {
      name: editing.name,
      description: editing.description,
      channels: editing.channels,
      authType: editing.authType,
      baseUrl: editing.baseUrl,
      docsUrl: editing.docsUrl,
      credentialSchema: editing.credentialSchema,
      defaultOptions,
      priority: Number(editing.priority) || 0,
      supportsFailover: !!editing.supportsFailover,
      isActive: editing.isActive,
    };

    try {
      setSaving(true);
      const res = isNew
        ? await apiClient.post("/registry/providers", { ...payload, code: editing.code })
        : await apiClient.put(`/registry/providers/${editing.code}`, payload);
      toast.success(res?.data?.message || "Provider saved");
      setEditing(null);
      await load();
    } catch (err) {
      const errors = err?.response?.data?.errors;
      toast.error(
        Array.isArray(errors) && errors.length ? errors.join("; ") : err?.message || "Failed to save provider"
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Provider?",
      `Are you sure you want to delete provider <strong>${p.code}</strong>?`
    );
    if (!isConfirmed) return;
    try {
      const res = await apiClient.delete(`/registry/providers/${p.code}`);
      toast.success(res?.data?.message || "Provider deleted");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to delete provider");
    }
  };

  const toggle = async (p) => {
    try {
      const res = await apiClient.put(`/registry/providers/${p.code}`, {
        ...p,
        defaultOptions: p.defaultOptions || {},
        isActive: !p.isActive,
      });
      toast.success(res?.data?.message || "Provider updated");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update provider");
    }
  };

  const set = (key, value) => setEditing((p) => ({ ...p, [key]: value }));
  const toggleChannel = (code) =>
    setEditing((p) => ({
      ...p,
      channels: p.channels.includes(code)
        ? p.channels.filter((c) => c !== code)
        : [...p.channels, code],
    }));

  if (loading && !providers.length) return <PageLoader />;

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaPlug className="text-primary" /> Provider APIs
          </h4>
          <small className="text-muted">
            Vendor APIs a user can bind. The credential form is generated from these definitions.
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={load} disabled={loading}>
            <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          <Button color="primary" size="sm" onClick={openNew}>
            <FaPlus className="me-1" /> New provider
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardBody className="p-0">
          {providers.length === 0 ? (
            <Alert color="info" className="m-3">No providers registered yet.</Alert>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Channels</th>
                  <th>Auth</th>
                  <th>Fields</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p) => (
                  <tr key={p.code}>
                    <td>
                      <div className="fw-semibold">{p.name}</div>
                      <small className="text-muted">{p.code}</small>
                    </td>
                    <td>
                      {(p.channels || []).map((c) => (
                        <Badge key={c} color="light" className="text-dark border me-1">{c}</Badge>
                      ))}
                    </td>
                    <td><code className="small">{p.authType}</code></td>
                    <td><small className="text-muted">{(p.credentialSchema || []).length}</small></td>
                    <td><small>{p.priority}</small></td>
                    <td>
                      {p.isActive
                        ? <Badge color="success">Active</Badge>
                        : <Badge color="secondary">Inactive</Badge>}
                      {p.supportsFailover && <Badge color="warning" className="ms-1">Failover</Badge>}
                    </td>
                    <td className="text-end">
                      <UncontrolledDropdown>
                        <DropdownToggle color="light" size="sm" className="adm-icon-btn" data-tt="Provider Actions">
                          <FaEllipsisV />
                        </DropdownToggle>
                        <DropdownMenu end>
                          <DropdownItem onClick={() => openEdit(p)}><FaEdit className="me-2" />Edit</DropdownItem>
                          {p.docsUrl && (
                            <DropdownItem tag="a" href={p.docsUrl} target="_blank" rel="noreferrer">
                              <FaExternalLinkAlt className="me-2" />Documentation
                            </DropdownItem>
                          )}
                          <DropdownItem onClick={() => toggle(p)}>
                            {p.isActive ? <FaToggleOff className="me-2" /> : <FaToggleOn className="me-2" />}
                            {p.isActive ? "Deactivate" : "Activate"}
                          </DropdownItem>
                          <DropdownItem divider />
                          <DropdownItem className="text-danger" onClick={() => remove(p)}>
                            <FaTrash className="me-2" />Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={!!editing} toggle={() => setEditing(null)} size="lg">
        {editing && (
          <Form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <ModalHeader toggle={() => setEditing(null)}>
              {isNew ? "Register provider" : `Edit ${editing.code}`}
            </ModalHeader>
            <ModalBody>
              <Row className="g-3">
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Code <span className="text-danger">*</span></Label>
                    <Input
                      value={editing.code} disabled={!isNew} placeholder="TWILIO"
                      onChange={(e) => set("code", e.target.value.toUpperCase())}
                    />
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
                <Col xs={12}>
                  <Label className="small fw-semibold">Channels served <span className="text-danger">*</span></Label>
                  <div className="d-flex flex-wrap gap-3 border rounded p-2">
                    {channels.map((c) => (
                      <FormGroup check key={c.code} className="mb-0">
                        <Input
                          type="checkbox" checked={editing.channels.includes(c.code)}
                          onChange={() => toggleChannel(c.code)}
                        />
                        <Label className="small mb-0" check>{c.code}</Label>
                      </FormGroup>
                    ))}
                    {channels.length === 0 && <small className="text-muted">Register a channel first.</small>}
                  </div>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-semibold">Auth type</Label>
                    <Input
                      type="select" value={editing.authType}
                      onChange={(e) => set("authType", e.target.value)}
                    >
                      {AUTH_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={4}>
                  <FormGroup>
                    <Label className="small fw-semibold">Priority</Label>
                    <Input
                      type="number" value={editing.priority}
                      onChange={(e) => set("priority", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col md={4} className="d-flex align-items-end pb-2">
                  <FormGroup check className="mb-0">
                    <Input
                      type="switch" checked={!!editing.supportsFailover}
                      onChange={(e) => set("supportsFailover", e.target.checked)}
                    />
                    <Label className="small mb-0" check>Failover</Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Base URL</Label>
                    <Input value={editing.baseUrl || ""} placeholder="https://api.vendor.com" onChange={(e) => set("baseUrl", e.target.value)} />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className="small fw-semibold">Docs URL</Label>
                    <Input value={editing.docsUrl || ""} onChange={(e) => set("docsUrl", e.target.value)} />
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <FormGroup>
                    <Label className="small fw-semibold">Default options (JSON)</Label>
                    <Input
                      type="textarea" rows={3} className="font-monospace"
                      value={editing.defaultOptions || "{}"}
                      onChange={(e) => set("defaultOptions", e.target.value)}
                    />
                  </FormGroup>
                </Col>
                <Col xs={12}>
                  <Label className="small fw-semibold">Credential schema</Label>
                  <CredentialFieldEditor
                    value={editing.credentialSchema || []}
                    onChange={(v) => set("credentialSchema", v)}
                  />
                </Col>
                <Col xs={12}>
                  <FormGroup check>
                    <Input type="switch" checked={!!editing.isActive} onChange={(e) => set("isActive", e.target.checked)} />
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

export default ProviderRegistry;
