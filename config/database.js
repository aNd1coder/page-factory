module.exports = {
    development: {
        mongo: {
            host: '127.0.0.1',
            username: 'root',
            password: '123456',
            port: '27017',
            db: {
                pageFactory: 'page_factory'
            }
        }
    },
    production: {
        mongo: {
            host: '6.6.6.6',
            username: 'xxoo',
            password: '****',
            port: '27017',
            db: {
                pageFactory: 'page_factory'
            }
        }
    }
};