/**
 * @api {get} /new Create new MapRules config
 * @apiName Create MapRule
 * @apiGroup CreateMapRule
 *  
 * @apiVersion 0.0.1
 * 
 
 */

/**
 * @api {get} /:id/edit Edit MapRules config
 * @apiName Edit MapRule
 * @apiGroup EditMapRule
 * 
 * @apiParam (Path) {String} id MapRules configuration id
 * @apiParam (Query) {String} name MapRules name initializes to this value 
 * @apiParam (Query) {String=[hide,show]} nav=show show/hide navigation bar and submit button
 *
 * @apiVersion 0.0.1
 * @apiExample {js} iFrame integration:
 * var win = document.getElementById('editMapRulesFrame').contentWindow;
 * win.postMessage("save:" + $("#configId").val(), '*');
 * window.addEventListener('message', function(event) {
 *   if(event.data && event.data.indexOf("Error") != -1){
 *     alert(event.data);
 *   }else{
 *     if(!$("#configId").val() || $("#configId").val() == ""){
 *       $("#configId").val(event.data);
 *       var configUrl = map_rules_url + "/" + $('#configId').val() + "/instructions";
 *       $("#viewMapRulesFrame").attr("src", configUrl);
 *     }
 *     $("#editMapRulesModal").modal('hide');
 *     $("#viewMapRulesFrame")[0].src =  $("#viewMapRulesFrame")[0].src;
 *   }
 * });
 *
 */

/**
 * @api {get} /:id/instructions View MapRules instructions
 * @apiName View MapRule
 * @apiGroup ViewMapRule
 * 
 * @apiParam (Path) {String} id MapRules configuration id
 * @apiParam (Query) {String=[hide,show]} nav=show nav show/hide navigation bar
 * 
 * @apiVersion 0.0.1
 */

/**
 * @api {get} /:id/start Start Editors with MapRules
 * @apiName Start MapRule
 * @apiGroup ViewMapRule
 * 
 * @apiParam {String} id MapRules configuration id
 * 
 * @apiVersion 0.0.1
 */

