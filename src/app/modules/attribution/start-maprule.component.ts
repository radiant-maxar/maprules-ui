import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapRulesService } from '../../core/services/maprules.service';
import { environment } from '../../../environments/environment';
import { fromEvent, timer } from 'rxjs';
import { debounce } from 'rxjs/operators';

declare var $: any;

@Component({
  exportAs: 'start-maprule',
  selector: 'start-maprule',
  styleUrls: [
    '../../shared/components/content.group.css',
    './start-maprule.component.css'
  ],
  templateUrl: './start-maprule.html',
  encapsulation: ViewEncapsulation.None
})
export class StartMapRuleComponent {
  configId: string;
  maprule: any;
  environment: any = environment;
  idUrl: string;
  josmUrl: string;
  closed: boolean;

  constructor(
     private route: ActivatedRoute,
     private router: Router,
     private maprules: MapRulesService
  ) {
    fromEvent(window, 'click')
      .pipe(debounce(() => timer(10)))
      .subscribe((e) => this.toggleCaret());
  }

  ngOnInit() {
    setTimeout(() => {
      this.closed = true;
      this.route.params.forEach(params => {
        const id = params['id'];
        if (id) {
          this.configId = id;
          this.idUrl = this.buildIdUrl();
          this.josmUrl = this.buildJosmUrl();
          this.maprules.getMapRule(this.configId).subscribe(data => {
            this.maprule = data;
          });
        }
      });
    });
  }

  toEdit(): void {
    this.router.navigateByUrl(`/${this.configId}/edit`);
  }

  buildIdUrl(): string {
    const base = `${environment.maprules}/config/${this.configId}`;
    const osm = `${environment.osm}#background=Bing&disable_features=boundaries`;
    return decodeURIComponent(`${osm}&presets=${base}/presets/iD&validations=${base}/rules/iD`);
  }

  buildJosmUrl(): string {
    return decodeURIComponent(`${environment.josm}/load_maprules?id=${this.configId}`);
  }

  getTagsByKeyCondition(i: number, keyCondition: number) {
    return this.maprule.presets[i].fields.filter(guideline => {
        return guideline.keyCondition === keyCondition;
    });
  }

  toggleCaret(): void {
    this.closed = !$('.edit-with-tooltip').length;
  }

}
