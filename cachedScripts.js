console.log('hello there');

(function($, chrome, document, _){
    "use strict";
    var $content = $('#content');

    chrome.storage.local.get(function(OfflineCache){
        _.each(OfflineCache, function(chapter) {
            var $div = $('<div>', {
                class: ['chapter'],
                //html: chapter.chapter
                html: chapter.url
            });
            $content.append($div);
        });
    });
})(jQuery, chrome, document, _);
