import type { Board } from "../generated/prisma/client";

function checkForWinner(board: Board): "X" | "O" | "DRAW" | null {
  const slots = [
    board.slot1,
    board.slot2,
    board.slot3,
    board.slot4,
    board.slot5,
    board.slot6,
    board.slot7,
    board.slot8,
    board.slot9,
  ];
  const winningCombinations = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
    [1, 5, 9],
    [3, 5, 7],
  ];
  let winner: "X" | "O" | "DRAW" | null = null;
  for (const combination of winningCombinations) {
    const [a, b, c] = combination.map((index) => slots[index - 1]);
    if (a !== "EMPTY" && a === b && b === c) {
      winner = a;
      break;
    }
  }

  if (!winner && slots.every((slot) => slot !== "EMPTY")) {
    winner = "DRAW";
  }
  return winner;
}

export default checkForWinner;
