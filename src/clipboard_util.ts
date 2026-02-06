/**
 * Clipboard utility module for text transformation.
 */

// Set of valid chemical elements
const ELEMENTS = new Set([
  'Ac', 'Ag', 'Al', 'Am', 'Ar', 'As', 'At', 'Au', 'B', 'Ba', 'Be', 'Bh', 'Bi',
  'Bk', 'Br', 'C', 'Ca', 'Cd', 'Ce', 'Cf', 'Cl', 'Cm', 'Cn', 'Co', 'Cr', 'Cs',
  'Cu', 'Db', 'Ds', 'Dy', 'Er', 'Es', 'Eu', 'F', 'Fe', 'Fl', 'Fm', 'Fr', 'Ga',
  'Gd', 'Ge', 'H', 'He', 'Hf', 'Hg', 'Ho', 'Hs', 'I', 'In', 'Ir', 'K', 'Kr',
  'La', 'Li', 'Lr', 'Lu', 'Lv', 'Md', 'Mg', 'Mn', 'Mo', 'Mt', 'N', 'Na', 'Nb',
  'Nd', 'Ne', 'Ni', 'No', 'Np', 'O', 'Os', 'P', 'Pa', 'Pb', 'Pd', 'Pm', 'Po',
  'Pr', 'Pt', 'Pu', 'Ra', 'Rb', 'Re', 'Rf', 'Rg', 'Rh', 'Rn', 'Ru', 'S', 'Sb',
  'Sc', 'Se', 'Sg', 'Si', 'Sm', 'Sn', 'Sr', 'Ta', 'Tb', 'Tc', 'Te', 'Th', 'Ti',
  'Tl', 'Tm', 'U', 'V', 'W', 'Xe', 'Y', 'Yb', 'Zn', 'Zr',
]);

// Map of digits to subscript unicode characters
const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

/**
 * Convert a number string to subscript characters.
 * 
 * @param numStr - The number string to convert.
 * @returns The number converted to subscript unicode characters.
 */
function toSubscript(numStr: string): string {
  return numStr
    .split('')
    .map((c) => SUBSCRIPT_MAP[c] || c)
    .join('');
}

/**
 * Get all possible chemical formula interpretations.
 * Handles ambiguous formulas by exploring all valid parsing paths.
 * 
 * @param formula - The chemical formula to parse.
 * @param index - Current position in the formula (for recursion).
 * @returns Array of all possible formatted formulas.
 */
export function getAllFormulas(formula: string, index: number = 0): string[] {
  if (index >= formula.length) {
    return [''];
  }

  const results: string[] = [];

  if (formula[index].match(/[a-zA-Z]/)) {
    // Try 2-letter element first
    if (index + 1 < formula.length && formula[index + 1].match(/[a-zA-Z]/)) {
      const twoLetter = formula.substring(index, index + 2);
      const capitalized =
        twoLetter.charAt(0).toUpperCase() + twoLetter.charAt(1).toLowerCase();

      if (ELEMENTS.has(capitalized)) {
        // Collect digits
        let digitIndex = index + 2;
        let num = '';
        while (digitIndex < formula.length && formula[digitIndex].match(/[0-9]/)) {
          num += formula[digitIndex];
          digitIndex += 1;
        }

        const subscript = num ? toSubscript(num) : '';
        const restResults = getAllFormulas(formula, digitIndex);

        for (const rest of restResults) {
          results.push(capitalized + subscript + rest);
        }
      }
    }

    // Try 1-letter element
    const oneLetter = formula[index].toUpperCase();

    // Collect digits
    let digitIndex = index + 1;
    let num = '';
    while (digitIndex < formula.length && formula[digitIndex].match(/[0-9]/)) {
      num += formula[digitIndex];
      digitIndex += 1;
    }

    const subscript = num ? toSubscript(num) : '';
    const restResults = getAllFormulas(formula, digitIndex);

    for (const rest of restResults) {
      results.push(oneLetter + subscript + rest);
    }
  } else {
    // Non-alphabetic character
    const restResults = getAllFormulas(formula, index + 1);

    for (const rest of restResults) {
      results.push(formula[index] + rest);
    }
  }

  return results;
}

/**
 * Transform the given text to uppercase.
 * 
 * @param text - The input text to transform.
 * @returns The text converted to uppercase.
 */
export function transformToUppercase(text: string): string {
  return text.toUpperCase();
}
