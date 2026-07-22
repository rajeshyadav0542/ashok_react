from fastapi import FastAPI
import subprocess
import pandas as pd
import sys

app = FastAPI()

excel_path = r"C:\Users\ashok.tiwari\omnichannel\ashok_react\public\Final_results.xlsx"

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