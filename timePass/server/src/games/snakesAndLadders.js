import { assertTurn, nextTurn, randomInt } from './helpers.js';
export const jumps = Object.freeze({ 4:14, 9:31, 17:7, 20:38, 28:84, 40:59, 51:67, 54:34, 62:19, 63:81, 64:60, 71:91, 87:24, 93:73, 95:75, 99:78 });
export const snakesAndLadders = {
  create(players) { return { game: 'snakes-and-ladders', players, positions: Object.fromEntries(players.map((id) => [id, 0])), turn: 0, status: 'playing', winnerId: null, lastRoll: null, jumps }; },
  move(state, playerId, move, rng = Math.random) {
    assertTurn(state, playerId);
    if (move.type !== 'roll') throw new Error('Roll the die.');
    const roll = randomInt(6, rng) + 1;
    let destination = state.positions[playerId] + roll;
    if (destination <= 100) destination = jumps[destination] || destination;
    else destination = state.positions[playerId];
    state.positions[playerId] = destination;
    state.lastRoll = { playerId, roll, destination };
    if (destination === 100) { state.status = 'complete'; state.winnerId = playerId; }
    else if (roll !== 6) state.turn = nextTurn(state);
    return state;
  },
  publicState: (state) => state
};
