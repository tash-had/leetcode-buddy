var options = {
    serverCompletionStatus: false,
    notesPanel: true,
    notesPanelWidth: 30,
    announcement: false,
    acceptanceRate: false,
    difficulty: false,
    lockedQuestions: false,
    resultCountNode: true,
    resultCount: 0,
    solvedDifficultyCounts: false
};

var p_store = {};
var mo = null;

function updateOptions(newOptions) {
    if (options.serverCompletionStatus !== newOptions.serverCompletionStatus) {
        toggleServerCompletionStatus(newOptions.serverCompletionStatus);
        options.serverCompletionStatus = newOptions.serverCompletionStatus;
    }

    if (options.notesPanel !== newOptions.notesPanel) {
        console.log("NOTES PANEL?", newOptions.notesPanel);
        toggleNotesPanel(newOptions.notesPanel);
        options.notesPanel = newOptions.notesPanel;
    }

    if (options.notesPanelWidth !== newOptions.notesPanelWidth) {
        toggleNotesPanelWidth(newOptions.notesPanelWidth);
        options.notesPanelWidth = newOptions.notesPanelWidth;
    }
    
    if (options.announcement !== newOptions.announcement) {
        toggleAnnouncement(newOptions.announcement);
        options.announcement = newOptions.announcement;
    }

    if (options.acceptanceRate !== newOptions.acceptanceRate) {
        toggleAcceptanceRate(newOptions.acceptanceRate);
        options.acceptanceRate = newOptions.acceptanceRate;
    }

    if (options.difficulty !== newOptions.difficulty) {
        toggleDifficulty(newOptions.difficulty);
        options.difficulty = newOptions.difficulty;
    }

    if (options.lockedQuestions !== newOptions.lockedQuestions) {
        toggleLockedQuestions(newOptions.lockedQuestions);
        options.lockedQuestions = newOptions.lockedQuestions;
    }

    if (options.resultCountNode !== newOptions.resultCountNode) {
        toggleResultCountNode(newOptions.resultCountNode);
        options.resultCountNode = newOptions.resultCountNode;
    }

    if (options.solvedDifficultyCounts !== newOptions.solvedDifficultyCounts) {
        toggleSolvedDifficultyCounts(newOptions.solvedDifficultyCounts);
        options.solvedDifficultyCounts = newOptions.solvedDifficultyCounts;
    }
};

function toggleServerCompletionStatus(show) {
    var problemNamesList = null;
    var completionChecks = null;

    if (isAppScreen()) {
        return;
    } else if (isQuestionAppScreen()) {
        // 'problems' view 
        completionChecks = document.querySelectorAll('.reactable-data > tr > td:nth-child(1)');
        problemNamesList = document.querySelectorAll('.reactable-data > tr > td:nth-child(3)');
    } else if (isFavoriteAppScreen()) {
        // 'my lists' view
        completionChecks = document.getElementsByClassName('css-alevek');
        problemNamesList = document.getElementsByClassName("question-title");
    } else if (isExploreAppScreen()) {
        completionChecks = document.getElementsByClassName("check-mark");
        problemNamesList = [];
        for (var i = 0; i < completionChecks.length; i++) {
            var titleElement = completionChecks[i].nextElementSibling;
            if (titleElement == null) {
                titleElement = completionChecks[i].parentElement.nextElementSibling;
            }
            problemNamesList.push(titleElement);
        }
    } else {
        return;
    }

    if (show) {
        if (completionChecks !== null && completionChecks.length > 0) {
            for (var i = 0; i < completionChecks.length; i++) {
                completionChecks[i].style = '';
            }
        }
    } else {
        if (completionChecks !== null && completionChecks.length > 0) {
            for (var i = 0; i < completionChecks.length; i++) {
                var problemNameParts = problemNamesList[i].textContent.split(".");
                var bareProblemName = problemNameParts[problemNameParts.length - 1].trim();
                if (!(bareProblemName in p_store) || !(p_store[bareProblemName]["correctSubmission"])) {
                    completionChecks[i].style = 'opacity: 0;';
                } else {
                    completionChecks[i].style = '';
                }
            }
        }
    }
};


