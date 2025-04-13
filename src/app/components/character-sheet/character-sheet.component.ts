import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { Character, Skill } from '../../models/character.model';
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
  combatSkills: Skill[] = [];
  socialSkills: Skill[] = [];
  knowledgeSkills: Skill[] = [];
  technicalSkills: Skill[] = [];
  
  displayedColumns: string[] = ['name', 'total', 'checkbox'];
  Math = Math; // Make Math available in the template

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (this.character) {
        this.categorizeSkills();
      } else {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  categorizeSkills(): void {
    if (!this.character) return;
    
    // Combat Skills
    this.combatSkills = this.character.skills.filter(skill => 
      skill.name.includes('Fighting') || 
      skill.name.includes('Firearms') || 
      skill.name === 'Dodge' ||
      skill.name === 'Throw'
    );
    
    // Social Skills
    this.socialSkills = this.character.skills.filter(skill => 
      skill.name === 'Charm' ||
      skill.name === 'Fast Talk' ||
      skill.name === 'Intimidate' ||
      skill.name === 'Persuade' ||
      skill.name === 'Psychology' ||
      skill.name === 'Credit Rating'
    );
    
    // Knowledge Skills
    this.knowledgeSkills = this.character.skills.filter(skill => 
      skill.name.includes('Language') ||
      skill.name === 'History' ||
      skill.name === 'Library Use' ||
      skill.name === 'Occult' ||
      skill.name === 'Science' ||
      skill.name === 'Medicine' ||
      skill.name === 'Cthulhu Mythos' ||
      skill.name === 'Anthropology' ||
      skill.name === 'Archaeology' ||
      skill.name === 'Law'
    );
    
    // Let's put the rest in technical skills
    const existingSkills = [...this.combatSkills, ...this.socialSkills, ...this.knowledgeSkills].map(s => s.name);
    this.technicalSkills = this.character.skills.filter(skill => !existingSkills.includes(skill.name));
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