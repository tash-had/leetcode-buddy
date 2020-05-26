var options = {
        serverCompletionStatus: false,
        announcement: false,
        acceptanceRate: false,
        difficulty: false,
        lockedQuestions: false,
        resultCountNode: true,
        resultCount: 0,
        solvedDifficultyCounts: false
    },
    p_store = {},
    updateOptions = function (newOptions) {
        if (options.serverCompletionStatus !== newOptions.serverCompletionStatus) {
            toggleServerCompletionStatus(newOptions.serverCompletionStatus);
            options.serverCompletionStatus = newOptions.serverCompletionStatus;
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
    },
    getElementsByClassNamePrefix = function(oElm, strTagName, strClassName) {
        if (oElm === undefined || oElm === null) {
            return null;
        }
        var arrElements = (strTagName == "*" && oElm.all)? oElm.all : 
        oElm.getElementsByTagName(strTagName);
        var arrReturnElements = new Array();
        strClassName = strClassName.replace(/\-/g, "\\-");
        var oRegExp = new RegExp(strClassName);
        var oElement;
        for(var i=0; i<arrElements.length; i++){
            oElement = arrElements[i];      
            if(oRegExp.test(oElement.className)){
                arrReturnElements.push(oElement);
            }   
        }
        return (arrReturnElements)
    },
    isAppScreen = function () {
        var appDiv = document.getElementById("app");
        if (appDiv !== null) {
            return true;
        }
        return false;
    },
    isQuestionAppScreen = function () {
        var questionApp = document.getElementById("question-app");
        if (questionApp !== null) {
            return true;
        }
        return false;
    },
    isFavoriteAppScreen = function () {
        var favoriteApp = document.getElementById("favorite-app");
        if (favoriteApp !== null) {
            return true;
        }
        return false;
    },
    isExploreAppScreen = function () {
        var exploreApp = document.getElementById("explore-app");
        var chapterContent = document.getElementsByClassName("explore-detail-base");
        if (exploreApp !== null && chapterContent.length > 0) {
            return true;
        }
        return false;
    },
    toggleServerCompletionStatus = function (show) {
        var problemNamesList = null;
        var completionChecks = null;

        if (isAppScreen()) {
            return;
        } else if (isQuestionAppScreen()) {
            console.log("is question screen");
            // 'problems' view 
            completionChecks = document.querySelectorAll('.reactable-data > tr > td:nth-child(1)');
            problemNamesList = document.querySelectorAll('.reactable-data > tr > td:nth-child(3)');
        } else if (isFavoriteAppScreen()) {
            console.log("is fav screen");

            // 'my lists' view
            completionChecks = document.getElementsByClassName('css-alevek');
            problemNamesList = document.getElementsByClassName("question-title");
        } else if (isExploreAppScreen()) {
            console.log("is explore screen");
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
            console.log("is other screen");
            return;
        }

        if (show) {
            if (completionChecks !== null) {
                for (var i = 0; i < completionChecks.length; i++) {
                    completionChecks[i].style = '';
                }
            }
        } else {
            if (completionChecks !== null) {
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
    },
    getProblemTitle = function() {
        if (isAppScreen()) {
            var problemTitleDivArr = document.getElementsByClassName("css-v3d350");
            var problemTitleDiv = problemTitleDivArr[0];
            var problemNamePartsArr = problemTitleDiv.textContent.split(". ");
            var problemNumber = parseInt(problemNamePartsArr[0].trim()); 
            var problemName = problemNamePartsArr[1].trim();
            return {
                "problemName": problemName,
                "problemNumber": problemNumber
            };
        }
        return null;
    },
    checkForSubmission = function() {
        console.log("checking for submission");
        var currentUrl = location.href;
        if (!isAppScreen() || (currentUrl.indexOf("/submissions/")) < 0) {
            return;
        } else {
            console.log("looking for result container");
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
                    console.log("saving", correctSubmission);
                    saveProblemData("correctSubmission", correctSubmission); 
                }
            }
        }
    },
    saveProblemData = function(dataKey, dataVal) {
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
            chrome.storage.sync.set({lc_buddy_p_store: cur_p_store});
        });
    },
    toggleAnnouncement = function (show) {
        var announcement = document.getElementById('announcement');

        if (announcement !== null) {
            if (show) {
                announcement.style = '';
            } else {
                announcement.style = 'display: none;';
            }
        }
    },
    toggleAcceptanceRate = function (show) {
        var acceptanceRates = document.querySelectorAll('.reactable-data > tr > td:nth-child(5)'),
        rates = document.getElementsByClassName('css-jkjiwi');

        if (show) {
            for (var i = 0; i < acceptanceRates.length; ++i) {
                acceptanceRates[i].style = '';
            }

            if (rates !== null) {
              for(let i = 0; i < rates.length; i++) {
                rates[i].style = 'opacity: 100;';
              }
            }
        } else {
            for (var i = 0; i < acceptanceRates.length; ++i) {
                acceptanceRates[i].style = 'opacity: 0;';
            }

            if (rates !== null) {
              for(let i = 0; i < rates.length; i++) {
                rates[i].style = 'opacity: 0;';
              }
            }
        }
    },
    toggleDifficulty = function (show) {
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
    },
    toggleLockedQuestions = function (show) {
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
    },
    toggleResultCountNode = function (show) {
        var resultCountNode = document.getElementById('resultCountNode');

        if (resultCountNode) {
            if (show) {
                resultCountNode.style = '';
                resultCountNode.innerHTML = options.resultCount;
            } else {
                resultCountNode.style = 'display: none;';
            }
        }
    },
    toggleSolvedDifficultyCounts = function (show) {
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
    },
    appEvent = function () {
        toggleServerCompletionStatus(options.serverCompletionStatus);
        toggleAnnouncement(options.announcement);
        toggleAcceptanceRate(options.acceptanceRate);
        toggleDifficulty(options.difficulty);
        toggleLockedQuestions(options.lockedQuestions);
        toggleResultCountNode(options.resultCountNode);
        toggleSolvedDifficultyCounts(options.solvedDifficultyCounts);
        checkForSubmission();
    };

document.addEventListener('DOMContentLoaded', function (e) {
    var qa = document.getElementById('question-app'),
        app = document.getElementById('app'),
        fa = document.getElementById('favorite-app'),
        ea = document.getElementById('explore-app'),
        mo = new MutationObserver(appEvent);

    if (qa !== null) {
        mo.observe(qa, {childList: true, subtree: true});
        resultCountNode = document.createElement('div');
        resultCountNode.setAttribute('id', 'resultCountNode');
        document.body.appendChild(resultCountNode);
    }

    if (app !== null) {
        mo.observe(app, {childList: true, subtree: true});
    }

    if (fa !== null) {
        mo.observe(fa, {childList: true, subtree: true});
    }

    if (ea !== null) {
        mo.observe(ea, {childList: true, subtree: true});
    }

    chrome.storage.sync.get('lc_buddy_config', (opts) => {
        if (opts['lc_buddy_config'] === undefined) {
            chrome.storage.sync.set({lc_buddy_config: opts});
        } else {
            updateOptions(opts['lc_buddy_config']);
        }
    });
    
    chrome.storage.sync.get('lc_buddy_p_store', (store) => {
        if (store['lc_buddy_p_store'] === undefined) {
            chrome.storage.sync.set({lc_buddy_p_store: {}});
        } else {
            p_store = store['lc_buddy_p_store'];
        }
    });
});

chrome.extension.onMessage.addListener(function(options, sender, object, sendResponse) {
    updateOptions(options);
});
