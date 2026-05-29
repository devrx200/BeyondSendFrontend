import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Badge, Col , Row
} from "reactstrap";
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBullhorn } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const NewUpdates = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    titleEng: "",
    titleHin: "",
    link: "",
    isExternal: false,
    openInNewTab: false,
    displayOrder: "",
    isNew: true,
    isActive: false,
  });

  /* ================= LOAD LIST ================= */
  const loadNotices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/notice-ticker/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setList(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to load notices", "error");
    }
  };

  useEffect(() => {
    loadNotices();
  }, [token]);

  /* ================= MODAL ================= */
  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      titleEng: "",
      titleHin: "",
      link: "",
      isExternal: false,
      openInNewTab: false,
      displayOrder: "",
      isNew: true
    });
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      titleEng: item.titleEng,
      titleHin: item.titleHin || "",
      link: item.link,
      isExternal: item.isExternal,
      openInNewTab: item.openInNewTab,
      displayOrder: item.displayOrder,
      isNew: item.isNew,
      isActive: item.isActive ? true : false
    });
    setModal(true);
  };

  /* ================= DELETE (SOFT) ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Notice?",
      text: "This notice will be hidden from the website",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/api/notice-ticker/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire("Success", res.data.message, "success");
      loadNotices();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titleEng || !formData.link) {
      Swal.fire("Required", "Title (English) and Link are required", "warning");
      return;
    }

    try {
      let res;

      if (editingId) {
        res = await axios.put(
          `${API_URL}/api/notice-ticker/${editingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        res = await axios.post(
          `${API_URL}/api/notice-ticker`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      Swal.fire("Success", res.data.message, "success");
      toggleModal();
      loadNotices();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <Card>
      <CardBody>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            <FaBullhorn className="me-2 text-danger" />
            Notice Ticker Management – New Update Slider On Home Page
          </h4>

          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add Notice
          </Button>
        </div>

        {/* TABLE */}
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Order</th>
              <th>New</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No notices found
                </td>
              </tr>
            ) : (
              list.map((n, i) => (
                <tr key={n._id}>
                  <td>{i + 1}</td>
                  <td>{n.titleEng}</td>
                  <td>{n.displayOrder}</td>
                  <td>
                    <Badge color={n.isNew ? "warning" : "secondary"}>
                      {n.isNew ? "NEW" : "OLD"}
                    </Badge>
                  </td>
                  <td>
                    <Badge color={n.isActive ? "success" : "danger"}>
                      {n.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      color="warning"
                      className="me-2"
                      onClick={() => handleEdit(n)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(n._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* ADD / EDIT MODAL */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingId ? "Edit Notice" : "Add Notice"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>

              <FormGroup>
                <Label>Title (English) *</Label>
                <Input
                  value={formData.titleEng}
                  onChange={e => setFormData({ ...formData, titleEng: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input
                  value={formData.titleHin}
                  onChange={e => setFormData({ ...formData, titleHin: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>Link *</Label>
                <Input
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  required
                />
              </FormGroup>

              {/* EXTERNAL LINK */}
              <FormGroup>
                <Label>External Link</Label>
                <Input
                  type="select"
                  value={String(formData.isExternal)}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      isExternal: e.target.value === "true",
                      openInNewTab: e.target.value === "true" ? formData.openInNewTab : false
                    })
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Input>
              </FormGroup>
              <Row>
              <Col xs={6}>
                <Label className="fw-semibold small">Status</Label>
                <Input type="select" name="isActive" value={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.value })}>
                  <option value="true">✅ Active</option>
                  <option value="false">⛔ Inactive</option>
                </Input>
              </Col>
               <Col xs={6}>
               <FormGroup>
                <Label>Open in New Tab</Label>
                <Input
                  type="select"
                  value={String(formData.openInNewTab)}
                  disabled={!formData.isExternal}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      openInNewTab: e.target.value === "true"
                    })
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Input>
              </FormGroup>
               </Col>
              </Row>

              <FormGroup>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={e => setFormData({ ...formData, displayOrder: e.target.value })}
                />
              </FormGroup>

              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={e => setFormData({ ...formData, isNew: e.target.checked })}
                  />{" "}
                  Mark as New
                </Label>
              </FormGroup>

            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {editingId ? "Update" : "Save"}
              </Button>
              <Button color="secondary" onClick={toggleModal}>
                <FaTimes className="me-2" />
                Cancel
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

      </CardBody>
    </Card>
  );
};

export default NewUpdates;
