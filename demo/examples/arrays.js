module.exports = {
  title: 'Arrays',
  schema2: {
  "id": "http://example.com/arrays.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "description": "A representation of a person, company, organization, or place",
  "type": "object",
  "properties": {
    "name": {
      "type": "array",
      "description": "custom",
      "items": {
        "$ref": "#/definitions/name"
      }
    }
  },
  "definitions": {
    "name": {
      "type": "object",
      "properties": {
        "type": {
          "title": "Chose from a type",
          "type": "string",
          "x-display" : "hidden"
        },
        "name": {
          "type": "string"
        }
      }
    }
  }
},
schema:{"referral":"http://example.com/arrays.schema.json",
   "$schema":"http://json-schema.org/draft-07/schema#",
 "paths": {
        "post" : "person/patient/{patient_id}/referral",
       "get" : "person/patient/{patient_id}/referral",
       "put" : "person/patient/{patient_id}/referral/{referral_id}",
       "delete" : "person/patient/{patient_id}/referral/{referral_id}",
       "getOne" : "person/patient/{patient_id}/referral/{referral_id}"
   },
 "title": "Referral",
 "description": "Referral",
      "type": "object",
      "properties": {
          "referral": {
            "type": "array",
            "items": {
              "$ref": "#/definitions/referral"
            }
          }
      },
      "definitions": {
        "referral": {
          "type": "object",
          "name": "bob",
          "properties":{
         "referrer_id":{
            "title":"Referrer",
            "type":"number",
            "x-type":"object",
            "description":"The values come from an HTTP request and are put into an array.",
            "x-fromUrl":"http://stage.capstone-v2.local//api/search/data?filter={q}&type=provider",
            "x-itemTitle":"desc",
            "x-itemKey":"id",
            "create_new":true,
            "x-grid":"xl6 lg6 md6"
         }
      },
"dependencies":{
"referrer_id":{
               "properties":{
         "provider_id":{
            "title":"Provider",
            "type":"number",
            "x-type":"object",
            "description":"The values come from an HTTP request and are put into an array.",
            "x-fromUrl":"http://stage.capstone-v2.local/api/search/data?filter={q}&type=provider",
            "x-itemsProp":"",
            "x-itemTitle":"desc",
            "x-itemKey":"provider_id",
            "x-grid":"xl6 lg6 md6"
         },
         "ref_type":{
            "type":"number",
            "title":"Referral Type",
            "description":"The values come from an HTTP request and are put into an array.",
            "x-getData":"cache?type=ref_data.REFERRALTYPE",
            "x-itemsProp":"",
            "x-itemTitle":"desc",
            "x-itemKey":"id",
            "x-grid":"xl4 lg4 md4"
         },
         "issue_date":{
            "title":"Issue date",
            "type":"string",
            "format":"date",
            "x-grid":"xl4 lg4 md4"
         },
         "length":{
            "type":"number",
            "x-grid":"xl4 lg4 md4"
         },
         "patient_id":{
            "type":"string",
            "x-display":"hidden"
         }
               },
               "required":[
                  "provider_id"
               ]
            }
}
        }
      }
    },
schemax: {

    "id": "https://example.com/arrays.schema.json",
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "A representation of a person, company, organization, or place",
    "type": "object",
    "properties": {
      "datee":{
        "type":"string",
        "title":"Patient",
        "format": "date"
     },
      "patient_id":{
        "type":"integer",
        "x-type":"object",
        "title":"Patient",
        "description":"The values come from an HTTP request and are put into an array.",
        "x-fromUrl":"https://fin3.capstonemedical.com.au/api/search/data?filter={q}&type=patient",
        "x-itemsProp":"",
        "x-itemTitle":"desc",
        "x-itemKey":"id",
        "create_new":true,
        "no-data-form":[
           "person",
           "patient"
        ],
        "x-grid":"xl6 lg6 md6"
     },
     "provider_id":{
      "type":"integer",
      "x-type":"object",
      "title":"Patient",
      "description":"The values come from an HTTP request and are put into an array.",
      "x-fromUrl":"https://fin3.capstonemedical.com.au/api/search/data?filter={q}&type=patient",
      "x-itemsProp":"",
      "x-itemTitle":"desc",
      "x-itemKey":"id",
      "create_new":true,
      "no-data-form":[
         "person",
         "patient"
      ],
      "x-grid":"xl6 lg6 md6"
   },
      "fruits": {
        "type": "array",
        "description": "This is a simple array of strings",
        "items": {
          "type": "string"
        }
      },
      "sizes": {
        "type": "array",
        "items": {
          "type": "string",
          "enum": [
            "small",
            "medium",
            "large"
          ]
        },
        "minItems": 1
      },
      "vegetables": {
        "type": "array",
        "description": "A list of vegetables as editable objects.",
        "items": {
          "$ref": "#/definitions/veggie"
        }
      },
      "fromAjaxObjects": {
        "type": "array",
        "title": "Tableau d'objets depuis ajax présentés en liste",
        "description": "The values come from an HTTP request and are stored as an array of objects.",
        "x-fromUrl": "https://koumoul.com/s/data-fair/api/v1/datasets?status=finalized&select=title,schema&owner={context.owner.type}:{context.owner.id}",
        "x-itemsProp": "results",
        "x-itemTitle": "title",
        "x-itemKey": "href",
        "x-display": "list",
        "items": {
          "type": "object",
          "properties": {
            "href": {
              "type": "string",
              "x-display": "hidden"
            },
            "title": {
              "type": "string",
              "x-display": "hidden"
            },
            "txtFromUser": {
              "type": "string",
              "title": "Additional field for user"
            }
          }
        }
      },
      "coordinate": {
        "type": "array",
        "title": "Lat/lon coordinates as a tuple",
        "items": [
          {
            "type": "number",
            "title": "Latitude"
          },
          {
            "type": "number",
            "title": "Longitude"
          }
        ]
      }
    },
    "definitions": {
      "veggie": {
        "type": "object",
        "required": [
          "veggieName",
          "veggieLike"
        ],
        "properties": {
          "veggieName": {
            "type": "string",
            "description": "The name of the vegetable."
          },
          "veggieLike": {
            "type": "boolean",
            "description": "Do I like this vegetable?"
          }
        }
      }
    }


},
  data: {
  }
}
