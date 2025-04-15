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

import { Character, PendingDeduction, StatModifier, StatModifiers, Stats } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { DiceService } from '../../services/dice.service';
import { StatCardComponent } from './stat-card/stat-card.component';
import { AgeDeductionInfo, AgeEffectsCardComponent } from "./age-effects-card/age-effects-card.component";

export interface AgeRange {
  id: number;
  label: string;
  value: number;
  min: number;
  max: number;
}

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
  character: Character | null = null;
  pendingDeduction: PendingDeduction | null = null;
  
  // Derived attributes
  derivedHP: number = 0;
  derivedDamageBonus: string = 'None';
  derivedBuild: number = 0;
  derivedMovementRate: number = 8;
  
  ageRanges: Array<AgeRange> = [
    { id: 1, label: '15-19 (Young)', value: 17, min: 15, max: 19 },
    { id: 2, label: '20-39 (Adult)', value: 30, min: 20, max: 39 },
    { id: 3, label: '40-49 (Middle-aged)', value: 45, min: 40, max: 49 },
    { id: 4, label: '50-59 (Middle-aged)', value: 55, min: 50, max: 59 },
    { id: 5, label: '60-69 (Older)', value: 65, min: 60, max: 69 },
    { id: 6, label: '70-79 (Old)', value: 75, min: 70, max: 79 },
    { id: 7, label: '80-89 (Very Old)', value: 85, min: 80, max: 89 },
  ];
  selectedAgeRange?: AgeRange;

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private diceService: DiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (this.character) {
        this.initializeAgeRange();
        this.initForm();
      } else {
        this.router.navigate(['/character-builder']);
      }
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
    if (!this.character) return;
    
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
    if (!this.character) return;
    
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
    if (age >= 40 && age <= 49) {
      this.derivedMovementRate -= 1;
    } 
    else if (age >= 50 && age <= 59) {
      this.derivedMovementRate -= 2;
    } 
    else if (age >= 60 && age <= 69) {
      this.derivedMovementRate -= 3;
    } 
    else if (age >= 70 && age <= 79) {
      this.derivedMovementRate -= 4;
    } 
    else if (age >= 80) {
      this.derivedMovementRate -= 5;
    }
    
    // Ensure MOV doesn't go below 1
    if (this.derivedMovementRate < 1) {
      this.derivedMovementRate = 1;
    }
  }

  rollAllStats(): void {
    if (!this.character) return;
    
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
      this.statsForm.get('age')?.setValue(this.selectedAgeRange.value);
    }

    this.characterService.applyAgeEffects(this.character!, this.selectedAgeRange!.value);
  }

  updateCharacterFromForm(): void {
    if (!this.character || !this.statsForm.valid) return;
    
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
    return this.character?.[stat as keyof Character] as number;
  }

  onStatRoll(event: { stat: keyof Stats, value: number }): void {
    if (!this.character) return;

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