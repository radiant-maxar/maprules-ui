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

  get(url: string): HttpResponse<any> | undefined {
    return this.$cache.get(url);
  }

  put(url: string, response: HttpResponse<any>): void {
    this.$cache.set(url, { url, response });
  }
}
