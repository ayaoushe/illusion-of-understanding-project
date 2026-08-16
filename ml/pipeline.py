from __future__ import annotations

import json
import os

import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

RANDOM_STATE = 42   # heißt das random_state immer dieselben zufälligen Zahlen generiert, damit wir es reproduzieren können für die Fälle die wir später präsentieren wolen
DATA_DIR = "data/msk_chord_2024/" # die AblageOrte'/Pfade, wo die Dateien sich befinden
OUT_DIR = "data/derived/"

# --- the 18 features (3 numeric + 5 categorical + 10 organ-involvement columns) ---
NUM = ["CURRENT_AGE_DEID", "TMB_NONSYNONYMOUS", "TUMOR_PURITY"]
ORGANS = [
    "ADRENAL_GLANDS", "BONE", "CNS_BRAIN", "INTRA_ABDOMINAL", "LIVER", "LUNG",
    "LYMPH_NODES", "OTHER", "PLEURA", "REPRODUCTIVE_ORGANS",
]
CAT = ["HR", "HER2", "STAGE_HIGHEST_RECORDED", "SMOKING_PREDICTIONS_3_CLASSES", "MSI_TYPE"] + ORGANS
ALL_ORIG = NUM + CAT
ENDOCRINE = {"TAMOXIFEN", "LETROZOLE", "ANASTROZOLE", "LETROZOLE + PALBOCICLIB"}


def load_sources(): # hier werden die CSV-Datien, die data Ordner hinterlegt sind geladen
    pat = pd.read_csv(DATA_DIR + "data_clinical_patient.txt", sep="\t", comment="#")
    samp = pd.read_csv(DATA_DIR + "data_clinical_sample.txt", sep="\t", comment="#")
    tl = pd.read_csv(DATA_DIR + "data_timeline_treatment.txt", sep="\t")
    return pat, samp, tl


def build_labels(samp: pd.DataFrame, tl: pd.DataFrame) -> pd.DataFrame:  # baut das Label aus den Features, d.h. welche Erstlinien-Therapie ein Patient bekommen hat
    """breast-only cohort, first-line regime label, threshold >=100, 'Other' removed (10 classes)."""
    breast_pat = set(samp.loc[samp["CANCER_TYPE"] == "Breast Cancer", "PATIENT_ID"]) # Patienten mit mind. einer Proble CANCER_TYPE == Breast Cancer
    types_per_pat = samp.groupby("PATIENT_ID")["CANCER_TYPE"].apply(lambda s: set(s.dropna())) # pro Patient die Menge aller vorkommenden Krebstypen
    breast_only = {p for p in breast_pat if types_per_pat[p] == {"Breast Cancer"}} # nur Fälle mit ausschließlich Brustkrebs

    t = tl[tl["PATIENT_ID"].isin(breast_only)].copy()
    fl_start = t.groupby("PATIENT_ID")["START_DATE"].min().rename("first_line_start_date")
    mn = t.groupby("PATIENT_ID")["START_DATE"].transform("min")
    fl = t[t["START_DATE"] == mn]
    reg = (
        fl.groupby("PATIENT_ID")["AGENT"]
        .apply(lambda s: " + ".join(sorted(set(s.dropna())))) #Wirkstoff ohne Namen wird verworfen
        .rename("regime_label")
    )

    # seltene Regimes mit < 100 Patienten werden rausgefiltert (sonst ist die "Other" Klasse sehr groß)
    vc = reg.value_counts()
    keep_regimes = set(vc[vc >= 100].index)  # 10 klassen und somit >=100 patients
    labels = pd.concat([reg, fl_start], axis=1).reset_index()
    labels = labels[labels["regime_label"].isin(keep_regimes)].copy()
    labels = labels[["PATIENT_ID", "regime_label", "first_line_start_date"]].sort_values("PATIENT_ID")
    return labels.reset_index(drop=True)


# Sammelt für genau diese Patienten die 18 klinischen Merkmale aus Patienten- und Probentabelle ein 
# und bringt sie ins Modellformat (One-Hot-Encoding), sodass Merkmale und Label zeilengleich zusammenpassen.

