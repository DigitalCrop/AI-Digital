import crypto from 'node:crypto';
import { GAME_INFO } from '@timepass/shared';
import { gameEngines } from '../games/index.js';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const id = () => crypto.randomUUID();
const token = () => crypto.randomBytes(32).toString('base64url');
const hash = (value, secret) => crypto.createHmac('sha256', secret).update(value).digest('hex');
const code = () => Array.from({length: 5}, () => alphabet[crypto.randomInt(alphabet.length)]).join('');

export class RoomManager {
  constructor({ repository, reconnectGraceMs = 60_000, roomExpiryMs = 7_200_000, sessionSecret = 'test-secret', now = () => Date.now() }) {
    this.repository = repository;
    this.reconnectGraceMs = reconnectGraceMs;
    this.roomExpiryMs = roomExpiryMs;
    this.sessionSecret = sessionSecret;
    this.now = now;
    this.rooms = new Map();
  }
  async createRoom(name, socketId) {
    let roomCode;
    do roomCode = code(); while (this.rooms.has(roomCode));
    const sessionToken = token();
    const player = { id: id(), name, tokenHash: hash(sessionToken, this.sessionSecret), socketId, connected: true, ready: false, host: true, score: 0, disconnectedAt: null, actions: new Set() };
    const room = { id: id(), code: roomCode, selectedGame: null, status: 'lobby', players: new Map([[player.id, player]]), gameState: null, rematches: new Set(), createdAt: this.now(), lastActiveAt: this.now() };
    this.rooms.set(roomCode, room);
    await this.repository.createRoom(room); await this.repository.addPlayer(room.id, player);
    return { room, player, token: sessionToken };
  }
  async joinRoom(roomCode, name, socketId) {
    const room = this.requireRoom(roomCode);
    if (room.players.size >= 4) throw new Error('This room is full.');
    if (room.status !== 'lobby') throw new Error('A game is already in progress.');
    if ([...room.players.values()].some((player) => player.name.localeCompare(name, undefined, {sensitivity:'accent'}) === 0)) throw new Error('That display name is already in this room.');
    const sessionToken = token();
    const player = { id: id(), name, tokenHash: hash(sessionToken, this.sessionSecret), socketId, connected: true, ready: false, host: false, score: 0, disconnectedAt: null, actions: new Set() };
    room.players.set(player.id, player); this.touch(room);
    await this.repository.addPlayer(room.id, player); await this.repository.updateRoom(room);
    return { room, player, token: sessionToken };
  }
  reconnect(roomCode, sessionToken, socketId) {
    const room = this.requireRoom(roomCode);
    const player = [...room.players.values()].find((item) => item.tokenHash === hash(sessionToken, this.sessionSecret));
    if (!player) throw new Error('This saved session is no longer valid.');
    if (player.disconnectedAt && this.now() - player.disconnectedAt > this.reconnectGraceMs) throw new Error('The reconnection period has ended.');
    player.connected = true; player.disconnectedAt = null; player.socketId = socketId; this.touch(room);
    return { room, player };
  }
  findBySocket(socketId) {
    for (const room of this.rooms.values()) for (const player of room.players.values()) if (player.socketId === socketId) return { room, player };
    return null;
  }
  disconnect(socketId) {
    const found = this.findBySocket(socketId); if (!found) return null;
    found.player.connected = false; found.player.socketId = null; found.player.disconnectedAt = this.now(); this.touch(found.room); return found;
  }
  leave(socketId) {
    const found = this.findBySocket(socketId); if (!found) return null;
    found.room.players.delete(found.player.id); this.transferHost(found.room); this.touch(found.room); return found;
  }
  setReady(socketId, ready) { const {room, player} = this.requireSocket(socketId); if (room.status !== 'lobby') throw new Error('Ready status can only change in the lobby.'); player.ready = ready; this.touch(room); return room; }
  selectGame(socketId, game) {
    const {room, player} = this.requireSocket(socketId); if (!player.host) throw new Error('Only the host can select a game.');
    if (room.status !== 'lobby') throw new Error('Return to the lobby first.');
    const info = GAME_INFO[game]; if (!info) throw new Error('Unknown game.');
    if (room.players.size > info.max) throw new Error(`${info.name} supports at most ${info.max} players.`);
    room.selectedGame = game; for (const item of room.players.values()) item.ready = false; this.touch(room); return room;
  }
  startGame(socketId) {
    const {room, player} = this.requireSocket(socketId); if (!player.host) throw new Error('Only the host can start the game.');
    const info = GAME_INFO[room.selectedGame]; if (!info) throw new Error('Select a game first.');
    const players = [...room.players.values()]; if (players.length < info.min || players.length > info.max) throw new Error(`${info.name} needs ${info.min}${info.max !== info.min ? `–${info.max}` : ''} players.`);
    if (players.some((item) => !item.connected || !item.ready)) throw new Error('Every player must be connected and ready.');
    room.gameState = gameEngines[room.selectedGame].create(players.map((item) => item.id)); room.status = 'playing'; room.rematches.clear(); this.touch(room); void this.repository.updateRoom(room); return room;
  }
  async move(socketId, actionId, move) {
    const {room, player} = this.requireSocket(socketId); if (room.status !== 'playing') throw new Error('There is no active game.');
    if (player.actions.has(actionId)) throw new Error('That action was already received.');
    player.actions.add(actionId); if (player.actions.size > 100) player.actions.delete(player.actions.values().next().value);
    gameEngines[room.selectedGame].move(room.gameState, player.id, move); this.touch(room);
    if (room.gameState.status === 'complete') {
      room.status = 'complete'; const winnerIds = room.gameState.winnerIds || (room.gameState.winnerId ? [room.gameState.winnerId] : []);
      for (const winnerId of winnerIds) room.players.get(winnerId).score += 1;
      const winnerNames = winnerIds.map((winnerId) => room.players.get(winnerId)?.name).filter(Boolean);
      await this.repository.recordMatch(room, { winnerNames, draw: Boolean(room.gameState.draw), completedAt: new Date(this.now()).toISOString() }); await this.repository.updateRoom(room);
    }
    return room;
  }
  rematch(socketId) {
    const {room, player} = this.requireSocket(socketId); if (room.status !== 'complete') throw new Error('Finish the current game first.');
    room.rematches.add(player.id); const connected = [...room.players.values()].filter((item) => item.connected);
    if (connected.every((item) => room.rematches.has(item.id))) { room.gameState = gameEngines[room.selectedGame].create([...room.players.keys()]); room.status = 'playing'; room.rematches.clear(); }
    this.touch(room); return room;
  }
  returnLobby(socketId) { const {room, player} = this.requireSocket(socketId); if (!player.host) throw new Error('Only the host can return everyone to the lobby.'); room.status = 'lobby'; room.gameState = null; room.rematches.clear(); for (const item of room.players.values()) item.ready = false; this.touch(room); void this.repository.updateRoom(room); return room; }
  cleanup() {
    for (const [roomCode, room] of this.rooms) {
      for (const [playerId, player] of room.players) if (!player.connected && this.now() - player.disconnectedAt > this.reconnectGraceMs) room.players.delete(playerId);
      this.transferHost(room);
      if (!room.players.size || this.now() - room.lastActiveAt > this.roomExpiryMs) this.rooms.delete(roomCode);
    }
  }
  publicRoom(room, selfId, origin = '') {
    const engine = room.selectedGame && gameEngines[room.selectedGame];
    return { code: room.code, status: room.status, selectedGame: room.selectedGame, selfId, invitationUrl: `${origin}/join/${room.code}`, players: [...room.players.values()].map(({id,name,connected,ready,host,score}) => ({id,name,connected,ready,host,score})), gameState: room.gameState && engine.publicState(room.gameState), rematchIds: [...room.rematches] };
  }
  requireRoom(roomCode) { const room = this.rooms.get(roomCode); if (!room) throw new Error('Room not found. Check the code and try again.'); return room; }
  requireSocket(socketId) { const found = this.findBySocket(socketId); if (!found) throw new Error('Join a room first.'); return found; }
  transferHost(room) { if ([...room.players.values()].some((player) => player.host && player.connected)) return; for (const player of room.players.values()) player.host = false; const next = [...room.players.values()].find((player) => player.connected); if (next) next.host = true; }
  touch(room) { room.lastActiveAt = this.now(); }
}
