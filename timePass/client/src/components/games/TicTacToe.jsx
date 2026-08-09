export function TicTacToe({ state, selfId, move }) {
  const mine = state.players[state.turn] === selfId;
  return <div className="ttt board" role="grid" aria-label="Tic-Tac-Toe board">{state.board.map((cell,i)=><button role="gridcell" aria-label={`Square ${i+1}${cell?`, ${cell}`:''}`} key={i} disabled={!mine||cell||state.status!=='playing'} onClick={()=>move({cell:i})}>{cell}</button>)}</div>;
}
