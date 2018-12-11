import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { AttributionComponent } from '../../modules/attribution/attribution.component';

import { MapRulesService } from '../../core/services/maprules.service';
import { NavigationService } from '../../core/services/navigation.service';

declare var $: any;

@Component({
  exportAs: 'edit-maprule',
  selector: 'edit-maprule',
  template: ` <attribution
                #form="attribution" [configId] = configId [name]=name>
              </attribution>
  `
})
export class EditMapRuleComponent implements AfterViewInit {
  configId: string;
  name: number;
  @ViewChild(AttributionComponent) form: AttributionComponent;
  constructor(
    private route: ActivatedRoute,
    private maprules: MapRulesService,
    private nav: NavigationService
  ) {}

  ngOnInit() {
    combineLatest(this.route.queryParams, this.route.params).subscribe(([queryParam, params]) => {
      const id = params['id'];
      if (id) {
        this.configId = id;
      }
      const name = queryParam['name'];
      if (name) {
        this.name = name;
      }
      const nav = queryParam['nav'];
      if (nav) {
        if (nav === 'hide') {
          this.nav.hide();
        } else {
          this.nav.show();
        }
      }
    });
  }

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    const app = this;
    window.addEventListener('message', function(event) {
      // TODO check if OAuth authorized app
      const message = event.data.split(':');
      if (message[0] === 'save') {
          app.save(message[1]);
      }
    });

  }

  save(configId: string) {
    this.maprules.save(configId, this.form.value).subscribe(
      data => {
        window.parent.postMessage(data['id'], '*');
      },
      error => {
        window.parent.postMessage('Failed to save MapRules. \n \n --- Error --- \n' + error, '*');
      }
    );
  }
}
