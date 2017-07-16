//Custom middleware which prevents a logged in user from accessing the sign up or log in pages again.
function alreadyLoggedIn (req, res, next){
    if (req.session && req.session.userId) {
        return res.redirect('/cards');
    }
    return next();
}

//Custom middleware which checks session data holding the user's id. If no session data exists, then there is no logged in user and access to pages requiring login is restricted.
function requiresLogin (req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        const err = new Error('You must be logged in to view this page.');
        err.status = 401;
        return next(err);
    }
}

module.exports.alreadyLoggedIn = alreadyLoggedIn;
module.exports.requiresLogin = requiresLogin;
