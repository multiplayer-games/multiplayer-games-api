import { CardType, CardValue } from "./types";

export const PORT = parseInt(process.env.PORT || "30001");
export const ORIGIN = [
  "https://node-js-board-games.herokuapp.com",
  "http://node-js-board-games.herokuapp.com",
  "localhost:3000",
];
export const CardTypes: CardType[] = ["Spade", "Club", "Hearth", "Diamond"];
export const CardValues: CardValue[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
