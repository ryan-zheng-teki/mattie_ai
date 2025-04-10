import * as THREE from 'three';
import TWEEN from 'tween';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// Acid-Base Reaction: HCl + NaOH → NaCl + H₂O
class AcidBaseReaction {
    constructor() {
        this.visualizer = null;
        this.molecules = {};
    }
    
    initialize(visualizer) {
        this.visualizer = visualizer;
    }
    
    getEquation() {
        return 'HCl + NaOH → NaCl + H₂O';
    }
    
    getPhases() {
        return [
            {
                name: 'Initial State: Reactants',
                explanation: 'Hydrochloric acid (HCl) is a strong acid that dissociates into H⁺ and Cl⁻ ions in water. Sodium hydroxide (NaOH) is a strong base that dissociates into Na⁺ and OH⁻ ions.',
                electronInfo: 'In these compounds, electrons are already unevenly distributed, creating charged ions.'
            },
            {
                name: 'Ion Recombination',
                explanation: 'The positively charged H⁺ ion from the acid combines with the negatively charged OH⁻ ion from the base to form water. The Na⁺ and Cl⁻ ions combine to form sodium chloride (table salt).',
                electronInfo: 'This reaction is primarily about rearranging ions rather than transferring electrons.'
            },
            {
                name: 'Final State: Products',
                explanation: 'The products are water (H₂O) and sodium chloride (NaCl). The acid and base have neutralized each other, resulting in a neutral salt solution.',
                electronInfo: 'The reaction creates a more stable arrangement of electrons and ions.'
            }
        ];
    }
    
    setup() {
        // Create HCl (hydrochloric acid) with better spacing
        const hydrogen = this.visualizer.createAtom('H', new THREE.Vector3(-12, 4, 0), 0.6, false);
        const chlorine = this.visualizer.createAtom('Cl', new THREE.Vector3(-12, -2, 0), 0.8, false);
        const hclBond = this.visualizer.createBond(hydrogen, chlorine);
        
        // Create NaOH (sodium hydroxide)
        const sodium = this.visualizer.createAtom('Na', new THREE.Vector3(9, 4, 0), 0.7, false);
        const oxygen = this.visualizer.createAtom('O', new THREE.Vector3(9, -2, 0), 0.7, false);
        const hydroxideH = this.visualizer.createAtom('H', new THREE.Vector3(9, -6, 0), 0.5, false);
        this.visualizer.createBond(oxygen, hydroxideH);
        this.visualizer.createBond(sodium, oxygen);
        
        // Add labels for clarity
        const hclLabel = document.createElement('div');
        hclLabel.className = 'molecule-label';
        hclLabel.textContent = 'HCl';
        hclLabel.style.color = '#ffffff';
        hclLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const hclLabelObject = new CSS2DObject(hclLabel);
        hclLabelObject.position.set(-12, -8, 0);
        this.visualizer.currentReactionGroup.add(hclLabelObject);
        
        const naohLabel = document.createElement('div');
        naohLabel.className = 'molecule-label';
        naohLabel.textContent = 'NaOH';
        naohLabel.style.color = '#ffffff';
        naohLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        
        const naohLabelObject = new CSS2DObject(naohLabel);
        naohLabelObject.position.set(9, -10, 0);
        this.visualizer.currentReactionGroup.add(naohLabelObject);
        
        // Store for animation reference
        this.molecules = {
            acid: {
                hydrogen: hydrogen,
                chlorine: chlorine,
                bond: hclBond
            },
            base: {
                sodium: sodium,
                oxygen: oxygen,
                hydrogen: hydroxideH
            },
            labels: {
                hcl: hclLabelObject,
                naoh: naohLabelObject
            }
        };
        
        // Set camera position
        this.visualizer.camera.position.set(0, 0, 25);
        this.visualizer.controls.update();
    }
    
