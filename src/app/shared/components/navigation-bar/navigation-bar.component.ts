import { Component } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-navbar',
	template: './navigation-bar.html'
})

export class NavigationBarComponent {
  constructor(public nav: NavigationService) {}
}
