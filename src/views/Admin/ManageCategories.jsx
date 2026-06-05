import { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup, Label,
  Input, Table, Spinner, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";


const ManageCategories = () => {
const API_URL = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
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
      Swal.fire("Error", "Failed to fetch categories", "error");
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
      Swal.fire("Required", "Both English & Hindi names are required", "warning");
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

      Swal.fire("Success", res.data.message, "success");
      setCategoryNameEn("");
      setCategoryNameHi("");
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Create failed", "error");
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
      Swal.fire("Required", "Both fields are required", "warning");
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

      Swal.fire("Success", res.data.message, "success");
      setEditModal(false);
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the category.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/api/delete-category/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      Swal.fire("Deleted", res.data.message, "success");
      fetchCategories();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="container-fluid py-4">
      <Row>
        {/* ADD CATEGORY */}
        <Col md={4}>
          <Card>
            <CardHeader className="bg-primary text-white">
              <FaPlus /> Add Category
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Category Name (English)</Label>
                  <Input value={categoryNameEn} onChange={e => setCategoryNameEn(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Category Name (Hindi)</Label>
                  <Input value={categoryNameHi} onChange={e => setCategoryNameHi(e.target.value)} />
                </FormGroup>
                <Button block color="primary" disabled={btnLoading}>
                  {btnLoading ? <Spinner size="sm" /> : "Create Category"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        {/* CATEGORY LIST */}
        <Col md={8}>
          <Card>
            <CardHeader className="bg-dark text-white">
              <FaList /> Category List
            </CardHeader>
            <CardBody>
              {loading ? <Spinner /> : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>English</th>
                      <th>Hindi</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length ? categories.map((cat, i) => (
                      <tr key={cat._id}>
                        <td>{i + 1}</td>
                        <td>{cat.categoryNameEn}</td>
                        <td>{cat.categoryNameHi}</td>
                        <td>
                          <Badge color={cat.isActive ? "success" : "danger"}>
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button size="sm" color="warning" onClick={() => openEditModal(cat)}>
                            <FaEdit />
                          </Button>{" "}
                          <Button size="sm" color="danger" onClick={() => handleDelete(cat._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center">No Categories Found</td>
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
            <Label>Category Name (English)</Label>
            <Input value={editEn} onChange={e => setEditEn(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>Category Name (Hindi)</Label>
            <Input value={editHi} onChange={e => setEditHi(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>Status</Label>
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
    </div>
  );
};

export default ManageCategories;
