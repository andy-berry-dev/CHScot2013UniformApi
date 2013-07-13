var url = require("url");
var request = require('request');
var util = require('util');


var sys = require('sys');

var ChScotUniformApi = function() {
	this.apiVersion = require('./package.json').version;
	this.dataSources = {
		"ad_contributors"					: 	"http://chs2013.herokuapp.com/ad_contributors.json?per_page=999999999",
		"ad_tweets"							: 	"http://chs2013.herokuapp.com/ad_tweets.json?per_page=999999999",
		"awtb_assets"						: 	"http://chs2013.herokuapp.com/awtb_assets.json?per_page=999999999",
		"cca_events"						: 	"http://chs2013.herokuapp.com/cca_events.json?per_page=999999999",
		"cs_awards"							: 	"http://chs2013.herokuapp.com/cs_awards.json?per_page=999999999",
		"ga_projects"						: 	"http://chs2013.herokuapp.com/ga_projects.json?per_page=999999999",
		"gss_members"						: 	"http://chs2013.herokuapp.com/gss_members.json?per_page=999999999",
		"ps_plays"							: 	"http://chs2013.herokuapp.com/ps_plays.json?per_page=999999999",
		"rcs_paintings"						: 	"http://chs2013.herokuapp.com/rcs_paintings.json?per_page=999999999",
		"isle_birds"						: 	"http://chs2013.herokuapp.com/isle_birds.json?per_page=999999999",
		"summerhall_events"					: 	"http://chs2013.herokuapp.com/summerhall_events.json?per_page=999999999",
		"glasgow_cultural_organisations"	: 	"http://chs2013.herokuapp.com/glasgow_cultural_organisations.json?per_page=999999999"
	};
	this.cachedResponses = {};
}

ChScotUniformApi.prototype.root = function(req, res)
{
	res.type('text/plain');
	res.send('CHScot2013 Uniform API Version '+this.apiVersion);
};


ChScotUniformApi.prototype.viewAllDatasets = function(req, res)
{
	this._doDatasetRequest(this.dataSources, res)	
}

ChScotUniformApi.prototype.viewDataset = function(req, res)
{
	var singleDatasetMap = this._getDatasourceFromRequest(req,res);
	this._doDatasetRequest( singleDatasetMap, res);
}

ChScotUniformApi.prototype.doSearch  = function(req, res)
{
	var datasetMap = this._appendQueryUrlToDatasets(this.dataSources,req);
	this._doDatasetRequest( datasetMap, res);
}

ChScotUniformApi.prototype.doSingleDatasetSearch  = function(req, res)
{
	var singleDatasetMap = this._getDatasourceFromRequest(req,res);
	singleDatasetMap = this._appendQueryUrlToDatasets(singleDatasetMap,req);
	this._doDatasetRequest( singleDatasetMap, res);
}



ChScotUniformApi.prototype._appendQueryUrlToDatasets = function(dataSources,req)
{
	var queryString = req.params.searchTerm;
	var datasetsWithQueryString = {};
	for (key in dataSources) {
		var value = dataSources[key];
		datasetsWithQueryString[ key ] = value+"&q="+queryString;
    }
    return datasetsWithQueryString;
}


ChScotUniformApi.prototype._getDatasourceRequestUrl = function(dataSources,dataset,res)
{
	var datasourceUrl = dataSources[ dataset ];
	if (datasourceUrl == null) {
		res.send('Invaid dataset', 404);
	}
	return datasourceUrl;
}

ChScotUniformApi.prototype._getDatasourceFromRequest = function(req,res)
{
	var dataset = req.params.dataset;
	var requestUrl = this._getDatasourceRequestUrl(this.dataSources, dataset, res);
	var singleDatasetMap = {};
	singleDatasetMap[dataset] = requestUrl;
	return singleDatasetMap;
}

ChScotUniformApi.prototype._doDatasetRequest = function(dataSources,res)
{
	var numberOfDatasets = 0;
	var numberOfResponsesRecieved = 0;

    for (key in dataSources) {
        if (dataSources.hasOwnProperty(key)) numberOfDatasets++;
    }

    dataSourcesReverseLookup = {}
	for (key in dataSources) {
		var value = dataSources[key];
		dataSourcesReverseLookup[ value ] = key;
    }

	var responseJson = {};

	var _this = this;
	var concatenateDatasets = function(error, response, body) 
	{
		var datasetKey = dataSourcesReverseLookup[response.request.href];
		if (datasetId == null) 
		{
			res.send('Unable to find dataset key for response', 501);
		}

		var jsonBody = body;
		var oJson = JSON.parse(jsonBody);
		responseJson[datasetKey] = oJson[datasetKey];
		numberOfResponsesRecieved++;

		if (numberOfResponsesRecieved == numberOfDatasets) 
		{
			res.write( JSON.stringify(responseJson) );
			res.end();
		}

	}

	for (var datasetId in dataSources){
		var datasetUrl = this._getDatasourceRequestUrl(dataSources,datasetId, res);
		this._doRequest(res, datasetUrl, concatenateDatasets);
	}
}

ChScotUniformApi.prototype._doRequest = function(res, url, callback)
{
	var _this = this;
	var cacheResponseCallback = function(error, response, body)
	{
		_this._checkAndHandleRequestError(error,response,body,res);
		var etag = response.headers['etag'];
		var hasValidCachedResponse = false;
		if (etag != null) 
		{
			var cachedResponseObj = _this.cachedResponses[url];
			if (cachedResponseObj != null && cachedResponseObj["etag"] == etag) {
				hasValidCachedResponse = true;
				util.debug("Valid cached response for " + url + " using cached content.");
				callback(cachedResponseObj["error"], cachedResponseObj["response"], cachedResponseObj["body"]);
			}
		}
		if (!hasValidCachedResponse) {
			util.debug("No valid cached response");
			util.debug("Doing GET for " + url);
			request.get(url, function(error,response,body) {
				_this._checkAndHandleRequestError(error,response,body,res);
				util.debug("Got response from " + response.request.href + " - " + response.statusCode);
				var etag = response.headers['etag'];
				_this.cachedResponses[url] = {"etag":etag,"error":error,"response":response,"body":body};
				callback(error, response, body);
			});	
		}
	}
	util.debug("Doing HEAD for " + url);
	request.head(url, cacheResponseCallback);
}

ChScotUniformApi.prototype._checkAndHandleRequestError = function(error,response,body,res)
{
	if (error || response.statusCode != 200) {	
		res.send('Error communicating with source data ('+response.statusCode + " - "+error+')', 501);
	}
}


//callback(error,response,body);

module.exports = ChScotUniformApi;

