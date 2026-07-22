import pandas as pd
import numpy as np




# Convert load_and_validate_metadata()

def load_and_validate_metadata(
    meta_df,
    data_df
):
    """
    Reads Meta Mapping file
    and validates Data Prep file.

    Returns:
        metadata dictionary
    """

    metadata = {

        "identifiers": [],
        "activities": [],
        "sales": [],
        "segment_categorical": [],
        "segment_numerical": [],
        "actual_mapping": {}

    }

    required_meta_cols = [
        "Actual_column_name",
        "Meta_tag"
    ]

    missing_meta_cols = [
        c
        for c in required_meta_cols
        if c not in meta_df.columns
    ]

    if len(missing_meta_cols) > 0:

        raise Exception(
            f"""
            META FILE VALIDATION FAILED

            Missing Columns:

            {missing_meta_cols}
            """
        )

    for _, row in meta_df.iterrows():

        actual_col = row["Actual_column_name"]
        meta_tag = row["Meta_tag"]

        metadata["actual_mapping"][
            meta_tag
        ] = actual_col

        if meta_tag in [

            "HCP_ID",
            "Month_ID",
            "Test_Control_Flag"

        ]:

            metadata["identifiers"].append(
                meta_tag
            )

        elif str(meta_tag).startswith(
            "ACTIVITY"
        ):

            metadata["activities"].append(
                meta_tag
            )

        elif str(meta_tag).startswith(
            "SALES"
        ):

            metadata["sales"].append(
                meta_tag
            )

        elif str(meta_tag).startswith(
            "SEGMENT_CATEGORICAL"
        ):

            metadata[
                "segment_categorical"
            ].append(meta_tag)

        elif str(meta_tag).startswith(
            "SEGMENT_NUMERICAL"
        ):

            metadata[
                "segment_numerical"
            ].append(meta_tag)

    required_tags = [

        "HCP_ID",
        "Month_ID",
        "Test_Control_Flag"

    ]

    missing_tags = [

        t
        for t in required_tags
        if t not in metadata["identifiers"]

    ]

    if len(missing_tags) > 0:

        raise Exception(
            f"""
            META FILE VALIDATION FAILED

            Missing Required Meta Tags:

            {missing_tags}
            """
        )

    expected_columns = []

    expected_columns += metadata["identifiers"]
    expected_columns += metadata["activities"]
    expected_columns += metadata["sales"]
    expected_columns += metadata["segment_categorical"]
    expected_columns += metadata["segment_numerical"]

    missing_data_cols = [

        c
        for c in expected_columns
        if c not in data_df.columns

    ]

    if len(missing_data_cols) > 0:

        raise Exception(
            f"""
            DATA PREP VALIDATION FAILED

            Missing Columns:

            {missing_data_cols}
            """
        )

    print(
        "✅ DATA INPUTS ARE ALIGNED WITH META MAPPING"
    )

    return metadata


#Stage 3: Convert population_summary()

def population_summary(
    df,
    stage_name="Population Summary",
    group_col="Test_Control_Flag"
):

    summary = (
        df
        .groupby(group_col)["HCP_ID"]
        .nunique()
        .reset_index(name="Distinct_HCPs")
    )

    total_hcps = summary[
        "Distinct_HCPs"
    ].sum()

    summary["Pct_of_Total"] = round(
        summary["Distinct_HCPs"]
        * 100
        / total_hcps,
        2
    )

    summary["Total_HCPs"] = total_hcps

    summary["Stage"] = stage_name

    summary = summary.sort_values(
        group_col
    )

    return summary


#Stage 4: Convert campaign_scrubbing()

