
const priviousdisplay = document.querySelector("#previous-display");
const currentdisplay = document.querySelector("#current-display");

const buttons = document.querySelectorAll(".btn, .bigbtn");

let expression = "";
let resultShown = false;

// Update calculator display
function updateDisplay() {
    currentdisplay.textContent = expression || "0";
}

// Calculate expression safely without Function()
function calculate(exp) {
    const tokens = exp.match(/\d*\.?\d+|[+\-*/]/g);

    if (!tokens || tokens.join("") !== exp) {
        throw new Error("Invalid expression");
    }

    let index = 0;

    function factor() {
        if (tokens[index] === "+") {
            index++;
            return factor();
        }

        if (tokens[index] === "-") {
            index++;
            return -factor();
        }

        const value = tokens[index];

        if (!value || !/^\d*\.?\d+$/.test(value)) {
            throw new Error("Invalid number");
        }

        index++;
        return Number(value);
    }

    function term() {
        let value = factor();

        while (
            tokens[index] === "*" ||
            tokens[index] === "/"
        ) {
            const operator = tokens[index];
            index++;

            const next = factor();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            if (operator === "*") {
                value *= next;
            } else {
                value /= next;
            }
        }

        return value;
    }

    function sum() {
        let value = term();

        while (
            tokens[index] === "+" ||
            tokens[index] === "-"
        ) {
            const operator = tokens[index];
            index++;

            const next = term();

            if (operator === "+") {
                value += next;
            } else {
                value -= next;
            }
        }

        return value;
    }

    const result = sum();

    if (index !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}

// Handle all calculator buttons
buttons.forEach((button) => {

    // Number buttons
    if (button.dataset.number !== undefined) {

        button.addEventListener("click", () => {

            if (resultShown) {
                expression = "";
                priviousdisplay.textContent = "";
                resultShown = false;
            }

            expression += button.dataset.number;

            updateDisplay();
        });
    }

    // Operator buttons
    else if (button.dataset.operator !== undefined) {

        button.addEventListener("click", () => {

            const operator = button.dataset.operator;

            if (resultShown) {
                resultShown = false;
            }

            if (expression === "") {
                if (operator === "-") {
                    expression = "-";
                    updateDisplay();
                }

                return;
            }

            // Replace an operator if another is clicked
            if (/[+\-*/]$/.test(expression)) {

                if (
                    operator === "-" &&
                    !expression.endsWith("-")
                ) {
                    expression += operator;
                } else {
                    expression = expression.slice(0, -1) + operator;
                }

            } else if (!expression.endsWith(".")) {

                expression += operator;
            }

            updateDisplay();
        });
    }

    // Decimal button
    else if (button.dataset.action === "decimal") {

        button.addEventListener("click", () => {

            if (resultShown) {
                expression = "";
                priviousdisplay.textContent = "";
                resultShown = false;
            }

            const parts = expression.split(/[+\-*/]/);
            const currentNumber = parts[parts.length - 1];

            if (currentNumber.includes(".")) {
                return;
            }

            if (
                currentNumber === "" ||
                currentNumber === "-"
            ) {
                expression += "0";
            }

            expression += ".";

            updateDisplay();
        });
    }

    // Equals button
    else if (button.dataset.action === "equals") {

        button.addEventListener("click", () => {

            if (
                !expression ||
                /[+\-*/.]$/.test(expression)
            ) {
                return;
            }

            try {
                const oldExpression = expression;
                const result = calculate(expression);

                priviousdisplay.textContent = oldExpression + " =";

                expression = String(
                    Number(result.toPrecision(12))
                );

                updateDisplay();

                resultShown = true;

            } catch (error) {

                currentdisplay.textContent = "Error";
                expression = "";
                resultShown = true;
            }
        });
    }

    // Clear button
    else if (button.dataset.action === "clear") {

        button.addEventListener("click", () => {

            expression = "";
            resultShown = false;

            currentdisplay.textContent = "0";
            priviousdisplay.textContent = "";
        });
    }

    // Delete button
    else if (button.dataset.action === "delete") {

        button.addEventListener("click", () => {

            if (resultShown) {
                expression = "";
                priviousdisplay.textContent = "";
                resultShown = false;
            } else {
                expression = expression.slice(0, -1);
            }

            updateDisplay();
        });
    }

    // Percentage button
    else if (button.dataset.action === "percent") {

        button.addEventListener("click", () => {

            if (!expression || resultShown) {
                return;
            }

            const match = expression.match(/(\d*\.?\d+)$/);

            if (!match) {
                return;
            }

            const number = Number(match[0]);

            expression =
                expression.slice(0, -match[0].length) +
                String(number / 100);

            updateDisplay();
        });
    }

});
