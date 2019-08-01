import { Component, ViewChild, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavigationService } from './core/services/navigation.service';
import { MapRulesService } from './core/services/maprules.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  constructor(
      private maprules: MapRulesService,
      private nav: NavigationService
  ) { }

  ngOnInit() {
    // first see if we have valid session and go through logic to
    // try to get the user, or get people to login.
    // once that logic is finished, show the navigation.
    const options: RequestInit = {
        credentials: 'include',
        mode: 'cors',
        method: 'GET',
    };
    fetch(`${environment.maprules}/auth/session`, options) // see if valid session.
        .then(resp => {
            if (resp.status === 200) {
                return localStorage.getItem('user'); // if so, try to get user
            } else if (resp.status === 401) {
                window.location.replace('/login.html'); // otherwise (if unauthorized) login again
            } else {
                throw Error('unable to talk to MapRules service'); // otherwise, for now, just say can't reach service
            }
        })
        .catch(error => { alert(error.message); })
        .then(user => {
            if (user) { // if we have the user, set the user and be done
                this.maprules.setUser(JSON.parse(user));
                this.nav.setUserDetails(this.maprules.getUser());
            } else { // or, ask for session's user details.
                const options: RequestInit = {
                    credentials: 'include',
                    mode: 'cors',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                fetch(`${environment.maprules}/auth/user`, options)
                    .then(resp => {
                        if (resp.status === 200) {
                            return resp.json(); // if we get user, return it
                        } else if (resp.status === 401) {
                            window.location.replace('/login.html'); // if restricted resource says unauthorized, make them login.
                        } else {
                            throw Error('unable to talk to MapRules service'); // otherwise, for now, just say can't reach service
                        }
                    })
                    .then(user => {
                        if (user) {
                            this.maprules.setUser(user); // set the user if we have it.
                            this.nav.setUserDetails(this.maprules.getUser());
                        } else {
                            throw Error('unable to talk to MapRules service'); // otherwise, for now, just say can't reach service
                        }
                    })
            }
        })
        .catch((error) => { alert(error.message); })
        .then(() => { this.nav.show(); });

  }
}