def campaign_scrubbing(
    data_df,
    campaign_start,
    campaign_end,
    activity_column="ACTIVITY_1",
    reached_value="REACHED"
):

    campaign_df = data_df[

        (data_df["Month_ID"].astype(str) >= str(campaign_start))
        &
        (data_df["Month_ID"].astype(str) <= str(campaign_end))

    ].copy()

    test_keep = campaign_df[

        (campaign_df["Test_Control_Flag"] == "Test")
        &
        (campaign_df[activity_column] == reached_value)

    ]

    ctrl_keep = campaign_df[

        (campaign_df["Test_Control_Flag"] == "Control")
        &
        (
            campaign_df[activity_column].isna()
            |
            (
                campaign_df[activity_column]
                != reached_value
            )
        )

    ]

    final_pool = pd.concat(
        [test_keep, ctrl_keep],
        ignore_index=True
    )

    valid_hcps = (
        final_pool[["HCP_ID"]]
        .drop_duplicates()
    )

    retained_hcps = len(valid_hcps)

    if retained_hcps == 0:

        raise Exception(
            """
            CAMPAIGN SCRUBBING FAILED

            No HCPs retained.
            """
        )

    analysis_df = data_df.merge(
        valid_hcps,
        on="HCP_ID",
        how="inner"
    )

    post_scrubbing_summary = (

        final_pool

        .groupby(
            "Test_Control_Flag"
        )["HCP_ID"]

        .nunique()

        .reset_index(
            name="Distinct_HCPs"
        )

    )

    total_hcps = post_scrubbing_summary[
        "Distinct_HCPs"
    ].sum()

    post_scrubbing_summary[
        "Pct_of_Total"
    ] = round(

        post_scrubbing_summary[
            "Distinct_HCPs"
        ]
        * 100
        / total_hcps,

        2
    )

    print(
        "\n✅ Campaign Scrubbing Completed"
    )

    print(
        f"✅ Valid HCPs Retained : {total_hcps:,}"
    )

    return (
        campaign_df,
        final_pool,
        valid_hcps,
        analysis_df,
        post_scrubbing_summary
    )


#Convert create_pre_profile()

def create_pre_profile(
    analysis_df,
    pre_start,
    pre_end,
    selected_categorical_vars,
    selected_numeric_vars,
    sales_metric="SALES_1"
):

    pre_df = analysis_df[

        (analysis_df["Month_ID"].astype(str) >= str(pre_start))
        &
        (analysis_df["Month_ID"].astype(str) <= str(pre_end))

    ].copy()

    if len(pre_df) == 0:

        raise Exception(
            """
            PRE PROFILE FAILED

            No records found for selected pre period.
            """
        )

    agg_dict = {

        "Test_Control_Flag": "max",

        sales_metric: "sum"
    }

    for col in selected_categorical_vars:

        agg_dict[col] = "max"

    for col in selected_numeric_vars:

        agg_dict[col] = "mean"

    pre_profile = (

        pre_df

        .groupby("HCP_ID")

        .agg(agg_dict)

        .reset_index()

    )

    pre_profile.rename(

        columns={
            sales_metric:
            f"Pre_{sales_metric}"
        },

        inplace=True

    )

    for col in selected_numeric_vars:

        pre_profile.rename(

            columns={
                col:
                f"Pre_{col}"
            },

            inplace=True

        )

        pre_profile[
            f"Pre_{col}"
        ] = pre_profile[
            f"Pre_{col}"
        ].round(2)

    print("\n✅ Pre Profile Created")

    print(
        f"✅ HCPs In Pre Profile : {len(pre_profile):,}"
    )

    return pre_profile

#Convert create_buckets()

def create_buckets(
    pre_profile,
    selected_numeric_vars,
    sales_metric="SALES_1"
):

    bucket_df = pre_profile.copy()

    # ==========================
    # NUMERIC BUCKETS
    # ==========================

    for var in selected_numeric_vars:

        pre_var = f"Pre_{var}"

        bucket_col = f"{pre_var}_Bucket"

        bucket_df[bucket_col] = "Z"

        non_zero = bucket_df[
            pre_var
        ] > 0

        if non_zero.sum() > 0:

            bucket_df.loc[
                non_zero,
                bucket_col
            ] = pd.qcut(

                bucket_df.loc[
                    non_zero,
                    pre_var
                ],

                q=3,

                labels=["L", "M", "H"],

                duplicates="drop"

            )

    # ==========================
    # SALES BUCKET
    # ==========================

    pre_sales = f"Pre_{sales_metric}"

    sales_bucket = (
        f"{pre_sales}_Bucket"
    )

    bucket_df[
        sales_bucket
    ] = "Z"

    non_zero_sales = (
        bucket_df[pre_sales] > 0
    )

    if non_zero_sales.sum() > 0:

        bucket_df.loc[
            non_zero_sales,
            sales_bucket
        ] = pd.qcut(

            bucket_df.loc[
                non_zero_sales,
                pre_sales
            ],

            q=3,

            labels=["L", "M", "H"],

            duplicates="drop"

        )

    print("✅ Numerical Buckets Created")
    print("✅ Sales Bucket Created")

    return bucket_df

#stratify_and_balance()
from functools import reduce
import pandas as pd
import numpy as np


