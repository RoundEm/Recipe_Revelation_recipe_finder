// http://api.yummly.com/v1/api/recipes?_app_id=aa298305&_app_key=f1568a729fd303537771dd46dbc3f91b&allowedIngredient[]=chicken

const Yummly = {
	YUMMLY_URL: 'https://api.yummly.com/v1/api/recipes',
	ingredients: [],
	getDataFromApi: function(allowedIngredient, callback) {	
		const query = {
			_app_id: 'aa298305',
			_app_key: 'f1568a729fd303537771dd46dbc3f91b',
			allowedIngredient: `${allowedIngredient}`,
			// maxresults: 15,
			start: 0
		}
		$.getJSON(Yummly.YUMMLY_URL, query, callback);
	},
	collectIngredients: function() {	
		$('.js-ingredients-form').submit(function() {
			event.preventDefault();
			const queryTarget = $(this).find('.js-ingredient-query');
			const queryValue = queryTarget.val();
			// display ingredient in list
			$('.js-ingredientList').append(`<li>${queryValue}</li>`);
			queryTarget.val('');
			Yummly.ingredients.push(queryValue);
			console.log(Yummly.ingredients);
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
			$('.js-recipeResults').empty();	
			Yummly.ingredients = [];
		});
	},
	displayApiData: function(data) {
		console.log('dataLength:', data.matches.length);
		for (let i = 0; i < data.matches.length; i++) {
			$('.js-recipeResults').append(`<p>${data.matches[i].recipeName} from ${data.matches[i].sourceDisplayName}</p>`);
			$('.js-recipeResults').append(`<p>Ingredients: ${data.matches[i].ingredients}</p>`);
			$('.js-recipeResults').append(`<img src="${data.matches[i].imageUrlsBySize[90]}" alt=picture of ${data.matches[i].receipeName}">`);
		}
		console.log('data Object2:', data);
	},
	setup: function() {
		Yummly.findRecipes();
		Yummly.collectIngredients();
		Yummly.clearSearch();
	}
}	
$(Yummly.setup);
