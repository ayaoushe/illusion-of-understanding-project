import type { AiEvidenceSynthesis, EvidenceItem, PublishedCohort, RiskFlag, StudyCase } from '../types';
import { getAssessmentTreatmentLabel } from '../data/mockData';
import { featureMap } from './patientView';
import { buildMissingData } from './missingData';

/**
 * Evidenz zur Therapiewahl des Arztes — erzeugt aus den echten Merkmalen des
 * Falls und der Modellwahrscheinlichkeit für genau dieses Regime.
 *
 * Bewusst regelbasiert statt handgeschrieben: so gilt es für alle 10 Regime
 * und alle Fälle, und jede Aussage lässt sich auf ein Datenfeld zurückführen.
 * Es werden keine Studien zitiert, die wir nicht wirklich geprüft haben.
 */

type Klasse = 'endocrine' | 'chemo' | 'her2';

interface RegimeProfile {
  klasse: Klasse;
  /** Voraussetzung laut Rezeptorstatus */
  requiresHR?: boolean;
  requiresHER2?: boolean;
  /** Regimespezifische Vorbehalte mit Beleg, unabhängig vom Fall */
  cautions: Array<{ text: string; source?: string }>;
  risk?: Omit<RiskFlag, 'id'>;
  /** Für den Kernsatz: wofür steht dieses Regime, und was bleibt daran offen. */
  phrase: string;
  openIssue: string;
  /** Behandelt das Regime einen HER2-Treiber mit? */
  treatsHER2?: boolean;
  /** Setzt Postmenopause bzw. Prämenopause voraus? */
  needsMenopausalStatus?: boolean;
  /** Kardiotoxisch — LVEF muss vorliegen. */
  cardiotoxic?: boolean;
}

