const Yummly = {
	INGREDIENT_URL: 'https://api.yummly.com/v1/api/recipes',
	RECIPE_URL: 'http://api.yummly.com/v1/api/recipe/',
	resultData: [],
	ingredients: [],
	page: 0,
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
	getRecipeDataFromApi: function() {
		console.log('getRecipeDataFromApi ran:', Yummly.resultData.matches.length);
		// TODO: switch this back: for (let i = 0; i < Yummly.resultData.matches.length; i++) {
			for (let i = 0; i < 1; i++) {
			const query = {
				_app_id: 'aa298305',
				_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			}
			console.log('Yummly.resultData.matches[0].id:', Yummly.resultData.matches[i].id);
			$.getJSON(Yummly.RECIPE_URL + Yummly.resultData.matches[i].id, query, Yummly.processRecipeData);
		}	
		Yummly.displayRecipeData();
	},
	resultDataIndexById: function(id) {
		console.log('resultDataIndexById:', id);
		console.log('Yummly.resultData.matches:', Yummly.resultData.matches);
		for (let i = 0; i < Yummly.resultData.matches.length; i++) {
			// if id matches input parameter return array index number
			console.log('Yummly.resultData.matches[i].id', Yummly.resultData.matches[i].id);
			if (Yummly.resultData.matches[i].id == id) {
				return i;
			}
		}
	},
	processRecipeData: function(data) {
		console.log('processRecipeData:', data);
		// loop over data
		// look at ID of data
		// match it to an item from the result data array
		let resultDataIndex = Yummly.resultDataIndexById(data.id);
		console.log('resultDataIndex:', resultDataIndex);
		for (let property in data) {
			console.log('property in data:', property)
			if (data.hasOwnProperty(property)) {
				console.log('Yummly.resultData.matches[resultDataIndex]:', Yummly.resultData.matches[resultDataIndex]);
				let objectKeys = Object.keys(Yummly.resultData.matches[resultDataIndex]);
    			if (!objectKeys.includes(property)) {
    				// if property is not in existing keys of data, add it
    				// the line below is supposed to do this but doesn't work
    				Yummly.resultData.matches[resultDataIndex][property] = data.property;
    			}
		    }
		}
		console.log('all info added to Yummly.resultData:', Yummly.resultData)
	},
	displayRecipeData: function() {
		console.log('displayRecipeData func ran');
	},
	collectIngredients: function() {	
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();
			// hide any previously successful results and hide More Results button
			$('.js-recipeResults').empty();			
			$('.resultResponse').empty();
			$('.moreResults').hide();
			$('.priorResults').hide();
			// find ingredient input
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val().toLowerCase();
			// display ingredient to list in browser and add it to array
			$('.ingredientList ul').append(`<li>${queryValue}</li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans) with %20
			console.log(encodeURI(Yummly.ingredients));
			// clear input
			queryTarget.val('');
			Yummly.page = 0;
			$('.searchSection').show();
		});
	},
	removeIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			$(this).remove();
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.matchValidation);
			if (Yummly.page > 0) {
				Yummly.page = 0;
			} else {
				Yummly.page += 10;
			}
			console.log('page:', Yummly.page);
		});
	},
	clearIngredientList: function() {
		$('.js-clearBtn').click(function() {
			$('.ingredientList ul').empty();
			$('.resultResponse').empty();
			Yummly.ingredients = [];
		});
	},
	matchValidation: function(data) {
		// check if matches are found
		if (data.matches.length === 0) {
			$('.resultResponse').html("Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.");
		} else {
			$('.resultResponse').html(`Sucess! ${data.attribution.html}`);
			$('.moreResults').show();
			$('.searchSection').hide();
			Yummly.resultData = data;
			Yummly.processIngredientData(data);
		}
	},
	processIngredientData: function(data) {
		// loop through data object and add Recipe Name and Source Name to newElements string
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
		}
		if (Yummly.page > 10) {
			$('.priorResults').show();
		} else if (Yummly.page = 10) {
			$('.priorResults').hide();
		}
		// if (Yummly.page !== 10) {
		// 	$('.searchSection').
		// }
		$('.js-recipeResults').html(newElements);
		Yummly.getRecipeDataFromApi();
	},
	moreResults: function() {
		$('.moreResults').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.processIngredientData, Yummly.page);
			Yummly.page += 10;
			console.log('page Number:', Yummly.page);
			// Scroll to top of next page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
		});
	},
	priorResults: function() {
		$('.priorResults').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.processIngredientData, Yummly.page);
			Yummly.page -= 10;	
			console.log('page Number:', Yummly.page);
			// Scroll to top of next page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
		});
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearIngredientList();
		Yummly.removeIngredient();
		Yummly.moreResults();
		Yummly.priorResults();
	},
}	
$(Yummly.setup);
