import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, KEY } from "./config";
import { getJSON, sendJSON } from "./helpers";
import reciepeView from "./views/reciepeView";
import { AJAX } from "./helpers.js";

export const state = {
	recipe: {},
	search: {
		query: "",
		results: [],
		page: 1,
		resultsPerPage: RES_PER_PAGE,
	},
	bookmarks: [],
};

const createRecipeObject = function (data) {
	const { recipe } = data.data;
	return {
		id: recipe.id,
		title: recipe.title,
		publisher: recipe.publisher,
		sourceUrl: recipe.source_url,
		image: recipe.image_url,
		servings: recipe.servings,
		cookingTime: recipe.cooking_time,
		ingredients: recipe.ingredients,
		//conditionally add properties to an object - if there is no recipe.key, then stops and does not return anything - otherwise will spread object if key exists
		...(recipe.key && { key: recipe.key }),
	};
};

export const loadRecipe = async function (id) {
	try {
		const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
		state.recipe = createRecipeObject(data);

		if (state.bookmarks.some((bookmark) => bookmark.id === id)) {
			state.recipe.bookmarked = true;
		} else {
			state.recipe.bookmarked = false;
		}
		console.log(state.recipe);
	} catch (err) {
		throw err;
	}
};

export const loadSearchResults = async function (query) {
	try {
		state.search.query = query;

		const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
		console.log(data);

		//map over array of all the objects to put into state
		state.search.results = data.data.recipes.map((rec) => {
			return {
				id: rec.id,
				title: rec.title,
				publisher: rec.publisher,
				image: rec.image_url,
				...(rec.key && { key: rec.key }),
			};
		});
		state.search.page = 1;
	} catch (err) {
		console.log(`${err} 😡`);
	}
};

//only display 10 results per page
export const getSearchResultsPage = function (page = state.search.page) {
	state.search.page = page;

	const start = (page - 1) * RES_PER_PAGE; //0
	const end = page * RES_PER_PAGE; //9
	return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
	state.recipe.ingredients.forEach((ing) => {
		ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
		//newQt =oldQt * newServings / oldServings
	});

	//need to update the servings in the state
	state.recipe.servings = newServings;
};

//function to  keep the bookmarks in place using local storage - stay in place even w/ page loads
const persistBookmarks = function () {
	localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
	//Add bookmark
	state.bookmarks.push(recipe);

	//Mark current recipe as bookmark
	if (recipe.id === state.recipe.id) {
		state.recipe.bookmarked = true;
	}
	persistBookmarks();
};

export const deleteBookmark = function (id) {
	// Delete bookmark
	const index = state.bookmarks.findIndex((e) => e.id === id);
	state.bookmarks.splice(index, 1);

	//Mark current recipe as NOT bookmarked
	if (id === state.recipe.id) {
		state.recipe.bookmarked = false;
	}
	persistBookmarks();
};

const init = function () {
	const storage = localStorage.getItem("bookmarks");
	if (storage) state.bookmarks = JSON.parse(storage);
};

init();

// function to clear bookmarks for debugging in the future
const clearBookmarks = function () {
	localStorage.clear("bookmarks");
};

// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
	try {
		const ingredients = Object.entries(newRecipe)
			.filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
			.map((ing) => {
				const ingArr = ing[1].replaceAll(" ", "").split(",");
				if (ingArr.length !== 3)
					throw new Error(
						"Wrong ingredient format. Make sure to list the quantity, unit, and description."
					);

				const [quantity, unit, description] = ingArr;
				return { quantity: quantity ? +quantity : null, unit, description };
			});

		//make new object
		const recipe = {
			title: newRecipe.title,
			source_url: newRecipe.sourceUrl,
			image_url: newRecipe.image,
			publisher: newRecipe.publisher,
			cooking_time: +newRecipe.cookingTime,
			servings: +newRecipe.servings,
			ingredients,
		};
		console.log(recipe);
		const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
		state.recipe = createRecipeObject(data);
		addBookmark(state.recipe);
	} catch (err) {
		throw err;
	}
};
