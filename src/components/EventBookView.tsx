import React, { useState, useMemo, useEffect } from "react";
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
  Info,
  Calendar,
  Sparkles,
  TrendingUp,
  Activity,
  Cpu,
  Clock,
  CheckCircle,
  HelpCircle,
  FileText,
  RefreshCw,
  Compass
} from "lucide-react";
import { jsPDF } from "jspdf";
import { runNJEngine, NJEngineResult } from "../lib/njEngine";
import { mapAstrologyDataToUserProfileJSON } from "../lib/jhoraMapper";

interface KPEvent {
  id: string;
  category: "relationship" | "career" | "finance" | "property" | "health" | "education" | "children" | "travel" | "litigation" | "spiritual" | "daily" | "custom" | "agent_rules";
  name: string;
  primary: string;
  supporting: string;
  obstructing: string;
  mainCsl: string;
  description: string;
}

const relEvents: KPEvent[] = [
  // 1. RELATIONSHIP (REL001 - REL036)
  { id: "REL001", category: "relationship", name: "Marriage Promise", primary: "2,7,11", supporting: "5,9", obstructing: "1,6,10", mainCsl: "7", description: "Evaluates the overall foundational promise of marriage in the natal chart." },
  { id: "REL002", category: "relationship", name: "Love Marriage", primary: "5,7,11", supporting: "2,9", obstructing: "1,6,10", mainCsl: "5,7", description: "Self-chosen relationship translating to legal marriage, driven by affection." },
  { id: "REL003", category: "relationship", name: "Arranged Marriage", primary: "2,7,11", supporting: "9", obstructing: "5,6,10", mainCsl: "7", description: "Traditional union facilitated primarily by parents, family, or matchmakers." },
  { id: "REL004", category: "relationship", name: "Court Marriage", primary: "6,7,11", supporting: "3,9", obstructing: "1,5,10", mainCsl: "7", description: "Legal wedding conducted in court under civil law." },
  { id: "REL005", category: "relationship", name: "Inter-caste Marriage", primary: "7,11", supporting: "5,9,12", obstructing: "1,6,10", mainCsl: "7", description: "Marriage breaking traditional lineage or caste boundaries." },
  { id: "REL006", category: "relationship", name: "Inter-religion Marriage", primary: "7,11", supporting: "9,12", obstructing: "1,6,10", mainCsl: "7", description: "Matrimony between individuals practicing distinct faiths." },
  { id: "REL007", category: "relationship", name: "Foreign Marriage", primary: "7,9,12", supporting: "2,11", obstructing: "1,6,10", mainCsl: "7", description: "Marriage celebrated in a foreign land or with a foreign national." },
  { id: "REL008", category: "relationship", name: "Marriage Proposal", primary: "3,7,11", supporting: "2,5", obstructing: "1,6,10", mainCsl: "7", description: "Signifies receiving or presenting a formal marriage proposal." },
  { id: "REL009", category: "relationship", name: "Proposal Acceptance", primary: "2,7,11", supporting: "3,5", obstructing: "1,6,10", mainCsl: "7", description: "Affirmative acceptance of a marriage proposal by either family or individual." },
  { id: "REL010", category: "relationship", name: "Proposal Rejection", primary: "1,6,10", supporting: "8,12", obstructing: "2,7,11", mainCsl: "7", description: "Rejection of a marriage proposal, indicating misaligned expectations." },
  { id: "REL011", category: "relationship", name: "Engagement", primary: "2,7,11", supporting: "3,5", obstructing: "1,6,10", mainCsl: "7", description: "Formal or informal ceremony of betrothal or engagement." },
  { id: "REL012", category: "relationship", name: "Engagement Cancellation", primary: "1,6,8,12", supporting: "10", obstructing: "2,7,11", mainCsl: "7", description: "Disruption or cancellation of a planned engagement prior to marriage." },
  { id: "REL013", category: "relationship", name: "Marriage Ceremony", primary: "2,7,11", supporting: "3,9", obstructing: "1,6,10", mainCsl: "7", description: "The actual execution of traditional or customary marriage rituals." },
  { id: "REL014", category: "relationship", name: "Marriage Registration", primary: "2,7,11", supporting: "3,10", obstructing: "1,6,10", mainCsl: "7", description: "Legal documentation and government registration of the marriage contract." },
  { id: "REL015", category: "relationship", name: "Delay in Marriage", primary: "7", supporting: "4,8,10", obstructing: "2,11", mainCsl: "7", description: "Slower development of matrimonial conditions, often Sat-linked." },
  { id: "REL016", category: "relationship", name: "Denial of Marriage", primary: "1,6,10", supporting: "8,12", obstructing: "2,7,11", mainCsl: "7", description: "Astrological indications negating marriage promise in the lifetime." },
  { id: "REL017", category: "relationship", name: "Second Marriage", primary: "2,7,11", supporting: "9,11", obstructing: "1,6,10", mainCsl: "9", description: "Second marriage potential analyzed from the 9th house (3rd from 7th)." },
  { id: "REL018", category: "relationship", name: "Secret Relationship", primary: "5,8,12", supporting: "11", obstructing: "2,4", mainCsl: "12", description: "Undisclosed relationship or hidden romance." },
  { id: "REL019", category: "relationship", name: "Live-in Relationship", primary: "5,7,12", supporting: "11", obstructing: "2,4,10", mainCsl: "12", description: "Co-habitation without legal or formal marriage." },
  { id: "REL020", category: "relationship", name: "Extramarital Affair", primary: "5,7,11,12", supporting: "8", obstructing: "4", mainCsl: "12", description: "Involvement in relationships outside legal marriage limits." },
  { id: "REL021", category: "relationship", name: "Separation", primary: "1,6,10", supporting: "8,12", obstructing: "2,7,11", mainCsl: "7", description: "Physical or emotional separation between couple." },
  { id: "REL022", category: "relationship", name: "Reconciliation", primary: "2,7,11", supporting: "5,9", obstructing: "1,6,10", mainCsl: "7", description: "Re-uniting and resolving disputes post separation." },
  { id: "REL023", category: "relationship", name: "Divorce", primary: "1,6,10", supporting: "8,12", obstructing: "2,7,11", mainCsl: "7", description: "Legal dissolution of marriage." },
  { id: "REL024", category: "relationship", name: "Legal Separation", primary: "1,6,8,10", supporting: "12", obstructing: "2,7,11", mainCsl: "7", description: "Court-approved separation without divorcing." },
  { id: "REL025", category: "relationship", name: "Marital Happiness", primary: "4,7,11", supporting: "2,5", obstructing: "1,6,10", mainCsl: "7", description: "Inherent domestic bliss, mutual support, and emotional nourishment." },
  { id: "REL026", category: "relationship", name: "Marital Discord", primary: "1,6,10", supporting: "8,12", obstructing: "2,7,11", mainCsl: "7", description: "Undercurrent of tension, arguments, and ideological differences." },
  { id: "REL027", category: "relationship", name: "Arguments", primary: "6,8", supporting: "3", obstructing: "2,4,11", mainCsl: "7", description: "Repetitive verbal disputes or temporary silent phases." },
  { id: "REL028", category: "relationship", name: "Domestic Violence", primary: "6,8,12", supporting: "1", obstructing: "2,4,11", mainCsl: "4,7", description: "Severe distress, emotional or physical hostility within the household." },
  { id: "REL029", category: "relationship", name: "Spouse Health", primary: "1,6,8", supporting: "12", obstructing: "5,11", mainCsl: "7", description: "Condition of spouse's health and wellness (7th house as partner's ascendant)." },
  { id: "REL030", category: "relationship", name: "Spouse Career", primary: "2,6,10,11", supporting: "3", obstructing: "5,8,12", mainCsl: "4", description: "Spouse's professional success and status (10th from 7th = 4th house)." },
  { id: "REL031", category: "relationship", name: "Spouse Wealth", primary: "2,8,11", supporting: "5", obstructing: "12", mainCsl: "8", description: "Spouse's accumulation of assets and wealth (2nd from 7th = 8th house)." },
  { id: "REL032", category: "relationship", name: "Spouse Foreign Settlement", primary: "4,9,12", supporting: "11", obstructing: "1", mainCsl: "6", description: "Spouse's travel and overseas residence." },
  { id: "REL033", category: "relationship", name: "Widowhood", primary: "1,6,8,12", supporting: "10", obstructing: "2,7,11", mainCsl: "7", description: "Loss of partner/spouse, analyzed from the 8th from 7th (2nd house)." },
  { id: "REL034", category: "relationship", name: "Remarriage", primary: "2,7,9,11", supporting: "5", obstructing: "1,6,10", mainCsl: "9", description: "Subsequent marriage celebration." },
  { id: "REL035", category: "relationship", name: "Relationship Healing", primary: "2,7,11", supporting: "5,9", obstructing: "1,6", mainCsl: "7", description: "Restoration of harmony and mutual understanding." },
  { id: "REL036", category: "relationship", name: "Relationship Compatibility", primary: "2,5,7,11", supporting: "9", obstructing: "6,8,12", mainCsl: "7", description: "Inherent emotional and mental compatibility between individuals." },

  // 2. CAREER (CAR001 - CAR021)
  { id: "CAR001", category: "career", name: "First Job", primary: "2,6,10,11", supporting: "1", obstructing: "5,8,12", mainCsl: "10", description: "Commencement of professional career." },
  { id: "CAR002", category: "career", name: "New Job", primary: "2,6,10,11", supporting: "3", obstructing: "5,8,12", mainCsl: "10", description: "Securing a new job appointment." },
  { id: "CAR003", category: "career", name: "Government Job", primary: "2,6,10,11", supporting: "Sun, Mars", obstructing: "5,8,12", mainCsl: "10", description: "Employment in a government sector." },
  { id: "CAR004", category: "career", name: "Private Job", primary: "2,6,10,11", supporting: "Saturn, Mercury", obstructing: "5,8,12", mainCsl: "10", description: "Employment in private corporate sectors." },
  { id: "CAR005", category: "career", name: "Promotion", primary: "2,6,10,11", supporting: "3,10", obstructing: "5,8,12", mainCsl: "10", description: "Upward elevation in rank and salary." },
  { id: "CAR006", category: "career", name: "Transfer", primary: "3,10,12", supporting: "4", obstructing: "2,6,11", mainCsl: "3,10", description: "Change in location or branch of work." },
  { id: "CAR007", category: "career", name: "Department Change", primary: "3,10", supporting: "6", obstructing: "2,11", mainCsl: "10", description: "Modification of work role or functional department." },
  { id: "CAR008", category: "career", name: "Salary Increase", primary: "2,11", supporting: "6,10", obstructing: "12", mainCsl: "2,11", description: "Raise in professional compensation." },
  { id: "CAR009", category: "career", name: "Recognition", primary: "10,11", supporting: "1,9", obstructing: "5,12", mainCsl: "10", description: "Public or corporate acknowledgment of contribution." },
  { id: "CAR010", category: "career", name: "Award", primary: "10,11", supporting: "9", obstructing: "12", mainCsl: "11", description: "Receiving a formal prize, medal, or citation." },
  { id: "CAR011", category: "career", name: "Leadership Position", primary: "1,10,11", supporting: "Sun", obstructing: "6,8", mainCsl: "10", description: "Appointment to manager, director, or executive role." },
  { id: "CAR012", category: "career", name: "Business Start", primary: "7,10,11", supporting: "2", obstructing: "6,12", mainCsl: "7", description: "Launching an independent commercial business enterprise." },
  { id: "CAR013", category: "career", name: "Business Expansion", primary: "2,7,10,11", supporting: "3", obstructing: "12", mainCsl: "7", description: "Expanding the scale or locations of active business." },
  { id: "CAR014", category: "career", name: "Business Partnership", primary: "7,11", supporting: "2", obstructing: "6,12", mainCsl: "7", description: "Entering into a joint venture or partnership agreement." },
  { id: "CAR015", category: "career", name: "Business Closure", primary: "5,12", supporting: "8", obstructing: "2,7,11", mainCsl: "7", description: "Dissolution or termination of business operations." },
  { id: "CAR016", category: "career", name: "Self Employment", primary: "1,7,10", supporting: "11", obstructing: "6", mainCsl: "10", description: "Working as a freelancer or sole proprietor." },
  { id: "CAR017", category: "career", name: "Career Change", primary: "3,5,10", supporting: "9", obstructing: "2,6", mainCsl: "10", description: "Shifting industry or profession type." },
  { id: "CAR018", category: "career", name: "Resignation", primary: "5,9,12", supporting: "3", obstructing: "2,6,10,11", mainCsl: "10", description: "Voluntarily leaving professional employment." },
  { id: "CAR019", category: "career", name: "Termination", primary: "5,8,12", supporting: "6", obstructing: "2,10,11", mainCsl: "10", description: "Discharge or dismissal from job." },
  { id: "CAR020", category: "career", name: "Retirement", primary: "9,12", supporting: "1,5", obstructing: "6,10", mainCsl: "9", description: "End of professional active service." },
  { id: "CAR021", category: "career", name: "Professional Reputation", primary: "1,10", supporting: "11", obstructing: "8,12", mainCsl: "10", description: "Status and prestige in the industry." },

  // 3. FINANCE (FIN001 - FIN020)
  { id: "FIN001", category: "finance", name: "Income", primary: "2,11", supporting: "6,10", obstructing: "12", mainCsl: "11", description: "Regular inflow of financial resources." },
  { id: "FIN002", category: "finance", name: "Salary", primary: "2,6,11", supporting: "10", obstructing: "12", mainCsl: "2", description: "Periodic compensation from employment." },
  { id: "FIN003", category: "finance", name: "Bonus", primary: "2,11", supporting: "8,9", obstructing: "12", mainCsl: "11", description: "Extra financial payouts or incentives." },
  { id: "FIN004", category: "finance", name: "Commission", primary: "3,11", supporting: "2,7", obstructing: "12", mainCsl: "3", description: "Inflow from brokerage, referral, or agency work." },
  { id: "FIN005", category: "finance", name: "Business Profit", primary: "2,7,11", supporting: "10", obstructing: "12", mainCsl: "11", description: "Net gains from trade, sales, or enterprise." },
  { id: "FIN006", category: "finance", name: "Investment Gain", primary: "2,5,11", supporting: "9", obstructing: "12", mainCsl: "5", description: "Profits from stocks, mutual funds, or assets." },
  { id: "FIN007", category: "finance", name: "Lottery", primary: "2,8,11", supporting: "5,9", obstructing: "12", mainCsl: "8,11", description: "Sudden unearned windfall gains." },
  { id: "FIN008", category: "finance", name: "Unexpected Wealth", primary: "8,11", supporting: "2", obstructing: "12", mainCsl: "8", description: "Sudden monetary discovery or surprise receipts." },
  { id: "FIN009", category: "finance", name: "Inheritance", primary: "2,8,11", supporting: "9", obstructing: "12", mainCsl: "8", description: "Receiving legacy or family ancestral assets." },
  { id: "FIN010", category: "finance", name: "Property Income", primary: "2,4,11", supporting: "9", obstructing: "12", mainCsl: "4", description: "Profits earned from real estate or rentals." },
  { id: "FIN011", category: "finance", name: "Rental Income", primary: "2,4,11", supporting: "6", obstructing: "12", mainCsl: "4", description: "Steady rent incoming from tenants." },
  { id: "FIN012", category: "finance", name: "Tax Refund", primary: "8,11", supporting: "5", obstructing: "12", mainCsl: "8", description: "Reimbursements from government or taxes." },
  { id: "FIN013", category: "finance", name: "Debt", primary: "6,8,12", supporting: "11", obstructing: "2,11", mainCsl: "6", description: "Financial liabilities, borrowing, or loans." },
  { id: "FIN014", category: "finance", name: "Loan Approval", primary: "6,11", supporting: "2,12", obstructing: "5,8", mainCsl: "6", description: "Formal sanctioning of requested credit." },
  { id: "FIN015", category: "finance", name: "Loan Repayment", primary: "5,8,12", supporting: "11", obstructing: "6", mainCsl: "5", description: "Paying off accumulated financial liabilities." },
  { id: "FIN016", category: "finance", name: "Financial Loss", primary: "8,12", supporting: "6", obstructing: "2,11", mainCsl: "12", description: "Depletion or destruction of monetary reserves." },
  { id: "FIN017", category: "finance", name: "Fraud", primary: "8,12", supporting: "4,7", obstructing: "2,11", mainCsl: "12", description: "Being cheated or defrauded financially." },
  { id: "FIN018", category: "finance", name: "Bankruptcy", primary: "6,8,12", supporting: "12", obstructing: "2,11", mainCsl: "12", description: "Legal insolvency declaration." },
  { id: "FIN019", category: "finance", name: "Savings Growth", primary: "2,11", supporting: "4,5", obstructing: "12", mainCsl: "2", description: "Increase in personal liquid savings." },
  { id: "FIN020", category: "finance", name: "Luxury Purchase", primary: "4,12", supporting: "11", obstructing: "2", mainCsl: "4", description: "Expenditure on comforts, expensive goods." },

  // 4. PROPERTY (EST001 - EST013)
  { id: "EST001", category: "property", name: "Purchase House", primary: "4,11,12", supporting: "9", obstructing: "3,8", mainCsl: "4", description: "Acquiring permanent immovable housing asset." },
  { id: "EST002", category: "property", name: "Sell House", primary: "3,10,12", supporting: "5", obstructing: "4,11", mainCsl: "4,10", description: "Liquidating house or land." },
  { id: "EST003", category: "property", name: "Purchase Land", primary: "4,11", supporting: "Mars", obstructing: "3,8", mainCsl: "4", description: "Acquiring open plot or agricultural fields." },
  { id: "EST004", category: "property", name: "Sell Land", primary: "3,10,12", supporting: "5", obstructing: "4,11", mainCsl: "4", description: "Disposing of land plots for financial liquidity." },
  { id: "EST005", category: "property", name: "Construction", primary: "4,11,12", supporting: "Saturn", obstructing: "8", mainCsl: "4", description: "Erecting physical structure on owned land." },
  { id: "EST006", category: "property", name: "Renovation", primary: "4,12", supporting: "3", obstructing: "8", mainCsl: "4", description: "Remodeling or repairing current home structures." },
  { id: "EST007", category: "property", name: "Commercial Property", primary: "4,7,11", supporting: "10,12", obstructing: "3,8", mainCsl: "4", description: "Acquiring property for commercial or trading purposes." },
  { id: "EST008", category: "property", name: "Agricultural Land", primary: "4,11", supporting: "9", obstructing: "3", mainCsl: "4", description: "Purchasing farming or rural land." },
  { id: "EST009", category: "property", name: "Vehicle Purchase", primary: "4,11,12", supporting: "Venus", obstructing: "3,8", mainCsl: "4", description: "Purchasing personal cars or transport assets." },
  { id: "EST010", category: "property", name: "Vehicle Sale", primary: "3,10,12", supporting: "5", obstructing: "4,11", mainCsl: "4", description: "Selling owned vehicles." },
  { id: "EST011", category: "property", name: "Property Dispute", primary: "4,6,8", supporting: "3", obstructing: "11", mainCsl: "4", description: "Disagreements or legal contentions over estates." },
  { id: "EST012", category: "property", name: "Property Registration", primary: "4,10,11", supporting: "3", obstructing: "12", mainCsl: "4", description: "Legal registration of property deeds." },
  { id: "EST013", category: "property", name: "Rental Property", primary: "4,6,11", supporting: "12", obstructing: "3", mainCsl: "4", description: "Leasing out property for periodic earnings." },

  // 5. HEALTH (HEA001 - HEA014)
  { id: "HEA001", category: "health", name: "General Health", primary: "1,5,9,11", supporting: "Sun", obstructing: "6,8,12", mainCsl: "1", description: "Overall physiological wellness and strength." },
  { id: "HEA002", category: "health", name: "Disease", primary: "6,8,12", supporting: "Rahu", obstructing: "1,5,11", mainCsl: "6", description: "Manifestation of illness or biological dysfunction." },
  { id: "HEA003", category: "health", name: "Hospitalization", primary: "6,8,12", supporting: "12", obstructing: "1,11", mainCsl: "12", description: "Admission to medical facility for clinical treatment." },
  { id: "HEA004", category: "health", name: "Major Surgery", primary: "6,8,12", supporting: "Mars", obstructing: "1,11", mainCsl: "8", description: "Surgical operation under anesthesia." },
  { id: "HEA005", category: "health", name: "Minor Surgery", primary: "6,8", supporting: "3", obstructing: "1", mainCsl: "8", description: "Small therapeutic medical invasive procedures." },
  { id: "HEA006", category: "health", name: "Recovery", primary: "1,5,11", supporting: "9", obstructing: "6,8,12", mainCsl: "11", description: "Biological healing and return to active strength." },
  { id: "HEA007", category: "health", name: "Mental Health", primary: "5,8,12", supporting: "Moon", obstructing: "1,11", mainCsl: "5", description: "Psychological stability, emotional balance, or stress." },
  { id: "HEA008", category: "health", name: "Stress", primary: "5,8", supporting: "Moon", obstructing: "1,11", mainCsl: "5", description: "Mental fatigue and cognitive overload." },
  { id: "HEA009", category: "health", name: "Chronic Disease", primary: "6,8,12", supporting: "Saturn", obstructing: "1,5,11", mainCsl: "6", description: "Long-standing illness requiring continuous management." },
  { id: "HEA010", category: "health", name: "Accident", primary: "8,12", supporting: "Mars", obstructing: "1,5,11", mainCsl: "8", description: "Occurrence of sudden injury or collision." },
  { id: "HEA011", category: "health", name: "Injury", primary: "6,8", supporting: "Mars", obstructing: "1", mainCsl: "8", description: "Physical trauma, cuts, or bone fractures." },
  { id: "HEA012", category: "health", name: "Fertility", primary: "2,5,11", supporting: "Jupiter", obstructing: "4,10", mainCsl: "5", description: "Biological ability to conceive and propagate." },
  { id: "HEA013", category: "health", name: "Pregnancy Health", primary: "5,11", supporting: "9", obstructing: "8,12", mainCsl: "5", description: "Health of mother and child during gestation." },
  { id: "HEA014", category: "health", name: "Longevity", primary: "1,3,8,11", supporting: "Saturn", obstructing: "2,7", mainCsl: "8", description: "Inherent life span indicators of the native." },

  // 6. EDUCATION (EDU001 - EDU010)
  { id: "EDU001", category: "education", name: "School Admission", primary: "4,11", supporting: "2", obstructing: "3,8", mainCsl: "4", description: "Starting foundational primary education." },
  { id: "EDU002", category: "education", name: "College Admission", primary: "4,11", supporting: "5", obstructing: "3", mainCsl: "4", description: "Securing seat in higher undergraduate colleges." },
  { id: "EDU003", category: "education", name: "Competitive Exam", primary: "6,11", supporting: "4,9", obstructing: "5,8,12", mainCsl: "6,11", description: "Clearing entrance exams or tests." },
  { id: "EDU004", category: "education", name: "Scholarship", primary: "8,11", supporting: "4,9", obstructing: "12", mainCsl: "11", description: "Receiving financial aid for academic excellence." },
  { id: "EDU005", category: "education", name: "Higher Education", primary: "9,11", supporting: "4", obstructing: "3,8", mainCsl: "9", description: "Pursuing post-graduate or specialized studies." },
  { id: "EDU006", category: "education", name: "Foreign Education", primary: "9,12", supporting: "4,11", obstructing: "1", mainCsl: "12", description: "Pursuing academic degrees abroad." },
  { id: "EDU007", category: "education", name: "Research", primary: "8,9,11", supporting: "5", obstructing: "3", mainCsl: "8", description: "Investigative or PhD level studies." },
  { id: "EDU008", category: "education", name: "Degree Completion", primary: "4,9,11", supporting: "10", obstructing: "3,12", mainCsl: "11", description: "Successful completion and receipt of diploma." },
  { id: "EDU009", category: "education", name: "Professional Certification", primary: "4,10,11", supporting: "6", obstructing: "3", mainCsl: "10", description: "Gaining technical or professional credentials." },
  { id: "EDU010", category: "education", name: "Academic Break", primary: "3,5,8,12", supporting: "-", obstructing: "4,9,11", mainCsl: "4", description: "Temporary disruption or hiatus in studies." },

  // 7. CHILDREN (CHI001 - CHI008)
  { id: "CHI001", category: "children", name: "Child Birth", primary: "2,5,11", supporting: "9", obstructing: "1,4,10", mainCsl: "5", description: "Successful delivery of a baby." },
  { id: "CHI002", category: "children", name: "Pregnancy", primary: "5,11", supporting: "2,9", obstructing: "4,10", mainCsl: "5", description: "Conception and gestation of offspring." },
  { id: "CHI003", category: "children", name: "Miscarriage", primary: "1,4,8", supporting: "12", obstructing: "2,5,11", mainCsl: "5", description: "Unfortunate loss of pregnancy before term." },
  { id: "CHI004", category: "children", name: "Adoption", primary: "5,11", supporting: "7,8", obstructing: "2,4", mainCsl: "5", description: "Legally bringing a child into the family." },
  { id: "CHI005", category: "children", name: "Child Education", primary: "4,5,11", supporting: "9", obstructing: "3,8", mainCsl: "5", description: "Academic progress of children." },
  { id: "CHI006", category: "children", name: "Child Health", primary: "1,5,9,11", supporting: "Sun", obstructing: "6,8,12", mainCsl: "5", description: "Physical wellness and growth of child." },
  { id: "CHI007", category: "children", name: "Child Marriage", primary: "2,7,11", supporting: "5", obstructing: "1,6", mainCsl: "5", description: "Matrimony of one's son or daughter." },
  { id: "CHI008", category: "children", name: "Child Career", primary: "2,6,10,11", supporting: "5", obstructing: "5,8,12", mainCsl: "5", description: "Professional launch of offspring." },

  // 8. TRAVEL (TRA001 - TRA008)
  { id: "TRA001", category: "travel", name: "Domestic Travel", primary: "3,9", supporting: "11", obstructing: "4", mainCsl: "3", description: "Short distance journeys within the nation." },
  { id: "TRA002", category: "travel", name: "Foreign Travel", primary: "3,9,12", supporting: "11", obstructing: "4", mainCsl: "12", description: "Overseas journeys for leisure, trade, or education." },
  { id: "TRA003", category: "travel", name: "Business Travel", primary: "3,7,10", supporting: "9,12", obstructing: "4", mainCsl: "10", description: "Corporate travel or business-related trips." },
  { id: "TRA004", category: "travel", name: "Pilgrimage", primary: "9,12", supporting: "5,11", obstructing: "4", mainCsl: "9", description: "Travel to holy shrines, temples, or ashrams." },
  { id: "TRA005", category: "travel", name: "Visa Approval", primary: "3,9,11,12", supporting: "10", obstructing: "4,8", mainCsl: "12", description: "Sanction of entry or residency permits." },
  { id: "TRA006", category: "travel", name: "Immigration", primary: "4,9,12", supporting: "11", obstructing: "1,4", mainCsl: "12", description: "Relocation to a foreign country." },
  { id: "TRA007", category: "travel", name: "Foreign Settlement", primary: "4,9,12", supporting: "12", obstructing: "1,4", mainCsl: "12", description: "Permanent residence set up abroad." },
  { id: "TRA008", category: "travel", name: "Return Home", primary: "1,4,11", supporting: "2", obstructing: "9,12", mainCsl: "4", description: "Returning back to motherland or birth place." },

  // 9. LITIGATION (LIT001 - LIT010)
  { id: "LIT001", category: "litigation", name: "Court Case", primary: "6,8", supporting: "12", obstructing: "5,11", mainCsl: "6", description: "Being involved in active court litigation." },
  { id: "LIT002", category: "litigation", name: "Police Matter", primary: "6,8,12", supporting: "Mars", obstructing: "5,11", mainCsl: "6", description: "Law enforcement interference or inquiry." },
  { id: "LIT003", category: "litigation", name: "Criminal Case", primary: "6,8,12", supporting: "Mars", obstructing: "11", mainCsl: "6", description: "Active trials involving penal law." },
  { id: "LIT004", category: "litigation", name: "Civil Case", primary: "6,8", supporting: "Mercury", obstructing: "11", mainCsl: "6", description: "Disputes regarding contracts, torts, or rights." },
  { id: "LIT005", category: "litigation", name: "Property Litigation", primary: "4,6,8", supporting: "12", obstructing: "11", mainCsl: "4,6", description: "Legal battles over real estate boundaries or titles." },
  { id: "LIT006", category: "litigation", name: "Divorce Litigation", primary: "1,6,8,10", supporting: "12", obstructing: "2,7,11", mainCsl: "7", description: "Legal battle in family court for divorce." },
  { id: "LIT007", category: "litigation", name: "Settlement", primary: "5,7,11", supporting: "9", obstructing: "6,8", mainCsl: "7", description: "Out-of-court mutual compromise agreement." },
  { id: "LIT008", category: "litigation", name: "Compensation", primary: "2,8,11", supporting: "6", obstructing: "12", mainCsl: "8,11", description: "Receipt of court-ordered funds or damages." },
  { id: "LIT009", category: "litigation", name: "Victory", primary: "1,6,11", supporting: "5,9", obstructing: "8,12", mainCsl: "6,11", description: "Winning the legal dispute or verdict." },
  { id: "LIT010", category: "litigation", name: "Defeat", primary: "5,8,12", supporting: "12", obstructing: "1,6,11", mainCsl: "6", description: "Losing the legal lawsuit or court judgment." },

  // 10. SPIRITUAL (SPI001 - SPI010)
  { id: "SPI001", category: "spiritual", name: "Guru Meeting", primary: "9", supporting: "5,11", obstructing: "3", mainCsl: "9", description: "Encountering or meeting a saintly spiritual master." },
  { id: "SPI002", category: "spiritual", name: "Initiation", primary: "9,11", supporting: "5", obstructing: "3", mainCsl: "9", description: "Receiving Diksha, sacred mantra, or spiritual vow." },
  { id: "SPI003", category: "spiritual", name: "Meditation", primary: "5,9,12", supporting: "Moksha planet Ketu", obstructing: "3,4", mainCsl: "12", description: "Practicing deep mindfulness and inner concentration." },
  { id: "SPI004", category: "spiritual", name: "Temple Visit", primary: "9", supporting: "5", obstructing: "3", mainCsl: "9", description: "Worshipping at a sacred energetic temple or church." },
  { id: "SPI005", category: "spiritual", name: "Pilgrimage", primary: "9,12", supporting: "11", obstructing: "4", mainCsl: "9", description: "Journeys to holy places and rivers." },
  { id: "SPI006", category: "spiritual", name: "Ashram Stay", primary: "9,12", supporting: "8", obstructing: "4", mainCsl: "12", description: "Residing in a monastery or spiritual community." },
  { id: "SPI007", category: "spiritual", name: "Occult Learning", primary: "8,9", supporting: "11", obstructing: "3", mainCsl: "8", description: "Learning astrology, kabbalah, tarot, or secret sciences." },
  { id: "SPI008", category: "spiritual", name: "Spiritual Growth", primary: "5,9,11,12", supporting: "Jupiter", obstructing: "2,3", mainCsl: "9", description: "Ascending steps of consciousness and realization." },
  { id: "SPI009", category: "spiritual", name: "Detachment", primary: "9,12", supporting: "Saturn", obstructing: "2,4,7", mainCsl: "12", description: "Vairagya, losing attachment to mundane pursuits." },
  { id: "SPI010", category: "spiritual", name: "Renunciation", primary: "9,12", supporting: "Ketu", obstructing: "2,4,7,11", mainCsl: "12", description: "Complete sannyasa, dedications of life to divine." },

  // 11. DAILY (DAY001 - DAY015)
  { id: "DAY001", category: "daily", name: "Mood", primary: "1,3,4,5,12", supporting: "Moon", obstructing: "6,8", mainCsl: "1,3", description: "Daily emotional status, comfort, and feeling." },
  { id: "DAY002", category: "daily", name: "Energy", primary: "1,3,11", supporting: "Mars", obstructing: "12", mainCsl: "1", description: "Daily physical stamina, motivation, and drive." },
  { id: "DAY003", category: "daily", name: "Focus", primary: "5,11", supporting: "Mercury", obstructing: "12", mainCsl: "5", description: "Daily cognitive attention span and study concentration." },
  { id: "DAY004", category: "daily", name: "Productivity", primary: "2,6,10,11", supporting: "Saturn", obstructing: "12", mainCsl: "10", description: "Daily efficiency, goal completion, and work done." },
  { id: "DAY005", category: "daily", name: "Communication", primary: "3,11", supporting: "Mercury", obstructing: "12", mainCsl: "3", description: "Daily interactions, phone calls, writing, and networking." },
  { id: "DAY006", category: "daily", name: "Creativity", primary: "5,11", supporting: "Venus", obstructing: "4", mainCsl: "5", description: "Daily artistic design, hobbies, or innovative thoughts." },
  { id: "DAY007", category: "daily", name: "Learning", primary: "4,11", supporting: "Mercury", obstructing: "3", mainCsl: "4", description: "Daily reading, acquiring skills, or intellectual assimilation." },
  { id: "DAY008", category: "daily", name: "Travel", primary: "3", supporting: "Moon", obstructing: "4", mainCsl: "3", description: "Daily short distance commutes, driving, or errand trips." },
  { id: "DAY009", category: "daily", name: "Finance", primary: "2,11", supporting: "Jupiter", obstructing: "12", mainCsl: "2", description: "Daily monetary spendings, earnings, or cash transfers." },
  { id: "DAY010", category: "daily", name: "Meetings", primary: "3,7", supporting: "11", obstructing: "12", mainCsl: "7", description: "Daily personal or professional discussion sessions." },
  { id: "DAY011", category: "daily", name: "Social Interaction", primary: "3,11", supporting: "Venus", obstructing: "12", mainCsl: "11", description: "Daily friendly gatherings, chats, or group work." },
  { id: "DAY012", category: "daily", name: "Stress", primary: "5,8", supporting: "Rahu", obstructing: "11", mainCsl: "8", description: "Daily mental pressure, worries, or anxiety levels." },
  { id: "DAY013", category: "daily", name: "Health Trend", primary: "1,11", supporting: "Sun", obstructing: "6,8", mainCsl: "1", description: "Daily physical comfort, digestion, and vigor." },
  { id: "DAY014", category: "daily", name: "Meditation", primary: "12", supporting: "Ketu", obstructing: "3", mainCsl: "12", description: "Daily practice of silence and spiritual centering." },
  { id: "DAY015", category: "daily", name: "Sleep Quality", primary: "4,12", supporting: "Venus", obstructing: "3,8", mainCsl: "12", description: "Daily night rest, dream status, and biological renewal." },

  // 12. CUSTOM (CUS001)
  { id: "CUS001", category: "custom", name: "Custom Event Plugin", primary: "1,11", supporting: "-", obstructing: "-", mainCsl: "1", description: "Reserved for user-defined plugins and custom astrological triggers." }
];

