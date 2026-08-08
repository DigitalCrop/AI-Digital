import { GAMES } from '@timepass/shared';
import { ticTacToe } from './ticTacToe.js';
import { connectFour } from './connectFour.js';
import { snakesAndLadders } from './snakesAndLadders.js';
import { memoryMatch } from './memoryMatch.js';
import { pakidaKavidi } from './pakidaKavidi.js';

export const gameEngines = Object.freeze({
  [GAMES.TIC_TAC_TOE]: ticTacToe,
  [GAMES.CONNECT_FOUR]: connectFour,
  [GAMES.SNAKES]: snakesAndLadders,
  [GAMES.MEMORY]: memoryMatch,
  [GAMES.KAVIDI]: pakidaKavidi
});
