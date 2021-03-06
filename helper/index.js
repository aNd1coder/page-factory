var fs = require('fs');
var Client = require('ssh2').Client;
var setting = require('../config/setting');

module.exports = {
    paging: function (url, page, total, limit) {
        var count, prev, next, p;
        count = Math.ceil(total / limit);
        prev = page <= 1 ? false : page - 1;
        next = page >= count ? false : page + 1;
        url = url.replace(/[?|&]page=\d+/, '');
        p = (url.indexOf('?') != -1 ? '&' : '?') + 'page=';
        prev = prev ? url + p + prev : false;
        next = next ? url + p + next : false;

        return {prev: prev, next: next};
    },
    sftp: function (model, dir, filename, callback) {
        var server, client;

        server = setting.ssi.server[model.environment];
        dir = server.path + dir;

        // 开发环境
        if (model.environment == 'dev') {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            fs.writeFile(dir + filename, model.content, 'utf8', function (err) {
                if (err) {
                    console.log(err);
                }

                callback && callback();
            });
        } else {
            // 建立远程sftp连接
            client = new Client();
            client.on('ready', function () {
                client.sftp(function (err, sftp) {
                    if (err) {
                        console.log(err);
                    }

                    sftp.exists(dir, function (exists) {
                        if (!exists) {
                            sftp.mkdir(dir, function () {
                                sftp.writeFile(dir + filename, model.content, 'utf8', function (err) {
                                    if (err) {
                                        console.log(err);
                                    }

                                    client.end();

                                    callback && callback();
                                });
                            });
                        } else {
                            sftp.writeFile(dir + filename, model.content, 'utf8', function (err) {
                                if (err) {
                                    console.log(err);
                                }

                                client.end();

                                callback && callback();
                            });
                        }
                    });
                });
            }).connect({
                host: server.host,
                port: server.port,
                username: server.username,
                password: server.password
            });
        }
    }
};