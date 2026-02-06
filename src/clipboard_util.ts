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
 * Format a chemical formula by capitalizing elements and converting numbers to subscripts.
 * 
 * @param formula - The chemical formula to format.
 * @returns The formatted formula with subscripts.
 */
export function formatFormula(formula: string): string {
  const result: string[] = [];
  let i = 0;

  while (i < formula.length) {
    if (formula[i].match(/[a-zA-Z]/)) {
      // Try to match two-letter element
      let elem: string;
      if (i + 1 < formula.length && formula[i + 1].match(/[a-zA-Z]/)) {
        const twoLetter = formula.substring(i, i + 2);
        const capitalized =
          twoLetter.charAt(0).toUpperCase() + twoLetter.charAt(1).toLowerCase();

        if (ELEMENTS.has(capitalized)) {
          elem = capitalized;
          i += 2;
        } else {
          // Try single letter
          elem = formula[i].toUpperCase();
          i += 1;
        }
      } else {
        // Single letter element
        elem = formula[i].toUpperCase();
        i += 1;
      }

      result.push(elem);

      // Collect following digits
      let num = '';
      while (i < formula.length && formula[i].match(/[0-9]/)) {
        num += formula[i];
        i += 1;
      }

      if (num) {
        result.push(toSubscript(num));
      }
    } else {
      // Non-alphabetic character
      result.push(formula[i]);
      i += 1;
    }
  }

  return result.join('');
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
