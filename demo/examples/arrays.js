module.exports = {
  title: 'Arrays',
  schema: {
    'id': 'https://example.com/arrays.schema.json',
    '$schema': 'http://json-schema.org/draft-07/schema#',
    'description': 'A representation of a person, company, organization, or place',
    'type': 'object',
    'properties': { 
      'vegetables': {
        'type': 'array',
        'description': 'A list of vegetables as editable objects.',
        'items': { '$ref': '#/definitions/nameDefinition' }
      }
    },
    'definitions': {
      "nameDefinition":{  
        "type":"object",
        "oneOf": [
          { "$ref": "#/definitions/preferred" },
          { "$ref": "#/definitions/middle" }
        ]
     },
     "preferred": {
      "title": "Preferred Name",
      "properties": {
      "type": {
          "const": "preferred",
          "title": "Chose from a type"
      },
      "preferred": {
          "type": "string"
      }
      }
  },
  "middle": {
      "title": "Middle Name",
      "properties": {
      "type": {
          "const": "middle"
      },
      "middle": {
          "type": "string"
      }
      }
  }
    }
  },
  data: {
  }
}
