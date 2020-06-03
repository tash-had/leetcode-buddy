
var Delta = Quill.import('delta');
var quill = new Quill('#editor', {
    modules: {
        toolbar: true
    },
    theme: 'snow'
});

// Store accumulated changes
var change = new Delta();
quill.on('text-change', function (delta) {
    change = change.compose(delta);
});

// Save periodically
setInterval(function () {
    if (change.length() > 0) {
        addDataToDom("notesPanelData", JSON.stringify(quill.getContents()));
        change = new Delta();
    }
}, 5 * 1000);

function addDataToDom(dataId, data) {
    var existingDataDiv = document.getElementById(dataId);
    if (existingDataDiv == null) {
        var dataDiv = document.createElement("div");
        dataDiv.setAttribute("id", dataId);
        dataDiv.innerHTML = data;
        dataDiv.style = 'display:none;';
        var appElement = document.getElementById("app");
        appElement.appendChild(dataDiv);
    } else {
        existingDataDiv.innerHTML = data;
    }
    $.notify("Autosaved.", {
        position: "right bottom",
        className: "success",
        arrowShow: false,
        autoHideDelay: 3000
    });
}

// Check for unsaved data
window.onbeforeunload = function () {
    if (change.length() > 0) {
        return 'There are unsaved changes. Are you sure you want to leave?';
    }
}