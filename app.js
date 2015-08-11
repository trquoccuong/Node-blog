var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var session = require("express-session");
var expressValidator = require('express-validator');
var sequelize = require('sequelize');
var nunjucks = require('nunjucks');
var Sequelize = require('sequelize');
var flash = require('connect-flash');
var methodOverride = require('method-override');
var pagination = require('./custom_filter/pagination');
var passport = require('passport');
var config = require('./config');


global.db = new Sequelize(config.db.database, config.db.username, config.db.password, config.db);

db['user'] = db.import(__dirname + '/models/user.js');
db['post'] = db.import(__dirname + '/models/post.js');

db['post'].belongsTo(db['user'],{foreignKey : "author"});

var app = express();

// view engine setup
var env = nunjucks.configure('views', {
    autoescape: true,
    express: app
})
env.addFilter('pagination', pagination);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(methodOverride(('_method')));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: "techmaster",
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

require('./passport')(passport);

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());
app.use(function (req, res, next) {
    res.locals.messages = req.session.flash;
    delete req.session.flash;
    next();
})

app.use('/', routes);
app.route('/users/login')
    .get(function (req, res) {
        res.render('login.html');
    })
    .post(passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: 'Invalid username and password'
    }), function (req, res) {
        console.log('Authentication successful');
        req.flash('success', 'You are logged in');
        res.redirect('/users/posts')
    })
app.use('/users', checkAuthenticated, users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = app;
