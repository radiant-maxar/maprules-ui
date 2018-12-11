import { TestBed, inject } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TagInfoService } from '../../../app/core/services/tag-info.service';
import { ServiceCacheInterceptor } from 'src/app/core/services/service-cache-interceptor';
import { ServicesCache } from 'src/app/core/services/services-cache';

describe('TagInfoService', () => {
  let service: TagInfoService;
  let httpMock: HttpTestingController;

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
  const popularTagsCache: any = [
    { "key": "building", "value": { "text": "building", "value": "building" } },
    { "key": "highway", "value": { "text": "highway", "value": "highway" } }
  ]
  const tagValuesResponse: any = {
    url: "https://taginfo.openstreetmap.org/api/4/key/values?key=building&page=1&rp=50&sortname=count_ways&sortorder=desc",
    data_until: "2018-12-11T00:58:55Z",
    page: 1,
    rp: 50,
    total: 10389,
    data: [
      {
        value: "yes",
        count: 268955891,
        fraction: 0.8258,
        in_wiki: true,
        description: null,
        desclang: "en",
        descdir: "ltr"
      },
      {
        value: "house",
        count: 28990412,
        fraction: 0.089,
        in_wiki: true,
        description: "A single dwelling unit usually inhabited by one family.",
        desclang: "en",
        descdir: "ltr"
      }
    ]
  }
  const tagValuesCache: any = [
    { text: 'yes', value: 'yes' },
    { text: 'house', value: 'house' }
  ];
  const valueCombinationsReponse: any = {
    url: "https://taginfo.openstreetmap.org/api/4/tag/combinations?key=building&value=yes&page=1&rp=50&sortname=together_count&sortorder=desc",
    data_until: "2018-12-11T00:58:55Z",
    page: 1,
    rp: 50,
    total: 1425,
    data: [
      {
        other_key: "source",
        other_value: "",
        together_count: 77733035,
        to_fraction: 0.289,
        from_fraction: 0.4032
      },
      {
        other_key: "addr:housenumber",
        other_value: "",
        together_count: 24438833,
        to_fraction: 0.0909,
        from_fraction: 0.2887
      },
      {
        other_key: "wall",
        other_value: "",
        together_count: 11807929,
        to_fraction: 0.0439,
        from_fraction: 0.9813
      },
      {
        other_key: "wall",
        other_value: "no",
        together_count: 11803852,
        to_fraction: 0.0439,
        from_fraction: 0.9961
      },
      {
        other_key: "source",
        other_value: "cadastre-dgi-fr source : Direction Générale des Impôts - Cadastre. Mise à jour : 2010",
        together_count: 10888480,
        to_fraction: 0.0405,
        from_fraction: 0.919
      }
    ]
  }
  const valueCombinationsCache: any = {
    source: ['cadastre-dgi-fr source : Direction Générale des Impôts - Cadastre. Mise à jour : 2010'],
    'addr:housenumber': [],
    'wall': ['no']
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TagInfoService,
        ServicesCache,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ServiceCacheInterceptor,
          multi: true,
        },
      ],
    });
    service = TestBed.get(TagInfoService);
    httpMock = TestBed.get(HttpTestingController);
  });
  it('should be created', inject(
    [TagInfoService],
    (service: TagInfoService) => {
      expect(service).toBeTruthy();
    }
  ));

  describe('#popularTags', () => {
    it('calls api only once... otherwise, it uses the service cache', () => {
      service.popularTags().subscribe((data) => {
        expect(data).toEqual(popularTagsCache);
        service.popularTags().subscribe((data) => {
          expect(data).toEqual(popularTagsCache)
        })
        httpMock.expectNone(TagInfoService.POPULAR_TAGS_URL);
      })
      const req = httpMock.expectOne(TagInfoService.POPULAR_TAGS_URL);
      expect(req.request.method).toEqual('GET');
      req.flush(popularTagsResponse);
      httpMock.verify();
    })
  });
  describe('#tagValues', () => {
    it('calls api only once... otherwise, it uses the service cache', () => {
      service.tagValues('building').subscribe((data) => {
        expect(data).toEqual(tagValuesCache);
        service.tagValues('building').subscribe((data) => {
          expect(data).toEqual(tagValuesCache);
          httpMock.expectNone(TagInfoService.tagValuesUrl('building'))
        })
      })
      const req = httpMock.expectOne(TagInfoService.tagValuesUrl('building'));
      expect(req.request.method).toEqual('GET');
      req.flush(tagValuesResponse);
      httpMock.verify()
    });
  });
  describe('#tagCombinations', () => {
    it('calls api only once... otherwise, it uses the service cache', () => {
      service.tagCombinations('building', 'yes').subscribe((data) => {
        expect(data).toEqual(valueCombinationsCache);
        service.tagCombinations('building', 'yes').subscribe((data) => {
          expect(data).toEqual(valueCombinationsCache);
          httpMock.expectNone(TagInfoService.tagCombinationsUrl('building', 'yes'));
        })
      });
      const req = httpMock.expectOne(TagInfoService.tagCombinationsUrl('building', 'yes'));
      expect(req.request.method).toEqual('GET');
      req.flush(valueCombinationsReponse);
      httpMock.verify();
    })
  });
});
