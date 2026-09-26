import { useEffect, useState } from "react";
import {
  Card, CardBody, CardHeader, Button, Form, FormGroup, Label,
  Input, Table, Spinner, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter
} from "reactstrap";
import apiClient, { BASE_HOST } from "@apiService";
import { FaPlus, FaList, FaEdit, FaTrash } from "react-icons/fa";
import { useToast, ToastContainer, wpSwal } from "../../utilities/WPToast";
import { PageLoader } from "@/components";



const ManageBrands = () => {
  const token = sessionStorage.getItem("authToken");
  const { toasts, toast } = useToast();

  

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
      const res = await apiClient.get('/brands/list');
      setBrands(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Load failed");
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
      toast.warning("All fields (Name, Position, Image) are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("position", position);
    formData.append("image", image);

    try {
      setBtnLoading(true);
      const res = await apiClient.post('/brands/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(res.data.message || "Brand created successfully");
      setName("");
      setPosition("");
      setImage(null);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Create failed");
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
      const res = await apiClient.put(`/brands/update/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(res.data.message || "Brand updated successfully");
      setEditModal(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await wpSwal.confirm("Are you sure?", "This action cannot be undone.");

    if (!isConfirmed) return;

    try {
      const res = await apiClient.delete(`/brands/delete/${id}`);
      toast.success(res.data.message || "Brand deleted");
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={toast.remove} />

      <Card className="adm-card mb-4">
        <CardHeader className="adm-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="adm-page-title mb-1"><FaList className="me-2" /> Footer Brands</h4>
            <p className="adm-page-subtitle mb-0 text-white">Manage footer brand logos and display order</p>
          </div>
        </CardHeader>
      </Card>

      <Row>
        <Col md={4}>
          <Card className="wp-card">
            <CardHeader className="bg-primary text-white font-weight-bold">
              <FaPlus className="me-2" /> Add Brand
            </CardHeader>
            <CardBody className="p-3">
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label className="fw-semibold">Name</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Partner" />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-semibold">Position Order</Label>
                  <Input type="number" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. 1" />
                </FormGroup>
                <FormGroup>
                  <Label className="fw-semibold">Logo Image</Label>
                  <Input type="file" onChange={e => setImage(e.target.files[0])} />
                </FormGroup>
                <Button block color="primary" disabled={btnLoading} className="mt-3">
                  {btnLoading ? <Spinner size="sm" /> : "Create Brand"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="wp-card">
            <CardHeader className="bg-dark text-white font-weight-bold">
              <FaList className="me-2" /> Brand List
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <PageLoader inline={true} />
              ) : (
                <Table bordered hover responsive className="mb-0 wp-table">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th style={{ width: "80px" }}>Image</th>
                      <th>Name</th>
                      <th style={{ width: "90px" }}>Position</th>
                      <th style={{ width: "100px" }}>Status</th>
                      <th style={{ width: "100px" }} className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length > 0 ? brands.map((b, i) => (
                      <tr key={b._id}>
                        <td>{i + 1}</td>
                        <td>
                          {b.image ? (
                            <img src={`${BASE_HOST}${b.image}`} alt={b.name} style={{ height: "36px", objectFit: "contain" }} />
                          ) : "—"}
                        </td>
                        <td className="fw-medium">{b.name}</td>
                        <td>{b.position}</td>
                        <td>
                          <Badge color={b.isActive ? "success" : "danger"} className="px-2 py-1">
                            {b.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button size="sm" color="warning" className="me-1" onClick={() => openEditModal(b)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" color="danger" onClick={() => handleDelete(b._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-muted">No Brands Found</td>
                      </tr>
                    )}
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
            <Label className="fw-semibold">Name</Label>
            <Input value={editName} onChange={e => setEditName(e.target.value)} />
          </FormGroup>
          <FormGroup>
            <Label className="fw-semibold">Position Order</Label>
            <Input type="number" value={editPosition} onChange={e => setEditPosition(e.target.value)} />
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
          <FormGroup>
            <Label className="fw-semibold">Image (Optional, leave blank to keep current)</Label>
            <Input type="file" onChange={e => setEditImage(e.target.files[0])} />
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

export default ManageBrands;
