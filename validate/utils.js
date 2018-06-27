const safeEval = require('safe-eval');

function myStringify (data)
{
    return JSON.stringify(data, function (k, v) {
	if (typeof v === 'function')
	    return '@'+v.name;
	return v;
    });
};

function myParse (data)
{
    return JSON.parse(data, function(k, v) {
	if (typeof v === 'string' && v && v[0] === '@')
	    return safeEval("function "+v.substr(1)+" () {}");
	return v;
    });
};

module.exports = {
    myStringify,
    myParse
}
