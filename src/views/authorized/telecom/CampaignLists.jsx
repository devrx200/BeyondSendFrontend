import { useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText
} from "reactstrap";
import {
  FaAddressBook, FaPlus, FaSearch, FaFileImport, FaDownload,
  FaEdit, FaTrash, FaCheck, FaExclamationTriangle, FaUsers
} from "react-icons/fa";
import Swal from "sweetalert2";

const initialLists = [
  {
    id: "LIST-101",
    name: "Enterprise Prime Clients",
    totalContacts: 14250,
    validContacts: 14120,
    invalidContacts: 130,
    tags: ["High-Value", "BFSI", "Active"],
    createdAt: "2026-09-15",
    updatedAt: "2026-09-22"
  },
  {
    id: "LIST-102",
    name: "E-Commerce Festival Leads Q3",
    totalContacts: 48900,
    validContacts: 47650,
    invalidContacts: 1250,
    tags: ["D2C", "Promo-Opted"],
    createdAt: "2026-09-18",
    updatedAt: "2026-09-21"
  },
  {
    id: "LIST-103",
    name: "WhatsApp VIP Loyalty Members",
    totalContacts: 6400,
    validContacts: 6380,
    invalidContacts: 20,
    tags: ["VIP", "WhatsApp-Verified"],
    createdAt: "2026-09-10",
    updatedAt: "2026-09-20"
  },
  {
    id: "LIST-104",
    name: "Webinar Registrants September",
    totalContacts: 1850,
    validContacts: 1820,
    invalidContacts: 30,
    tags: ["Events", "Tech"],
    createdAt: "2026-09-20",
    updatedAt: "2026-09-23"
  }
];

