import type { AiEvidenceSynthesis, EvidenceItem, RiskFlag, StudyCase } from '../types';
import { getAssessmentTreatmentLabel } from '../data/mockData';
import { featureMap } from './patientView';

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
  /** Regimespezifische Vorbehalte, unabhängig vom Fall */
  cautions: string[];
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
    cautions: ['Aromatase inhibitors require postmenopausal status or ovarian suppression.',
               'Bone density loss and arthralgia are common under prolonged use.'],
    risk: { title: 'Bone density loss', severity: 'moderate', description: 'Aromatase inhibition lowers estrogen further; baseline DXA and calcium/vitamin D are advisable.' },
  },
  LETROZOLE: {
    phrase: 'aromatase inhibition',
    openIssue: 'the undocumented menopausal status',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: ['Aromatase inhibitors require postmenopausal status or ovarian suppression.',
               'Bone density loss and arthralgia are common under prolonged use.'],
    risk: { title: 'Bone density loss', severity: 'moderate', description: 'Aromatase inhibition lowers estrogen further; baseline DXA and calcium/vitamin D are advisable.' },
  },
  'LETROZOLE + PALBOCICLIB': {
    phrase: 'endocrine therapy combined with CDK4/6 inhibition',
    openIssue: 'the evidence base anchored in advanced disease',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: ['CDK4/6 inhibition requires regular blood counts — neutropenia is the dose-limiting toxicity.',
               'Established primarily in the advanced/metastatic setting.'],
    risk: { title: 'Neutropenia', severity: 'moderate', description: 'Palbociclib causes dose-limiting neutropenia; blood counts on day 15 of the first cycles.' },
  },
  TAMOXIFEN: {
    phrase: 'endocrine blockade with a SERM',
    openIssue: 'the thromboembolic risk profile',
    klasse: 'endocrine',
    requiresHR: true,
    cautions: ['Thromboembolic risk and endometrial changes require monitoring.',
               'Usable regardless of menopausal status.'],
    risk: { title: 'Thromboembolic events', severity: 'moderate', description: 'Tamoxifen raises the risk of venous thromboembolism and endometrial hyperplasia.' },
  },
  LEUPROLIDE: {
    phrase: 'ovarian suppression',
    openIssue: 'the unusual use as sole endocrine therapy',
    needsMenopausalStatus: true,
    klasse: 'endocrine',
    requiresHR: true,
    cautions: ['Ovarian suppression alone is rarely first-line — it is usually combined with tamoxifen or an aromatase inhibitor.',
               'Only meaningful in premenopausal patients.'],
    risk: { title: 'Monotherapy unusual', severity: 'moderate', description: 'GnRH agonists suppress ovarian function but are not normally given as sole endocrine therapy.' },
  },
  CAPECITABINE: {
    phrase: 'oral fluoropyrimidine chemotherapy',
    openIssue: 'its usual place in later treatment lines',
    klasse: 'chemo',
    cautions: ['Hand-foot syndrome is the typical dose-limiting toxicity.',
               'Dose adjustment required with reduced renal function.'],
    risk: { title: 'Hand-foot syndrome', severity: 'moderate', description: 'Common under capecitabine; dose reduction is often needed.' },
  },
  PACLITAXEL: {
    phrase: 'single-agent taxane chemotherapy',
    openIssue: 'the cumulative neuropathy risk',
    klasse: 'chemo',
    cautions: ['Cumulative peripheral neuropathy limits duration of therapy.',
               'Hypersensitivity reactions require premedication.'],
    risk: { title: 'Peripheral neuropathy', severity: 'moderate', description: 'Taxane-induced neuropathy is cumulative and often only partially reversible.' },
  },
  'CYCLOPHOSPHAMIDE + DOXORUBICIN': {
    phrase: 'anthracycline-based chemotherapy',
    openIssue: 'the missing baseline LVEF',
    cardiotoxic: true,
    klasse: 'chemo',
    cautions: ['Anthracyclines are cardiotoxic — baseline LVEF and cumulative dose tracking are required.',
               'Expect alopecia and myelosuppression.'],
    risk: { title: 'Anthracycline cardiotoxicity', severity: 'high', description: 'Doxorubicin carries a dose-dependent risk of cardiomyopathy; document LVEF before starting.' },
  },
  'CYCLOPHOSPHAMIDE + FLUOROURACIL + METHOTREXATE': {
    phrase: 'anthracycline-free combination chemotherapy',
    openIssue: 'its status as an older, less used regimen',
    klasse: 'chemo',
    cautions: ['Older regimen, today mostly used when anthracyclines are contraindicated.',
               'Methotrexate requires adequate renal function.'],
    risk: { title: 'Myelosuppression', severity: 'moderate', description: 'Combination chemotherapy with relevant haematological toxicity.' },
  },
  'PACLITAXEL + PERTUZUMAB + TRASTUZUMAB': {
    phrase: 'dual HER2 blockade combined with a taxane',
    openIssue: 'the missing baseline LVEF',
    cardiotoxic: true,
    treatsHER2: true,
    klasse: 'her2',
    requiresHER2: true,
    cautions: ['Dual HER2 blockade requires cardiac monitoring (LVEF before and during therapy).',
               'Taxane component adds cumulative neuropathy.'],
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
      source: 'Patient data (HR)',
    });
  }
  if (profile?.requiresHER2) {
    (her2 ? evidenceFor : evidenceAgainst).push({
      text: her2
        ? 'HER2 positive — HER2-directed therapy addresses the driving alteration.'
        : 'HER2 negative — HER2-directed antibodies have no target here.',
      source: 'Patient data (HER2)',
    });
  }
  if (her2 && profile?.klasse === 'endocrine') {
    evidenceAgainst.push({
      text: 'HER2-positive disease is usually treated with HER2-directed therapy; endocrine therapy alone leaves the driver untreated.',
      source: 'Patient data (HER2)',
    });
  }
  if (profile?.klasse === 'chemo' || profile?.klasse === 'her2') {
    if (nodes) {
      evidenceFor.push({ text: 'Lymph node involvement documented — supports systemic cytotoxic therapy.', source: 'Patient data (LYMPH_NODES)' });
    }
    evidenceFor.push({ text: `${stage} — systemic therapy is part of the standard approach at this stage.`, source: 'Registry staging' });
  }
  if (profile?.klasse === 'endocrine' && Number.isFinite(age) && age < 50) {
    evidenceAgainst.push({
      text: `Age ${age} — premenopausal status is likely; aromatase inhibitors then require ovarian suppression.`,
      source: 'Patient data (age)',
    });
  }

  // 2) Regimespezifische Vorbehalte
  for (const caution of profile?.cautions ?? []) {
    evidenceAgainst.push({ text: caution, source: 'Regimen profile' });
  }

  // 3) Das Modell als eigene Stimme — nicht als Wahrheit
  evidenceFor.push({
    text: `The model assigns ${percent}% probability to this regimen for this patient.`,
    source: 'Random forest (MSK CHORD)',
  });
  if (modelTop && modelTop !== regimeId) {
    evidenceAgainst.push({
      text: `The model's own top choice is ${getAssessmentTreatmentLabel(modelTop)} (${c.confidence_percent ?? '—'}%).`,
      source: 'Random forest (MSK CHORD)',
    });
  }

  const missingData = ['Menopausal status not recorded in the dataset', 'Ki-67 proliferation index not available'];
  if (profile?.klasse === 'her2' || regimeId.includes('DOXORUBICIN')) {
    missingData.unshift('Baseline LVEF not documented — required before cardiotoxic therapy');
  }
  if (!c.clinical?.ecog) missingData.push('No ECOG performance status recorded before treatment start');

  const riskFlags: RiskFlag[] = profile?.risk
    ? [{ id: `${regimeId}-risk`, ...profile.risk, relatedTreatments: [regimeId] }]
    : [];

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
    riskFlags,
    publishedCohorts: [],
    sources: [
      {
        title: 'MSK CHORD (Memorial Sloan Kettering, 2024) — cohort underlying the model',
        year: 2024,
        type: 'Dataset',
        url: 'https://www.cbioportal.org/study/summary?id=msk_chord_2024',
      },
    ],
    keyReasoningFactors: [
      { factor: `Hormone receptor ${hr ? 'positive' : 'negative'}`, weight: 'high', direction: profile?.requiresHR ? (hr ? 'supports' : 'cautions') : 'neutral' },
      { factor: `HER2 ${her2 ? 'positive' : 'negative'}`, weight: 'high', direction: profile?.requiresHER2 ? (her2 ? 'supports' : 'cautions') : her2 && profile?.klasse === 'endocrine' ? 'cautions' : 'neutral' },
      { factor: `Lymph nodes ${nodes ? 'involved' : 'clear'}`, weight: 'medium', direction: nodes && profile?.klasse !== 'endocrine' ? 'supports' : 'neutral' },
      { factor: stage, weight: 'medium', direction: 'neutral' },
    ],
  };
}
