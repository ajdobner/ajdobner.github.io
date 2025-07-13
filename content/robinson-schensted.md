---
title: Robinson-Schensted Bijection
---

# Robinson-Schensted Bijection

The Robinson-Schensted bijection is a fundamental correspondence in combinatorics that establishes a bijection between permutations of length $n$ and pairs of standard Young tableaux of the same shape.

## Interactive Demonstration

Enter a permutation below to see the Robinson-Schensted algorithm in action:

<div id="robinson-schensted-app">
  <div class="input-section">
    <label for="permutation-input">Enter permutation (space-separated numbers):</label>
    <input type="text" id="permutation-input" placeholder="3 1 4 2" value="3 1 4 2">
    <button id="run-algorithm">Run Algorithm</button>
    <button id="step-through">Step Through</button>
    <button id="reset">Reset</button>
  </div>
  
  <div id="error-message" class="error hidden"></div>
  
  <div class="algorithm-display">
    <div class="step-info">
      <p id="current-step"></p>
    </div>
    
    <div class="tableaux-container">
      <div class="tableau-section">
        <h3>P-tableau (Insertion)</h3>
        <div id="p-tableau" class="tableau"></div>
      </div>
      
      <div class="tableau-section">
        <h3>Q-tableau (Recording)</h3>
        <div id="q-tableau" class="tableau"></div>
      </div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/assets/robinson-schensted.css">
<script src="/assets/robinson-schensted.js"></script>

## Algorithm Description

The Robinson-Schensted algorithm works as follows:

1. **Initialization**: Start with two empty tableaux, $P$ and $Q$.

2. **For each element $x$ in the permutation**:
   - **Insert** $x$ into tableau $P$ using the bumping procedure
   - **Record** the position of insertion in tableau $Q$

3. **Bumping procedure**: 
   - Find the leftmost position in the first row where $x$ can be inserted
   - If no such position exists, add $x$ to the end of the first row
   - Otherwise, $x$ "bumps" the existing element, and the bumped element is inserted into the next row

The result is a pair $(P, Q)$ of standard Young tableaux of the same shape, establishing the bijection.

## Properties

- The algorithm is **reversible**: Given a pair of standard Young tableaux of the same shape, we can recover the original permutation
- The **length of the longest increasing subsequence** in the permutation equals the number of rows in the tableaux
- The **length of the longest decreasing subsequence** in the permutation equals the number of columns in the tableaux