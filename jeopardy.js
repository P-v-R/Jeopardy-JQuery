const BASE_API_URL = "http://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

// JQuery element assignment
$gameBoard = $("#game-board");
$startBtn = $("#start-btn");
$cluesTable = $("#clues");

// where catagories and their corresponding clues will be stored for the current game.
let categories = [];


/* PERSONAL THOUGHT - API limits returnable categories to 100 (from what i've gathered)/// if I were to 
   stray from instructions (which i wont!), i would generate a random number between 0-17000
   (roughly the total amount of categories) and append those numbers as IDs to have greater sample size
   / increase playability, perhaps there is a way around this with the API i am unfamiliar 
   with and would love to discuss upon review! */


/* request a list of 100 categories from API, and uses lodash to pick out 6 category IDs
randomly. returns array of 6 unique IDs */
async function getCategoryIds() {
    // returns 100 categories from JService API
    const response = await axios({
        url: `${BASE_API_URL}categories?count=100`,
        method: "GET",
    });
    // maps through each object in API request and strips data
    // down to only category ID. 
    let categoryIdList = response.data.map((category) => category.id);
    // lodash returns 6 random IDs out of 100 IDs 
    return _.sampleSize(categoryIdList, [n = 6]);
};

 /*
 *   getCategory returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ... 3 more ...
 *   ]
 */

/* returns an object containing the argument IDs (catId) category "title" and an 
   array of 5 random clues (question/answers) corresponding to that category  */
async function getCategory(catId) {
    // API responds with object containing all the relevant information 
    // for category with ID of 'catID' argument
    const response = await axios({
        url: `${BASE_API_URL}category?id=${catId}`,
        method: "GET",
    });
    // select 5 random clues from 'catId's category and save them to an array
    // must replace dbl quote(") with single quote (') to avoid HTML cutting
    // off string prematurely, at the end of each clue a showing key is added 
    // with a value of null (will be used/altered to the display on DOM)
    let randomClues = _.sampleSize(response.data.clues, [n = 5]);
    let clueArray = [];
    for (let clue of randomClues) {
        clueArray.push({
            question: clue.question.replace(/"/g, "'"),
            answer: clue.answer.replace(/"/g, "'"),
            showing: null
        });
    }

    // returns object containing ID's title, all related clues 
    // and a showing key for each clue
    return {
        title: response.data.title,
        clues: clueArray
    }
}

/** Fill an HTML table with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */

/* when fillTable() is called a table element is appended to the $gameBoard div
   with a head row for categories and a table body section for each categories 
   5 clues, the clue elements will contain its showing status as ID,
   and two data attributes, one for the question and one for the answer string */

function fillTable() {
    console.log("fill table ran")
    $gameBoard.append(
        `<table class="table table-bordered border-primary ">
            <thead>
                <tr id=${"catagories"} ></tr>
            </thead>
            <tbody id=${"clues"}></tbody>
        </table>`);

    // in the top row of the jeopardy board (<thead>) add 1 cell for each category
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        $("#catagories").append(`<td id=category>${categories[i].title}</td>`);
    }

    // add 5 clues for each category, each clue will an ID of its "showing status " have two 
    // data attributes, data-question will contain the question and data-answer will contain the answer
    for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
        $("#clues").append(`
        <tr>
            <td class="clue" id="${categories[0].clues[i].showing}" 
                data-question="${categories[0].clues[i].question}"
                data-answer="${categories[0].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
            <td class="clue" id="${categories[1].clues[i].showing}" 
                data-question="${categories[1].clues[i].question}"
                data-answer="${categories[1].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
            <td class="clue" id="${categories[2].clues[i].showing}" 
                data-question="${categories[2].clues[i].question}"
                data-answer="${categories[2].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
            <td class="clue" id="${categories[3].clues[i].showing}" 
                data-question="${categories[3].clues[i].question}"
                data-answer="${categories[3].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
            <td class="clue" id="${categories[4].clues[i].showing}" 
                data-question="${categories[4].clues[i].question}"
                data-answer="${categories[4].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
            <td class="clue" id="${categories[5].clues[i].showing}" 
                data-question="${categories[5].clues[i].question}"
                data-answer="${categories[5].clues[i].answer}">
                <span id="question-mark"class="fas fa-question-circle fa-3x"></span>
            </td>
        </tr>   
        `);
    }
}


/* handles when category cell clicked, checks the cells ID (showing property) 
   and acts accordingly...
     if null => turn cell green and reveal question, changes ID to 'question' 
     if 'question' => reveals answer, changes ID to 'answer' and ignores further clicks 
*/
     
function handleClick(evt) {
    let $clickTarget = $(evt.target);
    let $question = $clickTarget.data("question");
    let $answer = $clickTarget.data("answer");
    // checks showing status and changes cell data accordingly
    if ($clickTarget.attr("id") === "null") {
        $clickTarget.closest("td").attr("id", "question");
        $clickTarget.html($question);
    } else if ($clickTarget.attr("id") === "question") {
        $clickTarget.closest("td").attr("id", "answer");
        $clickTarget.html($answer);
    } else {
        return;
    }
}

/** Wipe the current Jeopardy board, show the animated loading spinner,
    and update the start button to read "loading" / temporarily 
    turn off buttons click listener to avoid calling more than once. */

function showLoadingView() {
    $startBtn.html("loading");
    $startBtn.off();
    $gameBoard.empty();
    $gameBoard.append('<i id="spinner" class="fas fa-spinner fa-spin fa-10x"></i>');

}


/** Remove the loading spinner and updates "loading" button to be a 
    "restart" button, that when clicked will make a new game table. */
function hideLoadingView() {
    $("i").remove();
    $startBtn.html("restart!");
    $startBtn.on("click", setupAndStart);
}


/* when called, gets a new list of random category Ids and appends 
   category data structures to category array, calls fillTable to make a 
   new HTML table (game board)*/

async function setupGameBoard() {
    let categoryIds = await getCategoryIds();
    // for each id in categoryIds, pass in into getCategory() and append result to category 
    categories = await Promise.all(categoryIds.map((id) => getCategory(id)));
    // fill gameBoard with categories from categories data structure
    fillTable();
}


/** Start game: show loading state, setup game board, stop loading state */
async function setupAndStart() {
    showLoadingView();
    await setupGameBoard();
    hideLoadingView();
}

/* At start:
   set click handler to your start button that will run setupAndStart
   set a click handler to your board that will run handleClick when you click on a clue
*/

$startBtn.on("click", setupAndStart);
$gameBoard.on("click", ".clue", handleClick);