import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, pipe, of, Operator } from 'rxjs';
import { shareReplay, catchError, flatMap, map, tap, reduce } from 'rxjs/operators';
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

  static CACHE_SIZE: number = 1;

  /* CACHE PROPS */
  public static POPULAR_TAGS: string = 'popularTags';
  public static TAG_VALUES: string = 'tagValues';
  public static TAG_COMBINATIONS: string = 'tagCombinations';
  public static tagValues(key: string): string { return `${TagInfoService.TAG_VALUES}_${key} ` }
  public static tagCombinations(key: string, value: string): string { return `${TagInfoService.TAG_COMBINATIONS}_${key}_${value}` };

  /**
   * Returns cache prop's parent prop...
   * @param prop {string} cache prop
   * @return {string}
   */
  private static parentProp(prop: string): string {
    if (prop.includes(TagInfoService.POPULAR_TAGS)) return TagInfoService.POPULAR_TAGS;
    if (prop.includes(TagInfoService.TAG_COMBINATIONS)) return TagInfoService.TAG_COMBINATIONS;
    if (prop.includes(TagInfoService.TAG_VALUES)) return TagInfoService.TAG_VALUES;
  }

  $cache: Map<string, Observable<any>>;
  $inflight: Map<string, boolean>;
  
  constructor(private http: HttpClient) {}

  /* URL BUILDERS/STRINGS */

  /**
   * Figures out needed endpoint and builds it.
   * @param prop {string} one of the cache props
   * @return {string} needed tagInfo url.
   */
  static endpointBuilder(prop: string): string {
    const parentProp: string = TagInfoService.parentProp(prop);
    if (parentProp === TagInfoService.POPULAR_TAGS) return TagInfoService.POPULAR_TAGS_URL;
    if (parentProp === TagInfoService.TAG_COMBINATIONS) return TagInfoService.tagCombinationsUrl.apply(TagInfoService.tagCombinationsUrl, prop.replace('tagCombinations_', '').split('_'))
    if (parentProp === TagInfoService.TAG_VALUES) return TagInfoService.tagValuesUrl(prop.replace('tagValues_',''))
  }

  static POPULAR_TAGS_URL: string = '/api/4/tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc';
  
  /**
   * Builds url for getting specific tag combinations
   * @param key {string} combo key
   * @param value {string} combo value
   * @return {string} tag combinations url string...
   */
  static tagCombinationsUrl(key: string, value: string): string {
    return `${environment.taginfo}tag/combinations?key=${key}&value=${value}&page=1&rp=50&sortname=together_count&sortorder=desc`;
  }

  /**
   * Builds url for getting popular values for a given key
   * @param key {string} values' key
   * @return {string} tag values url...
   */
  static tagValuesUrl(key: string): string {
    return `${environment.taginfo}key/values?key=${key}`
  }

  /* CACHE OPERATOR FUNCTIONS */
  /* these are functions that take tagInfo responses and make them understandable to the ui... */
  

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
    return reduce((tagCombos, d): any => { // turns array of single key/value combos into map of keys and each of their possible values...
      const combo: TagInfoData = d as TagInfoData;
      tagCombos[combo.other_key] = (tagCombos[combo.other_key] || []).concat(combo.other_key);
      return tagCombos
    })
  }

  getMapper(prop: string): OperatorFunction<any, any> {
    const parentProp: string = TagInfoService.parentProp(prop);
    if (parentProp === TagInfoService.POPULAR_TAGS) return this.popularTagsMapper();
    if (parentProp === TagInfoService.TAG_COMBINATIONS) return this.tagCombosMapper();
    if (parentProp === TagInfoService.TAG_VALUES) return this.tagValuesMapper();
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
   * @param prop {string} cache map key
   */
  addCache(prop: string): void {
    const endpoint: string = TagInfoService.endpointBuilder(prop); // url to request 1from tag info
    const mappers: Array<OperatorFunction<any,any>> = [this.getMapper(prop)].concat([
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
    this.$cache.set(prop, this.http.get(endpoint).pipe.apply(pipe, mappers))
  }

  /**
   * gets cached observable. if observable not yet there, adds it to the cache. 
   * @param prop {string} cache map key
   * @param mapper {any} mapper function to transform cache observable stream
   * @return {OperatorFunction[]} cached resource observable
   */
  getCache(prop: string): Observable<any> {
    if (!this.haveCache(prop)) {
      this.addInflight(prop); // say we are inflight before we set off request...
      this.addCache(prop)
    }
    return this.$cache.get(prop).pipe(shareReplay(TagInfoService.CACHE_SIZE));
  }
}
