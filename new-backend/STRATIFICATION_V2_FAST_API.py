from fastapi import FastAPI
import subprocess
import pandas as pd
from pathlib import Path
import sys

app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
excel_path = PROJECT_ROOT / "public" / "metadata" / "Final_results.xlsx"

@app.post("/run-stratification")
def run_stratification():

    subprocess.run(
        [sys.executable, "STRATIFICATION_V2.py"],
        check=True
    )

    df = pd.read_excel(
        excel_path,
        sheet_name="Output"
    )

    return df.tail(1).to_dict("records")