def build_xy(labels: pd.DataFrame, pat: pd.DataFrame, samp: pd.DataFrame): 
    pcols = ["PATIENT_ID", "CURRENT_AGE_DEID", "HR", "HER2", "STAGE_HIGHEST_RECORDED",
             "SMOKING_PREDICTIONS_3_CLASSES"] + ORGANS
    scols = ["PATIENT_ID", "TMB_NONSYNONYMOUS", "TUMOR_PURITY", "MSI_TYPE"]

    df = (
        labels[["PATIENT_ID", "regime_label"]]
        .merge(pat[pcols], on="PATIENT_ID", how="left")
        .merge(samp[scols], on="PATIENT_ID", how="left")
    )
    df["MSI_TYPE"] = df["MSI_TYPE"].fillna("Missing")  # NaN -> explicit category
    raw = df.copy()
    for c in CAT:
        df[c] = df[c].astype(str)
        raw[c] = raw[c].astype(str)

    y = df["regime_label"]
    X = pd.get_dummies(df[NUM + CAT], columns=CAT, dummy_na=False)
    return df, raw, X, y


def fit_model(X_train, y_train): # modell wird trainiert
    pre = ColumnTransformer(     # wenn alter, tmb und tumor purity fehlen, kriegen die den median
        transformers=[("num_impute", SimpleImputer(strategy="median"), NUM)],
        remainder="passthrough",
    )
    rf = RandomForestClassifier(
        n_estimators=300, class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1
    )
    pipe = Pipeline([("pre", pre), ("rf", rf)])
    pipe.fit(X_train, y_train)
    return pipe

# mit TreeExplainer werden hier die SHAP-Werte berechnet
def shap_setup(pipe, X_test):
    imputer = pipe.named_steps["pre"]
    rf = pipe.named_steps["rf"]
    Xt = imputer.transform(X_test)
    try:
        out_cols = [c.split("__", 1)[-1] for c in imputer.get_feature_names_out()]
    except Exception:
        out_cols = NUM + [c for c in X_test.columns if c not in NUM]
    X_test_imp = pd.DataFrame(Xt, columns=out_cols, index=X_test.index)
    explainer = shap.TreeExplainer(rf)
    sv = explainer.shap_values(X_test_imp.values)
    return rf, X_test_imp, sv

# hilfsfunktion, damit die shap-Werte aus ihren untersch. Matrix Formen alle zu einem einheitlichen Vektor umgeformt werden
# bzw. den Vektor für einen bestimmten Patienten und eine bestimmte Klasse
def make_get_sv(sv):
    def get_sv(sample_idx, class_idx):
        if isinstance(sv, list):
            return np.asarray(sv[class_idx])[sample_idx]
        arr = np.asarray(sv)
        if arr.ndim == 3:
            return arr[sample_idx, :, class_idx]
        return arr[sample_idx]
    return get_sv

# Wählt reproduzierbar 12 Testpatienten aus, 
# je 3 pro Kategorie: A sicher und richtig,
# B unsicher bei Hormontherapie,
# C knapp daneben liegend "wirkt sicher aber ist falsch"
# D klinisch fragwürdig: HER2-positiv mit Chemo-Vorhersage
def select_cases(pred, pid_test, y_test, ptop, raw, X_test):
    """Deterministische Auswahl von 12 Fällen über 4 categories A/B/C/D."""
    sel = pd.DataFrame({
        "pos": np.arange(len(pred)), "patient_id": pid_test.values,
        "true": y_test.values, "pred": pred, "ptop": ptop,
    })
    sel["correct"] = sel["true"] == sel["pred"]

    def her2_of(pos):
        return raw.loc[X_test.index[pos], "HER2"]

    def pick_n(mask, n, exclude):
        cand = sel[mask & ~sel["patient_id"].isin(exclude)].sort_values("patient_id")
        return list(cand["patient_id"].head(n))

    chosen, used = {}, set()
    a_ids = pick_n(sel["correct"] & (sel["ptop"] >= 0.6), 3, used)
    used.update(a_ids); [chosen.__setitem__(i, "A") for i in a_ids]
    maskB = (sel["ptop"] <= 0.45) & (sel["pred"].isin(ENDOCRINE) | sel["true"].isin(ENDOCRINE))
    b_ids = pick_n(maskB, 3, used)
    used.update(b_ids); [chosen.__setitem__(i, "B") for i in b_ids]
    maskC = (~sel["correct"]) & (sel["ptop"] > 0.45) & (sel["ptop"] < 0.6)
    c_ids = pick_n(maskC, 3, used)
    used.update(c_ids); [chosen.__setitem__(i, "C") for i in c_ids]
    posD = [
        p for p in sel["pos"]
        if her2_of(p) == "Yes" and sel.loc[sel["pos"] == p, "pred"].iloc[0] == "CYCLOPHOSPHAMIDE + DOXORUBICIN"
    ]
    d_cand = sel[sel["pos"].isin(posD) & ~sel["patient_id"].isin(used)].sort_values("patient_id")
    d_ids = list(d_cand["patient_id"].head(3))
    used.update(d_ids); [chosen.__setitem__(i, "D") for i in d_ids]

    order_cat = {"A": 0, "B": 1, "C": 2, "D": 3}
    all_ids = sorted(a_ids + b_ids + c_ids + d_ids, key=lambda p: (order_cat[chosen[p]], p))
    return all_ids

