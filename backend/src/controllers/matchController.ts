import prisma from "../prisma/client";

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
    if (
      user.games1.some(
        (game) => game.status === "IN_PROGRESS" || game.status === "WAITING",
      ) ||
      user.games2.some(
        (game) => game.status === "IN_PROGRESS" || game.status === "WAITING",
      )
    ) {
      throw new Error("User is already in an ongoing or waiting match");
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
