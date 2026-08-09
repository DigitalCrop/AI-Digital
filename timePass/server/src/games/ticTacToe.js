import { assertTurn } from './helpers.js';
const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export const ticTacToe = {
  create(players) { return { game: 'tic-tac-toe', players, board: Array(9).fill(null), turn: 0, status: 'playing', winnerId: null, draw: false }; },
  move(state, playerId, move) {
    assertTurn(state, playerId);
    if (!Number.isInteger(move.cell) || move.cell < 0 || move.cell > 8 || state.board[move.cell]) throw new Error('Choose an empty square.');
    state.board[move.cell] = state.turn === 0 ? 'X' : 'O';
    if (lines.some((line) => line.every((i) => state.board[i] === state.board[move.cell]))) { state.status = 'complete'; state.winnerId = playerId; }
    else if (state.board.every(Boolean)) { state.status = 'complete'; state.draw = true; }
    else state.turn = state.turn === 0 ? 1 : 0;
    return state;
  },
  publicState: (state) => state
};
