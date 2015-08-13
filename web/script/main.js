$(function () {
	var map = L.map('map', {
		layers:[
			L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			})
		]
	}).setView([53.031, 13.307], 17);

	$.getJSON('data/tweets.json', function (data) {

		data = Object.keys(data).map(function (key) {
			return data[key];
		})

		data = data.sort(function (a,b) { return (parseFloat(a.id_str) < parseFloat(b.id_str)) ? -1 : 1; })

		var knownGeos = {};
		for (var i = data.length-1; i >= 0; i--) {
			var key = data[i].geo.join('_');
			if (knownGeos[key]) data[i] = false;
			knownGeos[key] = true;
		}

		data = data.filter(function (e) { return e });

		data.forEach(function (tweet, index) {
			var tweetNodeId = 'tweet'+tweet.id_str;

			var myIcon = L.icon({
				iconUrl: tweet.img,
				iconSize: [32, 32],
				iconAnchor: [16, 16],
				popupAnchor: [0, -16]
			});

			var marker = L.marker(
				[tweet.geo[1], tweet.geo[0]],
				{
					icon: myIcon,
					zIndexOffset: index*1000
				}
			).addTo(map);

			marker.on('popupopen', function () {
				var node = $('#'+tweetNodeId);
				node.find('p').text(tweet.text+'\n');
				if (tweet.photo) {
					node.append($('<div class="photo" style="background-image: url('+tweet.photo+')"></div>'))
				}
				node.append($('<a href="https://twitter.com/'+tweet.user+'/status/'+tweet.id_str+'" target="_blank">Open</a>'));
			})

			marker.bindPopup('<div id="'+tweetNodeId+'" class="popup-tweet"><p></p></div>', {minWidth:150});

		})

	})
})