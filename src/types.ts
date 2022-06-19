import { Socket } from "socket.io";

// Common

export type CardName = `${CardType} ${CardValue}`;
export type CardType = "Hearth" | "Club" | "Spade" | "Diamond";
export type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface InRoomUser {
  id: string;
  name: string;
}

export const Emits = {
  Login: "login",
  CreateRoom: "create-room",
  JoinRoom: "join-room",
  StartGame: "start",
  Play: "play",
}

export const Events = {
  Notify: "notify",
};

// API.Request

export interface LoginRequest {
  name: string;
}

export interface JoinRoomRequest {
  roomId: string;
}

export interface PlayBluffOrPassRequest {
  roomId: string;
  type: "BLUFF" | "PASS";
}

export interface PlayCardsRequest {
  roomId: string;
  type: "CARDS";
  cardValue: CardValue;
  selectedCards: Card[];
}

export type PlayRequest = PlayBluffOrPassRequest | PlayCardsRequest;

// API.Response

export interface ResponseNonAuthUser {
  status: "NonAuth";
}

export interface ResponseLoggedInUser {
  status: "LoggedIn";
  username: string;
}

export interface ResponseInRoomUser {
  status: "InRoom";
  username: string;
  roomId: string;
  users: InRoomUser[];
}

export interface ResponseInGameUser {
  status: "InGame";
  username: string;
  game: Game;
}

// GAME

export type GameStatus = "started" | "fnished";

export interface Game {
  id: string;
  players: Player[];
  status: GameStatus;
  cardValue: CardValue;
  cards: Card[];
  canSetCardValue: boolean;
  canPlayBluff: boolean;
  canPlayPass: boolean;
}

export type LastMove = "NONE" | "PASS" | "BLUFF" | number;

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  lastMove: LastMove;
  lastMovedCards: Card[];
  isLastPlayed: boolean;
  isTurn: boolean;
}

export interface Card {
  name: CardName;
  type: CardType;
  value: CardValue;
}

// Internal

export interface User {
  socket: Socket;
  id: string;
  name: string;
  status: 'LoggedIn' | 'CreatedRoom' | 'JoinedRoom' | 'PlayingGame';
};

export type RoomObject = {
  [roomId: string]: Game;
};

export interface GamePlayersInfo {
  lastPlayer: Player | null;
  lastPlayerIndex: number | null;
  isLastPlayerPlayedCorrect: boolean | null;
  currentPlayer: Player;
  currentPlayerIndex: number;
  nextPlayer: Player;
  nextPlayerIndex: number;
}
