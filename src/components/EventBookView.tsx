import React, { useState, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  X,
  Heart,
  Briefcase,
  Coins,
  ShieldAlert,
  Scale,
  GraduationCap,
  Home,
  Globe,
  Layers,
  ChevronRight,
  Info
} from "lucide-react";

interface KPEvent {
  id: string;
  category: "relationship" | "career" | "finance" | "health" | "litigation" | "education" | "property" | "travel";
  name: string;
  primary: string;
  supporting: string;
  obstructing: string;
  mainCsl: string;
  description: string;
}

const relEvents: KPEvent[] = [
  // Relationships (REL & NEW)
  { 
    id: "REL001", 
    category: "relationship",
    name: "Marriage Promise", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates the overall foundational promise of marriage in the natal chart."
  },
  { 
    id: "REL002", 
    category: "relationship",
    name: "Marriage Timing", 
    primary: "2,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluates active DBA lords and timing triggers for marriage celebration."
  },
  { 
    id: "REL003", 
    category: "relationship",
    name: "Marriage Proposal", 
    primary: "3,7,11", 
    supporting: "2,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Signifies receiving or presenting a formal marriage proposal."
  },
  { 
    id: "REL004", 
    category: "relationship",
    name: "Proposal Acceptance", 
    primary: "2,7,11", 
    supporting: "3,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Affirmative acceptance of a marriage proposal by either family or individual."
  },
  { 
    id: "REL005", 
    category: "relationship",
    name: "Proposal Rejection", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Rejection of a marriage proposal, indicating misaligned expectations."
  },
  { 
    id: "REL006", 
    category: "relationship",
    name: "Engagement", 
    primary: "2,7,11", 
    supporting: "3,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Formal or informal ceremony of betrothal or engagement."
  },
  { 
    id: "REL007", 
    category: "relationship",
    name: "Engagement Cancellation", 
    primary: "1,6,8,12", 
    supporting: "10", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Disruption or cancellation of a planned engagement prior to marriage."
  },
  { 
    id: "REL008", 
    category: "relationship",
    name: "Marriage Ceremony", 
    primary: "2,7,11", 
    supporting: "3,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "The actual execution of traditional or customary marriage rituals."
  },
  { 
    id: "REL009", 
    category: "relationship",
    name: "Marriage Registration", 
    primary: "2,7,11", 
    supporting: "3,10", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Legal documentation and government registration of the marriage contract."
  },
  { 
    id: "REL010", 
    category: "relationship",
    name: "Court Marriage", 
    primary: "6,7,11", 
    supporting: "3,9", 
    obstructing: "1,5,10", 
    mainCsl: "7",
    description: "Legal wedding conducted in court under civil law."
  },
  { 
    id: "REL011", 
    category: "relationship",
    name: "Love Marriage", 
    primary: "5,7,11", 
    supporting: "2,9", 
    obstructing: "1,6,10", 
    mainCsl: "5,7",
    description: "Self-chosen relationship translating to legal marriage, driven by affection."
  },
  { 
    id: "REL012", 
    category: "relationship",
    name: "Arranged Marriage", 
    primary: "2,7,11", 
    supporting: "9", 
    obstructing: "5,6,10", 
    mainCsl: "7",
    description: "Traditional union facilitated primarily by parents, family, or matchmakers."
  },
  { 
    id: "REL013", 
    category: "relationship",
    name: "Inter-Caste Marriage", 
    primary: "7,11", 
    supporting: "5,9,12", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Marriage breaking traditional lineage or caste boundaries."
  },
  { 
    id: "REL014", 
    category: "relationship",
    name: "Inter-Religion Marriage", 
    primary: "7,11", 
    supporting: "9,12", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Matrimony between individuals practicing distinct faiths."
  },
  { 
    id: "REL015", 
    category: "relationship",
    name: "Foreign Marriage", 
    primary: "7,9,12", 
    supporting: "2,11", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Marriage celebrated in a foreign land or with a foreign national."
  },
  { 
    id: "REL016", 
    category: "relationship",
    name: "Delay in Marriage", 
    primary: "7", 
    supporting: "4,8,10", 
    obstructing: "2,11", 
    mainCsl: "7",
    description: "Slower development of matrimonial conditions, often Sat-linked."
  },
  { 
    id: "REL017", 
    category: "relationship",
    name: "Denial of Marriage", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Astrological indications negating marriage promise in the lifetime."
  },
  { 
    id: "REL018", 
    category: "relationship",
    name: "Married Life Quality", 
    primary: "2,7,11", 
    supporting: "4,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Evaluation of relative peace, prosperity, and stability post-marriage."
  },
  { 
    id: "REL019", 
    category: "relationship",
    name: "Marital Happiness", 
    primary: "4,7,11", 
    supporting: "2,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Inherent domestic bliss, mutual support, and emotional nourishment."
  },
  { 
    id: "REL020", 
    category: "relationship",
    name: "Marital Discord", 
    primary: "1,6,10", 
    supporting: "8,12", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Undercurrent of tension, arguments, and ideological differences."
  },
  { 
    id: "REL021", 
    category: "relationship",
    name: "Frequent Arguments", 
    primary: "6,8", 
    supporting: "3", 
    obstructing: "2,4,11", 
    mainCsl: "7",
    description: "Repetitive verbal disputes or temporary silent phases."
  },
  { 
    id: "REL022", 
    category: "relationship",
    name: "Domestic Violence", 
    primary: "6,8,12", 
    supporting: "1", 
    obstructing: "2,4,11", 
    mainCsl: "4,7",
    description: "Severe distress, emotional or physical hostility within the household."
  },
  { 
    id: "REL023", 
    category: "relationship",
    name: "Temporary Separation", 
    primary: "6,12", 
    supporting: "3,8", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Brief phase of living apart due to discord or external requirements."
  },
  { 
    id: "REL024", 
    category: "relationship",
    name: "Permanent Separation", 
    primary: "1,6,8,12", 
    supporting: "10", 
    obstructing: "2,7,11", 
    mainCsl: "7",
    description: "Permanent cessation of cohabitation without formal decree."
  },
  { 
    id: "REL025", 
    category: "relationship",
    name: "Divorce Petition", 
    primary: "6,12", 
    supporting: "3", 
    obstructing: "2,7,11", 
    mainCsl: "6",
    description: "Filing of legal separation papers or dissolution petitions."
  },
  { 
    id: "REL026", 
    category: "relationship",
    name: "Divorce Proceedings", 
    primary: "6,8,12", 
    supporting: "3,9", 
    obstructing: "2,7,11", 
    mainCsl: "6",
    description: "Ongoing legal litigation and dispute settlement process."
  },
  { 
    id: "REL027", 
    category: "relationship",
    name: "Divorce Decree", 
    primary: "1,6,8,12", 
    supporting: "10", 
    obstructing: "2,7,11", 
    mainCsl: "6,7",
    description: "Final judicial stamp dissolving the marriage contract completely."
  },
  { 
    id: "REL028", 
    category: "relationship",
    name: "Alimony / Maintenance", 
    primary: "2,8,11", 
    supporting: "6", 
    obstructing: "1,7,12", 
    mainCsl: "8",
    description: "Financial settlements, spousal support, or child upkeep payments."
  },
  { 
    id: "REL029", 
    category: "relationship",
    name: "Child Custody", 
    primary: "5,11", 
    supporting: "4,9", 
    obstructing: "6,12", 
    mainCsl: "5",
    description: "Legal determination of wardship and child custody rights."
  },
  { 
    id: "REL030", 
    category: "relationship",
    name: "Property Settlement", 
    primary: "4,11", 
    supporting: "2,8", 
    obstructing: "6,12", 
    mainCsl: "4",
    description: "Division of joint assets, estates, or homes post-separation."
  },
  { 
    id: "REL031", 
    category: "relationship",
    name: "Reconciliation", 
    primary: "2,7,11", 
    supporting: "4,5", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Amicable settlement of marital disputes and coming back together."
  },
  { 
    id: "REL032", 
    category: "relationship",
    name: "Reunion After Separation", 
    primary: "2,7,11", 
    supporting: "4", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Re-establishing joint household after a period of separation."
  },
  { 
    id: "REL033", 
    category: "relationship",
    name: "Marriage Restored", 
    primary: "2,4,7,11", 
    supporting: "5,9", 
    obstructing: "1,6,10", 
    mainCsl: "7",
    description: "Full restoration of marital sanctity and legal withdrawal of petitions."
  },
  { 
    id: "REL034", 
    category: "relationship",
    name: "Secret Relationship", 
    primary: "5,12", 
    supporting: "8", 
    obstructing: "1,6,11", 
    mainCsl: "5",
    description: "Affectionate bond kept strictly hidden from family and society."
  },
  { 
    id: "REL035", 
    category: "relationship",
    name: "Hidden Affair", 
    primary: "5,12", 
    supporting: "3,8", 
    obstructing: "1,6,11", 
    mainCsl: "5",
    description: "Romantic partnership managed discreetly away from public eyes."
  },
  { 
    id: "REL036", 
    category: "relationship",
    name: "Extra-Marital Affair", 
    primary: "5,7,12", 
    supporting: "8", 
    obstructing: "1,6,11", 
    mainCsl: "5",
    description: "Romantic entanglement outside the legal boundary of marriage."
  },
  { 
    id: "REL037", 
    category: "relationship",
    name: "Physical Relationship", 
    primary: "5,7,12", 
    supporting: "8,11", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Intimate physical connection and sexual bonding."
  },
  { 
    id: "REL038", 
    category: "relationship",
    name: "Sexual Compatibility", 
    primary: "8,12", 
    supporting: "5,7", 
    obstructing: "1,6", 
    mainCsl: "8",
    description: "Physical harmony, matching desire levels, and bedroom happiness."
  },
  { 
    id: "REL039", 
    category: "relationship",
    name: "Emotional Compatibility", 
    primary: "4,5,7", 
    supporting: "11", 
    obstructing: "1,6,10", 
    mainCsl: "4,7",
    description: "Heartfelt connection, intellectual symmetry, and mental comfort."
  },
  { 
    id: "REL040", 
    category: "relationship",
    name: "Romantic Compatibility", 
    primary: "5,7", 
    supporting: "11", 
    obstructing: "1,6,10", 
    mainCsl: "5",
    description: "Romantic sparks, courtship bliss, and overall chemistry."
  },
  { 
    id: "REL041", 
    category: "relationship",
    name: "Live-in Relationship", 
    primary: "5,7,12", 
    supporting: "11", 
    obstructing: "2,6", 
    mainCsl: "7",
    description: "Cohabitation prior to or in lieu of legal marriage ceremonies."
  },
  { 
    id: "REL042", 
    category: "relationship",
    name: "Long Distance Relationship", 
    primary: "5,7,12", 
    supporting: "3,9", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Maintaining courtship despite significant physical distance."
  },
  { 
    id: "REL043", 
    category: "relationship",
    name: "Long Distance Marriage", 
    primary: "7,12", 
    supporting: "3,9", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Matrimonial setup requiring spouses to live in separate zones/countries."
  },
  { 
    id: "REL044", 
    category: "relationship",
    name: "Meeting Future Spouse", 
    primary: "7,11", 
    supporting: "3,5", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "First dynamic rendezvous or meeting with the future spouse."
  },
  { 
    id: "REL045", 
    category: "relationship",
    name: "Meeting Through Family", 
    primary: "2,7", 
    supporting: "4,11", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Introduction facilitated by family members or siblings."
  },
  { 
    id: "REL046", 
    category: "relationship",
    name: "Meeting Through Friends", 
    primary: "7,11", 
    supporting: "3,5", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "First introduction occurring in a social gathering or via friends."
  },
  { 
    id: "REL047", 
    category: "relationship",
    name: "Meeting Through Workplace", 
    primary: "6,7,10", 
    supporting: "11", 
    obstructing: "1,8", 
    mainCsl: "7",
    description: "Introduction or romance sparking in professional workspace."
  },
  { 
    id: "REL048", 
    category: "relationship",
    name: "Meeting During Travel", 
    primary: "7,9", 
    supporting: "3,12", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Rendezvous occurring while travelling or during an overseas trip."
  },
  { 
    id: "REL049", 
    category: "relationship",
    name: "Meeting Through Internet", 
    primary: "3,7,11", 
    supporting: "5", 
    obstructing: "1,6", 
    mainCsl: "7",
    description: "Matrimonial match discovered through social networks or dating websites."
  },
  { 
    id: "REL050", 
    category: "relationship",
    name: "Meeting Through Spiritual Circle", 
    primary: "7,9", 
    supporting: "12", 
    obstructing: "1,6", 
    mainCsl: "9",
    description: "Meeting occurring in ashrams, spiritual retreats, or temples."
  },
  { 
    id: "REL051", 
    category: "relationship",
    name: "Spouse Appearance", 
    primary: "7", 
    supporting: "1", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Evaluating the facial aesthetics and physical appearance of the spouse."
  },
  { 
    id: "REL052", 
    category: "relationship",
    name: "Spouse Physical Features", 
    primary: "7", 
    supporting: "1", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Height, physique, and bodily features of the marriage partner."
  },
  { 
    id: "REL053", 
    category: "relationship",
    name: "Spouse Nature", 
    primary: "7", 
    supporting: "4", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Temperament, patience levels, and general emotional makeup of the spouse."
  },
  { 
    id: "REL054", 
    category: "relationship",
    name: "Spouse Character", 
    primary: "7", 
    supporting: "5", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Integrity, moral values, and loyalty matrix of the spouse."
  },
  { 
    id: "REL055", 
    category: "relationship",
    name: "Spouse Education", 
    primary: "7", 
    supporting: "4,9", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Academic qualification and intellectual background of the spouse."
  },
  { 
    id: "REL056", 
    category: "relationship",
    name: "Spouse Profession", 
    primary: "7", 
    supporting: "10", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Career line, authority, and status of the matrimonial partner."
  },
  { 
    id: "REL057", 
    category: "relationship",
    name: "Spouse Wealth", 
    primary: "7", 
    supporting: "2,11", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Inherent wealth, assets, and prosperity level of the spouse."
  },
  { 
    id: "REL058", 
    category: "relationship",
    name: "Spouse Family Status", 
    primary: "7", 
    supporting: "2", 
    obstructing: "6,8", 
    mainCsl: "7",
    description: "Social pedigree, reputation, and background of the spouse's family."
  },
  { 
    id: "NEW059", 
    category: "relationship",
    name: "The Friendzone Dynamic", 
    primary: "5,11", 
    supporting: "3", 
    obstructing: "2,7", 
    mainCsl: "5",
    description: "Affectionate bond that remains non-matrimonial and restricted to friendship."
  },
  { 
    id: "NEW060", 
    category: "relationship",
    name: "Ghosting / Sudden Breakup", 
    primary: "4,6,10", 
    supporting: "8,12", 
    obstructing: "2,5,11", 
    mainCsl: "5",
    description: "Sudden or unexplained cessation of relationship communication."
  },
  { 
    id: "NEW061", 
    category: "relationship",
    name: "Void / Nullified Marriage", 
    primary: "1,8,12", 
    supporting: "6", 
    obstructing: "2,7,11", 
    mainCsl: "8",
    description: "Matrimony declared legally void, non-binding, or fraudulent."
  },
  { 
    id: "NEW062", 
    category: "relationship",
    name: "Dowry Disputes / Harassment", 
    primary: "6,8", 
    supporting: "1", 
    obstructing: "2,11", 
    mainCsl: "8",
    description: "Legal or household friction relating to property demands."
  },
  { 
    id: "NEW063", 
    category: "relationship",
    name: "Second Marriage / Remarriage", 
    primary: "2,9,11", 
    supporting: "5", 
    obstructing: "1,8,10", 
    mainCsl: "2",
    description: "Matrimony following dissolution or loss of first spouse."
  },
  { 
    id: "NEW064", 
    category: "relationship",
    name: "Third Marriage", 
    primary: "11,2", 
    supporting: "7", 
    obstructing: "6,10", 
    mainCsl: "11",
    description: "Matrimonial union celebrating third legal marriage."
  },

  // Career & Profession (CAR)
  {
    id: "CAR001",
    category: "career",
    name: "Job Procurement / Joining Service",
    primary: "2,6,10,11",
    supporting: "1",
    obstructing: "5,8,12",
    mainCsl: "10, 6",
    description: "Entry into new job. 2nd (wealth), 6th (regular job/service), 10th (status/profession), 11th (gains) must be active."
  },
  {
    id: "CAR002",
    category: "career",
    name: "Promotion & Status Elevation",
    primary: "6,10,11",
    supporting: "2,3",
    obstructing: "5,8,12",
    mainCsl: "10",
    description: "Elevation in rank or pay scale. Strong connection of 10th CSL to 6th (service) and 11th (fulfilment of ambition)."
  },
  {
    id: "CAR003",
    category: "career",
    name: "Change of Job or Location",
    primary: "3,5,10",
    supporting: "6,9,11",
    obstructing: "1,4",
    mainCsl: "10, 5",
    description: "Voluntary job hop. 3rd (leaving old coordinates), 5th (change of career coordinates) and 10th (new position)."
  },
  {
    id: "CAR004",
    category: "career",
    name: "Suspension or Loss of Job",
    primary: "5,8,12",
    supporting: "1",
    obstructing: "2,6,10,11",
    mainCsl: "10, 6",
    description: "Involuntary job exit or redundancy. 5th house acts as the negation (12th) from 6th (job), causing sudden removal."
  },
  {
    id: "CAR005",
    category: "career",
    name: "Independent Business Launch",
    primary: "2,7,10,11",
    supporting: "3",
    obstructing: "5,6,8",
    mainCsl: "7, 10",
    description: "Starting business or partnership trade. 7th house governs direct trade, clients, and commercial transactions."
  },

  // Finance & Wealth (FIN)
  {
    id: "FIN001",
    category: "finance",
    name: "Wealth Accumulation / Savings",
    primary: "2,6,11",
    supporting: "5,9",
    obstructing: "1,8,12",
    mainCsl: "2, 11",
    description: "Steady financial gains. 2nd house (accumulated bank balance), 6th (receipt of payments) and 11th (net profit)."
  },
  {
    id: "FIN002",
    category: "finance",
    name: "Speculative Gains & Windfalls",
    primary: "2,5,8,11",
    supporting: "9",
    obstructing: "3,6,12",
    mainCsl: "11, 5",
    description: "Sudden lottery, stock trading profit, or crypto windfalls. 5th house rules high-risk speculation; 8th rules unearned/sudden wealth."
  },
  {
    id: "FIN003",
    category: "finance",
    name: "Debt Procurement / Bank Loans",
    primary: "6,8,11",
    supporting: "2",
    obstructing: "5,12",
    mainCsl: "6",
    description: "Securing financial loans. 6th house rules debt, while 8th rules external or shared financial resources."
  },
  {
    id: "FIN004",
    category: "finance",
    name: "Financial Loss / Bankruptcy",
    primary: "5,8,12",
    supporting: "12",
    obstructing: "2,6,11",
    mainCsl: "12, 2",
    description: "Severe financial drain or business insolvency. Negating houses 5 (loss of service), 8 (blockage), and 12 (pure expenditure)."
  },

  // Health & Vitality (HEA)
  {
    id: "HEA001",
    category: "health",
    name: "Illness Manifestation",
    primary: "6,8,12",
    supporting: "1",
    obstructing: "5,11",
    mainCsl: "6",
    description: "Disease onset. 6th house is disease, 8th is acute/painful condition, 12th is confinement. Active when 5 and 11 are dormant."
  },
  {
    id: "HEA002",
    category: "health",
    name: "Hospitalisation",
    primary: "8,12",
    supporting: "6",
    obstructing: "5,11",
    mainCsl: "12",
    description: "Clinical admission or bed confinement. Requires strong activation of 12th house (isolation/hospitals) and 8th house (emergency)."
  },
  {
    id: "HEA003",
    category: "health",
    name: "Speedy Medical Recovery",
    primary: "5,11",
    supporting: "1",
    obstructing: "6,8,12",
    mainCsl: "11, 5",
    description: "Regaining energy and neutralizing disease. 5th house is 12th from 6th (negating illness); 11th is 12th from 12th (negating hospitals)."
  },

  // Legal & Litigation (LEG)
  {
    id: "LEG001",
    category: "litigation",
    name: "Litigation Victory / Court Win",
    primary: "6,11",
    supporting: "1,3",
    obstructing: "5,8,12",
    mainCsl: "6",
    description: "Favorable court judgment. 6th house is the opponent's defeat (12th from 7th) and 11th is Native's victory and desire fulfilment."
  },
  {
    id: "LEG002",
    category: "litigation",
    name: "Litigation Defeat / Adverse Judgment",
    primary: "5,8,12",
    supporting: "7",
    obstructing: "6,11",
    mainCsl: "6",
    description: "Losing a court dispute. The opponent gains (7th house and its supporting 12, 5 houses) while Native faces losses."
  },
  {
    id: "LEG003",
    category: "litigation",
    name: "Arrest / Legal Custody",
    primary: "3,8,12",
    supporting: "12",
    obstructing: "2,11",
    mainCsl: "12",
    description: "Confinement by state authorities. 3rd is change of environment, 8th is restriction/humiliation, 12th is imprisonment."
  },

  // Education & Exams (EDU)
  {
    id: "EDU001",
    category: "education",
    name: "Higher Academic Milestones",
    primary: "4,9,11",
    supporting: "5",
    obstructing: "3,8,12",
    mainCsl: "4, 9",
    description: "Successful graduation or post-graduate admission. 4th house is basic education, 9th is deep university research and higher wisdom."
  },
  {
    id: "EDU002",
    category: "education",
    name: "Competitive Exam Success",
    primary: "6,11",
    supporting: "4,9",
    obstructing: "5,12",
    mainCsl: "6",
    description: "Clearing entrance exams or civil services. 6th house is overcoming peer competition; 11th is absolute success/securing seat."
  },
  {
    id: "EDU003",
    category: "education",
    name: "Academic Distraction / Break",
    primary: "3,5,8,12",
    supporting: "-",
    obstructing: "4,9,11",
    mainCsl: "4",
    description: "Temporary disruption in studies. 3rd house is 12th from 4th (negating basic study concentration); 5th is playful mind."
  },

  // Property & Assets (EST)
  {
    id: "EST001",
    category: "property",
    name: "Buying Real Estate / Home",
    primary: "4,11,12",
    supporting: "9",
    obstructing: "3,8",
    mainCsl: "4",
    description: "Acquiring permanent immovable assets. 4th house rules land/buildings, 11th is gain of property, 12th is investment/payment."
  },
  {
    id: "EST002",
    category: "property",
    name: "Selling Real Estate for Profit",
    primary: "3,10,12",
    supporting: "5",
    obstructing: "4,11",
    mainCsl: "4, 10",
    description: "Liquidating land or home. 3rd is 12th from 4th (parting with asset), 10th is gain of status/buyer, 12th is receipt of funds."
  },

  // Foreign Travel & Residency (TRA)
  {
    id: "TRA001",
    category: "travel",
    name: "Visa Approval / Foreign Tour",
    primary: "3,9,12",
    supporting: "11",
    obstructing: "4",
    mainCsl: "12, 9",
    description: "Short overseas trip. 3rd is short journeys, 9th is long-distance voyages, 12th is foreign territory."
  },
  {
    id: "TRA002",
    category: "travel",
    name: "Permanent Overseas Settlement",
    primary: "4,9,12",
    supporting: "12",
    obstructing: "1,4",
    mainCsl: "12",
    description: "Relocating abroad permanently. 12th house (negating motherland/4th house) must be stronger than home-base comforts (4th house)."
  }
];

