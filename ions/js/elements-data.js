// Constants for colors and visualization
export const NUCLEUS_RADIUS = 1.5;           
export const ELECTRON_RADIUS = 0.45;        
export const SHELL_RADIUS_BASE = 3.0;        
export const SHELL_RADIUS_INCREMENT = 1.5;   
export const ELECTRON_SPEED_MULTIPLIER = 0.3;
export const POSITIVE_INDICATOR_COLOR = 0xff4444;
export const NEGATIVE_INDICATOR_COLOR = 0x44aaff;

// Color arrays for shells and electrons
export const SHELL_COLORS = [
    0xff5252, // Bright Red (1st shell - K)
    0x4caf50, // Bright Green (2nd shell - L) 
    0x2196f3, // Bright Blue (3rd shell - M)
    0x9c27b0, // Bright Purple (4th shell - N)
    0xffeb3b  // Bright Yellow (5th shell - O)
];

export const ELECTRON_COLORS = [
    0xff7070, // Brighter red (1st shell electrons)
    0x70ff70, // Brighter green (2nd shell electrons)
    0x7070ff, // Brighter blue (3rd shell electrons)
    0xff70ff, // Brighter purple (4th shell electrons)
    0xffff70  // Brighter yellow (5th shell electrons)
];

// Element colors by nucleus
export const NUCLEUS_COLORS = {
    Na: 0xff8833, // Brighter Orange for Sodium
    Cl: 0x33ee66, // Brighter Green for Chlorine
    Mg: 0xffcc33, // Brighter Light Orange for Magnesium
    Ca: 0xffee66, // Brighter Yellow for Calcium
    K:  0xffaa33, // Brighter Dark Orange for Potassium
    F:  0x33ffcc, // Brighter Teal for Fluorine
    Al: 0xeeeeee, // Brighter Silver for Aluminum
    O:  0x33ccff, // Brighter Light Blue for Oxygen
    default: 0xaaaaaa // Brighter Grey default
};

// Child-friendly explanations for elements
export const CHILD_FRIENDLY_DESCRIPTIONS = {
    Na: {
        neutral: "Sodium has 1 lonely electron in its outer shell. It really wants to give it away and be stable!",
        ion: "Sodium gave away 1 electron and now it's happy with a complete shell! It has a +1 charge now.",
        animation: "Sodium gives away its outer electron to become stable!"
    },
    Cl: {
        neutral: "Chlorine needs just 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Chlorine caught 1 more electron and now its outer shell is full and happy! It has a -1 charge now.",
        animation: "Chlorine grabs another electron to fill its outer shell!"
    },
    Mg: {
        neutral: "Magnesium has 2 electrons in its outer shell. It wants to give both away to be like neon!",
        ion: "Magnesium gave away 2 electrons and now it's super stable! It has a +2 charge now.",
        animation: "Magnesium gives away its two outer electrons to become stable!"
    },
    Ca: {
        neutral: "Calcium has 2 electrons in its outer shell. It wants to share them to become stable!",
        ion: "Calcium gave away 2 electrons to have a full outer shell! It has a +2 charge now.",
        animation: "Calcium gives away its two outer electrons to become stable!"
    },
    K: {
        neutral: "Potassium has 1 electron in its outer shell. It really wants to give it away!",
        ion: "Potassium gave away 1 electron and now it's stable and happy! It has a +1 charge now.",
        animation: "Potassium gives away its outer electron to become stable!"
    },
    F: {
        neutral: "Fluorine needs 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Fluorine caught 1 more electron and now its outer shell is full! It has a -1 charge now.",
        animation: "Fluorine grabs another electron to fill its outer shell!"
    },
    Al: {
        neutral: "Aluminum has 3 electrons in its outer shell. It wants to give them all away!",
        ion: "Aluminum gave away 3 electrons and now it's stable like neon! It has a +3 charge now.",
        animation: "Aluminum gives away its three outer electrons to become stable!"
    },
    O: {
        neutral: "Oxygen needs 2 more electrons to fill its outer shell. It really wants to grab them!",
        ion: "Oxygen caught 2 more electrons and now its outer shell is full! It has a -2 charge now.",
        animation: "Oxygen grabs two more electrons to fill its outer shell!"
    }
};