def stratify_and_balance(
    bucket_df,
    selected_categorical_vars,
    selected_numeric_vars,
    ctrl_ratio,
    sales_metric="SALES_1"
):

    # =====================================================
    # BEFORE STRATIFICATION SUMMARY
    # =====================================================

    before_strat_summary = (
        bucket_df
        .groupby("Test_Control_Flag")["HCP_ID"]
        .nunique()
        .reset_index(name="hcp_count")
    )

    before_total = before_strat_summary[
        "hcp_count"
    ].sum()

    before_strat_summary["pct"] = round(
        before_strat_summary["hcp_count"]
        * 100
        / before_total,
        2
    )

    # =====================================================
    # CREATE STRATUM
    # =====================================================

    bucket_columns = [

        f"Pre_{c}_Bucket"
        for c in selected_numeric_vars

    ]

    bucket_columns.append(
        f"Pre_{sales_metric}_Bucket"
    )

    stratum_columns = (
        selected_categorical_vars
        +
        bucket_columns
    )

    bucket_df = bucket_df.copy()

    bucket_df["Stratum"] = (
        bucket_df[stratum_columns]
        .astype(str)
        .agg("|".join, axis=1)
    )

    # =====================================================
    # REQUIRED TESTS
    # =====================================================

    test_multiplier = (
        (1 - ctrl_ratio)
        /
        ctrl_ratio
    )

    stratum_summary = (

        bucket_df

        .assign(
            ctrl_flag=np.where(
                bucket_df["Test_Control_Flag"]
                == "Control",
                1,
                0
            )
        )

        .groupby("Stratum")
        ["ctrl_flag"]

        .sum()

        .reset_index(
            name="ctrl_cnt"
        )

    )

    stratum_summary[
        "required_test"
    ] = np.floor(

        stratum_summary[
            "ctrl_cnt"
        ]
        *
        test_multiplier

    ).astype(int)

    # =====================================================
    # TEST SAMPLE
    # =====================================================

    test_df = (

        bucket_df[
            bucket_df[
                "Test_Control_Flag"
            ]
            == "Test"
        ]

        .copy()

    )

    test_df = test_df.sample(
        frac=1,
        random_state=123
    )

    test_df["rn"] = (

        test_df

        .groupby("Stratum")

        .cumcount()

        + 1

    )

    test_df = test_df.merge(

        stratum_summary[
            [
                "Stratum",
                "required_test"
            ]
        ],

        on="Stratum",

        how="left"

    )

    test_sample = test_df[

        test_df["rn"]

        <=

        test_df["required_test"]

    ]

    # =====================================================
    # CONTROL SAMPLE
    # =====================================================

    ctrl_sample = (

        bucket_df[
            bucket_df[
                "Test_Control_Flag"
            ]
            == "Control"
        ]

        .copy()

    )

    # =====================================================
    # BALANCED DF
    # =====================================================

    balanced_df = pd.concat(

        [
            test_sample[
                bucket_df.columns
            ],

            ctrl_sample[
                bucket_df.columns
            ]
        ],

        ignore_index=True

    )

    # =====================================================
    # AFTER STRATIFICATION SUMMARY
    # =====================================================

    after_strat_summary = (

        balanced_df

        .groupby(
            "Test_Control_Flag"
        )["HCP_ID"]

        .nunique()

        .reset_index(
            name="hcp_count"
        )

    )

    after_total = (
        after_strat_summary[
            "hcp_count"
        ]
        .sum()
    )

    after_strat_summary[
        "pct"
    ] = round(

        after_strat_summary[
            "hcp_count"
        ]
        *
        100
        /
        after_total,

        2
    )

    # =====================================================
    # BALANCE QC
    # =====================================================

    selected_vars = (

        selected_categorical_vars

        +

        bucket_columns

    )

    test_total = (

        balanced_df[
            balanced_df[
                "Test_Control_Flag"
            ]
            == "Test"
        ]["HCP_ID"]

        .nunique()

    )

    ctrl_total = (

        balanced_df[
            balanced_df[
                "Test_Control_Flag"
            ]
            == "Control"
        ]["HCP_ID"]

        .nunique()

    )

    outputs = []

    for var in selected_vars:

        temp = (

            balanced_df

            .groupby(
                [
                    var,
                    "Test_Control_Flag"
                ]
            )["HCP_ID"]

            .nunique()

            .reset_index(
                name="hcp_cnt"
            )

        )

        temp = (

            temp

            .pivot(

                index=var,

                columns="Test_Control_Flag",

                values="hcp_cnt"

            )

            .fillna(0)

            .reset_index()

        )

        if "Test" not in temp.columns:
            temp["Test"] = 0

        if "Control" not in temp.columns:
            temp["Control"] = 0

        temp.rename(

            columns={

                "Test":
                "test_count",

                "Control":
                "ctrl_count"

            },

            inplace=True

        )

        temp["test_pct"] = round(

            temp["test_count"]

            * 100

            / test_total,

            2

        )

        temp["ctrl_pct"] = round(

            temp["ctrl_count"]

            * 100

            / ctrl_total,

            2

        )

        temp["abs_diff_pct"] = round(

            abs(

                temp["test_pct"]

                -

                temp["ctrl_pct"]

            ),

            2

        )

        temp["variable"] = var

        temp.rename(

            columns={
                var: "category"
            },

            inplace=True

        )

        temp = temp[

            [
                "variable",
                "category",
                "test_count",
                "ctrl_count",
                "test_pct",
                "ctrl_pct",
                "abs_diff_pct"
            ]

        ]

        outputs.append(temp)

    balance_summary = pd.concat(
        outputs,
        ignore_index=True
    )

    top5_balance = (

        balance_summary

        .sort_values(
            "abs_diff_pct",
            ascending=False
        )

        .head(5)

    )

    print(
        "✅ Stratification Completed"
    )

    print(
        "✅ Balance QC Completed"
    )

    return (

        balanced_df,

        before_strat_summary,

        after_strat_summary,

        top5_balance

    )


