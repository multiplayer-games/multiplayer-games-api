import { Server } from "socket.io";
import { ORIGIN, PORT } from "./constants";
import { addNewPlayerToGame, createNewGame, startGame } from "./game";
import { playBluff, playCards, playPass } from "./player";
import { Game, GameObject, JoinRoomRequest, LoginRequest, PlayRequest, User } from "./types";

const users: User[] = [];
const rooms: GameObject = {};

const io = new Server({
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"],
  }
});

io.on("connection", (socket) => {
  console.log("connected...", socket.id);

  socket.on("login", ({ name }: LoginRequest) => {
    console.log(`login [${socket.id}]: ${name}`);

    users.push({ socket, id: socket.id, name });

    socket.emit("logged");
  });

  socket.on("create-room", () => {
    console.log(`create-room [${socket.id}]`);

    const userName = users.find(x => x.id === socket.id)!.name;

    rooms[socket.id] = createNewGame({
      roomId: socket.id,
      userId: socket.id,
      userName,
    });

    notifyPlayers(rooms[socket.id]);
  });

  socket.on("join-room", ({ roomId }: JoinRoomRequest) => {
    console.log(`join-room [${socket.id}]: ${roomId}`);

    const game = rooms[roomId];
    const userName = users.find(x => x.id === socket.id)!.name;

    addNewPlayerToGame(game, { userId: socket.id, userName });

    notifyPlayers(game);
  });

  socket.on("start", () => {
    console.log(`start [${socket.id}]`);

    const game = rooms[socket.id]

    startGame(game);

    notifyPlayers(game);
  });

  socket.on("play", (data: PlayRequest) => {
    console.log(`play [${socket.id}]: ${JSON.stringify(data)}`);

    const game = rooms[data.roomId];

    if (!isYourTurn(game, socket.id)) return;

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

    notifyPlayers(game);
  });
});

io.listen(PORT);

function notifyPlayers(game: Game) {
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];

    game.players.forEach((p: any) => {
      p.isYou = p.name === player.name;
      p.cardCount = p.cards.length;
    });

    io.to(player.id).emit("notify", game);
  }
}

function isYourTurn(game: Game, playerId: string) {
  return game.players.find(x => x.isTurn)?.id === playerId;
}
