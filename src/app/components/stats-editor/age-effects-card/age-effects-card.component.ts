import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, output, OutputEmitterRef, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Character } from '../../../models';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../../services/character.service';
import { AgeEffectsService } from '../../../services/age-effects.service';
import { RollService } from '../../../services/roll.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { AgeRange } from '../../../services/age-range.service';

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
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './age-effects-card.component.html',
  styleUrl: './age-effects-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgeEffectsCardComponent implements OnInit {
  @Input({ required: true }) ageRange?: AgeRange | undefined;

  character!: Character;

  ageDeductionChange: OutputEmitterRef<AgeDeductionInfo> = output<AgeDeductionInfo>();

  deductionAmounts: { [key: string]: number } = {};
  ageDeductionForm?: FormGroup;
  
  // Improvement check data
  improvementRolls: { check: number; target: number; success: boolean; improvement?: number }[] = [];
  
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
    
    // Sum up all the improvement check modifiers
    const improvementModifiers = this.character.statModifiers.edu.filter(mod => mod.source === 'Improvement Check');
    if (improvementModifiers.length === 0) return 0;
    
    return improvementModifiers.reduce((sum, mod) => sum + mod.value, 0);
  }
  
  // Returns the number of improvement checks based on age range
  get improvementChecksCount(): number {
    if (!this.ageRange) return 0;
    
    switch (this.ageRange.id) {
      case 1: return 0; // Young (15-19)
      case 2: return 1; // Adult (20-39)
      case 3: return 2; // Middle-aged (40-49)
      case 4: return 3; // Mature (50-59)
      case 5: case 6: case 7: return 4; // Elderly (60+)
      default: return 0;
    }
  }

  ageDeductionInfo: AgeDeductionInfo = {
    totalPoints: 0,
    stats: [],
    usedPoints: {}
  };

  constructor(
    private characterService: CharacterService, 
    private ageEffectsService: AgeEffectsService,
    private rollService: RollService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.characterService.getCharacter().subscribe((character: Character | null) => {
      this.character = character!;
      this.loadImprovementRolls();
    });
  }
  
  // Load improvement roll data from the character service
  loadImprovementRolls(): void {
    if (this.ageRange?.id === 1) {
      this.improvementRolls = [];
      return;
    }
    
    this.improvementRolls = this.rollService.getImprovementRolls(this.character, 'edu');
    
    // If no rolls exist but we should have improvement checks, trigger a new roll
    if (this.improvementRolls.length === 0 && this.improvementChecksCount > 0) {
      const result = this.rollService.makeImprovementCheck(this.character, 'edu', this.improvementChecksCount);
      this.improvementRolls = result.rolls;
      this.characterService.updateCharacter(this.character);
    }

    this.cdr.detectChanges();
  }
  
  // Reroll all improvement checks
  rerollAllImprovementChecks(): void {
    if (!this.character) return;
    
    this.rollService.rerollAllImprovementChecks(this.character, 'edu');
    
    // Reload rolls after rerolling
    this.loadImprovementRolls();
    
    // Update the character
    this.characterService.updateCharacter(this.character);
  }

  private initForm(): void {
    // Get age deduction info from age effects service
    this.ageDeductionInfo = this.ageEffectsService.getAgeDeductionInfo();

    // Create form controls for age deductions
    const deductionControls: { [key: string]: any } = {};
    this.ageDeductionInfo.stats.forEach(stat => {
      const currentDeduction = this.ageDeductionInfo.usedPoints[stat] || 0;
      const remainingPoints = this.ageEffectsService.getAgeDeductionRemainingPoints();
      
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
    return this.ageEffectsService.getAgeDeductionRemainingPoints();
  }

  getDeductionPerStat(stat: string): number {
    return this.ageEffectsService.getAgeDeductionUsedForStat(stat);
  }

  onAgeDeductionChange(stat: string): void {
    if (!this.character || !this.ageDeductionForm) return;
    
    // Get current value from form
    const currentValue = this.ageDeductionForm.get(stat)?.value;
    if (currentValue === undefined || currentValue === null) return;
    
    // Get previously applied deduction for this stat
    const previousDeduction = this.ageEffectsService.getAgeDeductionUsedForStat(stat);
    
    // No change needed if the values are the same
    if (previousDeduction === currentValue) return;
    
    // Calculate the difference to apply
    const difference = currentValue - previousDeduction;
    
    // Check if we have enough points to apply this change
    if (difference > this.ageEffectsService.getAgeDeductionRemainingPoints()) {
      // Reset to previous value if not enough points
      this.ageDeductionForm.get(stat)?.setValue(previousDeduction);
      return;
    }
    
    // Apply the deduction difference
    this.ageEffectsService.applyStatDeduction(this.character, stat, difference);
    
    // Update our local copy of the age deduction info
    this.ageDeductionInfo = this.ageEffectsService.getAgeDeductionInfo();
    
    // Update form max values based on remaining points
    const remainingPoints = this.ageEffectsService.getAgeDeductionRemainingPoints();
    this.ageDeductionInfo.stats.forEach(s => {
      const currentUsed = this.ageEffectsService.getAgeDeductionUsedForStat(s);
      this.ageDeductionForm?.get(s)?.setValidators([
        Validators.min(0), 
        Validators.max(remainingPoints + currentUsed)
      ]);
      this.ageDeductionForm?.get(s)?.updateValueAndValidity();
    });
    
    // Recalculate derived attributes and update character
    this.characterService.updateCharacter(this.character);
    
    // Emit change for parent component
    this.ageDeductionChange.emit(this.ageDeductionInfo);
  }
}
