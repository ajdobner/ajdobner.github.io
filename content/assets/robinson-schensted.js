/**
 * Robinson-Schensted Bijection Interactive Implementation
 * New interactive design with clickable boxes and SVG animations
 */

class RobinsonSchenstedApp {
  constructor() {
    this.pTableau = [];
    this.qTableau = [];
    this.currentPermutation = [];
    this.permutationSize = 4;
    this.availableNumbers = [];
    this.isAnimating = false;
    
    // SVG dimensions and layout constants
    this.cellSize = 40;
    this.cellPadding = 2;
    this.tableauOffsetX = 50;
    this.tableauOffsetY = 50;
    
    this.initializeElements();
    this.attachEventListeners();
    this.setupNumberBoxes();
    this.initializeTableaux();
  }
  
  initializeElements() {
    this.sizeSelector = document.getElementById('permutation-size');
    this.resetButton = document.getElementById('reset');
    this.errorMessage = document.getElementById('error-message');
    this.currentStepDisplay = document.getElementById('current-step');
    this.currentPermutationDisplay = document.getElementById('current-permutation');
    this.numberBoxesContainer = document.getElementById('number-boxes');
    this.pTableauSvg = document.getElementById('p-tableau');
    this.qTableauSvg = document.getElementById('q-tableau');
  }
  
  attachEventListeners() {
    this.sizeSelector.addEventListener('change', () => this.changePermutationSize());
    this.resetButton.addEventListener('click', () => this.reset());
  }
  
  changePermutationSize() {
    this.permutationSize = parseInt(this.sizeSelector.value);
    this.reset();
  }
  
  setupNumberBoxes() {
    this.availableNumbers = Array.from({length: this.permutationSize}, (_, i) => i + 1);
    this.numberBoxesContainer.innerHTML = '';
    
    this.availableNumbers.forEach(num => {
      const box = document.createElement('div');
      box.className = 'number-box';
      box.textContent = num;
      box.dataset.number = num;
      box.addEventListener('click', () => this.clickNumber(num));
      this.numberBoxesContainer.appendChild(box);
    });
  }
  
  async clickNumber(number) {
    if (this.isAnimating) return;
    
    // Check if number is still available
    const boxElement = this.numberBoxesContainer.querySelector(`[data-number="${number}"]`);
    if (boxElement.classList.contains('used')) return;
    
    // Mark as used and disable
    boxElement.classList.add('used');
    
    // Add to current permutation
    this.currentPermutation.push(number);
    this.updatePermutationDisplay();
    
    // Start animation and insertion
    await this.animateInsertion(number, boxElement);
  }
  
  updatePermutationDisplay() {
    this.currentPermutationDisplay.textContent = `[${this.currentPermutation.join(', ')}]`;
    
    if (this.currentPermutation.length === this.permutationSize) {
      this.currentStepDisplay.textContent = `Permutation complete: ${this.currentPermutation.join(' ')}`;
    } else {
      this.currentStepDisplay.textContent = `Building permutation... Click next number (${this.currentPermutation.length + 1}/${this.permutationSize})`;
    }
  }
  
  async animateInsertion(value, boxElement) {
    this.isAnimating = true;
    
    try {
      const position = this.currentPermutation.length;
      
      // Create animated box copy
      const animatedBox = this.createAnimatedBox(value, boxElement);
      document.body.appendChild(animatedBox);
      
      // Show insertion step info
      this.currentStepDisplay.textContent = `Inserting ${value} (position ${position})...`;
      
      // Perform step-by-step bumping animation
      await this.animateStepByStepInsertion(animatedBox, value);
      
      // Perform actual insertion (this updates the internal data structures)
      this.performInsertion(value, position);
      
      // Note: animatedBox is cleaned up in animateStepByStepInsertion
      
    } finally {
      this.isAnimating = false;
    }
  }
  
  createAnimatedBox(value, originalBox) {
    const rect = originalBox.getBoundingClientRect();
    const animatedBox = document.createElement('div');
    animatedBox.className = 'animated-box';
    animatedBox.textContent = value;
    animatedBox.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-color: #4CAF50;
      color: white;
      border: 2px solid #333;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      z-index: 1000;
      transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    return animatedBox;
  }
  