    step(phase) {
        this.visualizer.animationInProgress = true;
        
        switch(phase) {
            case 1: // Ion Recombination
                // Highlight ions
                this.molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.7;
                this.molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.7;
                
                // Remove initial labels during recombination
                if (this.molecules.labels) {
                    if (this.molecules.labels.hcl) {
                        this.visualizer.currentReactionGroup.remove(this.molecules.labels.hcl);
                    }
                    if (this.molecules.labels.naoh) {
                        this.visualizer.currentReactionGroup.remove(this.molecules.labels.naoh);
                    }
                }
                
                // Animate ion movement and recombination
                new TWEEN.Tween(this.molecules.acid.hydrogen.group.position)
                    .to({ x: 0, y: -2 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.acid.chlorine.group.position)
                    .to({ x: 0, y: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.sodium.group.position)
                    .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.oxygen.group.position)
                    .to({ x: 0, y: -4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.hydrogen.group.position)
                    .to({ x: 0, y: -8 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset highlight
                        this.molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                        this.molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
                
            case 2: // Final State
                // Rearrange atoms to show final products
                new TWEEN.Tween(this.molecules.acid.hydrogen.group.position)
                    .to({ x: 12, y: -4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.oxygen.group.position)
                    .to({ x: 12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.hydrogen.group.position)
                    .to({ x: 12, y: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.acid.chlorine.group.position)
                    .to({ x: -12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(this.molecules.base.sodium.group.position)
                    .to({ x: -12, y: 4 }, this.visualizer.ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Add product labels
                        const naClLabel = document.createElement('div');
                        naClLabel.className = 'molecule-label';
                        naClLabel.textContent = 'NaCl';
                        naClLabel.style.color = '#ffffff';
                        naClLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        naClLabel.style.padding = '3px 6px';
                        naClLabel.style.borderRadius = '4px';
                        
                        const naClLabelObject = new CSS2DObject(naClLabel);
                        naClLabelObject.position.set(-12, -3, 0);
                        this.visualizer.currentReactionGroup.add(naClLabelObject);
                        
                        const h2oLabel = document.createElement('div');
                        h2oLabel.className = 'molecule-label';
                        h2oLabel.textContent = 'H₂O';
                        h2oLabel.style.color = '#ffffff';
                        h2oLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        h2oLabel.style.padding = '3px 6px';
                        h2oLabel.style.borderRadius = '4px';
                        
                        const h2oLabelObject = new CSS2DObject(h2oLabel);
                        h2oLabelObject.position.set(12, -3, 0);
                        this.visualizer.currentReactionGroup.add(h2oLabelObject);
                        
                        this.visualizer.animationInProgress = false;
                    })
                    .start();
                break;
        }
    }
    
    animate() {
        this.visualizer.animationInProgress = true;
        
        // Phase 1: Ion Recombination
        this.visualizer.updateReactionInfo(1);
        this.visualizer.currentStep = 1;
        
        // Highlight ions
        this.molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.7;
        this.molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.7;
        
        // Remove initial labels during recombination
        if (this.molecules.labels) {
            if (this.molecules.labels.hcl) {
                this.visualizer.currentReactionGroup.remove(this.molecules.labels.hcl);
            }
            if (this.molecules.labels.naoh) {
                this.visualizer.currentReactionGroup.remove(this.molecules.labels.naoh);
            }
        }
        
        // Animate ion movement and recombination
        new TWEEN.Tween(this.molecules.acid.hydrogen.group.position)
            .to({ x: 0, y: -2 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.acid.chlorine.group.position)
            .to({ x: 0, y: 4 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.base.sodium.group.position)
            .to({ x: 0, y: 0 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.base.oxygen.group.position)
            .to({ x: 0, y: -4 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
            
        new TWEEN.Tween(this.molecules.base.hydrogen.group.position)
            .to({ x: 0, y: -8 }, this.visualizer.ANIMATION_DURATION)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
                // Reset highlight
                this.molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                this.molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                
                // Phase 2: Final State
                setTimeout(() => {
                    this.visualizer.updateReactionInfo(2);
                    this.visualizer.currentStep = 2;
                    
                    // Rearrange atoms to show final products
                    new TWEEN.Tween(this.molecules.acid.hydrogen.group.position)
                        .to({ x: 12, y: -4 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.base.oxygen.group.position)
                        .to({ x: 12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.base.hydrogen.group.position)
                        .to({ x: 12, y: 4 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.acid.chlorine.group.position)
                        .to({ x: -12, y: 0 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                        
                    new TWEEN.Tween(this.molecules.base.sodium.group.position)
                        .to({ x: -12, y: 4 }, this.visualizer.ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => {
                            // Add product labels
                            const naClLabel = document.createElement('div');
                            naClLabel.className = 'molecule-label';
                            naClLabel.textContent = 'NaCl';
                            naClLabel.style.color = '#ffffff';
                            naClLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            naClLabel.style.padding = '3px 6px';
                            naClLabel.style.borderRadius = '4px';
                            
                            const naClLabelObject = new CSS2DObject(naClLabel);
                            naClLabelObject.position.set(-12, -3, 0);
                            this.visualizer.currentReactionGroup.add(naClLabelObject);
                            
                            const h2oLabel = document.createElement('div');
                            h2oLabel.className = 'molecule-label';
                            h2oLabel.textContent = 'H₂O';
                            h2oLabel.style.color = '#ffffff';
                            h2oLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            h2oLabel.style.padding = '3px 6px';
                            h2oLabel.style.borderRadius = '4px';
                            
                            const h2oLabelObject = new CSS2DObject(h2oLabel);
                            h2oLabelObject.position.set(12, -3, 0);
                            this.visualizer.currentReactionGroup.add(h2oLabelObject);
                            
                            this.visualizer.animationInProgress = false;
                            this.visualizer.playButton.disabled = false;
                            this.visualizer.stepButton.disabled = false;
                        })
                        .start();
                }, 1000);
            })
            .start();
    }
}

export default new AcidBaseReaction();
