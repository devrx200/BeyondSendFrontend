import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Badge,
  Row,
  Col,
  InputGroup,
  InputGroupText,
  Collapse
} from "reactstrap";
import {
  FaBars,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaKey,
  FaSyncAlt,
  FaSearch,
  FaChartPie
} from "react-icons/fa";
import Swal from "sweetalert2";
import apiClient from "@apiService";
import { PageLoader } from "@/components";
import IconPicker from "../../components/common/IconPicker";
import { ICONS } from "@/utilities/icons";

const AVAILABLE_ROLES = ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"];
const AVAILABLE_PERMS = ["whatsapp", "sms", "rcs", "voice", "email"];

const ROLE_CONFIG = {
  ADMIN: "danger",
  DEVOPS: "info",
  RESELLER: "success",
  CLIENT: "primary",
};

const SidebarMenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  // IconPicker State
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerTarget, setIconPickerTarget] = useState("menu"); // "menu" or "sub"

  // Menu Modal State
  const [menuModal, setMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [menuForm, setMenuForm] = useState({
    id: "",
    labelEn: "",
    labelHi: "",
    icon: "FaChartPie",
    path: "",
    order: 0,
    allowedRoles: ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
    requiredPerm: "",
    group: "admin",
    isActive: true
  });

  // Submenu Modal State
  const [subModal, setSubModal] = useState(false);
  const [parentMenuId, setParentMenuId] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({
    id: "",
    labelEn: "",
    labelHi: "",
    icon: "FaFileAlt",
    path: "",
    order: 0,
    allowedRoles: ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
    requiredPerm: "",
    isActive: true
  });

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/sidebar-menus/list");
      const list = res?.data?.data || res?.data || [];
      setMenus(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Fetch sidebar menus error:", err);
      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: err?.response?.data?.message || "Could not load sidebar menus."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Toggle Active on Main Menu ──
  const handleToggleMenu = async (item) => {
    try {
      await apiClient.patch(`/sidebar-menus/toggle/${item._id}`);
      setMenus((prev) =>
        prev.map((m) => (m._id === item._id ? { ...m, isActive: !m.isActive } : m))
      );
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to toggle status", "error");
    }
  };

  // ── Open Create / Edit Menu Modal ──
  const handleOpenMenuModal = (menu = null) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        id: menu.id || "",
        labelEn: menu.labelEn || "",
        labelHi: menu.labelHi || "",
        icon: menu.icon || "FaChartPie",
        path: menu.path || "",
        order: menu.order || 0,
        allowedRoles: menu.allowedRoles || ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
        requiredPerm: menu.requiredPerm || "",
        group: menu.group || "admin",
        isActive: menu.isActive !== false
      });
    } else {
      setEditingMenu(null);
      setMenuForm({
        id: "",
        labelEn: "",
        labelHi: "",
        icon: "FaChartPie",
        path: "",
        order: menus.length + 1,
        allowedRoles: ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
        requiredPerm: "",
        group: "admin",
        isActive: true
      });
    }
    setMenuModal(true);
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!menuForm.labelEn.trim()) {
      Swal.fire("Required", "English Label is required", "warning");
      return;
    }

    try {
      if (editingMenu) {
        await apiClient.put(`/sidebar-menus/update/${editingMenu._id}`, menuForm);
        Swal.fire("Updated", "Sidebar section updated successfully!", "success");
      } else {
        await apiClient.post("/sidebar-menus/create", menuForm);
        Swal.fire("Created", "New sidebar section created!", "success");
      }
      setMenuModal(false);
      fetchMenus();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to save menu", "error");
    }
  };

  // ── Open Create / Edit Submenu Modal ──
  const handleOpenSubModal = (parentMenu, sub = null) => {
    setParentMenuId(parentMenu._id);
    if (sub) {
      setEditingSub(sub);
      setSubForm({
        id: sub.id || "",
        labelEn: sub.labelEn || "",
        labelHi: sub.labelHi || "",
        icon: sub.icon || "FaFileAlt",
        path: sub.path || "",
        order: sub.order || 0,
        allowedRoles: sub.allowedRoles || ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
        requiredPerm: sub.requiredPerm || "",
        isActive: sub.isActive !== false
      });
    } else {
      setEditingSub(null);
      setSubForm({
        id: "",
        labelEn: "",
        labelHi: "",
        icon: "FaFileAlt",
        path: "",
        order: (parentMenu.submenu || []).length + 1,
        allowedRoles: ["ADMIN", "DEVOPS", "RESELLER", "CLIENT"],
        requiredPerm: "",
        isActive: true
      });
    }
    setSubModal(true);
  };

  const handleSaveSub = async (e) => {
    e.preventDefault();
    if (!subForm.labelEn.trim()) {
      Swal.fire("Required", "English Label is required", "warning");
      return;
    }

    try {
      if (editingSub) {
        await apiClient.put(
          `/sidebar-menus/sub-item/update/${parentMenuId}/${editingSub.id}`,
          subForm
        );
        Swal.fire("Updated", "Submenu item updated!", "success");
      } else {
        await apiClient.post(`/sidebar-menus/sub-item/add/${parentMenuId}`, subForm);
        Swal.fire("Added", "Submenu item added!", "success");
      }
      setSubModal(false);
      fetchMenus();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to save sub-item", "error");
    }
  };

  // ── Delete Main Menu ──
  const handleDeleteMenu = async (item) => {
    const result = await Swal.fire({
      title: `Delete Section '${item.labelEn}'?`,
      text: "This will remove this section and all its submenus from the sidebar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#d33"
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/sidebar-menus/delete/${item._id}`);
      Swal.fire("Deleted", "Sidebar section removed.", "success");
      fetchMenus();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to delete section", "error");
    }
  };

  // ── Delete Submenu ──
  const handleDeleteSub = async (parentItem, sub) => {
    const result = await Swal.fire({
      title: `Delete Submenu '${sub.labelEn}'?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#d33"
    });

    if (!result.isConfirmed) return;

    try {
      await apiClient.delete(`/sidebar-menus/sub-item/delete/${parentItem._id}/${sub.id}`);
      Swal.fire("Deleted", "Submenu item removed.", "success");
      fetchMenus();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to delete sub-item", "error");
    }
  };

  const toggleRoleInForm = (role, isSub = false) => {
    if (isSub) {
      setSubForm((prev) => {
        const roles = prev.allowedRoles || [];
        const next = roles.includes(role)
          ? roles.filter((r) => r !== role)
          : [...roles, role];
        return { ...prev, allowedRoles: next };
      });
    } else {
      setMenuForm((prev) => {
        const roles = prev.allowedRoles || [];
        const next = roles.includes(role)
          ? roles.filter((r) => r !== role)
          : [...roles, role];
        return { ...prev, allowedRoles: next };
      });
    }
  };

  // ── Icon Selection from IconPicker ──
  const handleSelectIcon = (iconName) => {
    if (iconPickerTarget === "menu") {
      setMenuForm((prev) => ({ ...prev, icon: iconName }));
    } else {
      setSubForm((prev) => ({ ...prev, icon: iconName }));
    }
  };

  const renderIconComponent = (iconName, size = 18) => {
    const IconComp = iconName && ICONS[iconName] ? ICONS[iconName] : FaChartPie;
    return <IconComp size={size} />;
  };

  if (loading) return <PageLoader message="Loading Sidebar Configuration..." />;

  return (
    <div className="telecom-module-wrapper">
      {/* ── HEADER ── */}
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20"
              style={{ width: "44px", height: "44px" }}
            >
              <FaBars size={20} className="text-white" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-white">Sidebar Menu Management</h5>
              <small className="text-white text-opacity-75">
                Configure dynamic navigation items, role permissions, and channel visibility
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              color="light"
              outline
              size="sm"
              onClick={fetchMenus}
              className="d-flex align-items-center gap-2"
            >
              <FaSyncAlt /> Refresh
            </Button>
            <Button
              color="primary"
              size="sm"
              onClick={() => handleOpenMenuModal()}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus /> New Section
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* ── MAIN MENU TABLE ── */}
      <Card className="adm-card border-0 shadow-sm">
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "45px" }}></th>
                  <th style={{ width: "65px" }}>Order</th>
                  <th>Section & Label</th>
                  <th>Icon & Identifier</th>
                  <th>Route Path</th>
                  <th>Allowed Roles</th>
                  <th>Channel Perm</th>
                  <th>Status</th>
                  <th className="text-end" style={{ minWidth: "160px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {menus.map((m) => {
                  const isExpanded = expandedRows[m._id];
                  const hasSub = Array.isArray(m.submenu) && m.submenu.length > 0;

                  return (
                    <React.Fragment key={m._id}>
                      <tr className={m.isActive ? "" : "opacity-75 bg-light"}>
                        <td className="text-center">
                          {hasSub && (
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-decoration-none p-0"
                              onClick={() => toggleRow(m._id)}
                            >
                              {isExpanded ? (
                                <FaChevronDown size={12} />
                              ) : (
                                <FaChevronRight size={12} />
                              )}
                            </button>
                          )}
                        </td>
                        <td>
                          <Badge color="dark" pill>
                            #{m.order || 0}
                          </Badge>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="text-primary fs-5">
                              {renderIconComponent(m.icon)}
                            </span>
                            <div>
                              <div className="fw-bold text-dark">{m.labelEn}</div>
                              {m.labelHi && (
                                <small className="text-muted">{m.labelHi}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary me-1">{m.icon}</span>
                          <small className="text-muted d-block">{m.id}</small>
                        </td>
                        <td>
                          <code className="text-primary">{m.path || "— (Menu Group)"}</code>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {(m.allowedRoles || []).map((r) => {
                              const cfg = ROLE_CONFIG[r];
                              return (
                                <span
                                  key={r}
                                  style={{
                                    fontSize: "10.5px",
                                    fontWeight: "700",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    backgroundColor: cfg ? cfg.inactiveBg : "#f1f5f9",
                                    color: cfg ? cfg.inactiveText : "#475569",
                                    border: `1px solid ${cfg ? cfg.inactiveBorder : "#cbd5e1"}`
                                  }}
                                >
                                  {r}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          {m.requiredPerm ? (
                            <Badge color="primary" pill>
                              <FaKey className="me-1" size={10} />
                              {m.requiredPerm}
                            </Badge>
                          ) : (
                            <span className="text-muted small">Global</span>
                          )}
                        </td>
                        <td>
                          <Button
                            size="sm"
                            color={m.isActive ? "success" : "secondary"}
                            outline
                            className="py-0 px-2"
                            onClick={() => handleToggleMenu(m)}
                          >
                            {m.isActive ? <FaCheck className="me-1" /> : <FaTimes className="me-1" />}
                            {m.isActive ? "Active" : "Disabled"}
                          </Button>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-1.5 align-items-center">
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-info"
                              onClick={() => handleOpenSubModal(m)}
                              data-tt="Add Sub-Item"
                            >
                              <FaPlus size={11} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn"
                              onClick={() => handleOpenMenuModal(m)}
                              data-tt="Edit Section"
                            >
                              <FaEdit size={11} />
                            </Button>
                            <Button
                              size="sm"
                              color="light"
                              className="adm-icon-btn is-danger"
                              onClick={() => handleDeleteMenu(m)}
                              data-tt="Delete Section"
                            >
                              <FaTrash size={11} />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* ── SUB-ITEMS EXPANDED ROW ── */}
                      {hasSub && (
                        <tr>
                          <td colSpan={9} className="p-0 border-0">
                            <Collapse isOpen={isExpanded}>
                              <div className="bg-light p-3 border-top border-bottom">
                                <h6 className="fw-bold mb-2 small text-secondary">
                                  Sub-Items for &quot;{m.labelEn}&quot; ({m.submenu.length})
                                </h6>
                                <Table size="sm" className="bg-white rounded mb-0">
                                  <thead>
                                    <tr>
                                      <th style={{ width: "50px" }}>Order</th>
                                      <th>Title</th>
                                      <th>Icon</th>
                                      <th>Path</th>
                                      <th>Roles</th>
                                      <th>Perm</th>
                                      <th>Status</th>
                                      <th className="text-end">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {m.submenu.map((sub) => (
                                      <tr key={sub.id}>
                                        <td>
                                          <Badge color="light" className="text-dark border">
                                            #{sub.order || 0}
                                          </Badge>
                                        </td>
                                        <td>
                                          <div className="d-flex align-items-center gap-2 fw-semibold">
                                            <span className="text-secondary">
                                              {renderIconComponent(sub.icon, 15)}
                                            </span>
                                            <div>
                                              {sub.labelEn}
                                              {sub.labelHi && (
                                                <small className="text-muted d-block">
                                                  {sub.labelHi}
                                                </small>
                                              )}
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <code>{sub.icon}</code>
                                        </td>
                                        <td>
                                          <code className="text-success">{sub.path}</code>
                                        </td>
                                        <td>
                                          <div className="d-flex flex-wrap gap-1">
                                            {(sub.allowedRoles || []).map((r) => {
                                              const cfg = ROLE_CONFIG[r];
                                              return (
                                                <span
                                                  key={r}
                                                  style={{
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    padding: "1px 6px",
                                                    borderRadius: "10px",
                                                    backgroundColor: cfg ? cfg.inactiveBg : "#f1f5f9",
                                                    color: cfg ? cfg.inactiveText : "#475569",
                                                    border: `1px solid ${cfg ? cfg.inactiveBorder : "#cbd5e1"}`
                                                  }}
                                                >
                                                  {r}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </td>
                                        <td>
                                          {sub.requiredPerm ? (
                                            <Badge color="info" pill>
                                              {sub.requiredPerm}
                                            </Badge>
                                          ) : (
                                            <span className="text-muted small">—</span>
                                          )}
                                        </td>
                                        <td>
                                          <Badge
                                            color={sub.isActive !== false ? "success" : "danger"}
                                          >
                                            {sub.isActive !== false ? "Active" : "Disabled"}
                                          </Badge>
                                        </td>
                                        <td className="text-end">
                                          <Button
                                            size="sm"
                                            color="primary"
                                            outline
                                            className="me-1 py-0 px-2"
                                            onClick={() => handleOpenSubModal(m, sub)}
                                          >
                                            <FaEdit size={10} />
                                          </Button>
                                          <Button
                                            size="sm"
                                            color="danger"
                                            outline
                                            className="py-0 px-2"
                                            onClick={() => handleDeleteSub(m, sub)}
                                          >
                                            <FaTrash size={10} />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── MODAL: MAIN MENU EDIT / CREATE ── */}
      <Modal isOpen={menuModal} toggle={() => setMenuModal(false)} size="lg" centered>
        <Form onSubmit={handleSaveMenu}>
          <ModalHeader toggle={() => setMenuModal(false)}>
            {editingMenu ? `Edit Section: ${editingMenu.labelEn}` : "New Sidebar Section"}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Section Identifier (ID)</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. whatsapp-modules"
                    value={menuForm.id}
                    onChange={(e) => setMenuForm({ ...menuForm, id: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Display Order</Label>
                  <Input
                    type="number"
                    value={menuForm.order}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, order: Number(e.target.value) })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Label (English)</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. WhatsApp"
                    value={menuForm.labelEn}
                    onChange={(e) => setMenuForm({ ...menuForm, labelEn: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Label (Hindi)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. व्हाट्सएप"
                    value={menuForm.labelHi}
                    onChange={(e) => setMenuForm({ ...menuForm, labelHi: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Icon Picker</Label>
                  <InputGroup>
                    <InputGroupText className="bg-light">
                      {renderIconComponent(menuForm.icon, 18)}
                    </InputGroupText>
                    <Input
                      type="text"
                      value={menuForm.icon}
                      onChange={(e) => setMenuForm({ ...menuForm, icon: e.target.value })}
                    />
                    <Button
                      color="primary"
                      type="button"
                      onClick={() => {
                        setIconPickerTarget("menu");
                        setIconPickerOpen(true);
                      }}
                      className="d-flex align-items-center gap-1"
                    >
                      <FaSearch size={12} /> Choose Icon
                    </Button>
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Direct Route Path (Leave blank for accordion)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. /authorized/dashboard"
                    value={menuForm.path}
                    onChange={(e) => setMenuForm({ ...menuForm, path: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Required Channel Permission</Label>
                  <Input
                    type="select"
                    value={menuForm.requiredPerm}
                    onChange={(e) =>
                      setMenuForm({ ...menuForm, requiredPerm: e.target.value })
                    }
                  >
                    <option value="">None (Always visible if role matches)</option>
                    {AVAILABLE_PERMS.map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()} Permission
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Menu Category / Group</Label>
                  <Input
                    type="select"
                    value={menuForm.group}
                    onChange={(e) => setMenuForm({ ...menuForm, group: e.target.value })}
                  >
                    <option value="admin">Admin Core</option>
                    <option value="channel">Channel Communication</option>
                    <option value="telecom">Telecom & Audience</option>
                    <option value="api">APIs & Webhooks</option>
                    <option value="system">System & Security</option>
                    <option value="support">Support & Feedback</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label className="fw-bold small d-block">Allowed User Roles</Label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVAILABLE_ROLES.map((role) => {
                      const checked = (menuForm.allowedRoles || []).includes(role);
                      return (
                        <Button
                          key={role}
                          type="button"
                          size="sm"
                          color={ROLE_CONFIG[role]}
                          outline={!checked}
                          className="fw-semibold"
                          onClick={() => toggleRoleInForm(role, false)}
                        >
                          {checked ? <FaCheck className="me-1" /> : null}
                          {role}
                        </Button>
                      );
                    })}
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setMenuModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save Section
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── MODAL: SUBMENU EDIT / CREATE ── */}
      <Modal isOpen={subModal} toggle={() => setSubModal(false)} size="lg" centered>
        <Form onSubmit={handleSaveSub}>
          <ModalHeader toggle={() => setSubModal(false)}>
            {editingSub ? `Edit Submenu: ${editingSub.labelEn}` : "Add Submenu Item"}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Submenu ID</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. wa-templates"
                    value={subForm.id}
                    onChange={(e) => setSubForm({ ...subForm, id: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Display Order</Label>
                  <Input
                    type="number"
                    value={subForm.order}
                    onChange={(e) =>
                      setSubForm({ ...subForm, order: Number(e.target.value) })
                    }
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Label (English)</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Templates"
                    value={subForm.labelEn}
                    onChange={(e) => setSubForm({ ...subForm, labelEn: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Label (Hindi)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. टेम्पलेट्स"
                    value={subForm.labelHi}
                    onChange={(e) => setSubForm({ ...subForm, labelHi: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Icon Picker</Label>
                  <InputGroup>
                    <InputGroupText className="bg-light">
                      {renderIconComponent(subForm.icon, 18)}
                    </InputGroupText>
                    <Input
                      type="text"
                      value={subForm.icon}
                      onChange={(e) => setSubForm({ ...subForm, icon: e.target.value })}
                    />
                    <Button
                      color="primary"
                      type="button"
                      onClick={() => {
                        setIconPickerTarget("sub");
                        setIconPickerOpen(true);
                      }}
                      className="d-flex align-items-center gap-1"
                    >
                      <FaSearch size={12} /> Choose Icon
                    </Button>
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Target Path</Label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. /authorized/templates/whatsapp"
                    value={subForm.path}
                    onChange={(e) => setSubForm({ ...subForm, path: e.target.value })}
                  />
                </FormGroup>
              </Col>
              <Col md={6}>
                <FormGroup>
                  <Label className="fw-bold small">Required Permission</Label>
                  <Input
                    type="select"
                    value={subForm.requiredPerm}
                    onChange={(e) =>
                      setSubForm({ ...subForm, requiredPerm: e.target.value })
                    }
                  >
                    <option value="">None</option>
                    {AVAILABLE_PERMS.map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()} Permission
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col md={12}>
                <FormGroup>
                  <Label className="fw-bold small d-block">Allowed Roles</Label>
                  <div className="d-flex flex-wrap gap-2">
                    {AVAILABLE_ROLES.map((role) => {
                      const checked = (subForm.allowedRoles || []).includes(role);
                      return (
                        <Button
                          key={role}
                          type="button"
                          size="sm"
                          color={ROLE_CONFIG[role]}
                          outline={!checked}
                          className="fw-semibold"
                          onClick={() => toggleRoleInForm(role, true)}
                        >
                          {checked ? <FaCheck className="me-1" /> : null}
                          {role}
                        </Button>
                      );
                    })}
                  </div>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setSubModal(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save Sub-Item
            </Button>
          </ModalFooter>
        </Form>
      </Modal>

      {/* ── VISUAL ICON PICKER MODAL ── */}
      {iconPickerOpen && (
        <IconPicker
          isOpen={iconPickerOpen}
          toggle={() => setIconPickerOpen(false)}
          onSelect={handleSelectIcon}
        />
      )}
    </div>
  );
};

export default SidebarMenuManagement;
