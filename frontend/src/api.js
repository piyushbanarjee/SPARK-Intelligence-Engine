const API_BASE = "http://localhost:8000/api";

export async function fetchCaseInfo() {
  const res = await fetch(`${API_BASE}/case/info`);
  return res.json();
}

export async function fetchTimeline() {
  const res = await fetch(`${API_BASE}/case/timeline`);
  return res.json();
}

export async function fetchRegistry() {
  const res = await fetch(`${API_BASE}/case/registry`);
  return res.json();
}

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/case/graph`);
  return res.json();
}

export async function fetchDocuments() {
  const res = await fetch(`${API_BASE}/documents`);
  return res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function fetchNotes() {
  const res = await fetch(`${API_BASE}/notes`);
  return res.json();
}

export async function createNote(noteData) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(noteData),
  });
  return res.json();
}

export async function togglePinNote(noteId) {
  const res = await fetch(`${API_BASE}/notes/${noteId}/pin`, {
    method: "PUT",
  });
  return res.json();
}

export async function chatWithCopilot(query) {
  const res = await fetch(`${API_BASE}/copilot/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}
