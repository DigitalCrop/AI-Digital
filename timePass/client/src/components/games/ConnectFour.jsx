export function ConnectFour({ state, selfId, move }) {
  const mine = state.players[state.turn] === selfId;
  return <div className="connect-wrap"><div className="column-buttons" aria-label="Choose a column">{Array.from({length:7},(_,col)=><button key={col} disabled={!mine||state.board[0][col]} onClick={()=>move({column:col})} aria-label={`Drop in column ${col+1}`}>↓</button>)}</div><div className="connect-board">{state.board.flatMap((row,r)=>row.map((cell,c)=><span key={`${r}-${c}`} className={cell?`disc ${cell}`:'disc'}></span>))}</div></div>;
}
