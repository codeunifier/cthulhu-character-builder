import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Character, Stats } from '../../../models';
import { DiceService } from '../../../services/dice.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Reroll Education</h2>
    <mat-dialog-content>
      <p>You are about to reroll your Education (EDU) stat. This will also reset any improvement checks associated with Education.</p>
      <p>Are you sure you want to continue?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="true" color="primary">Confirm</button>
    </mat-dialog-actions>
  `
})
export class ConfirmationDialogComponent {}

@Component({
  selector: 'app-stat-card',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, MatDialogModule, CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input({ required: true }) character!: Character;
  @Input({ required: true }) stat!: keyof Stats;
  @Input({ required: true }) name!: string;
  @Input({ required: true }) desc!: string;

  @Output() statRolled: EventEmitter<{ value: number, stat: keyof Stats }> = new EventEmitter();

  get tooltipText(): string {
    return ['siz', 'int', 'edu'].includes(this.stat) ? '' : 'Roll 3D6 × 5 for STR';
  }

  constructor(
    private diceService: DiceService,
    private dialog: MatDialog
  ) {}

  rollStat(): void {
    // Check if this is EDU and if the character has improvement checks
    if (this.stat === 'edu' && 
        this.character.improvementRolls && 
        this.character.improvementRolls['edu'] && 
        this.character.improvementRolls['edu'].length > 0) {
      
      // Show confirmation dialog
      const dialogRef = this.dialog.open(ConfirmationDialogComponent);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.performRoll();
        }
      });
    } else {
      // For non-EDU stats or EDU without improvement checks, just roll
      this.performRoll();
    }
  }

  private performRoll(): void {
    // Generate the new value
    let value: number;
    if (['siz', 'int', 'edu'].includes(this.stat)) {
      value = (this.diceService.roll2d6() + 6) * 5;
    } else {
      value = this.diceService.roll3d6() * 5;
    }

    this.statRolled.emit({
      value,
      stat: this.stat
    });
  }
}