function checkForSubmission() {
    var currentUrl = location.href;
    if (!isAppScreen() || (currentUrl.indexOf("/submissions/")) < 0) {
        return;
    } else {
        var resultContainerMatches = getElementsByClassNamePrefix(document, "div", "result-container");
        if (resultContainerMatches != null && resultContainerMatches.length > 0) {
            var resultContainer = resultContainerMatches[0];
            var resultArr = getElementsByClassNamePrefix(resultContainer, "div", "result");
            if (resultArr != null && resultArr.length > 0) {
                var result = resultArr[0];
                var successElementArr = getElementsByClassNamePrefix(result, "div", "success");
                var failureElementArr = getElementsByClassNamePrefix(result, "div", "error");
                var correctSubmission = null;
                if (successElementArr !== null && successElementArr.length > 0) {
                    // correct submission
                    correctSubmission = true;
                } else if (failureElementArr != null && failureElementArr.length > 0) {
                    // incorrect submission
                    correctSubmission = false;
                }
                saveProblemData("correctSubmission", correctSubmission);
            }
        }
    }
};

function toggleAnnouncement(show) {
    var announcement = document.getElementById('announcement');

    if (announcement !== null) {
        if (show) {
            announcement.style = '';
        } else {
            announcement.style = 'display: none;';
        }
    }
};

function toggleAcceptanceRate(show) {
    var acceptanceRates = document.querySelectorAll('.reactable-data > tr > td:nth-child(5)'),
        rates = document.getElementsByClassName('css-jkjiwi');

    if (show) {
        for (var i = 0; i < acceptanceRates.length; ++i) {
            acceptanceRates[i].style = '';
        }

        if (rates !== null) {
            for (let i = 0; i < rates.length; i++) {
                rates[i].style = 'opacity: 100;';
            }
        }
    } else {
        for (var i = 0; i < acceptanceRates.length; ++i) {
            acceptanceRates[i].style = 'opacity: 0;';
        }

        if (rates !== null) {
            for (let i = 0; i < rates.length; i++) {
                rates[i].style = 'opacity: 0;';
            }
        }
    }
};

function toggleDifficulty(show) {
    if ((!isQuestionAppScreen() && !isAppScreen())) {
        return;
    }
    var difficulties = document.querySelectorAll('.reactable-data > tr > td:nth-child(6)'),
        difficulty = document.querySelector('[diff]');

    if (show) {
        for (var i = 0; i < difficulties.length; ++i) {
            difficulties[i].style = '';
        }

        if (difficulty !== null) {
            difficulty.style = 'display: block;';
        }
    } else {
        for (var i = 0; i < difficulties.length; ++i) {
            difficulties[i].style = 'opacity: 0;';
        }

        if (difficulty !== null) {
            difficulty.style = 'display: none;';
        }
    }
};

function toggleLockedQuestions(show) {
    var qlt = document.querySelector('.question-list-table');

    if (qlt) {
        var tbody = qlt.children[0].children[1],
            rows = tbody.children;

        options.resultCount = rows.length;

        for (var i = 0, j = 1; i < rows.length; ++i) {
            var col = rows[i].children[2].children[0].children[1];

            if (show) {
                rows[i].style = '';
            } else {
                rows[i].style = j & 1 ? 'background-color: #f5f5f5;' : 'background-color: transparent;';

                if (col !== undefined && col.children[0] !== undefined) {
                    rows[i].style = 'display: none;'; // removing elements breaks LCs JS...
                    --options.resultCount;
                } else {
                    ++j;
                }
            }
        }
        toggleResultCountNode(options.resultCountNode);
    }
};

function toggleResultCountNode(show) {
    var resultCountNode = document.getElementById('resultCountNode');

    if (resultCountNode) {
        if (show) {
            resultCountNode.style = '';
            resultCountNode.innerHTML = options.resultCount;
        } else {
            resultCountNode.style = 'display: none;';
        }
    }
};

