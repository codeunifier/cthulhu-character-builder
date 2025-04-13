import { Routes } from '@angular/router';

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
    loadComponent: () => import('./components/stats-editor/stats-editor.component').then(m => m.StatsEditorComponent) 
  },
  { 
    path: 'occupation', 
    loadComponent: () => import('./components/occupation-selector/occupation-selector.component').then(m => m.OccupationSelectorComponent) 
  },
  { 
    path: 'skills', 
    loadComponent: () => import('./components/skills-allocator/skills-allocator.component').then(m => m.SkillsAllocatorComponent) 
  },
  { 
    path: 'backstory', 
    loadComponent: () => import('./components/backstory-editor/backstory-editor.component').then(m => m.BackstoryEditorComponent) 
  },
  { 
    path: 'sheet', 
    loadComponent: () => import('./components/character-sheet/character-sheet.component').then(m => m.CharacterSheetComponent) 
  },
  { 
    path: '**', 
    redirectTo: 'character-builder' 
  }
];