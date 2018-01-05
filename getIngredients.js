const Yummly = {
	INGREDIENT_URL: 'https://api.yummly.com/v1/api/recipes',
	RECIPE_URL: 'http://api.yummly.com/v1/api/recipe',
	ingredients: [],
	startPage: 0,
	// prevPage: '',
	// nextPage: '',
	getDataFromApi: function(allowedIngredient, callback, start) {	
		const query = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: allowedIngredient,
			maxResult: 10,
			start: start,
		}
		$.getJSON(Yummly.INGREDIENT_URL, query, callback);
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
			$('.ingredientList ul').append(`<li>${queryValue}</li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans) with %20
			console.log(encodeURI(Yummly.ingredients));
			// clear input
			queryTarget.val('');	
		});
	},
	removeIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			$(this).remove();
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.macthVerification);
			Yummly.startPage += 10;
			console.log('startFind:', Yummly.startPage);
		});
	},
	clearSearch: function() {
		$('.js-clearBtn').click(function() {
			$('.ingredientList ul').empty();
			$('.resultResponse').empty();
			Yummly.ingredients = [];
		});
	},
	macthVerification: function(data) {
		// check if matches are found
		if (data.matches.length === 0) {
			$('.resultResponse').html("Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.");
		} else {
			$('.resultResponse').append(`Sucess! ${data.attribution.html}`);
			Yummly.displayApiData(data);
		}
	},
	displayApiData: function(data) {
		// loop through data object and add Recipe Name and Source Name to newElements string
		let newElements = '';
		let recipeId = [];
		for (let i = 0; i < data.matches.length; i++) {
			recipeId.push(data.matches[i].id);
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
		console.log('recipeId:', recipeId);
		console.log('data Object2:', data);	
		// functionName(recipeId); TODO - figure out how to handle the Recipe IDs
	},
		
	moreResults: function() {
		$('.moreResults').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.displayApiData, Yummly.startPage);
			Yummly.startPage += 10;
			console.log('startMore:', Yummly.startPage);
		});
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearSearch();
		Yummly.removeIngredient();
		Yummly.moreResults();
	},
	// getRecipeDataFromApi: function(, callback) {	
	// 	const query = {
	// 		_app_id: 'aa298305',
	// 		_app_key: 'f1568a729fd303537771dd46dbc3f91b',
	// 		allowedIngredient: allowedIngredient,
	// 		maxresults: 15,
	// 		start: 0,
	// 	}
	// 	$.getJSON(Yummly.YUMMLY_RECIPES_URL, query, callback);
	// },
}	
$(Yummly.setup);
