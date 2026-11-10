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
import { pdfjs } from "react-pdf";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import apiClient, { getApiResponseData } from "@apiService";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

const DEFAULT_AI_SETTINGS = {
  enabled: false,
  provider: "OPENAI_COMPATIBLE",
  baseUrl: "https://api.openai.com/v1/chat/completions",
  model: "gpt-4o-mini",
  temperature: 0.2,
  maxTokens: 500,
  systemPrompt:
    "Answer using the supplied business knowledge. If the knowledge does not contain the answer, reply with [ESCALATE_TO_AGENT].",
  triggerWords: ["hi", "hello", "help", "support", "info"],
};

const WhatsappAssistant = () => {
  const [settings, setSettings] = useState(DEFAULT_AI_SETTINGS);
  const [apiKey, setApiKey] = useState("");
  const [clearApiKey, setClearApiKey] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [documentForm, setDocumentForm] = useState({ title: "", content: "" });
  const [qaForm, setQaForm] = useState({ question: "", answer: "" });
  const [editingDocument, setEditingDocument] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [savingQa, setSavingQa] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await apiClient.get("/whatsapp/assistant/settings");
      const data = getApiResponseData(response) || {};
      setSettings({ ...DEFAULT_AI_SETTINGS, ...(data.ai || {}) });
      setKnowledgeBase(data.knowledgeBase || []);
      setQuestionAnswers(data.questionAnswers || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Unable to load AI assistant settings",
        text: error?.message || "Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadData(), 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSavingSettings(true);
    try {
      const response = await apiClient.put("/whatsapp/assistant/settings", {
        ...settings,
        triggerWords: String(settings.triggerWords || "")
          .split(",")
          .map((word) => word.trim())
          .filter(Boolean),
        apiKey,
        clearApiKey,
      });
      setSettings((current) => ({ ...current, ...(getApiResponseData(response) || {}) }));
      setApiKey("");
      setClearApiKey(false);
      Swal.fire({ icon: "success", title: "AI settings saved", timer: 1300, showConfirmButton: false });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "AI settings were not saved",
        text: error?.message || "Please check the provider settings.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const saveDocument = async (event) => {
    event.preventDefault();
    setSavingDocument(true);
    try {
      if (editingDocument) {
        await apiClient.patch(`/whatsapp/assistant/knowledge/${editingDocument}`, documentForm);
      } else {
        await apiClient.post("/whatsapp/assistant/knowledge", documentForm);
      }
      setDocumentForm({ title: "", content: "" });
      setEditingDocument("");
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Knowledge was not saved", text: error?.message || "Please try again." });
    } finally {
      setSavingDocument(false);
    }
  };

  const saveQuestionAnswer = async (event) => {
    event.preventDefault();
    setSavingQa(true);
    try {
      await apiClient.post("/whatsapp/assistant/questions", qaForm);
      setQaForm({ question: "", answer: "" });
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: "Q&A pair was not saved", text: error?.message || "Please try again." });
    } finally {
      setSavingQa(false);
    }
  };

  const deleteItem = async (url, label) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `Delete ${label}?`,
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await apiClient.delete(url);
      await loadData();
    } catch (error) {
      Swal.fire({ icon: "error", title: `${label} was not deleted`, text: error?.message || "Please try again." });
    }
  };

  const loadTextFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let content = "";
      if (extension === "pdf") {
        const document = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const pages = await Promise.all(
          Array.from({ length: document.numPages }, async (_, index) => {
            const page = await document.getPage(index + 1);
            const pageText = await page.getTextContent();
            return pageText.items.map((item) => item.str).join(" ");
          })
        );
        content = pages.join("\n\n");
      } else if (extension === "xlsx" || extension === "xls") {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        content = workbook.SheetNames.map((name) =>
          `${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`
        ).join("\n\n");
      } else {
        content = await file.text();
      }
      if (!content.trim() || content.length > 100000) {
        throw new Error("The document must contain text and be no larger than 100,000 characters.");
      }
      setDocumentForm({ title: file.name.replace(/\.[^.]+$/, ""), content });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "File could not be read",
        text: error.message || "Choose a PDF, Excel, CSV, or UTF-8 text document.",
      });
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="telecom-module-wrapper">
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <CardHeader className="bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">WhatsApp AI & Auto-Reply</h4>
            <div className="small text-white-50">Configure the assistant, its knowledge, and first-message triggers.</div>
          </div>
          <Badge color={settings.enabled && settings.apiKeyConfigured ? "success" : "secondary"}>
            {settings.enabled && settings.apiKeyConfigured ? "Ready" : "Not active"}
          </Badge>
        </CardHeader>
        <CardBody>
          <form onSubmit={saveSettings}>
            <Row>
              <Col md={6}>
                <FormGroup check className="mb-3">
                  <Input
                    type="checkbox"
                    checked={Boolean(settings.enabled)}
                    onChange={(event) => setSettings({ ...settings, enabled: event.target.checked })}
                  />
                  <Label check>Enable WhatsApp AI auto-reply</Label>
                </FormGroup>
                <FormGroup>
                  <Label>Provider type</Label>
                  <Input value="OpenAI-compatible chat completions" disabled />
                </FormGroup>
                <FormGroup>
                  <Label>API endpoint</Label>
                  <Input
                    type="url"
                    value={settings.baseUrl || ""}
                    onChange={(event) => setSettings({ ...settings, baseUrl: event.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Model</Label>
                  <Input
                    value={settings.model || ""}
                    onChange={(event) => setSettings({ ...settings, model: event.target.value })}
                    maxLength={120}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Provider API key</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    autoComplete="new-password"
                    placeholder={settings.apiKeyConfigured ? "Saved securely; enter a new key to rotate" : "Enter provider API key"}
                  />
                  <div className="small text-muted mt-1">
                    The key is encrypted before it is stored and is never returned by the API.
                  </div>
                  {settings.apiKeyConfigured && (
                    <FormGroup check className="mt-2">
                      <Input
                        type="checkbox"
                        checked={clearApiKey}
                        onChange={(event) => setClearApiKey(event.target.checked)}
                      />
                      <Label check>Remove saved API key</Label>
                    </FormGroup>
                  )}
                </FormGroup>
              </Col>
              <Col md={6}>
                <Row>
                  <Col sm={6}>
                    <FormGroup>
                      <Label>Temperature (0–2)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(event) => setSettings({ ...settings, temperature: Number(event.target.value) })}
                      />
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup>
                      <Label>Maximum response tokens</Label>
                      <Input
                        type="number"
                        min="1"
                        max="4000"
                        value={settings.maxTokens}
                        onChange={(event) => setSettings({ ...settings, maxTokens: Number(event.target.value) })}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <FormGroup>
                  <Label>Trigger words (comma-separated)</Label>
                  <Input
                    value={Array.isArray(settings.triggerWords) ? settings.triggerWords.join(", ") : settings.triggerWords}
                    onChange={(event) => setSettings({ ...settings, triggerWords: event.target.value })}
                  />
                  <div className="small text-muted mt-1">
                    Trigger words are checked only on the first customer message in a conversation.
                  </div>
                </FormGroup>
                <FormGroup>
                  <Label>System prompt</Label>
                  <Input
                    type="textarea"
                    rows="5"
                    value={settings.systemPrompt || ""}
                    onChange={(event) => setSettings({ ...settings, systemPrompt: event.target.value })}
                    maxLength={8000}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Button color="success" type="submit" disabled={savingSettings}>
              {savingSettings ? "Saving…" : "Save AI settings"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Row>
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <CardHeader className="bg-white fw-bold">Knowledge base</CardHeader>
            <CardBody>
              <form onSubmit={saveDocument}>
                <FormGroup>
                  <Label>Title</Label>
                  <Input
                    value={documentForm.title}
                    onChange={(event) => setDocumentForm({ ...documentForm, title: event.target.value })}
                    maxLength={160}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Training content</Label>
                  <Input
                    type="textarea"
                    rows="6"
                    value={documentForm.content}
                    onChange={(event) => setDocumentForm({ ...documentForm, content: event.target.value })}
                    maxLength={100000}
                    required
                  />
                  <Input type="file" accept=".pdf,.xlsx,.xls,.txt,.md,.csv,.log,application/pdf,text/plain" onChange={loadTextFile} className="mt-2" />
                  <small className="text-muted">Upload PDF, Excel, CSV, or UTF-8 text files to extract training content.</small>
                </FormGroup>
                <Button type="submit" color="primary" disabled={savingDocument}>
                  {savingDocument ? "Saving…" : editingDocument ? "Update document" : "Add training data"}
                </Button>
                {editingDocument && (
                  <Button
                    type="button"
                    color="light"
                    className="ms-2"
                    onClick={() => {
                      setEditingDocument("");
                      setDocumentForm({ title: "", content: "" });
                    }}
                  >
                    Cancel edit
                  </Button>
                )}
              </form>
              <hr />
              <div className="d-flex flex-column gap-2">
                {knowledgeBase.map((document) => (
                  <div key={document._id} className="border rounded p-3 d-flex justify-content-between gap-2">
                    <div className="text-truncate">
                      <strong>{document.title}</strong>
                      <div className="small text-muted text-truncate">{document.content}</div>
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        color="light"
                        size="sm"
                        onClick={() => {
                          setEditingDocument(document._id);
                          setDocumentForm({ title: document.title, content: document.content });
                        }}
                      >
                        Edit
                      </Button>
                      <Button color="danger" outline size="sm" onClick={() => deleteItem(`/whatsapp/assistant/knowledge/${document._id}`, "training data")}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {knowledgeBase.length === 0 && <div className="small text-muted">No training data added.</div>}
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <CardHeader className="bg-white fw-bold">Question & answer pairs</CardHeader>
            <CardBody>
              <form onSubmit={saveQuestionAnswer}>
                <FormGroup>
                  <Label>Question</Label>
                  <Input
                    value={qaForm.question}
                    onChange={(event) => setQaForm({ ...qaForm, question: event.target.value })}
                    maxLength={1000}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Answer</Label>
                  <Input
                    type="textarea"
                    rows="3"
                    value={qaForm.answer}
                    onChange={(event) => setQaForm({ ...qaForm, answer: event.target.value })}
                    maxLength={4000}
                    required
                  />
                </FormGroup>
                <Button type="submit" color="primary" disabled={savingQa}>
                  {savingQa ? "Saving…" : "Add Q&A"}
                </Button>
              </form>
              <hr />
              <div className="d-flex flex-column gap-2">
                {questionAnswers.map((item) => (
                  <div key={item._id} className="border rounded p-2">
                    <div className="d-flex justify-content-between gap-2">
                      <strong>{item.question}</strong>
                      <Button color="danger" outline size="sm" onClick={() => deleteItem(`/whatsapp/assistant/questions/${item._id}`, "Q&A pair")}>
                        Delete
                      </Button>
                    </div>
                    <small className="text-muted">{item.answer}</small>
                  </div>
                ))}
                {questionAnswers.length === 0 && <div className="small text-muted">No Q&A pairs added.</div>}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WhatsappAssistant;
