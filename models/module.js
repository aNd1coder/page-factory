var mongoagent = require('../config/mongo');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moduleSchema = new Schema({
    title: String, // 标题
    project: String, // 项目
    filetype: String, // 类型
    path: String, // 路径
    filename: String, // 文件名
    author: String, // 作者
    content: String, // 内容
    environment: String, // 环境
    published: Number, //0:草稿,1:已发布
    createdAt: { // 创建时间
        type: Date,
        default: Date.now
    },
    updatedAt: { // 更新时间
        type: Date,
        default: Date.now
    }
});

var Module = mongoagent.model('Module', moduleSchema);

module.exports = Module;