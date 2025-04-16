import { Injectable } from '@angular/core';
import { Character, Occupation, Skill } from '../models';
import { DerivedStatsService } from './derived-stats.service';

@Injectable({
  providedIn: 'root'
})
export class OccupationService {
  constructor(private derivedStatsService: DerivedStatsService) {}

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
    character.remainingSkillPoints = this.derivedStatsService.calculateOccupationSkillPoints(character, occupation);
    
    // Ensure credit rating is within the allowed range
    this.ensureCreditRatingInRange(character);
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
      
      return true;
    }
    
    // For adding points (positive points)
    if (points <= 0 || points > character.remainingSkillPoints) return false;
    
    // Points can be allocated to occupational skills or selected skills
    if (!skill.occupationalSkill && !skill.isSelected) return false;
    
    skill.improvementPoints += points;
    skill.total = skill.baseValue + skill.improvementPoints;
    character.remainingSkillPoints -= points;
    
    return true;
  }
}