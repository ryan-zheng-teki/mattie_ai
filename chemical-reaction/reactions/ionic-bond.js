import * as THREE from 'three';
import TWEEN from 'tween';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Ionic Bond Formation: Na + Cl → Na⁺ + Cl⁻ → NaCl
class IonicBondReaction {
    constructor() {
        this.visualizer = null;
        this.molecules = {};
        this.electricField = null;
        this.chargeLabels = {};
    }
    
    initialize(visualizer) {
        this.visualizer = visualizer;
    }
    
    getEquation() {
        return 'Na + Cl → Na⁺ + Cl⁻ → NaCl';
    }
    
    getPhases() {
        return [
            {
                name: 'Initial State: Separate Atoms',
                explanation: 'Sodium (Na) has 1 electron in its outer shell. Chlorine (Cl) has 7 electrons in its outer shell and needs 1 more for a full octet.',
                electronInfo: 'Sodium easily loses its outer electron while chlorine strongly attracts additional electrons.'
            },
            {
                name: 'Electron Transfer',
                explanation: 'Sodium loses its outer electron to chlorine. This makes sodium a positively charged ion (Na⁺) and chlorine a negatively charged ion (Cl⁻).',
                electronInfo: 'Watch as the electron transfers from sodium to chlorine.'
            },
            {
                name: 'Ionic Attraction',
                explanation: 'The oppositely charged ions (Na⁺ and Cl⁻) are strongly attracted to each other, forming an ionic bond.',
                electronInfo: 'The electrostatic attraction between positive and negative ions creates a strong ionic bond.'
            },
            {
                name: 'Final State: Sodium Chloride',
                explanation: 'The sodium and chloride ions arrange in a crystal lattice structure, forming sodium chloride (table salt).',
                electronInfo: 'Each sodium ion is surrounded by chloride ions and vice versa in the crystal structure.'
            }
        ];
    }
    
    setup() {
        // Position atoms further apart for clearer visualization
        const sodium = this.visualizer.createAtom('Na', new THREE.Vector3(-12, 0, 0), 1.0, true);
        const chlorine = this.visualizer.createAtom('Cl', new THREE.Vector3(12, 0, 0), 1.0, true);
        
        // Add educational labels
        const naLabel = document.createElement('div');
        naLabel.className = 'molecule-label';
        naLabel.textContent = 'Na';
        naLabel.style.color = '#dddddd';
        naLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        naLabel.style.padding = '3px 6px';
        naLabel.style.borderRadius = '4px';
        naLabel.style.fontSize = '16px';
        
        const naLabelObject = new CSS2DObject(naLabel);
        naLabelObject.position.set(0, -7, 0);
        sodium.group.add(naLabelObject);
        
        const clLabel = document.createElement('div');
        clLabel.className = 'molecule-label';
        clLabel.textContent = 'Cl';
        clLabel.style.color = '#00ff00';
        clLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        clLabel.style.padding = '3px 6px';
        clLabel.style.borderRadius = '4px';
        clLabel.style.fontSize = '16px';
        
        const clLabelObject = new CSS2DObject(clLabel);
        clLabelObject.position.set(0, -7, 0);
        chlorine.group.add(clLabelObject);
        
        // Add educational text for middle school students
        const instructionLabel = document.createElement('div');
        instructionLabel.className = 'instruction-label';
        instructionLabel.textContent = 'Press "Step Forward" to see electron transfer!';
        instructionLabel.style.color = '#ffffff';
        instructionLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        instructionLabel.style.padding = '8px 12px';
        instructionLabel.style.borderRadius = '6px';
        instructionLabel.style.fontSize = '18px';
        instructionLabel.style.fontWeight = 'bold';
        instructionLabel.style.position = 'absolute';
        instructionLabel.style.bottom = '20px';
        instructionLabel.style.left = '50%';
        instructionLabel.style.transform = 'translateX(-50%)';
        
        const instructionLabelObject = new CSS2DObject(instructionLabel);
        instructionLabelObject.position.set(0, -15, 0);
        this.visualizer.currentReactionGroup.add(instructionLabelObject);
        
        // Store for animation reference
        this.molecules = {
            sodium: sodium,
            chlorine: chlorine,
            labels: {
                na: naLabelObject,
                cl: clLabelObject,
                instruction: instructionLabelObject
            }
        };
        
        // Highlight the valence electron in sodium that will transfer
        const sodiumValenceElectron = sodium.electrons.find(
            e => e.shellIndex === this.visualizer.elements['Na'].electronsPerShell.length - 1
        );
        
        if (sodiumValenceElectron) {
            // Make the transferring electron more noticeable
            sodiumValenceElectron.mesh.scale.set(1.5, 1.5, 1.5);
            sodiumValenceElectron.mesh.material.emissive.set(0xffff00);
            sodiumValenceElectron.mesh.material.emissiveIntensity = 1.0;
            
            // Add a small pulsing animation to draw attention
            const pulse = () => {
                new TWEEN.Tween(sodiumValenceElectron.mesh.scale)
                    .to({ x: 2.0, y: 2.0, z: 2.0 }, 1000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        new TWEEN.Tween(sodiumValenceElectron.mesh.scale)
                            .to({ x: 1.5, y: 1.5, z: 1.5 }, 1000)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(pulse)
                            .start();
                    })
                    .start();
            };
            pulse();
        }
        
