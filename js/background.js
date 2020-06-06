function isValidPage(urlStr) {
    return urlStr && urlStr.indexOf("leetcode.com") > -1;
}

chrome.browserAction.onClicked.addListener((tab) => {
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
        chrome.browserAction.setPopup({ tabId: tabId, popup: 'html/config.html' });
        chrome.browserAction.setIcon({ tabId: tabId, path: 'img/icon.png' });
    } else {
        chrome.browserAction.setPopup({ tabId: tabId, popup: 'html/invalid-webpage.html' });
        chrome.browserAction.setIcon({ path: 'img/icon-disabled.png', tabId: tabId });
    }
}