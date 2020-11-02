var change;

function initializeNotesEditor() {
    var Delta = Quill.import('delta');
    
    var toolbarOptions = [
        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        ['bold', 'italic', 'underline'],        // toggled buttons
        ['code-block'],
        [{ 'list': 'bullet' }],
        [{ 'color': [] }],          // dropdown with defaults from theme
      ];

    var quill = new Quill('#editor', {
        modules: {
            toolbar: toolbarOptions
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
        if(e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
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

    $.notify("Note Saved.", {
        position: "right top",
        className: "success",
        autoHideDelay: 2500
    });
}


window.onbeforeunload = function () {
    saveNotes();
}

window.onload = function () {
    var notesArea = document.getElementById("lcb_notesPanelId");
    var initScript = document.getElementById("notesPanelInitScriptId");

    // if the notesPanel has been created and the init script hasn't been injected
    // from leetcode.js, then initialize the notes editor
    if (notesArea && !initScript) {
        initializeNotesEditor();
    }
}