const CampaignLists = () => {
  const [lists, setLists] = useState(initialLists);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  const [form, setForm] = useState({
    name: "",
    tags: ""
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name) return;

    const newList = {
      id: `LIST-${Math.floor(100 + Math.random() * 900)}`,
      name: form.name,
      totalContacts: 0,
      validContacts: 0,
      invalidContacts: 0,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setLists([newList, ...lists]);
    setModal(false);
    setForm({ name: "", tags: "" });
    Swal.fire("Created", "Contact audience list initialized. You can now import contacts.", "success");
  };

  const handleSimulateImport = () => {
    setImportModal(false);
    Swal.fire({
      icon: "success",
      title: "Contacts Imported!",
      text: "Processed 1,250 rows: 1,238 valid numbers added, 12 duplicates skipped."
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete List?",
      text: "Associated contacts in this list will be unlinked.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#fe5d70",
      confirmButtonText: "Yes, Delete"
    }).then((res) => {
      if (res.isConfirmed) {
        setLists(lists.filter((l) => l.id !== id));
        Swal.fire("Deleted", "List removed.", "success");
      }
    });
  };

  const filtered = lists.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  const grandTotal = lists.reduce((acc, l) => acc + l.totalContacts, 0);

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
              <FaUsers size={22} className="text-white" />
            </div>
            <div>
              <h5 className="fw-bold mb-0 text-white">Contact Lists & Audience Groups</h5>
              <small className="text-white-50" style={{ fontSize: "12px" }}>
                Subscriber phone books, validation hygiene, and CSV/Excel batch upload
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              size="sm"
              className="fw-semibold d-flex align-items-center gap-1.5"
              onClick={() => setImportModal(true)}
            >
              <FaFileImport size={12} /> Import Contacts CSV
            </Button>
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              style={{ background: "var(--pub-grad-primary)", border: "none" }}
              onClick={() => setModal(true)}
            >
              <FaPlus size={12} /> Create List
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          {/* STATS STRIP */}
          <div className="p-3 bg-light border-bottom">
            <Row className="g-2 align-items-center">
              <Col xs={12} md={5}>
                <InputGroup size="sm">
                  <InputGroupText className="bg-white border-end-0 text-muted">
                    <FaSearch size={12} />
                  </InputGroupText>
                  <Input
                    placeholder="Search lists by title, tag or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0 bg-white"
                  />
                </InputGroup>
              </Col>
              <Col xs={12} md={7} className="d-flex justify-content-md-end gap-2 flex-wrap">
                <Badge color="primary" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Total Lists: {lists.length}
                </Badge>
                <Badge color="success" className="py-1.5 px-2.5 rounded-pill shadow-xs">
                  Clean Contacts: {grandTotal.toLocaleString()}
                </Badge>
              </Col>
            </Row>
          </div>

          {/* TABLE */}
          <div className="table-responsive">
            <Table hover striped className="mb-0 align-middle">
              <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                <tr>
                  <th style={{ width: "95px" }}>ID</th>
                  <th>List Name & Tags</th>
                  <th>Total Subscribers</th>
                  <th>Valid Numbers</th>
                  <th>Invalid / Bounced</th>
                  <th>Last Sync</th>
                  <th className="text-center" style={{ width: "130px" }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: "13px" }}>
                {filtered.map((l) => (
                  <tr key={l.id}>
                    <td className="fw-bold text-primary font-monospace">{l.id}</td>
                    <td>
                      <div className="fw-bold text-dark">{l.name}</div>
                      <div className="d-flex flex-wrap gap-1 mt-0.5">
                        {l.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-pill bg-light border text-secondary"
                            style={{ fontSize: "10.5px" }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="fw-bold text-dark">{l.totalContacts.toLocaleString()}</td>
                    <td>
                      <span className="text-success fw-semibold">
                        <FaCheck size={11} className="me-1" />
                        {l.validContacts.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="text-danger fw-semibold">
                        {l.invalidContacts > 0 ? (
                          <>
                            <FaExclamationTriangle size={11} className="me-1" />
                            {l.invalidContacts}
                          </>
                        ) : (
                          "0"
                        )}
                      </span>
                    </td>
                    <td className="text-muted small">{l.updatedAt}</td>
                    <td className="text-center">
                      <div className="d-inline-flex gap-1">
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-primary"
                          title="Import to this list"
                          onClick={() => {
                            setSelectedList(l);
                            setImportModal(true);
                          }}
                        >
                          <FaFileImport size={11} />
                        </Button>
                        <Button
                          size="sm"
                          color="light"
                          className="border p-1 px-2 text-danger"
                          title="Delete List"
                          onClick={() => handleDelete(l.id)}
                        >
                          <FaTrash size={11} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE LIST MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}
        >
          Create New Contact List
        </ModalHeader>
        <Form onSubmit={handleCreate}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Audience List Name *</Label>
              <Input
                placeholder="e.g. Diwali Flash Sale Leads"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Tags (Comma-separated)</Label>
              <Input
                placeholder="e.g. D2C, Retail, VIP"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </FormGroup>
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
              Create List
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── IMPORT CSV MODAL ── */}
      <Modal isOpen={importModal} toggle={() => setImportModal(false)} centered>
        <ModalHeader toggle={() => setImportModal(false)} className="bg-light">
          Import Contacts to {selectedList ? selectedList.name : "Audience"}
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="p-4 text-center border-2 border-dashed rounded-3 bg-light mb-3">
            <FaFileImport size={32} className="text-primary mb-2" />
            <h6>Drag and drop CSV or Excel file here</h6>
            <small className="text-muted d-block mb-3">
              Columns expected: <code>Mobile, Name, Email, CustomField1</code>
            </small>
            <Input type="file" accept=".csv,.xlsx,.xls" />
          </div>
          <div className="form-check">
            <Input type="checkbox" id="skipInvalid" defaultChecked />
            <Label for="skipInvalid" className="small text-muted">
              Auto-validate Indian 10-digit mobile numbers and strip non-numeric characters
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setImportModal(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleSimulateImport}
            style={{ background: "var(--pub-grad-primary)", border: "none" }}
          >
            Start Import & Validation
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CampaignLists;
