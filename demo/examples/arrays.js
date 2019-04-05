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
},  schema: {
  "id": "http://example.com/arrays.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "number": {
      "type": "string",
      "x-grid": "xs6"
    }, "test": {
      "type": "string",
      "x-grid": "xs6",
      "pattern": "\\/.+@.+/",
    },
    "name": {
      "type": "array",
      "description": "custom",
      "label": "Add Name",
      "x-fromUrl": "http://app.capstone-v2.local/api/data/reference?type=category&filter=NAMETYPE",
      "items": {
        "$ref": "#/definitions/name"
      }
    }
  },
  "definitions": {
    "name": {
      "type": "object",
      "name": "bob",
      "properties": {
        "title": {
          "type": "string",
          "x-display": "hidden"
        },
        "fields": {
          "type": "string",
          "x-display": "hidden"
        },
        "type": {
          "type": "string",
          "x-display": "hidden"
        },
        "data": {
          "type": "array"
        },
 
        "level": {
          "type": "object",
          "description": "The values come from an HTTP request and are put into an array.",
          "x-fromUrl": "http://app.capstone-v2.local/api/data/reference?type=category&filter=LEVEL",
          "x-itemsProp": "",
          "x-itemTitle": "desc",
         "x-itemKey": "id",
         "x-grid": "xs6"
        }
      }
    }
  }
},
  data: {
  }
}
