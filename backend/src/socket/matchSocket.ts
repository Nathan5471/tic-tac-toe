import { Server } from "socket.io";
import { parseCookie } from "cookie";
import socketAuthenticate from "../utils/socketAuthenticate";
import type { AuthUser } from "../middleware/authenticate";
import {
  getUpcomingGames,
  getUpdatedUser,
  joinMatch,
  createMatch,
  startMatch,
} from "../controllers/matchController";

const matchSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        throw new Error("Unauthorized");
      }
      const parsedCookies = parseCookie(cookies);
      if (!parsedCookies.token) {
        throw new Error("Unauthorized");
      }
      const token = parsedCookies.token;
      const user = await socketAuthenticate(token);
      (socket as any).user = user as AuthUser;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
      return;
    }
  });

  io.on("connection", (socket) => {
    let user = (socket as any).user as AuthUser;
    console.log(`User connected: ${user.id}`);
    socket.emit("connected", {
      id: user.id,
      username: user.username,
      joinedMatches: [
        ...user.games1.filter(
          (match) =>
            match.status === "WAITING" || match.status === "IN_PROGRESS",
        ),
        ...user.games2.filter(
          (match) =>
            match.status === "WAITING" || match.status === "IN_PROGRESS",
        ),
      ],
    });

    socket.on("getMatches", async () => {
      const newUser = await getUpdatedUser(user.id);
      user = newUser;
      const userMatches = [...user.games1, ...user.games2];
      const ongoingMatches = userMatches.filter(
        (match) => match.status === "IN_PROGRESS" || match.status === "WAITING",
      );
      if (ongoingMatches.length > 0) {
        socket.emit("ongoingMatches", ongoingMatches);
      }
      const upcomingGames = await getUpcomingGames();
      const emittedGames = upcomingGames.filter(
        (game) => game.player1Id !== user.id && game.player2Id !== user.id,
      );
      socket.emit("upcomingGames", emittedGames);
    });

    socket.on("joinMatch", async (matchId) => {
      try {
        const updatedMatch = await joinMatch(matchId, user.id);
        socket.join(updatedMatch.id);
        io.to(updatedMatch.id).emit("joinedGame", updatedMatch);
      } catch (error) {
        console.log("Error joining match:", error);
        socket.emit("error", "Error joining match");
      }
    });

    socket.on("createMatch", async (matchName) => {
      try {
        const newMatch = await createMatch(matchName, user.id);
        socket.join(newMatch.id);
        io.to(newMatch.id).emit("joinedGame", newMatch);
      } catch (error) {
        console.log("Error creating match:", error);
        socket.emit("error", "Error creating match");
      }
    });

    socket.on("startMatch", async (matchId) => {
      try {
        const startedMatch = await startMatch(matchId, user.id);
        io.to(startedMatch.id).emit("startedGame", startedMatch);
      } catch (error) {
        console.log("Error starting match:", error);
        socket.emit("error", "Error starting match");
      }
    });
  });
};

export default matchSocket;
