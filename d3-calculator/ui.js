const calculator = new Calculator();
const display = document.querySelector("#display");
const buttons = document.querySelector(".buttons");
const historyList = document.querySelector("#history-list");

function render() {
  display.textContent = calculator.getDisplay();
  renderHistory();
}

function renderHistory() {
  const history = calculator.getHistory();

  if (history.length === 0) {
    historyList.innerHTML = "<li>No calculations yet.</li>";
    return;
  }

  historyList.innerHTML = history
    .map((item) => `<li>${item}</li>`)
    .join("");
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const { value, action, operator } = button.dataset;

  if (value) {
    calculator.inputDigit(value);
  } else if (action === "decimal") {
    calculator.inputDecimal();
  } else if (action === "operator") {
    calculator.chooseOperator(operator);
  } else if (action === "equals") {
    calculator.calculate();
  } else if (action === "clear") {
    calculator.clear();
  }

  render();
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^\d$/.test(key)) {
    calculator.inputDigit(key);
  } else if (key === ".") {
    calculator.inputDecimal();
  } else if (key === "+" || key === "-") {
    calculator.chooseOperator(key);
  } else if (key === "*" || key.toLowerCase() === "x") {
    calculator.chooseOperator("×");
  } else if (key === "/") {
    event.preventDefault();
    calculator.chooseOperator("÷");
  } else if (key === "Enter" || key === "=") {
    calculator.calculate();
  } else if (key === "Escape" || key.toLowerCase() === "c") {
    calculator.clear();
  } else {
    return;
  }

  render();
});

render();
