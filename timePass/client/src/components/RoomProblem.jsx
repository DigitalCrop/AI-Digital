export function RoomProblem({ full, onBack }) {
  return <main className="not-found room-problem"><span>{full ? '🧺' : '🔎'}</span><h1>{full ? 'This room is full.' : 'We couldn’t find that room.'}</h1><p>{full ? 'Four friends are already playing here.' : 'Check the five-character code or ask your friend for a fresh link.'}</p><button className="primary" onClick={onBack}>Try another room</button></main>;
}
