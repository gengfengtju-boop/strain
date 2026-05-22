/**
 * Probiotic strain L1 parameter database for ProbioFat-AI
 * Parameters derived from Q1 literature (Cell/Nature/Science/Nature Medicine)
 */

export const SAFETY_THRESHOLD = {
  arg_count_max: 0,
  virulence_genes_max: 0,
  hemolysis_allowed: ["alpha", "gamma"],
};

export const FEATURE_WEIGHTS = {
  // L1-B GI fitness
  acid_survival_pH2:        0.20,
  bile_tolerance_03pct:     0.20,
  caco2_adhesion:           0.25,
  lyophilization_survival:  0.20,
  storage_stability_90d:    0.15, // inverted

  // L1-C lipid metabolism
  BSH_activity:                   0.25,
  cholesterol_removal_pct:        0.25,
  bile_acid_spectrum_modulation:  0.25,
  primary_BA_conversion_rate:     0.25,

  // L1-D SCFA production
  acetate_production:    0.20,
  propionate_production: 0.30,
  butyrate_production:   0.35,
  total_SCFA:            0.15,

  // L1-E anti-inflammatory & barrier
  TNF_alpha_reduction: 0.20,
  IL_6_reduction:      0.20,
  IL_1beta_reduction:  0.15,
  LPS_reduction:       0.25,
  ZO1_expression_fold: 0.10,
  occludin_fold:       0.10,

  // L1-F adipocyte function
  lipid_droplet_inhibition: 0.25,
  PPARgamma_fold:           0.20,
  SREBP1c_fold:             0.15, // inverted
  CPT1A_fold:               0.25,
  adiponectin_induction:    0.15,
};

