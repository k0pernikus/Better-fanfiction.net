chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('../html/showCachedScripts.html')}, function(tab) {});
});
