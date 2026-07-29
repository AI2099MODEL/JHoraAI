import { ContextPackage } from "../models/ContextPackage";
import { ContextBuilder, ContextBuilderOptions } from "./ContextBuilder";

export class ContextEngine {
  /**
   * Generates a context package from current active states and recommends target astrology systems
   */
  public static evaluate(options: ContextBuilderOptions): {
    package: ContextPackage;
    recommendedSystems: string[];
    suggestedFocusHouses: number[];
  } {
    const pkg = ContextBuilder.build(options);
    const recommendedSystems: string[] = ["JHora"]; // Default to JHora base
    const suggestedFocusHouses: number[] = [];

    // Map intent domain to specific houses and alternative systems
    switch (pkg.intent) {
      case "Career":
        recommendedSystems.push("KP"); // KP is stellar for Career timing
        suggestedFocusHouses.push(10, 6, 2, 11);
        break;
      case "Marriage":
        recommendedSystems.push("Jaimini"); // Jaimini Upapada Lagna is stellar for marriage
        suggestedFocusHouses.push(7, 2, 11);
        break;
      case "Finance":
      case "Investments":
        suggestedFocusHouses.push(2, 11, 5, 8);
        break;
      case "Health":
        suggestedFocusHouses.push(6, 8, 12, 1);
        break;
      case "Foreign Settlement":
        recommendedSystems.push("Nadi");
        suggestedFocusHouses.push(12, 9, 3, 4);
        break;
      case "Travel":
        suggestedFocusHouses.push(3, 9, 12);
        break;
      case "Property":
        suggestedFocusHouses.push(4, 11);
        break;
      case "Litigation":
        suggestedFocusHouses.push(6, 8);
        break;
      case "Spiritual":
        recommendedSystems.push("Jaimini");
        suggestedFocusHouses.push(9, 12, 5, 8);
        break;
      case "Transit":
        recommendedSystems.push("Western"); // Western aspect grids are excellent for transit overlays
        break;
      case "Compatibility":
        recommendedSystems.push("KP", "Western");
        suggestedFocusHouses.push(7, 5, 11);
        break;
      default:
        suggestedFocusHouses.push(1);
    }

    return {
      package: pkg,
      recommendedSystems: Array.from(new Set(recommendedSystems)),
      suggestedFocusHouses,
    };
  }
}
