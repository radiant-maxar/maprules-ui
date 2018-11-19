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
  keysMap: Map<number, any> = new Map<number, any>();
  comboMap: Map<number, any> = new Map<number, any>();
  popularKeys: SelectizeOption[];
  popularTagsRequest: any;
  tagComboRequest: any;

  constructor(private http: HttpClient) {
    this.setTagInfoUrl();
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

  populateTagCombos(i: number, key: string, val: string){
    var featureComboMap = this.comboMap.get(i);
    if(!featureComboMap){
      featureComboMap = [];
    }
    this.tagComboRequest = this.getTagCombinations(key, val).subscribe((data) => {
      const combos = data['data'].sort((a, b) => parseFloat(b.together_count) - parseFloat(a.together_count));
      combos.forEach(function(combo) {
        if (featureComboMap[combo.other_key]) {
          featureComboMap[combo.other_key].push(combo.other_value);
        } else {
          featureComboMap[combo.other_key] = [combo.other_value];
        }
      });
      this.comboMap.set(i, featureComboMap);
    });
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