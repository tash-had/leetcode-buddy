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
    var configControlPanel = document.getElementById('configControlPanel'),
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
            toggleDetailSpans(opts);
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

        toggleNotesWidth(opts.notesPanel, opts.notesPanelWidth);
        toggleDetailSpans(opts);
    });

    configControlPanel.addEventListener('input', () => {
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

        toggleNotesWidth(options.notesPanel, options.notesPanelWidth);
        toggleDetailSpans(options);

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, options);
        });
        chrome.storage.sync.set({ lc_buddy_config: options });
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