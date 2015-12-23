var _ = require('lodash');
var helper = require('../helper');
var moment = require('moment');
var setting = require('../config/setting');
var express = require('express');
var router = express.Router();
var TemplateModel = require('../models/template');
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
    TemplateModel.find({}, function (err, templates) {
        if (err) {
            console.log(err);
        }

        res.locals.TEMPLATE = templates;
        res.render('page/new', {title: '新增页面'});
    });
});

router.get('/edit/:id', function (req, res) {
    PageModel.findOne({_id: req.params.id}, function (err, pages) {
        if (err) {
            console.log(err);
        }

        TemplateModel.find({}, function (err, templates) {
            if (err) {
                console.log(err);
            }

            res.locals.TEMPLATE = templates;
            res.render('page/edit', {title: '编辑页面', model: pages});
        });
    });
});

router.post('/save', function (req, res) {
    var model = _.extend({}, req.body, req.params, req.query),
        id = model._id, date, query = {author: '(=^.^=)'},
        published = model.published == 1 ? 1 : 0, dir, filename, path;

    console.log(model);
    delete  model._id;

    model.title = (model.title || '').trim();
    model.content = (model.content || '').trim();
    model.style = (model.style || '').trim();
    model.script = (model.script || '').trim();

    if (id) {
        query = {_id: id};
        date = new Date(model.createdAt);
        date = moment(date).format('YYYYMM');
    } else {
        model.createAt = Date.now();
        date = moment().format('YYYYMM');
    }

    dir = model.project + '/html/' + date + '/';
    filename = model.filename.trim() + setting.ssi.ext;
    path = dir + filename;

    model.author = req.session.user.username;
    model.path = path;
    model.environment = model.environment || 'dev';

    if (model.module) {
        model.module = JSON.parse(model.module);
    } else {
        delete  model.module;
    }

    model.published = published;
    model.updatedAt = Date.now();

    TemplateModel.findOne({_id: model.template}, function (err, template) {
        if (err) {
            console.log(err);
        } else {
            PageModel.update(query, model, {upsert: true}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    if (published) {
                        // merge template & page content
                        model.content = template.content
                            .replace(/{{title}}/gim, model.title)
                            .replace(/{{content}}/gim, model.content)
                            .replace(/{{style}}/gim, model.style)
                            .replace(/{{script}}/gim, model.script);

                        helper.sftp(model, dir, filename, function () {
                            res.redirect('/page/');
                        });
                    } else {
                        res.redirect('/page/');
                    }
                }
            });
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