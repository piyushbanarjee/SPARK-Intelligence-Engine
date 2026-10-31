# S.P.A.R.K. Intelligence Engine

**Semantic Processing & Relational Knowledge for Forensic Investigation**

S.P.A.R.K. is a local investigation-support prototype that turns unstructured evidence into searchable text, extracted entities, and an interactive relationship graph. Investigators can upload documents, review connections, keep case notes, and ask questions about evidence through a locally hosted language model.

The project combines a React dashboard with a FastAPI backend, PostgreSQL storage, ChromaDB retrieval, and Ollama inference. This README describes the implementation in this repository; the broader research objectives are listed separately below.

## Features

- **Evidence ingestion:** extract text from TXT, text-based PDF, and DOCX files, plus PNG/JPG/JPEG images through Tesseract OCR.
- **Entity and relationship extraction:** use Llama 3.2 through Ollama to identify people, organizations, locations, phone numbers, and their relationships.
- **Entity registry:** browse extracted entities and model-generated risk labels.
- **Link analysis:** visualize cases, evidence, notes, entities, and extracted relationships using a force-directed graph.
- **Evidence assistant:** retrieve up to three relevant evidence documents from ChromaDB and pass their text to the local model for question answering.
- **Investigation notes:** save and retrieve case-specific notes in PostgreSQL.

## Architecture

```text
React / Vite dashboard
        |
        v
FastAPI REST API
        |
        +-- PostgreSQL: cases, evidence text, notes, entities, relationships
        +-- pypdf / python-docx / Tesseract: text extraction
        +-- Ollama (llama3.2): entity extraction and answers
        +-- ChromaDB: persistent evidence embeddings and retrieval
```

Graph data is assembled from PostgreSQL records. Neo4j is not required by the current implementation. The assistant currently retrieves evidence text from ChromaDB; it does not query the relationship graph.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 6, Tailwind CSS 4, Lucide, Axios, react-force-graph-2d |
| API | Python, FastAPI, Pydantic, Uvicorn |
| Database | PostgreSQL, SQLAlchemy, psycopg2 |
| Retrieval | ChromaDB |
| Local AI | Ollama with `llama3.2` |
| Document processing | pypdf, python-docx, Pillow, pytesseract, Tesseract OCR |

## Local setup

### Prerequisites

- Python 3.11 or 3.12 is a practical starting point; no Python version is pinned in this repository.
- Node.js 20.19+ and npm.
- A running PostgreSQL server.
- Ollama installed locally.
- Tesseract OCR installed and available on `PATH` for image processing. Installing `pytesseract` alone does not install the OCR engine.

The commands below use PowerShell and start from the repository root.

### 1. Install Python dependencies

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
```

On macOS/Linux, use `.venv/bin/python` instead of `.\.venv\Scripts\python.exe`.

### 2. Configure PostgreSQL

Create the database using an existing PostgreSQL administrator account:

```powershell
psql -U postgres -h localhost -c "CREATE DATABASE spark_db;"
```

Edit `SQLALCHEMY_DATABASE_URL` in [`backend/database.py`](backend/database.py) to match your local user, password, host, port, and database:

```python
SQLALCHEMY_DATABASE_URL = "postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/spark_db"
```

Replace the placeholders with your local credentials. Configuration is currently hardcoded; `.env` files are not loaded. The backend creates missing tables on startup, but it does not provide schema migrations.

### 3. Prepare the local model

```powershell
ollama pull llama3.2
```

Ensure Ollama is listening at `http://localhost:11434`. If its background service is not already running, start it in a separate terminal:

```powershell
ollama serve
```

Both extraction and chat use the model name `llama3.2`. To change it or the Ollama address, edit [`backend/extraction.py`](backend/extraction.py) and [`backend/chat.py`](backend/chat.py).

ChromaDB's default embedding function may download its embedding model on first use. Prepare dependencies and model downloads before attempting an offline demonstration.

### 4. Start the backend

```powershell
cd backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

Run from `backend/` because the application uses local module imports. Interactive API documentation is available at [localhost:8000/docs](http://localhost:8000/docs).

### 5. Start the frontend

In a new terminal, from the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the address printed by Vite, normally [localhost:5173](http://localhost:5173). Frontend dependencies and scripts live in `frontend/`; installing only the root npm package does not set up the dashboard.

The dashboard calls `http://localhost:8000/api/v1` directly. To change the API address, edit [`frontend/src/api.js`](frontend/src/api.js).

## Using the dashboard

1. Open the dashboard with PostgreSQL, the API, and Ollama running. It automatically creates a case named **Live Session**.
2. Open **Evidence Pipeline** and upload a TXT, PDF, DOCX, PNG, JPG, or JPEG file.
3. Wait for text extraction and the model's entity extraction to finish.
4. Inspect the **Entity Registry** and **Link Analysis** views.
5. Add observations in **Investigation Notes**.
6. Use **AI Assistant** to ask questions about the uploaded evidence.

