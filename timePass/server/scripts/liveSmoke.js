import { io } from 'socket.io-client';
import { EVENTS } from '@timepass/shared';

const url = process.env.SMOKE_URL || 'http://host.docker.internal:3100';
const connect = () => new Promise((resolve, reject) => {
  const client = io(url, { transports: ['websocket'], forceNew: true, reconnection: false });
  client.once('connect', () => resolve(client));
  client.once('connect_error', reject);
});
const request = (client, event, payload = {}) => new Promise((resolve, reject) => client.timeout(5_000).emit(event, payload, (timeout, response) => timeout ? reject(timeout) : resolve(response)));
const roomState = (client, predicate = () => true) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('Timed out waiting for room state.')), 5_000);
  const listener = (state) => { if (predicate(state)) { clearTimeout(timer); client.off(EVENTS.ROOM_STATE, listener); resolve(state); } };
  client.on(EVENTS.ROOM_STATE, listener);
});
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const first = await connect();
const created = await request(first, EVENTS.CREATE_ROOM, { displayName: 'SmokeHost' });
assert(created.ok && created.code && created.token, 'Room creation failed.');
const second = await connect();
const joined = await request(second, EVENTS.JOIN_ROOM, { displayName: 'SmokeFriend', code: created.code });
assert(joined.ok, `Join failed: ${joined.error}`);
await request(first, EVENTS.SELECT_GAME, { game: 'tic-tac-toe' });
await request(first, EVENTS.PLAYER_READY, { ready: true });
await request(second, EVENTS.PLAYER_READY, { ready: true });
const startedState = roomState(first, (state) => state.status === 'playing');
assert((await request(first, EVENTS.START_GAME)).ok, 'Game did not start.');
const playing = await startedState;
const hostId = playing.players.find((player) => player.name === 'SmokeHost').id;
const friendId = playing.players.find((player) => player.name === 'SmokeFriend').id;
const currentIsHost = playing.gameState.players[playing.gameState.turn] === hostId;
const current = currentIsHost ? first : second;
const waiting = currentIsHost ? second : first;
const invalid = await request(waiting, EVENTS.SUBMIT_MOVE, { actionId: crypto.randomUUID(), move: { cell: 8 } });
assert(!invalid.ok && /turn/i.test(invalid.error), 'Out-of-turn action was not rejected.');
const actionId = crypto.randomUUID();
assert((await request(current, EVENTS.SUBMIT_MOVE, { actionId, move: { cell: 0 } })).ok, 'Valid move failed.');
const duplicate = await request(current, EVENTS.SUBMIT_MOVE, { actionId, move: { cell: 1 } });
assert(!duplicate.ok && /already/i.test(duplicate.error), 'Duplicate action was not rejected.');
first.disconnect();
const refreshed = await connect();
const reconnectState = roomState(refreshed, (state) => state.code === created.code);
assert((await request(refreshed, EVENTS.RECONNECT, { code: created.code, token: created.token })).ok, 'Reconnection failed.');
const restored = await reconnectState;
assert(restored.selfId === hostId && restored.players.some((player) => player.id === friendId), 'Reconnected seat or room isolation failed.');
refreshed.disconnect(); second.disconnect();
console.log(JSON.stringify({ ok: true, code: created.code, players: 2, websocket: true, outOfTurnRejected: true, duplicateRejected: true, reconnected: true }));
