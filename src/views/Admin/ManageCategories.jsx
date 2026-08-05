import { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup, Label,
  Input, Table, Spinner, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import axios from "axios";
import { FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";

const ManageCategories = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = sessionStorage.getItem("authToken");
  const { toasts, toast } = useToast();

  /* ---------- CREATE ---------- */
  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameHi, setCategoryNameHi] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  /* ---------- LIST ---------- */
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- EDIT ---------- */
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editEn, setEditEn] = useState("");
  const [editHi, setEditHi] = useState("");
  const [editStatus, setEditStatus] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);

  /* ---------- FETCH ---------- */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-categories`);
      setCategories(res.data.data);
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------- CREATE ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryNameEn || !categoryNameHi) {
      toast.warning("Both English & Hindi names are required");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await axios.post(`${API_URL}/api/create-category`, {
        categoryNameEn,
        categoryNameHi,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(res.data.message || "Category created successfully");
      setCategoryNameEn("");
      setCategoryNameHi("");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
    } finally {
      setBtnLoading(false);
    }
  };

  /* ---------- OPEN EDIT ---------- */
  const openEditModal = (cat) => {
    setEditId(cat._id);
    setEditEn(cat.categoryNameEn);
    setEditHi(cat.categoryNameHi);
    setEditStatus(cat.isActive);
    setEditModal(true);
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async () => {
    if (!editEn || !editHi) {
      toast.warning("Both fields are required");
      return;
    }

    try {
      setUpdateLoading(true);
      const res = await axios.put(
        `${API_URL}/api/update-category/${editId}`,
        {
          categoryNameEn: editEn,
          categoryNameHi: editHi,
          isActive: editStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success(res.data.message || "Category updated successfully");
      setEditModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    const isConfirmed = await wpSwal.confirm("Are you sure?", "This will permanently delete the category.");

    if (!isConfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/api/delete-category/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(res.data.message || "Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  /* ---------- UI ---------- */
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={toast.remove} />
      
      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="adm-page-title mb-1"><FaList className="me-2" /> Categories Management</h3>
            <p className="adm-page-subtitle mb-0 text-white">Manage page categories & translations for rich content</p>
          </div>
        </CardHeader>
      </Card>

      <Row>
        {/* ADD CATEGORY */}
        <Col md={4}>
          <Card className="wp-card">
            <CardHeader className="bg-primary text-white font-weight-bold">
              <FaPlus className="me-2" /> Add Category
            </CardHeader>
            <CardBody className="p-3">
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-semibold">Category Name (English)</Label>
                  <Input value={categoryNameEn} onChange={e => setCategoryNameEn(e.target.value)} placeholder="e.g. Schemes" />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-semibold">Category Name (Hindi)</Label>
                  <Input value={categoryNameHi} onChange={e => setCategoryNameHi(e.target.value)} placeholder="जैसे: योजनाएं" />
                </FormGroup>
                <Button block color="primary" disabled={btnLoading} className="mt-3">
                  {btnLoading ? <Spinner size="sm" /> : "Create Category"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* CATEGORY LIST */}
        <Col md={8}>
          <Card className="wp-card">
            <CardHeader className="bg-dark text-white font-weight-bold">
              <FaList className="me-2" /> Category List
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="text-center p-4"><Spinner /></div>
              ) : (
                <Table bordered hover responsive className="mb-0 wp-table">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>English Name</th>
                      <th>Hindi Name</th>
                      <th style={{ width: "100px" }}>Status</th>
                      <th style={{ width: "120px" }}>Created</th>
                      <th style={{ width: "100px" }} className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length ? categories.map((cat, i) => (
                      <tr key={cat._id}>
                        <td>{i + 1}</td>
                        <td className="fw-medium">{cat.categoryNameEn}</td>
                        <td>{cat.categoryNameHi}</td>
                        <td>
                          <Badge color={cat.isActive ? "success" : "danger"} className="px-2 py-1">
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                        <td className="text-end">
                          <Button size="sm" color="warning" className="me-1" onClick={() => openEditModal(cat)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" color="danger" onClick={() => handleDelete(cat._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No Categories Found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* EDIT MODAL */}
      <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
        <ModalHeader toggle={() => setEditModal(false)}>Edit Category</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="fw-semibold">Category Name (English)</Label>
            <Input value={editEn} onChange={e => setEditEn(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="fw-semibold">Category Name (Hindi)</Label>
            <Input value={editHi} onChange={e => setEditHi(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="fw-semibold">Status</Label>
            <Input
              type="select"
              value={editStatus}
              onChange={e => setEditStatus(e.target.value === "true")}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Input>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleUpdate} disabled={updateLoading}>
            {updateLoading ? <Spinner size="sm" /> : "Update"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default ManageCategories;
