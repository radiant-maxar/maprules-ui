import { Component, OnInit } from '@angular/core';
import { MapRulesService } from '../core/services/maprules.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: [
      '../shared/components/content.group.css',
      '../edit-maprule/preset/preset.component.css',
      '../view-maprule//view-maprule.component.css',
      '../view-maprule/view-preset/view-preset.component.css',
      './explore.component.css'
  ]
})
export class ExploreComponent implements OnInit {

  presets: Array<any> = [];

  // when it starts, go get all maprules list
  // then render...
  constructor(
      private maprules: MapRulesService,
      private router: Router
  ) {}

  ngOnInit() {
      this.maprules.explore().subscribe(
          (resp: any) => {
              if (resp.ok) {
                  resp.json().then((explorePresets: any) => {
                      this.presets = explorePresets;
                  })
              }
          }
      )
  }

  openView(id: string) {
      if (id.length) {
          this.router.navigateByUrl(`/${id}/start`);
      }
  }

  openEdit(id: string) {
      if (id.length) {
          this.router.navigateByUrl(`/${id}/edit`);
      }
  }
}
