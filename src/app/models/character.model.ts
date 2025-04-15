// Character and related models for the application

// Define the skill interface
export interface Skill {
  name: string;
  baseValue: number;
  occupationalSkill: boolean;
  improvementPoints: number;
  total: number;
  isSelected?: boolean;
}

// Define the occupation interface
export interface Occupation {
  name: string;
  creditRatingMin: number;
  creditRatingMax: number;
  skills: string[];
  skillPointsFormula: string;
  skillsDescription?: string;
}

// Define the pending deductions interface (used for age effects)
export interface PendingDeduction {
  stats: string[];
  points: number;
  remainingPoints: number;
  deductions: { [key: string]: number };
}

// Define the Character model
export interface StatModifier {
  source: string;
  value: number;
}

export interface StatModifiers {
  str?: StatModifier[];
  con?: StatModifier[];
  siz?: StatModifier[];
  dex?: StatModifier[];
  app?: StatModifier[];
  int?: StatModifier[];
  pow?: StatModifier[];
  edu?: StatModifier[];
  luck?: StatModifier[];
}

export interface Stats {
  str: number;
  con: number;
  siz: number;
  dex: number;
  app: number;
  int: number;
  pow: number;
  edu: number;
  luck: number;
}

export interface Character extends Stats {
  // Basic information
  name: string;
  age: number;
  occupation: Occupation | null;
  
  // Core statistics
  
