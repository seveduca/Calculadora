class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === '0') return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    appendNumber(number) {
        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand === '') return;
        
        // Permite cambiar de operador sin calcular
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }
        
        if (this.previousOperand !== '') {
            this.compute();
        }
        
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    alert("No se puede dividir por cero");
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Problemas de precisión con flotantes (ej: 0.1 + 0.2)
        computation = Math.round(computation * 1000000000) / 1000000000;
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;
    }

    calculatePercent() {
        if (this.currentOperand === '') return;
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        
        if (this.previousOperand !== '' && this.operation) {
            // Si hay una operación pendiente, el porcentaje es sobre el valor previo
            // Ejemplo: 200 + 10% = 220
            const prev = parseFloat(this.previousOperand);
            const percentValue = (prev * current) / 100;
            this.currentOperand = percentValue.toString();
        } else {
            // Si no hay operación, simplemente divide por 100
            this.currentOperand = (current / 100).toString();
        }
        // No marcamos shouldResetScreen para poder seguir calculando después del %
    }

    getDisplayNumber(number) {
        if (number === '') return '';
        const stringNumber = number.toString();
        
        // Manejo especial para el caso de solo un guión negativo
        if (stringNumber === '-') return '-';
        
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('es-ES', { maximumFractionDigits: 0 });
        }
        
        if (decimalDigits != null) {
            return `${integerDisplay},${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        // Reemplazar el punto interno por coma en la vista, aunque internamente usemos puntos
        let formattedCurrent = this.getDisplayNumber(this.currentOperand);
        
        // Si el usuario acaba de escribir "0." u otro número con punto, mostramos la coma al final
        if (this.currentOperand.toString().endsWith('.')) {
            formattedCurrent += ',';
        }

        this.currentOperandElement.innerText = formattedCurrent;
        
        if (this.operation != null) {
            this.previousOperandElement.innerText = 
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
        
        // Reducir el tamaño de fuente si el número es muy largo
        if (this.currentOperandElement.innerText.length > 10) {
            this.currentOperandElement.style.fontSize = '2rem';
        } else if (this.currentOperandElement.innerText.length > 14) {
             this.currentOperandElement.style.fontSize = '1.5rem';
        } else {
            this.currentOperandElement.style.fontSize = '3rem';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.querySelector('[data-previous-operand]');
    const currentOperandElement = document.querySelector('[data-current-operand]');
    const numberButtons = document.querySelectorAll('[data-number]');
    const operationButtons = document.querySelectorAll('[data-operation]');
    const equalsButton = document.querySelector('[data-action="compute"]');
    const deleteButton = document.querySelector('[data-action="delete"]');
    const clearButton = document.querySelector('[data-action="clear"]');
    const percentButton = document.querySelector('[data-action="percent"]');

    const calculator = new Calculator(previousOperandElement, currentOperandElement);

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Visual feedback (además de CSS) opcional
            calculator.appendNumber(button.dataset.number);
            calculator.updateDisplay();
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.dataset.operation);
            calculator.updateDisplay();
        });
    });

    equalsButton.addEventListener('click', button => {
        calculator.compute();
        calculator.updateDisplay();
    });

    clearButton.addEventListener('click', button => {
        calculator.clear();
        calculator.updateDisplay();
    });

    deleteButton.addEventListener('click', button => {
        calculator.delete();
        calculator.updateDisplay();
    });

    percentButton.addEventListener('click', button => {
        calculator.calculatePercent();
        calculator.updateDisplay();
    });

    // Soporte para teclado
    document.addEventListener('keydown', e => {
        const key = e.key;
        
        if (/[0-9]/.test(key)) {
            e.preventDefault();
            calculator.appendNumber(key);
            calculator.updateDisplay();
        } else if (key === '.' || key === ',') {
            e.preventDefault();
            calculator.appendNumber('.');
            calculator.updateDisplay();
        } else if (key === '+' || key === '-') {
            e.preventDefault();
            calculator.chooseOperation(key);
            calculator.updateDisplay();
        } else if (key === '*' || key === 'x' || key === 'X') {
            e.preventDefault();
            calculator.chooseOperation('×');
            calculator.updateDisplay();
        } else if (key === '/') {
            e.preventDefault();
            calculator.chooseOperation('÷');
            calculator.updateDisplay();
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculator.compute();
            calculator.updateDisplay();
        } else if (key === 'Backspace') {
            e.preventDefault();
            calculator.delete();
            calculator.updateDisplay();
        } else if (key === 'Escape') {
            e.preventDefault();
            calculator.clear();
            calculator.updateDisplay();
        } else if (key === '%') {
            e.preventDefault();
            calculator.calculatePercent();
            calculator.updateDisplay();
        }
    });
});
