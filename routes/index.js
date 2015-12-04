module.exports = function (app) {
    app.use('/module', require('./module'));
    app.use('/template', require('./template'));
    app.use('/page', require('./page'));
};