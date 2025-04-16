// Skill interface definition
export interface Skill {
  name: string;
  baseValue: number;
  occupationalSkill: boolean;
  improvementPoints: number;
  total: number;
  isSelected?: boolean;
}