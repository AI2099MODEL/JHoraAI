/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemDetail {
  id: string;
  name: string;
  philosophy: string;
  relationshipFocus: string;
  advantage: string;
  decisionIdRefs: string[];
}

export interface RuleDetail {
  id: string;
  name: string;
  purpose: string;
  inputsUsed: string;
  supportingEvidence: string;
  contradictingEvidence: string;
  systemId: string;
  decisionIdRefs: string[];
}

export interface PlanetDetail {
  name: string;
  significance: string;
  strengthAspect: string;
  relationshipRole: string;
  ruleIdRefs: string[];
}

export interface HouseDetail {
  number: number;
  name: string;
  significance: string;
  relationshipImpact: string;
  favorablePlanets: string;
  ruleIdRefs: string[];
}

export interface DashaDetail {
  name: string;
  relevance: string;
  relationshipInfluence: string;
  triggerMechanisms: string;
  ruleIdRefs: string[];
}

export interface YogaDetail {
  name: string;
  relevance: string;
  combination: string;
  relationshipOutcome: string;
  ruleIdRefs: string[];
}

export interface DoshaDetail {
  name: string;
  relevance: string;
  cancellationConditions: string;
  impactScale: string;
  ruleIdRefs: string[];
}

export interface RemedyDetail {
  name: string;
  purpose: string;
  reason: string;
  supportingEvidence: string;
  implementation: string;
  decisionIdRefs: string[];
  ruleIdRefs: string[];
}

export const ASTROLOGY_SYSTEMS: SystemDetail[] = [
  {
    id: "KP",
    name: "Krishnamurti Paddhati (KP Stellar)",
    philosophy: "A highly precise stellar system utilizing Placidus equal-house cusps and Sub-Lord nakshatra placements instead of raw sign charts.",
    relationshipFocus: "Focuses on the 7th Cuspal Sub-Lord (CSL). If the CSL signifies the 2nd, 7th, or 11th houses, marriage is promised. Involovement of 1, 6, 10, or 12 house significations indicates delay or denial.",
    advantage: "Provides absolute binary pass/fail logic and dynamic timing triggers via Sub-Lord stellar significations.",
    decisionIdRefs: ["KP_DEC_PROMISE_01", "KP_DEC_DELAY_01", "KP_DEC_DENIAL_01"]
  },
  {
    id: "Vedic",
    name: "Vedic Parashari",
    philosophy: "The foundational classical framework of Indian Astrology utilizing divisional charts (D-1 Rasi, D-9 Navamsha) and planetary aspects.",
    relationshipFocus: "Examines the 7th house lord, 7th house planets, and Venus (for men) or Jupiter (for women). Studies Upapada Lagna and D9 Navamsha strength.",
    advantage: "Examines long-term domestic compatibility, psychological sync, and parental approval indices.",
    decisionIdRefs: ["VED_DEC_PROMISE_01", "VED_DEC_STRENGTH_01", "VED_DEC_NAVAMSHA_01"]
  },
  {
    id: "Jaimini",
    name: "Jaimini Sutras",
    philosophy: "An alternative Vedic methodology centered on functional planetary significators (Karakas) determined by longitudinal degrees rather than lordship.",
    relationshipFocus: "Focuses on the Darakaraka (DK) - the planet with the lowest degree in the chart. Also evaluates the Darapada (A7) and the Jaimini Upapada Lagna.",
    advantage: "Examines the physical features, financial stature, and internal core nature of the spouse.",
    decisionIdRefs: ["JAIM_DEC_DARAKARAKA_01", "JAIM_DEC_UPAPADA_01"]
  },
  {
    id: "Nadi",
    name: "Nadi Astrology",
    philosophy: "An ancient palm-leaf system centered on Jupiter (representing the soul of the male) and Venus (representing the soul of the female).",
    relationshipFocus: "Tracks the direct transit triggers of Jupiter and Saturn over natal planets. Jupiter's aspect or contact triggers union; Saturn's transit restricts or delays.",
    advantage: "Provides excellent, rapid transit timeline checkpoints without needing complex cuspal math.",
    decisionIdRefs: ["NADI_DEC_TRANSIT_01", "NADI_DEC_KARMA_01"]
  },
  {
    id: "Lal Kitab",
    name: "Lal Kitab",
    philosophy: "A unique system of red-book astrology operating with a fixed Aries ascendant chart and specialized planetary 'blindness' rules.",
    relationshipFocus: "Evaluates the blind chart positions of Venus, Saturn, and Mercury. Identifies 'dharmi' charts or 'teva' blocks that obstruct marriage flow.",
    advantage: "Directly relates chart afflictions to immediate domestic and physical remedies.",
    decisionIdRefs: ["LK_DEC_BLIND_CHART_01", "LK_DEC_TEVA_01"]
  },
  {
    id: "Tajik",
    name: "Tajik Solar Cycle",
    philosophy: "An Arabic-origin system that evaluates progress via Varshaphala annual charts based on the sun's exact return degree.",
    relationshipFocus: "Analyses the annual solar return chart for the year corresponding to a specific age. Evaluates Muntha, Year Lord, and Tajik aspects like Ithasala or Esharapha.",
    advantage: "Provides granular, year-by-year activation windows for relationship meetings, engagements, or marriages.",
    decisionIdRefs: ["TAJ_DEC_TIMING_01", "TAJ_DEC_VARSHAPHALA_01"]
  },
  {
    id: "Western",
    name: "Western Synastry",
    philosophy: "A modern Western system analyzing the tropical longitude aspects (conjunctions, trines, squares) between two charts.",
    relationshipFocus: "Examines cross-aspects between Moon-Sun, Venus-Mars, and Ascendant-Descendant lines of the two partners. Tracks planetary composite dynamics.",
    advantage: "Uncovers emotional connection, passion, conversational chemistry, and modern psychological attraction patterns.",
    decisionIdRefs: ["WEST_DEC_SYNASTRY_01", "WEST_DEC_COMPATIBILITY_01"]
  }
];

