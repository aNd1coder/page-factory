var _ = require('lodash');
var helper = require('../helper');
var moment = require('moment');
var express = require('express');
var router = express.Router();
var PageModel = require('../models/page');

router.get('/', function (req, res) {
    var model, query = {}, page = parseInt(req.query.page) || 1, limit = 20;

    delete  req.query.page;

    for (var q in req.query) {
        if (req.query[q]) {
            query[q] = new RegExp(req.query[q]);
        }
    }

    PageModel.count(query, function (err, total) {
        if (err) {
            console.log(err);
        }

        PageModel.find(query, null,
            {limit: limit, skip: page - 1, sort: {updatedAt: -1}},
            function (err, data) {
                if (err) {
                    console.log(err);
                }

                var paging = helper.paging(req.originalUrl, page, total, limit);

                model = {
                    prev: paging.prev,
                    next: paging.next,
                    data: data
                };

                _.extend(model, req.query);

                res.render('page/index', {title: '页面列表', model: model});
            });
    });
});

router.get('/new', function (req, res) {
    res.render('page/new', {title: '新增页面'});
});

router.get('/edit/:id', function (req, res) {
    PageModel.findOne({_id: req.params.id}, function (err, model) {
        if (err) {
            console.log(err);
        }

        res.render('page/edit', {title: '编辑页面', model: model});
    });
});

router.post('/save', function (req, res) {
    var model = _.extend({}, req.body, req.params, req.query),
        id = model._id, date, query = {author: '(-^.^-)'},
        published = model.published == 1 ? 1 : 0, dir, filename, path;

    delete  model._id;

    if (id) {
        query = {_id: id};
        date = new Date(model.createdAt);
        date = moment(date).format('YYYYMM');
    } else {
        model.createAt = Date.now();
        date = moment().format('YYYYMM');
    }

    dir = model.project + '/html/' + date + '/';
    filename = model.filename + '.shtml';
    path = dir + filename;

    model.author = req.session.user.username;
    model.path = path;
    model.environment = model.environment || 'dev';
    model.published = published;
    model.updatedAt = Date.now();

    PageModel.update(query, model, {upsert: true}, function (err) {
        if (err) {
            console.log(err);
        } else {
            if (published) {
                helper.sftp(model, dir, filename, function () {
                    res.redirect('/page/');
                });
            } else {
                res.redirect('/page/');
            }
        }
    });
});

router.delete('/delete/:id', function (req, res) {
    PageModel.remove({_id: req.params.id}, function (err) {
        if (err) {
            res.json({code: 1, message: err});
        } else {
            res.json({code: 0});
        }
    })
});

module.exports = router;