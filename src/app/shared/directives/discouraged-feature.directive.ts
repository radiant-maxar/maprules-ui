import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DiscouragedSelectizeComponent } from '../components/discouraged-selectize.component';

import { Field } from '../interfaces/field.interface';
import { FieldConfig } from '../interfaces/field-config.interface';
import { FieldConfigService } from '../../core/services/field-config.service'

const components: {[type: string]: Type<Field>} = {
  selectize: DiscouragedSelectizeComponent
};

@Directive({
  selector: '[discouraged-feature]'
})
export class DiscouragedFeatureDirective implements Field, OnChanges, OnInit {
  @Input()
  field: string;

  @Input()
  group: FormGroup;

  @Input()
  nestedGroupIndex: number;

  component: ComponentRef<Field>;
  config: FieldConfig;

  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef,
    private fieldConfig: FieldConfigService
  ) {}

  ngOnChanges() {
    if (this.component) {
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.nestedGroupIndex = this.nestedGroupIndex;
    }
  }

  ngOnInit() {
    setTimeout(() => {
      this.config = this.fieldConfig.getDisabledFeatureConfig(this.nestedGroupIndex, this.field);
      if (!components[this.config.type]) {
        const supportedTypes = Object.keys(components).join(', ');
        throw new Error(
          `Trying to use an unsupported type (${this.config.type}).
          Supported types: ${supportedTypes}`
        );
      }
      const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
      this.component = this.container.createComponent(component);
      this.component.instance.config = this.config;
      this.component.instance.group = this.group;
      this.component.instance.nestedGroupIndex = this.nestedGroupIndex;
    });
  }
}
