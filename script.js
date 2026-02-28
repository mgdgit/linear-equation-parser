const numbers = /^[0-9]/;
const letters = /^[a-z]+$/;
const operators = {
    "=": { precedence: 0, associativity: "left"},
    "+": { precedence: 1, associativity: "left" },
    "-": { precedence: 1, associativity: "left" },
    "*": { precedence: 2, associativity: "left" },
    "/": { precedence: 2, associativity: "left" },
    "^": { precedence: 3, associativity: "right" }
};

const isNumber = (token) => {
    return numbers.test(token);
}

const isLetter = (token) => {
    return letters.test(token);
}

const isOperator = (token) => {
    return token in operators;
}

const precedence = (token) => {
    return operators[token].precedence;
}

let tokenizeEquation = (equation) => {
    equation = equation.replace(/ /g, "").trim();
    let equationList = [];
    let accumulator = "";
    
    for (let i = 0; i < equation.length; i++) {

        if (isNumber(equation[i])) {
            accumulator += equation[i];

            for (let j = i + 1; j < equation.length; j++) {
                if (isNumber(equation[j])) {
                    accumulator += equation[j];
                    i++;
                }
                else {
                    break;
                }
            }

            equationList.push(accumulator);
            accumulator = "";
        }
        else if (isLetter(equation[i]) && isNumber(equation[i - 1])) {
            equationList.push("*");
            equationList.push(equation[i]);
        }
        else {
            equationList.push(equation[i]);
        }

    }

    return equationList;
}

let equationExample = tokenizeEquation("2x + 4 = 8");
//console.log(equationExample);

let operationsOrder = [];
let listOfOperators = [];

function shuntingYard(equationToken) {
    if (isNumber(equationToken)) {
        operationsOrder.push(Number(equationToken));
    }
    else if (isLetter(equationToken)) {
        operationsOrder.push(equationToken);
    }
    else if (equationToken === "(") {
        listOfOperators.push(equationToken);
    }
    else if (isOperator(equationToken)) {

        while (
            listOfOperators.length > 0 &&
            isOperator(listOfOperators[listOfOperators.length - 1]) &&
            (
                precedence(listOfOperators[listOfOperators.length - 1]) > precedence(equationToken) ||
                (
                    precedence(listOfOperators[listOfOperators.length - 1]) === precedence(equationToken) && 
                    operators[equationToken].associativity === "left"
                )
            )
        ) {
            operationsOrder.push(listOfOperators.pop());
        }

        listOfOperators.push(equationToken);
    }
    else if (equationToken === ")") {
        let foundOpenParenthesis = false;
        
        for (let i = listOfOperators.length - 1; listOfOperators.length !== 0; i--) {

            if (listOfOperators[i] !== "(") {
                operationsOrder.push(listOfOperators.pop());
            }
            else {
                listOfOperators.pop();
                foundOpenParenthesis = true;
                break;
            }

        }

        if (foundOpenParenthesis === false) {
            throw new Error("Open parenthesis not found.");
        }

    }

}

for (let i = 0; i < equationExample.length; i++) {
    shuntingYard(equationExample[i]);
}

while (listOfOperators.length > 0) {
    operationsOrder.push(listOfOperators.pop());
}

//console.log(operationsOrder);

function buildAST(rpn) {

    let tree = [];

    for (let i = 0; i < rpn.length; i++) {

        if (isNumber(rpn[i])) {
            let leaf = {
                type: "number",
                value: rpn[i]
            }
            tree.push(leaf);
        }
        else if (isLetter(rpn[i])) {
            let leaf = {
                type: "variable",
                value: rpn[i]
            }
            tree.push(leaf);
        }
        else {
            let branch = {
                type: "operator",
                value: rpn[i],
                right: tree.pop(),
                left: tree.pop()
            }
            tree.push(branch);
        }

    }

    return tree.pop();
}

let root = buildAST(operationsOrder);

function evaluate(node, context) {
    if (node.type === "number") {
        return node.value;
    }
    if (node.type === "variable") {
        return context[node.value];
    }

    if (node.type === "operator") {
        const leftValue = evaluate(node.left, context);
        const rightValue = evaluate(node.right, context);

        if (node.value === "+") return leftValue + rightValue;
        if (node.value === "-") return leftValue - rightValue;
        if (node.value === "*") return leftValue * rightValue;
        if (node.value === "/") return leftValue / rightValue;
        if (node.value === "=") return leftValue === rightValue;
    }

}

console.log(evaluate(root, {x: 2}));