## 🧩 Interactive Math Visualization Website Template (Prompt for LLM)

**Prompt to LLM:**

> You are given the following geometry/math problem. Your task is to generate a complete implementation for visualizing and solving the problem according to our project structure. You should create multiple files following our established patterns.

---

### 📐 Problem Description
```
[INSERT MATH PROBLEM HERE]
e.g. Given an angle ∠AOB and a point P inside the angle, construct triangle △PCD with minimum perimeter, where C lies on OA and D on OB.
```

---

### 🧱 Output Requirements

#### 1. Project Structure
You must create files following this structure:
- `public/problems/{problem-name}.html` - The problem's HTML page
- `public/js/problems/{problem-name}/config.js` - Configuration for the problem
- `public/js/problems/{problem-name}/index.js` - Implementation of the visualization

Where `{problem-name}` should be a kebab-case name derived from the problem (e.g., "min-perimeter" for minimum perimeter triangle).

#### 2. Page Layout
The HTML page must be split into two main parts:
- **Left Panel**: Step-by-step explanation ("解题步骤")
- **Right Panel**: Interactive canvas (Konva.js visualization)

#### 3. Implementation Features
Your solution must include:
- A step-by-step visualization with 3-5 clear steps
- Interactive elements (draggable points)
- Clear animations between steps
- Proper explanation of the mathematical solution

#### 4. Technical Requirements
- Use Konva.js with GSAP for animations
- Utilize our shared utility functions where appropriate
- Ensure responsive design
- Include keyboard shortcuts (1-5 for steps, Space for interaction, C to clear)

---

### 📚 File Examples

Below are examples for each file you need to create. Replace `{problem-name}` with an appropriate kebab-case name for your problem (e.g., "circle-tangent", "triangle-centroid", etc.).

#### public/problems/{problem-name}.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Problem Name] - Math Visualizations</title>
  <link rel="stylesheet" href="/css/styles.css">
  <!-- Include Konva and GSAP -->
  <script src="https://unpkg.com/konva@8.3.2/konva.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.0/gsap.min.js"></script>
</head>
<body>
  <header>
    <div class="container">
      <h1>Interactive Math Visualizations</h1>
    </div>
  </header>
  
  <main class="container">
    <section class="intro">
      <h2>[Problem Name]</h2>
      <p>[Brief description of the problem]</p>
    </section>
    
    <div class="visualization-container">
      <!-- Left Panel: Steps -->
      <div id="steps-container">
        <h2>解题步骤</h2>
        <ul id="steps-list">
          <li data-step="1" class="active">
            <strong>1. [Step 1 Name]</strong>
            <p>[Step 1 description]</p>
          </li>
          <li data-step="2">
            <strong>2. [Step 2 Name]</strong>
            <p>[Step 2 description]</p>
          </li>
          <li data-step="3">
            <strong>3. [Step 3 Name]</strong>
            <p>[Step 3 description]</p>
          </li>
          <li data-step="4">
            <strong>4. [Step 4 Name]</strong>
            <p>[Step 4 description]</p>
          </li>
          <li data-step="5">
            <strong>5. [Step 5 Name]</strong>
            <p>[Step 5 description]</p>
          </li>
          <li data-step="interactive">
            <strong>交互模式</strong>
            <p>拖动点查看效果</p>
          </li>
          <li data-step="clear">
            <strong>清空画面</strong>
            <p>重置可视化</p>
          </li>
        </ul>
      </div>
      
      <!-- Right Panel: Canvas -->
      <div id="canvas-container">
        <div id="konva-stage-container" class="konva-container"></div>
      </div>
    </div>
    
    <div id="controls-container">
      快捷键: <kbd>1</kbd>-<kbd>5</kbd> 步骤 | <kbd>空格</kbd> 交互模式 | <kbd>C</kbd> 清空
    </div>
  </main>
  
  <footer>
    <div class="container">
      <p>&copy; 2025 Math Visualizations</p>
    </div>
  </footer>

  <!-- Load utility scripts first -->
  <script src="/js/utils/geometry.js"></script>
  <script src="/js/utils/animation.js"></script>
  
  <!-- Load problem-specific scripts -->
  <script src="/js/problems/{problem-name}/config.js"></script>
  <script src="/js/problems/{problem-name}/index.js"></script>
</body>
</html>
```

#### public/js/problems/{problem-name}/config.js

```javascript
/**
 * Configuration for the [Problem Name] visualization
 */