function toggleSolvedDifficultyCounts(show) {
    var welcome = document.querySelector('#welcome > span');

    if (welcome) {
        if (show) {
            for (var i = 1; i < welcome.children.length; ++i) {
                welcome.children[i].style = '';
            }
            welcome.style = '';
        } else {
            for (var i = 1; i < welcome.children.length; ++i) {
                welcome.children[i].style = 'display: none;';
            }
            welcome.style = 'color: #fff;';
        }
    }
};

function removeNotesPanel() {
    console.log("Removing");
    var notesPanelElm = document.getElementById("lcb_notesPanelId");
    if (notesPanelElm != null) {
        console.log("rrr")
        notesPanelElm.parentNode.removeChild(notesPanelElm);
    }
    var notesPanelScript = document.getElementById("notesPanelScriptId");
    if (notesPanelScript != null) {
        notesPanelScript.parentNode.removeChild(notesPanelScript);
    }
}

function toggleNotesPanel(show) {
    if (show) {
        console.log("Recieved SHOW notes");
        var editorAreaArr = document.getElementsByClassName("react-codemirror2");
        var notesEditor = document.getElementById("lcb_notesPanelId");
        if (notesEditor != null) {
            // deal with a glitch where javascript puts two headers for the notes editor
            if (notesEditor.children.length > 2) {
                notesEditor.removeChild(notesEditor.firstChild);
            }
        }
        if (editorAreaArr != undefined && editorAreaArr.length == 1 && notesEditor == null && p_store != null) {
            var probName = getProblemTitle().problemName;
            if (probName != null) {
                var editorAreaParent = editorAreaArr[0].parentElement;
                if (editorAreaParent) {
                    mo.disconnect();
                    removeNotesPanel();

                    var probEntry = p_store[probName];
                    var oldNotes = "";
                    if (probEntry && "notes" in probEntry) {
                        oldNotes = probEntry["notes"];
                    }

                    var notesArea = document.createElement("div");
                    notesArea.innerHTML = "<div id='editor'>" + oldNotes + "</div>";
                    notesArea.style = "width:30%;text-align:center;";
                    notesArea.id = "lcb_notesPanelId";
                    editorAreaParent.appendChild(notesArea);
                    
                    var initNotesScript = document.createElement("script");
                    initNotesScript.innerHTML = "initializeNotesEditor();";
                    initNotesScript.id = "notesPanelScriptId";
                    document.body.appendChild(initNotesScript);
                    
                    var noteBtn = getElementsByClassNamePrefix(document, "div", "note-btn")[0];
                    noteBtn.style = 'display:none;';
                    setObservers();
                }
            }
        }
    } else {
        removeNotesPanel();
        // show leetcode built in notes btn
        var noteBtn = getElementsByClassNamePrefix(document, "div", "note-btn");
        if (noteBtn && noteBtn.length > 0) {
            noteBtn[0].style = '';
        }
    }
};

function toggleNotesPanelWidth(newWidth) {
    var notesPanelDiv = document.getElementById("lcb_notesPanelId");
    if (notesPanelDiv != null) {
        var newWidthStr = newWidth.toString() + "%;text-align:center;";
        notesPanelDiv.style = "width:" + newWidthStr;
    }
}

function saveProblemData(dataKey, dataVal) {
    var problemTitle = getProblemTitle();
    var problemNumber = problemTitle["problemNumber"];
    var problemName = problemTitle["problemName"];

    if ((problemName in p_store) && (p_store[problemName][dataKey] == dataVal)) {
        // given data already exists in store and value hasn't changed. 
        return;
    }

    chrome.storage.sync.get('lc_buddy_p_store', (store) => {
        var cur_p_store = store['lc_buddy_p_store'];

        if (cur_p_store === undefined) {
            cur_p_store = {};
        }
        if (!(problemName in cur_p_store)) {
            // question has never been submitted before
            cur_p_store[problemName] = {};
            cur_p_store[problemName][dataKey] = dataVal;
            cur_p_store[problemName]["problemNumber"] = problemNumber;
        } else {
            // question has been submitted before
            cur_p_store[problemName][dataKey] = dataVal;
        }
        p_store = cur_p_store;
        chrome.storage.sync.set({
            lc_buddy_p_store: cur_p_store
        });
    });
}

