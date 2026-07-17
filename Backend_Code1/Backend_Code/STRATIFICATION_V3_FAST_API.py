from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from typing import List
import uvicorn

from STRATIFICATION_V2 import run_stratification_pipeline

# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="Stratification API",
    version="1.0"
)


# --------------------------------------------------
# Request Model
# --------------------------------------------------

class StratificationRequest(BaseModel):

    campaign_start: str
    campaign_end: str

    pre_start: str
    pre_end: str

    ctrl_ratio: float

    sales_metric: str

    selected_categorical_vars: list[str]
    selected_numeric_vars: list[str]


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
def health_check():

    return {
        "status": "API Running Successfully",
        "message": "Stratification API is running",
        "swagger_url": "/docs",
        "redoc_url": "/redoc"
    }


# --------------------------------------------------
# Run Stratification
# --------------------------------------------------

@app.post("/run_stratification")
def run_stratification(request: StratificationRequest):

    # data_df = pd.read_excel(
    #     r"C:\Users\thallapally.kumar\OneDrive - Indegene Limited\Desktop\Genen Tech - Demo OCM Dashboard\shared Files\Strat_data.xlsx"
    # )

    # meta_df = pd.read_excel(
    #     r"C:\Users\thallapally.kumar\OneDrive - Indegene Limited\Desktop\Genen Tech - Demo OCM Dashboard\shared Files\strat_meta.xlsx"
    # )

    # results = run_stratification_pipeline(

    #     data_df=data_df,
    #     meta_df=meta_df,

    #     campaign_start=request.campaign_start,
    #     campaign_end=request.campaign_end,

    #     pre_start=request.pre_start,
    #     pre_end=request.pre_end,

    #     ctrl_ratio=request.ctrl_ratio,

    #     sales_metric=request.sales_metric,

    #     selected_categorical_vars=request.selected_categorical_vars,

    #     selected_numeric_vars=request.selected_numeric_vars

    # )

    # return results
    try:

        # Read Input Files
        data_df = pd.read_excel(request.data_file_path)
        meta_df = pd.read_excel(request.meta_file_path)
        
        # Run Pipeline
        results = run_stratification_pipeline(
        data_df=data_df,
        meta_df=meta_df,
        campaign_start=request.campaign_start,
        campaign_end=request.campaign_end,
        pre_start=request.pre_start,
        pre_end=request.pre_end,
        ctrl_ratio=request.ctrl_ratio,
        sales_metric=request.sales_metric,
        selected_categorical_vars=request.selected_categorical_vars,
        selected_numeric_vars=request.selected_numeric_vars
        )
        return {
        "status": "success",
        "results": results
        }
    except Exception as e:
        raise HTTPException(
        status_code=500,
        detail=str(e)
        )
        
# --------------------------------------------------
# Main
# --------------------------------------------------
if __name__ == "__main__":
    HOST = "0.0.0.0"
    PORT = 8000
    
    print("\n===================================")
    print("Stratification API Started")
    print("===================================")
    print(f"API URL : http://localhost:{PORT}")
    print(f"Swagger Docs : http://localhost:{PORT}/docs")
    print(f"ReDoc Docs : http://localhost:{PORT}/redoc")
    print("===================================\n")
    
    uvicorn.run(
        "STRATIFICATION_V3_FAST_API:app",
        host=HOST,
        port=PORT,
        reload=True
        )