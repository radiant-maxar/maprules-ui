import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, retry, finalize } from 'rxjs/operators';
import { SelectizeOption } from '../../shared/interfaces/selectize-option.interface';
import { environment } from '../../../environments/environment'

@Injectable({
  providedIn: 'root',
})


export class TagInfoService {
 
  tagInfoUrl: string;
  keysMap : Map<number, any> = new Map<number, any>();
  comboMap: Map<number, any> = new Map<number, any>();
  popularKeys: SelectizeOption[];
  popularTagsRequest: any;

  constructor(private http: HttpClient) {
    this.setTagInfoUrl();
    this.getPopularKeyOptions();
  }

  setTagInfoUrl(){
    this.tagInfoUrl = environment.taginfo;
  }

  get popularTags(){
    return this.http.get(this.tagInfoUrl + "tags/popular?rp=50").pipe(
      catchError(this.handleError)
    );
  }

  getPopularValues(primaryKey: string){
    return this.http.get(this.tagInfoUrl + "key/values?key=" + primaryKey).pipe(
      catchError(this.handleError)
    );
  }

  getTagCombinations(primaryKey: string, primaryValue: string){
    return this.http.get(this.tagInfoUrl + "tag/combinations?key=" + primaryKey + "&" + "value=" + primaryValue).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);  
    return throwError(
      'Could not reach taginfo');
  };

  getPopularKeyOptions(){
    var osmEntityKeys = [];  
    var popularKeyOptions = [];
    this.popularTagsRequest = this.popularTags.subscribe(
      (data) => {
        data['data'].sort((a,b) => parseFloat(b.count_all) - parseFloat(a.count_all)).forEach(function(prop) {
          var current = <SelectizeOption>{text:prop.key, value:prop.key};
          if(!osmEntityKeys.includes(prop.key)){
            osmEntityKeys.push(prop.key);
            popularKeyOptions.push(current);
          }
        });
      },
      error => {
        console.error(error);
      }
    );
    this.popularTagsRequest.add(() => {
      this.popularKeys = popularKeyOptions;
    });
  }
}