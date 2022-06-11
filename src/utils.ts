export function shuffle<T>(array: T[]) {
  array = array.slice();

  let currentIndex = array.length
  let randomIndex: number = 0;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]
    ];
  }

  return array;
}
