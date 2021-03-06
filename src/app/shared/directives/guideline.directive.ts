// import { ComponentFactoryResolver, ComponentRef, Directive, Input, OnChanges, OnInit, Type, ViewContainerRef } from '@angular/core';
// import { FormGroup } from '@angular/forms';

// import { GuidelineSelectComponent } from '../components/guideline-select.component';
// import { GuidelineSelectizeComponent } from '../components/guideline-selectize.component';
// import { ValueSelectComponent } from '../components/value-select.component';
// import { ValueSelectizeComponent } from '../components/value-selectize.component';
// import { GuidelineInputComponent } from '../components/guideline-input.component';
// import { EntitiesComponent } from '../components/entities.component';
// import { FormButtonComponent } from '../components/form-button.component';

// import { Field } from '../interfaces/field.interface';
// import { FieldConfig } from '../interfaces/field-config.interface';
// import { FieldConfigService } from '../../core/services/field-config.service'

// const components: {[type: string]: Type<Field>} = {
//   guideline: GuidelineSelectComponent,
//   guidelineSelectize: GuidelineSelectizeComponent,
//   valueSelect: ValueSelectComponent,
//   guidelineInput: GuidelineInputComponent,
//   valueSelectize: ValueSelectizeComponent
// };

// @Directive({
//   selector: '[guideline]'
// })
// export class GuidelineDirective implements Field, OnChanges, OnInit {
//   @Input()
//   field: string;

//   @Input()
//   group: FormGroup;

//   @Input()
//   nestedGroupIndex: number;

//   @Input()
//   nestedArrayIndex: number;

//   component: ComponentRef<Field>;
//   config: FieldConfig;

//   constructor(
//     private resolver: ComponentFactoryResolver,
//     private container: ViewContainerRef,
//     private fieldConfig: FieldConfigService
//   ) {}

//   ngOnChanges() {
//     if (this.component) {
//       this.component.instance.config = this.config;
//       this.component.instance.group = this.group;
//       this.component.instance.nestedGroupIndex = this.nestedGroupIndex;
//       this.component.instance.nestedArrayIndex = this.nestedArrayIndex;
//     }
//   }

//   ngOnInit() {
//     setTimeout(() => {
//       this.config = this.fieldConfig.getFeatureGuidelineField(this.nestedGroupIndex, this.nestedArrayIndex, this.field);
//       if (!components[this.config.type]) {
//         const supportedTypes = Object.keys(components).join(', ');
//         throw new Error(
//           `Trying to use an unsupported type (${this.config.type}).
//           Supported types: ${supportedTypes}`
//         );
//       }
//       const component = this.resolver.resolveComponentFactory<Field>(components[this.config.type]);
//       this.component = this.container.createComponent(component);
//       this.component.instance.config = this.config;
//       this.component.instance.group = this.group;
//       this.component.instance.nestedGroupIndex = this.nestedGroupIndex;
//       this.component.instance.nestedArrayIndex = this.nestedArrayIndex;
//     });
//   }
// }
