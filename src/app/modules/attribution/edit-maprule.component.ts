import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FieldConfig } from '../../shared/interfaces/field-config.interface';
import { AttributionComponent } from '../../modules/attribution/attribution.component';
import { FieldConfigService } from '../../core/services/field-config.service';
import { MapRulesService } from '../../core/services/maprules.service';
import { NavigationService } from '../../core/services/navigation.service';

declare var $: any;

@Component({
  exportAs: 'edit-maprule',
  selector: 'edit-maprule',
  template: ` <attribution
                #form="attribution" [configId] = configId [name]=name> 
              </attribution>
  `
})
export class EditMapRuleComponent implements AfterViewInit {
	configId: string;
  name: number;
	
	@ViewChild(AttributionComponent) form: AttributionComponent;

 	constructor(private route: ActivatedRoute, private router: Router, private fieldConfig: FieldConfigService, private maprules: MapRulesService, private nav: NavigationService){}

	ngOnInit(){
  	combineLatest(this.route.queryParams, this.route.params).subscribe(([queryParam, params]) => {
   		var id = params['id'];
   		if(id){
   			this.configId = id;
   		}
      const name = queryParam['name'];
      if(name){
        this.name = name;
      }
      const nav = queryParam['nav'];
      if(nav){
        if(nav == "hide"){
          this.nav.hide();
        } else {
          this.nav.show();
        }
      }
   	});
  }

  ngAfterViewInit() {
    let previousValid = this.form.valid;
    this.form.changes.subscribe(() => {
      if (this.form.valid !== previousValid) {
        previousValid = this.form.valid;
        this.form.setDisabled('submit', !previousValid);
      }
    });

    this.form.setDisabled('submit', true);
    var app = this;
    window.addEventListener('message', function(event) { 
      //TODO check if OAuth authorized app
      var message = event.data.split(":");
      if(message[0] == "save"){
          app.save();
      }
    });

  }
  
  save(){
    this.maprules.save(this.form.value).subscribe(
      data => {
        window.parent.postMessage(data['id'], "*");
      },
      error => {
        window.parent.postMessage("Failed to save MapRules. \n \n --- Error --- \n" + error, "*");
      }
    );
  }
}
