// PendingDeduction interface used for age effects
export interface PendingDeduction {
  stats: string[];
  points: number;
  remainingPoints: number;
  deductions: { [key: string]: number };
}