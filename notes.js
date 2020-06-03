var change;

function initializeNotesEditor() {
    var Delta = Quill.import('delta');
    var quill = new Quill('#editor', {
        modules: {
            toolbar: true
        },
        theme: 'snow'
    });

    // Store accumulated changes
    change = new Delta();
    quill.on('text-change', function (delta) {
        change = change.compose(delta);
    });

    // Save periodically
    setInterval(function () {
        if (change.length() > 0) {
            var myEditor = document.querySelector('#editor')
            var textAsHTML = myEditor.children[0].innerHTML
            addDataToDom("notesPanelData", textAsHTML);

            change = new Delta();
        }
    }, 5 * 1000);
}

function addDataToDom(dataId, data) {
    var existingDataDiv = document.getElementById(dataId);
    if (existingDataDiv == null) {
        var dataDiv = document.createElement("div");
        dataDiv.id = dataId;
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
        autoHideDelay: 2500
    });
}

// Check for unsaved data
window.onbeforeunload = function () {
    if (change.length() > 0) {
        return 'There are unsaved changes. Are you sure you want to leave?';
    }
}

$(document).bind('keydown', function(e) {
    if(e.ctrlKey && (e.which == 83)) {
      e.preventDefault();
      alert('Ctrl+S');
      return false;
    }
  });