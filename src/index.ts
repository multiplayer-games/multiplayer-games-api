import { Server } from "socket.io";
import { shuffle } from "./utils";

const players: any[] = [];
const rooms: any = {};

const io = new Server({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

io.on("connection", (socket) => {
  console.log("connected...", socket.id);

  socket.on("login", ({ name }) => {
    console.log(`login [${socket.id}]: ${name}`);
    players.push({ name, id: socket.id, socket });
    socket.emit("logged");
  });

  socket.on("create-room", () => {
    console.log(`create-room [${socket.id}]`);
    rooms[socket.id] = {
      id: socket.id,
      players: [
        {
          name: players.find(x => x.id === socket.id).name,
          cards: [],
          isTurn: true,
          cardCount: 0,
          lastMove: undefined,
          lastMoveCards: [],
        }
      ],
      cards: [],
      isStarted: false,
      cardValue: "A",
      cardValueSelectable: true,
      cardsOnTheGround: [],
    };
    notifyPlayers(rooms[socket.id]);
  });

  socket.on("join-room", ({ id }) => {
    console.log(`join-room [${socket.id}]: ${id}`);
    const game = rooms[id];
    game.players.push({
      name: players.find(x => x.id === socket.id).name,
      cards: [],
      isTurn: false,
      cardCount: 0,
      lastMove: undefined,
      lastMoveCards: [],
    });
    notifyPlayers(game);
  });

  socket.on("start", () => {
    console.log(`start [${socket.id}]`);
    const game = rooms[socket.id]
    game.isStarted = true;

    const cards = shuffle(getAllCards());
    const startCount = Math.floor(cards.length / game.players.length);
    const lastCardIndex = startCount * game.players.length;

    for (let i = 1; i <= game.players.length; i++) {
      const player = game.players[i - 1];

      for (let j = 0; j < startCount; j++) {
        player.cards.push(cards[i * j]);
      }

      player.cardCount = player.cards.length;
    }

    for (let i = lastCardIndex; i < cards.length; i++) {
      game.cardsOnTheGround.push(cards[i]);
    }

    notifyPlayers(game);
  });

  socket.on("play", ({ id, type, cardValue, selectedCards }) => {
    console.log(`play [${socket.id}]: ${type} ${cardValue} ${JSON.stringify(selectedCards)}`);

    const game = rooms[id];
    const playerData = findNextPlayer(game.players);

    switch (type) {
      case "BLUFF":
        playerData.currentPlayer.lastMove = "BLUFF";

        if (isPlayerPlayedCorrect(game.cardValue, playerData.lastMovedPlayer)) {
          playerData.currentPlayer.isTurn = false;
          playerData.currentPlayer.cards = [
            ...playerData.currentPlayer.cards,
            ...game.cardsOnTheGround,
          ];
          playerData.currentPlayer.cardCount = playerData.currentPlayer.cards.length;

          playerData.lastMovedPlayer.isTurn = true;
        } else {
          playerData.currentPlayer.isTurn = true;

          playerData.lastMovedPlayer.isTurn = false;
          playerData.lastMovedPlayer.cards = [
            ...playerData.lastMovedPlayer.cards,
            ...game.cardsOnTheGround,
          ];
          playerData.lastMovedPlayer.cardCount = playerData.lastMovedPlayer.cards.length;
        }

        game.cardsOnTheGround = [];

        break;
      case "PASS":
        playerData.currentPlayer.lastMove = "PASS";
        playerData.currentPlayer.isTurn = false;

        playerData.nextPlayer.isTurn = true;

        break;
      case "PLAY":
        if (!playerData.lastMovedPlayer) {
          game.cardValue = cardValue;
        }

        game.cardsOnTheGround = [...game.cardsOnTheGround, ...selectedCards];

        playerData.currentPlayer.lastMove = selectedCards.length;
        playerData.currentPlayer.lastMoveCards = selectedCards;
        playerData.currentPlayer.cards = playerData.currentPlayer.cards.filter((x: any) => !selectedCards.some((y: any) => y.value === x.value));
        playerData.currentPlayer.cardCount = playerData.currentPlayer.cards.length;
        playerData.currentPlayer.isTurn = false;

        playerData.nextPlayer.isTurn = true;

        break;
    }

    notifyPlayers(game);
  });
});

io.listen(3001);

function findNextPlayer(players: any) {
  const currentPlayer = players.find((x: any) => x.isTurn);
  const currentPlayerIndex = players.findIndex((x: any) => x === currentPlayer);
  let nextPlayerIndex = currentPlayerIndex + 1;

  if (nextPlayerIndex === players.length) {
    nextPlayerIndex = 0;
  }

  const nextPlayer = players[nextPlayerIndex];

  return {
    currentPlayer,
    currentPlayerIndex,
    nextPlayer,
    nextPlayerIndex,
    lastMovedPlayer: findLastMovedPlayer(players, currentPlayerIndex),
  };
}

function findLastMovedPlayer(players: any, currentPlayerIndex: any) {
  for (let i = 1; i <= players.length; i++) {
    const index = (players.length + currentPlayerIndex - 1) % players.length;

    if (!isNaN(players[index].lastMove)) {
      return players[index];
    }
  }

  return null;
}

function isPlayerPlayedCorrect(correctValue: any, player: any) {
  for (let i = 0; i < player.lastMoveCards.length; i++) {
    if (player.lastMoveCards[i].value !== correctValue) {
      return false;
    }
  }

  return true;
}

function notifyPlayers(game: any) {
  for (let i = 0; i < game.players.length; i++) {
    const p = players.find(x => x.name === game.players[i].name);
    game.players.forEach((x: any) => x.isYou = x.name === p.name);
    io.to(p.id).emit("notify", game);
  }
}

const cardTypes = ["Spade", "Club", "Hearth", "Diamond"];
const cardValues = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getAllCards() {
  const cards = [];
  
  for (let i = 0; i < cardTypes.length; i++) {
    const cardType = cardTypes[i];

    for (let j = 0; j < cardValues.length; j++) {
      const cardValue = cardValues[j];

      cards.push({
        name: `${cardType} ${cardValue}`,
        type: cardType,
        value: cardValue,
      });
    }
  }

  return cards;
}