# ---------------------------------------------------------------------------
# Klinischer Kontext: echte Felder aus MSK CHORD, die das Modell selbst nicht
# benutzt, die die Fallansicht aber bisher erfunden hat (Geschlecht, Histologie,
# genaues Stadium, Diagnosedatum, ECOG, Tumormarker, Tumorlokalisationen,
# Ereignisse, MSI-Score).
#
# Zeitlicher Bezugspunkt ist immer der Start der Erstlinientherapie (Tag 0).
# Alles wird strikt darauf gefiltert: was erst danach dokumentiert wurde, darf
# im Studien-UI nicht erscheinen — die Probanden entscheiden genau an diesem
# Punkt und dürfen kein Wissen aus der Zukunft sehen.
# ---------------------------------------------------------------------------
MARKER_FILES = {"CA 15-3": "data_timeline_ca_15-3_labs.txt", "CEA": "data_timeline_cea_labs.txt"}
MARKER_WINDOW_DAYS = 730   # nur Messungen aus den 2 Jahren vor Therapiestart
MAX_MARKER_POINTS = 10     # je Marker die letzten 10 davor


def _read_timeline(name: str) -> pd.DataFrame:
    return pd.read_csv(DATA_DIR + name, sep="\t", low_memory=False)


def _before(df: pd.DataFrame, pid: str, t0: float) -> pd.DataFrame:
    """Zeilen eines Patienten bis einschließlich Therapiestart, zeitlich sortiert."""
    sub = df[(df["PATIENT_ID"] == pid) & (df["START_DATE"] <= t0)]
    return sub.sort_values("START_DATE")


def _clean(v):
    """NaN -> None, Strings trimmen (die Rohdaten sind rechts aufgefüllt)."""
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return None
    return v.strip() if isinstance(v, str) else v


