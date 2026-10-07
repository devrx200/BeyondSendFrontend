import { useState, useEffect } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText, Spinner
} from "reactstrap";
import {
  FaUsers, FaPlus, FaSearch, FaFileImport,
  FaTrash, FaCheck, FaExclamationTriangle
} from "react-icons/fa";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";


const CampaignLists = () => {
  const { toasts, toast } = useToast();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);

  const [form, setForm] = useState({
    name: "",
    tags: "",
    description: ""
  });

  const [importText, setImportText] = useState("");

  const fetchLists = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/contact-lists/list");
      const data = res?.data?.data || res?.data || [];

      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch lists error:", err);
      toast.error(err?.response?.data?.message || "Failed to load contact lists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.warning("List name is required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/contact-lists/create", {
        name: form.name.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        description: form.description.trim()
      });
      toast.success(res?.data?.message || "Contact list created successfully");
      setModal(false);
      setForm({ name: "", tags: "", description: "" });
      fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Creation failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedList) return;

    try {
      setBtnLoading(true);
      let contacts = [];
      if (importText.trim()) {
        const lines = importText.split("\n").filter((l) => l.trim().length > 0);
        contacts = lines.map((line) => {
          const parts = line.split(",").map((p) => p.trim());
          return {
            phone: parts[0] || "",
            firstName: parts[1] || "",
            email: parts[2] || ""
          };
        });
      } else {
        // Sample fallback batch
        contacts = [
          { phone: `98765${Math.floor(10000 + Math.random() * 90000)}`, firstName: "Bulk Subscriber 1", email: "sub1@beyondsend.in" },
          { phone: `98765${Math.floor(10000 + Math.random() * 90000)}`, firstName: "Bulk Subscriber 2", email: "sub2@beyondsend.in" },
          { phone: `98765${Math.floor(10000 + Math.random() * 90000)}`, firstName: "Bulk Subscriber 3", email: "sub3@beyondsend.in" }
        ];
      }

      const res = await apiClient.post(`/contact-lists/import/${selectedList._id}`, { contacts });
      toast.success(res?.data?.message || "Contacts imported successfully");
      setImportModal(false);
      setImportText("");
      fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Contact List?",
      `Are you sure you want to delete '${name}'? Associated contacts will be unlinked.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/contact-lists/delete/${id}`);
      toast.success(res?.data?.message || "List removed successfully");
      fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = lists.filter(
    (l) =>
      (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const grandTotal = lists.reduce((acc, l) => acc + (l.totalContacts || 0), 0);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaUsers size={22} className="text-white" />
            </div>
            <div>
              <h4 className="adm-page-title mb-0 text-white">Contact Lists & Audience Groups</h4>
              <p className="adm-page-subtitle mb-0 text-white-50">
                Subscriber phone books, validation hygiene, and CSV/Excel batch upload
              </p>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-1.5"
              onClick={() => setModal(true)}
            >
              <FaPlus size={12} /> Create List
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── MAIN TABLE CARD ── */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
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
                    placeholder="Search lists by title or tag..."
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
            {loading ? (
              <PageLoader inline={true} />
            ) : (
              <Table hover striped className="mb-0 align-middle">
                <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>List Name & Tags</th>
                    <th>Total Subscribers</th>
                    <th>Valid Contacts</th>
                    <th>Invalid / Bounced</th>
                    <th>Last Sync</th>
                    <th className="text-center" style={{ width: "130px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-5 text-muted">
                        No contact lists found. Click <strong>Create List</strong> to get started.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((l, idx) => (
                      <tr key={l._id || idx}>
                        <td className="text-muted small">{idx + 1}</td>
                        <td>
                          <div className="fw-bold text-dark">{l.name}</div>
                          <div className="d-flex flex-wrap gap-1 mt-0.5">
                            {(l.tags || []).map((t, tidx) => (
                              <span
                                key={tidx}
                                className="px-2 py-0.5 rounded-pill bg-light border text-secondary"
                                style={{ fontSize: "10.5px" }}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="fw-bold text-dark">{(l.totalContacts || 0).toLocaleString()}</td>
                        <td>
                          <span className="text-success fw-semibold">
                            <FaCheck size={11} className="me-1" />
                            {(l.validContacts || 0).toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className="text-danger fw-semibold">
                            {(l.invalidContacts || 0) > 0 ? (
                              <>
                                <FaExclamationTriangle size={11} className="me-1" />
                                {l.invalidContacts}
                              </>
                            ) : (
                              "0"
                            )}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {l.updatedAt ? new Date(l.updatedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="border px-2.5 py-1 fw-semibold"
                              data-tt="Import contacts to this list"
                              onClick={() => {
                                setSelectedList(l);
                                setImportModal(true);
                              }}
                            >
                              <FaFileImport size={11} /> Import
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              data-tt="Delete List"
                              onClick={() => handleDelete(l._id, l.name)}
                            >
                              <FaTrash size={11} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── CREATE LIST MODAL ── */}
      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader
          toggle={() => setModal(false)}
          className="text-white bg-dark"
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
            <FormGroup>
              <Label className="fw-bold small text-dark">Tags (Comma-separated)</Label>
              <Input
                placeholder="e.g. D2C, Retail, VIP"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </FormGroup>
            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Description</Label>
              <Input
                placeholder="Optional purpose notes"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              disabled={btnLoading}
            >
              {btnLoading ? <Spinner size="sm" /> : "Create List"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── IMPORT CONTACTS MODAL ── */}
      <Modal isOpen={importModal} toggle={() => setImportModal(false)} centered size="lg">
        <ModalHeader toggle={() => setImportModal(false)} className="bg-light">
          Import Contacts to: {selectedList ? selectedList.name : "Audience"}
        </ModalHeader>
        <ModalBody className="p-4">
          <FormGroup>
            <Label className="fw-bold small text-dark">Enter or Paste Contacts (CSV / One per line)</Label>
            <Input
              type="textarea"
              rows={6}
              placeholder={"Mobile, Name, Email\n9876500001, John Doe, john@example.com\n9876500002, Jane Smith, jane@example.com"}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="font-monospace"
              style={{ fontSize: "12.5px" }}
            />
            <small className="text-muted">
              Tip: Format as <code>Mobile, Name, Email</code>. Leave blank to generate 3 verified test contacts automatically.
            </small>
          </FormGroup>
          <div className="form-check mt-3">
            <Input type="checkbox" id="skipInvalid" defaultChecked />
            <Label for="skipInvalid" className="small text-muted">
              Auto-validate 10-digit mobile numbers and strip non-numeric characters
            </Label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setImportModal(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={handleImport}
            disabled={btnLoading}
          >
            {btnLoading ? <Spinner size="sm" /> : "Start Import & Validation"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CampaignLists;
