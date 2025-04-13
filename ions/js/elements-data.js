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
    H:  0xffffff, // White for Hydrogen
    He: 0xffeecc, // Light yellow for Helium
    Li: 0xffcccc, // Light red for Lithium
    Be: 0xffbebe, // Pale red for Beryllium
    B:  0x99ff99, // Light green for Boron
    C:  0x777777, // Dark gray for Carbon
    N:  0x99ccff, // Light blue for Nitrogen
    O:  0x33ccff, // Brighter Light Blue for Oxygen
    F:  0x33ffcc, // Brighter Teal for Fluorine
    Ne: 0xff7777, // Salmon for Neon
    Na: 0xff8833, // Brighter Orange for Sodium
    Mg: 0xffcc33, // Brighter Light Orange for Magnesium
    Al: 0xeeeeee, // Brighter Silver for Aluminum
    Si: 0x996633, // Brown for Silicon
    P:  0xffaa77, // Peach for Phosphorus
    S:  0xffff00, // Yellow for Sulfur
    Cl: 0x33ee66, // Brighter Green for Chlorine
    Ar: 0x77aaff, // Light blue/purple for Argon
    K:  0xffaa33, // Brighter Dark Orange for Potassium
    Ca: 0xffee66, // Brighter Yellow for Calcium
    default: 0xaaaaaa // Brighter Grey default
};

