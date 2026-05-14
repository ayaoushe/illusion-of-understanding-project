# illusion-of-understanding-project

Interactive AI interface for medical decision-making (oncology context), focused on situational awareness and critical engagement with model recommendations.

## Stack (current)

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts (`frontend/`)
- **Backend:** FastAPI + shared logic in `backend/medical_logic.py`

The previous Streamlit UI has been retired; `app.py` only points you here.

## Run locally

**1. Python** (repo root):

```bash
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8010
```

Or run `start-api.ps1` from the repo root.

**2. Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (e.g. `http://localhost:5173`). The dev server proxies API routes to `http://127.0.0.1:8010`.

## REST API

| Method | Path | Body (JSON) | Purpose |
|--------|------|-------------|---------|
| POST | `/predict` | `patient`, `user_decision` | Success %, confidence %, warnings, nudge, comparison |
| POST | `/analyze` | `patient` | Feature importance + explanations (for charts) |
| POST | `/scenario` | `patient`, `variable`, `value` | What-if (`tumor_size` \| `age` \| `stage`) |
| POST | `/chat` | `message`, optional `patient` | Assistant reply |
| GET | `/health` | — | Liveness |

`patient` fields: `age`, `stage`, `prior_treatment`, `tumor_size`, `symptom_severity`.

Production build: set `VITE_API_URL` in `frontend/.env` to your API origin; the dev proxy is skipped when it is set.

## Layout (React)

Workflow steps in the left sidebar: Patient → Assessment → AI results → Explanation → Scenarios → Reflection. The assistant chat opens on the right (or bottom on small screens) after predictions are available.
