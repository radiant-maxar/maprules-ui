import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})


export class MapRulesService {
 
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

  save(value: {[name: string]: any}){
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
    return this.http.get(this.mapRulesUrl + "/" + configId).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error(
      `MapRules ERROR ${error.status}, ` +
      `: ${error.message}`);
    return throwError(
      error.error.message);
  };
}