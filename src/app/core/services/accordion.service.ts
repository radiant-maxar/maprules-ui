import { Injectable } from '@angular/core';
declare var $: any;

@Injectable({
    providedIn: 'root',
})
  
  
export class AccordionService {
    animate(e: any, id: string, index: number){
        if (e) e.preventDefault();
        const presetCard: any = $(`#${id}-${index}`);
        if (presetCard.length) {
          const height: number = Number($(presetCard).css('height').replace('px', ''));
    
          let newClass = '';
          let oldClass = '';
    
          if (height > 1) {
            oldClass = 'minus';
            newClass = 'plus';
            presetCard.addClass('card-closed');
            presetCard.parent().addClass('card-closed')
          } else {
            oldClass = 'plus';
            newClass = 'minus';
            presetCard.removeClass('card-closed');
            presetCard.parent().removeClass('card-closed')
          }
    
          const toggler: any = $(`#preset-accordion-toggler-${index}`);
          toggler.addClass(`fa-${newClass}-square-o`);
          toggler.removeClass(`fa-${oldClass}-square-o`);
    
          $(presetCard).css('max-height', height > 1 ? 0 : 'initial');
        
         }
    }

    maximizeCard(id: string, index: number){
        $(`#${id}-${index}`).css('max-height', 'initial');
        const toggler: any = $(`#preset-accordion-toggler-${index}`);
        toggler.addClass(`fa-minus-square-o`);
        toggler.removeClass(`fa-plus-square-o`);
      }
}