import { TestBed, inject } from '@angular/core/testing';
import { ServiceCacheInterceptor } from 'src/app/core/services/service-cache-interceptor';
import { ServicesCache } from 'src/app/core/services/services-cache';
import { HttpTestingController, HttpClientTestingModule, TestRequest } from '@angular/common/http/testing';
import { TagInfoService } from 'src/app/core/services/tag-info.service';
import { HTTP_INTERCEPTORS, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { retry, tap } from 'rxjs/operators';

describe('ServiceCacheInterceptor', () => {
  const popularTagsResponse: any = {
    url:
      'https://taginfo.openstreetmap.org/api/4/tags/popular?page=1&rp=2&sortname=count_all&sortorder=desc',
    data_until: '2018-12-06T00:59:00Z',
    page: 1,
    rp: 2,
    total: 2442,
    data: [
      {
        key: 'building',
        value: 'yes',
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
        key: 'highway',
        value: 'residential',
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
  let servicesCache: ServicesCache;
  let tagInfo: TagInfoService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ServiceCacheInterceptor,
        ServicesCache,
        TagInfoService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ServiceCacheInterceptor,
          multi: true,
        },
      ]
    });
    servicesCache = TestBed.get(ServicesCache);
    tagInfo = TestBed.get(TagInfoService);
    httpMock = TestBed.get(HttpTestingController);
  });
  it('should be created', inject(
    [ServiceCacheInterceptor],
    (service: ServiceCacheInterceptor) => {
      expect(service).toBeTruthy();
    }
  ));
  describe('#intercept', () => {
    it('intercepts and prevent multiple successive requests to single endpoint', () => {
      const getPopular = tagInfo.popularTags();
      getPopular.subscribe(() => { // popularTags leads to intercept...
        getPopular.subscribe();
        httpMock.expectNone(TagInfoService.POPULAR_TAGS_URL);
      });

      const req = httpMock.expectOne(TagInfoService.POPULAR_TAGS_URL);
      expect(req.request.method).toEqual('GET');
      req.flush(popularTagsResponse);
      httpMock.verify();
    });
    it('caches responses, using cache after 1st request to given url', () => {
      const getPopular = tagInfo.popularTags();
      getPopular.subscribe(() => {
        const cached: any = servicesCache.get(TagInfoService.POPULAR_TAGS_URL);
        expect(cached).toBeTruthy(); // response has been cached.
      });
      const req = httpMock.expectOne(TagInfoService.POPULAR_TAGS_URL);
      expect(req.request.method).toEqual('GET');
      req.flush(popularTagsResponse);
      httpMock.verify();
    });
  });
});
