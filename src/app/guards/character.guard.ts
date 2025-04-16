import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CharacterService } from '../services/character.service';

export const characterGuard: CanActivateFn = () => {
  const characterService = inject(CharacterService);
  const router = inject(Router);

  // Check if character is actively loaded
  let character = characterService.getCurrentCharacter();
  
  if (!character) {
    // Check if a character is saved locally
    character = characterService.loadCharacter();

    if (!character) {
      // Redirect to home if no character exists with a redirect flag
      router.navigate(['/'], { queryParams: { redirected: true } });
      return false;
    }
  }
  
  return true;
};