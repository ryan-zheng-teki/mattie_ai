/**
 * Mathematical solution for the Ellipse Ratio Problem
 */

// Function to show the mathematical explanation panel
function showMathematicalExplanation() {
  const mathPanel = document.getElementById('math-explanation');
  if (mathPanel) {
    mathPanel.style.display = 'block';
  }
}

// Function to hide the mathematical explanation panel
function hideMathematicalExplanation() {
  const mathPanel = document.getElementById('math-explanation');
  if (mathPanel) {
    mathPanel.style.display = 'none';
  }
}

// Function to initialize the mathematical explanation panel
function initMathExplanation() {
  const closeButton = document.getElementById('close-math-panel');
  const showMathButton = document.getElementById('show-math-button');
  
  if (closeButton) {
    closeButton.addEventListener('click', hideMathematicalExplanation);
  }
  
  if (showMathButton) {
    showMathButton.addEventListener('click', showMathematicalExplanation);
  }
  
  // Prepare the content
  const mathContent = document.getElementById('math-content');
  if (mathContent) {
    mathContent.innerHTML = `
      <div class="math-step">
        <h4>Step 1: Parametric Representation</h4>
        <p>First, let's represent points on the ellipses parametrically:</p>
        <p class="math">Ellipse C: x = 2cos(θ), y = sin(θ)</p>
        <p class="math">Ellipse E: x = 4cos(φ), y = 2sin(φ)</p>
        <p>Where θ and φ are parameters.</p>
      </div>
      
      <div class="math-step">
        <h4>Step 2: Point P on Ellipse C</h4>
        <p>Let P be a point on ellipse C with parameter θ:</p>
        <p class="math">P = (2cos(θ), sin(θ))</p>
        <p>We can verify this point satisfies the equation of ellipse C:</p>
        <p class="math">(2cos(θ))²/4 + (sin(θ))² = cos²(θ) + sin²(θ) = 1</p>
      </div>
      
      <div class="math-step">
        <h4>Step 3: Ray OP Equation</h4>
        <p>The ray OP from the origin through P can be parametrized as:</p>
        <p class="math">r(t) = t · (2cos(θ), sin(θ)) for t > 0</p>
        <p>Where t is a positive real number. Note that t = 1 gives us point P.</p>
      </div>
      
      <div class="math-step">
        <h4>Step 4: Find Intersection with Ellipse E</h4>
        <p>To find where ray OP intersects ellipse E (point Q), we substitute the ray equation into ellipse E's equation:</p>
        <p class="math">(2t·cos(θ))²/16 + (t·sin(θ))²/4 = 1</p>
        <p>Simplifying:</p>
        <p class="math">t²·cos²(θ)/4 + t²·sin²(θ)/4 = 1</p>
        <p class="math">t²/4 · (cos²(θ) + sin²(θ)) = 1</p>
        <p>Since cos²(θ) + sin²(θ) = 1, we get:</p>
        <p class="math">t²/4 = 1</p>
        <p class="math">t² = 4</p>
        <p class="math">t = 2 (since t > 0)</p>
      </div>
      
      <div class="math-step">
        <h4>Step 5: Calculate Point Q</h4>
        <p>Using t = 2 in our ray equation:</p>
        <p class="math">Q = r(2) = 2 · (2cos(θ), sin(θ)) = (4cos(θ), 2sin(θ))</p>
        <p>We can verify Q is on ellipse E:</p>
        <p class="math">(4cos(θ))²/16 + (2sin(θ))²/4 = cos²(θ) + sin²(θ) = 1</p>
      </div>
      
      <div class="math-step">
        <h4>Step 6: Calculate the Ratio |OQ|/|OP|</h4>
        <p>Now we can calculate the ratio |OQ|/|OP|:</p>
        <p class="math">|OP| = √((2cos(θ))² + (sin(θ))²)</p>
        <p class="math">|OQ| = √((4cos(θ))² + (2sin(θ))²)</p>
        <p class="math">|OQ| = √(16cos²(θ) + 4sin²(θ))</p>
        <p class="math">|OQ| = 2·√(4cos²(θ) + sin²(θ))</p>
        <p class="math">|OQ|/|OP| = 2·√(4cos²(θ) + sin²(θ))/√(4cos²(θ) + sin²(θ)) = 2</p>
      </div>
      
      <div class="math-step">
        <h4>Step 7: Key Insight</h4>
        <p>The essential insight is that Q = 2P along the ray OP. This means:</p>
        <p class="math">For ANY point P on ellipse C, the point Q = 2P will always lie on ellipse E.</p>
        <p>This explains why the ratio |OQ|/|OP| = 2 is constant, regardless of where P is chosen on ellipse C.</p>
        <p>Another way to view this: If you double every point on ellipse C from the origin, you get exactly ellipse E.</p>
      </div>
      
      <div class="math-step">
        <h4>Step 8: Visual Interpretation</h4>
        <p>You can see this by dragging point P in Step 5 of the interactive visualization. As P moves along ellipse C, Q moves along ellipse E, and the ratio |OQ|/|OP| remains constant at 2.</p>
        <p>This relationship exists because ellipse E is a scaled version of ellipse C with respect to the origin, with a scaling factor of 2.</p>
      </div>
    `;
  }
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initMathExplanation);