export const RULES_DETAILS: RuleDetail[] = [
  {
    id: "KP_REL_PROMISE_01",
    name: "KP 7th CSL Cuspal Sub-Lord Connection",
    purpose: "Verify if the lifetime physical promise of marriage is legally promised in the natal structure.",
    inputsUsed: "7th Cuspal Sub-Lord coordinate, Sub-Lord Star Lord planet significators (2, 7, 11).",
    supportingEvidence: "The 7th Cuspal Sub-Lord occupies or rules the 2nd, 7th, or 11th house, or resides in the star of a planet signifying these houses.",
    contradictingEvidence: "The 7th Cuspal Sub-Lord or its Star Lord exclusively signifies the 1st, 6th, or 10th house, representing self-sufficiency, separation, or profession over partnership.",
    systemId: "KP",
    decisionIdRefs: ["KP_DEC_PROMISE_01"]
  },
  {
    id: "KP_REL_DELAY_01",
    name: "Saturnian Restriction over Cuspal Axis",
    purpose: "Evaluate if Saturn delays relationship stabilization past the standard age of 28.",
    inputsUsed: "Saturn's natal coordinates, aspects on the 7th house/cusp, and involvement with the 7th CSL.",
    supportingEvidence: "Saturn occupies the 7th house, aspects the 7th cusp, or acts as the Star Lord/Sub Lord of the 7th cusp.",
    contradictingEvidence: "Jupiter aspects the 7th house or Saturn is highly fortified in its own sign, negating structural obstructions.",
    systemId: "KP",
    decisionIdRefs: ["KP_DEC_DELAY_01"]
  },
  {
    id: "VED_REL_PROMISE_01",
    name: "7th Lord in Quadrants & Venus Fortification",
    purpose: "Establish foundational domestic harmony and mutual attraction promise.",
    inputsUsed: "7th House Lord position, planets in 7th, status of Venus and D9 Navamsha Lagna.",
    supportingEvidence: "7th lord is placed in Kendras (1, 4, 7, 10) or Trikonas (5, 9) without malefic aspects from Rahu, Ketu, or Mars.",
    contradictingEvidence: "7th lord is combust, retrograde, or placed in dusthanas (6, 8, 12) coupled with a weak, afflicted Venus.",
    systemId: "Vedic",
    decisionIdRefs: ["VED_DEC_PROMISE_01"]
  },
  {
    id: "JAIM_REL_DK_STRENGTH",
    name: "Darakaraka Dignity and Spouse Nature",
    purpose: "Define the core spiritual traits, longevity, and physical appearance of the spouse.",
    inputsUsed: "Longitudinal degrees of all nine planets; identifying the lowest degree planet (Darakaraka).",
    supportingEvidence: "Darakaraka is a natural benefic (Venus, Jupiter, Moon, Mercury) placed in an auspicious house in both Rasi and Karakamsha.",
    contradictingEvidence: "Darakaraka is a natural malefic (Saturn, Mars, Sun) placed in the 6th, 8th, or 12th house from the Ascendant.",
    systemId: "Jaimini",
    decisionIdRefs: ["JAIM_DEC_DARAKARAKA_01"]
  },
  {
    id: "NADI_REL_TRANSIT_JUPITER",
    name: "Jupiter Transit Activation Loop",
    purpose: "Identify exact solar periods when relationship meetings or marriages are triggered.",
    inputsUsed: "Current transiting Jupiter coordinates, natal Venus coordinates (for males) or natal Jupiter (for females).",
    supportingEvidence: "Transiting Jupiter forms a trine (5th, 9th aspect) or direct conjunction with the natal partner significator.",
    contradictingEvidence: "Simultaneous Saturn transit occupies the exact degree of Venus, creating a temporal blockage or separation.",
    systemId: "Nadi",
    decisionIdRefs: ["NADI_DEC_TRANSIT_01"]
  },
  {
    id: "LK_REL_BLIND_CHART",
    name: "Lal Kitab Blind Chart Evaluation",
    purpose: "Examine if hidden planetary blindness obstructs marriage ceremonies.",
    inputsUsed: "10th and 4th house planet placements, Venus placement, fixed Aries layout analysis.",
    supportingEvidence: "Planets in the 10th house are mutual friends with those in the 4th house, enabling the blind charts to 'see' each other.",
    contradictingEvidence: "Afflicted Venus is in the 1st or 8th house under a fixed Aries backdrop, indicating an unresolved 'teva' block.",
    systemId: "Lal Kitab",
    decisionIdRefs: ["LK_DEC_BLIND_CHART_01"]
  },
  {
    id: "TAJ_REL_ITHASALA_YOGA",
    name: "Tajik Annual Ithasala (Mutual Application)",
    purpose: "Verify if relationship events occur during the specific evaluated solar year.",
    inputsUsed: "Yearly Varshaphala return coordinates, Muntha house position, Muntha Lord, Tajik aspects.",
    supportingEvidence: "A faster moving planet forms a major aspect with a slower planet (Ithasala) within their orb limits (Deepsheel).",
    contradictingEvidence: "The aspect resolves in an Esharapha (separation) or is blocked by an intervening planet (Cuttaka/Kamboola).",
    systemId: "Tajik",
    decisionIdRefs: ["TAJ_DEC_TIMING_01"]
  },
  {
    id: "WEST_REL_MOON_CROSS_ASPECTS",
    name: "Western Sayana Tropical Luminary Sync",
    purpose: "Assess raw emotional compatibility, subconscious safety, and domestic harmony.",
    inputsUsed: "Native's Sayana Moon position, Partner's Sayana Sun, Venus, or Ascendant degree.",
    supportingEvidence: "Conjunctions or trines between native Moon and partner Sun/Venus (orb < 6 degrees).",
    contradictingEvidence: "Squares or oppositions between Moon and Saturn, indicating emotional distance or severe critical friction.",
    systemId: "Western",
    decisionIdRefs: ["WEST_DEC_SYNASTRY_01"]
  }
];

