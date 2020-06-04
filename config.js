var configEnableDisableLabels = {
    serverCompletionStatus: {
        true: "Showing from server",
        false: "Showing from local store"
    },
    notesPanel: {
        true: "Showing Notes Panel",
        false: "Disabled"
    },
    announcement: {
        true: "Showing Announcement",
        false: "Disabled"
    },
    acceptanceRate: {
        true: "Showing Acceptance Rate",
        false: "Disabled"
    },
    difficulty: {
        true: "Showing Difficulty",
        false: "Disabled"
    },
    lockedQuestions: {
        true: "Showing Locked Questions",
        false: "Hiding Locked Questions"
    },
    resultCountNode: {
        true: "Showing Result Count",
        false: "Disabled"
    },
    solvedDifficultyCounts: {
        true: "Enabled",
        false: "Disabled"
    }
}

document.addEventListener('DOMContentLoaded', () => {
    var container = document.getElementById('container'),
        serverCompletionStatus = document.getElementById('serverCompletionStatus'),
        notesPanel = document.getElementById('notesPanel'),
        notesPanelWidth = document.getElementById('notesPanelWidth'),
        announcement = document.getElementById('announcement'),
        acceptanceRate = document.getElementById('acceptanceRate'),
        difficulty = document.getElementById('difficulty'),
        lockedQuestions = document.getElementById('lockedQuestions');

    chrome.storage.sync.get('lc_buddy_config', (options) => {
        var opts = options['lc_buddy_config'];

        if (opts === undefined) {
            opts = {
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
            chrome.storage.sync.set({ lc_buddy_config: opts });
        }

        serverCompletionStatus.checked = opts.serverCompletionStatus;
        notesPanel.checked = opts.notesPanel;
        notesPanelWidth.value = opts.notesPanelWidth;
        announcement.checked = opts.announcement;
        acceptanceRate.checked = opts.acceptanceRate;
        difficulty.checked = opts.difficulty;
        lockedQuestions.checked = opts.lockedQuestions;
        resultCountNode.checked = opts.resultCountNode;
        solvedDifficultyCounts.checked = opts.solvedDifficultyCounts;

        toggleNotesWidth(opts.notesPanel);
        toggleDetailSpans(opts);
    });

    container.addEventListener('input', () => {
        var options = {
            serverCompletionStatus: serverCompletionStatus.checked,
            notesPanel: notesPanel.checked,
            notesPanelWidth: notesPanelWidth.value,
            announcement: announcement.checked,
            acceptanceRate: acceptanceRate.checked,
            difficulty: difficulty.checked,
            lockedQuestions: lockedQuestions.checked,
            resultCountNode: resultCountNode.checked,
            solvedDifficultyCounts: solvedDifficultyCounts.checked
        };

        toggleNotesWidth(options.notesPanel);
        toggleDetailSpans(options);

        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, options, null, null);
        });
        chrome.storage.sync.set({ lc_buddy_config: options });
    });
});

function toggleNotesWidth(notesPanelEnabled) {
    var notesPanelWidthDiv = document.getElementById("notesPanelWidthDiv");
    if (notesPanelEnabled) {
        notesPanelWidthDiv.style = '';
    } else {
        notesPanelWidthDiv.style = 'display:none;';
    }
}

function toggleDetailSpans(opts) {
    for (var optionKey in opts) {
        console.log("stage 0", optionKey);
        var inputElem = document.getElementById(optionKey);
        if (inputElem) {
            console.log("stage 1");
            var parentDiv = inputElem.parentElement;
            if (parentDiv) {
            console.log("stage 2");

                var detailSpan = parentDiv.querySelector("label>h3>span");
                var isChecked = opts[optionKey];
                if (detailSpan && (optionKey in configEnableDisableLabels)) {
            console.log("stage 3");

                    detailSpan.innerHTML = configEnableDisableLabels[optionKey][isChecked];
                }
            }
        }
    }
}