document.addEventListener('DOMContentLoaded', () => {
    var container = document.getElementById('container'),
        serverCompletionStatus = document.getElementById('serverCompletionStatus'),
        notesPanel = document.getElementById('notesPanel'),
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
                announcement: false,
                acceptanceRate: false,
                difficulty: false,
                lockedQuestions: false,
                resultCountNode: true,
                resultCount: 0,
                solvedDifficultyCounts: false
            };
            chrome.storage.sync.set({lc_buddy_config: opts});
        }

        serverCompletionStatus.checked = opts.serverCompletionStatus;
        notesPanel.checked = opts.notesPanel;
        announcement.checked = opts.announcement;
        acceptanceRate.checked = opts.acceptanceRate;
        difficulty.checked = opts.difficulty;
        lockedQuestions.checked = opts.lockedQuestions;
        resultCountNode.checked = opts.resultCountNode;
        solvedDifficultyCounts.checked = opts.solvedDifficultyCounts;
    });

    container.addEventListener('change', () => {
        var options = {
            serverCompletionStatus: serverCompletionStatus.checked,
            notesPanel: notesPanel.checked,
            announcement: announcement.checked,
            acceptanceRate: acceptanceRate.checked,
            difficulty: difficulty.checked,
            lockedQuestions: lockedQuestions.checked,
            resultCountNode: resultCountNode.checked,
            solvedDifficultyCounts: solvedDifficultyCounts.checked
        };

        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, options, null, null);
        });
        chrome.storage.sync.set({lc_buddy_config: options});
    });
});
