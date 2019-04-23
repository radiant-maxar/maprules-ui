import { Component, OnInit } from '@angular/core';
import { MapRulesService } from '../core/services/maprules.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-start-maprule',
  templateUrl: './start-maprule.component.html',
  styleUrls: [
    '../icons/icon.component.css',
    '../edit-maprule/preset/preset.component.css',
    '../shared/components/content.group.css',
    '../view-maprule/view-maprule.component.css',
    './start-maprule.component.css'
  ]
})
export class StartMapRuleComponent implements OnInit {
  private maprule: any;

  private urlMaker: any = {
    iD: function (maprule: string) {
      let base = `${environment.maprules}/config/${maprule}`;
      let presets = `${base}/presets/iD`;
      let validations = `${base}/rules/iD`
      return `${environment.id}&presets=${presets}&validations=${validations}`
    },
    JOSM: function (maprule: string) {
      return `${environment.josm}/load_maprules?id=${maprule}`;
    }
  }

  constructor(
    private maprules: MapRulesService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
     this.route.params.subscribe(
      (next) => {
        if (next.hasOwnProperty('id')) {
          this.maprules.getMapRule(next.id).subscribe(
            (data: any) => {
              this.maprule = data;
            }
          )
        }
      },
      (error) => {
        console.log(error);
      }
    )
  }

  toEdit(): void {
    let id = this.route.snapshot.params.id;
    this.router.navigateByUrl(`/${id}/edit`)
  }

  editWith(editor: string): void {
    let id = this.route.snapshot.params.id;
    let url = this.urlMaker[editor](id);
    window.open(url, '_blank');
  }

}