export const PLANETS_DETAILS: PlanetDetail[] = [
  {
    name: "Venus (Shukra)",
    significance: "The natural significator (Karaka) of marriage, romance, harmony, and creative seed for all charts. Specifically rules the wife in male charts.",
    strengthAspect: "Extremely strong in Taurus, Libra, and Pisces (exaltation). Afflicted when combust, retrograde, or in Virgo (debilitation).",
    relationshipRole: "Governs attraction, sexual compatibility, pleasure, aesthetic taste, and the mutual desire for companionable union.",
    ruleIdRefs: ["VED_REL_PROMISE_01", "JAIM_REL_DK_STRENGTH"]
  },
  {
    name: "Jupiter (Guru)",
    significance: "The natural significator of wisdom, divine protection, and moral code. Specifically rules the husband in female charts.",
    strengthAspect: "Strong in Sagittarius, Pisces, and Cancer (exaltation). Afflicted in Capricorn (debilitation).",
    relationshipRole: "Governs marriage legality, progeny promise, mutual values, social status of union, and divine timing of relationship events.",
    ruleIdRefs: ["NADI_REL_TRANSIT_JUPITER", "VED_REL_PROMISE_01"]
  },
  {
    name: "Mars (Mangal)",
    significance: "The planet of physical drive, energy, courage, and protective action. Natural significator of passion.",
    strengthAspect: "Strong in Aries, Scorpio, and Capricorn (exaltation). Afflicted in Cancer (debilitation).",
    relationshipRole: "Governs physical attraction, passion, and conflicts. High involvement in the 1st, 4th, 7th, 8th, or 12th houses triggers Manglik Dosha, requiring mitigation.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Saturn (Shani)",
    significance: "The planet of structure, duty, restriction, time, and slow, enduring karmic lessons.",
    strengthAspect: "Strong in Capricorn, Aquarius, and Libra (exaltation). Afflicted in Aries (debilitation).",
    relationshipRole: "Triggers delays, legal structures, maturity, enduring patience, or structural distance in relationship timelines.",
    ruleIdRefs: ["KP_REL_DELAY_01", "NADI_REL_TRANSIT_JUPITER"]
  },
  {
    name: "Moon (Chandra)",
    significance: "The natural significator of the mind, emotional comfort, mother, and intuitive safety.",
    strengthAspect: "Strong in Taurus (exaltation) and Cancer. Weak when dark (Amavasya) or in Scorpio.",
    relationshipRole: "Governs emotional sync, mental compatibility, domestic peace, and subconscious feeling of safety with the partner.",
    ruleIdRefs: ["WEST_REL_MOON_CROSS_ASPECTS"]
  },
  {
    name: "Mercury (Budha)",
    significance: "The planet of intellect, speech, logical reasoning, and humorous banter.",
    strengthAspect: "Strong in Virgo (exaltation) and Gemini. Weak in Pisces (debilitation).",
    relationshipRole: "Governs relationship communication, shared humor, business partnership synergy, and cognitive understanding.",
    ruleIdRefs: ["LK_REL_BLIND_CHART"]
  },
  {
    name: "Sun (Surya)",
    significance: "The soul (Atma), ego, father, authority, and public dignity of the native.",
    strengthAspect: "Strong in Leo and Aries (exaltation). Weak in Libra (debilitation).",
    relationshipRole: "Governs ego clashes, proud behavior, public standing of the union, and dynamic self-respect boundaries in partnership.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Rahu (North Node)",
    significance: "The shadow planet representing material obsession, unconventional paths, and illusion.",
    strengthAspect: "Strong in Taurus/Gemini.",
    relationshipRole: "Triggers unconventional marriages, sudden love-interests, obsession, or foreign alliances. Highly active in love marriages.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Ketu (South Node)",
    significance: "The shadow planet representing detachment, isolation, spiritual liberation, and past debts.",
    strengthAspect: "Strong in Scorpio/Sagittarius.",
    relationshipRole: "Triggers detachment, feeling of isolation even in union, spiritual joint paths, or sudden karmic severances.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  }
];

export const HOUSES_DETAILS: HouseDetail[] = [
  {
    number: 7,
    name: "7th House (Kalatra Bhava)",
    significance: "The primary house of marriage, legal unions, contracts, partner's physical appearance, and public business partnerships.",
    relationshipImpact: "Its lord, occupants, and aspecting planets define the core longevity, success, and foundational promise of any relationship.",
    favorablePlanets: "Venus, Jupiter, Mercury, Moon",
    ruleIdRefs: ["KP_REL_PROMISE_01", "VED_REL_PROMISE_01"]
  },
  {
    number: 2,
    name: "2nd House (Kutumba Bhava)",
    significance: "The house of family increase, financial resources, speech, and domestic stability.",
    relationshipImpact: "Crucial in KP and Vedic systems to signify the physical addition of a new partner to the existing household.",
    favorablePlanets: "Jupiter, Venus, Mercury",
    ruleIdRefs: ["KP_REL_PROMISE_01"]
  },
  {
    number: 11,
    name: "11th House (Labha Bhava)",
    significance: "The house of gains, fulfillment of desires, social circles, and long-term companion friendship.",
    relationshipImpact: "Represents the ultimate success of negotiations, lasting friendship with the partner, and complete desire fulfillment in marriage.",
    favorablePlanets: "Sun, Jupiter, Venus, Rahu",
    ruleIdRefs: ["KP_REL_PROMISE_01"]
  },
  {
    number: 5,
    name: "5th House (Putra Bhava)",
    significance: "The house of romance, intellect, past meritorious deeds (Purva Punya), and emotional affection.",
    relationshipImpact: "Triggers intense love interest, courtship, passion, and emotional attraction. Essential to confirm love-marriage conversions.",
    favorablePlanets: "Jupiter, Moon, Venus",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    number: 1,
    name: "1st House (Lagna Bhava)",
    significance: "The self, physical body, health, individual path, and mental disposition.",
    relationshipImpact: "Represents the individual native. In KP, if strongly active alongside 6 and 10, it promotes self-sufficiency and discourages compromise.",
    favorablePlanets: "Sun, Jupiter, Mars",
    ruleIdRefs: ["KP_REL_PROMISE_01"]
  },
  {
    number: 6,
    name: "6th House (Shatru Bhava)",
    significance: "The house of disputes, daily labor, debt, and separations (12th from the 7th house).",
    relationshipImpact: "Acts as a major separator. Strongly negates relationship continuity and signifies arguments, domestic friction, or legal divorce.",
    favorablePlanets: "Saturn, Mars, Rahu",
    ruleIdRefs: ["KP_REL_PROMISE_01", "KP_REL_DELAY_01"]
  },
  {
    number: 10,
    name: "10th House (Karma Bhava)",
    significance: "The house of profession, social reputation, authority, and public actions (4th from the 7th house).",
    relationshipImpact: "Focuses energy on career, leading to delays in marriage. In KP, it is a primary negator house (being the 4th from 7th, which acts as a non-marriage focus).",
    favorablePlanets: "Sun, Mercury, Saturn, Mars",
    ruleIdRefs: ["KP_REL_DELAY_01"]
  },
  {
    number: 8,
    name: "8th House (Ayur Bhava / Mangalya Sthana)",
    significance: "The house of longevity, shared assets, secrets, intense transformations, and marital bond strength (Mangalya).",
    relationshipImpact: "Examines secret trials, joint finances, inheritance, and the longevity of the partner's life.",
    favorablePlanets: "Saturn (only for longevity)",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    number: 12,
    name: "12th House (Vyaya Bhava)",
    significance: "The house of expenses, bed comforts (Sayana Sukha), foreign lands, and isolation.",
    relationshipImpact: "Governs sub-conscious emotional sacrifices, beds, physical intimacy, and geographical distances between partners.",
    favorablePlanets: "Venus",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    number: 9,
    name: "9th House (Dharma Bhava)",
    significance: "The house of religion, higher philosophy, fortune (Bhagya), and secondary marriages (3rd from the 7th).",
    relationshipImpact: "Analyzes remarriage potential, ethical alignment, and luck in relationships.",
    favorablePlanets: "Jupiter, Sun",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  }
];

export const DASHAS_DETAILS: DashaDetail[] = [
  {
    name: "Vimshottari Dasha Cycle",
    relevance: "The premier planetary period system of Indian Astrology based on the moon's exact nakshatra at birth.",
    relationshipInfluence: "Marriage can only manifest during the major (Maha) or sub (Antar) dasha of planets connected to the 2nd, 7th, or 11th houses in KP, or the 7th lord/Venus in Vedic.",
    triggerMechanisms: "The dasha lord must establish a friendly relation with the 7th house cusp to physically trigger relationship stabilization.",
    ruleIdRefs: ["VED_REL_PROMISE_01", "KP_REL_PROMISE_01"]
  },
  {
    name: "Jaimini Chara Dasha",
    relevance: "A unique sign-based (Rasi) dasha system where periods are ruled by zodiac signs rather than planets.",
    relationshipInfluence: "Triggers unions when the active sign period contains or is aspected by the Darakaraka (DK) or resides in the 7th house from Karakamsha.",
    triggerMechanisms: "Activation of the Jaimini Upapada Lagna or its aspecting signs, bringing major destiny changes in partnership.",
    ruleIdRefs: ["JAIM_REL_DK_STRENGTH"]
  },
  {
    name: "Tajik Varshaphala (Solar Return Years)",
    relevance: "An annual solar return system indicating specific milestones matching the native's age.",
    relationshipInfluence: "Triggers solar Return chart indicators where Muntha resides in the 7th house, or the Year Lord is strongly aspecting the relationship axis.",
    triggerMechanisms: "Ithasala yoga forming between the 1st lord and 7th lord of the Varshaphala return chart.",
    ruleIdRefs: ["TAJ_REL_ITHASALA_YOGA"]
  }
];

export const YOGAS_DETAILS: YogaDetail[] = [
  {
    name: "Vivah Yoga (Marriage Indicator)",
    relevance: "A beneficial planetary placement confirming early or timely relationship stabilization.",
    combination: "Conjunction of the 7th Lord and Jupiter in the 9th house, or Venus placed in the 11th house without malefic intervention.",
    relationshipOutcome: "Promotes healthy, joyous, socially acceptable, and timely union with domestic happiness.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Malavya Yoga (Pancha Mahapurusha)",
    relevance: "An outstanding structural yoga ruled by Venus, representing ultimate beauty, luxury, and artistic romance.",
    combination: "Venus occupies its own sign (Taurus/Libra) or exaltation sign (Pisces) while placed in a quadrant (1st, 4th, 7th, or 10th house).",
    relationshipOutcome: "Brings an elegant, highly artistic, affectionate, wealthy, and cooperative spouse who values luxurious comfort.",
    ruleIdRefs: ["VED_REL_PROMISE_01", "JAIM_REL_DK_STRENGTH"]
  },
  {
    name: "Gaja Kesari Yoga (Elephant & Lion)",
    relevance: "A major classical yoga of mutual protection, honor, and public reputation.",
    combination: "Jupiter is in a quadrant (1st, 4th, 7th, 10th) from the Moon, with both planets well-fortified.",
    relationshipOutcome: "Ensures relationship dignity, societal approval, financial security, and highly respectful behavior between spouses.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Dharma Karmadhipati Yoga (Dharma-Karma Union)",
    relevance: "The most powerful combination for shared professional and societal duties.",
    combination: "Conjunction or mutual exchange of the 9th Lord (Dharma) and 10th Lord (Karma).",
    relationshipOutcome: "Partners build highly successful public ventures together, sharing moral and professional goals.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  }
];

export const DOSHAS_DETAILS: DoshaDetail[] = [
  {
    name: "Manglik Dosha (Kuja Dosha)",
    relevance: "The most prominent classical relationship block resulting from the intense heat of Mars.",
    cancellationConditions: "Cancelled if Mars is placed in its own sign, if the partner is also a Manglik, or if Jupiter aspects Mars with high longitudinal strength.",
    impactScale: "Triggers verbal arguments, physical clashes, ego dominance, or intense psychological friction in the home environment.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Nadi Dosha (Guna Milan Block)",
    relevance: "A foundational psychological and biological incompatibility discovered during Ashtakoota compatibility analysis.",
    cancellationConditions: "Cancelled if both charts have the same Moon sign but different birth stars, or if the 7th lords of both partners are friendly.",
    impactScale: "Historically linked to childbearing problems, physical detachment, and psychological misalignments.",
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Saturn-Mars Opposing Aspect Block",
    relevance: "An explosive cross-system tension that triggers severe relationship blocks.",
    cancellationConditions: "Pacified if either Venus or Jupiter forms a tight conjunction with the active Mars.",
    impactScale: "Indicates sudden outbursts of anger, sudden coldness, or cycles of high passion followed by long silences.",
    ruleIdRefs: ["KP_REL_DELAY_01"]
  }
];

export const REMEDIES_DETAILS: RemedyDetail[] = [
  {
    name: "Venus White Flower Pacification",
    purpose: "Harmonize Venus (Shukra) and soften romantic frictions, enhancing partner affection.",
    reason: "White flowers contain organic visual frequencies that physically mirror the calming cosmic energy of Shukra.",
    supportingEvidence: "VED_REL_PROMISE_01 suggests Venus pacification when placed in the 6th or 8th house.",
    implementation: "Offer 7 fresh white jasmine or lily flowers in a clean running water stream or near a garden on Friday mornings.",
    decisionIdRefs: ["VED_DEC_PROMISE_01"],
    ruleIdRefs: ["VED_REL_PROMISE_01"]
  },
  {
    name: "Thursday Pulse Fasting",
    purpose: "Strengthen Jupiter's divine protection to clear relationship delays or blocks.",
    reason: "Jupiter governs timing and legality. Dry yellow pulses and fasting elevate spiritual discipline, boosting Guru's alignment.",
    supportingEvidence: "KP_REL_DELAY_01 recommends boosting Jupiter to clear Saturn's restrictive 10th house aspect.",
    implementation: "Fast on dry yellow pulses (chana dal) on Thursdays, avoid salt, and wear a clean yellow cloth or yellow topaz.",
    decisionIdRefs: ["KP_DEC_DELAY_01"],
    ruleIdRefs: ["KP_REL_DELAY_01"]
  },
  {
    name: "Saturn Metal donation",
    purpose: "Pacify restrictive Saturnian delay aspects over the descendant or 7th house.",
    reason: "Saturn rules workers, iron, and old metal. Donating pacifies Saturn's karmic debt.",
    supportingEvidence: "KP_REL_DELAY_01 identifies Saturnian delay patterns past the native's age of 28.",
    implementation: "Donate iron vessels, steel pans, or dark umbrellas to manual laborers or charities on Saturday evenings.",
    decisionIdRefs: ["KP_DEC_DELAY_01"],
    ruleIdRefs: ["KP_REL_DELAY_01"]
  },
  {
    name: "Solar Aditya Hrudaya recitation",
    purpose: "Harmonize Tajik Solar cycle returns to trigger auspicious relationship timing.",
    reason: "The sun rules solar returns (Varshaphala). Reciting solar mantras establishes high vital energy.",
    supportingEvidence: "TAJ_REL_ITHASALA_YOGA indicates Tajik solar transitions when native enters positive Varshaphala years.",
    implementation: "Worship solar energy by reciting the Aditya Hrudaya Stotra early in the mornings on Sundays.",
    decisionIdRefs: ["TAJ_DEC_TIMING_01"],
    ruleIdRefs: ["TAJ_REL_ITHASALA_YOGA"]
  }
];
