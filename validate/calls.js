const { myStringify, myParse } = require('./utils'),
      { deepAssign } = require('./deepassign');

// Cache
var calls = {};

function fetch (callee)
{

    let {name, _this, args} = callee,
        this_key = myStringify(_this),
        args_key = myStringify(args);
    
    if (name in calls &&
        this_key in calls[name] &&
        args_key in calls[name][this_key])
    {
        let call = calls[name][this_key][args_key];
        
        return deepAssign(
            {hit: true},
            call
        );
    }
    return {
        hit: false
    };
}

function write (
    callee,
    call)
{
    let {name, _this, args} = callee,
        this_key = myStringify(_this),
        args_key = myStringify(args);
    
    if (! (name in calls))
	calls[name] = {};
    if (! (this_key in calls[name]))
	calls[name][this_key] = {};

    calls[name][this_key][args_key] = deepAssign(
        {name, args},
        call
    );
}

function getFunctionCalls (name)
{
    if (! (name in calls) )
        return [];

    let res = [];
    for (let this_key in calls[name])
        for (let args_key in calls[name][this_key])
            res.push( deepAssign( {}, calls[name][this_key][args_key] ) );

    return res;
}

function compare (
    callee,
    call)
{
    let this_key = myStringify(callee._this),
        args_key = myStringify(callee.args),
        new_this = myStringify(call._this),
        new_value = myStringify(call.value),

        message = callee.name + "[" + this_key + "](" + args_key.slice(1, -1) + ")" + "\n[new] " + "[" + new_this + "] " + new_value,
        diff = false,

        cache = fetch(callee);

    if (cache.hit) {
        let cached_this = myStringify(cache._this),
            cached_value = myStringify(cache.value);
        message += "\n[old] " + "[" + cached_this + "] " + cached_value;
        diff = (new_value !== cached_value) || (new_this !== cached_this);
    }
    
    return {
        hit: cache.hit,
        message,
        diff
    };
}

// Persistence

const cache_file = process.cwd() + '/calls.jin',
      fs = require('fs');

function warmup () {
    fs.readFile(
        cache_file,
        'utf-8',
        (error, data) => {
            if (data) {
	        calls = myParse(data.toString());
            }
            console.log("-- cache loaded ("+Object.keys(calls).length+" function calls)");
        }
    );
};

function saveToFile (data) {
    fs.writeFile(
        cache_file,
        myStringify(data),
        (err) => {
            if (err) throw err;
        }
    );
};

module.exports = {
    fetch,
    write,
    warmup,
    save: () => saveToFile(calls),
    getFunctionCalls,
    compare
};
