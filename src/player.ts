import { isPlayedCorrect, pickCards, removeCards } from "./card";
import { Card, CardValue, Game, GamePlayersInfo } from "./types";

export function findGamePlayersInfo(game: Game): GamePlayersInfo {
  const currentPlayer = game.players.find((x) => x.isTurn)!;
  const currentPlayerIndex = game.players.findIndex((x) => x === currentPlayer);
  let nextPlayerIndex = currentPlayerIndex + 1;

  if (nextPlayerIndex === game.players.length) {
    nextPlayerIndex = 0;
  }

  const nextPlayer = game.players[nextPlayerIndex];
  const { lastPlayer, lastPlayerIndex } = findLastPlayer(game);

  return {
    lastPlayer,
    lastPlayerIndex,
    isLastPlayerPlayedCorrect: lastPlayer
      ? isPlayedCorrect(lastPlayer.lastMovedCards, game.cardValue)
      : null,
    currentPlayer,
    currentPlayerIndex,
    nextPlayer,
    nextPlayerIndex,
  };
}

function findLastPlayer(game: Game) {
  const currentPlayer = game.players.find((x) => x.isTurn)!;
  const currentPlayerIndex = game.players.findIndex((x) => x === currentPlayer);

  for (let i = 1; i <= game.players.length; i++) {
    const index =
      (game.players.length + currentPlayerIndex - i) % game.players.length;

    if (typeof game.players[index].lastMove === "number") {
      return {
        lastPlayer: game.players[index],
        lastPlayerIndex: index,
      };
    }
  }

  return { lastPlayer: null, lastPlayerIndex: null };
}

export function playBluff(game: Game) {
  if (!game.canPlayBluff) return;

  const playersInfo = findGamePlayersInfo(game);

  if (!playersInfo.lastPlayer) return; // TODO: Notify user

  const lastMovedCards = playersInfo.lastPlayer.lastMovedCards;

  game.players.forEach((p) => {
    p.lastMove = "NONE";
    p.lastMovedCards = [];
    p.isTurn = false;
    p.isLastPlayed = false;
  });

  playersInfo.currentPlayer.lastMove = "BLUFF";

  if (isPlayedCorrect(lastMovedCards, game.cardValue)) {
    playersInfo.lastPlayer.isTurn = true;

    playersInfo.currentPlayer.cards.push(...game.cards);
  } else {
    playersInfo.currentPlayer.isTurn = true;

    playersInfo.lastPlayer.cards.push(...game.cards);
  }

  game.cards = [];
  game.canSetCardValue = true;
  game.canPlayBluff = false;
  game.canPlayPass = false;
}

export function playPass(game: Game) {
  if (!game.canPlayPass) return;

  const playersInfo = findGamePlayersInfo(game);

  playersInfo.currentPlayer.lastMove = "PASS";
  playersInfo.currentPlayer.lastMovedCards = [];
  playersInfo.currentPlayer.isTurn = false;

  playersInfo.nextPlayer.isTurn = true;

  const afterPlayersInfo = findGamePlayersInfo(game);

  if (
    afterPlayersInfo.lastPlayerIndex === afterPlayersInfo.currentPlayerIndex
  ) {
    game.canSetCardValue = true;
    game.canPlayBluff = false;
    game.canPlayPass = false;
  }
}

export function playCards(
  game: Game,
  cardValue: CardValue,
  selectedCards: Card[]
) {
  const playersInfo = findGamePlayersInfo(game);

  selectedCards = pickCards(playersInfo.currentPlayer.cards, selectedCards);

  if (selectedCards.length === 0) return; // TODO: Notify user

  if (!playersInfo.lastPlayer || game.canSetCardValue) {
    game.cardValue = cardValue;
    game.canSetCardValue = false;
  }

  game.cards.push(...selectedCards);
  game.canPlayBluff = true;
  game.canPlayPass = true;

  playersInfo.currentPlayer.lastMove = selectedCards.length;
  playersInfo.currentPlayer.lastMovedCards = selectedCards;
  playersInfo.currentPlayer.isLastPlayed = true;
  playersInfo.currentPlayer.cards = removeCards(
    playersInfo.currentPlayer.cards,
    selectedCards
  );
  playersInfo.currentPlayer.isTurn = false;

  playersInfo.nextPlayer.isTurn = true;

  if (playersInfo.currentPlayer.cards.length === 0) {
    if (
      isPlayedCorrect(playersInfo.currentPlayer.lastMovedCards, game.cardValue)
    ) {
      game.status = "fnished";
    }
  }
}
