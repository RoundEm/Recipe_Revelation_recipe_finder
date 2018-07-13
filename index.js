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
			start: start
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
		// loop over data and look at ID of data and match it to an item from the result data array
		let resultDataIndex = Yummly.resultDataIndexById(data.id);
		for (let property in data) {
			if (data.hasOwnProperty(property)) {
				let objectKeys = Object.keys(Yummly.resultData.matches[resultDataIndex]);
				// if property is not in existing keys of data, add it
				let includesProperty = (objectKeys).includes(property);
				if (!includesProperty) {
  					Yummly.resultData.matches[resultDataIndex][property] = data[property];
    			}
		    }
		}
		Yummly.displayCounter++;	
		Yummly.displayRecipeData();
		// Scroll to top of next page
		document.body.scrollTop = document.documentElement.scrollTop = 225;
	},
	displayRecipeData: function() {
		console.log('resultsRemaining:', Yummly.resultsRemaining);
		// console.log('Yummly.resultsLimiter:', Yummly.resultsLimiter);
		// console.log('Yummly.displayCounter:', Yummly.displayCounter);
		if (Yummly.displayCounter === Yummly.resultData.matches.length) {
			for (let i = 0; i < Yummly.resultData.matches.length; i++) {
				let recipeName = Yummly.resultData.matches[i].name;
				let sourceName = Yummly.resultData.matches[i].sourceDisplayName;
				let sourceRecipeUrl = Yummly.resultData.matches[i].source.sourceRecipeUrl;
				let servings = Yummly.resultData.matches[i].numberOfServings;
				let imageTag = (!Yummly.resultData.matches[i].images[0].imageUrlsBySize[360].includes('null') ? `<a href="${sourceRecipeUrl}" target="_blank"><img src="${Yummly.resultData.matches[i].images[0].imageUrlsBySize[360]}" tabindex="0"  alt="Image of recipe"></a>`: `<p class="templateNoImg" tabindex="0">Sorry, no image available. Here's a <a href=${sourceRecipeUrl} target="_blank">link to the recipe source.</a></p>`);
				let recipeTime = '';	
				if (Yummly.resultData.matches[i].totalTimeInSeconds === null) {
					recipeTime = `Sorry, the recipe time is not available. <a href="${sourceRecipeUrl}" target="_blank">See recipe source for more information</a>`;
				} else {
					recipeTime = `${Math.round(Yummly.resultData.matches[i].totalTimeInSeconds / 60)} minutes`;
				}
				// formats a comma between ingredients
				let ingredientString = '';
				for (let j = 0; j < Yummly.resultData.matches[i].ingredients.length; j++) {
					ingredientString += Yummly.resultData.matches[i].ingredients[j];
					if (Yummly.resultData.matches[i].ingredients.length - 1 !== j) {
						ingredientString += ', ';
					}
				}
				$('.js-recipeResults').append(
					`<div class="col-4"><a href="${sourceRecipeUrl}"><p class="templateRecipeName"><span>${recipeName}</span> from <em>${sourceName}</em></a></p>
					<p class="templateIngredients" tabindex="0"><span>Ingredients:</span> ${ingredientString}</p>
					<p class="templateTime" tabindex="0"><span>Total Time:</span> ${recipeTime}</p>
					<p class="templateServings" tabindex="0"><span>Number of Servings:</span> ${servings}</p>
					${imageTag}</div>`
				);
			}
		}
	},
	collectIngredients: function() {
		$('.js-ingredients-form').submit(function(event) {
			event.preventDefault();
			$('.moreResults').hide();
			$('.priorResults').hide();
			$('button.js-clearBtn, button.js-findRecipesBtn').prop('disabled', false);
			$('.ingredientList').prop('hidden', false);
			// find ingredient input by user
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val().toLowerCase();
			// display ingredient to list in browser and add it to array for tracking
			$('.ingredientList div').html('<p>Previously returned recipes will be cleared out if you remove any ingredients.</p>');
			$('.ingredientList ul').append(`<li class="unhighlighted" tabindex="0" aria-label="remove ingredient">${queryValue}<a href="#" class="close" tabindex="-1"></a></li>`);
			Yummly.ingredients.push(queryValue);
			// encodeURI replaces spaces in ingredients (e.g. green beans with green%20beans)
			encodeURI(Yummly.ingredients);
			queryTarget.val('');
			$('.findRecipes').show();
		});
	},
	highlightIngredient: function() {
		$('.ingredientList ul').on('focusin', 'li', function() {
			$(this).removeClass('unhighlighted');
			$(this).addClass('highlight');	
		});
		$('.ingredientList ul').on('focusout', 'li', function() {
			$(this).removeClass('highlight');
			$(this).addClass('unhighlighted');	
		});
	},
	bindRemoveIngredient: function() {
		$('.ingredientList').on('click', 'li', function() {
			$this = $(this);
			Yummly.removeIngredient($this);
		});
		$('.ingredientList').on('keypress', 'li', function(e) {
			$this = $(this);
			 var key = e.which;
			 if(key == 13) {
				// 13 is the enter key code
			    Yummly.removeIngredient($this);
		 	}
		});
	},
	removeIngredient: function($this) {
		let index = $this.index();
		$this.remove();
		$('.js-recipeResults').empty();
		$('.searchResponse').empty();
		$('.moreResults').hide();
		$('.priorResults').hide();
		$('.findRecipes').show();
		let ingredientsLength = Yummly.ingredients.length;
		ingredientsLength--;
		// remove the ingredient selected from the array
		Yummly.ingredients.splice(index, 1);
		// if there are no ingredients left in array, reset items shown
		if (ingredientsLength === 0) {
			$('button.js-clearBtn, button.js-findRecipesBtn').prop('disabled', true);
			Yummly.ingredients = [];
			$('.ingredientList div').empty();
			$('.results').prop('hidden', true);
			$('.ingredientList').prop('hidden', true);
		}
	},
	bindSearchTips: function() {
		$('.accordion').click(function() {
			// determines whether search tips should be displayed or hidden
			$('.searchContainer > div:first-of-type').toggleClass('panel');
			if ($('.searchContainer > div:first-of-type').hasClass('panel') === false) {
				$('.accordion').html('Select to hide tips');
				$('.searchContainer > div:first-of-type').prop('hidden', false);
			} 
			else {
				$('.accordion').html('Select to see tips for best search results');
				$('.searchContainer > div:first-of-type').prop('hidden', true);
			}

		});
	},
	findRecipes: function() {
		$('.js-findRecipesBtn').click(function() {
			$('.results').prop('hidden', false);
			// clears prior results
			$('.js-recipeResults').empty();
			// resets displayCounter so that new results show
			Yummly.displayCounter = 0;
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.ingredientMatchValidation);
			// reset page number when searching for new recipes
			if (Yummly.page > 0) {
				Yummly.page = 0;
			}
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
			$('.results').prop('hidden', true);
			$('.ingredientList').prop('hidden', true);
			Yummly.ingredients = [];
			Yummly.displayCounter = 0;
		});
	},
	ingredientMatchValidation: function(data) {
		if (typeof data.matches !== 'undefined' && data.matches.length === 0) {
			$('.searchResponse').html('Sorry, the ingredients entered returned 0 hits. Please select clear and try a different search.');
		} else {
			$('.searchResponse').html(`<strong>Success! ${data.attribution.html} </br>
				Select recipe name or image to go to the source recipe webpage</strong>`);
			$('.moreResults').show();
			// I may want to hide this later
			// $('.findRecipes').hide();
			Yummly.resultData = data;
			Yummly.totalResults = data.totalMatchCount;
			Yummly.resultsRemaining = data.totalMatchCount;
			Yummly.getRecipeDataFromApi();
		}
	},
	checkPageNumber: function(data) {
		Yummly.resultData = data;
		Yummly.resultsRemaining = Yummly.totalResults - Yummly.page;
		// console.log('totalResults:', Yummly.totalResults);
		// console.log('Yummly.resultsRemaining:', Yummly.resultsRemaining);
		// console.log('Yummly.responseResult:', Yummly.responseResult);
		// console.log('Yummly.page:', Yummly.page);
		if (Yummly.resultsRemaining < Yummly.responseResult) {
			Yummly.resultsLimiter = Yummly.resultsRemaining;
			$('.moreResults').hide();
		}
		document.body.scrollTop = document.documentElement.scrollTop = 215;
		Yummly.getRecipeDataFromApi();
	},
	priorResultsBtnFilter: function() {
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
			$('.js-recipeResults').empty();
			Yummly.priorResultsBtnFilter();
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.checkPageNumber, Yummly.page);
		});
	},
	priorResults: function() {
		$('.priorResults').click(function() {
			Yummly.displayCounter = 0;
			if (Yummly.resultsLimiter < Yummly.responseResult) {
				Yummly.resultsLimiter = Yummly.responseResult;
				$('.moreResults').show();
			} 
			Yummly.page -= Yummly.responseResult;	
			$('.js-recipeResults').empty();
			Yummly.priorResultsBtnFilter();
			Yummly.getDataFromApi(Yummly.ingredients, Yummly.checkPageNumber, Yummly.page);
		});
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearIngredientList();
		Yummly.bindRemoveIngredient();
		Yummly.highlightIngredient();
		Yummly.bindSearchTips();
		Yummly.moreResults();
		Yummly.priorResults();
	},
}
$(Yummly.setup);