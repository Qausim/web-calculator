let screen = document.getElementById('screen');
let answerIsGiven = false;

const screenIsFull = () => screen.textContent.length == 13;

/**
 * Clears the entire content of the screen
 */
const clearScreen = () => {
    screen.textContent = '0';
    answerIsGiven = false;
}

/**
 * Clears the content of the screen one character at a time from
 * the back
 */
const clearBack = () => {
    // clear the screen if an answer has already been given
    if (answerIsGiven) {
        clearScreen()
        answerIsGiven = false;
        return;
    }

    let screenContent = screen.textContent;
    if (screenContent.length > 1)
        screen.textContent = screen.textContent.slice(0,-1);
    else
        screen.textContent = '0';
}

/**
 * Changes the sign of the first entry between positive and negative
 */
let changeSign = () => {
    // return if screen is full
    if (screenIsFull())
        return;
    
    // clear the screen if an answer has already been given
    if (answerIsGiven) {
        clearScreen()
        answerIsGiven = false;
        return;
    }
    let screenContent = screen.textContent;
    // Toggle the sign on the first digit
    screen.textContent = screenContent[0] === '-' ? screen.textContent.slice(1) :
    '-' + screenContent;
}


let clearButton = document.getElementById('buttonClear');
clearButton.addEventListener('click', clearScreen);

let backButton = document.getElementById('buttonBack');
backButton.addEventListener('click', clearBack);

let plusOrMinusButton = document.getElementById('buttonPlusOrMinus');
plusOrMinusButton.addEventListener('click', changeSign);

let equalButton = document.getElementById('buttonEqual');
equalButton.addEventListener('click', getAnswer);


/**
 * Handles clicks on the equal button giving output of the input statement
 */
function getAnswer() {
    let screenContent = screen.textContent;
    let result = evaluateInput(screenContent);
    
    // wrong  operator sequence gives NaN as result
    if (!result) {
        alert('Error: Please check operator sequence')
        return;
    }
    // divisions by 0 give Infinity
    if (result === Infinity || result === -Infinity) {
        alert("Error: Please check for divisions by zero");
        return;
    }
    screen.textContent = result;
    answerIsGiven = true;
}

/**
 * Handles clicks for button elements that print their contents to a screen
 * @param {Object} el: the element clicked
 */
function enterNum(el) {
    // return if screen is full
    if (screenIsFull())
        return;

    // get the screen content and the content of the element
    let screenContent = screen.textContent;
    let elementContent = el.textContent;
    
    // all numbers and operators in separate lists
    let nums = '0 1 2 3 4 5 6 7 8 9'.split(' ');
    let ops = '- + / *'.split(' ');

    // for numbers
    if (nums.includes(elementContent)) {
        // clear the screen if an answer has already been given
        if (answerIsGiven) {
            screenContent = '0';
            answerIsGiven = false;
        }
        // if the entry is numerical make it the new screen content if
        // existing content is 0 else just add it to the existing content
        screen.textContent = screenContent == '0' ? elementContent :
        screenContent + elementContent;
    } else if (ops.includes(elementContent)) {
        // if the entry is an operator
        answerIsGiven = false;
        // if the last entry is not an operator then add the new operator entry
        if (!ops.includes(screenContent.slice(-1)[0]))
            screen.textContent = screenContent + elementContent;
        else {// however if the last entry is an operator but not more than one of such
            // and the incoming entry is a minus then add the new entry
            if (elementContent === '-' && !screenContent.match(/[/\-+*]{2}$/))
                screen.textContent = screenContent + elementContent;
        }
    } else {// if the new input is a point
        if (answerIsGiven) {
            screenContent = '0';
            answerIsGiven = false;
        }
        let lastInput = screenContent.match(/\d+(?:\.\d+)?$/); // matches the last input
        if (lastInput) // If the match is not empty, get the element
            lastInput = lastInput[0];
        if (!lastInput.includes('.')) // Add point only if there is no existing point.
            screen.textContent = screenContent + elementContent;
    }
}

