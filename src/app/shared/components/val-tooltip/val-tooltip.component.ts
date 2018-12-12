import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-val-tooltip',
  templateUrl: './val-tooltip.component.html',
  styleUrls: ['./val-tooltip.component.css', '../tags/tags.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ValTooltipComponent implements OnInit {
  _vals: Array<string>;
  _id: string;
  closed: boolean;

  @Input()
  set vals(newVals: Array<string>) {
    this._vals = newVals;
  }

  ngOnInit() {}

}