# Stage 4A: Convert calculate_campaign_metrics()

from scipy.stats import ttest_ind
import pandas as pd
import numpy as np


def calculate_campaign_metrics(
    analysis_df,
    balanced_df,
    pre_start,
    pre_end,
    campaign_start,
    campaign_end,
    sales_metric="SALES_1"
):

    # ============================================
    # PRE SALES
    # ============================================

    pre_sales = (

        analysis_df[

            (analysis_df["Month_ID"].astype(str) >= str(pre_start))
            &
            (analysis_df["Month_ID"].astype(str) <= str(pre_end))

        ]

        .groupby("HCP_ID")[sales_metric]

        .sum()

        .reset_index()

        .rename(
            columns={
                sales_metric:
                "Pre_Sales"
            }
        )

    )

    # ============================================
    # POST SALES
    # ============================================

    post_sales = (

        analysis_df[

            (analysis_df["Month_ID"].astype(str) >= str(campaign_start))
            &
            (analysis_df["Month_ID"].astype(str) <= str(campaign_end))

        ]

        .groupby("HCP_ID")[sales_metric]

        .sum()

        .reset_index()

        .rename(
            columns={
                sales_metric:
                "Post_Sales"
            }
        )

    )

    # ============================================
    # MEASUREMENT DATASET
    # ============================================

    measure_df = (

        balanced_df[
            [
                "HCP_ID",
                "Test_Control_Flag"
            ]
        ]

        .drop_duplicates()

        .merge(
            pre_sales,
            on="HCP_ID",
            how="left"
        )

        .merge(
            post_sales,
            on="HCP_ID",
            how="left"
        )

        .fillna(0)

    )

    measure_df["Delta"] = (

        measure_df["Post_Sales"]

        -

        measure_df["Pre_Sales"]

    )

    # ============================================
    # SUMMARY
    # ============================================

    summary_df = (

        measure_df

        .groupby(
            "Test_Control_Flag"
        )

        .agg(

            Unique_HCPs=("HCP_ID", "nunique"),

            Total_Pre_Sales=("Pre_Sales", "sum"),

            Total_Post_Sales=("Post_Sales", "sum"),

            Avg_Pre_Sales=("Pre_Sales", "mean"),

            Avg_Post_Sales=("Post_Sales", "mean")

        )

        .reset_index()

    )

    # ============================================
    # TEST VALUES
    # ============================================

    test_row = summary_df[
        summary_df["Test_Control_Flag"]
        == "Test"
    ].iloc[0]

    ctrl_row = summary_df[
        summary_df["Test_Control_Flag"]
        == "Control"
    ].iloc[0]

    test_pre = test_row[
        "Avg_Pre_Sales"
    ]

    test_post = test_row[
        "Avg_Post_Sales"
    ]

    ctrl_pre = ctrl_row[
        "Avg_Pre_Sales"
    ]

    ctrl_post = ctrl_row[
        "Avg_Post_Sales"
    ]

    # ============================================
    # DOUBLE DELTA
    # ============================================

    test_delta = test_post - test_pre

    ctrl_delta = ctrl_post - ctrl_pre

    double_delta = (

        test_delta

        -

        ctrl_delta

    )

    if ctrl_delta != 0:

        lift_pct = (

            double_delta

            /

            abs(ctrl_delta)

        ) * 100

    else:

        lift_pct = None

    # ============================================
    # P VALUE
    # ============================================

    test_delta_pop = (

        measure_df[
            measure_df[
                "Test_Control_Flag"
            ]
            == "Test"
        ]["Delta"]

    )

    ctrl_delta_pop = (

        measure_df[
            measure_df[
                "Test_Control_Flag"
            ]
            == "Control"
        ]["Delta"]

    )

    if len(test_delta_pop) < 2:

        raise Exception(
            "Insufficient Test observations"
        )

    if len(ctrl_delta_pop) < 2:

        raise Exception(
            "Insufficient Control observations"
        )

    t_stat, p_value = ttest_ind(
        test_delta_pop,
        ctrl_delta_pop,
        equal_var=False
    )

    results = {

        "Test_Avg_Pre_Sales":
            round(test_pre,4),

        "Test_Avg_Post_Sales":
            round(test_post,4),

        "Ctrl_Avg_Pre_Sales":
            round(ctrl_pre,4),

        "Ctrl_Avg_Post_Sales":
            round(ctrl_post,4),

        "Test_Delta":
            round(test_delta,4),

        "Ctrl_Delta":
            round(ctrl_delta,4),

        "Double_Delta":
            round(double_delta,4),

        "Lift_Pct":
            round(lift_pct,2)
            if lift_pct is not None
            else None,

        "P_Value":
            round(p_value,6),

        "Significance":
            "Significant"
            if p_value < 0.05
            else "Not Significant"
    }

    print("\n✅ Campaign Measurement Completed")

    return (
        measure_df,
        summary_df,
        results
    )



