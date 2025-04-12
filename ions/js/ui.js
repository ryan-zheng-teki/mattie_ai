// UI related functions and event handlers
import * as THREE from 'three';
import { elements, quizQuestions, SHELL_COLORS } from './elements-data.js';
import { updateVisualization } from './visualization.js';
import { animateIonization } from './animation.js';

// Global state
let isMinimalView = true;
let currentElement = null;
let currentState = 'neutral';
let narrationTimeout = null;

// Initialize UI components
export function initUI() {
    // Set up tab navigation
    setupTabs();
    
    // Set up quiz functionality
    setupQuiz();
    
    // Set up minimal view toggle
    setupViewToggle();
    
    // Set up event listeners for visualization controls
    document.getElementById('element-select').addEventListener('change', onElementChange);
    document.getElementById('state-select').addEventListener('change', onStateChange);
    document.getElementById('animate-button').addEventListener('click', () => animateIonization());
    
    // Set up hover tooltips for the visualization
    setupHoverTooltips();
}

// Set up tab navigation
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab') + '-tab';
            document.getElementById(contentId).classList.add('active');
            
            // If switching to quiz tab, load a new question
            if (tab.getAttribute('data-tab') === 'quiz') {
                loadRandomQuestion();
            }
        });
    });
}

// Set up quiz functionality
function setupQuiz() {
    document.getElementById('next-question').addEventListener('click', loadRandomQuestion);
}

// Load a random quiz question
function loadRandomQuestion() {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    
    // Clear previous content
    optionsEl.innerHTML = '';
    feedbackEl.innerHTML = '';
    feedbackEl.className = '';
    
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    const question = quizQuestions[randomIndex];
    
    // Set question text
    questionEl.textContent = question.question;
    
    // Create options
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'quiz-option';
        optionEl.textContent = option;
        optionEl.dataset.index = index;
        
        optionEl.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // Add selected class to clicked option
            optionEl.classList.add('selected');
            
            // Check if answer is correct
            if (index === question.correctIndex) {
                optionEl.classList.add('correct');
                feedbackEl.textContent = '✅ Correct! ' + question.explanation;
                feedbackEl.className = 'correct';
            } else {
                optionEl.classList.add('incorrect');
                
                // Highlight the correct answer
                const correctOption = document.querySelector(`.quiz-option[data-index="${question.correctIndex}"]`);
                correctOption.classList.add('correct');
                
                feedbackEl.textContent = '❌ Not quite. ' + question.explanation;
                feedbackEl.className = 'incorrect';
            }
        });
        
        optionsEl.appendChild(optionEl);
    });
}

// Set up minimal view toggle
function setupViewToggle() {
    const toggleButton = document.getElementById('view-toggle');
    const toggleText = document.getElementById('view-mode-text');
    
    toggleButton.addEventListener('click', () => {
        isMinimalView = !isMinimalView;
        toggleButton.classList.toggle('active');
        
        if (isMinimalView) {
            toggleText.textContent = 'Simple View';
            document.body.classList.add('minimal-view');
        } else {
            toggleText.textContent = 'Detailed View';
            document.body.classList.remove('minimal-view');
        }
        
        // Update the visualization with current settings
        if (currentElement) {
            updateVisualization(currentElement, currentState);
        }
    });
}

// Set up hover tooltips for visualization elements
function setupHoverTooltips() {
    // Create tooltip container once
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.opacity = '0';
    document.body.appendChild(tooltip);
    
    // Set event delegation for hover targets
    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('hover-target')) {
            const tooltipText = e.target.getAttribute('data-tooltip');
            if (tooltipText) {
                tooltip.textContent = tooltipText;
                tooltip.style.opacity = '1';
                
                // Position tooltip near cursor
                positionTooltip(e, tooltip);
            }
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (e.target.classList.contains('hover-target')) {
            positionTooltip(e, tooltip);
        }
    });
    
    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('hover-target')) {
            tooltip.style.opacity = '0';
        }
    });
}

