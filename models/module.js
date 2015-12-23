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
    template: String, // 模版代码
    templateData: Schema.Types.Mixed, // 模版数据
    environment: String, // 环境
    published: Number, //0:草稿,1:已发布
    createdAt: {type: Date, default: Date.now}, // 创建时间
    updatedAt: {type: Date, default: Date.now} // 更新时间
});

var Module = mongoagent.model('Module', moduleSchema);

module.exports = Module;