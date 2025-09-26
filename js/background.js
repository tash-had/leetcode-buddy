function isValidPage(urlStr) {
    return urlStr && urlStr.indexOf("leetcode.com") > -1;
}

chrome.action.onClicked.addListener((tab) => {
    setPoputState(tab.id, tab.url);
});

chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (change) {
        setPoputState(info.tabId, change.url);
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
    setPoputState(tabId, tab.url);
});

function setPoputState(tabId, tabUrl) {
    if (isValidPage(tabUrl)) {
        chrome.action.setPopup({ tabId: tabId, popup: 'html/config.html' });
        chrome.action.setIcon({ tabId: tabId, path: 'img/icon.png' });
    } else {
        chrome.action.setPopup({ tabId: tabId, popup: 'html/invalid-webpage.html' });
        chrome.action.setIcon({ path: 'img/icon-disabled.png', tabId: tabId });
    }
}