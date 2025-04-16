import { Injectable } from '@angular/core';
import { Character, Occupation } from '../models';
import { AgeRangeService } from './age-range.service';

@Injectable({
  providedIn: 'root'
})
export class DerivedStatsService {
  constructor(private ageRangeService: AgeRangeService) {}

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
    const movementPenalty = this.ageRangeService.getMovementPenalty(character.age);
    character.mov -= movementPenalty;
    
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
}