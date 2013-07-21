chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('showCachedScripts.html')}, function(tab) {});
});