#run_stratification_pipeline() function
def run_stratification_pipeline(
    data_df,
    meta_df,
    campaign_start,
    campaign_end,
    pre_start,
    pre_end,
    ctrl_ratio,
    sales_metric,
    selected_categorical_vars,
    selected_numeric_vars
):

    print("***** PANDAS VERSION LOADED *****")

    print("=" * 80)
    print("STARTING STRATIFICATION PIPELINE")
    print("=" * 80)

    input_universe_summary = population_summary(
        data_df,
        stage_name="Input Universe"
    )

    metadata = load_and_validate_metadata(
        meta_df,
        data_df
    )

    (
        campaign_df,
        final_pool,
        valid_hcps,
        analysis_df,
        post_scrubbing_summary

    ) = campaign_scrubbing(

        data_df=data_df,

        campaign_start=campaign_start,

        campaign_end=campaign_end

    )

    pre_profile = create_pre_profile(

        analysis_df=analysis_df,

        pre_start=pre_start,

        pre_end=pre_end,

        selected_categorical_vars=selected_categorical_vars,

        selected_numeric_vars=selected_numeric_vars,

        sales_metric=sales_metric

    )

    bucket_df = create_buckets(

        pre_profile=pre_profile,

        selected_numeric_vars=selected_numeric_vars,

        sales_metric=sales_metric

    )

    (
        balanced_df,
        before_strat_summary,
        after_strat_summary,
        top5_balance

    ) = stratify_and_balance(

        bucket_df=bucket_df,

        selected_categorical_vars=selected_categorical_vars,

        selected_numeric_vars=selected_numeric_vars,

        ctrl_ratio=ctrl_ratio,

        sales_metric=sales_metric

    )

    (
        measure_df,
        measurement_summary,
        final_results

    ) = calculate_campaign_metrics(

        analysis_df=analysis_df,

        balanced_df=balanced_df,

        pre_start=pre_start,

        pre_end=pre_end,

        campaign_start=campaign_start,

        campaign_end=campaign_end,

        sales_metric=sales_metric

    )

    print("\n")
    print("=" * 80)
    print("FINAL RESULTS")
    print("=" * 80)

    for k, v in final_results.items():

        print(f"{k:<30}: {v}")

    return {

        "input_universe_summary":
            input_universe_summary.to_dict("records"),

        "post_scrubbing_summary":
            post_scrubbing_summary.to_dict("records"),

        "before_stratification_summary":
            before_strat_summary.to_dict("records"),

        "after_stratification_summary":
            after_strat_summary.to_dict("records"),

        "top5_balance":
            top5_balance.to_dict("records"),

        "measurement_summary":
            measurement_summary.to_dict("records"),

        "final_results":
            final_results

    }


