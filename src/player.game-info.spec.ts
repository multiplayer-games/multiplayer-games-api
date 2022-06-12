import { addNewPlayerToGame, createNewGame, startGame } from "./game";
import { findGamePlayersInfo, playCards, playPass } from "./player";

describe("Player Game Info Tests", () => {
  it("should find correct info on start", () => {
    const game = createNewGame({
      roomId: "1",
      userId: "1",
      userName: "Bluff"
    });

    addNewPlayerToGame(game, { userId: "2", userName: "Player 2" });
    addNewPlayerToGame(game, { userId: "3", userName: "Player 3" });

    startGame(game);

    const gamePlayersInfo = findGamePlayersInfo(game);

    expect(gamePlayersInfo.lastPlayer).toBeNull();
    expect(gamePlayersInfo.isLastPlayerPlayedCorrect).toBeNull();

    expect(gamePlayersInfo.currentPlayerIndex).toBe(0);
    expect(gamePlayersInfo.currentPlayer.id).toBe("1");

    expect(gamePlayersInfo.nextPlayerIndex).toBe(1);
    expect(gamePlayersInfo.nextPlayer.id).toBe("2");
  });

  it("should find correct info on pass", () => {
    const game = createNewGame({
      roomId: "1",
      userId: "1",
      userName: "Bluff"
    });

    addNewPlayerToGame(game, { userId: "2", userName: "Player 2" });
    addNewPlayerToGame(game, { userId: "3", userName: "Player 3" });

    startGame(game);

    playCards(game, "8", game.players[0].cards.slice(0, 2));
    playPass(game);

    const gamePlayersInfo = findGamePlayersInfo(game);

    expect(gamePlayersInfo.lastPlayer).not.toBeNull();
    expect(gamePlayersInfo.lastPlayerIndex).toBe(0);
    expect(gamePlayersInfo.isLastPlayerPlayedCorrect).not.toBeNull();

    expect(gamePlayersInfo.currentPlayerIndex).toBe(2);
    expect(gamePlayersInfo.currentPlayer.id).toBe("3");

    expect(gamePlayersInfo.nextPlayerIndex).toBe(0);
    expect(gamePlayersInfo.nextPlayer.id).toBe("1");
  });

  it("should be correct turn when play cards", () => {
    const game = createNewGame({
      roomId: "1",
      userId: "1",
      userName: "Bluff"
    });

    addNewPlayerToGame(game, { userId: "2", userName: "Player 2" });
    addNewPlayerToGame(game, { userId: "3", userName: "Player 3" });

    startGame(game);

    expect(game.players[0].isTurn).toBe(true);
    expect(game.players[1].isTurn).toBe(false);
    expect(game.players[2].isTurn).toBe(false);

    playCards(game, "8", game.players[0].cards.slice(0, 2));

    expect(game.players[0].isTurn).toBe(false);
    expect(game.players[1].isTurn).toBe(true);
    expect(game.players[2].isTurn).toBe(false);

    playCards(game, "8", game.players[0].cards.slice(0, 2));

    expect(game.players[0].isTurn).toBe(false);
    expect(game.players[1].isTurn).toBe(false);
    expect(game.players[2].isTurn).toBe(true);

    playCards(game, "8", game.players[0].cards.slice(0, 2));

    expect(game.players[0].isTurn).toBe(true);
    expect(game.players[1].isTurn).toBe(false);
    expect(game.players[2].isTurn).toBe(false);
  });

  it("should be re-set card value if all pass", () => {
    const game = createNewGame({
      roomId: "1",
      userId: "1",
      userName: "Bluff"
    });

    addNewPlayerToGame(game, { userId: "2", userName: "Player 2" });
    addNewPlayerToGame(game, { userId: "3", userName: "Player 3" });

    startGame(game);

    expect(game.setCardValue).toBe(true);

    playCards(game, "8", game.players[0].cards.slice(0, 2));

    expect(game.setCardValue).toBe(false);

    playPass(game);

    expect(game.setCardValue).toBe(false);

    playPass(game);

    expect(game.setCardValue).toBe(true);
  });
});
