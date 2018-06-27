module.exports = function (f,args) {
    return {
	"type": "CallExpression",
	"callee": {
            "type": "Identifier",
            "name": "$track"
	},
	"arguments": [
	    f,
	    args
	]
    };
};
