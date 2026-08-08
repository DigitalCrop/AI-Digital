export function assertTurn(state, playerId) {
  if (state.status !== 'playing') throw new Error('This game is already complete.');
  if (state.players[state.turn] !== playerId) throw new Error('It is not your turn.');
}
export const nextTurn = (state) => (state.turn + 1) % state.players.length;
export function randomInt(max, rng = Math.random) { return Math.floor(rng() * max); }
export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, rng);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
