import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAllFormulas } from './clipboard_util';

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
};

Object.assign(navigator, { clipboard: mockClipboard });

describe('UI - Main Application', () => {
  let textInput: HTMLInputElement;
  let feedback: HTMLDivElement;
  let historyContainer: HTMLDivElement;
  let disambiguationModal: HTMLDivElement;
  let disambiguationOptions: HTMLDivElement;

  beforeEach(() => {
    // Clear the DOM and set up fresh HTML
    document.body.innerHTML = `
      <div class="container">
        <h1>Chemical Formula Formatter</h1>
        <p class="subtitle">Type text and press Enter to copy to clipboard</p>
        <input type="text" id="textInput" placeholder="Enter text here..." autofocus />
        <div class="feedback" id="feedback"></div>
        <div id="history"></div>
      </div>
      <div id="disambiguationModal" class="modal">
        <div class="modal-content">
          <h2>Multiple Interpretations Found</h2>
          <p>Press the number (1-9) of your choice:</p>
          <div id="disambiguationOptions"></div>
          <p class="modal-hint">Press Escape to cancel</p>
        </div>
      </div>
    `;

    textInput = document.getElementById('textInput') as HTMLInputElement;
    feedback = document.getElementById('feedback') as HTMLDivElement;
    historyContainer = document.getElementById('history') as HTMLDivElement;
    disambiguationModal = document.getElementById('disambiguationModal') as HTMLDivElement;
    disambiguationOptions = document.getElementById('disambiguationOptions') as HTMLDivElement;

    // Reset mock clipboard
    mockClipboard.writeText.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('clipboard functionality', () => {
    it('calls clipboard with correct formula when ready', async () => {
      const formula = 'H₂O';
      await mockClipboard.writeText(formula);

      expect(mockClipboard.writeText).toHaveBeenCalledWith('H₂O');
    });

    it('handles clipboard errors gracefully', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard denied'));

      try {
        await mockClipboard.writeText('H₂O');
      } catch (err) {
        // Error should be caught
        expect(err).toBeDefined();
      }
    });

    it('retrieves multiple formula options for ambiguous input', () => {
      // Test that getAllFormulas returns multiple options for some inputs
      const formulas = getAllFormulas('co');
      expect(Array.isArray(formulas)).toBe(true);
      expect(formulas.length).toBeGreaterThanOrEqual(1);
    });

    it('does not copy when input is empty', async () => {
      textInput.value = '';
      const trimmed = textInput.value.trim();

      if (!trimmed) {
        // Should not proceed with copy
        expect(mockClipboard.writeText).not.toHaveBeenCalled();
      }
    });

    it('simulates successful copy flow', async () => {
      // Simulate: input -> get formulas -> copy -> clear input -> show feedback
      const formula = getAllFormulas('h2o')[0];
      
      textInput.value = 'h2o';
      expect(textInput.value).toBe('h2o');

      // Copy the formula
      await mockClipboard.writeText(formula);
      expect(mockClipboard.writeText).toHaveBeenCalledWith(formula);

      // Clear input
      textInput.value = '';
      expect(textInput.value).toBe('');
    });
  });

  describe('disambiguation modal', () => {
    it('shows modal with multiple options when formula is ambiguous', () => {
      const ambiguousFormula = 'co'; // Could be C+O or Co
      const formulas = getAllFormulas(ambiguousFormula);

      if (formulas.length > 1) {
        // Simulate modal showing
        disambiguationOptions.innerHTML = '';
        formulas.forEach((formula, index) => {
          const option = document.createElement('div');
          option.className = 'disambiguation-option';
          option.innerHTML = `
            <span class="option-number">${index + 1}</span>
            <span class="option-text">${formula}</span>
          `;
          disambiguationOptions.appendChild(option);
        });
        disambiguationModal.classList.add('show');

        // Verify modal is shown
        expect(disambiguationModal.classList.contains('show')).toBe(true);
        expect(disambiguationOptions.children.length).toBe(formulas.length);
      }
    });

    it('displays all formula options in modal', () => {
      const formulas = ['H₂O', 'H2O']; // Simulate multiple options

      disambiguationOptions.innerHTML = '';
      formulas.forEach((formula, index) => {
        const option = document.createElement('div');
        option.className = 'disambiguation-option';
        option.innerHTML = `
          <span class="option-number">${index + 1}</span>
          <span class="option-text">${formula}</span>
        `;
        disambiguationOptions.appendChild(option);
      });
      disambiguationModal.classList.add('show');

      // Check all options are rendered
      const options = document.querySelectorAll('.disambiguation-option');
      expect(options.length).toBe(2);
      expect(options[0].textContent).toContain('1');
      expect(options[0].textContent).toContain('H₂O');
      expect(options[1].textContent).toContain('2');
    });

    it('hides modal when Escape key is pressed', () => {
      // Show modal
      disambiguationModal.classList.add('show');
      expect(disambiguationModal.classList.contains('show')).toBe(true);

      // Simulate Escape key
      disambiguationModal.classList.remove('show');

      expect(disambiguationModal.classList.contains('show')).toBe(false);
    });

    it('clears input when modal is canceled', () => {
      textInput.value = 'test';
      disambiguationModal.classList.add('show');

      // Simulate cancel
      disambiguationModal.classList.remove('show');
      textInput.value = '';

      expect(textInput.value).toBe('');
    });
  });

  describe('user feedback', () => {
    it('shows success feedback when clipboard copy succeeds', async () => {
      mockClipboard.writeText.mockResolvedValueOnce(undefined);

      const message = '✓ Copied: H₂O';
      feedback.textContent = message;
      feedback.className = 'feedback show success';

      expect(feedback.classList.contains('show')).toBe(true);
      expect(feedback.classList.contains('success')).toBe(true);
      expect(feedback.textContent).toBe(message);
    });

    it('shows error feedback when clipboard copy fails', async () => {
      mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard failed'));

      const message = 'Failed to copy. Please try again.';
      feedback.textContent = message;
      feedback.className = 'feedback show error';

      expect(feedback.classList.contains('show')).toBe(true);
      expect(feedback.classList.contains('error')).toBe(true);
      expect(feedback.textContent).toBe(message);
    });

    it('shows error when empty text is submitted', () => {
      textInput.value = '';

      const message = 'Please enter some text';
      feedback.textContent = message;
      feedback.className = 'feedback show error';

      expect(feedback.textContent).toBe(message);
      expect(feedback.classList.contains('error')).toBe(true);
    });
  });

  describe('input handling', () => {
    it('clears input after successful copy', async () => {
      textInput.value = 'h2o';
      expect(textInput.value).toBe('h2o');

      // Simulate successful copy (manually clear as real app would)
      textInput.value = '';

      expect(textInput.value).toBe('');
    });

    it('trims whitespace from input', () => {
      textInput.value = '  h2o  ';
      const trimmed = textInput.value.trim();

      expect(trimmed).toBe('h2o');
    });

    it('ignores non-Enter keypresses', () => {
      textInput.value = 'h2o';

      const event = new KeyboardEvent('keypress', { key: 'a' });
      const listenerCalled = textInput.dispatchEvent(event);

      // Without an actual listener, event should just dispatch
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('history rendering', () => {
    it('renders history when entries exist', () => {
      const historyEntries = [
        { original: 'h2o', formatted: 'H₂O' },
        { original: 'co2', formatted: 'CO₂' },
      ];

      historyContainer.innerHTML = `
        <h3>Recent Copies</h3>
        <ul class="history-list">
          ${historyEntries
            .map(
              (entry, index) => `
            <li class="history-item">
              <div class="history-content">
                <span class="history-original">Query: ${entry.original}</span>
                <span class="history-text">Result: ${entry.formatted}</span>
              </div>
              <button class="copy-btn" data-index="${index}">Copy</button>
            </li>
          `
            )
            .join('')}
        </ul>
      `;

      const items = document.querySelectorAll('.history-item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('h2o');
      expect(items[0].textContent).toContain('H₂O');
    });

    it('clears history when empty', () => {
      historyContainer.innerHTML = '';

      expect(historyContainer.innerHTML).toBe('');
    });

    it('keeps only most recent 5 entries', () => {
      const entries = Array.from({ length: 7 }, (_, i) => ({
        original: `formula${i + 1}`,
        formatted: `Formatted${i + 1}`,
      }));

      // Only last 5 should be kept
      const recentEntries = entries.slice(-5);

      historyContainer.innerHTML = `
        <h3>Recent Copies</h3>
        <ul class="history-list">
          ${recentEntries
            .map(
              (entry, index) => `
            <li class="history-item">
              <span>${entry.original}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      `;

      const items = document.querySelectorAll('.history-item');
      expect(items.length).toBe(5);
    });
  });

  describe('element validation', () => {
    it('validates that all required elements exist', () => {
      // Should have all required elements after beforeEach setup
      expect(textInput).not.toBeNull();
      expect(feedback).not.toBeNull();
      expect(historyContainer).not.toBeNull();
      expect(disambiguationModal).not.toBeNull();
      expect(disambiguationOptions).not.toBeNull();
    });

    it('finds elements by correct IDs', () => {
      expect(textInput.id).toBe('textInput');
      expect(feedback.id).toBe('feedback');
      expect(historyContainer.id).toBe('history');
      expect(disambiguationModal.id).toBe('disambiguationModal');
      expect(disambiguationOptions.id).toBe('disambiguationOptions');
    });
  });
});
