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
        var problemTitleDivArr = document.getElementsByClassName("css-v3d350");
        if (problemTitleDivArr.length > 0) {
            var problemTitleDiv = problemTitleDivArr[0];
            var problemNamePartsArr = problemTitleDiv.textContent.split(". ");
            var problemNumber = parseInt(problemNamePartsArr[0].trim());
            var problemName = problemNamePartsArr[1].trim();
            problemTitleObj = {
                "problemName": problemName,
                "problemNumber": problemNumber
            }
        }
    }
    return problemTitleObj;
}

function resetCommonCache() {
    problemTitleObj = null;
}