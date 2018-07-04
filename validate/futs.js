const safeEval = require('safe-eval'),
      log = require('../log'),
      
      results = require('./results'),
      $functions = {};

class Options {
    constructor ($futs) {
        this.canFake = true;
        this.action = ""; // "" or "$test" or "$save"
        this.$futs = $futs;
    }
              
    canBeFaked (f) {
        // do not fake functions that are under test
        return ( this.canFake && ! ( f.name in this.$futs ) );
    }
    
    canTestCall () {
        return this.action === "$test" || this.action === "$save";
    }
    
    canSaveCall () {
        return this.action === "$save";
    }
}
function validateFunctions (js_functions) {

    const $futs = js_functions.reduce( (acc, {name}) => Object.assign(acc, {[name] : true}), {}), // Functions under test

          $options = new Options($futs),
          
          $results = {
              regression: results.create(),
              change: results.create()
          },
          
          $runAll = require('./track').createRunAll($results.regression),
          $track = require('./track').createTrack($options, $results.change);

    function useCacheFor(f_name) {
        return true;
    }
    
    // javascript -> function
    Object.assign (
        $functions,
        safeEval(
            // Eval all functions at once to link them
            jsFunctionsToString(js_functions),
            // Inject $track function
            Object.assign(
                {},
                $functions,
                {$track}
            )
        )
    );
    
    // Run regression tests first
    js_functions
        .filter( ({name}) => name !== "$test" && name !== "$save" )
        .forEach( ({name}) => {
	    log.out("Validating '"+name+"'");
	    try {
		safeEval(
                    // Expression to `eval`
                    '$runAll($functions[name])',
                    // context
                    {
                        $runAll,
                        $functions,
                        name
                    }
                );
	    }
	    catch (e) {
	        log.error("[Regression runtime error] " + e);
            }
        });

    // Run functions to test or save results
    js_functions
        .filter( ({name}) => name === "$test" || name === "$save" )
        .forEach( ({name}) => {
	    try {
                $options.action = name;
		safeEval(
                    // Expression to `eval`
                    name+'()',
                    // context
                    $functions
                );
	    }
	    catch (e) {
	        log.error("[Test runtime error] " + e);
            }
        });

    // // Clear list for this file
    // js_functions
    //     .forEach( ({name}) => delete $futs[name]);

    $results.regression.log();
    log.hLineDashed();
    $results.change.log();
    
};

function jsFunctionsToString(js_functions) {
    return 'function () {' +
        'var tmp_functions = {};' +
        js_functions
        .map( ({name, code}) => 'var ' + name + ' = tmp_functions["' + name + '"] = ' + code)
        .join(';')
        + ';return tmp_functions;} ()';
}

module.exports = validateFunctions;
