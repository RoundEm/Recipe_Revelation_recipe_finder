const Yummly = {
	INGREDIENT_URL: 'https://api.yummly.com/v1/api/recipes',
	RECIPE_URL: 'https://api.yummly.com/v1/api/recipe/',
	resultData: [],
	ingredients: [],
	responseResult: 9,
	page: 0,
	displayCounter: 0,
	totalResults: 0,
	resultsRemaining: 0,
	resultsLimiter: 9,
	getDataFromApi: function(allowedIngredient, callback, start) {
		const apiAuth = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: allowedIngredient,
			maxResult: 9,
			start: start,
		}
		$.getJSON(Yummly.INGREDIENT_URL, apiAuth, callback);
	},
	getRecipeDataFromApi: function() {
		for (let i = 0; i < Yummly.resultData.matches.length; i++) {
			const apiAuth = {
				_app_id: 'aa298305',
				_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			}
			$.getJSON(Yummly.RECIPE_URL + Yummly.resultData.matches[i].id, apiAuth, Yummly.processRecipeData);
		}
	},
	resultDataIndexById: function(id) {
		for (let i = 0; i < Yummly.resultData.matches.length; i++) {
			// if id matches input parameter return array index number
			if (Yummly.resultData.matches[i].id === id) {
				return i;
			}
		}
	},
	processRecipeData: function(data) {
		console.groupCollapsed(`processRecipeData: ${data.id}`);
		console.log('data:', data);
		// loop over data and look at ID of data and match it to an item from the result data array
		let resultDataIndex = Yummly.resultDataIndexById(data.id);
		console.log('resultDataIndex:', resultDataIndex);
		for (let property in data) {
			if (data.hasOwnProperty(property)) {
				console.log(`Yummly.resultData.matches[${resultDataIndex}]:`, Yummly.resultData.matches[resultDataIndex]);
				let objectKeys = Object.keys(Yummly.resultData.matches[resultDataIndex]);
				console.log('objectKeys:', objectKeys);
				console.log('property:', property);
				// if property is not in existing keys of data, add it
				let includesProperty = (objectKeys).includes(property);
				if (!includesProperty) {
  					Yummly.resultData.matches[resultDataIndex][property] = data[property];
    			}
		    }
		}
		console.log('all info added to Yummly.resultData:', Yummly.resultData);
		console.groupEnd();
		Yummly.displayCounter++;
		console.log('Yummly.displayCounter:', Yummly.displayCounter);
		Yummly.displayRecipeData();
	},
	displayRecipeData: function() {
		let ingredientsProper = Yummly.formatIngredients();
		if (Yummly.displayCounter === Yummly.resultsLimiter) {
			for (let i = 0; i < Yummly.resultData.matches.length; i++) {
				let recipeName = Yummly.resultData.matches[i].name;
				let sourceName = Yummly.resultData.matches[i].sourceDisplayName;
				let recipeIngredients = Yummly.resultData.matches[i].ingredients;
				let recipeTime = `${Yummly.resultData.matches[i].totalTimeInSeconds / 60} minutes`;
				$('.js-recipeResults').append(
					`<h3>${recipeName} by ${sourceName}</h3>
					<p>Ingredients: ${recipeIngredients}</p>
					<p>Total Time: ${recipeTime}</p>
					<img src="${Yummly.resultData.matches[i].images[0].imageUrlsBySize[360]}">`
				);
			}
		}	
	},
	// resultsRemaining
	collectIngredients: function() {
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();
			// hide any previously successful results and hide More Results button
			$('.js-recipeResults').empty();		
			$('.moreResults').hide();
			$('.priorResults').hide();
			// find ingredient input
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val().toLowerCase();
			// display ingredient to list in browser and add it to array
			$('.ingredientList ul').append(`<li>${queryValue}</li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans with %20)
			console.log(encodeURI(Yummly.ingredients));
			queryTarget.val('');
			$('.findRecipes').show();
		});
	},
	removeIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			$(this).remove();
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.ingredientMatchValidation);
			if (Yummly.page > 0) {
				Yummly.page = 0;
			} 
			console.log('page:', Yummly.page);
		});
	},
	clearIngredientList: function() {
		$('.js-clearBtn').click(function() {
			$('.ingredientList ul').empty();
			$('.resultResponse').empty();
			Yummly.ingredients = [];
			Yummly.displayCounter = 0;
		});
	},
	ingredientMatchValidation: function(data) {
		// TODO - check if variable is defined using'typeof'
		// check if matches are found
		if (data.matches.length === 0) {
			$('.resultResponse').html('Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.');
		} else {
			$('.resultResponse').html(`Success! ${data.attribution.html}`);
			$('.moreResults').show();
			$('.findRecipes').hide();
			Yummly.resultData = data;
			Yummly.totalResults = data.totalMatchCount;
			console.log('totalResults:', Yummly.totalResults);
			console.log('Yummly.resultData', Yummly.resultData);
			Yummly.getRecipeDataFromApi();
		}
	},
	checkPageNumber: function(data) {
		Yummly.resultData = data;
		Yummly.resultsRemaining = Yummly.totalResults - Yummly.page;
		console.log('Yummly.resultsRemaining:', Yummly.resultsRemaining);
		if (Yummly.resultsRemaining < Yummly.responseResult) {
			Yummly.resultsLimiter = Yummly.resultsRemaining;		
		}
		Yummly.getRecipeDataFromApi();
	},
	formatIngredients: function() {
		// format ingredient list to have proper space after each comma between ingredients
		let ingredientString = '';
			for (let i = 0; i < data.matches[i].ingredients.length; j++) {
				ingredientString += data.matches[i].ingredients[j];
				if (data.matches[i].ingredients.length - 1 !== j) {
					ingredientString += ', ';
				}
			}
		return ingredientString;
	},
	paginationButtonFilter: function(data) {
		if (Yummly.page > 0) {
			$('.priorResults').show();
		} else {
			$('.priorResults').hide();
		}
	},
	moreResults: function() {
		$('.moreResults').click(function() {;
			Yummly.displayCounter = 0;
			Yummly.page += Yummly.responseResult;
			console.log('page Number more:', Yummly.page);
			$('.js-recipeResults').empty();
			Yummly.paginationButtonFilter();
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.checkPageNumber, Yummly.page);
			// Scroll to top of next page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
			// if on last page of results, hide more results button
			// if (Yummly.totalResults % Yummly.responseResult !== 0) {
			// 	$('.moreResults').hide();
			// }
		});
	},
	priorResults: function() {
		$('.priorResults').click(function() {
			Yummly.displayCounter = 0;
			Yummly.page -= Yummly.responseResult;
			console.log('page Number prior:', Yummly.page);
			$('.js-recipeResults').empty();
			Yummly.paginationButtonFilter();
			console.log('test test');
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.checkPageNumber, Yummly.page);
			// Scroll to top of next page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
			// if (Yummly.totalResults % Yummly.responseResult === 0) {
			// 	$('.moreResults').show();
			// }
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
