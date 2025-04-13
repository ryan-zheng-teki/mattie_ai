import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { ref, shallowRef, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { useAtomsStore } from '~/stores/atoms'
import { useUI } from '~/composables/useUI'

export function useAtomVisualization() {
  const store = useAtomsStore()
  const { 
    showTemporaryLabel, 
    updateElementInfo, 
    updateExplanationBox, 
    updateShellStatus 
  } = useUI()
  
  // Refs for visualization
  const container = ref(null)
  const scene = shallowRef(null)
  const camera = shallowRef(null)
  const renderer = shallowRef(null)
  const controls = shallowRef(null)
  const currentAtomGroup = shallowRef(markRaw(new THREE.Group()))
  const electrons = shallowRef([])
  const nucleusObject = shallowRef(null)
  const isFullscreen = ref(false)
  const currentSpeedMultiplier = ref(store.electronSpeed)
  let animationFrameId = null
  let lastTime = 0

  // Initialize visualization
  const initVisualization = () => {
    if (!container.value) return

    console.log("Initializing atom visualization...")
    
    // Set up scene
    scene.value = markRaw(new THREE.Scene())
    scene.value.background = new THREE.Color(0x000011)
    
    // Set up camera
    const width = container.value.clientWidth
    const height = container.value.clientHeight
    camera.value = markRaw(new THREE.PerspectiveCamera(75, width / height, 0.1, 1000))
    camera.value.position.z = 15
    
    // Set up renderer
    renderer.value = markRaw(new THREE.WebGLRenderer({ antialias: true }))
    renderer.value.setSize(width, height)
    container.value.appendChild(renderer.value.domElement)
    
    // Add lighting
    const ambientLight = markRaw(new THREE.AmbientLight(0xffffff, 0.7))
    scene.value.add(ambientLight)
    
    const pointLight = markRaw(new THREE.PointLight(0xffffff, 1.0, 100))
    pointLight.position.set(5, 5, 10)
    scene.value.add(pointLight)
    
    // Set up controls
    controls.value = markRaw(new OrbitControls(camera.value, renderer.value.domElement))
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.05
    controls.value.screenSpacePanning = false
    controls.value.minDistance = 5
    controls.value.maxDistance = 50
    controls.value.enableZoom = true
    
    // Add atom group to scene
    scene.value.add(currentAtomGroup.value)
    
    // Set up window resize handler
    window.addEventListener('resize', onWindowResize)
    
    // Initialize electron speed
    updateElectronSpeed(currentSpeedMultiplier.value)
    
    console.log("Visualization initialization complete.")
  }

  // Update electron speed
  const updateElectronSpeed = (speedValue) => {
    currentSpeedMultiplier.value = parseFloat(speedValue)
    console.log(`Electron speed updated to: ${currentSpeedMultiplier.value}`)
    
    // Update existing electrons with new speed
    const electronsList = electrons.value
    electronsList.forEach(electron => {
      const baseSpeed = store.ELECTRON_SPEED_MULTIPLIER / (electron.radius || 1)
      electron.phiSpeed = baseSpeed * currentSpeedMultiplier.value
      electron.thetaSpeed = baseSpeed * 0.7 * currentSpeedMultiplier.value
    })
  }

  // Create nucleus mesh
  const createNucleusMesh = (color, radius = store.NUCLEUS_RADIUS) => {
    const geometry = new THREE.SphereGeometry(radius, 32, 32)
    const material = new THREE.MeshPhongMaterial({ 
      color: color, 
      emissive: color, 
      emissiveIntensity: 0.5
    })
    return markRaw(new THREE.Mesh(geometry, material))
  }

  // Create orbital shell
  const createOrbitalShell = (radius, shellIndex) => {
    // Get color based on shell index (with fallback)
    const color = store.SHELL_COLORS[shellIndex] || store.SHELL_COLORS[store.SHELL_COLORS.length - 1]
    
    const geometry = new THREE.SphereGeometry(radius, 32, 16)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.25,
      wireframe: true
    })
    return markRaw(new THREE.Mesh(geometry, material))
  }

  // Add orbiting electrons
  const addOrbitingElectrons = (centerPosition, count, orbitRadius, shellIndex = 0) => {
    const addedElectrons = []
    
    // Get electron color based on shell index (with fallback)
    const electronColor = store.ELECTRON_COLORS[shellIndex] || store.ELECTRON_COLORS[store.ELECTRON_COLORS.length - 1]
    
    // Base speed adjusted by current multiplier
    const baseSpeed = store.ELECTRON_SPEED_MULTIPLIER / (orbitRadius || 1)
    
    for (let i = 0; i < count; i++) {
      const electronGeometry = new THREE.SphereGeometry(store.ELECTRON_RADIUS, 16, 16)
      const electronMaterial = new THREE.MeshPhongMaterial({ 
        color: electronColor, 
        emissive: electronColor, 
        emissiveIntensity: 0.7
      })
      const electronMesh = markRaw(new THREE.Mesh(electronGeometry, electronMaterial))
      electronMesh.userData.isElectron = true
      electronMesh.userData.shellIndex = shellIndex
      
      // Add a small pulse animation to electrons
      electronMesh.scale.set(1, 1, 1)
      
      // Distribute in 3D space using spherical coordinates
      const phi = (Math.PI * 2 * i) / count
      // Vary theta to create 3D distribution and prevent electrons in same plane
      const theta = Math.PI * (0.2 + (0.6 * i / count))
      
      const electronData = {
        mesh: electronMesh,
        shellIndex: shellIndex,
        radius: orbitRadius,
        phi: phi,
        theta: theta,
        phiSpeed: baseSpeed * currentSpeedMultiplier.value,
        thetaSpeed: baseSpeed * 0.7 * currentSpeedMultiplier.value,
        isAnimating: false,
        center: centerPosition,
        color: electronColor
      }
      
      // Set initial position using spherical coordinates
      updateElectronPosition(electronData, 0)
      
      electrons.value.push(electronData)
      addedElectrons.push(electronData)
      currentAtomGroup.value.add(electronMesh)
    }
    
    return addedElectrons
  }

  // Update electron position
  const updateElectronPosition = (electron, deltaTime) => {
    if (electron.isAnimating) return
    
    // Update angles
    electron.phi += electron.phiSpeed * deltaTime
    electron.theta += electron.thetaSpeed * deltaTime
    
    // Convert spherical to cartesian coordinates
    const x = electron.center.x + electron.radius * Math.sin(electron.theta) * Math.cos(electron.phi)
    const y = electron.center.y + electron.radius * Math.sin(electron.theta) * Math.sin(electron.phi)
    const z = electron.center.z + electron.radius * Math.cos(electron.theta)
    
    electron.mesh.position.set(x, y, z)
    
    // Add a subtle pulsing effect to make electrons more visible
    const pulseScale = 1 + 0.1 * Math.sin(deltaTime * 2)
    electron.mesh.scale.set(pulseScale, pulseScale, pulseScale)
  }

  // Make objects hoverable with tooltips
  const makeObjectsHoverable = () => {
    if (!camera.value || !renderer.value) return
    
    // Add hover capabilities to scene objects
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    
    // Add event listener for mouse movement
    renderer.value.domElement.addEventListener('mousemove', (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.value.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      
      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera.value)
      
      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(currentAtomGroup.value.children, true)
      
      if (intersects.length > 0) {
        const object = intersects[0].object
        
        // Check if it's an electron
        if (object.userData.isElectron) {
          const shellIndex = object.userData.shellIndex
          const shellNames = ['1st (K)', '2nd (L)', '3rd (M)', '4th (N)', '5th (O)']
          const shellName = shellNames[shellIndex] || `${shellIndex+1}th`
          
          // Show temporary label near the electron
          const screenPos = getScreenPosition(object.position, camera.value, renderer.value)
          showTemporaryLabel(`Electron in ${shellName} shell`,
                           screenPos.x + rect.left,
                           screenPos.y + rect.top,
                           `#${new THREE.Color(object.material.color).getHexString()}`,
                           1000)
        }
      }
    })
  }

  // Get screen position from 3D position
  const getScreenPosition = (position, camera, renderer) => {
    const vector = new THREE.Vector3(position.x, position.y, position.z)
    vector.project(camera)
    
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight
    
    return { x, y }
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!container.value) return
    
    isFullscreen.value = !isFullscreen.value
    
    // Resize renderer after a brief delay to ensure DOM has updated
    setTimeout(() => {
      onWindowResize()
    }, 100)
  }

  // Zoom camera in or out
  const zoomCamera = (factor) => {
    if (!camera.value || !controls.value) return
    
    // Move camera closer or further
    camera.value.position.z *= factor
    
    // Ensure we respect min/max limits
    if (camera.value.position.z < controls.value.minDistance) {
      camera.value.position.z = controls.value.minDistance
    } else if (camera.value.position.z > controls.value.maxDistance) {
      camera.value.position.z = controls.value.maxDistance
    }
    
    camera.value.updateProjectionMatrix()
  }

  // Clear current visualization
  const clearVisualization = () => {
    console.log("Clearing current visualization...")
    
    // Remove all objects from the atom group
    while (currentAtomGroup.value.children.length > 0) {
      const child = currentAtomGroup.value.children[0]
      currentAtomGroup.value.remove(child)
      
      // Dispose of geometries and materials
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose())
        } else {
          child.material.dispose()
        }
      }
    }
    
    electrons.value = [] // Clear electron tracking array
    nucleusObject.value = null
    
    // Clear temporary labels
    const labelsContainer = document.getElementById('temporary-labels')
    if (labelsContainer) labelsContainer.innerHTML = ''
  }

  // Handle window resize
  const onWindowResize = () => {
    if (!container.value || !camera.value || !renderer.value) return
    
    const width = container.value.clientWidth
    const height = container.value.clientHeight
    
    if (width === 0 || height === 0) return
    
    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(width, height)
  }

  // Create a visualization of an atom
  const createAtomVisualization = (elementSymbol) => {
    console.log(`Creating visualization for ${elementSymbol}`)
    clearVisualization()
    
    const element = store.elements[elementSymbol]
    if (!element) {
      console.error(`Element data not found for: ${elementSymbol}`)
      return
    }
    
    // Create nucleus
    const nucleusColor = store.NUCLEUS_COLORS[elementSymbol] || store.NUCLEUS_COLORS.default
    nucleusObject.value = createNucleusMesh(nucleusColor)
    currentAtomGroup.value.add(nucleusObject.value)
    
    // Show temporary label for nucleus
    if (renderer.value) {
      const canvasRect = renderer.value.domElement.getBoundingClientRect()
      
      // Show nucleus label temporarily
      showTemporaryLabel('Nucleus', 
                        canvasRect.width/2, 
                        canvasRect.height/2, 
                        `#${new THREE.Color(nucleusColor).getHexString()}`, 
                        3000)
    }
    
    // Add electron shells and electrons
    electrons.value = [] // Reset global electrons array
    
    element.electronsPerShell.forEach((numElectronsInShell, shellIndex) => {
      const shellRadius = store.SHELL_RADIUS_BASE + shellIndex * store.SHELL_RADIUS_INCREMENT
      
      // Create orbital shell visualization with color based on shell index
      const orbitalShell = createOrbitalShell(shellRadius, shellIndex)
      currentAtomGroup.value.add(orbitalShell)
      
      // For the outermost shell, add a temporary label
      if (shellIndex === element.electronsPerShell.length - 1 && camera.value && renderer.value) {
        const shellPosition = new THREE.Vector3(shellRadius * 0.7, shellRadius * 0.7, 0)
        const screenPos = getScreenPosition(shellPosition, camera.value, renderer.value)
        const shellNames = ['1st Shell (K)', '2nd Shell (L)', '3rd Shell (M)', '4th Shell (N)', '5th Shell (O)']
        const shellName = shellNames[shellIndex] || `Shell ${shellIndex + 1}`
        
        const canvasRect = renderer.value.domElement.getBoundingClientRect()
        showTemporaryLabel(shellName,
                          screenPos.x + canvasRect.left,
                          screenPos.y + canvasRect.top,
                          `#${new THREE.Color(store.SHELL_COLORS[shellIndex]).getHexString()}`,
                          3000)
      }
      
      // Add electrons to this shell with color based on shell index
      addOrbitingElectrons(nucleusObject.value.position, numElectronsInShell, shellRadius, shellIndex)
    })
    
    // Update information displays
    updateElementInfo(element)
    updateExplanationBox(store.ELEMENT_DESCRIPTIONS[elementSymbol] || 
                        `This is a ${element.name} atom with atomic number ${element.atomicNumber}.`)
    updateShellStatus(element.electronsPerShell)
    
    // Make objects hoverable
    makeObjectsHoverable()
  }

  // Update visualization based on element
  const updateVisualization = (elementSymbol) => {
    if (!elementSymbol) return
    
    createAtomVisualization(elementSymbol)
  }

  // Update electron positions for animation
  const updateElectronPositions = (currentTime) => {
    if (electrons.value.length === 0) return
    
    electrons.value.forEach(electron => {
      updateElectronPosition(electron, currentTime)
    })
  }

  // Animation loop
  const animate = (time) => {
    animationFrameId = requestAnimationFrame(animate)
    const timeSeconds = time * 0.001
    const deltaTime = (timeSeconds - lastTime)
    lastTime = timeSeconds
    
    if (controls.value) controls.value.update()
    
    // Only update electron positions if there are electrons to animate
    if (electrons.value.length > 0 && !isNaN(deltaTime) && deltaTime > 0) {
      updateElectronPositions(timeSeconds)
    }
    
    if (renderer.value && scene.value && camera.value) {
      renderer.value.render(scene.value, camera.value)
    }
  }

  // Cleanup on component unmount
  onBeforeUnmount(() => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
    
    window.removeEventListener('resize', onWindowResize)
    
    // Dispose of Three.js resources
    clearVisualization()
    
    if (renderer.value) {
      renderer.value.dispose()
      
      if (container.value && container.value.contains(renderer.value.domElement)) {
        container.value.removeChild(renderer.value.domElement)
      }
    }
  })

  return {
    container,
    isFullscreen,
    initVisualization,
    updateVisualization,
    animate,
    toggleFullscreen,
    zoomCamera,
    updateElectronSpeed
  }
}
