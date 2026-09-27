import { Server } from "socket.io";
import { parseCookie } from "cookie";
import socketAuthenticate from "../utils/socketAuthenticate";
import type { AuthUser } from "../middleware/authenticate";
import { getUpcomingGames, joinMatch } from "../controllers/matchController";

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
    const user = (socket as any).user as AuthUser;
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
      const userMatches = [...user.games1, ...user.games2];
      const ongoingMatches = userMatches.filter(
        (match) => match.status === "IN_PROGRESS",
      );
      if (ongoingMatches.length > 0) {
        socket.emit("ongoingMatches", ongoingMatches);
        return;
      }
      const upcomingGames = await getUpcomingGames();
      socket.emit("upcomingGames", upcomingGames);
    });

    socket.on("joinMatch", async (matchId) => {
      try {
        const updatedMatch = await joinMatch(matchId, user.id);
        socket.join(updatedMatch.id);
        socket.emit("joinedMatch", updatedMatch);
      } catch (error) {
        console.log("Error joining match:", error);
        socket.emit("error", "Error joining match");
      }
    });
  });
};

export default matchSocket;
