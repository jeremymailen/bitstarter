/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists = function(url) {
	return true;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var logOutput = function(output) {
	var outJson = JSON.stringify(output, null, 4);
	console.log(outJson);
};

var checkHtml = function(htmlDom, checksfile) {
    $ = htmlDom;
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkUrl = function(url, checksfile) {
	rest.get(url).on('complete', function(content) {
        if (content instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
        	var htmlDom = cheerio.load(content);
        	logOutput(checkHtml(htmlDom, checksfile));
        }
	});
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if (require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file [html_file]', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url [web_url]', 'Path to web URL for index.html')
        .parse(process.argv);

    if (!program.file && !program.url) {
    	console.log("Must specify either -f or -u");
    	exit(1);
    } else if (!program.url) {
    	logOutput(checkHtml(cheerioHtmlFile(program.file), program.checks));
    } else {
    	checkUrl(program.url, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}