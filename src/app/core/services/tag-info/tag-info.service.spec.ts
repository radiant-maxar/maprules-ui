import { TestBed, inject } from "@angular/core/testing";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TagInfoService } from "./tag-info.service";
import { environment } from "../../../../environments/environment";
import { ServiceRequestInterceptor } from "../test/service-request-interceptor";
import { OperatorFunction } from "rxjs";

describe("TagInfoService", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ 
        TagInfoService, 
        { provider: HTTP_INTERCEPTORS, useClass: ServiceRequestInterceptor, multi: true }
      ]
    });
  });

  afterEach(() => {
  });

  it("should be created", inject(
    [TagInfoService],
    (service: TagInfoService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe("getCache", () => {
    it("calls api only once... otherwise, it uses the service cache", inject(
      [TagInfoService],
      (service: TagInfoService) => {
        let numCalls = 0;
        const mappers: Array<OperatorFunction<any,any>> = [
          service.popularTagsMapper(), 
          ServiceRequestInterceptor.counterMapper(numCalls)
        ]

        // ask for cache multiple times, still just 1 api call...
        for (let i: number = 0; i < 5; i++) {
          service
            .getCache(TagInfoService.POPULAR_TAGS_URL, TagInfoService.POPULAR_TAGS, mappers)
            .subscribe(observer => observer.next(() => { expect(numCalls).toEqual(1)  }))
        }
      })
    );
  });
});
