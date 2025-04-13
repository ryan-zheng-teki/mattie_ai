import { defineStore } from 'pinia'

export const useAtomsStore = defineStore('atoms', {
  state: () => ({
    // Constants for colors and visualization
    NUCLEUS_RADIUS: 1.5,
    ELECTRON_RADIUS: 0.45,
    SHELL_RADIUS_BASE: 3.0,
    SHELL_RADIUS_INCREMENT: 1.5,
    ELECTRON_SPEED_MULTIPLIER: 0.3,

    // Color arrays for shells and electrons
    SHELL_COLORS: [
      0xff5252, // Bright Red (1st shell - K)
      0x4caf50, // Bright Green (2nd shell - L) 
      0x2196f3, // Bright Blue (3rd shell - M)
      0x9c27b0, // Bright Purple (4th shell - N)
      0xffeb3b  // Bright Yellow (5th shell - O)
    ],

    ELECTRON_COLORS: [
      0xff7070, // Brighter red (1st shell electrons)
      0x70ff70, // Brighter green (2nd shell electrons)
      0x7070ff, // Brighter blue (3rd shell electrons)
      0xff70ff, // Brighter purple (4th shell electrons)
      0xffff70  // Brighter yellow (5th shell electrons)
    ],

    // Element colors by nucleus - all set to same grey color for consistency
    NUCLEUS_COLORS: {
      H: 0x808080, He: 0x808080, Li: 0x808080, Be: 0x808080, B: 0x808080,
      C: 0x808080, N: 0x808080, O: 0x808080, F: 0x808080, Ne: 0x808080,
      Na: 0x808080, Mg: 0x808080, Al: 0x808080, Si: 0x808080, P: 0x808080,
      S: 0x808080, Cl: 0x808080, Ar: 0x808080, K: 0x808080, Ca: 0x808080,
      default: 0x808080
    },

    // Child-friendly explanations for elements
    ELEMENT_DESCRIPTIONS: {
      H: "Hydrogen is the lightest and most common element in the universe! It has just 1 proton and 1 electron.",
      He: "Helium is a gas that makes balloons float! It has 2 electrons in its first shell, making it very stable.",
      Li: "Lithium is used in batteries! It has 3 electrons - 2 in the first shell and 1 in the second.",
      Be: "Beryllium is a light metal used in spacecraft! It has 4 electrons - 2 in its first shell and 2 in the second.",
      B: "Boron is used in cleaning products! It has 5 electrons - 2 in the first shell and 3 in the second.",
      C: "Carbon is the building block of life! It has 6 electrons - 2 in the first shell and 4 in the second.",
      N: "Nitrogen makes up most of the air we breathe! It has 7 electrons - 2 in the first shell and 5 in the second.",
      O: "Oxygen is what we breathe! It has 8 electrons - 2 in the first shell and 6 in the second.",
      F: "Fluorine helps keep our teeth healthy! It has 9 electrons - 2 in the first shell and 7 in the second.",
      Ne: "Neon gives bright glowing colors in signs! It has 10 electrons - 2 in the first shell and 8 in the second.",
      Na: "Sodium is found in salt! It has 11 electrons - 2 in the first shell, 8 in the second, and 1 in the third.",
      Mg: "Magnesium is in healthy foods like nuts! It has 12 electrons - 2 in the first shell, 8 in the second, and 2 in the third.",
      Al: "Aluminum is used to make cans and foil! It has 13 electrons - 2 in the first shell, 8 in the second, and 3 in the third.",
      Si: "Silicon is used to make computer chips! It has 14 electrons - 2 in the first shell, 8 in the second, and 4 in the third.",
      P: "Phosphorus helps our bones stay strong! It has 15 electrons - 2 in the first shell, 8 in the second, and 5 in the third.",
      S: "Sulfur makes rotten eggs smell bad! It has 16 electrons - 2 in the first shell, 8 in the second, and 6 in the third.",
      Cl: "Chlorine helps keep swimming pools clean! It has 17 electrons - 2 in the first shell, 8 in the second, and 7 in the third.",
      Ar: "Argon is a gas used in light bulbs! It has 18 electrons - 2 in the first shell, 8 in the second, and 8 in the third.",
      K: "Potassium is found in bananas! It has 19 electrons - 2 in the first shell, 8 in the second, 8 in the third, and 1 in the fourth.",
      Ca: "Calcium makes your bones strong! It has 20 electrons - 2 in the first shell, 8 in the second, 8 in the third, and 2 in the fourth."
    },

    // Quiz questions about atoms
    quizQuestions: [
      {
        question: "Which part of an atom contains protons and neutrons?",
        options: [
          "Electron shells",
          "Nucleus",
          "Valence band",
          "Photosphere"
        ],
        correctIndex: 1,
        explanation: "The nucleus is the center of an atom and contains protons and neutrons. Electrons orbit around the nucleus in shells."
      },
      {
        question: "What is the maximum number of electrons in the first shell?",
        options: [
          "2",
          "6",
          "8",
          "18"
        ],
        correctIndex: 0,
        explanation: "The first electron shell (K shell) can hold a maximum of 2 electrons."
      },
      {
        question: "Which element has exactly 8 electrons in its outermost shell?",
        options: [
          "Sodium (Na)",
          "Oxygen (O)",
          "Neon (Ne)",
          "Carbon (C)"
        ],
        correctIndex: 2,
        explanation: "Neon (Ne) has a complete outer shell with 8 electrons, making it very stable. Its electron configuration is 2,8."
      },
      {
        question: "What determines the chemical properties of an element?",
        options: [
          "Number of neutrons",
          "Mass of the nucleus",
          "Number of electrons in the outermost shell",
          "Total number of electrons"
        ],
        correctIndex: 2,
        explanation: "The number of electrons in the outermost shell (valence electrons) primarily determines how an element will react chemically."
      },
      {
        question: "Which particle has a negative charge?",
        options: [
          "Proton",
          "Neutron",
          "Electron",
          "Nucleus"
        ],
        correctIndex: 2,
        explanation: "Electrons have a negative charge. Protons have a positive charge, and neutrons have no charge (they are neutral)."
      }
    ],

    // Element data with atomic structure information
    elements: {
      H: { 
        name: 'Hydrogen', 
        symbol: 'H',
        atomicNumber: 1,
        electronConfiguration: '1s¹',
        electronsPerShell: [1]
      },
      He: { 
        name: 'Helium', 
        symbol: 'He',
        atomicNumber: 2,
        electronConfiguration: '1s²',
        electronsPerShell: [2]
      },
      Li: { 
        name: 'Lithium', 
        symbol: 'Li',
        atomicNumber: 3,
        electronConfiguration: '1s² 2s¹',
        electronsPerShell: [2, 1]
      },
      Be: { 
        name: 'Beryllium', 
        symbol: 'Be',
        atomicNumber: 4,
        electronConfiguration: '1s² 2s²',
        electronsPerShell: [2, 2]
      },
      B: { 
        name: 'Boron', 
        symbol: 'B',
        atomicNumber: 5,
        electronConfiguration: '1s² 2s² 2p¹',
        electronsPerShell: [2, 3]
      },
      C: { 
        name: 'Carbon', 
        symbol: 'C',
        atomicNumber: 6,
        electronConfiguration: '1s² 2s² 2p²',
        electronsPerShell: [2, 4]
      },
      N: { 
        name: 'Nitrogen', 
        symbol: 'N',
        atomicNumber: 7,
        electronConfiguration: '1s² 2s² 2p³',
        electronsPerShell: [2, 5]
      },
      O: { 
        name: 'Oxygen', 
        symbol: 'O',
        atomicNumber: 8,
        electronConfiguration: '1s² 2s² 2p⁴',
        electronsPerShell: [2, 6]
      },
      F: { 
        name: 'Fluorine', 
        symbol: 'F',
        atomicNumber: 9,
        electronConfiguration: '1s² 2s² 2p⁵',
        electronsPerShell: [2, 7]
      },
      Ne: { 
        name: 'Neon', 
        symbol: 'Ne',
        atomicNumber: 10,
        electronConfiguration: '1s² 2s² 2p⁶',
        electronsPerShell: [2, 8]
      },
      Na: { 
        name: 'Sodium', 
        symbol: 'Na',
        atomicNumber: 11,
        electronConfiguration: '1s² 2s² 2p⁶ 3s¹',
        electronsPerShell: [2, 8, 1]
      },
      Mg: { 
        name: 'Magnesium', 
        symbol: 'Mg',
        atomicNumber: 12,
        electronConfiguration: '1s² 2s² 2p⁶ 3s²',
        electronsPerShell: [2, 8, 2]
      },
      Al: { 
        name: 'Aluminum', 
        symbol: 'Al',
        atomicNumber: 13,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p¹',
        electronsPerShell: [2, 8, 3]
      },
      Si: { 
        name: 'Silicon', 
        symbol: 'Si',
        atomicNumber: 14,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p²',
        electronsPerShell: [2, 8, 4]
      },
      P: { 
        name: 'Phosphorus', 
        symbol: 'P',
        atomicNumber: 15,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p³',
        electronsPerShell: [2, 8, 5]
      },
      S: { 
        name: 'Sulfur', 
        symbol: 'S',
        atomicNumber: 16,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁴',
        electronsPerShell: [2, 8, 6]
      },
      Cl: { 
        name: 'Chlorine', 
        symbol: 'Cl',
        atomicNumber: 17,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁵',
        electronsPerShell: [2, 8, 7]
      },
      Ar: { 
        name: 'Argon', 
        symbol: 'Ar',
        atomicNumber: 18,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶',
        electronsPerShell: [2, 8, 8]
      },
      K: { 
        name: 'Potassium', 
        symbol: 'K',
        atomicNumber: 19,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹',
        electronsPerShell: [2, 8, 8, 1]
      },
      Ca: { 
        name: 'Calcium', 
        symbol: 'Ca',
        atomicNumber: 20,
        electronConfiguration: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²',
        electronsPerShell: [2, 8, 8, 2]
      }
    },

    // UI state
    currentElement: 'H',
    electronSpeed: 0.05,
    narrationTimeout: null
  }),

  actions: {
    setCurrentElement(element) {
      this.currentElement = element;
    },
    setElectronSpeed(speed) {
      this.electronSpeed = speed;
    }
  },

  getters: {
    currentElementData: (state) => state.elements[state.currentElement]
  }
})
