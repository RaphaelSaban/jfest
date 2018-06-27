const log = require('../log'),
      clc = require('cli-color');

class Results {

    constructor () {
        Object.assign(this, {
	  news: [],
	  successes: [],
	  errors: []
        });
    }
    
    log () {
        let {news, successes, errors} = this;
        news.forEach( (newone) => log.out(newone) );
        successes.forEach( (success) => log.success(success) );
        errors.forEach( (error) => log.error(error) );
        log.out(
	    clc.bold("News["+news.length+"]"),
	    clc.bold.green("Successes["+successes.length+"]"),
	    clc.bold.red("Errors["+errors.length+"]")
        );
    }

}

module.exports = {
    create: () => new Results()
}
