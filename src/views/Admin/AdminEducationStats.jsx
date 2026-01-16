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
  Badge,
  Row,
  Col
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaEdit, FaTrash, FaSave } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

/* ---------- CURRENT ACADEMIC YEAR ---------- */
const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

const AdminEducationStats = () => {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    totalGovernmentUniversities: 0,
    totalPrivateUniversities: 0,
    totalCentralUniversities: 0,
    governmentColleges: 0,
    privateColleges: 0,
    totalStudents: 0,
    totalCourses: 0,
    academicYear: getCurrentAcademicYear(),
    lastUpdatedBy: "",
    isActive: true
  });

  /* ================= LOAD LIST ================= */
  const loadList = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/education-stats/list-for-admin`
      );
      setList(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", "Failed to load stats list", "error");
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  /* ================= RESET ================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      totalGovernmentUniversities: 0,
      totalPrivateUniversities: 0,
      totalCentralUniversities: 0,
      governmentColleges: 0,
      privateColleges: 0,
      totalStudents: 0,
      totalCourses: 0,
      academicYear: getCurrentAcademicYear(),
      lastUpdatedBy: "",
      isActive: true
    });
  };

  const toggleModal = () => {
    setModal(!modal);
    if (modal) resetForm();
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    /* DUPLICATE ACADEMIC YEAR CHECK (FRONTEND) */
    if (
      !editingId &&
      list.some(item => item.academicYear === form.academicYear)
    ) {
      Swal.fire(
        "Duplicate",
        "Statistics already exist for this academic year",
        "warning"
      );
      return;
    }

    try {
      let res;

      if (editingId) {
        res = await axios.put(
          `${API_URL}/api/education-stats/update/${editingId}`,
          form
        );
      } else {
        res = await axios.post(
          `${API_URL}/api/education-stats/create`,
          form
        );
      }

      Swal.fire("Success", res.data.message, "success");
      toggleModal();
      loadList();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Operation failed",
        "error"
      );
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      totalGovernmentUniversities: item.totalGovernmentUniversities,
      totalPrivateUniversities: item.totalPrivateUniversities,
      totalCentralUniversities: item.totalCentralUniversities,
      governmentColleges: item.governmentColleges,
      privateColleges: item.privateColleges,
      totalStudents: item.totalStudents,
      totalCourses: item.totalCourses,
      academicYear: item.academicYear,
      lastUpdatedBy: item.lastUpdatedBy || "",
      isActive: item.isActive
    });
    setModal(true);
  };

  /* ================= DELETE (SOFT) ================= */
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete Statistics?",
      text: "This academic year will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, Delete"
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${API_URL}/api/education-stats/delete/${id}`);
      Swal.fire("Success", res.data.message, "success");
      loadList();
    } catch (err) {
      Swal.fire("Error", "Failed to deactivate", "error");
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <CardBody>

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Education Statistics (Admin)</h4>
          <Button color="primary" onClick={toggleModal}>
            <FaPlus className="me-2" /> Add Academic Year
          </Button>
        </div>

        {/* LIST TABLE */}
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Academic Year</th>
              <th>Universities</th>
              <th>Colleges</th>
              <th>Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No statistics found
                </td>
              </tr>
            ) : (
              list.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>{item.academicYear}</td>
                  <td>{item.totalUniversities}</td>
                  <td>{item.totalColleges}</td>
                  <td>{item.totalStudents}</td>
                  <td>
                    <Badge color={item.isActive ? "success" : "danger"}>
                      {item.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      color="warning"
                      className="me-2"
                      onClick={() => handleEdit(item)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      onClick={() => handleDelete(item._id)}
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
            {editingId ? "Edit Education Statistics" : "Add Education Statistics"}
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Row>
                {[
                  ["totalGovernmentUniversities", "Government Universities"],
                  ["totalPrivateUniversities", "Private Universities"],
                  ["totalCentralUniversities", "Central Universities"],
                  ["governmentColleges", "Government Colleges"],
                  ["privateColleges", "Private Colleges"],
                  ["totalStudents", "Total Students"],
                  ["totalCourses", "Total Courses"]
                ].map(([key, label]) => (
                  <Col md={4} key={key}>
                    <FormGroup>
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        value={form[key]}
                        onChange={e =>
                          setForm({ ...form, [key]: +e.target.value })
                        }
                      />
                    </FormGroup>
                  </Col>
                ))}

                <Col md={4}>
                  <FormGroup>
                    <Label>Academic Year</Label>
                    <Input
                      value={form.academicYear}
                      disabled={!!editingId}
                      onChange={e =>
                        setForm({ ...form, academicYear: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>Last Updated By</Label>
                    <Input
                      value={form.lastUpdatedBy}
                      onChange={e =>
                        setForm({ ...form, lastUpdatedBy: e.target.value })
                      }
                    />
                  </FormGroup>
                </Col>

                <Col md={4}>
                  <FormGroup>
                    <Label>Status</Label>
                    <Input
                      type="select"
                      value={form.isActive}
                      onChange={e =>
                        setForm({
                          ...form,
                          isActive: e.target.value === "true"
                        })
                      }
                    >
                      <option value={true}>Active</option>
                      <option value={false}>Inactive</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" type="submit">
                <FaSave className="me-2" />
                {editingId ? "Update" : "Create"}
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

export default AdminEducationStats;
