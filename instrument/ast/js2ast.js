const fs = require('fs');

fs.readFile(process.argv[2], 'utf-8', function(error, data) {
    const esprima = require('esprima');
    console.log(
	JSON.stringify(
	    esprima.parse(data),
	    null,
	    2
	)
    );
});
