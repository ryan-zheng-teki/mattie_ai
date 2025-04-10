import * as THREE from 'three';
import TWEEN from 'tween';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Combustion reaction: CH₄ + 2O₂ → CO₂ + 2H₂O
class CombustionReaction {
    constructor() {
        this.visualizer = null;
        this.molecules = {};
    }
    
    initialize(visualizer) {
        this.visualizer = visualizer;
    }
    
    getEquation() {
        return 'CH₄ + 2O₂ → CO₂ + 2H₂O';
    }
    
    getPhases() {
        return [
            {
                name: 'Initial State: Reactants',
                explanation: 'Methane (CH₄) contains carbon bonded to four hydrogen atoms. Oxygen (O₂) molecules contain two oxygen atoms bonded together.',
                electronInfo: 'Methane\'s electrons are shared in covalent bonds between carbon and hydrogen.'
            },
            {
                name: 'Breaking Bonds',
                explanation: 'Energy input breaks the C-H bonds in methane and O-O bonds in oxygen, freeing the atoms to rearrange.',
                electronInfo: 'Bond breaking requires energy and releases electrons for rearrangement.'
            },
            {
                name: 'Electron Rearrangement',
                explanation: 'Electrons rearrange as oxygen atoms (which strongly attract electrons) bond with both carbon and hydrogen.',
                electronInfo: 'Oxygen\'s high electronegativity pulls electrons toward it, forming new bonds.'
            },
            {
                name: 'Final State: Products',
                explanation: 'Carbon dioxide (CO₂) forms with carbon double-bonded to two oxygen atoms. Water (H₂O) forms with oxygen bonded to two hydrogen atoms.',
                electronInfo: 'The electrons are now in a lower energy state, which is why combustion releases energy (heat and light).'
            }
        ];
    }
    
    setup() {
        // Create methane (CH₄) with better spacing
        const carbon = this.visualizer.createAtom('C', new THREE.Vector3(-12, 0, 0), 0.8);
        const hydrogen1 = this.visualizer.createAtom('H', new THREE.Vector3(-12, 4, 0), 0.5, false);
        const hydrogen2 = this.visualizer.createAtom('H', new THREE.Vector3(-12, -4, 0), 0.5, false);
        const hydrogen3 = this.visualizer.createAtom('H', new THREE.Vector3(-8, 0, 0), 0.5, false);
        const hydrogen4 = this.visualizer.createAtom('H', new THREE.Vector3(-16, 0, 0), 0.5, false);
        
        // Create bonds in methane
        this.visualizer.createBond(carbon, hydrogen1);
        this.visualizer.createBond(carbon, hydrogen2);
        this.visualizer.createBond(carbon, hydrogen3);
        this.visualizer.createBond(carbon, hydrogen4);
        
        // Create oxygen molecules (O₂)
        const oxygen1a = this.visualizer.createAtom('O', new THREE.Vector3(0, 4, 0), 0.7, false);
        const oxygen1b = this.visualizer.createAtom('O', new THREE.Vector3(0, 8, 0), 0.7, false);
        this.visualizer.createBond(oxygen1a, oxygen1b, 2); // Double bond
        
        const oxygen2a = this.visualizer.createAtom('O', new THREE.Vector3(0, -4, 0), 0.7, false);
        const oxygen2b = this.visualizer.createAtom('O', new THREE.Vector3(0, -8, 0), 0.7, false);
        this.visualizer.createBond(oxygen2a, oxygen2b, 2); // Double bond
        
        // Add labels for clarity
        const methaneLabel = document.createElement('div');
        methaneLabel.className = 'molecule-label';
        methaneLabel.textContent = 'CH₄';
        methaneLabel.style.color = '#ffffff';
        methaneLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const methaneLabelObject = new CSS2DObject(methaneLabel);
        methaneLabelObject.position.set(-12, -6, 0);
        this.visualizer.currentReactionGroup.add(methaneLabelObject);
        
        const o2Label1 = document.createElement('div');
        o2Label1.className = 'molecule-label';
        o2Label1.textContent = 'O₂';
        o2Label1.style.color = '#00ccff';
        o2Label1.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const o2Label1Object = new CSS2DObject(o2Label1);
        o2Label1Object.position.set(0, 10, 0);
        this.visualizer.currentReactionGroup.add(o2Label1Object);
        
        const o2Label2 = document.createElement('div');
        o2Label2.className = 'molecule-label';
        o2Label2.textContent = 'O₂';
        o2Label2.style.color = '#00ccff';
        o2Label2.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const o2Label2Object = new CSS2DObject(o2Label2);
        o2Label2Object.position.set(0, -10, 0);
        this.visualizer.currentReactionGroup.add(o2Label2Object);
        
        // Store for animation reference
        this.molecules = {
            methane: {
                carbon: carbon,
                hydrogens: [hydrogen1, hydrogen2, hydrogen3, hydrogen4]
            },
            oxygen: [
                { atoms: [oxygen1a, oxygen1b], label: o2Label1Object },
                { atoms: [oxygen2a, oxygen2b], label: o2Label2Object }
            ],
            labels: {
                methane: methaneLabelObject
            }
        };
        
        // Set camera position
        this.visualizer.camera.position.set(0, 0, 30);
        this.visualizer.controls.update();
    }
    