// Child-friendly explanations for elements
export const CHILD_FRIENDLY_DESCRIPTIONS = {
    H: {
        neutral: "Hydrogen has 1 electron in its only shell. It can give it away or share it to be stable!",
        ion: "Hydrogen gave away its only electron and now has a +1 charge! It's now a bare proton (H+).",
        animation: "Hydrogen gives away its electron to become a positive ion!"
    },
    He: {
        neutral: "Helium has 2 electrons in its only shell, which makes it completely full and stable!",
        ion: "Helium rarely forms ions because its outer shell is already full and stable!",
        animation: "Helium doesn't normally form ions because it's already stable!"
    },
    Li: {
        neutral: "Lithium has 1 lonely electron in its outer shell. It really wants to give it away!",
        ion: "Lithium gave away 1 electron and now it's happy with a complete inner shell! It has a +1 charge now.",
        animation: "Lithium gives away its outer electron to become stable!"
    },
    Be: {
        neutral: "Beryllium has 2 electrons in its outer shell. It can give both away to become stable!",
        ion: "Beryllium gave away 2 electrons and now it's stable! It has a +2 charge now.",
        animation: "Beryllium gives away its two outer electrons to become stable!"
    },
    B: {
        neutral: "Boron has 3 electrons in its outer shell. It needs 5 more electrons or can give away 3!",
        ion: "Boron can form ions by losing 3 electrons to get a +3 charge!",
        animation: "Boron gives away its three outer electrons to become stable!"
    },
    C: {
        neutral: "Carbon has 4 electrons in its outer shell. It likes to share them to become stable!",
        ion: "Carbon usually doesn't form ions easily. It prefers to share electrons instead!",
        animation: "Carbon usually shares electrons rather than forming ions!"
    },
    N: {
        neutral: "Nitrogen has 5 electrons in its outer shell. It needs 3 more to be full and stable!",
        ion: "Nitrogen can gain 3 electrons to fill its outer shell and get a -3 charge!",
        animation: "Nitrogen grabs three more electrons to fill its outer shell!"
    },
    O: {
        neutral: "Oxygen needs 2 more electrons to fill its outer shell. It really wants to grab them!",
        ion: "Oxygen caught 2 more electrons and now its outer shell is full! It has a -2 charge now.",
        animation: "Oxygen grabs two more electrons to fill its outer shell!"
    },
    F: {
        neutral: "Fluorine needs just 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Fluorine caught 1 more electron and now its outer shell is full! It has a -1 charge now.",
        animation: "Fluorine grabs another electron to fill its outer shell!"
    },
    Ne: {
        neutral: "Neon has a completely full outer shell with 8 electrons! It's already stable and happy!",
        ion: "Neon doesn't form ions because its outer shell is already full and stable!",
        animation: "Neon doesn't form ions because it's already stable with a full shell!"
    },
    Na: {
        neutral: "Sodium has 1 lonely electron in its outer shell. It really wants to give it away and be stable!",
        ion: "Sodium gave away 1 electron and now it's happy with a complete shell! It has a +1 charge now.",
        animation: "Sodium gives away its outer electron to become stable!"
    },
    Mg: {
        neutral: "Magnesium has 2 electrons in its outer shell. It wants to give both away to be like neon!",
        ion: "Magnesium gave away 2 electrons and now it's super stable! It has a +2 charge now.",
        animation: "Magnesium gives away its two outer electrons to become stable!"
    },
    Al: {
        neutral: "Aluminum has 3 electrons in its outer shell. It wants to give them all away!",
        ion: "Aluminum gave away 3 electrons and now it's stable like neon! It has a +3 charge now.",
        animation: "Aluminum gives away its three outer electrons to become stable!"
    },
    Si: {
        neutral: "Silicon has 4 electrons in its outer shell. It usually shares them rather than forming ions!",
        ion: "Silicon can lose 4 electrons to form a +4 ion, but it usually prefers to share electrons instead!",
        animation: "Silicon can sometimes give away electrons to form a positive ion!"
    },
    P: {
        neutral: "Phosphorus has 5 electrons in its outer shell. It can gain 3 more to be stable!",
        ion: "Phosphorus can gain 3 electrons to fill its outer shell and get a -3 charge!",
        animation: "Phosphorus grabs three more electrons to fill its outer shell!"
    },
    S: {
        neutral: "Sulfur has 6 electrons in its outer shell. It wants to gain 2 more to be full!",
        ion: "Sulfur gained 2 electrons and now its outer shell is full and stable! It has a -2 charge now.",
        animation: "Sulfur grabs two more electrons to fill its outer shell!"
    },
    Cl: {
        neutral: "Chlorine needs just 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Chlorine caught 1 more electron and now its outer shell is full and happy! It has a -1 charge now.",
        animation: "Chlorine grabs another electron to fill its outer shell!"
    },
    Ar: {
        neutral: "Argon has a completely full outer shell with 8 electrons! It's already stable and happy!",
        ion: "Argon doesn't form ions because its outer shell is already full and stable!",
        animation: "Argon doesn't form ions because it's already stable with a full shell!"
    },
    K: {
        neutral: "Potassium has 1 electron in its outer shell. It really wants to give it away!",
        ion: "Potassium gave away 1 electron and now it's stable and happy! It has a +1 charge now.",
        animation: "Potassium gives away its outer electron to become stable!"
    },
    Ca: {
        neutral: "Calcium has 2 electrons in its outer shell. It wants to share them to become stable!",
        ion: "Calcium gave away 2 electrons to have a full outer shell! It has a +2 charge now.",
        animation: "Calcium gives away its two outer electrons to become stable!"
    }
};

// Quiz questions - Updated to focus on ion formation
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
    },
    {
        question: "What is a cation?",
        options: [
            "An ion with a negative charge",
            "An ion with a positive charge",
            "A neutral atom",
            "A molecule with no charge"
        ],
        correctIndex: 1,
        explanation: "A cation is an ion with a positive charge. It forms when an atom loses one or more electrons."
    },
    {
        question: "What is an anion?",
        options: [
            "An ion with a negative charge",
            "An ion with a positive charge",
            "A neutral atom",
            "A molecule with no charge"
        ],
        correctIndex: 0,
        explanation: "An anion is an ion with a negative charge. It forms when an atom gains one or more electrons."
    }
];

