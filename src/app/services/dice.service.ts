import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiceService {
  
  // Roll a single die with specified sides
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }
  
  // Roll multiple dice and sum the results
  rollDice(count: number, sides: number): number {
    let result = 0;
    for (let i = 0; i < count; i++) {
      result += this.rollDie(sides);
    }
    return result;
  }
  
  // Common dice combinations
  roll1d10(): number {
    return this.rollDie(10);
  }
  
  roll1d100(): number {
    return this.rollDice(1, 100);
  }
  
  roll2d6(): number {
    return this.rollDice(2, 6);
  }
  
  roll3d6(): number {
    return this.rollDice(3, 6);
  }
  
  // Specialized rolls for character generation
  rollStatistic(): number {
    return this.roll3d6() * 5;
  }
  
  rollEducation(): number {
    return (this.rollDice(2, 6) + 6) * 5;
  }
  
  // Generate a complete set of base statistics
  generateBaseStats() {
    return {
      str: this.rollStatistic(),
      con: this.rollStatistic(),
      siz: (this.rollDice(2, 6) + 6) * 5,
      dex: this.rollStatistic(),
      app: this.rollStatistic(),
      int: (this.rollDice(2, 6) + 6) * 5,
      pow: this.rollStatistic(),
      edu: (this.rollDice(2, 6) + 6) * 5,
      luck: this.rollStatistic()
    };
  }
}