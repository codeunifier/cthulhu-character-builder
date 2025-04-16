import { Injectable } from '@angular/core';

// Define comprehensive age range information
export interface AgeRange {
  id: number;
  name: string;
  selectorName: string;
  min: number;
  max: number;
  eduImprovementChecks: number;
  movementPenalty: number;
  appPenalty: number;
  statDeduction: {
    totalPoints: number;
    affectedStats: string[];
  } | null;
  specialEffects?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AgeRangeService {
  // Define all age ranges with complete information
  private ageRanges: AgeRange[] = [
    {
      id: 1,
      name: 'Young',
      selectorName: 'Young (15-19)',
      min: 15,
      max: 19,
      eduImprovementChecks: 0,
      movementPenalty: 0,
      appPenalty: 0,
      statDeduction: {
        totalPoints: 5,
        affectedStats: ['str', 'siz']
      },
      specialEffects: ['rerollLuck', 'eduPenalty']
    },
    {
      id: 2,
      name: 'Adult',
      selectorName: 'Adult (20-39)',
      min: 20,
      max: 39,
      eduImprovementChecks: 1,
      movementPenalty: 0,
      appPenalty: 0,
      statDeduction: null
    },
    {
      id: 3,
      name: 'Middle-aged',
      selectorName: 'Middle-aged (40-49)',
      min: 40,
      max: 49,
      eduImprovementChecks: 2,
      movementPenalty: 1,
      appPenalty: 5,
      statDeduction: {
        totalPoints: 5,
        affectedStats: ['str', 'con', 'dex']
      }
    },
    {
      id: 4,
      name: 'Mature',
      selectorName: 'Mature (50-59)',
      min: 50,
      max: 59,
      eduImprovementChecks: 3,
      movementPenalty: 2,
      appPenalty: 10,
      statDeduction: {
        totalPoints: 10,
        affectedStats: ['str', 'con', 'dex']
      }
    },
    {
      id: 5,
      name: 'Elderly',
      selectorName: 'Elderly (60-69)',
      min: 60,
      max: 69,
      eduImprovementChecks: 4,
      movementPenalty: 3,
      appPenalty: 15,
      statDeduction: {
        totalPoints: 20,
        affectedStats: ['str', 'con', 'dex']
      }
    },
    {
      id: 6,
      name: 'Old',
      selectorName: 'Old (70-79)',
      min: 70,
      max: 79,
      eduImprovementChecks: 4,
      movementPenalty: 4,
      appPenalty: 20,
      statDeduction: {
        totalPoints: 40,
        affectedStats: ['str', 'con', 'dex']
      }
    },
    {
      id: 7,
      name: 'Venerable',
      selectorName: 'Venerable (80-89)',
      min: 80,
      max: 89,
      eduImprovementChecks: 4,
      movementPenalty: 5,
      appPenalty: 25,
      statDeduction: {
        totalPoints: 80,
        affectedStats: ['str', 'con', 'dex']
      }
    }
  ];

  constructor() {}

  /**
   * Gets the age range for a given age
   */
  getAgeRange(age: number): AgeRange | null {
    return this.ageRanges.find(range => age >= range.min && age <= range.max) || null;
  }

  /**
   * Gets the number of EDU improvement checks for a given age
   */
  getImprovementChecksCount(age: number): number {
    const range = this.getAgeRange(age);
    return range ? range.eduImprovementChecks : 0;
  }

  /**
   * Gets the movement penalty for a given age
   */
  getMovementPenalty(age: number): number {
    const range = this.getAgeRange(age);
    return range ? range.movementPenalty : 0;
  }

  /**
   * Gets the APP penalty for a given age
   */
  getAppearancePenalty(age: number): number {
    const range = this.getAgeRange(age);
    return range ? range.appPenalty : 0;
  }

  /**
   * Gets information about stat deductions for a given age
   */
  getStatDeduction(age: number): { totalPoints: number; affectedStats: string[] } | null {
    const range = this.getAgeRange(age);
    return range ? range.statDeduction : null;
  }

  /**
   * Gets all available age ranges for display
   */
  getAllAgeRanges(): AgeRange[] {
    return [...this.ageRanges];
  }

  /**
   * Checks if a specific age has special effects (like luck reroll for young characters)
   */
  hasSpecialEffect(age: number, effect: string): boolean {
    const range = this.getAgeRange(age);
    return range?.specialEffects?.includes(effect) || false;
  }
}