const winston=require('winston')

const {MongoDB}=require('winston-mongodb')

module.exports = {
    winstonLogger: winston.createLogger({
        transports:[
            new winston.transports.Console(),
            new winston.transports.MongoDB({
                db:process.env.mongoURL,
                options: {useUnifiedTopology: true},
                collection:'errors',
                level: "error",
            }),
        ],
    }),
};