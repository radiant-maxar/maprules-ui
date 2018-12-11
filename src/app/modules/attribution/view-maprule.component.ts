import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { AttributionComponent } from '../../modules/attribution/attribution.component';
import { FieldConfigService } from '../../core/services/field-config.service';
import { MapRulesService } from '../../core/services/maprules.service';
import { NavigationService } from '../../core/services/navigation.service';
import { combineLatest } from 'rxjs';

declare var $: any;

@Component({
  exportAs: 'view-maprule',
  selector: 'view-maprule',
  styleUrls: [
    '../../shared/components/content.group.css',
    './view-maprule.css',
    '../../icons/icon.component.css',
    '../../shared/components/tags/tags.component.css'

  ],
  templateUrl: './view-maprule.html',
  encapsulation: ViewEncapsulation.None
})
export class ViewMapRuleComponent {
  configId: string;
  maprule: any;

  @Input() valCondition: any;

  constructor(
     private route: ActivatedRoute,
     private router: Router,
     private fieldConfig: FieldConfigService,
     private maprules: MapRulesService,
     private nav: NavigationService) {
  }

  ngOnInit() {
    setTimeout(() => {
      combineLatest(this.route.queryParams, this.route.params).subscribe(([queryParam, params]) => {
        const id: string = params['id'];
        if (id) {
          this.configId = id;
          this.maprules.getMapRule(this.configId).subscribe(data => {
            this.maprule = data;
          });
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
    });
  }

  getTagsByKeyCondition(i: number, keyCondition: number) {
    return this.maprule.presets[i].fields.filter(guideline => {
        return guideline.keyCondition === keyCondition;
    });
  }

}
