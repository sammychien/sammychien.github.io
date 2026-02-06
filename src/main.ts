import { transformToUppercase } from './clipboard_util';
import './style.css';

const textInput = document.getElementById('textInput') as HTMLInputElement;
const feedback = document.getElementById('feedback') as HTMLDivElement;

if (!textInput || !feedback) {
  throw new Error('Required DOM elements not found');
}

textInput.addEventListener('keypress', async (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    let text = textInput.value.trim();

    if (!text) {
      showFeedback('Please enter some text', 'error');
      return;
    }

    // Use the utility function to transform to uppercase
    text = transformToUppercase(text);

    try {
      await navigator.clipboard.writeText(text);
      showFeedback('✓ Copied to clipboard!', 'success');
      textInput.value = '';
      textInput.focus();
    } catch (err) {
      showFeedback('Failed to copy. Please try again.', 'error');
      console.error('Clipboard error:', err);
    }
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
  }, 2000);
}