import pandas as pd
from pathlib import Path
print("Reading Input Files...")
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
PUBLIC_DIR = PROJECT_ROOT / "public" / "metadata"
# Read Excel files
data_pd = pd.read_excel(
    PUBLIC_DIR / "Strat_data.xlsx"
)

print("Data File Loaded")

print("Reading Meta File...")

meta_pd = pd.read_excel(
    PUBLIC_DIR / "strat_meta.xlsx"
)
print("Meta File Loaded")

print("Data Shape :", data_pd.shape)
print("Meta Shape :", meta_pd.shape)

import pandas as pd
import ast

# ============================================================
# FILE PATH
# ============================================================

excel_path = PUBLIC_DIR / "Final_results.xlsx"



# ============================================================
# READ LATEST REQUEST FROM SHEET2
# ============================================================

input_df = pd.read_excel(
    excel_path,
    sheet_name="Input"
)

latest = input_df.iloc[-1]

# ============================================================
# JOB ID
# ============================================================

job_id = latest["Job_ID"]

# ============================================================
# DATE INPUTS → YYYYMM
# ============================================================

campaign_start = pd.to_datetime(
    latest["campaign_start"]
).strftime("%Y%m")

campaign_end = pd.to_datetime(
    latest["campaign_end"]
).strftime("%Y%m")

pre_start = pd.to_datetime(
    latest["pre_start"]
).strftime("%Y%m")

pre_end = pd.to_datetime(
    latest["pre_end"]
).strftime("%Y%m")

# ============================================================
# OTHER INPUTS
# ============================================================

ctrl_ratio = float(latest["ctrl_ratio"])

sales_metric = latest["sales_metric"]

# ============================================================
# CATEGORICAL SEGMENTS
# Example:
# ["segment_1","segment_2"]
# ============================================================

selected_categorical_vars = ast.literal_eval(
    str(latest["balancingVariables"])
)

# ============================================================
# NUMERICAL SEGMENTS
# Example:
# ["SEGMENT_NUMERICAL_1","SEGMENT_NUMERICAL_2"]
# ============================================================

selected_numeric_vars = ast.literal_eval(
    str(latest["selected_numeric_vars"])
)

# ============================================================
# RUN STRATIFICATION PIPELINE
# ============================================================

results = run_stratification_pipeline(
    data_df=data_pd,
    meta_df=meta_pd,

    campaign_start=campaign_start,
    campaign_end=campaign_end,

    pre_start=pre_start,
    pre_end=pre_end,

    ctrl_ratio=ctrl_ratio,

    sales_metric=sales_metric,

    selected_categorical_vars=selected_categorical_vars,

    selected_numeric_vars=selected_numeric_vars
)

# ============================================================
# SHOW RESULTS
# ============================================================

print("\nFINAL OUTPUT")
print(results)

# ============================================================
# CREATE OUTPUT RECORD
# ============================================================

output_record = {
    "Job_ID": job_id
}

output_record.update(
    results["final_results"]
)

final_results_df = pd.DataFrame(
    [output_record]
)

# ============================================================
# READ EXISTING SHEET3
# ============================================================

try:

    existing_results = pd.read_excel(
        excel_path,
        sheet_name="Output"
    )

    existing_results = existing_results.dropna(
        how="all"
    )

except Exception:

    existing_results = pd.DataFrame()

# ============================================================
# APPEND NEW RESULTS
# ============================================================

if existing_results.empty:

    final_output_df = final_results_df.copy()

else:

    final_output_df = pd.concat(
        [
            existing_results,
            final_results_df
        ],
        ignore_index=True
    )

# ============================================================
# EXPORT RESULTS TO SHEET3
# ============================================================

with pd.ExcelWriter(
    excel_path,
    engine="openpyxl",
    mode="a",
    if_sheet_exists="replace"
) as writer:

    final_output_df.to_excel(
        writer,
        sheet_name="Output",
        index=False
    )

print("\n" + "=" * 80)
print("✅ RESULTS EXPORTED SUCCESSFULLY")
print(f"✅ Job ID              : {job_id}")
print(f"✅ Sheet Name          : Sheet3")
print(f"✅ Total Records       : {len(final_output_df)}")
print("=" * 80)