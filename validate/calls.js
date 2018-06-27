const { myStringify, myParse } = require('./utils');

// Cache
var calls = {};

function fetch (
    f_name,
    _this,
    args)
{

    let this_key = myStringify(_this),
        args_key = myStringify(args);
    
    if (f_name in calls &&
        this_key in calls[f_name] &&
        args_key in calls[f_name][this_key])
    {
        let {value, utime} = calls[f_name][this_key][args_key];
        
        return {
            hit: true,
            value,
            utime
        };
    }
    return {
        hit: false
    };
}

function write (
    f_name,
    _this,
    args,
    call)
{
    let this_key = myStringify(_this),
        args_key = myStringify(args);
    
    if (! (f_name in calls))
	calls[f_name] = {};
    if (! (this_key in calls[f_name]))
	calls[f_name][this_key] = {};

    calls[f_name][this_key][args_key] = call;
}

function getFunctionCalls (f_name) {
    if (! (f_name in calls) )
        return [];

    let res = [];
    for (let this_key in calls[f_name])
        for (let args_key in calls[f_name][this_key])
            res.push(calls[f_name][this_key][args_key]);

    return res;
}

function compare(
    f_name,
    _this,
    args,
    call)
{
    let this_key = myStringify(_this),
        args_key = myStringify(args),
        new_value = myStringify(call.value),

        message = f_name + "[" + this_key + "](" + args_key.slice(1, -1) + ")" + " [new] " + new_value,
        diff = false,

        {hit, value, utime} = fetch(
            f_name,
            _this,
            args
        );

    if (hit) {
        let cached_value = myStringify(value);
        message += " [old] " + cached_value;
        diff = (new_value !== cached_value);
    }
    
    return {
        hit,
        message,
        diff
    };
}

// Persistence

const cache_file = process.cwd() + '/jfest.calls',
      fs = require('fs');

function warmup () {
    fs.readFile(
        cache_file,
        'utf-8',
        (error, data) => {
            if (data) {
	        calls = myParse(data.toString());
            }
            console.log("--Cache loaded ("+Object.keys(calls).length+" function calls)");
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