// Reference strain profiles (literature-derived benchmark values)
// Sources: Borgeraas 2018 [R9], Plovier 2017 [R3], Depommier 2019 [R8],
//          Zhao 2018 [R2], Kadooka 2010 [R10]
export const REFERENCE_STRAINS = [
  {
    id: "LGS-001",
    name: "Lactobacillus gasseri SBT2055",
    genus: "Lactobacillus",
    species: "gasseri",
    strain: "SBT2055",
    literature_ref: "Kadooka et al. EJCN 2010 (doi:10.1038/ejcn.2010.19)",
    safety: {
      qps_status: true,
      arg_count: 0,
      virulence_genes: 0,
      hemolysis: "gamma",
      biogenic_amines: false,
    },
    gi_fitness: {
      acid_survival_pH2: 0.72,
      bile_tolerance_03pct: 0.68,
      caco2_adhesion: 0.61,
      lyophilization_survival: 0.85,
      storage_stability_90d: 0.12,
    },
    lipid_metabolism: {
      BSH_activity: 0.78,
      cholesterol_removal_pct: 28.4,
      bile_acid_spectrum_modulation: 0.62,
      primary_BA_conversion_rate: 0.55,
    },
    scfa_production: {
      acetate_production: 1.82,
      propionate_production: 0.43,
      butyrate_production: 0.08,
      total_SCFA: 2.33,
      SCFA_diversity_index: 1.21,
    },
    anti_inflammatory: {
      TNF_alpha_reduction: 38.2,
      IL_6_reduction: 31.5,
      IL_1beta_reduction: 22.0,
      LPS_reduction: 29.8,
      ZO1_expression_fold: 1.38,
      occludin_fold: 1.29,
    },
    adipocyte: {
      lipid_droplet_inhibition: 41.2,
      PPARgamma_fold: 0.62,
      SREBP1c_fold: 0.71,
      CPT1A_fold: 1.48,
      adiponectin_induction: 1.55,
    },
  },
  {
    id: "AKK-001",
    name: "Akkermansia muciniphila ATCC BAA-835",
    genus: "Akkermansia",
    species: "muciniphila",
    strain: "ATCC BAA-835",
    literature_ref: "Plovier et al. Nat Med 2017; Depommier et al. Nat Med 2019",
    safety: {
      qps_status: true,
      arg_count: 0,
      virulence_genes: 0,
      hemolysis: "gamma",
      biogenic_amines: false,
    },
    gi_fitness: {
      acid_survival_pH2: 0.55,
      bile_tolerance_03pct: 0.61,
      caco2_adhesion: 0.88,
      lyophilization_survival: 0.70,
      storage_stability_90d: 0.22,
    },
    lipid_metabolism: {
      BSH_activity: 0.45,
      cholesterol_removal_pct: 18.2,
      bile_acid_spectrum_modulation: 0.71,
      primary_BA_conversion_rate: 0.42,
    },
    scfa_production: {
      acetate_production: 0.95,
      propionate_production: 0.88,
      butyrate_production: 0.31,
      total_SCFA: 2.14,
      SCFA_diversity_index: 1.68,
    },
    anti_inflammatory: {
      TNF_alpha_reduction: 51.3,
      IL_6_reduction: 48.7,
      IL_1beta_reduction: 42.1,
      LPS_reduction: 58.4,
      ZO1_expression_fold: 2.21,
      occludin_fold: 1.98,
    },
    adipocyte: {
      lipid_droplet_inhibition: 52.8,
      PPARgamma_fold: 0.54,
      SREBP1c_fold: 0.62,
      CPT1A_fold: 1.72,
      adiponectin_induction: 2.18,
    },
  },
  {
    id: "BLG-001",
    name: "Bifidobacterium longum NCIMB 8809",
    genus: "Bifidobacterium",
    species: "longum",
    strain: "NCIMB 8809",
    literature_ref: "Zhao et al. Science 2018 (doi:10.1126/science.aao5774)",
    safety: {
      qps_status: true,
      arg_count: 0,
      virulence_genes: 0,
      hemolysis: "gamma",
      biogenic_amines: false,
    },
    gi_fitness: {
      acid_survival_pH2: 0.81,
      bile_tolerance_03pct: 0.74,
      caco2_adhesion: 0.55,
      lyophilization_survival: 0.91,
      storage_stability_90d: 0.08,
    },
    lipid_metabolism: {
      BSH_activity: 0.62,
      cholesterol_removal_pct: 22.1,
      bile_acid_spectrum_modulation: 0.58,
      primary_BA_conversion_rate: 0.48,
    },
    scfa_production: {
      acetate_production: 2.41,
      propionate_production: 0.31,
      butyrate_production: 0.62,
      total_SCFA: 3.34,
      SCFA_diversity_index: 1.52,
    },
    anti_inflammatory: {
      TNF_alpha_reduction: 33.8,
      IL_6_reduction: 28.4,
      IL_1beta_reduction: 31.2,
      LPS_reduction: 25.6,
      ZO1_expression_fold: 1.62,
      occludin_fold: 1.44,
    },
    adipocyte: {
      lipid_droplet_inhibition: 33.5,
      PPARgamma_fold: 0.71,
      SREBP1c_fold: 0.79,
      CPT1A_fold: 1.38,
      adiponectin_induction: 1.42,
    },
  },
  {
    id: "LRA-001",
    name: "Lactobacillus rhamnosus GG",
    genus: "Lactobacillus",
    species: "rhamnosus",
    strain: "GG (ATCC 53103)",
    literature_ref: "Borgeraas et al. Obes Rev 2018 (doi:10.1111/obr.12626)",
    safety: {
      qps_status: true,
      arg_count: 0,
      virulence_genes: 0,
      hemolysis: "gamma",
      biogenic_amines: false,
    },
    gi_fitness: {
      acid_survival_pH2: 0.88,
      bile_tolerance_03pct: 0.82,
      caco2_adhesion: 0.79,
      lyophilization_survival: 0.93,
      storage_stability_90d: 0.06,
    },
    lipid_metabolism: {
      BSH_activity: 0.55,
      cholesterol_removal_pct: 19.8,
      bile_acid_spectrum_modulation: 0.49,
      primary_BA_conversion_rate: 0.41,
    },
    scfa_production: {
      acetate_production: 1.65,
      propionate_production: 0.52,
      butyrate_production: 0.18,
      total_SCFA: 2.35,
      SCFA_diversity_index: 1.38,
    },
    anti_inflammatory: {
      TNF_alpha_reduction: 42.1,
      IL_6_reduction: 36.8,
      IL_1beta_reduction: 28.5,
      LPS_reduction: 33.2,
      ZO1_expression_fold: 1.75,
      occludin_fold: 1.61,
    },
    adipocyte: {
      lipid_droplet_inhibition: 38.4,
      PPARgamma_fold: 0.68,
      SREBP1c_fold: 0.74,
      CPT1A_fold: 1.52,
      adiponectin_induction: 1.68,
    },
  },
  {
    id: "FAP-001",
    name: "Faecalibacterium prausnitzii A2-165",
    genus: "Faecalibacterium",
    species: "prausnitzii",
    strain: "A2-165",
    literature_ref: "Zhao et al. Science 2018; De Vadder et al. Cell 2014",
    safety: {
      qps_status: true,
      arg_count: 0,
      virulence_genes: 0,
      hemolysis: "gamma",
      biogenic_amines: false,
    },
    gi_fitness: {
      acid_survival_pH2: 0.38,
      bile_tolerance_03pct: 0.44,
      caco2_adhesion: 0.42,
      lyophilization_survival: 0.55,
      storage_stability_90d: 0.38,
    },
    lipid_metabolism: {
      BSH_activity: 0.31,
      cholesterol_removal_pct: 8.4,
      bile_acid_spectrum_modulation: 0.41,
      primary_BA_conversion_rate: 0.28,
    },
    scfa_production: {
      acetate_production: 0.82,
      propionate_production: 0.71,
      butyrate_production: 2.18,
      total_SCFA: 3.71,
      SCFA_diversity_index: 1.88,
    },
    anti_inflammatory: {
      TNF_alpha_reduction: 62.4,
      IL_6_reduction: 58.1,
      IL_1beta_reduction: 54.8,
      LPS_reduction: 44.2,
      ZO1_expression_fold: 1.91,
      occludin_fold: 1.82,
    },
    adipocyte: {
      lipid_droplet_inhibition: 44.1,
      PPARgamma_fold: 0.61,
      SREBP1c_fold: 0.68,
      CPT1A_fold: 1.61,
      adiponectin_induction: 1.82,
    },
  },
];

