//Sets up cards routes by importing express and creating a router object with the Router() method.
const express = require('express');
const router = express.Router();

//Imports the flashcardData.json file and sets the data object to the constant data via destructuring assignment.
const {data} = require('../data/flashcardData.json'); 

//Sets cards property in data which contains an array of all the questions, hints, and answers to the constant cards via destructuring assignment.
const {cards} = data; 

//Sets up a GET request route for cardRoutes in app.js with a route parameter named id.
router.get('/:id', (req, res) => {

 //Gets the query string from the request and sets it to the constant side via destructuring (it will be ?side=question or ?side=answer)   
    const {side} = req.query; 

//Sets the router params in the request to the constant id via destructuring assignment.
    const {id} = req.params;

//If side doesn't exist, then automatically redirect to the question side of the card with the same id.
    if (!side){
       return res.redirect(`${id}?side=question`); 
    }

//Sets the constant text to the either the question or answer string for the card found at the index of id.
    const text = cards[id][side];

//Sets the constant hint to the card found at the index of id via destructuring assignment.
    const {hint} = cards[id];

//Creates a templateData object, which will be updated with properties to hold depending on the side.
    let templateData = {};

//Creates template strings out of the query for question and answer sides and sets it to the question and answer constants.
    const question = `${id}?side=question`;
    const answer = `${id}?side=answer`;

//If the side is question, updates templateData object with text, hint, and answer properties.
    if (side === 'question'){
        templateData = {text, hint, answer};
//If the side is answer, updates templateData objeect with text and question properties.
    } else if (side === 'answer'){
        templateData = {text, question};
//If side is undefined or set to something else, redirects to /cards route.
    } else {
        return res.redirect('/cards');
    }
//Creates a cookie called cardNumber and sets it to the value of the id.
    res.cookie('cardNumber', id);

//Renders card.pug template with the templateData object.
    return res.render('card', templateData);
});

//Creates a GET request for the /cards route.
router.get('/', (req, res) => {

//Sets the value of the cookie named cardNumber to the constant currentCardNumber.
    const currentCardNumber = req.cookies.cardNumber;

//Sets the total number of cards in flashcardData.json to the constant numberOfCards
    const numberOfCards = cards.length;

//Generates a random number between the range of 0 and the total amount of cards - 1, then sets this number to the let variable randomCardId.If currentCardNumber matches the randomCardId (meaning the current card object data on the page won't change to a new card's data), then generate another random number.
    let randomCardId = Math.floor(Math.random() * numberOfCards);
    if (currentCardNumber === randomCardId){
        randomCardId = Math.floor(Math.random() * numberOfCards);
    }
    
//Redirect to the card with the value from randomCardId and with the question side.
    return res.redirect(`/cards/${randomCardId}?side=question`);
});

//Export this router so it can be used in app.js.
module.exports = router;