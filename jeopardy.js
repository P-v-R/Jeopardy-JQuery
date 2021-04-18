const BASE_API_URL = "http://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_CLUES_PER_CAT = 5;

// JQuery element assignment
$gameBoard = $("#game-board");
$startBtn = $("#start-btn");
$cluesTable = $("#clues");

// categories is the main data structure for the app; it should eventually look like this:
//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: "4", showing: null},
//        {question: "1+1", answer: "2", showing: null}, ... 3 more clues ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null}, ...
//      ],
//    }, ...4 more categories ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random categories from API.
 *
 * Returns array of category ids, e.g. [4, 12, 5, 9, 20, 1]
 */

/* PERSONAL THOUGHT - API limits returnable categories to 100! if I were to stray from instructions (which i wont!), i would generate a random number
   between 0-18000(roughly the total ammount of categories) and append those numbers as IDs to have greater sample size / increase
   playability */

/* request a list of 100 categories from API, and uses lodash to pick out 6 IDs
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


/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ... 3 more ...
 *   ]
 */

/* returns an object containing the argument IDs (catId) category title and an 
   array of 5 random clues(question / answers) belonging to that category  */
async function getCategory(catId) {

    // API responds with object containing all the relevant information 
    // for category with ID of 'catID' argument
    const response = await axios({
        url: `${BASE_API_URL}category?id=${catId}`,
        method: "GET",
    });

    // select 5 random clues from 'catId's category and save them to an array
    let randomClues = _.sampleSize(response.data.clues, [n = 5]);
    console.log(randomClues)

    // returns object containing ID's title and all related clues 
    return {
        title: response.data.title,
        clues: randomClues
    }
}


/** Fill an HTML table with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM-QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initially, just show a "?" where the question/answer would go.)
 */

/* when fillTable is called a table element is appended to the gameBoard 
   with a head row for categories and a body section for each categories 
   5 clues */
function fillTable() {
    console.log("fill table ran")
    $gameBoard.append(
        `<table class="table">
            <thead>
                <tr id=${"catagories"} ></tr>
            </thead>
            <tbody id=${"clues"}></tbody>
        </table>`);

    // in the top row of the jeopardy board (<thead>) add 1 cell for each catigory
    for (let i = 0; i < NUM_CATEGORIES; i++) {
        $("#catagories").append(`<td id=category>${categories[i].title}</td>`);
    }

    // add 5 queston for each category
    for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
        $("#clues").append(`
        <tr>
            <td class="clue" id="clue" 
             data-question="${categories[0].clues[i].question}"
             data-answer="${categories[0].clues[i].answer}">?
            </td>
            <td class="clue" id="clue" 
             data-question="${categories[1].clues[i].question}"
             data-answer="${categories[1].clues[i].answer}">?
            </td>
            <td class="clue" id="clue" 
             data-question="${categories[2].clues[i].question}"
             data-answer="${categories[2].clues[i].answer}">?
            </td>
            <td class="clue" id="clue" 
             data-question="${categories[3].clues[i].question}"
             data-answer="${categories[3].clues[i].answer}">?
            </td>
            <td class="clue" id="clue" 
             data-question="${categories[4].clues[i].question}"
             data-answer="${categories[4].clues[i].answer}">?
            </td>
            <td class="clue" id="clue" 
             data-question="${categories[5].clues[i].question}"
             data-answer="${categories[5].clues[i].answer}">?
            </td>
        </tr>
        `);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {

    let $clickTarget = $(evt.target);
    let $question = $clickTarget.data("question")
    let $answer = $clickTarget.data("answer")

    if ($clickTarget.attr("id") === "clue") {
        $clickTarget.html($question)
        $clickTarget.closest("td").attr("id", "question");

    } else if ($clickTarget.attr("id") === "question") {
        $clickTarget.html($answer)
        $clickTarget.closest("td").attr("id", "answer");
    } else {
        console.log($clickTarget)
        return;
    }
}



/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    $gameBoard.empty();
    $gameBoard.append('<i class="fas fa-spinner"></i>');
}


/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
    $("i").remove();
    $startBtn.remove();
}

/** Setup game data and board:
 * - get random category Ids
 * - get data for each category
 * - call fillTable to create HTML table
 */


/* when called, gets a new list of random category Ids and appends 
   category data structures to category array */
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

/** At start:
 *
 * - Add a click handler to your start button that will run setupAndStart
 * - Add a click handler to your board that will run handleClick
 *   when you click on a clue
 */

// ADD THOSE THINGS HERE
$startBtn.on("click", setupAndStart)
$gameBoard.on("click", ".clue", handleClick);

