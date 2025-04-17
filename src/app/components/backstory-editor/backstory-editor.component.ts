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

interface ElementConfig {
  dataSource: any[];
  characterValue: string;
  descriptionField: string;
  setSelectedDescription: (value: string | null) => void;
  getSelectedDescription: () => string | null;
}

interface DescriptionElementMap {
  [element: string]: ElementConfig;
}

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
  
  // Types for backstory elements
  private descriptionElementMap: DescriptionElementMap = {
    'ideology': {
      dataSource: this.ideologyData,
      characterValue: 'ideology',
      descriptionField: 'ideologyDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedIdeologyDescription = value;
      },
      getSelectedDescription: () => this.selectedIdeologyDescription
    },
    'person': {
      dataSource: this.significantPersonsData,
      characterValue: 'significantPerson.who',
      descriptionField: 'significantPerson.whoDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedSignificantPersonDescription = value;
      },
      getSelectedDescription: () => this.selectedSignificantPersonDescription
    },
    'reason': {
      dataSource: this.significantReasonsData,
      characterValue: 'significantPerson.why',
      descriptionField: 'significantPerson.whyDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedSignificantReasonDescription = value;
      },
      getSelectedDescription: () => this.selectedSignificantReasonDescription
    },
    'location': {
      dataSource: this.meaningfulLocationsData,
      characterValue: 'meaningfulLocation',
      descriptionField: 'meaningfulLocationDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedMeaningfulLocationDescription = value;
      },
      getSelectedDescription: () => this.selectedMeaningfulLocationDescription
    },
    'possession': {
      dataSource: this.treasuredPossessionsData,
      characterValue: 'treasuredPossession',
      descriptionField: 'treasuredPossessionDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedTreasuredPossessionDescription = value;
      },
      getSelectedDescription: () => this.selectedTreasuredPossessionDescription
    },
    'trait': {
      dataSource: this.traitsData,
      characterValue: 'trait',
      descriptionField: 'traitDescription',
      setSelectedDescription: (value: string | null) => {
        this.selectedTraitDescription = value;
      },
      getSelectedDescription: () => this.selectedTraitDescription
    }
  };

  // Update all descriptions based on current selections
  updateAllDescriptions(): void {
    if (!this.character) return;
    
    this.updateDescription('ideology');
    this.updateDescription('person');
    this.updateDescription('reason');
    this.updateDescription('location');
    this.updateDescription('possession');
    this.updateDescription('trait');
  }
  
  // Get a property via string path notation
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }
  
  // Set a property via string path notation
  private setNestedProperty(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((prev, curr) => {
      if (!prev[curr]) prev[curr] = {};
      return prev[curr];
    }, obj);
    
    if (last) {
      target[last] = value;
    }
  }
  
  // Generic method to update descriptions
  updateDescription(elementType: string): void {    
    // Get the configuration for this element type
    const config = this.descriptionElementMap[elementType];
    if (!config) return;
    
    // Get the character value for this element
    const value = this.getNestedProperty(this.character, config.characterValue);
    if (!value) {
      config.setSelectedDescription(null);
      return;
    }
    
    // Check if the character already has a custom description
    const existingDescription = this.getNestedProperty(this.character, config.descriptionField);
    if (existingDescription) {
      config.setSelectedDescription(existingDescription);
      return;
    }
    
    // Otherwise look for a description in the predefined data
    const selectedElement = config.dataSource.find((item: any) => item.name === value);
    const description = selectedElement?.description || null;
    config.setSelectedDescription(description);
    
    // If a predefined description was found, store it in the character
    if (description) {
      this.setNestedProperty(this.character, config.descriptionField, description);
    }
  }
  
  // Generic method to update custom descriptions
  updateCustomDescription(elementType: string, description: string): void {    
    // Get the configuration for this element type
    const config = this.descriptionElementMap[elementType];
    if (!config) return;
    
    // Update the description in the character
    this.setNestedProperty(this.character, config.descriptionField, description);
    
    // Update the UI display variable
    config.setSelectedDescription(description);
    
    // Save the character
    this.saveCharacter();
  }
  
  // Specific wrapper methods that call the generic method
  updateIdeologyDescription(): void {
    this.updateDescription('ideology');
  }
  
  updateSignificantPersonDescription(): void {
    this.updateDescription('person');
  }
  
  updateSignificantReasonDescription(): void {
    this.updateDescription('reason');
  }
  
  updateMeaningfulLocationDescription(): void {
    this.updateDescription('location');
  }
  
  updateTreasuredPossessionDescription(): void {
    this.updateDescription('possession');
  }
  
  updateTraitDescription(): void {
    this.updateDescription('trait');
  }
  
  // Wrapper methods for custom description updates
  updateCustomIdeologyDescription(description: string): void {
    this.updateCustomDescription('ideology', description);
  }
  
  updateCustomSignificantPersonDescription(description: string): void {
    this.updateCustomDescription('person', description);
  }
  
  updateCustomSignificantReasonDescription(description: string): void {
    this.updateCustomDescription('reason', description);
  }
  
  updateCustomMeaningfulLocationDescription(description: string): void {
    this.updateCustomDescription('location', description);
  }
  
  updateCustomTreasuredPossessionDescription(description: string): void {
    this.updateCustomDescription('possession', description);
  }
  
  updateCustomTraitDescription(description: string): void {
    this.updateCustomDescription('trait', description);
  }

  // Generic method for generating random selections
  randomSelection(elementType: string): void {    
    // Get the configuration for this element type
    const config = this.descriptionElementMap[elementType];
    if (!config) return;
    
    // Map element types to their corresponding options arrays
    const getOptionsArray = () => {
      switch (elementType) {
        case 'person': return this.significantPersons;
        case 'reason': return this.significantReasons;
        case 'ideology': return this.ideologyOptions;
        case 'location': return this.meaningfulLocations;
        case 'possession': return this.treasuredPossessions;
        case 'trait': return this.traits;
        default: return [];
      }
    };
    
    const options = getOptionsArray();
    if (!options || !options.length) return;
    
    // Roll for a random index
    const index = this.diceService.rollDie(options.length) - 1;
    
    // Set the value on the character
    this.setNestedProperty(this.character, config.characterValue, options[index]);
    
    // Clear any custom description
    this.setNestedProperty(this.character, config.descriptionField, undefined);
    
    // Update with predefined description
    this.updateDescription(elementType);
    this.saveCharacter();
  }
  
  // Special case for significant person which handles both who and why
  randomSignificantPerson(): void {    
    // Handle the "who" part
    this.randomSelection('person');
    
    // Handle the "why" part separately
    this.randomSelection('reason');
  }
  
  // Wrapper methods for specific random selections
  randomIdeology(): void {
    this.randomSelection('ideology');
  }

  randomMeaningfulLocation(): void {
    this.randomSelection('location');
  }

  randomTreasuredPossession(): void {
    this.randomSelection('possession');
  }

  randomTrait(): void {
    this.randomSelection('trait');
  }

  randomizeAll(): void {
    this.randomIdeology();
    this.randomSignificantPerson();
    this.randomMeaningfulLocation();
    this.randomTreasuredPossession();
    this.randomTrait();
  }
  
  // Generic option selection handler
  onOptionSelected(elementType: string, value: string): void {    
    // Get the configuration for this element type
    const config = this.descriptionElementMap[elementType];
    if (!config) return;
    
    // Find the full object with description
    const selectedItem = config.dataSource.find((item: any) => item.name === value);
    if (selectedItem && selectedItem.description) {
      // Update the character's description
      this.setNestedProperty(this.character, config.descriptionField, selectedItem.description);
      config.setSelectedDescription(selectedItem.description);
      this.saveCharacter();
    }
  }
  
  // Specific wrapper methods for selection handlers
  onIdeologySelected(value: string): void {
    this.onOptionSelected('ideology', value);
  }
  
  onSignificantPersonSelected(value: string): void {
    this.onOptionSelected('person', value);
  }
  
  onSignificantReasonSelected(value: string): void {
    this.onOptionSelected('reason', value);
  }
  
  onMeaningfulLocationSelected(value: string): void {
    this.onOptionSelected('location', value);
  }
  
  onTreasuredPossessionSelected(value: string): void {
    this.onOptionSelected('possession', value);
  }
  
  onTraitSelected(value: string): void {
    this.onOptionSelected('trait', value);
  }

  saveCharacter(): void {
    this.characterService.updateCharacter(this.character);
  }

  canContinue(): boolean {    
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