import { TestBed, inject } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MapRulesService } from 'src/app/core/services/maprules.service';
import { ServiceCacheInterceptor } from 'src/app/core/services/service-cache-interceptor';
import { ServicesCache } from 'src/app/core/services/services-cache';

import { environment } from 'src/environments/environment';

describe('MapRulesService', () => {
  let service: MapRulesService;
  let httpMock: HttpTestingController;
  let testId: string = '5b374251-9592-4d66-bab7-0c265249636d';
  let testResponse: any = {
    'name': 'Public Health Campaign',
    'presets': [
      {
        'fields': [
          {
            'keyCondition': 1,
            'key': 'healthcare',
            'values': []
          }
        ],
        'geometry': ['area', 'point'],
        'name': 'Health Clinic',
        'primary': [
          { 'key': 'amenity', 'val': 'clinic' }
        ]
      },
      {
        'fields': [
          {
            'keyCondition': 2,
            'key': 'name',
            'values': []
          },
          {
            'keyCondition': 1,
            'key': 'source',
            'values': [
              {
                'valCondition': 1,
                'values': ['bing', 'dg']
              }
            ]
          },
          {
            'keyCondition': 1,
            'key': 'building',
            'values': [
              {
                'valCondition': 0,
                'values': ['house']
              }
            ]
          },
          {
            'keyCondition': 2,
            'key': 'opening_hours',
            'label': 'Opening Hours',
            'placeholder': '24/7, sunrise to sunset...',
            'values': [
              {
                'valCondition': 2,
                'values': ['24/7', 'sunrise to sunset']
              }
            ]
          },
          {
            'keyCondition': 2,
            'key': 'height',
            'values': [
              {
                'valCondition': 5,
                'values': ['0']
              }
            ]
          }
        ],
        'geometry': ['area'],
        'name': 'Market',
        'primary': [
          { 'key': 'amenity', 'val': 'marketplace' }
        ]
      },
      {
        'fields': [
          {
            'keyCondition': 2,
            'key': 'name',
            'values': []
          }
        ],
        'geometry': ['point'],
        'name': 'Water Tap',
        'primary': [
          { 'key': 'amenity', 'val': 'drinking_water' },
          { 'key': 'man_made', 'val': 'water_tap' }
        ]
      }
    ],
    'disabledFeatures': [
      { 'key': 'amenity', 'val': ['school'] }
    ]
  }


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MapRulesService,
        ServicesCache,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ServiceCacheInterceptor,
          multi: true,
        },
      ],
    });
    service = TestBed.get(MapRulesService);
    httpMock = TestBed.get(HttpTestingController);
  })
  it('should be created', inject(
    [MapRulesService],
    (maprules: MapRulesService) => {
      expect(maprules).toBeTruthy();
    }
  ))
  describe('#getMapRule', () => {
    it('gets config once then uses cached...', () => {
      const url = environment.maprules + '/config/' + testId;
      service.getMapRule(testId).subscribe(a => {
        expect(a).toEqual(testResponse);
        service.getMapRule(testId).subscribe(b => {
          expect(b).toEqual(b);
          httpMock.expectNone(url);
        })
      })
      const req = httpMock.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(testResponse);
      httpMock.verify();
    })
  })
})
