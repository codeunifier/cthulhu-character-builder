import { Injectable } from '@angular/core';
import { Character, StatModifiers } from '../models';
import { RollService } from './roll.service';
import { DerivedStatsService } from './derived-stats.service';
import { AgeRangeService } from './age-range.service';

@Injectable({
  providedIn: 'root'
})
export class AgeEffectsService {
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

  constructor(
    private rollService: RollService,
    private derivedStatsService: DerivedStatsService,
    private ageRangeService: AgeRangeService
  ) {}

  // Methods for handling age-related stat deductions
  getAgeDeductionInfo(): {totalPoints: number; stats: string[]; usedPoints: {[stat: string]: number}} {
    return this.ageDeductionInfo;
  }
  
  getAgeDeductionRemainingPoints(): number {
    const totalUsed = Object.values(this.ageDeductionInfo.usedPoints).reduce((sum, val) => sum + val, 0);
    return this.ageDeductionInfo.totalPoints - totalUsed;
  }
  
  getAgeDeductionUsedForStat(stat: string): number {
    return this.ageDeductionInfo.usedPoints[stat] || 0;
  }
  
  applyAgeEffects(character: Character): void {
    // Reset any existing age effects
    this.resetCharacterToBaseStats(character);
    
    const age = character.age;
    
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
    
    // Get age range info
    const ageRange = this.ageRangeService.getAgeRange(age);
    
    if (!ageRange) {
      return; // Age outside of valid ranges
    }
    
    // Clear any existing EDU improvement modifiers
    if (character.statModifiers && character.statModifiers.edu) {
      // Get all improvement modifiers
      const eduImprovementModifiers = character.statModifiers.edu.filter(
        mod => mod.source === 'Improvement Check'
      );
      
      // Calculate total improvement value to remove
      const totalImprovement = eduImprovementModifiers.reduce((sum, mod) => sum + mod.value, 0);
      
      // Remove all improvement modifiers
      character.statModifiers.edu = character.statModifiers.edu.filter(
        mod => mod.source !== 'Improvement Check'
      );
      
      // Update the character's EDU stat value
      if (totalImprovement > 0) {
        character.edu -= totalImprovement;
      }
      
      // Clear any existing improvement rolls for EDU
      if (character.improvementRolls && character.improvementRolls['edu']) {
        character.improvementRolls['edu'] = [];
      }
    }
    
    // Apply EDU improvement checks based on age
    if (ageRange.eduImprovementChecks > 0) {
      this.rollService.makeImprovementCheck(character, 'edu', ageRange.eduImprovementChecks);
    }
    
    // Apply APP penalty if any
    if (ageRange.appPenalty > 0) {
      this.addOrUpdateStatModifier(character, 'app', -ageRange.appPenalty, 'Age Effect');
    }
    
    // Apply young age EDU penalty
    if (this.ageRangeService.hasSpecialEffect(age, 'eduPenalty')) {
      this.addOrUpdateStatModifier(character, 'edu', -5, 'Age Effect');
    }
    
    // Handle luck reroll for young characters
    // Note: This would be handled in character creation
    
    // Set up stat deductions if applicable
    const deduction = this.ageRangeService.getStatDeduction(age);
    if (deduction) {
      this.ageDeductionInfo = {
        totalPoints: deduction.totalPoints,
        stats: deduction.affectedStats,
        usedPoints: {}
      };
      
      // Initialize usedPoints with zeros
      deduction.affectedStats.forEach(stat => {
        this.ageDeductionInfo.usedPoints[stat] = 0;
      });
    }
    
    // Update derived attributes
    this.derivedStatsService.updateDerivedAttributes(character);
    this.derivedStatsService.updateDerivedSkills(character);
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
    
    // Update derived attributes
    this.derivedStatsService.updateDerivedAttributes(character);
  }
  
  // Helper to add or update a stat modifier with the same source
  addOrUpdateStatModifier(character: Character, stat: string, value: number, source: string): void {
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
  }
}