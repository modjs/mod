var util = {};
util.toArray = function(list) {
    return Array.prototype.slice.call(list || [], 0);
};

// Cross-browser impl to get document's height.
util.getDocHeight = function() {
    var d = document;
    return Math.max(
        Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
        Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
        Math.max(d.body.clientHeight, d.documentElement.clientHeight)
    );
};
