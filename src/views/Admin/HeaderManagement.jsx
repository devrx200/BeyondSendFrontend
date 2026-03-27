import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Input,
  FormGroup,
  Label
} from "reactstrap";
import { FaSave } from "react-icons/fa";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

const HeaderManagement = () => {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    titleEng: "",
    titleHin: "",
    subtitleEng: "",
    subtitleHin: "",
    logo: null,
    emblem: null,
    digitalLogo: null
  });

  const [preview, setPreview] = useState({});

  // ================= LOAD =================
  const fetchData = async () => {
    const res = await axios.get(`${API_URL}/api/header/get-all`);
    if (res.data?.data) {
      const data = res.data.data;

      setFormData({
        phone: data.phone || "",
        email: data.email || "",
        titleEng: data.titleEng || "",
        titleHin: data.titleHin || "",
        subtitleEng: data.subtitleEng || "",
        subtitleHin: data.subtitleHin || ""
      });

      setPreview({
        logo: `${API_URL}${data.logo}`,
        emblem: `${API_URL}${data.emblem}`,
        digitalLogo: `${API_URL}${data.digitalLogo}`
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= HANDLE =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFile = (e, field) => {
    const file = e.target.files[0];

    setFormData({ ...formData, [field]: file });

    setPreview({
      ...preview,
      [field]: URL.createObjectURL(file)
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async () => {
    const fd = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    try {
      await axios.post(`${API_URL}/api/header/create`, fd);

      Swal.fire("Success", "Header saved successfully", "success");

      fetchData();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.msg, "error");
    }
  };

  return (
    <Container fluid className="mt-4">
      <h3 className="mb-3">🌐 Header Management</h3>

      {/* CONTACT */}
      <Card className="mb-3 shadow-sm">
        <CardBody>
          <h5 className="text-primary mb-3">📞 Contact Info</h5>

          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <Label>Email</Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* TITLES */}
      <Card className="mb-3 shadow-sm">
        <CardBody>
          <h5 className="text-primary mb-3">📝 Titles</h5>

          <Row>
            <Col md="6">
              <Label>Title (English)</Label>
              <Input
                name="titleEng"
                value={formData.titleEng}
                onChange={handleChange}
              />
            </Col>

            <Col md="6">
              <Label>Title (Hindi)</Label>
              <Input
                name="titleHin"
                value={formData.titleHin}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md="6">
              <Label>Subtitle (English)</Label>
              <Input
                name="subtitleEng"
                value={formData.subtitleEng}
                onChange={handleChange}
              />
            </Col>

            <Col md="6">
              <Label>Subtitle (Hindi)</Label>
              <Input
                name="subtitleHin"
                value={formData.subtitleHin}
                onChange={handleChange}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* IMAGES */}
      <Card className="shadow-sm">
        <CardBody>
          <h5 className="text-primary mb-3">🖼 Upload Images</h5>

          <Row className="text-center">
            {["logo", "emblem", "digitalLogo"].map((f, i) => (
              <Col md="4" key={i}>
                <Label className="fw-bold">{f}</Label>

                <Input type="file" onChange={(e) => handleFile(e, f)} />

                {preview[f] && (
                  <div className="mt-2">
                    <img
                      src={preview[f]}
                      height="80"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                )}
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      {/* SAVE */}
      <div className="text-end mt-3">
        <Button color="success" onClick={handleSubmit}>
          <FaSave /> Save Header
        </Button>
      </div>
    </Container>
  );
};

export default HeaderManagement;