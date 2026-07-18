export interface KPRule {
  id: string;
  name: string;
  description: string;
  inputs_required: string[];
  conditions: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  priority: number; // 1 (Highest) to 5 (Lowest)
  exceptions: string[];
  type: "Natal" | "Transit";
  output: {
    category: "Marriage" | "Career" | "Finance" | "Health" | "DBA" | "Ruling_Planets" | "General";
    significance: "Positive" | "Negative" | "Neutral" | "Highly_Auspicious" | "Caution";
    interpretation_template: string;
  };
}

export const KPRulebook: KPRule[] = [
  {
    id: "KP_MAR_01",
    name: "Cuspal Sub Lord of 7th House for Marriage Timing",
    description: "Evaluates the 7th house Cuspal Sub Lord (CSL) to determine if it signifies the houses of marriage (2, 7, 11) through its Star Lord, indicating whether and when marriage is promised.",
    inputs_required: [
      "KP.cusps.House_7.sub_lord",
      "KP.planets[7th_CSL].star_lord",
      "KP.planets[7th_CSL_Star_Lord].ownership",
      "KP.planets[7th_CSL_Star_Lord].occupation"
    ],
    conditions: "The 7th Cuspal Sub Lord's Star Lord must be a significator of House 2 (family extension), House 7 (spouse/partner), or House 11 (fulfillment of desires).",
    supporting_evidence: [
      "7th CSL is Venus or Jupiter (natural significators of marriage/spouse).",
      "7th CSL is placed in the 11th or 2nd house.",
      "The Star Lord of the 7th CSL is strongly positioned without negative aspects."
    ],
    contradicting_evidence: [
      "7th CSL's Star Lord signifies the 1st, 6th, or 10th houses (separation, dispute, or non-desire).",
      "7th CSL's Star Lord is retrograde.",
      "7th CSL is connected to Rahu or Ketu in adverse positions."
    ],
    priority: 1,
    exceptions: [
      "If the Star Lord signifies 6 and 10, but the Sub Lord of the 7th CSL is Jupiter/Venus and is connected to 11, marriage happens but with delay or initial hurdles."
    ],
    type: "Natal",
    output: {
      category: "Marriage",
      significance: "Positive",
      interpretation_template: "The 7th Cuspal Sub Lord ({csl}) in star of {starLord} strongly signifies houses 2, 7, and 11. This indicates a high promise of marriage and harmonious partnership, likely triggered during the DBA of {csl} or {starLord}."
    }
  },
  {
    id: "KP_CAR_01",
    name: "10th Cuspal Sub Lord for Career and Profession Sector",
    description: "Analyzes the 10th Cuspal Sub Lord (CSL) to decide the profession category, success levels, and job/business inclination based on its connections with 2, 6, 10, and 11.",
    inputs_required: [
      "KP.cusps.House_10.sub_lord",
      "KP.planets[10th_CSL].star_lord",
      "KP.planets[10th_CSL_Star_Lord].ownership",
      "KP.planets[10th_CSL_Star_Lord].occupation"
    ],
    conditions: "The 10th Cuspal Sub Lord's Star Lord must connect to houses 2 (money), 6 (service/employment), 10 (status/fame), or 11 (profits/gains) to promise a strong career path.",
    supporting_evidence: [
      "10th CSL's Star Lord is connected to Sun/Mars (indicates leadership, administration, or technical command).",
      "10th CSL is placed in the 10th or 11th house.",
      "Connection to Jupiter or Mercury indicates business, finance, counseling, or software engineering."
    ],
    contradicting_evidence: [
      "10th CSL's Star Lord signifies 5th, 8th, or 12th houses (loss of job, instability, retirement).",
      "10th CSL's Star Lord is heavily afflicted by Saturn or Rahu."
    ],
    priority: 1,
    exceptions: [
      "If the Star Lord signifies 5 and 8, but connects to 11, it indicates successful research-based profession, occult science, or turnaround consulting."
    ],
    type: "Natal",
    output: {
      category: "Career",
      significance: "Positive",
      interpretation_template: "The 10th Cuspal Sub Lord ({csl}) in star of {starLord} connects with key career houses (2, 6, 10, 11). This promises a successful, stable professional life with excellent status, particularly active during the planetary periods of {csl}."
    }
  },
  {
    id: "KP_FIN_01",
    name: "Financial Status & Wealth Promise via 2nd Cuspal Sub Lord",
    description: "Evaluates the 2nd Cuspal Sub Lord (CSL) to estimate the level of accumulated wealth, bank balance, and financial channels of the native.",
    inputs_required: [
      "KP.cusps.House_2.sub_lord",
      "KP.planets[2nd_CSL].star_lord",
      "KP.planets[2nd_CSL_Star_Lord].ownership",
      "KP.planets[2nd_CSL_Star_Lord].occupation"
    ],
    conditions: "The 2nd CSL's Star Lord must signify houses 2, 6, 10, or 11 to promise solid wealth accrual. Houses 5, 8, and 12 indicate sudden losses or expenditures.",
    supporting_evidence: [
      "2nd CSL is Venus, Jupiter, or Mercury.",
      "Star Lord of 2nd CSL is placed in the 2nd or 11th house.",
      "Dual connection to both 2 and 11 indicates high financial status and multi-source income."
    ],
    contradicting_evidence: [
      "2nd CSL's Star Lord signifies 5, 8, or 12 without any connection to 2 or 11.",
      "2nd CSL is in debilitation or retrograde."
    ],
    priority: 2,
    exceptions: [
      "If the Star Lord is connected to House 8 and House 11, it indicates unexpected windfall, inheritance, or success in lottery and speculative investments."
    ],
    type: "Natal",
    output: {
      category: "Finance",
      significance: "Positive",
      interpretation_template: "The 2nd Cuspal Sub Lord ({csl}) in the star of {starLord} confirms a strong financial promise. Excellent capacity for wealth accumulation and multiple active income streams, particularly during the DBA of {csl}."
    }
  },
  {
    id: "KP_HEA_01",
    name: "Health and Disease Propensity",
    description: "Uses the 1st (Ascendant) and 6th Cuspal Sub Lords to determine physical strength, resistance to illness, and potential diseases.",
    inputs_required: [
      "KP.cusps.House_1.sub_lord",
      "KP.cusps.House_6.sub_lord",
      "KP.planets[6th_CSL].star_lord"
    ],
    conditions: "If the 6th CSL's Star Lord signifies houses 6, 8, or 12, it indicates propensity to disease. If the 1st CSL signifies houses 1, 5, or 11, it indicates strong immunity and recovery.",
    supporting_evidence: [
      "6th CSL is connected to Saturn (chronic diseases) or Mars (accidents, surgeries).",
      "Ascendant CSL connects strongly to Sun or Jupiter in beneficial houses."
    ],
    contradicting_evidence: [
      "6th CSL connects strongly to 1, 5, or 11 (diseases are easily cured and non-severe)."
    ],
    priority: 3,
    exceptions: [
      "Even if 6th CSL connects to 6, 8, 12, the presence of strong Jupiter or Sun aspects on the ascendant CSL mitigates chronic outcomes."
    ],
    type: "Natal",
    output: {
      category: "Health",
      significance: "Caution",
      interpretation_template: "The 6th Cuspal Sub Lord ({csl}) signifies disease-prone houses (6, 8, 12). While the physical constitution is protected by {asc_csl}, precaution is advised during the Bhukti or Antara of {csl} to avoid acute fatigue or minor injuries."
    }
  },
  {
    id: "KP_DBA_01",
    name: "Dasha-Bhukti-Antara (DBA) Event Trigger",
    description: "Validates if the active DBA lords signify the required house groupings to trigger a major life event (e.g., marriage, career shift, financial gain).",
    inputs_required: [
      "KP.dba.mahadasha",
      "KP.dba.bhukti",
      "KP.dba.antara",
      "KP.planet_significators"
    ],
    conditions: "For any major positive event to manifest, the active Bhukti and Antara lords must signify the event's relevant houses (e.g., 2, 7, 11 for marriage; 2, 6, 10, 11 for career promotion).",
    supporting_evidence: [
      "Active Bhukti Lord is the Star Lord of the Cuspal Sub Lord of the event's house.",
      "Dasha Lord is neutral or positive, and Bhukti Lord is extremely strong."
    ],
    contradicting_evidence: [
      "Both Bhukti and Antara Lords signify negative house combinations (e.g., 1, 6, 10 for marriage; 5, 8, 12 for career)."
    ],
    priority: 1,
    exceptions: [
      "If the Mahadasha is extremely negative but the current Bhukti Lord is a strong natural benefic signifying 11, the event occurs but requires immense effort."
    ],
    type: "Natal",
    output: {
      category: "DBA",
      significance: "Positive",
      interpretation_template: "The current active Bhukti ({bhukti}) and Antara ({antara}) are strong significators of the query's houses. This indicates that the promised event is highly ripe for manifestation in this timeframe."
    }
  },
  {
    id: "KP_RUL_01",
    name: "Ruling Planets (RP) Validation for Horary or Query Time",
    description: "Applies the Krishnamurti Paddhati Ruling Planets principle (Ascendant Sign & Star Lords, Moon Sign & Star Lords, Day Lord) to double-confirm event timing and query authenticity.",
    inputs_required: [
      "KP.ruling_planets.ascendant_sign_lord",
      "KP.ruling_planets.ascendant_star_lord",
      "KP.ruling_planets.moon_sign_lord",
      "KP.ruling_planets.moon_star_lord",
      "KP.ruling_planets.day_lord"
    ],
    conditions: "The Ruling Planets calculated at the query time must agree with the natal or horary significators to promise immediate fulfillment of the event.",
    supporting_evidence: [
      "The active DBA lords are present among the five prime Ruling Planets.",
      "The day lord is a strong, direct (non-retrograde) planet."
    ],
    contradicting_evidence: [
      "Key Ruling Planets are retrograde, indicating delays, changes, or cancellation of the query."
    ],
    priority: 2,
    exceptions: [
      "Rahu and Ketu can represent nodes of the Ruling Planets, taking over the role of any planet they aspect or whose sign they occupy."
    ],
    type: "Transit",
    output: {
      category: "Ruling_Planets",
      significance: "Positive",
      interpretation_template: "The Ruling Planets ({asc_sign_lord}, {asc_star_lord}, {moon_sign_lord}, {moon_star_lord}, {day_lord}) confirm high alignment. This guarantees that your query is genuine and the event's timing is highly precise."
    }
  }
];
