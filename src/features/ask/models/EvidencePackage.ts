export interface EvidenceFactor {
  factor: string;       // e.g. "Sun in 10th House", "Vimshottari Dasha of Lord of 10th"
  description: string;  // e.g. "Sun enjoys Digbala in the 10th house indicating career status."
  source: string;       // e.g. "JHora", "KP", "Western", "Dasha Engine"
}

export interface MissingFactor {
  factor: string;
  details: string;
}

export interface EvidencePackage {
  primaryFactors: EvidenceFactor[];
  secondaryFactors: EvidenceFactor[];
  supportingFactors: EvidenceFactor[];
  conflictingFactors: EvidenceFactor[];
  missingFactors: MissingFactor[];
}
