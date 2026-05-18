import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Table, Spinner, Badge, Button } from "reactstrap";

const API = import.meta.env.VITE_API_URL;
const token = sessionStorage.getItem("authToken");
const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const copyToClipboard = (filepath) => {
  navigator.clipboard.writeText(filepath);
};


  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/files/list`,
          { headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }}  
        );
        setFiles(res.data?.data || []);
      } catch (err) {
        setError("Failed to load uploaded files");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="text-center my-3">
        <Spinner size="sm" /> Loading files...
      </div>
    );
  }

  if (error) {
    return <p className="text-danger text-center">{error}</p>;
  }

  return (
    <div>
      <h5 className="mb-3">Uploaded Files</h5>

      {files.length === 0 && (
        <p className="text-muted">No files uploaded yet</p>
      )}

      <Table bordered hover responsive className="mt-3">
        <thead className="table-light">
          <tr>
            <th>S.No.</th>
            <th>File Name</th>
            <th>File Path</th>
            <th>Type</th>
            <th>Size (KB)</th>
            <th>Uploaded On</th>
            <th>File ID</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file, index) => (
            <tr key={file._id}>
              <td>{index + 1}</td>

              <td className="fw-bold text-primary">{file.originalName}</td>

              <td style={{ maxWidth: "250px", wordBreak: "break-all" }}>
                {file.filePath}
              </td>

              <td>
                <Badge color="info">
                  {file.originalName?.split(".").pop().toUpperCase()}
                </Badge>
              </td>

              <td>{(file.fileSize / 1024).toFixed(2)}</td>

              <td>{formatDateTime(file.createdAt)}</td>

              <td>
                <Badge color="secondary">{file._id}</Badge>
              </td>

              <td>
                <a
                  href={API + file.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  View
                </a>
                <Button   onClick={()=>copyToClipboard(API + file.filePath)} color="primary" size="sm" className="btn-xs">
                  Copy Link
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default FileManager;