        // Set camera position for better view
        this.visualizer.camera.position.set(0, 0, 35);
        this.visualizer.controls.update();
    }
    
    step(phase) {
        this.visualizer.animationInProgress = true;
        
        // Remove instruction label if it exists
        if (this.molecules.labels && this.molecules.labels.instruction) {
            this.visualizer.currentReactionGroup.remove(this.molecules.labels.instruction);
            delete this.molecules.labels.instruction;
        }
        
        switch(phase) {
            case 1: // Electron Transfer
                // Find the outermost electron of sodium
                const sodiumValenceElectron = this.molecules.sodium.electrons.find(
                    e => e.shellIndex === this.visualizer.elements['Na'].electronsPerShell.length - 1
                );
                
                // Highlight both atoms during transfer
                this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
                this.molecules.chlorine.nucleus.material.emissiveIntensity = 0.7;
                
                // Update instruction text
                const transferLabel = document.createElement('div');
                transferLabel.className = 'instruction-label';
                transferLabel.textContent = 'Watch the electron transfer!';
                transferLabel.style.color = '#ffff00';
                transferLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                transferLabel.style.padding = '8px 12px';
                transferLabel.style.borderRadius = '6px';
                transferLabel.style.fontSize = '18px';
                transferLabel.style.fontWeight = 'bold';
                
                const transferLabelObject = new CSS2DObject(transferLabel);
                transferLabelObject.position.set(0, -15, 0);
                this.visualizer.currentReactionGroup.add(transferLabelObject);
                this.molecules.labels.instruction = transferLabelObject;
                
                // Animate electron transfer with enhanced visibility
                if(sodiumValenceElectron) {
                    // Make sure the electron is very visible
                    sodiumValenceElectron.mesh.scale.set(2.0, 2.0, 2.0);
                    sodiumValenceElectron.mesh.material.emissive.set(0xffff00);
                    sodiumValenceElectron.mesh.material.emissiveIntensity = 1.0;
                    
                    // Create trail effect for the electron
                    const createTrail = () => {
                        const trailGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                        const trailMaterial = new THREE.MeshBasicMaterial({
                            color: 0xffff00,
                            transparent: true,
                            opacity: 0.7
                        });
                        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                        trail.position.copy(sodiumValenceElectron.mesh.position);
                        this.visualizer.currentReactionGroup.add(trail);
                        
                        // Fade out and remove trail
                        new TWEEN.Tween(trailMaterial)
                            .to({ opacity: 0 }, 600)
                            .onComplete(() => {
                                this.visualizer.currentReactionGroup.remove(trail);
                                trailGeometry.dispose();
                                trailMaterial.dispose();
                            })
                            .start();
                    };
                    
                    // Start trail effect
                    const trailInterval = setInterval(createTrail, 50);
                    
                    // Slower, more dramatic transfer with pauses
                    setTimeout(() => {
                        // First move electron outward from sodium
                        new TWEEN.Tween(sodiumValenceElectron.mesh.position)
                            .to({ 
                                x: sodiumValenceElectron.mesh.position.x + 4,
                                y: sodiumValenceElectron.mesh.position.y + 2
                            }, 1000)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onComplete(() => {
                                // Then transfer to chlorine with enhanced animation
                                this.visualizer.animateElectronTransfer(sodiumValenceElectron, this.molecules.sodium, this.molecules.chlorine, () => {
                                    // Stop trail effect
                                    clearInterval(trailInterval);
                                    
                                    // Update atom appearances to show ion formation
                                    // Sodium becomes smaller and dimmer (lost electron)
                                    new TWEEN.Tween(this.molecules.sodium.nucleus.scale)
                                        .to({ x: 0.9, y: 0.9, z: 0.9 }, 800)
                                        .start();
                                    
                                    // Chlorine becomes slightly larger (gained electron)
                                    new TWEEN.Tween(this.molecules.chlorine.nucleus.scale)
                                        .to({ x: 1.1, y: 1.1, z: 1.1 }, 800)
                                        .start();
                                    
                                    // Update the labels to show ions
                                    this.molecules.sodium.group.remove(this.molecules.labels.na);
                                    this.molecules.chlorine.group.remove(this.molecules.labels.cl);
                                    
                                    // Create Na+ label
                                    const naPlusLabel = document.createElement('div');
                                    naPlusLabel.className = 'molecule-label';
                                    naPlusLabel.textContent = 'Na⁺';
                                    naPlusLabel.style.color = '#ffffff';
                                    naPlusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    naPlusLabel.style.padding = '3px 6px';
                                    naPlusLabel.style.borderRadius = '4px';
                                    naPlusLabel.style.fontSize = '16px';
                                    naPlusLabel.style.fontWeight = 'bold';
                                    
                                    const naPlusLabelObject = new CSS2DObject(naPlusLabel);
                                    naPlusLabelObject.position.set(0, -7, 0);
                                    this.molecules.sodium.group.add(naPlusLabelObject);
                                    
                                    // Create Cl- label
                                    const clMinusLabel = document.createElement('div');
                                    clMinusLabel.className = 'molecule-label';
                                    clMinusLabel.textContent = 'Cl⁻';
                                    clMinusLabel.style.color = '#00ff00';
                                    clMinusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    clMinusLabel.style.padding = '3px 6px';
                                    clMinusLabel.style.borderRadius = '4px';
                                    clMinusLabel.style.fontSize = '16px';
                                    clMinusLabel.style.fontWeight = 'bold';
                                    
                                    const clMinusLabelObject = new CSS2DObject(clMinusLabel);
                                    clMinusLabelObject.position.set(0, -7, 0);
                                    this.molecules.chlorine.group.add(clMinusLabelObject);
                                    
                                    // Store new labels
                                    this.molecules.labels = {
                                        naPlus: naPlusLabelObject,
                                        clMinus: clMinusLabelObject,
                                        instruction: this.molecules.labels.instruction
                                    };
                                    
                                    // Change instruction
                                    transferLabel.textContent = 'Electron transferred! Na became Na⁺ and Cl became Cl⁻';
                                    
                                    // Add glowing charge indicators
                                    const addChargeGlow = (atom, charge) => {
                                        const color = charge === '+' ? 0xff3333 : 0x3333ff;
                                        const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
                                        const glowMaterial = new THREE.MeshBasicMaterial({
                                            color: color,
                                            transparent: true,
                                            opacity: 0.3
                                        });
                                        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                                        atom.nucleus.add(glow);
                                        
                                        // Pulsing animation for the charge
                                        const pulseCharge = () => {
                                            new TWEEN.Tween(glowMaterial)
                                                .to({ opacity: 0.5 }, 800)
                                                .easing(TWEEN.Easing.Quadratic.InOut)
                                                .onComplete(() => {
                                                    new TWEEN.Tween(glowMaterial)
                                                        .to({ opacity: 0.2 }, 800)
                                                        .easing(TWEEN.Easing.Quadratic.InOut)
                                                        .onComplete(pulseCharge)
                                                        .start();
                                                })
                                                .start();
                                        };
                                        pulseCharge();
                                        
                                        return glow;
                                    };
                                    
                                    this.chargeLabels = {
                                        sodium: addChargeGlow(this.molecules.sodium, '+'),
                                        chlorine: addChargeGlow(this.molecules.chlorine, '-')
                                    };
                                    
                                    this.visualizer.animationInProgress = false;
                                });
                            })
                            .start();
                    }, 1000); // Initial pause for dramatic effect
                } else {
                    console.error("Could not find sodium valence electron");
                    this.visualizer.animationInProgress = false;
                }
                break;
                
            case 2: // Ionic Attraction
                // Update instruction
                if (this.molecules.labels.instruction) {
                    this.visualizer.currentReactionGroup.remove(this.molecules.labels.instruction);
                }
                
                const attractionLabel = document.createElement('div');
                attractionLabel.className = 'instruction-label';
                attractionLabel.textContent = 'Opposite charges attract each other!';
                attractionLabel.style.color = '#ffffff';
                attractionLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                attractionLabel.style.padding = '8px 12px';
                attractionLabel.style.borderRadius = '6px';
                attractionLabel.style.fontSize = '18px';
                attractionLabel.style.fontWeight = 'bold';
                
                const attractionLabelObject = new CSS2DObject(attractionLabel);
                attractionLabelObject.position.set(0, -15, 0);
                this.visualizer.currentReactionGroup.add(attractionLabelObject);
                this.molecules.labels.instruction = attractionLabelObject;
                
                // Create visual electric field lines between ions
                this.createElectricFieldLines();
                
                // Move atoms closer with a dramatic animation
                new TWEEN.Tween(this.molecules.sodium.group.position)
                    .to({ x: -5 }, 2000)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .start();
                    
                new TWEEN.Tween(this.molecules.chlorine.group.position)
                    .to({ x: 5 }, 2000)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .onComplete(() => {
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
                
            case 3: // Final State (NaCl crystal)
                // Update instruction
                if (this.molecules.labels.instruction) {
                    this.visualizer.currentReactionGroup.remove(this.molecules.labels.instruction);
                }
                
                const finalLabel = document.createElement('div');
                finalLabel.className = 'instruction-label';
                finalLabel.textContent = 'Sodium chloride (NaCl) crystal forms - this is table salt!';
                finalLabel.style.color = '#ffffff';
                finalLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                finalLabel.style.padding = '8px 12px';
                finalLabel.style.borderRadius = '6px';
                finalLabel.style.fontSize = '18px';
                finalLabel.style.fontWeight = 'bold';
                
                const finalLabelObject = new CSS2DObject(finalLabel);
                finalLabelObject.position.set(0, -15, 0);
                this.visualizer.currentReactionGroup.add(finalLabelObject);
                this.molecules.labels.instruction = finalLabelObject;
                
                // Remove electric field lines
                if (this.electricField) {
                    this.visualizer.currentReactionGroup.remove(this.electricField);
                    this.electricField = null;
                }
                
                // Move to final positions with dramatic effect
                new TWEEN.Tween(this.molecules.sodium.group.position)
                    .to({ x: 0, y: 0 }, 1500)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.chlorine.group.position)
                    .to({ x: 0, y: 0 }, 1500)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Create bond between Na and Cl
                        const bondGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
                        const bondMaterial = new THREE.MeshBasicMaterial({ 
                            color: 0xffffff,
                            transparent: true,
                            opacity: 0.6
                        });
                        const bond = new THREE.Mesh(bondGeometry, bondMaterial);
                        bond.rotation.z = Math.PI / 2;
                        this.visualizer.currentReactionGroup.add(bond);
                        
                        // Add NaCl label
                        const naclLabel = document.createElement('div');
                        naclLabel.className = 'molecule-label';
                        naclLabel.textContent = 'NaCl';
                        naclLabel.style.color = '#ffffff';
                        naclLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        naclLabel.style.padding = '5px 10px';
                        naclLabel.style.borderRadius = '6px';
                        naclLabel.style.fontSize = '20px';
                        naclLabel.style.fontWeight = 'bold';
                        
                        const naclLabelObject = new CSS2DObject(naclLabel);
                        naclLabelObject.position.set(0, -10, 0);
                        this.visualizer.currentReactionGroup.add(naclLabelObject);
                        
                        // Add simple crystal structure visualization
                        setTimeout(() => {
                            this.createSimpleCrystalStructure();
                            this.visualizer.animationInProgress = false;
                        }, 1000);
                    })
                    .start();
                break;
        }
    }
    
    createElectricFieldLines() {
        // Remove existing field if any
        if (this.electricField) {
            this.visualizer.currentReactionGroup.remove(this.electricField);
        }
        
        // Create a group for the electric field
        this.electricField = new THREE.Group();
        this.visualizer.currentReactionGroup.add(this.electricField);
        
        // Get positions of sodium and chlorine
        const naPos = new THREE.Vector3();
        const clPos = new THREE.Vector3();
        this.molecules.sodium.nucleus.getWorldPosition(naPos);
        this.molecules.chlorine.nucleus.getWorldPosition(clPos);
        
        // Create field lines between Na+ and Cl-
        const lineCount = 8;
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x3399ff,
            transparent: true,
            opacity: 0.7,
            linewidth: 2
        });
        
        for (let i = 0; i < lineCount; i++) {
            const angle = (Math.PI * 2 * i) / lineCount;
            const radius = 2;
            
            // Calculate offset points around sodium and chlorine
            const naOffset = new THREE.Vector3(
                naPos.x + Math.cos(angle) * radius,
                naPos.y + Math.sin(angle) * radius,
                naPos.z
            );
            
            const clOffset = new THREE.Vector3(
                clPos.x + Math.cos(angle + Math.PI) * radius,
                clPos.y + Math.sin(angle + Math.PI) * radius,
                clPos.z
            );
            
            // Create curved path between points
            const curvePoints = [];
            const segments = 20;
            
            for (let j = 0; j <= segments; j++) {
                const t = j / segments;
                
                // Create a curved path with some droop/bend
                const pt = new THREE.Vector3().lerpVectors(naOffset, clOffset, t);
                
                // Add a sine wave curve to the path
                const midPoint = 0.5;
                const amplitude = 2;
                const frequency = 1;
                
                // Apply curve only near the middle of the path
                const curveIntensity = Math.sin(t * Math.PI) * amplitude;
                const yOffset = Math.sin((t - 0.5) * frequency * Math.PI) * curveIntensity;
                
                pt.y += yOffset;
                
                curvePoints.push(pt);
            }
            
            // Create the line
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const line = new THREE.Line(lineGeometry, lineMaterial.clone());
            this.electricField.add(line);
            
            // Animate the line with glowing pulses
            const material = line.material;
            const pulseLine = () => {
                new TWEEN.Tween(material)
                    .to({ opacity: 0.9 }, 1000)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        new TWEEN.Tween(material)
                            .to({ opacity: 0.3 }, 1000)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(pulseLine)
                            .start();
                    })
                    .start();
            };
            pulseLine();
        }
    }
    
    createSimpleCrystalStructure() {
        // Create a simple cubic structure to represent NaCl crystal
        const crystalGroup = new THREE.Group();
        this.visualizer.currentReactionGroup.add(crystalGroup);
        
        // Define positions for a simple 2x2x2 crystal (simplified)
        const positions = [
            // Front face
            {x: -5, y: 5, z: 5, type: 'Na'},
            {x: 5, y: 5, z: 5, type: 'Cl'},
            {x: -5, y: -5, z: 5, type: 'Cl'},
            {x: 5, y: -5, z: 5, type: 'Na'},
            
            // Back face
            {x: -5, y: 5, z: -5, type: 'Cl'},
            {x: 5, y: 5, z: -5, type: 'Na'},
            {x: -5, y: -5, z: -5, type: 'Na'},
            {x: 5, y: -5, z: -5, type: 'Cl'}
        ];
        
        // Create atoms at each position
        positions.forEach((pos, index) => {
            // Create a simplified atom (just the nucleus, no electrons)
            const radius = pos.type === 'Na' ? 0.7 : 0.9;
            const color = pos.type === 'Na' ? 0xdddddd : 0x00ff00;
            
            const geometry = new THREE.SphereGeometry(radius, 16, 16);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                emissive: color,
                emissiveIntensity: 0.3
            });
            
            const atom = new THREE.Mesh(geometry, material);
            atom.position.set(pos.x, pos.y, pos.z);
            
            // Add label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'nucleus-label';
            labelDiv.textContent = pos.type;
            labelDiv.style.color = 'white';
            labelDiv.style.fontSize = '10px';
            labelDiv.style.fontWeight = 'bold';
            labelDiv.style.textShadow = '0px 0px 3px rgba(0, 0, 0, 0.9)';
            
            const label = new CSS2DObject(labelDiv);
            atom.add(label);
            
            // Animate the atom into place
            atom.scale.set(0.01, 0.01, 0.01);
            
            new TWEEN.Tween(atom.scale)
                .to({ x: 1, y: 1, z: 1 }, 1000)
                .delay(index * 200)
                .easing(TWEEN.Easing.Elastic.Out)
                .start();
                
            crystalGroup.add(atom);
        });
        
        // Add bonds (simplified representation)
        const addBonds = () => {
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const pos1 = positions[i];
                    const pos2 = positions[j];
                    
                    // Only connect Na to Cl (not Na-Na or Cl-Cl)
                    if (pos1.type === pos2.type) continue;
                    
                    // Calculate distance
                    const dx = pos1.x - pos2.x;
                    const dy = pos1.y - pos2.y;
                    const dz = pos1.z - pos2.z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    // Only connect adjacent atoms
                    if (distance > 12) continue;
                    
                    // Create bond
                    const bondGeometry = new THREE.CylinderGeometry(0.15, 0.15, distance, 8);
                    const bondMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.4
                    });
                    
                    const bond = new THREE.Mesh(bondGeometry, bondMaterial);
                    
                    // Position and orient bond
                    const midpoint = new THREE.Vector3(
                        (pos1.x + pos2.x) / 2,
                        (pos1.y + pos2.y) / 2,
                        (pos1.z + pos2.z) / 2
                    );
                    
                    bond.position.copy(midpoint);
                    bond.lookAt(new THREE.Vector3(pos2.x, pos2.y, pos2.z));
                    bond.rotateX(Math.PI / 2);
                    
                    // Animate bond appearance
                    bond.scale.set(1, 0.01, 1);
                    new TWEEN.Tween(bond.scale)
                        .to({ x: 1, y: 1, z: 1 }, 800)
                        .delay((i + j) * 100)
                        .easing(TWEEN.Easing.Quadratic.Out)
                        .start();
                        
                    crystalGroup.add(bond);
                }
            }
        };
        
        // Add bonds after a delay
        setTimeout(addBonds, 1800);
        
        // Add crystal structure label
        const crystalLabel = document.createElement('div');
        crystalLabel.className = 'molecule-label';
        crystalLabel.textContent = 'NaCl Crystal (Table Salt)';
        crystalLabel.style.color = '#ffffff';
        crystalLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        crystalLabel.style.padding = '5px 10px';
        crystalLabel.style.borderRadius = '6px';
        crystalLabel.style.fontSize = '18px';
        crystalLabel.style.fontWeight = 'bold';
        
        const crystalLabelObject = new CSS2DObject(crystalLabel);
        crystalLabelObject.position.set(0, -15, 0);
        crystalGroup.add(crystalLabelObject);
        
        // Start with group scaled down, then grow it
        crystalGroup.scale.set(0.01, 0.01, 0.01);
        crystalGroup.position.set(0, 0, 0);
        
        new TWEEN.Tween(crystalGroup.scale)
            .to({ x: 1, y: 1, z: 1 }, 2000)
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
            
        // Slowly rotate the crystal structure for better viewing
        const rotateAnimation = () => {
            new TWEEN.Tween(crystalGroup.rotation)
                .to({ 
                    y: crystalGroup.rotation.y + Math.PI * 2,
                    x: crystalGroup.rotation.x + Math.PI / 4
                }, 20000)
                .easing(TWEEN.Easing.Linear.None)
                .onComplete(rotateAnimation)
                .start();
        };
        
        setTimeout(rotateAnimation, 3000);
    }
    
    animate() {
        this.visualizer.animationInProgress = true;
        
        // Phase 1: Electron Transfer
        this.visualizer.updateReactionInfo(1);
        this.visualizer.currentStep = 1;
        
        // Remove instruction label if it exists
        if (this.molecules.labels && this.molecules.labels.instruction) {
            this.visualizer.currentReactionGroup.remove(this.molecules.labels.instruction);
        }
        
        // Update instruction text
        const transferLabel = document.createElement('div');
        transferLabel.className = 'instruction-label';
        transferLabel.textContent = 'Watch the electron transfer!';
        transferLabel.style.color = '#ffff00';
        transferLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        transferLabel.style.padding = '8px 12px';
        transferLabel.style.borderRadius = '6px';
        transferLabel.style.fontSize = '18px';
        transferLabel.style.fontWeight = 'bold';
        
        const transferLabelObject = new CSS2DObject(transferLabel);
        transferLabelObject.position.set(0, -15, 0);
        this.visualizer.currentReactionGroup.add(transferLabelObject);
        this.molecules.labels.instruction = transferLabelObject;
        
        // Find the outermost electron of sodium
        const sodiumValenceElectron = this.molecules.sodium.electrons.find(
            e => e.shellIndex === this.visualizer.elements['Na'].electronsPerShell.length - 1
        );
        
        // Highlight sodium during transfer
        this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
        
        if(sodiumValenceElectron) {
            // Make sure the electron is very visible
            sodiumValenceElectron.mesh.scale.set(2.0, 2.0, 2.0);
            sodiumValenceElectron.mesh.material.emissive.set(0xffff00);
            sodiumValenceElectron.mesh.material.emissiveIntensity = 1.0;
            
            // Create trail effect for the electron
            const createTrail = () => {
                const trailGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                const trailMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffff00,
                    transparent: true,
                    opacity: 0.7
                });
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                trail.position.copy(sodiumValenceElectron.mesh.position);
                this.visualizer.currentReactionGroup.add(trail);
                
                // Fade out and remove trail
                new TWEEN.Tween(trailMaterial)
                    .to({ opacity: 0 }, 600)
                    .onComplete(() => {
                        this.visualizer.currentReactionGroup.remove(trail);
                        trailGeometry.dispose();
                        trailMaterial.dispose();
                    })
                    .start();
            };
            
            // Start trail effect
            const trailInterval = setInterval(createTrail, 50);
            
            // Slower, more dramatic transfer with pauses
            setTimeout(() => {
                // First move electron outward from sodium
                new TWEEN.Tween(sodiumValenceElectron.mesh.position)
                    .to({ 
                        x: sodiumValenceElectron.mesh.position.x + 4,
                        y: sodiumValenceElectron.mesh.position.y + 2
                    }, 1000)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onComplete(() => {
                        // Then transfer to chlorine with enhanced animation
                        this.visualizer.animateElectronTransfer(sodiumValenceElectron, this.molecules.sodium, this.molecules.chlorine, () => {
                            // Stop trail effect
                            clearInterval(trailInterval);
                            
                            // Update atom appearances to show ion formation
                            // Sodium becomes smaller and dimmer (lost electron)
                            new TWEEN.Tween(this.molecules.sodium.nucleus.scale)
                                .to({ x: 0.9, y: 0.9, z: 0.9 }, 800)
                                .start();
                            
                            // Chlorine becomes slightly larger (gained electron)
                            new TWEEN.Tween(this.molecules.chlorine.nucleus.scale)
                                .to({ x: 1.1, y: 1.1, z: 1.1 }, 800)
                                .start();
                            
                            // Update the labels to show ions
                            this.molecules.sodium.group.remove(this.molecules.labels.na);
                            this.molecules.chlorine.group.remove(this.molecules.labels.cl);
                            
                            // Create Na+ label
                            const naPlusLabel = document.createElement('div');
                            naPlusLabel.className = 'molecule-label';
                            naPlusLabel.textContent = 'Na⁺';
                            naPlusLabel.style.color = '#ffffff';
                            naPlusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            naPlusLabel.style.padding = '3px 6px';
                            naPlusLabel.style.borderRadius = '4px';
                            naPlusLabel.style.fontSize = '16px';
                            naPlusLabel.style.fontWeight = 'bold';
                            
                            const naPlusLabelObject = new CSS2DObject(naPlusLabel);
                            naPlusLabelObject.position.set(0, -7, 0);
                            this.molecules.sodium.group.add(naPlusLabelObject);
                            
                            // Create Cl- label
                            const clMinusLabel = document.createElement('div');
                            clMinusLabel.className = 'molecule-label';
                            clMinusLabel.textContent = 'Cl⁻';
                            clMinusLabel.style.color = '#00ff00';
                            clMinusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            clMinusLabel.style.padding = '3px 6px';
                            clMinusLabel.style.borderRadius = '4px';
                            clMinusLabel.style.fontSize = '16px';
                            clMinusLabel.style.fontWeight = 'bold';
                            
                            const clMinusLabelObject = new CSS2DObject(clMinusLabel);
                            clMinusLabelObject.position.set(0, -7, 0);
                            this.molecules.chlorine.group.add(clMinusLabelObject);
                            
                            // Store new labels
                            this.molecules.labels = {
                                naPlus: naPlusLabelObject,
                                clMinus: clMinusLabelObject,
                                instruction: this.molecules.labels.instruction
                            };
                            
                            // Change instruction
                            transferLabel.textContent = 'Electron transferred! Na became Na⁺ and Cl became Cl⁻';
                            
                            // Add glowing charge indicators
                            const addChargeGlow = (atom, charge) => {
                                const color = charge === '+' ? 0xff3333 : 0x3333ff;
                                const glowGeometry = new THREE.SphereGeometry(2.5, 16, 16);
                                const glowMaterial = new THREE.MeshBasicMaterial({
                                    color: color,
                                    transparent: true,
                                    opacity: 0.3
                                });
                                const glow = new THREE.Mesh(glowGeometry, glowMaterial);
                                atom.nucleus.add(glow);
                                
                                // Pulsing animation for the charge
                                const pulseCharge = () => {
                                    new TWEEN.Tween(glowMaterial)
                                        .to({ opacity: 0.5 }, 800)
                                        .easing(TWEEN.Easing.Quadratic.InOut)
                                        .onComplete(() => {
                                            new TWEEN.Tween(glowMaterial)
                                                .to({ opacity: 0.2 }, 800)
                                                .easing(TWEEN.Easing.Quadratic.InOut)
                                                .onComplete(pulseCharge)
                                                .start();
                                        })
                                        .start();
                                };
                                pulseCharge();
                                
                                return glow;
                            };
                            
                            this.chargeLabels = {
                                sodium: addChargeGlow(this.molecules.sodium, '+'),
                                chlorine: addChargeGlow(this.molecules.chlorine, '-')
                            };
                            
                            // Phase 2: Ionic Attraction (after a pause)
                            setTimeout(() => {
                                this.visualizer.updateReactionInfo(2);
                                this.visualizer.currentStep = 2;
                                
                                // Update instruction
                                transferLabel.textContent = 'Opposite charges attract each other!';
                                
                                // Create visual electric field lines between ions
                                this.createElectricFieldLines();
                                
                                // Move atoms closer with a dramatic animation
                                new TWEEN.Tween(this.molecules.sodium.group.position)
                                    .to({ x: -5 }, 2000)
                                    .easing(TWEEN.Easing.Elastic.Out)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.chlorine.group.position)
                                    .to({ x: 5 }, 2000)
                                    .easing(TWEEN.Easing.Elastic.Out)
                                    .onComplete(() => {
                                        // Phase 3: Final State (after a pause)
                                        setTimeout(() => {
                                            this.visualizer.updateReactionInfo(3);
                                            this.visualizer.currentStep = 3;
                                            
                                            // Update instruction
                                            transferLabel.textContent = 'Sodium chloride (NaCl) crystal forms - this is table salt!';
                                            
                                            // Remove electric field lines
                                            if (this.electricField) {
                                                this.visualizer.currentReactionGroup.remove(this.electricField);
                                                this.electricField = null;
                                            }
                                            
                                            // Move to final positions with dramatic effect
                                            new TWEEN.Tween(this.molecules.sodium.group.position)
                                                .to({ x: 0, y: 0 }, 1500)
                                                .easing(TWEEN.Easing.Quadratic.InOut)
                                                .start();
                                                
                                            new TWEEN.Tween(this.molecules.chlorine.group.position)
                                                .to({ x: 0, y: 0 }, 1500)
                                                .easing(TWEEN.Easing.Quadratic.InOut)
                                                .onComplete(() => {
                                                    // Create bond between Na and Cl
                                                    const bondGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 16);
                                                    const bondMaterial = new THREE.MeshBasicMaterial({ 
                                                        color: 0xffffff,
                                                        transparent: true,
                                                        opacity: 0.6
                                                    });
                                                    const bond = new THREE.Mesh(bondGeometry, bondMaterial);
                                                    bond.rotation.z = Math.PI / 2;
                                                    this.visualizer.currentReactionGroup.add(bond);
                                                    
                                                    // Add NaCl label
                                                    const naclLabel = document.createElement('div');
                                                    naclLabel.className = 'molecule-label';
                                                    naclLabel.textContent = 'NaCl';
                                                    naclLabel.style.color = '#ffffff';
                                                    naclLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                                    naclLabel.style.padding = '5px 10px';
                                                    naclLabel.style.borderRadius = '6px';
                                                    naclLabel.style.fontSize = '20px';
                                                    naclLabel.style.fontWeight = 'bold';
                                                    
                                                    const naclLabelObject = new CSS2DObject(naclLabel);
                                                    naclLabelObject.position.set(0, -10, 0);
                                                    this.visualizer.currentReactionGroup.add(naclLabelObject);
                                                    
                                                    // Add simple crystal structure visualization
                                                    setTimeout(() => {
                                                        this.createSimpleCrystalStructure();
                                                        this.visualizer.animationInProgress = false;
                                                        this.visualizer.playButton.disabled = false;
                                                        this.visualizer.stepButton.disabled = false;
                                                    }, 1000);
                                                })
                                                .start();
                                        }, 2000);
                                    })
                                    .start();
                            }, 3000);
                        });
                    })
                    .start();
            }, 1000); // Initial pause for dramatic effect
        }
    }
}

export default new IonicBondReaction();
