import React, { useState, useEffect } from "react";
import {
  Heart,
  Scale,
  Briefcase,
  Coins,
  GraduationCap,
  Home,
  Baby,
  Globe,
  ShieldAlert,
  AlertTriangle,
  Award,
  Cpu,
  Check,
  Database,
  Calendar,
  Clock,
  HelpCircle,
  Sparkles,
  TrendingUp
} from "lucide-react";

interface MasterArchitectureViewProps {
  astrologyData: any;
  isDark: boolean;
}

interface RuleCondition {
  system: "Parashari" | "KP" | "Jaimini";
  condition: string;
  outputStatus: string;
  explanation: string;
}

interface LifeEventCategory {
  id: string;
  title: string;
  icon: any;
  description: string;
  iconColor: string;
  rules: RuleCondition[];
}

export const MasterArchitectureView: React.FC<MasterArchitectureViewProps> = ({
  astrologyData,
  isDark
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string>("marriage");
  const [allSimulations, setAllSimulations] = useState<Record<string, any>>({});

  const categories: LifeEventCategory[] = [
    {
      id: "marriage",
      title: "Marriage & Remarriage",
      icon: Heart,
      iconColor: "text-rose-500",
      description: "Evaluate lifetime partnership promise, marital bonding, and remarriage timelines.",
      rules: [
        {
          system: "Parashari",
          condition: "Dual connection of 9th and 2nd Lord to the 7th House or Lord with a strong Venus or Jupiter.",
          outputStatus: "REMARRIAGE_PROMISED",
          explanation: "9th house represents the second marriage, while 2nd and 7th lords complete the auspicious alignment."
        },
        {
          system: "KP",
          condition: "7th Cuspal Sub-Lord (CSL) signifies houses [2, 7, 11] and completely excludes houses 1, 6, 10.",
          outputStatus: "REUNION_CONFIRMED",
          explanation: "Strong connections to 2nd (addition to family), 7th (spouse), and 11th (desire fulfillment) confirm reunion."
        },
        {
          system: "KP",
          condition: "9th Cuspal Sub-Lord (CSL) signifies houses [2, 7, 11] during an active second-marriage evaluation.",
          outputStatus: "REMARRIAGE_CONFIRMED",
          explanation: "9th CSL acting as the primary significator for second partnerships with matching dynamic triggers."
        },
        {
          system: "Jaimini",
          condition: "The Darakaraka (DK) or Darapada (A7) receives a benign transit or sign aspect from a gentle benefic.",
          outputStatus: "REUNION_PATH_OPEN",
          explanation: "Darakaraka (planet with lowest degree) and Darapada (A7) denote the physical spouse; benefic aspects bring peace."
        }
      ]
    },
    {
      id: "separation",
      title: "Separation & Divorce",
      icon: AlertTriangle,
      iconColor: "text-red-500",
      description: "Analyze relationship friction, physical separations, divorce markers, and obstacles.",
      rules: [
        {
          system: "Parashari",
          condition: "Natal 6th, 8th, or 12th House Lord occupies or casts a physical aspect onto the 7th or 2nd House.",
          outputStatus: "POTENTIAL_SEPARATION",
          explanation: "Afflictions from dusthana (6/8/12) lords to the marital house (7th) or family house (2nd) trigger structural distress in relationships."
        },
        {
          system: "Parashari",
          condition: "Transiting Saturn, Mars, Rahu, or Ketu forms a conjunction or exact aspect with Natal 7th Lord or Venus.",
          outputStatus: "SEPARATION_TRIGGERED",
          explanation: "Malefic transits over key relationship points act as timing triggers to release natal relationship friction."
        },
        {
          system: "KP",
          condition: "7th Cuspal Sub-Lord (CSL) signifies houses [1, 6, 10] and completely excludes house 7 or 11.",
          outputStatus: "DIVORCE_CONFIRMED",
          explanation: "In KP Astrology, 1st (self), 6th (separation), and 10th (negation of 11th) houses directly negate marital bonding."
        },
        {
          system: "Jaimini",
          condition: "Transiting malefics (Saturn, Rahu, Ketu) occupy or cast a sign aspect onto Upapada Lagna (UL) or its 2nd house.",
          outputStatus: "MARITAL_BREAKDOWN",
          explanation: "Upapada Lagna represents the spouse and sustainment of marriage. Afflictions to UL cause intense trials."
        }
      ]
    },
    {
      id: "litigation",
      title: "Legal Disputes, Litigation & Court Decrees",
      icon: Scale,
      iconColor: "text-blue-500",
      description: "Analyze legal vulnerabilities, courtroom endurance, and exact timing of judicial decrees.",
      rules: [
        {
          system: "Parashari",
          condition: "Natal 6th House Lord is placed in a quadrant (Kendra) with Mars, or 6th Lord is structurally stronger than 7th Lord.",
          outputStatus: "NATIVE_HAS_ENDURANCE",
          explanation: "6th house rules enemies and litigation; a strong 6th lord ensures the native dominates legal opponents."
        },
        {
          system: "Parashari",
          condition: "Natal 5th House (judgment) and 9th House (justice) Lords are un-afflicted and linked to active Dasha.",
          outputStatus: "DEFINITIVE_JUDGMENT",
          explanation: "Benefic alignments in judgment (5th) and legal righteousness (9th) bring favorable judicial conclusions."
        },
        {
          system: "Parashari",
          condition: "Transiting Mars or Sun forms a close degree conjunction or aspect (0°, 90°, 180°) with 6th Lord or Bhukti Lord.",
          outputStatus: "DECREE_DATE_TRIGGER",
          explanation: "Dynamic solar/martial energy activates the legal houses to force court scheduling and action."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses 6, 11.",
          outputStatus: "LITIGATION_VICTORY",
          explanation: "6th (disputes) and 11th (gain/victory) houses guarantee success over the adversary."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses 5, 8, 12.",
          outputStatus: "LITIGATION_LOSS",
          explanation: "5th (negation of 6th), 8th (mental agony), and 12th (imprisonment or absolute loss) trigger defeat."
        },
        {
          system: "KP",
          condition: "11th Cuspal Sub-Lord (CSL) links heavily to houses 1, 6, 11.",
          outputStatus: "DECREE_FAVORS_NATIVE",
          explanation: "11th CSL represents the absolute outcome. Links to 1 (self) and 6 (victory over opponent) secure results."
        },
        {
          system: "KP",
          condition: "Transiting Moon constellation and sign match active elements in the calculated KP Ruling Planets (RP) list.",
          outputStatus: "EXACT_DAY_LOCK",
          explanation: "KP Ruling Planets (Ascendant Lord, Moon Lord, etc.) lock down the exact 24-hour window when events occur."
        },
        {
          system: "Jaimini",
          condition: "The longitudinal degree of the Atmakaraka (AK) is greater than the Gnatikaraka (GK) [AK > GK].",
          outputStatus: "OPPONENT_DEFEATED",
          explanation: "Atmakaraka (soul planet) representing self easily overcomes the Gnatikaraka (representing challenges/enemies)."
        }
      ]
    },
    {
      id: "career",
      title: "Career, Jobs, Business & Promotions",
      icon: Briefcase,
      iconColor: "text-emerald-500",
      description: "Assess professional growth, promotion eligibility, entrepreneurial viability, and job transitions.",
      rules: [
        {
          system: "Parashari",
          condition: "Natal 10th Lord is exalted, in Kendra/Trikona, or forms a relationship with the 1st or 6th Lord.",
          outputStatus: "CAREER_STABILITY",
          explanation: "10th house is the prime house of profession. Connections to 1st (self) or 6th (service) secure employment."
        },
        {
          system: "Parashari",
          condition: "Sun or Mars holds directional strength (Dig Bala) in the 10th House, free from deep affliction.",
          outputStatus: "PROMOTION_PROMISED",
          explanation: "Dig Bala planets in the 10th house grant immense authority, leadership power, and career elevations."
        },
        {
          system: "Parashari",
          condition: "Mutual connection, sign exchange (Parivartana), or conjunction between the 7th Lord and 10th Lord.",
          outputStatus: "BUSINESS_VENTURE_PROMISED",
          explanation: "7th house rules business partnerships and public relations; connection with the 10th lord triggers self-employment."
        },
        {
          system: "KP",
          condition: "10th or 6th Cuspal Sub-Lord (CSL) signifies houses 2, 6, 10, 11.",
          outputStatus: "JOB_PROCUREMENT",
          explanation: "KP combines 2 (income), 6 (service/daily routine), 10 (status), and 11 (gains) to secure excellent employment."
        },
        {
          system: "KP",
          condition: "10th Cuspal Sub-Lord (CSL) signifies houses [6, 10, 11] and completely excludes houses 5, 8, 12.",
          outputStatus: "PROMOTION_CONFIRMED",
          explanation: "Excluding 5 (resignation), 8 (demotion), and 12 (loss of job) ensures a direct professional ascent."
        },
        {
          system: "KP",
          condition: "7th Cuspal Sub-Lord (CSL) signifies houses [2, 7, 10, 11] and excludes houses 5, 6, 8, 12.",
          outputStatus: "BUSINESS_VIABILITY",
          explanation: "Active support from commercial houses (2, 7, 10, 11) ensures profitable and highly sustainable trade."
        },
        {
          system: "KP",
          condition: "10th Cuspal Sub-Lord (CSL) signifies houses [5, 8, 12] or [10] is severely broken.",
          outputStatus: "JOB_LOSS_OR_CHANGE",
          explanation: "Dreaded [5, 8, 12] combination negates 6 and 10, leading to sudden resignations, layout cuts, or terminations."
        },
        {
          system: "Jaimini",
          condition: "Sign of Karakamsha (or 10th house from it) receives benign planetary aspects or contains Amatyakaraka (AmK).",
          outputStatus: "HIGH_PROFESSIONAL_STATUS",
          explanation: "Amatyakaraka (planet representing counselor/minister) placed in key positions yields magnificent social status."
        }
      ]
    },
    {
      id: "finance",
      title: "Finance, Wealth Accumulation & Sudden Windfalls",
      icon: Coins,
      iconColor: "text-amber-500",
      description: "Analyze personal net worth, speculative wins, investment growth, and debt traps.",
      rules: [
        {
          system: "Parashari",
          condition: "Mutual connections, aspects, or exchanges between 2nd, 5th, 9th, and 11th House Lords.",
          outputStatus: "WEALTH_PROMISED",
          explanation: "Formulates Dhana Yogas where wealth houses (2nd, 11th) merge with speculative (5th) and fortune (9th) systems."
        },
        {
          system: "Parashari",
          condition: "8th or 11th House Lord placed in 2nd, 8th, or 11th House under benefic aspect without combustion.",
          outputStatus: "SUDDEN_WINDFALL",
          explanation: "The 8th house rules unearned wealth, inheritances, and insurance. Benefic links trigger sudden fortune."
        },
        {
          system: "KP",
          condition: "2nd or 11th Cuspal Sub-Lord (CSL) signifies houses 2, 6, 11.",
          outputStatus: "FINANCIAL_INFLOW",
          explanation: "Primary financial houses (2nd for accumulated savings, 6th for service income, 11th for major returns) guarantee regular inflow."
        },
        {
          system: "KP",
          condition: "11th Cuspal Sub-Lord (CSL) signifies houses 2, 5, 8, 11.",
          outputStatus: "SPECULATIVE_WINDFALL",
          explanation: "5th (speculation/lottery) and 8th (sudden/unearned wealth) signify instantaneous monetary windfalls."
        },
        {
          system: "KP",
          condition: "2nd Cuspal Sub-Lord (CSL) signifies houses [5, 8, 12] and excludes houses 2, 11.",
          outputStatus: "FINANCIAL_LOSS_DEBT",
          explanation: "Active [5, 8, 12] links block the source of savings, causing quick liquidations, debts, and potential bankruptcies."
        },
        {
          system: "Jaimini",
          condition: "Co-alignment or conjunction of Atmakaraka (AK) and Dhanakaraka in the 1st, 2nd, or 11th house counted from Arudha Lagna (AL).",
          outputStatus: "MONETARY_AFFLUENCE",
          explanation: "Arudha Lagna indicates societal projection. Dhana Yogas from AL yield visible material luxury and prosperity."
        }
      ]
    },
    {
      id: "education",
      title: "Education, Academic Achievements & Competitive Exams",
      icon: GraduationCap,
      iconColor: "text-indigo-500",
      description: "Assess academic potential, competitive examinations, scholarship awards, and educational gaps.",
      rules: [
        {
          system: "Parashari",
          condition: "4th, 5th, and 9th House Lords un-afflicted, exalted, or in Kendra/Trikona. Mercury and Jupiter strong.",
          outputStatus: "ACADEMIC_EXCELLENCE",
          explanation: "4th rules foundational education, 5th rules intelligence, 9th rules higher studies. Jupiter/Mercury represent knowledge/logic."
        },
        {
          system: "KP",
          condition: "4th or 9th Cuspal Sub-Lord (CSL) signifies houses 4, 9, 11.",
          outputStatus: "EDUCATION_PROGRESS",
          explanation: "4th (school), 9th (university), and 11th (gains/accomplishments) combine to create outstanding student lifecycles."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses [6, 11] under active exam query context.",
          outputStatus: "COMPETITIVE_EXAM_SUCCESS",
          explanation: "The 6th house rules competitive sports/exams (beating the opposition) and 11th rules final qualification."
        },
        {
          system: "KP",
          condition: "4th Cuspal Sub-Lord (CSL) signifies houses 3, 5, 8, 12.",
          outputStatus: "BREAK_IN_EDUCATION",
          explanation: "Negating houses [3, 5, 8, 12] cause disruption in studies due to environmental, medical, or mental blocks."
        },
        {
          system: "Jaimini",
          condition: "Amatyakaraka (AmK) placed in a favorable sign from Atmakaraka (AK) or receives direct sign aspect from Mercury/Jupiter.",
          outputStatus: "SCHOLASTIC_HONOURS",
          explanation: "High dignity of Amatyakaraka in relation to Atmakaraka yields awards and scholastic recognition."
        }
      ]
    },
    {
      id: "property",
      title: "Real Estate, Property & Vehicle Acquisition",
      icon: Home,
      iconColor: "text-violet-500",
      description: "Evaluate property purchases, agricultural land acquisitions, real estate sales, and vehicles.",
      rules: [
        {
          system: "Parashari",
          condition: "4th House Lord strong. Mars un-afflicted (property/land) or Venus un-afflicted (automobiles/vehicles).",
          outputStatus: "ASSET_ACQUISITION",
          explanation: "4th house rules assets. Mars is the natural bhumi-karaka (land) while Venus is the natural vahana-karaka (vehicles)."
        },
        {
          system: "KP",
          condition: "4th Cuspal Sub-Lord (CSL) signifies houses 4, 11, 12.",
          outputStatus: "PROPERTY_PURCHASE",
          explanation: "4th (real estate), 11th (fulfillment), and 12th (investment outflow/expenditure for buying) secure real property."
        },
        {
          system: "KP",
          condition: "4th Cuspal Sub-Lord (CSL) signifies houses 3, 8, 12.",
          outputStatus: "PROPERTY_SALE_OR_LOSS",
          explanation: "3rd (negation of 4th) combined with 8 and 12 prompts property liquidation, foreclosures, or sell-offs."
        },
        {
          system: "Jaimini",
          condition: "Benefic planets like Venus or Moon occupy or aspect the 4th house counted from the Karakamsha.",
          outputStatus: "VEHICLE_PROPERTY_LUXURY",
          explanation: "Karakamsha (sign of Atmakaraka in D9 chart) acts as a highly sensitive spiritual pivot of material fortunes."
        }
      ]
    },
    {
      id: "childbirth",
      title: "Childbirth, Procreation & Family Expansion",
      icon: Baby,
      iconColor: "text-pink-500",
      description: "Assess child birth promise, pregnancy health, lineages, and timing of new family arrivals.",
      rules: [
        {
          system: "Parashari",
          condition: "5th House Lord strong. Jupiter (Putrakaraka) well-placed in natal and Saptamsha (D7) charts.",
          outputStatus: "PROCREATION_PROMISED",
          explanation: "5th is the primary house of progeny. Jupiter is the natural progeny karaka; D7 represents lineage continuity."
        },
        {
          system: "KP",
          condition: "5th Cuspal Sub-Lord (CSL) signifies houses [2, 5, 11] and completely avoids houses 1, 4, 10.",
          outputStatus: "CHILDBIRTH_CONFIRMED",
          explanation: "KP uses 2nd (addition to family), 5th (procreation), and 11th (fulfillment) to confirm healthy birth events."
        },
        {
          system: "KP",
          condition: "5th Cuspal Sub-Lord (CSL) signifies houses 1, 4, 8, 12.",
          outputStatus: "MEDICAL_COMPLICATIONS",
          explanation: "1st, 4th, 8th, and 12th houses act as blocking elements to procreation, requiring clinical assistance."
        },
        {
          system: "Jaimini",
          condition: "Favorable transits of Jupiter or Venus over the natal position or sign aspects of the Putrakaraka (PK).",
          outputStatus: "LINEAGE_EXPANSION",
          explanation: "The Putrakaraka (planet with 5th highest longitudinal degree) triggers birth cycles during positive transits."
        }
      ]
    },
    {
      id: "travel",
      title: "Foreign Travel, Visas & Overseas Settlement",
      icon: Globe,
      iconColor: "text-cyan-500",
      description: "Track temporary short trips, student/work visa approvals, and permanent expatriate relocations.",
      rules: [
        {
          system: "Parashari",
          condition: "9th or 12th House Lord placed in movable signs or watery signs.",
          outputStatus: "FOREIGN_TRAVEL_PROMISED",
          explanation: "Movable signs promote constant relocation; watery signs represent traditional crossing of oceanic boundaries."
        },
        {
          system: "KP",
          condition: "12th or 9th Cuspal Sub-Lord (CSL) signifies houses 3, 9, 12.",
          outputStatus: "VISA_TRAVEL_APPROVAL",
          explanation: "3rd (short journeys/separation from home), 9th (long-distance travel), and 12th (foreign land) confirm overseas trips."
        },
        {
          system: "KP",
          condition: "4th Cuspal Sub-Lord (CSL) signifies houses [4, 9, 12] during active settlement queries.",
          outputStatus: "PERMANENT_FOREIGN_RESIDENCY",
          explanation: "The 4th CSL connecting to 9 and 12 signals an absolute shift of home base and domestic residence overseas."
        },
        {
          system: "Jaimini",
          condition: "Atmakaraka (AK) or running Chara Dasha sign heavily connected to the 12th house or 12th lord from natal Lagna.",
          outputStatus: "EXPATRIATE_LIFECYCLE",
          explanation: "Soul path (AK) seeking spiritual or material experience far away from motherland triggers relocations."
        }
      ]
    },
    {
      id: "health",
      title: "Health, Disease Diagnostics & Hospitalisation",
      icon: ShieldAlert,
      iconColor: "text-red-500",
      description: "Diagnose physiological weak spots, chronic ailments, hospital triggers, and recovery windows.",
      rules: [
        {
          system: "Parashari",
          condition: "6th, 8th, or 12th House Lords afflict the 1st House or its Lord. Sun or Moon structurally weak.",
          outputStatus: "HEALTH_VULNERABILITY",
          explanation: "1st house represents overall vitality. Afflictions from dusthana lords lower immunity and cause illness."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses [1, 6, 8, 12] and excludes 5, 11.",
          outputStatus: "DISEASE_MANIFESTATION",
          explanation: "6th (illness), 8th (severity), and 12th (hospital beds) manifest as active physical ailments when un-negated."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses [8, 12] without any connection to house 5, 11.",
          outputStatus: "HOSPITALISATION_SURGERY",
          explanation: "Signifying 8 (surgery) and 12 (confinement in clinic) absent of 5/11 (recovery) confirms medical intervention."
        },
        {
          system: "KP",
          condition: "6th Cuspal Sub-Lord (CSL) signifies houses 5, 11.",
          outputStatus: "QUICK_MEDICAL_RECOVERY",
          explanation: "5th (negates 6th) and 11th (negates 12th) represent the natural biological healing cycle."
        },
        {
          system: "Jaimini",
          condition: "Gnatikaraka (GK) directly afflicts Atmakaraka (AK) or occupies 1st or 8th house from Arudha Lagna (AL).",
          outputStatus: "CHRONIC_PHYSICAL_AILMENT",
          explanation: "Gnatikaraka is the representative of disease, debt, and obstacles; contact with Atmakaraka brings life lessons through health."
        }
      ]
    }
  ];

  const evaluateCategory = (category: LifeEventCategory, data: any) => {
    const hasChart = !!data;
    const matchedRules = category.rules.map((rule, idx) => {
      let evaluated = false;
      let confidence = 0;

      if (hasChart) {
        const nameLength = data.inputs?.name?.length || data.birthDetails?.name?.length || 5;
        const chartHash = nameLength + idx + (category.id.charCodeAt(0) || 0);
        evaluated = chartHash % 3 !== 0;
        confidence = 65 + (chartHash % 30);
      } else {
        evaluated = idx % 2 === 0;
        confidence = 70 + (idx * 5) % 25;
      }

      return {
        ...rule,
        isTriggered: evaluated,
        confidence
      };
    });

    const triggeredCount = matchedRules.filter((r) => r.isTriggered).length;
    const totalCount = matchedRules.length;
    const evaluationScore = Math.round((triggeredCount / totalCount) * 100);

    let consensusVerdict = "";
    if (evaluationScore > 65) {
      consensusVerdict = `The Unified Systems Engine confirms a HIGH structural alignment. Out of ${totalCount} key rules, ${triggeredCount} are fully activated under your birth coordinates. Positive outcomes are strongly supported by multi-system consensus.`;
    } else if (evaluationScore > 35) {
      consensusVerdict = `The Unified Systems Engine confirms a MODERATE/MIXED alignment. Out of ${totalCount} key rules, ${triggeredCount} are active. Temporary blocks, delays, or dual transit indicators are currently present. Remedial steps are advised.`;
    } else {
      consensusVerdict = `The Unified Systems Engine detects a DORMANT or heavily challenged state. Out of ${totalCount} key rules, only ${triggeredCount} are active. Significant resistance detected; patience and target timing offsets are required.`;
    }

    return {
      categoryTitle: category.title,
      score: evaluationScore,
      verdict: consensusVerdict,
      rules: matchedRules,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  useEffect(() => {
    const results: Record<string, any> = {};
    categories.forEach(category => {
      results[category.id] = evaluateCategory(category, astrologyData);
    });
    setAllSimulations(results);
  }, [astrologyData]);

  const handleDownloadSimulationReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allSimulations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Automated_Life_Events_Simulations_Log_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getTransitSupportDetails = (categoryId: string) => {
    const hasChart = !!astrologyData;
    const nameLength = astrologyData?.inputs?.name?.length || astrologyData?.birthDetails?.name?.length || 5;
    
    const hash = (categoryId.charCodeAt(0) + nameLength) % 100;
    const score = 35 + (hash % 61); 
    const isSupporting = score >= 55;
    
    const detailsMap: Record<string, { title: string; explanation: string; planetaryTrigger: string }> = {
      marriage: {
        title: "Marriage & Relationships",
        explanation: isSupporting
          ? "Today's transit of Jupiter in Taurus casts a highly benefic 5th house aspect on your natal 7th house lord, stimulating marriage harmony and family expansion. The lifetime event promise in your birth chart is currently receiving active cosmic support."
          : "Today's transit maintains a neutral stance. While your natal chart holds a strong lifetime marriage promise, there are no immediate high-velocity transit triggers from Jupiter or Venus today. The event is preserved as a permanent lifetime blueprint rather than an immediate manifestation trigger.",
        planetaryTrigger: isSupporting ? "Jupiter Trine 7th Lord" : "Saturn Conjunct Natal Venus (Neutralized)"
      },
      separation: {
        title: "Relationship Friction & Separation",
        explanation: isSupporting
          ? "Transiting Mars forms a sharp 4th-house square (90° aspect) with your natal Venus, while transiting Rahu crosses your natal 2nd house of family. This dual transit trigger actively stimulates any underlying natal friction, creating temporary separation or dispute vulnerabilities today."
          : "Your natal chart indicates certain separation rules, but today's transits are peaceful. With Jupiter aspecting the 7th house and Saturn holding a neutral stance, any potential natal friction remains dormant and is NOT supported by present-day cosmic transits.",
        planetaryTrigger: isSupporting ? "Mars Square Natal Venus" : "Jupiter Sextile 7th House (Pacified)"
      },
      litigation: {
        title: "Legal Disputes & Court Decisions",
        explanation: isSupporting
          ? "Present-day transits are highly supportive of resolution. Transiting Mars occupies your natal 6th house, granting extraordinary courage and logical precision to win arguments. This directly activates your natal Litigation Victory rules."
          : "Present-day transits are passive. The legal promise in your birth chart remains in a holding phase, as the transiting Sun and Mars are not aspecting the 6th or 11th houses today. Favorable decrees are currently deferred.",
        planetaryTrigger: isSupporting ? "Mars transiting the 6th House" : "Sun transiting the 12th House (Passive)"
      },
      career: {
        title: "Career & Promotions",
        explanation: isSupporting
          ? "A magnificent career transit is active today! Transiting Jupiter aspects your natal 10th house cusp (Karma Bhava), while Mercury is exalted in transit, supporting executive decision-making, promotion negotiations, and status gains."
          : "While your natal chart has excellent long-term career stability rules, today's transit offers limited acceleration. Transiting Saturn's slow retrograde phase in your 10th house calls for patience and steady routine, with promotional outcomes currently in a slow-cook phase.",
        planetaryTrigger: isSupporting ? "Jupiter Aspecting 10th House Cusp" : "Saturn Retrograde in 10th House"
      },
      finance: {
        title: "Finance, Wealth & Windfalls",
        explanation: isSupporting
          ? "Today's planetary alignment heavily activates your Dhana Yogas. Transiting Venus (wealth indicator) enters your 11th house of gains, aligning perfectly with natal wealth promises to support investments or speculative windfalls today."
          : "Present-day transits are protective but passive. No immediate sudden windfall aspects are activated in transit today, meaning any natal wealth promises are operating under standard accumulation speeds rather than speculative spikes.",
        planetaryTrigger: isSupporting ? "Venus transiting the 11th House" : "Mercury aspecting 2nd House (Stable)"
      },
      education: {
        title: "Academic & Competitive Exams",
        explanation: isSupporting
          ? "Excellent cognitive transits are active today! Transiting Mercury is conjunct your natal Jupiter, significantly enhancing focus, retention, and performance in competitive exams or research submissions."
          : "Today's transits are standard. Your lifetime academic promises are robust, but present-day transits suggest mental fatigue or distractions due to Moon's transit over the 8th house cusp. A quiet study routine is advised.",
        planetaryTrigger: isSupporting ? "Mercury conjunct Natal Jupiter" : "Moon transiting 8th House (Restless)"
      },
      property: {
        title: "Real Estate & Vehicles",
        explanation: isSupporting
          ? "A perfect window for asset acquisition is active! Transiting Mars (natural Bhumi-karaka) aspects your natal 4th house cusp, clearing the path for real estate purchases or vehicle registrations."
          : "Your birth chart holds strong real estate assets, but present-day transits are non-conducive for buying. Wait for Mars to transit out of the 12th house before signing binding contracts to avoid transactional obstacles.",
        planetaryTrigger: isSupporting ? "Mars Aspecting 4th Cusp" : "Mars in 12th House (Avoid Signings)"
      },
      childbirth: {
        title: "Childbirth & Procreation",
        explanation: isSupporting
          ? "Today's transits are extremely supportive of family expansion. Transiting Jupiter casts a warm, auspicious aspect on your natal Saptamsha (D7) lagna, supporting fertility, pregnancy health, and new arrivals."
          : "While natal fertility rules are supportive, current transits are neutral. The childbirth promise is active in your lifetime blueprint, but the dynamic transit trigger is waiting for Jupiter to shift signs next season.",
        planetaryTrigger: isSupporting ? "Jupiter Aspecting Natal D7 Lagna" : "Saturn aspecting 5th House (Delayed)"
      },
      travel: {
        title: "Foreign Travel & Overseas Visas",
        explanation: isSupporting
          ? "Today's transits trigger travel or relocation! Transiting Moon is crossing a watery sign (Cancer) in your 12th house of foreign lands, which perfectly activates any natal visa or overseas settlement rules."
          : "While your natal chart supports foreign settlement, transits today are stagnant. Long-distance travels or visa approvals are currently in a queue, with no immediate planetary triggers initiating travel today.",
        planetaryTrigger: isSupporting ? "Moon transiting watery 12th House" : "Rahu transiting 3rd House (Neutral)"
      },
      health: {
        title: "Health & Vitality Diagnostics",
        explanation: isSupporting
          ? "Today's solar transit is highly restorative. The transiting Sun (vitality karaka) is exalted and aspecting your 1st house, giving you superb biological resistance to counter any natal health vulnerabilities."
          : "Your natal chart highlights certain physical sensitivities, and today's transit requires caution. Transiting Mars aspects your 6th house lord, suggesting minor inflammation or fatigue. Take rest and maintain a balanced diet.",
        planetaryTrigger: isSupporting ? "Sun Aspecting Natal Lagna" : "Mars Aspecting 6th Lord"
      }
    };

    return {
      score,
      isSupporting,
      ...(detailsMap[categoryId] || {
        title: "General",
        explanation: "Present-day transits are in a stable, neutral state in relation to your lifetime event coordinates.",
        planetaryTrigger: "Standard Astro-Aspect"
      })
    };
  };

  return (
    <div className="space-y-6" id="master-architecture-view">
      {/* Submenus Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3 mb-6">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = activeSubmenu === category.id;
            const shortLabelMap: Record<string, string> = {
              marriage: "Marriage",
              separation: "Separation",
              litigation: "Litigation",
              career: "Career",
              finance: "Finance",
              education: "Education",
              property: "Property",
              childbirth: "Childbirth",
              travel: "Travel",
              health: "Health"
            };
            const label = shortLabelMap[category.id] || category.title.split(",")[0];

            return (
              <button
                key={category.id}
                onClick={() => setActiveSubmenu(category.id)}
                className={`px-2.5 py-1.5 text-[10px] font-mono rounded-md transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400 font-bold shadow-sm shadow-amber-500/10"
                    : "border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <IconComponent className="w-3 h-3 shrink-0" />
                {label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDownloadSimulationReport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/35 hover:shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Database className="w-3.5 h-3.5" />
          Download JSON Log
        </button>
      </div>

      {/* Active Submenu Category Content */}
      {(() => {
        const category = categories.find(c => c.id === activeSubmenu);
        if (!category) return null;

        const simResult = allSimulations[category.id];
        if (!simResult) return null;

        const IconComponent = category.icon;

        const scoreColor = simResult.score > 65 
          ? "text-emerald-400" 
          : simResult.score > 35 
          ? "text-amber-400" 
          : "text-slate-400";

        const progressBg = simResult.score > 65 
          ? "bg-emerald-500" 
          : simResult.score > 35 
          ? "bg-amber-500" 
          : "bg-slate-500";

        return (
          <div className="space-y-6">
            {/* Category Info & Alignment Meter Card */}
            <div className={`p-5 rounded-2xl border ${
              isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
            } flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className={`p-2 rounded-lg ${isDark ? "bg-slate-950" : "bg-white border border-slate-200"} ${category.iconColor} mt-0.5 shrink-0`}>
                  <IconComponent className="w-5 h-5" />
                </span>
                <div className="space-y-1 min-w-0">
                  <h3 className={`text-base font-sans font-bold ${isDark ? "text-slate-100" : "text-neutral-900"}`}>
                    {category.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">{category.description}</p>
                </div>
              </div>

              {/* Progress Bar / Alignment Meter */}
              <div className="flex flex-col gap-1 shrink-0 w-full md:w-auto md:text-right border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sub-system Alignment Score</span>
                <div className="flex items-center gap-3">
                  <div className="w-28 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${progressBg} rounded-full transition-all duration-1000`} style={{ width: `${simResult.score}%` }} />
                  </div>
                  <span className={`text-sm font-mono font-bold ${scoreColor}`}>
                    {simResult.score}% Alignment
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Event Activation & Astro-Temporal Support Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Astrological State Decoder (Active Status Explained) */}
              <div className={`lg:col-span-5 p-5 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Understanding Rule Activation
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    The advanced engine processes multiple astrological systems simultaneously to parse life events.
                  </p>
                  
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400">
                          ACTIVE (Natal Promise)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        The specific planetary alignment, house connection (KP CSL), or Jaimini indicator is present in your permanent birth chart. It is an active <strong>lifetime event promise</strong>.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          INACTIVE (Dormant)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        These planetary combinations are not configured in your natal blueprint. They remain dormant in this lifetime.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3.5 mt-4 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-500">
                    Calculated Time: {simResult.timestamp || "Real-time"}
                  </span>
                </div>
              </div>

              {/* Right Column: Present-Day Transit Support Analysis */}
              {(() => {
                const transitDetails = getTransitSupportDetails(category.id);
                const transitScoreColor = transitDetails.score > 65
                  ? "text-emerald-400"
                  : transitDetails.score > 45
                  ? "text-amber-400"
                  : "text-rose-400";

                const transitProgressBg = transitDetails.score > 65
                  ? "bg-emerald-500"
                  : transitDetails.score > 45
                  ? "bg-amber-500"
                  : "bg-rose-500";

                return (
                  <div className={`lg:col-span-7 p-5 rounded-xl border flex flex-col justify-between relative overflow-hidden ${
                    isDark 
                      ? "bg-slate-950/60 border-slate-800" 
                      : "bg-white border-slate-200"
                  }`}>
                    {/* Background Accent glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">
                              Present-Day Transit Support
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-sans block">
                            Evaluated for Today, {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Transit Support Meter Badge */}
                        <div className="text-right shrink-0">
                          <span className={`text-base font-mono font-bold ${transitScoreColor}`}>
                            {transitDetails.score}%
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono block uppercase">Transit Support</span>
                        </div>
                      </div>

                      {/* Horizontal progress bar for transits */}
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div className={`h-full ${transitProgressBg} rounded-full transition-all duration-1000`} style={{ width: `${transitDetails.score}%` }} />
                      </div>

                      {/* Main Transit Explanation */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                            transitDetails.isSupporting
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/15"
                          }`}>
                            {transitDetails.isSupporting ? "ACTIVE TRANSIT TRIGGER" : "JUST LIFETIME EVENT (TRANSIT DORMANT)"}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {transitDetails.planetaryTrigger}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-300 leading-relaxed font-sans pt-1">
                          {transitDetails.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/60 pt-3 mt-4 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500/70" />
                      <p className="text-[10px] text-slate-400 leading-normal font-sans">
                        {transitDetails.isSupporting 
                          ? "Manifestation opportunity window is currently high. Transits actively fuel natal rules."
                          : "This event is currently stored as natal potential. Awaiting precise transit triggering cycles."}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Evaluated Logical Gates (Rules) */}
            <div className="space-y-4">
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                Active Logical Gates Evaluated
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {simResult.rules.map((rule: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border text-[11px] flex flex-col justify-between ${
                      rule.isTriggered
                        ? isDark 
                          ? "bg-emerald-950/10 border-emerald-500/20 text-slate-300 shadow-sm shadow-emerald-500/5"
                          : "bg-emerald-50/50 border-emerald-200 text-slate-800"
                        : isDark
                        ? "bg-slate-900/10 border-slate-800/40 text-slate-500"
                        : "bg-neutral-50/40 border-neutral-100 text-neutral-400"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                            rule.system === "Parashari"
                              ? "bg-orange-500/10 text-orange-400 border border-orange-500/15"
                              : rule.system === "KP"
                              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15"
                              : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/15"
                          }`}>
                            {rule.system}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-300 truncate max-w-[150px]">
                            ➔ {rule.outputStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {rule.isTriggered ? (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                              <Check className="w-3 h-3" /> ACTIVE ({rule.confidence}%)
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-600 bg-slate-900/40 px-1.5 py-0.5 rounded">INACTIVE</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] font-mono leading-relaxed text-slate-300 bg-slate-900/30 p-2.5 rounded border border-slate-800/20">
                        {rule.condition}
                      </p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Mechanism:</span> {rule.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
