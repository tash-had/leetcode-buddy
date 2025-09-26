var problemTitleObj = null;

function getElementsByClassNamePrefix(oElm, strTagName, strClassName) {
    if (oElm === undefined || oElm === null) {
        return null;
    }
    var arrElements = (strTagName == "*" && oElm.all) ? oElm.all :
        oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/\-/g, "\\-");
    var oRegExp = new RegExp(strClassName);
    var oElement;
    for (var i = 0; i < arrElements.length; i++) {
        oElement = arrElements[i];
        if (oRegExp.test(oElement.className)) {
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements)
}

function isAppScreen() {
    var appDiv = document.getElementById("app");
    if (appDiv !== null) {
        return true;
    }
    return false;
}

function isQuestionAppScreen() {
    var questionApp = document.getElementById("question-app");
    if (questionApp !== null) {
        return true;
    }
    return false;
}

function isFavoriteAppScreen() {
    var favoriteApp = document.getElementById("favorite-app");
    if (favoriteApp !== null) {
        return true;
    }
    return false;
}

function isExploreAppScreen() {
    var exploreApp = document.getElementById("explore-app");
    if (exploreApp !== null) {
        var chapterList = document.getElementsByClassName("chapter-list-base");
        if (chapterList.length == 0) {
            var expandableChapterList = document.getElementsByClassName("expandable-chapter-list-base");
            if (expandableChapterList.length == 0) {
                return false;
            }
        }
        return true;
    }
    return false;
}

function getProblemTitle() {
    if (isAppScreen() && problemTitleObj == null) {
        // Try old selector first for backward compatibility
        var problemTitleDivArr = document.getElementsByClassName("css-v3d350");
        var problemTitleDiv = null;

        if (problemTitleDivArr.length > 0) {
            problemTitleDiv = problemTitleDivArr[0];
        } else {
            // Try new selectors for current LeetCode structure
            var titleSelectors = [
                'h1[data-cy="question-title"]',
                'div[data-cy="question-title"]',
                'h1:contains(".")' // Look for h1 with number and dot
            ];

            for (var i = 0; i < titleSelectors.length; i++) {
                var elements = document.querySelectorAll(titleSelectors[i]);
                if (elements.length > 0) {
                    problemTitleDiv = elements[0];
                    break;
                }
            }

            // Fallback: look for any h1 that contains a number followed by a dot
            if (!problemTitleDiv) {
                var h1Elements = document.querySelectorAll('h1');
                for (var i = 0; i < h1Elements.length; i++) {
                    var text = h1Elements[i].textContent;
                    if (/^\d+\./g.test(text.trim())) {
                        problemTitleDiv = h1Elements[i];
                        break;
                    }
                }
            }
        }

        if (problemTitleDiv) {
            var problemNamePartsArr = problemTitleDiv.textContent.split(". ");
            if (problemNamePartsArr.length >= 2) {
                var problemNumber = parseInt(problemNamePartsArr[0].trim());
                var problemName = problemNamePartsArr[1].trim();
                problemTitleObj = {
                    "problemName": problemName,
                    "problemNumber": problemNumber
                }
            }
        }
    }
    return problemTitleObj;
}

function resetCommonCache() {
    problemTitleObj = null;
}
