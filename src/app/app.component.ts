import { Component, OnInit } from '@angular/core';
import { NavigationService } from './core/services/navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  constructor(private nav: NavigationService) { }

  ngOnInit() {
    this.nav.show();
  }
}
