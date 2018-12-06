import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, pipe, of } from 'rxjs';
import { shareReplay, catchError, flatMap, map, tap } from 'rxjs/operators';
import { SelectizeOption } from '../../shared/interfaces/selectize-option.interface';
import { environment } from '../../../environments/environment'

import { HttpClient } from '@angular/common/http';

interface TagInfoData {
  [key:string]: string;
}

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

  /* CACHE PROPS */
  static POPULAR_TAGS: string = 'popularTags';
  public static popularValues(key: string): string { return `popularValues_${key} ` }

  static CACHE_SIZE: number = 1;

  $cache: Map<string, Observable<any>>;
  $inflight: Map<string, boolean>;
  
  constructor(private http: HttpClient) {}

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


  get cache(): Map<string, Observable<any>> {
    return this.$cache;
  }

  addInflight(prop: string): void {
    this.$inflight.set(prop, true);
  }

  isInflight(prop: string): boolean {
    return this.$inflight.get(prop);
  }

  /**
   * true if cache exists for provided prop
   * @param prop {string}
   * @return {boolean}
   */
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
      mappers = mappers.concat([
        catchError(e => { // catch error, log it, and just return mock of api request...
          this.$inflight.delete(prop);
          console.log(`REQUEST FAILED: ${endpoint}`) 
          return of([{ data: [] }]) 
        }), 
        tap(r => { // remove inflight if no error occured...
          if (this.$inflight.has(prop)) {
            this.$inflight.delete(prop)
          }; 
        }),
        map(r => { // get the request's data array
          return (r as TagInfoData).data
        })
      ]);
      
      this.addInflight(prop); // say we are inflight before we set off request...
      this.addCache(endpoint, prop, mappers)
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
}