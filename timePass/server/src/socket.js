import { EVENTS, ackError, createRoomSchema, gameSchema, joinRoomSchema, moveSchema, readySchema, roomCodeSchema, tokenSchema } from '@timepass/shared';

const limiters = new Map();
function rateCheck(key) {
  const now = Date.now(), current = limiters.get(key) || { count: 0, reset: now + 60_000 };
  if (now > current.reset) { current.count = 0; current.reset = now + 60_000; }
  current.count += 1; limiters.set(key, current);
  if (current.count > 10) throw new Error('Too many room attempts. Wait a minute and try again.');
}
const parse = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(result.error.issues[0]?.message || 'Invalid request.');
  return result.data;
};

export function registerSocketHandlers(io, manager, clientUrl) {
  const emitRoom = (room) => {
    for (const player of room.players.values()) if (player.connected && player.socketId) io.to(player.socketId).emit(EVENTS.ROOM_STATE, manager.publicRoom(room, player.id, clientUrl));
  };
  io.on('connection', (socket) => {
    const handle = (event, fn) => socket.on(event, async (payload = {}, ack = () => {}) => {
      try { const result = await fn(payload); ack({ ok: true, ...result }); }
      catch (error) { const response = ackError(error); ack(response); socket.emit(EVENTS.ROOM_ERROR, response); }
    });
    handle(EVENTS.CREATE_ROOM, async (payload) => {
      rateCheck(`${socket.handshake.address}:create`); const {displayName} = parse(createRoomSchema, payload);
      const result = await manager.createRoom(displayName, socket.id); socket.join(result.room.code); emitRoom(result.room); return { code: result.room.code, token: result.token };
    });
    handle(EVENTS.JOIN_ROOM, async (payload) => {
      rateCheck(`${socket.handshake.address}:join`); const {displayName, code} = parse(joinRoomSchema, payload);
      const result = await manager.joinRoom(code, displayName, socket.id); socket.join(result.room.code); emitRoom(result.room); return { code, token: result.token };
    });
    handle(EVENTS.RECONNECT, async (payload) => {
      const roomCode = parse(roomCodeSchema, payload.code), sessionToken = parse(tokenSchema, payload.token);
      const result = manager.reconnect(roomCode, sessionToken, socket.id); socket.join(result.room.code); emitRoom(result.room); return { code: roomCode };
    });
    handle(EVENTS.LEAVE_ROOM, async () => { const found = manager.leave(socket.id); if (found) { socket.leave(found.room.code); emitRoom(found.room); } return {}; });
    handle(EVENTS.PLAYER_READY, async (payload) => { const {ready} = parse(readySchema, payload); const room = manager.setReady(socket.id, ready); emitRoom(room); return {}; });
    handle(EVENTS.SELECT_GAME, async (payload) => { const {game} = parse(gameSchema, payload); const room = manager.selectGame(socket.id, game); emitRoom(room); return {}; });
    handle(EVENTS.START_GAME, async () => { const room = manager.startGame(socket.id); emitRoom(room); return {}; });
    handle(EVENTS.SUBMIT_MOVE, async (payload) => { const {actionId, move} = parse(moveSchema, payload); const room = await manager.move(socket.id, actionId, move); emitRoom(room); if (room.status === 'complete') io.to(room.code).emit(EVENTS.GAME_COMPLETE); return {}; });
    handle(EVENTS.REMATCH, async () => { const room = manager.rematch(socket.id); emitRoom(room); return {}; });
    handle(EVENTS.RETURN_LOBBY, async () => { const room = manager.returnLobby(socket.id); emitRoom(room); return {}; });
    socket.on('disconnect', () => { const found = manager.disconnect(socket.id); if (found) { emitRoom(found.room); io.to(found.room.code).emit(EVENTS.CONNECTION_CHANGE, { playerId: found.player.id, connected: false }); } });
  });
  return { emitRoom };
}
