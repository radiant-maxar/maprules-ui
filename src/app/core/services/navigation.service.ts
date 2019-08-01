import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class NavigationService {
  visible: boolean;
  emitter: EventEmitter<any> = new EventEmitter();

  constructor() { this.visible = false; }

  hide() { this.visible = false; }
  show() { this.visible = true; }
  toggle() { this.visible = !this.visible; }
}