// Quiz questions
export const quizQuestions = [
    {
        question: "What happens when Sodium (Na) loses an electron?",
        options: [
            "It becomes a negative ion (anion)",
            "It becomes a positive ion (cation)",
            "It stays neutral but becomes unstable",
            "It explodes!"
        ],
        correctIndex: 1,
        explanation: "When Sodium loses an electron, it has more protons than electrons, giving it a positive charge. It becomes Na+ (a cation)."
    },
    {
        question: "Why do atoms want to gain or lose electrons?",
        options: [
            "To become electrically charged",
            "To have 8 protons",
            "To have a full outer shell of electrons",
            "To make the nucleus bigger"
        ],
        correctIndex: 2,
        explanation: "Atoms want to have full outer shells (usually 8 electrons for many elements). This makes them stable and happy!"
    },
    {
        question: "What happens when Chlorine (Cl) gains an electron?",
        options: [
            "It becomes a positive ion (cation)",
            "It becomes a negative ion (anion)",
            "Nothing changes",
            "It loses its color"
        ],
        correctIndex: 1,
        explanation: "When Chlorine gains an electron, it has more electrons than protons, giving it a negative charge. It becomes Cl- (an anion)."
    },
    {
        question: "Which of these elements would GAIN electrons to become an ion?",
        options: [
            "Sodium (Na)",
            "Potassium (K)",
            "Oxygen (O)",
            "Magnesium (Mg)"
        ],
        correctIndex: 2,
        explanation: "Oxygen wants to gain 2 electrons to fill its outer shell and become O2-. The other elements listed all lose electrons to form ions."
    },
    {
        question: "Which of these elements would LOSE electrons to become an ion?",
        options: [
            "Chlorine (Cl)",
            "Fluorine (F)",
            "Oxygen (O)",
            "Sodium (Na)"
        ],
        correctIndex: 3,
        explanation: "Sodium wants to lose 1 electron to empty its outer shell and become Na+. The other elements listed all gain electrons to form ions."
    }
];

// Element data with neutral and ion states
export const elements = {
    Na: { 
        name: 'Sodium', 
        symbol: 'Na', 
        neutralState: {
            electronsPerShell: [2, 8, 1],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+1',
            stable: true,
            description: 'Na+ (Sodium Ion): Lost 1 electron from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Cl: { 
        name: 'Chlorine', 
        symbol: 'Cl', 
        neutralState: {
            electronsPerShell: [2, 8, 7],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '-1',
            stable: true,
            description: 'Cl- (Chloride Ion): Gained 1 electron in outer shell to achieve stable octet configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    Mg: { 
        name: 'Magnesium', 
        symbol: 'Mg', 
        neutralState: {
            electronsPerShell: [2, 8, 2],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+2',
            stable: true,
            description: 'Mg2+ (Magnesium Ion): Lost 2 electrons from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Ca: { 
        name: 'Calcium', 
        symbol: 'Ca', 
        neutralState: {
            electronsPerShell: [2, 8, 8, 2],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '+2',
            stable: true,
            description: 'Ca2+ (Calcium Ion): Lost 2 electrons from outer shell to achieve stable noble gas configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    K: { 
        name: 'Potassium', 
        symbol: 'K', 
        neutralState: {
            electronsPerShell: [2, 8, 8, 1],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '+1',
            stable: true,
            description: 'K+ (Potassium Ion): Lost 1 electron from outer shell to achieve stable noble gas configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    F: { 
        name: 'Fluorine', 
        symbol: 'F', 
        neutralState: {
            electronsPerShell: [2, 7],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '-1',
            stable: true,
            description: 'F- (Fluoride Ion): Gained 1 electron in outer shell to achieve stable octet configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Al: { 
        name: 'Aluminum', 
        symbol: 'Al', 
        neutralState: {
            electronsPerShell: [2, 8, 3],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+3',
            stable: true,
            description: 'Al3+ (Aluminum Ion): Lost 3 electrons from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    O: { 
        name: 'Oxygen', 
        symbol: 'O', 
        neutralState: {
            electronsPerShell: [2, 6],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '-2',
            stable: true,
            description: 'O2- (Oxide Ion): Gained 2 electrons in outer shell to achieve stable octet configuration (like Neon).'
        },
        ionizationAnimation: true
    }
};

// Helper function to determine if element requires electron gain
export function elementRequiresElectronGain(elementSymbol) {
    const element = elements[elementSymbol];
    if (!element || !element.ionState || !element.ionState.charge) return false;
    
    // If charge is negative, element gains electrons
    return element.ionState.charge.startsWith('-');
}
