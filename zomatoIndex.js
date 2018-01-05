const Zomato = {
	ZOMATO_URL: 'https://developers.zomato.com/api/v2.1/',
	getCityDataFromAPI: function(cityName) {
		const query = {
			q: cityName,
		}
		$.ajax({
			url: `${Zomato.ZOMATO_URL}/cities`, 
			data: query, 
			headers: {
				'user-key': 'ef5cefd5f83ce27784b9deef30601b9d'
			},
			success: Zomato.collectApiData,
		});
	},
	collectApiData: function(data) {
		console.log('data:', data.location_suggestions[0].name);
		let cityId = data.location_suggestions[0].name;
		$('.js-render-results').append(cityId);
	},
	submitListener: function() {
		$('.js-location-form').submit(function(event) {
			event.preventDefault();
			const queryTarget = $(this).find('.js-location-query');
			const queryValue = queryTarget.val();
			queryTarget.val('');
			console.log('queryValue:', queryValue);
			Zomato.getCityDataFromAPI(queryValue);
		});
	},
	setup: function() {
		Zomato.submitListener();
	},
}
$(Zomato.setup);