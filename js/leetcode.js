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
var p_store_slug_index = {};
var mo = null;

var LOCAL_STATUS_STYLE_ID = 'lcb-local-status-style';
var LOCAL_STATUS_ICON_CLASS = 'lcb-local-status-icon';
var LOCAL_STATUS_CONTAINER_CLASS = 'lcb-local-status-container';

function ensureLocalStatusStylesInjected() {
    if (document.getElementById(LOCAL_STATUS_STYLE_ID)) {
        return;
    }

    var style = document.createElement('style');
    style.id = LOCAL_STATUS_STYLE_ID;
    style.textContent = '' +
        '.' + LOCAL_STATUS_CONTAINER_CLASS + '{position:relative;}' +
        '.' + LOCAL_STATUS_ICON_CLASS + '{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:14px;color:#16a34a;opacity:0;transition:opacity 0.2s ease-in-out;pointer-events:none;font-weight:600;}';
    document.head.appendChild(style);
}

function refreshSlugIndex() {
    p_store_slug_index = {};
    if (!p_store) {
        return;
    }

    for (var problemName in p_store) {
        if (!p_store.hasOwnProperty(problemName)) {
            continue;
        }
        var entry = p_store[problemName];
        if (!entry) {
            continue;
        }

        var slug = entry.slug;
        if (!slug && entry.link) {
            var match = entry.link.match(/\/problems\/([^\/?#]+)/);
            if (match && match[1]) {
                slug = match[1];
            }
        }

        if (slug) {
            p_store_slug_index[slug] = {
                key: problemName,
                entry: entry
            };
        }
    }
}

function getProblemListRows() {
    var selectors = [
        'a[href^="/problems/"][id]',
        'a[href^="/problems/"][data-row-key]'
    ];
    var rowSet = new Set();
    var rows = [];

    for (var i = 0; i < selectors.length; i++) {
        var nodeList = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < nodeList.length; j++) {
            var node = nodeList[j];
            if (!node || rowSet.has(node)) {
                continue;
            }

            var identifier = node.getAttribute('id');
            var rowKey = node.getAttribute('data-row-key');
            var hasNumericId = identifier && /^\d+$/.test(identifier);
            var qualifies = hasNumericId || !!rowKey;

            if (!qualifies) {
                if (node.classList && node.classList.contains('group')) {
                    qualifies = true;
                }
            }

            if (!qualifies) {
                var parsedData = parseProblemDataFromRow(node);
                if (!parsedData || (!parsedData.problemName && !parsedData.slug)) {
                    continue;
                }
            }

            rowSet.add(node);
            rows.push(node);
        }
    }

    return rows;
}

function parseProblemDataFromRow(row) {
    if (!row) {
        return null;
    }

    var titleSelectors = [
        '.ellipsis',
        '.line-clamp-1',
        '.truncate',
        '[data-e2e-locator="question-title"]',
        '[data-cy="question-title"]'
    ];
    var titleElement = null;

    for (var i = 0; i < titleSelectors.length; i++) {
        titleElement = row.querySelector(titleSelectors[i]);
        if (titleElement) {
            break;
        }
    }

    if (!titleElement) {
        // fallback: find the first child text div
        titleElement = row.querySelector('div');
    }

    var slug = null;
    var href = row.getAttribute('href');
    if (href) {
        var match = href.match(/\/problems\/([^\/?#]+)/);
        if (match && match[1]) {
            slug = match[1];
        }
    }

    if (!titleElement || !titleElement.textContent) {
        if (slug) {
            return {
                problemName: null,
                slug: slug
            };
        }
        return null;
    }

    var fullTitle = titleElement.textContent.replace(/\s+/g, ' ').trim();
    if (!fullTitle) {
        if (slug) {
            return {
                problemName: null,
                slug: slug
            };
        }
        return null;
    }

    var problemName = fullTitle;
    var dotIndex = fullTitle.indexOf('.');
    if (dotIndex > -1) {
        var possibleNumber = fullTitle.substring(0, dotIndex).trim();
        if (/^\d+$/.test(possibleNumber)) {
            problemName = fullTitle.substring(dotIndex + 1).trim();
        }
    }

    return {
        problemName: problemName || null,
        slug: slug
    };
}

function getRowStatusContainer(row) {
    if (!row) {
        return null;
    }

    var contentWrapper = row.firstElementChild;
    var statusContainer = null;

    if (contentWrapper && contentWrapper.firstElementChild) {
        statusContainer = contentWrapper.firstElementChild;
        if (statusContainer) {
            var svgCheck = statusContainer.querySelector('svg');
            if (!svgCheck && statusContainer.firstElementChild) {
                svgCheck = statusContainer.firstElementChild.querySelector && statusContainer.firstElementChild.querySelector('svg');
                if (!svgCheck && statusContainer.firstElementChild && statusContainer.firstElementChild.firstElementChild) {
                    var inner = statusContainer.firstElementChild.firstElementChild;
                    if (inner && typeof inner.querySelector === 'function') {
                        svgCheck = inner.querySelector('svg');
                        if (svgCheck) {
                            statusContainer = inner;
                        }
                    }
                }
            }
            if (svgCheck) {
                statusContainer = svgCheck.parentElement;
                while (statusContainer && statusContainer !== row && statusContainer.tagName && statusContainer.tagName.toLowerCase() !== 'div') {
                    statusContainer = statusContainer.parentElement;
                }
            }
        }
    }

    if (!statusContainer) {
        var firstSvg = row.querySelector('svg[data-icon="check"], svg[data-icon="calendar"], svg');
        if (firstSvg && firstSvg.parentElement) {
            statusContainer = firstSvg.parentElement;
        }
    }

    return statusContainer;
}

function ensureLocalStatusIcon(container) {
    if (!container) {
        return null;
    }

    ensureLocalStatusStylesInjected();
    if (container.classList) {
        container.classList.add(LOCAL_STATUS_CONTAINER_CLASS);
    }

    var icon = container.querySelector('.' + LOCAL_STATUS_ICON_CLASS);
    if (!icon) {
        icon = document.createElement('span');
        icon.className = LOCAL_STATUS_ICON_CLASS;
        icon.textContent = '✓';
        container.appendChild(icon);
    }
    return icon;
}

function getServerStatusNode(container) {
    if (!container) {
        return null;
    }

    var serverIcon = container.querySelector('svg');
    if (serverIcon) {
        return serverIcon;
    }

    return null;
}

function shouldHideServerIcon(node) {
    if (!node) {
        return false;
    }

    var dataIcon = node.getAttribute('data-icon');
    if (dataIcon && dataIcon.toLowerCase().indexOf('check') !== -1) {
        return true;
    }

    var className = node.getAttribute('class');
    if (className && className.toLowerCase().indexOf('check') !== -1) {
        return true;
    }

    var ariaLabel = node.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.toLowerCase().indexOf('check') !== -1) {
        return true;
    }

    return false;
}

function isProblemSolvedLocally(problemName, slug) {
    if (!p_store) {
        return false;
    }

    var entry = null;
    if (slug && p_store_slug_index && p_store_slug_index[slug]) {
        entry = p_store_slug_index[slug].entry;
    }

    if (!entry && problemName && p_store[problemName]) {
        entry = p_store[problemName];
    }

    if (!entry && problemName) {
        var trimmedName = problemName.trim();
        if (trimmedName !== problemName && p_store[trimmedName]) {
            entry = p_store[trimmedName];
        }
    }

    if (!entry) {
        return false;
    }

    return !!(entry["submissionData"] && entry["submissionData"]["correctSubmission"]);
}

function updateOptions(newOptions) {
    if (options.serverCompletionStatus !== newOptions.serverCompletionStatus) {
        toggleServerCompletionStatus(newOptions.serverCompletionStatus);
        options.serverCompletionStatus = newOptions.serverCompletionStatus;
    }

    if (options.notesPanel !== newOptions.notesPanel) {
        toggleNotesPanel(newOptions.notesPanel, newOptions);
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
    var problemRows = getProblemListRows();

    if (!problemRows || problemRows.length === 0) {
        return;
    }

    if (show) {
        for (var i = 0; i < problemRows.length; i++) {
            var row = problemRows[i];
            var statusContainer = getRowStatusContainer(row);
            if (!statusContainer) {
                continue;
            }

            if (statusContainer.classList) {
                statusContainer.classList.remove(LOCAL_STATUS_CONTAINER_CLASS);
            }

            var serverIcon = getServerStatusNode(statusContainer);
            if (serverIcon) {
                serverIcon.style.removeProperty('opacity');
                serverIcon.removeAttribute('aria-hidden');
            }

            var localIcon = statusContainer.querySelector('.' + LOCAL_STATUS_ICON_CLASS);
            if (localIcon && localIcon.parentNode) {
                localIcon.parentNode.removeChild(localIcon);
            }
        }
        return;
    }

    for (var j = 0; j < problemRows.length; j++) {
        var problemRow = problemRows[j];
        var statusNode = getRowStatusContainer(problemRow);
        if (!statusNode) {
            continue;
        }

        var problemData = parseProblemDataFromRow(problemRow);
        if (!problemData || (!problemData.problemName && !problemData.slug)) {
            continue;
        }
        var solved = false;
        if (problemData) {
            solved = isProblemSolvedLocally(problemData.problemName, problemData.slug);
        }

        var serverNode = getServerStatusNode(statusNode);
        if (serverNode) {
            if (solved || shouldHideServerIcon(serverNode)) {
                serverNode.style.opacity = '0';
                serverNode.setAttribute('aria-hidden', 'true');
            } else {
                serverNode.style.removeProperty('opacity');
                serverNode.removeAttribute('aria-hidden');
            }
        }

        var localStatusIcon = ensureLocalStatusIcon(statusNode);
        if (localStatusIcon) {
            localStatusIcon.style.display = 'flex';
            localStatusIcon.style.opacity = solved ? '1' : '0';
            localStatusIcon.setAttribute('aria-hidden', solved ? 'false' : 'true');
        }
    }
};


function checkForSubmission() {
    var currentUrl = location.href;
    if (!currentUrl || (currentUrl.indexOf("/submissions/")) < 0) {
        return;
    } else {
        var resultCandidates = [];
        var locatorMatches = document.querySelectorAll('[data-e2e-locator="submission-result"]');
        if (locatorMatches) {
            for (var i = 0; i < locatorMatches.length; i++) {
                resultCandidates.push(locatorMatches[i]);
            }
        }

        var headingMatches = document.querySelectorAll('h3, h2, h1');
        if (headingMatches) {
            for (var j = 0; j < headingMatches.length; j++) {
                resultCandidates.push(headingMatches[j]);
            }
        }

        var correctSubmission = null;
        var successKeywords = ['accepted'];
        var failureKeywords = ['wrong answer', 'time limit exceeded', 'runtime error', 'memory limit exceeded', 'compile error', 'output limit exceeded'];

        for (var k = 0; k < resultCandidates.length; k++) {
            var candidate = resultCandidates[k];
            if (!candidate || !candidate.textContent) {
                continue;
            }
            var text = candidate.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
            if (!text) {
                continue;
            }

            for (var s = 0; s < successKeywords.length; s++) {
                if (text.indexOf(successKeywords[s]) === 0 || text === successKeywords[s]) {
                    correctSubmission = true;
                    break;
                }
            }
            if (correctSubmission === true) {
                break;
            }

            for (var f = 0; f < failureKeywords.length; f++) {
                if (text.indexOf(failureKeywords[f]) !== -1) {
                    correctSubmission = false;
                    break;
                }
            }
            if (correctSubmission === false) {
                break;
            }
        }

        if (correctSubmission === null && document.body && document.body.innerText) {
            var bodyText = document.body.innerText.toLowerCase();
            for (var fb = 0; fb < failureKeywords.length; fb++) {
                if (bodyText.indexOf(failureKeywords[fb]) !== -1) {
                    correctSubmission = false;
                    break;
                }
            }
        }

        if (correctSubmission === null) {
            return;
        }

        var unixTimestamp = Math.round(+new Date()/1000);
        var submissionData = {
            "correctSubmission": correctSubmission,
            "submissionTime": unixTimestamp
        }
        saveProblemData("submissionData", submissionData);
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
    return new Promise(function(resolve, reject) {
        var notesPanelElm = document.getElementById("lcb_notesPanelId");
        var notesPanelInitScript = document.getElementById("notesPanelInitScriptId");

        if (notesPanelElm) {
            notesPanelElm.parentNode.removeChild(notesPanelElm);
        }
        
        if (notesPanelInitScript) {
            notesPanelInitScript.parentNode.removeChild(notesPanelInitScript);
        }

        resolve();
    })
}

function toggleNotesPanel(show) {
    if (show === undefined || show == true) {
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
                        oldNotes = probEntry["notes"]["content"];
                    }
                    
                    var notesArea = document.createElement("div");
                    notesArea.innerHTML = "<div id='editor'>" + oldNotes + "</div>";
                    notesArea.style = "width:30%;text-align:center;";
                    notesArea.id = "lcb_notesPanelId";
                    editorAreaParent.appendChild(notesArea);
                    
                    // if script is already loaded, then call make the initialization call again
                    // (originally called in the notesPanelScript (notes.js) but it wouldn't have worked
                    // if lcb_notesPanelId wasn't created yet)
                    if (document.getElementById("notesPanelScriptId")) {
                        var initNotesScript = document.createElement("script");
                        initNotesScript.innerHTML = "initializeNotesEditor();";
                        initNotesScript.id = "notesPanelInitScriptId";
                        document.body.appendChild(initNotesScript);
                    }

                    var noteBtnArr = getElementsByClassNamePrefix(document, "div", "note-btn");
                    if (noteBtnArr && noteBtnArr.length > 0) {
                        var noteBtn = noteBtnArr[0]
                        noteBtn.style = 'display:none;';
                    }
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
    if (notesPanelDiv != null && newWidth != undefined && newWidth != null) {
        var newWidthStr = newWidth.toString() + "%;text-align:center;";
        notesPanelDiv.style = "width:" + newWidthStr;
    }
}

function saveProblemData(dataKey, dataVal) {
    var problemTitle = getProblemTitle();
    if (!problemTitle) {
        return;
    }

    var problemNumber = problemTitle["problemNumber"];
    var problemName = problemTitle["problemName"];
    var slug = problemTitle["slug"];
    var storeKey = problemName || slug;

    if (!storeKey) {
        return;
    }

    var existingEntry = null;
    if (problemName && p_store[problemName]) {
        existingEntry = p_store[problemName];
    } else if (slug && p_store_slug_index && p_store_slug_index[slug]) {
        existingEntry = p_store_slug_index[slug].entry;
    }

    if (existingEntry && existingEntry[dataKey] === dataVal) {
        return;
    }

    chrome.storage.sync.get('lc_buddy_p_store', (store) => {
        var cur_p_store = store['lc_buddy_p_store'];

        if (cur_p_store === undefined) {
            cur_p_store = {};
        }

        var targetKey = null;
        if (problemName && cur_p_store[problemName]) {
            targetKey = problemName;
        } else if (slug) {
            if (p_store_slug_index && p_store_slug_index[slug]) {
                targetKey = p_store_slug_index[slug].key;
            }

            if (!targetKey) {
                for (var key in cur_p_store) {
                    if (!cur_p_store.hasOwnProperty(key)) {
                        continue;
                    }
                    var entry = cur_p_store[key];
                    if (!entry) {
                        continue;
                    }
                    if ((entry.slug && entry.slug === slug) || (entry.link && entry.link.indexOf('/problems/' + slug) !== -1)) {
                        targetKey = key;
                        break;
                    }
                }
            }
        }

        if (!targetKey) {
            targetKey = storeKey;
        }

        if (!cur_p_store[targetKey]) {
            cur_p_store[targetKey] = {};
        }

        cur_p_store[targetKey][dataKey] = dataVal;
        if (problemNumber !== undefined) {
            cur_p_store[targetKey]["problemNumber"] = problemNumber;
        }
        if (problemName) {
            cur_p_store[targetKey]["problemName"] = problemName;
        }
        if (slug) {
            cur_p_store[targetKey]["slug"] = slug;
        }
        cur_p_store[targetKey]["link"] = location.href;

        p_store = cur_p_store;
        refreshSlugIndex();
        chrome.storage.sync.set({
            lc_buddy_p_store: cur_p_store
        });
        toggleServerCompletionStatus(options.serverCompletionStatus);
    });
}

function injectNotesPanelLibs() {
    function injectJs(dom, scriptUrl, callback, id, script) {
        script = dom.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = function() {
            script.id = id;
            callback();
        }
        script.src = scriptUrl;
        dom.getElementsByTagName('head')[0].appendChild(script);
    }

    if (isAppScreen()) {
        var requiredScriptsSequential = [
            chrome.runtime.getURL('js/libs/jquery.1.8.3.min.js'),
            chrome.runtime.getURL('js/libs/quill.min.js'),
            chrome.runtime.getURL('js/libs/notify.min.js'),
            chrome.runtime.getURL('js/notes.js')
        ]

        injectJs(document, requiredScriptsSequential[0], function(){
            injectJs(document, requiredScriptsSequential[1], function() {
                injectJs(document, requiredScriptsSequential[2], function() {
                    injectJs(document, requiredScriptsSequential[3], function() {
                        toggleNotesPanel(true);
                    }, "notesPanelScriptId")
                })
            })
        })

        var quillCss = document.createElement("link");
        quillCss.rel = "stylesheet";
        quillCss.href = chrome.runtime.getURL('css/libs/quill.snow.min.css');
        document.head.appendChild(quillCss);
    }
}

function onPageMutated() {
    // check if this change was caused by an update by a DOM update in the notespanel.
    var notesPanelData = document.getElementById("notesPanelData");
    if (notesPanelData == null) {
        toggleServerCompletionStatus(options.serverCompletionStatus);
        toggleNotesPanel(options.notesPanel);
        toggleNotesPanelWidth(options.notesPanelWidth);
        toggleDifficulty(options.difficulty);
        toggleAnnouncement(options.announcement);
        toggleAcceptanceRate(options.acceptanceRate);
        toggleLockedQuestions(options.lockedQuestions);
        toggleResultCountNode(options.resultCountNode);
        toggleSolvedDifficultyCounts(options.solvedDifficultyCounts);
        checkForSubmission();
    } else {
        var notesData = {
            "content": notesPanelData.innerHTML,
            "lastEdit": getFullDateAndTimeStr()
        };
        notesPanelData.parentNode.removeChild(notesPanelData);
        saveProblemData("notes", notesData);
    }
}

function getFullDateAndTimeStr() {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return date+' '+time;
}

function setObservers() {
    if (mo == null) {
        mo = new MutationObserver(onPageMutated);
    }
    var qa = document.getElementById('question-app'),
        app = document.getElementById('app'),
        fa = document.getElementById('favorite-app'),
        ea = document.getElementById('explore-app'),
        nextRoot = document.getElementById('__next');

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

    if (nextRoot !== null) {
        mo.observe(nextRoot, {
            childList: true,
            subtree: true
        });
    } else if (!qa && !app && !fa && !ea && document.body) {
        mo.observe(document.body, {
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
            p_store = {};
            refreshSlugIndex();
            toggleServerCompletionStatus(options.serverCompletionStatus);
        } else {
            p_store = store['lc_buddy_p_store'];
            refreshSlugIndex();
            toggleServerCompletionStatus(options.serverCompletionStatus);
        }
    });
});

chrome.extension.onMessage.addListener(function(options, sender, object, sendResponse) {
    updateOptions(options);
});
