/*

/data/v1/
	ad_contributors/user_id/38176500

*/

var express = require('express');
var util = require("util");

var ChScotUniformApi = require('./ChScotUniformApi.js');
var api = new ChScotUniformApi();

var app = express();
var pjson = require('./package.json');
var apiVersion = pjson.version;
var dataUrl = "/data/"+apiVersion

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get( '/', function(req,res) {
	res.type('text/plain');
	res.write('CHScot2013 Uniform API Version '+api.version+"\n\n");
	res.write("Valid API Calls:"+"\n\n");
	res.write(dataUrl+"     view all datasets\n");
	res.write(dataUrl+"/:dataset/     view single dataset\n");
	res.write(dataUrl+"/q/:searchTerm/    search all datasets\n");
	res.write(dataUrl+"/:dataset/q/:searchTerm/     search a single dataset\n" );
	res.write(dataUrl+"/:dataset/:field/:value/     show entries in a single dataset where 'field' matches 'value'");
	res.write("\n");
	res.write("\n");
	res.write("Supported datasets:\n");
	for (var datasetId in api.dataSources) {
		res.write("id: "+datasetId+"     url: "+api.dataSources[datasetId]+"\n");
	}
	res.end();
} );
app.get( dataUrl+"/", function(req,res){api.viewAllDatasets(req,res);} );
app.get( dataUrl+"/:dataset/?", function(req,res){api.viewDataset(req,res);} );
app.get( dataUrl+"/q/:searchTerm/?", function(req,res){api.doSearch(req,res);} );
app.get( dataUrl+"/:dataset/q/:searchTerm/?", function(req,res){api.doSingleDatasetSearch(req,res);} );
app.get( dataUrl+"/:dataset/:field/:value/?", function(req,res){api.lookupValue(req,res);} );


app.listen(process.env.PORT || 8080);
