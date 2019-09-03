import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';
import { MapRulesService } from '../../../core/services/maprules.service'
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  styleUrls: [
    '../link/link.component.css',
    './navigation-bar.component.css'
  ],
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
                <a class="user-toggle current-location nav-item nav-link maprules-nav login-nav"
                    ref='#' (click)="toggleMenu()">
                    <span *ngIf="authenticated && haveUser()">{{userDetails.name}}</span>
                    <i class="fa"
                        [ngClass]="{ withUser: authenticated && haveUser(), 'fa-angle-up': showMenu, 'fa-angle-down': !showMenu  }">
                    </i>
                </a>
                <div class="user-menu current-location nav-item nav-link maprules-nav" [ngClass]="{ hide: !showMenu }">
                    <a class="nav-item nav-link maprules-nav login-nav"
                        (click)="openDocs()">
                        What is MapRules?
                    </a>
                    <a class="nav-item nav-link maprules-nav login-nav"
                        (click)="authenticated ? logout() : login()">
                        {{ authenticated ?  'logout' : 'login' }}
                    </a>
                </div>
            </nav>`
})

export class NavigationBarComponent {
  userDetails: any = {};
  authenticated: boolean = false;
  showMenu: boolean = false;

  constructor(
      private nav: NavigationService,
      private maprules: MapRulesService,
      private router: Router
  ) {
      this.nav.emitter.subscribe((event: any) => this[event.type] = event.value)
  }

  getNav(): NavigationService { return this.nav; }
  getMapRules(): MapRulesService { return this.maprules; }
  toggleMenu(): void { this.showMenu = !this.showMenu };

  haveUser(): boolean { return Object.keys(this.userDetails).length > 0; }

  openDocs(): void {
      window.open(environment.docs, '_blank');
  }

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
                  this.router.navigateByUrl('/home');
              }
          },
          (err: any) => {
              console.log(err);
          }
        )
  }
}
