import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { Character, Stats } from '../../../models';
import { DiceService } from '../../../services/dice.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-stat-card',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
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

  constructor(private diceService: DiceService) {}

  rollStat(): void {
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
