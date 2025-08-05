   class Calculator {
            constructor(previousOperandTextElement, currentOperandTextElement) {
                this.previousOperandTextElement = previousOperandTextElement;
                this.currentOperandTextElement = currentOperandTextElement;
                this.clear();
                this.loadHistory();
            }

            clear() {
                this.currentOperand = '0';
                this.previousOperand = '';
                this.operation = undefined;
                this.updateDisplay();
            }

            delete() {
                this.currentOperand = this.currentOperand.toString().slice(0, -1);
                if (this.currentOperand === '') {
                    this.currentOperand = '0';
                }
                this.updateDisplay();
            }

            appendNumber(number) {
                if (number === '.' && this.currentOperand.includes('.')) return;
                if (this.currentOperand === '0' && number !== '.') {
                    this.currentOperand = number;
                } else {
                    this.currentOperand = this.currentOperand.toString() + number.toString();
                }
                this.updateDisplay();
            }

            chooseOperation(operation) {
                if (this.currentOperand === '') return;
                if (this.previousOperand !== '') {
                    this.compute();
                }
                this.operation = operation;
                this.previousOperand = this.currentOperand;
                this.currentOperand = '';
                this.updateDisplay();
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
                        computation = prev * current;
                        break;
                    case '÷':
                        computation = prev / current;
                        break;
                    default:
                        return;
                }

                const calculation = {
                    expression: `${this.previousOperand} ${this.operation} ${this.currentOperand}`,
                    result: computation.toString()
                };

                this.currentOperand = computation.toString();
                this.operation = undefined;
                this.previousOperand = '';
                this.updateDisplay();
                
                // Save to history (in a real app, this would send to a backend API)
                this.saveToHistory(calculation);
            }

            getDisplayNumber(number) {
                const stringNumber = number.toString();
                const integerDigits = parseFloat(stringNumber.split('.')[0]);
                const decimalDigits = stringNumber.split('.')[1];
                let integerDisplay;
                if (isNaN(integerDigits)) {
                    integerDisplay = '';
                } else {
                    integerDisplay = integerDigits.toLocaleString('en', {
                        maximumFractionDigits: 0
                    });
                }
                if (decimalDigits != null) {
                    return `${integerDisplay}.${decimalDigits}`;
                } else {
                    return integerDisplay;
                }
            }

            updateDisplay() {
                this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
                if (this.operation != null) {
                    this.previousOperandTextElement.innerText = 
                        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
                } else {
                    this.previousOperandTextElement.innerText = '';
                }
            }

            saveToHistory(calculation) {
                const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
                history.unshift(calculation);
                localStorage.setItem('calculatorHistory', JSON.stringify(history.slice(0, 50))); // Limit to 50 items
                this.updateHistoryDisplay();
            }

            loadHistory() {
                this.updateHistoryDisplay();
            }

            clearHistory() {
                localStorage.removeItem('calculatorHistory');
                this.updateHistoryDisplay();
            }

            updateHistoryDisplay() {
                const historyList = document.getElementById('history-list');
                historyList.innerHTML = '';
                
                const history = JSON.parse(localStorage.getItem('calculatorHistory') || '[]');
                
                history.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.className = 'bg-gray-100 p-3 rounded-lg dark:bg-slate-700';
                    historyItem.innerHTML = `
                        <div class="font-medium text-blue-600 dark:text-blue-300">${item.expression} =</div>
                        <div class="text-lg font-semibold">${item.result}</div>
                    `;
                    historyItem.addEventListener('click', () => {
                        this.currentOperand = item.result;
                        this.updateDisplay();
                        document.querySelector('.history-panel').classList.remove('active');
                    });
                    historyList.appendChild(historyItem);
                });
            }
        }

        // Initialize calculator
        const numberButtons = document.querySelectorAll('.number');
        const operationButtons = document.querySelectorAll('.operator');
        const equalsButton = document.querySelector('.equals');
        const deleteButton = document.querySelector('.function:nth-child(2)');
        const allClearButton = document.querySelector('.function');
        const previousOperandTextElement = document.querySelector('#previous-operand');
        const currentOperandTextElement = document.querySelector('#current-operand');
        const themeToggle = document.querySelector('.theme-toggle');
        const historyBtn = document.getElementById('history-btn');
        const closeHistoryBtn = document.getElementById('close-history');
        const clearHistoryBtn = document.getElementById('clear-history');
        const historyPanel = document.querySelector('.history-panel');

        const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

        numberButtons.forEach(button => {
            button.addEventListener('click', () => {
                calculator.appendNumber(button.innerText);
            });
        });

        operationButtons.forEach(button => {
            button.addEventListener('click', () => {
                calculator.chooseOperation(button.innerText);
            });
        });

        equalsButton.addEventListener('click', () => {
            calculator.compute();
        });

        allClearButton.addEventListener('click', () => {
            calculator.clear();
        });

        deleteButton.addEventListener('click', () => {
            calculator.delete();
        });

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        historyBtn.addEventListener('click', () => {
            historyPanel.classList.add('active');
        });

        closeHistoryBtn.addEventListener('click', () => {
            historyPanel.classList.remove('active');
        });

        clearHistoryBtn.addEventListener('click', () => {
            calculator.clearHistory();
        });

        // Check for saved theme preference
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }

        // Close history panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!historyPanel.contains(e.target) && e.target !== historyBtn) {
                historyPanel.classList.remove('active');
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (/^[0-9.]$/.test(e.key)) {
                calculator.appendNumber(e.key);
            } else if (['+', '-', '*', '/'].includes(e.key)) {
                calculator.chooseOperation(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
            } else if (e.key === 'Enter') {
                calculator.compute();
            } else if (e.key === 'Escape') {
                calculator.clear();
            } else if (e.key === 'Backspace') {
                calculator.delete();
            }
        });

       
        
        async function saveCalculationToDatabase(calculation) {
            try {
                const response = await fetch('http://your-java-backend/api/calculations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(calculation)
                });
                return await response.json();
            } catch (error) {
                console.error('Error saving to database:', error);
            }
        }

        async function loadHistoryFromDatabase() {
            try {
                const response = await fetch('http://your-java-backend/api/calculations');
                return await response.json();
            } catch (error) {
                console.error('Error loading history:', error);
                return [];
            }
        }