// Position tooltip near cursor
function positionTooltip(event, tooltip) {
    const x = event.clientX + 15;
    const y = event.clientY + 15;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Handle element selection change
export function onElementChange(event) {
    const selectedElement = event.target.value;
    currentElement = selectedElement;
    updateVisualization(selectedElement, currentState);
}

// Handle state selection change
export function onStateChange(event) {
    const selectedState = event.target.value;
    currentState = selectedState;
    updateVisualization(currentElement, selectedState);
}

// Show temporary label in the visualization
export function showTemporaryLabel(text, x, y, color = '#ffffff', duration = 2000) {
    const labelsContainer = document.getElementById('temporary-labels');
    
    // Create label element
    const label = document.createElement('div');
    label.className = 'temp-label';
    label.textContent = text;
    label.style.color = color;
    label.style.left = x + 'px';
    label.style.top = y + 'px';
    
    // Add to container
    labelsContainer.appendChild(label);
    
    // Remove after duration
    setTimeout(() => {
        label.style.opacity = '0';
        setTimeout(() => {
            if (labelsContainer.contains(label)) {
                labelsContainer.removeChild(label);
            }
        }, 500); // Wait for fade transition
    }, duration);
    
    return label;
}

// Show narration text
export function showNarration(text, duration = 4000) {
    const narrationEl = document.getElementById('animation-narration');
    
    // Update explanation box
    updateExplanationBox(text);
    
    // Clear any existing timeout
    if (narrationTimeout) {
        clearTimeout(narrationTimeout);
    }
    
    // Set text and show
    narrationEl.textContent = text;
    narrationEl.style.opacity = '1';
    
    // Hide after duration
    narrationTimeout = setTimeout(() => {
        narrationEl.style.opacity = '0';
    }, duration);
}

// Update the explanation box in the side panel
export function updateExplanationBox(text) {
    const explanationBox = document.getElementById('explanation-box');
    explanationBox.textContent = text;
}

// Update element info in the side panel
export function updateElementInfo(element, stateType) {
    const elementInfo = document.getElementById('element-info');
    
    if (stateType === 'neutral') {
        elementInfo.textContent = `${element.name} (${element.symbol}): Neutral Atom`;
        elementInfo.className = 'info-box neutral-charge';
    } else {
        // Ion state
        const chargeClass = element.ionState.charge.startsWith('+') ? 'positive-charge' : 'negative-charge';
        elementInfo.textContent = `${element.name} (${element.symbol}${element.ionState.charge}): Ion`;
        elementInfo.className = `info-box ${chargeClass}`;
    }
}

// Update shell status display in the side panel
export function updateShellStatus(electronsPerShell) {
    const shellStatusEl = document.getElementById('shell-status');
    shellStatusEl.innerHTML = '';
    
    // Create a row for each shell
    electronsPerShell.forEach((electronCount, index) => {
        const shellRow = document.createElement('div');
        shellRow.className = 'shell-row';
        
        // Create shell color indicator
        const shellColor = document.createElement('div');
        shellColor.className = 'shell-color';
        shellColor.style.backgroundColor = `#${new THREE.Color(SHELL_COLORS[index] || SHELL_COLORS[0]).getHexString()}`;
        
        // Create shell text description
        const shellText = document.createElement('div');
        const shellNames = ['1st (K)', '2nd (L)', '3rd (M)', '4th (N)', '5th (O)'];
        const shellName = shellNames[index] || `${index+1}th`;
        shellText.textContent = `${shellName} Shell: ${electronCount} electrons`;
        
        // Add to row
        shellRow.appendChild(shellColor);
        shellRow.appendChild(shellText);
        
        // Add to container
        shellStatusEl.appendChild(shellRow);
    });
}

// Export the global state for access from other modules
export function getUIState() {
    return {
        isMinimalView,
        currentElement,
        currentState
    };
}
