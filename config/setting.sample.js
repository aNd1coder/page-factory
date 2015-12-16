module.exports = {
    ssiServer: {
        dev: {
            host: '127.0.0.1',
            port: 22,
            username: "xxoo",
            password: "****",
            path: "/path/to/dev/ssi/"
        },
        test: {
            host: '6.6.6.6',
            port: 22,
            username: "xxoo",
            password: "****",
            path: "/path/to/test/ssi/"
        },
        pre: {
            host: '6.6.6.6',
            port: 22,
            username: "xxoo",
            password: "****",
            path: "/path/to/pre/ssi/"
        },
        prod: {
            host: '6.6.6.6',
            port: 22,
            username: "xxoo",
            password: "****",
            path: "/path/to/prod/ssi/"
        }
    }
};