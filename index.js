// IMPORTS
require('dotenv').config();

const express = require('express');
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');

// IMPORT ROUTES
const userRouter = require('./routers/user-router')
const posterRouter = require('./routers/poster-router')


// .USE
app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5174"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true
}));

// ROUTES
app.use('/auth', userRouter)
app.use('/poster', posterRouter)

// START SERVER
function startServer() {
    try {
        app.listen(process.env.PORT, () => { console.log(`Server is running on http://localhost:${process.env.PORT}`); })
    } catch (err) {
        console.error('Error while starting server: ', err);
    }
}
function mongoConnect() {
    mongoose.connect(process.env.MONGO_URL,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function () {
        console.log('connection')
    });
}

startServer()
mongoConnect()