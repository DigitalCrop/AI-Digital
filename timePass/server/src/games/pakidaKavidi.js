import { assertTurn, nextTurn, randomInt } from './helpers.js';

// Configurable Kerala-inspired race rules. See README for the exact rules.
export const KAVIDI_RULES = Object.freeze({
  shells: 4,
  valueByOpenShells: Object.freeze({ 0: 8, 1: 1, 2: 2, 3: 3, 4: 4 }),
  piecesPerPlayer: 4,
  finish: 24,
  entryValues: Object.freeze([1, 4, 8]),
  bonusValues: Object.freeze([4, 8]),
  safeSquares: Object.freeze([0, 6, 12, 18]),
  captureGrantsBonus: true,
  exactFinish: true
});

function rollCowries(rules, rng) {
  const faces = Array.from({ length: rules.shells }, () => randomInt(2, rng));
  const open = faces.reduce((sum, face) => sum + face, 0);
  return { faces, open, value: rules.valueByOpenShells[open] };
}
function validPieces(state, playerId, value) {
  return state.pieces[playerId].map((position, index) => ({ position, index })).filter(({position}) => {
    if (position === state.rules.finish) return false;
    if (position === -1) return state.rules.entryValues.includes(value);
    return !state.rules.exactFinish || position + value <= state.rules.finish;
  }).map(({index}) => index);
}
function advance(state, keepTurn) {
  if (!keepTurn) state.turn = nextTurn(state);
  state.phase = 'roll'; state.roll = null; state.validPieces = [];
}
export const pakidaKavidi = {
  create(players, _rng, customRules = {}) {
    const rules = { ...KAVIDI_RULES, ...customRules };
    return { game: 'pakida-kavidi', players, rules, pieces: Object.fromEntries(players.map((id) => [id, Array(rules.piecesPerPlayer).fill(-1)])), turn: 0, phase: 'roll', roll: null, validPieces: [], status: 'playing', winnerId: null, lastAction: null };
  },
  move(state, playerId, move, rng = Math.random) {
    assertTurn(state, playerId);
    if (state.phase === 'roll') {
      if (move.type !== 'throw') throw new Error('Throw the kavidi first.');
      state.roll = rollCowries(state.rules, rng);
      state.validPieces = validPieces(state, playerId, state.roll.value);
      state.lastAction = { type: 'throw', playerId, ...state.roll };
      if (state.validPieces.length) state.phase = 'move';
      else advance(state, state.rules.bonusValues.includes(state.roll.value));
      return state;
    }
    if (move.type !== 'movePiece' || !state.validPieces.includes(move.piece)) throw new Error('Choose one of the highlighted pieces.');
    const value = state.roll.value;
    const oldPosition = state.pieces[playerId][move.piece];
    const destination = oldPosition === -1 ? 0 : oldPosition + value;
    state.pieces[playerId][move.piece] = destination;
    let captured = false;
    if (!state.rules.safeSquares.includes(destination) && destination < state.rules.finish) {
      for (const opponent of state.players.filter((id) => id !== playerId)) {
        state.pieces[opponent] = state.pieces[opponent].map((position) => {
          if (position === destination) { captured = true; return -1; }
          return position;
        });
      }
    }
    state.lastAction = { type: 'move', playerId, piece: move.piece, value, destination, captured };
    if (state.pieces[playerId].every((position) => position === state.rules.finish)) { state.status = 'complete'; state.winnerId = playerId; state.phase = 'complete'; }
    else advance(state, state.rules.bonusValues.includes(value) || (captured && state.rules.captureGrantsBonus));
    return state;
  },
  publicState: (state) => state
};
