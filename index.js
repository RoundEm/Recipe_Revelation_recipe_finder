const Yummly = {
	INGREDIENT_URL: 'https://api.yummly.com/v1/api/recipes',
	RECIPE_URL: 'https://api.yummly.com/v1/api/recipe/',
	resultData: [],
	ingredients: [],
	page: 0,
	displayCounter: 0,
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
			// console.log('Yummly.resultData.matches[0].id:', Yummly.resultData.matches[i].id);
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
		// loop over data
		// look at ID of data
		// match it to an item from the result data array
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
				let propertyNull = Yummly.resultData.matches[resultDataIndex][property] === null || Yummly.resultData.matches[resultDataIndex][property] === undefined;
				console.log('includesProperty:', includesProperty);
				console.log('propertyNull:', propertyNull);
				if (!includesProperty) {
					console.log(`Yummly.resultData.matches[${resultDataIndex}] before:`, Yummly.resultData.matches[resultDataIndex]);
  				console.log(`Yummly.resultData.matches[${resultDataIndex}][${property}] before:`, Yummly.resultData.matches[resultDataIndex][property]);
					console.log('data:', data);
					console.log(`data[${property}]:`, data[property]);
  				Yummly.resultData.matches[resultDataIndex][property] = data[property];
					console.log(`Yummly.resultData.matches[${resultDataIndex}][${property}] after:`, Yummly.resultData.matches[resultDataIndex][property]);
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
		if (Yummly.displayCounter === 9) {
			for (let i = 0; i < Yummly.resultData.matches.length; i++) {
				let recipeName = Yummly.resultData.matches[i].name;
				let sourceName = Yummly.resultData.matches[i].sourceDisplayName;
				let recipeIngredients = Yummly.resultData.matches[i].ingredients;
				let recipeTime = `${Yummly.resultData.matches[i].totalTimeInSeconds / 60} minutes`;
				$('.js-recipeResults').append(
					`<li>${recipeName} by ${sourceName}</li>
					<p>Ingredients: ${recipeIngredients}</p>
					<p>Total Time: ${recipeTime}</p>
					<img src="${Yummly.resultData.matches[i].images[0].imageUrlsBySize[360]}">`
				)
			}
		}	
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
			queryTarget.val('');
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
		// check if matches are found
		if (data.matches.length === 0) {
			$('.resultResponse').html('Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.');
		} else {
			$('.resultResponse').html(`Success! ${data.attribution.html}`);
			$('.moreResults').show();
			$('.searchSection').hide();
			Yummly.resultData = data;
			console.log('Yummly.resultData', Yummly.resultData);
			Yummly.handleIngredientData(data);
		}
	},
	// formatIngredients: function() {
	// 	// format ingredient list to have proper space after each comma between ingredients
	// 	let ingredientString = '';
	// 		for (let i = 0; j < data.matches[i].ingredients.length; j++) {
	// 			ingredientString += data.matches[i].ingredients[j];
	// 			if (data.matches[i].ingredients.length - 1 !== j) {
	// 				ingredientString += ', ';
	// 			}
	// 		}
	// 	return 
	// },
	handleIngredientData: function(data) {
		Yummly.resultData = data;
		Yummly.getRecipeDataFromApi();
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
			Yummly.page += 9;
			console.log('page Number more:', Yummly.page);
			$('.js-recipeResults').empty();
			Yummly.paginationButtonFilter();
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.handleIngredientData, Yummly.page);
			// Scroll to top of next page
			document.body.scrollTop = document.documentElement.scrollTop = 225;
		});
	},
	priorResults: function() {
		$('.priorResults').click(function() {
			Yummly.displayCounter = 0;
			Yummly.page -= 9;
			console.log('page Number prior:', Yummly.page);
			$('.js-recipeResults').empty();
			Yummly.paginationButtonFilter();
			console.log('test test');
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.handleIngredientData, Yummly.page);
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
