(function($, chrome, document, _){
    "use strict";
    var $content = $('#content');

    chrome.storage.local.get(function(OfflineCache){
        console.log(OfflineCache);
        _.each(OfflineCache, function(chapter) {
            try {
                var $storyTitleSpan = $('<h1>',{
                    class: 'storyTitle',
                    html: "Titel" + chapter.title
                })

                var $titleSpan = $('<h2>', {
                    class: "chapterTitle",
                    html: "Chapter " + chapter.chapterNumber.toString()
                });

                var $div = $('<div>', {
                    class: ['chapter'],
                    html: chapter.chapter
                });

                $content.append($storyTitleSpan).append($titleSpan).append($div);
            } catch(e){
                console.error('malformed chapter data');
            }
        });
    });

    var $document = $(document);

    $document.on('logAllCache', function(){
        chrome.storage.local.get(function(OfflineCache){
            for (var key in OfflineCache) {
                console.log(key);
            }
        });
    });

    $document.on('clearAllCache', function(){
        chrome.storage.local.clear();
    });

    $('span#deleteAllCache').on('click', function(){
        console.warn('should ask first');
        $document.trigger('clearAllCache');
    });
})(jQuery, chrome, document, _);
