// db 访问配置
module.exports = {
    development: {
        mongo: {
            host: '127.0.0.1',
            username: 'root',
            password: '123456',
            port: '27017',
            database: {
                pageFactory: 'page_factory'
            }
        }
    }
};