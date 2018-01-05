const Details = {
	YUMMLY_RECIPE_URL: '// http://api.yummly.com/v1/api/recipe',
	ingredients: [],
	getDataFromApi: function(allowedIngredient, callback) {	
		const query = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: allowedIngredient,
			maxresults: 15,
			start: 0,
		}
		$.getJSON(Details.YUMMLY_RECIPE_URL, query, callback);
	},
	setup: function() {
		
	},
}
$(Details.setup);