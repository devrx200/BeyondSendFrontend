import { useState, useEffect, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Table, Modal,
  ModalHeader, ModalBody, ModalFooter, Form, FormGroup,
  Label, Input, Badge, Row, Col, InputGroup, InputGroupText,
  Spinner, Nav, NavItem, NavLink, TabContent, TabPane
} from "reactstrap";
import {
  FaUsers, FaUserPlus, FaPlus, FaSearch, FaFileImport,
  FaFileExport, FaTrash, FaCheck, FaExclamationTriangle,
  FaPaperPlane, FaWhatsapp, FaEnvelope, FaCommentAlt,
  FaComments, FaFilter, FaDownload, FaEdit, FaSyncAlt,
  FaLayerGroup, FaPhoneAlt, FaMobileAlt, FaBuilding, FaTag
} from "react-icons/fa";
import * as XLSX from "xlsx";
import apiClient from "@apiService";
import { useToast, ToastContainer, wpSwal } from "../../../utilities/WPToast";
import { PageLoader } from "@/components";

const CampaignLists = () => {
  const { toasts, toast } = useToast();

  const [activeTab, setActiveTab] = useState("contacts"); // "contacts" | "groups"
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  // Dynamic Data
  const [lists, setLists] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [totalContactsCount, setTotalContactsCount] = useState(0);

  // Filters & Pagination for Contacts
  const [searchContact, setSearchContact] = useState("");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("ALL");
  const [selectedChannelFilter, setSelectedChannelFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;

  // Search for Groups
  const [searchGroup, setSearchGroup] = useState("");

  // Modals
  const [createGroupModal, setCreateGroupModal] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);

  const [addContactModal, setAddContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [importModal, setImportModal] = useState(false);
  const [directSendModal, setDirectSendModal] = useState(false);

  // Bulk Contact Selection
  const [selectedContactIds, setSelectedContactIds] = useState([]);

  // Forms
  const [groupForm, setGroupForm] = useState({
    name: "",
    channel: "ALL",
    tags: "",
    description: ""
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    mobileNumber: "",
    whatsappNumber: "",
    sameAsMobile: true,
    email: "",
    listId: "",
    company: "",
    tags: "",
    notes: "",
    channels: ["SMS", "WHATSAPP", "RCS", "EMAIL"]
  });

  const [importForm, setImportForm] = useState({
    targetListId: "",
    newGroupName: "",
    channel: "ALL",
    rawText: "",
    parsedData: []
  });

  const [directSendForm, setDirectSendForm] = useState({
    channel: "WHATSAPP",
    contactId: null,
    recipient: "",
    recipientName: "",
    subject: "",
    message: ""
  });

  // ── Fetch Contact Lists (Audience Groups) ──
  const fetchLists = async () => {
    try {
      const res = await apiClient.get("/contact-lists/list");
      const data = res?.data?.data || res?.data || [];
      const listArray = Array.isArray(data) ? data : [];
      setLists(listArray);
      return listArray;
    } catch (err) {
      console.error("Fetch lists error:", err);
      toast.error(err?.response?.data?.message || "Failed to load audience groups");
      return [];
    }
  };

  // ── Fetch Contacts (Subscribers) ──
  const fetchContacts = async (targetPage = page) => {
    try {
      setLoading(true);
      const params = {
        page: targetPage,
        limit,
        search: searchContact.trim() || undefined,
        listId: selectedGroupFilter !== "ALL" ? selectedGroupFilter : undefined,
        channel: selectedChannelFilter !== "ALL" ? selectedChannelFilter : undefined,
      };

      const res = await apiClient.get("/contacts/list", { params });
      const data = res?.data?.data || [];
      setContacts(Array.isArray(data) ? data : []);
      setTotalContactsCount(res?.data?.total || data.length);
      setTotalPages(res?.data?.totalPages || 1);
      setPage(res?.data?.page || targetPage);
    } catch (err) {
      console.error("Fetch contacts error:", err);
      toast.error(err?.response?.data?.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchLists();
      await fetchContacts(1);
      setLoading(false);
    };
    init();
  }, []);

  // Re-fetch contacts when filters change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchContacts(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchContact, selectedGroupFilter, selectedChannelFilter]);

  // ── Group Operations ──
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) {
      toast.warning("Audience Group name is required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/contact-lists/create", {
        name: groupForm.name.trim(),
        channel: groupForm.channel,
        tags: groupForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        description: groupForm.description.trim()
      });
      toast.success(res?.data?.message || "Audience Group created successfully");
      setCreateGroupModal(false);
      setGroupForm({ name: "", channel: "ALL", tags: "", description: "" });
      await fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Group creation failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!editingGroup || !editingGroup._id) return;

    try {
      setBtnLoading(true);
      const res = await apiClient.put(`/contact-lists/update/${editingGroup._id}`, {
        name: editingGroup.name,
        channel: editingGroup.channel,
        tags: Array.isArray(editingGroup.tags) ? editingGroup.tags : String(editingGroup.tags).split(",").map(t => t.trim()).filter(Boolean),
        description: editingGroup.description
      });
      toast.success(res?.data?.message || "Group updated successfully");
      setEditGroupModal(false);
      setEditingGroup(null);
      await fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteGroup = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Audience Group?",
      `Are you sure you want to delete '${name}'? Contacts in this group will also be unlinked.`
    );
    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/contact-lists/delete/${id}`);
      toast.success(res?.data?.message || "Group removed successfully");
      await fetchLists();
      await fetchContacts(page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  // ── Contact Operations ──
  const openAddContactModal = (preselectedListId = "") => {
    setEditingContact(null);
    setContactForm({
      name: "",
      mobileNumber: "",
      whatsappNumber: "",
      sameAsMobile: true,
      email: "",
      listId: preselectedListId || (lists.length > 0 ? lists[0]._id : ""),
      company: "",
      tags: "",
      notes: "",
      channels: ["SMS", "WHATSAPP", "RCS", "EMAIL"]
    });
    setAddContactModal(true);
  };

  const openEditContactModal = (contact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "",
      mobileNumber: contact.mobileNumber || contact.phone || "",
      whatsappNumber: contact.whatsappNumber || contact.phone || "",
      sameAsMobile: (contact.whatsappNumber || contact.phone) === (contact.mobileNumber || contact.phone),
      email: contact.email || "",
      listId: contact.listId?._id || contact.listId || (lists.length > 0 ? lists[0]._id : ""),
      company: contact.company || "",
      tags: Array.isArray(contact.tags) ? contact.tags.join(", ") : "",
      notes: contact.notes || "",
      channels: contact.channels || ["SMS", "WHATSAPP", "RCS", "EMAIL"]
    });
    setAddContactModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    const phone = contactForm.mobileNumber.trim();
    const wa = contactForm.sameAsMobile ? phone : (contactForm.whatsappNumber.trim() || phone);
    const email = contactForm.email.trim();

    if (!phone && !email && !wa) {
      toast.warning("Please provide at least a Mobile Number, WhatsApp Number, or Email");
      return;
    }

    try {
      setBtnLoading(true);
      const payload = {
        name: contactForm.name.trim(),
        mobileNumber: phone,
        phone,
        whatsappNumber: wa,
        email,
        listId: contactForm.listId || undefined,
        company: contactForm.company.trim(),
        tags: contactForm.tags.split(",").map(t => t.trim()).filter(Boolean),
        notes: contactForm.notes.trim(),
        channels: contactForm.channels
      };

      if (editingContact) {
        await apiClient.put(`/contacts/update/${editingContact._id}`, payload);
        toast.success("Contact updated successfully");
      } else {
        await apiClient.post("/contacts/create", payload);
        toast.success("Contact added successfully");
      }

      setAddContactModal(false);
      await fetchContacts(page);
      await fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save contact");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDeleteContact = async (id, name) => {
    const isConfirmed = await wpSwal.confirm(
      "Delete Contact?",
      `Are you sure you want to remove contact '${name || "this contact"}'?`
    );
    if (!isConfirmed) return;

    try {
      await apiClient.delete(`/contacts/delete/${id}`);
      toast.success("Contact removed successfully");
      await fetchContacts(page);
      await fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete contact");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContactIds.length === 0) return;
    const isConfirmed = await wpSwal.confirm(
      "Delete Selected Contacts?",
      `Are you sure you want to delete ${selectedContactIds.length} selected contacts?`
    );
    if (!isConfirmed) return;

    try {
      setBtnLoading(true);
      await apiClient.post("/contacts/bulk-delete", { ids: selectedContactIds });
      toast.success(`Removed ${selectedContactIds.length} contacts successfully`);
      setSelectedContactIds([]);
      await fetchContacts(page);
      await fetchLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk delete failed");
    } finally {
      setBtnLoading(false);
    }
  };

  // ── CSV & Excel Import Handling ──
  const openImportModal = (targetListId = "") => {
    setImportForm({
      targetListId: targetListId || (lists.length > 0 ? lists[0]._id : ""),
      newGroupName: "",
      channel: "ALL",
      rawText: "",
      parsedData: []
    });
    setImportModal(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        let rows = [];

        if (isExcel) {
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheet = workbook.SheetNames[0];
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        } else {
          // CSV / Text parsing
          const text = data;
          const workbook = XLSX.read(text, { type: "string" });
          const firstSheet = workbook.SheetNames[0];
          rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
        }

        const normalized = rows.map(r => {
          const name = r.Name || r.name || r["Full Name"] || [r["First Name"], r["Last Name"]].filter(Boolean).join(" ") || "";
          const mobile = String(r["Mobile Number"] || r.Mobile || r.mobile || r.Phone || r.phone || "").trim();
          const whatsapp = String(r["WhatsApp Number"] || r.WhatsApp || r.whatsapp || mobile).trim();
          const email = String(r.Email || r.email || "").trim();
          const company = String(r.Company || r.company || "").trim();
          const tags = String(r.Tags || r.tags || "").trim();
          return { name, mobileNumber: mobile, phone: mobile, whatsappNumber: whatsapp, email, company, tags };
        }).filter(item => item.mobileNumber || item.email || item.whatsappNumber);

        setImportForm(prev => ({
          ...prev,
          parsedData: normalized
        }));

        toast.info(`Parsed ${normalized.length} contacts from file. Ready to import.`);
      } catch (err) {
        console.error("Parse file error:", err);
        toast.error("Failed to parse file. Please verify CSV or Excel format.");
      }
    };

    if (isExcel) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleParseRawText = () => {
    if (!importForm.rawText.trim()) {
      toast.warning("Please enter CSV data");
      return;
    }
    const lines = importForm.rawText.split("\n").filter(l => l.trim().length > 0);
    const parsed = lines.map(line => {
      const parts = line.split(",").map(p => p.trim());
      return {
        name: parts[0] || "",
        mobileNumber: parts[1] || "",
        whatsappNumber: parts[2] || parts[1] || "",
        email: parts[3] || "",
        company: parts[4] || ""
      };
    }).filter(c => c.mobileNumber || c.email);

    setImportForm(prev => ({ ...prev, parsedData: parsed }));
    toast.info(`Extracted ${parsed.length} contacts from pasted text.`);
  };

  const handleExecuteImport = async () => {
    if (importForm.parsedData.length === 0) {
      toast.warning("No valid contacts found to import. Please upload a file or paste CSV text.");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/contacts/import", {
        contacts: importForm.parsedData,
        listId: importForm.targetListId || undefined,
        groupName: importForm.newGroupName.trim() || undefined,
        groupChannel: importForm.channel
      });

      toast.success(res?.data?.message || "Contacts imported successfully!");
      setImportModal(false);
      await fetchLists();
      await fetchContacts(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Import failed");
    } finally {
      setBtnLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleHeaders = "Name,Mobile Number,WhatsApp Number,Email,Company,Tags\n";
    const sampleRow1 = "Rahul Sharma,9876543210,9876543210,rahul@example.com,BeyondSend,VIP,Mumbai\n";
    const sampleRow2 = "Priya Patel,9123456789,9123456789,priya@example.com,TechCorp,Lead,Delhi\n";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(sampleHeaders + sampleRow1 + sampleRow2);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "beyondsend_contacts_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Direct Send Modal ──
  const openDirectSendModal = (contact = null) => {
    if (contact) {
      setDirectSendForm({
        channel: "WHATSAPP",
        contactId: contact._id,
        recipient: contact.whatsappNumber || contact.mobileNumber || contact.phone || contact.email || "",
        recipientName: contact.name || "Subscriber",
        subject: "",
        message: `Hello ${contact.name || "there"}, this is a direct message from BeyondSend.`
      });
    } else {
      setDirectSendForm({
        channel: "WHATSAPP",
        contactId: null,
        recipient: "",
        recipientName: "",
        subject: "",
        message: ""
      });
    }
    setDirectSendModal(true);
  };

  const handleDirectSend = async (e) => {
    e.preventDefault();
    if (!directSendForm.recipient.trim()) {
      toast.warning("Recipient is required");
      return;
    }
    if (!directSendForm.message.trim()) {
      toast.warning("Message content is required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await apiClient.post("/contacts/direct-send", {
        channel: directSendForm.channel,
        contactId: directSendForm.contactId,
        recipient: directSendForm.recipient.trim(),
        message: directSendForm.message.trim(),
        subject: directSendForm.subject.trim() || undefined
      });

      toast.success(res?.data?.message || `Message dispatched via ${directSendForm.channel}`);
      setDirectSendModal(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Direct send failed");
    } finally {
      setBtnLoading(false);
    }
  };

  // ── Export Contacts to CSV ──
  const handleExportCsv = async () => {
    try {
      setBtnLoading(true);
      const res = await apiClient.get("/contacts/export", {
        params: { listId: selectedGroupFilter !== "ALL" ? selectedGroupFilter : undefined }
      });
      const data = res?.data?.data || [];
      if (!Array.isArray(data) || data.length === 0) {
        toast.warning("No contacts available to export");
        return;
      }

      const rows = data.map((c, i) => ({
        "#": i + 1,
        "Name": c.name || "",
        "Mobile Number": c.mobileNumber || c.phone || "",
        "WhatsApp Number": c.whatsappNumber || "",
        "Email": c.email || "",
        "Audience Group": c.listId?.name || "General Audience",
        "Company": c.company || "",
        "Status": c.status || "ACTIVE",
        "Tags": Array.isArray(c.tags) ? c.tags.join("; ") : ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audience Contacts");
      XLSX.writeFile(workbook, `beyondsend_audience_contacts_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${rows.length} contacts successfully!`);
    } catch (err) {
      toast.error("Export failed: " + (err?.response?.data?.message || err.message));
    } finally {
      setBtnLoading(false);
    }
  };

  // Filtered Groups for Groups Tab
  const filteredGroups = useMemo(() => {
    return lists.filter(l =>
      (l.name || "").toLowerCase().includes(searchGroup.toLowerCase()) ||
      (l.tags || []).some(t => t.toLowerCase().includes(searchGroup.toLowerCase()))
    );
  }, [lists, searchGroup]);

  // Total grand contacts calculation
  const grandTotalContacts = useMemo(() => {
    return lists.reduce((acc, l) => acc + (l.totalContacts || 0), 0) || totalContactsCount;
  }, [lists, totalContactsCount]);

  return (
    <div className="telecom-module-wrapper">
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      {/* ── HEADER BANNER ── */}
      <Card className="adm-card mb-4 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3 p-4">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-20 border border-primary border-opacity-25"
              style={{ width: "52px", height: "52px" }}
            >
              <FaUsers size={26} className="text-primary" />
            </div>
            <div>
              <h3 className="adm-page-title mb-1 text-white fw-bold">Audience & Contact Management</h3>
              <p className="adm-page-subtitle mb-0 text-white-50" style={{ fontSize: "13.5px" }}>
                Omnichannel subscriber phone books, dynamic group segmentation, direct multi-channel send (WhatsApp, SMS, RCS, Email), and CSV/Excel batch upload
              </p>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Button
              color="light"
              outline
              className="fw-semibold px-3 d-flex align-items-center gap-2 border-secondary text-white"
              onClick={() => openDirectSendModal()}
            >
              <FaPaperPlane size={13} className="text-warning" /> Direct Send
            </Button>
            <Button
              color="info"
              className="fw-bold shadow-sm px-3 d-flex align-items-center gap-2 text-white"
              onClick={() => openImportModal()}
            >
              <FaFileImport size={13} /> Import CSV / Excel
            </Button>
            <Button
              color="success"
              className="fw-bold shadow-sm px-3 d-flex align-items-center gap-2"
              onClick={() => openAddContactModal()}
            >
              <FaUserPlus size={13} /> Add Contact
            </Button>
            <Button
              color="primary"
              className="fw-bold shadow-sm px-3.5 d-flex align-items-center gap-2"
              onClick={() => setCreateGroupModal(true)}
            >
              <FaLayerGroup size={13} /> Create Group
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── METRIC STATS ── */}
      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Subscribers</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{grandTotalContacts.toLocaleString()}</h3>
                <small className="text-success fw-semibold"><FaCheck size={10} className="me-1" />Database Verified</small>
              </div>
              <div className="rounded-3 bg-primary bg-opacity-10 p-3 text-primary">
                <FaUsers size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Target Groups</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{lists.length}</h3>
                <small className="text-primary fw-semibold"><FaLayerGroup size={10} className="me-1" />Campaign Lists</small>
              </div>
              <div className="rounded-3 bg-info bg-opacity-10 p-3 text-info">
                <FaLayerGroup size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">WhatsApp Ready</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">{totalContactsCount.toLocaleString()}</h3>
                <small className="text-success fw-semibold"><FaWhatsapp size={10} className="me-1" />WhatsApp & RCS</small>
              </div>
              <div className="rounded-3 bg-success bg-opacity-10 p-3 text-success">
                <FaWhatsapp size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col xs={12} sm={6} md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white">
            <CardBody className="p-3.5 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Supported Channels</span>
                <h3 className="fw-bold text-dark mb-0 mt-1">4 Channels</h3>
                <small className="text-secondary fw-semibold">RCS · WhatsApp · SMS · Email</small>
              </div>
              <div className="rounded-3 bg-warning bg-opacity-10 p-3 text-warning">
                <FaPaperPlane size={24} />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── TABS NAVIGATION ── */}
      <Nav tabs className="mb-3 border-bottom-0">
        <NavItem>
          <NavLink
            className={`fw-bold px-4 py-2.5 rounded-top-3 border-0 ${activeTab === "contacts" ? "bg-white text-primary shadow-sm border-top border-primary border-3" : "text-muted bg-light me-1"}`}
            style={{ cursor: "pointer", fontSize: "14px" }}
            onClick={() => setActiveTab("contacts")}
          >
            <FaUsers className="me-2" /> All Contacts & Subscribers ({totalContactsCount})
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={`fw-bold px-4 py-2.5 rounded-top-3 border-0 ${activeTab === "groups" ? "bg-white text-primary shadow-sm border-top border-primary border-3" : "text-muted bg-light"}`}
            style={{ cursor: "pointer", fontSize: "14px" }}
            onClick={() => setActiveTab("groups")}
          >
            <FaLayerGroup className="me-2" /> Target Audience Groups ({lists.length})
          </NavLink>
        </NavItem>
      </Nav>

      <TabContent activeTab={activeTab}>
        {/* ══════════════════════════════════════════════════════════
            TAB 1: CONTACTS & SUBSCRIBERS DIRECTORY
        ══════════════════════════════════════════════════════════ */}
        <TabPane tabId="contacts">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <CardBody className="p-0">
              {/* FILTER TOOLBAR */}
              <div className="p-3 bg-light border-bottom">
                <Row className="g-2 align-items-center">
                  <Col xs={12} md={4}>
                    <InputGroup size="sm">
                      <InputGroupText className="bg-white border-end-0 text-muted">
                        <FaSearch size={12} />
                      </InputGroupText>
                      <Input
                        placeholder="Search name, mobile, whatsapp, or email..."
                        value={searchContact}
                        onChange={(e) => setSearchContact(e.target.value)}
                        className="border-start-0 bg-white"
                      />
                    </InputGroup>
                  </Col>

                  <Col xs={12} sm={6} md={3}>
                    <Input
                      type="select"
                      size="sm"
                      className="bg-white"
                      value={selectedGroupFilter}
                      onChange={(e) => setSelectedGroupFilter(e.target.value)}
                    >
                      <option value="ALL">All Target Groups</option>
                      {lists.map(l => (
                        <option key={l._id} value={l._id}>{l.name} ({l.totalContacts || 0})</option>
                      ))}
                    </Input>
                  </Col>

                  <Col xs={12} sm={6} md={2}>
                    <Input
                      type="select"
                      size="sm"
                      className="bg-white"
                      value={selectedChannelFilter}
                      onChange={(e) => setSelectedChannelFilter(e.target.value)}
                    >
                      <option value="ALL">All Channels</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="SMS">SMS</option>
                      <option value="RCS">RCS</option>
                      <option value="EMAIL">Email</option>
                    </Input>
                  </Col>

                  <Col xs={12} md={3} className="d-flex justify-content-md-end gap-2 flex-wrap">
                    {selectedContactIds.length > 0 && (
                      <Button
                        color="danger"
                        size="sm"
                        className="fw-semibold px-2.5 d-flex align-items-center gap-1.5"
                        onClick={handleBulkDelete}
                        disabled={btnLoading}
                      >
                        <FaTrash size={11} /> Delete ({selectedContactIds.length})
                      </Button>
                    )}
                    <Button
                      color="secondary"
                      outline
                      size="sm"
                      className="fw-semibold px-2.5 d-flex align-items-center gap-1.5 bg-white"
                      onClick={handleExportCsv}
                      disabled={btnLoading}
                      data-tt="Export contacts to CSV"
                    >
                      <FaFileExport size={11} /> Export CSV
                    </Button>
                    <Button
                      color="primary"
                      size="sm"
                      className="fw-semibold px-2.5 d-flex align-items-center gap-1.5"
                      onClick={() => fetchContacts(page)}
                    >
                      <FaSyncAlt size={11} /> Refresh
                    </Button>
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
                        <th style={{ width: "35px" }}>
                          <Input
                            type="checkbox"
                            checked={contacts.length > 0 && selectedContactIds.length === contacts.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContactIds(contacts.map(c => c._id));
                              } else {
                                setSelectedContactIds([]);
                              }
                            }}
                          />
                        </th>
                        <th>Subscriber Name & Info</th>
                        <th>Mobile Number</th>
                        <th>WhatsApp Number</th>
                        <th>Email Address</th>
                        <th>Target Group / List</th>
                        <th>Channel Reach</th>
                        <th>Status</th>
                        <th className="text-center" style={{ width: "135px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: "13px" }}>
                      {contacts.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="text-center py-5 text-muted">
                            <div className="py-4">
                              <FaUsers size={40} className="text-secondary opacity-50 mb-3" />
                              <h6 className="fw-bold text-dark">No Contacts Found</h6>
                              <p className="text-muted small mb-3">
                                Start adding contacts manually, or import your customer list via CSV / Excel.
                              </p>
                              <div className="d-flex justify-content-center gap-2">
                                <Button color="primary" size="sm" onClick={() => openAddContactModal()}>
                                  <FaUserPlus size={12} className="me-1" /> Add Contact
                                </Button>
                                <Button color="info" size="sm" className="text-white" onClick={() => openImportModal()}>
                                  <FaFileImport size={12} className="me-1" /> Import CSV
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        contacts.map((c, idx) => {
                          const isChecked = selectedContactIds.includes(c._id);
                          return (
                            <tr key={c._id || idx}>
                              <td>
                                <Input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedContactIds(prev => [...prev, c._id]);
                                    } else {
                                      setSelectedContactIds(prev => prev.filter(id => id !== c._id));
                                    }
                                  }}
                                />
                              </td>
                              <td>
                                <div className="fw-bold text-dark">{c.name || "Unnamed"}</div>
                                {c.company && (
                                  <small className="text-muted d-block" style={{ fontSize: "11px" }}>
                                    <FaBuilding size={9} className="me-1" />{c.company}
                                  </small>
                                )}
                              </td>
                              <td>
                                <span className="font-monospace fw-semibold text-secondary">
                                  {c.mobileNumber || c.phone || "—"}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1.5">
                                  <FaWhatsapp size={14} className="text-success" />
                                  <span className="font-monospace fw-bold text-dark">
                                    {c.whatsappNumber || c.phone || "—"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="text-muted small">
                                  {c.email ? (
                                    <>
                                      <FaEnvelope size={11} className="me-1 text-primary" />
                                      {c.email}
                                    </>
                                  ) : "—"}
                                </span>
                              </td>
                              <td>
                                <Badge color="light" className="border text-dark py-1 px-2 fw-semibold">
                                  {c.listId?.name || "General Audience"}
                                </Badge>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <span title="SMS Capable" className="badge bg-primary-subtle text-primary p-1 rounded">
                                    <FaCommentAlt size={10} />
                                  </span>
                                  <span title="WhatsApp Capable" className="badge bg-success-subtle text-success p-1 rounded">
                                    <FaWhatsapp size={10} />
                                  </span>
                                  <span title="RCS Capable" className="badge bg-info-subtle text-info p-1 rounded">
                                    <FaComments size={10} />
                                  </span>
                                  <span title="Email Capable" className="badge bg-warning-subtle text-warning p-1 rounded">
                                    <FaEnvelope size={10} />
                                  </span>
                                </div>
                              </td>
                              <td>
                                <Badge
                                  color={c.status === "ACTIVE" || c.status === "SUBSCRIBED" ? "success" : "secondary"}
                                  className="py-1 px-2 rounded-pill font-monospace"
                                  style={{ fontSize: "10.5px" }}
                                >
                                  {c.status || "ACTIVE"}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <div className="d-inline-flex gap-1.5 align-items-center">
                                  <Button
                                    size="sm"
                                    color="light"
                                    className="border px-2 py-0.5 text-primary"
                                    title="Direct Send Message"
                                    onClick={() => openDirectSendModal(c)}
                                  >
                                    <FaPaperPlane size={11} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="light"
                                    className="border px-2 py-0.5 text-secondary"
                                    title="Edit Contact"
                                    onClick={() => openEditContactModal(c)}
                                  >
                                    <FaEdit size={11} />
                                  </Button>
                                  <Button
                                    size="sm"
                                    color="light"
                                    className="border px-2 py-0.5 text-danger"
                                    title="Delete Contact"
                                    onClick={() => handleDeleteContact(c._id, c.name)}
                                  >
                                    <FaTrash size={11} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                )}
              </div>

              {/* PAGINATION FOOTER */}
              <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                <small className="text-muted">
                  Showing {contacts.length} of {totalContactsCount} total contacts
                </small>
                {totalPages > 1 && (
                  <div className="d-flex gap-1 align-items-center">
                    <Button
                      size="sm"
                      color="light"
                      className="border"
                      disabled={page <= 1}
                      onClick={() => fetchContacts(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-2 small fw-bold">Page {page} of {totalPages}</span>
                    <Button
                      size="sm"
                      color="light"
                      className="border"
                      disabled={page >= totalPages}
                      onClick={() => fetchContacts(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </TabPane>

        {/* ══════════════════════════════════════════════════════════
            TAB 2: TARGET AUDIENCE GROUPS (CAMPAIGN LISTS)
        ══════════════════════════════════════════════════════════ */}
        <TabPane tabId="groups">
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <CardBody className="p-0">
              <div className="p-3 bg-light border-bottom">
                <Row className="g-2 align-items-center">
                  <Col xs={12} md={6}>
                    <InputGroup size="sm">
                      <InputGroupText className="bg-white border-end-0 text-muted">
                        <FaSearch size={12} />
                      </InputGroupText>
                      <Input
                        placeholder="Search groups by name or tag..."
                        value={searchGroup}
                        onChange={(e) => setSearchGroup(e.target.value)}
                        className="border-start-0 bg-white"
                      />
                    </InputGroup>
                  </Col>
                  <Col xs={12} md={6} className="d-flex justify-content-md-end gap-2 flex-wrap">
                    <Button
                      color="primary"
                      size="sm"
                      className="fw-bold px-3 d-flex align-items-center gap-1.5"
                      onClick={() => setCreateGroupModal(true)}
                    >
                      <FaPlus size={11} /> Create Audience Group
                    </Button>
                  </Col>
                </Row>
              </div>

              <div className="table-responsive">
                <Table hover striped className="mb-0 align-middle">
                  <thead className="table-light" style={{ fontSize: "11.5px", letterSpacing: "0.4px" }}>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Group Name & Tags</th>
                      <th>Channel Scope</th>
                      <th>Total Subscribers</th>
                      <th>Description</th>
                      <th>Created Date</th>
                      <th className="text-center" style={{ width: "180px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: "13px" }}>
                    {filteredGroups.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          No audience groups found. Click <strong>Create Audience Group</strong> to organize your subscribers.
                        </td>
                      </tr>
                    ) : (
                      filteredGroups.map((g, idx) => (
                        <tr key={g._id || idx}>
                          <td className="text-muted small">{idx + 1}</td>
                          <td>
                            <div className="fw-bold text-dark">{g.name}</div>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              {(g.tags || []).map((t, tidx) => (
                                <span key={tidx} className="badge bg-light text-secondary border" style={{ fontSize: "10.5px" }}>
                                  #{t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <Badge color="primary" className="py-1 px-2 rounded-pill font-monospace">
                              {g.channel || "ALL"}
                            </Badge>
                          </td>
                          <td>
                            <span className="fw-bold text-dark fs-6">
                              {(g.totalContacts || 0).toLocaleString()}
                            </span>
                            <small className="text-muted ms-1">members</small>
                          </td>
                          <td className="text-muted small">{g.description || "—"}</td>
                          <td className="text-muted small">
                            {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="text-center">
                            <div className="d-inline-flex gap-1.5 align-items-center">
                              <Button
                                size="sm"
                                color="light"
                                className="border px-2 py-1 text-primary fw-semibold"
                                title="View Contacts in this Group"
                                onClick={() => {
                                  setSelectedGroupFilter(g._id);
                                  setActiveTab("contacts");
                                }}
                              >
                                View Contacts
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="border px-2 py-1 text-info fw-semibold"
                                title="Import into Group"
                                onClick={() => openImportModal(g._id)}
                              >
                                <FaFileImport size={11} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="border px-2 py-1 text-secondary"
                                title="Edit Group"
                                onClick={() => {
                                  setEditingGroup({
                                    ...g,
                                    tags: (g.tags || []).join(", ")
                                  });
                                  setEditGroupModal(true);
                                }}
                              >
                                <FaEdit size={11} />
                              </Button>
                              <Button
                                size="sm"
                                color="light"
                                className="border px-2 py-1 text-danger"
                                title="Delete Group"
                                onClick={() => handleDeleteGroup(g._id, g.name)}
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
              </div>
            </CardBody>
          </Card>
        </TabPane>
      </TabContent>

      {/* ══════════════════════════════════════════════════════════
          MODAL: ADD / EDIT CONTACT
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={addContactModal} toggle={() => setAddContactModal(false)} centered size="lg">
        <ModalHeader toggle={() => setAddContactModal(false)} className="bg-dark text-white">
          <FaUserPlus className="me-2 text-primary" />
          {editingContact ? "Edit Subscriber Contact" : "Add New Subscriber Contact"}
        </ModalHeader>
        <Form onSubmit={handleSaveContact}>
          <ModalBody className="p-4 bg-light">
            <Row className="g-3">
              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Full Name *</Label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Company / Organization</Label>
                  <Input
                    placeholder="e.g. Acme Innovations"
                    value={contactForm.company}
                    onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">
                    <FaMobileAlt className="me-1 text-primary" /> Mobile Number (Calling / SMS / RCS) *
                  </Label>
                  <Input
                    placeholder="e.g. 9876543210 or +919876543210"
                    value={contactForm.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setContactForm(prev => ({
                        ...prev,
                        mobileNumber: val,
                        whatsappNumber: prev.sameAsMobile ? val : prev.whatsappNumber
                      }));
                    }}
                    required
                  />
                  <small className="text-muted">10-digit mobile number with or without country code</small>
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Label className="fw-bold small text-dark mb-0">
                      <FaWhatsapp className="me-1 text-success" /> WhatsApp Number *
                    </Label>
                    <div className="form-check form-check-inline mb-0" style={{ fontSize: "12px" }}>
                      <Input
                        type="checkbox"
                        id="sameAsMobileCheck"
                        checked={contactForm.sameAsMobile}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setContactForm(prev => ({
                            ...prev,
                            sameAsMobile: checked,
                            whatsappNumber: checked ? prev.mobileNumber : prev.whatsappNumber
                          }));
                        }}
                      />
                      <Label for="sameAsMobileCheck" className="text-muted ms-1 mb-0">Same as Mobile</Label>
                    </div>
                  </div>
                  <Input
                    placeholder="e.g. 9876543210 or +919876543210"
                    value={contactForm.whatsappNumber}
                    disabled={contactForm.sameAsMobile}
                    onChange={(e) => setContactForm({ ...contactForm, whatsappNumber: e.target.value })}
                    required
                  />
                  <small className="text-muted">Active WhatsApp Business or Personal number</small>
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">
                    <FaEnvelope className="me-1 text-warning" /> Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col xs={12} md={6}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">
                    <FaLayerGroup className="me-1 text-info" /> Save in Audience Group / List *
                  </Label>
                  <Input
                    type="select"
                    value={contactForm.listId}
                    onChange={(e) => setContactForm({ ...contactForm, listId: e.target.value })}
                    required
                  >
                    {lists.length === 0 ? (
                      <option value="">General Audience (Default)</option>
                    ) : (
                      lists.map(l => (
                        <option key={l._id} value={l._id}>{l.name} ({l.channel})</option>
                      ))
                    )}
                  </Input>
                </FormGroup>
              </Col>

              <Col xs={12} md={12}>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Tags (Comma-separated)</Label>
                  <Input
                    placeholder="e.g. VIP, Leads, Webinar-Attendee, Mumbai"
                    value={contactForm.tags}
                    onChange={(e) => setContactForm({ ...contactForm, tags: e.target.value })}
                  />
                </FormGroup>
              </Col>

              <Col xs={12}>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Notes / Additional Attributes</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    placeholder="Internal reference notes regarding this contact"
                    value={contactForm.notes}
                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                  />
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setAddContactModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading} className="fw-bold px-4">
              {btnLoading ? <Spinner size="sm" /> : (editingContact ? "Update Contact" : "Save Contact")}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          MODAL: CREATE / EDIT GROUP
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={createGroupModal} toggle={() => setCreateGroupModal(false)} centered>
        <ModalHeader toggle={() => setCreateGroupModal(false)} className="bg-dark text-white">
          <FaLayerGroup className="me-2 text-primary" /> Create Target Audience Group
        </ModalHeader>
        <Form onSubmit={handleCreateGroup}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Group / List Name *</Label>
              <Input
                placeholder="e.g. Diwali Flash Sale VIPs"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label className="fw-bold small text-dark">Channel Applicability</Label>
              <Input
                type="select"
                value={groupForm.channel}
                onChange={(e) => setGroupForm({ ...groupForm, channel: e.target.value })}
              >
                <option value="ALL">Omnichannel (ALL: WhatsApp, SMS, RCS, Email)</option>
                <option value="WHATSAPP">WhatsApp Only</option>
                <option value="SMS">SMS Only</option>
                <option value="RCS">RCS Only</option>
                <option value="EMAIL">Email Only</option>
              </Input>
            </FormGroup>

            <FormGroup>
              <Label className="fw-bold small text-dark">Tags (Comma-separated)</Label>
              <Input
                placeholder="e.g. D2C, Retail, HNI"
                value={groupForm.tags}
                onChange={(e) => setGroupForm({ ...groupForm, tags: e.target.value })}
              />
            </FormGroup>

            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Description</Label>
              <Input
                type="textarea"
                rows={2}
                placeholder="Campaign purpose or target customer segment notes"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setCreateGroupModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading} className="fw-bold px-4">
              {btnLoading ? <Spinner size="sm" /> : "Create Group"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* EDIT GROUP MODAL */}
      <Modal isOpen={editGroupModal} toggle={() => setEditGroupModal(false)} centered>
        <ModalHeader toggle={() => setEditGroupModal(false)} className="bg-dark text-white">
          <FaEdit className="me-2 text-primary" /> Edit Audience Group
        </ModalHeader>
        <Form onSubmit={handleUpdateGroup}>
          <ModalBody className="p-4 bg-light">
            {editingGroup && (
              <>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Group Name *</Label>
                  <Input
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Channel</Label>
                  <Input
                    type="select"
                    value={editingGroup.channel || "ALL"}
                    onChange={(e) => setEditingGroup({ ...editingGroup, channel: e.target.value })}
                  >
                    <option value="ALL">Omnichannel (ALL)</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="SMS">SMS</option>
                    <option value="RCS">RCS</option>
                    <option value="EMAIL">Email</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label className="fw-bold small text-dark">Tags</Label>
                  <Input
                    value={editingGroup.tags}
                    onChange={(e) => setEditingGroup({ ...editingGroup, tags: e.target.value })}
                  />
                </FormGroup>
                <FormGroup className="mb-0">
                  <Label className="fw-bold small text-dark">Description</Label>
                  <Input
                    type="textarea"
                    rows={2}
                    value={editingGroup.description || ""}
                    onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setEditGroupModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading} className="fw-bold px-4">
              {btnLoading ? <Spinner size="sm" /> : "Save Changes"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          MODAL: IMPORT CSV / EXCEL BATCH UPLOAD
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={importModal} toggle={() => setImportModal(false)} centered size="lg">
        <ModalHeader toggle={() => setImportModal(false)} className="bg-dark text-white">
          <FaFileImport className="me-2 text-info" /> Batch Import Contacts (CSV & Excel)
        </ModalHeader>
        <ModalBody className="p-4 bg-light">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-0">Upload or Paste Contact File</h6>
              <small className="text-muted">Supports .csv, .xlsx, .xls with auto-header detection</small>
            </div>
            <Button
              color="light"
              size="sm"
              className="border text-primary fw-semibold d-flex align-items-center gap-1.5"
              onClick={downloadSampleCsv}
            >
              <FaDownload size={11} /> Download Sample CSV
            </Button>
          </div>

          <Row className="g-3 mb-3">
            <Col xs={12} md={6}>
              <FormGroup>
                <Label className="fw-bold small text-dark">Select Target Audience Group *</Label>
                <Input
                  type="select"
                  value={importForm.targetListId}
                  onChange={(e) => setImportForm({ ...importForm, targetListId: e.target.value })}
                >
                  <option value="">-- Create New Group Or Pick Below --</option>
                  {lists.map(l => (
                    <option key={l._id} value={l._id}>{l.name} ({l.totalContacts || 0} contacts)</option>
                  ))}
                </Input>
              </FormGroup>
            </Col>

            <Col xs={12} md={6}>
              <FormGroup>
                <Label className="fw-bold small text-dark">Or Create New Group Name</Label>
                <Input
                  placeholder="e.g. October 2026 Inbound Leads"
                  value={importForm.newGroupName}
                  onChange={(e) => setImportForm({ ...importForm, newGroupName: e.target.value })}
                />
              </FormGroup>
            </Col>
          </Row>

          {/* FILE DROPZONE */}
          <div
            className="p-4 text-center border-2 rounded-3 mb-3 bg-white"
            style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}
          >
            <FaFileImport size={32} className="text-primary opacity-75 mb-2" />
            <p className="fw-bold text-dark mb-1">Choose CSV or Excel file to upload</p>
            <p className="text-muted small mb-3">Columns: Name, Mobile Number, WhatsApp Number, Email, Company, Tags</p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              className="d-none"
              id="csvFileInput"
            />
            <Label for="csvFileInput" className="btn btn-outline-primary btn-sm px-4 fw-bold mb-0">
              Browse Files
            </Label>
          </div>

          {/* PASTE OPTION */}
          <FormGroup>
            <Label className="fw-bold small text-dark">Or Paste CSV Text (One subscriber per line)</Label>
            <Input
              type="textarea"
              rows={4}
              placeholder={"Name, Mobile, WhatsApp, Email, Company\nJohn Doe, 9876543210, 9876543210, john@example.com, Acme\nJane Smith, 9876500000, 9876500000, jane@example.com, Tech"}
              value={importForm.rawText}
              onChange={(e) => setImportForm({ ...importForm, rawText: e.target.value })}
              className="font-monospace"
              style={{ fontSize: "12px" }}
            />
            <div className="d-flex justify-content-end mt-1">
              <Button size="sm" color="light" className="border fw-semibold" onClick={handleParseRawText}>
                Parse Text Lines
              </Button>
            </div>
          </FormGroup>

          {/* PREVIEW STATUS */}
          {importForm.parsedData.length > 0 && (
            <div className="p-3 bg-white rounded-3 border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-success small">
                  <FaCheck size={12} className="me-1" />
                  {importForm.parsedData.length} Valid Contacts Extracted & Ready
                </span>
                <Badge color="primary">{importForm.parsedData.length} records</Badge>
              </div>
              <div className="table-responsive" style={{ maxHeight: "150px", overflowY: "auto" }}>
                <Table size="sm" className="mb-0 small">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>WhatsApp</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importForm.parsedData.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td>{rIdx + 1}</td>
                        <td>{row.name}</td>
                        <td className="font-monospace">{row.mobileNumber}</td>
                        <td className="font-monospace">{row.whatsappNumber}</td>
                        <td>{row.email}</td>
                      </tr>
                    ))}
                    {importForm.parsedData.length > 5 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted fst-italic">
                          ... and {importForm.parsedData.length - 5} more records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="bg-white">
          <Button color="secondary" outline onClick={() => setImportModal(false)}>
            Cancel
          </Button>
          <Button
            color="primary"
            className="fw-bold px-4"
            disabled={importForm.parsedData.length === 0 || btnLoading}
            onClick={handleExecuteImport}
          >
            {btnLoading ? <Spinner size="sm" /> : `Import ${importForm.parsedData.length} Contacts`}
          </Button>
        </ModalFooter>
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          MODAL: DIRECT SEND (WHATSAPP, SMS, RCS, EMAIL)
      ══════════════════════════════════════════════════════════ */}
      <Modal isOpen={directSendModal} toggle={() => setDirectSendModal(false)} centered size="md">
        <ModalHeader toggle={() => setDirectSendModal(false)} className="bg-dark text-white">
          <FaPaperPlane className="me-2 text-warning" /> Direct Multi-Channel Dispatch
        </ModalHeader>
        <Form onSubmit={handleDirectSend}>
          <ModalBody className="p-4 bg-light">
            <FormGroup>
              <Label className="fw-bold small text-dark">Select Delivery Channel *</Label>
              <div className="d-flex gap-2">
                {[
                  { id: "WHATSAPP", label: "WhatsApp", icon: FaWhatsapp, color: "success" },
                  { id: "SMS", label: "SMS", icon: FaCommentAlt, color: "primary" },
                  { id: "RCS", label: "RCS", icon: FaComments, color: "info" },
                  { id: "EMAIL", label: "Email", icon: FaEnvelope, color: "warning" },
                ].map(ch => {
                  const Icon = ch.icon;
                  const isSelected = directSendForm.channel === ch.id;
                  return (
                    <Button
                      key={ch.id}
                      type="button"
                      size="sm"
                      color={isSelected ? ch.color : "light"}
                      className={`flex-fill fw-bold py-2 border d-flex flex-column align-items-center gap-1 ${isSelected ? "text-white shadow-sm" : "text-muted"}`}
                      onClick={() => setDirectSendForm({ ...directSendForm, channel: ch.id })}
                    >
                      <Icon size={16} />
                      <span style={{ fontSize: "11px" }}>{ch.label}</span>
                    </Button>
                  );
                })}
              </div>
            </FormGroup>

            <FormGroup>
              <Label className="fw-bold small text-dark">
                Recipient ({directSendForm.channel === "EMAIL" ? "Email Address" : (directSendForm.channel === "WHATSAPP" ? "WhatsApp Number" : "Mobile Number")}) *
              </Label>
              <Input
                placeholder={directSendForm.channel === "EMAIL" ? "recipient@example.com" : "9876543210 or +919876543210"}
                value={directSendForm.recipient}
                onChange={(e) => setDirectSendForm({ ...directSendForm, recipient: e.target.value })}
                required
              />
              {directSendForm.recipientName && (
                <small className="text-muted d-block mt-0.5">Contact: {directSendForm.recipientName}</small>
              )}
            </FormGroup>

            {directSendForm.channel === "EMAIL" && (
              <FormGroup>
                <Label className="fw-bold small text-dark">Email Subject *</Label>
                <Input
                  placeholder="e.g. Your verification code / order update"
                  value={directSendForm.subject}
                  onChange={(e) => setDirectSendForm({ ...directSendForm, subject: e.target.value })}
                  required
                />
              </FormGroup>
            )}

            <FormGroup className="mb-0">
              <Label className="fw-bold small text-dark">Message Content *</Label>
              <Input
                type="textarea"
                rows={4}
                placeholder="Type your message content..."
                value={directSendForm.message}
                onChange={(e) => setDirectSendForm({ ...directSendForm, message: e.target.value })}
                required
              />
              <div className="d-flex justify-content-between align-items-center mt-1">
                <small className="text-muted">{directSendForm.message.length} characters</small>
                <small className="text-success fw-semibold">
                  <FaCheck size={10} className="me-1" />
                  Direct Gateway Delivery
                </small>
              </div>
            </FormGroup>
          </ModalBody>
          <ModalFooter className="bg-white">
            <Button color="secondary" outline onClick={() => setDirectSendModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={btnLoading} className="fw-bold px-4">
              {btnLoading ? <Spinner size="sm" /> : (
                <>
                  <FaPaperPlane size={12} className="me-1.5" /> Send Now
                </>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
};

export default CampaignLists;
