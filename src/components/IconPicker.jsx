import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  Input
} from "reactstrap";
import { ICONS } from "../utilies/icons";

const IconPicker = ({ isOpen, toggle, onSelect }) => {
  const [search, setSearch] = useState("");

  const icons = Object.entries(ICONS).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size="lg"
      centered
      scrollable
    >
      {/* DEFAULT CLOSE BUTTON */}
      <ModalHeader toggle={toggle}>
        <strong className="text-primary">Search & Select an Icon</strong>
      </ModalHeader>

      <ModalBody>
        {/* SEARCH */}
        <Input
          placeholder="Search icon (FaLink, FaBell...)"
          className="mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ICON GRID */}
        <div
          className="d-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            gap: "12px",
            maxHeight: "60vh",
            overflowY: "auto"
          }}
        >
          {icons.map(([name, Icon]) => (
            <div
              key={name}
              onClick={() => {
                onSelect(name);
                toggle();
              }}
              className="border rounded text-center p-2"
              style={{ cursor: "pointer" }}
            >
              <Icon size={22} className="mb-1" />
              <div
                className="text-muted"
                style={{ fontSize: 10, wordBreak: "break-all" }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
};

export default IconPicker;
