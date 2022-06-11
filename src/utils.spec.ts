import { shuffle } from "./utils";

describe('Utils Tests', () => {
  it('should be shuffle array', () => {
    const array = [1, 2, 3, 4, 5];

    const newArray = shuffle(array);

    expect(newArray.length).toBe(array.length);

    let diff = false;

    for (let i = 0; i < array.length; i++) {
      if (array[i] !== newArray[i]) {
        diff = true;
      }
    }

    expect(diff).toBe(true);
  });
});
