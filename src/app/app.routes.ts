import { Routes } from '@angular/router';
import { characterGuard } from './guards/character.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'character-builder', 
    pathMatch: 'full' 
  },
  { 
    path: 'character-builder', 
    loadComponent: () => import('./components/character-builder/character-builder.component').then(m => m.CharacterBuilderComponent) 
  },
  { 
    path: 'stats', 
    loadComponent: () => import('./components/stats-editor/stats-editor.component').then(m => m.StatsEditorComponent),
    canActivate: [characterGuard]
  },
  {
    path: 'occupation', 
    loadComponent: () => import('./components/occupation-selector/occupation-selector.component').then(m => m.OccupationSelectorComponent),
    canActivate: [characterGuard]
  },
  { 
    path: 'skills', 
    loadComponent: () => import('./components/skills-allocator/skills-allocator.component').then(m => m.SkillsAllocatorComponent),
    canActivate: [characterGuard]
  },
  { 
    path: 'backstory', 
    loadComponent: () => import('./components/backstory-editor/backstory-editor.component').then(m => m.BackstoryEditorComponent),
    canActivate: [characterGuard]
  },
  { 
    path: 'sheet', 
    loadComponent: () => import('./components/character-sheet/character-sheet.component').then(m => m.CharacterSheetComponent),
    canActivate: [characterGuard]
  },
  { 
    path: '**', 
    redirectTo: 'character-builder' 
  }
];