The active case ID is held in browser memory. Reloading the application creates a new case rather than reopening the previous one; existing records remain in PostgreSQL and can be listed through the API.

## API reference

All routes use the `/api/v1` prefix. Case identifiers are UUIDs.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/cases/` | Create a case with `title` and optional `description` |
| GET | `/cases/` | List cases; supports `skip` and `limit` |
| POST | `/cases/{case_id}/evidence/` | Upload multipart form data with a `file` field |
| GET | `/cases/{case_id}/evidence/` | List evidence and extracted text |
| GET | `/cases/{case_id}/registry/` | List extracted entities |
| GET | `/cases/{case_id}/graph/` | Return graph `nodes` and `links` |
| POST | `/cases/{case_id}/notes/` | Save a note with a `content` field |
| GET | `/cases/{case_id}/notes/` | List saved notes |
| POST | `/cases/{case_id}/chat/` | Submit a `prompt`; returns a `response` |

For example, create a case from PowerShell:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8000/api/v1/cases/" `
  -ContentType "application/json" `
  -Body '{"title":"Demo investigation","description":"Synthetic evidence walkthrough"}'
```

## Project structure

```text
SPARK-Intelligence-Engine/
|-- backend/
|   |-- main.py              # API entry point and evidence ingestion
|   |-- database.py          # PostgreSQL connection and sessions
|   |-- models.py            # Relational data models
|   |-- schemas.py           # Request and response schemas
|   |-- extraction.py        # Ollama entity and relationship extraction
|   |-- ocr.py               # Tesseract image text extraction
|   |-- chat.py              # ChromaDB retrieval and Ollama chat
|   |-- graph.py             # Graph payload construction
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- App.jsx          # Dashboard and session initialization
|   |   |-- api.js           # Backend API client
|   |   `-- components/      # Dashboard views and UI components
|   |-- package.json
|   `-- vite.config.js
|-- requirements.txt         # Duplicate backend dependency list
|-- package.json             # Root-level npm dependencies
`-- README.md
```

When started from `backend/`, ChromaDB persists its local data in `backend/chroma_db/`.

## Development checks

Run these commands from `frontend/`:

```powershell
npm run lint
npm run build
npm run preview
```

`preview` serves the built frontend; the backend is still required. No automated test suite is included in this repository.

## Current limitations

- Overview metrics, global search, and the main dashboard export dialog are placeholders. The timeline view calls an endpoint that is not implemented and falls back to an empty result.
- Pinning and deleting notes only change the current UI state; they are not persisted through the API.
- Uploaded original files are not saved to disk. Evidence rows store the filename, extracted text, and a placeholder `/storage/...` path; that path is not a working download link.
- PDF processing extracts an existing text layer. Scanned PDFs are not automatically routed through OCR; provide image files for OCR instead.
- Entity extraction is synchronous during upload and can take up to the configured 120-second model request timeout. An upload can save successfully even if entity extraction fails; inspect backend logs when the registry remains empty.
- Entities are not deduplicated across uploads, and extracted entities and relationships do not carry source-document spans or verified confidence scores.
- Risk labels and assistant answers are model-generated and require human review. The assistant does not return structured source citations.
- Authentication, authorization, audit logging, and production deployment configuration are not implemented. CORS currently permits all origins. Use synthetic data for local demonstrations until appropriate controls are added.

## Research roadmap

The project's broader research direction includes:

- Cross-document alias resolution using embeddings and clustering.
- Source-traceable graph entities and relationships, including document IDs and text spans.
- NLI-based contradiction detection between witness statements.
- Automated timelines merged across evidence sources.
- Graph-based link prediction and graph-aware question answering.
- Evaluation using annotated mock cases and precision, recall, and F1 metrics.

These are research objectives, not completed or benchmarked capabilities of this checkout. Neo4j, spaCy, Sentence-BERT, NLI models, and GraphSAGE are not part of the current implementation.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Backend fails during startup | Confirm PostgreSQL is running, `spark_db` exists, and the connection string matches your credentials. |
| Dashboard shows Connection Failure | Start the API on port 8000 and verify the address in `frontend/src/api.js`. |
| Image upload fails | Confirm `tesseract --version` works in the terminal used to start the backend. |
| Chat reports Llama 3.2 offline | Confirm Ollama is running on port 11434 and `ollama list` includes `llama3.2`; inspect backend logs for other request failures. |
| Evidence uploads but no entities appear | Check Ollama availability and backend extraction logs; verify the file contains extractable text. |
| First assistant query is slow or fails | Check embedding-model download availability and local model readiness. |
| Older evidence disappears after a reload | The UI started a new case; use `GET /api/v1/cases/` and the case-specific API routes to inspect earlier records. |

## Project team

Piyush Banarjee, Hilal Pawar, Mayank Ranjan, and Tahami Ali.  
Project guide: Dr. Ajitkumar Pundge.

## License

No license file is currently included. Reuse and distribution terms have not been specified in this repository.
