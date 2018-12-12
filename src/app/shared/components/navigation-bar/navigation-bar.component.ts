import { Component } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-navbar',
  template: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent {
  constructor(public nav: NavigationService) {}
}