/**
 * Function is useful for evaluating user inputs expected to be an
 * arithmetical statement in the form string and evaluates it taking
 * operators precedence into consideration. It returns the answer.
 * @param {string} s
 */
function evaluateInput(s) {
    // get all the numbers in the statement: positive and negative, whole and decimal
    // let numList = s.match(/(?<=[-+/*]?)-?\d+(\.\d+)?/g);
    let numList = [];
    for (let match of ('+'+s).match(/([+-/*(])(([-]?\d+)(\.)?(\d+)*)/g)) {
        numList.push(match.slice(1));
    }

    // Get all operators (operates two operands) and save in a list
    // two states are managed: if the first element is a negative number or otherwise
    let opsList;
    if (s.match(/[*/+-]/g)) {
        opsList = s[0] == '-' ?
        s.slice(1).match(/(?<=\d)[*+-/]/g).join(',').replace(/\.,/g,"").split(',') :
        s.match(/(?<=\d)[*+-/]/g).join(',').replace(/\.,/g,"").split(',');
    } else
        return numList[0];

    // Perform multiplication operations
    handleMultiplications(numList, opsList);
    // Perform division operations
    handleDivisions(numList, opsList);
    // Perform addition operations
    handleAdditions(numList, opsList);
    // Perform substraction operations
    handleSubtractions(numList, opsList);

    let result = numList[0]
    // Return integer if result is a whole number or float that has filled the screen
    // else return float making decision based on the number of characters in the answer
    if (result.toString().includes('.')) {
        if (result.toString().length > 13) {
        let [whole, decimal] = result.toString().split('.');
        let decFix = 13 - whole.length;
        if (decFix > 0)
            result = result.toFixed(decFix);
        }
    }
    return result;
}

/**
 * Handles all subtraction operations in the statement
 * @param {Array} numList: array of operands to be operated on
 * @param {Array} opsList: array of operators to operate on the operands.
 */
function handleSubtractions(numList,opsList) {
    while (opsList.includes('-')) {
        let opIndex = opsList.indexOf('-');
        let operator = opsList.splice(opIndex,1)[0];
        let rhs = numList[opIndex + 1];
        let lhs = numList[opIndex];
        numList.splice(opIndex + 1,1);
        numList[opIndex] = parseFloat(lhs) - parseFloat(rhs);
    }
}

/**
 * Handles all additions operations in the statement
 * @param {Array} numList: array of operands to be operated on
 * @param {Array} opsList: array of operators to operate on the operands.
 */
function handleAdditions(numList,opsList) {
    while (opsList.includes('+')) {
        let opIndex = opsList.indexOf('+');
        let operator = opsList.splice(opIndex,1)[0];
        let rhs = numList[opIndex + 1];
        let lhs = numList[opIndex];
        numList.splice(opIndex + 1,1);
        numList[opIndex] = parseFloat(lhs) + parseFloat(rhs);
    }
}

 /* Handles all division operations in the statement
 * @param {Array} numList: array of operands to be operated on
 * @param {Array} opsList: array of operators to operate on the operands.
 */
function handleDivisions(numList,opsList) {
    while (opsList.includes('/')) {
        let opIndex = opsList.indexOf('/');
        let operator = opsList.splice(opIndex,1)[0];
        let rhs = numList[opIndex + 1];
        let lhs = numList[opIndex];
        numList.splice(opIndex + 1,1);
        numList[opIndex] = parseFloat(lhs) / parseFloat(rhs);
    }
}

/**
 * Handles all multiplication operations in the statement
 * @param {Array} numList: array of operands to be operated on
 * @param {Array} opsList: array of operators to operate on the operands.
 */
function handleMultiplications(numList,opsList) {
    while (opsList.includes('*')) {
        let opIndex = opsList.indexOf('*');
        let operator = opsList.splice(opIndex,1)[0];
        let rhs = numList[opIndex + 1];
        let lhs = numList[opIndex];
        numList.splice(opIndex + 1,1);
        numList[opIndex] = parseFloat(lhs) * parseFloat(rhs);
    }
}