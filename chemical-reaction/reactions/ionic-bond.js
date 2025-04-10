import * as THREE from 'three';
import TWEEN from 'tween';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Ionic Bond Formation: Na + Cl → Na⁺ + Cl⁻ → NaCl
class IonicBondReaction {
    constructor() {
        this.visualizer = null;
        this.molecules = {};
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
                electronInfo: 'Each sodium ion is surrounded by 6 chloride ions and vice versa in the crystal structure.'
            }
        ];
    }
    
    setup() {
        // Create sodium atom
        const sodium = this.visualizer.createAtom('Na', new THREE.Vector3(-8, 0, 0), 1.0, true);
        
        // Create chlorine atom
        const chlorine = this.visualizer.createAtom('Cl', new THREE.Vector3(8, 0, 0), 1.0, true);
        
        // Add labels for clarity
        const naLabel = document.createElement('div');
        naLabel.className = 'molecule-label';
        naLabel.textContent = 'Na';
        naLabel.style.color = '#dddddd';
        naLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const naLabelObject = new CSS2DObject(naLabel);
        naLabelObject.position.set(0, -5, 0);
        sodium.group.add(naLabelObject);
        
        const clLabel = document.createElement('div');
        clLabel.className = 'molecule-label';
        clLabel.textContent = 'Cl';
        clLabel.style.color = '#00ff00';
        clLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const clLabelObject = new CSS2DObject(clLabel);
        clLabelObject.position.set(0, -5, 0);
        chlorine.group.add(clLabelObject);
        
        // Store for animation reference
        this.molecules = {
            sodium: sodium,
            chlorine: chlorine,
            labels: {
                na: naLabelObject,
                cl: clLabelObject
            }
        };
        
        // Set camera position
        this.visualizer.camera.position.set(0, 0, 25);
        this.visualizer.controls.update();
    }
    
    step(phase) {
        this.visualizer.animationInProgress = true;
        
        switch(phase) {
            case 1: // Electron Transfer
                // Find the outermost electron of sodium
                const sodiumValenceElectron = this.molecules.sodium.electrons.find(
                    e => e.shellIndex === this.visualizer.elements['Na'].electronsPerShell.length - 1
                );
                
                // Highlight sodium during transfer
                this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
                
                // Animate electron transfer
                if(sodiumValenceElectron) {
                    this.visualizer.animateElectronTransfer(sodiumValenceElectron, this.molecules.sodium, this.molecules.chlorine, () => {
                        // Reset highlight
                        this.molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                        
                        // Update labels to show ionic charge
                        this.visualizer.currentReactionGroup.remove(this.molecules.labels.na);
                        this.visualizer.currentReactionGroup.remove(this.molecules.labels.cl);
                        
                        const naPlusLabel = document.createElement('div');
                        naPlusLabel.className = 'molecule-label';
                        naPlusLabel.textContent = 'Na⁺';
                        naPlusLabel.style.color = '#dddddd';
                        naPlusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        
                        const naPlusLabelObject = new CSS2DObject(naPlusLabel);
                        naPlusLabelObject.position.set(0, -5, 0);
                        this.molecules.sodium.group.add(naPlusLabelObject);
                        
                        const clMinusLabel = document.createElement('div');
                        clMinusLabel.className = 'molecule-label';
                        clMinusLabel.textContent = 'Cl⁻';
                        clMinusLabel.style.color = '#00ff00';
                        clMinusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        
                        const clMinusLabelObject = new CSS2DObject(clMinusLabel);
                        clMinusLabelObject.position.set(0, -5, 0);
                        this.molecules.chlorine.group.add(clMinusLabelObject);
                        
                        // Update molecules for future reference
                        this.molecules.labels = {
                            naPlus: naPlusLabelObject,
                            clMinus: clMinusLabelObject
                        };
                        
                        this.visualizer.animationInProgress = false;
                    });
                } else {
                    console.error("Could not find sodium valence electron");
                    this.visualizer.animationInProgress = false;
                }
                break;
                
            case 2: // Ionic Attraction
                // Highlight both ions to show attraction
                this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
                this.molecules.chlorine.nucleus.material.emissiveIntensity = 0.7;
                
                // Bring atoms closer together
                new TWEEN.Tween(this.molecules.sodium.group.position)
                    .to({ x: -4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.chlorine.group.position)
                    .to({ x: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset highlight
                        this.molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                        this.molecules.chlorine.nucleus.material.emissiveIntensity = 0.4;
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
                
            case 3: // Final State (NaCl crystal)
                // Move to final positions
                new TWEEN.Tween(this.molecules.sodium.group.position)
                    .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.chlorine.group.position)
                    .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Add more ions to suggest crystal structure (just visual suggestion)
                        for(let i = 0; i < 6; i++) {
                            const angle = (Math.PI * 2 * i) / 6;
                            const distance = 8;
                            const x = Math.cos(angle) * distance;
                            const y = Math.sin(angle) * distance;
                            
                            // Alternate Na and Cl
                            if(i % 2 === 0) {
                                this.visualizer.createAtom('Na', new THREE.Vector3(x, y, 0), 0.8, false);
                            } else {
                                this.visualizer.createAtom('Cl', new THREE.Vector3(x, y, 0), 0.8, false);
                            }
                        }
                        
                        // Add NaCl label in the center
                        const naclLabel = document.createElement('div');
                        naclLabel.className = 'molecule-label';
                        naclLabel.textContent = 'NaCl';
                        naclLabel.style.color = '#ffffff';
                        naclLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        naclLabel.style.padding = '3px 6px';
                        naclLabel.style.borderRadius = '4px';
                        naclLabel.style.fontSize = '16px';
                        naclLabel.style.fontWeight = 'bold';
                        
                        const naclLabelObject = new CSS2DObject(naclLabel);
                        naclLabelObject.position.set(0, -12, 0);
                        this.visualizer.currentReactionGroup.add(naclLabelObject);
                        
                        // Update labels to crystal structure
                        if (this.molecules.labels) {
                            if (this.molecules.labels.naPlus) {
                                this.molecules.sodium.group.remove(this.molecules.labels.naPlus);
                            }
                            if (this.molecules.labels.clMinus) {
                                this.molecules.chlorine.group.remove(this.molecules.labels.clMinus);
                            }
                        }
                        
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
        }
    }
    
    animate() {
        this.visualizer.animationInProgress = true;
        
        // Phase 1: Electron Transfer
        this.visualizer.updateReactionInfo(1);
        this.visualizer.currentStep = 1;
        
        // Find the outermost electron of sodium
        const sodiumValenceElectron = this.molecules.sodium.electrons.find(
            e => e.shellIndex === this.visualizer.elements['Na'].electronsPerShell.length - 1
        );
        
        // Highlight sodium during transfer
        this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
        
        // Animate electron transfer
        this.visualizer.animateElectronTransfer(sodiumValenceElectron, this.molecules.sodium, this.molecules.chlorine, () => {
            // Reset highlight
            this.molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
            
            // Update labels to show ionic charge
            this.visualizer.currentReactionGroup.remove(this.molecules.labels.na);
            this.visualizer.currentReactionGroup.remove(this.molecules.labels.cl);
            
            const naPlusLabel = document.createElement('div');
            naPlusLabel.className = 'molecule-label';
            naPlusLabel.textContent = 'Na⁺';
            naPlusLabel.style.color = '#dddddd';
            naPlusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            
            const naPlusLabelObject = new CSS2DObject(naPlusLabel);
            naPlusLabelObject.position.set(0, -5, 0);
            this.molecules.sodium.group.add(naPlusLabelObject);
            
            const clMinusLabel = document.createElement('div');
            clMinusLabel.className = 'molecule-label';
            clMinusLabel.textContent = 'Cl⁻';
            clMinusLabel.style.color = '#00ff00';
            clMinusLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            
            const clMinusLabelObject = new CSS2DObject(clMinusLabel);
            clMinusLabelObject.position.set(0, -5, 0);
            this.molecules.chlorine.group.add(clMinusLabelObject);
            
            // Update molecules for future reference
            this.molecules.labels = {
                naPlus: naPlusLabelObject,
                clMinus: clMinusLabelObject
            };
            
            // Phase 2: Ionic Attraction
            setTimeout(() => {
                this.visualizer.updateReactionInfo(2);
                this.visualizer.currentStep = 2;
                
                // Highlight both ions to show attraction
                this.molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
                this.molecules.chlorine.nucleus.material.emissiveIntensity = 0.7;
                
                // Bring atoms closer together
                new TWEEN.Tween(this.molecules.sodium.group.position)
                    .to({ x: -4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.chlorine.group.position)
                    .to({ x: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset highlight
                        this.molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                        this.molecules.chlorine.nucleus.material.emissiveIntensity = 0.4;
                        
                        // Phase 3: Final State
                        setTimeout(() => {
                            this.visualizer.updateReactionInfo(3);
                            this.visualizer.currentStep = 3;
                            
                            // Move to final positions
                            new TWEEN.Tween(this.molecules.sodium.group.position)
                                .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(this.molecules.chlorine.group.position)
                                .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .onComplete(() => {
                                    // Add more ions to suggest crystal structure
                                    for(let i = 0; i < 6; i++) {
                                        const angle = (Math.PI * 2 * i) / 6;
                                        const distance = 8;
                                        const x = Math.cos(angle) * distance;
                                        const y = Math.sin(angle) * distance;
                                        
                                        // Alternate Na and Cl
                                        if(i % 2 === 0) {
                                            this.visualizer.createAtom('Na', new THREE.Vector3(x, y, 0), 0.8, false);
                                        } else {
                                            this.visualizer.createAtom('Cl', new THREE.Vector3(x, y, 0), 0.8, false);
                                        }
                                    }
                                    
                                    // Add NaCl label in the center
                                    const naclLabel = document.createElement('div');
                                    naclLabel.className = 'molecule-label';
                                    naclLabel.textContent = 'NaCl';
                                    naclLabel.style.color = '#ffffff';
                                    naclLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    naclLabel.style.padding = '3px 6px';
                                    naclLabel.style.borderRadius = '4px';
                                    naclLabel.style.fontSize = '16px';
                                    naclLabel.style.fontWeight = 'bold';
                                    
                                    const naclLabelObject = new CSS2DObject(naclLabel);
                                    naclLabelObject.position.set(0, -12, 0);
                                    this.visualizer.currentReactionGroup.add(naclLabelObject);
                                    
                                    // Update labels to crystal structure
                                    if (this.molecules.labels) {
                                        if (this.molecules.labels.naPlus) {
                                            this.molecules.sodium.group.remove(this.molecules.labels.naPlus);
                                        }
                                        if (this.molecules.labels.clMinus) {
                                            this.molecules.chlorine.group.remove(this.molecules.labels.clMinus);
                                        }
                                    }
                                    
                                    this.visualizer.animationInProgress = false;
                                    this.visualizer.playButton.disabled = false;
                                    this.visualizer.stepButton.disabled = false;
                                })
                                .start();
                        }, 1000);
                    })
                    .start();
            }, 1000);
        });
    }
}

export default new IonicBondReaction();
