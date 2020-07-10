process.on('uncaughtException', err => {
    console.log(err.message);
    console.log('UNCAUGHT REJECTION :( Shutting down.');
    process.exit(1);
});

const mongoose = require('mongoose');

const dotEnv = require('dotenv');
dotEnv.config({ path: './config.env' });
const DB = process.env.DATABASE_CONNECT_JS.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const port = process.env.PORT || 3000;
const app = require('./app');

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
    }).then(con => {
        console.log('DB Connection Successful!');
    });

const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log(err);
    console.log('UNHANDLED REJECTION :( Shutting down.');
    server.close(() => {
        process.exit(1);
    });
});
