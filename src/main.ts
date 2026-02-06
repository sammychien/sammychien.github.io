import { getAllFormulas } from './clipboard_util';
import './style.css';

const textInput = document.getElementById('textInput') as HTMLInputElement;
const feedback = document.getElementById('feedback') as HTMLDivElement;
const historyContainer = document.getElementById('history') as HTMLDivElement;
const disambiguationModal = document.getElementById('disambiguationModal') as HTMLDivElement;
const disambiguationOptions = document.getElementById('disambiguationOptions') as HTMLDivElement;

if (!textInput || !feedback || !historyContainer || !disambiguationModal || !disambiguationOptions) {
  throw new Error('Required DOM elements not found');
}

// Track the last 5 copied strings with original query
interface HistoryEntry {
  original: string;
  formatted: string;
}

let history: HistoryEntry[] = [];
let pendingFormulas: string[] = [];
let pendingOriginal: string = '';
textInput.addEventListener('keypress', async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const originalText = textInput.value.trim();

    if (!originalText) {
      showFeedback('Please enter some text', 'error');
      return;
    }

    // Get all possible formula interpretations
    const formulas = getAllFormulas(originalText);
    pendingFormulas = formulas;
    pendingOriginal = originalText;

    if (formulas.length === 1) {
      // Only one interpretation, copy it
      await copyFormula(originalText, formulas[0]);
      textInput.value = '';
      textInput.focus();
    } else if (formulas.length > 1) {
      // Multiple interpretations, show disambiguation modal
      showDisambiguationModal(formulas);
    }
  }
});

/**
 * Show the disambiguation modal with multiple formula options.
 * 
 * @param formulas - Array of possible formula interpretations.
 */
function showDisambiguationModal(formulas: string[]): void {
  disambiguationOptions.innerHTML = '';
  
  formulas.forEach((formula, index) => {
    const option = document.createElement('div');
    option.className = 'disambiguation-option';
    option.innerHTML = `
      <span class="option-number">${index + 1}</span>
      <span class="option-text">${escapeHtml(formula)}</span>
    `;
    disambiguationOptions.appendChild(option);
  });

  disambiguationModal.classList.add('show');
  textInput.blur();
}

/**
 * Hide the disambiguation modal.
 */
function hideDisambiguationModal(): void {
  disambiguationModal.classList.remove('show');
  textInput.focus();
}

/**
 * Copy a formula to clipboard and update history.
 * 
 * @param original - The original query string.
 * @param formula - The formatted formula to copy.
 */
async function copyFormula(original: string, formula: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(formula);
    showFeedback(`✓ Copied: ${formula}`, 'success');

    // Add to history (keep only last 5)
    history.unshift({ original, formatted: formula });
    if (history.length > 5) {
      history.pop();
    }
    renderHistory();
  } catch (err) {
    showFeedback('Failed to copy. Please try again.', 'error');
    console.error('Clipboard error:', err);
  }
}

// Listen for number key presses to select disambiguation option
document.addEventListener('keypress', async (e: KeyboardEvent) => {
  if (!disambiguationModal.classList.contains('show')) {
    return;
  }

  const num = parseInt(e.key);
  if (num >= 1 && num <= 9 && num <= pendingFormulas.length) {
    e.preventDefault();
    const selectedFormula = pendingFormulas[num - 1];
    await copyFormula(pendingOriginal, selectedFormula);
    hideDisambiguationModal();
    textInput.value = '';
    textInput.focus();
  }
});

// Close modal on Escape key
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && disambiguationModal.classList.contains('show')) {
    hideDisambiguationModal();
    textInput.value = '';
    textInput.focus();
  }
});

/**
 * Display feedback message to the user.
 * 
 * @param message - The message to display.
 * @param type - The type of feedback ('success' or 'error').
 */
function showFeedback(message: string, type: 'success' | 'error'): void {
  feedback.textContent = message;
  feedback.className = `feedback show ${type}`;

  setTimeout(() => {
    feedback.classList.remove('show');
  }, 10000);
}

/**
 * Render the history list with copy buttons.
 */
function renderHistory(): void {
  if (history.length === 0) {
    historyContainer.innerHTML = '';
    return;
  }

  historyContainer.innerHTML = `
    <h3>Recent Copies</h3>
    <ul class="history-list">
      ${history
        .map(
          (entry, index) => `
        <li class="history-item">
          <div class="history-content">
            <span class="history-original">Query: ${escapeHtml(entry.original)}</span>
            <span class="history-text">Result: ${escapeHtml(entry.formatted)}</span>
          </div>
          <button class="copy-btn" data-index="${index}">Copy</button>
        </li>
      `
        )
        .join('')}
    </ul>
  `;

  // Attach event listeners to copy buttons
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0');
      const entry = history[index];
      try {
        await navigator.clipboard.writeText(entry.formatted);
        showFeedback(`✓ Copied: ${entry.formatted}`, 'success');
      } catch (err) {
        showFeedback('Failed to copy. Please try again.', 'error');
        console.error('Clipboard error:', err);
      }
    });
  });
}

/**
 * Escape HTML special characters to prevent XSS.
 * 
 * @param text - The text to escape.
 * @returns The escaped text.
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
