/**
 * Robinson-Schensted Bijection Interactive Implementation
 */

class RobinsonSchenstedApp {
  constructor() {
    this.pTableau = [];
    this.qTableau = [];
    this.currentStep = 0;
    this.steps = [];
    this.isRunning = false;
    this.isStepMode = false;
    
    this.initializeElements();
    this.attachEventListeners();
    this.displayEmptyTableaux();
  }
  
  initializeElements() {
    this.permutationInput = document.getElementById('permutation-input');
    this.runButton = document.getElementById('run-algorithm');
    this.stepButton = document.getElementById('step-through');
    this.resetButton = document.getElementById('reset');
    this.errorMessage = document.getElementById('error-message');
    this.currentStepDisplay = document.getElementById('current-step');
    this.pTableauContainer = document.getElementById('p-tableau');
    this.qTableauContainer = document.getElementById('q-tableau');
  }
  
  attachEventListeners() {
    this.runButton.addEventListener('click', () => this.runAlgorithm());
    this.stepButton.addEventListener('click', () => this.stepThroughAlgorithm());
    this.resetButton.addEventListener('click', () => this.reset());
    this.permutationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.runAlgorithm();
      }
    });
  }
  
  parsePermutation(input) {
    const numbers = input.trim().split(/\s+/).map(x => parseInt(x, 10));
    
    // Validate input
    if (numbers.some(isNaN)) {
      throw new Error('Invalid input: all values must be numbers');
    }
    
    if (numbers.length === 0) {
      throw new Error('Please enter at least one number');
    }
    
    // Check if it's a valid permutation
    const sorted = [...numbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] !== i + 1) {
        throw new Error(`Invalid permutation: expected numbers 1 through ${numbers.length}`);
      }
    }
    
    return numbers;
  }
  
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }
  
  hideError() {
    this.errorMessage.classList.add('hidden');
  }
  
  runAlgorithm() {
    try {
      this.hideError();
      const permutation = this.parsePermutation(this.permutationInput.value);
      this.computeRobinsonSchensted(permutation);
      this.animateSteps();
    } catch (error) {
      this.showError(error.message);
    }
  }
  
  stepThroughAlgorithm() {
    if (!this.isStepMode) {
      try {
        this.hideError();
        const permutation = this.parsePermutation(this.permutationInput.value);
        this.computeRobinsonSchensted(permutation);
        this.isStepMode = true;
        this.currentStep = 0;
        this.stepButton.textContent = 'Next Step';
        this.runButton.disabled = true;
      } catch (error) {
        this.showError(error.message);
        return;
      }
    }
    
    if (this.currentStep < this.steps.length) {
      this.executeStep(this.steps[this.currentStep]);
      this.currentStep++;
      
      if (this.currentStep >= this.steps.length) {
        this.stepButton.textContent = 'Step Through';
        this.stepButton.disabled = true;
      }
    }
  }
  
  reset() {
    this.pTableau = [];
    this.qTableau = [];
    this.currentStep = 0;
    this.steps = [];
    this.isRunning = false;
    this.isStepMode = false;
    
    this.runButton.disabled = false;
    this.stepButton.disabled = false;
    this.stepButton.textContent = 'Step Through';
    
    this.hideError();
    this.displayEmptyTableaux();
    this.currentStepDisplay.textContent = '';
  }
  
  computeRobinsonSchensted(permutation) {
    this.steps = [];
    this.pTableau = [];
    this.qTableau = [];
    
    this.steps.push({
      type: 'start',
      description: `Starting Robinson-Schensted algorithm with permutation: ${permutation.join(' ')}`,
      pTableau: [],
      qTableau: []
    });
    
    for (let i = 0; i < permutation.length; i++) {
      const value = permutation[i];
      const position = i + 1;
      
      this.steps.push({
        type: 'insert-start',
        description: `Step ${i + 1}: Inserting ${value} (position ${position})`,
        pTableau: this.deepCopy(this.pTableau),
        qTableau: this.deepCopy(this.qTableau),
        inserting: value
      });
      
      const insertionPath = this.insertIntoTableau(value);
      
      // Record the insertion position in Q tableau
      const [row, col] = insertionPath[insertionPath.length - 1];
      this.insertIntoQTableau(row, col, position);
      
      this.steps.push({
        type: 'insert-complete',
        description: `Completed insertion of ${value}. P-tableau shape: ${this.getShape(this.pTableau)}`,
        pTableau: this.deepCopy(this.pTableau),
        qTableau: this.deepCopy(this.qTableau),
        insertionPath: insertionPath
      });
    }
    
    this.steps.push({
      type: 'complete',
      description: `Algorithm complete! Final tableaux have shape: ${this.getShape(this.pTableau)}`,
      pTableau: this.deepCopy(this.pTableau),
      qTableau: this.deepCopy(this.qTableau)
    });
  }
  
  insertIntoTableau(value) {
    const path = [];
    let currentValue = value;
    let rowIndex = 0;
    
    while (true) {
      if (rowIndex >= this.pTableau.length) {
        // Create new row
        this.pTableau.push([currentValue]);
        path.push([rowIndex, 0]);
        break;
      }
      
      const row = this.pTableau[rowIndex];
      let insertIndex = -1;
      
      // Find the leftmost position where we can insert
      for (let j = 0; j < row.length; j++) {
        if (currentValue < row[j]) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex === -1) {
        // Append to end of row
        row.push(currentValue);
        path.push([rowIndex, row.length - 1]);
        break;
      } else {
        // Bump the existing value
        const bumpedValue = row[insertIndex];
        row[insertIndex] = currentValue;
        path.push([rowIndex, insertIndex]);
        currentValue = bumpedValue;
        rowIndex++;
      }
    }
    
    return path;
  }
  
  insertIntoQTableau(row, col, value) {
    // Ensure Q tableau has enough rows
    while (this.qTableau.length <= row) {
      this.qTableau.push([]);
    }
    
    // Ensure the row has enough columns
    while (this.qTableau[row].length <= col) {
      this.qTableau[row].push(null);
    }
    
    this.qTableau[row][col] = value;
  }
  
  getShape(tableau) {
    return tableau.map(row => row.length).join(',');
  }
  
  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  async animateSteps() {
    this.isRunning = true;
    this.runButton.disabled = true;
    this.stepButton.disabled = true;
    
    for (let i = 0; i < this.steps.length; i++) {
      this.executeStep(this.steps[i]);
      await this.sleep(1000); // Wait 1 second between steps
    }
    
    this.isRunning = false;
    this.runButton.disabled = false;
    this.stepButton.disabled = false;
  }
  
  executeStep(step) {
    this.currentStepDisplay.textContent = step.description;
    this.displayTableau(this.pTableauContainer, step.pTableau, 'P');
    this.displayTableau(this.qTableauContainer, step.qTableau, 'Q');
  }
  
  displayTableau(container, tableau, type) {
    if (!tableau || tableau.length === 0) {
      this.displayEmptyTableau(container, type);
      return;
    }
    
    container.innerHTML = '';
    
    for (let i = 0; i < tableau.length; i++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'tableau-row';
      
      for (let j = 0; j < tableau[i].length; j++) {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'tableau-cell';
        cellDiv.textContent = tableau[i][j] || '';
        rowDiv.appendChild(cellDiv);
      }
      
      container.appendChild(rowDiv);
    }
  }
  
  displayEmptyTableau(container, type) {
    container.innerHTML = `<div class="empty-tableau">Empty ${type}-tableau</div>`;
  }
  
  displayEmptyTableaux() {
    this.displayEmptyTableau(this.pTableauContainer, 'P');
    this.displayEmptyTableau(this.qTableauContainer, 'Q');
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RobinsonSchenstedApp();
});