// Element data with neutral and ion states - First 20 elements (H through Ca)
export const elements = {
    H: { 
        name: 'Hydrogen', 
        symbol: 'H', 
        neutralState: {
            electronsPerShell: [1],
            stable: false
        },
        ionState: {
            electronsPerShell: [0],
            charge: '+1',
            stable: true,
            description: 'H+ (Hydrogen Ion): Lost its only electron to become a bare proton.'
        },
        ionizationAnimation: true
    },
    He: { 
        name: 'Helium', 
        symbol: 'He', 
        neutralState: {
            electronsPerShell: [2],
            stable: true
        },
        ionState: {
            electronsPerShell: [2],
            charge: '0',
            stable: true,
            description: 'Helium rarely forms ions as it already has a full first shell.'
        },
        ionizationAnimation: false
    },
    Li: { 
        name: 'Lithium', 
        symbol: 'Li', 
        neutralState: {
            electronsPerShell: [2, 1],
            stable: false
        },
        ionState: {
            electronsPerShell: [2],
            charge: '+1',
            stable: true,
            description: 'Li+ (Lithium Ion): Lost 1 electron from outer shell to achieve stable noble gas configuration (like Helium).'
        },
        ionizationAnimation: true
    },
    Be: { 
        name: 'Beryllium', 
        symbol: 'Be', 
        neutralState: {
            electronsPerShell: [2, 2],
            stable: false
        },
        ionState: {
            electronsPerShell: [2],
            charge: '+2',
            stable: true,
            description: 'Be2+ (Beryllium Ion): Lost 2 electrons from outer shell to achieve stable noble gas configuration (like Helium).'
        },
        ionizationAnimation: true
    },
    B: { 
        name: 'Boron', 
        symbol: 'B', 
        neutralState: {
            electronsPerShell: [2, 3],
            stable: false
        },
        ionState: {
            electronsPerShell: [2],
            charge: '+3',
            stable: true,
            description: 'B3+ (Boron Ion): Lost 3 electrons from outer shell to achieve stable noble gas configuration (like Helium).'
        },
        ionizationAnimation: true
    },
    C: { 
        name: 'Carbon', 
        symbol: 'C', 
        neutralState: {
            electronsPerShell: [2, 4],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 4],
            charge: '0',
            stable: false,
            description: 'Carbon typically forms covalent bonds rather than ions.'
        },
        ionizationAnimation: false
    },
    N: { 
        name: 'Nitrogen', 
        symbol: 'N', 
        neutralState: {
            electronsPerShell: [2, 5],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '-3',
            stable: true,
            description: 'N3- (Nitride Ion): Gained 3 electrons to achieve a full octet in its outer shell.'
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
    Ne: { 
        name: 'Neon', 
        symbol: 'Ne', 
        neutralState: {
            electronsPerShell: [2, 8],
            stable: true
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '0',
            stable: true,
            description: 'Neon rarely forms ions as it already has a full octet in its outer shell.'
        },
        ionizationAnimation: false
    },
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
    Si: { 
        name: 'Silicon', 
        symbol: 'Si', 
        neutralState: {
            electronsPerShell: [2, 8, 4],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+4',
            stable: true,
            description: 'Si4+ (Silicon Ion): Can lose 4 electrons, though it typically forms covalent bonds.'
        },
        ionizationAnimation: true
    },
    P: { 
        name: 'Phosphorus', 
        symbol: 'P', 
        neutralState: {
            electronsPerShell: [2, 8, 5],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '-3',
            stable: true,
            description: 'P3- (Phosphide Ion): Gained 3 electrons to achieve a full octet in its outer shell.'
        },
        ionizationAnimation: true
    },
    S: { 
        name: 'Sulfur', 
        symbol: 'S', 
        neutralState: {
            electronsPerShell: [2, 8, 6],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '-2',
            stable: true,
            description: 'S2- (Sulfide Ion): Gained 2 electrons to achieve a full octet in its outer shell.'
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
    Ar: { 
        name: 'Argon', 
        symbol: 'Ar', 
        neutralState: {
            electronsPerShell: [2, 8, 8],
            stable: true
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '0',
            stable: true,
            description: 'Argon rarely forms ions as it already has a full octet in its outer shell.'
        },
        ionizationAnimation: false
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
    }
};

// Helper function to determine if element requires electron gain
export function elementRequiresElectronGain(elementSymbol) {
    const element = elements[elementSymbol];
    if (!element || !element.ionState || !element.ionState.charge) return false;
    
    // If charge is negative, element gains electrons
    return element.ionState.charge.startsWith('-');
}
