/*

/data/v1/
	ad_contributors/user_id/38176500

*/


var express = require('express');
var api = require('./api.js');

var app = express();

var pjson = require('./package.json');
var apiVersion = pjson.version;
var dataUrl = "/data/"+apiVersion

app.get( '/', api.root );
app.get( dataUrl+"/:dataset/:field/:value/", api.lookupValue );

app.listen(process.env.PORT || 8080);