interface EventBookViewProps {
  astrologyData: any;
  isDark: boolean;
}

export default function EventBookView({ astrologyData, isDark }: EventBookViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "relationship" | "career" | "finance" | "health" | "litigation" | "education" | "property" | "travel">("all");

  const categories = useMemo(() => [
    { id: "all", label: "All Events", icon: Layers, count: relEvents.length },
    { id: "relationship", label: "Relationships", icon: Heart, count: relEvents.filter(e => e.category === "relationship").length },
    { id: "career", label: "Career & Service", icon: Briefcase, count: relEvents.filter(e => e.category === "career").length },
    { id: "finance", label: "Wealth & Finance", icon: Coins, count: relEvents.filter(e => e.category === "finance").length },
    { id: "health", label: "Health & Recovery", icon: ShieldAlert, count: relEvents.filter(e => e.category === "health").length },
    { id: "litigation", label: "Court Litigation", icon: Scale, count: relEvents.filter(e => e.category === "litigation").length },
    { id: "education", label: "Exams & Education", icon: GraduationCap, count: relEvents.filter(e => e.category === "education").length },
    { id: "property", label: "Property & Lands", icon: Home, count: relEvents.filter(e => e.category === "property").length },
    { id: "travel", label: "Overseas Travel", icon: Globe, count: relEvents.filter(e => e.category === "travel").length }
  ], []);

  const filteredEvents = useMemo(() => {
    return relEvents.filter((ev) => {
      const matchesSearch = 
        ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.primary.includes(searchTerm) ||
        ev.mainCsl.includes(searchTerm) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || ev.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? "bg-slate-950/40 border-slate-800/80" : "bg-white border-slate-200"
      } shadow-xl relative overflow-hidden`}>
        {/* Ambient lighting */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl rounded-full -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full inline-block">
              KP Astrology Core Engine
            </span>
            <h3 className={`text-xl font-sans font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"} flex items-center gap-2.5`}>
              <BookOpen className="w-5 h-5 text-amber-500" />
              KP System Master Eventbook
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Unified database referencing lifetime promises, support chains, and negating houses across multiple life departments.
              Maps exact Placidus cuspal requirements based on core Krishnamurti Paddhati (KP) stellar rules.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800/80 p-2 rounded-xl text-xs shrink-0 font-mono">
            <div className="text-center px-3 py-1 border-r border-slate-800">
              <span className="text-slate-500 block text-[9px] uppercase">Registered Events</span>
              <span className="text-slate-200 font-bold">{relEvents.length} Events</span>
            </div>
            <div className="text-center px-3 py-1">
              <span className="text-slate-500 block text-[9px] uppercase">Active Domains</span>
              <span className="text-slate-200 font-bold">8 Categories</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <Search className="w-4 h-4 text-slate-400 ml-1.5" />
          <input
            type="text"
            placeholder="Search events, primary houses, or cuspal sub-lords (e.g., CAR001, Promotion, CSL 10)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 placeholder-slate-500 focus:ring-0 focus:outline-none"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="text-slate-400 hover:text-slate-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Astro Reference Banner */}
      <div className={`p-4 rounded-xl border flex gap-3 items-start ${
        isDark ? "bg-amber-950/10 border-amber-500/20 text-slate-300" : "bg-amber-50 border-amber-200 text-amber-900"
      }`}>
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400">Astrological Eventbook Rule Mapping Policy</p>
          <p className="text-[11px] text-slate-400 leading-normal">
            For any event to manifest, the running **Dasha-Bhukti-Antardasha (DBA)** planets must signify the **Primary** and **Supporting** houses listed below without receiving strong obstructions from **Obstructing** (negating) houses. The **Main CSL** controls the natal promise limit.
          </p>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all border shrink-0 ${
                isActive 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-sm" 
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1 rounded-md ${
                isActive ? "bg-amber-500/20 text-amber-300" : "bg-slate-850 text-slate-500"
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Events List Workspace */}
      <div className={`p-6 rounded-2xl border ${isDark ? "bg-slate-950/20 border-slate-800/60" : "bg-white border-slate-200"} space-y-4`}>
        <div className="border-b border-slate-800/50 pb-3 flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
            <span>●</span> {selectedCategory === "all" ? "MASTER KP EVENT DIRECTORY" : `${selectedCategory.toUpperCase()} EVENT DICTIONARY`}
          </h4>
          <span className="text-[10px] font-mono text-slate-500">Showing {filteredEvents.length} events</span>
        </div>

        {/* Events Table / Grid */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[12%]">
                  Event ID
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[35%]">
                  Event Name & Definition
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Primary
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Supporting
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[13%]">
                  Obstructing
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[14%]">
                  Main CSL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/20">
              {filteredEvents.map((event) => {
                return (
                  <tr key={event.id} className="hover:bg-slate-900/10 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-amber-500">{event.id}</span>
                    </td>

                    {/* Event Name & Description */}
                    <td className="px-4 py-3">
                      <div className="space-y-1 pr-4">
                        <span className="text-xs font-bold text-slate-200 block">{event.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans block leading-relaxed">{event.description}</span>
                      </div>
                    </td>

                    {/* Primary Houses */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10">
                        {event.primary}
                      </span>
                    </td>

                    {/* Supporting Houses */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-mono ${event.supporting === "-" ? "text-slate-600" : "text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/10"}`}>
                        {event.supporting}
                      </span>
                    </td>

                    {/* Obstructing Houses */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-mono ${event.obstructing === "-" ? "text-slate-600" : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10"}`}>
                        {event.obstructing}
                      </span>
                    </td>

                    {/* Main CSL */}
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                        CSL {event.mainCsl}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 text-xs italic">
                    No matching events found in active category. Try adjusting your search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
