import { ServicesCacheEntry } from './services-cache-entry';
import { HttpResponse, HttpRequest } from '@angular/common/http';

export class ServicesCache {
  $cache = new Map<String, ServicesCacheEntry>();
  $inflight = new Map<String, boolean>();

  /**
   * Makes request is currently inflight
   * @param url {string}
   */
  putInflight(url: string) {
    this.$inflight.set(url, true);
  }

  /**
   * Tells if request is inflight
   * @param url {string}
   */
  isInflight(url: string) {
    return this.$inflight.get(url);
  }

  /**
   * Removes request from inflight cache
   * @param url {string}
   */
  removeInflight(url: string) {
    this.$inflight.delete(url);
  }

  /**
   * Gets cached response...
   * @param req {HttpRequest<any>}
   * @param res {HttpResponse<any>}
   * @return {HttpResponse<any> | null}
   */
  get(req: HttpRequest<any>): HttpResponse<any> | null {
    const entry = this.$cache.get(req.url);
    if (!entry) {
      return null;
    }
    return entry.response;
  }

  /**
   * Adds response to cache...
   * @param req {HttpRequest<any>}
   * @param res {HttpResponse<any>}
   */
  put(req: HttpRequest<any>, res: HttpResponse<any>): void {
    const entry: ServicesCacheEntry = {
      url: req.urlWithParams,
      response: res
    };
    this.$cache.set(req.urlWithParams, entry)
  }
}