export type KnowledgeCategory =
  | "planet"
  | "house"
  | "nakshatra"
  | "yoga"
  | "dosha"
  | "transit"
  | "dasha"
  | "kp"
  | "western"
  | "jaimini"
  | "future_system";

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  keyword: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
}
