import { getAllCards } from "./card";
import { Game } from "./types";
import { shuffle } from "./utils";

export interface CreateNewGameOptions {
  roomId: string;
  userId: string;
  userName: string;
}

export function createNewGame(options: CreateNewGameOptions) {
  const game: Game = {
    roomId: options.roomId,
    players: [
      {
        id: options.userId,
        name: options.userName,
        cards: [],
        isTurn: true,
        isLastPlayed: false,
        lastMove: "NONE",
        lastMovedCards: [],
      }
    ],
    isStarted: false,
    cardValue: "A",
    setCardValue: true,
    cards: [],
  };

  return game;
}

export interface AddNewPlayerToGameOptions {
  userId: string;
  userName: string;
}

export function addNewPlayerToGame(game: Game, options: AddNewPlayerToGameOptions) {
  game.players.push({
    id: options.userId,
    name: options.userName,
    cards: [],
    isTurn: false,
    isLastPlayed: false,
    lastMove: "NONE",
    lastMovedCards: [],
  });
}

export function startGame(game: Game) {
  game.isStarted = true;

  const cards = shuffle(getAllCards());
  const startCount = Math.floor(cards.length / game.players.length);
  const groundCardIndex = startCount * game.players.length;

  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];

    for (let j = 0; j < startCount; j++) {
      player.cards.push(cards[i * startCount + j]);
    }
  }

  for (let i = groundCardIndex; i < cards.length; i++) {
    game.cards.push(cards[i]);
  }
}
