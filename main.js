"use strict";
console.log('huh');
/**
 * More human readable update dates
 */

(function($, document, chrome) {
    var $document = $(document);

    jQuery.extend({
        getCachedHTML: function (url, returnHtmlDataCallback) {
            var cacheTimeInMs = 1209600000; // two weeks
            var currentTimeInMs = new Date().getTime();

            var cache = {
                data:null,
                timestamp:null
            };

            var getChapterContentByGetRequest = function(){
                console.log('use getRequest');
                $.get(url, function (data) {
                    console.log('get request used');
                    cache.data = data;
                    cache.timestamp = new Date().getTime();

                    var persist = {};
                    persist[url] = cache;

                    chrome.storage.local.set(persist);

                    returnHtmlDataCallback(cache.data);
                }, 'html');
            }

            chrome.storage.local.get(url, function(cachedUrl){
                if (Object.keys(cachedUrl).length === 0) {
                    getChapterContentByGetRequest();
                    return;
                }

                var validCache = (currentTimeInMs - cachedUrl[url].timestamp) < cacheTimeInMs;

                if (!validCache) {
                    getChapterContentByGetRequest();
                    return;
                }

                console.log('cache is valid');
                returnHtmlDataCallback(cachedUrl[url].data);
                return;
            });
        }
    });

    /**
     * @param substring
     * @returns {boolean}
     */

    String.prototype.contains = function(substring) {
        return this.indexOf(substring) !== -1;
    }

    /**
     * Parses fanfic description.
     * Aim is to update last updated time into something more human readable and warn for possible abandoned fics.
     */

    var Parser;
    Parser = {
        ack: "amIstupid?",
        textToBeParsed: null,
        rated: null,
        language: null,
        genre: null,
        chapterAmount: null,
        wordAmount: null,
        reviewAmount: null,
        favoriteAmount: null,
        followAmount: null,
        updatedAt: null,
        publishedAt: null,
        relationships: null,
        init: function (textToBeParsed) {
            this.textToBeParsed = textToBeParsed;
            /**
             * textToBeParsed contains String in the from of:
             * "Rated: T - English - Romance - Chapters: 10 - Words: 47,088 - Reviews: 158 - Favs: 68 - Follows: 143 - Updated: 7-7-13 - Published: 5-18-13 - OC James S. P."
             * */

            var array = this.textToBeParsed.split(" - ");

            var self = this;

            $.each(array, function (index, string) {
                if (string.contains("Rated: ")) {
                    self.rated = this.replace(/Rated: /, "");
                }

                if (string.contains("Words: ")) {
                    self.words = this.replace(/Words: /, "");
                }

                if (string.contains("Updated: ")) {
                    self.updatedAt = this.replace(/Updated: /, "");;
                }

                if (string.contains("Published: ")) {
                    self.publishedAt = this.replace(/Published: /, "");;
                }
            });
        }
    }

    /**
     *
     *
     *  @type {{$form: null, $selectBoxes: null, config: {sortid: number, timeid: number, censorid: number, language: number, statusid: number}, setValuesForSelectboxes: Function, init: Function}}
     */

    var SearchBoxPrefiller = {
        $form: null,
        $selectBoxes: null,
        config: {
            sortid: 3,
            timeid: 0,
            censorid: 10,
            language: 1,
            statusid: 2
        },
        setValuesForSelectboxes: function() {
            var self = this;
            this.$selectBoxes.each(function(){
                if (self.config.hasOwnProperty(this.name)){
                    this.value = self.config[this.name];
                }
            });
        },
        $formExistsInDom: function(){
            return this.$form.length > 0;
        },
        $formWasSubmitted: function(){
            var $url = window.location.pathname;
            return $url.split('/').length > 5;
        },
        submitForm: function(){
            this.setValuesForSelectboxes();
            this.$form.find('button[type=button]').trigger('click');
        },
        init: function($form) {
            this.$form = $form;
            this.$selectBoxes = this.$form.find('select');

            if (!this.$formExistsInDom() || this.$formWasSubmitted()){
                return;
            }

            this.submitForm();
        }
    };

    var FullStoryLoader = {
        chapters: null,
        currentChapter: null,
        $appendToEl: null,
        maxChapter: null,
        isStoryPage: function(){
            return window.location.pathname.indexOf("fanfiction.net/s/") !== 0
        },
        getChapterAmount: function(){
            var $lastOption = $('#chap_select').find("option:last");
            var lastChapter = + $lastOption[0].value; // unary plus to cast to int

            return lastChapter;
        },
        getUrlForChapter: function(chapterNumber){
            var pathname = window.location.pathname;
            var arr = pathname.split('/');
            var lastThreeElements = arr.slice(Math.max(arr.length - 3, 1));

            var storyId = lastThreeElements[0].toString();
            this.currentChapter = lastThreeElements[1];
            var title = lastThreeElements[2].toString();

            var newChapterUrl =
                window.location.origin +
                    "/s/" + storyId +
                    "/" + chapterNumber.toString() +
                    "/" + title;

            return newChapterUrl;
        },
        bind: function(){
            var self = this;
            $document.on('loadChapter', function(event, chapterNumber, $el){
                var url = self.getUrlForChapter(chapterNumber);




                $.getCachedHTML(url, function(html) {

                    var content = $(html).find('#storytext').html();
                    $el.html(content);

                    var chapterContent = {};
                    chapterContent.createdAt = new Date();
                    chapterContent.content = content;

//                    chrome.storage.local.set({url: chapterContent}, function() {
//                        console.log('content saved', chapterContent);
//                    });


                });
            });
        },
        init: function() {
            if (!this.isStoryPage()){return};

            this.bind();
            this.$appendToEl = $('#storytext');
            this.$appendToEl.empty();

            for (var i = 1; i <= this.getChapterAmount(); i++) {
                var $div = $('<div>', {class: "prefilled-chapter chapter"+ i.toString()});
                this.$appendToEl.append($div);
                $document.trigger('loadChapter', [i, $div]);
            }
        }
    }

    $document.ready(function(){
        var $searchBox = $("#myform");
        SearchBoxPrefiller.init($searchBox);

        FullStoryLoader.init();

        /**
         * Set Standard Search Options
         * TODO: Press Go Button
         */
        $("div.z-padtop2").each(function(){
            Parser.init($(this).html());
        });

        /**
         * Remove Twitter infos
         */
        var $twitter = $("iframe#twitter-widget-0");
        $twitter.closest("table").hide();
    });
})(jQuery, document, chrome);
