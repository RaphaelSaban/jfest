const calls = require('./calls'),
      { myStringify } = require('./utils');

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
	    let args = Array.from(arguments[0]);

	    if ( $options.canBeFaked(f) )
	    {
                let {hit, value} = calls.fetch(
                    f.name,
                    _this,
                    args
                );
                if (hit)
		    return value;
	    }

	    let call = run(
                f,
                _this,
                args
            );

	    if ( f.name )
            {
                if ( $options.canTestCall() )
		    test(f.name, _this, args, call, $results);
                if ( $options.canSaveCall() )
		    save(f.name, _this, args, call);
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
	            let call = run(f, _this, args);
	            test(f.name, _this, args, call, $results);
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
        value = f.apply(
            _this,
            args
        ),
        end = process.hrtime();
    return {
	value,
	utime: (end[0] - start[0]) * 1000000 + (end[1] - start[1]) / 1000
    };
};

function test (
    f_name,
    _this,
    args,
    call,
    results)
{
    let {hit, message, diff} = calls.compare(
        f_name,
        _this,
        args,
        call
    );

    if (!hit)
        return results.news.push("+ " + message);

    if (diff)
        return results.errors.push("! " + message);
    
    return results.successes.push("= " + message);
};

function save(
    f_name,
    _this,
    args,
    call)
{
    Object.assign(call, {
        name: f_name,
        _this,
        args
    });
    // Store result in cache
    calls.write(
        f_name,
        _this,
        args,
        call
    );
    // Make persistent
    calls.save();
};

module.exports = {
    createRunAll,
    createTrack
};
