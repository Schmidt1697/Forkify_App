import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";

//child class of previeView

class BookmarksView extends View {
	_parentElement = document.querySelector(".bookmarks__list");
	_errorMessage = `No bookmarks yet. Find a recipe and bookmark it.`;
	_message = "";

	addHandlerRender(handler) {
		window.addEventListener("load", handler);
	}

	_generateMarkup() {
		//loop over the array of recipe results and display them all
		return this._data
			.map((bookmark) => previewView.render(bookmark, false))
			.join("");
	}
}

export default new BookmarksView();
