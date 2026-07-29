import { IntentClassifier, AstrologicalIntent } from "./IntentClassifier";

export interface ClassifiedIntent {
  primary: AstrologicalIntent;
  confidence: number; // 0.0 to 1.0
  secondary?: AstrologicalIntent;
  keywordsDetected: string[];
}

export class IntentEngine {
  /**
   * Evaluates the text input and returns detailed classification metrics
   */
  public static analyze(query: string): ClassifiedIntent {
    const primary = IntentClassifier.classify(query);
    const keywordsDetected: string[] = [];

    // Simple keyword extraction for telemetry feedback and debugging
    const words = query.toLowerCase().split(/\W+/);
    const commonAstrologyKeywords = [
      "job", "career", "work", "marriage", "married", "wife", "husband",
      "money", "wealth", "business", "home", "travel", "health", "visa",
      "court", "government", "spiritual", "transit", "dasha", "compatibility"
    ];

    words.forEach(word => {
      if (commonAstrologyKeywords.includes(word) && !keywordsDetected.includes(word)) {
        keywordsDetected.push(word);
      }
    });

    // Determine confidence score based on keywords matched and lengths
    let confidence = 0.5;
    if (keywordsDetected.length > 0) {
      confidence = Math.min(0.5 + keywordsDetected.length * 0.15, 0.95);
    } else if (query.length > 15) {
      confidence = 0.6; // Higher confidence for longer descriptive questions
    }

    // Secondary intent analysis
    let secondary: AstrologicalIntent | undefined;
    const remainingText = query.toLowerCase().replace(new RegExp(primary, "i"), "");
    const possibleSecondary = IntentClassifier.classify(remainingText);
    if (possibleSecondary !== primary && possibleSecondary !== "General Horoscope") {
      secondary = possibleSecondary;
    }

    return {
      primary,
      confidence,
      secondary,
      keywordsDetected,
    };
  }
}
