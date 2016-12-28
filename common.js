String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

/*

//cache requests
$.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    if (options.cache) {
        var success = originalOptions.success || $.noop,
            url = originalOptions.url;
        var hash = (url + JSON.stringify(originalOptions.data)).hashCode();

        options.cache = false; //remove jQuery cache as we have our own localStorage

        options.beforeSend = function (jqXHR, options) {
            var data = localStorage.getItem(hash);

            if (data) {
                if (originalOptions.dataType == 'json') {
                    data = JSON.parse(data);
                }
                setTimeout(function(){success(data);}, Math.round(Math.random() * 100));
                setTimeout(function(){jqXHR.success(data);}, Math.round(Math.random() * 100));
                return false;
            }
            return true;
        };
        options.success = function (data, textStatus) {
            if (originalOptions.dataType == 'json') {
                try {
                    localStorage.setItem(hash, JSON.stringify(data));
                } catch (e) {
                    //NS_ERROR_DOM_QUOTA_REACHED: Persistent storage maximum size reached
                }
            } else {
                try {
                    localStorage.setItem(hash, data);
                } catch (e) {
                    //NS_ERROR_DOM_QUOTA_REACHED: Persistent storage maximum size reached
                }
            }

            if ($.isFunction(success)) success(data); //call back to original ajax call
        };
    }
});

*/