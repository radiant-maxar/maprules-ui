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
			    <ng-container *ngIf="authenticated && haveUser()">
                    <app-link navLocation="new" ></app-link>
                </ng-container>
			    <app-link navLocation="explore" ></app-link>
                <a class="nav-item nav-link maprules-nav login-nav"
                  ref='#'
                  (click)="authenticated ? logout() : login()">
                  {{  authenticated
                        ? haveUser() ? userDetails.name : 'logout'
                        : 'login'
                  }}
                </a>
            </nav>`
})
export class NavigationBarComponent {
  userDetails: any = {};
  authenticated: boolean = false;

  constructor(private nav: NavigationService, private maprules: MapRulesService) {
      this.nav.emitter.subscribe((event: any) =>this[event.type] = event.value)
  }
  getNav(): NavigationService { return this.nav; }
  getMapRules(): MapRulesService { return this.maprules; }
  haveUser(): boolean { return Object.keys(this.userDetails).length > 0; }
  login(): void {
      window.location.replace('/login.html')
  }
  logout(): void {
      this.maprules.logout()
        .subscribe(
          (resp: any) => {
              if (resp.status === 200) {
                  this.maprules.clearUser()
                  this.userDetails = {};
                  this.authenticated = false;
              }
          },
          (err: any) => {
              console.log(err);
          }
        )
  }
}