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
    var possibleAppRoots = [
        document.getElementById("app"),
        document.getElementById("question-app"),
        document.getElementById("favorite-app"),
        document.getElementById("explore-app"),
        document.getElementById("__next")
    ];

    for (var i = 0; i < possibleAppRoots.length; i++) {
        if (possibleAppRoots[i] !== null) {
            return true;
        }
    }
    return false;
}

function isQuestionAppScreen() {
    if (document.getElementById("question-app") !== null) {
        return true;
    }

    if (typeof location !== "undefined") {
        var pathname = location.pathname || "";
        if (pathname.indexOf("/problems/") === 0 && pathname.indexOf("/submissions/") === -1) {
            return true;
        }
    }

    return false;
}

function isFavoriteAppScreen() {
    if (document.getElementById("favorite-app") !== null) {
        return true;
    }

    if (typeof location !== "undefined") {
        var pathname = location.pathname || "";
        if (pathname.indexOf("/list/") === 0 || pathname.indexOf("/problem-list/") === 0) {
            return true;
        }
    }

    return false;
}

function isExploreAppScreen() {
    if (document.getElementById("explore-app") !== null) {
        return true;
    }

    if (typeof location !== "undefined") {
        var pathname = location.pathname || "";
        if (pathname.indexOf("/explore/") === 0) {
            return true;
        }
    }

    return false;
}

function getProblemTitle() {
    if (isAppScreen() && problemTitleObj == null) {
        var slug = null;
        if (typeof location !== "undefined" && location.pathname) {
            var pathParts = location.pathname.split('/');
            for (var i = 0; i < pathParts.length; i++) {
                if (pathParts[i] === "problems" && (i + 1) < pathParts.length) {
                    slug = pathParts[i + 1];
                    break;
                }
            }
        }

        var titleSelectors = [
            '[data-e2e-locator="question-title"]',
            '[data-cy="question-title"]',
            'div[class*="text-title"]',
            'h1'
        ];
        var problemTitleDiv = null;

        for (var i = 0; i < titleSelectors.length; i++) {
            var candidates = document.querySelectorAll(titleSelectors[i]);
            for (var j = 0; j < candidates.length; j++) {
                var textContent = candidates[j].textContent;
                if (textContent) {
                    textContent = textContent.trim();
                }
                if (textContent) {
                    problemTitleDiv = candidates[j];
                    break;
                }
            }
            if (problemTitleDiv !== null) {
                break;
            }
        }

        var problemName = null;
        var problemNumber = null;

        if (problemTitleDiv !== null) {
            var fullTitle = problemTitleDiv.textContent || "";
            fullTitle = fullTitle.replace(/\s+/g, " ").trim();
            var dotIndex = fullTitle.indexOf('.');

            if (dotIndex > -1) {
                var possibleNumber = fullTitle.substring(0, dotIndex).trim();
                if (/^\d+$/.test(possibleNumber)) {
                    problemNumber = parseInt(possibleNumber, 10);
                    problemName = fullTitle.substring(dotIndex + 1).trim();
                } else {
                    problemName = fullTitle;
                }
            } else {
                problemName = fullTitle;
            }
        }

        if (!problemName && typeof document !== "undefined") {
            var docTitle = document.title || "";
            var suffixIndex = docTitle.indexOf(' - LeetCode');
            if (suffixIndex > -1) {
                problemName = docTitle.substring(0, suffixIndex).trim();
            } else {
                problemName = docTitle.trim();
            }
        }

        if (!problemName && slug) {
            var nameFromSlug = slug.replace(/-/g, ' ');
            problemName = nameFromSlug.replace(/\b\w/g, function(char) {
                return char.toUpperCase();
            });
        }

        if (problemName || slug) {
            problemTitleObj = {
                "problemName": problemName || slug,
                "problemNumber": problemNumber,
                "slug": slug
            };
        }
    }
    return problemTitleObj;
}

function resetCommonCache() {
    problemTitleObj = null;
}