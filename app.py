"""
Legacy entrypoint. The interactive UI has moved to the React app + FastAPI backend.

Run the stack from the repository root:
  python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8010
  cd frontend && npm install && npm run dev

See README.md for details. To recover the old Streamlit prototype, use git history.
"""

if __name__ == "__main__":
    raise SystemExit(
        "Streamlit UI removed — use React (frontend/) + FastAPI (backend/main.py). See README.md."
    )
