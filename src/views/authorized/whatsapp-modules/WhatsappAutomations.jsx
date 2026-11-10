import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
import Swal from "sweetalert2";
import apiClient, { getApiResponseData } from "@apiService";

const NODE_DEFAULTS = {
  TRIGGER: {},
  TEXT: { text: "" },
  IMAGE: { url: "", caption: "" },
  VIDEO: { url: "", caption: "" },
  DOCUMENT: { url: "", caption: "", fileName: "" },
  LIST: { title: "", body: "", buttonText: "Choose", sections: [] },
  LOCATION: { latitude: "", longitude: "", name: "", address: "" },
  CONDITION: { field: "message", operator: "contains", value: "" },
  DELAY: { delayMs: 1000 },
  RANDOM_SPLIT: {},
  SET_VARIABLE: { name: "", value: "" },
  WEBHOOK: { url: "", method: "POST", body: {} },
  HTTP_REQUEST: { url: "", method: "POST", body: {} },
  ADD_TO_GROUP: { listId: "" },
  UPDATE_CONTACT: { name: "", email: "" },
  TAG_CONTACT: { tag: "" },
  GO_TO_FLOW: { flowId: "" },
  END: {},
};

const createNode = (type, index) => ({
  nodeId: `node_${Date.now()}_${index}`,
  type,
  label: type.replaceAll("_", " "),
  config: { ...NODE_DEFAULTS[type] },
  position: { x: 0, y: index * 120 },
});

