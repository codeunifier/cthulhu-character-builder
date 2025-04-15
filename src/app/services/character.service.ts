import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character, DEFAULT_SKILLS, Occupation, Skill, StatModifiers } from '../models/character.model';
import { DiceService } from './dice.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  // Track age deduction information
  private ageDeductionInfo: {
    totalPoints: number;
    stats: string[];
    usedPoints: { [stat: string]: number };
  } = {
    totalPoints: 0,
    stats: [],
    usedPoints: {}
  };

  constructor(private diceService: DiceService) {}

  getCharacter(): Observable<Character | null> {
    return this.characterSubject.asObservable();
  }

  getCurrentCharacter(): Character | null {
    return this.characterSubject.getValue();
  }

  createNewCharacter(): void {
    const stats = this.diceService.generateBaseStats();
    
    // Create a new character with default values
    const character: Character = {
      name: '',
      age: 20,
      occupation: null,
      str: stats.str,
      con: stats.con,
      siz: stats.siz,
      dex: stats.dex,
      app: stats.app,
      int: stats.int,
      pow: stats.pow,
      edu: stats.edu,
      luck: stats.luck,
      // Store the original rolled stats
      baseStats: { ...stats },
      // Initialize stat modifiers
      statModifiers: {
        str: [],
        con: [],
        siz: [],
        dex: [],
        app: [],
        int: [],
        pow: [],
        edu: [],
        luck: []
      },
      damageBonus: 'None',
      build: 0,
      hp: 0,
      mov: 8,
      skills: JSON.parse(JSON.stringify(DEFAULT_SKILLS)), // Deep copy default skills
      remainingSkillPoints: 0,
      ideology: '',
      significantPerson: {
        who: '',
        why: ''
      },
      meaningfulLocation: '',
      treasuredPossession: '',
      trait: ''
    };

    // Calculate derived attributes
    this.updateDerivedAttributes(character);
    this.updateDerivedSkills(character);
    
    this.characterSubject.next(character);
  }

  updateCharacter(character: Character): void {
    this.updateDerivedAttributes(character);
    this.updateDerivedSkills(character);
    this.characterSubject.next(character);
  }

  updateDerivedAttributes(character: Character): void {
    this.calculateDamageAndBuild(character);
    this.calculateHitPoints(character);
    this.calculateMovementRate(character);
  }

  updateDerivedSkills(character: Character): void {
    // Dodge is half of DEX
    const dodgeSkill = character.skills.find(s => s.name === 'Dodge');
    if (dodgeSkill) {
      dodgeSkill.baseValue = Math.floor(character.dex / 2);
      dodgeSkill.total = dodgeSkill.baseValue + dodgeSkill.improvementPoints;
    }
    
    // Own Language is equal to EDU
    const ownLanguageSkill = character.skills.find(s => s.name === 'Language (Own)');
    if (ownLanguageSkill) {
      ownLanguageSkill.baseValue = character.edu;
      ownLanguageSkill.total = ownLanguageSkill.baseValue + ownLanguageSkill.improvementPoints;
    }
  }

  applyAgeEffects(character: Character, age: number): void {
    // Reset any existing age effects
    this.resetCharacterToBaseStats(character);
    
    character.age = age;
    
    // Clear all age-related stat modifiers
    const statsToReset = ['str', 'con', 'siz', 'dex', 'app', 'int', 'pow', 'edu', 'luck'];
    statsToReset.forEach(stat => {
      if (character.statModifiers && character.statModifiers[stat as keyof StatModifiers]) {
        character.statModifiers[stat as keyof StatModifiers] = character.statModifiers[stat as keyof StatModifiers]?.filter(
          mod => mod.source !== 'Age Effect'
        );
      }
    });
    
    // Reset age deduction info
    this.ageDeductionInfo = {
      totalPoints: 0,
      stats: [],
      usedPoints: {}
    };
    
    if (age >= 15 && age <= 19) {
      // Add young age modifiers - these are applied automatically
      this.addOrUpdateStatModifier(character, 'edu', -5, 'Age Effect');
      
      // Roll Luck twice and use higher value
      const luck1 = this.diceService.roll3d6() * 5;
      const luck2 = this.diceService.roll3d6() * 5;
      character.luck = Math.max(luck1, luck2);

      this.ageDeductionInfo = {
        totalPoints: 5,
        stats: ['str', 'siz'],
        usedPoints: { 'str': 0, 'siz': 0 }
      };
    } 
    else if (age >= 20 && age <= 39) {
      // Improvement check - applied automatically
      this.makeImprovementCheck(character, 'edu', 1);
    } 
    else if (age >= 40 && age <= 49) {
      // Automatic EDU improvement check
      this.makeImprovementCheck(character, 'edu', 2);
      
      // Automatic APP penalty
      this.addOrUpdateStatModifier(character, 'app', -5, 'Age Effect');
      
      // Set age deduction info for STR, CON, DEX that player needs to allocate
      this.ageDeductionInfo = { 
        stats: ['str', 'con', 'dex'], 
        totalPoints: 5,
        usedPoints: { 'str': 0, 'con': 0, 'dex': 0 } 
      };
    } 
    else if (age >= 50 && age <= 59) {
      // Automatic EDU improvement check
      this.makeImprovementCheck(character, 'edu', 3);
      
      // Automatic APP penalty
      this.addOrUpdateStatModifier(character, 'app', -10, 'Age Effect');
      
      // Set age deduction info for STR, CON, DEX that player needs to allocate
      this.ageDeductionInfo = { 
        stats: ['str', 'con', 'dex'], 
        totalPoints: 10,
        usedPoints: { 'str': 0, 'con': 0, 'dex': 0 } 
      };
    } 
    else if (age >= 60 && age <= 69) {
      // Automatic EDU improvement check
      this.makeImprovementCheck(character, 'edu', 4);
      
      // Automatic APP penalty
      this.addOrUpdateStatModifier(character, 'app', -15, 'Age Effect');
      
      // Set age deduction info for STR, CON, DEX that player needs to allocate
      this.ageDeductionInfo = { 
        stats: ['str', 'con', 'dex'], 
        totalPoints: 20,
        usedPoints: { 'str': 0, 'con': 0, 'dex': 0 } 
      };
    } 
    else if (age >= 70 && age <= 79) {
      // Automatic EDU improvement check
      this.makeImprovementCheck(character, 'edu', 4);
      
      // Automatic APP penalty
      this.addOrUpdateStatModifier(character, 'app', -20, 'Age Effect');
      
      // Set age deduction info for STR, CON, DEX that player needs to allocate
      this.ageDeductionInfo = { 
        stats: ['str', 'con', 'dex'], 
        totalPoints: 40,
        usedPoints: { 'str': 0, 'con': 0, 'dex': 0 } 
      };
    } 
    else if (age >= 80 && age <= 89) {
      // Automatic EDU improvement check
      this.makeImprovementCheck(character, 'edu', 4);
      
      // Automatic APP penalty
      this.addOrUpdateStatModifier(character, 'app', -25, 'Age Effect');
      
      // Set age deduction info for STR, CON, DEX that player needs to allocate
      this.ageDeductionInfo = { 
        stats: ['str', 'con', 'dex'], 
        totalPoints: 80,
        usedPoints: { 'str': 0, 'con': 0, 'dex': 0 } 
      };
    }
    
    // Recalculate derived stats
    this.updateDerivedAttributes(character);
    this.updateDerivedSkills(character);
  }

  // Helper method to add a stat modifier
  addStatModifier(character: Character, stat: string, value: number, source: string): void {
    if (!character.statModifiers) {
      character.statModifiers = {};
    }
    
    if (!character.statModifiers[stat as keyof StatModifiers]) {
      character.statModifiers[stat as keyof StatModifiers] = [];
    }
    
    // Add the modifier
    character.statModifiers[stat as keyof StatModifiers]?.push({ source, value });
    
    // Apply the modifier directly to the stat
    (character[stat as keyof Character] as number) += value;
    
    // Ensure stats don't go below minimum values
    const minValue = ['siz', 'int', 'edu'].includes(stat) ? 40 : 15;
    if ((character[stat as keyof Character] as number) < minValue) {
      (character[stat as keyof Character] as number) = minValue;
    }
  }

  // Methods for handling age-related stat deductions
  getAgeDeductionInfo(): {totalPoints: number; stats: string[]; usedPoints: {[stat: string]: number}} {
    return this.ageDeductionInfo;
  }
  
  getAgeDeductionStats(): string[] {
    return this.ageDeductionInfo.stats;
  }
  
  getAgeDeductionTotalPoints(): number {
    return this.ageDeductionInfo.totalPoints;
  }
  
  getAgeDeductionUsedPoints(): {[stat: string]: number} {
    return this.ageDeductionInfo.usedPoints;
  }
  
  getAgeDeductionRemainingPoints(): number {
    const totalUsed = Object.values(this.ageDeductionInfo.usedPoints).reduce((sum, val) => sum + val, 0);
    return this.ageDeductionInfo.totalPoints - totalUsed;
  }
  
  getAgeDeductionUsedForStat(stat: string): number {
    return this.ageDeductionInfo.usedPoints[stat] || 0;
  }
  
  applyStatDeduction(character: Character, stat: string, amount: number): void {
    // Validate amount
    if (amount === 0) return;
    
    const remainingPoints = this.getAgeDeductionRemainingPoints();
    
    // If adding points (negative deduction) or removing points (positive deduction)
    if (amount < 0) {
      // This is removing a previous deduction (adding points back)
      const currentDeduction = this.ageDeductionInfo.usedPoints[stat] || 0;
      // Cannot remove more than was previously deducted
      const actualAmount = Math.max(amount, -currentDeduction);
      
      if (actualAmount === 0) return; // Nothing to change
      
      // Remove the previous modifier
      if (character.statModifiers && character.statModifiers[stat as keyof StatModifiers]) {
        // Find the age effect modifier
        const agePenaltyIndex = character.statModifiers[stat as keyof StatModifiers]!.findIndex(
          mod => mod.source === 'Age Effect'
        );
        
        if (agePenaltyIndex >= 0) {
          // Update the existing modifier
          character.statModifiers[stat as keyof StatModifiers]![agePenaltyIndex].value -= actualAmount;
          
          // If modifier is now zero, remove it
          if (character.statModifiers[stat as keyof StatModifiers]![agePenaltyIndex].value === 0) {
            character.statModifiers[stat as keyof StatModifiers]!.splice(agePenaltyIndex, 1);
          }
        }
      }
      
      // Update the stat value
      (character[stat as keyof Character] as number) -= actualAmount;
      
      // Update tracking
      this.ageDeductionInfo.usedPoints[stat] = (this.ageDeductionInfo.usedPoints[stat] || 0) + actualAmount;
      
    } else if (amount > 0) {
      // Adding a deduction (reducing character stat)
      // Validate we have enough points to deduct
      if (amount > remainingPoints) {
        amount = remainingPoints;
      }
      
      if (amount <= 0) return; // Nothing to deduct
      
      // Make sure we don't reduce below minimum (15)
      const minAllowed = 15;
      const currentValue = (character[stat as keyof Character] as number);
      const maxDeduction = currentValue - minAllowed;
      
      if (maxDeduction <= 0) {
        return; // Cannot deduct any further
      }
      
      // Apply the deduction but don't go below minimum
      const actualDeduction = Math.min(amount, maxDeduction);
      
      // Add or update this deduction as a stat modifier
      this.addOrUpdateStatModifier(character, stat, -actualDeduction, 'Age Effect');
      
      // Update tracking
      this.ageDeductionInfo.usedPoints[stat] = (this.ageDeductionInfo.usedPoints[stat] || 0) + actualDeduction;
    }
    
    this.updateDerivedAttributes(character);
    this.updateCharacter(character);
  }
  
  // Helper to add or update a stat modifier with the same source
  private addOrUpdateStatModifier(character: Character, stat: string, value: number, source: string): void {
    if (!character.statModifiers) {
      character.statModifiers = {};
    }
    
    if (!character.statModifiers[stat as keyof StatModifiers]) {
      character.statModifiers[stat as keyof StatModifiers] = [];
    }
    
    // Check if modifier with same source already exists
    const existingIndex = character.statModifiers[stat as keyof StatModifiers]!.findIndex(
      mod => mod.source === source
    );
    
    if (existingIndex >= 0) {
      // Add to existing modifier
      character.statModifiers[stat as keyof StatModifiers]![existingIndex].value += value;
    } else {
      // Add new modifier
      character.statModifiers[stat as keyof StatModifiers]!.push({ source, value });
    }
    
    // Apply the change to the actual stat
    (character[stat as keyof Character] as number) += value;
    
    // Ensure stats don't go below minimum values
    const minValue = ['siz', 'int', 'edu'].includes(stat) ? 40 : 15;
    if ((character[stat as keyof Character] as number) < minValue) {
      (character[stat as keyof Character] as number) = minValue;
    }
  }

  makeImprovementCheck(character: Character, stat: string, times: number): void {
    if (stat !== 'str' && stat !== 'con' && stat !== 'dex' && 
        stat !== 'app' && stat !== 'pow' && stat !== 'int' && 
        stat !== 'edu' && stat !== 'siz' && stat !== 'luck') {
      return; // Only apply to valid numerical stats
    }
    
    for (let i = 0; i < times; i++) {
      const roll = this.diceService.roll1d100();
      if (roll > character[stat]) {
        const improvement = this.diceService.roll1d10();
        this.addStatModifier(character, stat, improvement, 'Improvement Check');
      }
    }
  }

  calculateDamageAndBuild(character: Character): void {
    const sum = character.str + character.siz;
    
    if (sum >= 2 && sum <= 64) {
      character.damageBonus = "-2";
      character.build = -2;
    } 
    else if (sum >= 65 && sum <= 84) {
      character.damageBonus = "-1";
      character.build = -1;
    } 
    else if (sum >= 85 && sum <= 124) {
      character.damageBonus = "None";
      character.build = 0;
    } 
    else if (sum >= 125 && sum <= 164) {
      character.damageBonus = "+1d4";
      character.build = 1;
    } 
    else if (sum >= 165 && sum <= 204) {
      character.damageBonus = "+1d6";
      character.build = 2;
    } 
    else if (sum >= 205 && sum <= 284) {
      character.damageBonus = "+2d6";
      character.build = 3;
    } 
    else if (sum >= 285 && sum <= 364) {
      character.damageBonus = "+3d6";
      character.build = 4;
    } 
    else if (sum >= 365 && sum <= 444) {
      character.damageBonus = "+4d6";
      character.build = 5;
    } 
    else if (sum >= 445) {
      // Calculate additional dice for very high values
      const additionalDice = Math.floor((sum - 445) / 80) + 5;
      character.damageBonus = `+${additionalDice}d6`;
      character.build = additionalDice;
    }
  }

  calculateHitPoints(character: Character): void {
    character.hp = Math.floor((character.con + character.siz) / 10);
  }

  calculateMovementRate(character: Character): void {
    // Base movement rate based on STR, DEX, and SIZ
    if (character.str < character.siz && character.dex < character.siz) {
      character.mov = 7;
    } 
    else if ((character.str >= character.siz || character.dex >= character.siz) || 
             (character.str === character.siz && character.dex === character.siz)) {
      character.mov = 8;
    } 
    else if (character.str > character.siz && character.dex > character.siz) {
      character.mov = 9;
    }
    
    // Apply age modifiers
    const age = character.age;
    if (age >= 40 && age <= 49) {
      character.mov -= 1;
    } 
    else if (age >= 50 && age <= 59) {
      character.mov -= 2;
    } 
    else if (age >= 60 && age <= 69) {
      character.mov -= 3;
    } 
    else if (age >= 70 && age <= 79) {
      character.mov -= 4;
    } 
    else if (age >= 80) {
      character.mov -= 5;
    }
    
    // Ensure MOV doesn't go below 1
    if (character.mov < 1) {
      character.mov = 1;
    }
  }

  calculateOccupationSkillPoints(character: Character, occupation: Occupation): number {
    // Parse the formula (e.g., "EDU × 4" or "EDU × 2 + APP × 2")
    const formula = occupation.skillPointsFormula;
    
    if (formula.includes('+')) {
      // Handle formulas with addition
      const parts = formula.split('+').map(p => p.trim());
      let total = 0;
      
      for (const part of parts) {
        const [stat, multiplier] = this.parseFormulaComponent(part);
        total += this.getStatValue(character, stat) * multiplier;
      }
      
      return total;
    } else {
      // Handle simple formulas (e.g., "EDU × 4")
      const [stat, multiplier] = this.parseFormulaComponent(formula);
      return this.getStatValue(character, stat) * multiplier;
    }
  }

  private getStatValue(character: Character, statName: string): number {
    const stat = statName.toLowerCase();
    switch (stat) {
      case 'str': return character.str;
      case 'con': return character.con;
      case 'siz': return character.siz;
      case 'dex': return character.dex;
      case 'app': return character.app;
      case 'int': return character.int;
      case 'pow': return character.pow;
      case 'edu': return character.edu;
      case 'luck': return character.luck;
      default: return 0;
    }
  }

  private parseFormulaComponent(component: string): [string, number] {
    // Parse a component like "EDU × 4" or "DEX × 2"
    const parts = component.split('×').map(p => p.trim());
    const stat = parts[0]; // "EDU", "DEX", etc.
    const multiplier = parseInt(parts[1], 10); // 4, 2, etc.
    
    return [stat, multiplier];
  }

  setOccupation(character: Character, occupation: Occupation): void {
    character.occupation = occupation;
    
    // Reset all skills to non-occupational
    character.skills.forEach(skill => {
      skill.occupationalSkill = false;
    });
    
    // Mark occupational skills
    occupation.skills.forEach(skillName => {
      const skill = character.skills.find(s => s.name === skillName || s.name.startsWith(skillName + ' ('));
      if (skill) {
        skill.occupationalSkill = true;
      }
    });
    
    // Calculate skill points
    character.remainingSkillPoints = this.calculateOccupationSkillPoints(character, occupation);
    
    // Ensure credit rating is within the allowed range
    this.ensureCreditRatingInRange(character);
    
    this.updateCharacter(character);
  }

  ensureCreditRatingInRange(character: Character): void {
    if (!character.occupation) return;
    
    const creditRatingSkill = character.skills.find(s => s.name === 'Credit Rating');
    if (creditRatingSkill) {
      const min = character.occupation.creditRatingMin;
      const max = character.occupation.creditRatingMax;
      
      // Ensure credit rating is within the allowed range
      if (creditRatingSkill.total < min) {
        // Add points to reach minimum
        const pointsNeeded = min - creditRatingSkill.total;
        creditRatingSkill.improvementPoints += pointsNeeded;
        creditRatingSkill.total = min;
        character.remainingSkillPoints -= pointsNeeded;
      } else if (creditRatingSkill.total > max) {
        // Remove points to reach maximum
        const excessPoints = creditRatingSkill.total - max;
        creditRatingSkill.improvementPoints -= excessPoints;
        creditRatingSkill.total = max;
        character.remainingSkillPoints += excessPoints;
      }
    }
  }

  allocateSkillPoints(character: Character, skill: Skill, points: number): boolean {
    // For removing points (negative points)
    if (points < 0) {
      const pointsToRemove = Math.abs(points);
      
      // Can't remove more points than are allocated
      if (pointsToRemove > skill.improvementPoints) return false;
      
      skill.improvementPoints -= pointsToRemove;
      skill.total = skill.baseValue + skill.improvementPoints;
      character.remainingSkillPoints += pointsToRemove;
      
      this.updateCharacter(character);
      return true;
    }
    
    // For adding points (positive points)
    if (points <= 0 || points > character.remainingSkillPoints) return false;
    
    // Points can be allocated to occupational skills or selected skills
    if (!skill.occupationalSkill && !skill.isSelected) return false;
    
    skill.improvementPoints += points;
    skill.total = skill.baseValue + skill.improvementPoints;
    character.remainingSkillPoints -= points;
    
    this.updateCharacter(character);
    return true;
  }

  private resetCharacterToBaseStats(character: Character): void {
    if (!character.baseStats) {
      // If baseStats doesn't exist, create it from current stats
      character.baseStats = {
        str: character.str,
        con: character.con,
        siz: character.siz,
        dex: character.dex,
        app: character.app,
        int: character.int,
        pow: character.pow,
        edu: character.edu,
        luck: character.luck
      };
    }
    
    // Initialize modifiers if they don't exist
    if (!character.statModifiers) {
      character.statModifiers = {
        str: [],
        con: [],
        siz: [],
        dex: [],
        app: [],
        int: [],
        pow: [],
        edu: [],
        luck: []
      };
    }
    
    // Reset stats to base values
    character.str = character.baseStats.str;
    character.con = character.baseStats.con;
    character.siz = character.baseStats.siz;
    character.dex = character.baseStats.dex;
    character.app = character.baseStats.app;
    character.int = character.baseStats.int;
    character.pow = character.baseStats.pow;
    character.edu = character.baseStats.edu;
    character.luck = character.baseStats.luck;
    
    // Clear all age-related modifiers
    Object.keys(character.statModifiers).forEach(stat => {
      if (character.statModifiers) {
        character.statModifiers[stat as keyof StatModifiers] = character.statModifiers[stat as keyof StatModifiers]?.filter(
          mod => mod.source !== 'Age Effect'
        );
      }
    });
  }

  saveCharacter(character: Character): void {
    // Save to localStorage
    localStorage.setItem('savedCharacter', JSON.stringify(character));
  }

  loadCharacter(): Character | null {
    const savedCharacterJson = localStorage.getItem('savedCharacter');
    if (savedCharacterJson) {
      const character = JSON.parse(savedCharacterJson) as Character;
      this.characterSubject.next(character);
      return character;
    }
    return null;
  }
}