  async animateStepByStepInsertion(animatedBox, value) {
    let currentValue = value;
    let rowIndex = 0;
    let currentBox = animatedBox;
    
    while (true) {
      // If we need a new row, animate to it and place the value
      if (rowIndex >= this.pTableau.length) {
        await this.animateToNewRow(currentBox, rowIndex, currentValue);
        this.pTableau.push([currentValue]);
        this.updateTableauxDisplay();
        break;
      }
      
      const row = this.pTableau[rowIndex];
      
      // Animate to the left side of the current row
      await this.animateToRowStart(currentBox, rowIndex);
      
      // Find insertion position and animate left-to-right
      let insertIndex = -1;
      for (let j = 0; j < row.length; j++) {
        if (currentValue < row[j]) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex === -1) {
        // Add to end of row
        await this.animateLeftToRight(currentBox, rowIndex, row.length);
        row.push(currentValue);
        this.updateTableauxDisplay();
        break;
      } else {
        // Bump existing element
        await this.animateLeftToRight(currentBox, rowIndex, insertIndex);
        
        // Highlight the element that will be bumped
        await this.highlightBumpedElement(rowIndex, insertIndex);
        
        // Replace the element
        const bumpedValue = row[insertIndex];
        row[insertIndex] = currentValue;
        this.updateTableauxDisplay();
        
        // Remove current box
        if (currentBox && currentBox.parentNode) {
          document.body.removeChild(currentBox);
        }
        
        // Continue with bumped value on next row
        currentValue = bumpedValue;
        rowIndex++;
        
        // Create new animated box for the bumped value
        if (rowIndex < 10) { // Prevent infinite loops
          currentBox = this.createBumpedBox(bumpedValue, rowIndex - 1, insertIndex);
          document.body.appendChild(currentBox);
        } else {
          break;
        }
      }
    }
    
    // Clean up final box if it still exists
    if (currentBox && currentBox.parentNode) {
      document.body.removeChild(currentBox);
    }
  }
  
  async animateToRowStart(animatedBox, rowIndex) {
    const pTableauRect = this.pTableauSvg.getBoundingClientRect();
    const targetX = pTableauRect.left + this.tableauOffsetX - 60; // Start to the left of the tableau
    const targetY = pTableauRect.top + this.tableauOffsetY + rowIndex * (this.cellSize + this.cellPadding);
    
    animatedBox.style.transform = `translate(${targetX - parseInt(animatedBox.style.left)}px, ${targetY - parseInt(animatedBox.style.top)}px)`;
    await this.sleep(400);
  }
  
  async animateLeftToRight(animatedBox, rowIndex, colIndex) {
    const pTableauRect = this.pTableauSvg.getBoundingClientRect();
    const targetX = pTableauRect.left + this.tableauOffsetX + colIndex * (this.cellSize + this.cellPadding);
    const targetY = pTableauRect.top + this.tableauOffsetY + rowIndex * (this.cellSize + this.cellPadding);
    
    animatedBox.style.transform = `translate(${targetX - parseInt(animatedBox.style.left)}px, ${targetY - parseInt(animatedBox.style.top)}px)`;
    await this.sleep(500);
  }
  
  async animateToNewRow(animatedBox, rowIndex, value) {
    const pTableauRect = this.pTableauSvg.getBoundingClientRect();
    const targetX = pTableauRect.left + this.tableauOffsetX;
    const targetY = pTableauRect.top + this.tableauOffsetY + rowIndex * (this.cellSize + this.cellPadding);
    
    animatedBox.style.transform = `translate(${targetX - parseInt(animatedBox.style.left)}px, ${targetY - parseInt(animatedBox.style.top)}px)`;
    await this.sleep(500);
  }
  
