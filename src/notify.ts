import { Server } from "socket.io";
import {
  Events,
  Game,
  ResponseInGameUser,
  ResponseInRoomUser,
  ResponseLoggedInUser,
  ResponseNonAuthUser,
  User,
} from "./types";

export function notifyNonLoggedIn(server: Server, socketId: string) {
  const response: ResponseNonAuthUser = {
    status: "NonAuth",
  };

  server.to(socketId).emit(Events.Notify, response);
}

export function notifyLoggedIn(server: Server, socketId: string, user: User) {
  const response: ResponseLoggedInUser = {
    username: user!.name,
    status: "LoggedIn",
  };

  server.to(socketId).emit(Events.Notify, response);
}

export function notifyCreatedRoom(server: Server, room: Game) {
  notifyJoinedRoom(server, room);
}

export function notifyJoinedRoom(server: Server, room: Game) {
  room.players.forEach((p) => {
    const response: ResponseInRoomUser = {
      username: p.name,
      status: "InRoom",
      roomId: room.id,
      users: room.players.map((x) => ({ id: x.id, name: x.name })),
    };

    server.to(p.id).emit(Events.Notify, response);
  });
}

export function notifyInGame(server: Server, game: Game) {
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];

    game.players.forEach((p: any) => {
      p.isYou = p.name === player.name;
      p.cardCount = p.cards.length;
    });

    const response: ResponseInGameUser = {
      status: "InGame",
      username: player.name,
      game,
    };

    server.to(player.id).emit(Events.Notify, response);
  }
}
