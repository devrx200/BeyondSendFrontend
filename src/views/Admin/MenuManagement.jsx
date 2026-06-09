import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import {
  Card,
  CardBody,
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
} from "reactstrap";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "../../contexts/LanguageContext";
import Swal from "sweetalert2";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const MenuManagement = () => {
  /* ================= STATE ================= */
  // const [menus, setMenus] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // { type, menuId, submenuId, childId }
  const { isHindi } = useLanguage();
  const [form, setForm] = useState({
    titleEng: "",
    titleHi: "",
    path: "",
    isExternal: false,
    openInNewTab: false,
    order: 0,
    isActive: true,
    parentMenuId: "",
    parentSubmenuId: "",
    isDynamic: false,
  });

  /* ================= FETCH ================= */
  const loadMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/menu-list`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMenuItems(res.data.data || []);
    } catch (err) {
      console.error("Menu fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenus();
  }, []);

 const saveMenuOrder = async (updatedMenus) => {
  try {
    const token = sessionStorage.getItem("authToken");
    

    await axios.post(`${API}/api/menu/reorder`, 
      {
        menus: updatedMenus, // <-- full ordered tree
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Menu Order Saved Successfully");
  } catch (err) {
    console.error(
      "Order save failed",
      err?.response?.data || err.message
    );
    alert("Failed to save menu order");
  }
};


  const reorderArray = (arr, fromIndex, toIndex) => {
    const updated = [...arr];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // reassign order
    return updated.map((item, idx) => ({
      ...item,
      order: idx + 1,
    }));
  };

  const moveMainMenu = (index, direction) => {
    const newIndex = direction === "UP" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;
    const updated = reorderArray(menuItems, index, newIndex);
    setMenuItems(updated);
    saveMenuOrder(updated); // ✅ SAVE
  };

  const moveSubMenu = (parentId, index, direction) => {
    const updatedMenus = menuItems.map((menu) => {
      if (menu._id !== parentId) return menu;
      const newIndex = direction === "UP" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= menu.submenu.length) return menu;
      return {
        ...menu,
        submenu: reorderArray(menu.submenu, index, newIndex),
      };
    });
    setMenuItems(updatedMenus);
    saveMenuOrder(updatedMenus); // ✅ SAVE
  };

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      titleEng: "",
      titleHi: "",
      path: "",
      isExternal: false,
      openInNewTab: false,
      order: 0,
      isActive: true,
      parentMenuId: "",
      parentSubmenuId: "",
      isDynamic: false,
      isImportant : false,
    });
  };

  /* ================= FORM ================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================= CREATE ================= */
  const createMenu = async () => {
    await axios.post(`${API}/api/menu`, form, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  };

  /* ================= UPDATE ================= */
  const updateMenu = async () => {
    if (editing.type === "MENU") {
      await axios.put(`${API}/api/menu/${editing.menuId}`, form ,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
    if (editing.type === "SUBMENU") {
      await axios.put(
        `${API}/api/menu/${editing.menuId}/submenu/${editing.submenuId}`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
    if (editing.type === "CHILD") {
      await axios.put(
        `${API}/api/menu/${editing.menuId}/submenu/${editing.submenuId}/child/${editing.childId}`,
        form,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }
  };

  /* ================= DELETE ================= */
  const deleteMenu = async ({ type, menuId, submenuId, childId }) => {
   const confirmText = isHindi
    ? "क्या आप वाकई इसे डिलीट करना चाहते हैं?"
    : "Are you sure you want to delete this?";

  const successText = isHindi
    ? "सफलतापूर्वक डिलीट किया गया"
    : "Deleted successfully";

  const cancelText = isHindi
    ? "डिलीट प्रक्रिया रद्द कर दी गई"
    : "Delete cancelled";

  const result = await Swal.fire({
    title: isHindi ? "क्या आप सुनिश्चित हैं?" : "Are you sure?",
    text: confirmText,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: isHindi ? "हाँ, डिलीट करें" : "Yes, Delete",
    cancelButtonText: isHindi ? "रद्द करें" : "Cancel",
  });

  if (!result.isConfirmed) {
    Swal.fire({
      icon: "info",
      title: cancelText,
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }
try {
    if (type === "MENU") {
      await axios.delete(`${API}/api/menu/${menuId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (type === "SUBMENU") {
      await axios.delete(`${API}/api/menu/${menuId}/submenu/${submenuId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    if (type === "CHILD") {
      await axios.delete(
        `${API}/api/menu/${menuId}/api/submenu/${submenuId}/child/${childId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    Swal.fire({
      icon: "success",
      title: successText,
      timer: 1500,
      showConfirmButton: false,
    });
    loadMenus();
     } catch (error) {
    Swal.fire({
      icon: "error",
      title: isHindi ? "कुछ गलत हो गया" : "Something went wrong",
      text: error?.response?.data?.message || error.message,
    });
  }
  };

  /* ================= EDIT ================= */
  const handleEdit = ({ type, menuId, submenuId, childId, data }) => {
    setEditing({ type, menuId, submenuId, childId });

    setForm({
      titleEng: data.titleEng,
      titleHi: data.titleHi,
      path: data.path,
      isExternal: data.isExternal,
      openInNewTab: data.openInNewTab,
      order: data.order,
      isActive: data.isActive,
      parentMenuId: menuId || "",
      parentSubmenuId: submenuId || "",
      isDynamic : data.isDynamic|| false,
      isImportant : data.isImportant|| false,
    });

    setModal(true);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await updateMenu();
         Swal.fire({
        icon: "success",
        title: isHindi
          ? "मेनू सफलतापूर्वक अपडेट किया गया"
          : "Menu updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      } else {
        await createMenu();
         Swal.fire({
        icon: "success",
        title: isHindi
          ? "मेनू सफलतापूर्वक जोड़ा गया"
          : "Menu added successfully",
        timer: 1500,
        showConfirmButton: false,
      });
      }

      toggleModal();
      loadMenus();
    } catch (err) {
      console.error("Save error", err);
       Swal.fire({
      icon: "error",
      title: isHindi ? "कुछ गलत हो गया" : "Something went wrong",
      text: err?.response?.data?.message || err.message,
    });
    }
  };

  /* ================= TREE RENDER ================= */
  const renderTree = (menuItems) =>
    menuItems.map((menu, index) => (
      <Fragment key={menu._id || `menu-${index}`}>
        {/* MAIN MENU */}
        <tr className="bg-danger">
          <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff", fontWeight:"600" , fontSize:"14px", width:"30px" }}>{index + 1}</td>
          <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff", fontWeight:"600" , fontSize:"14px", width:"200px" }}>{menu.titleEng}</td>
           <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff",fontWeight:"600" , fontSize:"14px" , width:"200px"}}>{menu.titleHi}</td>
          <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff",fontWeight:"600" , fontSize:"14px" ,width:"240px"}}>{menu.path}</td>
          <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff",fontWeight:"600" , fontSize:"14px", width:"140px" }}>
            <Badge color="primary">Menu</Badge>
          </td>
          <td style={{ color:"#000000ff" , backgroundColor:"#b5fde9ff",fontWeight:"600" , fontSize:"14px",width:"300px" }}>
            <Button
              size="sm"
              color="warning"
              onClick={() =>
                handleEdit({
                  type: "MENU",
                  menuId: menu._id,
                  data: menu,
                })
              }
            >
              Edit
            </Button>{" "}
            <Button
              size="sm"
              color="danger"
              onClick={() =>
                deleteMenu({
                  type: "MENU",
                  menuId: menu._id,
                })
              }
            >
              Delete
            </Button>
            <Button
              size="sm"
              color="secondary"
              disabled={index === 0}
              onClick={() => moveMainMenu(index, "UP")}
            >
              ↑
            </Button>{" "}
            <Button
              size="sm"
              color="secondary"
              disabled={index === menuItems.length - 1}
              onClick={() => moveMainMenu(index, "DOWN")}
            >
              ↓
            </Button>
          </td >
          
        </tr>

        {/* SUBMENU */}
        {menu.submenu?.map((sub, subIndex) => (
          <Fragment key={sub._id || `sub-${subIndex}`}>
            <tr>
              <td style={{ paddingLeft:"30px", color:"green" , fontWeight:"500" , fontSize:"14px"}}>{subIndex + 1}</td>
              <td style={{ paddingLeft:"50px", color:"green" , fontWeight:"500" , fontSize:"14px" }}>{sub.titleEng}</td>
           <td style={{ color:"green" , fontWeight:"500" , fontSize:"14px" }}>{sub.titleHi}</td>

              <td>{sub.path}</td>
              <td>
                <Badge color="info">Submenu</Badge>
              </td>
              <td>
                <Button
                  size="sm"
                  color="warning"
                  onClick={() =>
                    handleEdit({
                      type: "SUBMENU",
                      menuId: menu._id,
                      submenuId: sub._id,
                      data: sub,
                    })
                  }
                >
                  Edit
                </Button>{" "}
                <Button
                  size="sm"
                  color="danger"
                  onClick={() =>
                    deleteMenu({
                      type: "SUBMENU",
                      menuId: menu._id,
                      submenuId: sub._id,
                    })
                  }
                >
                  Delete
                </Button>
                <Button
                    size="sm"
                   color="secondary"
                  disabled={subIndex === 0}
                  onClick={() => moveSubMenu(menu._id, subIndex, "UP")}
                >
                  ↑
                </Button>{" "}
                <Button
                  size="sm"
                  color="secondary"
                  disabled={subIndex === menu.submenu.length - 1}
                  onClick={() => moveSubMenu(menu._id, subIndex, "DOWN")}
                >
                  ↓
                </Button>
              </td>
            </tr>

            {/* CHILD */}
            {sub.submenu?.map((child , index2) => (
              <tr key={child._id || `child-${index2}`}>
              <td style={{paddingLeft: 80,color:"green" , fontWeight:"500" , fontSize:"14px"}}>{index2 + 1}</td>

                <td style={{ paddingLeft: 80 , color:"blue" , fontWeight:"500"}}>{child.titleEng}</td>
                <td >{child.titleHi}</td>

                <td>{child.path}</td>
                <td>
                  <Badge color="secondary">Child</Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    color="warning"
                    onClick={() =>
                      handleEdit({
                        type: "CHILD",
                        menuId: menu._id,
                        submenuId: sub._id,
                        childId: child._id,
                        data: child,
                      })
                    }
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() =>
                      deleteMenu({
                        type: "CHILD",
                        menuId: menu._id,
                        submenuId: sub._id,
                        childId: child._id,
                      })
                    }
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Fragment>
        ))}
      </Fragment>
    ));

  /* ================= UI ================= */
  return (
    <Card className="shadow">
      <CardBody>
        <div className="d-flex justify-content-between mb-3">
          <h4>Menu Management</h4>
          <Button color="primary" onClick={toggleModal}>
            Add Menu
          </Button>
        </div>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Path</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : (
              renderTree(menuItems)
            )}
          </tbody>
        </Table>

        {/* MODAL */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editing ? "Edit Menu" : "Add Menu"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label>Title (English)</Label>
                <Input
                  name="titleEng"
                  value={form.titleEng}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input
                  name="titleHi"
                  value={form.titleHi}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Path</Label>
                <Input
                  name="path"
                  value={form.path}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label>Order</Label>
                <Input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  min="0"
                />
              </FormGroup>
              <FormGroup>
                <Label>Parent Menu (for Submenu)</Label>
                <Input
                  type="select"
                  name="parentMenuId"
                  value={form.parentMenuId}
                  onChange={handleChange}
                >
                  <option value="">None (Main Menu)</option>
                    {menuItems.map((menu, mIndex) => (
                      <option key={menu._id || `menu-opt-${mIndex}`} value={menu._id}>
                        {menu.titleEng}
                      </option>
                    ))}
                </Input>
              </FormGroup>
              {form.parentMenuId && (
                <FormGroup>
                  <Label>Parent Submenu (for Child Menu)</Label>
                  <Input
                    type="select"
                    name="parentSubmenuId"
                    value={form.parentSubmenuId}
                    onChange={handleChange}
                  >
                    <option value="">None (Submenu)</option>

                    {menuItems
                      .find((m) => m._id === form.parentMenuId)
                      ?.submenu?.map((sub, si) => (
                        <option key={sub._id || `sub-opt-${si}`} value={sub._id}>
                          {sub.titleEng}
                        </option>
                      ))}
                  </Input>
                </FormGroup>
              )}

              <FormGroup check>
                <Input
                  type="checkbox"
                  name="isExternal"
                  checked={form.isExternal}
                  onChange={handleChange}
                />{" "}
                External Link
              </FormGroup>

              <FormGroup check>
                <Input
                  type="checkbox"
                  name="openInNewTab"
                  checked={form.openInNewTab}
                  onChange={handleChange}
                />{" "}
                Open in New Tab
              </FormGroup>

              <FormGroup check>
                <Input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                />{" "}
                Active
              </FormGroup>
              <FormGroup check>
                <Input
                  type="checkbox"
                  name="isDynamic"
                  checked={form.isDynamic}
                  onChange={handleChange}
                />{" "}
                Dynamic
              </FormGroup>
              <FormGroup check>
                <Input
                  type="checkbox"
                  name="isImportant"
                  checked={form.isImportant}
                  onChange={handleChange}
                />{" "}
                Important
              </FormGroup>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                Save
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </CardBody>
    </Card>
  );
};

export default MenuManagement;