  // Stat modifiers for tracking bonuses/penalties from various sources
  statModifiers: StatModifiers;
  
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

// Default skills list
export const DEFAULT_SKILLS: Skill[] = [
  { name: 'Accounting', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Anthropology', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Appraise', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Archaeology', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
  { name: 'Art/Craft', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Charm', baseValue: 15, occupationalSkill: false, improvementPoints: 0, total: 15 },
  { name: 'Climb', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Computer Use', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Credit Rating', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Cthulhu Mythos', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Disguise', baseValue: 5, occupationalSkill: false, improvementPoints: 0, total: 5 },
  { name: 'Dodge', baseValue: 0, occupationalSkill: false, improvementPoints: 0, total: 0 },
  { name: 'Drive Auto', baseValue: 20, occupationalSkill: false, improvementPoints: 0, total: 20 },
  { name: 'Elec Repair', baseValue: 10, occupationalSkill: false, improvementPoints: 0, total: 10 },
  { name: 'Electronics', baseValue: 1, occupationalSkill: false, improvementPoints: 0, total: 1 },
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
    skills: ['Appraise', 'Art/Craft', 'History', 'Library Use', 'Language (Other)', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'Appraise, Art/Craft (any), History, Library Use, Language (Other), one interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), Spot Hidden, any one other skill'
  },
  {
    name: 'ARTIST',
    creditRatingMin: 9,
    creditRatingMax: 50,
    skills: ['Art/Craft', 'History', 'Natural World', 'Language (Other)', 'Psychology', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 2 + POW × 2',
    skillsDescription: 'Art/Craft (any), History or Natural World, one interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), Language (Other), Psychology, Spot Hidden, any two other skills'
  },
  {
    name: 'ATHLETE',
    creditRatingMin: 9,
    creditRatingMax: 70,
    skills: ['Climb', 'Jump', 'Fighting (Brawl)', 'Ride', 'Swim', 'Throw'],
    skillPointsFormula: 'EDU × 2 + DEX × 2',
    skillsDescription: 'Climb, Jump, Fighting (Brawl), Ride, one interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), Swim, Throw, any one other skill'
  },
  {
    name: 'AUTHOR',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'History', 'Library Use', 'Natural World', 'Occult', 'Language (Other)', 'Own Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'Art (Literature), History, Library Use, Natural World or Occult, Language (Other), Own Language, Psychology, any one other skill'
  },
  {
    name: 'CLERGY, MEMBER OF THE',
    creditRatingMin: 9,
    creditRatingMax: 60,
    skills: ['Accounting', 'History', 'Library Use', 'Listen', 'Language (Other)', 'Psychology'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'Accounting, History, Library Use, Listen, Language (Other), one interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), Psychology, any one other skill'
  },
  {
    name: 'CRIMINAL',
    creditRatingMin: 5,
    creditRatingMax: 65,
    skills: ['Psychology', 'Spot Hidden', 'Stealth', 'Appraise', 'Disguise', 'Fighting (Brawl)', 'Firearms (Handgun)', 'Locksmith', 'Mech Repair', 'Sleight of Hand'],
    skillPointsFormula: 'EDU × 2 + DEX × 2',
    skillsDescription: 'One interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), Psychology, Spot Hidden, Stealth, plus four specialisms from: Appraise, Disguise, Fighting, Firearms, Locksmith, Mechanical Repair, and Sleight of Hand'
  },
  {
    name: 'DILETTANTE',
    creditRatingMin: 50,
    creditRatingMax: 99,
    skills: ['Art/Craft', 'Firearms (Handgun)', 'Language (Other)', 'Ride'],
    skillPointsFormula: 'EDU × 2 + APP × 2',
    skillsDescription: 'Art/Craft (Any), Firearms, Language (Other)s, Ride, one interpersonal skill (Charm, Fast Talk, Intimidate, or Persuade), any three other skills'
  },
  {
    name: 'DOCTOR OF MEDICINE',
    creditRatingMin: 30,
    creditRatingMax: 80,
    skills: ['First Aid', 'Language (Other)', 'Medicine', 'Psychology', 'Science'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'First Aid, Language (Other) (Latin), Medicine, Psychology, Science (Biology), Science (Pharmacy), any two other skills as academic or personal specialties'
  },
  {
    name: 'DRIFTER',
    creditRatingMin: 0,
    creditRatingMax: 5,
    skills: ['Climb', 'Jump', 'Listen', 'Navigate', 'Stealth'],
    skillPointsFormula: 'EDU × 2 + APP × 2'
  },
  {
    name: 'ENGINEER',
    creditRatingMin: 30,
    creditRatingMax: 60,
    skills: ['Art/Craft', 'Elec Repair', 'Library Use', 'Mech Repair', 'Op Hv Machine', 'Science'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'ENTERTAINER',
    creditRatingMin: 9,
    creditRatingMax: 70,
    skills: ['Art/Craft', 'Disguise', 'Charm', 'Fast Talk', 'Listen', 'Psychology'],
    skillPointsFormula: 'EDU × 2 + APP × 2'
  },
  {
    name: 'FARMER',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'Drive Auto', 'Mech Repair', 'Natural World', 'Op Hv Machine', 'Track'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'HACKER',
    creditRatingMin: 10,
    creditRatingMax: 70,
    skills: ['Computer Use', 'Elec Repair', 'Electronics', 'Library Use', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'JOURNALIST',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'History', 'Library Use', 'Own Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'LAWYER',
    creditRatingMin: 30,
    creditRatingMax: 80,
    skills: ['Accounting', 'Law', 'Library Use', 'Charm', 'Fast Talk', 'Intimidate', 'Persuade', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'LIBRARIAN',
    creditRatingMin: 9,
    creditRatingMax: 35,
    skills: ['Accounting', 'Library Use', 'Language (Other)', 'Own Language'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'Accounting, Library Use, Language (Other), Own Language, any four other skills as personal specialties or specialist reading topics'
  },
  {
    name: 'MILITARY OFFICER',
    creditRatingMin: 20,
    creditRatingMax: 70,
    skills: ['Accounting', 'Firearms (Handgun)', 'Firearms (Rifle/Shotgun)', 'Navigate', 'Psychology', 'Survival'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'MISSIONARY',
    creditRatingMin: 0,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'First Aid', 'Mech Repair', 'Medicine', 'Natural World'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'MUSICIAN',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'Charm', 'Listen', 'Psychology'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'PARAPSYCHOLOGIST',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Anthropology', 'Art/Craft', 'History', 'Library Use', 'Occult', 'Language (Other)', 'Psychology'],
    skillPointsFormula: 'EDU × 4'
  },
  {
    name: 'PILOT',
    creditRatingMin: 20,
    creditRatingMax: 70,
    skills: ['Elec Repair', 'Mech Repair', 'Navigate', 'Op Hv Machine', 'Pilot', 'Science'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'POLICE DETECTIVE',
    creditRatingMin: 20,
    creditRatingMax: 50,
    skills: ['Art/Craft', 'Disguise', 'Firearms (Handgun)', 'Law', 'Listen', 'Psychology', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'POLICE OFFICER',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Fighting (Brawl)', 'Firearms (Handgun)', 'First Aid', 'Law', 'Psychology', 'Spot Hidden', 'Drive Auto'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'PRIVATE INVESTIGATOR',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Art/Craft', 'Disguise', 'Law', 'Library Use', 'Psychology', 'Spot Hidden'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'PROFESSOR',
    creditRatingMin: 20,
    creditRatingMax: 70,
    skills: ['Library Use', 'Language (Other)', 'Own Language', 'Psychology'],
    skillPointsFormula: 'EDU × 4',
    skillsDescription: 'Library Use, Language (Other), Own Language, Psychology, any four other skills as academic or personal specialties'
  },
  {
    name: 'SOLDIER',
    creditRatingMin: 9,
    creditRatingMax: 30,
    skills: ['Climb', 'Swim', 'Dodge', 'Fighting (Brawl)', 'Firearms (Rifle/Shotgun)', 'Stealth', 'Survival', 'First Aid', 'Mech Repair', 'Language (Other)'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'TRIBE MEMBER',
    creditRatingMin: 0,
    creditRatingMax: 15,
    skills: ['Climb', 'Fighting (Brawl)', 'Throw', 'Natural World', 'Listen', 'Occult', 'Spot Hidden', 'Swim', 'Survival'],
    skillPointsFormula: 'EDU × 2 + DEX × 2'
  },
  {
    name: 'ZEALOT',
    creditRatingMin: 0,
    creditRatingMax: 30,
    skills: ['History', 'Charm', 'Fast Talk', 'Intimidate', 'Persuade', 'Psychology', 'Stealth'],
    skillPointsFormula: 'EDU × 2 + APP × 2'
  }
];