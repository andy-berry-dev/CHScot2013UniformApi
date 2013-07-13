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
		"smc_compositions"					: 	"http://chs2013.herokuapp.com/smc_compositions.json?per_page=999999999",
		"isle_birds"						: 	"http://chs2013.herokuapp.com/isle_birds.json?per_page=999999999",
		"summerhall_events"					: 	"http://chs2013.herokuapp.com/summerhall_events.json?per_page=999999999",
		"glasgow_cultural_organisations"	: 	"http://chs2013.herokuapp.com/glasgow_cultural_organisations.json?per_page=999999999"
	};

	this.dataSourcesReverseLookup = {}

	for (key in this.dataSources) {
		var value = this.dataSources[key];
		this.dataSourcesReverseLookup[ value ] = key;
    }

}

ChScotUniformApi.prototype.root = function(req, res)
{
	res.type('text/plain');
	res.send('CHScot2013 Uniform API Version '+this.apiVersion);
};


ChScotUniformApi.prototype.viewAllDatasets = function(req, res)
{
	var numberOfDatasets = 0;
	var numberOfResponsesRecieved = 0;

    for (key in this.dataSources) {
        if (this.dataSources.hasOwnProperty(key)) numberOfDatasets++;
    }

	var responseJson = {};

	var _this = this;
	var concatenateDatasets = function(error, response, body) 
	{
		util.debug("Got response from " + response.request.href + " - " + response.statusCode);
		if (!error && response.statusCode == 200) {
			var datasetKey = _this.dataSourcesReverseLookup[response.request.href];
			if (datasetId == null) 
			{
				res.send('Unable to find dataset key for response', 501);
			}

			var jsonBody = body;
			var oJson = JSON.parse(jsonBody);
			responseJson[datasetKey] = oJson[datasetKey];
			numberOfResponsesRecieved++;
		} else {
			res.send('Error communicating with source dataset ('+response.statusCode + " - "+error+')', 501);
		}

		if (numberOfResponsesRecieved == numberOfDatasets) 
		{
			res.write( JSON.stringify(responseJson) );
			res.end();
		}

	}

	for (var datasetId in this.dataSources){
		var datasetUrl = this._getDatasourceRequestUrl(datasetId);
		util.debug("Requesting " + datasetUrl);
		request(datasetUrl, concatenateDatasets);
	}
}

ChScotUniformApi.prototype.viewDataset = function(req, res)
{
	var requestUrl = this._getDatasourceRequestUrl(req.params.dataset, res);
	request(requestUrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(body);
			res.end();
		} else {
			res.send('Error communicating with source dataset', 501);
		}
	});
}

ChScotUniformApi.prototype.doSearch  = function(req, res)
{

}


ChScotUniformApi.prototype._getDatasourceRequestUrl = function(dataset,res)
{
	var datasourceUrl = this.dataSources[ dataset ];
	if (datasourceUrl == null) {
		res.send('Invaid dataset', 404);
	}
	return datasourceUrl;
}

module.exports = ChScotUniformApi;

