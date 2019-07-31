import { Component, OnInit } from '@angular/core';
import { NavigationService } from '../../../core/services/navigation.service';
import { MapRulesService } from '../../../core/services/maprules.service'

@Component({
  selector: 'app-navbar',
  styleUrls: ['../link/link.component.css'],
  template: `
 			 <nav *ngIf="nav.visible" class="navbar navbar-expand-lg navbar-light bg-light">
			    <a class="navbar-brand" href="#">
			      <img src="../assets/png/maprules.png"
			        width="30"
			        height="30"
			        class="d-inline block align-top"
			        alt="" />
			    </a>
			    <app-link navLocation="home"></app-link>
			    <ng-container *ngIf="maprules.authorizedUser()">
                    <app-link navLocation="new" ></app-link>
                </ng-container>
			    <app-link navLocation="explore" ></app-link>
                <a class="nav-item nav-link maprules-nav login-nav"
                  ref='#'
                  (click)="maprules.login()">
                  {{ this.maprules.authorizedUser() ? 'logout' : 'login' }}
                </a>
			  </nav>

	`
})

export class NavigationBarComponent implements OnInit {
  constructor(private nav: NavigationService, private maprules: MapRulesService) { }

  ngOnInit() {
    // if (this.maprules.haveParams('oauth_token', 'oauth_token_verifier')) {
    //   this.maprules.verify().subscribe(
    //     (user) => {
    //       if (window.opener) {
    //         (window as any).onbeforeunload = function () {
    //           window.opener.osmCallback(null, user)
    //         }
    //         let pathname = window.opener.location.pathname;
    //         window.location.replace(pathname.substr(0, pathname.lastIndexOf('/') + 1));
    //         window.close();
    //       } else {
    //         localStorage.setItem('user', JSON.stringify(user));
    //         let pathname = window.location.pathname;
    //         window.location.replace(pathname.substr(0, pathname.lastIndexOf('/') + 1));
    //       }
    //     },
    //     (err) => {
    //       if (window.opener) {
    //         (window as any).onbeforeunload = function () {
    //           window.opener.osmCallback(err, null)
    //         };
    //         self.close()
    //       } else {
    //         window.alert('Failed to complete oauth handshake!')
    //         window.history.pushState({}, document.title, window.location.pathname);
    //       }
    //     }
    //   )
    // } else {
      this.maprules.authorized().subscribe(
        () => { },
        this.maprules.handleAuth.bind(this.maprules)
      );
    // }

  }
}