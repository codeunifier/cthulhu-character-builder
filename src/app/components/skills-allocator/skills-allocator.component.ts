import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Character, Skill } from '../../models';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-skills-allocator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './skills-allocator.component.html',
  styleUrl: './skills-allocator.component.scss'
})
export class SkillsAllocatorComponent implements OnInit {
  character: Character | null = null;
  occupationalSkills: Skill[] = [];
  selectedSkills: Skill[] = [];
  otherSkills: Skill[] = [];
  
  occupationalDisplayedColumns: string[] = ['name', 'baseValue', 'improvementPoints', 'total', 'action'];
  selectedDisplayedColumns: string[] = ['name', 'baseValue', 'improvementPoints', 'total', 'action', 'remove'];
  otherDisplayedColumns: string[] = ['name', 'baseValue', 'total', 'add'];
  
  constructor(
    private characterService: CharacterService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (this.character) {
        this.separateSkills();
      } else {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  separateSkills(): void {
    if (!this.character) return;
    
    this.occupationalSkills = this.character.skills
      .filter(s => s.occupationalSkill && !s.isSelected)
      .sort((a, b) => a.name.localeCompare(b.name));
      
    this.selectedSkills = this.character.skills
      .filter(s => s.isSelected)
      .sort((a, b) => a.name.localeCompare(b.name));
      
    this.otherSkills = this.character.skills
      .filter(s => !s.occupationalSkill && !s.isSelected)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  
  addToPersonalInterests(skill: Skill): void {
    if (!this.character) return;
    
    // Mark the skill as selected in the character's skills array
    skill.isSelected = true;
    
    // Update arrays
    this.selectedSkills.push(skill);
    this.selectedSkills.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    this.otherSkills = this.otherSkills.filter(s => s.name !== skill.name);
    
    this.snackBar.open(`Added ${skill.name} to your selected skills`, 'Close', { duration: 2000 });
  }
  
  removeFromPersonalInterests(skill: Skill): void {
    if (!this.character) return;
    
    // Cannot remove if points have been allocated
    if (skill.improvementPoints > 0) {

      this.snackBar.open(`Cannot remove skill with allocated points`, 'Close', { duration: 3000 });
      return;
    }
    
    // Mark as not selected in the character's skills array
    skill.isSelected = false;
    
    // Update arrays
    const updatedOtherSkills = [...this.otherSkills];
    updatedOtherSkills.push(skill);
    updatedOtherSkills.sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
    this.otherSkills = updatedOtherSkills;
    this.selectedSkills = this.selectedSkills.filter(s => s.name !== skill.name);
    
    this.snackBar.open(`Removed ${skill.name} from your selected skills`, 'Close', { duration: 2000 });
  }

  addPoints(skill: Skill): void {
    if (!this.character) return;
    
    const success = this.characterService.allocateSkillPoints(this.character, skill, 1);
    
    if (!success) {
      this.snackBar.open('Failed to allocate points. Check your remaining points.', 'Close', { duration: 3000 });
    }
  }
  
  removePoints(skill: Skill): void {
    if (!this.character) return;
    
    if (skill.improvementPoints <= 0) {
      this.snackBar.open('No points to remove', 'Close', { duration: 2000 });
      return;
    }
    
    // Remove 1 point at a time for precise control
    const success = this.characterService.allocateSkillPoints(this.character, skill, -1);
    
    if (!success) {
      this.snackBar.open('Failed to remove point', 'Close', { duration: 3000 });
    }
  }

  canContinue(): boolean {
    if (!this.character) return false;
    
    // Check if any occupational or selected skills have points allocated
    return (
      this.occupationalSkills.some(s => s.improvementPoints > 0) || 
      this.selectedSkills.some(s => s.improvementPoints > 0)
    );
  }

  saveAndContinue(): void {
    if (this.canContinue()) {
      this.router.navigate(['/backstory']);
    } else {
      this.snackBar.open('You must allocate at least some points to your occupational skills', 'Close', { duration: 3000 });
    }
  }
}