// Import the StatModifier interface
import { StatModifier } from './stat-modifier.interface';

// StatModifiers interface definition
export interface StatModifiers {
  str?: StatModifier[];
  con?: StatModifier[];
  siz?: StatModifier[];
  dex?: StatModifier[];
  app?: StatModifier[];
  int?: StatModifier[];
  pow?: StatModifier[];
  edu?: StatModifier[];
  luck?: StatModifier[];
}