const Yummly = {
	YUMMLY_RECIPES_URL: 'https://api.yummly.com/v1/api/recipes',
	ingredients: [],
	getDataFromApi: function(allowedIngredient, callback) {	
		const query = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: allowedIngredient,
			maxresults: 15,
			start: 0,
		}
		$.getJSON(Yummly.YUMMLY_RECIPES_URL, query, callback);
	},
	collectIngredients: function() {	
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();
			// hide any previously successful results
			$('.js-recipeResults').empty();	
			$('.resultResponse').empty();
			// find ingredient input
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val();
			// display ingredient to list in browser and add it to array
			$('.js-ingredientList').append(`<li>${queryValue}</li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans) with %20
			console.log(encodeURI(Yummly.ingredients));
			// clear input
			queryTarget.val('');
			
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.displayApiData);
		});
	},
	clearSearch: function() {
		$('.js-clearBtn').click(function() {
			$('.js-ingredientList').empty();
			$('.resultResponse').empty();
			Yummly.ingredients = [];
		});
	},
	displayApiData: function(data) {
		console.log('dataLength:', data.matches.length);
		if (data.matches.length === 0) {
			$('.resultResponse').html("Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.");
		} else {
			$('.resultResponse').append(`Sucess! ${data.attribution.html}`);
			let newElements = '';
			for (let i = 0; i < data.matches.length; i++) {
				newElements += `<p>${data.matches[i].recipeName} from <span>${data.matches[i].sourceDisplayName}</span></p>`;
				// format ingredient list to have proper space after each comma between ingredients
				let ingredientString = '';
				for (let j = 0; j < data.matches[i].ingredients.length; j++) {
					ingredientString += data.matches[i].ingredients[j];
					if (data.matches[i].ingredients.length - 1 !== j) {
						ingredientString += ', ';
					}
				}
				newElements += `<p>Ingredients: ${ingredientString}</p>`;
				newElements += `<img src="${data.matches[i].imageUrlsBySize[90]}" alt=picture of ${data.matches[i].recipeName}">`;
			}
			$('.js-recipeResults').append(newElements);
		}
		console.log('data Object2:', data);
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearSearch();
	},
}	
$(Yummly.setup);
