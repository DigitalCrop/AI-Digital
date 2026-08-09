import { z } from 'zod';

export const EVENTS = Object.freeze({
  CREATE_ROOM: 'room:create', JOIN_ROOM: 'room:join', RECONNECT: 'room:reconnect', LEAVE_ROOM: 'room:leave',
  ROOM_STATE: 'room:state', ROOM_ERROR: 'room:error', PLAYER_READY: 'player:ready', SELECT_GAME: 'game:select',
  START_GAME: 'game:start', SUBMIT_MOVE: 'game:move', GAME_COMPLETE: 'game:complete', REMATCH: 'game:rematch',
  RETURN_LOBBY: 'game:return-lobby', CONNECTION_CHANGE: 'player:connection'
});

export const GAMES = Object.freeze({
  SNAKES: 'snakes-and-ladders', TIC_TAC_TOE: 'tic-tac-toe', CONNECT_FOUR: 'connect-four',
  MEMORY: 'memory-match', KAVIDI: 'pakida-kavidi'
});

export const GAME_INFO = Object.freeze({
  [GAMES.SNAKES]: { name: 'Snakes & Ladders', icon: '🐍', min: 2, max: 4, blurb: 'Race to 100 and ride the ladders.' },
  [GAMES.TIC_TAC_TOE]: { name: 'Tic-Tac-Toe', icon: '⭕', min: 2, max: 2, blurb: 'Three in a row wins.' },
  [GAMES.CONNECT_FOUR]: { name: 'Connect Four', icon: '🟡', min: 2, max: 2, blurb: 'Drop four discs in a line.' },
  [GAMES.MEMORY]: { name: 'Memory Match', icon: '🧠', min: 2, max: 4, blurb: 'Find the most matching pairs.' },
  [GAMES.KAVIDI]: { name: 'Pakida / Kavidi', icon: '🐚', min: 2, max: 4, blurb: 'A Kerala-inspired cowrie race.' }
});

export const displayNameSchema = z.string().trim().min(1, 'Enter a display name.').max(20, 'Use 20 characters or fewer.')
  .transform((value) => [...value].filter((char) => char >= ' ' && char !== '<' && char !== '>').join('').replace(/\s+/g, ' ').trim())
  .refine((value) => value.length > 0, 'Enter a valid display name.');
export const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z2-9]{5}$/, 'Room codes have five characters.');
export const createRoomSchema = z.object({ displayName: displayNameSchema });
export const joinRoomSchema = z.object({ displayName: displayNameSchema, code: roomCodeSchema });
export const tokenSchema = z.string().min(32).max(256);
export const readySchema = z.object({ ready: z.boolean() });
export const gameSchema = z.object({ game: z.enum(Object.values(GAMES)) });
export const moveSchema = z.object({ actionId: z.string().uuid(), move: z.record(z.string(), z.unknown()) });
export function ackError(error) { return { ok: false, error: error instanceof Error ? error.message : String(error) }; }
