import { isPlayedCorrect, removeCards } from "./card";
import { Card } from "./types";

describe("Card Tests", () => {
  it("should be correct played cards", () => {
    const cards: Card[] = [
      { name: "Hearth A", "type": "Hearth", "value": "A" },
      { name: "Club A", "type": "Club", "value": "A" },
      { name: "Diamond A", "type": "Diamond", "value": "A" },
      { name: "Spade A", "type": "Spade", "value": "A" },
    ];

    const isCorrect = isPlayedCorrect(cards, "A");

    expect(isCorrect).toBe(true);
  });

  it("should not be correct played cards", () => {
    const cards: Card[] = [
      { name: "Hearth A", "type": "Hearth", "value": "A" },
      { name: "Club A", "type": "Club", "value": "A" },
      { name: "Diamond 2", "type": "Diamond", "value": "2" },
      { name: "Spade A", "type": "Spade", "value": "A" },
    ];

    const isCorrect = isPlayedCorrect(cards, "A");

    expect(isCorrect).toBe(false);
  });

  it("should remove correct items from list", () => {
    const list: Card[] = [
      { name: "Club 9", type: "Club", value: "9" },
      { name: "Hearth 3", type: "Hearth", value: "3" },
      { name: "Club 10", type: "Club", value: "10" },
    ];

    const removeList: Card[] = [
      { name: "Club 9", type: "Club", value: "9" },
    ];

    const result = removeCards(list, removeList);

    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Hearth 3");
    expect(result[1].name).toBe("Club 10");
  });
});
