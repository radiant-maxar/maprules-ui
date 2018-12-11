import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpInterceptor,
  HttpHandler
} from '@angular/common/http';
import { ServicesCache } from './services-cache';
import { catchError, map, reduce, tap, first } from 'rxjs/operators';
import { of } from 'rxjs';
import { OperatorFunction } from 'rxjs';

import { TagInfoService } from './tag-info.service';
import { SelectizeOption } from '../../shared/interfaces/selectize-option.interface';

// Influenced by -> https://fullstack-developer.academy/caching-http-requests-with-angular/

@Injectable()
export class ServiceCacheInterceptor implements HttpInterceptor {
  static getMapper(prop: string): OperatorFunction<any, any> {
    if (prop === TagInfoService.POPULAR_TAGS) {
      return ServiceCacheInterceptor.popularTagsMapper();
    } else if (prop === TagInfoService.TAG_COMBINATIONS) {
      return ServiceCacheInterceptor.tagCombosMapper();
    } else if (prop === TagInfoService.TAG_VALUES) {
      return ServiceCacheInterceptor.tagValuesMapper();
    }
  }

  /* CACHE OPERATOR FUNCTIONS */
  /* these are functions that take tagInfo responses and make them understandable to the ui... */

  /**
   * returns popular tags resource's OperatorFunction
   * @return {OperatorFunction}
   */
  static popularTagsMapper(): OperatorFunction<any, any> {
    return reduce((data: Array<any>, response: any) => {
      response.data.forEach((datum: any) => {
        data.push({
          key: datum.key,
          value: <SelectizeOption>{ text: datum.key, value: datum.key }
        });
      });
      return data;
    }, []);
  }

  /**
   * returns a tag values resource's OperatorFunction
   * @return {OperatorFunction}
   */
  static tagValuesMapper(): OperatorFunction<any, any> {
    return reduce((data: Array<SelectizeOption>, response: any): any => {
      response.data.forEach((datum: any) => {
        data.push(<SelectizeOption>{ text: datum.value, value: datum.value });
      });
      return data;
    }, []);
  }

  /**
   * returns a tag combo resource's OperatorFunction
   * @return {OperatorFunction}
   */
  static tagCombosMapper(): OperatorFunction<any, any> {
    return reduce((tagCombos, response: any): any => {
      // turns array of single key/value combos into map of keys and each of their possible values...
      response.data.forEach((datum: any) => {
        const currentValues = (tagCombos[datum.other_key] || []);
        if (datum.other_value.length > 0) {
          currentValues.push(datum.other_value);
        }
        tagCombos[datum.other_key] = currentValues;
      });
      return tagCombos;
    }, {});
  }

  constructor(private cache: ServicesCache) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cache = this.cache;
    const cached = cache.get(req.urlWithParams);
    return (cached ? of(cached) : this.sendRequest(req, next, cache))
      .pipe(
        catchError(e => { // catch error, log it, and just return mock of api request...
          console.log(`REQUEST FAILED: ${TagInfoService.POPULAR_TAGS_URL}`);
          return of([]);
        })
      );
  }

  sendRequest(req: HttpRequest<any>, next: HttpHandler, cache: ServicesCache) {
    const url: string = req.urlWithParams;
    cache.putInflight(url);
    return next.handle(req).pipe(
      first((e: any) => e instanceof HttpResponse),
      tap((e: any) => {
        cache.removeInflight(url);
        cache.put(url, e);
      })
    );
  }
}
