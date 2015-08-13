var fs = require('fs');
var util = require('util');
var path = require('path');
var OAuth = require('oauth').OAuth;

var configFile    = path.resolve(__dirname, './config.js');
var localDataFile = path.resolve(__dirname, './tweets.json');
var webDataFile   = path.resolve(__dirname, '../web/data/tweets.json');

var config = require(configFile);


var tweets = {};
if (fs.existsSync(localDataFile)) tweets = JSON.parse(fs.readFileSync(localDataFile, 'utf8'));


var oa = new OAuth('https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    config.twitterAuth.consumerKey,
    config.twitterAuth.consumerSecret,
    '1.0A', null, 'HMAC-SHA1');


var access_token = '50503396-Fi6mx90BMZonN3ybdVcejpxLUmUsWm9eUcTsBYKPw';
var access_token_secret = 'jJzRGqZgO7UrbwI4YLaumBarfO9REVQcKChx7Aob13Vqe';

setTimeout(scanTwitter, 1000);

function scanTwitter() {
	oa.get(
		'https://api.twitter.com/1.1/search/tweets.json?geocode=53.031,13.307,1km&count=100&result_type=recent',//q=blingblong
		access_token,
		access_token_secret,
		function (error, data) {
			if (error) console.log(error);
			data = JSON.parse(data);
			data = data.statuses.map(function (entry) {
				var photo = false;

				if (entry.entities.media) {
					entry.entities.media.some(function (media) {
						if (media.type == 'photo') {
							photo = media.media_url;
							return false;
						}
						return true;
					})
				}

				try {
					return {
						id_str: entry.id_str,
						created_at: entry.created_at,
						img: entry.user.profile_image_url,
						user: entry.user.screen_name,
						geo: entry.coordinates.coordinates,
						favorite_count: entry.favorite_count,
						retweet_count: entry.retweet_count,
						text: entry.text,
						photo: photo
					}
				} catch (e) {
					return false;
				}
			}).filter(function (e) { return e });

			var newTweets = 0;
			data.forEach(function (tweet) {
				if (!tweets[tweet.id_str]) newTweets++;
				tweets[tweet.id_str] = tweet
			})

			console.log('New Tweets: '+newTweets);

			fs.writeFileSync(localDataFile, JSON.stringify(tweets, null, '\t'), 'utf8');
			fs.writeFileSync(webDataFile, JSON.stringify(tweets), 'utf8');
		}
	)
}
