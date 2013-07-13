
var url = require("url");
var http = require("http");

var util = require('util');

var dataSources = {
	"ad_contributors"					: 	"http://chs2013.herokuapp.com/ad_contributors.json",
	"ad_tweets"							: 	"http://chs2013.herokuapp.com/ad_tweets.json",
	"awtb_assets"						: 	"http://chs2013.herokuapp.com/awtb_assets.json",
	"cca_events"						: 	"http://chs2013.herokuapp.com/cca_events.json",
	"cs_awards"							: 	"http://chs2013.herokuapp.com/cs_awards.json",
	"ga_projects"						: 	"http://chs2013.herokuapp.com/.json",
	"gss_members"						: 	"http://chs2013.herokuapp.com/gss_members.json",
	"ps_plays"							: 	"http://chs2013.herokuapp.com/ps_plays.json",
	"rcs_paintings"						: 	"http://chs2013.herokuapp.com/rcs_paintings.json",
	"smc_compositions"					: 	"http://chs2013.herokuapp.com/smc_compositions.json",
	"isle_birds"						: 	"http://chs2013.herokuapp.com/isle_birds.json",
	"summerhall_events"					: 	"http://chs2013.herokuapp.com/summerhall_events.json",
	"glasgow_cultural_organisations"	: 	"http://chs2013.herokuapp.com/glasgow_cultural_organisations.json"
};

exports.root = function(req, res)
{
	res.type('text/plain');
	res.send('CHScot2013 Uniform API Version '+apiVersion);
};

exports.lookupValue = function(req, res) {	

	var dataset = req.params.dataset;
	var field = req.params.field;
	var value = req.params.value;

	var datasourceUrl = dataSources[ req.params.dataset ];
	if (datasourceUrl == null) {
		res.send('Invaid dataset', 404);
	}

	datasourceUrl = url.parse(datasourceUrl)
	
	var options = {
		host: datasourceUrl.host,
		port: 80,
		path: datasourceUrl.pathname
	};

	util.debug('Making datasource request to: ' + datasourceUrl);

	var callback = function(dsRes) {
		var dsResData = "";
		dsRes.on('data', function (chunk) {
			dsResData += chunk;
		});
		dsRes.on('end', function () {
			console.log(dsResData);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.write(dsResData);
			res.end();
		});
		dsRes.on('error', function () {
			res.send('Error communicating with source dataset', 501);
		});
	}

	http.request(options, callback).end();

}


