import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Character, PendingDeduction, StatModifier, StatModifiers, Stats } from '../../models';
import { CharacterService } from '../../services/character.service';
import { DiceService } from '../../services/dice.service';
import { AgeRangeService, AgeRange } from '../../services/age-range.service';
import { StatCardComponent } from './stat-card/stat-card.component';
import { AgeDeductionInfo, AgeEffectsCardComponent } from "./age-effects-card/age-effects-card.component";

@Component({
  selector: 'app-stats-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatDividerModule,
    MatTooltipModule,
    StatCardComponent,
    AgeEffectsCardComponent
],
  templateUrl: './stats-editor.component.html',
  styleUrl: './stats-editor.component.scss'
})
export class StatsEditorComponent implements OnInit {
  statsForm!: FormGroup;
  character!: Character;
  pendingDeduction: PendingDeduction | null = null;
  
  // Derived attributes
  derivedHP: number = 0;
  derivedDamageBonus: string = 'None';
  derivedBuild: number = 0;
  derivedMovementRate: number = 8;
  
  ageRanges: Array<AgeRange> = [];
  selectedAgeRange?: AgeRange;

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private diceService: DiceService,
    private ageRangeService: AgeRangeService,
    private router: Router
  ) {
    // Get age ranges from service
    this.ageRanges = this.ageRangeService.getAllAgeRanges().map(range => ({
      ...range,
      label: `${range.min}-${range.max} (${range.name})`,
      value: Math.floor((range.min + range.max) / 2) // Average age in the range
    }));
  }

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character!;
      this.initializeAgeRange();
      this.initForm();
    });
  }

  private initializeAgeRange(): void {
    if (!this.selectedAgeRange) {
      this.selectedAgeRange = this.ageRanges.find((range: AgeRange) => {
        return this.character!.age >= range.min && this.character!.age <= range.max;
      });
    }
  }

  initForm(): void {    
    this.statsForm = this.fb.group({
      name: [this.character.name, Validators.required],
      age: [this.character.age, [Validators.required, Validators.min(15), Validators.max(89)]]
      // No longer need form controls for characteristics - they are read-only displays
    });
    
    // Update derived attributes based on initial values
    this.recalculateDerivedAttributes();
    
    // Subscribe to form value changes to update derived attributes
    this.statsForm.valueChanges.subscribe(() => {
      this.recalculateDerivedAttributes();
    });
  }
  
  recalculateDerivedAttributes(): void {    
    // Get age from form, other stats directly from character
    const age = this.statsForm ? Number(this.statsForm.get('age')?.value) || 20 : 20;
    const str = this.character.str;
    const con = this.character.con;
    const siz = this.character.siz;
    const dex = this.character.dex;
    
    // Calculate Hit Points
    this.derivedHP = Math.floor((con + siz) / 10);
    
    // Calculate Damage Bonus and Build
    const sum = str + siz;
    if (sum >= 2 && sum <= 64) {
      this.derivedDamageBonus = "-2";
      this.derivedBuild = -2;
    } 
    else if (sum >= 65 && sum <= 84) {
      this.derivedDamageBonus = "-1";
      this.derivedBuild = -1;
    } 
    else if (sum >= 85 && sum <= 124) {
      this.derivedDamageBonus = "None";
      this.derivedBuild = 0;
    } 
    else if (sum >= 125 && sum <= 164) {
      this.derivedDamageBonus = "+1d4";
      this.derivedBuild = 1;
    } 
    else if (sum >= 165 && sum <= 204) {
      this.derivedDamageBonus = "+1d6";
      this.derivedBuild = 2;
    } 
    else if (sum >= 205 && sum <= 284) {
      this.derivedDamageBonus = "+2d6";
      this.derivedBuild = 3;
    } 
    else if (sum >= 285 && sum <= 364) {
      this.derivedDamageBonus = "+3d6";
      this.derivedBuild = 4;
    } 
    else if (sum >= 365 && sum <= 444) {
      this.derivedDamageBonus = "+4d6";
      this.derivedBuild = 5;
    } 
    else if (sum >= 445) {
      // Calculate additional dice for very high values
      const additionalDice = Math.floor((sum - 445) / 80) + 5;
      this.derivedDamageBonus = `+${additionalDice}d6`;
      this.derivedBuild = additionalDice;
    }
    
    // Calculate Movement Rate
    if (str < siz && dex < siz) {
      this.derivedMovementRate = 7;
    } 
    else if ((str >= siz || dex >= siz) || 
             (str === siz && dex === siz)) {
      this.derivedMovementRate = 8;
    } 
    else if (str > siz && dex > siz) {
      this.derivedMovementRate = 9;
    }
    
    // Apply age modifiers to movement rate
    const movementPenalty = this.ageRangeService.getMovementPenalty(age);
    this.derivedMovementRate -= movementPenalty;
    
    // Ensure MOV doesn't go below 1
    if (this.derivedMovementRate < 1) {
      this.derivedMovementRate = 1;
    }
  }

  rollAllStats(): void {    
    // Get new base stats
    const stats = this.diceService.generateBaseStats();
    
    // Save as base stats
    this.character.baseStats = { ...stats };
    
    // Update actual stats with base values first
    this.character.str = stats.str;
    this.character.con = stats.con;
    this.character.siz = stats.siz;
    this.character.dex = stats.dex;
    this.character.app = stats.app;
    this.character.int = stats.int;
    this.character.pow = stats.pow;
    this.character.edu = stats.edu;
    this.character.luck = stats.luck;
    
    // Clear any existing modifiers
    if (this.character.statModifiers) {
      Object.keys(this.character.statModifiers).forEach(stat => {
        if (this.character && this.character.statModifiers) {
          this.character.statModifiers[stat as keyof StatModifiers] = [];
        }
      });
    }
    
    // Apply age effects to add appropriate modifiers
    this.characterService.applyAgeEffects(this.character, this.character.age);
    
    // Recalculate derived attributes
    this.recalculateDerivedAttributes();
  }

  onAgeRangeChange(event: any): void {
    const ageRangeId: number = parseInt(event.target.value);
    this.selectedAgeRange = this.ageRanges.find((range) => range.id === ageRangeId)!;
    
    if (this.selectedAgeRange) {
      const newAge = this.getRandomNumber(this.selectedAgeRange.min, this.selectedAgeRange.max);
      this.statsForm.get('age')?.setValue(newAge);
      this.characterService.applyAgeEffects(this.character!, newAge);
    }
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateCharacterFromForm(): void {
    if (!this.statsForm.valid) return;
    
    const formValues = this.statsForm.value;
    
    // Only update name and age from form
    this.character.name = formValues.name;
    this.character.age = formValues.age;
    
    // Update derived attributes directly from our calculated values
    this.character.hp = this.derivedHP;
    this.character.damageBonus = this.derivedDamageBonus;
    this.character.build = this.derivedBuild;
    this.character.mov = this.derivedMovementRate;
    
    this.characterService.updateCharacter(this.character);
  }

  saveAndContinue(): void {
    if (this.statsForm.valid) {
      this.updateCharacterFromForm();
      this.router.navigate(['/occupation']);
    }
  }

  onAgeDeductionChange(ageDeductionInfo: AgeDeductionInfo): void {
    this.recalculateDerivedAttributes();
  }

  getCurrentStatValue(stat: string): number {
    return this.character[stat as keyof Character] as number;
  }

  onStatRoll(event: { stat: keyof Stats, value: number }): void {
    // Update the base stat
    this.character.baseStats[event.stat] = event.value;

    // Apply the new base value
    this.character[event.stat] = event.value;

    // Reapply any modifiers
    if (this.character.statModifiers && this.character.statModifiers[event.stat]) {
      this.character.statModifiers[event.stat]?.forEach((mod: StatModifier) => {
        if (this.character?.[event.stat]) {
          this.character[event.stat] += mod.value;
        }
      });
    }
    
    // Recalculate derived attributes
    this.recalculateDerivedAttributes();
    
    // Update character in service
    this.characterService.updateCharacter(this.character);
  }
}