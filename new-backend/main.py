from __future__ import annotations
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from openpyxl import Workbook, load_workbook
from openpyxl.utils import get_column_letter
from datetime import datetime

class CampaignControlFormData(BaseModel):
    approach: str
    dataPrepFileName: str
    metaFileName: str
    mmxFileName: str
    campaignStart: str
    campaignEnd: str
    preCampaignStart: str
    preCampaignEnd: str
    balancingVariables: List[str]
    salesMetrics: List[str]
    activityTolerances: Dict[str, str]
    outlierMethod: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
EXCEL_PATH = BASE_DIR / "public" / "Final_Results.xlsx"
SHEET_NAME = "CampaignControlForm"

HEADERS = [
    "submitted_at",
    "approach",
    "dataPrepFileName",
    "metaFileName",
    "mmxFileName",
    "campaignStart",
    "campaignEnd",
    "preCampaignStart",
    "preCampaignEnd",
    "balancingVariables",
    "salesMetrics",
    "activityTolerances",
    "outlierMethod",
]


def get_workbook() -> Workbook:
    if EXCEL_PATH.exists():
        try:
            return load_workbook(EXCEL_PATH)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Unable to read Excel file: {exc}")

    workbook = Workbook()
    workbook.remove(workbook.active)
    workbook.save(EXCEL_PATH)
    return workbook


def ensure_sheet(workbook: Workbook):
    if SHEET_NAME in workbook.sheetnames:
        sheet = workbook[SHEET_NAME]
    else:
        sheet = workbook.create_sheet(SHEET_NAME)
        sheet.append(HEADERS)
    if sheet.max_row == 1 and [cell.value for cell in sheet[1]] != HEADERS:
        sheet.delete_rows(1)
        sheet.append(HEADERS)
    return sheet


def safe_save_workbook(workbook: Workbook, path: Path):
    temp_path = path.with_name(f"{path.stem}.tmp{path.suffix}")
    try:
        workbook.save(temp_path)
        temp_path.replace(path)
    except PermissionError as exc:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=423,
            detail=(
                "Unable to save Excel file: file is locked or open in another application. "
                "Close the workbook in Excel or stop any process holding the file, then retry."
            ),
        ) from exc
    except Exception as exc:
        if temp_path.exists():
            temp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail=f"Unable to save Excel file: {exc}") from exc


def append_submission(sheet, submission: CampaignControlFormData):
    values = [
        datetime.utcnow().isoformat(),
        submission.approach,
        submission.dataPrepFileName,
        submission.metaFileName,
        submission.mmxFileName,
        submission.campaignStart,
        submission.campaignEnd,
        submission.preCampaignStart,
        submission.preCampaignEnd,
        json.dumps(submission.balancingVariables, ensure_ascii=False),
        json.dumps(submission.salesMetrics, ensure_ascii=False),
        json.dumps(submission.activityTolerances, ensure_ascii=False),
        submission.outlierMethod,
    ]
    sheet.append(values)
    for idx, _ in enumerate(values, start=1):
        sheet.column_dimensions[get_column_letter(idx)].auto_size = True


def load_submissions(sheet):
    rows = list(sheet.iter_rows(min_row=2, values_only=True))
    submissions = []
    for row in rows:
        if not row or all(value is None for value in row):
            continue

        submission = {
            "submitted_at": row[0] or "",
            "approach": row[1] or "",
            "dataPrepFileName": row[2] or "",
            "metaFileName": row[3] or "",
            "mmxFileName": row[4] or "",
            "campaignStart": row[5] or "",
            "campaignEnd": row[6] or "",
            "preCampaignStart": row[7] or "",
            "preCampaignEnd": row[8] or "",
            "balancingVariables": json.loads(row[9]) if row[9] else [],
            "salesMetrics": json.loads(row[10]) if row[10] else [],
            "activityTolerances": json.loads(row[11]) if row[11] else {},
            "outlierMethod": row[12] or "",
        }
        submissions.append(submission)
    return submissions


@app.post("/api/campaign-control")
async def save_campaign_control(form_data: CampaignControlFormData):
    EXCEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    workbook = get_workbook()
    sheet = ensure_sheet(workbook)
    append_submission(sheet, form_data)
    safe_save_workbook(workbook, EXCEL_PATH)
    return {"success": True, "message": "Control form data saved successfully."}


@app.get("/api/campaign-control")
async def get_campaign_control():
    if not EXCEL_PATH.exists():
        return {"success": True, "submissions": []}

    workbook = get_workbook()
    if SHEET_NAME not in workbook.sheetnames:
        return {"success": True, "submissions": []}

    sheet = workbook[SHEET_NAME]
    submissions = load_submissions(sheet)
    return {"success": True, "submissions": submissions}
