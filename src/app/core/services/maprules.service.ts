import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, from } from 'rxjs';
import { catchError, retry, tap, map, switchMap } from 'rxjs/operators';
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
    let options: RequestInit = {
        credentials: 'include',
        mode: 'cors',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scrubbedForm)
    }
     return from(fetch(this.mapRulesUrl, options))
       .pipe(
           switchMap((resp: any) => {
               if (resp.ok) {
                   return resp.json()
               } else {
                   return of({
                     error: true,
                     message: `Error ${resp.status}`
                   });
               }
           }),
           catchError(this.handleError)
       )
  }

  updateConfig(scrubbedForm: {[name: string]: any}, configId: any) {
      let options: RequestInit = {
          credentials: 'include',
          mode: 'cors',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scrubbedForm)
       }

       return from(fetch(this.mapRulesUrl + '/' + configId, options))
          .pipe(
              switchMap((resp: any) => {
                  if (resp.ok) {
                      return resp.json()
                  } else {
                      return of({
                        error: true,
                        message: `Error ${resp.status}`
                      });
                  }
              }),
              catchError(this.handleError)
          )
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

  logout() {
      const options: RequestInit = {
          credentials: 'include',
          mode: 'cors',
          method: 'POST'

      }

      return from(fetch(this.maprules + '/auth/logout', options))
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

  public setUser(user: any) {
      this.user = user;
  }

  public clearUser() {
      this.user = null;
  }

  public getUser(): any {
      return this.user;
  }

}