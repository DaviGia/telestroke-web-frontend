import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationGuard implements CanDeactivate<any> {

  constructor(private navigationService: NavigationService) {}

  canDeactivate(component: any) {
    // will prevent user from going back
    if (this.navigationService.getBackClicked()) {
      this.navigationService.setBackClicked(false);
      // push current state again to prevent further attempts.
      history.pushState(null, null, location.href);
      return false;
    }
    return true;
  }
}
