import { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup, Label,
  Input, Table, Spinner, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ManageBrands = () => {
  const token = sessionStorage.getItem("authToken");

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const multipartHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  };

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [image, setImage] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);


  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editStatus, setEditStatus] = useState(true);
  const [editImage, setEditImage] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-brands`, authHeaders);
      setBrands(res.data.data);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Load failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || position === "" || !image) {
      Swal.fire("Required", "All fields are required", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", position);
    formData.append("image", image);

    try {
      setBtnLoading(true);
      const res = await axios.post(
        `${API_URL}/api/create-brand`,
        formData,
        multipartHeaders
      );

      Swal.fire("Success", res.data.message, "success");
      setName("");
      setPosition("");
      setImage(null);
      fetchBrands();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Create failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  const openEditModal = (b) => {
    setEditId(b._id);
    setEditName(b.name);
    setEditPosition(b.position);
    setEditStatus(b.isActive);
    setEditImage(null);
    setEditModal(true);
  };


  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("name", editName);
    formData.append("position", editPosition);
    formData.append("isActive", editStatus);
    if (editImage) formData.append("image", editImage);

    try {
      setUpdateLoading(true);
      const res = await axios.put(
        `${API_URL}/api/update-brand/${editId}`,
        formData,
        multipartHeaders
      );

      Swal.fire("Success", res.data.message, "success");
      setEditModal(false);
      fetchBrands();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      confirmButtonColor: "#d33"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(
        `${API_URL}/api/delete-brand/${id}`,
        authHeaders
      );
      Swal.fire("Deleted", res.data.message, "success");
      fetchBrands();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Delete failed", "error");
    }
  };


  return (
    <div className="container-fluid py-4">
      <Row>
        <Col md={4}>
          <Card>
            <CardHeader className="bg-primary text-white">
              <FaPlus /> Add Brand
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Position</Label>
                  <Input type="number" value={position} onChange={e => setPosition(e.target.value)} />
                </FormGroup>
                <FormGroup>
                  <Label>Image</Label>
                  <Input type="file" onChange={e => setImage(e.target.files[0])} />
                </FormGroup>
                <Button block color="primary" disabled={btnLoading}>
                  {btnLoading ? <Spinner size="sm" /> : "Create"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={8}>
          <Card>
            <CardHeader className="bg-dark text-white">
              <FaList /> Brand List
            </CardHeader>
            <CardBody>
              {loading ? <Spinner /> : (
                <Table bordered hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((b, i) => (
                      <tr key={b._id}>
                        <td>{i + 1}</td>
                        <td><img src={`${API_URL}${b.image}`} height="40" /></td>
                        <td>{b.name}</td>
                        <td>{b.position}</td>
                        <td>
                          <Badge color={b.isActive ? "success" : "danger"}>
                            {b.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td>
                          <Button size="sm" color="warning" onClick={() => openEditModal(b)}>
                            <FaEdit />
                          </Button>{" "}
                          <Button size="sm" color="danger" onClick={() => handleDelete(b._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
        <ModalHeader toggle={() => setEditModal(false)}>Edit Brand</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Name</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label>Position</Label>
            <Input type="number" value={editPosition} onChange={e => setEditPosition(e.target.value)} />
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
          <FormGroup>
            <Label>Image (Optional)</Label>
            <Input type="file" onChange={e => setEditImage(e.target.files[0])} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleUpdate} disabled={updateLoading}>
            {updateLoading ? <Spinner size="sm" /> : "Update"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ManageBrands;