  async highlightBumpedElement(row, col) {
    // Find the SVG cell at this position and highlight it red
    const cells = this.pTableauSvg.querySelectorAll('rect');
    const cellIndex = this.getCellIndex(row, col);
    
    if (cellIndex >= 0 && cellIndex < cells.length) {
      const cell = cells[cellIndex + 1]; // +1 because first rect is background
      if (cell) {
        const originalFill = cell.getAttribute('fill');
        cell.setAttribute('fill', '#ff5722'); // Red color
        await this.sleep(300);
        cell.setAttribute('fill', originalFill);
      }
    }
  }
  
  getCellIndex(row, col) {
    let index = 0;
    for (let r = 0; r < row; r++) {
      if (this.pTableau[r]) {
        index += this.pTableau[r].length;
      }
    }
    return index + col;
  }
  
  createBumpedBox(value, fromRow, fromCol) {
    const pTableauRect = this.pTableauSvg.getBoundingClientRect();
    const startX = pTableauRect.left + this.tableauOffsetX + fromCol * (this.cellSize + this.cellPadding);
    const startY = pTableauRect.top + this.tableauOffsetY + fromRow * (this.cellSize + this.cellPadding);
    
    const animatedBox = document.createElement('div');
    animatedBox.className = 'animated-box';
    animatedBox.textContent = value;
    animatedBox.style.cssText = `
      position: fixed;
      top: ${startY}px;
      left: ${startX}px;
      width: ${this.cellSize}px;
      height: ${this.cellSize}px;
      background-color: #ff5722;
      color: white;
      border: 2px solid #333;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      z-index: 1000;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    return animatedBox;
  }

  async animateBoxToTableau(animatedBox, insertionPath) {
    const pTableauRect = this.pTableauSvg.getBoundingClientRect();
    const finalRow = insertionPath[insertionPath.length - 1][0];
    const finalCol = insertionPath[insertionPath.length - 1][1];
    
    // Calculate final position
    const finalX = pTableauRect.left + this.tableauOffsetX + finalCol * (this.cellSize + this.cellPadding);
    const finalY = pTableauRect.top + this.tableauOffsetY + finalRow * (this.cellSize + this.cellPadding);
    
    // Animate to final position
    animatedBox.style.transform = `translate(${finalX - parseInt(animatedBox.style.left)}px, ${finalY - parseInt(animatedBox.style.top)}px) scale(0.95)`;
    
    // Wait for animation to complete
    await this.sleep(800);
  }
  
  calculateInsertionPath(value) {
    // This simulates the insertion to determine the path before actual insertion
    const tempTableau = this.deepCopy(this.pTableau);
    const path = [];
    let currentValue = value;
    let rowIndex = 0;
    
    while (true) {
      if (rowIndex >= tempTableau.length) {
        tempTableau.push([currentValue]);
        path.push([rowIndex, 0]);
        break;
      }
      
      const row = tempTableau[rowIndex];
      let insertIndex = -1;
      
      for (let j = 0; j < row.length; j++) {
        if (currentValue < row[j]) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex === -1) {
        row.push(currentValue);
        path.push([rowIndex, row.length - 1]);
        break;
      } else {
        const bumpedValue = row[insertIndex];
        row[insertIndex] = currentValue;
        path.push([rowIndex, insertIndex]);
        currentValue = bumpedValue;
        rowIndex++;
      }
    }
    
    return path;
  }
  
  performInsertion(value, position) {
    // Calculate the final position for Q tableau
    // We need to calculate this based on the current state before any changes
    const tempTableau = this.deepCopy(this.pTableau);
    const insertionPath = this.calculateInsertionPathOnTableau(tempTableau, value);
    const [row, col] = insertionPath[insertionPath.length - 1];
    this.insertIntoQTableau(row, col, position);
    
    // Final tableau display update
    this.updateTableauxDisplay();
  }
  
  calculateInsertionPathOnTableau(tableau, value) {
    const path = [];
    let currentValue = value;
    let rowIndex = 0;
    
    while (true) {
      if (rowIndex >= tableau.length) {
        tableau.push([currentValue]);
        path.push([rowIndex, 0]);
        break;
      }
      
      const row = tableau[rowIndex];
      let insertIndex = -1;
      
      for (let j = 0; j < row.length; j++) {
        if (currentValue < row[j]) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex === -1) {
        row.push(currentValue);
        path.push([rowIndex, row.length - 1]);
        break;
      } else {
        const bumpedValue = row[insertIndex];
        row[insertIndex] = currentValue;
        path.push([rowIndex, insertIndex]);
        currentValue = bumpedValue;
        rowIndex++;
      }
    }
    
    return path;
  }
  
  insertIntoTableau(value) {
    const path = [];
    let currentValue = value;
    let rowIndex = 0;
    
    while (true) {
      if (rowIndex >= this.pTableau.length) {
        this.pTableau.push([currentValue]);
        path.push([rowIndex, 0]);
        break;
      }
      
      const row = this.pTableau[rowIndex];
      let insertIndex = -1;
      
      for (let j = 0; j < row.length; j++) {
        if (currentValue < row[j]) {
          insertIndex = j;
          break;
        }
      }
      
      if (insertIndex === -1) {
        row.push(currentValue);
        path.push([rowIndex, row.length - 1]);
        break;
      } else {
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
    while (this.qTableau.length <= row) {
      this.qTableau.push([]);
    }
    
    while (this.qTableau[row].length <= col) {
      this.qTableau[row].push(null);
    }
    
    this.qTableau[row][col] = value;
  }
  
  initializeTableaux() {
    this.setupSvgTableau(this.pTableauSvg);
    this.setupSvgTableau(this.qTableauSvg);
    this.updateTableauxDisplay();
  }
  
  setupSvgTableau(svg) {
    svg.innerHTML = '';
    // Add background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', '#f9f9f9');
    bg.setAttribute('stroke', '#ddd');
    bg.setAttribute('stroke-width', '1');
    svg.appendChild(bg);
  }
  
  updateTableauxDisplay() {
    this.renderTableau(this.pTableauSvg, this.pTableau, '#e3f2fd');
    this.renderTableau(this.qTableauSvg, this.qTableau, '#f3e5f5');
  }
  
  renderTableau(svg, tableau, bgColor) {
    // Clear existing content except background
    const bg = svg.querySelector('rect');
    svg.innerHTML = '';
    svg.appendChild(bg);
    
    if (!tableau || tableau.length === 0) {
      this.renderEmptyTableau(svg);
      return;
    }
    
    for (let i = 0; i < tableau.length; i++) {
      for (let j = 0; j < tableau[i].length; j++) {
        if (tableau[i][j] !== null && tableau[i][j] !== undefined) {
          this.renderCell(svg, i, j, tableau[i][j], bgColor);
        }
      }
    }
  }
  
  renderEmptyTableau(svg) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '200');
    text.setAttribute('y', '150');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('fill', '#999');
    text.setAttribute('font-style', 'italic');
    text.textContent = 'Empty tableau';
    svg.appendChild(text);
  }
  
  renderCell(svg, row, col, value, bgColor) {
    const x = this.tableauOffsetX + col * (this.cellSize + this.cellPadding);
    const y = this.tableauOffsetY + row * (this.cellSize + this.cellPadding);
    
    // Cell background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', this.cellSize);
    rect.setAttribute('height', this.cellSize);
    rect.setAttribute('fill', bgColor);
    rect.setAttribute('stroke', '#333');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '4'); // Rounded corners
    svg.appendChild(rect);
    
    // Cell text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x + this.cellSize / 2);
    text.setAttribute('y', y + this.cellSize / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-size', '16');
    text.textContent = value;
    svg.appendChild(text);
  }
  
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.remove('hidden');
  }
  
  hideError() {
    this.errorMessage.classList.add('hidden');
  }
  
  reset() {
    this.pTableau = [];
    this.qTableau = [];
    this.currentPermutation = [];
    this.isAnimating = false;
    
    this.hideError();
    this.setupNumberBoxes();
    this.updatePermutationDisplay();
    this.updateTableauxDisplay();
    this.currentStepDisplay.textContent = 'Select numbers above to see the Robinson-Schensted algorithm in action';
  }
  
  deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new RobinsonSchenstedApp();
});