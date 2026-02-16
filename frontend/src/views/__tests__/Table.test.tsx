import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Table from '../../components/game/board/Table';

// Mock child components
vi.mock('../../components/game/board/SmallTable', () => ({
  default: () => <div data-testid="small-table">SmallTable</div>
}));
vi.mock('../../components/game/board/TableWinningLine', () => ({
  default: () => <div data-testid="table-winning-line">WinningLine</div>
}));

// Mock the context hook directly
vi.mock('../../context/GameContext', () => ({
  useGame: vi.fn(),
}));

import { useGame } from '../../context/GameContext';

describe('Table Component', () => {
  it('renders correctly', () => {
    vi.mocked(useGame).mockReturnValue({
      shake: false,
    } as any);

    render(<Table />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getAllByTestId('small-table')).toHaveLength(9);
    expect(screen.getByTestId('table-winning-line')).toBeInTheDocument();
  });
});
