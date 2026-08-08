import { assertTurn, nextTurn, shuffle } from './helpers.js';
const symbols = ['🍓','🚀','🌈','🐳','⚽','🎸','🍕','🦋'];
export const memoryMatch = {
  create(players, rng = Math.random) {
    return { game: 'memory-match', players, cards: shuffle([...symbols, ...symbols], rng).map((symbol, id) => ({id, symbol, matched: false})), scores: Object.fromEntries(players.map((id) => [id, 0])), flipped: [], lastReveal: [], turn: 0, status: 'playing', winnerIds: [], draw: false };
  },
  move(state, playerId, move) {
    assertTurn(state, playerId);
    const card = state.cards[move.card];
    if (!Number.isInteger(move.card) || !card || card.matched || state.flipped.includes(move.card)) throw new Error('Choose a face-down card.');
    if (state.flipped.length === 0) state.lastReveal = [];
    state.flipped.push(move.card);
    if (state.flipped.length === 2) {
      const [a,b] = state.flipped;
      state.lastReveal = [a,b];
      if (state.cards[a].symbol === state.cards[b].symbol) { state.cards[a].matched = true; state.cards[b].matched = true; state.scores[playerId] += 1; }
      else state.turn = nextTurn(state);
      state.flipped = [];
      if (state.cards.every((item) => item.matched)) {
        const high = Math.max(...Object.values(state.scores));
        state.winnerIds = state.players.filter((id) => state.scores[id] === high);
        state.draw = state.winnerIds.length > 1;
        state.status = 'complete';
      }
    }
    return state;
  },
  publicState(state) {
    return { ...state, cards: state.cards.map((card) => ({ id: card.id, matched: card.matched, symbol: card.matched || state.flipped.includes(card.id) || state.lastReveal.includes(card.id) ? card.symbol : null })) };
  }
};
