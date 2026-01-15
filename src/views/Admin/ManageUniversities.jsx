import { useEffect, useState, useMemo } from "react";
import {
  Card, CardBody, CardHeader, Button, Form,
  Input, Table, Spinner, Row, Col, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Label, FormGroup
} from "reactstrap";
import axios from "axios";
import Swal from "sweetalert2";
import { FaPlus, FaList, FaEdit, FaTrash, FaEye } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const ManageUniversities = () => {
  const token = sessionStorage.getItem("authToken");

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  const multipartHeaders = {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
  };

  /* ================= MASTER DATA ================= */
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [vidhansabhas, setVidhansabhas] = useState([]);

  /* ================= FORM STATE ================= */
  const initialForm = {
    universityNameEng: "",
    universityNameHindi: "",
    universityCode: "",
    universityShortName: "",
    universityEmail: "",
    contactPerson: "",
    contactNumber: "",
    establishYear: "",
    universityAddress: "",
    universityWebsiteUrl: "",
    universityDescription: "",
    registrationNumber: "",
    universityType: "STATE",
    universityStatus: "ACTIVE",
    division: "",
    district: "",
    vidhansabha: ""
  };

  const [form, setForm] = useState(initialForm);
  const [logo, setLogo] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  /* ================= LIST ================= */
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= VIEW ================= */
  const [viewModal, setViewModal] = useState(false);
  const [viewData, setViewData] = useState({});

  /* ================= EDIT ================= */
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLogo, setEditLogo] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editDistricts, setEditDistricts] = useState([]);
  const [editVidhansabhas, setEditVidhansabhas] = useState([]);

  /* ================= FETCH MASTER ================= */
  const loadDivisions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/get-divisions`, authHeaders);
      setDivisions(res.data.data || []);
    } catch (err) {
      console.error("Failed to load divisions", err);
    }
  };

  const loadDistricts = async (division) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-districts?division=${division}`,
        authHeaders
      );
      setDistricts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  const loadVidhansabha = async (district) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-vidhansabha?district=${district}`,
        authHeaders
      );
      setVidhansabhas(res.data.data || []);
    } catch (err) {
      console.error("Failed to load vidhansabha", err);
    }
  };

  const loadEditDistricts = async (division) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-districts?division=${division}`,
        authHeaders
      );
      setEditDistricts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load districts", err);
    }
  };

  const loadEditVidhansabha = async (district) => {
    try {
      const res = await axios.get(
        `${API_URL}/api/get-vidhansabha?district=${district}`,
        authHeaders
      );
      setEditVidhansabhas(res.data.data || []);
    } catch (err) {
      console.error("Failed to load vidhansabha", err);
    }
  };

  /* ================= FETCH UNIVERSITIES ================= */
  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/get-universities`, authHeaders);
      setUniversities(res.data.data || []);
    } catch {
      Swal.fire("Error", "Failed to load universities", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
    loadDivisions();
  }, []);

  /* ================= SEARCH ================= */
  const filteredUniversities = useMemo(() => {
    const s = search.toLowerCase();
    return universities.filter(
      (u) =>
        u.universityNameEng?.toLowerCase().includes(s) ||
        u.universityCode?.toLowerCase().includes(s) ||
        u.universityShortName?.toLowerCase().includes(s)
    );
  }, [universities, search]);

  /* ================= CREATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.universityNameEng || !form.universityCode || !form.universityShortName || !form.universityNameHindi) {
      Swal.fire("Required", "Name (English), Name (Hindi), Code & Short Name are required", "warning");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== "" && v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    if (logo) fd.append("universityLogo", logo);

    try {
      setBtnLoading(true);
      const res = await axios.post(
        `${API_URL}/api/create-university`,
        fd,
        multipartHeaders
      );
      Swal.fire("Success", res.data.message, "success");
      setForm(initialForm);
      setLogo(null);
      document.getElementById("logoInput").value = "";
      fetchUniversities();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Create failed", "error");
    } finally {
      setBtnLoading(false);
    }
  };

  /* ================= VIEW ================= */
  const openViewModal = (u) => {
    setViewData(u);
    setViewModal(true);
  };

  /* ================= EDIT ================= */
  const openEditModal = async (u) => {
    setEditId(u._id);
    setEditForm({ ...u });
    if (u.division) {
      await loadEditDistricts(u.division);
    }
    if (u.district) {
      await loadEditVidhansabha(u.district);
    }
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editForm.universityNameEng || !editForm.universityCode || !editForm.universityShortName || !editForm.universityNameHindi) {
      Swal.fire("Required", "Name (English), Name (Hindi), Code & Short Name are required", "warning");
      return;
    }

    const fd = new FormData();
    Object.entries(editForm).forEach(([k, v]) => {
      if (!["_id", "__v", "createdAt", "updatedAt", "isDeleted"].includes(k) && v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    if (editLogo) fd.append("universityLogo", editLogo);

    try {
      setUpdateLoading(true);
      const res = await axios.put(
        `${API_URL}/api/update-university/${editId}`,
        fd,
        multipartHeaders
      );
      Swal.fire("Updated", res.data.message, "success");
      setEditModal(false);
      setEditLogo(null);
      fetchUniversities();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdateLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    const ok = await Swal.fire({
      title: "Delete University?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    if (!ok.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/delete-university/${id}`, authHeaders);
      Swal.fire("Deleted", "University removed successfully", "success");
      fetchUniversities();
    } catch (err) {
      Swal.fire("Error", "Failed to delete university", "error");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="shadow">
      {/* CREATE FORM */}
      <Row>
        {/* ADD UNIVERSITY */}
        <Col md={12}>
          <Card className="shadow-sm mb-5">

            <CardHeader className="bg-primary text-white">
              <FaPlus className="me-2" /> Add University
            </CardHeader>

            <CardBody>

              <Form onSubmit={handleSubmit}>

                {/* BASIC INFO */}
                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>University Name (English)</Label>
                      <Input
                        value={form.universityNameEng}
                        onChange={e => setForm({ ...form, universityNameEng: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>University Name (Hindi)</Label>
                      <Input
                        value={form.universityNameHindi}
                        onChange={e => setForm({ ...form, universityNameHindi: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>University Code</Label>
                      <Input
                        value={form.universityCode}
                        onChange={e => setForm({ ...form, universityCode: e.target.value })}
                      />
                    </FormGroup>

                  </Col>
                </Row>
                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Short Name</Label>
                      <Input
                        value={form.universityShortName}
                        onChange={e => setForm({ ...form, universityShortName: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Registration Number</Label>
                      <Input
                        value={form.registrationNumber}
                        onChange={e => setForm({ ...form, registrationNumber: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Establish Year</Label>
                      <Input
                        type="number"
                        value={form.establishYear}
                        onChange={e => setForm({ ...form, establishYear: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* CONTACT INFO */}
                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={form.universityEmail}
                        onChange={e => setForm({ ...form, universityEmail: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Contact Person</Label>
                      <Input
                        value={form.contactPerson}
                        onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Contact Number</Label>
                      <Input
                        value={form.contactNumber}
                        maxLength="10"
                        onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                {/* CLASSIFICATION */}
                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>University Type</Label>
                      <Input
                        type="select"
                        value={form.universityType}
                        onChange={e => setForm({ ...form, universityType: e.target.value })}
                      >
                        <option value="STATE">STATE</option>
                        <option value="PRIVATE">PRIVATE</option>
                        <option value="CENTRAL">CENTRAL</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Status</Label>
                      <Input
                        type="select"
                        value={form.universityStatus}
                        onChange={e => setForm({ ...form, universityStatus: e.target.value })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Division</Label>
                      <Input
                        type="select"
                        value={form.division}
                        onChange={e => {
                          setForm({ ...form, division: e.target.value, district: "", vidhansabha: "" });
                          loadDistricts(e.target.value);
                        }}
                      >
                        <option value="">Select Division</option>
                        {divisions.map(d => (
                          <option key={d.divisionCode} value={d.divisionCode}>
                            {d.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>

                  </Col>
                </Row>

                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>District</Label>
                      <Input
                        type="select"
                        value={form.district}
                        disabled={!form.division}
                        onChange={e => {
                          setForm({ ...form, district: e.target.value, vidhansabha: "" });
                          loadVidhansabha(e.target.value);
                        }}
                      >
                        <option value="">Select District</option>
                        {districts.map(d => (
                          <option key={d.LGDCode} value={d.LGDCode}>
                            {d.districtNameEng}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Vidhansabha</Label>
                      <Input
                        type="select"
                        value={form.vidhansabha}
                        disabled={!form.district}
                        onChange={e => setForm({ ...form, vidhansabha: e.target.value })}
                      >
                        <option value="">Select Vidhansabha</option>
                        {vidhansabhas.map(v => (
                          <option key={v.ConstituencyNumber} value={v.ConstituencyNumber}>
                            {v.ConstituencyName}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Website URL</Label>
                      <Input
                        type="url"
                        value={form.universityWebsiteUrl}
                        onChange={e => setForm({ ...form, universityWebsiteUrl: e.target.value })}
                      />
                    </FormGroup>
                  </Col>

                </Row>




                {/* ADDITIONAL */}
                <Row>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>University Logo</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => setLogo(e.target.files[0])}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-3">
                      <Label>Address</Label>
                      <Input
                        type="textarea"
                        rows="2"
                        value={form.universityAddress}
                        onChange={e => setForm({ ...form, universityAddress: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs="4">
                    <FormGroup className="mb-4">
                      <Label>Description</Label>
                      <Input
                        type="textarea"
                        rows="3"
                        value={form.universityDescription}
                        onChange={e => setForm({ ...form, universityDescription: e.target.value })}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <Row className="justify-content-center mt-4">
                  <Col className="text-center">
                    <Button
                      color="primary"
                      block
                      disabled={btnLoading}
                      className="px-5 py-2 fw-semibold shadow-sm rounded-pill"
                      style={{
                        background: "linear-gradient(135deg, #0dcdfd, #06493b)",
                        border: "none",
                        minWidth: "160px",
                      }}
                    >
                      {btnLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </Col>
                </Row>


              </Form>
            </CardBody>
          </Card>
        </Col>

      </Row>





      <Row>
        {/* LIST TABLE */}
        <Col lg={12}>
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-primary  ">
              <h5 className="mb-0 text-white">
                <FaList className="me-2" /> Universities List
              </h5>
            </CardHeader>
            <CardBody className="">
              <Row className="mb-3">
                <Col lg={12}>
                  <Input
                    placeholder="🔍 Search by name, code or short name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="form-control-lg"
                  />
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner color="primary" style={{ width: '3rem', height: '3rem' }} />
                  <p className="mt-3 text-muted">Loading universities...</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table bordered hover size="sm" className="align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center">#</th>
                        <th className="text-center">Logo</th>
                        <th>Name</th>
                        <th className="text-center">Code</th>
                        <th className="text-center">Short Name</th>
                        <th className="text-center">Type</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUniversities.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            <FaList size={40} className="mb-2 opacity-50" />
                            <p>No universities found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUniversities.map((u, i) => (
                          <tr key={u._id}>
                            <td className="text-center fw-bold">{i + 1}</td>
                            <td className="text-center">
                              {u.universityLogo ? (
                                <img
                                  src={`${API_URL}${u.universityLogo}`}
                                  height="40"
                                  width="40"
                                  alt="Logo"
                                  className="rounded"
                                  style={{ objectFit: 'contain' }}
                                />
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>{u.universityNameEng}</td>
                            <td className="text-center">
                              <Badge color="secondary" className="px-3 py-2">{u.universityCode}</Badge>
                            </td>
                            <td className="text-center">{u.universityShortName}</td>
                            <td className="text-center">
                              <Badge color="info" className="px-3 py-2">{u.universityType}</Badge>
                            </td>
                            <td className="text-center">
                              <Badge
                                color={u.universityStatus === "ACTIVE" ? "success" : "danger"}
                                className="px-3 py-2"
                              >
                                {u.universityStatus}
                              </Badge>
                            </td>
                            <td className="text-center">
                              <Button
                                size="sm"
                                color="info"
                                className="me-1"
                                onClick={() => openViewModal(u)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                size="sm"
                                color="warning"
                                className="me-1"
                                onClick={() => openEditModal(u)}
                                title="Edit"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                onClick={() => handleDelete(u._id)}
                                title="Delete"
                              >
                                <FaTrash />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>


        {/* VIEW MODAL */}
        <Modal isOpen={viewModal} toggle={() => setViewModal(false)} size="xl">
          <ModalHeader toggle={() => setViewModal(false)} className="bg-info text-white">
            <FaEye className="me-2" /> University Details
          </ModalHeader>
          <ModalBody className="p-4">
            <Row>
              <Col xs={12} className="text-center mb-4">
                {viewData.universityLogo && (
                  <img
                    src={`${API_URL}${viewData.universityLogo}`}
                    height="100"
                    alt="Logo"
                    className="border rounded p-2"
                    style={{ objectFit: 'contain' }}
                  />
                )}
              </Col>

              <Col xs={12} className="mb-3">
                <h6 className="text-primary border-bottom pb-2">Basic Information</h6>
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <strong>Name (English):</strong>
                <p className="mb-0 text-muted">{viewData.universityNameEng || "N/A"}</p>
              </Col>
              <Col md={6} sm={12} className="mb-3">
                <strong>Name (Hindi):</strong>
                <p className="mb-0 text-muted">{viewData.universityNameHindi || "N/A"}</p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Code:</strong>
                <p className="mb-0 text-muted">{viewData.universityCode || "N/A"}</p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Short Name:</strong>
                <p className="mb-0 text-muted">{viewData.universityShortName || "N/A"}</p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Registration No:</strong>
                <p className="mb-0 text-muted">{viewData.registrationNumber || "N/A"}</p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Type:</strong>
                <p className="mb-0">
                  <Badge color="info">{viewData.universityType}</Badge>
                </p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Status:</strong>
                <p className="mb-0">
                  <Badge color={viewData.universityStatus === "ACTIVE" ? "success" : "danger"}>
                    {viewData.universityStatus}
                  </Badge>
                </p>
              </Col>
              <Col md={4} sm={6} className="mb-3">
                <strong>Establish Year:</strong>
                <p className="mb-0 text-muted">{viewData.establishYear || "N/A"}</p>
              </Col>

              <Col xs={12} className="mb-3 mt-3">
                <h6 className="text-primary border-bottom pb-2">Contact Information</h6>
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <strong>Email:</strong>
                <p className="mb-0 text-muted">{viewData.universityEmail || "N/A"}</p>
              </Col>
              <Col md={6} sm={12} className="mb-3">
                <strong>Website:</strong>
                <p className="mb-0">
                  {viewData.universityWebsiteUrl ? (
                    <a href={viewData.universityWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                      {viewData.universityWebsiteUrl}
                    </a>
                  ) : "N/A"}
                </p>
              </Col>
              <Col md={6} sm={12} className="mb-3">
                <strong>Contact Person:</strong>
                <p className="mb-0 text-muted">{viewData.contactPerson || "N/A"}</p>
              </Col>
              <Col md={6} sm={12} className="mb-3">
                <strong>Contact Number:</strong>
                <p className="mb-0 text-muted">{viewData.contactNumber || "N/A"}</p>
              </Col>

              <Col xs={12} className="mb-3 mt-3">
                <h6 className="text-primary border-bottom pb-2">Additional Details</h6>
              </Col>

              <Col xs={12} className="mb-3">
                <strong>Address:</strong>
                <p className="mb-0 text-muted">{viewData.universityAddress || "N/A"}</p>
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Description:</strong>
                <p className="mb-0 text-muted">{viewData.universityDescription || "N/A"}</p>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setViewModal(false)}>Close</Button>
          </ModalFooter>
        </Modal>

        {/* EDIT MODAL */}
        <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="xl">
          <ModalHeader toggle={() => setEditModal(false)} className="bg-warning text-dark">
            <FaEdit className="me-2" /> Edit University
          </ModalHeader>
          <ModalBody className="p-4">
            <Row>
              {/* Basic Information Section */}
              <Col xs={12}>
                <h6 className="text-primary mb-3 border-bottom pb-2">Basic Information</h6>
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Name (English) <span className="text-danger">*</span></Label>
                <Input
                  value={editForm.universityNameEng || ""}
                  onChange={e => setEditForm({ ...editForm, universityNameEng: e.target.value })}
                />
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Name (Hindi) <span className="text-danger">*</span></Label>
                <Input
                  value={editForm.universityNameHindi || ""}
                  onChange={e => setEditForm({ ...editForm, universityNameHindi: e.target.value })}
                />
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">University Code <span className="text-danger">*</span></Label>
                <Input
                  value={editForm.universityCode || ""}
                  onChange={e => setEditForm({ ...editForm, universityCode: e.target.value })}
                />
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">Short Name <span className="text-danger">*</span></Label>
                <Input
                  value={editForm.universityShortName || ""}
                  onChange={e => setEditForm({ ...editForm, universityShortName: e.target.value })}
                />
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">Registration Number</Label>
                <Input
                  value={editForm.registrationNumber || ""}
                  onChange={e => setEditForm({ ...editForm, registrationNumber: e.target.value })}
                />
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Email</Label>
                <Input
                  type="email"
                  value={editForm.universityEmail || ""}
                  onChange={e => setEditForm({ ...editForm, universityEmail: e.target.value })}
                />
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Contact Person</Label>
                <Input
                  value={editForm.contactPerson || ""}
                  onChange={e => setEditForm({ ...editForm, contactPerson: e.target.value })}
                />
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Contact Number</Label>
                <Input
                  value={editForm.contactNumber || ""}
                  onChange={e => setEditForm({ ...editForm, contactNumber: e.target.value })}
                  maxLength="10"
                />
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Establish Year</Label>
                <Input
                  type="number"
                  value={editForm.establishYear || ""}
                  onChange={e => setEditForm({ ...editForm, establishYear: e.target.value })}
                  min="1800"
                  max={new Date().getFullYear()}
                />
              </Col>

              {/* Classification Section */}
              <Col xs={12} className="mt-3">
                <h6 className="text-primary mb-3 border-bottom pb-2">Classification</h6>
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">University Type</Label>
                <Input
                  type="select"
                  value={editForm.universityType || "STATE"}
                  onChange={e => setEditForm({ ...editForm, universityType: e.target.value })}>
                  <option value="STATE">STATE</option>
                  <option value="PRIVATE">PRIVATE</option>
                  <option value="CENTRAL">CENTRAL</option>
                </Input>
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">Status</Label>
                <Input
                  type="select"
                  value={editForm.universityStatus || "ACTIVE"}
                  onChange={e => setEditForm({ ...editForm, universityStatus: e.target.value })}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Input>
              </Col>

              <Col md={4} sm={12} className="mb-3">
                <Label className="fw-bold">Division</Label>
                <Input
                  type="select"
                  value={editForm.division || ""}
                  onChange={async (e) => {
                    setEditForm({ ...editForm, division: e.target.value, district: "", vidhansabha: "" });
                    await loadEditDistricts(e.target.value);
                  }}>
                  <option value="">Select Division</option>
                  {divisions.map(d => <option key={d.divisionCode} value={d.divisionCode}>{d.name}</option>)}
                </Input>
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">District</Label>
                <Input
                  type="select"
                  value={editForm.district || ""}
                  onChange={async (e) => {
                    setEditForm({ ...editForm, district: e.target.value, vidhansabha: "" });
                    await loadEditVidhansabha(e.target.value);
                  }}
                  disabled={!editForm.division}>
                  <option value="">Select District</option>
                  {editDistricts.map(d => <option key={d.LGDCode} value={d.LGDCode}>{d.districtNameEng}</option>)}
                </Input>
              </Col>

              <Col md={6} sm={12} className="mb-3">
                <Label className="fw-bold">Vidhansabha</Label>
                <Input
                  type="select"
                  value={editForm.vidhansabha || ""}
                  onChange={e => setEditForm({ ...editForm, vidhansabha: e.target.value })}
                  disabled={!editForm.district}>
                  <option value="">Select Vidhansabha</option>
                  {editVidhansabhas.map(v => <option key={v.ConstituencyNumber} value={v.ConstituencyNumber}>{v.ConstituencyName}</option>)}
                </Input>
              </Col>

              {/* Additional Information Section */}
              <Col xs={12} className="mt-3">
                <h6 className="text-primary mb-3 border-bottom pb-2">Additional Information</h6>
              </Col>

              <Col xs={12} className="mb-3">
                <Label className="fw-bold">Website URL</Label>
                <Input
                  type="url"
                  value={editForm.universityWebsiteUrl || ""}
                  onChange={e => setEditForm({ ...editForm, universityWebsiteUrl: e.target.value })}
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Label className="fw-bold">Address</Label>
                <Input
                  type="textarea"
                  rows="2"
                  value={editForm.universityAddress || ""}
                  onChange={e => setEditForm({ ...editForm, universityAddress: e.target.value })}
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Label className="fw-bold">Description</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={editForm.universityDescription || ""}
                  onChange={e => setEditForm({ ...editForm, universityDescription: e.target.value })}
                />
              </Col>

              <Col xs={12} className="mb-3">
                <Label className="fw-bold">University Logo</Label>
                {editForm.universityLogo && (
                  <div className="mb-2 text-center">
                    <img
                      src={`${API_URL}${editForm.universityLogo}`}
                      height="60"
                      alt="Current Logo"
                      className="border p-2 rounded"
                      style={{ objectFit: 'contain' }}
                    />
                    <small className="d-block text-muted mt-1">Current Logo</small>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditLogo(e.target.files[0])}
                />
                <small className="text-muted">Leave empty to keep current logo</small>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setEditModal(false)}>
              Cancel
            </Button>
            <Button color="primary" onClick={handleUpdate} disabled={updateLoading}>
              {updateLoading ? <><Spinner size="sm" className="me-2" /> Updating...</> : <><FaEdit className="me-2" />Update University</>}
            </Button>
          </ModalFooter>
        </Modal>
      </Row>
    </div>
  );

};

export default ManageUniversities;