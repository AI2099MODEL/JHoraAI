/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  content: string;
  status: "candidate" | "pending" | "approved" | "rejected";
  source: string;
  confidence: number;
  linkedSystem: string;
  version: string;
  author: string;
  reference: string;
  approvalDate?: string;
  lastUpdated: string;
}

export const INITIAL_SITEMAP = [
  "Relationship", "Marriage", "Marriage Delay", "Love Marriage", "Divorce", "Remarriage", 
  "Spouse", "Children", "KP", "Vedic", "Jaimini", "Nadi", "Lal Kitab", "Western", 
  "Transits", "Dashas", "Remedies", "Yogas", "Doshas", "Rules", "Evidence", "Decisions", "Reports"
];

export const INITIAL_KNOWLEDGE: KnowledgeItem[] = [
  {
    id: "KNOW_001",
    title: "Saturn Delay Dynamics in 7th House sub-ruler",
    category: "Marriage Delay",
    content: "Vedic and KP consensus indicates that when Saturn aspects the 7th house or acts as the 7th sub-ruler, marriage is systemically deferred beyond 28 years. This is verified across 45 test cohorts in the Research Lab.",
    status: "approved",
    source: "Research paper on Saturnian delays",
    confidence: 95,
    linkedSystem: "KP",
    version: "1.0.0",
    author: "JHoraAI Lead Researcher",
    reference: "Vedic Cohort Journal 2026",
    approvalDate: "2026-07-01",
    lastUpdated: "2026-07-01"
  },
  {
    id: "KNOW_002",
    title: "Navamsha (D9) Moon aspecting Venus resonance",
    category: "Spouse",
    content: "When the Navamsha Moon aspects Venus in the D9 chart, the spouse's nature exhibits artistic inclinations, deep emotional depth, and a calm psychological demeanor.",
    status: "approved",
    source: "Classical Jaimini Sutras Study",
    confidence: 90,
    linkedSystem: "Jaimini",
    version: "1.0.2",
    author: "Sastri Balachandran",
    reference: "Traditional Jaimini Shastras Vol 4",
    approvalDate: "2026-07-10",
    lastUpdated: "2026-07-10"
  },
  {
    id: "KNOW_003",
    title: "Lal Kitab Remedies for Rahu in 7th House",
    category: "Remedies",
    content: "Rahu in the 7th house causes sudden conflicts. Lal Kitab recommends keeping a small piece of solid silver in the wallet and feeding black dogs to neutralize Rahu's malefic aspect.",
    status: "candidate",
    source: "Lal Kitab Red Book Interpretations",
    confidence: 82,
    linkedSystem: "Lal Kitab",
    version: "1.0.0",
    author: "Pandit K. Sharma",
    reference: "Lal Kitab Sutras 1939",
    lastUpdated: "2026-07-15"
  },
  {
    id: "KNOW_004",
    title: "Tajik Varshaphala Marriage Saham Activation",
    category: "Marriage Timing",
    content: "The Tajik Varshaphala Vivaha Saham (marriage point) when aspected by Jupiter or the year lord during transit indicates 100% activation of marriage gates within that solar return year.",
    status: "pending",
    source: "Tajik Neelakanthi Translations",
    confidence: 88,
    linkedSystem: "Tajik",
    version: "1.1.0",
    author: "Dr. Raman Dev",
    reference: "Varshaphala Commentary Ch 8",
    lastUpdated: "2026-07-16"
  }
];
