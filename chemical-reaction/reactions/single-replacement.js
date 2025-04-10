import * as THREE from 'three';
import TWEEN from 'tween';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Single replacement reaction: Zn + CuSO₄ → ZnSO₄ + Cu
class SingleReplacementReaction {
    constructor() {
        this.visualizer = null;
        this.molecules = {};
    }
    
    initialize(visualizer) {
        this.visualizer = visualizer;
    }
    
    getEquation() {
        return 'Zn + CuSO₄ → ZnSO₄ + Cu';
    }
    
    getPhases() {
        return [
            {
                name: 'Initial State: Reactants',
                explanation: 'This reaction begins with zinc metal (Zn) and copper sulfate (CuSO₄) solution. The zinc atoms have 2 valence electrons, while the copper ions in CuSO₄ have already lost 2 electrons (Cu²⁺).',
                electronInfo: 'Zinc has a stronger tendency to lose electrons than copper.'
            },
            {
                name: 'Electron Transfer',
                explanation: 'Zinc atoms lose 2 electrons, becoming Zn²⁺ ions. These electrons are transferred to Cu²⁺ ions, which gain the electrons and become neutral copper atoms.',
                electronInfo: 'Watch as electrons move from zinc to copper ions.'
            },
            {
                name: 'Final State: Products',
                explanation: 'The reaction is complete. We now have zinc sulfate (ZnSO₄) where zinc has replaced copper in the compound. The copper atoms have precipitated out as solid copper.',
                electronInfo: 'The electrons have been redistributed, creating new combinations of atoms.'
            }
        ];
    }
    
    setup() {
        // Create reaction components with better spacing
        const zinc = this.visualizer.createAtom('Zn', new THREE.Vector3(-12, 0, 0), 0.8, false);
        const copper = this.visualizer.createAtom('Cu', new THREE.Vector3(12, 0, 0), 0.8);
        
        // Create sulfate group (simplified)
        const sulfur = this.visualizer.createAtom('S', new THREE.Vector3(6, 0, 0), 0.7);
        const oxygen1 = this.visualizer.createAtom('O', new THREE.Vector3(6, 3, 0), 0.5, false);
        const oxygen2 = this.visualizer.createAtom('O', new THREE.Vector3(6, -3, 0), 0.5, false);
        const oxygen3 = this.visualizer.createAtom('O', new THREE.Vector3(9, 0, 0), 0.5, false);
        const oxygen4 = this.visualizer.createAtom('O', new THREE.Vector3(3, 0, 0), 0.5, false);
        
        // Create initial bonds in copper sulfate
        this.visualizer.createBond(sulfur, oxygen1);
        this.visualizer.createBond(sulfur, oxygen2);
        this.visualizer.createBond(sulfur, oxygen3);
        this.visualizer.createBond(sulfur, oxygen4);
        const copperSulfurBond = this.visualizer.createBond(copper, sulfur); // Initial bond between copper and sulfate
        
        // Add initial labels
        const cuSO4Label = document.createElement('div');
        cuSO4Label.className = 'molecule-label';
        cuSO4Label.textContent = 'CuSO₄';
        cuSO4Label.style.color = '#ffffff';
        cuSO4Label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        cuSO4Label.style.padding = '3px 6px';
        cuSO4Label.style.borderRadius = '4px';
        
        const cuSO4LabelObject = new CSS2DObject(cuSO4Label);
        cuSO4LabelObject.position.set(6, -5, 0);
        this.visualizer.currentReactionGroup.add(cuSO4LabelObject);
        
        const znLabel = document.createElement('div');
        znLabel.className = 'molecule-label';
        znLabel.textContent = 'Zn';
        znLabel.style.color = '#aaaaaa';
        znLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        znLabel.style.padding = '3px 6px';
        znLabel.style.borderRadius = '4px';
        
        const znLabelObject = new CSS2DObject(znLabel);
        znLabelObject.position.set(0, -3, 0);
        zinc.group.add(znLabelObject);
        
        // Store for animation reference
        this.molecules = {
            zinc: zinc,
            copper: copper,
            sulfate: {
                sulfur: sulfur,
                oxygens: [oxygen1, oxygen2, oxygen3, oxygen4]
            },
            labels: {
                cuSO4: cuSO4LabelObject,
                zn: znLabelObject
            },
            bonds: {
                copperSulfur: copperSulfurBond
            }
        };
        
        // Set camera position
        this.visualizer.camera.position.set(0, 0, 30);
        this.visualizer.controls.update();
    }
    
