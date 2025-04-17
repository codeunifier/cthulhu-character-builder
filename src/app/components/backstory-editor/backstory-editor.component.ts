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
import { 
  IDEOLOGY_BELIEFS, 
  SIGNIFICANT_PEOPLE, 
  MEANINGFUL_LOCATIONS, 
  TREASURED_POSSESSIONS, 
  TRAITS 
} from '../../models/constants';

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
  character!: Character;
  
  // Full data objects from JSON
  ideologyData = IDEOLOGY_BELIEFS;
  significantPersonsData = SIGNIFICANT_PEOPLE.who;
  significantReasonsData = SIGNIFICANT_PEOPLE.why;
  meaningfulLocationsData = MEANINGFUL_LOCATIONS;
  treasuredPossessionsData = TREASURED_POSSESSIONS;
  traitsData = TRAITS;
  
  // Ideology options from JSON (names only for dropdowns)
  ideologyOptions = this.ideologyData.map(ideology => ideology.name);
  
  // Significant persons from JSON (names only for dropdowns)
  significantPersons = this.significantPersonsData.map(person => person.name);
  
  // Significant reasons from JSON (names only for dropdowns)
  significantReasons = this.significantReasonsData.map(reason => reason.name);
  
  // Meaningful locations from JSON (names only for dropdowns)
  meaningfulLocations = this.meaningfulLocationsData.map(location => location.name);
  
  // Treasured possessions from JSON (names only for dropdowns)
  treasuredPossessions = this.treasuredPossessionsData.map(possession => possession.name);
  
  // Traits from JSON (names only for dropdowns)
  traits = this.traitsData.map(trait => trait.name);
  
  // Selected item descriptions
  selectedIdeologyDescription: string | null = null;
  selectedSignificantPersonDescription: string | null = null;
  selectedSignificantReasonDescription: string | null = null;
  selectedMeaningfulLocationDescription: string | null = null;
  selectedTreasuredPossessionDescription: string | null = null;
  selectedTraitDescription: string | null = null;

  constructor(
    private characterService: CharacterService,
    private router: Router,
    private diceService: DiceService
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character!;
      
      // Set initial descriptions based on character's existing values
      this.updateAllDescriptions();
    });
  }
  
  // Update all descriptions based on current selections
  updateAllDescriptions(): void {
    if (!this.character) return;
    
    this.updateIdeologyDescription();
    this.updateSignificantPersonDescription();
    this.updateSignificantReasonDescription();
    this.updateMeaningfulLocationDescription();
    this.updateTreasuredPossessionDescription();
    this.updateTraitDescription();
  }
  
  // Methods to update individual descriptions
  updateIdeologyDescription(): void {
    if (!this.character.ideology) {
      this.selectedIdeologyDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.ideologyDescription) {
      this.selectedIdeologyDescription = this.character.ideologyDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedIdeology = this.ideologyData.find(item => item.name === this.character.ideology);
    this.selectedIdeologyDescription = selectedIdeology?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedIdeologyDescription) {
      this.character.ideologyDescription = this.selectedIdeologyDescription;
    }
  }
  
  updateSignificantPersonDescription(): void {
    if (!this.character.significantPerson?.who) {
      this.selectedSignificantPersonDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.significantPerson.whoDescription) {
      this.selectedSignificantPersonDescription = this.character.significantPerson.whoDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedPerson = this.significantPersonsData.find(item => item.name === this.character.significantPerson.who);
    this.selectedSignificantPersonDescription = selectedPerson?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedSignificantPersonDescription) {
      this.character.significantPerson.whoDescription = this.selectedSignificantPersonDescription;
    }
  }
  
  updateSignificantReasonDescription(): void {
    if (!this.character.significantPerson?.why) {
      this.selectedSignificantReasonDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.significantPerson.whyDescription) {
      this.selectedSignificantReasonDescription = this.character.significantPerson.whyDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedReason = this.significantReasonsData.find(item => item.name === this.character.significantPerson.why);
    this.selectedSignificantReasonDescription = selectedReason?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedSignificantReasonDescription) {
      this.character.significantPerson.whyDescription = this.selectedSignificantReasonDescription;
    }
  }
  
  updateMeaningfulLocationDescription(): void {
    if (!this.character.meaningfulLocation) {
      this.selectedMeaningfulLocationDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.meaningfulLocationDescription) {
      this.selectedMeaningfulLocationDescription = this.character.meaningfulLocationDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedLocation = this.meaningfulLocationsData.find(item => item.name === this.character.meaningfulLocation);
    this.selectedMeaningfulLocationDescription = selectedLocation?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedMeaningfulLocationDescription) {
      this.character.meaningfulLocationDescription = this.selectedMeaningfulLocationDescription;
    }
  }
  
  updateTreasuredPossessionDescription(): void {
    if (!this.character.treasuredPossession) {
      this.selectedTreasuredPossessionDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.treasuredPossessionDescription) {
      this.selectedTreasuredPossessionDescription = this.character.treasuredPossessionDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedPossession = this.treasuredPossessionsData.find(item => item.name === this.character.treasuredPossession);
    this.selectedTreasuredPossessionDescription = selectedPossession?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedTreasuredPossessionDescription) {
      this.character.treasuredPossessionDescription = this.selectedTreasuredPossessionDescription;
    }
  }
  
  updateTraitDescription(): void {
    if (!this.character.trait) {
      this.selectedTraitDescription = null;
      return;
    }
    
    // Check if the character already has a custom description
    if (this.character.traitDescription) {
      this.selectedTraitDescription = this.character.traitDescription;
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedTrait = this.traitsData.find(item => item.name === this.character.trait);
    this.selectedTraitDescription = selectedTrait?.description || null;
    
    // If a predefined description was found, store it in the character
    if (this.selectedTraitDescription) {
      this.character.traitDescription = this.selectedTraitDescription;
    }
  }
  
  // Methods to update custom descriptions
  updateCustomIdeologyDescription(description: string): void {
    this.character.ideologyDescription = description;
    this.selectedIdeologyDescription = description;
    this.saveCharacter();
  }
  
  updateCustomSignificantPersonDescription(description: string): void {
    this.character.significantPerson.whoDescription = description;
    this.selectedSignificantPersonDescription = description;
    this.saveCharacter();
  }
  
  updateCustomSignificantReasonDescription(description: string): void {
    this.character.significantPerson.whyDescription = description;
    this.selectedSignificantReasonDescription = description;
    this.saveCharacter();
  }
  
  updateCustomMeaningfulLocationDescription(description: string): void {
    this.character.meaningfulLocationDescription = description;
    this.selectedMeaningfulLocationDescription = description;
    this.saveCharacter();
  }
  
  updateCustomTreasuredPossessionDescription(description: string): void {
    this.character.treasuredPossessionDescription = description;
    this.selectedTreasuredPossessionDescription = description;
    this.saveCharacter();
  }
  
  updateCustomTraitDescription(description: string): void {
    this.character.traitDescription = description;
    this.selectedTraitDescription = description;
    this.saveCharacter();
  }

  randomIdeology(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.ideologyOptions.length) - 1;
    this.character.ideology = this.ideologyOptions[index];
    
    // Clear any custom description
    this.character.ideologyDescription = undefined;
    
    // Update with predefined description
    this.updateIdeologyDescription();
    this.saveCharacter();
  }

  randomSignificantPerson(): void {
    if (!this.character) return;
    const whoIndex = this.diceService.rollDie(this.significantPersons.length) - 1;
    const whyIndex = this.diceService.rollDie(this.significantReasons.length) - 1;
    
    this.character.significantPerson.who = this.significantPersons[whoIndex];
    this.character.significantPerson.why = this.significantReasons[whyIndex];
    
    // Clear any custom descriptions
    this.character.significantPerson.whoDescription = undefined;
    this.character.significantPerson.whyDescription = undefined;
    
    // Update with predefined descriptions
    this.updateSignificantPersonDescription();
    this.updateSignificantReasonDescription();
    this.saveCharacter();
  }

  randomMeaningfulLocation(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.meaningfulLocations.length) - 1;
    this.character.meaningfulLocation = this.meaningfulLocations[index];
    
    // Clear any custom description
    this.character.meaningfulLocationDescription = undefined;
    
    // Update with predefined description
    this.updateMeaningfulLocationDescription();
    this.saveCharacter();
  }

  randomTreasuredPossession(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.treasuredPossessions.length) - 1;
    this.character.treasuredPossession = this.treasuredPossessions[index];
    
    // Clear any custom description
    this.character.treasuredPossessionDescription = undefined;
    
    // Update with predefined description
    this.updateTreasuredPossessionDescription();
    this.saveCharacter();
  }

  randomTrait(): void {
    if (!this.character) return;
    const index = this.diceService.rollDie(this.traits.length) - 1;
    this.character.trait = this.traits[index];
    
    // Clear any custom description
    this.character.traitDescription = undefined;
    
    // Update with predefined description
    this.updateTraitDescription();
    this.saveCharacter();
  }

  randomizeAll(): void {
    this.randomIdeology();
    this.randomSignificantPerson();
    this.randomMeaningfulLocation();
    this.randomTreasuredPossession();
    this.randomTrait();
  }
  
  // Option selection handlers
  onIdeologySelected(value: string): void {
    // Find the full object with description
    const selectedIdeology = this.ideologyData.find(item => item.name === value);
    if (selectedIdeology && selectedIdeology.description) {
      // Update the character's description
      this.character.ideologyDescription = selectedIdeology.description;
      this.selectedIdeologyDescription = selectedIdeology.description;
      this.saveCharacter();
    }
  }
  
  onSignificantPersonSelected(value: string): void {
    // Find the full object with description
    const selectedPerson = this.significantPersonsData.find(item => item.name === value);
    if (selectedPerson && selectedPerson.description) {
      // Update the character's description
      this.character.significantPerson.whoDescription = selectedPerson.description;
      this.selectedSignificantPersonDescription = selectedPerson.description;
      this.saveCharacter();
    }
  }
  
  onSignificantReasonSelected(value: string): void {
    // Find the full object with description
    const selectedReason = this.significantReasonsData.find(item => item.name === value);
    if (selectedReason && selectedReason.description) {
      // Update the character's description
      this.character.significantPerson.whyDescription = selectedReason.description;
      this.selectedSignificantReasonDescription = selectedReason.description;
      this.saveCharacter();
    }
  }
  
  onMeaningfulLocationSelected(value: string): void {
    // Find the full object with description
    const selectedLocation = this.meaningfulLocationsData.find(item => item.name === value);
    if (selectedLocation && selectedLocation.description) {
      // Update the character's description
      this.character.meaningfulLocationDescription = selectedLocation.description;
      this.selectedMeaningfulLocationDescription = selectedLocation.description;
      this.saveCharacter();
    }
  }
  
  onTreasuredPossessionSelected(value: string): void {
    // Find the full object with description
    const selectedPossession = this.treasuredPossessionsData.find(item => item.name === value);
    if (selectedPossession && selectedPossession.description) {
      // Update the character's description
      this.character.treasuredPossessionDescription = selectedPossession.description;
      this.selectedTreasuredPossessionDescription = selectedPossession.description;
      this.saveCharacter();
    }
  }
  
  onTraitSelected(value: string): void {
    // Find the full object with description
    const selectedTrait = this.traitsData.find(item => item.name === value);
    if (selectedTrait && selectedTrait.description) {
      // Update the character's description
      this.character.traitDescription = selectedTrait.description;
      this.selectedTraitDescription = selectedTrait.description;
      this.saveCharacter();
    }
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