# ML pipeline — first-line breast-cancer regime model

Offline, reproducible pipeline that builds everything the UI consumes. The model is **not**
served live: it is trained once and its predictions + SHAP explanations are exported to JSON,
which the frontend loads statically.

## 1. Get the data (MSK-CHORD, cBioPortal)

Download the **MSK-CHORD (MSKCC, Nature 2024)** study export from cBioPortal:

- https://www.cbioportal.org/study/summary?id=msk_chord_2024 → *Download* the study archive
  (`msk_chord_2024.tar.gz`), or pull it from the cBioPortal Datahub.

Unpack it so the files land here (the loader reads from this exact folder):

```
data/msk_chord_2024/
├── data_clinical_patient.txt      # 4 '#'-comment lines before the header
├── data_clinical_sample.txt       # 4 '#'-comment lines before the header
└── data_timeline_treatment.txt    # normal header (no '#')
```

> `case_lists/` and the other files in the export are not used. The raw data is **not**
> committed to the repo (size + licensing) — each user downloads it themselves.

## 2. Install

```bash
pip install -r ml/requirements.txt
```

(Python 3.11+ recommended.)

## 3. Run (from the project root)

```bash
python ml/pipeline.py
```

This writes to `data/derived/`:

| File | Description |
|------|-------------|
| `first_line_labels.csv`   | breast-only cohort, first-line regime label (10 classes) |
| `rf_model.joblib`         | trained pipeline (median imputer + RandomForest) |
| `model_meta.json`         | feature names, classes, hyperparameters |
| `predictions.json`        | 12 curated cases, top-3 options each, with SHAP per option |
| `validation_truth.json`   | `patient_id -> true label` (validation only; not shipped to UI) |

To refresh the UI, copy the predictions into the frontend's static folder:

```bash
cp data/derived/predictions.json frontend/public/predictions.json
```

## What the pipeline does

1. **Cohort & label** — keep patients whose samples are *only* `Breast Cancer` (breast-only).
   The label is the **first-line regime**: at each patient's earliest `START_DATE`, the unique
   `AGENT`s are sorted alphabetically and joined with ` + `. Only regimes with **>=100** patients
   are kept as classes; rarer regimes are **dropped** (no "Other" bucket) → **10 classes**,
   3 653 patients.
2. **Features (18)** — numeric: `CURRENT_AGE_DEID`, `TMB_NONSYNONYMOUS`, `TUMOR_PURITY`;
   categorical: `HR`, `HER2`, `STAGE_HIGHEST_RECORDED`, `SMOKING_PREDICTIONS_3_CLASSES`,
   `MSI_TYPE` (NaN → `Missing`), and 10 organ-involvement flags. One-hot encoded; `Unknown`
   stays its own category. No outcome columns (`OS_*`) and no excluded columns
   (`METASTATIC_SITE`, `PDL1*`, `GENDER`, `ONCOTREE_CODE`, histology, genomics).
3. **Split & model** — stratified 80/20 split (`random_state=42`). Median imputation is fit on
   **train only** (inside the pipeline → no leakage). Model:
   `RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42)`.
4. **Explanations** — TreeSHAP on the test set; one-hot SHAP values are aggregated back to the
   18 original features (summed per feature).
5. **Curated export** — 12 cases across four situations (confident-correct, uncertain,
   misclassified, counter-intuitive HER2→AC). For each case the **top-3 regimes** by probability
   are exported, each with its own SHAP attribution toward that regime.

Everything is seeded with `random_state=42`, so a fresh run reproduces the shipped
`frontend/public/predictions.json` exactly (given the same data and library versions).