def build_clinical_context(all_ids, labels, pat, samp) -> dict[str, dict]:
    ids = set(all_ids)
    t0_by_pid = labels.set_index("PATIENT_ID")["first_line_start_date"].to_dict()
    p = pat[pat["PATIENT_ID"].isin(ids)].drop_duplicates("PATIENT_ID").set_index("PATIENT_ID")
    s = samp[samp["PATIENT_ID"].isin(ids)].drop_duplicates("PATIENT_ID").set_index("PATIENT_ID")

    dx = _read_timeline("data_timeline_diagnosis.txt")
    ps = _read_timeline("data_timeline_performance_status.txt")
    ts = _read_timeline("data_timeline_tumor_sites.txt")
    prog = _read_timeline("data_timeline_progression.txt")
    surg = _read_timeline("data_timeline_surgery.txt")
    rad = _read_timeline("data_timeline_radiation.txt")
    markers = {name: _read_timeline(f) for name, f in MARKER_FILES.items()}

    out: dict[str, dict] = {}
    for pid in all_ids:
        t0 = t0_by_pid[pid]
        prow = p.loc[pid] if pid in p.index else None
        srow = s.loc[pid] if pid in s.index else None

        # 1 Geschlecht
        sex = _clean(prow["GENDER"]) if prow is not None else None

        # 2 Histologie / ICD-O
        histology = {
            "cancer_type_detailed": _clean(srow["CANCER_TYPE_DETAILED"]) if srow is not None else None,
            "oncotree_code": _clean(srow["ONCOTREE_CODE"]) if srow is not None else None,
            "icd_o_description": _clean(srow["ICD_O_HISTOLOGY_DESCRIPTION"]) if srow is not None else None,
            "primary_site": _clean(srow["PRIMARY_SITE"]) if srow is not None else None,
            "sample_type": _clean(srow["SAMPLE_TYPE"]) if srow is not None else None,
            "metastatic_site": _clean(srow["METASTATIC_SITE"]) if srow is not None else None,
        }

        # 3 genaues Stadium (Registerangabe, feiner als "Stage 1-3")
        dx_rows = _before(dx, pid, t0)
        dx_row = dx_rows.iloc[-1] if len(dx_rows) else None
        stage = {
            "coarse": _clean(prow["STAGE_HIGHEST_RECORDED"]) if prow is not None else None,
            "clinical_group": _clean(srow["CLINICAL_GROUP"]) if srow is not None else None,
            "pathological_group": _clean(srow["PATHOLOGICAL_GROUP"]) if srow is not None else None,
            "registry_path_group": _clean(dx_row["PATH_GROUP"]) if dx_row is not None else None,
        }

        # 4 Diagnose (Datum relativ zum Therapiestart + Registertext)
        diagnosis = None
        if dx_row is not None:
            diagnosis = {
                "days_before_first_line": int(t0 - dx_row["START_DATE"]),
                "description": _clean(dx_row["DX_DESCRIPTION"]),
                "source": _clean(dx_row["SOURCE"]),
            }

        # 5 ECOG: letzter Wert vor Therapiestart + wie viele Messungen es gibt
        ps_rows = _before(ps, pid, t0).dropna(subset=["ECOG"])
        ecog = None
        if len(ps_rows):
            last = ps_rows.iloc[-1]
            ecog = {
                "value": int(last["ECOG"]),
                "days_before_first_line": int(t0 - last["START_DATE"]),
                "n_measurements_before": int(len(ps_rows)),
                "range_before": [int(ps_rows["ECOG"].min()), int(ps_rows["ECOG"].max())],
            }

        # 6 Tumormarker: die letzten Messungen vor Therapiestart
        tumor_markers = {}
        for name, df in markers.items():
            rows = _before(df, pid, t0)
            rows = rows[rows["START_DATE"] >= t0 - MARKER_WINDOW_DAYS]
            rows = rows.tail(MAX_MARKER_POINTS)
            if not len(rows):
                continue
            tumor_markers[name] = {
                "unit": _clean(rows.iloc[-1]["LR_UNIT_MEASURE"]),
                "points": [
                    {"days_before_first_line": int(t0 - r["START_DATE"]), "value": float(r["RESULT"])}
                    for _, r in rows.iterrows()
                ],
            }

        # 7 dokumentierte Tumorlokalisationen mit Datum und Bildgebungsart
        ts_rows = _before(ts, pid, t0)
        tumor_sites = []
        for site, grp in ts_rows.groupby("TUMOR_SITE"):
            first = grp.iloc[0]
            tumor_sites.append({
                "site": _clean(site),
                "days_before_first_line": int(t0 - first["START_DATE"]),
                "modality": _clean(first.get("SOURCE_SPECIFIC")),
                "source": _clean(first.get("SOURCE")),
            })
        tumor_sites.sort(key=lambda d: -d["days_before_first_line"])

        # 8 Ereignisse vor Therapiestart (OP, Bestrahlung, Progress)
        prog_rows = _before(prog, pid, t0)
        prog_rows = prog_rows[prog_rows["PROGRESSION"] == "Y"]
        events = {
            "surgeries_before": int(len(_before(surg, pid, t0))),
            "radiation_before": int(len(_before(rad, pid, t0))),
            "progressions_before": int(len(prog_rows)),
        }

        # 9 zusätzliche Probenwerte
        assay = {
            "msi_score": float(srow["MSI_SCORE"]) if srow is not None and pd.notna(srow["MSI_SCORE"]) else None,
            "gene_panel": _clean(srow["GENE_PANEL"]) if srow is not None else None,
        }

        out[pid] = {
            "sex": sex,
            "histology": histology,
            "stage": stage,
            "diagnosis": diagnosis,
            "ecog": ecog,
            "tumor_markers": tumor_markers,
            "tumor_sites": tumor_sites,
            "events_before_first_line": events,
            "assay": assay,
            # NUR für die Auswertung, NICHT im UI vor der Entscheidung anzeigen:
            "outcome": {
                "os_months": float(prow["OS_MONTHS"]) if prow is not None and pd.notna(prow["OS_MONTHS"]) else None,
                "os_status": _clean(prow["OS_STATUS"]) if prow is not None else None,
            },
        }
    return out


