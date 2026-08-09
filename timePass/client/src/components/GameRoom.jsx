import { GAME_INFO, GAMES } from '@timepass/shared';
import { PlayerList } from './Lobby.jsx';
import { TicTacToe } from './games/TicTacToe.jsx';
import { ConnectFour } from './games/ConnectFour.jsx';
import { MemoryMatch } from './games/MemoryMatch.jsx';
import { SnakesAndLadders } from './games/SnakesAndLadders.jsx';
import { PakidaKavidi } from './games/PakidaKavidi.jsx';

const boards={ [GAMES.TIC_TAC_TOE]:TicTacToe,[GAMES.CONNECT_FOUR]:ConnectFour,[GAMES.MEMORY]:MemoryMatch,[GAMES.SNAKES]:SnakesAndLadders,[GAMES.KAVIDI]:PakidaKavidi };
export function GameRoom({room,onMove,onRematch,onLobby}){
  const state=room.gameState, Board=boards[room.selectedGame], current=room.players.find(p=>p.id===state?.players[state.turn]), self=room.players.find(p=>p.id===room.selfId);
  const winners=state?.winnerIds|| (state?.winnerId?[state.winnerId]:[]); const winnerNames=winners.map(id=>room.players.find(p=>p.id===id)?.name).filter(Boolean);
  return <main className="room-layout game-layout"><section className="game-main"><div className="game-heading"><div><span className="eyebrow">{GAME_INFO[room.selectedGame].icon} {GAME_INFO[room.selectedGame].name}</span><h1>{room.status==='playing'?(current?.id===room.selfId?'Your turn!':`${current?.name}’s turn`):'Game over!'}</h1></div>{room.status==='playing'&&<span className="turn-pill">{current?.id===room.selfId?'You’re up':'Watching'}</span>}</div><div className="board-shell"><Board state={state} selfId={room.selfId} players={room.players} move={onMove}/></div></section><PlayerList room={room}/>
  {room.status==='complete'&&<div className="modal-backdrop"><section className="result-dialog" role="dialog" aria-modal="true" aria-labelledby="result-title"><span className="result-icon">{state.draw?'🤝':'🏆'}</span><h2 id="result-title">{state.draw?'It’s a draw!':`${winnerNames.join(' & ')} won!`}</h2><p>{state.draw?'That was close. One more?':'A glorious little victory.'}</p><button className="primary wide" onClick={onRematch}>{room.rematchIds.includes(room.selfId)?'Rematch requested ✓':'Request rematch'}</button>{self?.host&&<button className="secondary wide" onClick={onLobby}>Choose another game</button>}</section></div>}</main>;
}
