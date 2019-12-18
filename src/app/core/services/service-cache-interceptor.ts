import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpInterceptor,
  HttpHandler
} from '@angular/common/http';
import { ServicesCache } from './services-cache';
import { catchError, tap, first } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TagInfoService } from './tag-info.service';
import { environment } from 'src/environments/environment';

// Influenced by the following!
// -> https://fullstack-developer.academy/caching-http-requests-with-angular/
// -> https://www.concretepage.com/angular/angular-caching-http-interceptor

@Injectable()
export class ServiceCacheInterceptor implements HttpInterceptor {
  constructor(private cache: ServicesCache) { }

  /**
   * Intermediate step before http client sends a request usable to use cache when there
   * and also cache responses
   * @param req {HttpRequest<any>} request to interrogate regarding how it should be handled...
   * @param next {HttpHandler} handler we use when we send a request and don not use cache
   * @return {Observable<any>} Observable with response (be it from cache or endpoint)...
   */
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.shouldCache(req)) {
      return next.handle(req);
    }

    let requestObservable: Observable<any>;
    const cached = this.cache.get(req);

    if (cached !== null) {
      requestObservable = of(cached);
    } else {
      requestObservable = this.sendRequest(req, next, this.cache);
    }

    return requestObservable.pipe(
      catchError(e => {
        console.log(`REQUEST FAILED: ${TagInfoService.POPULAR_TAGS_URL}`);
        return of([]);
      })
    )
  }

  /**
   * Returns true if request is for resource we want to cache...
   * @param req {HttpRequest<any>} request we may want to cache
   * @return {boolean} true if GET operation and one of the pre-defined cache-ble endpoints...
   */
  shouldCache(req: HttpRequest<any>) {
    return (req.method === 'GET') && this.isCacheEndpoint(req.url);
  }

  /**
   * @type {string[]} array of routes we should cache...
   */
  private cacheEndpoints: string[] = [
    TagInfoService.POPULAR_TAGS_URL,
    TagInfoService.POPULAR_KEYS_URL,
    `${environment.taginfo}key/values?key=`,
    `${environment.taginfo}tag/combinations?`,
    `${environment.taginfo}key/combinations?`,
    `${environment.maprulesConfig}`
  ]

  /**
   * Tells if endpoint is for resource we want to cache...
   * @param requestUrl {string} the request url
   * @return {boolean} true if we should cache.
   */
  private isCacheEndpoint(requestUrl: string): boolean {
    return this.cacheEndpoints.findIndex(function(e: string) {
      return requestUrl.includes(e);
    }) !== -1;
  }

  /**
   * Sends a request and caches the response
   * @param {HttpRequest<any>} req HttpRequest to send/handle
   * @param {HttpHandler<any>} next Request Handler
     * @param {ServicesCache} cache the services cache to put responses...
   */
  sendRequest(req: HttpRequest<any>, next: HttpHandler, cache: ServicesCache) {
    const url: string = req.urlWithParams;
    cache.putInflight(url); // make sure cache is known as inflight to components...
    return next.handle(req).pipe(
      first(e => e instanceof HttpResponse), // only pass after we get an HttpResponse event...
      tap((res: HttpResponse<any>) => {
        cache.put(req, res); // cache the response!
        cache.removeInflight(url); // Say the request is done.
      })
    );
  }
}