const config = {
  // These will be initialized after stage is created
  origin: { x: 0, y: 0 },
  // Add problem-specific parameters here
  
  // Colors
  colors: {
    rays: '#333',
    pointA: '#ff5722', 
    pointB: '#e91e63',
    pointC: '#03a9f4',
    constructionLine: '#ff9800',
    finalShape: '#d50000',
    labels: '#555',
    helperLines: '#aaa'
  },
  
  // Enhanced styling properties
  styles: {
    pointShadowBlur: 10,
    pointShadowOpacity: 0.3,
    rayGlow: 5,
    shapeLineWidth: 3.5,
    pointRadius: 7
  },
  
  // Animation settings
  animDuration: 0.8, // Duration for drawing animations (in seconds)
  
  // Enhanced easing options
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
```

#### public/js/problems/{problem-name}/index.js

```javascript
/**
 * [Problem Name] Visualization
 * 
 * This visualization demonstrates [brief description]
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, shadowLayer, gridLayer;
let elements = {}; // Store Konva objects
let currentActiveStep = 0;
let isPDraggable = false; // Flag to control draggability of point P

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();
  
  // Draw the initial state
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();
  shadowLayer.draw();
});

// Initialize Konva stage and layers
function initKonva() {
  const stageContainer = document.getElementById('konva-stage-container');
  const stageWidth = stageContainer.clientWidth;
  const stageHeight = stageContainer.clientHeight;

  stage = new Konva.Stage({
    container: 'konva-stage-container',
    width: stageWidth,
    height: stageHeight,
  });

  // Create layers
  layer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  shadowLayer = new Konva.Layer();
  gridLayer = new Konva.Layer();
  
  // Add layers to stage
  stage.add(backgroundLayer);
  stage.add(shadowLayer);
  stage.add(layer);
  stage.add(gridLayer);
  
  // Move layers to proper order
  stage.moveToBottom(gridLayer);
  stage.moveToBottom(backgroundLayer);

  // Create gradient background
  const backgroundRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
    fillLinearGradient: {
      start: { x: 0, y: 0 },
      end: { x: stageWidth, y: stageHeight },
      colorStops: [0, '#f9f9ff', 1, '#eef5ff']
    }
  });
  backgroundLayer.add(backgroundRect);

  // Create subtle grid pattern
  const gridSpacing = 20;
  
  // Draw vertical grid lines
  for (let x = gridSpacing; x < stageWidth; x += gridSpacing) {
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: '#e0e0e0',
      strokeWidth: 1
    });
    gridLayer.add(line);
  }

  // Draw horizontal grid lines
  for (let y = gridSpacing; y < stageHeight; y += gridSpacing) {
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: '#e0e0e0',
      strokeWidth: 1
    });
    gridLayer.add(line);
  }
  
  // Initialize config based on stage dimensions
  config.origin = { x: stageWidth / 2, y: stageHeight / 2 };
  // Initialize other config properties based on stage dimensions
}

// Set up event listeners
function initEventListeners() {
  // Listen for step list clicks
  const stepsList = document.getElementById('steps-list');
  const stepItems = stepsList.querySelectorAll('li[data-step]');

  stepsList.addEventListener('click', (event) => {
    const targetLi = event.target.closest('li');
    if (!targetLi) return; // Click wasn't on or inside an li

    const step = targetLi.getAttribute('data-step');

    // Remove active class from all items
    stepItems.forEach(item => item.classList.remove('active'));

    if (step === 'clear') {
      clearCanvas();
      currentActiveStep = 0;
      console.log("Clear action triggered");
    } else if (step === 'interactive') {
      toggleInteractivity();
      targetLi.classList.add('active');
    } else if (step) {
      const stepNum = parseInt(step, 10);
      console.log(`Clicked Step: ${stepNum}`);

      // Add active class to the clicked item
      targetLi.classList.add('active');
      currentActiveStep = stepNum;

      // Execute the corresponding function
      switch (stepNum) {
        case 1: drawStep1(); break;
        case 2: drawStep2(); break;
        case 3: drawStep3(); break;
        case 4: drawStep4(); break;
        case 5: drawStep5(); break;
        default: console.warn(`Step ${stepNum} not implemented.`);
      }
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 trigger steps
    if (e.key >= '1' && e.key <= '5') {
      const stepNum = parseInt(e.key);
      switch (stepNum) {
        case 1: drawStep1(); break;
        case 2: drawStep2(); break;
        case 3: drawStep3(); break;
        case 4: drawStep4(); break;
        case 5: drawStep5(); break;
      }
      
      // Update active class in UI
      stepItems.forEach(item => {
        if (item.getAttribute('data-step') === e.key) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      currentActiveStep = stepNum;
    }
    
    // Spacebar to toggle point P draggability
    if (e.key === ' ' || e.code === 'Space') {
      toggleInteractivity();
    }
    
    // 'C' key to clear
    if (e.key === 'c' || e.key === 'C') {
      clearCanvas();
      currentActiveStep = 0;
      stepItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const stageContainer = document.getElementById('konva-stage-container');
    const newWidth = stageContainer.clientWidth;
    const newHeight = stageContainer.clientHeight;
    
    // Only resize if significant change occurred
    if (Math.abs(newWidth - stage.width()) > 50 || Math.abs(newHeight - stage.height()) > 50) {
      // Update stage dimensions
      stage.width(newWidth);
      stage.height(newHeight);
      
      // Update background and grid
      backgroundLayer.findOne('Rect').width(newWidth);
      backgroundLayer.findOne('Rect').height(newHeight);
      
      // Redraw everything
      backgroundLayer.draw();
      gridLayer.draw();
      shadowLayer.draw();
      layer.draw();
    }
  });
}

// --- Helper Functions ---

// Function to make Point P draggable and update construction
function makePointPDraggable() {
  if (!elements.pointP || isPDraggable) return;
  
  isPDraggable = true;
  elements.pointP.draggable(true);
  
  // Add visual cue that point is draggable
  elements.pointP.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
    this.strokeEnabled(true);
    this.stroke('#fff');
    this.strokeWidth(2);
    this.scale({ x: 1.2, y: 1.2 });
    layer.batchDraw();
  });
  
  elements.pointP.on('mouseout', function() {
    document.body.style.cursor = 'default';
    this.strokeEnabled(false);
    this.scale({ x: 1, y: 1 });
    layer.batchDraw();
  });
  
  // Update construction on drag (throttled for performance)
  let dragThrottleTimeout = null;
  
  elements.pointP.on('dragmove', function() {
    // Clear any existing timeout
    if (dragThrottleTimeout) clearTimeout(dragThrottleTimeout);
    
    // Set new timeout to update construction
    dragThrottleTimeout = setTimeout(() => {
      // Update point position in config
      const x = this.x();
      const y = this.y();
      
      // Update dependent elements
      // This will vary based on your specific problem
      
      // Update text position
      if (elements.textP) {
        elements.textP.x(x + 10);
        elements.textP.y(y - 20);
      }
      
      layer.batchDraw();
    }, 10); // 10ms throttling for smooth performance
  });
}

// Toggle interactivity mode
function toggleInteractivity() {
  if (!elements.pointP) return;
  
  isPDraggable = !isPDraggable;
  
  if (isPDraggable) {
    makePointPDraggable();
    // Add visual indicator that dragging is enabled
    const dragHelp = new Konva.Text({
      x: 20,
      y: 20,
      text: "Drag point P to explore!",
      fontSize: 14,
      fill: '#777',
      padding: 5,
      background: '#f0f0f0',
      cornerRadius: 3
    });
    layer.add(dragHelp);
    elements.dragHelp = dragHelp;
  } else {
    elements.pointP.draggable(false);
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
    }
  }
  
  layer.batchDraw();
}

// Clear canvas function
function clearCanvas() {
  gsap.killTweensOf(layer.getChildren()); // Stop any running animations
  layer.destroyChildren(); // Remove all shapes
  shadowLayer.destroyChildren(); // Clear shadow layer
  elements = {}; // Clear references
  layer.batchDraw();
  shadowLayer.batchDraw();
  isPDraggable = false; // Reset draggable state
  console.log("Canvas cleared");
}

// --- Step Functions ---

function drawStep1() {
  console.log("Executing Step 1");
  clearCanvas(); // Start fresh for this step

  // Create your initial elements here
  // Example: Create a point
  const pointP = new Konva.Circle({
    x: stage.width() / 2,
    y: stage.height() / 2,
    radius: config.styles.pointRadius,
    fill: config.colors.pointA,
    visible: false
  });
  layer.add(pointP);
  elements.pointP = pointP;
  
  // Create label
  const textP = new Konva.Text({
    x: pointP.x() + 10,
    y: pointP.y() - 20,
    text: 'P',
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  layer.add(textP);
  elements.textP = textP;
  
  // Animate element appearances
  animateAppear(pointP, config.animDuration, 0, true, layer);
  animateAppear(textP, config.animDuration * 0.5, config.animDuration * 0.3, false, layer);
  
  layer.batchDraw();
}

function drawStep2() {
  console.log("Executing Step 2");
  if (!elements.pointP) { drawStep1(); } // Ensure previous step exists
  
  // Create step 2 elements
  // Example: Draw a line
  const line = new Konva.Line({
    points: [
      elements.pointP.x(), elements.pointP.y(),
      elements.pointP.x() + 100, elements.pointP.y() - 100
    ],
    stroke: config.colors.rays,
    strokeWidth: 2,
    visible: false
  });
  layer.add(line);
  elements.line = line;
  
  // Animate line drawing
  animateDrawLine(line, config.animDuration, 0, true, config.colors.rays, layer);
  
  layer.batchDraw();
}

function drawStep3() {
  console.log("Executing Step 3");
  // Implement step 3
  // This will depend on your specific problem
}

function drawStep4() {
  console.log("Executing Step 4");
  // Implement step 4
  // This will depend on your specific problem
}

function drawStep5() {
  console.log("Executing Step 5");
  // Implement step 5
  // This will depend on your specific problem
}
```

---

### 🔍 Important Notes

1. Replace `{problem-name}` with an appropriate kebab-case name for your problem in all file paths.

2. The implementation shown uses utility functions from:
   - `/js/utils/animation.js` - Contains functions like `animateDrawLine()`, `animateAppear()`
   - `/js/utils/geometry.js` - Contains functions for geometric calculations

3. Follow the established pattern:
   - Each step function should build on previous steps
   - Check if previous elements exist before proceeding
   - Clear the canvas at the beginning of step 1
   - Use animation utilities for smooth transitions

4. Make all necessary elements draggable in interactive mode and implement appropriate update logic.

5. The specific implementation details will vary based on your mathematical problem, but the structure should remain consistent.

6. Ensure clear explanations for each step in the HTML file.
