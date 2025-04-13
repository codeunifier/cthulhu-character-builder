import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Character, Occupation, OCCUPATIONS } from '../../models/character.model';
import { CharacterService } from '../../services/character.service';

@Component({
  selector: 'app-occupation-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './occupation-selector.component.html',
  styleUrl: './occupation-selector.component.scss'
})
export class OccupationSelectorComponent implements OnInit {
  character: Character | null = null;
  occupations = OCCUPATIONS;
  filteredOccupations = [...OCCUPATIONS];
  selectedOccupation: Occupation | null = null;
  searchTerm = '';
  
  displayedColumns: string[] = ['name', 'creditRating', 'skills', 'skillPoints', 'action'];

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.characterService.getCharacter().subscribe(character => {
      this.character = character;
      if (this.character && this.character.occupation) {
        this.selectedOccupation = this.character.occupation;
      } else if (!this.character) {
        this.router.navigate(['/character-builder']);
      }
    });
  }

  filterOccupations(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOccupations = [...this.occupations];
    } else {
      const search = this.searchTerm.toLowerCase();
      this.filteredOccupations = this.occupations.filter(occ => 
        occ.name.toLowerCase().includes(search) ||
        occ.skills.some(skill => skill.toLowerCase().includes(search))
      );
    }
  }

  selectOccupation(occupation: Occupation): void {
    if (!this.character) return;
    
    this.selectedOccupation = occupation;
    this.characterService.setOccupation(this.character, occupation);
  }

  getSkillPointsValue(occupation: Occupation): string {
    if (!this.character) return 'N/A';
    
    const points = this.characterService.calculateOccupationSkillPoints(this.character, occupation);
    return points.toString();
  }

  getSkillsString(occupation: Occupation): string {
    return occupation.skills.join(', ');
  }

  getCreditRatingString(occupation: Occupation): string {
    return `${occupation.creditRatingMin}-${occupation.creditRatingMax}`;
  }

  saveAndContinue(): void {
    if (this.character && this.selectedOccupation) {
      this.router.navigate(['/skills']);
    }
  }
}