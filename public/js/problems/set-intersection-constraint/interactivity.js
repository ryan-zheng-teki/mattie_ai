/**
 * Interactivity functions for the Set Intersection Constraint visualization
 * This file adds interactive features to the visualization
 */

// These functions are already included in the main index.js file
// This file serves as documentation for the interactivity features

/*
Interactive Features:

1. Omega Slider
- Controls the value of ω in the visualization
- Range: 0 to 10 with step size 0.1
- Updates the set Sω distribution in real-time

2. Interval Size Slider (n)
- Controls the size of the interval (a, a + ne^(-0.5n))
- Range: 1 to 20 with step size 1
- Affects the right endpoint of the interval

3. Interval Position Slider (a)
- Controls the starting position of the interval
- Range: -10 to 10 with step size 0.5
- Shifts the entire interval along the number line

4. Auto Mode Button
- Cycles through steps automatically when activated
- Pauses between steps to allow observation
- Can be toggled on/off

5. Keyboard Shortcuts
- Numbers 1-5: Jump to specific steps
- 'C' key: Clear and reset visualization
*/
