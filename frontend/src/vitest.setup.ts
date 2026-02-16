import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window properties
window.alert = vi.fn();

vi.mock('*.svg', () => ({
  default: 'test-file-stub',
  ReactComponent: 'div',
}));
