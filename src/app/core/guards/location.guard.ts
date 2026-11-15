import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LocationService } from '../services/location.service';

export const locationGuard: CanActivateFn = () => {
  const locService = inject(LocationService);
  const router = inject(Router);

  if (locService.isLocationSet()) {
    return true;
  }

  return router.createUrlTree(['/location']);
};
