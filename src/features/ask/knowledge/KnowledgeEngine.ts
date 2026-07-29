import { KnowledgeItem } from "../models/KnowledgeItem";
import { KnowledgeIndex } from "./KnowledgeIndex";
import { EvidencePackage, EvidenceFactor } from "../models/EvidencePackage";

export class KnowledgeEngine {
  /**
   * Retrieves relevant knowledge and packages it into an evidence compilation structure.
   * Matches the input text to corresponding house, planet, and planetary concepts.
   */
  public static retrieve(query: string): {
    articles: KnowledgeItem[];
    evidence: EvidencePackage;
  } {
    // 1. Fetch relevant knowledge items
    const articles = KnowledgeIndex.search(query);

    // 2. Synthesize primary, secondary, and supporting factors (Placeholders as instructed)
    const primaryFactors: EvidenceFactor[] = [];
    const secondaryFactors: EvidenceFactor[] = [];
    const supportingFactors: EvidenceFactor[] = [];
    const conflictingFactors: EvidenceFactor[] = [];
    const missingFactors: { factor: string; details: string }[] = [];

    // Map matched articles to factors
    articles.forEach((art, index) => {
      const factor: EvidenceFactor = {
        factor: art.title,
        description: art.description,
        source: art.category.toUpperCase()
      };

      if (index === 0) {
        primaryFactors.push(factor);
      } else if (index === 1) {
        secondaryFactors.push(factor);
      } else {
        supportingFactors.push(factor);
      }
    });

    // Populate placeholder empty structures with architectural examples if nothing was matched
    if (primaryFactors.length === 0) {
      primaryFactors.push({
        factor: "Natal House Configuration",
        description: "Focus house derived from primary query keyword analysis.",
        source: "JHORA ENGINE"
      });
    }

    if (missingFactors.length === 0) {
      missingFactors.push({
        factor: "Active Sade Sati Transit Details",
        details: "Requires full transit longitude check against natal Moon."
      });
    }

    const evidence: EvidencePackage = {
      primaryFactors,
      secondaryFactors,
      supportingFactors,
      conflictingFactors,
      missingFactors
    };

    return {
      articles,
      evidence
    };
  }
}