const PROFILES: Record<string, RegimeProfile> = {
  ANASTROZOLE: {
    phrase: 'aromatase inhibition',
    openIssue: 'the undocumented menopausal status',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: [{ text: 'Aromatase inhibitors require postmenopausal status or ovarian suppression.', source: 'SOFT_TEXT_NEJM_2014' },
               { text: 'Bone density loss and arthralgia are common under prolonged use.', source: 'BIG_1_98_NEJM_2005' }],
    risk: { title: 'Bone density loss', severity: 'moderate', description: 'Aromatase inhibition lowers estrogen further; baseline DXA and calcium/vitamin D are advisable.' },
  },
  LETROZOLE: {
    phrase: 'aromatase inhibition',
    openIssue: 'the undocumented menopausal status',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: [{ text: 'Aromatase inhibitors require postmenopausal status or ovarian suppression.', source: 'SOFT_TEXT_NEJM_2014' },
               { text: 'Bone density loss and arthralgia are common under prolonged use.', source: 'BIG_1_98_NEJM_2005' }],
    risk: { title: 'Bone density loss', severity: 'moderate', description: 'Aromatase inhibition lowers estrogen further; baseline DXA and calcium/vitamin D are advisable.' },
  },
  'LETROZOLE + PALBOCICLIB': {
    phrase: 'endocrine therapy combined with CDK4/6 inhibition',
    openIssue: 'the evidence base anchored in advanced disease',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: [{ text: 'CDK4/6 inhibition requires regular blood counts — neutropenia is the dose-limiting toxicity.', source: 'PALOMA2_NEJM_2016' },
               { text: 'Established primarily in the advanced/metastatic setting.', source: 'PALOMA2_NEJM_2016' }],
    risk: { title: 'Neutropenia', severity: 'moderate', description: 'Palbociclib causes dose-limiting neutropenia; blood counts on day 15 of the first cycles.' },
  },
  TAMOXIFEN: {
    phrase: 'endocrine blockade with a SERM',
    openIssue: 'the thromboembolic risk profile',
    klasse: 'endocrine',
    requiresHR: true,
    cautions: [{ text: 'Thromboembolic risk and endometrial changes require monitoring.', source: 'BIG_1_98_NEJM_2005' },
               { text: 'Usable regardless of menopausal status.', source: 'ESMO_EARLY_BREAST_CANCER_2024' }],
    risk: { title: 'Thromboembolic events', severity: 'moderate', description: 'Tamoxifen raises the risk of venous thromboembolism and endometrial hyperplasia.' },
  },
  LEUPROLIDE: {
    phrase: 'ovarian suppression',
    openIssue: 'the unusual use as sole endocrine therapy',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: [{ text: 'Ovarian suppression alone is rarely first-line — it is usually combined with tamoxifen or an aromatase inhibitor.', source: 'SOFT_NEJM_2015' },
               { text: 'Only meaningful in premenopausal patients.', source: 'SOFT_TEXT_NEJM_2014' }],
    risk: { title: 'Monotherapy unusual', severity: 'moderate', description: 'GnRH agonists suppress ovarian function but are not normally given as sole endocrine therapy.' },
  },
  CAPECITABINE: {
    phrase: 'oral fluoropyrimidine chemotherapy',
    openIssue: 'its usual place in later treatment lines',
    klasse: 'chemo',
    cautions: [{ text: 'In early breast cancer, adjuvant capecitabine is established for residual disease after neoadjuvant chemotherapy in HER2-negative tumours — not as first-line therapy.', source: 'CREATE_X_NEJM_2017' },
               { text: 'Hand-foot syndrome is the typical dose-limiting toxicity.', source: 'CAPECITABINE_HFS_JOPP_2006' },
               { text: 'Dose adjustment required with reduced renal function.', source: 'XELODA_EMA_SMPC' }],
    risk: { title: 'Hand-foot syndrome', severity: 'moderate', description: 'Common under capecitabine; dose reduction is often needed.' },
  },
  PACLITAXEL: {
    phrase: 'single-agent taxane chemotherapy',
    openIssue: 'the cumulative neuropathy risk',
    klasse: 'chemo',
    cautions: [{ text: 'Cumulative peripheral neuropathy limits duration of therapy.', source: 'EBCTCG_POLYCHEMOTHERAPY_LANCET_2012' },
               { text: 'Hypersensitivity reactions require premedication.' }],
    risk: { title: 'Peripheral neuropathy', severity: 'moderate', description: 'Taxane-induced neuropathy is cumulative and often only partially reversible.' },
  },
  'CYCLOPHOSPHAMIDE + DOXORUBICIN': {
    phrase: 'anthracycline-based chemotherapy',
    openIssue: 'the missing baseline LVEF',
    cardiotoxic: true,
    klasse: 'chemo',
    cautions: [{ text: 'Anthracyclines are cardiotoxic — cumulative dose tracking is required.', source: 'ESC_CARDIO_ONCOLOGY_2022' },
               { text: 'Expect alopecia and myelosuppression.' }],
    risk: { title: 'Anthracycline cardiotoxicity', severity: 'high', description: 'Doxorubicin carries a dose-dependent risk of cardiomyopathy; document LVEF before starting.' },
  },
  'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE': {
    phrase: 'anthracycline-free combination chemotherapy',
    openIssue: 'its status as an older, less used regimen',
    klasse: 'chemo',
    cautions: [{ text: 'Older regimen, today mostly used when anthracyclines are contraindicated.', source: 'EBCTCG_POLYCHEMOTHERAPY_LANCET_2012' },
               { text: 'Methotrexate requires adequate renal function.' }],
    risk: { title: 'Myelosuppression', severity: 'moderate', description: 'Combination chemotherapy with relevant haematological toxicity.' },
  },
  'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB': {
    phrase: 'dual HER2 blockade combined with a taxane',
    openIssue: 'the missing baseline LVEF',
    cardiotoxic: true,
    treatsHER2: true,
    klasse: 'her2',
    requiresHER2: true,
    cautions: [{ text: 'Dual HER2 blockade requires cardiac monitoring throughout therapy.', source: 'ESC_CARDIO_ONCOLOGY_2022' },
               { text: 'Taxane component adds cumulative neuropathy.', source: 'EBCTCG_POLYCHEMOTHERAPY_LANCET_2012' }],
    risk: { title: 'HER2-directed cardiotoxicity', severity: 'high', description: 'Trastuzumab/pertuzumab can reduce LVEF; echocardiography before start and every 3 months.' },
  },
};

