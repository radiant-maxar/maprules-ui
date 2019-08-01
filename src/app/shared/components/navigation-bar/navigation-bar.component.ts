import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';
import { MapRulesService } from '../../../core/services/maprules.service'

@Component({
  selector: 'app-navbar',
  styleUrls: ['../link/link.component.css'],
  template: `
 			 <nav *ngIf="getNav().visible" class="navbar navbar-expand-lg navbar-light bg-light">
			    <a class="navbar-brand" href="#">
			      <img src="../assets/png/maprules.png"
			        width="30"
			        height="30"
			        class="d-inline block align-top"
			        alt="" />
			    </a>
			    <app-link navLocation="home"></app-link>
			    <ng-container *ngIf="haveUser()">
                    <app-link navLocation="new" ></app-link>
                </ng-container>
			    <app-link navLocation="explore" ></app-link>
                <ng-container *ngIf="!haveUser()">
                    <a class="nav-item nav-link maprules-nav login-nav"
                      ref='#'
                      (click)="getMapRules().logout()">
                      logout
                    </a>
                </ng-container>
			  </nav>

	`
})

export class NavigationBarComponent {
  userDetails: any = {};

  constructor(private nav: NavigationService, private maprules: MapRulesService) {
      this.nav.emitter.subscribe((newUser) => this.userDetails = newUser)
  }
  getNav(): NavigationService { return this.nav; }
  getMapRules(): MapRulesService { return this.maprules; }
  haveUser(): boolean { return Object.keys(this.userDetails).length > 0; }
}