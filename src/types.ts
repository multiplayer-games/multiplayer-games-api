import { Socket } from "socket.io";

// API

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

// GAME

export interface Game {
  roomId: string;
  players: Player[];
  isStarted: boolean;
  cardValue: CardValue;
  setCardValue: boolean;
  cards: Card[];
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isTurn: boolean;
  isLastPlayed: boolean;
  lastMove: "NONE" | "PASS" | "BLUFF" | number;
  lastMovedCards: Card[];
}

export type CardName = `${CardType} ${CardValue}`;
export type CardType = "Hearth" | "Club" | "Spade" | "Diamond";
export type CardValue = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  name: CardName;
  type: CardType;
  value: CardValue;
}

export interface User {
  socket: Socket;
  id: string;
  name: string;
};

export type GameObject = {
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
