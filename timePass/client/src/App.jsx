import { useCallback, useEffect, useState } from 'react';
import { EVENTS } from '@timepass/shared';
import { socket, request } from './socket.js';
import { Header } from './components/Header.jsx';
import { Home } from './components/Home.jsx';
import { Lobby } from './components/Lobby.jsx';
import { GameRoom } from './components/GameRoom.jsx';
import { RoomProblem } from './components/RoomProblem.jsx';
import { appPath, relativeAppPath } from './basePath.js';

const savedSession = () => { try { return JSON.parse(localStorage.getItem('timepass.session')); } catch { return null; } };
const joinCode = () => relativeAppPath()?.match(/^\/join\/([A-Za-z2-9]{5})\/?$/)?.[1]?.toUpperCase() || '';
const validRoute = () => relativeAppPath() === '/' || Boolean(joinCode());

export function App() {
  const [room,setRoom]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[connected,setConnected]=useState(socket.connected);
  const run=useCallback(async(action)=>{setBusy(true);setError('');try{return await action();}catch(e){setError(e.message);throw e;}finally{setBusy(false);}},[]);
  useEffect(()=>{
    const onRoom=(next)=>{setRoom(next);setError('');}; const onConnect=async()=>{setConnected(true);const saved=savedSession();if(saved){try{await request(EVENTS.RECONNECT,saved);}catch(e){localStorage.removeItem('timepass.session');setError(e.message);setRoom(null);}}};
    const onDisconnect=()=>setConnected(false); const onError=({error:message})=>setError(message);
    socket.on(EVENTS.ROOM_STATE,onRoom);socket.on(EVENTS.ROOM_ERROR,onError);socket.on('connect',onConnect);socket.on('disconnect',onDisconnect);socket.connect();
    return()=>{socket.off(EVENTS.ROOM_STATE,onRoom);socket.off(EVENTS.ROOM_ERROR,onError);socket.off('connect',onConnect);socket.off('disconnect',onDisconnect);socket.disconnect();};
  },[]);
  const enter=async(event,payload)=>run(async()=>{const response=await request(event,payload);localStorage.setItem('timepass.session',JSON.stringify({code:response.code,token:response.token}));history.replaceState({},'',appPath(`/join/${response.code}`));});
  const leave=async()=>{try{await request(EVENTS.LEAVE_ROOM);}catch{/* already gone */}localStorage.removeItem('timepass.session');setRoom(null);history.replaceState({},'',appPath());};
  const emit=(event,payload={})=>run(()=>request(event,payload)).catch(()=>{});
  if(!validRoute())return <><Header/><main className="not-found"><span>🪁</span><h1>That page wandered off.</h1><p>Let’s get you back to the games.</p><a className="primary" href={appPath()}>Back home</a></main></>;
  if(!room && /room (?:not found|is full)/i.test(error)) return <><Header/><RoomProblem full={/full/i.test(error)} onBack={()=>{setError('');history.replaceState({},'',appPath());}}/></>;
  return <><Header room={room} onLeave={leave}/>{!connected&&<div className="connection-banner">Reconnecting… your spot is saved.</div>}{error&&room&&<div className="toast" role="alert">{error}<button onClick={()=>setError('')}>×</button></div>}
    {!room?<Home initialCode={joinCode()} error={error} busy={busy} onCreate={(displayName)=>enter(EVENTS.CREATE_ROOM,{displayName}).catch(()=>{})} onJoin={(displayName,code)=>enter(EVENTS.JOIN_ROOM,{displayName,code}).catch(()=>{})}/>:
    room.status==='lobby'?<Lobby room={room} onSelect={(game)=>emit(EVENTS.SELECT_GAME,{game})} onReady={(ready)=>emit(EVENTS.PLAYER_READY,{ready})} onStart={()=>emit(EVENTS.START_GAME)}/>:
    <GameRoom room={room} onMove={(move)=>emit(EVENTS.SUBMIT_MOVE,{actionId:crypto.randomUUID(),move})} onRematch={()=>emit(EVENTS.REMATCH)} onLobby={()=>emit(EVENTS.RETURN_LOBBY)}/>}</>;
}
