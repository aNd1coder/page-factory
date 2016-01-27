var mongo = require('../config/mongo');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var templateSchema = new Schema({
    title: String,
    project: String,
    path: String,
    filename: String,
    author: String,
    content: String,
    environment: String,
    published: Number,
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date, default: Date.now}
});

var Template = mongo.model('Template', templateSchema);

module.exports = Template;