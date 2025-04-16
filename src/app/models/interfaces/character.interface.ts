// Import required interfaces
import { Occupation } from './occupation.interface';
import { Skill } from './skill.interface';
import { StatModifiers } from './stat-modifiers.interface';
import { Stats } from './stats.interface';

// Character interface definition
export interface Character extends Stats {
  // Basic information
  name: string;
  age: number;
  occupation: Occupation | null;
  
  // Stat modifiers for tracking bonuses/penalties from various sources
  statModifiers?: StatModifiers;
  
  // Original rolled stats (before any modifications)
  baseStats: Stats;
  
  // Derived attributes
  damageBonus: string;
  build: number;
  hp: number;
  mov: number;
  
  // Skills
  skills: Skill[];
  
  // Skill points
  remainingSkillPoints: number;
  
  // Backstory elements
  ideology: string;
  significantPerson: {
    who: string;
    why: string;
  };
  meaningfulLocation: string;
  treasuredPossession: string;
  trait: string;
}