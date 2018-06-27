function getFunctionsRec (json_functions, json_file) {
    switch (json_file.type) {

    case "FunctionDeclaration":
    case "FunctionExpression":
	if (json_file.id && json_file.id.name) {
	    json_functions.push({
		name: json_file.id.name,
		code: json_file,
		nb_args: json_file.params.length
	    });
	}
	getFunctionsRec(json_functions,json_file.body);
	break;

	// Statements below are not tracked, merely looped into
    case "Program":
	for (var i=0;i<json_file.body.length;i++)
	    getFunctionsRec(json_functions,json_file.body[i]);
	break;
    case "NewExpression":
    case "CallExpression":
	getFunctionsRec(json_functions,json_file.callee);
	for (var i=0;i<json_file.arguments.length;i++)
	    getFunctionsRec(json_functions,json_file.arguments[i]);
	break;
    case "BlockStatement":
	for (var i=0;i<json_file.body.length;i++)
	    getFunctionsRec(json_functions,json_file.body[i]);
	break;
    case "ExpressionStatement":
	getFunctionsRec(json_functions,json_file.expression);
	break;
    case "WithStatement":
	getFunctionsRec(json_functions,json_file.object);
	getFunctionsRec(json_functions,json_file.body);
	break;
    case "LabeledStatement":
	getFunctionsRec(json_functions,json_file.body);
	break;
    case "IfStatement":
	getFunctionsRec(json_functions,json_file.consequent);
	if (json_file.alternate) getFunctionsRec(json_functions,json_file.alternate);
	break;
    case "SwitchStatement":
	for (var i=0;i<json_file.cases.length;i++)
	    getFunctionsRec(json_functions,json_file.cases[i]);
	break;
    case "SwitchCase":
	getFunctionsRec(json_functions,json_file.consequent);
	break;
    case "ThrowStatement":
	getFunctionsRec(json_functions,json_file.argument);
	break;
    case "TryStatement":
	getFunctionsRec(json_functions,json_file.block);
	if (json_file.finalizer) getFunctionsRec(json_functions,json_file.finalizer);
	break;
    case "CatchClause":
	getFunctionsRec(json_functions,json_file.body);
	break;
    case "WhileStatement":
    case "DoWhileStatement":
	getFunctionsRec(json_functions,json_file.test);
	getFunctionsRec(json_functions,json_file.body);
	break;
    case "ForStatement":
	if (json_file.init) getFunctionsRec(json_functions,json_file.init);
	if (json_file.test) getFunctionsRec(json_functions,json_file.test);
	if (json_file.update) getFunctionsRec(json_functions,json_file.update);
	if (json_file.body) getFunctionsRec(json_functions,json_file.body);
	break;
    case "ForInStatement":
	getFunctionsRec(json_functions,json_file.left);
	getFunctionsRec(json_functions,json_file.right);
	getFunctionsRec(json_functions,json_file.body);
	break;
    case "ReturnStatement":
	if (json_file.argument) getFunctionsRec(json_functions,json_file.argument);
	break;
    case "VariableDeclaration":
	for (var i=0;i<json_file.declarations.length;i++)
	    getFunctionsRec(json_functions,json_file.declarations[i]);
	break;
    case "VariableDeclarator":
	if (json_file.init) getFunctionsRec(json_functions,json_file.init);
	break;
    case "ArrayExpression":
	for (var i=0;i<json_file.elements.length;i++)
	    if (json_file.elements[i]) getFunctionsRec(json_functions,json_file.elements[i]);
	break;
    case "ObjectExpression":
	for (var i=0;i<json_file.properties.length;i++)
	    getFunctionsRec(json_functions,json_file.properties[i]);
	break;
    case "Property":
	getFunctionsRec(json_functions,json_file.value);
	break;
    case "UnaryExpression":
    case "UpdateExpression":
	getFunctionsRec(json_functions,json_file.argument);
	break;
    case "BinaryExpression":
    case "AssignmentExpression":
    case "LogicalExpression":
	getFunctionsRec(json_functions,json_file.left);
	getFunctionsRec(json_functions,json_file.right);
	break;
    case "MemberExpression":
	getFunctionsRec(json_functions,json_file.object);
	if (json_file.computed) getFunctionsRec(json_functions,json_file.property);
	break;
    case "ConditionalExpression":
	getFunctionsRec(json_functions,json_file.test);
	getFunctionsRec(json_functions,json_file.consequent);
	getFunctionsRec(json_functions,json_file.alternate);
	break;
    case "SequenceExpression":
	for (var i=0;i<json_file.expressions.length;i++)
	    getFunctionsRec(json_functions,json_file.expressions[i]);
	break;

	/* Complete list of unmatched statements
	   case "Identifier":
	   case "Literal":
	   case "EmptyStatement":
	   case "DebuggerStatement":
	   case "BreakStatement":
	   case "ContinueStatement":
	   case "ThisExpression":
	*/
    }
};

function getFunctions (json_file) {
    var json_functions = [];
    getFunctionsRec(json_functions, json_file);
    return json_functions;
}

module.exports = getFunctions;
