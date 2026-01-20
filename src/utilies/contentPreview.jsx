import React, { useState } from "react";
const API = "http://localhost:4000";
import "../css/aboutAndHelp.css";



/* ---------- TABLE VIEW ---------- */
const TableView = ({ columns = [], rows = [] }) => (
  <div className="table-responsive my-4">
    <table className="table table-bordered table-striped">
      <thead className="table-light">
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FileActions = ({ name, onView, downloadUrl }) => (
  <div
    style={{ backgroundColor: "#e4e4e5" }}
    className="d-flex align-items-center gap-3"
  >
    <strong> → {name}</strong>
    <a href={downloadUrl} download className="btn btn-sm btn-outline-primary">
      ⬇ Download
    </a>
    <button className="btn btn-sm btn-outline-secondary" onClick={onView}>
      👁 View
    </button>
  </div>
);

/* ---------- MAIN PREVIEW ---------- */
const ContentPreview = ({ contents = [] }) => {
  if (!contents.length) {
    return <div className="text-muted">No content available</div>;
  }

  console.log("Getting contendt", contents);

  return (
    <div className="my-4">
      {contents.map((item, index) => (
        <div key={index} className="mb-5">
          {/* OPTIONAL TITLE */}
          {item.title && <h5 className="fw-bold mb-2">{item.title}</h5>}

          {/* RICH TEXT */}
          {item.fileType === "RICH_TEXT" && (
            <div
              className="rich-text-content"
              dangerouslySetInnerHTML={{
                __html: item.richTextContent,
              }}
            />
          )}

          {/* IMAGE */}
          {item.fileType === "IMAGE" && (
            <img
              src={API  + item.filePath}
              alt="No Image found"
              className="img-fluid rounded shadow-sm my-3"
              style={{ maxHeight: "420px", objectFit: "contain" }}
            />
          )}

          {item.fileType === "PDF" &&
            (() => {
              const [show, setShow] = useState(false);

              return (
                <>
                  <FileActions
                    name={item.fileName || "PDF Document"}
                    downloadUrl={API + item.filePath}
                    onView={() => setShow(!show)}
                  />

                  {show && (
                    <iframe
                      src={API + item.filePath}
                      title={`PDF-${index}`}
                      width="100%"
                      height="600px"
                      style={{ border: "1px solid #ccc" }}
                    />
                  )}
                </>
              );
            })()}

          {item.fileType === "EXCEL" &&
            item.excelData &&
            (() => {
              const [show, setShow] = useState(false);

              return (
                <>
                  <FileActions
                    name={item.fileName || "Excel Sheet"}
                    downloadUrl={API + item.filePath}
                    onView={() => setShow(!show)}
                  />

                  {show && (
                    <TableView
                      columns={item.excelData.columns}
                      rows={item.excelData.rows}
                    />
                  )}
                </>
              );
            })()}

          {/* TABLE */}
          {item.fileType === "TABLE" && item.tableData && (
  <div className="table-responsive">
    <table className="table table-bordered table-sm">
      <thead>
        <tr>
          {item.tableData.columns.map((col, i) => (
            <th key={i}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {item.tableData.rows.map((row, rIdx) => (
          <tr key={rIdx}>
            {item.tableData.columns.map((_, cIdx) => (
              <td key={cIdx}>
                {row[`col_${cIdx + 1}`] ?? "-"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

        </div>
      ))}
    </div>
  );
};

export default ContentPreview;
