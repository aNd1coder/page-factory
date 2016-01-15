module.exports = {
    domain: '***.com',
    imgholder: 'http://path/to/imgholder',
    doc: 'http://samgui.com/page-factory/',
    limit: 10,
    api: {
        authorize: {
            app: 'app',
            key: 'key',
            url: 'http://path/to/authorize/api'
        },
        upload: 'http://path/to/upload/api'
    },
    ssi: {
        ext: '.shtml',
        server: {
            dev: {
                host: '127.0.0.1',
                port: 22,
                username: "xxoo",
                password: "****",
                path: "/path/to/ssi/"
            },
            test: {
                host: '6.6.6.6',
                port: 22,
                username: "xxoo",
                password: "****",
                path: "/path/to/ssi/"
            },
            pre: {
                host: '6.6.6.6',
                port: 22,
                username: "xxoo",
                password: "****",
                path: "/path/to/ssi/"
            },
            prod: {
                host: '6.6.6.6',
                port: 22,
                username: "xxoo",
                password: "****",
                path: "/path/to/ssi/"
            },
            page: {
                host: '6.6.6.6',
                port: 22,
                username: "xxoo",
                password: "****",
                path: "/path/to/page/"
            }
        }
    }
};