function level(p: number): AiEvidenceSynthesis['uncertaintyLevel'] {
  if (p >= 0.5) return 'low';
  if (p >= 0.2) return 'moderate';
  return 'high';
}

function joinIssues(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

interface CaseFacts {
  hr: boolean;
  her2: boolean;
  nodes: boolean;
  stage: string;
  age: number;
  hasEcog: boolean;
}

/**
 * Der Satz im Unsicherheits-Banner: benennt den stärksten stützenden Befund
 * dieses Falls, das Regime und die zwei gewichtigsten offenen Punkte.
 * Beispiel: "Nodal involvement at Stage 2A supports anthracycline-based
 * chemotherapy, yet the missing baseline LVEF and the untreated HER2 driver
 * still affect certainty."
 */
function certaintySentence(profile: RegimeProfile | undefined, regimeId: string, k: CaseFacts): string {
  const label = getAssessmentTreatmentLabel(regimeId).replace(/\s*\[.*\]$/, '');
  if (!profile) return `${label} cannot be assessed against this patient's recorded profile.`;

  // Offene Punkte, nach Gewicht sortiert — höchstens zwei im Satz.
  const issues: string[] = [];
  if (profile.cardiotoxic) issues.push('the missing baseline LVEF');
  if (k.her2 && !profile.treatsHER2) issues.push('the untreated HER2 driver');
  if (profile.needsMenopausalStatus) issues.push('the undocumented menopausal status');
  if (!issues.includes(profile.openIssue)) issues.push(profile.openIssue);
  if (!k.hasEcog) issues.push('the missing performance status');
  const openText = joinIssues(issues.slice(0, 2));

  // Fehlt die Voraussetzung, trägt der Fall die Wahl nicht.
  const missesHR = profile.requiresHR && !k.hr;
  const missesHER2 = profile.requiresHER2 && !k.her2;
  if (missesHR || missesHER2) {
    const missing = missesHR ? 'Hormone receptor negative disease' : 'HER2 negative disease';
    return `${missing} offers no target for ${profile.phrase}, and ${openText} add to the uncertainty.`;
  }

  // Stärkster stützender Befund zuerst.
  let lead: string;
  if (profile.requiresHER2 && k.her2) lead = 'HER2 positivity';
  else if (profile.requiresHR && k.hr) lead = 'Hormone receptor positivity';
  else if (k.nodes) lead = `Nodal involvement at ${k.stage}`;
  else lead = `${k.stage} disease`;
  if (k.nodes && (profile.requiresHER2 || profile.requiresHR)) lead += ' with nodal involvement';

  return `${lead} supports ${profile.phrase}, yet ${openText} still affect certainty.`;
}

/**
 * Risikoflaggen entstehen aus zwei Quellen: dem Regime selbst (immer gleich)
 * und dem Zusammentreffen von Regime und Patientendaten (fallabhängig).
 * Sortiert nach Schweregrad, damit oben steht, was wirklich blockiert.
 */
function buildRiskFlags(
  profile: RegimeProfile | undefined,
  regimeId: string,
  k: CaseFacts,
  p: number,
  neighborsSame: number,
  neighborsTotal: number,
): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const related = [getAssessmentTreatmentLabel(regimeId).replace(/\s*\[.*\]$/, '')];
  if (!profile) return flags;

  // Fallabhängig: unbehandelter Treiber
  if (k.her2 && !profile.treatsHER2) {
    flags.push({
      id: `${regimeId}-her2-untreated`,
      title: 'HER2 driver not addressed',
      severity: 'high',
      description: `This tumour is HER2-positive, but ${profile.phrase} does not target HER2. Consider whether HER2-directed therapy belongs in the plan.`,
      relatedTreatments: related,
    });
  }

  // Fallabhängig: kardiale Ausgangsmessung fehlt
  if (profile.cardiotoxic) {
    flags.push({
      id: `${regimeId}-lvef`,
      title: 'No cardiac baseline on record',
      severity: 'high',
      description: 'This regimen is cardiotoxic and no baseline LVEF is documented for this patient. Echocardiography should precede the first cycle.',
      relatedTreatments: related,
    });
  }

  // Regimeeigenes Risiko
  if (profile.risk) {
    flags.push({ id: `${regimeId}-risk`, ...profile.risk, relatedTreatments: related });
  }

  // Fallabhängig: Voraussetzung unklar
  if (profile.needsMenopausalStatus) {
    flags.push({
      id: `${regimeId}-menopause`,
      title: 'Menopausal status unknown',
      severity: 'moderate',
      description: `Whether ${profile.phrase} is applicable depends on menopausal status, which is not recorded for this patient.`,
      relatedTreatments: related,
    });
  }

  // Fallabhängig: Nodalbefall ohne zytotoxische Therapie
  if (k.nodes && profile.klasse === 'endocrine') {
    flags.push({
      id: `${regimeId}-nodes-endocrine`,
      title: 'Nodal involvement without cytotoxic therapy',
      severity: 'moderate',
      description: 'Lymph node involvement is documented while the chosen plan is endocrine only. Weigh this against the recurrence risk.',
      relatedTreatments: related,
    });
  }

  // Fallabhängig: Abweichung von Modell und Vergleichsfällen
  if (p < 0.2) {
    flags.push({
      id: `${regimeId}-divergence`,
      title: 'Choice diverges from the model',
      severity: 'moderate',
      description: neighborsTotal && neighborsSame === 0
        ? `The model assigns ${Math.round(p * 100)}% to this regimen, and none of the ${neighborsTotal} most similar registry cases were treated this way.`
        : `The model assigns only ${Math.round(p * 100)}% to this regimen for this patient.`,
      relatedTreatments: related,
    });
  }

  // Fallabhängig: Alter
  if (Number.isFinite(k.age) && k.age >= 70 && profile.klasse !== 'endocrine') {
    flags.push({
      id: `${regimeId}-age`,
      title: 'Reduced tolerance expected',
      severity: 'moderate',
      description: `At ${k.age} years, cytotoxic therapy carries a higher risk of toxicity; dose adjustment may be needed.`,
      relatedTreatments: related,
    });
  }

  const rank = { high: 0, moderate: 1, low: 2 };
  return flags.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

const COHORT_TITLES: Record<string, string> = {
  receptor_stage_nodes: 'Receptor, stage and nodal status matched',
  receptor_stage: 'Receptor status and stage matched',
  receptor: 'Receptor status matched',
};

/** Name des Merkmals, wenn es der Kohorte gerade *fehlt*. */
const CRITERION_NAMES: Record<string, string> = {
  HR: 'Hormone receptor status',
  HER2: 'HER2 status',
  STAGE_HIGHEST_RECORDED: 'Stage',
  LYMPH_NODES: 'Nodal status',
};

const CRITERION_LABELS: Record<string, (v: string) => string> = {
  HR: (v) => `Hormone receptor ${v.toLowerCase() === 'yes' ? 'positive' : 'negative'}`,
  HER2: (v) => `HER2 ${v.toLowerCase() === 'yes' ? 'positive' : 'negative'}`,
  STAGE_HIGHEST_RECORDED: (v) => v,
  LYMPH_NODES: (v) => `Lymph nodes ${v.toLowerCase() === 'yes' ? 'involved' : 'clear'}`,
};

/**
 * Registerkohorten im Schema des Evidenz-Panels: Wie viele vergleichbare
 * Patientinnen gibt es im Trainingsset, was haben sie bekommen, und wie gut
 * passt die Gruppe auf diesen Fall?
 *
 * Anders als eine Studienpopulation ist die Zugehörigkeit hier definiert, nicht
 * geschätzt — dieselben Merkmale, auf denen auch das Modell rechnet.
 */
function buildCohorts(c: StudyCase, regimeId: string): PublishedCohort[] {
  const all = c.cohorts ?? [];
  const chosenLabel = getAssessmentTreatmentLabel(regimeId).replace(/\s*\[.*\]$/, '');
  const allCriteria = ['HR', 'HER2', 'STAGE_HIGHEST_RECORDED', 'LYMPH_NODES'];

  return all.map((co) => {
    const matched = Object.entries(co.criteria).map(([k, v]) => (CRITERION_LABELS[k] ?? ((x: string) => `${k}: ${x}`))(v));
    const missing = allCriteria.filter((k) => !(k in co.criteria));
    const share = co.regime_share[regimeId] ?? 0;
    const topLabel = getAssessmentTreatmentLabel(co.top_regime).replace(/\s*\[.*\]$/, '');

    return {
      cohortName: `MSK CHORD — ${COHORT_TITLES[co.level] ?? co.level} (n = ${co.n_patients})`,
      population: `${co.n_patients} breast cancer patients in the training cohort sharing ${matched.join(', ').toLowerCase()}`,
      similarityLevel: co.level === 'receptor_stage_nodes' ? 'High' : co.level === 'receptor_stage' ? 'Moderate' : 'Partial',
      matchingFactors: matched,
      limitationFactors: [
        ...missing.map((k) => `${CRITERION_NAMES[k] ?? k} not part of this grouping`),
        'First-line practice as recorded, not a randomised comparison',
      ],
      implication: share > 0
        ? `${Math.round(share * 100)}% of this group received ${chosenLabel} as first-line therapy; the most frequent choice was ${topLabel} (${Math.round(co.top_share * 100)}%).`
        : `No patient in this group received ${chosenLabel} as first-line therapy; the most frequent choice was ${topLabel} (${Math.round(co.top_share * 100)}%).`,
      sourceLabel: 'MSK CHORD 2024 — training cohort',
      sourceUrl: 'https://www.cbioportal.org/study/summary?id=msk_chord_2024',
    };
  });
}

type Factor = AiEvidenceSynthesis['keyReasoningFactors'][number];

/**
 * Die Faktorleiste: jedes Merkmal bekommt eine Richtung gegenüber *diesem*
 * Regime. "neutral" nur, wenn das Merkmal für die Wahl wirklich nichts hergibt.
 */
function buildFactors(
  profile: RegimeProfile | undefined,
  k: CaseFacts,
  p: number,
  neighborsSame: number,
  neighborsTotal: number,
): Factor[] {
  const factors: Factor[] = [];

  // Hormonrezeptor
  factors.push({
    factor: `Hormone receptor ${k.hr ? 'positive' : 'negative'}`,
    weight: profile?.requiresHR ? 'high' : 'low',
    direction: profile?.requiresHR ? (k.hr ? 'supports' : 'cautions') : 'neutral',
  });

  // HER2 — bei positivem Status immer relevant: entweder adressiert oder nicht.
  factors.push({
    factor: `HER2 ${k.her2 ? 'positive' : 'negative'}`,
    weight: k.her2 ? 'high' : profile?.requiresHER2 ? 'high' : 'low',
    direction: profile?.treatsHER2
      ? (k.her2 ? 'supports' : 'cautions')
      : k.her2
        ? 'cautions'
        : 'neutral',
  });

  // Nodalstatus
  factors.push({
    factor: `Lymph nodes ${k.nodes ? 'involved' : 'clear'}`,
    weight: 'medium',
    direction: k.nodes && profile?.klasse !== 'endocrine' ? 'supports' : 'neutral',
  });

  // Kardiale Sicherheit, wenn das Regime sie verlangt
  if (profile?.cardiotoxic) {
    factors.push({
      factor: k.hasEcog ? 'Cardiac baseline outstanding' : 'LVEF not documented',
      weight: 'high',
      direction: 'cautions',
    });
  }

  // Was vergleichbare Fälle bekommen haben
  if (neighborsTotal) {
    factors.push({
      factor: `${neighborsSame}/${neighborsTotal} similar cases treated this way`,
      weight: neighborsSame ? 'medium' : 'high',
      direction: neighborsSame ? 'supports' : 'cautions',
    });
  }

  // Das Modell selbst
  factors.push({
    factor: `Model probability ${Math.round(p * 100)}%`,
    weight: 'high',
    direction: p >= 0.5 ? 'supports' : p >= 0.2 ? 'neutral' : 'cautions',
  });

  return factors;
}

export function buildTreatmentEvidence(c: StudyCase, regimeId: string): AiEvidenceSynthesis {
  const f = featureMap(c);
  const profile = PROFILES[regimeId];
  const label = getAssessmentTreatmentLabel(regimeId);
  const hr = (f.HR ?? '').toLowerCase() === 'yes';
  const her2 = (f.HER2 ?? '').toLowerCase() === 'yes';
  const nodes = (f.LYMPH_NODES ?? '').toLowerCase() === 'yes';
  const age = Number(f.CURRENT_AGE_DEID);
  const stage = c.clinical?.stage?.pathological_group
    ? `Stage ${c.clinical.stage.pathological_group}`
    : (f.STAGE_HIGHEST_RECORDED ?? 'unknown stage');

  const p = c.probabilities?.[regimeId] ?? 0;
  const modelTop = c.prediction;
  const percent = Math.round(p * 100);

  const evidenceFor: EvidenceItem[] = [];
  const evidenceAgainst: EvidenceItem[] = [];

  // 1) Rezeptorstatus gegen die Voraussetzungen des Regimes
  if (profile?.requiresHR) {
    (hr ? evidenceFor : evidenceAgainst).push({
      text: hr
        ? 'Hormone receptor positive — the tumour is expected to respond to endocrine therapy.'
        : 'Hormone receptor negative — endocrine therapy has no target in this tumour.',
      source: hr ? 'ESMO_EARLY_BREAST_CANCER_2024' : 'Patient data (HR)',
    });
  }
  if (profile?.requiresHER2) {
    (her2 ? evidenceFor : evidenceAgainst).push({
      text: her2
        ? 'HER2 positive — HER2-directed therapy addresses the driving alteration.'
        : 'HER2 negative — HER2-directed antibodies have no target here.',
      source: her2 ? 'APHINITY_NEJM_2017' : 'Patient data (HER2)',
    });
  }
  // Ein HER2-Treiber, den das gewählte Regime nicht adressiert, ist der
  // gewichtigste Einwand — unabhängig davon, ob endokrin oder Chemo gewählt wurde.
  if (her2 && profile && !profile.treatsHER2) {
    evidenceAgainst.push({
      text: `HER2-positive disease — ${profile.phrase} does not address the driving alteration; HER2-directed therapy is usually part of the plan.`,
      source: 'ESMO_EARLY_BREAST_CANCER_2024',
    });
  }
  if (profile?.klasse === 'chemo' || profile?.klasse === 'her2') {
    if (nodes) {
      evidenceFor.push({ text: 'Lymph node involvement documented — supports systemic cytotoxic therapy.', source: 'Patient data (LYMPH_NODES)' });
    }
    evidenceFor.push({ text: `${stage} — systemic therapy is part of the standard approach at this stage.`, source: 'ESMO_EARLY_BREAST_CANCER_2024' });
  }
  if (profile?.klasse === 'endocrine') {
    evidenceFor.push({
      text: 'Endocrine therapy is oral and outpatient — markedly lower acute toxicity than cytotoxic regimens.',
      source: 'Regimen profile',
    });
    if (Number.isFinite(age) && age < 50 && profile.needsMenopausalStatus) {
      evidenceAgainst.push({
        text: `Age ${age} — premenopausal status is likely; this regimen then requires ovarian suppression.`,
        source: 'Patient data (age)',
      });
    }
    if (Number.isFinite(age) && age >= 55 && regimeId === 'LEUPROLIDE') {
      evidenceAgainst.push({
        text: `Age ${age} — ovarian suppression has little effect after menopause.`,
        source: 'Patient data (age)',
      });
    }
  }
  if (profile?.cardiotoxic) {
    evidenceAgainst.push({
      text: 'No baseline LVEF on record — cardiac function should be documented before a cardiotoxic regimen.',
      source: 'ESC_CARDIO_ONCOLOGY_2022',
    });
  }

  // Was haben vergleichbare Registerfälle tatsächlich bekommen?
  const neighbors = c.similar_cases ?? [];
  if (neighbors.length) {
    const same = neighbors.filter((n) => n.regime === regimeId).length;
    if (same > 0) {
      evidenceFor.push({
        text: `${same} of the ${neighbors.length} most similar registry cases received this regimen as first-line therapy.`,
        source: 'MSK_CHORD_2024',
      });
    } else {
      evidenceAgainst.push({
        text: `None of the ${neighbors.length} most similar registry cases received this regimen; they were treated with ${[...new Set(neighbors.map((n) => getAssessmentTreatmentLabel(n.regime).replace(/\s*\[.*\]$/, '')))].join(', ')}.`,
        source: 'MSK_CHORD_2024',
      });
    }
  }

  // 2) Regimespezifische Vorbehalte
  for (const caution of profile?.cautions ?? []) {
    evidenceAgainst.push({ text: caution.text, source: caution.source ?? 'Regimen profile' });
  }

  // 3) Das Modell als eigene Stimme — nicht als Wahrheit
  evidenceFor.push({
    text: `The model assigns ${percent}% probability to this regimen for this patient.`,
    source: 'MSK_CHORD_2024',
  });
  if (modelTop && modelTop !== regimeId) {
    evidenceAgainst.push({
      text: `The model's own top choice is ${getAssessmentTreatmentLabel(modelTop)} (${c.confidence_percent ?? '—'}%).`,
      source: 'MSK_CHORD_2024',
    });
  }

  // Dieselbe Quelle wie die Patientenübersicht, ergänzt um das gewählte Regime.
  const missingDetails = buildMissingData({
    hr,
    her2,
    nodes,
    hasEcog: Boolean(c.clinical?.ecog),
    cardiotoxicChoice: profile?.cardiotoxic,
    endocrineChoice: profile?.klasse === 'endocrine',
  });
  const missingData = missingDetails.map((m) => m.item);

  const riskFlags = buildRiskFlags(
    profile,
    regimeId,
    { hr, her2, nodes, stage, age, hasEcog: Boolean(c.clinical?.ecog) },
    p,
    neighbors.filter((n) => n.regime === regimeId).length,
    neighbors.length,
  );

  // Unsicherheit bezieht sich auf die Wahl des Arztes: je höher die
  // Modellwahrscheinlichkeit für dieses Regime, desto geringer die Unsicherheit.
  const uncertaintyLevel = level(p);
  const uncertaintyDescription = certaintySentence(profile, regimeId, {
    hr,
    her2,
    nodes,
    stage,
    age,
    hasEcog: Boolean(c.clinical?.ecog),
  });

  return {
    title: `Evidence for ${label}`,
    disclaimer:
      'Generated from this patient\'s recorded data and a model trained on MSK CHORD. Decision support only — not a treatment recommendation.',
    uncertaintyLevel,
    uncertaintySummary: `Model probability for your choice: ${percent}%`,
    uncertaintyDescription,
    evidenceFor,
    evidenceAgainst,
    missingData,
    missingDataDetails: missingDetails,
    riskFlags,
    publishedCohorts: buildCohorts(c, regimeId),
    sources: [
      {
        title: 'MSK-CHORD 2024 — clinico-genomic cohort underlying the model and the comparison groups',
        year: 2024,
        type: 'Dataset',
        url: 'https://www.cbioportal.org/study/summary?id=msk_chord_2024',
      },
    ],
    keyReasoningFactors: buildFactors(profile, { hr, her2, nodes, stage, age, hasEcog: Boolean(c.clinical?.ecog) }, p, neighbors.filter((n) => n.regime === regimeId).length, neighbors.length),
  };
}
