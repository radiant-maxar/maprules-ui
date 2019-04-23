import { Component, OnInit, Input, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FieldConfigService } from 'src/app/core/services/field-config.service';

@Component({
  selector: 'app-view-preset',
  templateUrl: './view-preset.component.html',
  styleUrls: [
    '../../shared/components/content.group.css',
    '../../edit-maprule/preset/preset.component.css',
    // '../../edit-maprule/form-table.css',
    '../../shared/components/combobox/combobox.component.css',
    './view-preset.component.css'
  ]
})
export class ViewPresetComponent implements OnInit {
  private _presets: any[];
  @Input() set presets(presets: any[]) {
    this._presets = presets;
  }

  @ViewChildren('viewPreset') viewPresets: QueryList<any>;

  constructor() { }

  ngOnInit() {
  }

  private tagCondition(fields: any, condition: number): any[] {
    return fields.filter(function (field) {
      return field.keyCondition === condition;
    })
  }

  tagValuesCondition(tagValues: any[], condition: number) {
    return tagValues.length ? tagValues[0].valCondition === condition : condition === 1; // if no values specified, render as 'may be'
  }

  private keyCondition(condition: number): String {
    return FieldConfigService.KEY_CONDITIONS[condition];
  }

  private valCondition(values: any): String {
    let condition;
    if (values.length) {
      condition = values.length ? values[0].valCondition : 0
    } else {
      condition = 1;
    }

    return FieldConfigService.VAL_CONDITIONS[condition];
  }

  private tagValues(tagValues: any[]) {
    if (!tagValues.length) {
      return ['*']
    } else {
      return tagValues[0].values;
    }
  }

  private showPresetPanel(presetIndex: number) {
    let viewPreset = this.viewPresets.toArray()[presetIndex];
    let viewPresetHeader = viewPreset.nativeElement.querySelector('.preset-card-header');
    let viewPresetIcon = viewPresetHeader.querySelector('#show-preset-button i');
    let viewPresetPanel = viewPreset.nativeElement.querySelector('.preset-card-panel');
    if (viewPresetHeader.classList.contains('preset-card-panel-header-hidden')) {
      viewPresetHeader.classList.remove('preset-card-panel-header-hidden');
      viewPresetIcon.classList.replace('fa-plus-square-o', 'fa-minus-square-o');
      viewPresetPanel.classList.remove('preset-card-panel-hidden');
    } else {
      viewPresetHeader.classList.add('preset-card-panel-header-hidden');
      viewPresetIcon.classList.replace('fa-minus-square-o', 'fa-plus-square-o');
      viewPresetPanel.classList.add('preset-card-panel-hidden');
    }
  }
}
