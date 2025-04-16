// Occupation interface definition
export interface Occupation {
  name: string;
  creditRatingMin: number;
  creditRatingMax: number;
  skills: string[];
  skillPointsFormula: string;
  skillsDescription?: string;
}