const WhatsappAutomations = () => {
  const [flows, setFlows] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [flow, setFlow] = useState(null);
  const [nodeType, setNodeType] = useState("TEXT");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedNodeId, setDraggedNodeId] = useState("");

  const loadFlows = useCallback(async () => {
    try {
      const [flowResponse, listResponse] = await Promise.all([
        apiClient.get("/whatsapp/automations"),
        apiClient.get("/contact-lists/list", { params: { channel: "WHATSAPP" } }),
      ]);
      const flowData = getApiResponseData(flowResponse);
      const listData = getApiResponseData(listResponse);
      setFlows(Array.isArray(flowData) ? flowData : []);
      setContactLists(Array.isArray(listData) ? listData : []);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Unable to load flows", text: error?.message || "Please retry." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadFlows, 0);
    return () => window.clearTimeout(timer);
  }, [loadFlows]);

  const edges = (() => {
    if (!flow?.nodes?.length) return [];
    const result = [];
    flow.nodes.forEach((node, index) => {
      const next = flow.nodes[index + 1];
      if (!next) return;
      if (["CONDITION", "RANDOM_SPLIT"].includes(node.type)) {
        const alternate = flow.nodes[index + 2] || next;
        result.push({ from: node.nodeId, to: next.nodeId, sourceHandle: "true" });
        result.push({ from: node.nodeId, to: alternate.nodeId, sourceHandle: "false" });
      } else {
        result.push({ from: node.nodeId, to: next.nodeId, sourceHandle: "" });
      }
    });
    return result;
  })();

  const startNewFlow = () => {
    setFlow({
      name: "",
      trigger: { type: "ANY_MESSAGE", keywords: [] },
      nodes: [createNode("TRIGGER", 0), createNode("END", 1)],
      isActive: false,
    });
  };

  const addNode = () => {
    if (!flow) return;
    const node = createNode(nodeType, flow.nodes.length);
    const endIndex = flow.nodes.findIndex((item) => item.type === "END");
    const nodes = [...flow.nodes];
    nodes.splice(endIndex < 0 ? nodes.length : endIndex, 0, node);
    setFlow({ ...flow, nodes: nodes.map((item, index) => ({ ...item, position: { x: 0, y: index * 120 } })) });
  };

  const updateNodeConfig = (nodeId, key, value) => {
    setFlow((current) => ({
      ...current,
      nodes: current.nodes.map((item) =>
        item.nodeId === nodeId
          ? { ...item, config: { ...(item.config || {}), [key]: value } }
          : item
      ),
    }));
  };

  const updateStructuredNodeConfig = (nodeId, key, text) => {
    try {
      updateNodeConfig(nodeId, key, JSON.parse(text));
    } catch {
      // Keep the last valid value while the structured editor contains incomplete JSON.
    }
  };

  const saveFlow = async () => {
    if (!flow) return;
    if (!flow.name.trim()) {
      Swal.fire({ icon: "warning", title: "Flow name required", text: "Enter a name before saving this flow." });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...flow, edges };
      if (flow._id) {
        await apiClient.put(`/whatsapp/automations/${flow._id}`, payload);
      } else {
        await apiClient.post("/whatsapp/automations", payload);
      }
      setFlow(null);
      await loadFlows();
      Swal.fire({ icon: "success", title: "Automation flow saved", timer: 1300, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: "error", title: "Flow was not saved", text: error?.message || "Check the flow and retry." });
    } finally {
      setSaving(false);
    }
  };

  const deleteFlow = async (id) => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "Delete this flow?",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirmed.isConfirmed) return;
    try {
      await apiClient.delete(`/whatsapp/automations/${id}`);
      if (flow?._id === id) setFlow(null);
      await loadFlows();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Flow was not deleted", text: error?.message || "Please retry." });
    }
  };

  const moveNode = (fromId, toId) => {
    if (!flow || fromId === toId) return;
    const nodes = [...flow.nodes];
    const from = nodes.findIndex((node) => node.nodeId === fromId);
    const to = nodes.findIndex((node) => node.nodeId === toId);
    if (from < 0 || to < 0) return;
    if (["TRIGGER", "END"].includes(nodes[from].type) || ["TRIGGER", "END"].includes(nodes[to].type)) return;
    const [item] = nodes.splice(from, 1);
    nodes.splice(to, 0, item);
    setFlow({ ...flow, nodes: nodes.map((node, index) => ({ ...node, position: { x: 0, y: index * 120 } })) });
  };

  return (
    <div className="telecom-module-wrapper">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">WhatsApp Automation Flows</h4>
            <div className="small text-white-50">Build account-scoped flows triggered by incoming WhatsApp messages.</div>
          </div>
          <Button color="success" onClick={startNewFlow}>Create flow</Button>
        </CardHeader>
        <CardBody>
          {loading && <div className="text-muted">Loading flows…</div>}
          {!loading && flows.length === 0 && <div className="text-muted">No automation flows created yet.</div>}
          <Row className="g-3">
            {flows.map((item) => (
              <Col md={6} xl={4} key={item._id}>
                <Card className="h-100 border">
                  <CardBody>
                    <div className="d-flex justify-content-between align-items-start">
                      <strong>{item.name}</strong>
                      <Badge color={item.isActive ? "success" : "secondary"}>{item.isActive ? "Active" : "Draft"}</Badge>
                    </div>
                    <div className="small text-muted my-2">
                      {item.trigger?.type === "KEYWORD" ? `Keywords: ${(item.trigger.keywords || []).join(", ")}` : "Every inbound message"}
                    </div>
                    <div className="small text-muted mb-3">{item.nodes?.length || 0} nodes</div>
                    <Button color="primary" size="sm" onClick={() => setFlow({ ...item })}>Edit</Button>
                    <Button color="danger" outline size="sm" className="ms-2" onClick={() => deleteFlow(item._id)}>Delete</Button>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      {flow && (
        <Card className="border-0 shadow-sm rounded-4">
          <CardHeader className="bg-white d-flex justify-content-between align-items-center">
            <strong>{flow._id ? "Edit flow" : "New flow"}</strong>
            <Button color="light" onClick={() => setFlow(null)}>Close</Button>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={5}>
                <FormGroup>
                  <Label>Flow name</Label>
                  <Input value={flow.name} onChange={(event) => setFlow({ ...flow, name: event.target.value })} maxLength={120} />
                </FormGroup>
                <FormGroup>
                  <Label>Trigger</Label>
                  <Input
                    type="select"
                    value={flow.trigger?.type || "ANY_MESSAGE"}
                    onChange={(event) => setFlow({ ...flow, trigger: { ...flow.trigger, type: event.target.value } })}
                  >
                    <option value="ANY_MESSAGE">Any incoming message</option>
                    <option value="KEYWORD">Message contains a keyword</option>
                  </Input>
                </FormGroup>
                {flow.trigger?.type === "KEYWORD" && (
                  <FormGroup>
                    <Label>Keywords (comma-separated)</Label>
                    <Input
                      value={(flow.trigger.keywords || []).join(", ")}
                      onChange={(event) => setFlow({
                        ...flow,
                        trigger: {
                          ...flow.trigger,
                          keywords: event.target.value.split(",").map((word) => word.trim()).filter(Boolean),
                        },
                      })}
                    />
                  </FormGroup>
                )}
                <FormGroup check className="mb-3">
                  <Input type="checkbox" checked={Boolean(flow.isActive)} onChange={(event) => setFlow({ ...flow, isActive: event.target.checked })} />
                  <Label check>Activate flow after saving</Label>
                </FormGroup>
                <FormGroup>
                  <Label>Add node</Label>
                  <div className="d-flex gap-2">
                    <Input type="select" value={nodeType} onChange={(event) => setNodeType(event.target.value)}>
                      {Object.keys(NODE_DEFAULTS).filter((type) => !["TRIGGER", "END"].includes(type)).map((type) => (
                        <option key={type} value={type}>{type.replaceAll("_", " ")}</option>
                      ))}
                    </Input>
                    <Button color="primary" onClick={addNode}>
                      Add
                    </Button>
                  </div>
                </FormGroup>
                <div className="small text-muted">
                  Drag nodes to reorder. Nodes connect in order; condition and random-split nodes route the true path to the next node and false path to the following node. Text variables include {"{{message}}"}, {"{{customerName}}"}, {"{{phone}}"} and values created by SET_VARIABLE.
                </div>
              </Col>
              <Col md={7}>
                <div className="d-flex flex-column gap-2">
                  {flow.nodes.map((node, index) => (
                    <Card
                      key={node.nodeId}
                      draggable
                      onDragStart={() => setDraggedNodeId(node.nodeId)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        moveNode(draggedNodeId, node.nodeId);
                        setDraggedNodeId("");
                      }}
                      className="border"
                    >
                      <CardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <strong>{index + 1}. {node.type.replaceAll("_", " ")}</strong>
                          {!["TRIGGER", "END"].includes(node.type) && (
                            <Button
                              color="danger"
                              outline
                              size="sm"
                              onClick={() => setFlow({ ...flow, nodes: flow.nodes.filter((item) => item.nodeId !== node.nodeId) })}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {Object.entries({ ...NODE_DEFAULTS[node.type], ...(node.config || {}) }).map(([key, value]) => (
                          <FormGroup key={key} className="mb-2">
                            <Label className="small text-muted">{key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}</Label>
                            {node.type === "ADD_TO_GROUP" && key === "listId" ? (
                              <Input
                                type="select"
                                value={value || ""}
                                onChange={(event) => updateNodeConfig(node.nodeId, key, event.target.value)}
                              >
                                <option value="">Select a WhatsApp group</option>
                                {contactLists.map((list) => <option key={list._id} value={list._id}>{list.name}</option>)}
                              </Input>
                            ) : node.type === "GO_TO_FLOW" && key === "flowId" ? (
                              <Input
                                type="select"
                                value={value || ""}
                                onChange={(event) => updateNodeConfig(node.nodeId, key, event.target.value)}
                              >
                                <option value="">Select an active flow</option>
                                {flows.filter((item) => item.isActive && item._id !== flow._id).map((item) => (
                                  <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                              </Input>
                            ) : node.type === "CONDITION" && key === "field" ? (
                              <Input type="select" value={value || "message"} onChange={(event) => updateNodeConfig(node.nodeId, key, event.target.value)}>
                                <option value="message">Incoming message</option><option value="name">Contact name</option><option value="phone">Phone number</option>
                              </Input>
                            ) : node.type === "CONDITION" && key === "operator" ? (
                              <Input type="select" value={value || "contains"} onChange={(event) => updateNodeConfig(node.nodeId, key, event.target.value)}>
                                <option value="contains">Contains</option><option value="equals">Equals</option>
                              </Input>
                            ) : value !== null && typeof value === "object" ? (
                              <Input
                                type="textarea"
                                rows="3"
                                value={JSON.stringify(value, null, 2)}
                                onChange={(event) => updateStructuredNodeConfig(node.nodeId, key, event.target.value)}
                                aria-label={`${node.type} ${key} JSON`}
                              />
                            ) : (
                              <Input
                                type={["latitude", "longitude", "delayMs"].includes(key) ? "number" : "text"}
                                step={["latitude", "longitude", "delayMs"].includes(key) ? "any" : undefined}
                                value={value ?? ""}
                                onChange={(event) => updateNodeConfig(
                                  node.nodeId,
                                  key,
                                  ["latitude", "longitude", "delayMs"].includes(key) && event.target.value !== ""
                                    ? Number(event.target.value)
                                    : event.target.value
                                )}
                              />
                            )}
                          </FormGroup>
                        ))}
                        {!Object.keys({ ...NODE_DEFAULTS[node.type], ...(node.config || {}) }).length && (
                          <div className="small text-muted">This node does not need additional settings.</div>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button color="light" onClick={() => setFlow(null)}>Cancel</Button>
              <Button color="success" onClick={saveFlow} disabled={saving}>{saving ? "Saving…" : "Save flow"}</Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default WhatsappAutomations;
