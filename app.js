var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var app = express();
var mongo = require('./config/database')[app.get('env')].mongo;
var _ = require('lodash');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session({
    secret: 'page_factory',
    // 每次请求都刷新cookie过期时间
    resave: true,
    // 无论有没有session cookie，每次请求都设置个session cookie ，默认给个标示为 connect.sid
    saveUninitialized: false,
    cookie: {
        secure: false, // https
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 days
    },
    store: new MongoStore({
        db: mongo.db.pageFactory,
        host: mongo.host,
        username: mongo.username,
        password: mongo.password
    })
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    var url = req.originalUrl, segments = url.split('?')[0].split('/'), user, isSuperAdmin;

    res.locals.query = req.query;
    res.locals.controllerName = segments[1];
    res.locals.actionName = segments[2] || 'index';

    if (url != '/' && url.indexOf("/authorize") == -1 && !req.session.user) {
        return res.redirect("/authorize?next=" + encodeURIComponent(url));
    } else {
        user = req.session.user;
        isSuperAdmin = user && user.roles.indexOf(1) == 0;
        user = _.extend(user, {isSuperAdmin: isSuperAdmin});
        res.locals.user = user;
    }

    next();
});

// routes
require('./routes')(app);

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

// locals
app.locals.moment = require('moment');
app.locals.setting = require('./config/setting');

app.locals.ENVIRONMENT = {
    dev: '开发环境',
    test: '测试环境25',
    pre: '预发布环境153',
    prod: '正式环境48'
};

app.locals.PROJECT = {
    act: '活动',
    www: '主站',
    m: 'H5'
};

app.locals.FILETYPE = {
    html: 'HTML',
    css: 'CSS',
    js: 'JS'
};

app.locals.MODULETYPE = {
    bundle: '商品包',
    hota: '热点图',
    banner: '通栏图',
    text: '文字块',
    slider: '轮播图'
};

app.locals.MODULETHEME = {
    '1': '橙色小太阳',
    '2': '粉色大矩形'
};

module.exports = app;
