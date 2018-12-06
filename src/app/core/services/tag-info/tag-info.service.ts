import { Injectable } from '@angular/core';
import { Observable, throwError, OperatorFunction, Operator, pipe } from 'rxjs';
import { shareReplay, catchError, flatMap, map } from 'rxjs/operators';
import { SelectizeOption } from '../../../shared/interfaces/selectize-option.interface';
import { environment } from '../../../../environments/environment'

import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})


interface TagInfoData {
  [key:string]: string;
}

export class TagInfoService {
 
  tagInfoUrl: string;
  keysMap: Map<number, any> = new Map<number, any>();
  comboMap: Map<number, any> = new Map<number, any>();
  popularKeys: SelectizeOption[];
  popularTagsRequest: any;
  tagComboRequest: any;

  static POPULAR_TAGS: string = 'popularTags';
  static CACHE_SIZE: number = 1;

  $cache: Map<string, Observable<any>>;
  
  constructor(private http: HttpClient) {}


  get cache(): Map<string, Observable<any>> {
    return this.$cache;
  }
  haveCache(prop: string): boolean {
    return this.$cache.has(prop);
  }

  /**
   * adds observable to cache for given tag info resource
   * @param endpoint {string} tag info resource endpoint
   * @param prop {string} cache map key
   * @param mapper {OperationFunction[]} array of operator functions
   */
  addCache(endpoint: string, prop: string, mappers: Array<OperatorFunction<any, any>>): void {
    this.$cache.set(prop, this.http.get(endpoint).pipe.apply(pipe, mappers))
  }

  /**
   * gets cached observable. if observable not yet there, adds it to the cache. 
   * @param endpoint {string} tag info resource
   * @param prop {string} cache map key
   * @param mapper {any} mapper function to transform cache observable stream
   * @return {OperatorFunction[]} cached resource observable
   */
  getCache(endpoint: string, prop: string, mappers: Array<OperatorFunction<any, any>>): Observable<any> {
    if (!this.haveCache(prop)) {
      this.addCache(endpoint, prop, [...mappers, map(r => (r as TagInfoData).data)])
    }

    return this.$cache.get(prop).pipe(shareReplay(TagInfoService.CACHE_SIZE));
  }

  /**
   * returns popular tags resource's OperatorFunction
   * @return {OperatorFunction}
   */
  popularTagsMapper(): OperatorFunction<any, any> {
    return flatMap((datum): any => {
      const d: TagInfoData = datum as TagInfoData;
      return { 
        key: d.key, 
        value: <SelectizeOption>{ text: d.key, value: d.key } 
      }
    })    
  }
  
  /* CACHE OPERATOR FUNCTIONS */

  /**
   * returns a tag values resource's OperatorFunction
   * @return {OperatorFunction}
   */
  tagValuesMapper(): OperatorFunction<any, any> {
    return flatMap((datum): any => {
      const d: TagInfoData = datum as TagInfoData;
      return <SelectizeOption>{ text: d.value, value: d.value }
    })
  }

  /**
   * returns a tag combo resource's OperatorFunction
   * @return {OperatorFunction}
   */
  tagCombosMapper(): OperatorFunction<any,any> {
    return flatMap((datum): any => {
      const d: TagInfoData = datum as TagInfoData;
      return { [d.other_key]: [d.other_value] };
    })
  }

  /* URL BUILDERS/STRINGS */

  static POPULAR_TAGS_URL: string = '/api/4/tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc';
  
  /**
   * Builds url for getting specific tag combinations
   * @param key {string} combo key
   * @param value {string} combo value
   * @return {string} tag combinations url string...
   */
  static tagCombinationsUrl(key: string, value: string): string {
    return `${environment.taginfo}tag/combinations?key=${key}&value=${value}`;
  }

  /**
   * Builds url for getting popular values for a given key
   * @param key {string} values' key
   * @return {string} tag values url...
   */
  static tagValuesUrl(key: string): string {
    return `${environment.taginfo}key/values?key=${key}`
  }

  // populateTagCombos(i: number, key: string, val: string){
  //   var featureComboMap = this.comboMap.get(i);
  //   if(!featureComboMap){
  //     featureComboMap = [];
  //   }
  //   this.tagComboRequest = this.getTagCombinations(key, val).subscribe((data) => {
  //     const combos = data['data'].sort((a, b) => parseFloat(b.together_count) - parseFloat(a.together_count));
  //     combos.forEach(function(combo) {
  //       if (featureComboMap[combo.other_key]) {
  //         featureComboMap[combo.other_key].push(combo.other_value);
  //       } else {
  //         featureComboMap[combo.other_key] = [combo.other_value];
  //       }
  //     });
  //     this.comboMap.set(i, featureComboMap);
  //   });
  // }

  // tagCombosSubscriber(): any {
  //   const featureComboMap = [];
  //   return {
  //     next(data) {
  //       const combos = data['data'].sort((a, b) => parseFloat(b.together_count) - parseFloat(a.together_count));
  //       combos.forEach(function(combo) {
  //         if (featureComboMap[combo.other_key]) {
  //           featureComboMap[combo.other_key].push(combo.other_value);
  //         } else {
  //           featureComboMap[combo.other_key] = [combo.other_value];
  //         }
  //       });
  //     },
  //     error(error) { console.log(error) },
  //     finally() {

  //     }
  //   }
  // }

  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);  
    return throwError('Could not reach taginfo');
  };

  // getPopularKeyOptions(){
  //   this.popularTagsRequest = this.popularTags.subscribe(this.popularKeysSubscriber());
  // }
}