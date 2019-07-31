import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment'
import { Router } from '@angular/router';
import { FieldConfigService } from './field-config.service';
import { browser } from 'protractor';

@Injectable({
  providedIn: 'root',
})


export class MapRulesService {
  currentMapRule: string;
  mapRulesUrl: string;
  maprules: string;
  private sessionToken: string;
  private user: any;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.setMapRulesUrl();
  }


  private sessionOptions(post: boolean = false): any {
    let sessionHeaders = new HttpHeaders({
      'Authorization': `Bearer ${this.sessionToken}`
    })

    if (post) sessionHeaders['Content-Type'] = 'application/json';

    return {
      headers: sessionHeaders
    }
  }

  setMapRulesUrl(){
    this.mapRulesUrl = environment.maprulesConfig;
    this.maprules = environment.maprules;
  }

  save(value: {[name: string]: any}, presetGeometries: any[]){
    const scrubbedForm = this.serialize(value, presetGeometries);
    // if on new route, post for new uuid
    if (/new/.test(this.router.url)) {
      return this.saveNewConfig(scrubbedForm);
    } else {
      // otherwise (working on existing), do put method on existing route...
      const uuid: RegExp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g;
      const configId: string = this.router.url.match(uuid)[0];
      return this.updateConfig(scrubbedForm, configId);
    }
  }

  saveForm(value: {[name: string]: any}, presetGeometries: any[]){
    const scrubbedForm = this.serialize(value, presetGeometries);
    return this.saveNewConfig(scrubbedForm);
  }

  saveNewConfig(scrubbedForm: {[name: string]: any}) {
    return this.http
      .post(this.mapRulesUrl, scrubbedForm, this.sessionOptions(true))
      .pipe(catchError(this.handleError))
  }

  updateConfig(scrubbedForm: {[name: string]: any}, configId: any) {
    return this.http
      .put(this.mapRulesUrl + '/' + configId, scrubbedForm, this.sessionOptions(true))
      .pipe(catchError(this.handleError))
  }

  serialize(config: any, presetGeometries: any[]): any {
    return {
      name: config.mapruleName,
      presets: config.presets.map(function (preset, index) {
        return {
          name: preset.presetName,
          geometry: presetGeometries[index],
          primary: preset.primary.map(function (primary) {
            return {
              key: primary.primaryKey,
              val: primary.primaryVal
            }
          }),
          fields: preset.fields.map(function (field) {
            return {
              key: field.fieldKey,
              keyCondition: FieldConfigService.KEY_CONDITIONS.indexOf(field.fieldKeyCondition),
              values: !field.fieldVal.length ? [] : [{
                valCondition: FieldConfigService.VAL_CONDITIONS.indexOf(field.fieldValCondition),
                values: field.fieldVal.length ? field.fieldVal.split(',') : []
              }]
            }
          }),
        }
      }),
      disabledFeatures: config.disabledFeatures.map(function (disabledFeature) {
        return {
          key: disabledFeature.disabledKey,
          val: disabledFeature.disabledVal.length ? disabledFeature.disabledVal.split(',') : []
        }
      })
    }
  }

  getMapRule(configId: string){
    return this.http
      .get(this.mapRulesUrl + "/" + configId)
      .pipe(
        tap((maprule: any) => this.currentMapRule = maprule),
        catchError(this.handleError)
      )
  }

  private handleError(error: HttpErrorResponse) {
    console.error(
      `MapRules ERROR ${error.status}, ` +
      `: ${error.message}`);

    return throwError(new HttpErrorResponse({
      error: error.message,
      status: error.status
    }));
  };

  public handleAuth(error: HttpErrorResponse) {
      // if user unauthorized, force them back to home page
      if (error.status === 401) {
        this.router.navigateByUrl('/home');
      } else { // if service is down, then alert user
          alert(`The MapRules service at ${this.mapRulesUrl} is currently unreacable.`)
      }
  }

  // authorized() {
  //   return this.http.get(this.maprules + "/auth/session", this.sessionOptions())
  //     .pipe(
  //       map((res: any) => {
  //         this.sessionToken = res.data;
  //       }),
  //       catchError(this.handleError)
  //     )
  // }

  // authorizedUser(): boolean {
  //   return !!this.sessionToken;
  // }

  // getUser() {
  //   return this.http.get(this.mapRulesUrl + '/auth/user')
  //     .pipe(catchError(this.handleError));
  // }

  // login() {
  //   // create id that will track browser origin.
  //   this.http.get(this.maprules + '/auth/login', {
  //     responseType: 'text'
  //   })
  //     .pipe( catchError(this.handleError))
  //     .subscribe(
  //       (cbUrl: any) => {
  //         let popup = window.open(cbUrl, 'osmLogin', 'height=750,width=400');
  //         (window as any).osmCallback = function (error, user) {
  //           if (error) {
  //             window.console.warn( 'Failed to verify oauth tokens w/ provider:' );
  //             window.console.warn( 'XMLHttpRequest.status', error.status || null );
  //             window.console.warn( 'XMLHttpRequest.responseText ', error.responseText || null );

  //             window.alert( 'Failed to complete oauth handshake. Check console for details & retry.' );
  //             window.history.pushState( {}, document.title, window.location.pathname );
  //           } else {
  //             if (localStorage) {
  //               localStorage.setItem('user', JSON.stringify(user))
  //             }
  //           }
  //         }
  //       }
  //     );
  // }

  // verify() {
  //   const [oauth_token, oauth_verifier] = this.getParams('oauth_token', 'oauth_verifier');
  //   return this.http
  //     .get(`${this.maprules}/auth/verify?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`)
  //     .pipe(catchError(this.handleError))
  // }

  // haveParams(...params) {
  //   return this.getParams(...params).length === params.length;
  // }

  // getParams(...params) {
  //   var results = [], tmp = [];
  //   params.forEach(parameterName => {
  //     location.search
  //       .substr(1)
  //       .split('&')
  //       .forEach(function (item) {
  //         tmp = item.split('=');
  //         if (tmp[0] === parameterName) results.push(decodeURIComponent(tmp[1]));
  //       });
  //   });
  //   return results;
  // }

}