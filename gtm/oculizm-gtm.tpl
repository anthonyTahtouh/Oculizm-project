___INFO___

{
  "type": "TAG",
  "id": "cvt_temp_public_id",
  "version": 1,
  "securityGroups": [],
  "displayName": "Oculizm Template",
  "brand": {
    "id": "brand_dummy",
    "displayName": ""
  },
  "description": "",
  "containerContexts": [
    "WEB"
  ]
}


___TEMPLATE_PARAMETERS___

[
  {
    "type": "SELECT",
    "name": "type",
    "displayName": "Script Type",
    "macrosInSelect": false,
    "selectItems": [
      {
        "value": "carousel",
        "displayValue": "Carousel"
      },
      {
        "value": "grid",
        "displayValue": "Grid"
      },
      {
        "value": "as-seen-on",
        "displayValue": "As seen on"
      }
    ],
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "clientId",
    "displayName": "Client Id",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "galleryId",
    "simpleValueType": true,
    "displayName": "Gallery Id"
  },
  {
    "type": "TEXT",
    "name": "productIds",
    "displayName": "As seen on product ids",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "containerId",
    "simpleValueType": true,
    "displayName": "Container Element ID",
    "help": "Value CANNOT be one of these:\noclzm, \noclzmCarousel, \noclzmAsSeenOn, \noculizm_script"
  }
]


___SANDBOXED_JS_FOR_WEB_TEMPLATE___

// Enter your template code here.
const log = require('logToConsole');
const setInWindow = require('setInWindow');
const injectScript = require('injectScript');

log('data =', data);

var GTM_OCULIZM = {
  galleryId: data.galleryId,
  clientId: data.clientId,
  productIds: data.productIds,
  containerId: data.containerId,
};

log("GTM = ", GTM_OCULIZM);


setInWindow('GTM_OCULIZM', GTM_OCULIZM, true);

var url = 'https://app.oculizm.com/wp-content/uploads/' + data.clientId + "_" + (data.type !== 'as-seen-on' ? data.galleryId + '_' : '') + data.type + '_gtm.js';


log("url = ", url);

injectScript(url, data.gtmOnSuccess, data.gtmOnFailure, url);


___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": {
        "publicId": "logging",
        "versionId": "1"
      },
      "param": [
        {
          "key": "environments",
          "value": {
            "type": 1,
            "string": "debug"
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "access_globals",
        "versionId": "1"
      },
      "param": [
        {
          "key": "keys",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  {
                    "type": 1,
                    "string": "key"
                  },
                  {
                    "type": 1,
                    "string": "read"
                  },
                  {
                    "type": 1,
                    "string": "write"
                  },
                  {
                    "type": 1,
                    "string": "execute"
                  }
                ],
                "mapValue": [
                  {
                    "type": 1,
                    "string": "GTM_OCULIZM"
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  },
                  {
                    "type": 8,
                    "boolean": true
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": {
        "publicId": "inject_script",
        "versionId": "1"
      },
      "param": [
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 1,
                "string": "https://app.oculizm.com/wp-content/uploads/*"
              }
            ]
          }
        }
      ]
    },
    "clientAnnotations": {
      "isEditedByUser": true
    },
    "isRequired": true
  }
]


___TESTS___

scenarios: []


___NOTES___

Created on 10/22/2020, 5:43:45 PM


