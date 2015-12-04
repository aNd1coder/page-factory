var mongoagent = require('../config/mongo');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pageSchema = new Schema({
    title: String,
    project: String,
    path: String,
    filename: String,
    template: {
        type: Schema.ObjectId,
        ref: 'Template'
    },
    module: {
        type: Schema.ObjectId,
        ref: 'Module'
    },
    author: String,
    content: String,
    environment: String,
    published: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

var Page = mongoagent.model('Page', pageSchema);

module.exports = Page;