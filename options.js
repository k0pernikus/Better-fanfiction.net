(function (document, storage, $) {
    "use strict";
    // Save this script as `options.js`


    var PrefillerConfig = {
        sortid: 3,
        timeid: 0,
        censorid: 10,
        language: 1,
        statusid: 2
    };

    function save_options() {
        var colors;
        var select = document.getElementById("bg_color");
        var bg_color = select.children[select.selectedIndex].value;
        colors = {bg_color: bg_color};

        storage.sync.set(colors);
        storage.sync.set(PrefillerConfig);

        var status = document.getElementById("status");
        status.innerHTML = "Options Saved.";
        setTimeout(function () {
            status.innerHTML = "";
        }, 750);
    }

    function restore_options() {
        console.log('wtf');

        storage.sync.get("colors", function (colors) {
            console.log(colors);

            if (!colors) {
                return;
            }
            var select = document.getElementById("bg_color");
            for (var i = 0; i < select.children.length; i++) {
                var child = select.children[i];
                if (child.value == colors.bg_color) {
                    child.selected = "true";
                    break;
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', restore_options);
    document.querySelector('#save').addEventListener('click', save_options);
})(document, chrome.storage, jQuery);

(function($, chrome){
    "use strict";

    chrome.storage.local.get(function(urls){
        console.log(urls);
    });
})(jQuery, chrome);
