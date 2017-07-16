//Sets up index routes by importing express and creating a router object with the Router() method.
const express = require('express');
const router = express.Router();

//Imports user.js from the models folder and assigns it to User constant.
const User = require('../models/user');

//Imports index.js from middleware folder and assigns it to mid constant.
const mid = require('../middleware');

//Sets up a GET request route for mainRoutes in app.js.
router.get('/', (req, res, next) => {

//If there is no session with a userId property, then creates an error messages with status 403 and passes to the error handler in app.js.
    if (!req.session.userId) {
        const err = new Error('You are not authorized to view this page.');
        err.status = 403;
        return next(err);
    }

//Uses findById() method with the userId value stored in the request session to find the user in the flashcards database.
//If user can't be found, passes error to the error handler in app.js. Otherwise, redirects to the /cards route since user is found and verified to be logged in.
    User.findById(req.session.userId)
        .exec(function(error, user) {
            if (error){
                return next(error);
            } else {
                return res.redirect('/cards');
            }
        });
    });

//Sets up a GET request route for /signup. Runs the alreadyLoggedIn middleware function to check if user is already logged in or not. If user is logged in, then user shouldn't have access to the signup route anymore, so redirects to /cards. Otherwise, renders signup.pug template.
router.get('/signup', mid.alreadyLoggedIn, (req, res, next) => {
        return res.render('signup');
});

//Sets up a POST request route for /signup.
router.post('/signup', (req, res, next) => {
  
//If user has entered a username, password, and confirmed the password (both password and re-entered password match), then it creates a userData object with the properties username and password assigned to what the user entered into the form. Otherwise, creates an appropriate error message and sends to the error handler in app.js.
    if (req.body.username && req.body.password && req.body.confirm) {
        if (req.body.password !== req.body.confirm){
            const err = new Error('Passwords do not match');
            err.status = 400;
            return next(err);
        }
        const userData = {
            username: req.body.username,
            password: req.body.password
        };

//Creates new document with data in userData and User model from user.js, then adds to the flashcards database. If error occurs, sends to error handler in app.js. Otherwiwse, creates session with property of userId and assigns it to the user's _id in the database. This session is created in order to keep track of the user being logged in as they navigate to other pages. Finally, it redirects to /.
        User.create(userData, (error, user) =>{
            if (error){
                return next(error);
            } else {
                req.session.userId = user._id;
                req.session.name = user.username;
                return res.redirect('/');
            }
        });
    
    } else {
        const err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
});

//Sets up a GET request route for /login. Runs the alreadyLoggedIn middleware function to check if user is already logged in or not. If user is logged in, then user shouldn't have access to the login route anymore and are redirected to /cards. Otherwise, renders signup.pug template.
router.get('/login', mid.alreadyLoggedIn, (req, res, next) => {
    return res.render('login');
});

//Sets up a POST request route for /login. If user enters both username and password into form, then authenticate method from user.js runs to see if a user can be found in the database with supplied form info. If username or password isn't entered or if a user cannot be found in the database, creates an error and sends it to the error handler in app.js. Otherwise, creates a session with userID property and sets it to the value of the user's _id in the database. (This session is created in order to keep track of the user being logged in as they navigate to other pages). Finally, redirects to /.
router.post('/login', (req, res, next) => {
    if (req.body.username && req.body.password){
        User.authenticate(req.body.username, req.body.password, function(error, user){
            if (error || !user){
                const err = new Error('User not found: Wrong username or password');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                 req.session.name = user.username;
                return res.redirect('/');
            }
        });
    } else {
        const err = new Error('Username and password required');
        err.status = 401;
        next(err);
    }
});

//Sets up a GET request route for /logout. Runs the alreadyLoggedIn middleware function to check if user is already logged in or not. If session exists, destroys the session and renders logout.pug template with parameters of currentUser and currentName set to false. (This makes the signup/login options display again as well as removes the user's welcome message). Otherwise, creates an error and sends it to the error handler in app.js.
router.get('/logout', mid.requiresLogin, (req, res, next) => { 
  if (req.session){ 
      req.session.destroy(err => {
        if (err){
            return next(err);
        } else {
            return res.render('logout', {currentUser: false, currentName: false});
        }
      });
  }
});

//Export this router so it can be used in app.js.
module.exports = router;