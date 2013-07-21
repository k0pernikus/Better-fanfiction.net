(function($, chrome, document, _){
    "use strict";
    var $content = $('#content');

    chrome.storage.local.get(function(OfflineCache){
        _.each(OfflineCache, function(chapter) {
            try {
                var $titleSpan = $('<h1>', {
                    class: "chapterTitle",
                    html: "Chapter " + chapter.chapterNumber.toString()
                });

                var $div = $('<div>', {
                    class: ['chapter'],
                    html: chapter.chapter
                });

                $content.append($titleSpan).append($div);
            } catch(e){
                console.error('malformed chapter data');
            }
        });
    });
})(jQuery, chrome, document, _);
