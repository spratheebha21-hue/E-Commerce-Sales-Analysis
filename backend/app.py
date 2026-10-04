import json
import os
import subprocess
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
R_SCRIPT = BASE_DIR / "analytics" / "sales_analysis.R"

app = FastAPI(title="E-commerce Sales Analysis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ecommerce-sales-analysis"}


@app.get("/api/analytics")
def analytics():
    if not R_SCRIPT.exists():
        raise HTTPException(status_code=500, detail="R analysis script not found.")

    try:
        completed = subprocess.run(
            ["Rscript", str(R_SCRIPT)],
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            check=False,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail="Rscript is not installed or not on PATH.") from exc

    if completed.returncode != 0:
        error_detail = completed.stderr.strip() or completed.stdout.strip() or "R script execution failed."
        raise HTTPException(status_code=500, detail=error_detail)

    raw_output = completed.stdout.strip()
    if not raw_output:
        raise HTTPException(status_code=500, detail="R script returned no analytics data.")

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f"Invalid JSON received from R analysis: {exc.msg}") from exc
