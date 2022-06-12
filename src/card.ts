import { CardTypes, CardValues } from "./constants";
import { Card, CardValue } from "./types";

export function getAllCards() {
  const cards: Card[] = [];
  
  for (let i = 0; i < CardTypes.length; i++) {
    const cardType = CardTypes[i];

    for (let j = 0; j < CardValues.length; j++) {
      const cardValue = CardValues[j];

      cards.push({
        name: `${cardType} ${cardValue}`,
        type: cardType,
        value: cardValue,
      });
    }
  }

  return cards;
}

export function isPlayedCorrect(cards: Card[], correctValue: CardValue) {
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].value !== correctValue) {
      return false;
    }
  }

  return true;
}

export function pickCards(playersCards: Card[], pickList: Card[]) {
  const result: Card[] = [];

  for (let i = 0; i < playersCards.length; i++) {
    const item = playersCards[i];

    if (pickList.some(x => x.name === item.name)) {
      result.push(item);
    }
  }

  return result;
}

export function removeCards(list: Card[], removeList: Card[]) {
  const result: Card[] = [];

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    if (!removeList.some(x => x.name === item.name)) {
      result.push(item);
    }
  }

  return result;
}
