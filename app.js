var BasicCard = require('./BasicCard.js');
var ClozeCard = require('./ClozeCard.js');
var inquirer = require('inquirer');
var fs = require('fs');

var actionPrompt = function(){
    inquirer.prompt([{
        name: 'action',
        message: 'Choose an action',
        type: 'list',
        choices: [{
            name: 'Add Card',
            value : 'add'
        }, {
            name: 'Show All Cards',
            value :  'showAll'
        }]
    }])
    .then(function(answer) {
        if (answer.action == 'add') {
            addCard();
        } else if (answer.action == 'showAll') {
            showAll();
        }
    });
}

var addCard = function() {
    inquirer.prompt([{
        name: 'type',
        message: 'What kind of flashcard would you like to create?',
        type: 'list',
        choices: [{
            name: 'Basic Card',
            value: 'basic'
        }, {
            name: 'Cloze Card',
            value: 'cloze'
        }]
    // once user input is received
    }])
    .then(function(answer) {
        if (answer.type == 'basic') {
            inquirer.prompt([{
                name: 'front',
                message: 'What is the question?'
            }, {
                name: 'back',
                message: 'What is the answer?'
            }])
            .then(function(answer) {
                var basicCard = new BasicCard(answer.front, answer.back);
                basicCard.create();
                actionPrompt();
            });
        } else if (answer.type == 'cloze') {
            inquirer.prompt([{
                name: 'text',
                message: 'What is the full text?'
            }, {
                name: 'cloze',
                message: 'What is the cloze portion?'
            }])
            .then(function(answer) {
                var text = answer.text;
                var cloze = answer.cloze;
                if (text.includes(cloze)) {
                    var clozeCard = new ClozeCard(text, cloze);
                    clozeCard.create();
                    actionPrompt();
                } else {
                    console.log('The cloze portion you provided is not found in the full text. Please try again.');
                    addCard();
                }
            });
        }
    });
};

var showAll = function() {
    fs.readFile('./cards.txt', 'utf8', function(error, data) {
        if (error) {
            console.log('ERROR: ' + error);
        }
        var questions = data.split(';');

        var count = 0;
        showQuestion(questions, count);
    });
};

var showQuestion = function(array, index) {
    question = array[index];
    var parsedQuestion = JSON.parse(question);
    var questionText;
    var correctReponse;
    if (parsedQuestion.type == 'basic') {
        questionText = parsedQuestion.front;
        correctReponse = parsedQuestion.back;
    } else if (parsedQuestion.type == 'cloze') {
        questionText = parsedQuestion.clozeDeleted;
        correctReponse = parsedQuestion.cloze;
    }
    inquirer.prompt([{
        name: 'response',
        message: questionText
    }]).then(function(answer) {
        if (answer.response == correctReponse) {
            console.log('That is correct!');
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        } else {
            console.log('That is incorrect! The correct answer is ' + correctReponse);
            if (index < array.length - 1) {
              showQuestion(array, index + 1);
            }
        }
    });
};

actionPrompt()