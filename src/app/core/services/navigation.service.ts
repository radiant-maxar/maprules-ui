import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  visible: boolean;
  userDetails: any = {};
  emitter: EventEmitter<any> = new EventEmitter();

  constructor() { this.visible = false; }

  hide() { this.visible = false; }

  show() { this.visible = true; }

  toggle() { this.visible = !this.visible; }

  setUserDetails(newDetails: any) {
      this.userDetails = newDetails;
      this.emitter.emit(this.userDetails);
  }

  getuserDetails() {
      return this.userDetails;
  }

  clearUserDetails() {
      this.userDetails = {};
      this.emitter.emit(this.userDetails)
  }

}
