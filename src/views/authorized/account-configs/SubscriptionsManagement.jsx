import { useState, useEffect, useCallback } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Spinner
} from "reactstrap";
import { FaCalendarCheck, FaPlus, FaTrash, FaEdit, FaSyncAlt } from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer } from "@/utilities/WPToast";
import { PageLoader } from "@/components";

const PAID_STATUSES = ["PAID", "PENDING", "PARTIAL", "UNPAID"];

const emptyForm = {
  userId: "",
  fromDate: "",
  toDate: "",
  amount: 0,
  amountPaidStatus: "PENDING",
  comments: "",
  active: true,
};

const SubscriptionsManagement = () => {
  const { toasts, toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const canManage = ["DEVOPS", "ADMIN", "RESELLER"].includes(
    sessionStorage.getItem("userRole") || localStorage.getItem("userRole") || ""
  );

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/subscriptions/list");
      const list = res?.data?.data || res?.data || [];
      setRecords(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error(err?.message || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadUsers = useCallback(async () => {
    if (!canManage) return;
    try {
      const res = await apiClient.get("/credits/users");
      const list = res?.data?.data || res?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch {
      setUsers([]);
    }
  }, [canManage]);

  useEffect(() => {
    loadRecords();
    loadUsers();
  }, [loadRecords, loadUsers]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setForm({
      userId: record.user?._id || "",
      fromDate: record.fromDate ? new Date(record.fromDate).toISOString().slice(0, 10) : "",
      toDate: record.toDate ? new Date(record.toDate).toISOString().slice(0, 10) : "",
      amount: record.amount ?? 0,
      amountPaidStatus: record.amountPaidStatus || "PENDING",
      comments: record.comments || "",
      active: !!record.active,
    });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fromDate || !form.toDate) {
      toast.warning("From and To dates are required");
      return;
    }
    try {
      setActionLoading(true);
      const res = editing
        ? await apiClient.put(`/subscriptions/update/${editing._id}`, form)
        : await apiClient.post("/subscriptions/create", form);
      toast.success(res?.data?.message || "Subscription saved");
      setModal(false);
      await loadRecords();
    } catch (err) {
      toast.error(err?.message || "Failed to save subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm("Delete this subscription?")) return;
    try {
      setActionLoading(true);
      const res = await apiClient.delete(`/subscriptions/delete/${record._id}`);
      toast.success(res?.data?.message || "Subscription deleted");
      await loadRecords();
    } catch (err) {
      toast.error(err?.message || "Failed to delete subscription");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <PageLoader />;

  const today = new Date();

  return (
    <div className="container-fluid py-3">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 className="mb-1 d-flex align-items-center gap-2">
            <FaCalendarCheck className="text-primary" /> Subscriptions
          </h4>
          <small className="text-muted">Client subscription periods and payment status</small>
        </div>
        <div className="d-flex gap-2">
          <Button color="light" size="sm" onClick={loadRecords} disabled={loading}>
            <FaSyncAlt className={loading ? "fa-spin" : ""} /> Refresh
          </Button>
          {canManage && (
            <Button color="primary" size="sm" onClick={openCreate}>
              <FaPlus /> New Subscription
            </Button>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <CardBody>
          <div className="table-responsive">
            <Table hover bordered size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Account</th>
                  <th>From</th>
                  <th>To</th>
                  <th className="text-end">Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Comments</th>
                  {canManage && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 8 : 7} className="text-center text-muted py-4">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  records.map((rec) => {
                    const expired = rec.toDate && new Date(rec.toDate) < today;
                    return (
                      <tr key={rec._id}>
                        <td>
                          <div className="fw-semibold small">
                            {rec.user?.name || "—"}
                          </div>
                          <div className="small text-muted">{rec.user?.email}</div>
                        </td>
                        <td className="small text-nowrap">
                          {rec.fromDate ? new Date(rec.fromDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="small text-nowrap">
                          {rec.toDate ? new Date(rec.toDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-end fw-semibold">₹{rec.amount ?? 0}</td>
                        <td>
                          <Badge
                            color={
                              rec.amountPaidStatus === "PAID"
                                ? "success"
                                : rec.amountPaidStatus === "PENDING"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {rec.amountPaidStatus}
                          </Badge>
                        </td>
                        <td>
                          {!rec.active ? (
                            <Badge color="secondary">Inactive</Badge>
                          ) : expired ? (
                            <Badge color="dark">Expired</Badge>
                          ) : (
                            <Badge color="primary">Active</Badge>
                          )}
                        </td>
                        <td className="small text-muted">{rec.comments || "—"}</td>
                        {canManage && (
                          <td className="text-end text-nowrap">
                            <Button color="light" size="sm" onClick={() => openEdit(rec)} disabled={actionLoading}>
                              <FaEdit />
                            </Button>{" "}
                            <Button color="danger" size="sm" outline onClick={() => handleDelete(rec)} disabled={actionLoading}>
                              <FaTrash />
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <Modal isOpen={modal} toggle={() => setModal(false)} backdrop="static">
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={() => setModal(false)}>
            {editing ? "Edit Subscription" : "New Subscription"}
          </ModalHeader>
          <ModalBody>
            {users.length > 0 && (
              <FormGroup className="mb-3">
                <Label>Account</Label>
                <Input
                  type="select"
                  value={form.userId}
                  onChange={(e) => setField("userId", e.target.value)}
                  disabled={!!editing}
                >
                  <option value="">My Account</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} — {u.email}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            )}

            <Row className="g-2">
              <Col md={6}>
                <FormGroup>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={form.fromDate}
                    onChange={(e) => setField("fromDate", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={form.toDate}
                    onChange={(e) => setField("toDate", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label>Payment Status</Label>
                  <Input
                    type="select"
                    value={form.amountPaidStatus}
                    onChange={(e) => setField("amountPaidStatus", e.target.value)}
                  >
                    {PAID_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col xs={12}>
                <FormGroup>
                  <Label>Comments</Label>
                  <Input
                    value={form.comments}
                    onChange={(e) => setField("comments", e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={() => setModal(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={actionLoading}>
              {actionLoading && <Spinner size="sm" />} Save
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionsManagement;
