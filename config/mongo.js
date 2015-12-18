var util = require('util');
var mongoose = require('mongoose');
var env = process.env.NODE_ENV || 'development';
var config = require('./database')[env].mongo;
var mongoagent = mongoose.createConnection(util.format(
    'mongodb://%s:%s@%s:%s/%s',
    config.username, config.password, config.host, config.port, config.db.pageFactory
), {
    server: {
        poolSize: 4
    }
});

mongoagent.on('error', function (error) {
    console.error('mongo db error %j', error);
});

module.exports = mongoagent;