import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Call of Cthulhu Character Builder';
  
  constructor(private dialog: MatDialog) {}
  
  openHelpDialog(): void {
    this.dialog.open(HelpDialogComponent, {
      width: '600px',
      maxHeight: '80vh'
    });
  }
}

@Component({
  selector: 'app-help-dialog',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  template: `
    <h2 mat-dialog-title>Call of Cthulhu Character Builder Help</h2>
    <mat-dialog-content>
      <h3>Navigation</h3>
      <p>Use the sidebar menu to navigate between different sections of character creation:</p>
      <ul>
        <li><strong>Home</strong>: Start your character creation journey</li>
        <li><strong>Statistics</strong>: Set your character's attributes</li>
        <li><strong>Occupation</strong>: Choose your investigator's profession</li>
        <li><strong>Skills</strong>: Allocate points to your character's skills</li>
        <li><strong>Backstory</strong>: Create your character's personal history</li>
        <li><strong>Character Sheet</strong>: View your complete character</li>
      </ul>
      
      <h3>Character Creation Process</h3>
      <p>Follow these steps to create your investigator:</p>
      <ol>
        <li>Roll or enter your character's characteristics</li>
        <li>Choose an appropriate occupation</li>
        <li>Allocate skill points based on your occupation</li>
        <li>Complete your character's backstory</li>
        <li>Review your character sheet</li>
      </ol>
      
      <h3>Rules Reference</h3>
      <p>This character builder follows the 7th edition Call of Cthulhu rules published by Chaosium Inc.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `
})
export class HelpDialogComponent {}