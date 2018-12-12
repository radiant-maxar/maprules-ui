import { TestBed, inject } from '@angular/core/testing';
import { ServicesCache } from 'src/app/core/services/services-cache';
import { HttpResponse, HttpRequest } from '@angular/common/http';

describe('ServicesCache', () => {
  let servicesCache: ServicesCache;
  const osm: string = 'https://osm.org';
  const request: HttpRequest<any> = new HttpRequest('GET', osm);
  const response: HttpResponse<any> = new HttpResponse();
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServicesCache]
    });
    servicesCache = TestBed.get(ServicesCache);
  });
  it('should be created', inject(
    [ServicesCache],
    (service: ServicesCache) => {
      expect(service).toBeTruthy();
    }
  ));
  describe('#putInflight', () => {
    it('adds to inflight cache', () => {
      servicesCache.putInflight('https://osm.org');
      expect(servicesCache.$inflight.size).toEqual(1);
    });
  });
  describe('#isInflight', () => {
    it('indicates if certain request is currently inflight', () => {
      servicesCache.putInflight('https://osm.org');
      expect(servicesCache.isInflight('https://osm.org')).toBeTruthy();
    });
  });
  describe('#removeInflight', () => {
    it('removes from inflight cache', () => {
      servicesCache.putInflight(osm)
      expect(servicesCache.$inflight.size).toEqual(1);
      servicesCache.removeInflight(osm)
      expect(servicesCache.$inflight.size).toEqual(0);
    });
  });
  describe('#get', () => {
    it ('gets what\'s in cache', () => {
      servicesCache.put(request, response);
      expect(servicesCache.$cache.size).toEqual(1);
    });
  });
  describe('#put', () => {
    it('adds to request cache', () => {
      servicesCache.put(request, new HttpResponse());
      expect(servicesCache.$cache.size).toEqual(1);
    });
  });
});
