import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})


export class MapRulesService {
 
  mapRulesUrl: string;
  currentMapRule: any;
  comboMap: {};

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json'
    })
  };

  constructor(private http: HttpClient) {
    this.setMapRulesUrl();
  }

  setMapRulesUrl(){
    this.mapRulesUrl = environment.maprulesConfig;
  }

  save(configId: string, value: {[name: string]: any}){
    const scrubbedForm = this.removeEmpty(value);
    if(configId){
      return this.http.put(this.mapRulesUrl + "/" + configId, scrubbedForm, this.httpOptions).pipe(
        catchError(this.handleError)
      );
    }
    return this.saveNewConfig(scrubbedForm);
  }

  saveForm(value: {[name: string]: any}){
    const scrubbedForm = this.removeEmpty(value);
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

  removeEmpty(config: {[name: string]: any}){
    var next = {}
    var $scope = this;
    Object.keys(config).forEach((key) => {
      if (Array.isArray(config[key])) {
        var nextArray = [];
        config[key].forEach(subVal => {
          if (subVal instanceof Object) {
            const flush = $scope.removeEmpty(subVal);
            if (Object.keys(flush).length > 0) {
              nextArray.push(flush);
            }
          } else {
            if (!$scope.isEmpty(nextArray)) {
              nextArray.push(subVal);
            }
          }
        })
        next[key] = nextArray;
      } else if (!$scope.isEmpty(config[key])) {
          next[key] = config[key]
      }
    })
    return next;
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