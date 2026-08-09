import { useState } from 'react';

export function Home({ initialCode = '', onCreate, onJoin, error, busy }) {
  const [name, setName] = useState(''); const [code, setCode] = useState(initialCode);
  const submit = (action) => (event) => { event.preventDefault(); action(name, code); };
  return <main className="home"><section className="hero"><div className="hero-copy"><span className="eyebrow">No sign-up. Just play.</span><h1>Make a room.<br/><em>Make some noise.</em></h1><p>Five quick games for 2–4 friends, together in real time. Pick a name and share one tiny code.</p><div className="game-doodles" aria-label="Available games"><span>🐍</span><span>⭕</span><span>🟡</span><span>🧠</span><span>🐚</span></div></div>
  <div className="join-card"><h2>Let’s play!</h2><label htmlFor="name">Your display name</label><input id="name" maxLength="20" autoComplete="nickname" value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. CoconutKing" />
  <button className="primary wide" disabled={busy} onClick={submit((n)=>onCreate(n))}>Create a private room <span>→</span></button><div className="or"><span>or join a friend</span></div>
  <form onSubmit={submit((n,c)=>onJoin(n,c))}><label htmlFor="code">Room code</label><div className="code-row"><input id="code" className="code-input" maxLength="5" value={code} onChange={(e)=>setCode(e.target.value.toUpperCase())} placeholder="ABCDE"/><button disabled={busy} type="submit">Join</button></div></form>
  {error && <p className="form-error" role="alert">{error}</p>}<small>🔒 Temporary rooms · no account needed</small></div></section>
  <section className="how"><h2>Play in three tiny steps</h2><div><article><b>1</b><h3>Start a room</h3><p>Choose a nickname. That’s all we need.</p></article><article><b>2</b><h3>Bring your people</h3><p>Share the five-character code or invite link.</p></article><article><b>3</b><h3>Pick & play</h3><p>Ready up and settle the score.</p></article></div></section></main>;
}
