/*

/data/v1/
	ad_contributors/user_id/38176500

*/

var express = require('express');
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

app.get( '/', api.root );
app.get( dataUrl+"/", function(req,res){api.viewAllDatasets(req,res);} );
app.get( dataUrl+"/:dataset/", function(req,res){api.viewDataset(req,res);} );
app.get( dataUrl+"/q/:searchTerm", function(req,res){api.doSearch(req,res);} );
app.get( dataUrl+"/:dataset/q/:searchTerm", function(req,res){api.doSingleDatasetSearch(req,res);} );
app.get( dataUrl+"/:dataset/:field/:value/", function(req,res){api.lookupValue(req,res);} );


//
/* add __summary **/
/* add __dsName **/

app.listen(process.env.PORT || 8080);
