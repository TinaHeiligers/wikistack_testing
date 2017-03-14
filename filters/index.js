module.exports = function (env) {

    var pageLink = function (page) {
        return '<a href="' + page.route + '">' + page.title + '</a>';
    };

    pageLink.safe = true;

    env.addFilter('pageLink', pageLink);

};