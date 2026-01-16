// DynamicContentEditor.jsx - Professional CMS Editor Library
import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Input,
  Label,
  Button,
  Badge,
  FormGroup,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  Table,
  DropdownItem,
} from "reactstrap";

// import "react-quill/dist/quill.snow.css";

import JoditEditor from "jodit-react";


import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const DynamicContentEditor = ({ contents, setContents, viewMode = false }) => {
  const addContent = (type) => {
    const newContent = {
      id: Date.now() + Math.random(),
      title: "",
      fileType: type,
      file: null,
      fileName: "",
      richTextContent: "",
      imageUrl: null,
      croppedImage: null,
      imageFile: null,
      tableColumns: [],
      tableRows: [],
      excelData: { columns: [], rows: [] },
      pdfUrl: null,
      pdfNumPages: null,
    };
    setContents([...contents, newContent]);
  };

  const removeContent = (index) => {
    setContents((prev) => prev.filter((_, i) => i !== index));
  };

  console.log("====================================");
  console.log(contents);
  console.log("====================================");

  const updateContent = (id, updates) => {
    setContents(contents.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  return (
    <div className="cms-editor">
      {/* ADD CONTENT TOOLBAR */}
      {!viewMode && (
        <div className="mb-4 p-3 bg-light rounded shadow-sm">
          <div className="d-flex align-items-center justify-content-between">
            <h6 className="mb-0 text-secondary">
              <i className="bi bi-plus-circle me-2"></i>
              Add Content Block
            </h6>
            <div className="btn-toolbar gap-2">
              <Button
                color="primary"
                size="sm"
                onClick={() => addContent("RICH_TEXT")}
                className="d-flex align-items-center"
              >
                <i className="bi bi-fonts me-1"></i> Rich Text
              </Button>
              <Button
                color="success"
                size="sm"
                onClick={() => addContent("IMAGE")}
                className="d-flex align-items-center"
              >
                <i className="bi bi-image me-1"></i> Image
              </Button>
              {/* <Button
                color="info"
                size="sm"
                onClick={() => addContent("TABLE")}
                className="d-flex align-items-center"
              >
                <i className="bi bi-table me-1"></i> Table
              </Button> */}
              <Button
                color="warning"
                size="sm"
                onClick={() => addContent("EXCEL")}
                className="d-flex align-items-center"
              >
                <i className="bi bi-file-earmark-excel me-1"></i> Excel
              </Button>
              <Button
                color="danger"
                size="sm"
                onClick={() => addContent("PDF")}
                className="d-flex align-items-center"
              >
                <i className="bi bi-file-pdf me-1"></i> PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT BLOCKS */}
      <div className="content-blocks">
        {contents.map((item, index) => (
          <ContentBlock
            key={index}
            item={item}
            index={index}
            viewMode={viewMode}
            onUpdate={updateContent}
            onRemove={removeContent}
          />
        ))}
      </div>

      {/* EMPTY STATE */}
      {contents.length === 0 && (
        <Card className="text-center border-2 border-dashed">
          <CardBody className="py-5">
            <i
              className="bi bi-inbox"
              style={{ fontSize: "4rem", color: "#ddd" }}
            ></i>
            <h5 className="text-muted mt-3">No Content Blocks</h5>
            <p className="text-muted">
              Click the buttons above to add content blocks
            </p>
          </CardBody>
        </Card>
      )}

      <style jsx>{`
        .cms-editor {
          min-height: 200px;
        }
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
};

// ==================== CONTENT BLOCK WRAPPER ====================
const ContentBlock = ({ item, index, viewMode, onUpdate, onRemove }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // console.log(onRemove,"Getting id of one remove");

  const getTypeConfig = () => {
    const configs = {
      RICH_TEXT: {
        color: "primary",
        icon: "bi-fonts",
        label: "Rich Text Editor",
      },
      IMAGE: { color: "success", icon: "bi-image", label: "Image Editor" },
      TABLE: { color: "info", icon: "bi-table", label: "Table Editor" },
      EXCEL: {
        color: "warning",
        icon: "bi-file-earmark-excel",
        label: "Excel Data",
      },
      PDF: { color: "danger", icon: "bi-file-pdf", label: "PDF Document" },
    };
    return configs[item.fileType] || configs.RICH_TEXT;
  };

  const config = getTypeConfig();

  return (
    <Card
      className="mb-3 shadow-sm border-start border-4"
      style={{ borderLeftColor: `var(--bs-${config.color})` }}
    >
      <CardHeader className="bg-light">
        <Row className="align-items-center">
          <Col>
            <div className="d-flex align-items-center">
              <Badge color={config.color} className="me-2 px-3 py-2">
                <i className={`bi ${config.icon} me-1`}></i>
                {config.label}
              </Badge>
              <span className="text-muted small">Block #{index + 1}</span>
            </div>
          </Col>
          <Col xs="auto">
            <div className="btn-group btn-group-sm">
              {!viewMode && (
                <>
                  <Button
                    color="light"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    title={isCollapsed ? "Expand" : "Collapse"}
                  >
                    <i
                      className={`bi bi-chevron-${isCollapsed ? "down" : "up"}`}
                    ></i>
                  </Button>
                  <Button
                    color="light"
                    className="text-danger"
                    onClick={() => onRemove(index)}
                    title="Remove Block"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </>
              )}
            </div>
          </Col>
        </Row>
      </CardHeader>

      {!isCollapsed && (
        <CardBody className="p-4">
          {item.fileType === "RICH_TEXT" && (
            <RichTextEditorBlock
              item={item}
              onUpdate={onUpdate}
              viewMode={viewMode}
            />
          )}
          {item.fileType === "IMAGE" && (
            <ImageEditorBlock
              item={item}
              onUpdate={onUpdate}
              viewMode={viewMode}
            />
          )}
          {item.fileType === "TABLE" && (
            <TableEditorBlock
              item={item}
              onUpdate={onUpdate}
              viewMode={viewMode}
            />
          )}
          {item.fileType === "EXCEL" && (
            <ExcelEditorBlock
              item={item}
              onUpdate={onUpdate}
              viewMode={viewMode}
            />
          )}
          {item.fileType === "PDF" && (
            <PDFEditorBlock
              item={item}
              onUpdate={onUpdate}
              viewMode={viewMode}
            />
          )}
        </CardBody>
      )}
    </Card>
  );
};

// ==================== RICH TEXT EDITOR BLOCK ====================
const RichTextEditorBlock = ({ item, onUpdate, viewMode }) => {
  if (viewMode) {
    return (
      <div
        className="border p-3"
        dangerouslySetInnerHTML={{
          __html: item.richTextContent || "<p>No content</p>",
        }}
      />
    );
  }

  return (
    <JoditEditor
      value={item.richTextContent || ""}
      onBlur={(content) =>
        onUpdate(item.id, { richTextContent: content })
      }
      config={{
        height: 300,
        buttons: [
          "bold", "italic", "underline", "strikethrough",
          "fontsize", "font", "brush", "paragraph",
          "align", "ul", "ol", "indent", "outdent",
          "link", "table", "image", "hr",
          "undo", "redo"
        ],
      }}
    />
  );
};

// ==================== IMAGE EDITOR BLOCK ====================
const ImageEditorBlock = ({ item, onUpdate, viewMode }) => {
  const [cropper, setCropper] = useState(null);
  const [cropMode, setCropMode] = useState(false);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpdate(item.id, {
          imageUrl: reader.result,
          imageFile: file,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    multiple: false,
  });

  const handleCrop = () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      croppedCanvas.toBlob((blob) => {
        const croppedUrl = URL.createObjectURL(blob);
        const croppedFile = new File(
          [blob],
          item.fileName || "cropped-image.jpg",
          { type: "image/jpeg" }
        );
        onUpdate(item.id, {
          croppedImage: croppedUrl,
          imageFile: croppedFile,
        });
        setCropMode(false);
      });
    }
  };

  const displayImage = item.croppedImage || item.imageUrl;

  if (viewMode) {
    return displayImage ? (
      <div className="text-center">
        <img
          src={displayImage}
          alt="Content"
          className="img-fluid rounded shadow"
          style={{ maxHeight: "500px" }}
        />
      </div>
    ) : (
      <p className="text-muted text-center">No image uploaded</p>
    );
  }

  return (
    <div>
      {!displayImage ? (
        <div
          {...getRootProps()}
          className={`dropzone text-center p-5 border-3 border-dashed rounded ${
            isDragActive ? "border-primary bg-light" : "border-secondary"
          }`}
          style={{ cursor: "pointer", transition: "all 0.3s" }}
        >
          <input {...getInputProps()} />
          <i
            className="bi bi-cloud-upload"
            style={{ fontSize: "4rem", color: "#adb5bd" }}
          ></i>
          <h5 className="mt-3 text-muted">
            {isDragActive ? "Drop image here..." : "Drag & drop an image here"}
          </h5>
          <p className="text-muted">or click to select from your computer</p>
          <Button color="primary" size="sm">
            <i className="bi bi-folder2-open me-2"></i>
            Browse Files
          </Button>
        </div>
      ) : (
        <div>
          {cropMode ? (
            <div>
              <Cropper
                src={item.imageUrl}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={16 / 9}
                guides={true}
                crop={() => {}}
                ref={setCropper}
                viewMode={1}
                minCropBoxHeight={10}
                minCropBoxWidth={10}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
              />
              <div className="mt-3 d-flex gap-2">
                <Button color="success" onClick={handleCrop}>
                  <i className="bi bi-check2 me-2"></i>
                  Apply Crop
                </Button>
                <Button color="secondary" onClick={() => setCropMode(false)}>
                  <i className="bi bi-x me-2"></i>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-3 p-3 bg-light rounded">
                <img
                  src={displayImage}
                  alt="Preview"
                  className="img-fluid rounded shadow"
                  style={{ maxHeight: "400px" }}
                />
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  color="info"
                  size="sm"
                  onClick={() => setCropMode(true)}
                >
                  <i className="bi bi-crop me-2"></i>
                  Crop Image
                </Button>
                <Button
                  color="warning"
                  size="sm"
                  onClick={() =>
                    onUpdate(item.id, { imageUrl: null, croppedImage: null })
                  }
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Change Image
                </Button>
                {item.fileName && (
                  <span className="text-muted small align-self-center ms-2">
                    <i className="bi bi-file-image me-1"></i>
                    {item.fileName}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== TABLE EDITOR BLOCK ====================
const TableEditorBlock = ({ item, onUpdate, viewMode }) => {
  const tableData = item.tableData || { columns: [], rows: [] };
  const columns = tableData.columns;
  const rows = tableData.rows;

  /* ========= HELPERS ========= */
  const emitUpdate = (newColumns, newRows) => {
    onUpdate(item.id, {
      tableData: {
        columns: newColumns,
        rows: newRows,
      },
    });
  };

  /* ========= ADD COLUMN ========= */
  const addColumn = () => {
    const colIndex = columns.length + 1;
    const newColumns = [...columns, `Column ${colIndex}`];

    const newRows = rows.map((row) => ({
      ...row,
      [`col_${colIndex}`]: "",
    }));

    emitUpdate(newColumns, newRows);
  };

  /* ========= ADD ROW ========= */
  const addRow = () => {
    const newRow = {};
    columns.forEach((_, i) => {
      newRow[`col_${i + 1}`] = "";
    });

    emitUpdate(columns, [...rows, newRow]);
  };

  /* ========= UPDATE CELL ========= */
  const updateCell = (r, c, value) => {
    const newRows = [...rows];
    newRows[r] = {
      ...newRows[r],
      [`col_${c + 1}`]: value,
    };

    emitUpdate(columns, newRows);
  };

  /* ========= RENAME COLUMN ========= */
  const renameColumn = (index, value) => {
    const newColumns = [...columns];
    newColumns[index] = value;

    emitUpdate(newColumns, rows);
  };

  /* ========= REMOVE COLUMN ========= */
  const removeColumn = (removeIndex) => {
    const newColumns = columns.filter((_, i) => i !== removeIndex);

    const newRows = rows.map((row) => {
      const updatedRow = {};
      let newKeyIndex = 1;

      columns.forEach((_, i) => {
        if (i !== removeIndex) {
          updatedRow[`col_${newKeyIndex}`] = row[`col_${i + 1}`] || "";
          newKeyIndex++;
        }
      });

      return updatedRow;
    });

    emitUpdate(newColumns, newRows);
  };

  /* ========= REMOVE ROW ========= */
  const removeRow = (rowIndex) => {
    emitUpdate(
      columns,
      rows.filter((_, i) => i !== rowIndex)
    );
  };

  /* ========= VIEW MODE ========= */
  if (viewMode) {
    return (
      <Table bordered size="sm">
        <thead className="table-dark">
          <tr>
            {columns.map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {columns.map((_, c) => (
                <td key={c}>{row[`col_${c + 1}`] || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  }

  /* ========= EDIT MODE ========= */
  return (
    <>
      <div className="mb-2 d-flex gap-2">
        <Button size="sm" color="primary" onClick={addColumn}>
          + Column
        </Button>
        <Button size="sm" color="success" onClick={addRow}>
          + Row
        </Button>
      </div>

      <Table bordered size="sm">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>
                <div className="d-flex gap-1">
                  <Input
                    bsSize="sm"
                    value={col}
                    onChange={(e) => renameColumn(i, e.target.value)}
                  />
                  <Button
                    size="sm"
                    color="danger"
                    onClick={() => removeColumn(i)}
                  >
                    ×
                  </Button>
                </div>
              </th>
            ))}
            <th />
          </tr>
        </thead>

        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {columns.map((_, c) => (
                <td key={c}>
                  <Input
                    bsSize="sm"
                    value={row[`col_${c + 1}`] || ""}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                  />
                </td>
              ))}
              <td>
                <Button size="sm" color="danger" onClick={() => removeRow(r)}>
                  🗑
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

// ==================== EXCEL EDITOR BLOCK ====================
const ExcelEditorBlock = ({ item, onUpdate, viewMode }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      const columns = data[0] || [];
      const rows = data.slice(1).map((row) => {
        const obj = {};
        columns.forEach((col, i) => {
          obj[col] = row[i] || "";
        });
        return obj;
      });

      onUpdate(item.id, {
        excelData: { columns, rows },
        fileName: file.name,
        file: file,
      });
    };
    reader.readAsBinaryString(file);
  };

  if (viewMode) {
    if (!item.excelData.columns.length) {
      return <p className="text-muted text-center">No Excel data</p>;
    }
    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-sm">
          <thead className="table-success">
            <tr>
              {item.excelData.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.excelData.rows.map((row, i) => (
              <tr key={i}>
                {item.excelData.columns.map((col) => (
                  <td key={col}>{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          className="form-control"
        />
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Supported formats: .xlsx, .xls
        </small>
      </div>

      {item.fileName && (
        <div className="alert alert-success">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-file-earmark-excel text-success me-2"
                  style={{ fontSize: "2rem" }}
                ></i>
                <div>
                  <strong>{item.fileName}</strong>
                  <div className="small text-muted">
                    <Badge color="success" className="me-2">
                      {item.excelData.rows.length} rows
                    </Badge>
                    <Badge color="success">
                      {item.excelData.columns.length} columns
                    </Badge>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};

// ==================== PDF EDITOR BLOCK ====================
const PDFEditorBlock = ({ item, onUpdate, viewMode }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpdate(item.id, {
        pdfUrl: reader.result,
        fileName: file.name,
        file: file,
      });
    };
    reader.readAsDataURL(file);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    onUpdate(item.id, { pdfNumPages: numPages });
  };

  if (viewMode) {
    if (!item.pdfUrl) {
      return <p className="text-muted text-center">No PDF uploaded</p>;
    }
    return (
      <div className="text-center">
        <div className="alert alert-info">
          <i className="bi bi-file-pdf me-2" style={{ fontSize: "2rem" }}></i>
          <strong>PDF Document:</strong> {item.fileName}
          <div className="small mt-1">Pages: {item.pdfNumPages}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="form-control"
        />
        <small className="text-muted">
          <i className="bi bi-info-circle me-1"></i>
          Supported format: .pdf
        </small>
      </div>

      {item.pdfUrl && (
        <div className="border rounded p-3 bg-light">
          <div className="text-center mb-3">
            <Document
              file={item.pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="mx-auto"
            >
              <Page pageNumber={pageNumber} width={600} />
            </Document>
          </div>
          {numPages && (
            <div className="d-flex justify-content-between align-items-center">
              <Button
                size="sm"
                color="secondary"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(pageNumber - 1)}
              >
                <i className="bi bi-chevron-left"></i> Previous
              </Button>
              <span className="text-muted">
                Page {pageNumber} of {numPages}
              </span>
              <Button
                size="sm"
                color="secondary"
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(pageNumber + 1)}
              >
                Next <i className="bi bi-chevron-right"></i>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicContentEditor;
