import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-view-disabled-feature',
  templateUrl: './view-disabled-feature.component.html',
  styleUrls: [
      '../../shared/components/content.group.css',
    '../../edit-maprule/preset/preset.component.css',
    '../../shared/components/combobox/combobox.component.css',
    '../view-preset/view-preset.component.css'
  ]
})
export class ViewDisabledFeatureComponent implements OnInit {
  @ViewChild('viewDisabledFeature') viewDisabledFeature: ElementRef;

  private _disabledFeatures: any[];
  @Input() set disabledFeatures(disabledFeatures: any[]) {
    this._disabledFeatures = disabledFeatures;
  }

  constructor() { }

  ngOnInit() { }

  private showDisabledFeaturePanel() {
    let viewDisabledFeatureHeader = this.viewDisabledFeature.nativeElement.querySelector('.preset-card-header');
    let viewDisabledFeatureIcon = viewDisabledFeatureHeader.querySelector('#show-preset-button i');
    let viewDisabledFeaturePanel = this.viewDisabledFeature.nativeElement.querySelector('.preset-card-panel');
    if (viewDisabledFeatureHeader.classList.contains('preset-card-panel-header-hidden')) {
      viewDisabledFeatureHeader.classList.remove('preset-card-panel-header-hidden');
      viewDisabledFeatureIcon.classList.replace('fa-plus-square-o', 'fa-minus-square-o');
      viewDisabledFeaturePanel.classList.remove('preset-card-panel-hidden');
    } else {
      viewDisabledFeatureHeader.classList.add('preset-card-panel-header-hidden');
      viewDisabledFeatureIcon.classList.replace('fa-minus-square-o', 'fa-plus-square-o');
      viewDisabledFeaturePanel.classList.add('preset-card-panel-hidden');
    }
  }

}
