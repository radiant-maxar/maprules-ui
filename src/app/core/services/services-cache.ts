import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';

export class ServicesCache {
  $cache = new Map();
  $inflight = new Map();

  putInflight(url: string) {
    this.$inflight.set(url, true);
  }

  isInflight(url: string) {
    return this.$inflight.get(url);
  }

  removeInflight(url: string) {
    this.$inflight.delete(url);
  }

  get(req: HttpRequest<any>): HttpResponse<any> | undefined {
    const url = req.urlWithParams;
    const cached = this.$cache.get(url);

    return cached ? cached.response : undefined;
  }

  put (req: HttpRequest<any>, response: HttpResponse<any>) : void {
    const url = req.url;
    this.$cache.set(url, { url, response })
  }

}