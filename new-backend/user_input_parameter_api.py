from fastapi import APIRouter
from pathlib import Path
import pandas as pd
import json

router = APIRouter()

@router.post("/refresh-meta-parameters")
def refresh_meta_parameters():
    BASE_DIR = Path(__file__).resolve().parent
    PROJECT_ROOT = BASE_DIR.parent
    PUBLIC_DIR = PROJECT_ROOT / "public" / "metadata"
    meta_file_path = PUBLIC_DIR / "strat_meta.xlsx"
    
    output_file_path = PUBLIC_DIR / "Final_results.xlsx"
    meta_df = pd.read_excel(meta_file_path)
    print("meta_file_path", meta_df)
    matching_segments = meta_df[
        meta_df["Meta_tag"]
        .astype(str)
        .str.upper()
        .str.startswith("SEGMENT_CATEGORICAL_")
    ]["Meta_tag"].dropna().unique().tolist()

    matching_numericals = meta_df[
        meta_df["Meta_tag"]
        .astype(str)
        .str.upper()
        .str.startswith("SEGMENT_NUMERICAL_")
    ]["Meta_tag"].dropna().unique().tolist()

    sales_tags = meta_df[
        meta_df["Meta_tag"]
        .astype(str)
        .str.upper()
        .str.startswith("SALES_")
    ]["Meta_tag"].dropna().unique().tolist()

    sales_metric = (
        sales_tags[0]
        if len(sales_tags) > 0
        else ""
    )

    activity_df = meta_df[
        meta_df["Meta_tag"]
        .astype(str)
        .str.upper()
        .str.startswith("ACTIVITY_")
    ]

    tolerances = []

    for activity in activity_df["Meta_tag"]:

        tolerances.append(
            f"Pre_{activity}"
        )

        tolerances.append(
            f"Post_{activity}"
        )

    final_df = pd.DataFrame([
        {
            "Meta_inputs_ID": "META_001",

            "Matching_Segments":
                json.dumps(matching_segments),

            "Matching_Numericals":
                json.dumps(matching_numericals),

            "Tolerences":
                json.dumps(tolerances),

            "sales_metric":
                sales_metric
        }
    ])

    with pd.ExcelWriter(
        output_file_path,
        engine="openpyxl",
        mode="a",
        if_sheet_exists="replace"
    ) as writer:

        final_df.to_excel(
            writer,
            sheet_name="User_Meta_Parameters",
            index=False
        )

    return {
        "status": "success",
        "message": "STRATIFICATION_INPUT_FILEDS.xlsx updated successfully"
    }