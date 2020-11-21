import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private backButtonPressed: boolean = false;

  constructor() { }

  public setBackClicked(status: boolean) {
    this.backButtonPressed = status;
  }

  public getBackClicked() {
    return this.backButtonPressed;
  }
}
