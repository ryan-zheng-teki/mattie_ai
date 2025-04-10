/**
 * Set Intersection Constraint Visualization
 * 
 * This visualization demonstrates how the set Sω = {θ | 2^2025 + ω·θ is divisible by 7}
 * behaves under the constraint |Sω ∩ (a, a+ne^(-0.5n))| ≤ 3 for any real a and positive integer n.
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, gridLayer;
let elements = {}; // Store Konva objects
let currentActiveStep = 0;
let autoModeInterval = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();
  initControls();
  
  // Draw the initial state
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();
  
  // Start with step 1
  drawStep1();
});

// Initialize Konva stage and layers
function initKonva() {
  const stageContainer = document.getElementById('konva-stage-container');
  const stageWidth = stageContainer.clientWidth;
  const stageHeight = stageContainer.clientHeight;
  
  config.canvasWidth = stageWidth;
  config.canvasHeight = stageHeight;
  config.numberLineYPos = stageHeight / 2;

  stage = new Konva.Stage({
    container: 'konva-stage-container',
    width: stageWidth,
    height: stageHeight,
  });

  // Create layers
  layer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  gridLayer = new Konva.Layer();
  
  // Add layers to stage
  stage.add(gridLayer);
  stage.add(backgroundLayer);
  stage.add(layer);

  // Create background
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
      stroke: config.colors.grid,
      strokeWidth: 1
    });
    gridLayer.add(line);
  }

  // Draw horizontal grid lines
  for (let y = gridSpacing; y < stageHeight; y += gridSpacing) {
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: config.colors.grid,
      strokeWidth: 1
    });
    gridLayer.add(line);
  }
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
    } else if (step) {
      const stepNum = parseInt(step, 10);
      console.log(`Clicked Step: ${stepNum}`);

      // Add active class to the clicked item
      targetLi.classList.add('active');
      currentActiveStep = stepNum;

      // Execute the corresponding function
      executeStep(stepNum);
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 trigger steps
    if (e.key >= '1' && e.key <= '5') {
      const stepNum = parseInt(e.key);
      executeStep(stepNum);
      
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
    
    // 'C' key to clear
    if (e.key === 'c' || e.key === 'C') {
      clearCanvas();
      currentActiveStep = 0;
      stepItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Auto mode button
  const autoModeButton = document.getElementById('auto-mode-button');
  autoModeButton.addEventListener('click', toggleAutoMode);

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
      config.canvasWidth = newWidth;
      config.canvasHeight = newHeight;
      config.numberLineYPos = newHeight / 2;
      
      // Update background
      backgroundLayer.findOne('Rect').width(newWidth);
      backgroundLayer.findOne('Rect').height(newHeight);
      
      // Redraw current step
      if (currentActiveStep > 0) {
        executeStep(currentActiveStep);
      }
      
      // Redraw everything
      backgroundLayer.draw();
      gridLayer.draw();
      layer.draw();
    }
  });
}

// Initialize control sliders
function initControls() {
  const omegaSlider = document.getElementById('omega-slider');
  const omegaValue = document.getElementById('omega-value');
  const intervalSlider = document.getElementById('interval-slider');
  const intervalValue = document.getElementById('interval-value');
  const positionSlider = document.getElementById('position-slider');
  const positionValue = document.getElementById('position-value');
  
  // Set initial values
  omegaValue.textContent = config.omega.toFixed(1);
  intervalValue.textContent = config.n;
  positionValue.textContent = config.a;
  
  // Add event listeners
  omegaSlider.addEventListener('input', (e) => {
    config.omega = parseFloat(e.target.value);
    omegaValue.textContent = config.omega.toFixed(1);
    
    // Update visualization if we're in the appropriate step
    if (currentActiveStep >= 2) {
      updateVisualization();
    }
  });
  
  intervalSlider.addEventListener('input', (e) => {
    config.n = parseInt(e.target.value);
    intervalValue.textContent = config.n;
    
    // Update visualization if we're in the appropriate step
    if (currentActiveStep >= 3) {
      updateVisualization();
    }
  });
  
  positionSlider.addEventListener('input', (e) => {
    config.a = parseFloat(e.target.value);
    positionValue.textContent = config.a;
    
    // Update visualization if we're in the appropriate step
    if (currentActiveStep >= 3) {
      updateVisualization();
    }
  });
}

// Execute a specific step
function executeStep(stepNum) {
  switch (stepNum) {
    case 1: drawStep1(); break;
    case 2: drawStep2(); break;
    case 3: drawStep3(); break;
    case 4: drawStep4(); break;
    case 5: drawStep5(); break;
    default: console.warn(`Step ${stepNum} not implemented.`);
  }
}

// Toggle auto demonstration mode
function toggleAutoMode() {
  const button = document.getElementById('auto-mode-button');
  
  if (autoModeInterval) {
    // Stop auto mode
    clearInterval(autoModeInterval);
    autoModeInterval = null;
    button.textContent = 'Start Auto Demonstration';
    button.classList.remove('stop');
  } else {
    // Start auto mode
    button.textContent = 'Stop Auto Demonstration';
    button.classList.add('stop');
    
    // Reset to step 1
    clearCanvas();
    currentActiveStep = 0;
    
    // Update active class in UI
    const stepItems = document.querySelectorAll('#steps-list li[data-step]');
    stepItems.forEach(item => item.classList.remove('active'));
    
    // Start auto cycle through steps
    autoModeInterval = setInterval(() => {
      currentActiveStep = (currentActiveStep % 5) + 1;
      
      // Update UI
      stepItems.forEach(item => {
        if (item.getAttribute('data-step') == currentActiveStep) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      // Execute step
      executeStep(currentActiveStep);
      
      // If we reached the last step, pause for a moment before restarting
      if (currentActiveStep === 5) {
        clearInterval(autoModeInterval);
        setTimeout(() => {
          if (autoModeInterval !== null) { // Check if still in auto mode
            autoModeInterval = setInterval(arguments.callee, 3000);
          }
        }, 5000);
      }
    }, 3000); // Change step every 3 seconds
  }
}

// Update visualization based on current parameters
function updateVisualization() {
  // Update based on current step
  if (currentActiveStep > 0) {
    executeStep(currentActiveStep);
  }
}

// Clear canvas function
function clearCanvas() {
  gsap.killTweensOf(layer.getChildren()); // Stop any running animations
  layer.destroyChildren(); // Remove all shapes
  elements = {}; // Clear references
  layer.draw();
  console.log("Canvas cleared");
}

// --- Mathematical Helper Functions ---

// Calculate elements of Sω within a given range
function calculateSetElements(omega, start, end, maxCount) {
  const result = [];
  
  // Use modular arithmetic: 2^2025 ≡ 2^(2025 mod 6) ≡ 2^3 ≡ 1 (mod 7)
  // So we're looking for values of θ where 1 + ω·θ ≡ 0 (mod 7)
  // This means ω·θ ≡ 6 (mod 7)
  
  // For simplicity, we'll generate a periodic pattern of elements
  // The period will be 7/gcd(7, ω)
  
  // Calculate period based on ω
  let period;
  if (Math.abs(omega % 7) < 0.0001) {
    // If ω is divisible by 7, no solutions exist
    return [];
  } else if (Number.isInteger(omega) && math.gcd(omega, 7) === 1) {
    // If ω is coprime to 7, period is 7
    period = 7;
  } else {
    // For rational ω = p/q where p, q are integers
    // Need to find the period based on modular multiplicative inverse
    // Approximate with a numerical approach for simplicity
    period = 7;
  }
  
  // Starting value for θ: solve ω·θ ≡ 6 (mod 7)
  // This is θ ≡ 6·ω^(-1) (mod 7) where ω^(-1) is the modular multiplicative inverse
  let baseValue = 0;
  for (let i = 0; i < 7; i++) {
    if (Math.round((1 + omega * i) % 7) === 0) {
      baseValue = i;
      break;
    }
  }
  
  // Generate elements
  let count = 0;
  let currentValue = Math.floor(start / period) * period + baseValue;
  
  // Adjust to ensure we start before or at 'start'
  while (currentValue > start) {
    currentValue -= period;
  }
  
  // Generate elements up to 'end' or maxCount
  while (currentValue <= end && count < maxCount) {
    if (currentValue >= start) {
      result.push(currentValue);
      count++;
    }
    currentValue += period;
  }
  
  return result;
}

// Calculate intersection of Sω with interval (a, a + ne^(-0.5n))
function calculateIntersection(omega, a, n) {
  const intervalEnd = a + n * Math.exp(-0.5 * n);
  return calculateSetElements(omega, a, intervalEnd, 100).filter(
    x => x > a && x < intervalEnd
  );
}

// --- Step Functions ---

function drawStep1() {
  console.log("Executing Step 1: Understanding the Set");
  clearCanvas();
  
  // Draw number line
  const lineLength = config.canvasWidth - 100;
  const startX = 50;
  const endX = startX + lineLength;
  
  elements.numberLine = new Konva.Line({
    points: [startX, config.numberLineYPos, endX, config.numberLineYPos],
    stroke: config.colors.numberLine,
    strokeWidth: config.styles.lineWidth,
    visible: false
  });
  
  // Draw ticks and labels
  const tickLength = 10;
  const tickCount = 11; // -5 to 5
  const tickSpacing = lineLength / (tickCount - 1);
  
  elements.ticks = [];
  elements.tickLabels = [];
  
  for (let i = 0; i < tickCount; i++) {
    const x = startX + i * tickSpacing;
    const value = i - 5; // -5 to 5
    
    // Tick
    const tick = new Konva.Line({
      points: [x, config.numberLineYPos - tickLength/2, x, config.numberLineYPos + tickLength/2],
      stroke: config.colors.numberLine,
      strokeWidth: config.styles.lineWidth,
      visible: false
    });
    
    // Label
    const label = new Konva.Text({
      x: x,
      y: config.numberLineYPos + tickLength + 5,
      text: value.toString(),
      fontSize: config.styles.annotationFontSize,
      fill: config.colors.annotation,
      align: 'center',
      visible: false
    });
    label.offsetX(label.width() / 2);
    
    elements.ticks.push(tick);
    elements.tickLabels.push(label);
    layer.add(tick, label);
  }
  
  // Add title text
  elements.titleText = new Konva.Text({
    x: config.canvasWidth / 2,
    y: 30,
    text: "Understanding the Set Sω",
    fontSize: 20,
    fontStyle: 'bold',
    fill: config.colors.annotation,
    align: 'center',
    visible: false
  });
  elements.titleText.offsetX(elements.titleText.width() / 2);
  
  // Add explanation text
  elements.explanationText = new Konva.Text({
    x: config.canvasWidth / 2,
    y: config.numberLineYPos - 80,
    text: "Sω = { θ | 2^2025 + ω·θ is divisible by 7 }\n" +
          "The elements of this set form a regular pattern along the number line,\n" +
          "with spacing that depends on the value of ω.",
    fontSize: 16,
    fill: config.colors.annotation,
    align: 'center',
    visible: false
  });
  elements.explanationText.offsetX(elements.explanationText.width() / 2);
  
  layer.add(elements.numberLine, elements.titleText, elements.explanationText);
  
  // Animations
  animateAppear(elements.titleText, config.animDuration * 0.5, 0, false, layer);
  animateAppear(elements.explanationText, config.animDuration * 0.8, 0.3, false, layer);
  animateAppear(elements.numberLine, config.animDuration, 0.5, false, layer);
  
  // Animate ticks and labels
  for (let i = 0; i < elements.ticks.length; i++) {
    animateAppear(elements.ticks[i], config.animDuration * 0.5, 0.5 + i * 0.05, false, layer);
    animateAppear(elements.tickLabels[i], config.animDuration * 0.5, 0.6 + i * 0.05, false, layer);
  }
  
  layer.draw();
}

function drawStep2() {
  console.log("Executing Step 2: Distribution of Elements");
  
  // Keep number line from Step 1, but update visualizations
  if (!elements.numberLine) {
    drawStep1();
  }
  
  // Remove any previous set elements
  if (elements.setElements) {
    elements.setElements.forEach(el => el.destroy());
  }
  if (elements.setLabels) {
    elements.setLabels.forEach(el => el.destroy());
  }
  if (elements.stepExplanation) {
    elements.stepExplanation.destroy();
  }
  if (elements.omegaDisplay) {
    elements.omegaDisplay.destroy();
  }
  
  // Update title
  if (elements.titleText) {
    elements.titleText.text("Distribution of Elements in Sω");
    elements.titleText.offsetX(elements.titleText.width() / 2);
  }
  
  // Update explanation
  if (elements.explanationText) {
    elements.explanationText.text(
      "As ω changes, the spacing between consecutive elements changes.\n" +
      "Use the slider to adjust ω and observe the pattern."
    );
    elements.explanationText.offsetX(elements.explanationText.width() / 2);
  }
  
  // Add omega display
  elements.omegaDisplay = new Konva.Text({
    x: config.canvasWidth / 2,
    y: config.numberLineYPos + 60,
    text: `ω = ${config.omega.toFixed(2)}`,
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.setElements,
    align: 'center',
    visible: true
  });
  elements.omegaDisplay.offsetX(elements.omegaDisplay.width() / 2);
  
  // Calculate elements of the set Sω in visible range
  const visibleRange = 11; // -5 to 5
  const setElements = calculateSetElements(config.omega, -5, 5, 20);
  
  // Draw set elements
  elements.setElements = [];
  elements.setLabels = [];
  
  const lineLength = config.canvasWidth - 100;
  const startX = 50;
  const tickSpacing = lineLength / (visibleRange - 1);
  
  setElements.forEach((value, index) => {
    // Map value to x-coordinate
    const x = startX + (value + 5) * tickSpacing;
    
    // Create element point
    const element = new Konva.Circle({
      x: x,
      y: config.numberLineYPos,
      radius: config.elementsRadius,
      fill: config.colors.setElements,
      stroke: '#fff',
      strokeWidth: config.styles.elementStrokeWidth,
      visible: true,
      opacity: 0
    });
    
    // Create element label
    const label = new Konva.Text({
      x: x,
      y: config.numberLineYPos - 25,
      text: value.toFixed(1),
      fontSize: config.styles.annotationFontSize,
      fill: config.colors.setElements,
      align: 'center',
      visible: true,
      opacity: 0
    });
    label.offsetX(label.width() / 2);
    
    elements.setElements.push(element);
    elements.setLabels.push(label);
    layer.add(element, label);
    
    // Animate appearance
    gsap.to(element, {
      opacity: 1,
      y: config.numberLineYPos,
      duration: config.animDuration * 0.5,
      delay: 0.1 + index * 0.1,
      ease: config.easing.appear
    });
    
    gsap.to(label, {
      opacity: 1,
      duration: config.animDuration * 0.5,
      delay: 0.2 + index * 0.1,
      ease: "power2.out"
    });
  });
  
  // Add step explanation
  elements.stepExplanation = new Konva.Text({
    x: config.canvasWidth / 2,
    y: config.numberLineYPos - 120,
    text: `For ω = ${config.omega.toFixed(2)}, elements of Sω are ${setElements.length > 0 ? 'shown as blue dots.' : 'not visible in this range.'}`,
    fontSize: 16,
    fill: config.colors.annotation,
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.stepExplanation.offsetX(elements.stepExplanation.width() / 2);
  layer.add(elements.stepExplanation, elements.omegaDisplay);
  
  // Animate explanation
  gsap.to(elements.stepExplanation, {
    opacity: 1,
    duration: config.animDuration * 0.8,
    delay: 0.5,
    ease: "power2.out"
  });
  
  layer.draw();
}

function drawStep3() {
  console.log("Executing Step 3: Intersection Constraint");
  
  // Ensure Step 2 is complete
  if (!elements.setElements) {
    drawStep2();
  }
  
  // Remove previous intersection elements
  if (elements.intervalRect) {
    elements.intervalRect.destroy();
  }
  if (elements.intervalLabel) {
    elements.intervalLabel.destroy();
  }
  if (elements.intersectionElements) {
    elements.intersectionElements.forEach(el => el.destroy());
  }
  if (elements.intersectionCount) {
    elements.intersectionCount.destroy();
  }
  
  // Update title
  if (elements.titleText) {
    elements.titleText.text("Intersection with Interval (a, a + ne^(-0.5n))");
    elements.titleText.offsetX(elements.titleText.width() / 2);
  }
  
  // Update explanation
  if (elements.explanationText) {
    elements.explanationText.text(
      "We need to check if |Sω ∩ (a, a + ne^(-0.5n))| ≤ 3 for all a and n.\n" +
      "Use the sliders to explore different intervals and values of ω."
    );
    elements.explanationText.offsetX(elements.explanationText.width() / 2);
  }
  
  // Calculate interval
  const intervalEnd = config.a + config.n * Math.exp(-0.5 * config.n);
  
  // Map interval to x-coordinates
  const lineLength = config.canvasWidth - 100;
  const startX = 50;
  const tickSpacing = lineLength / 10; // -5 to 5
  
  const intervalStartX = startX + (config.a + 5) * tickSpacing;
  const intervalEndX = startX + (intervalEnd + 5) * tickSpacing;
  const intervalWidth = intervalEndX - intervalStartX;
  
  // Create interval visualization
  elements.intervalRect = new Konva.Rect({
    x: intervalStartX,
    y: config.numberLineYPos - config.intervalHeight / 2,
    width: intervalWidth,
    height: config.intervalHeight,
    fill: 'rgba(52, 168, 83, 0.2)',
    stroke: config.colors.interval,
    strokeWidth: config.styles.lineWidth,
    cornerRadius: 5,
    visible: true,
    opacity: 0
  });
  
  // Create interval label
  elements.intervalLabel = new Konva.Text({
    x: intervalStartX + intervalWidth / 2,
    y: config.numberLineYPos - config.intervalHeight / 2 - 25,
    text: `(${config.a.toFixed(1)}, ${intervalEnd.toFixed(3)})`,
    fontSize: config.styles.annotationFontSize,
    fill: config.colors.interval,
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.intervalLabel.offsetX(elements.intervalLabel.width() / 2);
  
  // Calculate intersection
  const intersection = calculateIntersection(config.omega, config.a, config.n);
  
  // Highlight intersection elements
  elements.intersectionElements = [];
  
  intersection.forEach(value => {
    const x = startX + (value + 5) * tickSpacing;
    
    const highlight = new Konva.Circle({
      x: x,
      y: config.numberLineYPos,
      radius: config.elementsRadius * 1.8,
      fill: 'rgba(234, 67, 53, 0.3)',
      stroke: config.colors.intersection,
      strokeWidth: config.styles.elementStrokeWidth,
      visible: true,
      opacity: 0
    });
    
    elements.intersectionElements.push(highlight);
    layer.add(highlight);
  });
  
  // Add intersection count
  elements.intersectionCount = new Konva.Text({
    x: config.canvasWidth / 2,
    y: config.numberLineYPos + 100,
    text: `|Sω ∩ (a, a + ne^(-0.5n))| = ${intersection.length}`,
    fontSize: 18,
    fontStyle: 'bold',
    fill: intersection.length <= 3 ? config.colors.interval : config.colors.intersection,
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.intersectionCount.offsetX(elements.intersectionCount.width() / 2);
  
  layer.add(elements.intervalRect, elements.intervalLabel, elements.intersectionCount);
  
  // Animations
  gsap.to(elements.intervalRect, {
    opacity: 1,
    duration: config.animDuration * 0.6,
    delay: 0.1,
    ease: "power2.out"
  });
  
  gsap.to(elements.intervalLabel, {
    opacity: 1,
    duration: config.animDuration * 0.5,
    delay: 0.3,
    ease: "power2.out"
  });
  
  elements.intersectionElements.forEach((el, index) => {
    gsap.to(el, {
      opacity: 1,
      duration: config.animDuration * 0.7,
      delay: 0.5 + index * 0.2,
      ease: "elastic.out(1, 0.5)"
    });
  });
  
  gsap.to(elements.intersectionCount, {
    opacity: 1,
    duration: config.animDuration * 0.5,
    delay: 0.8 + intersection.length * 0.2,
    ease: "power2.out"
  });
  
  layer.draw();
}

function drawStep4() {
  console.log("Executing Step 4: Finding Critical Values");
  
  // Ensure Step 3 is complete
  if (!elements.intervalRect) {
    drawStep3();
  }
  
  // Remove previous critical value elements
  if (elements.criticalValues) {
    elements.criticalValues.destroy();
  }
  if (elements.criticalValuesExplanation) {
    elements.criticalValuesExplanation.destroy();
  }
  if (elements.criticalLinesGroup) {
    elements.criticalLinesGroup.destroy();
  }
  
  // Update title
  if (elements.titleText) {
    elements.titleText.text("Finding Critical Values of ω");
    elements.titleText.offsetX(elements.titleText.width() / 2);
  }
  
  // Update explanation
  if (elements.explanationText) {
    elements.explanationText.text(
      "To find the range of valid ω values, we need to determine where\n" +
      "the constraint |Sω ∩ (a, a + ne^(-0.5n))| ≤ 3 is satisfied."
    );
    elements.explanationText.offsetX(elements.explanationText.width() / 2);
  }
  
  // Create group for critical lines
  elements.criticalLinesGroup = new Konva.Group();
  layer.add(elements.criticalLinesGroup);
  
  // Define critical values for ω
  const criticalPoints = [
    { value: 7/3, color: '#d50000', label: 'ω = 7/3' },
    { value: 7, color: '#4285f4', label: 'ω = 7' }
  ];
  
  // Draw critical lines on the omega scale
  const omegaScale = {
    x: 100,
    y: config.numberLineYPos + 150,
    width: config.canvasWidth - 200,
    height: 30
  };
  
  // Draw omega scale
  const omegaLine = new Konva.Line({
    points: [
      omegaScale.x, omegaScale.y,
      omegaScale.x + omegaScale.width, omegaScale.y
    ],
    stroke: config.colors.numberLine,
    strokeWidth: config.styles.lineWidth
  });
  elements.criticalLinesGroup.add(omegaLine);
  
  // Add omega scale ticks and labels
  for (let omega = 0; omega <= 10; omega += 1) {
    const x = omegaScale.x + (omega / 10) * omegaScale.width;
    
    const tick = new Konva.Line({
      points: [x, omegaScale.y - 5, x, omegaScale.y + 5],
      stroke: config.colors.numberLine,
      strokeWidth: config.styles.lineWidth
    });
    
    const label = new Konva.Text({
      x: x,
      y: omegaScale.y + 10,
      text: omega.toString(),
      fontSize: config.styles.annotationFontSize,
      fill: config.colors.annotation,
      align: 'center'
    });
    label.offsetX(label.width() / 2);
    
    elements.criticalLinesGroup.add(tick, label);
  }
  
  // Add critical lines
  criticalPoints.forEach(point => {
    const x = omegaScale.x + (point.value / 10) * omegaScale.width;
    
    const criticalLine = new Konva.Line({
      points: [x, omegaScale.y - 15, x, omegaScale.y + omegaScale.height],
      stroke: point.color,
      strokeWidth: 2,
      dash: [6, 3]
    });
    
    const criticalLabel = new Konva.Text({
      x: x,
      y: omegaScale.y - 30,
      text: point.label,
      fontSize: config.styles.annotationFontSize,
      fill: point.color,
      align: 'center'
    });
    criticalLabel.offsetX(criticalLabel.width() / 2);
    
    elements.criticalLinesGroup.add(criticalLine, criticalLabel);
  });
  
  // Add current omega indicator
  const currentOmegaX = omegaScale.x + (config.omega / 10) * omegaScale.width;
  const currentOmegaIndicator = new Konva.Circle({
    x: currentOmegaX,
    y: omegaScale.y,
    radius: 8,
    fill: config.colors.controlPoint,
    stroke: '#fff',
    strokeWidth: 2
  });
  elements.criticalLinesGroup.add(currentOmegaIndicator);
  
  // Add critical values explanation
  elements.criticalValuesExplanation = new Konva.Text({
    x: config.canvasWidth / 2,
    y: omegaScale.y + 50,
    text: "Mathematical analysis shows that ω must be in the range 0 < ω < 7/3 or ω > 7\n" +
          "to satisfy the constraint |Sω ∩ (a, a + ne^(-0.5n))| ≤ 3 for all a and n.",
    fontSize: 16,
    fill: config.colors.annotation,
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.criticalValuesExplanation.offsetX(elements.criticalValuesExplanation.width() / 2);
  
  // Add critical values formula
  elements.criticalValues = new Konva.Text({
    x: config.canvasWidth / 2,
    y: omegaScale.y + 100,
    text: "Critical values: ω = 7/3 and ω = 7",
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.annotation,
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.criticalValues.offsetX(elements.criticalValues.width() / 2);
  
  layer.add(elements.criticalValuesExplanation, elements.criticalValues);
  
  // Animations
  elements.criticalLinesGroup.opacity(0);
  gsap.to(elements.criticalLinesGroup, {
    opacity: 1,
    duration: config.animDuration * 0.8,
    delay: 0.2,
    ease: "power2.out"
  });
  
  gsap.to(elements.criticalValuesExplanation, {
    opacity: 1,
    duration: config.animDuration * 0.6,
    delay: 0.5,
    ease: "power2.out"
  });
  
  gsap.to(elements.criticalValues, {
    opacity: 1,
    duration: config.animDuration * 0.5,
    delay: 0.8,
    ease: "power2.out"
  });
  
  // Update current omega indicator when slider changes
  document.getElementById('omega-slider').addEventListener('input', () => {
    if (elements.criticalLinesGroup && currentOmegaIndicator) {
      const x = omegaScale.x + (config.omega / 10) * omegaScale.width;
      currentOmegaIndicator.x(x);
      layer.batchDraw();
    }
  });
  
  layer.draw();
}

function drawStep5() {
  console.log("Executing Step 5: Solution Range");
  
  // Ensure Step 4 is complete
  if (!elements.criticalValues) {
    drawStep4();
  }
  
  // Update title
  if (elements.titleText) {
    elements.titleText.text("Solution: Range of Valid ω Values");
    elements.titleText.offsetX(elements.titleText.width() / 2);
  }
  
  // Update explanation
  if (elements.explanationText) {
    elements.explanationText.text(
      "After careful mathematical analysis of the constraint,\n" +
      "we have determined the complete range of valid ω values."
    );
    elements.explanationText.offsetX(elements.explanationText.width() / 2);
  }
  
  // Create solution range visualization
  const solutionRangeY = config.numberLineYPos + 200;
  
  if (elements.solutionRange) {
    elements.solutionRange.destroy();
  }
  if (elements.solutionText) {
    elements.solutionText.destroy();
  }
  
  elements.solutionRange = new Konva.Group();
  layer.add(elements.solutionRange);
  
  // Draw number line for solution
  const lineLength = config.canvasWidth - 200;
  const startX = 100;
  const endX = startX + lineLength;
  
  const solutionLine = new Konva.Line({
    points: [startX, solutionRangeY, endX, solutionRangeY],
    stroke: config.colors.numberLine,
    strokeWidth: config.styles.lineWidth
  });
  elements.solutionRange.add(solutionLine);
  
  // Add ticks and labels
  for (let omega = 0; omega <= 10; omega += 1) {
    const x = startX + (omega / 10) * lineLength;
    
    const tick = new Konva.Line({
      points: [x, solutionRangeY - 5, x, solutionRangeY + 5],
      stroke: config.colors.numberLine,
      strokeWidth: config.styles.lineWidth
    });
    
    const label = new Konva.Text({
      x: x,
      y: solutionRangeY + 10,
      text: omega.toString(),
      fontSize: config.styles.annotationFontSize,
      fill: config.colors.annotation,
      align: 'center'
    });
    label.offsetX(label.width() / 2);
    
    elements.solutionRange.add(tick, label);
  }
  
  // Add critical points
  const criticalPoints = [
    { value: 0, label: '0' },
    { value: 7/3, label: '7/3' },
    { value: 7, label: '7' }
  ];
  
  criticalPoints.forEach(point => {
    const x = startX + (point.value / 10) * lineLength;
    
    const criticalPoint = new Konva.Circle({
      x: x,
      y: solutionRangeY,
      radius: 5,
      fill: '#d50000',
      stroke: '#fff',
      strokeWidth: 1
    });
    
    const criticalLabel = new Konva.Text({
      x: x,
      y: solutionRangeY - 25,
      text: point.label,
      fontSize: config.styles.annotationFontSize,
      fill: '#d50000',
      align: 'center'
    });
    criticalLabel.offsetX(criticalLabel.width() / 2);
    
    elements.solutionRange.add(criticalPoint, criticalLabel);
  });
  
  // Highlight valid ranges
  // First range: 0 < ω < 7/3
  const firstRangeStartX = startX + (0 / 10) * lineLength;
  const firstRangeEndX = startX + (7/3 / 10) * lineLength;
  const firstRangeWidth = firstRangeEndX - firstRangeStartX;
  
  const firstRange = new Konva.Rect({
    x: firstRangeStartX,
    y: solutionRangeY - 8,
    width: firstRangeWidth,
    height: 16,
    fill: 'rgba(66, 133, 244, 0.3)',
    stroke: '#4285f4',
    strokeWidth: 1,
    cornerRadius: 8
  });
  
  // Second range: ω > 7
  const secondRangeStartX = startX + (7 / 10) * lineLength;
  const secondRangeEndX = endX;
  const secondRangeWidth = secondRangeEndX - secondRangeStartX;
  
  const secondRange = new Konva.Rect({
    x: secondRangeStartX,
    y: solutionRangeY - 8,
    width: secondRangeWidth,
    height: 16,
    fill: 'rgba(66, 133, 244, 0.3)',
    stroke: '#4285f4',
    strokeWidth: 1,
    cornerRadius: 8
  });
  
  elements.solutionRange.add(firstRange, secondRange);
  
  // Add solution text
  elements.solutionText = new Konva.Text({
    x: config.canvasWidth / 2,
    y: solutionRangeY + 50,
    text: "Solution: 0 < ω < 7/3 or ω > 7",
    fontSize: 22,
    fontStyle: 'bold',
    fill: '#d50000',
    align: 'center',
    visible: true,
    opacity: 0
  });
  elements.solutionText.offsetX(elements.solutionText.width() / 2);
  layer.add(elements.solutionText);
  
  // Animations
  elements.solutionRange.opacity(0);
  gsap.to(elements.solutionRange, {
    opacity: 1,
    duration: config.animDuration,
    delay: 0.2,
    ease: "power2.out"
  });
  
  gsap.to(elements.solutionText, {
    opacity: 1,
    duration: config.animDuration * 0.8,
    delay: 0.8,
    ease: "elastic.out(1, 0.5)"
  });
  
  layer.draw();
}
