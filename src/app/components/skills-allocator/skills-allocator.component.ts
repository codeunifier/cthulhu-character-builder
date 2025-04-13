import { Component, OnInit } from '@angular/core';
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

import { Character, Skill } from '../../models/character.model';
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
  otherSkills: Skill[] = [];
  pointsToAdd: { [key: string]: number } = {};
  
  occupationalDisplayedColumns: string[] = ['name', 'baseValue', 'improvementPoints', 'total', 'action'];
  otherDisplayedColumns: string[] = ['name', 'baseValue', 'total'];
  
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
        this.initializePointsToAdd();
      } else {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  separateSkills(): void {
    if (!this.character) return;
    
    this.occupationalSkills = this.character.skills.filter(s => s.occupationalSkill);
    this.otherSkills = this.character.skills.filter(s => !s.occupationalSkill);
  }

  initializePointsToAdd(): void {
    this.occupationalSkills.forEach(skill => {
      this.pointsToAdd[skill.name] = 0;
    });
  }

  addPoints(skill: Skill): void {
    if (!this.character) return;
    
    const points = this.pointsToAdd[skill.name];
    if (points <= 0) {
      this.snackBar.open('Please enter a valid number of points', 'Close', { duration: 3000 });
      return;
    }
    
    const success = this.characterService.allocateSkillPoints(this.character, skill, points);
    
    if (success) {
      this.pointsToAdd[skill.name] = 0;
      this.snackBar.open(`Added ${points} points to ${skill.name}`, 'Close', { duration: 2000 });
    } else {
      this.snackBar.open('Failed to allocate points. Check your remaining points.', 'Close', { duration: 3000 });
    }
  }

  canContinue(): boolean {
    if (!this.character) return false;
    
    // Check if any occupational skills have points allocated
    return this.occupationalSkills.some(s => s.improvementPoints > 0);
  }

  saveAndContinue(): void {
    if (this.canContinue()) {
      this.router.navigate(['/backstory']);
    } else {
      this.snackBar.open('You must allocate at least some points to your occupational skills', 'Close', { duration: 3000 });
    }
  }
}