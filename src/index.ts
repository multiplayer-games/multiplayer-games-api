import { Server } from "socket.io";
import { ORIGIN, PORT } from "./constants";
import { addNewPlayerToGame, createNewGame, startGame } from "./game";
import {
  notifyCreatedRoom,
  notifyInGame,
  notifyJoinedRoom,
  notifyLoggedIn,
  notifyNonLoggedIn,
} from "./notify";
import { playBluff, playCards, playPass } from "./player";
import {
  Game,
  RoomObject,
  JoinRoomRequest,
  LoginRequest,
  PlayRequest,
  User,
  Emits,
} from "./types";

const users: User[] = [];
const rooms: RoomObject = {};

const io = new Server({
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("connected...", socket.id);
  notifyNonLoggedIn(io, socket.id);

  socket.on(Emits.Login, ({ name }: LoginRequest) => {
    console.log(`login [${socket.id}]: Name: ${name}`);

    const isUserExists = users.some((x) => x.id === socket.id);

    if (!isUserExists) {
      users.push({
        socket,
        id: socket.id,
        name,
        status: "LoggedIn",
      });
    }

    const user = users.find((x) => x.id === socket.id);

    notifyLoggedIn(io, socket.id, user!);
  });

  socket.on(Emits.CreateRoom, () => {
    console.log(`create-room [${socket.id}]`);

    // TODO: Check if room exists
    // TODO: But what if game fnished?

    const userName = users.find((x) => x.id === socket.id)!.name;

    rooms[socket.id] = createNewGame({
      roomId: socket.id,
      userId: socket.id,
      userName,
    });

    notifyCreatedRoom(io, rooms[socket.id]);
  });

  socket.on(Emits.JoinRoom, ({ roomId }: JoinRoomRequest) => {
    console.log(`join-room [${socket.id}]: Room Id: ${roomId}`);

    const game = rooms[roomId];

    if (!game) return;

    const userName = users.find((x) => x.id === socket.id)!.name;

    addNewPlayerToGame(game, { userId: socket.id, userName });

    notifyJoinedRoom(io, rooms[roomId]);
  });

  socket.on(Emits.StartGame, () => {
    console.log(`start [${socket.id}]`);

    const game = rooms[socket.id];

    if (!game) return;

    startGame(game);

    notifyInGame(io, game);
  });

  socket.on(Emits.Play, (data: PlayRequest) => {
    console.log(`play [${socket.id}]: ${JSON.stringify(data)}`);

    const game = rooms[data.roomId];

    if (!game || !isYourTurn(game, socket.id)) return;

    switch (data.type) {
      case "BLUFF":
        playBluff(game);

        break;
      case "PASS":
        playPass(game);

        break;
      case "CARDS":
        playCards(game, data.cardValue, data.selectedCards);

        break;
    }

    notifyInGame(io, game);
  });
});

io.listen(PORT);

function isYourTurn(game: Game, playerId: string) {
  return game.players.find((x) => x.isTurn)?.id === playerId;
}
