//Imports necessary modules: express, body parser, cookie parser, mongoose, express session, and connect mongo. Also imports index.js from middleware folder.
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mid = require('./middleware');

//Creates an express app and assigns to constant app.
const app = express();

//Connects to mongo database named cards via Mongoose. Assigns this connection to constant db.
mongoose.connect('mongodb://localhost/flashcards');
const db = mongoose.connection;

//Sets up error handler if database can't be connected too.
db.on('error', console.error.bind(console, 'connection error: '));

//Creates sessions collection which is stored in Mongo database rather than default memory. (This prevents server from crashing if many users are logged in and use up all memory).
app.use(session({
    secret: 'Kayla Kremer',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

//Creates currentUser and currentName properties on response's locals and sets it to equal value of the request session's userId and name properties. This allows currentUser and currentName to be accessed from all routes.
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    res.locals.currentName = req.session.name;
    next();
});

//Sets up bodyParser to be used on all requests. This allows information to be retrieved from req.body, such as form data.
app.use(bodyParser.urlencoded({extended: false}));

//Sets up cookieParser to be used on all requests. This allows information to be retrived from req.cookies.
app.use(cookieParser());

//If you want to load static files, add this line and create a folder named 'public' to store all static files in:
//app.use('/static',express.static('public'));

//Sets view engine to pug so all pug template files can be rendered.
app.set('view engine', 'pug');

//Imports index.js and cards.js from routes folder and assigns them to constants mainRoutes and cardRoutes, respectively. (mainRoutes doesn't need to refer to full path of ./routes/index in order to require it since Node loads files named index by default).
const mainRoutes = require('./routes'); 
const cardRoutes = require('./routes/cards');

//Sets up mainRoutes to be used in all requests.
app.use(mainRoutes);

//Sets up cardRoutes to be used in all requests with the /cards route. Also uses custom requiresLogin middleware, which prevents access to any /cards route if user is not logged in (aka there is no session data).
app.use('/cards', mid.requiresLogin, cardRoutes);

//Creates an error if request route to server cannot be found, then passes error onto error handler.
app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

//Error handler for all errors in app. Assigns error property on response's locals to err parameter. Also sets response status to err's status. Finally, renders out error.pug template with err's message and status info.
app.use((err, req, res, next) => {
    res.locals.error = err; 
    res.status(err.status);
    res.render('error');
});

//Sets up the app to run on port 3000. Also logs out a message to the console to verify that the app is running.
app.listen(3000, () => {
    console.log('The app is running');
});