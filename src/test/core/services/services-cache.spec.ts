import { TestBed, inject } from '@angular/core/testing';
import { ServicesCache } from 'src/app/core/services/services-cache';
import { HttpResponse } from '@angular/common/http';

describe('ServicesCache', () => {
  let servicesCache: ServicesCache;
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
      servicesCache.putInflight('https://osm.org');
      expect(servicesCache.$inflight.size).toEqual(1);
      servicesCache.removeInflight('https://osm.org');
      expect(servicesCache.$inflight.size).toEqual(0);
    });
  });
  describe('#get', () => {
    it ('gets what\'s in cache', () => {
      const response: HttpResponse<any> = new HttpResponse();
      servicesCache.put('https://osm.org', response);
      expect(servicesCache.$cache.size).toEqual(1);
    });
  });
  describe('#put', () => {
    it('adds to request cache', () => {
      servicesCache.put('https://osm.org', new HttpResponse());
      expect(servicesCache.$cache.size).toEqual(1);
    });
  });
});
