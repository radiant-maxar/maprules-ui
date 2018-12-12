import { HttpResponse } from "@angular/common/http";

export interface ServicesCacheEntry {
  url: string;
  response: HttpResponse<any>;
}