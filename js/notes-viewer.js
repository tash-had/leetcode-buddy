$(document).foundation();


var p_store = null;

function injectNotesToDom(problemData) {
	console.log("injectin");
	for (problem in problemData) {
		var problemObj = problemData[problem];
		if ("notes" in problemObj) {
			addNoteItemToPage(problem, problemObj);
		}
	}
}

function addNoteItemToPage(noteTitle, problemData) {
	console.log("hey-ya");
	var noteData = problemData["notes"];
	var notesHolder = document.getElementById("allNotesDiv");

	var noteId = noteTitle.replace(/\s/g, '');

	// create full container that will hold note
	var noteContainer = document.createElement("div");
	noteContainer.className = "noteContainer";
	noteContainer.id = noteId;

	// create the note title (problem name) as a link to the problem on leetcode
	var noteHeadLink = document.createElement("a");
	noteHeadLink.href = problemData.link;
	noteHeadLink.target = "_blank";

	var noteHead = document.createElement("h4");
	var noteTimestamp = "<small>" + noteData.lastEdit + "</small>";
	noteHead.innerHTML = noteTitle + " " + noteTimestamp;

	noteHeadLink.appendChild(noteHead);
	noteContainer.appendChild(noteHeadLink);

	// create the note content
	var noteBody = document.createElement("p");
	noteBody.className = "noteContent";
	noteBody.innerHTML = noteData.content;
	noteContainer.appendChild(noteBody);

	// add to page
	notesHolder.appendChild(noteContainer);

	addNoteToNotesMenu(noteTitle, noteId);
}

function addNoteToNotesMenu(noteTitle, noteId) {
	var menuContainer = document.getElementById("menuUnorderedList");
	var listItem = document.createElement("li");

	var listItemLink = document.createElement("a");
	listItemLink.href = "#" + noteId;
	listItemLink.innerHTML = noteTitle;

	listItem.appendChild(listItemLink);

	menuContainer.appendChild(listItem);
}

document.addEventListener('DOMContentLoaded', () => {
	var p_store = {};
	console.log('hi-ya');
	chrome.storage.sync.get('lc_buddy_p_store', (store) => {
		if (store['lc_buddy_p_store'] === undefined) {
			chrome.storage.sync.set({
				lc_buddy_p_store: {}
			});
		} else {
			p_store = store['lc_buddy_p_store'];
		}
		console.log(p_store);
		injectNotesToDom(p_store);
	});
})

$(document).ready(function () {
	$('noteContainer').readmore({
		speed: 75,
		moreLink: '<a href="#">Read More</a><br>',
		lessLink: '<a href="#">Read Less</a>'
	});
});