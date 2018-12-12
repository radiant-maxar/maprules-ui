import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceCacheInterceptor } from './service-cache-interceptor';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TagInfoService {
  /* CACHE PROPS */
  public static POPULAR_TAGS = '/api/4/tags/popular';
  public static TAG_VALUES = 'tagValues';
  public static TAG_COMBINATIONS = 'tagCombinations';

  /* URL BUILDERS/STRINGS */
  static POPULAR_TAGS_URL = `${environment.taginfo}tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc`;

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

  constructor(private http: HttpClient) { }

  /**
   * Returns Observable with popular tags selectize options, be it from cache or an http request
   * @return {Observable<SelectizeOption[]>} popular tag values' observable
   */
  popularTags() {
    return this.http.get(TagInfoService.POPULAR_TAGS_URL)
      .pipe(ServiceCacheInterceptor.getMapper(TagInfoService.POPULAR_TAGS));
  }

  /**
   * Returns Observable with tag values selectize options, be it from cache or an http request
   * @param key {string} key to get tag values for...
   * @return {Observable<SelectizeOption[]>}
   */
  tagValues(key: string) {
    return this.http.get(TagInfoService.tagValuesUrl(key))
      .pipe(ServiceCacheInterceptor.getMapper(TagInfoService.TAG_VALUES));
  }

  /**
   * Return Observable with tag combinations for given key/value selectize options, be it from cache or an http request
   * @param key {string} combination key
   * @param value {string} combination value
   * @return {Observable<SelectizeOption[]>}
   */
  tagCombinations(key:string, value: string) {
    return this.http.get(TagInfoService.tagCombinationsUrl(key, value))
      .pipe(ServiceCacheInterceptor.getMapper(TagInfoService.TAG_COMBINATIONS));
  }
}
