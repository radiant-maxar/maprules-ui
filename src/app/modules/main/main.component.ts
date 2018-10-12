import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../core/services/navigation.service'; 

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  constructor(private nav: NavigationService) { }

  ngOnInit() {
  	this.nav.show();
  }

}
