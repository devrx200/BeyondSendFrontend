import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Badge, Row, Col, Table,
  Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label,
  Input, Spinner, Alert,
} from "reactstrap";
import {
  FaSitemap, FaUserPlus, FaSyncAlt, FaChevronDown, FaChevronRight,
  FaUsers, FaCoins, FaCheckCircle, FaTimesCircle, FaKey,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

/** Roles each actor may create, mirroring the backend CREATION_MAP. */
const CREATION_MAP = {
  DEVOPS: ["ADMIN", "RESELLER", "CLIENT", "MANAGER"],
  ADMIN: ["RESELLER", "CLIENT", "MANAGER"],
  RESELLER: ["CLIENT", "MANAGER"],
  CLIENT: ["MANAGER"],
  MANAGER: [],
};

const ROLE_COLOR = {
  DEVOPS: "dark",
  ADMIN: "primary",
  RESELLER: "info",
  CLIENT: "success",
  MANAGER: "secondary",
};

const getRole = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  if (!token) return null;
  try {
    return jwtDecode(token)?.role?.toUpperCase() || null;
  } catch {
    return null;
  }
};

/** Tree node for the role hierarchy (reseller -> client -> manager). */
const TreeNode = ({ node, depth = 0 }) => {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children?.length > 0;

  return (
    <>
      <tr>
        <td style={{ paddingLeft: 12 + depth * 24 }}>
          {hasChildren ? (
            <Button color="link" size="sm" className="p-0 me-1 text-decoration-none" onClick={() => setOpen((o) => !o)}>
              {open ? <FaChevronDown /> : <FaChevronRight />}
            </Button>
          ) : (
            <span className="me-1" style={{ display: "inline-block", width: 16 }} />
          )}
          <span className="fw-semibold">{node.name}</span>
        </td>
        <td><small>{node.email}</small></td>
        <td><Badge color={ROLE_COLOR[node.role] || "light"} className="text-dark">{node.role}</Badge></td>
        <td className="text-end">
          {node.enabledChannelCount > 0 ? (
            <Badge color="success">{node.enabledChannelCount} channel(s)</Badge>
          ) : (
            <Badge color="secondary">None</Badge>
          )}
        </td>
        <td className="text-end">
          <small>{node.credits?.total ?? 0}</small>
        </td>
      </tr>
      {open &&
        (node.children || []).map((child) => (
          <TreeNode key={child._id} node={child} depth={depth + 1} />
        ))}
    </>
  );
};

/** Hierarchical user onboarding: DEVOPS -> ADMIN -> RESELLER -> CLIENT -> MANAGER. */
const Onboarding = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tree, setTree] = useState(null);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", role: "CLIENT", userDesignations: "", note: "" });

  const actorRole = getRole();
  const creatable = CREATION_MAP[actorRole] || [];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        apiClient.get("/onboarding/tree"),
        apiClient.get("/onboarding/stats"),
      ]);
      setTree(tRes?.data?.data || null);
      setStats(sRes?.data?.data || null);
    } catch (err) {
      toast.error(err?.message || "Failed to load onboarding data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showModal && creatable.length && !creatable.includes(form.role)) {
      setForm((f) => ({ ...f, role: creatable[0] }));
    }
  }, [showModal, creatable, form.role]);

  const submit = async () => {
    if (!form.name || !form.email || !form.mobile || !form.password) {
      toast.warning("Name, email, mobile and password are all required");
      return;
    }
    if (form.password.length < 8) {
      toast.warning("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      const res = await apiClient.post("/onboarding/create", form);
      toast.success(res?.data?.message || "User onboarded");
      setShowModal(false);
      setForm({ name: "", email: "", mobile: "", password: "", role: creatable[0] || "CLIENT", userDesignations: "", note: "" });
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to onboard user");
    } finally {
      setSaving(false);
    }
  };

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  if (loading && !tree) return <PageLoader />;

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaSitemap className="text-primary" /> Onboarding
          </h4>
          <small className="text-muted">
            Tenant hierarchy for your scope. A new account is always created beneath you.
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={load} disabled={loading}>
            <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          <Button
            color="primary" size="sm"
            disabled={creatable.length === 0}
            onClick={() => setShowModal(true)}
            data-tt={creatable.length === 0 ? "You cannot onboard anyone" : undefined}
          >
            <FaUserPlus className="me-1" /> Onboard user
          </Button>
        </div>
      </div>

      {stats?.byRole && (
        <Row className="g-3 mb-3">
          {Object.entries(stats.byRole).map(([role, count]) => (
            <Col xs={6} md={3} lg={2} key={role}>
              <Card className="shadow-sm border-0 h-100">
                <CardBody className="py-3">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaUsers className="text-muted" />
                    <small className="text-muted">{role}</small>
                  </div>
                  <div className="fs-4 fw-bold">{count}</div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card className="shadow-sm border-0">
        <CardHeader className="bg-white">
          <strong>Hierarchy</strong>
        </CardHeader>
        <CardBody className="p-0">
          {!tree?.root ? (
            <Alert color="info" className="m-3">No users found in your scope.</Alert>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-end">Channels</th>
                  <th className="text-end">Credits</th>
                </tr>
              </thead>
              <tbody>
                <TreeNode node={tree.root} />
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={showModal} toggle={() => setShowModal(false)}>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <ModalHeader toggle={() => setShowModal(false)}>Onboard a new user</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label className="small fw-semibold">Full name <span className="text-danger">*</span></Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Email <span className="text-danger">*</span></Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Mobile <span className="text-danger">*</span></Label>
              <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Password <span className="text-danger">*</span></Label>
              <div className="d-flex gap-2">
                <Input
                  type="password" value={form.password} autoComplete="new-password"
                  onChange={(e) => set("password", e.target.value)}
                />
                <Button color="light" type="button" className="adm-icon-btn" data-tt="Use a strong default" onClick={() => set("password", "Admin@123")}>
                  <FaKey />
                </Button>
              </div>
              <small className="text-muted">At least 8 characters. Share it securely with the new user.</small>
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Role <span className="text-danger">*</span></Label>
              <Input type="select" value={form.role} onChange={(e) => set("role", e.target.value)}>
                {creatable.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Input>
              {creatable.length === 0 && (
                <small className="text-danger">Your role cannot create sub-accounts.</small>
              )}
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Designation</Label>
              <Input
                value={form.userDesignations}
                placeholder="e.g. Support Executive"
                onChange={(e) => set("userDesignations", e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label className="small fw-semibold">Note</Label>
              <Input
                value={form.note}
                placeholder="Internal note (optional)"
                onChange={(e) => set("note", e.target.value)}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button color="success" type="submit" disabled={saving || creatable.length === 0}>
              {saving ? <Spinner size="sm" /> : <FaCheckCircle className="me-1" />} Create
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default Onboarding;