    step(phase) {
        this.visualizer.animationInProgress = true;
        
        switch(phase) {
            case 1: // Breaking Bonds
                // Add glow effect to indicate energy input
                this.molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.7;
                
                // Animate breaking of bonds by moving atoms apart
                new TWEEN.Tween(this.molecules.methane.hydrogens[0].group.position)
                    .to({ y: 6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.methane.hydrogens[1].group.position)
                    .to({ y: -6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.methane.hydrogens[2].group.position)
                    .to({ x: -6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.methane.hydrogens[3].group.position)
                    .to({ x: -18 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset glow effect
                        this.molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.4;
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                    
                // Remove initial labels during bond breaking
                if (this.molecules.labels && this.molecules.labels.methane) {
                    this.visualizer.currentReactionGroup.remove(this.molecules.labels.methane);
                }
                
                // Remove O2 labels
                this.molecules.oxygen.forEach(o => {
                    if (o.label) {
                        this.visualizer.currentReactionGroup.remove(o.label);
                    }
                });
                break;
                
            case 2: // Electron Rearrangement
                // Highlight oxygen atoms as they attract electrons
                this.molecules.oxygen.forEach(o => {
                    o.atoms.forEach(atom => {
                        atom.nucleus.material.emissiveIntensity = 0.7;
                    });
                });
                
                // Move oxygen atoms toward carbon and hydrogen
                new TWEEN.Tween(this.molecules.oxygen[0].atoms[0].group.position)
                    .to({ x: -8, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[0].atoms[1].group.position)
                    .to({ x: -16, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[1].atoms[0].group.position)
                    .to({ x: -12, y: 6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[1].atoms[1].group.position)
                    .to({ x: -12, y: -6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset glow effect
                        this.molecules.oxygen.forEach(o => {
                            o.atoms.forEach(atom => {
                                atom.nucleus.material.emissiveIntensity = 0.4;
                            });
                        });
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
                
            case 3: // Final State
                // Rearrange into products (CO₂ and H₂O)
                // Move to CO₂ formation
                new TWEEN.Tween(this.molecules.methane.carbon.group.position)
                    .to({ x: 8, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[0].atoms[0].group.position)
                    .to({ x: 4, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[0].atoms[1].group.position)
                    .to({ x: 12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                // Move to H₂O formation (first water molecule)
                new TWEEN.Tween(this.molecules.methane.hydrogens[0].group.position)
                    .to({ x: -8, y: 6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.methane.hydrogens[1].group.position)
                    .to({ x: -8, y: 2 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[1].atoms[0].group.position)
                    .to({ x: -8, y: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                // Second water molecule
                new TWEEN.Tween(this.molecules.methane.hydrogens[2].group.position)
                    .to({ x: -8, y: -2 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.methane.hydrogens[3].group.position)
                    .to({ x: -8, y: -6 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.oxygen[1].atoms[1].group.position)
                    .to({ x: -8, y: -4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Add product labels
                        const co2Label = document.createElement('div');
                        co2Label.className = 'molecule-label';
                        co2Label.textContent = 'CO₂';
                        co2Label.style.color = '#ffffff';
                        co2Label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        co2Label.style.padding = '3px 6px';
                        co2Label.style.borderRadius = '4px';
                        
                        const co2LabelObject = new CSS2DObject(co2Label);
                        co2LabelObject.position.set(8, -3, 0);
                        this.visualizer.currentReactionGroup.add(co2LabelObject);
                        
                        const h2oLabel1 = document.createElement('div');
                        h2oLabel1.className = 'molecule-label';
                        h2oLabel1.textContent = 'H₂O';
                        h2oLabel1.style.color = '#ffffff';
                        h2oLabel1.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        h2oLabel1.style.padding = '3px 6px';
                        h2oLabel1.style.borderRadius = '4px';
                        
                        const h2oLabel1Object = new CSS2DObject(h2oLabel1);
                        h2oLabel1Object.position.set(-8, 8, 0);
                        this.visualizer.currentReactionGroup.add(h2oLabel1Object);
                        
                        const h2oLabel2 = document.createElement('div');
                        h2oLabel2.className = 'molecule-label';
                        h2oLabel2.textContent = 'H₂O';
                        h2oLabel2.style.color = '#ffffff';
                        h2oLabel2.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        h2oLabel2.style.padding = '3px 6px';
                        h2oLabel2.style.borderRadius = '4px';
                        
                        const h2oLabel2Object = new CSS2DObject(h2oLabel2);
                        h2oLabel2Object.position.set(-8, -8, 0);
                        this.visualizer.currentReactionGroup.add(h2oLabel2Object);
                        
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
        }
    }
    
    animate() {
        this.visualizer.animationInProgress = true;
        
        // Phase 1: Breaking Bonds
        this.visualizer.updateReactionInfo(1);
        this.visualizer.currentStep = 1;
        
        // Add glow effect to indicate energy input
        this.molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.7;
        
        // Remove initial labels
        if (this.molecules.labels && this.molecules.labels.methane) {
            this.visualizer.currentReactionGroup.remove(this.molecules.labels.methane);
        }
        
        // Remove O2 labels
        this.molecules.oxygen.forEach(o => {
            if (o.label) {
                this.visualizer.currentReactionGroup.remove(o.label);
            }
        });
        
        // Animate breaking of bonds by moving atoms apart
        new TWEEN.Tween(this.molecules.methane.hydrogens[0].group.position)
            .to({ y: 6 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.methane.hydrogens[1].group.position)
            .to({ y: -6 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.methane.hydrogens[2].group.position)
            .to({ x: -6 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.methane.hydrogens[3].group.position)
            .to({ x: -18 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
                // Reset glow effect
                this.molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.4;
                
                // Phase 2: Electron Rearrangement
                setTimeout(() => {
                    this.visualizer.updateReactionInfo(2);
                    this.visualizer.currentStep = 2;
                    
                    // Highlight oxygen atoms as they attract electrons
                    this.molecules.oxygen.forEach(o => {
                        o.atoms.forEach(atom => {
                            atom.nucleus.material.emissiveIntensity = 0.7;
                        });
                    });
                    
                    // Move oxygen atoms toward carbon and hydrogen
                    new TWEEN.Tween(this.molecules.oxygen[0].atoms[0].group.position)
                        .to({ x: -8, y: 0 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.oxygen[0].atoms[1].group.position)
                        .to({ x: -16, y: 0 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.oxygen[1].atoms[0].group.position)
                        .to({ x: -12, y: 6 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.oxygen[1].atoms[1].group.position)
                        .to({ x: -12, y: -6 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => {
                            // Reset glow effect
                            this.molecules.oxygen.forEach(o => {
                                o.atoms.forEach(atom => {
                                    atom.nucleus.material.emissiveIntensity = 0.4;
                                });
                            });
                            
                            // Phase 3: Final State
                            setTimeout(() => {
                                this.visualizer.updateReactionInfo(3);
                                this.visualizer.currentStep = 3;
                                
                                // Rearrange into products (CO₂ and H₂O)
                                // Move to CO₂ formation
                                new TWEEN.Tween(this.molecules.methane.carbon.group.position)
                                    .to({ x: 8, y: 0 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.oxygen[0].atoms[0].group.position)
                                    .to({ x: 4, y: 0 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.oxygen[0].atoms[1].group.position)
                                    .to({ x: 12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                // Move to H₂O formation (first water molecule)
                                new TWEEN.Tween(this.molecules.methane.hydrogens[0].group.position)
                                    .to({ x: -8, y: 6 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.methane.hydrogens[1].group.position)
                                    .to({ x: -8, y: 2 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.oxygen[1].atoms[0].group.position)
                                    .to({ x: -8, y: 4 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                // Second water molecule
                                new TWEEN.Tween(this.molecules.methane.hydrogens[2].group.position)
                                    .to({ x: -8, y: -2 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.methane.hydrogens[3].group.position)
                                    .to({ x: -8, y: -6 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .start();
                                    
                                new TWEEN.Tween(this.molecules.oxygen[1].atoms[1].group.position)
                                    .to({ x: -8, y: -4 }, this.visualizer.ANIMATION_DURATION)
                                    .easing(TWEEN.Easing.Quadratic.InOut)
                                    .onComplete(() => {
                                        // Add product labels
                                        const co2Label = document.createElement('div');
                                        co2Label.className = 'molecule-label';
                                        co2Label.textContent = 'CO₂';
                                        co2Label.style.color = '#ffffff';
                                        co2Label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                        co2Label.style.padding = '3px 6px';
                                        co2Label.style.borderRadius = '4px';
                                        
                                        const co2LabelObject = new CSS2DObject(co2Label);
                                        co2LabelObject.position.set(8, -3, 0);
                                        this.visualizer.currentReactionGroup.add(co2LabelObject);
                                        
                                        const h2oLabel1 = document.createElement('div');
                                        h2oLabel1.className = 'molecule-label';
                                        h2oLabel1.textContent = 'H₂O';
                                        h2oLabel1.style.color = '#ffffff';
                                        h2oLabel1.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                        h2oLabel1.style.padding = '3px 6px';
                                        h2oLabel1.style.borderRadius = '4px';
                                        
                                        const h2oLabel1Object = new CSS2DObject(h2oLabel1);
                                        h2oLabel1Object.position.set(-8, 8, 0);
                                        this.visualizer.currentReactionGroup.add(h2oLabel1Object);
                                        
                                        const h2oLabel2 = document.createElement('div');
                                        h2oLabel2.className = 'molecule-label';
                                        h2oLabel2.textContent = 'H₂O';
                                        h2oLabel2.style.color = '#ffffff';
                                        h2oLabel2.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                        h2oLabel2.style.padding = '3px 6px';
                                        h2oLabel2.style.borderRadius = '4px';
                                        
                                        const h2oLabel2Object = new CSS2DObject(h2oLabel2);
                                        h2oLabel2Object.position.set(-8, -8, 0);
                                        this.visualizer.currentReactionGroup.add(h2oLabel2Object);
                                        
                                        this.visualizer.animationInProgress = false;
                                        this.visualizer.playButton.disabled = false;
                                        this.visualizer.stepButton.disabled = false;
                                    })
                                    .start();
                            }, 1000);
                        })
                        .start();
                }, 1000);
            })
            .start();
    }
}

export default new CombustionReaction();
