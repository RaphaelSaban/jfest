module.exports = function (f, _this) {
    return {
	"type": "FunctionExpression",
	"id": null,
	"params": [],
	"body": {
	    "type": "BlockStatement",
	    "body": [
		{
		    "type": "VariableDeclaration",
		    "declarations": [
			{
			    "type": "VariableDeclarator",
			    "id": {
				"type": "Identifier",
				"name": "$a"
			    },
			    "init": _this
			}
		    ],
		    "kind": "var"
		},
		{
		    "type": "ReturnStatement",
		    "argument": {
			"type": "CallExpression",
			"callee": {
			    "type": "CallExpression",
			    "callee": {
				"type": "Identifier",
				"name": "$track"
			    },
			    "arguments": [
				{
				    "type": "MemberExpression",
				    "computed": false,
				    "object": {
					"type": "Identifier",
					"name": "$a"
				    },
				    "property": f
				},
				{
				    "type": "Identifier",
				    "name": "$a"
				}
			    ]
			},
			"arguments": [
			    {
				"type": "Identifier",
				"name": "arguments"
			    }
			]
		    }
		}
	    ]
	},
	"generator": false,
	"expression": false
    };
};
