import { io } from 'socket.io-client';
export const socket = io({ autoConnect: false, transports: ['websocket', 'polling'] });
export function request(event, payload = {}) {
  return new Promise((resolve, reject) => socket.timeout(7000).emit(event, payload, (timeout, response) => {
    if (timeout) reject(new Error('The server did not respond. Try again.'));
    else if (!response?.ok) reject(new Error(response?.error || 'Something went wrong.'));
    else resolve(response);
  }));
}
