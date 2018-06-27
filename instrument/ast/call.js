module.exports = function (f, args) {
    return {
	"type": "FunctionExpression",
	"id": null,
	"params": [],
	"body": {
	    "type": "BlockStatement",
	    "body": [
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
				f,
				args
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
