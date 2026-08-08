import { prisma } from '../db.js';

export const repository = {
  createRoom: (room) => prisma.room.create({ data: { id: room.id, code: room.code } }),
  addPlayer: (roomId, player) => prisma.player.create({ data: { id: player.id, displayName: player.name, roomId } }),
  updateRoom: (room) => prisma.room.update({ where: { id: room.id }, data: { selectedGame: room.selectedGame, status: room.status, lastActiveAt: new Date() } }),
  recordMatch: async (room, summary) => {
    await prisma.match.create({ data: { roomId: room.id, game: room.selectedGame, winnerNames: summary.winnerNames.join(', '), summary: JSON.stringify(summary) } });
    for (const player of room.players.values()) await prisma.player.update({ where: { id: player.id }, data: { score: player.score } });
  }
};
