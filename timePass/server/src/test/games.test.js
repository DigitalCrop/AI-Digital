import { describe, expect, it } from 'vitest';
import { ticTacToe } from '../games/ticTacToe.js';
import { connectFour } from '../games/connectFour.js';
import { snakesAndLadders } from '../games/snakesAndLadders.js';
import { memoryMatch } from '../games/memoryMatch.js';
import { pakidaKavidi } from '../games/pakidaKavidi.js';

const players=['p1','p2'];
describe('tic-tac-toe',()=>{it('wins and rejects out-of-turn moves',()=>{const s=ticTacToe.create(players);ticTacToe.move(s,'p1',{cell:0});expect(()=>ticTacToe.move(s,'p1',{cell:1})).toThrow(/turn/);ticTacToe.move(s,'p2',{cell:3});ticTacToe.move(s,'p1',{cell:1});ticTacToe.move(s,'p2',{cell:4});ticTacToe.move(s,'p1',{cell:2});expect(s.winnerId).toBe('p1');});});
describe('connect four',()=>{it('detects a vertical win',()=>{const s=connectFour.create(players);for(let i=0;i<3;i++){connectFour.move(s,'p1',{column:0});connectFour.move(s,'p2',{column:1});}connectFour.move(s,'p1',{column:0});expect(s.winnerId).toBe('p1');});});
describe('snakes and ladders',()=>{it('rolls on the server and climbs a ladder',()=>{const s=snakesAndLadders.create(players);s.positions.p1=3;snakesAndLadders.move(s,'p1',{type:'roll'},()=>0);expect(s.positions.p1).toBe(14);});});
describe('memory match',()=>{it('scores a pair and hides secret cards',()=>{const s=memoryMatch.create(players,()=>0);const target=s.cards[0].symbol;const second=s.cards.findIndex((c,i)=>i>0&&c.symbol===target);memoryMatch.move(s,'p1',{card:0});memoryMatch.move(s,'p1',{card:second});expect(s.scores.p1).toBe(1);expect(memoryMatch.publicState(s).cards.find(c=>!c.matched).symbol).toBeNull();});});
describe('pakida/kavidi',()=>{it('enters a piece and grants a bonus turn on four open shells',()=>{const s=pakidaKavidi.create(players);pakidaKavidi.move(s,'p1',{type:'throw'},()=>0.9);expect(s.roll.value).toBe(4);pakidaKavidi.move(s,'p1',{type:'movePiece',piece:0});expect(s.pieces.p1[0]).toBe(0);expect(s.players[s.turn]).toBe('p1');});it('rejects moving before throwing',()=>{const s=pakidaKavidi.create(players);expect(()=>pakidaKavidi.move(s,'p1',{type:'movePiece',piece:0})).toThrow(/Throw/);});});
