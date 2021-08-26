import * as model from "./model.js";
import recipeView from "./views/reciepeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";

//make sure stable for older browsers
import "core-js/stable";
import "regenerator-runtime/runtime";

//this is coming from parcel, not true javascipt
// if (module.hot) {
// 	module.hot.accept();
// }

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
	try {
		const id = window.location.hash.slice(1);

		if (!id) return;

		recipeView.renderSpinner();

		// update results view to mark selected search result (in both sidebar of results and bookmarks list if bookmarked)
		resultsView.update(model.getSearchResultsPage());
		bookmarksView.update(model.state.bookmarks);

		//Load recipe - caling the async function from model.js - will get access to state.recipe form model.js
		await model.loadRecipe(id);

		//Render Recipe
		recipeView.render(model.state.recipe);
	} catch (err) {
		recipeView.renderError();
	}
};

const controlSearchResults = async function () {
	try {
		resultsView.renderSpinner();
		//get search query
		const query = searchView.getQuery();
		if (!query) return;

		//load search
		await model.loadSearchResults(query);

		//render results
		resultsView.render(model.getSearchResultsPage());

		// render pagination puttons
		paginationView.render(model.state.search);
	} catch (err) {
		console.log(err);
	}
};

const controlPagination = function (goToPage) {
	//render New results
	resultsView.render(model.getSearchResultsPage(goToPage));

	// render new pagination buttons
	paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
	//update the recipe servings(in the state)
	model.updateServings(newServings);

	//update the view
	// recipeView.render(model.state.recipe); -following line is to update view w/out re-rendering the photo
	recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
	// Add/remove bookmark
	if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
	else model.deleteBookmark(model.state.recipe.id);

	// Update recipe view
	recipeView.update(model.state.recipe);

	// Render bookmarks
	bookmarksView.render(model.state.bookmarks);
};

const init = function () {
	recipeView.addHandlerRender(controlRecipes);
	recipeView.addHandlerUpdateServings(controlServings);
	recipeView.addHandlerAddBookmark(controlAddBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
};

init();
