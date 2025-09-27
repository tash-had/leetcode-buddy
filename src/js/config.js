var configEnableDisableLabels = {
    serverCompletionStatus: {
        true: "Showing from server",
        false: "Showing from local store"
    },
    acceptanceRate: {
        true: "Showing Acceptance Rate",
        false: "Disabled"
    },
    difficulty: {
        true: "Showing Difficulty",
        false: "Disabled"
    }
    // DISABLED FEATURES - labels removed
    // notesPanel: {
    //     true: "Showing Notes Panel",
    //     false: "Disabled"
    // },
    // announcement: {
    //     true: "Showing Announcement",
    //     false: "Disabled"
    // },
    // lockedQuestions: {
    //     true: "Showing Locked Questions",
    //     false: "Hiding Locked Questions"
    // },
    // resultCountNode: {
    //     true: "Showing Result Count",
    //     false: "Disabled"
    // },
    // solvedDifficultyCounts: {
    //     true: "Enabled",
    //     false: "Disabled"
    // }
}

document.addEventListener('DOMContentLoaded', () => {
    var configControlPanel = document.getElementById('configControlPanel'),
        serverCompletionStatus = document.getElementById('serverCompletionStatus'),
        acceptanceRate = document.getElementById('acceptanceRate'),
        difficulty = document.getElementById('difficulty');
        // DISABLED FEATURES - commented out
        // notesPanel = document.getElementById('notesPanel'),
        // notesPanelWidth = document.getElementById('notesPanelWidth'),
        // announcement = document.getElementById('announcement'),
        // lockedQuestions = document.getElementById('lockedQuestions'),
        // resultCountNode = document.getElementById('resultCountNode'),
        // solvedDifficultyCounts = document.getElementById('solvedDifficultyCounts');

    chrome.storage.sync.get('lc_buddy_config', (options) => {
        var opts = options['lc_buddy_config'];

        if (opts === undefined) {
            opts = {
                serverCompletionStatus: false,
                acceptanceRate: true,
                difficulty: true
                // DISABLED FEATURES - removed from config
                // notesPanel: false,
                // notesPanelWidth: 30,
                // announcement: false,
                // lockedQuestions: false,
                // resultCountNode: false,
                // resultCount: 0,
                // solvedDifficultyCounts: false
            };
            chrome.storage.sync.set({ lc_buddy_config: opts });
        }

        serverCompletionStatus.checked = opts.serverCompletionStatus;
        acceptanceRate.checked = opts.acceptanceRate;
        difficulty.checked = opts.difficulty;
        // DISABLED FEATURES - checkbox assignments commented out
        // notesPanel.checked = opts.notesPanel;
        // notesPanelWidth.value = opts.notesPanelWidth;
        // announcement.checked = opts.announcement;
        // lockedQuestions.checked = opts.lockedQuestions;
        // resultCountNode.checked = opts.resultCountNode;
        // solvedDifficultyCounts.checked = opts.solvedDifficultyCounts;

        // toggleNotesWidth(opts.notesPanel, opts.notesPanelWidth);
        toggleDetailSpans(opts);
    });

    configControlPanel.addEventListener('input', (event) => {
        chrome.storage.sync.get('lc_buddy_config', (prevOptions) => {
            var prevOpts = prevOptions['lc_buddy_config'] || {};
            var options = {
                serverCompletionStatus: serverCompletionStatus.checked,
                acceptanceRate: acceptanceRate.checked,
                difficulty: difficulty.checked
                // DISABLED FEATURES - removed from options
                // notesPanel: notesPanel.checked,
                // notesPanelWidth: notesPanelWidth.value,
                // announcement: announcement.checked,
                // lockedQuestions: lockedQuestions.checked,
                // resultCountNode: resultCountNode.checked,
                // solvedDifficultyCounts: solvedDifficultyCounts.checked
            };

            // toggleNotesWidth(options.notesPanel, options.notesPanelWidth);
            toggleDetailSpans(options);

            // Check if completion status was toggled to "Showing from server" (true)
            var completionStatusToggledToServer = false;
            if (event.target.id === 'serverCompletionStatus') {
                completionStatusToggledToServer = !prevOpts.serverCompletionStatus && options.serverCompletionStatus;
            }

            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, options);

                // Refresh the page if completion status was toggled to server
                if (completionStatusToggledToServer) {
                    chrome.tabs.reload(tabs[0].id);
                }
            });
            chrome.storage.sync.set({ lc_buddy_config: options });
        });
    });
});

function toggleNotesWidth(notesPanelEnabled, widthValue) {
    var notesPanelWidthDiv = document.getElementById("notesPanelWidthDiv");
    if (notesPanelEnabled) {
        notesPanelWidthDiv.style = '';
        var widthValueSpan = document.getElementById("rangeSliderValueSpan");
        widthValueSpan.innerHTML = widthValue;
    } else {
        notesPanelWidthDiv.style = 'display:none;';
    }
}

function toggleDetailSpans(opts) {
    for (var optionKey in opts) {
        var inputElem = document.getElementById(optionKey);
        if (inputElem) {
            var parentDiv = inputElem.parentElement;
            if (parentDiv) {
                var detailSpan = parentDiv.querySelector("label>h3>span");
                var isChecked = opts[optionKey];
                if (detailSpan && (optionKey in configEnableDisableLabels)) {
                    detailSpan.innerHTML = configEnableDisableLabels[optionKey][isChecked];
                }
            }
        }
    }
}