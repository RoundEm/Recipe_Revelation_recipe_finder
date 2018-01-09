const Yummly = {
	INGREDIENT_URL: 'https://api.yummly.com/v1/api/recipes',
	RECIPE_URL: 'http://api.yummly.com/v1/api/recipe/',
	resultIngredientData: [],
	ingredientsQuery: [],
	resultRecipeData: [],
	recipeIngredients: [],
	recipeName: [],
	recipeImage: [],
	page: 0,
	getIngredientDataFromApi: function(allowedIngredient, callback, start) {	
		const apiAuth = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: allowedIngredient,
			maxResult: 10,
			start: start,
		}
		$.getJSON(Yummly.INGREDIENT_URL, apiAuth, callback);
	},
	processIngredientApiData: function(data) {
		console.log('ingredient Data:', data);
		// loop through data object and add Recipe Name and Source Name to newElements string
		for (let i = 0; i < data.matches.length; i++) {
			Yummly.recipeName += `<p>${data.matches[i].recipeName} from <span>${data.matches[i].sourceDisplayName}</span></p>`;
			// format ingredient list to have a space after each comma between ingredients
			let ingredientString = '';
			for (let j = 0; j < data.matches[i].ingredients.length; j++) {
				ingredientString += data.matches[i].ingredients[j];
				if (data.matches[i].ingredients.length - 1 !== j) {
					ingredientString += ', ';
				}
			}
			Yummly.recipeIngredients.push(`<p>Ingredients: ${ingredientString}</p>`);
		}
		// if not on first results page, show prior page button
		if (Yummly.page > 10) {
			$('.priorPg').show();
		} else if (Yummly.page = 10) {
			$('.priorPg').hide();
		}
		// if on a page with results, hide Search section
		if (Yummly.page !== 0) {
			$('.searchSection').hide();
		}
		Yummly.getRecipeDataFromApi(Yummly.displayRecipeData);
	},
	getRecipeDataFromApi: function(callback) {
		console.log('getRecipeDataFromApi length:', Yummly.resultIngredientData.matches.length);
		for (let i = 0; i < Yummly.resultIngredientData.matches.length; i++) {
			const apiAuth = {
				_app_id: 'aa298305',
				_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			}
			console.log('result recipe data ID:', Yummly.resultIngredientData.matches[i].id);
			$.getJSON(Yummly.RECIPE_URL + Yummly.resultIngredientData.matches[i].id, apiAuth, Yummly.processRecipeData);
		}	
		callback();
	},
	processRecipeData: function(recipeData) {
		// Yummly.resultRecipeData.push(recipeData);
		console.log('recipeData:', recipeData);
		console.log('Yummly.resultRecipeData length:', Yummly.resultRecipeData.length);
	},
	displayRecipeData: function(recipeData) {
		console.log('displayRecipeData func ran');
		console.log('recipeIngredients:', recipeIngredients);
	},
// `<img src="${Yummly.resultRecipeData[i].images[0].hostedLargeUrl}">`
	collectIngredients: function() {	
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();
			// hide any previously successful results and hide More Results button
			$('.js-recipeResults').empty();			
			$('.resultResponse').empty();
			$('.nextPg').hide();
			// find ingredient input
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val();
			// display ingredient to list in browser and add it to array
			$('.ingredientList ul').append(`<li>${queryValue}</li>`);
			Yummly.ingredientsQuery.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans) with %20
			console.log(encodeURI(Yummly.ingredientsQuery));
			// clear input
			queryTarget.val('');	
			$('.searchSection').show();
			Yummly.page = 0;
		});
	},
	removeIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			$(this).remove();
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			Yummly.getIngredientDataFromApi(Yummly.ingredientsQuery, Yummly.matchValidation);
		});
	},
	clearSearch: function() {
		$('.js-clearBtn').click(function() {
			$('.ingredientList ul').empty();
			$('.resultResponse').empty();
			Yummly.ingredientsQuery = [];
		});
	},
	matchValidation: function(data) {
		// check if recipes are found for ingredient query
		if (data.matches.length === 0) {
			$('.resultResponse').html('Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.');
		} else {
			$('.resultResponse').html(`Sucess! ${data.attribution.html}`);
			$('.nextPg').show();
			Yummly.resultIngredientData = data;
			Yummly.processIngredientApiData(data);
			Yummly.page += 10;	
		}
	},
	nextPage: function() {
		$('.nextPg').click(function() {
			Yummly.getIngredientDataFromApi(Yummly.ingredientsQuery, Yummly.processIngredientApiData, Yummly.page);
			Yummly.page += 10;
			console.log('next page ran:', Yummly.page);
			// Scroll to top of page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
		});
	},
	priorPage: function() {
		$('.priorPg').click(function() {
			Yummly.getIngredientDataFromApi(Yummly.ingredientsQuery, Yummly.processIngredientApiData, Yummly.page);
			if (Yummly.page = 10) {
				$('.priorPg').hide();
			}
			Yummly.page -= 10;
			console.log('prior page ran:', Yummly.page);
			// Scroll to top of page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
		});
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearSearch();
		Yummly.removeIngredient();
		Yummly.nextPage();
		Yummly.priorPage();
	},

}	
$(Yummly.setup);
