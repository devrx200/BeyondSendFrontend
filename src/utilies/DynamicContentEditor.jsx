// DynamicContentEditor.jsx — Rich Text Only CMS Editor
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Row, Col, Badge } from "reactstrap";
import JoditEditor from "jodit-react";

/* ==================== CUSTOM LINK BUTTON (TABLE SAFE) ==================== */
const linkCommand = {
  name: "customLink",
  tooltip: "Insert link",
  icon: "link",
  exec: (editor) => {
    const url = prompt("Enter URL");
    if (!url) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      alert("Please select text first");
      return;
    }

    const range = selection.getRangeAt(0);

    if (range.collapsed) {
      alert("Please select text first");
      return;
    }

    const a = editor.createInside.element("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    try {
      range.surroundContents(a);
    } catch {
      const contents = range.extractContents();
      a.appendChild(contents);
      range.insertNode(a);
    }

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(a);
    selection.addRange(newRange);
  },
};

/* ==================== MAIN EDITOR ==================== */
const DynamicContentEditor = ({ contents, setContents, viewMode = false }) => {
  // Ensure exactly one Rich Text block exists
  useEffect(() => {
    if (!contents || contents.length === 0) {
      setContents([
        {
          id: Date.now(),
          fileType: "RICH_TEXT",
          richTextContent: "",
        },
      ]);
    }
  }, []);

  const updateContent = (id, updates) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const item = contents?.[0];

  if (!item) return null;

  return (
    <div className="cms-editor">
      <Card className="mb-3 shadow-sm border-start border-4 border-primary">
        <CardHeader className="bg-light">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                <Badge color="primary" className="me-2 px-3 py-2">
                  <i className="bi bi-fonts me-1"></i>
                  Rich Text Editor
                </Badge>
              </div>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-4">
          <RichTextEditorBlock
            item={item}
            onUpdate={updateContent}
            viewMode={viewMode}
          />
        </CardBody>
      </Card>

      <style jsx>{`
        .cms-editor {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

/* ==================== RICH TEXT BLOCK ==================== */
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
        height: 400,
        readonly: false,
        toolbarAdaptive: false,

        /* 🔹 Enable custom table-safe link */
        extraButtons: [linkCommand],

        /* 🔹 Selection + paste stability */
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: "insert_as_html",

        /* 🔹 Preserve inline + table HTML */
        cleanHTML: {
          removeEmptyElements: false,
          fillEmptyParagraph: false,
        },

        /* 🔹 Allow selection inside tables */
        selection: {
          allowMultiSelection: true,
          allowCellSelection: true,
        },

        /* 🔹 Don’t block commands in tables */
        events: {
          beforeCommand: () => true,
        },

        /* 🔹 Link behavior */
        link: {
          followOnDblClick: false,
          openInNewTabCheckbox: true,
        },

        /* 🔹 Table behavior */
        table: {
          allowCellResize: true,
          allowCellSelection: true,
        },

        /* ================= IMAGE UPLOAD ONLY ================= */

        image: {
          openOnDblClick: false,
          editSrc: false,          // ❌ disable editing image URL
          useImageEditor: false,
        },

        uploader: {
          insertImageAsBase64URI: true, // ✅ store image as base64 in content
          imagesExtensions: ["jpg", "jpeg", "png", "gif", "webp"],
          withCredentials: false,
        },

        filebrowser: {
          ajax: {
            url: "", // ❌ no server file browser
          },
        },

        /* ❌ Remove URL tab from image dialog */
        removeButtons: ["imageProperties"],

        /* 🔹 Toolbar buttons */
        buttons: [
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "fontsize",
          "font",
          "brush",
          "paragraph",
          "align",
          "ul",
          "ol",
          "indent",
          "outdent",
          "customLink",
          "table",
          "image",   // still shows image button (upload only)
          "hr",
          "undo",
          "redo",
        ],
      }}
    />
  );
};


export default DynamicContentEditor;
