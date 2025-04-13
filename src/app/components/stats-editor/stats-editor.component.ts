import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';

import { Character, PendingDeduction } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';
import { DiceService } from '../../services/dice.service';

@Component({
  selector: 'app-stats-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSliderModule,
    MatDividerModule
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
  
  ageRanges = [
    { label: '15-19 (Young)', value: 17 },
    { label: '20-39 (Adult)', value: 30 },
    { label: '40-49 (Middle-aged)', value: 45 },
    { label: '50-59 (Middle-aged)', value: 55 },
    { label: '60-69 (Older)', value: 65 },
    { label: '70-79 (Old)', value: 75 },
    { label: '80-89 (Very Old)', value: 85 }
  ];

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
        this.initForm();
      } else {
        this.router.navigate(['/character-builder']);
      }
    });
    
    this.pendingDeduction = this.characterService.getPendingDeduction();
  }

  initForm(): void {
    if (!this.character) return;
    
    this.statsForm = this.fb.group({
      name: [this.character.name, Validators.required],
      age: [this.character.age, [Validators.required, Validators.min(15), Validators.max(89)]],
      str: [this.character.str, [Validators.required, Validators.min(15), Validators.max(90)]],
      con: [this.character.con, [Validators.required, Validators.min(15), Validators.max(90)]],
      siz: [this.character.siz, [Validators.required, Validators.min(40), Validators.max(90)]],
      dex: [this.character.dex, [Validators.required, Validators.min(15), Validators.max(90)]],
      app: [this.character.app, [Validators.required, Validators.min(15), Validators.max(90)]],
      int: [this.character.int, [Validators.required, Validators.min(40), Validators.max(90)]],
      pow: [this.character.pow, [Validators.required, Validators.min(15), Validators.max(90)]],
      edu: [this.character.edu, [Validators.required, Validators.min(40), Validators.max(90)]],
      luck: [this.character.luck, [Validators.required, Validators.min(15), Validators.max(90)]]
    });
    
    // Update derived attributes based on initial values
    this.recalculateDerivedAttributes();
    
    // Subscribe to form value changes to update derived attributes
    this.statsForm.valueChanges.subscribe(() => {
      this.recalculateDerivedAttributes();
    });
  }
  
  recalculateDerivedAttributes(): void {
    if (!this.statsForm) return;
    
    const formValues = this.statsForm.value;
    
    // Ensure we have valid numeric values to work with
    const str = Number(formValues.str) || 0;
    const con = Number(formValues.con) || 0;
    const siz = Number(formValues.siz) || 0;
    const dex = Number(formValues.dex) || 0;
    const age = Number(formValues.age) || 20;
    
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

  rollStat(statName: string): void {
    if (!this.character || !this.statsForm) return;
    
    let value: number;
    if (['siz', 'int', 'edu'].includes(statName)) {
      value = (this.diceService.roll2d6() + 6) * 5;
    } else {
      value = this.diceService.roll3d6() * 5;
    }
    
    this.statsForm.get(statName)?.setValue(value);
    // Note: No need to explicitly call recalculateDerivedAttributes() here
    // as the form valueChanges subscription will handle that automatically
  }

  rollAllStats(): void {
    if (!this.character) return;
    
    const stats = this.diceService.generateBaseStats();
    
    this.statsForm.patchValue({
      str: stats.str,
      con: stats.con,
      siz: stats.siz,
      dex: stats.dex,
      app: stats.app,
      int: stats.int,
      pow: stats.pow,
      edu: stats.edu,
      luck: stats.luck
    });
  }

  onAgeChange(event: any): void {
    const selectedAge = event.target.value;
    if (!this.character || !selectedAge) return;
    
    this.statsForm.get('age')?.setValue(selectedAge);
    this.applyAgeEffects(selectedAge);
    
    // Ensure derived attributes are recalculated after age effects
    this.recalculateDerivedAttributes();
  }

  applyAgeEffects(age: number): void {
    if (!this.character) return;
    
    // Update character with current form values
    this.updateCharacterFromForm();
    
    // Apply age effects
    this.characterService.applyAgeEffects(this.character, age);
    
    // Check for pending deductions
    this.pendingDeduction = this.characterService.getPendingDeduction();
    
    // Update form with the new values
    this.statsForm.patchValue({
      str: this.character.str,
      con: this.character.con,
      siz: this.character.siz,
      dex: this.character.dex,
      app: this.character.app,
      int: this.character.int,
      pow: this.character.pow,
      edu: this.character.edu,
      luck: this.character.luck
    });
  }
  
  applyStatDeduction(stat: string): void {
    if (!this.character) return;
    
    this.characterService.applyStatDeduction(this.character, stat);
    this.pendingDeduction = null;
    
    // Update form with the new values
    this.statsForm.get(stat)?.setValue(this.character[stat as keyof Character]);
    
    // Recalculate derived attributes
    this.recalculateDerivedAttributes();
  }

  updateCharacterFromForm(): void {
    if (!this.character || !this.statsForm.valid) return;
    
    const formValues = this.statsForm.value;
    
    this.character.name = formValues.name;
    this.character.age = formValues.age;
    this.character.str = formValues.str;
    this.character.con = formValues.con;
    this.character.siz = formValues.siz;
    this.character.dex = formValues.dex;
    this.character.app = formValues.app;
    this.character.int = formValues.int;
    this.character.pow = formValues.pow;
    this.character.edu = formValues.edu;
    this.character.luck = formValues.luck;
    
    // Also update derived attributes directly from our calculated values
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
}