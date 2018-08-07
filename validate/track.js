const calls = require('./calls'),
      { myStringify } = require('./utils'),
      { deepAssign } = require('./deepassign');

/*****************************/
/* Tracking of function runs */
/*****************************/

function createTrack (
    $options,
    $results)
{
    return function $track (
        f,
        _this)
    {
	return function () {
	    let args = Array.from(arguments[0]),
                callee = {
                    name: f.name,
                    // Snapshot of _this before calling method
                    _this: (_this === null ? null : deepAssign({},_this) ),
                    args
                };

	    if ( $options.canBeFaked(f) )
	    {
                let fake_call = calls.fetch(callee);
                if (fake_call.hit) {
                    deepAssign(_this, fake_call._this);
		    return fake_call.value;
                }
	    }

	    let call = run(
                f,
                _this,
                args
            );

	    if ( f.name )
            {
                if ( $options.canTestCall() )
		    test(callee, call, $results);
                if ( $options.canSaveCall() )
		    save(callee, call);
	    }
            
	    return call.value;
	}
    };
};

function createRunAll (
    $results)
{
    return function $runAll (f) {
        calls
            .getFunctionCalls(f.name)
            .forEach(
                ({_this, args}) => {
                    let callee = {
                        name: f.name,
                        _this: (_this === null ? null : deepAssign({},_this) ),
                        args
                    },
	                call = run(f, _this, args);
	            test(callee, call, $results);
                }
            );
    };
};

function run (
    f,
    _this,
    args)
{
    let start = process.hrtime(),
        value = f.bind(_this)(
            ...args
        ),
        // value = f.apply(
        //     _this, // mutated
        //     args
        // ),
        end = process.hrtime();
    return {
	value,
        // Snapshot of _this after calling method (to save from subsequent calls)
        _this: (_this === null ? null : deepAssign({},_this) ),
	utime: (end[0] - start[0]) * 1000000 + (end[1] - start[1]) / 1000
    };
};

function test (
    callee,
    call,
    results)
{
    let {hit, message, diff} = calls.compare(
        callee,
        call
    );

    if (!hit)
        return results.news.push("+ " + message);

    if (diff)
        return results.errors.push("! " + message);
    
    return results.successes.push("= " + message);
};

function save(
    callee,
    call)
{
    // Store result in cache
    calls.write(
        callee,
        call
    );
    // Make persistent
    calls.save();
};

module.exports = {
    createRunAll,
    createTrack
};
