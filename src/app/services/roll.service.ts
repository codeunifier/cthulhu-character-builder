import { Injectable } from '@angular/core';
import { Character, ImprovementRoll, StatModifiers, Stats } from '../models';
import { DiceService } from './dice.service';
import { AgeRangeService } from './age-range.service';

@Injectable({
  providedIn: 'root'
})
export class RollService {
  constructor(
    private diceService: DiceService,
    private ageRangeService: AgeRangeService
  ) {}
  
  // Get the number of improvement checks based on character age
  getNumberOfImprovementChecksFromAge(age: number): number {
    return this.ageRangeService.getImprovementChecksCount(age);
  }

  makeImprovementCheck(character: Character, stat: string, times: number): { rolls: any[], totalImprovement: number } {
    if (stat !== 'str' && stat !== 'con' && stat !== 'dex' && 
        stat !== 'app' && stat !== 'pow' && stat !== 'int' && 
        stat !== 'edu' && stat !== 'siz' && stat !== 'luck') {
      return { rolls: [], totalImprovement: 0 }; // Only apply to valid numerical stats
    }
    
    // Remove all existing improvement modifiers for this stat before making new checks
    this.removeAllImprovementModifiers(character, stat);
    
    // Initialize improvementRolls on the character if it doesn't exist
    if (!character.improvementRolls) {
      character.improvementRolls = {};
    }
    
    // Always clear previous rolls for this stat when making a new check
    character.improvementRolls[stat] = [];
    
    let totalImprovement = 0;
    const rolls = [];
    
    for (let i = 0; i < times; i++) {
      const roll = this.diceService.roll1d100();
      const statValue = character[stat];
      const success = roll > statValue;
      
      const rollData = {
        check: roll,
        target: statValue,
        success: success,
        improvement: success ? this.diceService.roll1d10() : undefined
      };
      
      character.improvementRolls[stat].push(rollData);
      rolls.push(rollData);
      
      if (success && rollData.improvement !== undefined) {
        totalImprovement += rollData.improvement;
        this.addStatModifier(character, stat, rollData.improvement, 'Improvement Check');
      }
    }
    
    return { rolls, totalImprovement };
  }
  
  // Get roll information for a specific stat's improvement check
  getImprovementRolls(character: Character, stat: string): ImprovementRoll[] {
    if (!character || !character.improvementRolls || !character.improvementRolls[stat]) {
      return [];
    }
    return character.improvementRolls[stat];
  }
  
  // Reroll all improvement checks for a stat
  rerollAllImprovementChecks(character: Character, stat: string): { rolls: any[], totalImprovement: number } {
    // Determine number of checks based on character's age
    const numberOfChecks = this.getNumberOfImprovementChecksFromAge(character.age);
    
    if (numberOfChecks === 0) {
      return { rolls: [], totalImprovement: 0 };
    }
    
    // Remove all existing improvement modifiers for this stat
    this.removeAllImprovementModifiers(character, stat);
    
    // Perform all checks again
    return this.makeImprovementCheck(character, stat, numberOfChecks);
  }
  
  // Reroll a specific improvement amount (only if the check was successful)
  rerollImprovementAmount(character: Character, stat: string, checkIndex: number): { improvement: number } | null {
    if (!character.improvementRolls || 
        !character.improvementRolls[stat] || 
        checkIndex >= character.improvementRolls[stat].length || 
        !character.improvementRolls[stat][checkIndex].success) {
      return null;
    }
    
    // Get the previous roll data
    const rollData = character.improvementRolls[stat][checkIndex];
    
    // Remove previous improvement
    if (rollData.improvement !== undefined) {
      this.removeImprovementModifier(character, stat, rollData.improvement);
    }
    
    // Roll a new improvement
    const newImprovement = this.diceService.roll1d10();
    
    // Add the new improvement
    this.addStatModifier(character, stat, newImprovement, 'Improvement Check');
    
    // Update the roll data
    rollData.improvement = newImprovement;
    
    return { improvement: newImprovement };
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
  
  // Remove all improvement modifiers for a stat
  removeAllImprovementModifiers(character: Character, stat: string): void {
    if (!character.statModifiers || !character.statModifiers[stat as keyof StatModifiers]) {
      return;
    }
    
    // Get all improvement modifiers
    const improvementModifiers = character.statModifiers[stat as keyof StatModifiers]!.filter(
      mod => mod.source === 'Improvement Check'
    );
    
    // Calculate total improvement value
    const totalImprovement = improvementModifiers.reduce((sum, mod) => sum + mod.value, 0);
    
    // Remove all improvement modifiers
    character.statModifiers[stat as keyof StatModifiers] = character.statModifiers[stat as keyof StatModifiers]!.filter(
      mod => mod.source !== 'Improvement Check'
    );
    
    // Update the stat value
    if (totalImprovement > 0) {
      (character[stat as keyof Character] as number) -= totalImprovement;
    }
    
    // Ensure stats don't go below minimum values
    const minValue = ['siz', 'int', 'edu'].includes(stat) ? 40 : 15;
    if ((character[stat as keyof Character] as number) < minValue) {
      (character[stat as keyof Character] as number) = minValue;
    }
  }
  
  // Helper method to remove a specific improvement modifier
  removeImprovementModifier(character: Character, stat: string, value: number): void {
    if (!character.statModifiers || !character.statModifiers[stat as keyof StatModifiers]) {
      return;
    }
    
    // Find the improvement check modifier
    const modifiers = character.statModifiers[stat as keyof StatModifiers]!;
    const index = modifiers.findIndex(mod => mod.source === 'Improvement Check' && mod.value === value);
    
    if (index >= 0) {
      // Remove the modifier
      modifiers.splice(index, 1);
      
      // Update the stat value
      (character[stat as keyof Character] as number) -= value;
    }
  }
}