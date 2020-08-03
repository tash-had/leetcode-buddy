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
    setInterval(function(){
        saveNotes();
        change = new Delta();
    }, 5 * 1000);

    // set ctrl + s save shortcut within editor
    $(document.getElementById("editor")).bind('keydown', function(e) {
        if(e.ctrlKey && (e.which == 83)) {
          e.preventDefault();
          saveNotes(true);
          change = new Delta();
          return false;
        }
      });
}

function saveNotes(force) {
    if (change.length() > 0 || force === true) {
        var myEditor = document.querySelector('#editor')
        var textAsHTML = myEditor.children[0].innerHTML
        triggerDataTransfer("notesPanelData", textAsHTML);
    }
}

function triggerDataTransfer(dataId, data) {
    // a hack to send data back to extension script using leetcode DOM
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

    $.notify("Saved.", {
        position: "right bottom",
        className: "success",
        autoHideDelay: 2500
    });
}


window.onbeforeunload = function () {
    saveNotes();
}
