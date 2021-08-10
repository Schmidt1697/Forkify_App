import * as model from "./model.js";
import recipeView from "./views/reciepeView.js";

//make sure stable for older browsers
import "core-js/stable";
import "regenerator-runtime/runtime";

const timeout = function (s) {
	return new Promise(function (_, reject) {
		setTimeout(function () {
			reject(new Error(`Request took too long! Timeout after ${s} second`));
		}, s * 1000);
	});
};

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
	try {
		const id = window.location.hash.slice(1);
		console.log(id);

		if (!id) return;

		recipeView.renderSpinner();

		//Load recipe - caling the async function from model.js - will get access to state.recipe form model.js
		await model.loadRecipe(id);

		//Render Recipe
		recipeView.render(model.state.recipe);
	} catch (err) {
		alert(err);
	}
};
controlRecipes();

//loop over multiple events where only one handler is needed
["hashchange", "load"].forEach((ev) =>
	window.addEventListener(ev, controlRecipes)
);
