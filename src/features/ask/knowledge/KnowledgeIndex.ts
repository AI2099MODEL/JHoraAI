import { KnowledgeItem } from "../models/KnowledgeItem";
import { ASTROLOGY_KNOWLEDGE_BASE } from "./KnowledgeRepository";

export class KnowledgeIndex {
  private static index: Map<string, KnowledgeItem[]> = new Map();

  /**
   * Initializes or refreshes the index mapping
   */
  public static initialize(): void {
    this.index.clear();

    ASTROLOGY_KNOWLEDGE_BASE.forEach(item => {
      // 1. Index by keyword
      const kw = item.keyword.toLowerCase();
      this.addToIndex(kw, item);

      // 2. Index by category
      const cat = item.category.toLowerCase();
      this.addToIndex(cat, item);

      // 3. Index by individual tags
      item.tags.forEach(tag => {
        this.addToIndex(tag.toLowerCase(), item);
      });
    });
  }

  private static addToIndex(token: string, item: KnowledgeItem): void {
    if (!this.index.has(token)) {
      this.index.set(token, []);
    }
    const currentList = this.index.get(token)!;
    if (!currentList.some(i => i.id === item.id)) {
      currentList.push(item);
    }
  }

  /**
   * Performs fuzzy or keyword-based lookups over indexed terms
   */
  public static search(query: string): KnowledgeItem[] {
    if (this.index.size === 0) {
      this.initialize();
    }

    const words = query.toLowerCase().split(/\s+/);
    const resultsMap: Map<string, { item: KnowledgeItem; score: number }> = new Map();

    words.forEach(word => {
      // Direct matches
      if (this.index.has(word)) {
        this.index.get(word)!.forEach(item => {
          this.recordMatch(resultsMap, item, 10);
        });
      }

      // Partial/fuzzy matching
      this.index.forEach((items, indexedToken) => {
        if (indexedToken.includes(word) || word.includes(indexedToken)) {
          items.forEach(item => {
            const ratio = word.length / indexedToken.length;
            this.recordMatch(resultsMap, item, Math.round(5 * ratio));
          });
        }
      });
    });

    // Sort results by relevancy score descending
    return Array.from(resultsMap.values())
      .sort((a, b) => b.score - a.score)
      .map(entry => entry.item);
  }

  private static recordMatch(
    map: Map<string, { item: KnowledgeItem; score: number }>,
    item: KnowledgeItem,
    additionalScore: number
  ): void {
    if (!map.has(item.id)) {
      map.set(item.id, { item, score: 0 });
    }
    map.get(item.id)!.score += additionalScore;
  }
}
