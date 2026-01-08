import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Badge,
} from "reactstrap";
import axios from "axios";
import * as XLSX from "xlsx";

const API = import.meta.env.VITE_API_URL;

const AboutAndHelp = () => {
  const [form, setForm] = useState({
    titleEn: "",
    titleHi: "",
    contentType: "",
    shortDescriptionEn: "",
    shortDescriptionHi: "",
    descriptionEn: "",
    descriptionHi: "",
    categoryId: "",
    date: "",
    fromDate: "",
    expirydate: "",
    link: "",
    isActive: true,
  });

  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPage, setSelectedPage] = useState([]);

  const [content, setContent] = useState(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchPages();
    fetchCategories();
  }, [API]);

  const fetchPages = async () => {
  try {
    const res = await axios.get(`${API}api/menu-list`);
    const menuItems = res.data.data || [];

    const pages = extractPagesFromMenu(menuItems);
    setPages(pages);
  } catch (err) {
    console.error("Page fetch error", err);
  }
};

const extractPagesFromMenu = (menus, pages = [], parentId = null) => {
  menus.forEach((item) => {
    // Push EVERY menu/submenu as a page
    pages.push({
      _id: item._id,                // ✅ submenu _id preserved
      titleEn: item.titleEng,
      titleHi: item.titleHi,
      path: item.path,
      isExternal: item.isExternal,
      parentId,                     // ✅ helpful for hierarchy
      level: parentId ? "SUB" : "MAIN",
    });

    // Recurse if submenu exists
    if (Array.isArray(item.submenu) && item.submenu.length > 0) {
      extractPagesFromMenu(item.submenu, pages, item._id);
    }
  });

  return pages;
};

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/api/categories`);
    setCategories(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===== FILE UPLOAD ===== */
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    setContent({
      fileType: form.contentType,
      file,
    });
  };

  /* ===== EXCEL ===== */
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      setContent({
        fileType: "EXCEL",
        headers: json[0],
        rows: json.slice(1),
      });
    };

    reader.readAsBinaryString(file);
  };

  /* ===== TABLE ===== */
  const addColumn = () => setColumns([...columns, ""]);

  const updateColumn = (i, val) => {
    const updated = [...columns];
    updated[i] = val;
    setColumns(updated);
  };

  const addRow = () => {
    const row = {};
    columns.forEach((c) => (row[c] = ""));
    setRows([...rows, row]);
  };

  const updateRow = (r, c, val) => {
    const updated = [...rows];
    updated[r][c] = val;
    setRows(updated);
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async () => {
    const finalContent =
      form.contentType === "TABLE"
        ? { fileType: "TABLE", columns, rows }
        : content;

    const payload = {
      ...form,
      selectedPage,
      content: finalContent,
      categoryId: form.categoryId || null,
    };

    await axios.post(`${API}api/about-and-help`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    alert("Announcement saved successfully");
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-primary text-white">
        <h5 className="mb-0">📢 Create About and Help</h5>
      </CardHeader>

      <CardBody>
        <Form>
          {/* TITLES */}
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Title (English)</Label>
                <Input name="titleEn" onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Title (Hindi)</Label>
                <Input name="titleHi" onChange={handleChange} />
              </FormGroup>
            </Col>
          </Row>

          {/* TYPE + PAGE */}
          <Row>
            <Col md="6">
              <FormGroup>
                <Label>Content Type</Label>
                <Input type="select" name="contentType" onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="IMAGE">JPG Image</option>
                  <option value="PDF">PDF Document</option>
                  <option value="EXCEL">Excel Sheet</option>
                  <option value="TABLE">Editable Table</option>
                </Input>
              </FormGroup>
            </Col>

            <Col md="6">
              <FormGroup>
                <Label>Selected Page</Label>
                <Input
                  type="select"
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                >
                  <option value="">Select Page</option>
                  {pages.map((page) => (
                    <option key={page._id} value={page._id}>
                      {page.titleHi}/{page.titleEn}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
          </Row>

          {/* FILE / EXCEL */}
          {(form.contentType === "IMAGE" || form.contentType === "PDF") && (
            <FormGroup>
              <Label>Upload File</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.pdf"
                onChange={handleFileUpload}
              />
            </FormGroup>
          )}

          {form.contentType === "EXCEL" && (
            <FormGroup>
              <Label>Upload Excel</Label>
              <Input
                type="file"
                accept=".xls,.xlsx"
                onChange={handleExcelUpload}
              />
            </FormGroup>
          )}

          {/* TABLE */}
          {form.contentType === "TABLE" && (
            <Card className="border mt-3">
              <CardHeader className="bg-light fw-bold">
                Editable Table
              </CardHeader>
              <CardBody>
                <Button size="sm" color="primary" onClick={addColumn}>
                  + Add Column
                </Button>

                <Row className="mt-2">
                  {columns.map((c, i) => (
                    <Col md="3" key={i}>
                      <Input
                        placeholder="Column Name"
                        value={c}
                        onChange={(e) => updateColumn(i, e.target.value)}
                      />
                    </Col>
                  ))}
                </Row>

                <Button
                  size="sm"
                  color="success"
                  className="mt-3"
                  onClick={addRow}
                >
                  + Add Row
                </Button>

                {rows.map((row, r) => (
                  <Row className="mt-2" key={r}>
                    {columns.map((c) => (
                      <Col md="3" key={c}>
                        <Input
                          placeholder={c}
                          onChange={(e) => updateRow(r, c, e.target.value)}
                        />
                      </Col>
                    ))}
                  </Row>
                ))}
              </CardBody>
            </Card>
          )}

          {/* DESCRIPTIONS */}
          <Row className="mt-3">
            <Col md="6">
              <FormGroup>
                <Label>Short Description (EN)</Label>
                <Input name="shortDescriptionEn" onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md="6">
              <FormGroup>
                <Label>Short Description (HI)</Label>
                <Input name="shortDescriptionHi" onChange={handleChange} />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>Description (EN)</Label>
            <Input
              type="textarea"
              name="descriptionEn"
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Description (HI)</Label>
            <Input
              type="textarea"
              name="descriptionHi"
              onChange={handleChange}
            />
          </FormGroup>

          {/* CATEGORY + DATES */}
          <Row>
            <Col md="4">
              <FormGroup>
                <Label>Category (Optional)</Label>
                <Input type="select" name="categoryId" onChange={handleChange}>
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>From Date</Label>
                <Input type="date" name="fromDate" onChange={handleChange} />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>Expiry Date</Label>
                <Input type="date" name="expirydate" onChange={handleChange} />
              </FormGroup>
            </Col>
          </Row>

          <FormGroup>
            <Label>External Link</Label>
            <Input name="link" onChange={handleChange} />
          </FormGroup>

          <div className="text-end">
            <Button color="success" className="px-4" onClick={handleSubmit}>
              Save Data
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
};

export default AboutAndHelp;
