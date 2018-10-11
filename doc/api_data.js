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
