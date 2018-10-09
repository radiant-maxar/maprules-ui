import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap'; 

@Component({
  selector: 'entity-input',
  template: `
      <ng-container [formGroup]="group">
        <ng-container formArrayName="presets">
          <ng-container [formGroupName]="nestedGroupIndex">
              <input [formControlName]="config.name" class="form-control" [placeholder]="config.placeholder" (click)="preventToggle($event)"/>
          </ng-container>
        </ng-container>
      </ng-container>
  `
})
export class EntityInputComponent implements Field {
  config: FieldConfig;
  group: FormGroup;

  private preventToggle( event:Event): void{
    event.preventDefault();
    event.stopPropagation();
  }
}
