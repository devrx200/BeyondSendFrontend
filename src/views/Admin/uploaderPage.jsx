import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Spinner
} from "reactstrap";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const FileUploader = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= FILE DROP ================= */

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
  });

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file); // ✅ single key only

      await axios.post(`${API}/api/files/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully");
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PREVIEW ================= */

  const renderPreview = () => {
    if (!file) return null;

    if (file.type.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className="img-fluid rounded"
          style={{ maxHeight: 300 }}
        />
      );
    }

    if (file.type === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          title="PDF Preview"
          width="100%"
          height="400px"
          style={{ border: "1px solid #ccc" }}
        />
      );
    }

    return (
      <div className="text-center">
        <i className="bi bi-file-earmark-excel text-success fs-1"></i>
        <p className="mt-2">{file.name}</p>
      </div>
    );
  };

  /* ================= UI ================= */

  return (
    <Card className="shadow-sm">
      <CardBody>
        {!file ? (
          <div
            {...getRootProps()}
            className={`border border-dashed p-5 text-center rounded ${
              isDragActive ? "bg-light" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <input {...getInputProps()} />
            <i className="bi bi-cloud-upload fs-1 text-muted"></i>
            <h5 className="mt-3">
              {isDragActive ? "Drop file here" : "Drag & drop file here"}
            </h5>
            <p className="text-muted mb-0">
              JPG / PNG / PDF / Excel
            </p>
          </div>
        ) : (
          <div className="text-center">
            {renderPreview()}

            <div className="mt-3 d-flex justify-content-center gap-2">
              <Button
                color="warning"
                size="sm"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                }}
              >
                Replace File
              </Button>

              <Button
                color="primary"
                size="sm"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Upload"}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-danger mt-3 text-center">{error}</p>}
      </CardBody>
    </Card>
  );
};

export default FileUploader;
