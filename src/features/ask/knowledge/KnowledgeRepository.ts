import { KnowledgeItem } from "../models/KnowledgeItem";

export const ASTROLOGY_KNOWLEDGE_BASE: KnowledgeItem[] = [
  // 1. Planets
  {
    id: "planet-sun",
    category: "planet",
    keyword: "sun",
    title: "Sun (Surya) in Vedic Astrology",
    description: "The soul, ego, authority, father, government, and vitality.",
    content: "The Sun represents the Atman (Soul), self-realization, willpower, leadership, and public status. In the 10th house, it enjoys Digbala (directional strength) yielding supreme career authority. Its key transit periods indicate major ego shifts and governmental alignments.",
    tags: ["surya", "karaka", "authority", "father"]
  },
  {
    id: "planet-moon",
    category: "planet",
    keyword: "moon",
    title: "Moon (Chandra) in Vedic Astrology",
    description: "The mind, emotions, mother, and mental peace.",
    content: "The Moon rules the emotional state, receptivity, and psychological comfort. The position of the Moon determines the Janma Nakshatra and the starting point of the Vimshottari Dasha system. Moon transits are essential for daily mood and short-term trends.",
    tags: ["chandra", "mind", "emotions", "mother"]
  },
  {
    id: "planet-saturn",
    category: "planet",
    keyword: "saturn",
    title: "Saturn (Shani) in Vedic Astrology",
    description: "Karma, discipline, delay, structure, and obstacles.",
    content: "Saturn is the lord of karma, perseverance, and lifespan. It tests the individual's patience and enforces hard lessons. Major planetary events like Sade Sati occur when Saturn transits the 12th, 1st, and 2nd houses from the natal Moon.",
    tags: ["shani", "karma", "discipline", "sade_sati"]
  },

  // 2. Houses
  {
    id: "house-10",
    category: "house",
    keyword: "10th house",
    title: "10th House (Karma Bhava)",
    description: "The house of profession, career, social status, and public reputation.",
    content: "The 10th house is the zenith of the chart, ruling career, honor, government connections, promotions, and life's achievements. Strong planets here, especially the Sun or Mars, grant immense driving force and vocational success.",
    tags: ["career", "profession", "karma", "tenth_house"]
  },
  {
    id: "house-7",
    category: "house",
    keyword: "7th house",
    title: "7th House (Yuvati Bhava)",
    description: "The house of marriage, long-term partnerships, business associates, and public relations.",
    content: "The 7th house rules legal unions, marital bonds, the spouse's characteristics, and external commercial partnerships. It is a Kendra house representing the mirror self.",
    tags: ["marriage", "spouse", "business_partner", "seventh_house"]
  },

  // 3. Nakshatras
  {
    id: "nakshatra-ashwini",
    category: "nakshatra",
    keyword: "ashwini",
    title: "Ashwini Nakshatra",
    description: "The first Nakshatra of the zodiac, ruled by Ketu, representing quickness and healing.",
    content: "Spanning 0°00' to 13°20' in Aries, Ashwini is associated with the Ashwin Kumars, the celestial physicians. It governs quick action, intelligence, medical healing, travel, and swift transitions.",
    tags: ["nakshatra", "ketu", "aries", "healing"]
  },

  // 4. Yogas
  {
    id: "yoga-gaja-kesari",
    category: "yoga",
    keyword: "gajakesari",
    title: "Gaja Kesari Yoga",
    description: "A highly auspicious yoga formed by Jupiter and the Moon.",
    content: "Occurs when Jupiter is in a Kendra (1st, 4th, 7th, or 10th) from the Moon. It confers wisdom, administrative capability, persistent wealth, popularity, and protection from enemies.",
    tags: ["yoga", "jupiter", "moon", "wealth"]
  },

  // 5. Doshas
  {
    id: "dosha-manglik",
    category: "dosha",
    keyword: "manglik",
    title: "Manglik Dosha (Kuja Dosha)",
    description: "A planetary imbalance caused by Mars' placement relative to marital houses.",
    content: "Formed when Mars is situated in the 1st, 2nd, 4th, 7th, 8th, or 12th houses from the Ascendant, Moon, or Venus. It causes potential delays, intense friction, and demands emotional maturity in marriages.",
    tags: ["dosha", "mars", "marriage", "conflict"]
  },

  // 6. Transits
  {
    id: "transit-sade-sati",
    category: "transit",
    keyword: "sade sati",
    title: "Sade Sati Transit",
    description: "The 7.5-year cycle of Saturn transiting the natal Moon's adjacent signs.",
    content: "Sade Sati begins when Saturn enters the sign immediately preceding the natal Moon sign, covers the Moon sign, and finishes when exiting the subsequent sign. It demands restructuring of one's personal identity and career foundations.",
    tags: ["transit", "saturn", "moon", "karma"]
  },

  // 7. Dashas
  {
    id: "dasha-vimshottari",
    category: "dasha",
    keyword: "vimshottari",
    title: "Vimshottari Dasha System",
    description: "The premier 120-year planetary progression cycle based on Janma Nakshatra.",
    content: "The Vimshottari dasha allocates specific life blocks to the nine planets (Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17). It represents the unfolding of karmic events according to the Moon's initial positioning.",
    tags: ["dasha", "timing", "karmic_cycle", "vimshottari"]
  },

  // 8. KP Concepts
  {
    id: "kp-sublord",
    category: "kp",
    keyword: "sublord",
    title: "KP Sublord (Krishnamurti Paddhati)",
    description: "The sub-division of a Nakshatra into unequal parts ruled by the nine planets.",
    content: "KP Astrology relies heavily on the Sublord. Each of the 27 Nakshatras is divided into 9 segments based on the ratio of Vimshottari Dasha spans. The sublord of a stellar cusp decides whether the house's significations will fructify favorably.",
    tags: ["kp", "sublord", "stellar_astrology", "cusp"]
  },

  // 9. Western Concepts
  {
    id: "western-aspect-grid",
    category: "western",
    keyword: "aspect",
    title: "Western Planetary Aspects",
    description: "Geometrical angles formed between planets (Conjunction, Sextile, Square, Trine, Opposition).",
    content: "Western astrology highlights dynamic configurations like the Grand Trine, T-Square, and Grand Cross. Orbs of influence (usually 1° to 8°) govern the intensity of flowing (trine/sextile) or challenging (square/opposition) psychological drives.",
    tags: ["western", "aspects", "angles", "trine", "square"]
  },

  // 10. Jaimini Concepts
  {
    id: "jaimini-karakas",
    category: "jaimini",
    keyword: "karaka",
    title: "Jaimini Chara Karakas",
    description: "The seven variable significators decided by planetary degrees in any sign.",
    content: "Jaimini uses Chara Karakas from Atmakaraka (highest degree, representing soul) down to Darakaraka (lowest degree, representing spouse). It also relies heavily on Sign-based Dashas (Chara Dasha) rather than planetary ones.",
    tags: ["jaimini", "chara_karaka", "atmakaraka", "darakaraka"]
  },

  // 11. Future Systems (Compatible placeholders)
  {
    id: "future-nadi",
    category: "future_system",
    keyword: "nadi",
    title: "Nadi Astrology Integration",
    description: "Stellar progression system focusing on Jupiter, Saturn, and nodal aspects.",
    content: "Nadi uses planetary combinations without relying on precise Lagna calculations. Jupiter represents the native's life force (Jiva Karaka), and Saturn rules karma. Aspects of Rahu and Ketu highlight blockages.",
    tags: ["nadi", "future_system", "jupiter", "saturn"]
  }
];

export class KnowledgeRepository {
  /**
   * Retrieves all items in the repository
   */
  public static getAll(): KnowledgeItem[] {
    return ASTROLOGY_KNOWLEDGE_BASE;
  }

  /**
   * Filter repository by category
   */
  public static getByCategory(category: string): KnowledgeItem[] {
    return ASTROLOGY_KNOWLEDGE_BASE.filter(item => item.category === category);
  }
}
