import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaUserSlash, FaPlus, FaSearch, FaFileExport, FaTrash,
  FaCheck, FaBan
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialUnsubs = [
  {
    id: "OPT-901",
    contact: "+91 98234 11223",
    channel: "WHATSAPP",
    reason: "Customer replied STOP",
    date: "2026-09-22 14:15"
  },
  {
    id: "OPT-902",
    contact: "alex.marketing@gmail.com",
    channel: "EMAIL",
    reason: "Unsubscribe link clicked",
    date: "2026-09-21 18:40"
  },
  {
    id: "OPT-903",
    contact: "+91 91234 56789",
    channel: "SMS",
    reason: "National TRAI DND Registry",
    date: "2026-09-20 10:20"
  }
];

const UnsubscribersManagement = () => {
  const [unsubs, setUnsubs] = useState(initialUnsubs);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);

  const [form, setForm] = useState({
    contact: "",
    channel: "WHATSAPP",
    reason: "Manual Request"
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.contact) return;

    const newOpt = {
      id: `OPT-${Math.floor(900 + Math.random() * 100)}`,
      ...form,
      date: new Date().toISOString().slice(0, 16).replace("T", " ")
    };

    setUnsubs([newOpt, ...unsubs]);
    setModal(false);
    setForm({ contact: "", channel: "WHATSAPP", reason: "Manual Request" });
    Swal.fire("Added to DND", "Contact added to global suppression blacklist.", "success");
  };

  const handleRemove = (id) => {
    Swal.fire({
      title: "Remove from Suppression?",
      text: "This will allow messages to be delivered to this contact again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Re-enable"
    }).then((res) => {
      if (res.isConfirmed) {
        setUnsubs(unsubs.filter((u) => u.id !== id));
        Swal.fire("Re-enabled", "Contact removed from suppression list.", "success");
      }
    });
  };

  const filtered = unsubs.filter(
    (u) =>
      u.contact.toLowerCase().includes(search.toLowerCase()) ||
      u.channel.toLowerCase().includes(search.toLowerCase()) ||
      u.reason.toLowerCase().includes(search.toLowerCase())
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
              <FaUserSlash size={20} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Unsubscribers & DND Suppression</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Automated opt-out blacklist ensuring compliance with TRAI and Meta spam policies
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1.5"
              onClick={() => Swal.fire("Exported", "Suppression CSV exported.", "info")}
            >
              <FaFileExport size={12} /> Export CSV
            </Button>
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
              onClick={() => setModal(true)}
            >
              <FaPlus size={12} /> Add to Blacklist
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search phone number, email, reason..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="danger" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Blacklisted: {unsubs.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Auto-Suppression Enabled
                </Badge>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>Contact (Phone / Email)</th>
                  <th>Channel</th>
                  <th>Opt-Out Reason</th>
                  <th>Unsubscribe Timestamp</th>
                  <th className="text-center" style={{ width: "120px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-bold text-danger font-monospace">{u.id}</td>
                    <td className="fw-bold text-dark font-monospace">{u.contact}</td>
                    <td>
                      <Badge color="secondary" pill className="px-2 py-1">
                        {u.channel}
                      </Badge>
                    </td>
                    <td className="small text-muted">{u.reason}</td>
                    <td className="small text-muted">{u.date}</td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        color="light"
                        className="border p-1 px-2 text-success"
                        title="Remove from DND (Re-enable)"
                        onClick={() => handleRemove(u.id)}
                      >
                        <FaCheck size={11} className="me-1" /> Re-enable
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── ADD DND MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Add Contact to DND Blacklist
        </ModalHeader>
        <Form onSubmit={handleAdd}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Mobile Number or Email *</Label>
              <Input
                placeholder="e.g. +91 9876543210 or user@example.com"
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup>
              <Label className="fw-bold small text-dark">Channel</Label>
              <Input
                type="select"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
                <option value="ALL">All Channels</option>
              </Input>
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Opt-out Reason</Label>
              <Input
                placeholder="e.g. Customer Requested, Complaint"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button color="danger" type="submit">
              Blacklist Contact
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default UnsubscribersManagement;