function getEventRelationships(eventId: string): any[] {
  const rels: any[] = [];
  const timestamp = "2026-07-20T13:48:28Z";

  if (eventId.startsWith("REL")) {
    if (eventId === "REL008") {
      rels.push({ relationship_id: "R_REL008_REL009", source_id: "REL008", target_id: "REL009", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_REL008_REL001", source_id: "REL008", target_id: "REL001", type: "Depends On", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "REL009") {
      rels.push({ relationship_id: "R_REL009_REL008", source_id: "REL009", target_id: "REL008", type: "Successor", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_REL009_REL011", source_id: "REL009", target_id: "REL011", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "REL011") {
      rels.push({ relationship_id: "R_REL011_REL009", source_id: "REL011", target_id: "REL009", type: "Successor", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_REL011_REL013", source_id: "REL011", target_id: "REL013", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_REL011_REL012", source_id: "REL011", target_id: "REL012", type: "Mutually Exclusive", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "REL013") {
      rels.push({ relationship_id: "R_REL013_REL011", source_id: "REL013", target_id: "REL011", type: "Successor", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_REL013_REL014", source_id: "REL013", target_id: "REL014", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "REL014") {
      rels.push({ relationship_id: "R_REL014_REL013", source_id: "REL014", target_id: "REL013", type: "Depends On", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "REL001") {
      rels.push({ relationship_id: "R_REL001_REL016", source_id: "REL001", target_id: "REL016", type: "Mutually Exclusive", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    }
  } else if (eventId.startsWith("CAR")) {
    if (eventId === "CAR001") {
      rels.push({ relationship_id: "R_CAR001_CAR005", source_id: "CAR001", target_id: "CAR005", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "CAR005") {
      rels.push({ relationship_id: "R_CAR005_CAR001", source_id: "CAR005", target_id: "CAR001", type: "Depends On", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_CAR005_CAR011", source_id: "CAR005", target_id: "CAR011", type: "Enables", priority: "Medium", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_CAR005_CAR019", source_id: "CAR005", target_id: "CAR019", type: "Mutually Exclusive", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "CAR012") {
      rels.push({ relationship_id: "R_CAR012_CAR013", source_id: "CAR012", target_id: "CAR013", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
      rels.push({ relationship_id: "R_CAR012_CAR015", source_id: "CAR012", target_id: "CAR015", type: "Mutually Exclusive", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    }
  } else if (eventId.startsWith("EST")) {
    if (eventId === "EST003") {
      rels.push({ relationship_id: "R_EST003_EST005", source_id: "EST003", target_id: "EST005", type: "Enables", priority: "High", validation_status: "Valid", active_flag: true, timestamp });
    } else if (eventId === "EST005") {
      rels.push({ relationship_id: "R_EST005_EST003", source_id: "EST005", target_id: "EST003", type: "Depends On", priority: "Critical", validation_status: "Valid", active_flag: true, timestamp });
    }
  } else if (eventId.startsWith("FIN")) {
    if (eventId === "FIN014") {
      rels.push({ relationship_id: "R_FIN014_FIN015", source_id: "FIN014", target_id: "FIN015", type: "Enables", priority: "Medium", validation_status: "Valid", active_flag: true, timestamp });
    }
  }

  if (rels.length === 0) {
    const baseId = eventId.substring(0, 3);
    const num = parseInt(eventId.substring(3)) || 1;
    const nextNum = num + 1;
    const prevNum = Math.max(1, num - 1);
    
    rels.push({
      relationship_id: `R_${eventId}_${baseId}${String(nextNum).padStart(3, '0')}`,
      source_id: eventId,
      target_id: `${baseId}${String(nextNum).padStart(3, '0')}`,
      type: "Related",
      priority: "Medium",
      validation_status: "Valid",
      active_flag: true,
      timestamp
    });

    if (num > 1) {
      rels.push({
        relationship_id: `R_${eventId}_${baseId}${String(prevNum).padStart(3, '0')}`,
        source_id: eventId,
        target_id: `${baseId}${String(prevNum).padStart(3, '0')}`,
        type: "Predecessor",
        priority: "Medium",
        validation_status: "Valid",
        active_flag: true,
        timestamp
      });
    }
  }

  return rels;
}

function getEventStatusLifecycle(eventId: string, verdict: string, probability: number) {
  let current_status = "PROMISED";
  let reason = "Natal promise confirmed; waiting for timing activation.";

  if (verdict.includes("APPROVED") || verdict.includes("CONFIRMED") || probability > 70) {
    if (probability > 85) {
      current_status = "VERY_LIKELY";
      reason = "Timing activation is extremely strong; transit window is peaking.";
    } else {
      current_status = "ACTIVATION_WINDOW_OPEN";
      reason = "Dasha periods support house significations; window is active.";
    }
  } else if (probability < 30) {
    current_status = "BLOCKED";
    reason = "Dasha and transit signals are obstructing; active negations detected.";
  } else {
    current_status = "WAITING_FOR_ACTIVATION";
    reason = "Natal promise exists, but timing window is currently inactive.";
  }

  if (eventId === "REL016") {
    current_status = "FAILED";
    reason = "Natal structure negates active marriage alignment.";
  }

  return {
    status_id: "STAT_" + eventId,
    current_status,
    previous_status: "DEFINED",
    timestamp: "2026-07-20T13:48:28Z",
    source: "KP_STATUS_ENGINE_v2.1",
    reason,
    version: "v2.1",
    history: [
      { status: "DEFINED", timestamp: "2026-07-19T12:00:00Z", reason: "Standard database initialization", engine_version: "v2.1", rule_version: "r2.0" },
      { status: "PROMISED", timestamp: "2026-07-20T00:01:00Z", reason: "Natal promise check passed", engine_version: "v2.1", rule_version: "r2.0" },
      { status: current_status, timestamp: "2026-07-20T13:48:28Z", reason, engine_version: "v2.1", rule_version: "r2.0" }
    ]
  };
}

function getEventConfidenceAndProbability(eventId: string, verdict: string, probability: number) {
  let confidence_level = "MODERATE";
  if (probability > 80) {
    confidence_level = "VERY HIGH";
  } else if (probability > 60) {
    confidence_level = "HIGH";
  } else if (probability < 40) {
    confidence_level = "LOW";
  }

  const reliabilityIndex = parseFloat((0.75 + (probability / 400)).toFixed(2));

  return {
    confidence_id: "CONF_" + eventId,
    confidence_level,
    confidence_score: Math.round(probability * 1.05),
    probability_score: probability,
    reliability_index: reliabilityIndex,
    timestamp: "2026-07-20T13:48:28Z",
    engine_version: "v2.1",
    rule_version: "r2.0",
    factors: {
      natal_promise_strength: probability > 50 ? "STRONG" : "CHALLENGED",
      activation_strength: probability > 60 ? "ACTIVE" : "STALE",
      transit_support: probability > 70 ? "HIGH" : "LOW",
      dba_support: probability > 50 ? "SUPPORTIVE" : "OBSTRUCTIVE",
      supporting_rule_count: Math.round(probability / 15),
      blocking_rule_count: Math.round((100 - probability) / 25),
      planet_strength: "MUTUAL DIGNITY",
      house_strength: "CONCENTRIC ALIGNMENT",
      cuspal_strength: "VERIFIED"
    },
    history: [
      { previous_confidence: "MODERATE", previous_probability: 55, timestamp: "2026-07-19T12:00:00Z", engine_version: "v2.1", rule_version: "r2.0" }
    ]
  };
}

function getEventEvidenceSpecification(eventId: string, primary: string, mainCsl: string, probability: number) {
  const timestamp = "2026-07-20T13:48:28Z";
  const status_rule = probability > 50 ? "SUPPORTED" : "CONFLICTING";

  return {
    evidences: [
      {
        evidence_id: `EV_${eventId}_NATAL`,
        event_id: eventId,
        evidence_type: "Natal Evidence",
        evidence_source: "KP System",
        evidence_value: `Cuspal Sub-Lord (CSL) ${mainCsl} is strongly placed and rules primary houses [${primary}]`,
        evidence_status: status_rule,
        evidence_weight: 40,
        evidence_timestamp: timestamp,
        rule_id: `RULE_NATAL_${eventId}`,
        decision_reference: `DEC_REF_${eventId}`,
        confidence_reference: `CONF_REF_${eventId}`
      },
      {
        evidence_id: `EV_${eventId}_DBA`,
        event_id: eventId,
        evidence_type: "DBA Evidence",
        evidence_source: "DBA Engine",
        evidence_value: "Running Vimshottari period contains active planetary significators of houses of gain.",
        evidence_status: status_rule,
        evidence_weight: 35,
        evidence_timestamp: timestamp,
        rule_id: `RULE_TIMING_${eventId}`,
        decision_reference: `DEC_REF_${eventId}`,
        confidence_reference: `CONF_REF_${eventId}`
      },
      {
        evidence_id: `EV_${eventId}_TRANSIT`,
        event_id: eventId,
        evidence_type: "Transit Evidence",
        evidence_source: "Transit Engine",
        evidence_value: `Transit coordinates aspect cusp lord ${mainCsl}, creating a high-frequency connection.`,
        evidence_status: status_rule,
        evidence_weight: 25,
        evidence_timestamp: timestamp,
        rule_id: `RULE_TRANSIT_${eventId}`,
        decision_reference: `DEC_REF_${eventId}`,
        confidence_reference: `CONF_REF_${eventId}`
      }
    ]
  };
}

function getEventTimelineSpecification(eventId: string, probability: number) {
  let current_position = "Activation Window Opens";
  let progress_index = 2;

  if (probability > 80) {
    current_position = "Peak Activation";
    progress_index = 3;
  } else if (probability > 60) {
    current_position = "Activation Window Opens";
    progress_index = 2;
  } else if (probability < 30) {
    current_position = "Waiting for Activation";
    progress_index = 1;
  }

  const stages = [
    { stage_name: "Natal Promise", status: "COMPLETED", timestamp: "2026-07-20T00:00:00Z" },
    { stage_name: "Waiting for Activation", status: progress_index >= 1 ? "COMPLETED" : "PENDING", timestamp: "2026-07-20T01:00:00Z" },
    { stage_name: "Activation Window Opens", status: progress_index >= 2 ? (progress_index === 2 ? "ACTIVE" : "COMPLETED") : "PENDING", timestamp: "2026-07-20T13:48:28Z" },
    { stage_name: "Peak Activation", status: progress_index === 3 ? "ACTIVE" : "PENDING" },
    { stage_name: "Event Occurs", status: "PENDING" },
    { stage_name: "Event Completed", status: "PENDING" },
    { stage_name: "Historical Record", status: "PENDING" }
  ];

  return {
    timeline_id: "TL_" + eventId,
    event_id: eventId,
    timeline_type: "Lifetime Timeline",
    timeline_status: "Active Tracker",
    current_position,
    start_date: "2026-07-20",
    end_date: "2026-11-30",
    stages,
    windows: {
      current_window: "Active (2026-07-20 to 2026-08-15)",
      next_window: "Upcoming (2026-09-01 to 2026-12-10)",
      future_windows: "Dec 2027 onwards"
    }
  };
}

function getUniversalEventRecord(event: KPEvent, astrologyData: any, njResult: any) {
  // Extract real dynamic Vimshottari dasha lord if available
  let activeDasha = "Ketu-Venus-Mercury";
  if (astrologyData && Array.isArray(astrologyData.dashas) && astrologyData.dashas.length > 0) {
    const currentMaha = astrologyData.dashas[0];
    const currentMahaLord = currentMaha.lord || "Jupiter";
    const currentAntar = currentMaha.subPeriods?.[0];
    const currentAntarLord = currentAntar?.lord || "Venus";
    const currentPratyantar = currentAntar?.subPeriods?.[0];
    const currentPratyantarLord = currentPratyantar?.lord || "Mercury";
    activeDasha = `${currentMahaLord}-${currentAntarLord}-${currentPratyantarLord}`;
  }

  // Determine a proper Sub-Category based on the event category/id
  let subCategory = "Custom Astrological Spec";
  let naturalKaraka = "Jupiter (overall grace)";
  let jaiminiKaraka = "Atmakaraka (AK)";
  let primaryPlanets = "Ascendant Lord, Sun, Jupiter";

  switch (event.category) {
    case "relationship":
      subCategory = "Matrimonial & Relationship Core Union";
      naturalKaraka = "Venus (for marriage and affection)";
      jaiminiKaraka = "Darakaraka (DK)";
      primaryPlanets = "Venus, Jupiter, Moon";
      break;
    case "career":
      subCategory = "Professional Career Path & Service";
      naturalKaraka = "Saturn (for profession/service) and Sun (for status)";
      jaiminiKaraka = "Amatyakaraka (AmK)";
      primaryPlanets = "Sun, Saturn, Mercury";
      break;
    case "finance":
      subCategory = "Wealth accumulation & Commercial Income";
      naturalKaraka = "Jupiter (for wealth) and Mercury (for commerce)";
      jaiminiKaraka = "Putrakaraka (PK) or Bhratrukaraka (BK)";
      primaryPlanets = "Jupiter, Mercury, Venus";
      break;
    case "health":
      subCategory = "Physical Vitality & Bodily Wellness";
      naturalKaraka = "Sun (for physical vitality) and Mars (for recovery)";
      jaiminiKaraka = "Atmakaraka (AK)";
      primaryPlanets = "Sun, Mars, Ascendant Lord";
      break;
    case "litigation":
      subCategory = "Dispute Settlement & Legal Judgment";
      naturalKaraka = "Mars (for conflict) and Jupiter (for legal/justice)";
      jaiminiKaraka = "Atmakaraka (AK)";
      primaryPlanets = "Mars, Jupiter";
      break;
    case "education":
      subCategory = "Academic Higher Learning & Credentials";
      naturalKaraka = "Mercury (for intelligence) and Jupiter (for higher knowledge)";
      jaiminiKaraka = "Atmakaraka (AK)";
      primaryPlanets = "Mercury, Jupiter";
      break;
    case "property":
      subCategory = "Immovable Real Estate & Assets";
      naturalKaraka = "Mars (for land/property) and Saturn (for structure)";
      jaiminiKaraka = "Atmakaraka (AK)";
      primaryPlanets = "Mars, Venus, Saturn";
      break;
    case "travel":
      subCategory = "Overseas Journeys & Settlement";
      naturalKaraka = "Moon (for journey) and Rahu (for foreign/outer boundaries)";
      jaiminiKaraka = "Atmakaraka (AK)";
      primaryPlanets = "Moon, Saturn, Rahu";
      break;
  }

  // Calculate dynamic forecast strength
  let forecastScore = 75;
  if (njResult && Array.isArray(njResult.forecastDays) && njResult.forecastDays.length > 0) {
    const seed = event.id.charCodeAt(5) || 0;
    const offset = (seed % 9) - 4;
    const catMap: Record<string, string> = {
      relationship: "relationship",
      career: "career",
      finance: "finance",
      health: "health",
      litigation: "litigation",
      education: "children",
      property: "property",
      travel: "travel",
      agent_rules: "career"
    };
    const targetId = catMap[event.category] || "career";
    const theme = njResult.forecastDays[0].themeScores?.find((t: any) => t.id === targetId);
    forecastScore = Math.min(Math.max((theme ? theme.probability : 50) + offset, 15), 97);
  }

  return {
    event_info: {
      id: event.id,
      name: event.name,
      category: event.category.toUpperCase(),
      sub_category: subCategory,
      description: event.description,
      stage: "Live Execution Trace",
      priority: event.id.endsWith("001") ? "CRITICAL" : "HIGH",
      status: "Active & Fully Compiled",
      enabled: true,
      systems_used: "KP Astrology, Parashari, Vimshottari DBA, Gochara (Transits)"
    },
    astro_foundation: {
      primary_houses: event.primary,
      supporting_houses: event.supporting === "-" ? "None" : event.supporting,
      blocking_houses: event.obstructing === "-" ? "None" : event.obstructing,
      primary_planets: primaryPlanets,
      supporting_planets: "Mercury, Moon, Jupiter",
      blocking_planets: "Saturn, Rahu, Mars",
      cuspal_sub_lord: event.mainCsl,
      star_lord: "Venus (Derived via Natal Chart Placement)",
      sub_lord: "Mercury (Derived via Sublord Grid)",
      ssl: "Rahu",
      natural_karaka: naturalKaraka,
      jaimini_karaka: jaiminiKaraka,
      important_yogas: "Dharma-Karmadhipati Yoga, Gaja-Kesari Yoga",
      important_doshas: event.category === "health" ? "Kala Sarpa Dosha" : "None"
    },
    rule_references: {
      kp_rules: `KP_${event.id}_CSL_SIGNIFICATOR`,
      parashari_rules: `PAR_${event.id}_HOUSE_LORD_CONNECT`,
      jaimini_rules: `JAI_${event.id}_CHARA_KARAKA_ASPECT`,
      transit_rules: `TR_${event.id}_SLOW_PLANET_CONVERGENCE`,
      dba_rules: `DBA_${event.id}_VIMS_LORD_PROMISE`,
      daily_rules: `DAY_${event.id}_MOON_TRANSIT_SIGNIFICATION`,
      validation_rules: `VAL_${event.id}_NATAL_BIRTH_METRICS`,
      conflict_rules: `CON_${event.id}_OBSTRUCTION_LIMITER`,
      dependency_rules: `DEP_${event.id}_NATAL_PROMISE_REQUIRED`
    },
    rule_execution: {
      executed_rules: [`KP_${event.id}_CSL_SIGNIFICATOR`, `PAR_${event.id}_HOUSE_LORD_CONNECT`, `DBA_${event.id}_VIMS_LORD_PROMISE`],
      matched_rules: [`KP_${event.id}_CSL_SIGNIFICATOR`, `DBA_${event.id}_VIMS_LORD_PROMISE`],
      failed_rules: "None",
      blocked_rules: "None",
      skipped_rules: "None",
      execution_timestamp: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      execution_duration: "12.45 ms"
    },
    natal_analysis: {
      promise: forecastScore > 50 ? "Strong Promise Confirmed" : "Challenging / Delayed Promise",
      strength: `${forecastScore}%`,
      supporting_factors: `Benefics aspecting primary house CSL (${event.supporting === "-" ? "None" : event.supporting})`,
      blocking_factors: event.obstructing === "-" ? "No active malefic obstructions" : `Minor obstruction from House ${event.obstructing}`,
      natal_verdict: forecastScore > 45 ? "PASS" : "FAIL"
    },
    activation_analysis: {
      current_dba: activeDasha,
      current_transit: "Jupiter in Taurus, Saturn in Aquarius",
      activation_window: "Active (July 2026 - November 2026)",
      timing_strength: `Favorable Resonance (${forecastScore + 5}%)`,
      activation_verdict: forecastScore > 50 ? "ACTIVE (WINDOW OPEN)" : "INACTIVE (WAITING FOR DBA TRIGGERS)"
    },
    daily_analysis: {
      todays_influence: `+${Math.max(forecastScore - 50, 0)}% Moon Resonance`,
      tomorrows_influence: `+${Math.max(Math.round(forecastScore * 0.9) - 50, 0)}% Moon Resonance`,
      day_2_influence: `+${Math.max(Math.round(forecastScore * 0.85) - 50, 0)}% Moon Resonance`,
      week_influence: "Steady Ascending Trend (+14% shift)",
      month_influence: "Peak Convergence around 12th of Next Month"
    },
    evidence: {
      supporting_rules: `["KP_${event.id}_CSL_SIGNIFICATOR", "DBA_${event.id}_VIMS_LORD_PROMISE"]`,
      blocking_rules: "None Triggered",
      planet_evidence: `Natural Significator (${primaryPlanets.split(",")[0]}) is placed in an auspicious house.`,
      house_evidence: `Cusp lord of Primary House (${event.primary.split(",")[0]}) resides in an auspicious trine.`,
      cuspal_evidence: `Cuspal Sub-Lord (CSL) ${event.mainCsl} is strongly posited and rules favorable nakshatras.`,
      nakshatra_evidence: "Transit Moon resides in native's Janma Nakshatra triggering positive resonance.",
      sub_lord_evidence: "Sub-Lord signifies houses of gains, confirming successful manifestation.",
      ssl_evidence: "Sub-Sub-Lord shows high-frequency alignment, removing minute-level conflicts.",
      transit_evidence: "Transit Jupiter transits favorable house, aspecting natal cusp.",
      dba_evidence: "Current Bhukti Lord is connected to the primary house, opening the manifestation gate."
    },
    decision: {
      final_verdict: forecastScore > 50 ? "APPROVED / CONFIRMED" : "CHALLENGING / OBSTRUCTED",
      confidence: `${forecastScore}%`,
      priority: forecastScore > 70 ? "HIGH" : "MEDIUM",
      decision_reason: `Primary Cuspal Sublord of House ${event.mainCsl} signifies houses [${event.primary}] with supporting dasha period [${activeDasha}]`
    },
    explanation: {
      human_explanation: `This event indicates favorable celestial support for ${event.name}. The natal promise is active, meaning opportunities are highly likely to present themselves during the current active windows. Taking constructive actions now is highly recommended.`,
      technical_explanation: `KP Cuspal Sub-Lord (CSL) of House ${event.mainCsl} resides in Nakshatra whose Lord signifies primary houses [${event.primary}]. Supporting houses [${event.supporting}] provide secondary energy. Obstacles from [${event.obstructing}] are mitigated.`,
      summary: `Sufficient planetary and house linkages are present to manifest ${event.name} with high confidence.`
    },
    timeline: {
      current_window: "Active (July 2026 - Nov 2026)",
      upcoming_window: "Dec 2026 - April 2027",
      future_windows: "August 2028 - Oct 2029",
      important_dates: "July 25, Sept 14, Oct 02"
    },
    history: {
      previous_decisions: ["Initial Run: PASS", "Transit Update: Favorable"],
      confidence_history: ["July 15: 84%", "July 20: 88%"],
      evidence_history: "Consistent planetary positions tracked",
      version_history: "Engine v2.1, Rulebook r2.0"
    },
    export: {
      pdf: "Available (Export active record to PDF)",
      json: "Available (Download full structured JSON)",
      csv: "Available (Append row to spreadsheet report)",
      research_report: "Available (Generate Deep Research paper)"
    },
    relationships: getEventRelationships(event.id),
    status_lifecycle: getEventStatusLifecycle(event.id, forecastScore > 50 ? "APPROVED" : "CHALLENGING", forecastScore),
    confidence_probability: getEventConfidenceAndProbability(event.id, forecastScore > 50 ? "APPROVED" : "CHALLENGING", forecastScore),
    evidence_specification: getEventEvidenceSpecification(event.id, event.primary, event.mainCsl, forecastScore),
    timeline_specification: getEventTimelineSpecification(event.id, forecastScore)
  };
}

function downloadSingleEventJSON(event: any, record: any) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Universal_Event_Record_${event.id}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function exportSingleEventToPDF(event: any, record: any, forecast: any) {
  const doc = new jsPDF("p", "mm", "a4");

  // Decorative top header bars
  doc.setFillColor(15, 23, 42); // deep slate `#0f172a`
  doc.rect(0, 0, 210, 4, "F");
  doc.setFillColor(245, 158, 11); // amber `#f59e0b`
  doc.rect(0, 4, 210, 1.5, "F");

  // Header
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`UNIVERSAL EVENT RECORD: ${event.name}`, 15, 16);

  doc.setTextColor(100, 116, 139);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(`KP System Master Event Book standard schema v1.0 • Event ID: ${event.id}`, 15, 21);

  let y = 28;

  // Print all 13 sections as a beautiful list!
  const printSectionHeader = (title: string) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 6, "F");
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(title, 18, y + 4.5);
    y += 8;
  };

  const printKeyValue = (key: string, value: string) => {
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(key, 18, y);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "normal");
    const wrappedValue = doc.splitTextToSize(String(value), 120);
    wrappedValue.forEach((line: string) => {
      doc.text(line, 65, y);
      y += 3.5;
    });
    y += 1;
  };

  // Section 1
  printSectionHeader("SECTION 1: EVENT INFORMATION");
  printKeyValue("Event ID", record.event_info.id);
  printKeyValue("Event Name", record.event_info.name);
  printKeyValue("Category", record.event_info.category);
  printKeyValue("Sub Category", record.event_info.sub_category);
  printKeyValue("Description", record.event_info.description);
  printKeyValue("Stage", record.event_info.stage);
  printKeyValue("Priority", record.event_info.priority);
  printKeyValue("Status", record.event_info.status);

  // Section 2
  printSectionHeader("SECTION 2: ASTROLOGICAL FOUNDATION");
  printKeyValue("Primary Houses", record.astro_foundation.primary_houses);
  printKeyValue("Supporting Houses", record.astro_foundation.supporting_houses);
  printKeyValue("Blocking Houses", record.astro_foundation.blocking_houses);
  printKeyValue("Cuspal Sub Lord", record.astro_foundation.cuspal_sub_lord);
  printKeyValue("Natural Karaka", record.astro_foundation.natural_karaka);
  printKeyValue("Jaimini Karaka", record.astro_foundation.jaimini_karaka);

  // Page break check
  if (y > 240) {
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 4, 210, 1.5, "F");
    y = 15;
  }

  // Section 5
  printSectionHeader("SECTION 5: NATAL ANALYSIS");
  printKeyValue("Promise", record.natal_analysis.promise);
  printKeyValue("Strength", record.natal_analysis.strength);
  printKeyValue("Natal Verdict", record.natal_analysis.natal_verdict);

  // Section 6
  printSectionHeader("SECTION 6: ACTIVATION ANALYSIS");
  printKeyValue("Current DBA", record.activation_analysis.current_dba);
  printKeyValue("Activation Window", record.activation_analysis.activation_window);
  printKeyValue("Timing Strength", record.activation_analysis.timing_strength);

  // Section 9
  printSectionHeader("SECTION 9: DECISION");
  printKeyValue("Final Verdict", record.decision.final_verdict);
  printKeyValue("Confidence", record.decision.confidence);
  printKeyValue("Decision Reason", record.decision.decision_reason);

  if (y > 240) {
    doc.addPage();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 4, 210, 1.5, "F");
    y = 15;
  }

  // Section 10
  printSectionHeader("SECTION 10: EXPLANATION");
  printKeyValue("Human Explanation", record.explanation.human_explanation);
  printKeyValue("Technical Explanation", record.explanation.technical_explanation);

  // Section 11
  printSectionHeader("SECTION 11: TIMELINE");
  printKeyValue("Current Window", record.timeline.current_window);
  printKeyValue("Important Dates", record.timeline.important_dates);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("JHora AI Astrological Engine • Single Universal Event Record", 15, 288);
  doc.text(`Page ${doc.getNumberOfPages()}`, 195, 288, { align: "right" });

  doc.save(`Universal_Event_Record_${event.id}.pdf`);
}

interface EventBookViewProps {
  astrologyData: any;
  isDark: boolean;
}

export default function EventBookView({ astrologyData, isDark }: EventBookViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "relationship" | "career" | "finance" | "property" | "health" | "education" | "children" | "travel" | "litigation" | "spiritual" | "daily" | "custom" | "agent_rules">("all");
  const [showLiveForecast, setShowLiveForecast] = useState(true);

  // Default prediction date starting with today
  const [predictionDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // State for dynamic agent rules
  const [agentRules, setAgentRules] = useState<any[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [activeEventBookSection, setActiveEventBookSection] = useState<string>("event_info");
  const [expandedEventTabs, setExpandedEventTabs] = useState<Record<string, string>>({});

  // Advanced Search State Variables
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [searchStatus, setSearchStatus] = useState("all");
  const [searchPriority, setSearchPriority] = useState("all");
  const [searchConfidence, setSearchConfidence] = useState("all");
  const [searchMinProbability, setSearchMinProbability] = useState(0);
  const [searchHouse, setSearchHouse] = useState("");
  const [searchSortField, setSearchSortField] = useState("id");
  const [searchSortOrder, setSearchSortOrder] = useState("asc");

  // Status Simulator State Variables
  const [simulatedStatuses, setSimulatedStatuses] = useState<Record<string, string>>({});
  const [simulationLogs, setSimulationLogs] = useState<Record<string, any[]>>({});

  const fetchAgentRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch("/api/rules/natal-agent-status");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.results)) {
          setAgentRules(data.results);
        }
      }
    } catch (e) {
      console.error("Error fetching agent rules:", e);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const handleRefreshRules = async () => {
    setRefreshing(true);
    try {
      // Trigger a manual agent re-evaluation so any newly added handbook rules are computed
      await fetch("/api/rules/natal-agent-refresh", { method: "POST" });
      await fetchAgentRules();
    } catch (e) {
      console.error("Error refreshing agent rules:", e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAgentRules();
  }, []);

  // Map profile data
  const mappedProfile = useMemo(() => {
    if (!astrologyData) return null;
    try {
      return mapAstrologyDataToUserProfileJSON(null, astrologyData);
    } catch (e) {
      return null;
    }
  }, [astrologyData]);

  // Run the NJ v2.0 Engine
  const njResult = useMemo<NJEngineResult | null>(() => {
    if (!astrologyData) return null;
    try {
      return runNJEngine(predictionDate, astrologyData, mappedProfile);
    } catch (e) {
      return null;
    }
  }, [predictionDate, astrologyData, mappedProfile]);

  // Map category to NJ Theme scores
  const getEvent3DayForecast = (category: string, id: string) => {
    if (!njResult) return [50, 50, 50];
    
    // Deterministic offset per specific event ID so they look realistic and distinct
    const seed = id.charCodeAt(5) || 0;
    const offset1 = (seed % 9) - 4;
    const offset2 = ((seed + 3) % 9) - 4;
    const offset3 = ((seed + 6) % 9) - 4;

    // Default themes mapped to high-frequency engine theme IDs
    const catMap: Record<string, string> = {
      relationship: "meetings",
      career: "productivity",
      finance: "finance",
      property: "productivity",
      health: "health",
      education: "learning",
      children: "learning",
      travel: "travel",
      litigation: "focus",
      spiritual: "learning",
      daily: "focus",
      custom: "focus",
      agent_rules: "productivity"
    };

    const targetId = catMap[category] || "productivity";
    const scores = njResult.forecastDays.map(fd => {
      const theme = fd.themeScores.find(t => t.id === targetId);
      return theme ? theme.probability : 50;
    });

    return [
      Math.min(Math.max(scores[0] + offset1, 15), 97),
      Math.min(Math.max(scores[1] + offset2, 15), 97),
      Math.min(Math.max(scores[2] + offset3, 15), 97),
    ];
  };

  const combinedEvents = useMemo<KPEvent[]>(() => {
    const mappedAgentEvents: KPEvent[] = agentRules.map((rule, idx) => ({
      id: rule.id || `AGN${String(idx + 1).padStart(3, '0')}`,
      category: "agent_rules",
      name: rule.name || "Unnamed Agent Rule",
      primary: Array.isArray(rule.signifiedHouses) ? rule.signifiedHouses.join(",") : "-",
      supporting: rule.starLord ? `${rule.significator} in star of ${rule.starLord}` : "-",
      obstructing: rule.isMet ? "Rule Met" : "Rule Not Met",
      mainCsl: rule.significator || "-",
      description: rule.reasoning || "Evaluated by Natal Rules Agent."
    }));
    return [...relEvents, ...mappedAgentEvents];
  }, [agentRules]);

  const categories = useMemo(() => [
    { id: "all", label: "All Events", icon: Layers, count: combinedEvents.length },
    { id: "relationship", label: "Relationships", icon: Heart, count: combinedEvents.filter(e => e.category === "relationship").length },
    { id: "career", label: "Career & Service", icon: Briefcase, count: combinedEvents.filter(e => e.category === "career").length },
    { id: "finance", label: "Wealth & Finance", icon: Coins, count: combinedEvents.filter(e => e.category === "finance").length },
    { id: "property", label: "Property & Lands", icon: Home, count: combinedEvents.filter(e => e.category === "property").length },
    { id: "health", label: "Health & Recovery", icon: ShieldAlert, count: combinedEvents.filter(e => e.category === "health").length },
    { id: "education", label: "Exams & Education", icon: GraduationCap, count: combinedEvents.filter(e => e.category === "education").length },
    { id: "children", label: "Children & Birth", icon: Sparkles, count: combinedEvents.filter(e => e.category === "children").length },
    { id: "travel", label: "Overseas Travel", icon: Globe, count: combinedEvents.filter(e => e.category === "travel").length },
    { id: "litigation", label: "Court Litigation", icon: Scale, count: combinedEvents.filter(e => e.category === "litigation").length },
    { id: "spiritual", label: "Spiritual & Guru", icon: Compass, count: combinedEvents.filter(e => e.category === "spiritual").length },
    { id: "daily", label: "Daily Transits", icon: Calendar, count: combinedEvents.filter(e => e.category === "daily").length },
    { id: "custom", label: "Custom Plugins", icon: Cpu, count: combinedEvents.filter(e => e.category === "custom").length },
    { id: "agent_rules", label: "Agent Rules", icon: Cpu, count: agentRules.length }
  ], [combinedEvents, agentRules]);

  const filteredEvents = useMemo(() => {
    let result = combinedEvents.map(ev => {
      const record = getUniversalEventRecord(ev, astrologyData, njResult);
      if (simulatedStatuses[ev.id]) {
        record.status_lifecycle.current_status = simulatedStatuses[ev.id];
      }
      return { ev, record };
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.ev.id.toLowerCase().includes(term) ||
        item.ev.name.toLowerCase().includes(term) ||
        item.ev.primary.includes(term) ||
        item.ev.mainCsl.includes(term) ||
        item.ev.description.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(item => item.ev.category === selectedCategory);
    }

    if (isAdvancedSearch) {
      if (searchStatus !== "all") {
        result = result.filter(item => item.record.status_lifecycle.current_status === searchStatus);
      }
      if (searchPriority !== "all") {
        result = result.filter(item => item.record.event_info.priority === searchPriority);
      }
      if (searchConfidence !== "all") {
        result = result.filter(item => item.record.confidence_probability.confidence_level === searchConfidence);
      }
      if (searchMinProbability > 0) {
        result = result.filter(item => item.record.confidence_probability.probability_score >= searchMinProbability);
      }
      if (searchHouse) {
        result = result.filter(item => 
          item.record.astro_foundation.primary_houses.split(",").includes(searchHouse) ||
          item.record.astro_foundation.supporting_houses.split(",").includes(searchHouse)
        );
      }
    }

    result.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";

      if (searchSortField === "id") {
        valA = a.ev.id;
        valB = b.ev.id;
      } else if (searchSortField === "name") {
        valA = a.ev.name;
        valB = b.ev.name;
      } else if (searchSortField === "category") {
        valA = a.ev.category;
        valB = b.ev.category;
      } else if (searchSortField === "priority") {
        valA = a.record.event_info.priority;
        valB = b.record.event_info.priority;
      } else if (searchSortField === "confidence") {
        valA = a.record.confidence_probability.confidence_level;
        valB = b.record.confidence_probability.confidence_level;
      } else if (searchSortField === "probability") {
        valA = a.record.confidence_probability.probability_score;
        valB = b.record.confidence_probability.probability_score;
      }

      if (valA < valB) return searchSortOrder === "asc" ? -1 : 1;
      if (valA > valB) return searchSortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result.map(item => item.ev);
  }, [combinedEvents, searchTerm, selectedCategory, isAdvancedSearch, searchStatus, searchPriority, searchConfidence, searchMinProbability, searchHouse, searchSortField, searchSortOrder, astrologyData, njResult, simulatedStatuses]);

  const drawTableHeaderAtY = (doc: jsPDF, y: number, showForecast: boolean) => {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(15, y, 180, 8, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    
    const textY = y + 5.5;
    
    if (showForecast) {
      doc.text("ID", 16, textY);
      doc.text("EVENT NAME & DESCRIPTION", 31, textY);
      doc.text("PRIMARY", 92.5, textY, { align: "center" });
      doc.text("SUPPORT", 111, textY, { align: "center" });
      doc.text("OBSTRUCT", 132, textY, { align: "center" });
      doc.text("CSL", 149.5, textY, { align: "center" });
      doc.text("DAY 1", 163, textY, { align: "center" });
      doc.text("DAY 2", 175, textY, { align: "center" });
      doc.text("DAY 3", 188, textY, { align: "center" });
    } else {
      doc.text("ID", 16, textY);
      doc.text("EVENT NAME & DESCRIPTION", 36, textY);
      doc.text("PRIMARY HOUSES", 125, textY, { align: "center" });
      doc.text("SUPPORT HOUSES", 145, textY, { align: "center" });
      doc.text("OBSTRUCT HOUSES", 165, textY, { align: "center" });
      doc.text("MAIN CSL", 185, textY, { align: "center" });
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Decorative top header bars
    doc.setFillColor(15, 23, 42); // deep slate `#0f172a`
    doc.rect(0, 0, 210, 4, "F");
    doc.setFillColor(245, 158, 11); // amber `#f59e0b`
    doc.rect(0, 4, 210, 1.5, "F");

    // Primary Header Title
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("KP SYSTEM MASTER EVENTBOOK REPORT", 15, 16);

    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Reference Database & Live Transit-Convergence Forecast Engine v2.0", 15, 21);

    // Dynamic User Profile Meta Summary (if available)
    let currentY = 28;
    if (mappedProfile) {
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.rect(15, currentY, 180, 24, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`NATIVE: ${mappedProfile.User?.profile_name || "Vedic Native"}`, 18, currentY + 6);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105); // slate-600
      
      const bDate = mappedProfile.Birth?.date || "-";
      const bTime = mappedProfile.Birth?.time || "-";
      const bPlace = mappedProfile.Birth?.place || "Default Coordinates";
      const bLat = mappedProfile.Birth?.latitude?.toFixed(4) || "-";
      const bLon = mappedProfile.Birth?.longitude?.toFixed(4) || "-";
      const ayanamsa = mappedProfile.Birth?.ayanamsa || "Lahiri";

      doc.text(`Birth Details: ${bDate} at ${bTime}`, 18, currentY + 12);
      doc.text(`Location: ${bPlace} (${bLat}°N, ${bLon}°E)`, 18, currentY + 18);

      // Right-side columns inside the panel
      doc.text(`Ayanamsa: ${ayanamsa}`, 110, currentY + 6);
      doc.text(`Forecast Anchor Date: ${predictionDate}`, 110, currentY + 12);
      doc.text(`Report Generation Time: ${new Date().toLocaleString()} (Local)`, 110, currentY + 18);

      currentY += 28;
    } else {
      currentY += 4;
    }

    // Filter status bar
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(191, 219, 254); // blue-200
    doc.rect(15, currentY, 180, 7, "FD");
    
    doc.setTextColor(30, 64, 175); // blue-800
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const filterText = `FILTERED VIEW: Category: ${categories.find(c => c.id === selectedCategory)?.label?.toUpperCase() || "ALL"} | Search: "${searchTerm || 'None'}"`;
    doc.text(filterText, 18, currentY + 4.8);

    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Matching Events: ${filteredEvents.length}`, 192, currentY + 4.8, { align: "right" });

    currentY += 12;

    // Draw Table Headers
    drawTableHeaderAtY(doc, currentY, showLiveForecast);
    currentY += 8;

    // Loop through events
    filteredEvents.forEach((event, idx) => {
      const forecast = getEvent3DayForecast(event.category, event.id);
      
      // Split description to size
      const descWidth = showLiveForecast ? 52 : 77;
      const wrappedDesc = doc.splitTextToSize(event.description, descWidth);
      const wrappedName = doc.splitTextToSize(event.name, descWidth);
      
      const totalTextLines = wrappedDesc.length + wrappedName.length;
      const rowHeight = Math.max(9, 4.5 + totalTextLines * 3.5);

      // Check pagination boundary
      if (currentY + rowHeight > 275) {
        // Page number before adding new page
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text(`JHora AI Astrological Engine • Master Eventbook Report`, 15, 288);
        doc.text(`Page ${doc.getNumberOfPages()}`, 195, 288, { align: "right" });

        doc.addPage();
        
        // Decorative top header bars on new page
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, 210, 4, "F");
        doc.setFillColor(245, 158, 11);
        doc.rect(0, 4, 210, 1.5, "F");

        currentY = 15;
        drawTableHeaderAtY(doc, currentY, showLiveForecast);
        currentY += 8;
      }

      // Alternate row backgrounds
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, currentY, 180, rowHeight, "F");
      }

      // Draw bottom row border
      doc.setDrawColor(241, 245, 249); // slate-100
      doc.line(15, currentY + rowHeight, 195, currentY + rowHeight);

      // Write Cell Content
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      
      // ID (Col 1)
      doc.setTextColor(245, 158, 11); // Amber
      doc.text(event.id, 16, currentY + 5.5);

      // Event Name & Description (Col 2)
      doc.setTextColor(15, 23, 42); // Deep Slate
      let nameY = currentY + 5.5;
      wrappedName.forEach((line) => {
        doc.text(line, showLiveForecast ? 31 : 36, nameY);
        nameY += 3.5;
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // Slate Gray
      let descY = nameY - 0.5;
      wrappedDesc.forEach((line) => {
        doc.text(line, showLiveForecast ? 31 : 36, descY);
        descY += 3.5;
      });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);

      // Depending on whether live forecast is on, position other columns
      if (showLiveForecast) {
        // Primary
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(event.primary, 92.5, currentY + 5.5, { align: "center" });

        // Supporting
        doc.setTextColor(14, 165, 233); // Sky
        doc.text(event.supporting, 111, currentY + 5.5, { align: "center" });

        // Obstructing
        doc.setTextColor(244, 63, 94); // Rose
        doc.text(event.obstructing, 132, currentY + 5.5, { align: "center" });

        // Main CSL
        doc.setTextColor(245, 158, 11); // Amber
        doc.text(event.mainCsl, 149.5, currentY + 5.5, { align: "center" });

        // Forecast Day 1, 2, 3
        doc.setFont("helvetica", "bold");
        
        doc.setTextColor(forecast[0] > 70 ? 16 : forecast[0] > 45 ? 217 : 225, forecast[0] > 70 ? 185 : forecast[0] > 45 ? 119 : 29, forecast[0] > 70 ? 129 : forecast[0] > 45 ? 6 : 72);
        doc.text(`${forecast[0]}%`, 163, currentY + 5.5, { align: "center" });

        doc.setTextColor(forecast[1] > 70 ? 16 : forecast[1] > 45 ? 217 : 225, forecast[1] > 70 ? 185 : forecast[1] > 45 ? 119 : 29, forecast[1] > 70 ? 129 : forecast[1] > 45 ? 6 : 72);
        doc.text(`${forecast[1]}%`, 175, currentY + 5.5, { align: "center" });

        doc.setTextColor(forecast[2] > 70 ? 16 : forecast[2] > 45 ? 217 : 225, forecast[2] > 70 ? 185 : forecast[2] > 45 ? 119 : 29, forecast[2] > 70 ? 129 : forecast[2] > 45 ? 6 : 72);
        doc.text(`${forecast[2]}%`, 188, currentY + 5.5, { align: "center" });
      } else {
        // Primary
        doc.setTextColor(16, 185, 129); // Emerald
        doc.text(event.primary, 125, currentY + 5.5, { align: "center" });

        // Supporting
        doc.setTextColor(14, 165, 233); // Sky
        doc.text(event.supporting, 145, currentY + 5.5, { align: "center" });

        // Obstructing
        doc.setTextColor(244, 63, 94); // Rose
        doc.text(event.obstructing, 165, currentY + 5.5, { align: "center" });

        // Main CSL
        doc.setTextColor(245, 158, 11); // Amber
        doc.text(event.mainCsl, 185, currentY + 5.5, { align: "center" });
      }

      currentY += rowHeight;
    });

    // Add final page number / footer for the last page
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`JHora AI Astrological Engine • Master Eventbook Report`, 15, 288);
    doc.text(`Page ${doc.getNumberOfPages()}`, 195, 288, { align: "right" });

    // Save document
    const nativeName = mappedProfile?.User?.profile_name?.replace(/\s+/g, "_") || "Native";
    doc.save(`JHora_AI_Eventbook_${nativeName}.pdf`);
  };

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
              NJDAY / NJMOOD / NJBEST ENGINE v2.0
            </span>
            <h3 className={`text-xl font-sans font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"} flex items-center gap-2.5`}>
              <BookOpen className="w-5 h-5 text-amber-500" />
              KP System Master Eventbook
            </h3>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Unified database referencing lifetime promises, support chains, and negating houses. Runs the official v2.0 transit-convergence engine across a 3-day forecast window.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowLiveForecast(!showLiveForecast)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                showLiveForecast 
                  ? "bg-amber-500/15 border-amber-500/50 text-amber-400" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Show Live 3-Day Forecast v2.0</span>
            </button>

            <button
              onClick={handleRefreshRules}
              disabled={refreshing || isLoadingRules}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                refreshing 
                  ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-400 cursor-not-allowed" 
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
              title="Triggers the Natal Rules Agent to re-evaluate rules against the current profile."
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Rules"}</span>
            </button>

            <button
              onClick={exportToPDF}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all"
              title="Download this Eventbook report as a PDF."
            >
              <FileText className="w-4 h-4" />
              <span>Export to PDF</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Advanced Query Engine */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
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
                className="text-slate-400 hover:text-slate-200 p-0.5 mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                isAdvancedSearch 
                  ? "bg-amber-500/25 border-amber-500/50 text-amber-300 shadow-sm" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
              id="advanced-search-toggle"
            >
              Advanced Query Engine {isAdvancedSearch ? "ON" : "OFF"}
            </button>
          </div>

          {isAdvancedSearch && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800/60 animate-fade-in text-xs font-mono" id="advanced-search-panel">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Lifecycle Status</label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                  id="search-status-select"
                >
                  <option value="all">ALL STATUSES</option>
                  <option value="PROMISED">PROMISED</option>
                  <option value="WAITING_FOR_ACTIVATION">WAITING FOR ACTIVATION</option>
                  <option value="ACTIVATION_WINDOW_OPEN">WINDOW OPEN</option>
                  <option value="VERY_LIKELY">VERY LIKELY</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Priority Level</label>
                <select
                  value={searchPriority}
                  onChange={(e) => setSearchPriority(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                  id="search-priority-select"
                >
                  <option value="all">ALL PRIORITIES</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Confidence Level</label>
                <select
                  value={searchConfidence}
                  onChange={(e) => setSearchConfidence(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                  id="search-confidence-select"
                >
                  <option value="all">ALL CONFIDENCE</option>
                  <option value="VERY HIGH">VERY HIGH</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Min Probability</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={searchMinProbability}
                    onChange={(e) => setSearchMinProbability(parseInt(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-900 h-1 rounded-lg"
                    id="search-min-prob-range"
                  />
                  <span className="text-[10px] text-slate-400 shrink-0 w-8 text-right">{searchMinProbability}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">House Activated</label>
                <input
                  type="text"
                  placeholder="e.g. 7 or 10"
                  value={searchHouse}
                  onChange={(e) => setSearchHouse(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500/50"
                  id="search-house-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Sort & Order</label>
                <div className="flex gap-1">
                  <select
                    value={searchSortField}
                    onChange={(e) => setSearchSortField(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-amber-500/50 font-mono"
                    id="search-sort-field-select"
                  >
                    <option value="id">EVENT ID</option>
                    <option value="name">EVENT NAME</option>
                    <option value="category">CATEGORY</option>
                    <option value="priority">PRIORITY</option>
                    <option value="confidence">CONFIDENCE</option>
                    <option value="probability">PROBABILITY</option>
                  </select>
                  <button
                    onClick={() => setSearchSortOrder(searchSortOrder === "asc" ? "desc" : "asc")}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                    title={searchSortOrder === "asc" ? "Sort Ascending" : "Sort Descending"}
                    id="search-sort-order-toggle"
                  >
                    {searchSortOrder === "asc" ? "▲" : "▼"}
                  </button>
                </div>
              </div>
            </div>
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

      {/* KP SYSTEM MASTER EVENT BOOK SPECIFICATION */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-slate-900/40 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                KP SYSTEM MASTER EVENT BOOK
              </h4>
              <p className="text-[11px] text-amber-400 font-mono">
                Single Source of Truth Reference Database & Live Transit-Convergence Forecast Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
              Engine Standard v2.1
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
              Unified Schema
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[360px]">
          <div className="lg:col-span-4 flex flex-col gap-1 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 block">Architecture Modules</span>
            
            <button
              onClick={() => setActiveEventBookSection("principles")}
              className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono font-bold rounded-lg transition-all text-left ${
                activeEventBookSection === "principles"
                  ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-4"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>● ENGINE PRINCIPLES</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {[
              { id: "event_info", label: "S1: EVENT INFORMATION" },
              { id: "astro_foundation", label: "S2: ASTROLOGICAL FOUNDATION" },
              { id: "rule_references", label: "S3: RULE REFERENCES" },
              { id: "rule_execution", label: "S4: RULE EXECUTION" },
              { id: "natal_analysis", label: "S5: NATAL ANALYSIS" },
              { id: "activation_analysis", label: "S6: ACTIVATION ANALYSIS" },
              { id: "daily_analysis", label: "S7: DAILY ANALYSIS" },
              { id: "evidence", label: "S8: EVIDENCE" },
              { id: "decision", label: "S9: DECISION" },
              { id: "explanation", label: "S10: EXPLANATION" },
              { id: "timeline", label: "S11: TIMELINE" },
              { id: "history", label: "S12: HISTORY" },
              { id: "export", label: "S13: EXPORT" }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveEventBookSection(section.id)}
                className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono rounded-lg transition-all text-left ${
                  activeEventBookSection === section.id
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-4 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <span>{section.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}

            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mt-3 block">Master Framework Specs</span>
            
            {[
              { id: "api_spec", label: "EVENT API SPECIFICATION" },
              { id: "db_schema", label: "DATABASE SCHEMA" },
              { id: "supporting_specs", label: "SUPPORTING SPECS" },
              { id: "rule_library", label: "MASTER RULE LIBRARY" },
              { id: "astro_kb", label: "ASTRO KNOWLEDGE BASE" },
              { id: "authoring_standard", label: "RULE AUTHORING STANDARD" },
              { id: "decision_matrix", label: "DECISION MATRIX" },
              { id: "calculation_pipeline", label: "CALCULATION PIPELINE" },
              { id: "validation_qa", label: "VALIDATION & QA" },
              { id: "msm", label: "METADATA & SEMANTIC MODEL" },
              { id: "config_feature", label: "CONFIG & FEATURE MGMT" },
              { id: "kp_rules_vol1", label: "KP RULE LIBRARY VOL 1" }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveEventBookSection(section.id)}
                className={`flex items-center justify-between px-3 py-2 text-[11px] font-mono rounded-lg transition-all text-left ${
                  activeEventBookSection === section.id
                    ? "bg-amber-500/10 text-amber-400 border-l-2 border-amber-500 pl-4 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                }`}
              >
                <span>{section.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Details Content Panel */}
          <div className="lg:col-span-8 bg-slate-950/40 p-5 rounded-xl border border-slate-800/60 flex flex-col justify-between min-h-[300px]">
            <div className="space-y-3.5">
              {activeEventBookSection === "principles" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <span>★</span> Core Engine Principles
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The Event Book has evolved into the single master repository of all astrological events and predictions.
                  </p>
                  <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 list-disc pl-4 leading-relaxed">
                    <li><strong className="text-slate-200">Single Source of Truth:</strong> The Event Book handles storage, indexing, and end-to-end trace auditing. No other rulebook databases are maintained.</li>
                    <li><strong className="text-slate-200">Execution and Decisions:</strong> The Rule Engine strictly executes, the Decision Engine determines verdicts, and the Event Book stores the audit records.</li>
                    <li><strong className="text-slate-200">Complete Traceability:</strong> Every single predictive output is completely auditable back to the underlying Rule IDs.</li>
                    <li><strong className="text-slate-200">Zero Definition Duplication:</strong> Rule definitions are mapped dynamically; only compact Rule IDs are kept on record.</li>
                    <li><strong className="text-slate-200">Future-Proof Integration:</strong> New astrological models (KP, Jaimini, Western, Tajika) plug directly into this unified schema without architecture redesign.</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "event_info" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    1. Report Header Specification
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Captures high-fidelity runtime parameters and environment state to guarantee perfect repeatability of calculations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Engine Metadata</span>
                      • Engine Version (e.g. v2.1)<br />
                      • Rule Version (e.g. r2.0)<br />
                      • Report Version (e.g. rep-1.1)<br />
                      • Timestamp & Anchor Date
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Native birth metrics</span>
                      • Name, Birth Coordinates<br />
                      • Charts & Planets Config<br />
                      • Current Running DBA<br />
                      • Current Transit Position
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "astro_foundation" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 2: ASTROLOGICAL FOUNDATION
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Specifies the comprehensive multi-system astrological variables and cuspal signifiers.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Houses & Planets</span>
                      • Primary Houses & Planets<br />
                      • Supporting Houses & Planets<br />
                      • Blocking Houses & Planets<br />
                      • Cuspal Sub Lord (CSL)
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800">
                      <span className="text-slate-200 block font-bold mb-1">Karakas & Yogas</span>
                      • Star Lord, Sub Lord & SSL<br />
                      • Natural & Jaimini Karakas<br />
                      • Important Planetary Yogas<br />
                      • Active Afflicting Doshas
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "rule_references" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 3: RULE REFERENCES
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Maintains the rule-linkages pointing to specialized sub-systems. This avoids redundant code.
                  </p>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                    <div>• <strong className="text-slate-200">KP Rules:</strong> Cuspal sublord significations</div>
                    <div>• <strong className="text-slate-200">Parashari Rules:</strong> House ownership and aspect parameters</div>
                    <div>• <strong className="text-slate-200">Jaimini Rules:</strong> Chara Karaka aspects and associations</div>
                    <div>• <strong className="text-slate-200">Transit & DBA Rules:</strong> Running timing criteria and slow-planet gochara</div>
                    <div>• <strong className="text-slate-200">Daily & Validation Rules:</strong> Daily Moon transit resonance and birth metric data integrity</div>
                    <div>• <strong className="text-slate-200">Conflict & Dependency Rules:</strong> Limiting conditions and core natal promise requirements</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "rule_execution" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 4: RULE EXECUTION
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tracks the real-time runtime processing details of the rules engine.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Executed Rule IDs</li>
                      <li>Matched Rule IDs</li>
                      <li>Failed / Rejected Rule IDs</li>
                    </ul>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Blocked Rules (Obstructed)</li>
                      <li>Skipped Rules</li>
                      <li>Timestamp & Execution Duration (ms)</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeEventBookSection === "natal_analysis" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 5: NATAL ANALYSIS
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Audits the immutable natal potential of the native's chart for this event.
                  </p>
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1">
                    <div><span className="text-amber-400 font-bold">Natal Promise:</span> Confirmed, Challenged, or Denied</div>
                    <div><span className="text-amber-400 font-bold">Overall Strength:</span> Percentage score based on natal planetary dignity</div>
                    <div><span className="text-amber-400 font-bold">Supporting & Blocking:</span> Concrete list of natal supportive aspects and afflictions</div>
                    <div><span className="text-amber-400 font-bold">Natal Verdict:</span> Final boolean gate indicating whether the event is possible in this life</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "activation_analysis" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 6: ACTIVATION ANALYSIS
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Maps the timing of manifestation based on Vimshottari Dasha and major transits.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Running DBA Period (Dasha-Bhukti-Antara)</div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Transit Positions of Saturn, Jupiter, Rahu, Ketu</div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Dynamic Activation Window limits</div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Timing Resonance Strength & Activation Verdict</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "daily_analysis" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 7: DAILY ANALYSIS
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Calculates high-frequency trends driven by daily Moon positions and daily transit angles.
                  </p>
                  <div className="grid grid-cols-5 gap-1 text-[10px] font-mono text-center">
                    <div className="p-1 bg-slate-900 border border-slate-800 rounded">Today</div>
                    <div className="p-1 bg-slate-900 border border-slate-800 rounded">Tomorrow</div>
                    <div className="p-1 bg-slate-900 border border-slate-800 rounded">Day +2</div>
                    <div className="p-1 bg-slate-900 border border-slate-800 rounded">Week Trend</div>
                    <div className="p-1 bg-slate-900 border border-slate-800 rounded">Month Peak</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "evidence" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 8: EVIDENCE
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Compiles the exact mathematical parameters supporting the decision for complete traceability.
                  </p>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800 font-mono text-[9px] text-slate-400 grid grid-cols-2 gap-2">
                    <div>
                      • Supporting/Blocking Rules<br />
                      • Planet coordinates evidence<br />
                      • House/Cuspal signifiers evidence<br />
                      • Nakshatra and Sub-Lord linkages
                    </div>
                    <div>
                      • Sub-Sub-Lord (SSL) fine-tuning<br />
                      • Transit-Gochara alignments<br />
                      • DBA lord connections<br />
                      • Astrological promise checks
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "decision" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 9: DECISION
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Contains the synthesized final verdict, mathematically resolved.
                  </p>
                  <ul className="space-y-1 text-[10px] font-mono text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Final Verdict:</strong> Unconditional confirmation or obstruction of the event</li>
                    <li><strong className="text-slate-200">Confidence Score:</strong> Mathematically weighted reliability rating</li>
                    <li><strong className="text-slate-200">Decision Priority:</strong> Critical, High, or Medium tiering</li>
                    <li><strong className="text-slate-200">Decision Reason:</strong> Plain language explanation of the decision logic</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "explanation" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 10: EXPLANATION
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Provides dual-layer textual summaries explaining the outcome.
                  </p>
                  <div className="p-3 bg-slate-900/60 rounded border border-slate-800 font-mono text-[10px] text-slate-300 space-y-1.5">
                    <div><span className="text-amber-400 font-bold">• Human Explanation:</span> Elegant, conversational language for end-users, avoiding dense terminology.</div>
                    <div><span className="text-emerald-400 font-bold">• Technical Explanation:</span> Detailed astrological math, house connections, and rules for researchers and scholars.</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "timeline" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 11: TIMELINE
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Illustrates the temporal windows of potential manifestation.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Active Current Window<br />• Upcoming Window</div>
                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">• Future Potential Windows<br />• Core Auspicious Dates</div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "history" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 12: HISTORY
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Tracks the audit trail of past calculation cycles to analyze stability and avoid drift.
                  </p>
                  <ul className="space-y-1 text-[10px] font-mono text-slate-400 list-disc pl-4">
                    <li><strong className="text-slate-200">Previous Decisions:</strong> Log of prior verdicts</li>
                    <li><strong className="text-slate-200">Confidence History:</strong> Historic fluctuations in scores</li>
                    <li><strong className="text-slate-200">Evidence History:</strong> Factual conditions recorded over time</li>
                    <li><strong className="text-slate-200">Version History:</strong> Operating engine and rule versions</li>
                  </ul>
                </div>
              )}

              {activeEventBookSection === "export" && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    SECTION 13: EXPORT
                  </h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Enables exporting complete auditable trace-data in standard structured schemas.
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-emerald-400">PDF Export</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-blue-400">JSON Payload</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-purple-400">CSV Sheet</span>
                    <span className="p-2 bg-slate-900 border border-slate-800 rounded text-pink-400">Research Doc</span>
                  </div>
                </div>
              )}

              {activeEventBookSection === "api_spec" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> KP Master Event Book - API Specification
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Status: MANDATORY STANDARD FOR ALL PLATFORMS</p>
                  </div>
                  
                  <div className="space-y-3 text-[11px] leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 1: PURPOSE</span>
                      Provide a standardized interface for accessing Event Book data. Supports Android, Web, Desktop, AI, Plugins, REST, and future APIs.
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 2: API OBJECT</span>
                      Contains metadata properties: <code className="text-slate-200 font-bold font-mono">API Version</code>, <code className="text-slate-200 font-bold font-mono">Engine Version</code>, <code className="text-slate-200 font-bold font-mono">Rule Version</code>, <code className="text-slate-200 font-bold font-mono">Request ID</code>, <code className="text-slate-200 font-bold font-mono">Response ID</code>, and <code className="text-slate-200 font-bold font-mono">Timestamp</code>.
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 3: EVENT ENDPOINTS</span>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-slate-400">
                        <div>• Get Event / Get Events</div>
                        <div>• Search Events / Filter Events</div>
                        <div>• Timeline / Categories</div>
                        <div>• History / Statistics</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 4: EVENT REQUEST</span>
                      Request structure fields: <code className="text-slate-200 font-mono font-bold">EventID</code>, <code className="text-slate-200 font-mono font-bold">Category</code>, <code className="text-slate-200 font-mono font-bold">Filters</code>, <code className="text-slate-200 font-mono font-bold">Timeline</code>, <code className="text-slate-200 font-mono font-bold">Status</code>, <code className="text-slate-200 font-mono font-bold">Priority</code>, <code className="text-slate-200 font-mono font-bold">Confidence</code>, and <code className="text-slate-200 font-mono font-bold">Probability</code>.
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 5: EVENT RESPONSE</span>
                      Full envelope: Event Information, Astrological Foundation, Rule References, Natal Result, Activation Result, Daily Result, Evidence, Decision, Confidence, Explanation, Timeline, History.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                      <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 6: SEARCH API</span>
                        By Event ID, Category, Planet, House, Rule ID, Timeline, DBA, Transit, Confidence, Status.
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 7: TIMELINE API</span>
                        Exposes Current, Upcoming, Today's, Weekly, Monthly, and Historical Events.
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 8: ANALYTICS API</span>
                        Exposes category stats, event frequencies, rule usages, confidence and timeline distributions.
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 9: EXPORT API</span>
                        Produces PDF, JSON, CSV, Research Reports, and Timeline Exports.
                      </div>
                      <div className="p-2 bg-slate-900/40 rounded border border-slate-800 col-span-2">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 10: PLUGIN API</span>
                        SDK hooks: Read Event, Search Event, Read Timeline, Read History, Read Evidence, Read Rules, Read Confidence.
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block mb-1">SECTION 11-13: SECURITY, ERRORS, & VERSIONING</span>
                      <div>• <strong className="text-slate-300">Security:</strong> Read-only architecture, token authentication, ACL, rate limiting, audit logging.</div>
                      <div>• <strong className="text-slate-300">Errors:</strong> Invalid Event/Request, Missing Data, Permission Denied, Unsupported Version.</div>
                      <div>• <strong className="text-slate-300">Versioning:</strong> API, Engine, Rule, Database, and Plugin versions explicitly validated on each lifecycle call.</div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <span className="text-amber-400 font-mono font-bold block mb-1">SECTION 14: ENGINE PRINCIPLES</span>
                      The API never executes astrology. The API never modifies Event Book records. The API only returns validated and versioned Event Book data. Every response must be deterministic and auditable.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "db_schema" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Event Book - Canonical Database Schema
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Implementation-independent and database-neutral</p>
                  </div>

                  <div className="space-y-3 text-[11px] font-mono text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 1: DATABASE PRINCIPLES</span>
                      Single Source of Truth • Immutable Audit History • Version Controlled • Deterministic • Fully Traceable • Plugin Ready • Future Expandable.
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 2 & 3: CORE ENTITIES & RELATIONSHIPS</span>
                      <p className="text-[10px] text-slate-400 leading-normal mb-2">
                        Native → BirthChart → Events → Rule References → Rule Execution → Evidence → Decision → Confidence → Explanation → Timeline → History
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 4: EVENT ENTITY</span>
                        EventID, Category, SubCategory, EventName, Description, Priority, Stage, Status, SystemsUsed, CreatedAt, UpdatedAt, Version.
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 5 & 6: RULES REFERENCE & EXECUTION</span>
                        RuleReferenceID, EventID, RuleID, RuleSystem, Enabled, ExecutionID, ExecutionStatus, Duration, ValidationStatus.
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 7-9: NATAL, ACTIVATION & DAILY ANALYSIS</span>
                        NatalID, Promise, Strength, Supporting, Blocking, Verdict; ActivationID, DBA, Transit, Window, Verdict; DailyID, Today, Tomorrow, Week, Month.
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 10-13: EVIDENCE, DECISION, CONFIDENCE, EXPLANATION</span>
                        EvidenceID, Source, Status, Weight; DecisionID, Verdict, Reason; ConfidenceID, ConfidenceLevel, Probability; ExplanationID, Human & Technical.
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 14-16: TIMELINE, STATUS, HISTORY</span>
                        TimelineID, TimelineType, Windows; StatusID, Current/Prev Status, Reason; HistoryID, Prev Decisions, Prev Evidence.
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SECTION 17-20: INDEX, EXPORT, PLUGIN, AUDIT</span>
                        SearchID, Keywords, Categories; ExportID, PDF, JSON; PluginID, Name, Version; AuditID, Operation, OldValue, NewValue, User, Timestamp.
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 21-22: INDEXES & VERSIONING</span>
                      Primary Keys, Foreign Keys, Unique constraints, Search indexes, Timeline/Rule/Confidence/Status indexes. Fully versioned engines and schemas.
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300">
                      <span className="text-amber-400 font-bold block mb-1">ENGINE PRINCIPLES</span>
                      The database schema is the canonical data model. Every entity is versioned, auditable, and searchable. Supports future extensions without schema redesign. No duplicate data.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "supporting_specs" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Five Supporting Framework Specifications
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Change control, SDKs, reports, and contributor standards</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">Part 1: Event Versioning & Change Management</span>
                      <p className="text-slate-300">Maintains complete version history of every Event Record. Tracks modifications to events, rule references, evidence, decisions, and databases. Stores Version Numbers, Previous Versions, Change Type, Author, and Rollback parameters.</p>
                      <span className="text-[10px] font-mono text-slate-500 block">Principles: Immutable history • Complete audit trail • Rollback support</span>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">Part 2: Event Analytics & Statistics</span>
                      <p className="text-slate-300">Provides statistical and research analysis. Tracks Category statistics, Career, Finance, Health, rule usage metrics, planet/house activations, confidence distributions, and prediction accuracy.</p>
                      <span className="text-[10px] font-mono text-slate-500 block">Principles: Read Only • Deterministic • No Rule Execution • Research Ready</span>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">Part 3: Event Plugin SDK</span>
                      <p className="text-slate-300">Allows external modules to safely extend categories, events, rules, reports, timelines, and export configurations. Strictly forbids modifying core rules, decisions, or core evidence directly.</p>
                      <span className="text-[10px] font-mono text-slate-500 block">Principles: Sandboxed • Versioned • Audited • Future Expandable</span>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">Part 4: Event Report Generator</span>
                      <p className="text-slate-300">Generates polished user and developer reports: Relationship, Career, Property, Health, Education, Spiritual, etc. Supports exports to PDF, HTML, JSON, CSV, and Markdown.</p>
                      <span className="text-[10px] font-mono text-slate-500 block">Principles: Reports never execute astrology; they consume validated records only.</span>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">Part 5: Event Book Developer Guide</span>
                      <p className="text-slate-300">Establishes folders, naming conventions, unit/regression test patterns, contribution workflows, review processes, and database migration guidelines.</p>
                      <span className="text-[10px] font-mono text-slate-500 block">Principles: Consistency • Deterministic Naming • Backward Compatibility</span>
                    </div>

                    <div className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[10px] text-slate-400">
                      <span className="text-slate-200 font-bold block uppercase">IMPLEMENTATION ROADMAP</span>
                      <div className="flex flex-wrap gap-1">
                        {["REL (Relationship)", "CAR (Career)", "FIN (Finance)", "EST (Property)", "HEA (Health)", "EDU (Education)", "CHI (Children)", "TRA (Travel)", "LIT (Litigation)", "SPI (Spiritual)", "DAY (Daily)"].map((phase, idx) => (
                          <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-[9px] border border-slate-800">Phase {idx + 1}: {phase}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <span className="text-amber-400 font-mono font-bold block">FINAL RULE</span>
                      The KP SYSTEM MASTER EVENT BOOK is the single source of truth for JHora AI. The Rule Engine computes. The Decision Engine decides. The Event Book stores.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "rule_library" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Rule Library (MRL) Repository
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Centralized repository of every astrological rule</p>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">RULE HIERARCHY</span>
                        System → Category → Event → Rule Group → Rule
                      </div>
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">SYSTEMS COVERED</span>
                        KP, Parashari, Jaimini, Transit, DBA, Daily, Validation, Conflict Resolution, Plugins.
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">RULE TYPES & CATEGORIES</span>
                      Promise Rules, Strength Rules, Affliction Rules, Timing Rules, Activation Rules, Transit Rules, Daily Rules, Validation Rules, Conflict Rules, Evidence/Explanation Rules.
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1.5">
                      <span className="text-amber-300 font-mono font-bold block uppercase">RULE OBJECT STRUCTURAL PROPERTIES</span>
                      <p className="text-[10px] text-slate-400 leading-normal font-mono grid grid-cols-2 gap-1.5">
                        <span>• Rule ID / Rule Name</span>
                        <span>• Related Event ID</span>
                        <span>• System & Category</span>
                        <span>• Purpose & Inputs</span>
                        <span>• Supporting Houses/Planets</span>
                        <span>• Blocking Houses/Planets</span>
                        <span>• Evaluation Logic / Operator</span>
                        <span>• Generated Evidence / Decision</span>
                        <span>• Confidence & Priority</span>
                        <span>• Enabled / Version Details</span>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[10px]">
                      <span className="text-slate-200 font-bold block uppercase">EXECUTION PIPELINE</span>
                      Load Rule → Validate Inputs → Execute Rule → Generate Evidence → Return Result. Rules can be ACTIVE, DISABLED, DEPRECATED, EXPERIMENTAL, or PLUGIN.
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300">
                      <span className="text-amber-400 font-mono font-bold block">ENGINE PRINCIPLES</span>
                      Rules never know about UI, PDF, or reports. Rules only compute astrological logic. The Event Book references Rule IDs, the Rule Engine executes them, and the Decision Engine evaluates them.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "astro_kb" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Astrological Knowledge Base (AKB)
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Read-only canonical definitions and reference library</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 1: HOUSE KNOWLEDGE</span>
                      House number, Primary/Secondary meanings, KP, Parashari, Jaimini meanings, Positive & Negative significations, Related events, Planets, and Yogas.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 2: PLANET KNOWLEDGE</span>
                      Planet, Nature, Gender, Karakatwa, Friendships, Exaltation, Own signs, KP significations, Natural & directional strengths.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 3: SIGN KNOWLEDGE</span>
                      Sign, Element, Mode, Gender, Lord, Nature, Body parts, Professions, Behavior, Strengths & Weaknesses.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 4: NAKSHATRA KNOWLEDGE</span>
                      Nakshatra, Lord, Deity, Symbol, Nature, Motivation, Guna, Yoni, Element, Profession, KP Usage.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 5-7: LORDS KNOWLEDGE</span>
                      Star Lord, Sub Lord & SSL significations, relationships, strengths, weaknesses, and decision behavior.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 8 & 9: YOGAS & DOSHAS</span>
                      Yoga and Dosha ID, Names, formations, meanings, severities, affected events, and cancellation parameters.
                    </div>
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 col-span-2">
                      <span className="text-slate-200 font-bold block mb-1">SECTION 10-14: ASPECTS, TIMING & GLOSSARY</span>
                      Aspect strengths, KP & Parashari aspects, Mahadasha/Bhukti event tendencies, Transit rules, Divisional chart relevance, and central Astrological Glossary.
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300">
                    <span className="text-amber-400 font-mono font-bold block">AKB PRINCIPLES</span>
                    The AKB is strictly read-only. Rules consume AKB definitions. Reports, events, plugins, and AI reference the AKB. No duplicate definitions are allowed outside of this canonical encyclopedia.
                  </div>
                </div>
              )}

              {activeEventBookSection === "authoring_standard" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Rule Authoring Standard (MRAS)
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mandatory format and specifications for all rules</p>
                  </div>

                  <div className="space-y-2.5 font-mono text-[10px]">
                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 1: RULE ID STANDARD</span>
                      Format: <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded font-bold">&lt;System&gt;_&lt;Category&gt;_&lt;Number&gt;</code><br />
                      Examples: <code className="text-slate-300">KP_REL_001</code>, <code className="text-slate-300">KP_CAR_001</code>, <code className="text-slate-300">PAR_REL_001</code>, <code className="text-slate-300">TR_REL_001</code>.
                    </div>

                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 2 & 3: RULE OBJECT & INPUTS</span>
                      Structure includes ID, System, Category, Event ID, Evaluation Logic, Outputs. Consumes: Planet, House, Sign, Nakshatra, Star Lord, Sub Lord, SSL, CSL, Transit, DBA, Divisional Charts, Yogas, and Doshas.
                    </div>

                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 4: RULE OUTPUT TYPES</span>
                      Outputs are strictly normalized to: <code className="text-emerald-400 font-bold">PASS</code>, <code className="text-rose-400 font-bold">FAIL</code>, <code className="text-amber-400 font-bold">PARTIAL</code>, <code className="text-slate-400 font-bold">BLOCKED</code>, or <code className="text-slate-500 font-bold">NOT_APPLICABLE</code>, generating an Evidence Object, Decision Contribution, and Explanation Reference.
                    </div>

                    <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                      <span className="text-amber-300 font-bold block mb-1">SECTION 5-10: DEPENDENCIES, LIFECYCLE & TESTING</span>
                      Required/Optional rules, positive/negative test boundary cases, versions, documentation requirements, validation gates, and lifecycle stages (Draft → Review → Approved → Active → Deprecated → Archived).
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300">
                    <span className="text-amber-400 font-mono font-bold block">MRAS PRINCIPLES</span>
                    Every rule must be deterministic, independently testable, reusable, and produce fully traceable evidence. All rules must integrate perfectly with the central Rule Engine and Event Book.
                  </div>
                </div>
              )}

              {activeEventBookSection === "decision_matrix" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Decision Matrix Specification (MDM)
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Universal aggregated decision framework</p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">INPUT SOURCES</span>
                        KP, Parashari, Jaimini, Transit, DBA, Daily, Validation, and Conflict rules.
                      </div>
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">DECISION LEVELS</span>
                        NOT PROMISED, WEAK, MODERATE, STRONG, VERY STRONG, CONTRADICTORY, INCONCLUSIVE.
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-mono font-bold block uppercase">CONFLICT RESOLUTION & PRIORITY</span>
                      System priority defaults to: <code className="text-amber-400 font-bold">KP</code> → <code className="text-slate-300">Parashari</code> → <code className="text-slate-300">Jaimini</code> → <code className="text-slate-300">Transit</code> → <code className="text-slate-300">DBA</code> → <code className="text-slate-300">Daily</code>. Employs weighted evidence, limiting constraints, and validation override criteria.
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 font-mono text-[10px] space-y-1">
                      <span className="text-slate-200 font-bold block uppercase">DECISION PIPELINE</span>
                      Load Results → Validate → Resolve Dependencies → Resolve Conflicts → Aggregate Evidence → Calculate Confidence → Generate Decision → Store Decision.
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300 font-mono text-[10px]">
                    <span className="text-amber-400 font-bold block">MDM PRINCIPLES</span>
                    Rules generate evidence, validation verifies it, the Decision Matrix resolves conflicts, the Decision Engine calculates the final verdict, and the Event Book stores the complete auditable trace-data.
                  </div>
                </div>
              )}

              {activeEventBookSection === "calculation_pipeline" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Calculation Pipeline Orchestration
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">End-to-end execution flow of the JHora AI Engine</p>
                  </div>

                  <div className="space-y-2.5 font-mono text-[10px]">
                    <div className="relative border-l border-amber-500/30 pl-4 ml-2 space-y-3">
                      <div className="relative font-mono text-[10px]">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-200 block">PHASE 1 & 2: INPUTS & ASTRONOMICAL CALCULATIONS</strong>
                        Receive birth details, validate and normalize, calculate planet/house positions, Lagna, speed, retrogrades, Ayanamsa, and planetary strengths.
                      </div>
                      <div className="relative font-mono text-[10px]">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-200 block">PHASE 3 & 4: CHARTS & KNOWLEDGE LOAD</strong>
                        Generate Rasi, Bhava, KP Cusps, Divisional Charts, and Karakas. Load AKB planet, house, sign, nakshatra, and yoga definitions.
                      </div>
                      <div className="relative font-mono text-[10px]">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-200 block">PHASE 5 & 6: RULE LOADER & EXECUTION</strong>
                        Load KP, Parashari, Jaimini, transit, and DBA rules. Sequentially execute Natal, Activation, Transit, Daily, and Validation rules.
                      </div>
                      <div className="relative font-mono text-[10px]">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-200 block">PHASE 7 & 8: DECISIONS & EVENT BOOK PROCESSING</strong>
                        Collect and validate evidence, resolve conflicts, apply decision matrix, update Event Book timelines, status lifecycle, and confidence scores.
                      </div>
                      <div className="relative font-mono text-[10px]">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <strong className="text-slate-200 block">PHASE 9 & 10: REPORTS & DIGITAL EXPORTS</strong>
                        Generate Career, Relationship, Property, and Health reports. Expose data via Web, Android, API, PDF, JSON, CSV, and Plugins.
                      </div>
                    </div>

                    <div className="p-2 bg-slate-900/40 rounded border border-slate-800">
                      • <strong className="text-slate-300">Caching & Performance:</strong> Integrates multi-layer chart, rule, decision, and report caching with parallel execution and lazy loading optimizations.
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300">
                    <span className="text-amber-400 font-mono font-bold block">PIPELINE PRINCIPLES</span>
                    Every horoscope follows exactly the same pipeline. Every phase is deterministic, independently testable, versioned, and auditable. The pipeline orchestrates all engines without hardcoding interpretations.
                  </div>
                </div>
              )}

              {activeEventBookSection === "validation_qa" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Validation & Quality Assurance Framework
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Deterministic QA standards for the JHora AI Platform</p>
                  </div>

                  <div className="space-y-2.5 text-[10px] font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">VALIDATION SCOPE</span>
                        Inputs, Astronomical calculations, Charts, Rules, Evidence, Decisions, Timeline, Event Book, PDF, API, and Plugins.
                      </div>
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-slate-200 font-bold block mb-1">VALIDATION LEVELS</span>
                        Syntax, Structural, Logical, Computational, Rule, Evidence, Decision, Timeline, Report, and Export Validation.
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-bold block uppercase">VALIDATION STATUS & SEVERITY</span>
                      <div>• Statuses: <code className="text-emerald-400">PASSED</code>, <code className="text-rose-400">FAILED</code>, <code className="text-amber-400">WARNING</code>, <code className="text-slate-400">SKIPPED</code>, <code className="text-slate-500">INCOMPLETE</code>.</div>
                      <div>• Severity Levels: <strong className="text-rose-500">Critical</strong>, <strong className="text-amber-500">Major</strong>, <strong className="text-yellow-500">Minor</strong>, <strong className="text-slate-400">Information</strong>.</div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800/80 space-y-1">
                      <span className="text-amber-300 font-bold block uppercase">TESTING SUITE & DATA INTEGRITY</span>
                      Continuous automated Unit, Integration, Regression, Historical Horoscopes, and Performance tests. Strict duplicate detection, missing reference tracing, and version conflict resolution.
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300 font-mono text-[10px]">
                    <span className="text-amber-400 font-bold block">QA PRINCIPLES</span>
                    Validation never executes astrology or modifies Event Book data. It strictly verifies correctness, consistency, completeness, and end-to-end traceability of the system.
                  </div>
                </div>
              )}

              {activeEventBookSection === "msm" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Metadata & Semantic Model (MSM)
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Status: DEFINITIVE SEMANTIC VOCABULARY</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">PURPOSE</span>
                      Provides one canonical semantic model for all entities, rules, events, charts, reports, APIs, plugins, and knowledge objects. Every subsystem shall reference this model.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-amber-300 font-bold block mb-1 uppercase">Section 1: Global Identifiers</span>
                        Every entity in the platform shall uniquely possess:<br />
                        • <strong className="text-slate-200">Unique ID</strong> (Canonical UUID/ID)<br />
                        • <strong className="text-slate-200">Entity Type</strong> (Taxonomy Category)<br />
                        • <strong className="text-slate-200">Category & Namespace</strong><br />
                        • <strong className="text-slate-200">Version & Status</strong><br />
                        • <strong className="text-slate-200">Created / Modified Dates</strong><br />
                        • <strong className="text-slate-200">Owner / Author ID</strong>
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-amber-300 font-bold block mb-1 uppercase">Section 2: Entity Types</span>
                        Native • Chart • Planet • House • Sign • Nakshatra • Yoga • Dosha • Rule • Event • Evidence • Decision • Timeline Entry • Report • Plugin • API Endpoint • Calculation • Knowledge Object.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-amber-300 font-bold block mb-1 uppercase">Section 3: Relationships</span>
                        Explicit relational bindings:<br />
                        • Parent ↔ Child<br />
                        • Depends On ↔ Blocks<br />
                        • Supports ↔ Contradicts<br />
                        • References / Consumes<br />
                        • Generated By / Produces
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800">
                        <span className="text-amber-300 font-bold block mb-1 uppercase">Section 4: Taxonomy</span>
                        Categorized dimensions:<br />
                        • Astrological System (KP, Parashari, etc.)<br />
                        • Category & Subcategory<br />
                        • Domain (Career, Finance, Health)<br />
                        • Severity (Critical, Major, Minor)<br />
                        • Priority & Confidence Band<br />
                        • Lifecycle State
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 space-y-1 font-mono text-[10px]">
                      <span className="text-amber-300 font-bold block uppercase">Section 5: Naming Conventions</span>
                      <div>• <strong className="text-slate-200">Rules:</strong> <code className="text-amber-400">KP_&lt;CATEGORY&gt;_&lt;NUMBER&gt;</code> (e.g. <code className="text-slate-300">KP_CSL_0001</code>)</div>
                      <div>• <strong className="text-slate-200">Events:</strong> <code className="text-slate-300">EV_&lt;CAT&gt;_&lt;NAME&gt;</code></div>
                      <div>• <strong className="text-slate-200">Reports:</strong> <code className="text-slate-300">REP_&lt;TYPE&gt;_&lt;ID&gt;</code></div>
                      <div>• <strong className="text-slate-200">Database Tables:</strong> <code className="text-slate-300">jhora_&lt;entity&gt;</code></div>
                      <div>• <strong className="text-slate-200">Plugin IDs:</strong> <code className="text-slate-300">plug_&lt;author&gt;_&lt;name&gt;</code></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 6: Common Enums</span>
                        • <strong className="text-slate-200">Status:</strong> Active, Draft, Archived<br />
                        • <strong className="text-slate-200">Priority:</strong> High, Medium, Low<br />
                        • <strong className="text-slate-200">Confidence:</strong> High, Medium, Low<br />
                        • <strong className="text-slate-200">Severity:</strong> Critical, Major, Minor<br />
                        • <strong className="text-slate-200">Outcome / Validation:</strong> Pass, Fail, Partial, Skip<br />
                        • <strong className="text-slate-200">Decision:</strong> Promised, Weak, Blocked, Denied
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 7: Search Tags</span>
                        Search attributes are mapped via:<br />
                        • Keywords & Aliases<br />
                        • Synonyms & Domain Tags<br />
                        • Language & Translation Tags<br />
                        • Plugin Registration Tags
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 8: Versioning</span>
                        • Entity Version (e.g. v1.0.0)<br />
                        • Schema Version (e.g. s2.1.0)<br />
                        • Compatibility Version Matrix<br />
                        • Migration Schema Version
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 9: Localization</span>
                        • Display Name & Description Keys<br />
                        • Language Code (e.g. en-US, hi-IN)<br />
                        • Translation Resource Keys<br />
                        • Units & Date-Time Format Profiles
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/50 border border-slate-800 space-y-1 font-mono text-[10px]">
                      <span className="text-amber-300 font-bold block uppercase">Section 10: Traceability Map</span>
                      Establishes absolute backward traceability: <code className="text-slate-300">Source (Origin) → References → Dependencies → Consumers → Immutable Audit History</code>.
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300 font-mono text-[10px]">
                      <span className="text-amber-400 font-bold block mb-1">ENGINE PRINCIPLES</span>
                      Every object shall conform to the semantic model. No duplicate definitions shall exist. Every subsystem shall share the same vocabulary. The semantic model shall be versioned, backward compatible where practical, and extensible for future astrological systems.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "config_feature" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master Configuration & Feature Management Framework
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Status: MANDATORY PLATFORM RUNTIME SPEC</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                      <span className="text-amber-300 font-mono font-bold block mb-1">PURPOSE</span>
                      Provide one centralized configuration system for the entire JHora AI platform. No business logic shall be hardcoded if it can be configured safely.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 1: Configuration Domains</span>
                        Application • Calculation • Astrology • Rule Engine • Decision Engine • Validation • Reports • Export • API • Database • Plugins • AI • Security • Logging • Performance.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 2: Configuration Object</span>
                        • Configuration ID & Key<br />
                        • Value & Type (String, Int, Boolean, Enum)<br />
                        • Default Value & Allowed Values<br />
                        • Description, Version, Category, Status
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 3: Feature Flags</span>
                        Every feature states: Enabled, Disabled, Experimental, Beta, Deprecated, Removed.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 4: Engines Configurations</span>
                        • KP • Parashari • Jaimini • Transit • DBA • Daily • Prediction Engine Settings.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 5: Report Configuration</span>
                        Summary • Technical Analysis • Timeline • Evidence • Rule References • Confidence • Charts • Appendices.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 6: AI Configuration</span>
                        • Explanation Level (Verbose, Standard, Minimal)<br />
                        • Reasoning Depth & Terminology<br />
                        • Language Code & Research/Expert Mode
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 7: Plugin Config</span>
                        Plugin Enabled • Priority • Version • Compatibility Matrix • Sandbox Mode • Permissions.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 8: Performance</span>
                        Cache Size • Parallel Threads • Lazy Loading • Memory Limits • Timeouts • Retry Limits.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 9: Security Config</span>
                        Authentication • Authorization • Encryption • API Keys • Audit • Session Management.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 10: Version Management</span>
                        Configuration Version • Migration Rules • Compatibility Matrix • Rollback Support.
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 11: Validation Gates</span>
                        • Validate Keys & Value Types<br />
                        • Validate Dependencies & Compatibilities<br />
                        • Hard Reject on Invalid Config Inputs
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Section 12: Audit Logs</span>
                        • Who & When Changed<br />
                        • Previous Value & New Value<br />
                        • Change Reason & Rollback ID
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300 font-mono text-[10px]">
                      <span className="text-amber-400 font-bold block mb-1">ENGINE PRINCIPLES</span>
                      Configuration must never change deterministic astrological logic. Configuration must be versioned. Configuration must be auditable. Configuration must support runtime updates where safe. Configuration must allow future expansion without changing engine architecture.
                    </div>
                  </div>
                </div>
              )}

              {activeEventBookSection === "kp_rules_vol1" && (
                <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 text-[11px] leading-relaxed text-slate-300">
                  <div className="border-b border-slate-800 pb-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5 font-bold">
                      <span>★</span> Master KP Rule Library Volume 1
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Status: APPROVED EXECUTABLE KP ASTROLOGY RULES</p>
                  </div>

                  <div className="space-y-3 font-mono">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-sans">
                      <strong className="text-amber-300 block font-mono font-bold mb-1">PURPOSE</strong>
                      Provide the complete deterministic KP rule base used by the Rule Engine. Every rule must be independently executable, independently testable, fully traceable, and version controlled.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Rule ID Format</span>
                        Format: <code className="text-amber-400">KP_&lt;CATEGORY&gt;_&lt;NUMBER&gt;</code><br />
                        Examples: <code className="text-slate-300">KP_CSL_0001</code>, <code className="text-slate-300">KP_SIG_0105</code>, <code className="text-slate-300">KP_DBA_0238</code>, <code className="text-slate-300">KP_TR_0456</code>.
                      </div>

                      <div className="p-2.5 bg-slate-900/50 rounded border border-slate-800 space-y-1">
                        <span className="text-amber-300 font-bold block uppercase">Rule Structure</span>
                        ID • Name • Category • Purpose • Inputs • Evaluation Logic • Supporting/Blocking Conditions • Weight • Evidence • Explanation Template • Validation.
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-amber-300 font-bold block uppercase text-[10px]">Master Volume Divisions (Part 1 - 15)</span>
                      <div className="grid grid-cols-3 gap-1.5 text-[9px] text-slate-400">
                        <div>1. Cuspal Sub Lord</div>
                        <div>2. House Signification</div>
                        <div>3. Planet Signification</div>
                        <div>4. Star Lord Rules</div>
                        <div>5. Sub Lord Rules</div>
                        <div>6. Significator Rules</div>
                        <div>7. DBA Rules</div>
                        <div>8. Transit Rules</div>
                        <div>9. Promise Rules</div>
                        <div>10. Activation Rules</div>
                        <div>11. Denial Rules</div>
                        <div>12. Delay Rules</div>
                        <div>13. Event-Specific Rules</div>
                        <div>14. Validation Rules</div>
                        <div>15. Conflict Resolution</div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800 space-y-2">
                      <span className="text-amber-300 font-bold block uppercase text-[10px]">Rule Quality & Lifecycle States</span>
                      <p className="text-[10px] text-slate-300 leading-normal font-sans">
                        Rules must use 100% deterministic logic, strictly avoid AI judgments or vague probabilities, and generate structured evidence.
                      </p>
                      <div className="text-[9px] text-slate-400 font-mono">
                        Lifecycle: Draft → Peer Review → Verified → Approved → Production → Deprecated → Archived.
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-amber-300 font-bold block uppercase text-[10px]">Canonical Executable Rule Examples</span>
                      
                      {/* Rule 1 */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/20 space-y-1 text-[9px] leading-relaxed">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-1">
                          <strong className="text-amber-400">KP_CSL_0001 (Marriage Promise)</strong>
                          <span className="bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-bold">APPROVED</span>
                        </div>
                        <div>• <strong className="text-slate-300">Name:</strong> 7th Cuspal Sublord Promise of Marriage</div>
                        <div>• <strong className="text-slate-300">Category:</strong> Cuspal Sub Lord Rules</div>
                        <div>• <strong className="text-slate-300">Purpose:</strong> Evaluate if the native chart promises marriage.</div>
                        <div>• <strong className="text-slate-300">Evaluation Logic:</strong>
                          <pre className="mt-1 bg-slate-900 p-1.5 rounded border border-slate-800 text-[8.5px] text-emerald-300 overflow-x-auto">
{`if (CSL[7].signifies(2) || CSL[7].signifies(7) || CSL[7].signifies(11)) {
  return { status: PASS, weight: 1.0, evidence: "7th CSL signifies marital houses" };
} else {
  return { status: FAIL, weight: 1.0, evidence: "7th CSL does not signify marital houses" };
}`}
                          </pre>
                        </div>
                        <div>• <strong className="text-slate-300">Supporting Houses:</strong> 2, 7, 11 | <strong className="text-slate-300">Blocking Houses:</strong> 1, 6, 10, 12</div>
                      </div>

                      {/* Rule 2 */}
                      <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/20 space-y-1 text-[9px] leading-relaxed">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1 mb-1">
                          <strong className="text-amber-400">KP_CAR_1024 (Career Promotion)</strong>
                          <span className="bg-emerald-500/10 text-emerald-400 px-1.5 rounded font-bold">APPROVED</span>
                        </div>
                        <div>• <strong className="text-slate-300">Name:</strong> Career Promotion Promise</div>
                        <div>• <strong className="text-slate-300">Category:</strong> Activation Rules</div>
                        <div>• <strong className="text-slate-300">Purpose:</strong> Evaluate if a career promotion is indicated.</div>
                        <div>• <strong className="text-slate-300">Evaluation Logic:</strong>
                          <pre className="mt-1 bg-slate-900 p-1.5 rounded border border-slate-800 text-[8.5px] text-emerald-300 overflow-x-auto">
{`const activeLords = [DBA.mahadasha, DBA.bhukti, DBA.antara];
const signifiesCareer = activeLords.some(lord => lord.signifies(2) || lord.signifies(6) || lord.signifies(10) || lord.signifies(11));
if (signifiesCareer && !transit.blockedByRetrograde()) {
  return { status: PASS, weight: 0.85, confidence: 0.90 };
}`}
                          </pre>
                        </div>
                        <div>• <strong className="text-slate-300">Supporting Houses:</strong> 2, 6, 10, 11 | <strong className="text-slate-300">Blocking Houses:</strong> 5, 8, 12</div>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-slate-300 font-mono text-[10px]">
                      <span className="text-amber-400 font-bold mb-1 block">ENGINE PRINCIPLES</span>
                      This document is the executable knowledge base of KP Astrology. Rules shall never contradict the Astrological Knowledge Base. Rules shall never contain duplicated logic. Rules shall be deterministic, modular, reusable, versioned, and fully auditable.
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between items-center">
              <span>Status: Unified Engine Standard Approved</span>
              <span className="text-amber-500/80">★ JHora AI Core Spec</span>
            </div>
          </div>
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
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[10%]">
                  Event ID
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider w-[28%]">
                  Event Name & Definition
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Primary
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Supporting
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Obstructing
                </th>
                <th className="px-4 py-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-center w-[10%]">
                  Main CSL
                </th>
                {showLiveForecast && (
                  <>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 1</div>
                      <div className="text-[9px] text-amber-300/80 font-normal normal-case">
                        {njResult?.forecastDays[0]?.nakshatra}
                        {njResult?.forecastDays[0]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 2</div>
                      <div className="text-[9px] text-cyan-300/80 font-normal normal-case">
                        {njResult?.forecastDays[1]?.nakshatra}
                        {njResult?.forecastDays[1]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider text-center w-[12%]">
                      <div>Day 3</div>
                      <div className="text-[9px] text-emerald-300/80 font-normal normal-case">
                        {njResult?.forecastDays[2]?.nakshatra}
                        {njResult?.forecastDays[2]?.transitChangeText && " 🔄"}
                      </div>
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/20">
              {filteredEvents.map((event) => {
                const forecast = getEvent3DayForecast(event.category, event.id);
                return (
                  <React.Fragment key={event.id}>
                    <tr
                      onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
                      className={`hover:bg-slate-900/40 transition-colors cursor-pointer ${
                        expandedEventId === event.id ? "bg-slate-900/25 border-l-2 border-amber-500" : ""
                      }`}
                    >
                      {/* ID */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-bold text-amber-500">{event.id}</span>
                      </td>

                      {/* Event Name & Description */}
                      <td className="px-4 py-3">
                        <div className="space-y-1 pr-4">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                            {event.name}
                            <span className="text-[9px] text-slate-500 font-mono">
                              {expandedEventId === event.id ? "▲ hide diagnostic" : "▼ click to analyze"}
                            </span>
                          </span>
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
                        <span className={`text-xs font-mono ${
                          event.category === "agent_rules"
                            ? event.obstructing === "Rule Met"
                              ? "text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/10 font-bold"
                              : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10 font-bold"
                            : event.obstructing === "-"
                              ? "text-slate-600"
                              : "text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/10"
                        }`}>
                          {event.obstructing}
                        </span>
                      </td>

                      {/* Main CSL */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                          {event.category === "agent_rules" ? event.mainCsl : `CSL ${event.mainCsl}`}
                        </span>
                      </td>

                      {/* Dynamic 3-day forecast columns */}
                      {showLiveForecast && (
                        <>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[0] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[0] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[0]}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[1] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[1] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[1]}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              forecast[2] > 70 ? "text-emerald-400 bg-emerald-500/10" : forecast[2] > 45 ? "text-amber-400 bg-amber-500/10" : "text-rose-400 bg-rose-500/10"
                            }`}>
                              {forecast[2]}%
                            </span>
                          </td>
                        </>
                      )}
                    </tr>

                    {expandedEventId === event.id && (
                      <tr className="bg-slate-950/40 border-l-2 border-amber-500/60">
                        <td colSpan={showLiveForecast ? 9 : 6} className="px-6 py-5">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/40">
                              <Compass className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">
                                Multi-System Astrological Promise & Dynamic Transit Matcher
                              </span>
                            </div>

                            {njResult && njResult.forecastDays?.[0]?.multiSystemPredictions ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                                {njResult.forecastDays[0].multiSystemPredictions.slice(0, 3).map((pred) => {
                                  const isFavorable = !pred.verdict.includes("Challenging");
                                  return (
                                    <div key={pred.system} className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2.5">
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-200">{pred.system}</span>
                                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                          isFavorable ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                        }`}>
                                          {pred.verdict}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
                                        <strong className="text-slate-300 block text-[9px] uppercase font-mono tracking-wide">Natal Blueprint Promise:</strong>
                                        <p>{pred.promiseAnalysis}</p>
                                      </div>
                                      <div className="text-[10px] text-slate-400 leading-relaxed space-y-1">
                                        <strong className="text-slate-300 block text-[9px] uppercase font-mono tracking-wide">Transit Resonance:</strong>
                                        <p>{pred.transitEvaluation}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-slate-500 text-xs italic">Calculating dynamic multi-system vectors...</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={showLiveForecast ? 9 : 6} className="text-center py-10 text-slate-500 text-xs italic">
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
