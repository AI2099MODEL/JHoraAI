import { AstrologicalDomain } from "./QueryRouter";

export interface AstrologicalRule {
  id: string;
  groupName: string;
  ruleTitle: string;
  description: string;
}

export class RuleRouter {
  /**
   * Returns the list of rules that are activated for a given domain
   */
  public static getRulesForDomain(domain: AstrologicalDomain): AstrologicalRule[] {
    const rules: AstrologicalRule[] = [];

    switch (domain) {
      case "Soul Evolution":
        rules.push(
          {
            id: "se_jaimini_ak",
            groupName: "Jaimini Rules",
            ruleTitle: "Atmakaraka Soul Signification",
            description: "The planet with the highest longitude (excluding Rahu/Ketu in 7-planet system or included in 8-planet) represents the soul's current incarnation purposes.",
          },
          {
            id: "se_jaimini_kk",
            groupName: "Jaimini Rules",
            ruleTitle: "Karakamsa & Swamsa Analysis",
            description: "Locate the sign of the Atmakaraka in the D9 Navamsa (Karakamsa). Map that sign back onto the D1 Rasi chart. Planets in the 1st, 5th, and 12th from Karakamsa reveal spiritual talents and final liberation (Moksha) pathways.",
          },
          {
            id: "se_karmic_axis",
            groupName: "Rahu/Ketu Rules",
            ruleTitle: "Rahu-Ketu Axis Karmic Lessons",
            description: "Ketu represents past life mastery, default behaviors, and talents. Rahu represents the current life's major lessons, obsessions, and expansion areas. The house placement of the Rahu-Ketu axis shows where karmic balancing occurs.",
          },
          {
            id: "se_dasha_align",
            groupName: "Current Dasha Rules",
            ruleTitle: "Mahadasha Lord Spiritual Alignment",
            description: "Assess the Mahadasha lord's placement and ownership to see if the current phase of life is focused on material expansion or spiritual retraction and soul-searching.",
          },
          {
            id: "se_transit_discipline",
            groupName: "Transit Rules",
            ruleTitle: "Saturn & Jupiter Transits",
            description: "Saturn transits force karmic clearance and structural discipline. Jupiter transits expand consciousness, wisdom, and spiritual insight over the natal houses.",
          }
        );
        break;

      case "Career":
        rules.push(
          {
            id: "car_10_lord",
            groupName: "10th House Rules",
            ruleTitle: "10th Lord & Occupant Status",
            description: "The 10th house is the house of Karma, career, and public status. Planets in the 10th house or aspects to it, and the strength/placement of the 10th lord, indicate the main career line.",
          },
          {
            id: "car_d10_vocation",
            groupName: "D10 Divisional Rules",
            ruleTitle: "Dashamsha Chart Vocation Strength",
            description: "Examine the Lagna of D10 and the 10th house of D10. The D10 chart indicates the level of professional achievement, authority, and transitions in career.",
          },
          {
            id: "car_kp_significators",
            groupName: "KP Rules",
            ruleTitle: "KP Cuspal Significator Analysis",
            description: "Identify planets signifying houses 2 (money), 6 (service/routine), 10 (prestige/profession), and 11 (gains). Connections between these houses represent career progression, while 5th and 8th signify job change or instability.",
          },
          {
            id: "car_transit_trigger",
            groupName: "Transit Rules",
            ruleTitle: "Career Milestone Triggers",
            description: "Major professional shifts, promotions, or job changes are triggered when transit Saturn or Jupiter aspects the 10th lord, 10th house, or natal Ascendant.",
          }
        );
        break;

      case "Business":
        rules.push(
          {
            id: "biz_7_partnerships",
            groupName: "7th House Rules",
            ruleTitle: "7th Lord & Client Dealing",
            description: "The 7th house governs partnerships, commercial contracts, and public dealings. A strong 7th lord indicates success in independent business ventures rather than structured employment.",
          },
          {
            id: "biz_accum_gains",
            groupName: "Financial House Rules",
            ruleTitle: "2nd & 11th House Business Connectivity",
            description: "Business viability requires 2nd house (monetary liquid assets) and 11th house (profits and gains of desires) to be strongly integrated with the 7th house lord.",
          },
          {
            id: "biz_kp_sig",
            groupName: "KP Rules",
            ruleTitle: "KP Business Cuspal Alignment",
            description: "Evaluate if the 7th cuspal sublord signifies the 2nd, 7th, and 11th houses. Connections with the 10th denote commercial business; connections with the 6th denote service-based business.",
          }
        );
        break;

      case "Marriage":
        rules.push(
          {
            id: "mar_7_harmony",
            groupName: "7th House Rules",
            ruleTitle: "7th House & Spouse Characteristics",
            description: "The 7th house represents the partner, marriage longevity, and marital harmony. Planets in the 7th house dictate the physical and behavioral nature of the spouse.",
          },
          {
            id: "mar_d9_inner",
            groupName: "Navamsa Rules",
            ruleTitle: "D9 Navamsa Harmony",
            description: "The Navamsa chart (D9) represents inner compatibility and the post-marriage life quality. The relationship between D1 7th lord and D9 7th lord determines marital longevity.",
          },
          {
            id: "mar_jaimini_ul",
            groupName: "Upapada Lagna Rules",
            ruleTitle: "Upapada Lagna (UL) Marital Bond",
            description: "The Upapada Lagna (UL) represents the marriage institution itself. Benefic associations with UL guarantee support and peace, while malefic aspects can signal severe challenges.",
          },
          {
            id: "mar_kp_cusp",
            groupName: "KP Rules",
            ruleTitle: "KP 7th Cusp Marriage Approval",
            description: "Marriage occurs if the 7th cuspal sublord is a significator of the 2nd, 7th, and 11th houses. Negation is seen if the sublord signifies the 1st, 6th, and 10th houses.",
          }
        );
        break;

      case "Finance":
        rules.push(
          {
            id: "fin_2_wealth",
            groupName: "Wealth Rules",
            ruleTitle: "2nd House Liquid Capital",
            description: "The 2nd house is the primary indicator of family assets, liquid funds, and speaking/savings capabilities. Planets residing here show how capital is retained.",
          },
          {
            id: "fin_11_gains",
            groupName: "Wealth Rules",
            ruleTitle: "11th House Gains & Income Flow",
            description: "The 11th house represents the regular flow of profits, wishes fulfilled, and help from elder siblings or networks. A well-placed 11th lord is critical for wealth accumulation.",
          },
          {
            id: "fin_speculation",
            groupName: "Speculation Rules",
            ruleTitle: "5th and 8th Houses for Windfalls",
            description: "The 5th house governs stock trading, lottery, and creative intelligence, while the 8th house governs sudden wealth, unearned money, tax gains, and inheritance.",
          }
        );
        break;

      case "Health":
        rules.push(
          {
            id: "hea_1_vitality",
            groupName: "Vitality Rules",
            ruleTitle: "Lagna Lord Physical Constitution",
            description: "The Lagna (1st house) and its lord represent the self, physical vitality, and immunity. A strong Lagna lord offsets many malefic planetary configurations.",
          },
          {
            id: "hea_6_disease",
            groupName: "Disease Rules",
            ruleTitle: "6th House Disease Activation",
            description: "The 6th house represents illnesses, debts, and daily friction. Dasha periods of the 6th lord or planets placed in the 6th house can trigger acute health difficulties.",
          },
          {
            id: "hea_8_12_chronic",
            groupName: "Chronic Rules",
            ruleTitle: "8th & 12th House Hospitalization",
            description: "The 8th house indicates chronic, hidden, or lingering ailments. The 12th house represents confinement, hospitalization, and expenditures related to medical issues.",
          }
        );
        break;

      case "Travel":
      case "Foreign Settlement":
        rules.push(
          {
            id: "trv_houses",
            groupName: "Travel Rules",
            ruleTitle: "3rd, 9th, & 12th Houses",
            description: "The 3rd house represents short travels, changes, and local journeys. The 9th house governs long voyages and religious pilgrimages. The 12th house represents foreign residence, isolation, or relocation.",
          },
          {
            id: "trv_rahu_foreign",
            groupName: "Foreign Rules",
            ruleTitle: "Rahu Foreign Signification",
            description: "Rahu represents unconventional, foreign, and out-of-boundary settings. Rahu's association with the 4th (home) or 12th (abroad) houses often forces relocations.",
          }
        );
        break;

      default:
        // Default generic horoscope rules
        rules.push(
          {
            id: "gen_lagna",
            groupName: "Lagna Rules",
            ruleTitle: "Lagna and Self Strength",
            description: "The physical foundation, self-expression, and path of the native is anchored by the 1st house (Lagna).",
          },
          {
            id: "gen_luminaries",
            groupName: "Luminary Rules",
            ruleTitle: "Sun & Moon Significations",
            description: "The Sun represents soul essence and outward character. The Moon represents emotional experience and the mind's filter.",
          }
        );
    }

    return rules;
  }
}
