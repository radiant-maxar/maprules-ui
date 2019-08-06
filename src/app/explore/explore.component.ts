import { Component, OnInit } from '@angular/core';
import { MapRulesService } from '../core/services/maprules.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  presets: Array<any> = [];

  // when it starts, go get all maprules list
  // then render...
  constructor(private maprules: MapRulesService) {
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

  ngOnInit() {
  }

}
