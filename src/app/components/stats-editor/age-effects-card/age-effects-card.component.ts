import { Component, Input, OnChanges, OnInit, output, OutputEmitterRef, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Character } from '../../../models';
import { AgeRange } from '../stats-editor.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../services/character.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface AgeDeductionInfo {
  totalPoints: number;
  stats: string[];
  usedPoints: {[stat: string]: number};
}

@Component({
  selector: 'app-age-effects-card',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './age-effects-card.component.html',
  styleUrl: './age-effects-card.component.scss'
})
export class AgeEffectsCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) character!: Character;
  @Input({ required: true }) ageRange?: AgeRange | undefined;

  ageDeductionChange: OutputEmitterRef<AgeDeductionInfo> = output<AgeDeductionInfo>();

  deductionAmounts: { [key: string]: number } = {};
  ageDeductionForm?: FormGroup;

  get eduImprovementsCount(): number {
    if (!this.character || !this.character.statModifiers || !this.character.statModifiers.edu) {
      return 0;
    }
    
    // Check if the EDU stat has any modifiers with source "Improvement Check"
    return this.character.statModifiers.edu.filter(modifier => modifier.source === 'Improvement Check').length;
  }

  get eduImprovementAmount(): number {
    if (!this.character || !this.character.statModifiers || !this.character.statModifiers.edu) {
      return 0;
    }
    
    // Check if the EDU stat has any modifiers with source "Improvement Check"
    return this.character.statModifiers.edu.map((statMod) => statMod.value).reduce((prev, current, idx) => prev + current);
  }

  get isYoung(): boolean {
    return this.ageRange?.id === 1;
  }

  get isAdult(): boolean {
    return this.ageRange?.id === 2;
  }

  get isMiddleAged(): boolean {
    return this.ageRange?.id === 3;
  }

  ageDeductionInfo: AgeDeductionInfo = {
    totalPoints: 0,
    stats: [],
    usedPoints: {}
  };

  constructor(private characterService: CharacterService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ageRange']) {
      this.initForm();
    }
  }

  private initForm(): void {
    // Get age deduction info from character service
    this.ageDeductionInfo = this.characterService.getAgeDeductionInfo();

    // Create form controls for age deductions
    const deductionControls: { [key: string]: any } = {};
    this.ageDeductionInfo.stats.forEach(stat => {
      const currentDeduction = this.ageDeductionInfo.usedPoints[stat] || 0;
      const remainingPoints = this.characterService.getAgeDeductionRemainingPoints();
      
      deductionControls[stat] = [currentDeduction, [
        Validators.min(0), 
        Validators.max(remainingPoints + currentDeduction)
      ]];
      this.deductionAmounts[stat] = currentDeduction;
    });
    
    this.ageDeductionForm = this.fb.group(deductionControls);
    
    // Subscribe to form value changes to update character
    this.ageDeductionForm.valueChanges.subscribe(values => {
      // This is intentionally empty as we handle changes via the onAgeDeductionChange method
      // but we need the subscription to ensure the form is reactive
    });
  }

  getRemainingDeductionPoints(): number {
    return this.characterService.getAgeDeductionRemainingPoints();
  }

  getDeductionPerStat(stat: string): number {
    return this.characterService.getAgeDeductionUsedForStat(stat);
  }

  onAgeDeductionChange(stat: string): void {
    if (!this.character || !this.ageDeductionForm) return;
    
    // Get current value from form
    const currentValue = this.ageDeductionForm.get(stat)?.value;
    if (currentValue === undefined || currentValue === null) return;
    
    // Get previously applied deduction for this stat
    const previousDeduction = this.characterService.getAgeDeductionUsedForStat(stat);
    
    // No change needed if the values are the same
    if (previousDeduction === currentValue) return;
    
    // Calculate the difference to apply
    const difference = currentValue - previousDeduction;
    
    // Check if we have enough points to apply this change
    if (difference > this.characterService.getAgeDeductionRemainingPoints()) {
      // Reset to previous value if not enough points
      this.ageDeductionForm.get(stat)?.setValue(previousDeduction);
      return;
    }
    
    // Apply the deduction difference
    this.characterService.applyStatDeduction(this.character, stat, difference);
    
    // Update our local copy of the age deduction info
    this.ageDeductionInfo = this.characterService.getAgeDeductionInfo();
    
    // Update form max values based on remaining points
    const remainingPoints = this.characterService.getAgeDeductionRemainingPoints();
    this.ageDeductionInfo.stats.forEach(s => {
      const currentUsed = this.characterService.getAgeDeductionUsedForStat(s);
      this.ageDeductionForm?.get(s)?.setValidators([
        Validators.min(0), 
        Validators.max(remainingPoints + currentUsed)
      ]);
      this.ageDeductionForm?.get(s)?.updateValueAndValidity();
    });
    
    // Recalculate derived attributes
    this.ageDeductionChange.emit(this.ageDeductionInfo);
  }
}
