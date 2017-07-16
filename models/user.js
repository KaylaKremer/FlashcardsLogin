//Imports Mongoose and bcrypt modules.
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//Sets up schema for new registered user, which consists of username and password.
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    }
});

//Creates custom authenticate method which checks to see if user exists in the database. First looks up username and if it exists, compares encrypted password with one stored in the database. If they match, then user is able to login.
UserSchema.statics.authenticate = function(username, password, callback){
    User.findOne({username: username})
    .exec(function(error, user){
        if (error || !user){
            return callback(error);
        } 
        bcrypt.compare(password, user.password, function(error, result){
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        });
    });
}

//Hashes the entered password with a pre-hook save before added to database.
UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        } 
        user.password = hash;
        next();
    });
});

//Creates model, storing it in constant named User, then exports as a module to be used in app.js.
const User = mongoose.model('User', UserSchema);
module.exports = User;