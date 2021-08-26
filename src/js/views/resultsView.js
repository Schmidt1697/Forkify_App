import View from "./View.js";
import previewView from "./previewView.js";
import icons from "url:../../img/icons.svg";

//child class of previeView

class ResultsView extends View {
	_parentElement = document.querySelector(".results");
	_errorMessage = `No recipes found. Please try again.`;
	_message;

	_generateMarkup() {
		console.log(this._data);
		//loop over the array of recipe results and display them all
		return this._data
			.map((result) => previewView.render(result, false))
			.join("");
	}
}

export default new ResultsView();
