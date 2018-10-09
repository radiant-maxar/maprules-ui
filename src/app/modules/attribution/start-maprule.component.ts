import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { AttributionComponent } from '../../modules/attribution/attribution.component';
import { FieldConfigService } from '../../core/services/field-config.service';
import { MapRulesService } from '../../core/services/maprules.service';
import { environment } from '../../../environments/environment';

declare var $: any;

@Component({
  exportAs: 'start-maprule',
  selector: 'start-maprule',
  styleUrls: ['../../shared/components/content.group.css', './start-maprule.component.css'],
  templateUrl: './start-maprule.html'

})
export class StartMapRuleComponent {
  configId: string;
  maprule: any;
  environment: any = environment;

  constructor(
     private route: ActivatedRoute,
     private router:
     Router, private fieldConfig:
     FieldConfigService, private maprules: MapRulesService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.route.params.forEach(params => {
        const id = params['id'];
        if (id) {
          this.configId = id;
          this.maprules.getMapRule(this.configId).subscribe(data => {
            this.maprule = data;
            $('#iDlink').attr('href', this.idUrl);
            $('#josmLink').attr('href', this.josmUrl);
          });
        }
      });
    });
  }

  get idUrl(): string {
    const base = `${environment.maprules}/config/${this.configId}`;
    return decodeURIComponent(`${environment.osm}?presets?${base}/presets/iD&validations=${base}/rules/iD`);
  }

  get josmUrl(): string {
    return decodeURIComponent(`${environment.josm}/load_maprules?id=${this.configId}`);
  }

  getTagsByKeyCondition(i: number, keyCondition: number) {
    return this.maprule.presets[i].fields.filter(guideline => {
        return guideline.keyCondition === keyCondition;
    });
  }

}
