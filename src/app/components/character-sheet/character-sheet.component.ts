import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { Character, Skill } from '../../models';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-character-sheet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTableModule
  ],
  templateUrl: './character-sheet.component.html',
  styleUrl: './character-sheet.component.scss'
})
export class CharacterSheetComponent implements OnInit {
  character: Character | null = null;
  skillsColumn1: Skill[] = [];
  skillsColumn2: Skill[] = [];
  skillsColumn3: Skill[] = [];
  Math = Math; // Make Math available in the template

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (this.character) {
        this.organizeSkills();
      } else {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  organizeSkills(): void {
    if (!this.character || !this.character.skills) return;
    
    // Sort all skills alphabetically
    const sortedSkills = [...this.character.skills].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
    
    // Determine column sizes
    const totalSkills = sortedSkills.length;
    const firstThird = Math.floor(totalSkills / 3);
    const secondThird = Math.floor(2 * totalSkills / 3);
    
    // Slice into three columns
    this.skillsColumn1 = sortedSkills.slice(0, firstThird);
    this.skillsColumn2 = sortedSkills.slice(firstThird, secondThird);
    this.skillsColumn3 = sortedSkills.slice(secondThird);
  }

  printSheet(): void {
    window.print();
  }

  saveCharacter(): void {
    if (this.character) {
      this.characterService.saveCharacter(this.character);
    }
  }

  createNewCharacter(): void {
    this.characterService.createNewCharacter();
    this.router.navigate(['/stats']);
  }
}