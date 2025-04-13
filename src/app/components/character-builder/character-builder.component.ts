import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Character } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-character-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './character-builder.component.html',
  styleUrl: './character-builder.component.scss'
})
export class CharacterBuilderComponent implements OnInit {
  character: Character | null = null;

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
    });

    // Check if there's a saved character
    if (!this.character) {
      const savedCharacter = this.characterService.loadCharacter();
      if (!savedCharacter) {
        // Create a new character if none exists
        this.createNewCharacter();
      }
    }
  }

  createNewCharacter(): void {
    this.characterService.createNewCharacter();
    this.router.navigate(['/stats']);
  }

  continueCharacter(): void {
    if (this.character) {
      this.router.navigate(['/stats']);
    }
  }

  saveCharacter(): void {
    if (this.character) {
      this.characterService.saveCharacter(this.character);
    }
  }

  getCharacterProgress(): number {
    if (!this.character) return 0;
    
    let progress = 0;
    
    // Basic info
    if (this.character.name) progress += 10;
    
    // Core stats
    if (this.character.str && this.character.con && this.character.dex && 
        this.character.app && this.character.pow && this.character.int && 
        this.character.edu && this.character.siz) {
      progress += 30;
    }
    
    // Occupation
    if (this.character.occupation) progress += 20;
    
    // Skills
    if (this.character.skills.some(s => s.occupationalSkill && s.improvementPoints > 0)) {
      progress += 20;
    }
    
    // Backstory
    if (this.character.ideology && this.character.significantPerson.who && 
        this.character.meaningfulLocation && this.character.treasuredPossession) {
      progress += 20;
    }
    
    return progress;
  }
}