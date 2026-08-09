import { describe, expect, it } from 'vitest';
import { RoomManager } from '../services/roomManager.js';

const repo={createRoom:async()=>{},addPlayer:async()=>{},updateRoom:async()=>{},recordMatch:async()=>{}};
describe('room manager',()=>{
  it('creates rooms, joins players, and blocks duplicate names',async()=>{const m=new RoomManager({repository:repo});const a=await m.createRoom('Ada','s1');const b=await m.joinRoom(a.room.code,'Ben','s2');expect(b.room.players.size).toBe(2);await expect(m.joinRoom(a.room.code,'ada','s3')).rejects.toThrow(/display name/);});
  it('reconnects within the grace period',async()=>{let now=100;const m=new RoomManager({repository:repo,reconnectGraceMs:1000,now:()=>now});const {room,token}=await m.createRoom('Ada','s1');m.disconnect('s1');now=900;const result=m.reconnect(room.code,token,'s2');expect(result.player.connected).toBe(true);expect(result.player.socketId).toBe('s2');});
  it('transfers host after a permanent disconnect',async()=>{let now=0;const m=new RoomManager({repository:repo,reconnectGraceMs:50,now:()=>now});const {room}=await m.createRoom('Ada','s1');await m.joinRoom(room.code,'Ben','s2');m.disconnect('s1');now=60;m.cleanup();expect([...room.players.values()][0].name).toBe('Ben');expect([...room.players.values()][0].host).toBe(true);});
  it('validates turns and duplicate actions',async()=>{const m=new RoomManager({repository:repo});const {room}=await m.createRoom('Ada','s1');await m.joinRoom(room.code,'Ben','s2');m.selectGame('s1','tic-tac-toe');m.setReady('s1',true);m.setReady('s2',true);m.startGame('s1');await expect(m.move('s2',crypto.randomUUID(),{cell:0})).rejects.toThrow(/turn/);const action=crypto.randomUUID();await m.move('s1',action,{cell:0});await expect(m.move('s1',action,{cell:1})).rejects.toThrow(/already/);});
});
