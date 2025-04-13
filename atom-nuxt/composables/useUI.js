import { ref } from 'vue'
import { useAtomsStore } from '~/stores/atoms'
import * as THREE from 'three'

export function useUI() {
  const store = useAtomsStore()
  
  // Show temporary label in the visualization
  const showTemporaryLabel = (text, x, y, color = '#ffffff', duration = 2000) => {
    const labelsContainer = document.getElementById('temporary-labels')
    if (!labelsContainer) return null
    
    // Create label element
    const label = document.createElement('div')
    label.className = 'temp-label'
    label.textContent = text
    label.style.color = color
    label.style.left = x + 'px'
    label.style.top = y + 'px'
    
    // Add to container
    labelsContainer.appendChild(label)
    
    // Remove after duration
    setTimeout(() => {
      label.style.opacity = '0'
      setTimeout(() => {
        if (labelsContainer.contains(label)) {
          labelsContainer.removeChild(label)
        }
      }, 500) // Wait for fade transition
    }, duration)
    
    return label
  }

  // Show narration text
  const showNarration = (text, duration = 4000) => {
    const narrationEl = document.getElementById('animation-narration')
    if (!narrationEl) return
    
    // Update explanation box
    updateExplanationBox(text)
    
    // Clear any existing timeout
    if (store.narrationTimeout) {
      clearTimeout(store.narrationTimeout)
    }
    
    // Set text and show
    narrationEl.textContent = text
    narrationEl.style.opacity = '1'
    
    // Hide after duration
    store.narrationTimeout = setTimeout(() => {
      narrationEl.style.opacity = '0'
    }, duration)
  }

  // Update the explanation box in the side panel
  const updateExplanationBox = (text) => {
    const explanationBox = document.getElementById('explanation-box')
    if (explanationBox) explanationBox.textContent = text
  }

  // Update element info in the side panel
  const updateElementInfo = (element) => {
    const elementInfo = document.getElementById('element-info')
    if (!elementInfo) return
    
    // Include atomic number, name, symbol and electron configuration
    elementInfo.innerHTML = `
      <strong>${element.name} (${element.symbol})</strong><br>
      Atomic Number: ${element.atomicNumber}<br>
      Electron Configuration: ${element.electronConfiguration}
    `
  }

  // Update shell status display in the side panel
  const updateShellStatus = (electronsPerShell) => {
    const shellStatusEl = document.getElementById('shell-status')
    if (!shellStatusEl) return
    
    shellStatusEl.innerHTML = ''
    
    // Create a row for each shell
    electronsPerShell.forEach((electronCount, index) => {
      const shellRow = document.createElement('div')
      shellRow.className = 'shell-row'
      
      // Create shell color indicator
      const shellColor = document.createElement('div')
      shellColor.className = 'shell-color'
      shellColor.style.backgroundColor = `#${new THREE.Color(store.SHELL_COLORS[index] || store.SHELL_COLORS[0]).getHexString()}`
      
      // Create shell text description
      const shellText = document.createElement('div')
      const shellNames = ['1st (K)', '2nd (L)', '3rd (M)', '4th (N)', '5th (O)']
      const shellName = shellNames[index] || `${index+1}th`
      shellText.textContent = `${shellName} Shell: ${electronCount} electrons`
      
      // Add to row
      shellRow.appendChild(shellColor)
      shellRow.appendChild(shellText)
      
      // Add to container
      shellStatusEl.appendChild(shellRow)
    })
  }

  // Position tooltip near cursor
  const positionTooltip = (event, tooltip) => {
    const x = event.clientX + 15
    const y = event.clientY + 15
    tooltip.style.left = x + 'px'
    tooltip.style.top = y + 'px'
  }

  return {
    showTemporaryLabel,
    showNarration,
    updateExplanationBox,
    updateElementInfo,
    updateShellStatus,
    positionTooltip
  }
}
