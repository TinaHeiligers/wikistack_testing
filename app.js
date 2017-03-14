//starts review with calling this index.js
//
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');
var path = require('path');

module.exports = app;

//using nunjucks for rendering views: boilerplate
//review uses swig
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
var env = nunjucks.configure('views', { noCache: true });
require('./filters')(env);

//plug-in that basically tells nunjucks it’s OK to render the html in a string
//there’s a built-in nunjucks filter that indicates this as well, but this is another option, giving you a tag so you can indicate a bunch of stuff that’s safe to render
var AutoEscapeExtension = require("nunjucks-autoescape")(nunjucks);
env.addExtension('AutoEscapeExtension', new AutoEscapeExtension(env));

app.use(morgan('dev')); //logging middleware

//serving up static files (e.g. css files)
app.use(express.static(path.join(__dirname, './public')));

//middleware for parsing body from requests for POST and PUT
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/wiki', require('./routes/wiki'));
app.use('/users', require('./routes/users'));

app.get('/', function (req, res) {
   res.render('index');
});

//error handling middleware - MUST have all 4 parameters
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || "Internal Error");
});
