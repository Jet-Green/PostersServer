// IMPORTS
require('dotenv').config();
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const express = require('express');
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
var bodyParser = require('body-parser');

// IMPORT ROUTES
const userRouter = require('./routers/user-router')
const posterRouter = require('./routers/poster-router')
const eventLocationRouter = require('./routers/event-location-router')
const appStateRouter = require('./routers/app-state-router')
const priceRouter = require('./routers/price-router')
// const errorFilter = require('./exception/errorFilter');
// .USE

mongoose.set('strictQuery', true);
app.use(cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3001"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({
    extended: true
}));

// app.use(errorFilter)

// ROUTES
app.use('/auth', userRouter)
app.use('/poster', posterRouter)
app.use('/event-location', eventLocationRouter)
app.use('/app-state', appStateRouter)
app.use('/price', priceRouter )

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