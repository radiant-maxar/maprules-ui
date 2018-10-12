define({ "api": [
  {
    "type": "get",
    "url": "/new",
    "title": "Create new MapRules config",
    "name": "Create_MapRule",
    "group": "CreateMapRule",
    "version": "0.0.1",
    "filename": "./maprules-ui.docs.js",
    "groupTitle": "CreateMapRule"
  },
  {
    "type": "get",
    "url": "/:id/edit",
    "title": "Edit MapRules config",
    "name": "Edit_MapRule",
    "group": "EditMapRule",
    "parameter": {
      "fields": {
        "Path": [
          {
            "group": "Path",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>MapRules configuration id</p>"
          }
        ],
        "Query": [
          {
            "group": "Query",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>MapRules name initializes to this value</p>"
          }
        ]
      }
    },
    "version": "0.0.1",
    "examples": [
      {
        "title": "iFrame integration:",
        "content": "var win = document.getElementById('editMapRulesFrame').contentWindow;\nwin.postMessage(\"save:\" + $(\"#configId\").val(), '*');\nwindow.addEventListener('message', function(event) {\n  if(event.data && event.data.indexOf(\"Error\") != -1){\n    alert(event.data);\n  }else{\n    if(!$(\"#configId\").val() || $(\"#configId\").val() == \"\"){\n      $(\"#configId\").val(event.data);\n      var configUrl = map_rules_url + \"/\" + $('#configId').val() + \"/instructions\";\n      $(\"#viewMapRulesFrame\").attr(\"src\", configUrl);\n    }\n    $(\"#editMapRulesModal\").modal('hide');\n    $(\"#viewMapRulesFrame\")[0].src =  $(\"#viewMapRulesFrame\")[0].src;\n  }\n});",
        "type": "js"
      }
    ],
    "filename": "./maprules-ui.docs.js",
    "groupTitle": "EditMapRule"
  },
  {
    "type": "get",
    "url": "/:id/start",
    "title": "Start Editors with MapRules",
    "name": "Start_MapRule",
    "group": "ViewMapRule",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>MapRules configuration id</p>"
          }
        ]
      }
    },
    "version": "0.0.1",
    "filename": "./maprules-ui.docs.js",
    "groupTitle": "ViewMapRule"
  },
  {
    "type": "get",
    "url": "/:id/instructions",
    "title": "View MapRules instructions",
    "name": "View_MapRule",
    "group": "ViewMapRule",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>MapRules configuration id</p>"
          }
        ]
      }
    },
    "version": "0.0.1",
    "filename": "./maprules-ui.docs.js",
    "groupTitle": "ViewMapRule"
  }
] });
