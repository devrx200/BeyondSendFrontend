import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Table,
  Spinner,
  Row,
  Col,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaList, FaEdit } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ManageCategories = () => {

  const [categoryNameEn, setCategoryNameEn] = useState("");
  const [categoryNameHi, setCategoryNameHi] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);


  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editEn, setEditEn] = useState("");
  const [editHi, setEditHi] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}api/get-categories`);
      setCategories(res.data.data);
    } catch (err) {
      Swal.fire("Error", "Failed to fetch categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryNameEn || !categoryNameHi) {
      Swal.fire("Required", "Both English & Hindi names are required", "warning");
      return;
    }

    try {
      setBtnLoading(true);
      const res = await axios.post(`${API_URL}api/create-category`, {
        categoryNameEn,
        categoryNameHi
      });

      Swal.fire("Success", res.data.message, "success");
      setCategoryNameEn("");
      setCategoryNameHi("");
      fetchCategories();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    } finally {
      setBtnLoading(false);
    }
  };


  const openEditModal = (cat) => {
    setEditId(cat._id);
    setEditEn(cat.categoryNameEn);
    setEditHi(cat.categoryNameHi);
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editEn || !editHi) {
      Swal.fire("Required", "Both fields are required", "warning");
      return;
    }

    try {
      setUpdateLoading(true);
      const res = await axios.put(
        `${API_URL}api/update-category/${editId}`,
        {
          categoryNameEn: editEn,
          categoryNameHi: editHi
        }
      );

      Swal.fire("Success", res.data.message, "success");
      setEditModal(false);
      fetchCategories();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Update failed",
        "error"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <Row>

        <Col md={4}>
          <Card className="shadow-sm">
            <CardHeader className="bg-primary text-white d-flex align-items-center gap-2">
              <FaPlus /> Add Category
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Category Name (English)</Label>
                  <Input
                    value={categoryNameEn}
                    onChange={(e) => setCategoryNameEn(e.target.value)}
                    placeholder="Enter category name"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Category Name (Hindi)</Label>
                  <Input
                    value={categoryNameHi}
                    onChange={(e) => setCategoryNameHi(e.target.value)}
                    placeholder="श्रेणी का नाम"
                  />
                </FormGroup>

                <Button color="primary" block disabled={btnLoading}>
                  {btnLoading ? <Spinner size="sm" /> : "Create Category"}
                </Button>
              </Form>
            </CardBody>
          </Card>
        </Col>


        <Col md={8}>
          <Card className="shadow-sm">
            <CardHeader className="bg-dark text-white d-flex align-items-center gap-2">
              <FaList /> Category List
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <Table bordered hover responsive>
                  <thead className="table-light">
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
                    {categories.length ? (
                      categories.map((cat, index) => (
                        <tr key={cat._id}>
                          <td>{index + 1}</td>
                          <td>{cat.categoryNameEn}</td>
                          <td>{cat.categoryNameHi}</td>
                          <td>
                            <Badge color={cat.isActive ? "success" : "danger"}>
                              {cat.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              size="sm"
                              color="warning"
                              onClick={() => openEditModal(cat)}
                            >
                              <FaEdit />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No Categories Found
                        </td>
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
        <ModalHeader toggle={() => setEditModal(false)}>
          Edit Category
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Category Name (English)</Label>
            <Input value={editEn} onChange={(e) => setEditEn(e.target.value)} />
          </FormGroup>

          <FormGroup>
            <Label>Category Name (Hindi)</Label>
            <Input value={editHi} onChange={(e) => setEditHi(e.target.value)} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={handleUpdate} disabled={updateLoading}>
            {updateLoading ? <Spinner size="sm" /> : "Update"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ManageCategories;
