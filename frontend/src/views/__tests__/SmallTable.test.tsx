import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SmallTable from '../../components/game/board/SmallTable';

// Mock child components
vi.mock('../../components/game/board/SmallTableWinningLine', () => ({
  default: () => <div data-testid="small-winning-line">WinningLine</div>
}));

// Mock context hook
vi.mock('../../context/GameContext', () => ({
  useGame: vi.fn(),
}));

import { useGame } from '../../context/GameContext';

describe('SmallTable Component', () => {
  const mockMakeMove = vi.fn();
  
  const defaultGameState = {
    cells: Array(9).fill(null).map(() => Array(9).fill(null)),
    previousMove: null,
    winner: null,
    smallWinners: Array(3).fill(null).map(() => Array(3).fill(null)),
    makeMove: mockMakeMove,
  };

  it('renders a 3x3 grid of cells', () => {
    vi.mocked(useGame).mockReturnValue(defaultGameState as any);

    render(<SmallTable blockRow={0} blockCol={0} />);

    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(9);
  });

  it('renders X and O correctly', () => {
    const gameStateWithMoves = {
        ...defaultGameState,
        cells: Array(9).fill(null).map((_, r) => 
            Array(9).fill(null).map((_, c) => (r === 0 && c === 0 ? 'X' : r === 0 && c === 1 ? 'O' : null))
        ),
    };
    vi.mocked(useGame).mockReturnValue(gameStateWithMoves as any);

    render(<SmallTable blockRow={0} blockCol={0} />);

    expect(screen.getByText('X')).toBeInTheDocument();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('calls makeMove when a cell is clicked', () => {
    vi.mocked(useGame).mockReturnValue(defaultGameState as any);

    render(<SmallTable blockRow={1} blockCol={1} />);

    const cells = screen.getAllByRole('cell');
    fireEvent.click(cells[0]); // Click top-left cell of this block (1,1) -> global (3,3)

    expect(mockMakeMove).toHaveBeenCalledWith({
      block: { row: 1, col: 1 },
      cell: { row: 0, col: 0 },
    });
  });

  it('highlights the active block', () => {
    const activeGameState = {
        ...defaultGameState,
        previousMove: {
            cell: { row: 1, col: 1 }, // Next move should be in block (1,1)
            block: { row: 0, col: 0 }
        }
    };
    vi.mocked(useGame).mockReturnValue(activeGameState as any);

    const { container } = render(<SmallTable blockRow={1} blockCol={1} />);
    
    // Check for animation class on the wrapper div
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('animate-pulseHighlight');
  });
});
