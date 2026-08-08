import { assertTurn } from './helpers.js';
const ROWS = 6, COLS = 7;
function hasFour(board, row, col, token) {
  return [[0,1],[1,0],[1,1],[1,-1]].some(([dr,dc]) => {
    let count = 1;
    for (const direction of [-1, 1]) for (let step = 1; step < 4; step += 1) {
      const r = row + dr * step * direction, c = col + dc * step * direction;
      if (board[r]?.[c] !== token) break;
      count += 1;
    }
    return count >= 4;
  });
}
export const connectFour = {
  create(players) { return { game: 'connect-four', players, board: Array.from({length: ROWS}, () => Array(COLS).fill(null)), turn: 0, status: 'playing', winnerId: null, draw: false }; },
  move(state, playerId, move) {
    assertTurn(state, playerId);
    if (!Number.isInteger(move.column) || move.column < 0 || move.column >= COLS) throw new Error('Choose a valid column.');
    let row = ROWS - 1;
    while (row >= 0 && state.board[row][move.column]) row -= 1;
    if (row < 0) throw new Error('That column is full.');
    const token = state.turn === 0 ? 'R' : 'Y';
    state.board[row][move.column] = token;
    if (hasFour(state.board, row, move.column, token)) { state.status = 'complete'; state.winnerId = playerId; }
    else if (state.board.every((cells) => cells.every(Boolean))) { state.status = 'complete'; state.draw = true; }
    else state.turn = state.turn === 0 ? 1 : 0;
    return state;
  },
  publicState: (state) => state
};
