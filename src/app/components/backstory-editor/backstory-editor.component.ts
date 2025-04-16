import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Character } from '../../models';
import { CharacterService } from '../../services/character.service';
import { DiceService } from '../../services/dice.service';

@Component({
  selector: 'app-backstory-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  templateUrl: './backstory-editor.component.html',
  styleUrl: './backstory-editor.component.scss'
})
export class BackstoryEditorComponent implements OnInit {
  character: Character | null = null;
  
  // Sample backstory options for demonstration
  ideologyOptions = [
    'Activist', 'Anarchist', 'Atheist', 'Bohemian', 'Capitalist', 'Catholic', 
    'Communist', 'Conservative', 'Darwinist', 'Evolutionist', 'Feminist', 'Individualist',
    'Liberal', 'Libertine', 'Protestant', 'Scientist', 'Socialist', 'Spiritualist'
  ];
  
  significantPersons = [
    'Parent', 'Grandparent', 'Sibling', 'Child', 'Partner', 'Friend',
    'Enemy', 'Mentor', 'Colleague', 'Idol', 'Teacher', 'Rival'
  ];
  
  significantReasons = [
    'Love', 'Hate', 'Debt', 'Admiration', 'Envy', 'Loyalty',
    'Family Ties', 'Professional Link', 'Gratitude', 'Fear', 'Obsession', 'Trust'
  ];
  
  meaningfulLocations = [
    'Birthplace', 'Childhood Home', 'School', 'Workplace', 'Library', 'Museum',
    'Church', 'Wilderness', 'University', 'Club', 'Beach', 'Forest', 'City'
  ];
  
  treasuredPossessions = [
    'Book', 'Jewelry', 'Weapon', 'Photograph', 'Letter', 'Scientific Tool',
    'Family Heirloom', 'Musical Instrument', 'Artwork', 'Medal', 'Diary', 'Keepsake'
  ];
  
  traits = [
    'Optimistic', 'Pessimistic', 'Suspicious', 'Trusting', 'Brave', 'Cowardly',
    'Generous', 'Greedy', 'Logical', 'Intuitive', 'Patient', 'Impatient',
    'Forgiving', 'Vengeful', 'Curious', 'Cautious', 'Rational', 'Superstitious'
  ];

  constructor(
    private characterService: CharacterService,
    private router: Router,
    private diceService: DiceService
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (!this.character) {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  randomIdeology(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.ideologyOptions.length) - 1;
    this.character.ideology = this.ideologyOptions[index];
    this.saveCharacter();
  }

  randomSignificantPerson(): void {
    if (!this.character) return;
    const whoIndex = this.diceService.rollDie(this.significantPersons.length) - 1;
    const whyIndex = this.diceService.rollDie(this.significantReasons.length) - 1;
    this.character.significantPerson.who = this.significantPersons[whoIndex];
    this.character.significantPerson.why = this.significantReasons[whyIndex];
    this.saveCharacter();
  }

  randomMeaningfulLocation(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.meaningfulLocations.length) - 1;
    this.character.meaningfulLocation = this.meaningfulLocations[index];
    this.saveCharacter();
  }

  randomTreasuredPossession(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.treasuredPossessions.length) - 1;
    this.character.treasuredPossession = this.treasuredPossessions[index];
    this.saveCharacter();
  }

  randomTrait(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.traits.length) - 1;
    this.character.trait = this.traits[index];
    this.saveCharacter();
  }

  randomizeAll(): void {
    this.randomIdeology();
    this.randomSignificantPerson();
    this.randomMeaningfulLocation();
    this.randomTreasuredPossession();
    this.randomTrait();
  }

  saveCharacter(): void {
    if (this.character) {
      this.characterService.updateCharacter(this.character);
    }
  }

  canContinue(): boolean {
    if (!this.character) return false;
    
    return !!(
      this.character.ideology &&
      this.character.significantPerson.who &&
      this.character.significantPerson.why &&
      this.character.meaningfulLocation &&
      this.character.treasuredPossession &&
      this.character.trait
    );
  }

  saveAndContinue(): void {
    if (this.canContinue()) {
      this.saveCharacter();
      this.router.navigate(['/sheet']);
    }
  }
}