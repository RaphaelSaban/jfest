function instrument (json) {
    switch (json.type) {

    case "CallExpression":
	// Instrument in-depth first, to avoid instrumenting instrumentation...
	instrument(json.callee);
        json.arguments.forEach( (arg) => instrument(arg) );
	// Transform it into a block statement (within anonymous function call for return value) to
	// - limit scope of newly added variables
	// - be independant from parent node
	if (json.callee.name === undefined && ! ("callee" in json))
	    console.log(JSON.stringify(json,null,2));
	let f_name =
	    ( json.callee.name ? json.callee.name:
	      (json.callee.property && json.callee.property.name ? json.callee.property.name:
	       "")
	    );
	switch (f_name) {

	case "apply":
	    // f.apply(_this,args) --> $track(f,_this)(args)
	    json.callee = require("./ast/apply")(
		json.callee.object,
		json.arguments.shift()
	    );
	    break;

	case "call":
	    // f.call(_this,arg0,arg1) --> function() {return $track(f,_this)(arguments);}(arg0,arg1)
	    json.callee = require("./ast/call")(
		json.callee.object,
		json.arguments.shift()
	    );
	    break;

	default:
	    switch (json.callee.type) {
	    case "MemberExpression":
		// a.f(arg0,arg1) --> function() {var $a=a;return $track($a.f, $a) (arguments);}(arg0,arg1)
		json.callee = require("./ast/function_member")(
		    json.callee.property,
		    json.callee.object
		);
		break;

	    default:
		// f(arg0,arg1) --> function() {return $track(f,null) (arguments);}(arg0,arg1)
		json.callee = require("./ast/function")(
		    json.callee
		);
		break;
	    }
	    break;
	}
	break;

	// Statements below are not tracked, merely looped into
    case "Program":
	for (var i=0;i<json.body.length;i++)
	    instrument(json.body[i]);
	break;
    case "FunctionDeclaration":
    case "FunctionExpression":
	instrument(json.body);
	break;
    case "BlockStatement":
	for (var i=0;i<json.body.length;i++)
	    instrument(json.body[i]);
	break;
    case "ExpressionStatement":
	instrument(json.expression);
	break;
    case "WithStatement":
	instrument(json.object);
	instrument(json.body);
	break;
    case "LabeledStatement":
	instrument(json.body);
	break;
    case "IfStatement":
	instrument(json.consequent);
	if (json.alternate) instrument(json.alternate);
	break;
    case "SwitchStatement":
	for (var i=0;i<json.cases.length;i++)
	    instrument(json.cases[i]);
	break;
    case "SwitchCase":
	instrument(json.consequent);
	break;
    case "ThrowStatement":
	instrument(json.argument);
	break;
    case "TryStatement":
	instrument(json.block);
	if (json.finalizer) instrument(json.finalizer);
	break;
    case "CatchClause":
	instrument(json.body);
	break;
    case "WhileStatement":
    case "DoWhileStatement":
	instrument(json.test);
	instrument(json.body);
	break;
    case "ForStatement":
	if (json.init) instrument(json.init);
	if (json.test) instrument(json.test);
	if (json.update) instrument(json.update);
	if (json.body) instrument(json.body);
	break;
    case "ForInStatement":
	instrument(json.left);
	instrument(json.right);
	instrument(json.body);
	break;
    case "ReturnStatement":
	if (json.argument) instrument(json.argument);
	break;
    case "VariableDeclaration":
	for (var i=0;i<json.declarations.length;i++)
	    instrument(json.declarations[i]);
	break;
    case "VariableDeclarator":
	if (json.init) instrument(json.init);
	break;
    case "ArrayExpression":
	for (var i=0;i<json.elements.length;i++)
	    if (json.elements[i]) instrument(json.elements[i]);
	break;
    case "ObjectExpression":
	for (var i=0;i<json.properties.length;i++)
	    instrument(json.properties[i]);
	break;
    case "Property":
	instrument(json.value);
	break;
    case "UnaryExpression":
    case "UpdateExpression":
	instrument(json.argument);
	break;
    case "BinaryExpression":
    case "AssignmentExpression":
    case "LogicalExpression":
	instrument(json.left);
	instrument(json.right);
	break;
    case "MemberExpression":
	instrument(json.object);
	if (json.computed) instrument(json.property);
	break;
    case "ConditionalExpression":
	instrument(json.test);
	instrument(json.consequent);
	instrument(json.alternate);
	break;
    case "SequenceExpression":
	for (var i=0;i<json.expressions.length;i++)
	    instrument(json.expressions[i]);
	break;

	/* Complete list of unmatched statements
    case "Identifier":
    case "Literal":
    case "NewExpression":  << we do not instrument 'new' on purpose
    case "EmptyStatement":
    case "DebuggerStatement":
    case "BreakStatement":
    case "ContinueStatement":
    case "ThisExpression":
	*/
    }

    return json;
};

module.exports = instrument;
