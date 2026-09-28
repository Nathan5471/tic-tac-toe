import prisma from "../prisma/client";
import checkForWinner from "../utils/checkForWinner";

export const getUpcomingGames = async () => {
  try {
    const upcomingGames = await prisma.game.findMany({
      where: {
        status: "WAITING",
      },
    });
    return upcomingGames;
  } catch (error) {
    console.error("Error getting upcoming games:", error);
    return [];
  }
};

export const getUpdatedUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      games1: true,
      games2: true,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const joinMatch = async (matchId: string, userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        games1: true,
        games2: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const match = await prisma.game.findUnique({
      where: {
        id: matchId,
      },
      include: {
        player1: true,
        player2: true,
      },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    const playerJoined =
      match.player1.id === userId ||
      (match.player2 && match.player2.id === userId);
    if (match.status !== "WAITING" && !playerJoined) {
      throw new Error("Match is not available for joining");
    }
    if (match.player1 && match.player2 && !playerJoined) {
      throw new Error("Match is already full");
    }
    if (
      playerJoined &&
      (match.status === "WAITING" || match.status === "IN_PROGRESS")
    ) {
      return match;
    }
    if (!playerJoined && match.status === "WAITING") {
      const updatedMatch = await prisma.game.update({
        where: {
          id: matchId,
        },
        data: {
          player2Id: userId,
        },
        include: {
          player1: true,
          player2: true,
        },
      });
      return updatedMatch;
    }
    throw new Error("Unable to join match");
  } catch (error) {
    console.error("Error joining match:", error);
    throw new Error("Error joining match");
  }
};

export const createMatch = async (matchName: string, userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        games1: true,
        games2: true,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const newGame = await prisma.game.create({
      data: {
        name: matchName,
        player1Id: userId,
        status: "WAITING",
      },
      include: {
        player1: true,
        player2: true,
      },
    });
    return newGame;
  } catch (error) {
    console.error("Error creating match:", error);
    throw new Error("Error creating match");
  }
};

export const startMatch = async (matchId: string, userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const match = await prisma.game.findUnique({
      where: {
        id: matchId,
      },
    });
    if (!match) {
      throw new Error("Match not found");
    }
    if (match.status !== "WAITING") {
      throw new Error("Match has already been started!");
    }
    if (
      !match.player2Id ||
      (match.player1Id !== userId && match.player2Id !== userId)
    ) {
      throw new Error(
        "User is not a participant of this match or match is not ready to start",
      );
    }
    await prisma.board.create({
      data: {
        gameId: matchId,
      },
    });
    const startedMatch = await prisma.game.update({
      where: {
        id: matchId,
      },
      data: {
        status: "IN_PROGRESS",
      },
      include: {
        player1: true,
        player2: true,
        board: true,
      },
    });
    return startedMatch;
  } catch (error) {
    console.error("Error starting match:", error);
    throw new Error("Error starting match");
  }
};

export const makeMove = async (
  gameId: string,
  userId: string,
  slot: number,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        board: true,
      },
    });
    if (!game) {
      throw new Error("Game not found");
    }
    if (game.status !== "IN_PROGRESS") {
      throw new Error("Game is not in progress");
    }
    if (game.player1Id !== userId && game.player2Id !== userId) {
      throw new Error("User is not a participant of this game");
    }
    if (
      (game.currentTurn === 1 && game.player1Id !== userId) ||
      (game.currentTurn === 2 && game.player2Id !== userId)
    ) {
      throw new Error("It's not your turn");
    }
    if (slot < 0 || slot > 8 || !game.board) {
      throw new Error("Invalid slot or no board");
    }
    const slotValue = game.board[`slot${slot}` as keyof typeof game.board];
    if (slotValue !== "EMPTY") {
      throw new Error("Slot is already occupied");
    }
    const updatedBoard = await prisma.board.update({
      where: {
        id: game.board.id,
      },
      data: {
        [`slot${slot}` as keyof typeof game.board]:
          game.currentTurn === 1 ? "X" : "O",
      },
    });
    const winner = checkForWinner(updatedBoard);
    const updatedGame = await prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        currentTurn: game.currentTurn === 1 ? 2 : 1,
        winner:
          winner === "X"
            ? 1
            : winner === "O"
              ? 2
              : winner === "DRAW"
                ? 0
                : null,
        status: winner ? "COMPLETED" : "IN_PROGRESS",
      },
      include: {
        player1: true,
        player2: true,
        board: true,
      },
    });
    return updatedGame;
  } catch (error) {
    console.error("Error making move:", error);
    throw new Error("Error making move");
  }
};
