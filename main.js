(function ($, _, document, chrome) {
    "use strict";

    var $document = $(document);

    var storyTextId = '#storytext';

    $.extend({
        loadCachedChapterContent: function (storyLoader, chapterNumber, url, returnChapterContentCallback) {
            var cacheTimeInMs = 1209600000; // two weeks
            var currentTimeInMs = new Date().getTime();

            var cache = {
                title: storyLoader.title,
                url: url,
                chapterNumber: chapterNumber,
                timestamp: new Date().getTime(),
                data: null,
                chapter: null,
                extractChapterFromContent: function () {
                    this.chapter = $(this.data).find(storyTextId).html();
                }
            };

            var getChapterContentByGetRequest = function () {
                console.log('use uncached getRequest');

                /**
                 * TODO: Defer get requests to minimize server load
                 */

                $.get(url, function (data) {
                    cache.data = data;
                    cache.extractChapterFromContent();

                    var persist = {};
                    persist[url] = cache;
                    chrome.storage.local.set(persist);
                    returnChapterContentCallback(cache.chapter);
                }, 'html');
            };

            chrome.storage.local.get(url, function (cachedUrl) {
                if (Object.keys(cachedUrl).length === 0) {
                    getChapterContentByGetRequest();
                    return;
                }

                var validCache = (currentTimeInMs - cachedUrl[url].timestamp) < cacheTimeInMs;

                if (!validCache) {
                    console.log('cache invalid');
                    getChapterContentByGetRequest();
                    return;
                }

                console.log('cache is valid');
                console.log(cachedUrl[url].chapter);
                returnChapterContentCallback(cachedUrl[url].chapter);
                return;
            });
        }
    });

    /**
     * @param substring
     * @returns {boolean}
     */

    String.prototype.contains = function (substring) {
        return (this.indexOf(substring) !== -1);
    };

    /**
     * Parses fanfic description.
     * Aim is to update last updated time into something more human readable and warn for possible abandoned fics.
     */

    var Parser = {
        today: null,
        $ficInfo: null,
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
        init: function ($ficInfo) {
            /**
             * TODO: Implement me
             */

            this.$ficInfo = $ficInfo;
            this.today = new Date.getTime();
            this.textToBeParsed = $ficInfo.html();
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
                    self.updatedAt = this.replace(/Updated: /, "");
                }

                if (string.contains("Published: ")) {
                    self.publishedAt = this.replace(/Published: /, "");
                }
            });
        }
    };

    var SearchBoxPrefi  ller = {
        $form: null,
        $selectBoxes: null,
        config: {
            sortId: 3,
            timeId: 0,
            censorId: 10,
            language: 1,
            statusId: 2
        },
        setValuesForSelectboxes: function () {
            var self = this;
            this.$selectBoxes.each(function () {
                if (self.config.hasOwnProperty(this.name)) {
                    this.value = self.config[this.name];
                }
            });
        },
        $formExistsInDom: function () {
            return this.$form.length > 0;
        },
        $wasFormAlreadySubmittedAssumption: function () {
            var $url = window.location.pathname;
            return $url.split('/').length > 5;
        },
        submitForm: function () {
            this.setValuesForSelectboxes();
            this.$form.find('button[type=button]').trigger('click');
        },
        init: function ($form) {
            this.$form = $form;
            this.$selectBoxes = this.$form.find('select');

            if (!this.$formExistsInDom() || this.$wasFormAlreadySubmittedAssumption()) {
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
        storyId: null,
        title: null,
        isStoryPage: function () {
            return window.location.pathname.indexOf("fanfiction.net/s/") !== 0;
        },
        getChapterAmount: function () {
            var $lastOption = $('#chap_select').find("option:last");

            var lastChapter;

            try {
                lastChapter = +$lastOption[0].value || 1; // unary plus to cast to int
            } catch (e) {
                lastChapter = 1;
            }

            return lastChapter;
        },
        parseUrl: function () {
            var pathname = window.location.pathname;
            var arr = pathname.split('/');
            var lastThreeElements = arr.slice(Math.max(arr.length - 3, 1));

            this.storyId = lastThreeElements[0].toString();
            this.currentChapter = lastThreeElements[1];
            this.title = lastThreeElements[2].toString();
            this.title = this.title.replace(/-/, "");
        },
        getUrlForChapter: function (chapterNumber) {
            return window.location.origin +
                "/s/" + this.storyId +
                "/" + chapterNumber.toString() +
                "/" + this.title;
        },
        bind: function () {
            var self = this;
            $document.on('loadChapter', function (event, chapterNumber, $el) {
                var url = self.getUrlForChapter(chapterNumber);
                $.loadCachedChapterContent(this, chapterNumber, url, function (chapterText) {
                    $el.html(chapterText);
                });
            });
        },
        init: function () {
            if (!this.isStoryPage()) {
                return;
            }
            this.parseUrl();
            this.bind();
            this.$appendToEl = $(storyTextId);
            this.$appendToEl.empty();

            for (var i = 1; i <= this.getChapterAmount(); i++) {
                var $div = $('<div>', {class: "prefilled-chapter chapter" + i.toString()});
                this.$appendToEl.append($div);
                $document.trigger('loadChapter', [i, $div]);
            }
        }
    };

    $document.ready(function () {
        var $searchBox = $("#myform");
        SearchBoxPrefiller.init($searchBox);
        FullStoryLoader.init();

        $("div.z-padtop2").each(function () {
            Parser.init($(this));
        });

        /**
         * Remove Twitter infos
         */
        var $twitter = $("iframe#twitter-widget-0");
        $twitter.closest("table").hide();
    });
})(jQuery, _, document, chrome);