# ---------------------------------------------------------------------------
# Ähnliche Fälle über die Random-Forest-Proximity: Anteil der 300 Bäume, in
# denen zwei Patientinnen im selben Blatt landen. Das ist Ähnlichkeit aus Sicht
# des Modells und passt damit zu den SHAP-Erklärungen — keine frei gewählte
# Distanzfunktion.
#
# Die Nachbarn stammen aus dem Trainingsset: genau die Fälle, aus denen das
# Modell gelernt hat, mit abgeschlossenem Verlauf. Ihr Outcome ist echtes
# Registerwissen und darf gezeigt werden; das Outcome des Indexfalls selbst
# nicht (es liegt zeitlich nach der Entscheidung).
# ---------------------------------------------------------------------------
SIMILAR_FIELDS = [
    "CURRENT_AGE_DEID", "HR", "HER2", "STAGE_HIGHEST_RECORDED", "LYMPH_NODES",
    "LIVER", "BONE", "LUNG", "SMOKING_PREDICTIONS_3_CLASSES", "MSI_TYPE",
    "TMB_NONSYNONYMOUS", "TUMOR_PURITY",
]
N_SIMILAR = 3


def build_similar_cases(all_ids, pipe, X_train, y_train, pid_train, X_test, pid_test, raw, df, pat):
    rf = pipe.named_steps["rf"]
    pre = pipe.named_steps["pre"]
    leaves_train = rf.apply(pre.transform(X_train))
    leaves_test = rf.apply(pre.transform(X_test))

    raw_by_pid = raw.set_index(df["PATIENT_ID"])
    pat_idx = pat.drop_duplicates("PATIENT_ID").set_index("PATIENT_ID")

    def row_of(pid):
        r = raw_by_pid.loc[pid]
        return r.iloc[0] if isinstance(r, pd.DataFrame) else r

    def value(v):
        if pd.isna(v):
            return None
        return float(v) if isinstance(v, (int, float, np.number)) else str(v)

    out = {}
    for pid in all_ids:
        pos = int(np.where(pid_test.values == pid)[0][0])
        prox = (leaves_train == leaves_test[pos]).mean(axis=1)
        target = row_of(pid)

        neighbors = []
        for rank, i in enumerate(np.argsort(-prox)[:N_SIMILAR], start=1):
            npid = pid_train.iloc[i]
            r = row_of(npid)
            os_months = pat_idx.loc[npid, "OS_MONTHS"]
            neighbors.append({
                "rank": rank,
                "patient_id": npid,
                "match_percent": round(float(prox[i]) * 100),
                "regime": str(y_train.iloc[i]),
                "features": {f: value(r[f]) for f in SIMILAR_FIELDS},
                "matched_fields": [f for f in SIMILAR_FIELDS if str(r[f]) == str(target[f])],
                "os_months": round(float(os_months), 1) if pd.notna(os_months) else None,
                "os_status": str(pat_idx.loc[npid, "OS_STATUS"]),
            })
        out[pid] = neighbors
    return out


