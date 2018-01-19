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
			maxResult: Yummly.responseResult,
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
		// console.groupCollapsed(`processRecipeData: ${data.id}`);
		// console.log('data:', data);
		// loop over data and look at ID of data and match it to an item from the result data array
		let resultDataIndex = Yummly.resultDataIndexById(data.id);
		// console.log('resultDataIndex:', resultDataIndex);
		for (let property in data) {
			if (data.hasOwnProperty(property)) {
				// console.log(`Yummly.resultData.matches[${resultDataIndex}]:`, Yummly.resultData.matches[resultDataIndex]);
				let objectKeys = Object.keys(Yummly.resultData.matches[resultDataIndex]);
				// console.log('objectKeys:', objectKeys);
				// console.log('property:', property);
				// if property is not in existing keys of data, add it
				let includesProperty = (objectKeys).includes(property);
				if (!includesProperty) {
  					Yummly.resultData.matches[resultDataIndex][property] = data[property];
    			}
		    }
		}
		// console.log('all info added to Yummly.resultData:', Yummly.resultData);
		// console.groupEnd();
		Yummly.displayCounter++;
		console.log('Yummly.displayCounter:', Yummly.displayCounter);
		Yummly.displayRecipeData();
		// Scroll to top of next page
		document.body.scrollTop = document.documentElement.scrollTop = 225;
	},
	displayRecipeData: function() {
		console.log('Yummly.resultsLimiter:', Yummly.resultsLimiter);
		console.log('Yummly.displayCounter:', Yummly.displayCounter);
		if (Yummly.displayCounter === Yummly.resultsLimiter) {
			for (let i = 0; i < Yummly.resultData.matches.length; i++) {
				let recipeName = Yummly.resultData.matches[i].name;
				let sourceName = Yummly.resultData.matches[i].sourceDisplayName;
				let sourceRecipeUrl = Yummly.resultData.matches[i].source.sourceRecipeUrl;
				let imageTag = (!Yummly.resultData.matches[i].images[0].imageUrlsBySize[360].includes('null') ? `<a href="${sourceRecipeUrl}" target="_blank"><img src="${Yummly.resultData.matches[i].images[0].imageUrlsBySize[360]}"></a>`: `Sorry, no image available. Here's a <a href=${sourceRecipeUrl}>link</a> to the recipe source.`);
				// TODO: format urls without http:// to have it
				// let sourceSiteUrl = Yummly.resultData.matches[i].source.sourceSiteUrl;
				// console.log('sourceSiteUrl:', sourceSiteUrl);
				// let recipeIngredients = Yummly.resultData.matches[i].ingredients;
				let recipeTime = `${Yummly.resultData.matches[i].totalTimeInSeconds / 60} minutes`;
				let ingredientString = '';
				for (let j = 0; j < Yummly.resultData.matches[i].ingredients.length; j++) {
					ingredientString += Yummly.resultData.matches[i].ingredients[j];
					if (Yummly.resultData.matches[i].ingredients.length - 1 !== j) {
						ingredientString += ', ';
					}
				}	
				$('.js-recipeResults').append(
					`<div class=".col-4"><a href="imageTag"><p class="templateRecipeName"><span>${recipeName}</span></a> from <em>${sourceName}</em></p>
					<p class="templateIngredients"><span>Ingredients:</span> ${ingredientString}</p>
					<p class="templateTime"><span>Total Time:</span> ${recipeTime}</p>
					${imageTag}</div>`
				);
			}
		}	
	},
	collectIngredients: function() {
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();	
			$('.moreResults').hide();
			$('.priorResults').hide(); 
			$('button.js-clearBtn, button.js-findRecipesBtn').prop('disabled', false);
			// find ingredient input
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val().toLowerCase();
			// display ingredient to list in browser and add it to array
			$('.ingredientList div').html('<p>Select the name of added ingredients to remove them. Previously returned recipes will be cleared out if you remove any ingredients.</p>');
			$('.ingredientList ul').append(`<li>${queryValue}</li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans with green%20beans)
			console.log('Yummly.ingredients collect', Yummly.ingredients)
			console.log(encodeURI(Yummly.ingredients));
			queryTarget.val('');
			$('.findRecipes').show();
		});
	},
	removeIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			let index = $(this).index();
			$(this).remove();
			console.log('index:', index);
			$('.js-recipeResults').empty();
			$('.searchResponse').empty();
			$('.moreResults').hide();
			$('.priorResults').hide();
			$('.findRecipes').show();
			let ingredientsLength = Yummly.ingredients.length;
			// console.log('Yummly.ingredients.length before:', Yummly.ingredients.length);
			ingredientsLength--;
			// remove the ingredient selected from the array
			Yummly.ingredients.splice(index, 1);
			// console.log('ingredientsLength after splice:', ingredientsLength);
			if (ingredientsLength === 0) {
				$('button.js-clearBtn, button.js-findRecipesBtn').prop('disabled', true);
				Yummly.ingredients = [];
				// console.log('Yummly.ingredients clear:', Yummly.ingredients);
				$('.ingredientList div').empty();
			}
		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			// clears prior results
			$('.js-recipeResults').empty();
			// resets displayCounter so that new results show
			Yummly.displayCounter = 0;
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
			$('.ingredientList div').empty();
			$('.js-recipeResults').empty();
			$('.searchResponse').empty();
			$('.moreResults').hide();
			$('.priorResults').hide();
			$('button.js-clearBtn, button.js-findRecipesBtn').prop('disabled', true);
			Yummly.ingredients = [];
			Yummly.displayCounter = 0;
			
		});
	},
	ingredientMatchValidation: function(data) {
		if (typeof data.matches !== 'undefined' && data.matches.length === 0) {
			$('.searchResponse').html('Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.');
		} else {
			$('.searchResponse').html(`<em><strong>Success! ${data.attribution.html} </br>
				Select recipe images to go to the source recipe webpage</strong></em>`);
			$('.moreResults').show();
			$('.findRecipes').hide();
			Yummly.resultData = data;
			Yummly.totalResults = data.totalMatchCount;
			Yummly.resultsRemaining = data.totalMatchCount;
			// console.log('totalResults:', Yummly.totalResults);
			// console.log('Yummly.resultData', Yummly.resultData);
			Yummly.getRecipeDataFromApi();
		}
	},
	checkPageNumber: function(data) {
		Yummly.resultData = data;
		Yummly.resultsRemaining = Yummly.totalResults - Yummly.page;
		console.log('Yummly.resultsRemaining:', Yummly.resultsRemaining);
		console.log('Yummly.responseResult:', Yummly.responseResult);
		console.log('Yummly.page:', Yummly.page);
		if (Yummly.resultsRemaining < Yummly.responseResult) {
			Yummly.resultsLimiter = Yummly.resultsRemaining;
			$('.moreResults').hide();		
		}
		document.body.scrollTop = document.documentElement.scrollTop = 225;
		Yummly.getRecipeDataFromApi();
	},
	paginationButtonFilter: function() {
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
		});
	},
	priorResults: function() {
		$('.priorResults').click(function() {
			Yummly.displayCounter = 0;
			Yummly.page -= Yummly.responseResult;
			console.log('page Number prior:', Yummly.page);
			$('.js-recipeResults').empty();
			Yummly.paginationButtonFilter();
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.checkPageNumber, Yummly.page);
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
