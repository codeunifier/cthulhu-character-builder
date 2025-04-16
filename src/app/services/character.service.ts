import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Character, DEFAULT_SKILLS, Occupation, Skill, Stats } from '../models';
import { DiceService } from './dice.service';
import { AgeEffectsService } from './age-effects.service';
import { DerivedStatsService } from './derived-stats.service';
import { OccupationService } from './occupation.service';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private characterSubject = new BehaviorSubject<Character | null>(null);

  constructor(
    private diceService: DiceService,
    private ageEffectsService: AgeEffectsService,
    private derivedStatsService: DerivedStatsService,
    private occupationService: OccupationService
  ) {}

  getCharacter(): Observable<Character | null> {
    return this.characterSubject.asObservable();
  }

  getCurrentCharacter(): Character | null {
    return this.characterSubject.getValue();
  }

  createNewCharacter(): void {
    const stats: Stats = this.diceService.generateBaseStats();
    
    // Create a new character with default values
    const character: Character = {
      ...stats,
      name: '',
      age: 20,
      occupation: null,
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
      // Initialize improvement rolls
      improvementRolls: {},
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
    this.derivedStatsService.updateDerivedAttributes(character);
    this.derivedStatsService.updateDerivedSkills(character);
    
    this.characterSubject.next(character);
  }

  updateCharacter(character: Character): void {
    this.derivedStatsService.updateDerivedAttributes(character);
    this.derivedStatsService.updateDerivedSkills(character);
    this.saveCharacter(character);
    this.characterSubject.next(character);
  }

  applyAgeEffects(character: Character, age: number): void {
    character.age = age;
    this.ageEffectsService.applyAgeEffects(character);
    this.updateCharacter(character);
  }

  // Methods for handling occupation - delegated to OccupationService
  setOccupation(character: Character, occupation: Occupation): void {
    this.occupationService.setOccupation(character, occupation);
    this.updateCharacter(character);
  }
  
  allocateSkillPoints(character: Character, skill: Skill, points: number): boolean {
    const success = this.occupationService.allocateSkillPoints(character, skill, points);
    if (success) {
      this.updateCharacter(character);
    }
    return success;
  }

  // Methods for saving and loading characters
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