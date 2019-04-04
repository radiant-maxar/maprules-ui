import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})


export class MapRulesService {
  currentMapRule: string;
  mapRulesUrl: string;
  comboMap: {};

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient, private router: Router) {
    this.setMapRulesUrl();
  }

  setMapRulesUrl(){
    this.mapRulesUrl = environment.maprulesConfig;
  }

  save(configId: string, value: {[name: string]: any}){
    const scrubbedForm = this.removeEmpty(value);
    // if on new route, post for new uuid
    if (/new/.test(this.router.url)) {
      return this.http.post(this.mapRulesUrl, scrubbedForm, this.httpOptions).pipe(
        catchError(this.handleError)
      )
    } else {
      // otherwise (working on existing), do put method on existing route...
      const uuid: RegExp = /[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}/g;
      const configId: string = this.router.url.match(uuid)[0]
      return this.http.put(this.mapRulesUrl + "/" + configId, scrubbedForm, this.httpOptions).pipe(
        catchError(this.handleError)
      );
    }
  }

  saveForm(value: {[name: string]: any}){
    const scrubbedForm = this.serialize(value);
    return this.saveNewConfig(scrubbedForm);
  }

  saveNewConfig(scrubbedForm: {[name: string]: any}){
    return this.http.post(this.mapRulesUrl, scrubbedForm, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  isEmpty(empty: any) {
      return empty === '';
  }
  serialize(config: any): any {
    return {
      name: config.mapruleName,
      presets: config.presets.map(function (preset) {
        return {
          name: preset.presetName,
          geometry: preset.geometry,
          primary: preset.primary.map(function (primary) {
            return {
              key: primary.primaryKey,
              val: primary.primaryVal
            }
          }),
          fields: preset.fields.map(function (field) {
            return {
              key: field.fieldKey,
              keyCondition: field.fieldKeyCondition,
              values: !field.fieldVal.length ? [] : [{
                valCondition: field.fieldValCondition,
                values: [field.fieldVal.split(',')]
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
    return this.http.get(this.mapRulesUrl + "/" + configId).pipe(
      tap((maprule: any) => this.currentMapRule = maprule),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error(
      `MapRules ERROR ${error.status}, ` +
      `: ${error.message}`);
    return throwError(
      error.error.message);
  };

}