    step(phase) {
        this.visualizer.animationInProgress = true;
        
        switch(phase) {
            case 1: // Electron Transfer
                // Find valence electrons in zinc
                const zincValenceElectrons = this.molecules.zinc.electrons.slice(0, 2);
                
                // Add glow effect to highlight zinc during transfer
                this.molecules.zinc.nucleus.material.emissiveIntensity = 0.7;
                
                // Animate electron transfer (one at a time)
                this.visualizer.animateElectronTransfer(zincValenceElectrons[0], this.molecules.zinc, this.molecules.copper, () => {
                    setTimeout(() => {
                        this.visualizer.animateElectronTransfer(zincValenceElectrons[1], this.molecules.zinc, this.molecules.copper, () => {
                            // Reset glow effect
                            this.molecules.zinc.nucleus.material.emissiveIntensity = 0.4;
                            this.visualizer.animationInProgress = false;
                        });
                    }, 700);
                });
                break;
                
            case 2: // Final State
                // Add highlight to indicate zinc is now an ion
                new TWEEN.Tween(this.molecules.zinc.nucleus.material)
                    .to({ emissiveIntensity: 0.8 }, 500)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                // Remove the bond between copper and sulfate
                if (this.molecules.bonds && this.molecules.bonds.copperSulfur) {
                    // Remove each bond line from the scene
                    this.molecules.bonds.copperSulfur.forEach(line => {
                        this.visualizer.currentReactionGroup.remove(line);
                        if (line.geometry) line.geometry.dispose();
                        if (line.material) line.material.dispose();
                    });
                    // Clear the reference
                    this.molecules.bonds.copperSulfur = null;
                }
                    
                // Move zinc to replace copper in the sulfate group
                new TWEEN.Tween(this.molecules.zinc.group.position)
                    .to({ x: 6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Create bonds between zinc and sulfate after zinc moves into position
                        this.visualizer.createBond(this.molecules.zinc, this.molecules.sulfate.sulfur);
                        
                        // Create visual indicators for the new ZnSO₄ compound
                        const zincSulfateLabel = document.createElement('div');
                        zincSulfateLabel.className = 'molecule-label';
                        zincSulfateLabel.textContent = 'ZnSO₄';
                        zincSulfateLabel.style.color = '#ffffff';
                        zincSulfateLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        zincSulfateLabel.style.padding = '3px 6px';
                        zincSulfateLabel.style.borderRadius = '4px';
                        zincSulfateLabel.style.fontSize = '16px';
                        zincSulfateLabel.style.fontWeight = 'bold';
                        
                        const zincSulfateLabelObject = new CSS2DObject(zincSulfateLabel);
                        zincSulfateLabelObject.position.set(6, -5, 0);
                        this.visualizer.currentReactionGroup.add(zincSulfateLabelObject);
                        
                        // Remove the CuSO4 label if it exists
                        if(this.molecules.labels && this.molecules.labels.cuSO4) {
                            this.visualizer.currentReactionGroup.remove(this.molecules.labels.cuSO4);
                        }
                    })
                    .start();
                    
                // Move copper completely away from sulfate to show it's fully separated
                new TWEEN.Tween(this.molecules.copper.group.position)
                    .to({ x: 25, y: 2 }, this.visualizer.ANIMATION_DURATION) // Increased separation & y-offset for visual distinction
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Highlight copper to show it's now elemental Cu
                        this.molecules.copper.nucleus.material.emissiveIntensity = 1.0; // Increased glow
                        this.molecules.copper.nucleus.scale.set(1.2, 1.2, 1.2); // Slightly larger
                        
                        // Add a label for elemental copper
                        const copperLabel = document.createElement('div');
                        copperLabel.className = 'molecule-label';
                        copperLabel.textContent = 'Cu';
                        copperLabel.style.color = '#ff9988'; // Brighter color
                        copperLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                        copperLabel.style.padding = '4px 8px';
                        copperLabel.style.borderRadius = '4px';
                        copperLabel.style.fontSize = '18px'; // Larger font
                        copperLabel.style.fontWeight = 'bold';
                        
                        const copperLabelObject = new CSS2DObject(copperLabel);
                        copperLabelObject.position.set(0, -4, 0);
                        this.molecules.copper.group.add(copperLabelObject);
                        
                        // Update reaction info to emphasize complete separation
                        const currentExplanation = document.getElementById('reaction-explanation').textContent;
                        document.getElementById('reaction-explanation').textContent = 
                            currentExplanation + " The copper is completely separated as elemental Cu.";
                        
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
        
        // Find valence electrons in zinc
        const zincValenceElectrons = this.molecules.zinc.electrons.slice(0, 2);
        
        // Highlight zinc during transfer
        this.molecules.zinc.nucleus.material.emissiveIntensity = 0.7;
        
        // Animate electron transfer (one at a time)
        this.visualizer.animateElectronTransfer(zincValenceElectrons[0], this.molecules.zinc, this.molecules.copper, () => {
            setTimeout(() => {
                this.visualizer.animateElectronTransfer(zincValenceElectrons[1], this.molecules.zinc, this.molecules.copper, () => {
                    // Reset highlight
                    this.molecules.zinc.nucleus.material.emissiveIntensity = 0.4;
                    
                    // Phase 2: Final State
                    setTimeout(() => {
                        this.visualizer.updateReactionInfo(2);
                        this.visualizer.currentStep = 2;
                        
                        // Highlight zinc to show it's now an ion
                        new TWEEN.Tween(this.molecules.zinc.nucleus.material)
                            .to({ emissiveIntensity: 0.8 }, 500)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();
                        
                        // Remove the bond between copper and sulfate
                        if (this.molecules.bonds && this.molecules.bonds.copperSulfur) {
                            // Remove each bond line from the scene
                            this.molecules.bonds.copperSulfur.forEach(line => {
                                this.visualizer.currentReactionGroup.remove(line);
                                if (line.geometry) line.geometry.dispose();
                                if (line.material) line.material.dispose();
                            });
                            // Clear the reference
                            this.molecules.bonds.copperSulfur = null;
                        }
                        
                        // Move zinc to replace copper in the sulfate group
                        new TWEEN.Tween(this.molecules.zinc.group.position)
                            .to({ x: 6 }, this.visualizer.ANIMATION_DURATION)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(() => {
                                // Create bonds between zinc and sulfate after zinc moves into position
                                this.visualizer.createBond(this.molecules.zinc, this.molecules.sulfate.sulfur);
                                
                                // Create visual indicators for the new ZnSO₄ compound
                                const zincSulfateLabel = document.createElement('div');
                                zincSulfateLabel.className = 'molecule-label';
                                zincSulfateLabel.textContent = 'ZnSO₄';
                                zincSulfateLabel.style.color = '#ffffff';
                                zincSulfateLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                zincSulfateLabel.style.padding = '3px 6px';
                                zincSulfateLabel.style.borderRadius = '4px';
                                zincSulfateLabel.style.fontSize = '16px';
                                zincSulfateLabel.style.fontWeight = 'bold';
                                
                                const zincSulfateLabelObject = new CSS2DObject(zincSulfateLabel);
                                zincSulfateLabelObject.position.set(6, -5, 0);
                                this.visualizer.currentReactionGroup.add(zincSulfateLabelObject);
                                
                                // Remove the CuSO4 label if it exists
                                if(this.molecules.labels && this.molecules.labels.cuSO4) {
                                    this.visualizer.currentReactionGroup.remove(this.molecules.labels.cuSO4);
                                }
                            })
                            .start();
                        
                        // Move copper completely away from sulfate to show it's fully separated
                        new TWEEN.Tween(this.molecules.copper.group.position)
                            .to({ x: 25, y: 2 }, this.visualizer.ANIMATION_DURATION) // Increased separation & y-offset for visual distinction
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(() => {
                                // Highlight copper to show it's now elemental Cu
                                this.molecules.copper.nucleus.material.emissiveIntensity = 1.0; // Increased glow
                                this.molecules.copper.nucleus.scale.set(1.2, 1.2, 1.2); // Slightly larger
                                
                                // Add a label for elemental copper
                                const copperLabel = document.createElement('div');
                                copperLabel.className = 'molecule-label';
                                copperLabel.textContent = 'Cu';
                                copperLabel.style.color = '#ff9988'; // Brighter color
                                copperLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                                copperLabel.style.padding = '4px 8px';
                                copperLabel.style.borderRadius = '4px';
                                copperLabel.style.fontSize = '18px'; // Larger font
                                copperLabel.style.fontWeight = 'bold';
                                
                                const copperLabelObject = new CSS2DObject(copperLabel);
                                copperLabelObject.position.set(0, -4, 0);
                                this.molecules.copper.group.add(copperLabelObject);
                                
                                // Update reaction info to emphasize complete separation
                                const currentExplanation = document.getElementById('reaction-explanation').textContent;
                                document.getElementById('reaction-explanation').textContent = 
                                    currentExplanation + " The copper is completely separated as elemental Cu.";
                                    
                                this.visualizer.animationInProgress = false;
                                this.visualizer.playButton.disabled = false;
                                this.visualizer.stepButton.disabled = false;
                            })
                            .start();
                    }, 1000);
                });
            }, 700);
        });
    }
}

export default new SingleReplacementReaction();
