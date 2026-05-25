class Calculator {
  constructor() {
    this.history = [];
    this.clear();
  }

  clear() {
    this.currentValue = "0";
    this.previousValue = null;
    this.operator = null;
    this.shouldResetDisplay = false;
  }

  inputDigit(digit) {
    if (this.isError() || this.shouldResetDisplay) {
      this.currentValue = digit;
      this.shouldResetDisplay = false;
      return this.getDisplay();
    }

    this.currentValue = this.currentValue === "0" ? digit : this.currentValue + digit;
    return this.getDisplay();
  }

  inputDecimal() {
    if (this.isError() || this.shouldResetDisplay) {
      this.currentValue = "0.";
      this.shouldResetDisplay = false;
      return this.getDisplay();
    }

    if (!this.currentValue.includes(".")) {
      this.currentValue += ".";
    }

    return this.getDisplay();
  }

  chooseOperator(nextOperator) {
    if (this.isError()) {
      return this.getDisplay();
    }

    if (this.operator && !this.shouldResetDisplay) {
      this.calculate();
    }

    if (!this.isError()) {
      this.previousValue = this.currentValue;
      this.operator = nextOperator;
      this.shouldResetDisplay = true;
    }

    return this.getDisplay();
  }

  calculate() {
    if (!this.operator || this.previousValue === null || this.isError()) {
      return this.getDisplay();
    }

    const left = Number(this.previousValue);
    const right = Number(this.currentValue);
    const expression = `${this.formatNumber(left)} ${this.operator} ${this.formatNumber(right)}`;
    const result = this.runOperation(left, right, this.operator);

    if (result === null) {
      this.currentValue = "Cannot divide by 0";
      this.history.unshift(`${expression} = Cannot divide by 0`);
    } else {
      this.currentValue = this.formatNumber(result);
      this.history.unshift(`${expression} = ${this.currentValue}`);
    }

    this.previousValue = null;
    this.operator = null;
    this.shouldResetDisplay = true;
    return this.getDisplay();
  }

  runOperation(left, right, operator) {
    if (operator === "+") return left + right;
    if (operator === "-") return left - right;
    if (operator === "×") return left * right;
    if (operator === "÷") return right === 0 ? null : left / right;
    return right;
  }

  formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "Cannot divide by 0";
    }

    return Number.parseFloat(value.toFixed(10)).toString();
  }

  getDisplay() {
    return this.currentValue;
  }

  getHistory() {
    return [...this.history];
  }

  isError() {
    return this.currentValue === "Cannot divide by 0";
  }
}
