import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/reciepeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

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

		//Load recipe - caling the async function from model.js - will get access to state.recipe form model.js
		await model.loadRecipe(id);

		//Render Recipe
		recipeView.render(model.state.recipe);

		//update bookmarks view
		bookmarksView.update(model.state.bookmarks);
	} catch (err) {
		recipeView.renderError();
		console.error(err);
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

const controlBookmarks = function () {
	bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
	try {
		// show loading spinner
		addRecipeView.renderSpinner();

		//upload new recipe
		await model.uploadRecipe(newRecipe);

		// Render added recipe
		recipeView.render(model.state.recipe);

		// Success message
		addRecipeView.renderMessage();

		//render bookmark view
		bookmarksView.render(model.state.bookmarks);

		// Change ID in ULR pushState takes in 3 arguments(state, title, url)
		window.history.pushState(null, "", `#${model.state.recipe.id}`);

		// Close form window
		setTimeout(() => {
			addRecipeView.toggleWindow;
		}, MODAL_CLOSE_SEC * 1000);
	} catch (err) {
		console.error(`666 ${err}`);
		addRecipeView.renderError(err.message);
	}
};
const init = function () {
	bookmarksView.addHandlerRender(controlBookmarks);
	recipeView.addHandlerRender(controlRecipes);
	recipeView.addHandlerUpdateServings(controlServings);
	recipeView.addHandlerAddBookmark(controlAddBookmark);
	searchView.addHandlerSearch(controlSearchResults);
	paginationView.addHandlerClick(controlPagination);
	addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
