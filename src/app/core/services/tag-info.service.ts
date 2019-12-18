import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OperatorFunction } from 'rxjs';
import { reduce } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TagInfoService {
  /* CACHE PROPS */
  public static POPULAR_TAGS = '/api/4/tags/popular';
  public static POPULAR_KEYS = '/api/4/keys/all';
  public static TAG_VALUES = 'tagValues';
  public static TAG_COMBINATIONS = 'tagCombinations';
  public static KEY_COMBINATIONS = 'keyCombinations';

  /* URL BUILDERS/STRINGS */
  static POPULAR_TAGS_URL = `${environment.taginfo}tags/popular?page=1&rp=20&sortname=count_all&sortorder=desc`;
  static POPULAR_KEYS_URL = `${environment.taginfo}keys/all?page=1&rp=20&filter=in_wiki&sortname=count_all&sortorder=desc`
  /**
   * Builds url for getting popular values for a given key
   * @param key {string} values' key
   * @return {string} tag values url...
   */
  static tagValuesUrl(key: string): string {
    return `${environment.taginfo}key/values?key=${key}&page=1&rp=50&sortname=count_ways&sortorder=desc`;
  }

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
   * Builds url for getting specific key combinations
   * @param key {string} combo key
   * @param value {string} combo value
   * @return {string} key combinations url string...
   */
  static keyCombinationsUrl(key: string, value: string): string {
    return `${environment.taginfo}key/combinations?key=${key}&value=${value}&page=1&rp=50&sortname=together_count&sortorder=desc`;
  }

  static reducer(resource: string): OperatorFunction<any, any> {
    let nameKey: string, valKey: string;
    if (resource === this.POPULAR_TAGS_URL || resource === this.POPULAR_KEYS_URL) {
      nameKey = 'key';
      valKey = 'key';
    } else if (resource.indexOf(`${environment.taginfo}key/values`) === 0) {
      nameKey = 'value';
      valKey = 'value';
    } else if (resource.indexOf(`${environment.taginfo}tag/combinations`) === 0
            || resource.indexOf(`${environment.taginfo}key/combinations`) === 0) {
      nameKey = 'other_key';
      valKey = 'other_key';
    }

    return reduce((data: Array < any >, response: any) => {
      response.data.forEach((datum: any) => {
        var serializedDatum = {
          name: datum[nameKey],
          value: datum[valKey]
        }
        if (data.findIndex(d => d.name === serializedDatum.name) > -1) {
          return;
        }
        data.push(serializedDatum)
      })
      return data.sort(function (a, b) {
        return (a.name > b.name) ? 1 : -1
      });
    }, [])
  }

  constructor() {}
  /**
   * Returns Observable with tag values selectize options, be it from cache or an http request
   * @param key {string} key to get tag values for...
   * @return {Observable<SelectizeOption[]>}
   */
  // tagValues(key: string) {
  //   return this.http.get(TagInfoService.tagValuesUrl(key))
  //     .pipe(TagInfoService.reducer('value', 'value'))
  // }

  /**
   * Return Observable with tag combinations for given key/value selectize options, be it from cache or an http request
   * @param key {string} combination key
   * @param value {string} combination value
   * @return {Observable<SelectizeOption[]>}
   */
  // tagCombinations(key:string, value: string) {
  //   return this.http.get(TagInfoService.tagCombinationsUrl(key, value))
  //     .pipe(TagInfoService.reducer('other_key', 'other_key'));
  // }

  /**
   * Return Observable with tag combinations for given key/value selectize options, be it from cache or an http request
   * @param key {string} combination key
   * @param value {string} combination value
   * @return {Observable<SelectizeOption[]>}
   */
  // keyCombinations(key: string, value: string) {
    // return this.http.get(TagInfoService.keyCombinationsUrl(key, value))
      // .pipe(TagInfoService.reducer('other_key', 'other_key'))
    // 'https://taginfo.openstreetmap.org/api/4/key/combinations?key=amenity&value=clinic&page=1&rp=10&sortname=together_count&sortorder=desc'
    // return of([]);
  // }
}