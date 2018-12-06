import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent
} from "@angular/common/http";

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// reference: https://medium.com/@lanoTechno/intro-to-angular-http-interceptors-and-how-to-create-backendless-app-with-them-3593f6552b3a
export class ServiceRequestInterceptor implements HttpInterceptor {
  static GET: string = "GET";

  static POPULAR_TAGS: string = "/api/4/tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc";
  static POPULAR_TAGS_RESPONSE: any = {
    url:
      "https://taginfo.openstreetmap.org/api/4/tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc",
    data_until: "2018-12-06T00:59:00Z",
    page: 1,
    rp: 2,
    total: 2442,
    data: [
      {
        key: "building",
        value: "yes",
        in_wiki: 1,
        count_all: 268508137,
        count_all_fraction: 0.0492,
        count_nodes: 383161,
        count_nodes_fraction: 0.0028,
        count_ways: 267701893,
        count_ways_fraction: 0.4884,
        count_relations: 423083,
        count_relations_fraction: 0.0659,
        projects: 7
      },
      {
        key: "highway",
        value: "residential",
        in_wiki: 1,
        count_all: 43216378,
        count_all_fraction: 0.0079,
        count_nodes: 3474,
        count_nodes_fraction: 0.0,
        count_ways: 43211542,
        count_ways_fraction: 0.0788,
        count_relations: 1362,
        count_relations_fraction: 0.0002,
        projects: 20
      }
    ]
  };

  intercept(req: HttpRequest<any>,next: HttpHandler): 
    Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
  
    if (this.gets(req, ServiceRequestInterceptor.POPULAR_TAGS)) {
      return new Observable(observer => {
        observer.next(
          new HttpResponse<Array<any>>({
            body: ServiceRequestInterceptor.POPULAR_TAGS_RESPONSE,
            status: 200
          })
        );
        observer.complete();
      });
    }

    return next.handle(req);
  }

  private gets(req: HttpRequest<any>, endpoint: string): boolean {
    return (
      req.url.endsWith(endpoint) && req.method === ServiceRequestInterceptor.GET
    );
  }

  public static counterMapper(count: number): any {
    return map((datum) => { count++; return datum });
  }
}
