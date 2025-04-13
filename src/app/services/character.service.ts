import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character, DEFAULT_SKILLS, Occupation, PendingDeduction, Skill } from '../models/character.model';
import { DiceService } from './dice.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);
  private pendingDeduction: PendingDeduction | null = null;

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
    
    if (age >= 15 && age <= 19) {
      character.str -= 5;
      character.siz -= 5;
      character.edu -= 5;
      // Roll Luck twice and use higher value
      const luck1 = this.diceService.roll3d6() * 5;
      const luck2 = this.diceService.roll3d6() * 5;
      character.luck = Math.max(luck1, luck2);
    } 
    else if (age >= 20 && age <= 39) {
      this.makeImprovementCheck(character, 'edu', 1);
    } 
    else if (age >= 40 && age <= 49) {
      this.makeImprovementCheck(character, 'edu', 2);
      // Deduct 5 points from STR, CON, or DEX (user's choice)
      this.pendingDeduction = { stats: ['str', 'con', 'dex'], points: 5 };
      character.app -= 5;
    } 
    else if (age >= 50 && age <= 59) {
      this.makeImprovementCheck(character, 'edu', 3);
      // Deduct 10 points from STR, CON, or DEX (user's choice)
      this.pendingDeduction = { stats: ['str', 'con', 'dex'], points: 10 };
      character.app -= 10;
    } 
    else if (age >= 60 && age <= 69) {
      this.makeImprovementCheck(character, 'edu', 4);
      // Deduct 20 points from STR, CON, or DEX (user's choice)
      this.pendingDeduction = { stats: ['str', 'con', 'dex'], points: 20 };
      character.app -= 15;
    } 
    else if (age >= 70 && age <= 79) {
      this.makeImprovementCheck(character, 'edu', 4);
      // Deduct 40 points from STR, CON, or DEX (user's choice)
      this.pendingDeduction = { stats: ['str', 'con', 'dex'], points: 40 };
      character.app -= 20;
    } 
    else if (age >= 80 && age <= 89) {
      this.makeImprovementCheck(character, 'edu', 4);
      // Deduct 80 points from STR, CON, or DEX (user's choice)
      this.pendingDeduction = { stats: ['str', 'con', 'dex'], points: 80 };
      character.app -= 25;
    }
    
    // Recalculate derived stats
    this.updateDerivedAttributes(character);
    this.updateDerivedSkills(character);
  }

  getPendingDeduction(): PendingDeduction | null {
    return this.pendingDeduction;
  }

  applyStatDeduction(character: Character, stat: string): void {
    if (!this.pendingDeduction) return;
    
    // Only apply deduction to number properties (str, con, dex)
    if (stat === 'str' || stat === 'con' || stat === 'dex') {
      character[stat] = Math.max(0, character[stat] - this.pendingDeduction.points);
    }
    
    this.pendingDeduction = null;
    this.updateDerivedAttributes(character);
    this.updateCharacter(character);
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
        character[stat] = character[stat] + improvement;
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
    // This assumes you've stored the original values when creating the character
    // You would need to implement this based on how you're tracking the original stats
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