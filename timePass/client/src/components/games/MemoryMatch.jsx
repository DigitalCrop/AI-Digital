export function MemoryMatch({ state, selfId, move }) {
  const mine = state.players[state.turn] === selfId;
  return <div className="memory-board" role="grid">{state.cards.map((card)=><button role="gridcell" aria-label={card.symbol?`Card ${card.id+1}: ${card.symbol}`:`Face-down card ${card.id+1}`} className={card.symbol?'flipped':''} disabled={!mine||card.matched||state.flipped.length>=2} key={card.id} onClick={()=>move({card:card.id})}>{card.symbol||'?'}</button>)}</div>;
}
