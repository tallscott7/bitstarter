#!/usr/bin/env node

var fs = require('fs');
var program  = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URL_DEFAULT = false;

var assertFileExists = function(infile){
    var instr = infile.toString();
    if(!fs.existsSync(instr)){
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var assertUrlExists = function(inurl){
    var inustr = inurl.toString();
    rest.get(inustr).on('fail', function (result){
	if (result instanceof Error) {
	    console.log("%s does not exist. Exiting.", inustr);
	    procss.exit(1);
	  }
    });
    return inustr;
} 

var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var cheerioUrl = function(htmlfile){
    return cheerio.load(htmlfile);
};

var loadChecks = function (checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};


var checkHtmlFile = function(htmlfile, checksfile, typein){
    if (typein == "file"){
	$ = cheerioHtmlFile(htmlfile);
    } else {
	fs.writeFile('test', htmlfile);
	$ = cheerioUrl(htmlfile);
    };
    console.log($);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks){
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn){
    return fn.bind({});
};

if(require.main == module){
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u --url <url_address>', 'URL to index.html', clone(assertUrlExists), URL_DEFAULT)
	.parse(process.argv);
    if (program.url){
	console.log("called program.url" + program.url);
	rest.get(program.url).on('complete', function(result){
	    var checkJson = checkHtmlFile(result, program.checks, false);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    fs.writeFile('outJson', outJson);
	});
	} else {
	    var checkJson = checkHtmlFile(program.file, program.checks, file);
	    var outJson = JSON.stringify(checkJson, null, 4);
	    console.log(outJson);
	    fs.writeFile('outJson', outJson);
	};
} else {
    exports.checkHtmlFile = checkHtmlFile;
}