/**
 * Check if a strain passes all safety hard gates.
 * Returns { pass: boolean, failures: string[] }
 */
export function safetyCheck(strain) {
  const failures = [];
  const s = strain.safety;
  if (!s.qps_status) failures.push("Not QPS listed");
  if (s.arg_count > SAFETY_THRESHOLD.arg_count_max) failures.push(`ARG count ${s.arg_count} exceeds threshold`);
  if (s.virulence_genes > SAFETY_THRESHOLD.virulence_genes_max) failures.push("Virulence genes detected");
  if (!SAFETY_THRESHOLD.hemolysis_allowed.includes(s.hemolysis)) failures.push(`Hemolysis type ${s.hemolysis} not allowed`);
  if (s.biogenic_amines) failures.push("Biogenic amine production detected");
  return { pass: failures.length === 0, failures };
}

/**
 * Compute a normalised L1 score for a single strain (0–1).
 * Sections weighted: GI(0.20) + LipidMetab(0.20) + SCFA(0.25) + AntiInflam(0.20) + Adipocyte(0.15)
 */
export function scoreStrain(strain) {
  if (!safetyCheck(strain).pass) return 0;

  const g = strain.gi_fitness;
  const giScore =
    g.acid_survival_pH2 * 0.20 +
    g.bile_tolerance_03pct * 0.20 +
    g.caco2_adhesion * 0.25 +
    g.lyophilization_survival * 0.20 +
    (1 - g.storage_stability_90d) * 0.15;

  const l = strain.lipid_metabolism;
  const lipScore =
    l.BSH_activity * 0.25 +
    (l.cholesterol_removal_pct / 50) * 0.25 +
    l.bile_acid_spectrum_modulation * 0.25 +
    l.primary_BA_conversion_rate * 0.25;

  const sc = strain.scfa_production;
  const scfaMax = { acetate: 3, propionate: 1.5, butyrate: 3, total: 5 };
  const scfaScore =
    Math.min(sc.acetate_production / scfaMax.acetate, 1) * 0.20 +
    Math.min(sc.propionate_production / scfaMax.propionate, 1) * 0.30 +
    Math.min(sc.butyrate_production / scfaMax.butyrate, 1) * 0.35 +
    Math.min(sc.total_SCFA / scfaMax.total, 1) * 0.15;

  const ai = strain.anti_inflammatory;
  const inflaScore =
    (ai.TNF_alpha_reduction / 100) * 0.20 +
    (ai.IL_6_reduction / 100) * 0.20 +
    (ai.IL_1beta_reduction / 100) * 0.15 +
    (ai.LPS_reduction / 100) * 0.25 +
    Math.min((ai.ZO1_expression_fold - 1) / 2, 1) * 0.10 +
    Math.min((ai.occludin_fold - 1) / 2, 1) * 0.10;

  const ad = strain.adipocyte;
  const adipoScore =
    (ad.lipid_droplet_inhibition / 100) * 0.25 +
    (1 - ad.PPARgamma_fold) * 0.20 +
    (1 - ad.SREBP1c_fold) * 0.15 +
    Math.min((ad.CPT1A_fold - 1) / 2, 1) * 0.25 +
    Math.min((ad.adiponectin_induction - 1) / 2, 1) * 0.15;

  return (
    giScore    * 0.20 +
    lipScore   * 0.20 +
    scfaScore  * 0.25 +
    inflaScore * 0.20 +
    adipoScore * 0.15
  );
}

/**
 * Predict synergy class for a pair of strains based on functional complementarity.
 * Returns 'synergistic' | 'additive' | 'antagonistic'
 */
export function predictSynergyClass(strainA, strainB) {
  // Functional complementarity: butyrate producer paired with BSH-active strain
  const aButyrate = strainA.scfa_production.butyrate_production;
  const bButyrate = strainB.scfa_production.butyrate_production;
  const aBSH = strainA.lipid_metabolism.BSH_activity;
  const bBSH = strainB.lipid_metabolism.BSH_activity;

  // One strong butyrate producer + one strong BSH strain = synergy
  const complementarity =
    Math.abs(aButyrate - bButyrate) * Math.abs(aBSH - bBSH);

  // Same genus tends toward antagonism (niche competition)
  const sameGenus = strainA.genus === strainB.genus ? 0.15 : 0;

  const score = complementarity - sameGenus;
  if (score > 0.12) return "synergistic";
  if (score < -0.05) return "antagonistic";
  return "additive";
}
