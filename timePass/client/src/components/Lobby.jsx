import { GAME_INFO } from '@timepass/shared';
import { appPath } from '../basePath.js';

export function PlayerList({ room }) { return <aside className="players-panel"><h2>Players <span>{room.players.length}/4</span></h2><ul>{room.players.map((p)=><li key={p.id}><span className={`avatar avatar-${p.id.charCodeAt(0)%4}`}>{p.name[0].toUpperCase()}</span><span className="player-name">{p.name}{p.id===room.selfId && <small>you</small>}</span>{p.host && <span title="Host">👑</span>}<span className={`status-dot ${p.connected?'online':'offline'}`} title={p.connected?'Connected':'Disconnected'}></span><span className={p.ready?'ready':'waiting'}>{p.ready?'Ready':'Waiting'}</span></li>)}</ul></aside>; }

export function Lobby({ room, onSelect, onReady, onStart }) {
  const self = room.players.find((p)=>p.id===room.selfId); const selected = GAME_INFO[room.selectedGame];
  const canStart = self?.host && selected && room.players.length >= selected.min && room.players.length <= selected.max && room.players.every((p)=>p.ready&&p.connected);
  const copy = async () => { await navigator.clipboard.writeText(`${window.location.origin}${appPath(`/join/${room.code}`)}`); };
  return <main className="room-layout"><section className="lobby-main"><div className="room-hero"><div><span className="eyebrow">Your private playground</span><h1>Room <strong>{room.code}</strong></h1><p>Share this code with your friends.</p></div><button className="copy-button" onClick={copy}>Copy invite link</button></div>
  <h2 className="section-title">Choose your game</h2><div className="game-grid">{Object.entries(GAME_INFO).map(([key,game])=><button key={key} className={`game-card ${room.selectedGame===key?'selected':''}`} disabled={!self?.host || room.players.length>game.max} onClick={()=>onSelect(key)}><span className="game-icon">{game.icon}</span><span><strong>{game.name}</strong><small>{game.blurb}</small><i>{game.min}–{game.max} players</i></span>{room.selectedGame===key&&<b className="check">✓</b>}</button>)}</div>
  <div className="ready-bar"><div><strong>{selected ? `${selected.icon} ${selected.name}` : 'Pick a game to begin'}</strong><small>{self?.host?'You’re the host':'Waiting for the host to choose'}</small></div><button className={self?.ready?'secondary':'primary'} onClick={()=>onReady(!self?.ready)} disabled={!room.selectedGame}>{self?.ready?'Not ready':'I’m ready!'}</button>{self?.host&&<button className="start-button" onClick={onStart} disabled={!canStart}>Start game →</button>}</div></section><PlayerList room={room}/></main>;
}
