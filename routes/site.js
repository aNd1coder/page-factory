var express = require('express');
var router = express.Router();
var setting = require('../config/setting');
var multipart = require('connect-multiparty');
var request = require('superagent');

require('superagent-proxy')(request);

router.get('/', function (req, res) {
    res.render('index', {title: 'Page Factory'});
});

router.get('/authorize', function (req, res) {
    res.render('authorize', {title: '登录'});
});

router.get('/logout', function (req, res) {
    req.session.user = null;
    res.redirect('/authorize');
});

router.post('/authorize', function (req, res) {
    var params, errors, message = [], authorize;

    req.assert('username', "用户名不能为空").notEmpty();
    req.assert('password', "密码不能为空").notEmpty();

    errors = req.validationErrors();

    if (errors && errors.length > 0) {
        for (var i = 0; i < errors.length; i++) {
            message.push(errors[i].msg);
        }

        res.json({code: 1, message: message});
    } else {
        params = JSON.stringify({param: req.body});
        authorize = setting.api.authorize;

        request
            .post(authorize.url)
            //.proxy('http://127.0.0.1:8888')
            .auth(authorize.app, authorize.key)
            .set('Content-Type', 'application/json')
            .send(params)
            .end(function (err, rsp) {
                var result = rsp.body;

                if (err) {
                    res.json({code: 2, message: err.message});
                } else {
                    if (result.code == 0) {
                        req.session.user = result.data;
                    }

                    res.json(result);
                }
            });
    }
});

router.get('/upload', function (req, res) {
    res.render('upload', {title: '图片上传'});
});

router.post('/upload', multipart(), function (req, res) {
    var data;

    if (req.files) {
        data = req.files.Filedata.path;
    } else if (req.body.imageData) {
        data = req.body.imageData;
        data = data.replace(/^data:image\/\w+;base64,/, '');
        data = new Buffer(data, 'base64');
    }

    if (data) {
        request
            .post(setting.api.upload)
            .proxy('http://127.0.0.1:8888')
            .set('Content-Type', 'application/json')
            .attach('file', data)
            .end(function (err, rsp) {
                console.log(rsp);
                var result = JSON.parse(rsp.text);
                res.json(result);
            });
    } else {
        res.json({code: 1, message: '上传文件失败'});
    }
});

router.get('/hota', function (req, res) {
    res.render('hota', {title: '热点图', src: req.query.src});
});

module.exports = router;