const validateFunctions = require('./validate/futs'),
      
      fs = require('fs'),
      log = require('./log'),
      
      esprima = require('esprima'),
      escodegen = require('escodegen'),
      getFunctions = require('./instrument/get_functions'),
      instrument = require('./instrument/instrument');

function validateFile (file, callback) {
    fs.readFile(
        file,
        'utf-8',
        (error, data) => {
	    // javascript -> AST
	    let json_file;
	    try {
                data = removeShebang(data);
	        json_file = esprima.parse(data);
	    }
	    catch (e) {
	        log.error("[Parse error]",e);
	        return callback();
	    }

	    let json_functions = getFunctions(json_file);

	    // AST -> javascript (instrumented)
            let js_functions = json_functions
                .map( ({name, code}) => ({
                    name,
                    code: escodegen.generate(instrument(code))
                }) );
 
            validateFunctions(js_functions);

            callback(); // Resume processing changes when test complete
        });
}

function removeShebang(data) {
    // If the first line is a shebang (#!), remove it
    if (data && data.substr(0, 2) === '#!') {
        let endOfLineIndex = data.indexOf( '\n' );
        if (endOfLineIndex === -1)
            return "";
        data = data.substr(endOfLineIndex + 1);
    }
    return data;
}

module.exports = validateFile;