function injectNotesPanelLibs() {
    if (isAppScreen()) {
        var jquery = document.createElement("script");
        jquery.src = "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.2/jquery.min.js";
        document.body.appendChild(jquery);
    
        var quillJs = document.createElement("script");
        quillJs.src = "https://cdn.quilljs.com/1.3.6/quill.js";
        document.body.appendChild(quillJs);
    
        var quillCss = document.createElement("link");
        quillCss.rel = "stylesheet";
        quillCss.href = "https://cdn.quilljs.com/1.3.6/quill.snow.css";
        document.head.appendChild(quillCss);    
        
        var notifyJs = document.createElement("script");
        notifyJs.id = "notifyJsScriptId";
        notifyJs.src = chrome.runtime.getURL('js/notify.min.js');
        document.body.appendChild(notifyJs);

        var quilScript = document.createElement("script");
        quilScript.src = chrome.runtime.getURL('js/notes.js');
        document.body.appendChild(quilScript);
    }
}

function onPageMutated() {
    // check if this change was caused by an update by a DOM update in the notespanel.
    var notesPanelData = document.getElementById("notesPanelData");
    if (notesPanelData == null) {
        toggleServerCompletionStatus(options.serverCompletionStatus);
        console.log("NOTES PANEL FAM?", options.notesPanel);
        toggleNotesPanel(options.notesPanel);
        toggleNotesPanelWidth(options.notesPanelWidth);
        toggleAnnouncement(options.announcement);
        toggleAcceptanceRate(options.acceptanceRate);
        toggleLockedQuestions(options.lockedQuestions);
        toggleResultCountNode(options.resultCountNode);
        toggleSolvedDifficultyCounts(options.solvedDifficultyCounts);
        checkForSubmission();
    } else {
        var notesData = notesPanelData.innerHTML;
        notesPanelData.parentNode.removeChild(notesPanelData);
        saveProblemData("notes", notesData);
    }
}

function setObservers() {
    if (mo == null) {
        mo = new MutationObserver(onPageMutated);
    }
    var qa = document.getElementById('question-app'),
        app = document.getElementById('app'),
        fa = document.getElementById('favorite-app'),
        ea = document.getElementById('explore-app');

    if (qa !== null) {
        mo.observe(qa, {
            childList: true,
            subtree: true
        });

        var existingResultCountNode = document.getElementById("resultCountNode");
        if (!existingResultCountNode) {
            existingResultCountNode = document.createElement('div');
            existingResultCountNode.id = "resultCountNode";
            document.body.appendChild(existingResultCountNode);
        }
    }

    if (app !== null) {
        mo.observe(app, {
            childList: true,
            subtree: true
        });
    }

    if (fa !== null) {
        mo.observe(fa, {
            childList: true,
            subtree: true
        });
    }

    if (ea !== null) {
        mo.observe(ea, {
            childList: true,
            subtree: true
        });
    }
};

document.addEventListener('DOMContentLoaded', function(e) {
    injectNotesPanelLibs();
    resetCommonCache();
    setObservers();

    // reset vals 
    p_store = {}

    chrome.storage.sync.get('lc_buddy_config', (opts) => {
        if (opts['lc_buddy_config'] === undefined) {
            chrome.storage.sync.set({
                lc_buddy_config: opts
            });
        } else {
            updateOptions(opts['lc_buddy_config']);
        }
    });

    chrome.storage.sync.get('lc_buddy_p_store', (store) => {
        if (store['lc_buddy_p_store'] === undefined) {
            chrome.storage.sync.set({
                lc_buddy_p_store: {}
            });
        } else {
            p_store = store['lc_buddy_p_store'];
        }
    });
});

chrome.extension.onMessage.addListener(function(options, sender, object, sendResponse) {
    updateOptions(options);
});