function boardCells() { const rows=[]; for(let row=9;row>=0;row-=1){const values=Array.from({length:10},(_,i)=>row*10+i+1); if(row%2) values.reverse(); rows.push(...values);} return rows; }
const jumpType=(n,jumps)=>jumps[n]?(jumps[n]>n?'ladder':'snake'):'';
export function SnakesAndLadders({ state, selfId, players, move }) {
  const mine=state.players[state.turn]===selfId;
  return <div className="snakes-layout"><div className="snakes-board">{boardCells().map((n)=><div key={n} className={`square ${jumpType(n,state.jumps)}`}><small>{n}</small><div>{Object.entries(state.positions).filter(([,pos])=>pos===n).map(([id])=><span key={id} title={players.find(p=>p.id===id)?.name}>●</span>)}</div>{state.jumps[n]&&<b>{state.jumps[n]>n?'↗':'↘'}{state.jumps[n]}</b>}</div>)}</div><div className="dice-panel"><div className="die">{state.lastRoll?.roll||'?'}</div><button className="primary" disabled={!mine} onClick={()=>move({type:'roll'})}>Roll the die</button><small>Roll a 6 to play again</small></div></div>;
}
