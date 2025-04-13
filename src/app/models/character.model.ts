// Character and related models for the application

// Define the skill interface
export interface Skill {
  name: string;
  baseValue: number;
  occupationalSkill: boolean;
  improvementPoints: number;
  total: number;
}

// Define the occupation interface
export interface Occupation {
  name: string;
  creditRatingMin: number;
  creditRatingMax: number;
  skills: string[];
  skillPointsFormula: string;
}

// Define the pending deductions interface (used for age effects)
export interface PendingDeduction {
  stats: string[];
  points: number;
}

// Define the Character model
export interface Character {
  // Basic information
  name: string;
  age: number;
  occupation: Occupation | null;
  
  // Core statistics
  str: number;
  con: number;
  siz: number;
  dex: number;
  app: number;
  int: number;
  pow: number;
  edu: number;
  luck: number;
  
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

// Default skills list
export const DEFAULT_SKILLS: Skill[] = [
  { name: 'Accounting', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Anthropology', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Appraise', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Archaeology', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Art/Craft', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Charm', baseValue: 15, occupationalSkill: false, improvementPoints: 0, total: 15 },
  { name: 'Climb', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Credit Rating', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Cthulhu Mythos', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Disguise', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Dodge', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Drive Auto', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Elec Repair', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Fast Talk', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Fighting (Brawl)', baseValue: 25, occupationalSkill: false, improvementPoints: 0, total: 25 },
  { name: 'Firearms (Handgun)', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Firearms (Rifle/Shotgun)', baseValue: 25, occupationalSkill: false, improvementPoints: 0, total: 25 },
  { name: 'First Aid', baseValue: 30, occupationalSkill: false, improvementPoints: 0, total: 30 },
  { name: 'History', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Intimidate', baseValue: 15, occupationalSkill: false, improvementPoints: 0, total: 15 },
  { name: 'Jump', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Language (Other)', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Language (Own)', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Law', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Library Use', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Listen', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Locksmith', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Mech Repair', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Medicine', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Natural World', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Navigate', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Occult', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Op Hv Machine', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Persuade', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Pilot', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Psychology', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Psychoanalysis', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Ride', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Science', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Sleight of Hand', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Spot Hidden', baseValue: 25, occupationalSkill: false, improvementPoints: 0, total: 25 },
  { name: 'Stealth', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Survival', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Swim', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Throw', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Track', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 }
];

// List of occupations based on the provided data
export const OCCUPATIONS: Occupation[] = [
  {
    name: 'ANTIQUARIAN',
    creditRatingMin: 30,
    creditRatingMax: 70,
    skills: ['Appraise', 'Art/Craft', 'History', 'Library Use', 'Other Language', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'ARTIST',
    creditRatingMin: 9,
    creditRatingMax: 50,
    skills: ['Art/Craft', 'History', 'Natural World', 'Other Language', 'Psychology', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 2 + POW × 2'
  },
  {
    name: 'ATHLETE',
    creditRatingMin: 9,
    creditRatingMax: 70,
    skills: ['Climb', 'Jump', 'Fighting (Brawl)', 'Ride', 'Swim', 'Throw'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'AUTHOR',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'History', 'Library Use', 'Natural World', 'Occult', 'Other Language', 'Own Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'CLERGY, MEMBER OF THE',
    creditRatingMin: 9,
    creditRatingMax: 60,
    skills: ['Accounting', 'History', 'Library Use', 'Listen', 'Other Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'CRIMINAL',
    creditRatingMin: 5,
    creditRatingMax: 65,
    skills: ['Psychology', 'Spot Hidden', 'Stealth', 'Appraise', 'Disguise', 'Fighting (Brawl)', 'Firearms (Handgun)', 'Locksmith', 'Mech Repair', 'Sleight of Hand'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'DILETTANTE',
    creditRatingMin: 50,
    creditRatingMax: 99,
    skills: ['Art/Craft', 'Firearms (Handgun)', 'Other Language', 'Ride'],
    skillPointsFormula: 'EDU × 2 + APP × 2'
  },
  {
    name: 'DOCTOR OF MEDICINE',
    creditRatingMin: 30,
    creditRatingMax: 80,
    skills: ['First Aid', 'Other Language', 'Medicine', 'Psychology', 'Science'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'POLICE DETECTIVE',
    creditRatingMin: 20,
    creditRatingMax: 50,
    skills: ['Art/Craft', 'Disguise', 'Firearms (Handgun)', 'Law', 'Listen', 'Psychology', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'PROFESSOR',
    creditRatingMin: 20,
    creditRatingMax: 70,
    skills: ['Library Use', 'Other Language', 'Own Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  }
];