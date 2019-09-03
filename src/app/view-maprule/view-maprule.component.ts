import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MapRulesService } from '../core/services/maprules.service';
import { NavigationService } from '../core/services/navigation.service';

@Component({
  selector: 'app-view-maprule',
  templateUrl: './view-maprule.component.html',
  styleUrls: [
    '../shared/components/content.group.css',
    './view-maprule.component.css'
  ]
})
export class ViewMapRuleComponent implements OnInit {
  maprule: any;

  constructor(
    private maprules: MapRulesService,
    private nav: NavigationService,
    private route: ActivatedRoute
  ) { }

  getMapRules(): MapRulesService {
      return this.maprule;
  }

  ngOnInit() {
    let nav = this.route.snapshot.queryParams.nav;
    if (nav && nav === 'hide') {
      this.nav.toggle();
    }
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

}
