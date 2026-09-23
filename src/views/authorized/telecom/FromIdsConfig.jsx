import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, Nav, NavItem, NavLink
} from "reactstrap";
import {
  FaCogs, FaPlus, FaCheckCircle, FaTrash, FaEdit,
  FaShieldAlt, FaWhatsapp, FaEnvelope, FaCommentAlt, FaPhoneAlt
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialFromIds = [
  {
    id: "FROM-01",
    channel: "SMS",
    identifier: "BYDSND",
    description: "Primary Transactional Header (DLT Reg. #1401290001)",
    status: "ACTIVE",
    isDefault: true,
    addedAt: "2026-08-10"
  },
  {
    id: "FROM-02",
    channel: "SMS",
    identifier: "BYDPRM",
    description: "Promotional Route Header (DLT Reg. #1401290002)",
    status: "ACTIVE",
    isDefault: false,
    addedAt: "2026-08-15"
  },
  {
    id: "FROM-03",
    channel: "WHATSAPP",
    identifier: "+91 98765 00000",
    description: "BeyondSend Official Verified WABA Phone Number",
    status: "ACTIVE",
    isDefault: true,
    addedAt: "2026-08-20"
  },
  {
    id: "FROM-04",
    channel: "EMAIL",
    identifier: "support@beyondsend.in",
    description: "DKIM Verified · SPF Configured · DMARC Pass",
    status: "ACTIVE",
    isDefault: true,
    addedAt: "2026-08-05"
  },
  {
    id: "FROM-05",
    channel: "VOICE",
    identifier: "022-6890-4400",
    description: "PRI/SIP Trunk Outbound Caller CLI",
    status: "ACTIVE",
    isDefault: true,
    addedAt: "2026-09-01"
  }
];

const FromIdsConfig = () => {
  const [fromIds, setFromIds] = useState(initialFromIds);
  const [activeTab, setActiveTab] = useState("ALL");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    channel: "SMS",
    identifier: "",
    description: "",
    isDefault: false
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.identifier) return;

    const newId = {
      id: `FROM-0${fromIds.length + 1}`,
      ...form,
      status: "ACTIVE",
      addedAt: new Date().toISOString().slice(0, 10)
    };

    setFromIds([...fromIds, newId]);
    setModal(false);
    setForm({ channel: "SMS", identifier: "", description: "", isDefault: false });
    Swal.fire("Registered", "New Sender Identifier configured.", "success");
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Sender ID?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Remove"
    }).then((res) => {
      if (res.isConfirmed) {
        setFromIds(fromIds.filter((f) => f.id !== id));
        Swal.fire("Removed", "Sender ID deleted.", "success");
      }
    });
  };

  const filtered = fromIds.filter(
    (f) => activeTab === "ALL" || f.channel === activeTab
  );

  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader
          className="border-0 py-3.5 px-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaCogs size={22} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">From IDs & Sender Routing Config</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Manage approved DLT SMS Headers, WABA Business Numbers, Email Sending Domains & Caller CLIs
              </small>
            </div>
          </div>
          <Button
            color="primary"
            className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
            onClick={() => setModal(true)}
          >
            <FaPlus size={12} /> Add Sender Identifier
          </Button>
        </CardHeader>

        <CardBody className="p-0">
          {/* TABS */}
          <div className="p-3 bg-light border-bottom">
            <Nav pills className="gap-2">
              {["ALL", "SMS", "WHATSAPP", "EMAIL", "VOICE"].map((tab) => (
                <NavItem key={tab}>
                  <NavLink
                    className={`cursor-pointer fw-semibold py-1.5 px-3 rounded-pill ${activeTab === tab ? "active bg-primary text-white" : "bg-white text-dark border"}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "ALL" ? "All Channels" : tab}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Channel</th>
                  <th>Sender Identifier / Header</th>
                  <th>Configuration Details</th>
                  <th>Default Route</th>
                  <th>Status</th>
                  <th>Registration Date</th>
                  <th className="text-center" style={{ width: "90px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((f) => (
                  <tr key={f.id}>
                    <td className="fw-bold text-primary font-monospace">{f.id}</td>
                    <td>
                      <Badge color="secondary" pill className="px-2.5 py-1">
                        {f.channel}
                      </Badge>
                    </td>
                    <td>
                      <span className="fw-bold font-monospace text-dark px-2 py-1 bg-light border rounded">
                        {f.identifier}
                      </span>
                    </td>
                    <td className="small text-muted">{f.description}</td>
                    <td>
                      {f.isDefault ? (
                        <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                          ★ Default
                        </span>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td>
                      <Badge color="success" pill className="px-2 py-1">
                        Active
                      </Badge>
                    </td>
                    <td className="small text-muted">{f.addedAt}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border p-1 px-2 text-danger"
                        title="Delete"
                        onClick={() => handleDelete(f.id)}
                      >
                        <FaTrash size={11} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── ADD MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Add Sender Identifier
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Channel Type</Label>
              <Input
                type="select"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="SMS">SMS (6-Alpha DLT Header)</option>
                <option value="WHATSAPP">WhatsApp (WABA Phone Number)</option>
                <option value="EMAIL">Email (Verified From Address)</option>
                <option value="VOICE">Voice (Outbound CLI Phone)</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Identifier / Sender ID *</Label>
              <Input
                placeholder="e.g. BYDSND, +919876500000, alerts@beyondsend.in"
                value={form.identifier}
                onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Description & Approval Notes</Label>
              <Input
                placeholder="e.g. DLT Registration ID or SPF/DKIM verification note"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormGroup>
            <div className="form-check">
              <Input
                type="checkbox"
                id="defRoute"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              <Label for="defRoute" className="small fw-semibold text-dark">
                Set as default sender identifier for this channel
              </Label>
            </div>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
            >
              Register Identifier
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default FromIdsConfig;
