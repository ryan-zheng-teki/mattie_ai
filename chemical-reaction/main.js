import visualizer from './core.js';
import singleReplacementReaction from './reactions/single-replacement.js';
import combustionReaction from './reactions/combustion.js';
import acidBaseReaction from './reactions/acid-base.js';
import ionicBondReaction from './reactions/ionic-bond.js';

// Register all reaction modules
visualizer.registerReactionModule('single-replacement', singleReplacementReaction);
visualizer.registerReactionModule('combustion', combustionReaction);
visualizer.registerReactionModule('acid-base', acidBaseReaction);
visualizer.registerReactionModule('ionic-bond', ionicBondReaction);

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Initialize the core visualizer
        visualizer.init();
        
        // Set the default reaction
        visualizer.setActiveReaction('single-replacement');
        
        console.log("Chemical Reaction Visualizer fully initialized with all reaction modules.");
    }, 50);
});
