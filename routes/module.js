var _ = require('lodash');
var helper = require('../helper');
var moment = require('moment');
var express = require('express');
var router = express.Router();
var moduleName = __filename.split('/').pop().replace('.js', '');
var ModuleModel = require('../models/' + moduleName);

router.get('/', function (req, res) {
    var model, query = {}, limit = 20, paging, url = req.originalUrl,
        sort = req.query.sort || '-updatedAt', page = parseInt(req.query.page) || 1;

    delete  req.query.page;
    delete  req.query.sort;

    for (var q in req.query) {
        if (req.query[q]) {
            query[q] = new RegExp(req.query[q]);
        }
    }

    ModuleModel.count(query, function (err, total) {
        if (err) {
            console.log(err);
        }

        ModuleModel.find(query, null,
            {limit: limit, skip: page - 1, sort: sort},
            function (err, data) {
                if (err) {
                    console.log(err);
                }

                paging = helper.paging(url, page, total, limit);

                model = {
                    sort: sort,
                    prev: paging.prev,
                    next: paging.next,
                    data: data
                };

                _.extend(model, req.query);

                res.render(moduleName + '/index', {title: '模块列表', page: moduleName, model: model});
            });
    });
});

router.get('/new', function (req, res) {
    res.render(moduleName + '/new', {title: '新增模块', page: moduleName});
});

router.get('/edit/:id', function (req, res) {
    ModuleModel.findOne({_id: req.params.id}, function (err, model) {
        if (err) {
            console.log(err);
        }

        res.render(moduleName + '/edit', {title: '编辑模块', page: moduleName, model: model});
    });
});

router.post('/save', function (req, res) {
    var model = _.extend({}, req.body, req.params, req.query),
        id = model._id, date, query = {author: '^.^'},
        published = model.published == 1 ? 1 : 0, dir, filename, path;

    delete  model._id;

    if (id) { // 更新
        query = {_id: id};
        date = new Date(model.createdAt);
        date = moment(date).format('YYYYMM');
    } else {
        model.createAt = Date.now();
        date = moment().format('YYYYMM');
    }

    dir = model.project + '/' + model.filetype + '/' + date + '/';
    filename = model.filename + '.shtml';
    path = dir + filename;

    model.author = 'samgui';//TODO session
    model.path = path;
    model.environment = model.environment || 'test';
    model.published = published;
    model.updatedAt = Date.now();

    ModuleModel.update(query, model, {upsert: true}, function (err) {
        if (err) {
            console.log(err);
        } else {
            if (published) {
                helper.sftp(model, dir, filename, function () {
                    res.redirect('/' + moduleName + '/');
                });
            } else {
                res.redirect('/' + moduleName + '/');
            }
        }
    });
});

router.delete('/delete/:id', function (req, res) {
    ModuleModel.remove({_id: req.params.id}, function (err) {
        if (err) {
            res.json({code: 1, message: err});
        } else {
            res.json({code: 0});
        }
    })
});

module.exports = router;