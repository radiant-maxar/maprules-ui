import { Component, OnInit, Input } from '@angular/core';
import { fromEvent, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { TagsConfig } from './tags-config';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {
  _config: TagsConfig;

  @Input()
  set config(tags: any) {
    this._config = <TagsConfig> {
      tags: <object> tags,
      hasValues: <boolean> (tags.values && tags.values.length > 0),
      screen: <string> (this.isDesktop() ? 'desktop' : 'mobile')
    };

  }

  // observe window resizes to update mobile...
  constructor() {
    fromEvent(window, 'resize')
      .pipe(debounce(() => timer(10)))
      .subscribe((e) => this.setScreenType());
  }

  ngOnInit() {}


  decodeConditionClass(keyCondition: number): string {
    switch (keyCondition) {
      case 0 : return 'must-not';
      case 1 : return 'must';
      case 2 : return 'may';
      default: return '';
    }
  }

  isDesktop(): boolean {
    return window.innerWidth > 660;
  }

  setScreenType(): void {
    if (this.isDesktop()) {
      this._config.screen = 'desktop';
    } else {
      this._config.screen = 'mobile';
    }
  }

}
