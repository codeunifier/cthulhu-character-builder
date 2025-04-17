// Import required interfaces
import { Occupation } from './occupation.interface';
import { Skill } from './skill.interface';
import { StatModifiers } from './stat-modifiers.interface';
import { Stats } from './stats.interface';

// Define improvement roll interface
export interface ImprovementRoll {
  check: number;    // The d100 roll
  target: number;   // The stat value (target to exceed)
  success: boolean; // Whether the roll was successful
  improvement?: number; // The d10 roll (if successful)
}

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
  
  // Improvement check rolls
  improvementRolls?: {
    [stat: string]: ImprovementRoll[];
  };
  
  // Backstory elements
  ideology: string;
  ideologyDescription?: string;
  
  significantPerson: {
    who: string;
    why: string;
    whoDescription?: string;
    whyDescription?: string;
  };
  
  meaningfulLocation: string;
  meaningfulLocationDescription?: string;
  
  treasuredPossession: string;
  treasuredPossessionDescription?: string;
  
  trait: string;
  traitDescription?: string;
}