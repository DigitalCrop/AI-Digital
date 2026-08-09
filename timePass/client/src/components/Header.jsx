import { appPath } from '../basePath.js';

export function Header({ room, onLeave }) {
  return <header className="site-header"><a className="brand" href={appPath()} aria-label="timePass home"><span>time</span>Pass <i>●</i></a>{room && <div className="header-room"><span>Room <strong>{room.code}</strong></span><button className="link-button" onClick={onLeave}>Leave</button></div>}</header>;
}