# Baut für diese 12 Fälle die Ausgabestruktur mit den Top-3-Regimen,
# deren Wahrscheinlichkeiten und je 18 nach Einfluss sortierten Feature-Erklärungen in Textform.
def build_predictions(all_ids, pid_test, proba, classes, raw, X_test, X_test_imp, get_sv, y_test):
    feat_cols = list(X_test_imp.columns)
    orig_to_dummies = {f: [f] for f in NUM}
    for f in CAT:
        orig_to_dummies[f] = [c for c in feat_cols if c == f or c.startswith(f + "_")]

    def feats_for_class(pos, raw_row, cls):
        s = get_sv(pos, classes.index(cls))
        s_by_col = dict(zip(feat_cols, s))
        feats = []
        for f in ALL_ORIG:
            agg = float(sum(s_by_col.get(d, 0.0) for d in orig_to_dummies[f])) + 0.0  # -0.0 -> 0.0
            val = raw_row[f]
            if f in NUM:
                val_str = ("%.3f" % float(val)).rstrip("0").rstrip(".") if pd.notna(val) else "Missing"
            else:
                val_str = str(val)
            direction = "Richtung" if agg >= 0 else "weg von"
            feats.append({
                "name": f, "value": val_str, "weight": round(agg, 4) + 0.0,
                "explanation": f"{f} = {val_str} verschiebt {direction} {cls}.",
            })
        feats.sort(key=lambda d: abs(d["weight"]), reverse=True)
        return feats

    predictions, truth = [], {}
    for pid in all_ids:
        pos = int(np.where(pid_test.values == pid)[0][0])
        raw_row = raw.loc[X_test.index[pos]]
        prob_map = {classes[i]: round(float(proba[pos, i]), 4) for i in range(len(classes))}
        prob_sorted = sorted(prob_map.items(), key=lambda kv: kv[1], reverse=True)
        options = [
            {"regime": regime, "rank": rank, "probability": p,
             "features": feats_for_class(pos, raw_row, regime)}
            for rank, (regime, p) in enumerate(prob_sorted[:3], start=1)
        ]
        predictions.append({
            "patient_id": pid,
            "prediction": prob_sorted[0][0],
            "confidence_percent": round(prob_sorted[0][1] * 100),
            "probabilities": dict(prob_sorted),
            "options": options,
        })
        truth[pid] = str(y_test.iloc[pos])
    return predictions, truth

# Führt den gesamten Durchlauf aus:
# Daten laden, Labels und Features bauen,
# splitten
# Modell trainieren und speichern
# SHAP berechnen
# Fälle auswählen und alles als CSV/JSON nach data/derived exportieren
def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    pat, samp, tl = load_sources()

    labels = build_labels(samp, tl)
    labels.to_csv(OUT_DIR + "first_line_labels.csv", index=False)
    print(f"labels: {len(labels)} patients, {labels['regime_label'].nunique()} classes")

    df, raw, X, y = build_xy(labels, pat, samp)
    feature_names = list(X.columns)

    # single stratified split (X, y and patient ids together) — deterministic with random_state
    X_train, X_test, y_train, y_test, pid_train, pid_test = train_test_split(
        X, y, df["PATIENT_ID"], test_size=0.2, stratify=y, random_state=RANDOM_STATE
    )
    pipe = fit_model(X_train, y_train)
    joblib.dump(pipe, OUT_DIR + "rf_model.joblib", compress=3)
    classes = list(pipe.named_steps["rf"].classes_)
    with open(OUT_DIR + "model_meta.json", "w") as f:
        json.dump({
            "feature_names": feature_names,
            "numeric_features": NUM,
            "classes": classes,
            "n_estimators": 300,
            "class_weight": "balanced",
            "random_state": RANDOM_STATE,
            "test_size": 0.2,
        }, f, indent=2)
    print(f"model trained & saved: {X.shape[1]} features, {len(classes)} classes")

    proba = pipe.predict_proba(X_test)
    pred = pipe.predict(X_test)
    ptop = proba.max(axis=1)

    rf, X_test_imp, sv = shap_setup(pipe, X_test)
    get_sv = make_get_sv(sv)

    all_ids = select_cases(pred, pid_test, y_test, ptop, raw, X_test)
    predictions, truth = build_predictions(
        all_ids, pid_test, proba, classes, raw, X_test, X_test_imp, get_sv, y_test
    )

    # echte klinische Felder aus MSK CHORD anhängen (siehe build_clinical_context)
    clinical = build_clinical_context(all_ids, labels, pat, samp)
    similar = build_similar_cases(
        all_ids, pipe, X_train, y_train, pid_train, X_test, pid_test, raw, df, pat
    )
    for entry in predictions:
        entry["clinical"] = clinical.get(entry["patient_id"], {})
        entry["similar_cases"] = similar.get(entry["patient_id"], [])

    with open(OUT_DIR + "predictions.json", "w", encoding="utf-8") as f:
        json.dump(predictions, f, indent=2, ensure_ascii=False)
    with open(OUT_DIR + "validation_truth.json", "w", encoding="utf-8") as f:
        json.dump(truth, f, indent=2, ensure_ascii=False)
    print(f"exported {len(predictions)} curated cases -> {OUT_DIR}predictions.json")


if __name__ == "__main__":
    main()